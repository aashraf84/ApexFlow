import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

// GET /api/erp/[id]/modules — Get modules for a specific ERP from database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find ERP by slug or id
    let erp = await withRetry((d) =>
      d.erpSystem.findUnique({ where: { slug: id } })
    )
    if (!erp) {
      erp = await withRetry((d) =>
        d.erpSystem.findUnique({ where: { id } })
      )
    }

    if (!erp) {
      return NextResponse.json({ error: 'ERP not found' }, { status: 404 })
    }

    return NextResponse.json({
      slug: erp.slug,
      name: erp.name,
      modules: [],
    })
  } catch (error) {
    console.error('[ERP-MODULES] Failed:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}