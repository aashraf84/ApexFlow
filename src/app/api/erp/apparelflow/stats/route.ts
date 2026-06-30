import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const AF_MAIN_DB = process.env.APPARELFLOW_DATABASE_URL || ''

const MAX_TENANTS = 5
const TENANT_TIMEOUT_MS = 10_000

/** Race a promise against a timeout; returns fallback on failure or timeout */
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
      { connected: false, error: 'ApparelFlow database not configured' },
      { status: 200 }
    )
  }

  try {
    const mainSql = neon(AF_MAIN_DB)

    // ─── Main DB Stats (each query individually resilient) ─────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ClientCompany"
    `.catch(() => [{ count: 0 }])

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ClientCompany" WHERE "isActive" = true
    `.catch(() => [{ count: 0 }])

    const [userCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "User"
    `.catch(() => [{ count: 0 }])

    const clientsByLicense = await mainSql`
      SELECT "licenseType", COUNT(*)::int AS count
      FROM "ClientCompany"
      GROUP BY "licenseType"
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "companyName", "adminEmail", "licenseType", "licenseStatus",
        "serialKey", "isActive", "databaseStatus", "industry",
        "maxUsers", "maxShops", "selectedModules",
        "createdAt"
      FROM "ClientCompany"
      ORDER BY "createdAt" DESC
    `.catch(() => [])

    // ─── Aggregate Tenant Stats ────────────────────────────────────
    const tenantDbUrls = await mainSql`
      SELECT "companyName", "databaseUrl"
      FROM "ClientCompany"
      WHERE "databaseUrl" IS NOT NULL
        AND "databaseUrl" != 'MAIN_DB'
        AND "databaseUrl" != ''
    `.catch(() => [])

    // Limit to MAX_TENANTS to avoid overwhelming the server
    const limitedTenants = tenantDbUrls.slice(0, MAX_TENANTS)

    // Run tenant queries in parallel with allSettled + timeout
    const tenantResults = await Promise.allSettled(
      limitedTenants.map(async (tenant) => {
        if (!tenant.databaseUrl?.startsWith('postgresql://')) {
          return null
        }

        const tenantSql = neon(tenant.databaseUrl)

        const [inv] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "InventoryItem"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [cust] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "Customer"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [so] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "SalesOrder"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [rev] = await fetchTimeout(
          tenantSql`SELECT COALESCE(SUM("total"), 0)::float AS r FROM "SalesOrder"`,
          TENANT_TIMEOUT_MS,
          [{ r: 0 }]
        )
        const [emp] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "Employee"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [shop] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "RetailShop"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [po] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "ProductionOrder"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [wh] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "Warehouse"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [sup] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "Supplier"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [pos] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "POSSale"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [wo] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "WholesaleOrder"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [pco] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "PurchaseOrder"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [rm] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "RawMaterialItem"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )
        const [lead] = await fetchTimeout(
          tenantSql`SELECT COUNT(*)::int AS c FROM "Lead"`,
          TENANT_TIMEOUT_MS,
          [{ c: 0 }]
        )

        return {
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
          rawMaterials: rm?.c ?? 0,
          leads: lead?.c ?? 0,
        }
      })
    )

    // Aggregate successful tenant results (skip rejected/failed)
    let totalInventoryItems = 0
    let totalCustomers = 0
    let totalSalesOrders = 0
    let totalRevenue = 0
    let totalEmployees = 0
    let totalRetailShops = 0
    let totalProductionOrders = 0
    let totalWarehouses = 0
    let totalSuppliers = 0
    let totalPOSSales = 0
    let totalWholesaleOrders = 0
    let totalPurchaseOrders = 0
    let totalRawMaterials = 0
    let totalLeads = 0

    for (const result of tenantResults) {
      if (result.status === 'fulfilled' && result.value) {
        const t = result.value
        totalInventoryItems += t.inventoryItems
        totalCustomers += t.customers
        totalSalesOrders += t.salesOrders
        totalRevenue += t.revenue
        totalEmployees += t.employees
        totalRetailShops += t.retailShops
        totalProductionOrders += t.productionOrders
        totalWarehouses += t.warehouses
        totalSuppliers += t.suppliers
        totalPOSSales += t.posSales
        totalWholesaleOrders += t.wholesaleOrders
        totalPurchaseOrders += t.purchaseOrders
        totalRawMaterials += t.rawMaterials
        totalLeads += t.leads
      }
    }

    return NextResponse.json({
      connected: true,
      mainDb: {
        totalClients: clientCount?.count ?? 0,
        activeClients: activeClients?.count ?? 0,
        totalUsers: userCount?.count ?? 0,
        clientsByLicense: clientsByLicense || [],
        clientCompanies: clientCompanies || [],
      },
      tenants: {
        totalInventoryItems,
        totalCustomers,
        totalSalesOrders,
        totalRevenue,
        totalEmployees,
        totalRetailShops,
        totalProductionOrders,
        totalWarehouses,
        totalSuppliers,
        totalPOSSales,
        totalWholesaleOrders,
        totalPurchaseOrders,
        totalRawMaterials,
        totalLeads,
        tenantCount: tenantDbUrls?.length ?? 0,
        tenantsProcessed: limitedTenants.length,
      },
    })
  } catch (error) {
    console.error('[AF-STATS] Failed:', error)
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    )
  }
}
