import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invalidateErpUrlCache } from '@/lib/erp-connector'
import { requirePermission } from '@/lib/api-helpers'

// PATCH /api/admin/erp-database-urls/bulk — update multiple ERP database URLs at once
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const body = await req.json()
    const { urls } = body as { urls: Record<string, string> }

    if (!urls || typeof urls !== 'object') {
      return NextResponse.json({ error: 'urls object is required' }, { status: 400 })
    }

    const results: Array<{
      slug: string
      success: boolean
      hasUrl: boolean
      error?: string
    }> = []

    for (const [slug, databaseUrl] of Object.entries(urls)) {
      try {
        // Validate URL format if provided (non-empty)
        if (databaseUrl && !databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
          results.push({ slug, success: false, hasUrl: false, error: 'Invalid URL format' })
          continue
        }

        // Use upsert — create the ERP if it doesn't exist yet
        await db.erpSystem.upsert({
          where: { slug },
          update: { databaseUrl: databaseUrl || null },
          create: {
            slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/flow$/, 'Flow'),
            databaseUrl: databaseUrl || null,
            status: 'active',
            isActive: true,
          },
        })

        results.push({ slug, success: true, hasUrl: !!databaseUrl })
      } catch (err) {
        console.error(`[ERP-DB-URLS-BULK] Failed for ${slug}:`, err)
        results.push({ slug, success: false, hasUrl: false, error: 'Failed to update' })
      }
    }

    // Invalidate the ERP connector cache so new URLs take effect immediately
    invalidateErpUrlCache()

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      total: results.length,
      succeeded: successCount,
      failed: failCount,
      results,
    })
  } catch (error) {
    console.error('[ERP-DB-URLS-BULK] PATCH failed:', error)
    return NextResponse.json({ error: 'Failed to bulk update ERP database URLs' }, { status: 500 })
  }
}
