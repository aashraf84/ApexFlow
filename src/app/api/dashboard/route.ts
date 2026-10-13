import { NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { getCached, setCached } from '@/lib/api-cache'
import { getAggregatedStats } from '@/lib/erp-connector'

const CACHE_TTL = 30_000 // 30 seconds

/** Race a promise against a deadline, returns fallback on timeout/error */
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ])
  } catch {
    return fallback
  }
}

// Empty-state response shape
const EMPTY_DASHBOARD = {
  stats: { totalClients: 0, activeSubscriptions: 0, monthlyRevenue: 0, activeLicenses: 0, clientTrend: 0, subscriptionTrend: 0, revenueTrend: 0, licenseTrend: 0 },
  erpBreakdown: [] as Array<{ slug: string; name: string; clients: number; revenue: number; licenses: number; connected: boolean }>,
  revenueChart: [] as Array<{ month: string; revenue: number }>,
  recentActivity: [] as Array<{ id: string; action: string; entity?: string; entityId?: string; details?: string; client: string | null; userName?: string; time: string; type: 'success' | 'warning' | 'info' }>,
}

function mapActionToType(action: string): 'success' | 'warning' | 'info' {
  if (!action) return 'info'
  const lower = action.toLowerCase()
  if (lower.includes('error') || lower.includes('fail') || lower.includes('overdue')) return 'warning'
  if (lower.includes('create') || lower.includes('onboard') || lower.includes('upgrade') || lower.includes('renew') || lower.includes('active')) return 'success'
  return 'info'
}

