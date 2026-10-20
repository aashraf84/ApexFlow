import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/clients
//   ?search=                  Free-text search (companyName / contactPerson / email / phone)
//   &status=active|...       Status filter
//   &erpSlug=apparelflow     ERP slug filter
//   &sort=createdAt|companyName|status  (default: createdAt)
//   &order=desc|asc
//   &page=1
//   &pageSize=20
// ──────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'clients')
    if (!auth.ok) return auth.response

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') || '').trim()
    const status = url.searchParams.get('status') || 'all'
    const erpSlug = url.searchParams.get('erpSlug') || 'all'
    const sortRaw = url.searchParams.get('sort') || 'createdAt'
    const sort =
      sortRaw === 'companyName' || sortRaw === 'createdAt' || sortRaw === 'status'
        ? sortRaw
        : 'createdAt'
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('pageSize') || '20'))
    )

    // Build the WHERE clause
    const andClauses: Record<string, unknown>[] = []
    if (status && status !== 'all') {
      andClauses.push({ status })
    }
    if (erpSlug && erpSlug !== 'all') {
      andClauses.push({ erpSlug })
    }
    if (search) {
      andClauses.push({
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      })
    }
    const where: Record<string, unknown> = andClauses.length
      ? { AND: andClauses }
      : {}

    const [clients, total, stats, erpSystems] = await Promise.all([
      withRetry((tx) =>
        tx.client.findMany({
          where,
          include: {
            erpSystem: { select: { id: true, name: true, slug: true, color: true } },
            _count: {
              select: {
                deals: true,
                licenses: true,
                subscriptions: true,
                invoices: true,
                activities: true,
              },
            },
          },
          orderBy: { [sort]: order },
          skip: (page - 1) * pageSize,
          take: pageSize,
        })
      ),
      withRetry((tx) => tx.client.count({ where })),
      // System-wide stats — always show overall posture regardless of filter.
      withRetry(async (tx) => {
        const [active, prospect, churned, inactive, erpCountsAgg, totalClients] = await Promise.all([
          tx.client.count({ where: { status: 'active' } }),
          tx.client.count({ where: { status: 'prospect' } }),
          tx.client.count({ where: { status: 'churned' } }),
          tx.client.count({ where: { status: 'inactive' } }),
          tx.client.groupBy({
            by: ['erpSlug'],
            _count: { _all: true },
            orderBy: { _count: { id: 'desc' } },
          }),
          tx.client.count(),
        ])
        return { active, prospect, churned, inactive, erpCountsAgg, totalClients }
      }),
      // Distinct ERP systems for the filter dropdown.
      withRetry((tx) =>
        tx.erpSystem.findMany({
          where: { isActive: true },
          select: { id: true, name: true, slug: true, color: true },
          orderBy: { name: 'asc' },
        })
      ),
    ])

    // Compute "active subscriptions" per row via a second query, grouped by clientId.
    const clientIds = clients.map((c) => c.id)
    let activeSubsByClient: Record<string, number> = {}
    if (clientIds.length) {
      try {
        const subAgg = await withRetry((tx) =>
          tx.subscription.groupBy({
            by: ['clientId'],
            where: {
              clientId: { in: clientIds },
              status: 'active',
            },
            _count: { _all: true },
          })
        )
        activeSubsByClient = Object.fromEntries(
          subAgg
            .filter((s) => s.clientId)
            .map((s) => [s.clientId as string, s._count._all])
        )
      } catch (err) {
        console.warn('[Clients API] active sub count failed:', err)
      }
    }

    const data = clients.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      email: c.email,
      phone: c.phone,
      city: c.city,
      country: c.country,
      industry: c.industry,
      status: c.status,
      erpSlug: c.erpSlug,
      erpSystemId: c.erpSystemId,
      erpSystem: c.erpSystem,
      createdAt: c.createdAt.toISOString(),
      dealCount: c._count.deals,
      licenseCount: c._count.licenses,
      subscriptionCount: c._count.subscriptions,
      activeSubscriptionCount: activeSubsByClient[c.id] || 0,
      invoiceCount: c._count.invoices,
      activityCount: c._count.activities,
    }))

    // ERP breakdown for the filter dropdown (which ERPs actually have clients).
    const erpBreakdown = stats.erpCountsAgg
      .filter((e) => e.erpSlug)
      .map((e) => ({
        slug: e.erpSlug as string,
        count: e._count._all,
      }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      stats: {
        total: stats.totalClients,
        active: stats.active,
        prospect: stats.prospect,
        churned: stats.churned,
        inactive: stats.inactive,
      },
      erpSystems,
      erpBreakdown,
    })
  } catch (error) {
    console.error('[Admin Clients API] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// ──────────────────────────────────────────────────────────────────
// POST /api/admin/clients
// Create a new client (companyName + contactPerson + email required).
// ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'clients')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const required = ['companyName', 'contactPerson', 'email']
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const created = await withRetry((tx) =>
      tx.client.create({
        data: {
          companyName: body.companyName.trim(),
          contactPerson: body.contactPerson.trim(),
          email: body.email.trim(),
          phone: body.phone?.trim() || null,
          industry: body.industry?.trim() || null,
          status: body.status || 'trial',
          // Optional address/erp fields — passed through if provided.
          address: body.address ?? null,
          city: body.city ?? null,
          state: body.state ?? null,
          country: body.country ?? null,
          postalCode: body.postalCode ?? null,
          website: body.website ?? null,
          erpSlug: body.erpSlug ?? null,
          erpSystemId: body.erpSystemId ?? null,
          databaseName: body.databaseName ?? null,
          notes: body.notes ?? null,
        },
        include: {
          erpSystem: { select: { id: true, name: true, slug: true, color: true } },
        },
      })
    )

    // Best-effort: log a ClientActivity so the new client shows up in the feed.
    try {
      await withRetry((tx) =>
        tx.clientActivity.create({
          data: {
            clientId: created.id,
            type: 'note',
            subject: 'Client created',
            notes: JSON.stringify({
              action: 'client.create',
              companyName: created.companyName,
              contactPerson: created.contactPerson,
            }),
          },
        })
      )
    } catch (err) {
      console.warn('[Admin Clients API] create-activity failed:', err)
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: unknown) {
    console.error('[Admin Clients API] POST error:', error)
    const msg =
      error instanceof Error && error.message.includes('unique')
        ? 'Email already exists'
        : 'Failed to create client'
    const status =
      error instanceof Error && error.message.includes('unique') ? 409 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
