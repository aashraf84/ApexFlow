import { NextRequest, NextResponse } from 'next/server'
import { testErpConnection, getAggregatedStats } from '@/lib/erp-connector'
import { getCached, setCached } from '@/lib/api-cache'
import { db } from '@/lib/db'

// ERP display metadata — single source of truth for integration cards
const ERP_META: Record<string, {
  name: string
  type: string
  website: string
  icon: string
  color: string
}> = {
  apparelflow: { name: 'ApparelFlow', type: 'bidirectional', website: 'https://apparelflow.vercel.app', icon: 'shirt', color: 'teal' },
  hotelflow:   { name: 'HotelFlow',   type: 'bidirectional', website: 'https://hotelflow.vercel.app', icon: 'hotel', color: 'amber' },
  eduflow:     { name: 'EduFlow',     type: 'bidirectional', website: 'https://edutrackflow.vercel.app', icon: 'graduation', color: 'emerald' },
  martflow:    { name: 'MartFlow',    type: 'bidirectional', website: 'https://martflow.vercel.app', icon: 'shopping', color: 'yellow' },
  pharmaflow:  { name: 'PharmaFlow',  type: 'bidirectional', website: 'https://pharmaflowerp.vercel.app', icon: 'pill', color: 'red' },
  buildflow:   { name: 'BuildFlow',   type: 'bidirectional', website: 'https://github.com/apexflowerp/BuildFlow', icon: 'hardhat', color: 'orange' },
  travelflow:  { name: 'TravelFlow',  type: 'bidirectional', website: 'https://github.com/apexflowerp/travelflow', icon: 'plane', color: 'cyan' },
  tenantflow:  { name: 'TenantFlow',  type: 'bidirectional', website: 'https://github.com/apexflowerp/tenantflow', icon: 'building', color: 'pink' },
  factoryflow: { name: 'FactoryFlow', type: 'bidirectional', website: 'https://github.com/apexflowerp/FactoryFlow', icon: 'factory', color: 'lime' },
  foodflow:    { name: 'FoodFlow',    type: 'bidirectional', website: 'https://github.com/apexflowerp/FoodFlow', icon: 'utensils', color: 'rose' },
  autoflow:    { name: 'AutoFlow',    type: 'bidirectional', website: 'https://autoflow-inky.vercel.app', icon: 'wrench', color: 'sky' },
  healthflow:  { name: 'HealthFlow',  type: 'bidirectional', website: 'https://healthflowerp.vercel.app', icon: 'heart', color: 'fuchsia' },
  textileflow: { name: 'TextileFlow', type: 'bidirectional', website: 'https://textileflowerp.vercel.app', icon: 'textcursor', color: 'violet' },
  creativeflow:{ name: 'CreativeFlow',type: 'bidirectional', website: 'https://creativeflowerp.vercel.app', icon: 'palette', color: 'pink' },
  distriflow:  { name: 'DistriFlow',  type: 'bidirectional', website: 'https://github.com/apexflowerp/DistriFlow', icon: 'route', color: 'amber' },
  logisticflow: { name: 'LogisticFlow', type: 'bidirectional', website: 'https://github.com/apexflowerp/LogisticFlow', icon: 'truck', color: 'green' },
  fleetflow:    { name: 'FleetFlow',    type: 'bidirectional', website: 'https://fleetflow.vercel.app', icon: 'compass', color: 'cyan' },
  electroflow:  { name: 'ElectroFlow',  type: 'bidirectional', website: 'https://electroflowerp.vercel.app', icon: 'zap', color: 'emerald' },
  bookflow:     { name: 'BookFlow',     type: 'bidirectional', website: 'https://github.com/apexflowerp/BookFlow', icon: 'book-open', color: 'violet' },
  fuelflow:     { name: 'FuelFlow',     type: 'bidirectional', website: 'https://github.com/apexflowerp/FuelFlow', icon: 'fuel', color: 'orange' },
}

