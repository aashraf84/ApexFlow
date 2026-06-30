import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the ERP system — try by id first, then by slug
    let erp = await withRetry((db) =>
      db.erpSystem.findUnique({
        where: { id },
      })
    )

    if (!erp) {
      erp = await withRetry((db) =>
        db.erpSystem.findUnique({
          where: { slug: id },
        })
      )
    }

    if (!erp) {
      return NextResponse.json({ error: 'ERP system not found' }, { status: 404 })
    }

    const realId = erp.id

    // Get modules (if ERPModule model exists in schema)
    let modules: unknown[] = []
    try {
      modules = await withRetry((db) =>
        (db as any).erpModule?.findMany({
          where: { erpSystemId: realId },
          orderBy: { name: 'asc' },
        }) ?? []
      ) ?? []
    } catch {
      // ERPModule model may not exist in schema
      modules = []
    }

    // Get client count
    const clientCount = await withRetry((db) =>
      db.client.count({
        where: { erpSystemId: realId },
      })
    )

    // Get revenue from active subscriptions
    const revenueResult = await withRetry((db) =>
      db.subscription.aggregate({
        where: { erpSystemId: realId, status: 'active' },
        _sum: { monthlyFee: true },
      })
    )
    const revenue = revenueResult._sum.monthlyFee ?? 0

    // Get license count
    const licenseCount = await withRetry((db) =>
      db.license.count({
        where: { erpSystemId: realId },
      })
    )

    // Get recent clients (last 5)
    const recentClients = await withRetry((db) =>
      db.client.findMany({
        where: { erpSystemId: realId },
        select: {
          id: true,
          companyName: true,
          status: true,
          licenses: {
            where: { erpSystemId: realId },
            select: { type: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    )

    // Map recentClients to include licenseType at top level (matching original SQL shape)
    const mappedRecentClients = recentClients.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      status: c.status,
      licenseType: c.licenses[0]?.type ?? null,
    }))

    return NextResponse.json({
      ...erp,
      moduleCount: modules.length,
      modules,
      clientCount,
      revenue,
      licenseCount,
      recentClients: mappedRecentClients,
    })
  } catch (error) {
    console.error('[ERP-DETAIL] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ERP detail' },
      { status: 500 }
    )
  }
}
