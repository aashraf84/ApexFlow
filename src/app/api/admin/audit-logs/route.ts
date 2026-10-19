import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// Force Node.js runtime — these queries use Prisma features incompatible with Edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/audit-logs
 *
 * Lists AdminAuditLog entries with optional filters + pagination, plus stats
 * cards (events today / this week / critical actions / failed logins).
 *
 * Query params:
 *   page       — 1-based page number (default 1)
 *   limit      — page size, capped at 100 (default 20)
 *   action     — exact action filter (e.g. "user.login")
 *   userId     — exact AdminUser id filter
 *   dateFrom   — ISO date (inclusive) lower bound on createdAt
 *   dateTo     — ISO date (inclusive) upper bound on createdAt
 *   search     — substring match on entityId OR action (case-insensitive)
 *
 * Audit logs are read-only — requires the `reports` permission.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const action = searchParams.get('action') || undefined
    const userId = searchParams.get('userId') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const search = searchParams.get('search') || undefined

    // Build the where clause — composed of AND conditions.
    const andClauses: Record<string, unknown>[] = []

    if (action) {
      andClauses.push({ action })
    }
    if (userId) {
      andClauses.push({ userId })
    }
    if (dateFrom || dateTo) {
      const range: Record<string, Date> = {}
      if (dateFrom) {
        const d = new Date(dateFrom)
        if (!isNaN(d.getTime())) range.gte = d
      }
      if (dateTo) {
        // Inclusive upper bound: add 1 day and treat as lt.
        const d = new Date(dateTo)
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + 1)
          range.lt = d
        }
      }
      if (Object.keys(range).length > 0) {
        andClauses.push({ createdAt: range })
      }
    }
    if (search) {
      andClauses.push({
        OR: [
          { action: { contains: search, mode: 'insensitive' } },
          { entityId: { contains: search, mode: 'insensitive' } },
          { entity: { contains: search, mode: 'insensitive' } },
        ],
      })
    }
    const where: Record<string, unknown> = andClauses.length
      ? { AND: andClauses }
      : {}

    // Run logs + total count + stats in parallel for efficiency.
    const skip = (page - 1) * limit

    const [logs, total, eventsToday, eventsThisWeek, criticalActions, failedLogins] =
      await Promise.all([
        withRetry((d) =>
          d.adminAuditLog.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
          }),
        ),
        withRetry((d) => d.adminAuditLog.count({ where })),
        // Stats — these are independent of the user filters (the cards always
        // reflect the overall system health, not the filtered subset).
        withRetry((d) =>
          d.adminAuditLog.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          }),
        ),
        withRetry((d) => {
          const now = new Date()
          const dayOfWeek = now.getDay() // 0 = Sun
          const monday = new Date(now)
          monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
          monday.setHours(0, 0, 0, 0)
          return d.adminAuditLog.count({
            where: { createdAt: { gte: monday } },
          })
        }),
        // Critical actions: anything that mutates state dangerously.
        withRetry((d) =>
          d.adminAuditLog.count({
            where: {
              OR: [
                { action: { contains: 'delete', mode: 'insensitive' } },
                { action: { contains: 'purge', mode: 'insensitive' } },
                { action: { contains: 'block', mode: 'insensitive' } },
                { action: { contains: 'critical', mode: 'insensitive' } },
                { action: { contains: 'danger', mode: 'insensitive' } },
                { action: { contains: 'revoke', mode: 'insensitive' } },
              ],
            },
          }),
        ),
        // Failed logins: any login action that ended in failure.
        withRetry((d) =>
          d.adminAuditLog.count({
            where: {
              AND: [
                { action: { contains: 'login', mode: 'insensitive' } },
                {
                  OR: [
                    { action: { contains: 'fail', mode: 'insensitive' } },
                    { details: { contains: 'fail', mode: 'insensitive' } },
                    { action: { contains: 'denied', mode: 'insensitive' } },
                  ],
                },
              ],
            },
          }),
        ),
      ])

    // Derive a `status` ("success" | "failure") from the action / details so
    // the client doesn't need to re-implement this logic.
    const enriched = logs.map((log) => {
      const haystack = `${log.action} ${log.details || ''}`.toLowerCase()
      const isFailure =
        haystack.includes('fail') ||
        haystack.includes('denied') ||
        haystack.includes('revoked') ||
        haystack.includes('error') ||
        haystack.includes('blocked')
      return {
        ...log,
        status: isFailure ? 'failure' : 'success',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        logs: enriched,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          hasMore: skip + logs.length < total,
        },
        stats: {
          eventsToday,
          eventsThisWeek,
          criticalActions,
          failedLogins,
        },
      },
    })
  } catch (error) {
    console.error('[ADMIN-AUDIT-LOGS] Failed to fetch:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs',
        data: {
          logs: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 1,
            hasMore: false,
          },
          stats: {
            eventsToday: 0,
            eventsThisWeek: 0,
            criticalActions: 0,
            failedLogins: 0,
          },
        },
      },
      { status: 500 },
    )
  }
}
