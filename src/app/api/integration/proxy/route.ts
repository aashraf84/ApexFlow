import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { testErpConnection } from '@/lib/erp-connector'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { connectorId, method, path, body: reqBody, headers } = body

    if (!connectorId || !method || !path) {
      return NextResponse.json(
        { success: false, message: 'connectorId, method, and path are required' },
        { status: 400 }
      )
    }

    // connectorId can be either a SyncConnector ID or an ERP slug
    // First try finding by SyncConnector ID
    let connector = await withRetry((db) =>
      db.syncConnector.findUnique({
        where: { id: connectorId },
        include: {
          erpSystem: { select: { id: true, name: true, slug: true } },
        },
      })
    ).catch(() => null)

    // If not found by ID, try finding by ERP slug
    if (!connector) {
      const erpSystem = await withRetry((db) =>
        db.erpSystem.findUnique({
          where: { slug: connectorId },
        })
      )

      if (!erpSystem) {
        return NextResponse.json(
          { success: false, message: `Connector/ERP "${connectorId}" not found` },
          { status: 404 }
        )
      }

      // Auto-create a SyncConnector for this ERP if one doesn't exist
      connector = await withRetry((db) =>
        db.syncConnector.create({
          data: {
            name: erpSystem.name,
            type: 'erp',
            status: erpSystem.status === 'active' ? 'active' : 'inactive',
            erpSystemId: erpSystem.id,
          },
          include: {
            erpSystem: { select: { id: true, name: true, slug: true } },
          },
        })
      ).catch(() => null)
    }

    if (!connector) {
      return NextResponse.json(
        { success: false, message: 'Could not find or create connector' },
        { status: 500 }
      )
    }

    if (connector.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Connector is not active' },
        { status: 400 }
      )
    }

    // Test the ERP database connection
    const erpSlug = connector.erpSystem?.slug || connectorId
    const connectionResult = await testErpConnection(erpSlug)

    // Log the proxy event
    await withRetry((db) =>
      db.syncEvent.create({
        data: {
          connectorId: connector!.id,
          eventType: 'proxy_request',
          status: connectionResult.connected ? 'completed' : 'failed',
          direction: 'outbound',
          payload: JSON.stringify({ method, path, body: reqBody, headers }),
          result: JSON.stringify({
            connected: connectionResult.connected,
            latency: connectionResult.latency,
            clientCount: connectionResult.clientCount,
          }),
          error: connectionResult.error || null,
        },
      })
    ).catch(() => { /* ignore logging failure */ })

    return NextResponse.json({
      success: true,
      data: {
        connector: {
          id: connector.id,
          name: connector.name,
          erpSystem: connector.erpSystem,
        },
        request: { method, path },
        connection: {
          connected: connectionResult.connected,
          latency: connectionResult.latency,
          clientCount: connectionResult.clientCount,
        },
        response: {
          status: connectionResult.connected ? 200 : 503,
          message: connectionResult.connected
            ? 'ERP database connection successful'
            : `ERP database connection failed: ${connectionResult.error || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    console.error('[INTEGRATION/PROXY] Failed:', error)
    return NextResponse.json(
      { success: false, message: 'Proxy request failed' },
      { status: 500 }
    )
  }
}
