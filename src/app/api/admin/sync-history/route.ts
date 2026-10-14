import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

/**
 * GET /api/admin/sync-history?erpSlug=xxx&status=xxx&limit=50&offset=0
 *
 * Returns paginated SyncLog entries with optional filtering by erpSlug and status.
 * Includes total count for pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const { searchParams } = new URL(request.url)

    const erpSlug = searchParams.get('erpSlug') || undefined
    const status = searchParams.get('status') || undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    // Build the `where` clause
    const where: Record<string, unknown> = {}
    if (erpSlug) {
      where.erpSlug = erpSlug
    }
    if (status) {
      where.status = status
    }

    // Run count and data queries in parallel
    const [total, logs] = await Promise.all([
      withRetry((d) => d.syncLog.count({ where })),
      withRetry((d) =>
        d.syncLog.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
      ),
    ])

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + logs.length < total,
        },
      },
    })
  } catch (error) {
    console.error('[ADMIN-SYNC-HISTORY] Failed to fetch sync history:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sync history',
        data: { logs: [], pagination: { total: 0, limit: 50, offset: 0, hasMore: false } },
      },
      { status: 500 },
    )
  }
}