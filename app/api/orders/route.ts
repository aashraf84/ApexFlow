// ApexFlow Cloud — Orders List API
// GET /api/orders — List all orders with related payment, client, erp info
// Supports pagination, filtering by status, and search

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
    const status = searchParams.get('status') ?? undefined
    const paymentStatus = searchParams.get('paymentStatus') ?? undefined
    const search = searchParams.get('search') ?? undefined
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerEmail: { contains: search } },
        { customerName: { contains: search } },
        { companyName: { contains: search } },
      ]
    }

    const [orders, total] = await Promise.all([
      withRetry((tx) =>
        tx.order.findMany({
          where,
          include: {
            erpSystem: { select: { id: true, name: true, slug: true, icon: true, color: true } },
            client: { select: { id: true, companyName: true, contactPerson: true, email: true } },
            payments: { select: { id: true, amount: true, method: true, status: true, cardBrand: true, cardLast4: true, createdAt: true } },
            invoice: { select: { id: true, invoiceNumber: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ),
      withRetry((tx) => tx.order.count({ where })),
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Orders List] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 },
    )
  }
}
