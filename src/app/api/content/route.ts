export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import {
  DEFAULT_CONTENT,
  type ContentBlock,
} from '@/app/api/admin/content/route'

// ─── Module-level 60s cache ───────────────────────────────────────────────────
// The public content endpoint is hit on every page mount (via the useContent
// hook's singleton), so we cache the merged result for 60s in module memory.
// This means a single DB query per minute regardless of how many visitors
// land on the site. The admin /api/admin/content route is NOT cached — admins
// see their edits immediately.
interface CachedPayload {
  pages: Record<string, Record<string, string>>
  generatedAt: number
}

let cache: CachedPayload | null = null
const CACHE_TTL_MS = 60_000 // 60 seconds

/**
 * Merge DEFAULT_CONTENT with the saved DB rows, returning a flat
 * `{ [page]: { [key]: value } }` lookup table that the useContent hook can
 * index in O(1) on every render.
 */
function buildPayload(savedByKey: Map<string, string>): {
  pages: Record<string, Record<string, string>>
} {
  const pages: Record<string, Record<string, string>> = {}

  // Seed every default block — DB override wins when present.
  for (const block of DEFAULT_CONTENT) {
    if (!pages[block.page]) pages[block.page] = {}
    const saved = savedByKey.get(block.key)
    pages[block.page][block.key] = saved !== undefined && saved !== ''
      ? saved
      : block.value
  }

  // Pick up admin-created blocks that aren't in the default list. Their
  // `group` field holds the page name (set by the admin POST handler), so we
  // use that as the page. Bare rows without a group land under "Custom".
  for (const [key, value] of savedByKey.entries()) {
    if (DEFAULT_CONTENT.some((d) => d.key === key)) continue
    // We don't have the group/page info inside this map (only value), so we
    // stash under "Custom" — same behavior as the admin GET handler. The
    // public site only reads keys that exist in DEFAULT_CONTENT anyway, so
    // this branch is harmless.
    if (!pages['Custom']) pages['Custom'] = {}
    pages['Custom'][key] = value
  }

  return { pages }
}

// ─── GET: Public — return all content blocks grouped by page ─────────────────
export async function GET() {
  // Serve from cache when fresh.
  if (cache && Date.now() - cache.generatedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      content: cache.pages,
      pages: Object.keys(cache.pages),
      cached: true,
      generatedAt: cache.generatedAt,
    })
  }

  try {
    // Pull every content-type SiteSetting from the DB. Same query as the
    // admin route — no auth required because content is public.
    const rows = await withRetry((db) =>
      db.siteSetting.findMany({
        where: { category: 'content' },
        select: {
          key: true,
          value: true,
          group: true,
        },
      })
    )

    const savedByKey = new Map<string, string>()
    for (const r of rows) {
      savedByKey.set(r.key, r.value)
    }

    const { pages } = buildPayload(savedByKey)
    cache = { pages, generatedAt: Date.now() }

    return NextResponse.json({
      content: pages,
      pages: Object.keys(pages),
      cached: false,
      generatedAt: cache.generatedAt,
    })
  } catch (error) {
    console.error('[CONTENT/PUBLIC] Failed to fetch, falling back to defaults:', error)
    // Fall back to hardcoded defaults when the DB is unreachable (e.g. Neon
    // cold start, brief outage). The public site must NEVER go down because
    // of a DB hiccup.
    const savedByKey = new Map<string, string>()
    const { pages } = buildPayload(savedByKey)
    // Don't pollute the cache with the fallback — let the next request retry.
    return NextResponse.json({
      content: pages,
      pages: Object.keys(pages),
      cached: false,
      dbWarning: 'Database unavailable — showing defaults',
    })
  }
}

// ─── Internal helper for tests / future SSR use ──────────────────────────────
// Exported so a server component could call `getContentSnapshot()` directly
// without going through the network layer. Currently unused but cheap to
// keep around.
export async function getContentSnapshot(): Promise<{
  pages: Record<string, Record<string, string>>
}> {
  if (cache && Date.now() - cache.generatedAt < CACHE_TTL_MS) {
    return { pages: cache.pages }
  }
  try {
    const rows = await withRetry((db) =>
      db.siteSetting.findMany({
        where: { category: 'content' },
        select: { key: true, value: true },
      })
    )
    const savedByKey = new Map<string, string>()
    for (const r of rows) savedByKey.set(r.key, r.value)
    const { pages } = buildPayload(savedByKey)
    cache = { pages, generatedAt: Date.now() }
    return { pages }
  } catch {
    const { pages } = buildPayload(new Map<string, string>())
    return { pages }
  }
}

// Re-export for downstream type consumers (e.g. the useContent hook on the
// client side, which can't import from a server route file directly).
export type { ContentBlock }
