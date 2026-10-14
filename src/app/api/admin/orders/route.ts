import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const orders = await withRetry((db) =>
      db.order.findMany({
        include: { payments: true, erpSystem: { select: { name: true, slug: true } }, client: { select: { companyName: true } } },
        orderBy: { createdAt: 'desc' },
      })
    )
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ orders: [] })
  }
}
