export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'
import { ERP_DETAILS } from '@/lib/erp-detail-data'
import { ERP_CONTENT_BLOCKS, getErpContentForSlug } from '@/app/api/admin/content/route'

// ─────────────────────────────────────────────────────────────────────────────
// /api/admin/content/erp
// ─────────────────────────────────────────────────────────────────────────────
// Dedicated endpoint that returns ERP product content blocks for the Content
// Manager's "ERP Products" tab. This is split out from the main
// /api/admin/content GET handler so that opening the Content Manager doesn't
// eagerly load ~1,200 ERP blocks when the admin only wants to edit page copy
// on the homepage / about / pricing / etc. The Content Manager fetches this
// endpoint lazily when the admin clicks the "ERP Products" item in the left
// sidebar.
//
// All blocks share the same SiteSetting storage convention as the main route:
//   category = 'content'
//   group    = 'erp_<slug>'  (e.g. 'erp_pharmaflow')
//   key      = 'erp_<slug>_<field>'  (e.g. 'erp_pharmaflow_tagline')
//
// POST / DELETE are NOT reimplemented here — the main /api/admin/content
// route's POST/DELETE handlers work on any SiteSetting row with
// category='content', so the Content Manager's per-block Save buttons POST to
// /api/admin/content and the per-ERP Reset button DELETEs each block via
// /api/admin/content?key=…
// ─────────────────────────────────────────────────────────────────────────────

// One module-level cache for the merged ERP payload. TTL is short (30s) so
// admins see their edits quickly but the request volume from the admin UI
// stays manageable when switching between ERPs.
interface ErpListPayload {
  erps: Record<string, unknown>
  slugs: string[]
  total: number
  generatedAt: number
}
interface CachedPayload {
  payload: ErpListPayload
  generatedAt: number
}
let cache: CachedPayload | null = null
const CACHE_TTL_MS = 30_000

// Pull every ERP override row from the DB and index by key for O(1) merging.
// Returns an empty map on DB failure (caller falls back to hardcoded defaults
// from ERP_CONTENT_BLOCKS).
async function fetchSavedByKey(): Promise<
  Map<string, { value: string; updatedAt: Date }>
> {
  const out = new Map<string, { value: string; updatedAt: Date }>()
  try {
    const rows = await withRetry((db) =>
      db.siteSetting.findMany({
        where: { category: 'content', group: { startsWith: 'erp_' } },
        select: { key: true, value: true, group: true, updatedAt: true },
      })
    )
    for (const r of rows) {
      out.set(r.key, { value: r.value, updatedAt: r.updatedAt })
    }
  } catch (err) {
    console.error('[CONTENT/ERP] Failed to fetch overrides:', err)
  }
  return out
}

// GET  → return either a single ERP's blocks (?slug=pharmaflow) or every ERP's
// blocks grouped by slug.
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const slugParam = searchParams.get('slug')
  const bypassCache = searchParams.get('refresh') === '1'

  // Serve from cache when fresh AND we're fetching the full payload (no slug).
  if (
    !slugParam &&
    !bypassCache &&
    cache &&
    Date.now() - cache.generatedAt < CACHE_TTL_MS
  ) {
    return NextResponse.json({ ...cache.payload, cached: true })
  }

  const savedByKey = await fetchSavedByKey()

  // Single-ERP payload — used by the Content Manager when the admin picks one
  // ERP from the sub-nav pills. Returns `{ slug, meta, blocks, sections }`.
  if (slugParam) {
    const detail = ERP_DETAILS[slugParam]
    if (!detail) {
      return NextResponse.json(
        { error: `Unknown ERP slug: ${slugParam}` },
        { status: 404 }
      )
    }
    const { blocks, meta } = getErpContentForSlug(slugParam, savedByKey)

    // Group by section so the UI can render cards per section.
    const sections: Record<string, typeof blocks> = {}
    for (const b of blocks) {
      if (!sections[b.section]) sections[b.section] = []
      sections[b.section].push(b)
    }

    return NextResponse.json({
      slug: slugParam,
      meta,
      blocks,
      sections,
      total: blocks.length,
    })
  }

  // Full payload — every ERP, every block. Returns:
  //   { erps: { [erp_<slug>]: { meta, blocks, sections } }, slugs, total }
  // This is what the Content Manager loads on first mount of the ERP tab.
  const slugs = Object.keys(ERP_DETAILS)
  const erps: Record<string, unknown> = {}
  let total = 0
  for (const slug of slugs) {
    const { blocks, meta } = getErpContentForSlug(slug, savedByKey)
    const sections: Record<string, typeof blocks> = {}
    for (const b of blocks) {
      if (!sections[b.section]) sections[b.section] = []
      sections[b.section].push(b)
    }
    erps[`erp_${slug}`] = { meta, blocks, sections }
    total += blocks.length
  }

  const payload = {
    erps,
    slugs,
    total,
    generatedAt: Date.now(),
  }

  cache = { payload, generatedAt: Date.now() }
  return NextResponse.json({ ...payload, cached: false })
}
