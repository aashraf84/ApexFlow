import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invalidateErpUrlCache } from '@/lib/erp-connector'
import { requirePermission } from '@/lib/api-helpers'

// GET /api/admin/erp-database-urls — list all ERP database URLs
export async function GET() {
  try {
    const erps = await db.erpSystem.findMany({
      select: { id: true, slug: true, name: true, databaseUrl: true, status: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    }).catch(() => [])
    // Mask the database URLs for security — only show first 25 chars + *** + last 10 chars
    const masked = erps.map((erp) => ({
      ...erp,
      databaseUrl: erp.databaseUrl
        ? erp.databaseUrl.substring(0, 25) + '***' + erp.databaseUrl.substring(erp.databaseUrl.length - 10)
        : null,
      hasUrl: !!erp.databaseUrl,
    }))
    return NextResponse.json({ erps: masked })
  } catch (error) {
    console.error('[ERP-DB-URLS] GET failed:', error)
    return NextResponse.json({ erps: [], error: 'Database unavailable' })
  }
}

// PATCH /api/admin/erp-database-urls — update database URL for an ERP
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const body = await req.json()
    const { slug, databaseUrl } = body

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    // Validate URL format if provided
    if (databaseUrl && !databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
      return NextResponse.json({ error: 'Database URL must start with postgresql:// or postgres://' }, { status: 400 })
    }

    // Use upsert — create the ERP if it doesn't exist yet
    const erp = await db.erpSystem.upsert({
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

    // Invalidate the ERP connector cache so new URL takes effect immediately
    invalidateErpUrlCache()

    return NextResponse.json({ success: true, slug, hasUrl: !!databaseUrl, erpId: erp.id })
  } catch (error) {
    console.error('[ERP-DB-URLS] PATCH failed:', error)
    return NextResponse.json({ error: 'Failed to update ERP database URL' }, { status: 500 })
  }
}
