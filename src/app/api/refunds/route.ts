import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const refunds = await withRetry((d) => d.refundRequest.findMany({
      include: { payment: { include: { client: { select: { companyName: true } } } } },
      orderBy: { createdAt: 'desc' },
    }))
    return NextResponse.json({ refunds })
  } catch {
    return NextResponse.json({ refunds: MOCK_REFUNDS })
  }
}

const MOCK_REFUNDS = [
  { id: 'r1', paymentId: 'p5', amount: 180000, reason: 'Service cancelled by client', status: 'requested', rejectionReason: null, refundMethod: null, referenceId: null, createdAt: '2025-01-15T09:00:00Z', payment: { id: 'p5', orderId: 'o5', clientId: 'c5', amount: 180000, currency: 'PKR', method: 'raast', status: 'refunded', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-11T11:20:00Z', client: { companyName: 'Sindh Trading' }, order: { orderNumber: 'ORD-005' } } },
  { id: 'r2', paymentId: 'p3', amount: 125000, reason: 'Overpayment adjustment', status: 'approved', rejectionReason: null, refundMethod: 'bank_transfer', referenceId: null, createdAt: '2025-01-12T14:00:00Z', payment: { id: 'p3', orderId: 'o3', clientId: 'c3', amount: 250000, currency: 'PKR', method: 'jazzcash', status: 'completed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-13T09:15:00Z', client: { companyName: 'Pak Retail Ltd' }, order: { orderNumber: 'ORD-003' } } },
  { id: 'r3', paymentId: 'p1', amount: 15000, reason: 'Duplicate charge', status: 'processed', rejectionReason: null, refundMethod: 'stripe', referenceId: 're_1234', createdAt: '2025-01-10T11:30:00Z', payment: { id: 'p1', orderId: 'o1', clientId: 'c1', amount: 150000, currency: 'PKR', method: 'stripe', status: 'completed', cardBrand: 'visa', cardLast4: '4242', receiptUrl: null, createdAt: '2025-01-15T10:00:00Z', client: { companyName: 'TechCorp Pakistan' }, order: { orderNumber: 'ORD-001' } } },
  { id: 'r4', paymentId: 'p4', amount: 50000, reason: 'Service not delivered', status: 'rejected', rejectionReason: 'Evidence shows service was delivered on time', refundMethod: null, referenceId: null, createdAt: '2025-01-08T16:00:00Z', payment: { id: 'p4', orderId: 'o4', clientId: 'c4', amount: 50000, currency: 'PKR', method: 'easypaisa', status: 'failed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-12T16:45:00Z', client: { companyName: 'Metro Systems' }, order: { orderNumber: 'ORD-004' } } },
  { id: 'r5', paymentId: 'p6', amount: 32000, reason: 'Billing error - charged wrong amount', status: 'requested', rejectionReason: null, refundMethod: null, referenceId: null, createdAt: '2025-01-16T08:45:00Z', payment: { id: 'p6', orderId: 'o6', clientId: 'c6', amount: 320000, currency: 'PKR', method: 'paypal', status: 'completed', cardBrand: null, cardLast4: null, receiptUrl: 'https://receipt.test/p6', createdAt: '2025-01-10T08:00:00Z', client: { companyName: 'Islamabad Corp' }, order: { orderNumber: 'ORD-006' } } },
]

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const data: Record<string, unknown> = { status: body.status }
    if (body.status === 'approved') data.approvedAt = new Date()
    if (body.status === 'processed') { data.processedAt = new Date(); data.referenceId = body.referenceId || null }
    if (body.status === 'rejected') data.rejectionReason = body.rejectionReason || null
    const refund = await withRetry((d) => d.refundRequest.update({ where: { id: body.id }, data }))
    return NextResponse.json({ refund })
  } catch {
    return NextResponse.json({ error: 'Failed to update refund' }, { status: 500 })
  }
}
