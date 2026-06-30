import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const tenants = await withRetry((db) =>
      db.syncTenant.findMany({
        include: {
          connector: { select: { id: true, name: true, type: true, status: true } },
          client: { select: { id: true, companyName: true, email: true } },
          syncEvents: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({
      success: true,
      data: tenants,
    })
  } catch (error) {
    console.error('[SYNC-TENANTS] Failed to list:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sync tenants' },
      { status: 500 }
    )
  }
}
