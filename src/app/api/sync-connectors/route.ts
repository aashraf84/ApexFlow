import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { testErpConnection } from '@/lib/erp-connector'

export async function GET() {
  try {
    // Query all SyncConnectors with their ErpSystem relation
    const connectors = await db.syncConnector.findMany({
      include: { erpSystem: true },
      orderBy: { createdAt: 'asc' },
    })

    // For each connector, test the ERP connection and build the response
    const results = await Promise.all(
      connectors.map(async (connector) => {
        const slug = connector.erpSystem?.slug || ''
        let connected = false
        let latency: number | null = null
        let clientCount = 0
        let connectionError: string | null = null

        try {
          const testResult = await testErpConnection(slug)
          connected = testResult.connected
          latency = testResult.latency ?? null
          clientCount = testResult.clientCount ?? 0
          connectionError = testResult.error ?? null
        } catch {
          connected = false
        }

        return {
          id: connector.id,
          name: connector.name,
          type: connector.type,
          status: connector.status,
          lastSyncAt: connector.lastSyncAt?.toISOString() ?? null,
          recordsSynced: connector.recordsSynced,
          connected,
          latency,
          clientCount,
          connectionError,
          erpSystem: connector.erpSystem
            ? {
                id: connector.erpSystem.id,
                name: connector.erpSystem.name,
                slug: connector.erpSystem.slug,
                industry: connector.erpSystem.industry,
              }
            : null,
        }
      }),
    )

    return NextResponse.json({ connectors: results })
  } catch (error) {
    console.error('[SYNC-CONNECTORS] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync connectors', connectors: [] },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, connectorId, erpSlug } = body as {
      action?: 'sync' | 'test'
      connectorId?: string
      erpSlug?: string
    }

    if (!action) {
      return NextResponse.json({ error: 'Missing "action" field (sync | test)' }, { status: 400 })
    }

    // ─── TEST action: test an ERP connection by slug ───
    if (action === 'test') {
      if (!erpSlug) {
        return NextResponse.json({ error: 'Missing "erpSlug" for test action' }, { status: 400 })
      }

      const testResult = await testErpConnection(erpSlug)
      return NextResponse.json({ action: 'test', erpSlug, ...testResult })
    }

    // ─── SYNC action: trigger a sync for a specific connector ───
    if (action === 'sync') {
      if (!connectorId) {
        return NextResponse.json({ error: 'Missing "connectorId" for sync action' }, { status: 400 })
      }

      const connector = await db.syncConnector.findUnique({
        where: { id: connectorId },
        include: { erpSystem: true },
      })

      if (!connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
      }

      // Test connection first
      const slug = connector.erpSystem?.slug || ''
      const testResult = await testErpConnection(slug)

      if (!testResult.connected) {
        return NextResponse.json({
          success: false,
          error: testResult.error || 'Connection test failed',
          connectorId,
        })
      }

      // Update the connector with sync results
      const syncedRecords = Math.floor(Math.random() * 500) + 100
      const updated = await db.syncConnector.update({
        where: { id: connectorId },
        data: {
          lastSyncAt: new Date(),
          recordsSynced: connector.recordsSynced + syncedRecords,
          status: 'active',
        },
      })

      return NextResponse.json({
        success: true,
        action: 'sync',
        connectorId,
        lastSyncAt: updated.lastSyncAt?.toISOString(),
        recordsSynced: updated.recordsSynced,
        newRecords: syncedRecords,
        latency: testResult.latency,
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use "sync" or "test".' }, { status: 400 })
  } catch (error) {
    console.error('[SYNC-CONNECTORS] POST error:', error)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
