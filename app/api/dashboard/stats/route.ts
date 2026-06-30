import { NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalClients,
      activeDeals,
      paymentAgg,
      pendingInvoices,
      openTickets,
      activeSubscriptions,
      recentClients,
      recentDeals,
    ] = await Promise.all([
      withRetry((tx) => tx.client.count()),
      withRetry((tx) => tx.deal.count({ where: { stage: { notIn: ['closed_won', 'closed_lost'] } } })),
      withRetry((tx) => tx.payment.aggregate({ _sum: { amount: true }, where: { status: 'completed' } })),
      withRetry((tx) => tx.invoice.count({ where: { status: { in: ['draft', 'sent', 'overdue'] } } })),
      withRetry((tx) => tx.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } })),
      withRetry((tx) => tx.subscription.count({ where: { status: 'active' } })),
      withRetry((tx) =>
        tx.client.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, company: true, status: true, createdAt: true },
        })
      ),
      withRetry((tx) =>
        tx.deal.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { client: { select: { id: true, name: true, company: true } } },
        })
      ),
    ])

    // Revenue by month for last 12 months
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

    const revenueByMonth: Record<string, number> = {}
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 7) // YYYY-MM
      revenueByMonth[key] = (revenueByMonth[key] || 0) + p.amount
    }

    return NextResponse.json({
      totalClients,
      activeDeals,
      totalRevenue: paymentAgg._sum.amount || 0,
      pendingInvoices,
      openTickets,
      activeSubscriptions,
      recentClients,
      recentDeals,
      revenueByMonth,
    })
  } catch (error) {
    console.error('[Dashboard] Stats error:', error)
    return NextResponse.json(
      {
        totalClients: 0,
        activeDeals: 0,
        totalRevenue: 0,
        pendingInvoices: 0,
        openTickets: 0,
        activeSubscriptions: 0,
        recentClients: [],
        recentDeals: [],
        revenueByMonth: {},
      },
      { status: 200 }
    )
  }
}