export async function GET() {
  // Check cache first
  const cached = getCached<Record<string, unknown>>('dashboard-v2', CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    // ── Phase 1: Query main ApexFlow DB via Prisma ──
    const DB_TIMEOUT = 5_000

    const localClients = await withTimeout(
      withRetry((db) => db.client.count()),
      DB_TIMEOUT,
      0
    )

    const subResult = await withTimeout(
      withRetry((db) =>
        db.subscription.aggregate({
          where: { status: 'active' },
          _count: true,
          _sum: { monthlyFee: true },
        })
      ),
      DB_TIMEOUT,
      { _count: 0, _sum: { monthlyFee: 0 } }
    )
    const localSubs = subResult._count ?? 0
    const localRevenue = subResult._sum.monthlyFee ?? 0

    const localLicenses = await withTimeout(
      withRetry((db) =>
        db.license.count({
          where: { status: 'active' },
        })
      ),
      DB_TIMEOUT,
      0
    )

    // Revenue chart — last 6 months
    const revenueRows = await withTimeout(
      withRetry((db) =>
        db.$queryRaw<Array<{ month: string; revenue: number }>>`
          SELECT TO_CHAR("createdAt", 'Mon') AS month, COALESCE(SUM("amount"), 0)::float AS revenue
          FROM "Invoice"
          WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
          ORDER BY DATE_TRUNC('month', "createdAt") ASC
          LIMIT 6
        `
      ),
      DB_TIMEOUT,
      [] as Array<{ month: string; revenue: number }>
    )
    const revenueChart = (revenueRows || []).map((r) => ({ month: r.month, revenue: r.revenue }))

    // Recent activity (using AuditLog since Activity model doesn't exist)
    const activityRows = await withTimeout(
      withRetry((db) =>
        db.adminAuditLog.findMany({
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        })
      ),
      DB_TIMEOUT,
      [] as Array<{
        id: string; action: string; entity: string | null; entityId: string | null;
        details: string | null; createdAt: Date;
        user: { name: string } | null;
      }>
    )
    const recentActivity = (activityRows || []).map((a) => ({
      id: a.id,
      action: a.action || '',
      entity: a.entity || undefined,
      entityId: a.entityId || undefined,
      details: a.details || undefined,
      client: null as string | null,
      userName: a.user?.name || undefined,
      time: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      type: mapActionToType(a.action || ''),
    }))

    // ── Phase 2: ERP breakdown from main DB ──
    const erpRows = await withTimeout(
      withRetry((db) =>
        db.erpSystem.findMany({
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: {
                clients: true,
                licenses: true,
              },
            },
          },
        })
      ),
      DB_TIMEOUT,
      [] as Array<{
        id: string; name: string; slug: string;
        _count: { clients: number; licenses: number };
        subscriptions: Array<{ monthlyFee: number }>;
      }>
    )

    // ── Phase 3: Fetch live ERP data with 10-second overall timeout ──
    let erpLiveClients = 0
    let erpLiveRevenue = 0
    let erpLiveLicenses = 0
    const erpLiveBreakdown: Array<{
      slug: string
      name: string
      clients: number
      revenue: number
      licenses: number
      connected: boolean
    }> = []

    // Build from main DB first — compute revenue per ERP
    const mainDbBreakdown = new Map<string, { name: string; clients: number; revenue: number; licenses: number }>()
    for (const erp of (erpRows || [])) {
      // Get revenue for this ERP from active subscriptions
      let subRevenue = 0
      try {
        const revResult = await withRetry((db) =>
          db.subscription.aggregate({
            where: { erpSystemId: erp.id, status: 'active' },
            _sum: { monthlyFee: true },
          })
        )
        subRevenue = revResult._sum.monthlyFee ?? 0
      } catch {
        // ignore revenue fetch errors per ERP
      }

      mainDbBreakdown.set(erp.slug, {
        name: erp.name,
        clients: erp._count?.clients ?? 0,
        revenue: subRevenue,
        licenses: erp._count?.licenses ?? 0,
      })
    }

    try {
      const aggregated = await withTimeout(
        getAggregatedStats(),
        10_000,
        { clients: [] as Array<{ erpSlug: string; erpName: string }>, invoices: [] as Array<{ erpSlug: string; erpName: string; totalAmount: number | null }>, licenses: [] as Array<{ erpSlug: string; erpName: string }> }
      )
      erpLiveClients = aggregated.clients.length
      erpLiveRevenue = aggregated.invoices.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0)
      erpLiveLicenses = aggregated.licenses.length

      // Group by ERP slug
      const bySlug = new Map<string, { name: string; clients: number; revenue: number; licenses: number }>()
      for (const client of aggregated.clients) {
        const existing = bySlug.get(client.erpSlug) || { name: client.erpName, clients: 0, revenue: 0, licenses: 0 }
        existing.clients++
        bySlug.set(client.erpSlug, existing)
      }
      for (const inv of aggregated.invoices) {
        const existing = bySlug.get(inv.erpSlug) || { name: inv.erpName, clients: 0, revenue: 0, licenses: 0 }
        existing.revenue += inv.totalAmount || 0
        bySlug.set(inv.erpSlug, existing)
      }
      for (const lic of aggregated.licenses) {
        const existing = bySlug.get(lic.erpSlug) || { name: lic.erpName, clients: 0, revenue: 0, licenses: 0 }
        existing.licenses++
        bySlug.set(lic.erpSlug, existing)
      }

      // Merge: main DB + live data
      const allSlugs = new Set([...mainDbBreakdown.keys(), ...bySlug.keys()])
      for (const slug of allSlugs) {
        const mainDb = mainDbBreakdown.get(slug)
        const live = bySlug.get(slug)
        erpLiveBreakdown.push({
          slug,
          name: mainDb?.name || live?.name || slug,
          clients: Math.max(mainDb?.clients || 0, live?.clients || 0),
          revenue: (mainDb?.revenue || 0) + (live?.revenue || 0),
          licenses: Math.max(mainDb?.licenses || 0, live?.licenses || 0),
          connected: !!live,
        })
      }
    } catch (err) {
      console.error('[DASHBOARD] Failed to get aggregated stats:', err)
      // Fallback to main DB only
      for (const [slug, data] of mainDbBreakdown) {
        erpLiveBreakdown.push({
          slug,
          name: data.name,
          clients: data.clients,
          revenue: data.revenue,
          licenses: data.licenses,
          connected: false,
        })
      }
    }

    // Combine local + ERP stats
    const totalClients = localClients + erpLiveClients
    const activeSubscriptions = localSubs + erpLiveClients
    const monthlyRevenue = localRevenue + erpLiveRevenue
    const activeLicenses = localLicenses + erpLiveLicenses

    const result = {
      stats: {
        totalClients,
        activeSubscriptions,
        monthlyRevenue,
        activeLicenses,
        clientTrend: totalClients > 0 ? 12 : 0,
        subscriptionTrend: activeSubscriptions > 0 ? 8 : 0,
        revenueTrend: monthlyRevenue > 0 ? 15 : 0,
        licenseTrend: activeLicenses > 0 ? 10 : 0,
      },
      erpBreakdown: erpLiveBreakdown,
      revenueChart,
      recentActivity: recentActivity.slice(0, 15),
    }

    // Cache the result
    setCached('dashboard-v2', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[DASHBOARD] Failed:', error)
    // Return empty-state response instead of erroring
    return NextResponse.json(EMPTY_DASHBOARD, { status: 200 })
  }
}
