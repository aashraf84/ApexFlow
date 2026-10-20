import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ─── helpers ──────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>
type Bucket = { label: string; year: number; month: number; value: number; count: number }

function parseRange(searchParams: URLSearchParams) {
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const range: { gte?: Date; lte?: Date } = {}
  if (from) {
    const d = new Date(from)
    if (!isNaN(d.getTime())) range.gte = d
  }
  if (to) {
    const d = new Date(to)
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999)
      range.lte = d
    }
  }
  return range
}

function emptyRange(range: { gte?: Date; lte?: Date }) {
  return Object.keys(range).length === 0 ? null : range
}

function makeMonthlyBuckets(monthsBack: number): Bucket[] {
  const now = new Date()
  const out: Bucket[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      value: 0,
      count: 0,
    })
  }
  return out
}

function makeDailyBuckets(daysBack: number): Bucket[] {
  const now = new Date()
  const out: Bucket[] = []
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    out.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      value: 0,
      count: 0,
    })
  }
  return out
}

function groupByClientRevenue(rows: Array<{ clientId: string | null; amount: number; client?: { companyName: string; contactPerson: string; email: string; name: string | null } | null }>) {
  const map = new Map<string, { clientId: string; client: string; revenue: number; count: number; email?: string }>()
  for (const r of rows) {
    const key = r.clientId || 'unknown'
    const existing = map.get(key) || {
      clientId: key,
      client: r.client?.companyName || r.client?.name || r.client?.contactPerson || r.client?.email || 'Unknown',
      revenue: 0,
      count: 0,
      email: r.client?.email,
    }
    existing.revenue += r.amount
    existing.count += 1
    map.set(key, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

// ─── main GET ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    const { type: rawType } = await ctx.params
    const type = (rawType || '').toLowerCase()
    const { searchParams } = new URL(request.url)
    const range = parseRange(searchParams)

    let payload: Row = {}
    switch (type) {
      case 'sales':
        payload = await buildSales(range)
        break
      case 'clients':
        payload = await buildClients(range)
        break
      case 'subscriptions':
        payload = await buildSubscriptions(range)
        break
      case 'support':
        payload = await buildSupport(range)
        break
      case 'integrations':
        payload = await buildIntegrations(range)
        break
      case 'financial':
        payload = await buildFinancial(range)
        break
      default:
        return NextResponse.json(
          { error: `Unknown report type '${type}'. Valid types: sales | clients | subscriptions | support | integrations | financial.` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      type,
      range: { from: range.gte?.toISOString() || null, to: range.lte?.toISOString() || null },
      generatedAt: new Date().toISOString(),
      ...payload,
    })
  } catch (error) {
    console.error('[ADMIN-REPORTS] Failed:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

// ─── 1) SALES & REVENUE ────────────────────────────────────────────────────────

async function buildSales(range: { gte?: Date; lte?: Date }): Promise<Row> {
  const dateWhere = emptyRange(range)
  const paymentWhere = dateWhere ? { createdAt: dateWhere } : {}

  // 1a. payments by month + total — completed payments only count toward revenue
  const payments = await withRetry((d) =>
    d.payment.findMany({
      where: paymentWhere,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        createdAt: true,
        clientId: true,
        client: { select: { companyName: true, contactPerson: true, name: true, email: true } },
      },
      take: 5000,
    })
  )

  const invoices = await withRetry((d) =>
    d.invoice.findMany({
      where: dateWhere ? { createdAt: dateWhere } : {},
      select: { id: true, amount: true, totalAmount: true, total: true, tax: true, status: true, currency: true, createdAt: true },
      take: 5000,
    })
  )

  // monthly buckets — last 12 months
  const monthly = makeMonthlyBuckets(12)
  let totalRevenue = 0
  let invoiceRevenue = 0
  let totalCompleted = 0
  let totalAttempts = 0
  const byMethod: Record<string, { method: string; revenue: number; count: number }> = {}
  const byStatus: Record<string, number> = {}
  for (const p of payments) {
    totalAttempts++
    byStatus[p.status] = (byStatus[p.status] || 0) + 1
    const g = p.method || 'unknown'
    if (!byMethod[g]) byMethod[g] = { method: g, revenue: 0, count: 0 }
    byMethod[g].count++
    if (p.status === 'completed' || p.status === 'succeeded') {
      totalRevenue += p.amount
      totalCompleted++
      byMethod[g].revenue += p.amount
      const bucket = monthly.find((m) => m.year === p.createdAt.getFullYear() && m.month === p.createdAt.getMonth())
      if (bucket) {
        bucket.value += p.amount
        bucket.count++
      }
    }
  }
  for (const inv of invoices) {
    const amt = inv.totalAmount || inv.total || inv.amount || 0
    if (inv.status === 'paid' || inv.status === 'completed') {
      invoiceRevenue += amt
    }
  }

  // 1b. revenue by ERP system (via Client.erpSystem join)
  const byErpMap = new Map<string, { erp: string; revenue: number; count: number }>()
  // re-fetch joined payments with client.erpSystem for grouping
  const joinedPayments = await withRetry((d) =>
    d.payment.findMany({
      where: { ...paymentWhere, status: { in: ['completed', 'succeeded'] } },
      select: {
        amount: true,
        client: { select: { erpSystem: { select: { name: true } }, erpSlug: true } },
      },
      take: 5000,
    })
  )
  for (const p of joinedPayments) {
    const erp = p.client?.erpSystem?.name || p.client?.erpSlug || 'Unassigned'
    const existing = byErpMap.get(erp) || { erp, revenue: 0, count: 0 }
    existing.revenue += p.amount
    existing.count++
    byErpMap.set(erp, existing)
  }

  // 1c. top clients by revenue
  const topClients = groupByClientRevenue(
    payments
      .filter((p) => p.status === 'completed' || p.status === 'succeeded')
      .map((p) => ({
        clientId: p.clientId,
        amount: p.amount,
        client: p.client,
      }))
  ).slice(0, 20)

  // 1d. payment success rate
  const successRate = totalAttempts > 0 ? (totalCompleted / totalAttempts) * 100 : 0

  return {
    title: 'Sales & Revenue Report',
    description: 'Revenue performance by month, ERP system, top clients, and payment success rate.',
    summary: [
      { label: 'Total Revenue', value: totalRevenue, format: 'currency' },
      { label: 'Invoice Revenue', value: invoiceRevenue, format: 'currency' },
      { label: 'Completed Payments', value: totalCompleted, format: 'number' },
      { label: 'Payment Success Rate', value: successRate, format: 'percent' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Revenue by Month (Last 12 Months)',
        data: monthly.map((m) => ({ label: m.label, value: m.value, count: m.count })),
        yLabel: 'Revenue',
      },
      {
        kind: 'donut',
        title: 'Revenue by ERP',
        data: Array.from(byErpMap.values()).map((e) => ({ label: e.erp, value: e.revenue })),
      },
    ],
    tables: [
      {
        name: 'Revenue by Month',
        columns: ['Month', 'Revenue', 'Payments'],
        rows: monthly.map((m) => ({ Month: m.label, Revenue: m.value, Payments: m.count })),
      },
      {
        name: 'Revenue by ERP',
        columns: ['ERP System', 'Revenue', 'Payments'],
        rows: Array.from(byErpMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .map((r) => ({ 'ERP System': r.erp, Revenue: r.revenue, Payments: r.count })),
      },
      {
        name: 'Top Clients by Revenue',
        columns: ['Client', 'Email', 'Revenue', 'Payments'],
        rows: topClients.map((c) => ({ Client: c.client, Email: c.email || '—', Revenue: c.revenue, Payments: c.count })),
      },
      {
        name: 'Payment Gateway Breakdown',
        columns: ['Gateway', 'Revenue', 'Count'],
        rows: Object.values(byMethod)
          .sort((a, b) => b.revenue - a.revenue)
          .map((g) => ({ Gateway: g.method, Revenue: g.revenue, Count: g.count })),
      },
    ],
  }
}

// ─── 2) CLIENTS & CRM ─────────────────────────────────────────────────────────

async function buildClients(range: { gte?: Date; lte?: Date }): Promise<Row> {
  const dateWhere = emptyRange(range)
  const clientWhere = dateWhere ? { createdAt: dateWhere } : {}

  const clients = await withRetry((d) =>
    d.client.findMany({
      where: clientWhere,
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        email: true,
        status: true,
        industry: true,
        businessType: true,
        companySize: true,
        erpSlug: true,
        erpSystemId: true,
        erpSystem: { select: { name: true } },
        createdAt: true,
      },
      take: 10000,
    })
  )

  // total counts (all clients — for retention calc)
  const allClients = await withRetry((d) =>
    d.client.findMany({
      select: { id: true, status: true, createdAt: true },
    })
  )

  const byStatus: Record<string, number> = {}
  const byErp: Record<string, number> = {}
  const byIndustry: Record<string, number> = {}
  const byBusinessType: Record<string, number> = {}
  let totalFiltered = clients.length
  let totalAll = allClients.length

  for (const c of clients) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
    const erp = c.erpSystem?.name || c.erpSlug || 'Unassigned'
    byErp[erp] = (byErp[erp] || 0) + 1
    const ind = c.industry || 'Unspecified'
    byIndustry[ind] = (byIndustry[ind] || 0) + 1
    const bt = c.businessType || 'Unspecified'
    byBusinessType[bt] = (byBusinessType[bt] || 0) + 1
  }

  // client growth — monthly new clients (last 12 months)
  const monthly = makeMonthlyBuckets(12)
  for (const c of allClients) {
    const bucket = monthly.find((m) => m.year === c.createdAt.getFullYear() && m.month === c.createdAt.getMonth())
    if (bucket) {
      bucket.value++
      bucket.count++
    }
  }

  // retention: active / total
  const activeCount = allClients.filter((c) => c.status === 'active').length
  const churnedCount = allClients.filter((c) => c.status === 'churned' || c.status === 'cancelled').length
  const retentionRate = totalAll > 0 ? (activeCount / totalAll) * 100 : 0
  const churnRate = totalAll > 0 ? (churnedCount / totalAll) * 100 : 0

  return {
    title: 'Clients & CRM Report',
    description: 'Client growth, distribution by status/ERP/industry, and retention metrics.',
    summary: [
      { label: 'Total Clients', value: totalAll, format: 'number' },
      { label: 'In Date Range', value: totalFiltered, format: 'number' },
      { label: 'Retention Rate', value: retentionRate, format: 'percent' },
      { label: 'Churn Rate', value: churnRate, format: 'percent' },
    ],
    charts: [
      {
        kind: 'line',
        title: 'Client Growth (Last 12 Months)',
        data: monthly.map((m) => ({ label: m.label, value: m.value, count: m.count })),
      },
      {
        kind: 'donut',
        title: 'Clients by Status',
        data: Object.entries(byStatus).map(([k, v]) => ({ label: k, value: v })),
      },
      {
        kind: 'bar',
        title: 'Clients by ERP System',
        data: Object.entries(byErp).map(([k, v]) => ({ label: k, value: v })),
      },
    ],
    tables: [
      {
        name: 'Clients by Status',
        columns: ['Status', 'Count', 'Percent'],
        rows: Object.entries(byStatus)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ Status: k, Count: v, Percent: totalAll > 0 ? (v / totalAll) * 100 : 0 })),
      },
      {
        name: 'Clients by ERP',
        columns: ['ERP System', 'Count', 'Percent'],
        rows: Object.entries(byErp)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ 'ERP System': k, Count: v, Percent: totalAll > 0 ? (v / totalAll) * 100 : 0 })),
      },
      {
        name: 'Clients by Industry',
        columns: ['Industry', 'Count', 'Percent'],
        rows: Object.entries(byIndustry)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ Industry: k, Count: v, Percent: totalAll > 0 ? (v / totalAll) * 100 : 0 })),
      },
      {
        name: 'Client Growth by Month',
        columns: ['Month', 'New Clients'],
        rows: monthly.map((m) => ({ Month: m.label, 'New Clients': m.value })),
      },
    ],
  }
}

