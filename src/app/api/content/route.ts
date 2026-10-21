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

// A saved row, carrying its `group` field so we can route it to the right page
// when the key isn't part of DEFAULT_CONTENT (e.g. nav_links → group='navigation',
// footer_links → group='footer', social_links → group='social', cta_links →
// group='cta'). Rows without a group land under "Custom" (preserves prior
// behaviour for ad-hoc admin-created blocks).
interface SavedRow {
  value: string
  group: string | null
}

/**
 * Merge DEFAULT_CONTENT with the saved DB rows, returning a flat
 * `{ [page]: { [key]: value } }` lookup table that the useContent hook can
 * index in O(1) on every render.
 *
 * Saved rows whose key isn't in DEFAULT_CONTENT (the four link arrays plus any
 * admin-created custom blocks) are stashed under their `group` field. The
 * Link Manager stores nav_links / footer_links / social_links / cta_links
 * with group='navigation' / 'footer' / 'social' / 'cta' respectively, so the
 * public site can fetch them via `get('navigation', 'nav_links', '[]')` etc.
 *
 * ERP override rows use group='erp_<slug>' (e.g. 'erp_pharmaflow') and key
 * 'erp_<slug>_<field>' (e.g. 'erp_pharmaflow_tagline'). We strip the
 * `<group>_` prefix from the key so the ERP detail page's
 * `get('erp_pharmaflow', 'tagline', fallback)` lookup hits the override.
 */
function buildPayload(savedByKey: Map<string, SavedRow>): {
  pages: Record<string, Record<string, string>>
} {
  const pages: Record<string, Record<string, string>> = {}

  // Seed every default block — DB override wins when present.
  for (const block of DEFAULT_CONTENT) {
    if (!pages[block.page]) pages[block.page] = {}
    const saved = savedByKey.get(block.key)
    pages[block.page][block.key] =
      saved && saved.value !== ''
        ? saved.value
        : block.value
  }

  // Pick up admin-created blocks that aren't in the default list. Their
  // `group` field holds the page name (set by the admin POST handler), so we
  // use that as the page. Bare rows without a group land under "Custom".
  for (const [key, row] of savedByKey.entries()) {
    if (DEFAULT_CONTENT.some((d) => d.key === key)) continue
    const pageName = row.group && row.group.trim() !== '' ? row.group : 'Custom'
    if (!pages[pageName]) pages[pageName] = {}
    // For ERP rows (group='erp_<slug>'), strip the `erp_<slug>_` prefix from
    // the key so the ERP detail page can look it up by field name.
    if (pageName.startsWith('erp_')) {
      const prefix = `${pageName}_`
      pages[pageName][key.startsWith(prefix) ? key.slice(prefix.length) : key] = row.value
    } else {
      pages[pageName][key] = row.value
    }
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

    const savedByKey = new Map<string, SavedRow>()
    for (const r of rows) {
      savedByKey.set(r.key, { value: r.value, group: r.group })
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
    const savedByKey = new Map<string, SavedRow>()
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
        select: { key: true, value: true, group: true },
      })
    )
    const savedByKey = new Map<string, SavedRow>()
    for (const r of rows) savedByKey.set(r.key, { value: r.value, group: r.group })
    const { pages } = buildPayload(savedByKey)
    cache = { pages, generatedAt: Date.now() }
    return { pages }
  } catch {
    const { pages } = buildPayload(new Map<string, SavedRow>())
    return { pages }
  }
}

// Re-export for downstream type consumers (e.g. the useContent hook on the
// client side, which can't import from a server route file directly).
export type { ContentBlock }
