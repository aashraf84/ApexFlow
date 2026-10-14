import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

/**
 * GET /api/admin/integrations
 *
 * Returns all IntegrationConnectors with enriched data including
 * recent sync logs and associated webhook counts.
 */
export async function GET() {
  try {
    const connectors = await withRetry((d) =>
      d.integrationConnector.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true, status: true, color: true },
          },
        },
      }),
    )

    // Enrich each connector with the count of recent sync logs and webhook configs
    const enriched = await Promise.all(
      connectors.map(async (connector) => {
        const [syncCount, recentSync, webhookCount] = await Promise.all([
          withRetry((d) =>
            d.syncLog.count({
              where: { erpSlug: connector.erpSlug },
            }),
          ),
          withRetry((d) =>
            d.syncLog.findFirst({
              where: { erpSlug: connector.erpSlug },
              orderBy: { startedAt: 'desc' },
            }),
          ),
          withRetry((d) =>
            d.webhookConfig.count({
              where: { erpSlug: connector.erpSlug },
            }),
          ),
        ])

        return {
          ...connector,
          _syncCount: syncCount,
          _lastSync: recentSync || null,
          _webhookCount: webhookCount,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: enriched,
    })
  } catch (error) {
    console.error('[ADMIN-INTEGRATIONS] Failed to list integrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations', data: [] },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/integrations
 *
 * Creates a new IntegrationConnector.
 * Body: { erpSlug, erpName, type, direction, config?, autoSync?, syncInterval? }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const body = await request.json()
    const { erpSlug, erpName, erpSystemId, type, direction, config, connectionUrl, apiKey, schemaMapping, capabilities, autoSync, syncInterval } = body

    if (!erpSlug || !erpName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: erpSlug, erpName' },
        { status: 400 },
      )
    }

    // Check for duplicate slug
    const existing = await withRetry((d) =>
      d.integrationConnector.findFirst({ where: { erpSlug } }),
    )
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A connector for "${erpSlug}" already exists` },
        { status: 409 },
      )
    }

    const connector = await withRetry((d) =>
      d.integrationConnector.create({
        data: {
          erpSlug,
          erpName,
          erpSystemId: erpSystemId || null,
          type: type || 'database',
          direction: direction || 'bidirectional',
          config: config ? JSON.stringify(config) : null,
          connectionUrl: connectionUrl || null,
          apiKey: apiKey || null,
          schemaMapping: schemaMapping ? (typeof schemaMapping === 'string' ? schemaMapping : JSON.stringify(schemaMapping)) : null,
          capabilities: capabilities ? (typeof capabilities === 'string' ? capabilities : JSON.stringify(capabilities)) : null,
          autoSync: Boolean(autoSync),
          syncInterval: syncInterval || 300,
          status: connectionUrl ? 'disconnected' : 'disconnected',
        },
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true },
          },
        },
      }),
    )

    return NextResponse.json({ success: true, data: connector }, { status: 201 })
  } catch (error) {
    console.error('[ADMIN-INTEGRATIONS] Failed to create integration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/admin/integrations
 *
 * Updates an IntegrationConnector.
 * Body: { id, status?, autoSync?, syncInterval?, lastError? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const body = await request.json()
    const { id, erpName, erpSystemId, type, direction, config, connectionUrl, apiKey, schemaMapping, capabilities, status, autoSync, syncInterval, lastError } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Connector id is required' },
        { status: 400 },
      )
    }

    // Verify existence
    const existing = await withRetry((d) =>
      d.integrationConnector.findUnique({ where: { id } }),
    )
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Connector not found' },
        { status: 404 },
      )
    }

    // Build update payload
    const data: Record<string, unknown> = {}
    if (erpName !== undefined) data.erpName = erpName
    if (erpSystemId !== undefined) data.erpSystemId = erpSystemId || null
    if (type !== undefined) data.type = type
    if (direction !== undefined) data.direction = direction
    if (config !== undefined) data.config = config ? JSON.stringify(config) : null
    if (connectionUrl !== undefined) data.connectionUrl = connectionUrl || null
    if (apiKey !== undefined) data.apiKey = apiKey || null
    if (schemaMapping !== undefined) data.schemaMapping = schemaMapping ? (typeof schemaMapping === 'string' ? schemaMapping : JSON.stringify(schemaMapping)) : null
    if (capabilities !== undefined) data.capabilities = capabilities ? (typeof capabilities === 'string' ? capabilities : JSON.stringify(capabilities)) : null
    if (status !== undefined) data.status = status
    if (autoSync !== undefined) data.autoSync = Boolean(autoSync)
    if (syncInterval !== undefined) data.syncInterval = Number(syncInterval)
    if (lastError !== undefined) data.lastError = lastError || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    const updated = await withRetry((d) =>
      d.integrationConnector.update({
        where: { id },
        data,
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true, status: true, color: true },
          },
        },
      }),
    )

    // Enrich like GET
    const [syncCount, recentSync, webhookCount] = await Promise.all([
      withRetry((d) => d.syncLog.count({ where: { erpSlug: updated.erpSlug } })),
      withRetry((d) => d.syncLog.findFirst({ where: { erpSlug: updated.erpSlug }, orderBy: { startedAt: 'desc' } })),
      withRetry((d) => d.webhookConfig.count({ where: { erpSlug: updated.erpSlug } })),
    ])

    return NextResponse.json({
      success: true,
      data: { ...updated, _syncCount: syncCount, _lastSync: recentSync || null, _webhookCount: webhookCount },
    })
  } catch (error) {
    console.error('[ADMIN-INTEGRATIONS] Failed to update integration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/integrations
 *
 * Deletes an IntegrationConnector by id.
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Connector id is required' },
        { status: 400 },
      )
    }

    // Verify existence
    const existing = await withRetry((d) =>
      d.integrationConnector.findUnique({ where: { id } }),
    )
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Connector not found' },
        { status: 404 },
      )
    }

    await withRetry((d) => d.integrationConnector.delete({ where: { id } }))

    return NextResponse.json({
      success: true,
      message: `Connector for "${existing.erpSlug}" deleted`,
    })
  } catch (error) {
    console.error('[ADMIN-INTEGRATIONS] Failed to delete integration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete integration' },
      { status: 500 },
    )
  }
}