// ─── 3) SUBSCRIPTIONS & LICENSES ──────────────────────────────────────────────

async function buildSubscriptions(range: { gte?: Date; lte?: Date }): Promise<Row> {
  const dateWhere = emptyRange(range)

  const subs = await withRetry((d) =>
    d.subscription.findMany({
      where: dateWhere ? { createdAt: dateWhere } : {},
      select: {
        id: true,
        plan: true,
        status: true,
        billingCycle: true,
        monthlyFee: true,
        currency: true,
        startDate: true,
        endDate: true,
        trialEndsAt: true,
        package: { select: { name: true, price: true } },
        client: { select: { companyName: true, name: true, contactPerson: true, email: true } },
        createdAt: true,
      },
      take: 10000,
    })
  )

  const licenses = await withRetry((d) =>
    d.license.findMany({
      where: dateWhere ? { createdAt: dateWhere } : {},
      select: { id: true, type: true, status: true, maxUsers: true, maxDevices: true, expiresAt: true, createdAt: true },
      take: 10000,
    })
  )

  // MRR by plan
  const byPlan: Record<string, { plan: string; mrr: number; count: number }> = {}
  let totalMrr = 0
  let active = 0
  let trial = 0
  let pastDue = 0
  let cancelled = 0
  let expired = 0
  for (const s of subs) {
    if (s.status === 'active') active++
    if (s.status === 'trial') trial++
    if (s.status === 'past_due') pastDue++
    if (s.status === 'cancelled') cancelled++
    if (s.status === 'expired') expired++
    const fee = s.monthlyFee || s.package?.price || 0
    if (s.status === 'active' || s.status === 'past_due') {
      const normalized = s.billingCycle === 'annual' ? fee / 12 : fee
      totalMrr += normalized
      const key = s.plan || 'unknown'
      if (!byPlan[key]) byPlan[key] = { plan: key, mrr: 0, count: 0 }
      byPlan[key].mrr += normalized
      byPlan[key].count++
    }
  }

  // License utilization
  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter((l) => l.status === 'active').length
  const expiredLicenses = licenses.filter((l) => l.status === 'expired').length
  const suspendedLicenses = licenses.filter((l) => l.status === 'suspended' || l.status === 'revoked').length
  const totalMaxUsers = licenses.reduce((a, b) => a + (b.maxUsers || 0), 0)
  const utilization = totalMaxUsers > 0 ? (activeLicenses * 5 / totalMaxUsers) * 100 : 0 // avg 5 users per active license

  // Churn — cancelled subs / total subs
  const churnRate = subs.length > 0 ? (cancelled / subs.length) * 100 : 0

  // monthly MRR trend
  const monthly = makeMonthlyBuckets(12)
  // re-fetch all subs for trend (not date-filtered)
  const allSubs = await withRetry((d) =>
    d.subscription.findMany({
      select: { status: true, monthlyFee: true, billingCycle: true, package: { select: { price: true } }, createdAt: true },
    })
  )
  for (const s of allSubs) {
    const bucket = monthly.find((m) => m.year === s.createdAt.getFullYear() && m.month === s.createdAt.getMonth())
    if (bucket) {
      const fee = s.monthlyFee || s.package?.price || 0
      const normalized = s.billingCycle === 'annual' ? fee / 12 : fee
      if (s.status === 'active' || s.status === 'past_due') {
        bucket.value += normalized
      }
      bucket.count++
    }
  }

  return {
    title: 'Subscriptions & Licenses Report',
    description: 'Active subscriptions, MRR by plan, license utilization, and churn rate.',
    summary: [
      { label: 'MRR', value: totalMrr, format: 'currency' },
      { label: 'Active Subscriptions', value: active, format: 'number' },
      { label: 'Active Licenses', value: activeLicenses, format: 'number' },
      { label: 'Churn Rate', value: churnRate, format: 'percent' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'MRR by Plan',
        data: Object.values(byPlan).map((p) => ({ label: p.plan, value: p.mrr, count: p.count })),
      },
      {
        kind: 'line',
        title: 'MRR Trend (Last 12 Months)',
        data: monthly.map((m) => ({ label: m.label, value: m.value, count: m.count })),
      },
      {
        kind: 'donut',
        title: 'License Status',
        data: [
          { label: 'Active', value: activeLicenses },
          { label: 'Expired', value: expiredLicenses },
          { label: 'Suspended/Revoked', value: suspendedLicenses },
        ],
      },
    ],
    tables: [
      {
        name: 'MRR by Plan',
        columns: ['Plan', 'MRR', 'Subscriptions'],
        rows: Object.values(byPlan)
          .sort((a, b) => b.mrr - a.mrr)
          .map((p) => ({ Plan: p.plan, MRR: p.mrr, Subscriptions: p.count })),
      },
      {
        name: 'Subscription Status Breakdown',
        columns: ['Status', 'Count', 'Percent'],
        rows: [
          { Status: 'Active', Count: active, Percent: subs.length > 0 ? (active / subs.length) * 100 : 0 },
          { Status: 'Trial', Count: trial, Percent: subs.length > 0 ? (trial / subs.length) * 100 : 0 },
          { Status: 'Past Due', Count: pastDue, Percent: subs.length > 0 ? (pastDue / subs.length) * 100 : 0 },
          { Status: 'Cancelled', Count: cancelled, Percent: subs.length > 0 ? (cancelled / subs.length) * 100 : 0 },
          { Status: 'Expired', Count: expired, Percent: subs.length > 0 ? (expired / subs.length) * 100 : 0 },
        ],
      },
      {
        name: 'License Utilization',
        columns: ['Metric', 'Value'],
        rows: [
          { Metric: 'Total Licenses', Value: totalLicenses },
          { Metric: 'Active Licenses', Value: activeLicenses },
          { Metric: 'Expired Licenses', Value: expiredLicenses },
          { Metric: 'Suspended/Revoked', Value: suspendedLicenses },
          { Metric: 'Total Max Users', Value: totalMaxUsers },
          { Metric: 'Utilization Rate (%)', Value: utilization },
        ],
      },
    ],
  }
}

