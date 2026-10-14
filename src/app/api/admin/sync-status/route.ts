import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

/**
 * GET /api/admin/sync-status
 *
 * Returns:
 * - All IntegrationConnectors with their current status
 * - Recent 20 SyncLog entries
 * - Summary stats: totalConnectors, activeConnectors, totalSyncs, failedSyncs, avgLatencyMs
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const [connectors, recentSyncLogs, totalSyncs, failedSyncs] = await Promise.all([
      // All connectors
      withRetry((d) =>
        d.integrationConnector.findMany({
          orderBy: { updatedAt: 'desc' },
        }),
      ),

      // Recent 20 sync log entries
      withRetry((d) =>
        d.syncLog.findMany({
          orderBy: { startedAt: 'desc' },
          take: 20,
        }),
      ),

      // Total sync count
      withRetry((d) => d.syncLog.count()),

      // Failed sync count
      withRetry((d) =>
        d.syncLog.count({
          where: { status: 'failed' },
        }),
      ),
    ])

    // Compute summary stats
    const totalConnectors = connectors.length
    const activeConnectors = connectors.filter(
      (c) => c.status === 'connected' || c.status === 'syncing',
    ).length

    // Average latency from connectors that have a recorded latency
    const connectorsWithLatency = connectors.filter((c) => c.latencyMs != null && c.latencyMs > 0)
    const avgLatencyMs =
      connectorsWithLatency.length > 0
        ? Math.round(
            connectorsWithLatency.reduce((sum, c) => sum + (c.latencyMs ?? 0), 0) /
              connectorsWithLatency.length,
          )
        : 0

    return NextResponse.json({
      success: true,
      data: {
        connectors,
        recentSyncLogs,
        stats: {
          totalConnectors,
          activeConnectors,
          totalSyncs,
          failedSyncs,
          avgLatencyMs,
        },
      },
    })
  } catch (error) {
    console.error('[ADMIN-SYNC-STATUS] Failed to fetch sync status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sync status',
        data: { connectors: [], recentSyncLogs: [], stats: { totalConnectors: 0, activeConnectors: 0, totalSyncs: 0, failedSyncs: 0, avgLatencyMs: 0 } },
      },
      { status: 500 },
    )
  }
}