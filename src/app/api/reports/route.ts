import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'revenue'

    switch (type) {
      case 'revenue':
        return await getRevenueReport()
      case 'clients':
        return await getClientReport()
      case 'deals':
        return await getDealReport()
      case 'payments':
        return await getPaymentReport()
      default:
        return NextResponse.json({ error: 'Invalid report type. Use: revenue, clients, deals, payments' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Reports] GET error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

async function getRevenueReport() {
  // Payments grouped by month for last 12 months
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const payments = await withRetry((tx) =>
    tx.payment.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { amount: true, createdAt: true },
    })
  )

  const paidInvoices = await withRetry((tx) =>
    tx.invoice.findMany({
      where: {
        status: 'paid',
        paidAt: { gte: twelveMonthsAgo },
      },
      select: { total: true, paidAt: true },
    })
  )

  // Group payments by month
  const revenueByMonth: Record<string, number> = {}
  for (const p of payments) {
    const key = p.createdAt.toISOString().slice(0, 7) // YYYY-MM
    revenueByMonth[key] = (revenueByMonth[key] || 0) + p.amount
  }

  // Group paid invoices by month
  const invoiceByMonth: Record<string, number> = {}
  for (const inv of paidInvoices) {
    const key = (inv.paidAt || inv.createdAt || new Date()).toISOString().slice(0, 7)
    invoiceByMonth[key] = (invoiceByMonth[key] || 0) + inv.total
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalInvoiceRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)

  return NextResponse.json({
    type: 'revenue',
    totalPayments,
    totalInvoiceRevenue,
    paymentsByMonth: revenueByMonth,
    invoiceByMonth,
  })
}

async function getClientReport() {
  // Client count by status
  const byStatus = await withRetry((tx) =>
    tx.client.groupBy({
      by: ['status'],
      _count: { id: true },
    })
  )

  // Client count by industry
  const byIndustry = await withRetry((tx) =>
    tx.client.groupBy({
      by: ['industry'],
      _count: { id: true },
    })
  )

  const totalClients = await withRetry((tx) => tx.client.count())

  return NextResponse.json({
    type: 'clients',
    totalClients,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    byIndustry: byIndustry.map((i) => ({ industry: i.industry || 'Unknown', count: i._count.id })),
  })
}

async function getDealReport() {
  // Deal count by stage
  const byStage = await withRetry((tx) =>
    tx.deal.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { value: true },
    })
  )

  const totalDeals = await withRetry((tx) => tx.deal.count())
  const totalValue = await withRetry((tx) =>
    tx.deal.aggregate({ _sum: { value: true } })
  )

  return NextResponse.json({
    type: 'deals',
    totalDeals,
    totalValue: totalValue._sum.value || 0,
    byStage: byStage.map((s) => ({
      stage: s.stage,
      count: s._count.id,
      totalValue: s._sum.value || 0,
    })),
  })
}

async function getPaymentReport() {
  // Payment summary by method
  const byMethod = await withRetry((tx) =>
    tx.payment.groupBy({
      by: ['method'],
      _count: { id: true },
      _sum: { amount: true },
    })
  )

  // Payment summary by status
  const byStatus = await withRetry((tx) =>
    tx.payment.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    })
  )

  const totalPayments = await withRetry((tx) => tx.payment.count())
  const totalAmount = await withRetry((tx) =>
    tx.payment.aggregate({ _sum: { amount: true } })
  )

  return NextResponse.json({
    type: 'payments',
    totalPayments,
    totalAmount: totalAmount._sum.amount || 0,
    byMethod: byMethod.map((m) => ({
      method: m.method,
      count: m._count.id,
      totalAmount: m._sum.amount || 0,
    })),
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalAmount: s._sum.amount || 0,
    })),
  })
}