export async function GET() {
  // Check cache first (10s TTL for more real-time feel)
  const cached = getCached<Record<string, unknown>>('integrations-v2', 10_000)
  if (cached) {
    return NextResponse.json(cached)
  }

  const slugs = Object.keys(ERP_META)

  try {
    // Test each ERP connection in parallel — Promise.allSettled ensures
    // individual failures don't break the entire response
    const connectionResults = await Promise.allSettled(
      slugs.map(async (slug) => {
        const meta = ERP_META[slug]
        try {
          const conn = await testErpConnection(slug)
          return {
            id: `erp-${slug}`,
            slug,
            name: meta.name,
            erpName: meta.name,
            type: meta.type,
            status: conn.connected ? 'active' : 'error',
            icon: meta.icon,
            color: meta.color,
            website: meta.website,
            connected: conn.connected,
            latency: conn.latency ?? null,
            connectionError: conn.error ?? null,
            clientCount: conn.clientCount ?? 0,
            lastSyncAt: null as string | null,
            syncCount: 0,
            errorCount: 0,
            tenantCount: conn.clientCount ?? 0,
            recentEvents: [] as { id: string; eventType: string; status: string; createdAt: string }[],
          }
        } catch (err) {
          // Fallback to disconnected with specific error message
          const errMsg = err instanceof Error ? err.message : String(err)
          let connectionError = 'Database unreachable — check configuration'
          if (errMsg.includes('timeout') || errMsg.includes('Timeout')) {
            connectionError = 'Connection timed out — database may be unreachable'
          } else if (errMsg.includes('schema') || errMsg.includes('table') || errMsg.includes('column')) {
            connectionError = 'Schema mismatch — table not found'
          } else if (errMsg.includes('auth') || errMsg.includes('password') || errMsg.includes('credential')) {
            connectionError = 'Authentication failed — check database credentials'
          } else if (errMsg.includes('ENOTFOUND') || errMsg.includes('DNS')) {
            connectionError = 'Host not found — check database URL configuration'
          } else if (errMsg.includes('ECONNREFUSED')) {
            connectionError = 'Connection refused — database server is not accepting connections'
          }
          return {
            id: `erp-${slug}`,
            slug,
            name: meta.name,
            erpName: meta.name,
            type: meta.type,
            status: 'error',
            icon: meta.icon,
            color: meta.color,
            website: meta.website,
            connected: false,
            latency: null as number | null,
            connectionError,
            clientCount: 0,
            lastSyncAt: null as string | null,
            syncCount: 0,
            errorCount: 0,
            tenantCount: 0,
            recentEvents: [] as { id: string; eventType: string; status: string; createdAt: string }[],
          }
        }
      })
    )

    // Build connectors from results — allSettled guarantees every result is present
    const connectors = connectionResults.map((result, i) => {
      const slug = slugs[i]
      const meta = ERP_META[slug]
      if (result.status === 'fulfilled') {
        return result.value
      }
      // Promise rejected — disconnected fallback (should be rare given inner try/catch)
      return {
        id: `erp-${slug}`,
        slug,
        name: meta.name,
        erpName: meta.name,
        type: meta.type,
        status: 'error',
        icon: meta.icon,
        color: meta.color,
        website: meta.website,
        connected: false,
        latency: null as number | null,
        connectionError: 'Database unreachable — check configuration',
        clientCount: 0,
        lastSyncAt: null as string | null,
        syncCount: 0,
        errorCount: 0,
        tenantCount: 0,
        recentEvents: [] as { id: string; eventType: string; status: string; createdAt: string }[],
      }
    })

    const activeCount = connectors.filter((c: any) => c.connected).length
    const errorCount = connectors.filter((c: any) => !c.connected).length

    // Get basic totals from connected ERPs
    const totalClients = connectors.reduce((sum: number, c: any) => sum + (c.clientCount || 0), 0)

    // Fetch aggregated stats (revenue + licenses) with 10s timeout
    let totalRevenue = 0
    let totalLicenses = 0
    try {
      const stats = await Promise.race([
        getAggregatedStats(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Aggregated stats timeout')), 10_000)
        ),
      ])
      totalRevenue = stats.totalRevenue || 0
      totalLicenses = stats.activeLicenses || 0
    } catch (statsErr) {
      console.warn('[INTEGRATIONS] getAggregatedStats failed or timed out:', statsErr instanceof Error ? statsErr.message : statsErr)
    }

    const result = {
      connectors,
      summary: {
        total: connectors.length,
        active: activeCount,
        error: errorCount,
        totalClients,
        totalRevenue,
        totalLicenses,
      },
    }

    // Cache the result
    setCached('integrations-v2', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[INTEGRATIONS] Failed:', error)
    return NextResponse.json(
      { connectors: [], summary: { total: 0, active: 0, error: 0, totalClients: 0, totalRevenue: 0, totalLicenses: 0 } },
      { status: 200 }
    )
  }
}

// ─── POST handler for integration actions ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, erpSlug } = body as {
      action?: 'sync' | 'test'
      erpSlug?: string
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Missing "action" field. Use "sync" or "test".' },
        { status: 400 }
      )
    }

    // ─── TEST action: test the specific ERP connection ───
    if (action === 'test') {
      if (!erpSlug) {
        return NextResponse.json(
          { error: 'Missing "erpSlug" for test action' },
          { status: 400 }
        )
      }

      const meta = ERP_META[erpSlug]
      if (!meta) {
        return NextResponse.json(
          { error: `Unknown ERP slug: "${erpSlug}". Valid slugs: ${Object.keys(ERP_META).join(', ')}` },
          { status: 400 }
        )
      }

      try {
        const conn = await testErpConnection(erpSlug)
        return NextResponse.json({
          action: 'test',
          erpSlug,
          name: meta.name,
          connected: conn.connected,
          latency: conn.latency ?? null,
          clientCount: conn.clientCount ?? 0,
          error: conn.error ?? null,
        })
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        return NextResponse.json({
          action: 'test',
          erpSlug,
          name: meta.name,
          connected: false,
          latency: null,
          clientCount: 0,
          error: errMsg,
        })
      }
    }

    // ─── SYNC action: update all SyncConnector records with current timestamps ───
    if (action === 'sync') {
      // Use updateMany for a single efficient DB round-trip instead of
      // per-connector updates which can exhaust the connection pool.
      const now = new Date()

      const updateResult = await db.syncConnector.updateMany({
        data: {
          lastSyncAt: now,
          status: 'active',
        },
      })

      // Fetch the updated connectors for the response (single query)
      const connectors = await db.syncConnector.findMany({
        include: { erpSystem: true },
        orderBy: { name: 'asc' },
      })

      const updatedConnectors = connectors.map((c) => ({
        id: c.id,
        name: c.name,
        erpSlug: c.erpSystem?.slug || null,
        status: c.status,
        lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
        recordsSynced: c.recordsSynced,
      }))

      // Invalidate the integrations cache so next GET reflects fresh data
      setCached('integrations-v2', null)

      return NextResponse.json({
        action: 'sync',
        syncedAt: now.toISOString(),
        totalConnectors: updatedConnectors.length,
        rowsUpdated: updateResult.count,
        connectors: updatedConnectors,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "sync" or "test".' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[INTEGRATIONS] POST error:', error)
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}
