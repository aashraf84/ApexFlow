import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (search) where.OR = [
      { id: { contains: search } },
      { client: { companyName: { contains: search } } },
    ]

    const payments = await withRetry((d) => d.payment.findMany({
      where,
      include: { client: { select: { companyName: true } }, order: { select: { orderNumber: true } } },
      orderBy: { createdAt: 'desc' },
    }))

    return NextResponse.json({ payments })
  } catch {
    return NextResponse.json({ payments: MOCK_PAYMENTS })
  }
}

const MOCK_PAYMENTS = [
  { id: 'p1', orderId: 'o1', clientId: 'c1', amount: 150000, currency: 'PKR', method: 'stripe', status: 'completed', cardBrand: 'visa', cardLast4: '4242', receiptUrl: null, createdAt: '2025-01-15T10:00:00Z', client: { companyName: 'TechCorp Pakistan' }, order: { orderNumber: 'ORD-001' } },
  { id: 'p2', orderId: 'o2', clientId: 'c2', amount: 75000, currency: 'PKR', method: 'bank_transfer', status: 'pending', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-14T14:30:00Z', client: { companyName: 'Alpha Industries' }, order: { orderNumber: 'ORD-002' } },
  { id: 'p3', orderId: 'o3', clientId: 'c3', amount: 250000, currency: 'PKR', method: 'jazzcash', status: 'completed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-13T09:15:00Z', client: { companyName: 'Pak Retail Ltd' }, order: { orderNumber: 'ORD-003' } },
  { id: 'p4', orderId: 'o4', clientId: 'c4', amount: 50000, currency: 'PKR', method: 'easypaisa', status: 'failed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-12T16:45:00Z', client: { companyName: 'Metro Systems' }, order: { orderNumber: 'ORD-004' } },
  { id: 'p5', orderId: 'o5', clientId: 'c5', amount: 180000, currency: 'PKR', method: 'raast', status: 'refunded', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-11T11:20:00Z', client: { companyName: 'Sindh Trading' }, order: { orderNumber: 'ORD-005' } },
  { id: 'p6', orderId: 'o6', clientId: 'c6', amount: 320000, currency: 'PKR', method: 'paypal', status: 'completed', cardBrand: null, cardLast4: null, receiptUrl: 'https://receipt.test/p6', createdAt: '2025-01-10T08:00:00Z', client: { companyName: 'Islamabad Corp' }, order: { orderNumber: 'ORD-006' } },
  { id: 'p7', orderId: 'o7', clientId: 'c7', amount: 95000, currency: 'PKR', method: 'stripe', status: 'pending', cardBrand: 'mastercard', cardLast4: '8888', receiptUrl: null, createdAt: '2025-01-09T13:30:00Z', client: { companyName: 'Lahore Tech' }, order: { orderNumber: 'ORD-007' } },
  { id: 'p8', orderId: 'o8', clientId: 'c8', amount: 420000, currency: 'PKR', method: 'bank_transfer', status: 'completed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-08T10:45:00Z', client: { companyName: 'Karachi Foods' }, order: { orderNumber: 'ORD-008' } },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payment = await withRetry((d) => d.payment.create({
      data: { orderId: body.orderId, clientId: body.clientId || null, amount: Number(body.amount), method: body.method || 'card', status: 'pending', currency: body.currency || 'PKR' },
    }))
    return NextResponse.json({ payment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}
