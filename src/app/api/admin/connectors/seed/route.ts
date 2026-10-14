import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

/**
 * All 21 ERP systems — mirrors FALLBACK_ERP_SYSTEMS from /api/erp-systems/route.ts
 * so the seed always stays consistent with the canonical ERP registry.
 */
const ERP_SYSTEMS = [
  { slug: 'apparelflow', name: 'ApparelFlow', industry: 'Apparel & Textile' },
  { slug: 'hotelflow', name: 'HotelFlow', industry: 'Hospitality' },
  { slug: 'eduflow', name: 'EduFlow', industry: 'Education' },
  { slug: 'buildflow', name: 'BuildFlow', industry: 'Property Management & Real Estate' },
  { slug: 'pharmaflow', name: 'PharmaFlow', industry: 'Pharmaceutical' },
  { slug: 'travelflow', name: 'TravelFlow', industry: 'Travel & Tourism' },
  { slug: 'martflow', name: 'MartFlow', industry: 'Retail' },
  { slug: 'tenantflow', name: 'TenantFlow', industry: 'Property Management' },
  { slug: 'factoryflow', name: 'FactoryFlow', industry: 'Manufacturing' },
  { slug: 'foodflow', name: 'FoodFlow', industry: 'Food & Restaurant' },
  { slug: 'autoflow', name: 'AutoFlow', industry: 'Automotive & Workshop' },
  { slug: 'healthflow', name: 'HealthFlow', industry: 'Healthcare' },
  { slug: 'textileflow', name: 'TextileFlow', industry: 'Textile' },
  { slug: 'creativeflow', name: 'CreativeFlow', industry: 'Creative & Design' },
  { slug: 'logisticflow', name: 'LogisticFlow', industry: 'Logistics & Supply Chain' },
  { slug: 'distriflow', name: 'Distriflow', industry: 'Distribution & Wholesale' },
  { slug: 'fleetflow', name: 'FleetFlow', industry: 'Fleet & Transportation' },
  { slug: 'electroflow', name: 'ElectroFlow', industry: 'Consumer Electronics & Appliances' },
  { slug: 'bookflow', name: 'BookFlow', industry: 'Publishing & Books' },
  { slug: 'fuelflow', name: 'FuelFlow', industry: 'Fuel & Energy' },
  { slug: 'salonflow', name: 'SalonFlow', industry: 'Salon & Beauty' },
]

/** Weighted random status — ~80 % "connected", ~10 % "syncing", ~5 % "error", ~5 % "disconnected" */
function randomStatus(): string {
  const roll = Math.random() * 100
  if (roll < 80) return 'connected'
  if (roll < 90) return 'syncing'
  if (roll < 95) return 'error'
  return 'disconnected'
}

/** Random latency between 50-300 ms */
function randomLatency(): number {
  return Math.floor(50 + Math.random() * 251)
}

/** Random client count between 2-150 */
function randomClientCount(): number {
  return Math.floor(2 + Math.random() * 149)
}

/** Random tenant count between 0-30 */
function randomTenantCount(): number {
  return Math.floor(Math.random() * 31)
}

/**
 * POST /api/admin/connectors/seed
 *
 * Seeds IntegrationConnector entries for all 21 ERP systems.
 * Only creates connectors that don't already exist (by erpSlug).
 * Sets random statuses (mostly "connected"), random latencies (50-300ms),
 * and random clientCounts.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    // Fetch existing connectors to avoid duplicates
    const existing = await withRetry((d) =>
      d.integrationConnector.findMany({
        select: { erpSlug: true },
      }),
    )
    const existingSlugs = new Set(existing.map((c) => c.erpSlug))

    // Also look up ErpSystem records so we can link via erpSystemId.
    // ErpSystem has no slug field, so we match by name.
    const erpSystems = await withRetry((d) =>
      d.erpSystem.findMany({
        select: { id: true, name: true },
      }),
    )
    const erpIdByName = new Map(erpSystems.map((e) => [e.name, e.id]))

    const toCreate: {
      erpSlug: string
      erpName: string
      erpSystemId: string | null
      type: string
      direction: string
      status: string
      config: string | null
      autoSync: boolean
      syncInterval: number
      latencyMs: number
      clientCount: number
      tenantCount: number
    }[] = []

    for (const erp of ERP_SYSTEMS) {
      if (existingSlugs.has(erp.slug)) continue

      const erpSystemId = erpIdByName.get(erp.name) ?? null
      const status = randomStatus()
      const latencyMs = randomLatency()
      const clientCount = randomClientCount()
      const tenantCount = randomTenantCount()
      const autoSync = Math.random() < 0.4 // 40% chance of auto-sync enabled
      const syncInterval = [60, 120, 300, 600, 900][Math.floor(Math.random() * 5)]

      // Generate a realistic-looking connection config based on type
      const connectorType = Math.random() < 0.7 ? 'database' : Math.random() < 0.5 ? 'api' : 'webhook'
      const configObj =
        connectorType === 'database'
          ? { host: `${erp.slug}.db.internal`, port: 5432, poolSize: 10 }
          : connectorType === 'api'
            ? { baseUrl: `https://${erp.slug}.apexflow.io/api/v1`, timeout: 30000 }
            : { endpoint: `https://${erp.slug}.apexflow.io/webhooks`, format: 'json' }

      toCreate.push({
        erpSlug: erp.slug,
        erpName: erp.name,
        erpSystemId,
        type: connectorType,
        direction: 'bidirectional',
        status,
        config: JSON.stringify(configObj),
        autoSync,
        syncInterval,
        latencyMs,
        clientCount,
        tenantCount,
      })
    }

    if (toCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All connectors already exist — nothing seeded',
        data: { created: 0, skipped: ERP_SYSTEMS.length },
      })
    }

    // Create all connectors in one transaction
    const result = await withRetry((d) =>
      d.integrationConnector.createMany({
        data: toCreate.map((c) => ({
          ...c,
          lastSyncAt: c.status === 'connected' || c.status === 'syncing'
            ? new Date(Date.now() - Math.floor(Math.random() * 3600_000)) // random time in last hour
            : null,
          lastError: c.status === 'error' ? 'Connection timeout after 30s' : null,
        })),
      }),
    )

    return NextResponse.json({
      success: true,
      message: `Seeded ${result.count} connector(s) out of ${ERP_SYSTEMS.length} ERP systems`,
      data: {
        created: result.count,
        skipped: ERP_SYSTEMS.length - toCreate.length,
        slugs: toCreate.map((c) => c.erpSlug),
      },
    })
  } catch (error) {
    console.error('[ADMIN-CONNECTORS-SEED] Failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed connectors' },
      { status: 500 },
    )
  }
}