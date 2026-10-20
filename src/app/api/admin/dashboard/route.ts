import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// Force Node.js runtime — Prisma features incompatible with Edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
//
// Returns the full enterprise dashboard payload in ONE network round-trip:
//   • KPIs (6 cards): total clients, active subscriptions + MRR, revenue
//     this month, open support tickets + urgent count, connected ERPs /
//     total, synced licenses
//   • Revenue trend (last 6 months, successful payments only)
//   • Client growth (cumulative client count at end of each of last 6 months)
//   • Recent clients (latest 5)
//   • Recent sync activity (latest 5 SyncLogs)
//   • Integration health (all IntegrationConnectors)
//   • Recent activity feed (latest 8 AdminAuditLog entries with derived status)
//
// All queries run in parallel via Promise.all for performance. The route is
// read-only and gated by the `reports` permission.
// ──────────────────────────────────────────────────────────────────

const PAYMENT_SUCCESS_STATES = ['completed', 'success', 'paid']
const TICKET_OPEN_STATES = ['open', 'pending', 'in_progress', 'in-progress']

/** Returns the start-of-month Date for `monthsAgo` months back from now. */
function monthStart(monthsAgo: number): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1, 0, 0, 0, 0)
}

/** Short month label (e.g. "Jan", "Feb") for the month `monthsAgo` back. */
function monthLabel(monthsAgo: number): string {
  const d = monthStart(monthsAgo)
  return d.toLocaleString('en-US', { month: 'short' })
}

