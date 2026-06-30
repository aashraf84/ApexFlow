import { NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
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