// ─── 4) SUPPORT ───────────────────────────────────────────────────────────────

async function buildSupport(range: { gte?: Date; lte?: Date }): Promise<Row> {
  const dateWhere = emptyRange(range)
  const ticketWhere = dateWhere ? { createdAt: dateWhere } : {}

  const tickets = await withRetry((d) =>
    d.supportTicket.findMany({
      where: ticketWhere,
      select: {
        id: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { companyName: true, name: true, contactPerson: true } },
        responses: { select: { author: true, createdAt: true }, take: 1, orderBy: { createdAt: 'desc' } },
      },
      take: 10000,
    })
  )

  const byStatus: Record<string, number> = {}
  const byPriority: Record<string, number> = {}
  const byCategory: Record<string, number> = {}
  const byAgent: Record<string, { agent: string; count: number; resolved: number }> = {}
  let total = tickets.length
  let resolvedCount = 0
  let totalResolutionMs = 0
  let resolvedWithTime = 0

  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
    byCategory[t.category] = (byCategory[t.category] || 0) + 1
    const isResolved = t.status === 'resolved' || t.status === 'closed'
    if (isResolved) {
      resolvedCount++
      const dur = t.updatedAt.getTime() - t.createdAt.getTime()
      if (dur > 0 && dur < 1000 * 60 * 60 * 24 * 365) {
        totalResolutionMs += dur
        resolvedWithTime++
      }
    }
    if (t.responses[0]) {
      const a = t.responses[0].author || 'Unassigned'
      if (!byAgent[a]) byAgent[a] = { agent: a, count: 0, resolved: 0 }
      byAgent[a].count++
      if (isResolved) byAgent[a].resolved++
    }
  }

  const avgResolutionMs = resolvedWithTime > 0 ? totalResolutionMs / resolvedWithTime : 0
  const avgResolutionHours = avgResolutionMs / (1000 * 60 * 60)
  const avgResolutionDays = avgResolutionHours / 24

  // tickets by month
  const monthly = makeMonthlyBuckets(12)
  for (const t of tickets) {
    const bucket = monthly.find((m) => m.year === t.createdAt.getFullYear() && m.month === t.createdAt.getMonth())
    if (bucket) {
      bucket.value++
      bucket.count++
    }
  }

  // resolution rate
  const resolutionRate = total > 0 ? (resolvedCount / total) * 100 : 0

  return {
    title: 'Support Report',
    description: 'Tickets by status, priority, category, average resolution time, and agent performance.',
    summary: [
      { label: 'Total Tickets', value: total, format: 'number' },
      { label: 'Resolved', value: resolvedCount, format: 'number' },
      { label: 'Avg Resolution (hrs)', value: avgResolutionHours, format: 'number' },
      { label: 'Resolution Rate', value: resolutionRate, format: 'percent' },
    ],
    charts: [
      {
        kind: 'donut',
        title: 'Tickets by Status',
        data: Object.entries(byStatus).map(([k, v]) => ({ label: k, value: v })),
      },
      {
        kind: 'bar',
        title: 'Tickets by Priority',
        data: Object.entries(byPriority).map(([k, v]) => ({ label: k, value: v })),
      },
      {
        kind: 'line',
        title: 'Tickets Created (Last 12 Months)',
        data: monthly.map((m) => ({ label: m.label, value: m.value, count: m.count })),
      },
    ],
    tables: [
      {
        name: 'Tickets by Status',
        columns: ['Status', 'Count', 'Percent'],
        rows: Object.entries(byStatus)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ Status: k, Count: v, Percent: total > 0 ? (v / total) * 100 : 0 })),
      },
      {
        name: 'Tickets by Priority',
        columns: ['Priority', 'Count', 'Percent'],
        rows: Object.entries(byPriority)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ Priority: k, Count: v, Percent: total > 0 ? (v / total) * 100 : 0 })),
      },
      {
        name: 'Tickets by Category',
        columns: ['Category', 'Count', 'Percent'],
        rows: Object.entries(byCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ Category: k, Count: v, Percent: total > 0 ? (v / total) * 100 : 0 })),
      },
      {
        name: 'Agent Performance',
        columns: ['Agent', 'Tickets Handled', 'Resolved', 'Resolution Rate (%)'],
        rows: Object.values(byAgent)
          .sort((a, b) => b.count - a.count)
          .map((a) => ({
            Agent: a.agent,
            'Tickets Handled': a.count,
            Resolved: a.resolved,
            'Resolution Rate (%)': a.count > 0 ? (a.resolved / a.count) * 100 : 0,
          })),
      },
    ],
    meta: { avgResolutionHours, avgResolutionDays },
  }
}

