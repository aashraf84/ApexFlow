import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/subscriptions — list subscriptions with filters
// Query params: status, plan, search
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const plan = searchParams.get('plan') || ''
    const search = (searchParams.get('search') || '').trim().toLowerCase()

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (plan && plan !== 'all') where.plan = plan

    if (search) {
      where.OR = [
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { contactPerson: { contains: search, mode: 'insensitive' } } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
        { plan: { contains: search, mode: 'insensitive' } },
      ]
    }

    const subscriptions = await withRetry((d) =>
      d.subscription.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              name: true,
              email: true,
              phone: true,
              company: true,
              status: true,
              industry: true,
              country: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              price: true,
              billingCycle: true,
              plan: true,
              currency: true,
            },
          },
          erpSystem: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
    )

    // Compute stats from all subscriptions
    const allSubs = await withRetry((d) =>
      d.subscription.findMany({
        select: {
          status: true,
          monthlyFee: true,
          currency: true,
          plan: true,
          billingCycle: true,
          package: { select: { price: true } },
        },
      })
    )

    let mrr = 0
    const counts: Record<string, number> = {
      active: 0,
      trial: 0,
      past_due: 0,
      cancelled: 0,
      expired: 0,
      paused: 0,
    }
    const planCounts: Record<string, number> = {}

    for (const s of allSubs) {
      if (s.status === 'active' || s.status === 'past_due') {
        const pkgPrice = s.package?.price ?? s.monthlyFee ?? 0
        const cycle = (s.billingCycle || 'monthly').toLowerCase()
        mrr += cycle === 'annual' || cycle === 'yearly' ? pkgPrice / 12 : pkgPrice
      }
      counts[s.status] = (counts[s.status] || 0) + 1
      planCounts[s.plan] = (planCounts[s.plan] || 0) + 1
    }

    return NextResponse.json({
      subscriptions,
      stats: {
        mrr,
        active: counts.active || 0,
        trial: counts.trial || 0,
        pastDue: counts.past_due || 0,
        cancelled: counts.cancelled || 0,
        expired: counts.expired || 0,
        total: allSubs.length,
        byPlan: planCounts,
      },
    })
  } catch (error) {
    console.error('[ADMIN-SUBSCRIPTIONS] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions', subscriptions: [], stats: null },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/subscriptions — update a subscription (cancel, change plan, update status)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { id, action, status, plan, packageId, endDate } = body as {
      id?: string
      action?: 'cancel' | 'change_plan' | 'update_status'
      status?: string
      plan?: string
      packageId?: string
      endDate?: string
    }

    if (!id) {
      return NextResponse.json({ error: 'Subscription id is required' }, { status: 400 })
    }

    const existing = await withRetry((d) =>
      d.subscription.findUnique({ where: { id }, include: { package: true } })
    )
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}

    if (action === 'cancel' || status === 'cancelled') {
      data.status = 'cancelled'
      data.endDate = new Date()
    } else if (action === 'change_plan') {
      if (packageId) {
        const pkg = await withRetry((d) => d.package.findUnique({ where: { id: packageId } }))
        if (!pkg) {
          return NextResponse.json({ error: 'Package not found' }, { status: 404 })
        }
        data.packageId = pkg.id
        data.plan = pkg.plan || 'starter'
        data.monthlyFee = pkg.price
        data.billingCycle = pkg.billingCycle || 'monthly'
        data.currency = pkg.currency || 'PKR'
      } else if (plan) {
        data.plan = plan
      }
    } else if (status) {
      data.status = status
    }

    if (endDate) data.endDate = new Date(endDate)

    const updated = await withRetry((d) =>
      d.subscription.update({ where: { id }, data })
    )

    return NextResponse.json({ subscription: updated })
  } catch (error) {
    console.error('[ADMIN-SUBSCRIPTIONS] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
