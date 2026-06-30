import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { testErpConnection } from '@/lib/erp-connector'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the ERP system — try by id first, then by slug
    let erp = await withRetry((d) =>
      d.erpSystem.findUnique({ where: { id } })
    )

    if (!erp) {
      erp = await withRetry((d) =>
        d.erpSystem.findUnique({ where: { slug: id } })
      )
    }

    if (!erp) {
      return NextResponse.json({ error: 'ERP system not found' }, { status: 404 })
    }

    // Use slug to test connection
    const result = await testErpConnection(erp.slug)

    return NextResponse.json({
      connected: result.connected,
      latency: result.latency,
      clientCount: result.clientCount,
      error: result.error,
      schemaWarning: result.schemaWarning,
    })
  } catch (error) {
    console.error('[ERP-TEST-CONNECTION] Failed:', error)
    return NextResponse.json(
      { connected: false, error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}