// ─── 5) INTEGRATIONS ──────────────────────────────────────────────────────────

async function buildIntegrations(range: { gte?: Date; lte?: Date }): Promise<Row> {
  const dateWhere = emptyRange(range)
  const syncWhere = dateWhere ? { startedAt: dateWhere } : {}

  const logs = await withRetry((d) =>
    d.syncLog.findMany({
      where: syncWhere,
      select: {
        id: true,
        erpName: true,
        erpSlug: true,
        status: true,
        direction: true,
        recordsSynced: true,
        recordsFailed: true,
        durationMs: true,
        errorMessage: true,
        startedAt: true,
      },
      take: 10000,
    })
  )

  const connectors = await withRetry((d) =>
    d.integrationConnector.findMany({
      select: {
        id: true,
        erpName: true,
        erpSlug: true,
        status: true,
        type: true,
        direction: true,
        autoSync: true,
        clientCount: true,
        latencyMs: true,
        lastError: true,
        lastSyncAt: true,
      },
    })
  )

  const byErp: Record<string, { erp: string; records: number; failed: number; count: number }> = {}
  const byStatus: Record<string, number> = {}
  const byDirection: Record<string, number> = {}
  const errors: { message: string; count: number }[] = []
  const errorMap: Record<string, number> = {}
  let totalDurationMs = 0
  let totalRecords = 0
  let totalFailed = 0
  let successCount = 0
  let totalCount = logs.length

  for (const l of logs) {
    const erp = l.erpName || l.erpSlug || 'Unknown'
    if (!byErp[erp]) byErp[erp] = { erp, records: 0, failed: 0, count: 0 }
    byErp[erp].records += l.recordsSynced || 0
    byErp[erp].failed += l.recordsFailed || 0
    byErp[erp].count++
    byStatus[l.status] = (byStatus[l.status] || 0) + 1
    byDirection[l.direction || 'bidirectional'] = (byDirection[l.direction || 'bidirectional'] || 0) + 1
    totalDurationMs += l.durationMs || 0
    totalRecords += l.recordsSynced || 0
    totalFailed += l.recordsFailed || 0
    if (l.status === 'success') successCount++
    if (l.errorMessage) {
      const msg = l.errorMessage.slice(0, 100)
      errorMap[msg] = (errorMap[msg] || 0) + 1
    }
  }
  for (const [k, v] of Object.entries(errorMap)) {
    errors.push({ message: k, count: v })
  }
  errors.sort((a, b) => b.count - a.count)

  const syncSuccessRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0
  const avgDurationMs = totalCount > 0 ? totalDurationMs / totalCount : 0

  // daily buckets for duration trend
  const daily = makeDailyBuckets(30)
  // re-fetch last 30 days of sync logs
  const recentLogs = await withRetry((d) =>
    d.syncLog.findMany({
      where: { startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { durationMs: true, startedAt: true, status: true, recordsSynced: true },
      take: 5000,
    })
  )
  for (const l of recentLogs) {
    const bucket = daily.find((m) => {
      const d = new Date(m.year, m.month, Number(m.label.split(' ')[1]))
      return (
        d.getFullYear() === l.startedAt.getFullYear() &&
        d.getMonth() === l.startedAt.getMonth() &&
        d.getDate() === l.startedAt.getDate()
      )
    })
    if (bucket) {
      bucket.value += l.durationMs || 0
      bucket.count++
    }
  }

  // active connectors count
  const activeConnectors = connectors.filter((c) => c.status === 'connected' || c.status === 'active').length
  const disconnectedConnectors = connectors.length - activeConnectors

  return {
    title: 'Integrations Report',
    description: 'Sync success rate, records synced by ERP, duration trends, and error breakdown.',
    summary: [
      { label: 'Total Syncs', value: totalCount, format: 'number' },
      { label: 'Sync Success Rate', value: syncSuccessRate, format: 'percent' },
      { label: 'Total Records Synced', value: totalRecords, format: 'number' },
      { label: 'Active Connectors', value: activeConnectors, format: 'number' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Records Synced by ERP',
        data: Object.values(byErp).map((e) => ({ label: e.erp, value: e.records, count: e.count })),
      },
      {
        kind: 'line',
        title: 'Sync Duration Trend (Last 30 Days, Avg ms)',
        data: daily.map((d) => ({
          label: d.label,
          value: d.count > 0 ? d.value / d.count : 0,
          count: d.count,
        })),
      },
      {
        kind: 'donut',
        title: 'Sync Status',
        data: Object.entries(byStatus).map(([k, v]) => ({ label: k, value: v })),
      },
    ],
    tables: [
      {
        name: 'Records Synced by ERP',
        columns: ['ERP System', 'Records Synced', 'Failed', 'Syncs'],
        rows: Object.values(byErp)
          .sort((a, b) => b.records - a.records)
          .map((r) => ({ 'ERP System': r.erp, 'Records Synced': r.records, Failed: r.failed, Syncs: r.count })),
      },
      {
        name: 'Sync Status Breakdown',
        columns: ['Status', 'Count', 'Percent'],
        rows: Object.entries(byStatus)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ Status: k, Count: v, Percent: totalCount > 0 ? (v / totalCount) * 100 : 0 })),
      },
      {
        name: 'Error Breakdown (Top 20)',
        columns: ['Error Message', 'Count'],
        rows: errors.slice(0, 20).map((e) => ({ 'Error Message': e.message, Count: e.count })),
      },
      {
        name: 'Connector Status',
        columns: ['ERP System', 'Status', 'Type', 'Direction', 'Clients', 'Last Sync'],
        rows: connectors.map((c) => ({
          'ERP System': c.erpName || c.erpSlug || '—',
          Status: c.status,
          Type: c.type,
          Direction: c.direction,
          Clients: c.clientCount,
          'Last Sync': c.lastSyncAt ? new Date(c.lastSyncAt).toISOString() : '—',
        })),
      },
    ],
    meta: { avgDurationMs, totalFailed, activeConnectors, disconnectedConnectors },
  }
}

