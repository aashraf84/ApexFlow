import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const AF_MAIN_DB = process.env.APPARELFLOW_DATABASE_URL || ''

const TIMEOUT_MS = 10_000

function fetchTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]).catch(() => fallback)
}

export async function GET() {
  if (!AF_MAIN_DB) {
    return NextResponse.json(
      { connected: false, error: 'ApparelFlow database not configured', clients: [] },
      { status: 200 }
    )
  }

  try {
    const mainSql = neon(AF_MAIN_DB)

    // Fetch real client companies from the ApparelFlow database
    const clients = await fetchTimeout(
      mainSql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "adminEmail", "licenseType", "licenseStatus",
          "serialKey", "isActive", "databaseStatus", "industry",
          "maxUsers", "maxShops", "selectedModules", "businessType",
          "createdAt"
        FROM "ClientCompany"
        ORDER BY "createdAt" DESC
      `,
      TIMEOUT_MS,
      []
    )

    // Fetch tenant-level stats for each client (inventory, customers, etc.)
    const tenantDbUrls = await fetchTimeout(
      mainSql`
        SELECT id, "companyName", "databaseUrl"
        FROM "ClientCompany"
        WHERE "databaseUrl" IS NOT NULL
          AND "databaseUrl" != 'MAIN_DB'
          AND "databaseUrl" != ''
        ORDER BY "createdAt" DESC
      `,
      TIMEOUT_MS,
      []
    )

    // Fetch stats for up to 10 tenants in parallel
    const limitedTenants = (tenantDbUrls as any[]).slice(0, 10)

    const tenantStatsResults = await Promise.allSettled(
      limitedTenants.map(async (tenant: any) => {
        if (!tenant.databaseUrl?.startsWith('postgresql://')) {
          return { clientId: tenant.id, stats: null }
        }

        try {
          const tenantSql = neon(tenant.databaseUrl)

          const [inv] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "InventoryItem"`,
            8000,
            [{ c: 0 }]
          )
          const [cust] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "Customer"`,
            8000,
            [{ c: 0 }]
          )
          const [so] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "SalesOrder"`,
            8000,
            [{ c: 0 }]
          )
          const [rev] = await fetchTimeout(
            tenantSql`SELECT COALESCE(SUM("total"), 0)::float AS r FROM "SalesOrder"`,
            8000,
            [{ r: 0 }]
          )
          const [emp] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "Employee"`,
            8000,
            [{ c: 0 }]
          )
          const [shop] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "RetailShop"`,
            8000,
            [{ c: 0 }]
          )
          const [po] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "ProductionOrder"`,
            8000,
            [{ c: 0 }]
          )
          const [wh] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "Warehouse"`,
            8000,
            [{ c: 0 }]
          )
          const [sup] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "Supplier"`,
            8000,
            [{ c: 0 }]
          )
          const [pos] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "POSSale"`,
            8000,
            [{ c: 0 }]
          )
          const [wo] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "WholesaleOrder"`,
            8000,
            [{ c: 0 }]
          )
          const [pco] = await fetchTimeout(
            tenantSql`SELECT COUNT(*)::int AS c FROM "PurchaseOrder"`,
            8000,
            [{ c: 0 }]
          )

          return {
            clientId: tenant.id,
            stats: {
              inventoryItems: inv?.c ?? 0,
              customers: cust?.c ?? 0,
              salesOrders: so?.c ?? 0,
              revenue: rev?.r ?? 0,
              employees: emp?.c ?? 0,
              retailShops: shop?.c ?? 0,
              productionOrders: po?.c ?? 0,
              warehouses: wh?.c ?? 0,
              suppliers: sup?.c ?? 0,
              posSales: pos?.c ?? 0,
              wholesaleOrders: wo?.c ?? 0,
              purchaseOrders: pco?.c ?? 0,
            },
          }
        } catch {
          return { clientId: tenant.id, stats: null }
        }
      })
    )

    // Build a map of clientId -> tenant stats
    const tenantStatsMap = new Map<string, any>()
    for (const result of tenantStatsResults) {
      if (result.status === 'fulfilled' && result.value?.stats) {
        tenantStatsMap.set(result.value.clientId, result.value.stats)
      }
    }

    // Map clients to a clean response format
    const mappedClients = (clients as any[]).map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || c.adminEmail || '—',
      email: c.email || c.adminEmail || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || 'Pakistan',
      isActive: c.isActive ?? false,
      licenseType: c.licenseType || null,
      licenseStatus: c.licenseStatus || null,
      databaseStatus: c.databaseStatus || null,
      industry: c.industry || c.businessType || null,
      businessType: c.businessType || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxShops || null,
      selectedModules: c.selectedModules || null,
      createdAt: c.createdAt,
      tenantStats: tenantStatsMap.get(c.id) || null,
    }))

    return NextResponse.json({
      connected: true,
      totalClients: mappedClients.length,
      clients: mappedClients,
    })
  } catch (error) {
    console.error('[AF-CLIENTS] Failed:', error)
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error', clients: [] },
      { status: 200 }
    )
  }
}
