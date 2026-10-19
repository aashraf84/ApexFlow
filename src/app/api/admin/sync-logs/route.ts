import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// Force Node.js runtime — these queries use Prisma features incompatible with Edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/sync-logs
 *
 * Lists SyncLog entries with optional filters + pagination, plus stats
 * cards (total syncs / successful / failed / partial today).
 *
 * Query params:
 *   page       — 1-based page number (default 1)
 *   limit      — page size, capped at 100 (default 20)
 *   status     — exact status filter (success | failed | partial | running | pending)
 *   direction  — exact direction filter (inbound | outbound | bidirectional)
 *   erpSlug    — filter by ERP slug
 *   search     — substring match on erpName or errorMessage (case-insensitive)
 *
 * Requires the `integrations` permission.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const status = searchParams.get('status') || undefined
    const direction = searchParams.get('direction') || undefined
    const erpSlug = searchParams.get('erpSlug') || undefined
    const search = searchParams.get('search') || undefined

    // Build the where clause.
    const andClauses: Record<string, unknown>[] = []
    if (status) andClauses.push({ status })
    if (direction) andClauses.push({ direction })
    if (erpSlug) andClauses.push({ erpSlug })
    if (search) {
      andClauses.push({
        OR: [
          { erpName: { contains: search, mode: 'insensitive' } },
          { erpSlug: { contains: search, mode: 'insensitive' } },
          { errorMessage: { contains: search, mode: 'insensitive' } },
        ],
      })
    }
    const where: Record<string, unknown> = andClauses.length ? { AND: andClauses } : {}

    // Stats boundaries (today = midnight local → equivalent to ISO gte).
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const skip = (page - 1) * limit
    const [
      logs,
      total,
      totalSyncs,
      successfulToday,
      failedToday,
      partialToday,
      erpSystems,
    ] = await Promise.all([
      withRetry((d) =>
        d.syncLog.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          take: limit,
          skip,
        }),
      ),
      withRetry((d) => d.syncLog.count({ where })),
      // Stats — system-wide (not filtered by the user's query).
      withRetry((d) =>
        d.syncLog.count({
          where: { startedAt: { gte: startOfToday } },
        }),
      ),
      withRetry((d) =>
        d.syncLog.count({
          where: {
            startedAt: { gte: startOfToday },
            status: 'success',
          },
        }),
      ),
      withRetry((d) =>
        d.syncLog.count({
          where: {
            startedAt: { gte: startOfToday },
            status: 'failed',
          },
        }),
      ),
      withRetry((d) =>
        d.syncLog.count({
          where: {
            startedAt: { gte: startOfToday },
            status: 'partial',
          },
        }),
      ),
      // List all ERP systems that have sync logs (for the filter dropdown).
      withRetry((d) =>
        d.syncLog.findMany({
          where: {},
          distinct: ['erpSlug'],
          select: { erpSlug: true, erpName: true },
          orderBy: { erpName: 'asc' },
          take: 100,
        }),
      ),
    ])

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          hasMore: skip + logs.length < total,
        },
        stats: {
          totalSyncsToday: totalSyncs,
          successfulToday,
          failedToday,
          partialToday,
        },
        erpSystems: erpSystems.map((s) => ({
          slug: s.erpSlug,
          name: s.erpName,
        })),
      },
    })
  } catch (error) {
    console.error('[ADMIN-SYNC-LOGS] Failed to fetch:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sync logs',
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
            totalSyncsToday: 0,
            successfulToday: 0,
            failedToday: 0,
            partialToday: 0,
          },
          erpSystems: [],
        },
      },
      { status: 500 },
    )
  }
}
