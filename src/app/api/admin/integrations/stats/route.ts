export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

// GET /api/admin/integrations/stats
// Returns aggregate metrics for the Integration Hub Overview dashboard.
export async function GET(request: Request) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  try {
    const [
      totalConnectors,
      connected,
      disconnected,
      error,
      autoSyncEnabled,
      totalClients,
      totalLicenses,
      totalErpDevices,
      syncLogsAgg,
      recentConnectors,
    ] = await Promise.all([
      withRetry((tx) => tx.integrationConnector.count()),
      withRetry((tx) => tx.integrationConnector.count({ where: { status: 'connected' } })),
      withRetry((tx) => tx.integrationConnector.count({ where: { status: 'disconnected' } })),
      withRetry((tx) => tx.integrationConnector.count({ where: { status: 'error' } })),
      withRetry((tx) => tx.integrationConnector.count({ where: { autoSync: true } })),
      withRetry((tx) => tx.client.count()),
      withRetry((tx) => tx.license.count()),
      withRetry((tx) => tx.erpDevice.count()),
      withRetry((tx) =>
        tx.syncLog.groupBy({
          by: ['status'],
          _count: { _all: true },
        })
      ),
      withRetry((tx) =>
        tx.integrationConnector.findMany({
          take: 8,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            erpName: true,
            erpSlug: true,
            status: true,
            latencyMs: true,
            lastSyncAt: true,
            clientCount: true,
            autoSync: true,
          },
        })
      ),
    ])

    const successCount = syncLogsAgg.find((s) => s.status === 'success')?._count._all ?? 0
    const failedCount = syncLogsAgg.find((s) => s.status === 'failed')?._count._all ?? 0
    const partialCount = syncLogsAgg.find((s) => s.status === 'partial')?._count._all ?? 0
    const totalSyncs = successCount + failedCount + partialCount

    return NextResponse.json({
      totalConnectors,
      connected,
      disconnected,
      error,
      autoSyncEnabled,
      totalClients,
      totalLicenses,
      totalDevices: totalErpDevices,
      totalSyncs,
      successfulSyncs: successCount,
      failedSyncs: failedCount + partialCount,
      recentConnectors,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load stats' },
      { status: 500 }
    )
  }
}
