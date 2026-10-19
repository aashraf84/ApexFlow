export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { withRetry } from '@/lib/db'
import { testConnection, testApiConnection, parseMapping } from '@/lib/erp-sync'

// POST /api/admin/integrations/[id]/test
// Tests the live connection for an existing connector (DB or API mode),
// updates the connector's status/latency/lastError, and returns the result.
// This is the backend for the "Test" button on each connector card.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params

    // Load the connector
    const connector = await withRetry((tx) =>
      tx.integrationConnector.findUnique({ where: { id } })
    )
    if (!connector) {
      return NextResponse.json(
        { connected: false, error: 'Connector not found' },
        { status: 404 }
      )
    }
    if (!connector.connectionUrl) {
      return NextResponse.json(
        { connected: false, error: 'No connection URL configured for this connector' },
        { status: 400 }
      )
    }

    // Determine mode: API if the schemaMapping says so, or if the URL is http(s)
    const mapping = parseMapping(connector.schemaMapping)
    const isApiMode = mapping?.mode === 'api' || /^https?:\/\//i.test(connector.connectionUrl)

    let result: { connected: boolean; latency?: number; error?: string }

    if (isApiMode) {
      // API mode: test the clients endpoint
      const endpoint = mapping?.clientsEndpoint || '/api/clients'
      result = await testApiConnection(
        connector.connectionUrl,
        connector.apiKey || undefined,
        endpoint
      )
    } else {
      // DB mode: neon() SELECT 1
      result = await testConnection(connector.connectionUrl)
    }

    // Persist the test result onto the connector
    const newStatus = result.connected ? 'connected' : 'error'
    await withRetry((tx) =>
      tx.integrationConnector.update({
        where: { id },
        data: {
          status: newStatus,
          latencyMs: result.latency ?? null,
          lastError: result.connected ? null : (result.error ?? 'Connection failed'),
        },
      })
    ).catch(() => {
      // Non-fatal: the test result is still returned to the caller even if the
      // status update fails (e.g. transient DB error).
    })

    return NextResponse.json({
      connected: result.connected,
      latency: result.latency,
      error: result.error,
      status: newStatus,
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Test failed',
      },
      { status: 500 }
    )
  }
}