/** Status → "success" | "failure" derivation, mirroring /api/admin/audit-logs. */
function deriveStatus(action: string, details?: string | null): 'success' | 'failure' {
  const haystack = `${action} ${details || ''}`.toLowerCase()
  if (
    haystack.includes('fail') ||
    haystack.includes('denied') ||
    haystack.includes('revoked') ||
    haystack.includes('error') ||
    haystack.includes('blocked')
  ) {
    return 'failure'
  }
  return 'success'
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    // ── Compute month boundaries once ──
    const now = new Date()
    const thisMonthStart = monthStart(0)
    const lastMonthStart = monthStart(1)
    const lastMonthEnd = monthStart(0) // exclusive upper bound for last month
    const sixMonthsAgoStart = monthStart(5)

    // ── Parallel aggregate queries for the 6 KPI cards + trend data ──
    const [
      totalClients,
      newClientsThisMonth,
      newClientsLastMonth,
      activeSubscriptions,
      activeSubscriptionRows,
      revenueThisMonth,
      revenueLastMonth,
      openTickets,
      urgentTickets,
      connectedErps,
      totalErps,
      totalLicenses,
      paymentsLast6Months,
      clientsLast6Months,
      recentClients,
      recentSyncs,
      integrationHealth,
      recentActivity,
    ] = await Promise.all([
      // 1. Total clients (all-time)
      withRetry((d) => d.client.count()),
      // 2. New clients this month
      withRetry((d) =>
        d.client.count({ where: { createdAt: { gte: thisMonthStart } } }),
      ),
      // 3. New clients last month (for delta arrow)
      withRetry((d) =>
        d.client.count({
          where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } },
        }),
      ),
      // 4a. Active subscriptions count
      withRetry((d) => d.subscription.count({ where: { status: 'active' } })),
      // 4b. Active subscriptions rows (for MRR — monthlyFee normalized to monthly)
      withRetry((d) =>
        d.subscription.findMany({
          where: { status: 'active' },
          select: { monthlyFee: true, billingCycle: true, currency: true },
        }),
      ),
      // 5. Revenue this month (sum of successful payments)
      withRetry((d) =>
        d.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: { in: PAYMENT_SUCCESS_STATES },
            createdAt: { gte: thisMonthStart, lt: now },
          },
        }),
      ),
      // 6. Revenue last month (for trend arrow)
      withRetry((d) =>
        d.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: { in: PAYMENT_SUCCESS_STATES },
            createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
          },
        }),
      ),
      // 7. Open support tickets
      withRetry((d) =>
        d.supportTicket.count({ where: { status: { in: TICKET_OPEN_STATES } } }),
      ),
      // 8. Urgent priority tickets (still open)
      withRetry((d) =>
        d.supportTicket.count({
          where: {
            status: { in: TICKET_OPEN_STATES },
            priority: { in: ['urgent', 'critical', 'high'] },
          },
        }),
      ),
      // 9. Connected ERPs
      withRetry((d) =>
        d.integrationConnector.count({ where: { status: 'connected' } }),
      ),
      // 10. Total ERPs (IntegrationConnectors, not ErpSystem registry)
      withRetry((d) => d.integrationConnector.count()),
      // 11. Synced licenses
      withRetry((d) => d.license.count()),
      // 12. Successful payments in the last 6 months (for revenue trend)
      withRetry((d) =>
        d.payment.findMany({
          where: {
            status: { in: PAYMENT_SUCCESS_STATES },
            createdAt: { gte: sixMonthsAgoStart, lt: now },
          },
          select: { amount: true, currency: true, createdAt: true },
        }),
      ),
      // 13. Clients created in the last 6 months (used to derive cumulative growth)
      withRetry((d) =>
        d.client.findMany({
          where: { createdAt: { gte: sixMonthsAgoStart, lt: now } },
          select: { createdAt: true },
        }),
      ),
      // 14. Recent clients (latest 5) — name/company via aliases or fallbacks
      withRetry((d) =>
        d.client.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            name: true,
            company: true,
            erpSlug: true,
            status: true,
            createdAt: true,
          },
        }),
      ),
      // 15. Recent sync logs (latest 5)
      withRetry((d) =>
        d.syncLog.findMany({
          orderBy: { startedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            erpName: true,
            erpSlug: true,
            direction: true,
            status: true,
            recordsSynced: true,
            recordsFailed: true,
            durationMs: true,
            startedAt: true,
            completedAt: true,
          },
        }),
      ),
      // 16. Integration health (all connectors)
      withRetry((d) =>
        d.integrationConnector.findMany({
          orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
          select: {
            id: true,
            erpName: true,
            erpSlug: true,
            status: true,
            latencyMs: true,
            lastSyncAt: true,
            autoSync: true,
            syncInterval: true,
            clientCount: true,
            lastError: true,
          },
        }),
      ),
      // 17. Recent activity (latest 8 AdminAuditLog)
      withRetry((d) =>
        d.adminAuditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            userId: true,
            action: true,
            module: true,
            entity: true,
            entityId: true,
            details: true,
            ipAddress: true,
            createdAt: true,
          },
        }),
      ),
    ])

    // ── MRR (Monthly Recurring Revenue) normalization ──
    // annual plans → monthlyFee / 12 ; monthly / other cycles → monthlyFee as-is.
    let mrr = 0
    let mrrCurrency = 'PKR'
    for (const sub of activeSubscriptionRows) {
      const monthly =
        sub.billingCycle === 'annual' ? (sub.monthlyFee || 0) / 12 : sub.monthlyFee || 0
      mrr += monthly
      if (sub.currency) mrrCurrency = sub.currency
    }

    // ── Revenue trend (last 6 months) ──
    // buckets[i] = revenue for month (5 - i) ago → i=0 is oldest, i=5 is current month
    const revenueByMonth: number[] = [0, 0, 0, 0, 0, 0]
    for (const pmt of paymentsLast6Months) {
      const created = new Date(pmt.createdAt)
      for (let i = 0; i < 6; i++) {
        const start = monthStart(5 - i)
        const end = i === 5 ? now : monthStart(5 - i - 1)
        if (created >= start && created < end) {
          revenueByMonth[i] += pmt.amount
          break
        }
      }
    }
    const revenueTrend = revenueByMonth.map((revenue, i) => ({
      month: monthLabel(5 - i),
      revenue: Math.round(revenue * 100) / 100,
    }))

    // ── Client growth (cumulative client count at end of each of last 6 months) ──
    // For each month, count = totalClients - (clients created AFTER month end).
    const clientsAfterMonthEnd: number[] = [0, 0, 0, 0, 0, 0]
    for (const c of clientsLast6Months) {
      const created = new Date(c.createdAt)
      for (let i = 0; i < 6; i++) {
        // month end for month (5 - i) ago = monthStart(5 - i - 1) = monthStart(4 - i)
        const end = i === 5 ? now : monthStart(5 - i - 1)
        if (created >= end) {
          clientsAfterMonthEnd[i]++
        }
      }
    }
    const clientGrowth = clientsAfterMonthEnd.map((after, i) => ({
      month: monthLabel(5 - i),
      count: Math.max(0, totalClients - after),
    }))

    // ── Recent clients — normalize aliases ──
    const recentClientsPayload = recentClients.map((c) => ({
      id: c.id,
      name: c.name || c.contactPerson || c.companyName || 'Unknown',
      company: c.company || c.companyName || c.contactPerson || '—',
      erpSlug: c.erpSlug || null,
      status: c.status || 'trial',
      createdAt: c.createdAt.toISOString(),
    }))

    // ── Recent syncs ──
    const recentSyncsPayload = recentSyncs.map((s) => ({
      id: s.id,
      erpName: s.erpName,
      direction: s.direction,
      status: s.status,
      recordsSynced: s.recordsSynced,
      recordsFailed: s.recordsFailed,
      durationMs: s.durationMs,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt ? s.completedAt.toISOString() : null,
    }))

    // ── Integration health ──
    const integrationHealthPayload = integrationHealth.map((c) => ({
      id: c.id,
      erpName: c.erpName,
      erpSlug: c.erpSlug,
      status: c.status,
      latencyMs: c.latencyMs,
      lastSyncAt: c.lastSyncAt ? c.lastSyncAt.toISOString() : null,
      autoSync: c.autoSync,
      syncInterval: c.syncInterval,
      clientCount: c.clientCount,
      lastError: c.lastError,
    }))

    // ── Recent activity — join AdminUser names client-side ──
    const auditUserIds = Array.from(
      new Set(recentActivity.map((a) => a.userId).filter(Boolean) as string[]),
    )
    let auditUserRows: { id: string; name: string; email: string }[] = []
    if (auditUserIds.length > 0) {
      try {
        auditUserRows = await withRetry((d) =>
          d.adminUser.findMany({
            where: { id: { in: auditUserIds } },
            select: { id: true, name: true, email: true },
          }),
        )
      } catch {
        // graceful — fall back to "System"
      }
    }
    const userMap = new Map<string, { name: string; email: string }>(
      auditUserRows.map((u) => [u.id, { name: u.name, email: u.email }]),
    )
    const recentActivityPayload = recentActivity.map((a) => {
      const u = a.userId ? userMap.get(a.userId) : undefined
      return {
        id: a.id,
        user: u?.name || u?.email || 'System',
        action: a.action,
        module: a.module,
        entity: a.entity,
        entityId: a.entityId,
        ipAddress: a.ipAddress,
        createdAt: a.createdAt.toISOString(),
        status: deriveStatus(a.action, a.details),
      }
    })

    // ── Trend % deltas for KPI cards ──
    const revenuePrev = revenueLastMonth._sum.amount || 0
    const revenueNow = revenueThisMonth._sum.amount || 0
    const revenueDeltaPct =
      revenuePrev === 0
        ? revenueNow > 0
          ? 100
          : 0
        : Math.round(((revenueNow - revenuePrev) / revenuePrev) * 100)

    const clientsPrev = newClientsLastMonth
    const clientsNow = newClientsThisMonth
    const clientsDeltaPct =
      clientsPrev === 0
        ? clientsNow > 0
          ? 100
          : 0
        : Math.round(((clientsNow - clientsPrev) / clientsPrev) * 100)

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalClients: {
            value: totalClients,
            delta: newClientsThisMonth,
            deltaPct: clientsDeltaPct,
          },
          activeSubscriptions: {
            value: activeSubscriptions,
            mrr: Math.round(mrr * 100) / 100,
            currency: mrrCurrency,
          },
          revenueThisMonth: {
            value: Math.round(revenueNow * 100) / 100,
            currency: 'PKR',
            deltaPct: revenueDeltaPct,
            previous: Math.round(revenuePrev * 100) / 100,
          },
          openTickets: {
            value: openTickets,
            urgent: urgentTickets,
          },
          connectedErps: {
            connected: connectedErps,
            total: totalErps,
          },
          syncedLicenses: {
            value: totalLicenses,
          },
        },
        revenueTrend,
        clientGrowth,
        recentClients: recentClientsPayload,
        recentSyncs: recentSyncsPayload,
        integrationHealth: integrationHealthPayload,
        recentActivity: recentActivityPayload,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[ADMIN-DASHBOARD] Failed to fetch dashboard data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        data: null,
      },
      { status: 500 },
    )
  }
}
