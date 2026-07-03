import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

type SyncAction = 'trigger' | 'enable-auto' | 'disable-auto'

interface SyncControlBody {
  action: SyncAction
  erpSlug: string
}

/**
 * POST /api/admin/sync-control
 *
 * Actions:
 * - "trigger": Creates a SyncLog with status "running", simulates a 1-2s sync,
 *   then updates to "success" with a random recordsSynced count.
 * - "enable-auto" / "disable-auto": Toggles IntegrationConnector.autoSync.
 */
export async function POST(request: NextRequest) {
  try {
    const body: SyncControlBody = await request.json()
    const { action, erpSlug } = body

    if (!action || !erpSlug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, erpSlug' },
        { status: 400 },
      )
    }

    if (!['trigger', 'enable-auto', 'disable-auto'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "trigger", "enable-auto", or "disable-auto"' },
        { status: 400 },
      )
    }

    // --- Enable / Disable auto-sync ---
    if (action === 'enable-auto' || action === 'disable-auto') {
      const autoSync = action === 'enable-auto'

      // Find the connector
      const existing = await db.integrationConnector.findFirst({
        where: { erpSlug },
      })

      if (!existing) {
        return NextResponse.json(
          { success: false, error: `No connector found for erpSlug "${erpSlug}"` },
          { status: 404 },
        )
      }

      const updated = await db.integrationConnector.update({
        where: { id: existing.id },
        data: { autoSync },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Auto-sync ${autoSync ? 'enabled' : 'disabled'} for ${erpSlug}`,
      })
    }

    // --- Trigger manual sync ---
    // Find connector for enrichment
    const connector = await db.integrationConnector.findFirst({
      where: { erpSlug },
    })

    const erpName = connector?.erpName ?? erpSlug
    const direction = connector?.direction ?? 'bidirectional'
    const erpSystemId = connector?.erpSystemId ?? null

    // Create a "running" SyncLog entry
    const syncLog = await db.syncLog.create({
      data: {
        erpSlug,
        erpName,
        erpSystemId,
        direction,
        status: 'running',
        syncType: 'manual',
        startedAt: new Date(),
      },
    })

    // Simulate sync work (1-2 seconds)
    const delayMs = 1000 + Math.random() * 1000
    await new Promise((resolve) => setTimeout(resolve, delayMs))

    // Generate random results
    const recordsSynced = Math.floor(50 + Math.random() * 500)
    const recordsFailed = Math.random() < 0.1 ? Math.floor(Math.random() * 5) : 0
    const finalStatus = recordsFailed > 0 ? 'partial' : 'success'
    const durationMs = Math.round(delayMs)

    // Update the SyncLog with results
    const updatedLog = await db.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: finalStatus,
        recordsSynced,
        recordsFailed,
        durationMs,
        completedAt: new Date(),
        ...(recordsFailed > 0
          ? { errorMessage: `${recordsFailed} record(s) failed to sync` }
          : {}),
      },
    })

    // Update the connector's lastSyncAt
    if (connector) {
      await db.integrationConnector.update({
        where: { id: connector.id },
        data: { lastSyncAt: new Date(), lastError: null },
      }).catch(() => {
        // Non-critical — don't fail the whole request
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedLog,
      message: `Sync completed for ${erpName}: ${recordsSynced} records synced in ${durationMs}ms`,
    })
  } catch (error) {
    console.error('[ADMIN-SYNC-CONTROL] Failed:', error)
    return NextResponse.json(
      { success: false, error: 'Sync control operation failed' },
      { status: 500 },
    )
  }
}