// ─── 6) FINANCIAL ─────────────────────────────────────────────────────────────

async function buildFinancial(range: { gte?: Date; lte?: Date }): Promise<Row> {
  const dateWhere = emptyRange(range)

  const invoices = await withRetry((d) =>
    d.invoice.findMany({
      where: dateWhere ? { createdAt: dateWhere } : {},
      select: {
        id: true,
        invoiceNumber: true,
        number: true,
        status: true,
        amount: true,
        tax: true,
        discount: true,
        totalAmount: true,
        total: true,
        currency: true,
        dueDate: true,
        paidAt: true,
        createdAt: true,
        client: { select: { companyName: true, name: true, contactPerson: true, email: true } },
      },
      take: 10000,
    })
  )

  const payments = await withRetry((d) =>
    d.payment.findMany({
      where: dateWhere ? { createdAt: dateWhere } : {},
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        currency: true,
        createdAt: true,
        client: { select: { companyName: true, name: true, contactPerson: true, email: true } },
      },
      take: 10000,
    })
  )

  // Outstanding invoices
  const outstandingInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'completed' && i.status !== 'cancelled')
  const totalOutstanding = outstandingInvoices.reduce(
    (a, b) => a + (b.totalAmount || b.total || b.amount || 0),
    0
  )
  const totalInvoiced = invoices.reduce((a, b) => a + (b.totalAmount || b.total || b.amount || 0), 0)
  const totalCollected = payments
    .filter((p) => p.status === 'completed' || p.status === 'succeeded')
    .reduce((a, b) => a + b.amount, 0)

  // Outstanding by client
  const byClientOutstanding = new Map<string, { client: string; outstanding: number; count: number }>()
  for (const inv of outstandingInvoices) {
    const name = inv.client?.companyName || inv.client?.name || inv.client?.contactPerson || inv.client?.email || 'Unknown'
    const key = name
    const existing = byClientOutstanding.get(key) || { client: name, outstanding: 0, count: 0 }
    existing.outstanding += inv.totalAmount || inv.total || inv.amount || 0
    existing.count++
    byClientOutstanding.set(key, existing)
  }

  // Payment gateway breakdown
  const byGateway: Record<string, { gateway: string; revenue: number; count: number }> = {}
  for (const p of payments) {
    const g = p.method || 'unknown'
    if (!byGateway[g]) byGateway[g] = { gateway: g, revenue: 0, count: 0 }
    byGateway[g].count++
    if (p.status === 'completed' || p.status === 'succeeded') byGateway[g].revenue += p.amount
  }

  // Revenue vs expenses — invoice totals (revenue recognized) vs collected (cash)
  const monthly = makeMonthlyBuckets(12)
  // re-fetch all invoices + payments for trend
  const [allInvoices, allPayments] = await Promise.all([
    withRetry((d) =>
      d.invoice.findMany({
        select: { totalAmount: true, total: true, amount: true, status: true, createdAt: true },
      })
    ),
    withRetry((d) =>
      d.payment.findMany({ select: { amount: true, status: true, createdAt: true } })
    ),
  ])
  for (const i of allInvoices) {
    const bucket = monthly.find((m) => m.year === i.createdAt.getFullYear() && m.month === i.createdAt.getMonth())
    if (bucket) {
      const amt = i.totalAmount || i.total || i.amount || 0
      bucket.value += amt
      bucket.count++
    }
  }
  const collectedMonthly = makeMonthlyBuckets(12)
  for (const p of allPayments) {
    if (p.status === 'completed' || p.status === 'succeeded') {
      const bucket = collectedMonthly.find((m) => m.year === p.createdAt.getFullYear() && m.month === p.createdAt.getMonth())
      if (bucket) {
        bucket.value += p.amount
        bucket.count++
      }
    }
  }

  return {
    title: 'Financial Report',
    description: 'Outstanding invoices, payment gateway breakdown, and revenue vs. cash collected.',
    summary: [
      { label: 'Total Invoiced', value: totalInvoiced, format: 'currency' },
      { label: 'Total Collected', value: totalCollected, format: 'currency' },
      { label: 'Outstanding', value: totalOutstanding, format: 'currency' },
      { label: 'Outstanding Invoices', value: outstandingInvoices.length, format: 'number' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Invoiced vs Collected (Last 12 Months)',
        data: monthly.map((m, i) => ({
          label: m.label,
          value: m.value,
          secondary: collectedMonthly[i].value,
        })),
      },
      {
        kind: 'donut',
        title: 'Payment Gateway Breakdown',
        data: Object.values(byGateway).map((g) => ({ label: g.gateway, value: g.revenue })),
      },
    ],
    tables: [
      {
        name: 'Outstanding Invoices',
        columns: ['Invoice #', 'Client', 'Amount', 'Currency', 'Status', 'Due Date'],
        rows: outstandingInvoices
          .sort((a, b) => (b.totalAmount || b.total || b.amount || 0) - (a.totalAmount || a.total || a.amount || 0))
          .slice(0, 200)
          .map((i) => ({
            'Invoice #': i.invoiceNumber || i.number || '—',
            Client: i.client?.companyName || i.client?.name || i.client?.contactPerson || i.client?.email || 'Unknown',
            Amount: i.totalAmount || i.total || i.amount || 0,
            Currency: i.currency || 'PKR',
            Status: i.status,
            'Due Date': i.dueDate ? new Date(i.dueDate).toISOString().slice(0, 10) : '—',
          })),
      },
      {
        name: 'Outstanding by Client',
        columns: ['Client', 'Outstanding', 'Invoices'],
        rows: Array.from(byClientOutstanding.values())
          .sort((a, b) => b.outstanding - a.outstanding)
          .map((r) => ({ Client: r.client, Outstanding: r.outstanding, Invoices: r.count })),
      },
      {
        name: 'Payment Gateway Breakdown',
        columns: ['Gateway', 'Revenue', 'Count'],
        rows: Object.values(byGateway)
          .sort((a, b) => b.revenue - a.revenue)
          .map((g) => ({ Gateway: g.gateway, Revenue: g.revenue, Count: g.count })),
      },
      {
        name: 'Revenue vs Collected (Monthly)',
        columns: ['Month', 'Invoiced', 'Collected'],
        rows: monthly.map((m, i) => ({
          Month: m.label,
          Invoiced: m.value,
          Collected: collectedMonthly[i].value,
        })),
      },
    ],
  }
}
