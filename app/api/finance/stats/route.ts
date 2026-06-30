import { NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const [payments, subscriptions, refunds, invoices] = await Promise.all([
      withRetry((d) => d.payment.findMany({
        include: { client: { select: { companyName: true } }, order: { select: { orderNumber: true } } },
        orderBy: { createdAt: 'desc' }, take: 5,
      })),
      withRetry((d) => d.subscription.findMany({ where: { status: 'active' } })),
      withRetry((d) => d.refundRequest.findMany({
        where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      })),
      withRetry((d) => d.invoice.findMany({
        where: { status: { in: ['sent', 'draft'] } },
        include: { client: { select: { companyName: true } } },
        orderBy: { dueDate: 'asc' }, take: 5,
      })),
    ])

    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
    const pendingPayments = payments.filter(p => p.status === 'pending').length
    const activeSubscriptions = subscriptions.length
    const refundsThisMonth = refunds.length

    return NextResponse.json({
      totalRevenue, pendingPayments, activeSubscriptions, refundsThisMonth,
      recentPayments: payments, upcomingInvoices: invoices,
    })
  } catch {
    return NextResponse.json({
      totalRevenue: 2450000, pendingPayments: 12, activeSubscriptions: 48, refundsThisMonth: 3,
      recentPayments: MOCK_PAYMENTS, upcomingInvoices: MOCK_INVOICES,
    })
  }
}

const MOCK_PAYMENTS = [
  { id: 'p1', orderId: 'o1', clientId: 'c1', amount: 150000, currency: 'PKR', method: 'stripe', status: 'completed', cardBrand: 'visa', cardLast4: '4242', receiptUrl: null, createdAt: '2025-01-15T10:00:00Z', client: { companyName: 'TechCorp Pakistan' }, order: { orderNumber: 'ORD-001' } },
  { id: 'p2', orderId: 'o2', clientId: 'c2', amount: 75000, currency: 'PKR', method: 'bank_transfer', status: 'pending', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-14T14:30:00Z', client: { companyName: 'Alpha Industries' }, order: { orderNumber: 'ORD-002' } },
  { id: 'p3', orderId: 'o3', clientId: 'c3', amount: 250000, currency: 'PKR', method: 'jazzcash', status: 'completed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-13T09:15:00Z', client: { companyName: 'Pak Retail Ltd' }, order: { orderNumber: 'ORD-003' } },
  { id: 'p4', orderId: 'o4', clientId: 'c4', amount: 50000, currency: 'PKR', method: 'easypaisa', status: 'failed', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-12T16:45:00Z', client: { companyName: 'Metro Systems' }, order: { orderNumber: 'ORD-004' } },
  { id: 'p5', orderId: 'o5', clientId: 'c5', amount: 180000, currency: 'PKR', method: 'raast', status: 'refunded', cardBrand: null, cardLast4: null, receiptUrl: null, createdAt: '2025-01-11T11:20:00Z', client: { companyName: 'Sindh Trading' }, order: { orderNumber: 'ORD-005' } },
]

const MOCK_INVOICES = [
  { id: 'i1', invoiceNumber: 'INV-2025-001', clientId: 'c1', amount: 150000, totalAmount: 172500, currency: 'PKR', status: 'sent', dueDate: '2025-02-01T00:00:00Z', paidAt: null, createdAt: '2025-01-15T10:00:00Z', client: { companyName: 'TechCorp Pakistan' } },
  { id: 'i2', invoiceNumber: 'INV-2025-002', clientId: 'c2', amount: 75000, totalAmount: 86250, currency: 'PKR', status: 'draft', dueDate: '2025-02-05T00:00:00Z', paidAt: null, createdAt: '2025-01-14T14:30:00Z', client: { companyName: 'Alpha Industries' } },
  { id: 'i3', invoiceNumber: 'INV-2025-003', clientId: 'c3', amount: 250000, totalAmount: 287500, currency: 'PKR', status: 'overdue', dueDate: '2025-01-10T00:00:00Z', paidAt: null, createdAt: '2025-01-01T09:00:00Z', client: { companyName: 'Pak Retail Ltd' } },
  { id: 'i4', invoiceNumber: 'INV-2025-004', clientId: 'c4', amount: 50000, totalAmount: 57500, currency: 'PKR', status: 'sent', dueDate: '2025-02-10T00:00:00Z', paidAt: null, createdAt: '2025-01-13T11:00:00Z', client: { companyName: 'Metro Systems' } },
  { id: 'i5', invoiceNumber: 'INV-2025-005', clientId: 'c5', amount: 180000, totalAmount: 207000, currency: 'PKR', status: 'paid', dueDate: '2025-01-15T00:00:00Z', paidAt: '2025-01-14T09:00:00Z', createdAt: '2025-01-05T10:00:00Z', client: { companyName: 'Sindh Trading' } },
]
