import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/payments — list payments with filters (status, gateway, dateFrom, dateTo, search)
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const gateway = searchParams.get('gateway') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const search = (searchParams.get('search') || '').trim().toLowerCase()

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (gateway && gateway !== 'all') where.method = gateway

    // Date range — apply to createdAt
    if (dateFrom || dateTo) {
      const range: Record<string, Date> = {}
      if (dateFrom) range.gte = new Date(dateFrom)
      if (dateTo) {
        // include the full end day
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        range.lte = end
      }
      where.createdAt = range
    }

    if (search) {
      where.OR = [
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { contactPerson: { contains: search, mode: 'insensitive' } } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
        { transactionId: { contains: search, mode: 'insensitive' } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const payments = await withRetry((d) =>
      d.payment.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              name: true,
              email: true,
              company: true,
            },
          },
          invoice: {
            select: { id: true, invoiceNumber: true, number: true, total: true, currency: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      })
    )

    // Stats from ALL payments (not filtered)
    const allPayments = await withRetry((d) =>
      d.payment.findMany({
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          createdAt: true,
        },
      })
    )

    let totalRevenue = 0
    let thisMonthRevenue = 0
    const counts: Record<string, number> = {
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    }
    const byGateway: Record<string, { gateway: string; count: number; revenue: number }> = {}

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Build last-6-months buckets for the chart
    const months: { label: string; year: number; month: number; revenue: number; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        revenue: 0,
        count: 0,
      })
    }

    for (const p of allPayments) {
      if (p.status === 'completed') {
        totalRevenue += p.amount
        if (p.createdAt >= monthStart) {
          thisMonthRevenue += p.amount
        }
        // Bucket into last 6 months (revenue for completed payments only)
        const bucket = months.find((m) => m.year === p.createdAt.getFullYear() && m.month === p.createdAt.getMonth())
        if (bucket) {
          bucket.revenue += p.amount
          bucket.count++
        }
      }
      counts[p.status] = (counts[p.status] || 0) + 1

      const g = p.method || 'unknown'
      if (!byGateway[g]) byGateway[g] = { gateway: g, count: 0, revenue: 0 }
      byGateway[g].count++
      if (p.status === 'completed') byGateway[g].revenue += p.amount
    }

    return NextResponse.json({
      payments,
      stats: {
        totalRevenue,
        thisMonthRevenue,
        successful: counts.completed || 0,
        failed: counts.failed || 0,
        pending: counts.pending || 0,
        refunded: counts.refunded || 0,
        total: allPayments.length,
        byGateway: Object.values(byGateway).sort((a, b) => b.revenue - a.revenue),
        monthly: months,
      },
    })
  } catch (error) {
    console.error('[ADMIN-PAYMENTS] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments', payments: [], stats: null },
      { status: 500 }
    )
  }
}

// POST /api/admin/payments — manually record a payment
// Body: { clientId, amount, currency?, method?, status?, transactionId?, invoiceId?, notes? }
// If invoiceId is provided, the payment is linked to that invoice (must exist).
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const {
      clientId,
      amount,
      currency = 'PKR',
      method = 'manual',
      status = 'completed',
      transactionId,
      invoiceId,
      notes,
      cardBrand,
      cardLast4,
    } = body as {
      clientId?: string
      amount?: number
      currency?: string
      method?: string
      status?: string
      transactionId?: string
      invoiceId?: string
      notes?: string
      cardBrand?: string
      cardLast4?: string
    }

    // Basic validation
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client is required' },
        { status: 400 }
      )
    }
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'A valid amount (number ≥ 0) is required' },
        { status: 400 }
      )
    }

    // Validate client exists
    const client = await withRetry((d) =>
      d.client.findUnique({
        where: { id: clientId },
        select: { id: true, companyName: true, contactPerson: true, email: true, company: true },
      })
    )
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Validate invoice if provided
    if (invoiceId) {
      const inv = await withRetry((d) =>
        d.invoice.findUnique({ where: { id: invoiceId }, select: { id: true } })
      )
      if (!inv) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
    }

    // Auto-generate a transaction id if none provided so the row is traceable.
    const finalTxnId =
      transactionId ||
      `MAN-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`

    const created = await withRetry((d) =>
      d.payment.create({
        data: {
          clientId,
          invoiceId: invoiceId || null,
          amount: Number(amount),
          currency,
          method,
          status,
          transactionId: finalTxnId,
          notes: notes || null,
          cardBrand: cardBrand || null,
          cardLast4: cardLast4 || null,
          verifiedAt: status === 'completed' ? new Date() : null,
        },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              name: true,
              email: true,
              company: true,
            },
          },
          invoice: {
            select: { id: true, invoiceNumber: true, number: true, total: true, currency: true },
          },
        },
      })
    )

    return NextResponse.json({ payment: created }, { status: 201 })
  } catch (error) {
    console.error('[ADMIN-PAYMENTS] Failed to create:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}

