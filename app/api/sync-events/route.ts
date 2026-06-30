import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectorId = searchParams.get('connectorId')
    const tenantId = searchParams.get('tenantId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (connectorId) where.connectorId = connectorId
    if (tenantId) where.tenantId = tenantId
    if (status) where.status = status

    const events = await withRetry((db) =>
      db.syncEvent.findMany({
        where,
        include: {
          connector: { select: { id: true, name: true, type: true } },
          syncTenant: {
            select: {
              id: true,
              externalId: true,
              client: { select: { id: true, companyName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    )

    return NextResponse.json({
      success: true,
      data: events,
    })
  } catch (error) {
    console.error('[SYNC-EVENTS] Failed to list:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sync events' },
      { status: 500 }
    )
  }
}
