import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const MF_MAIN_DB = process.env.MARTFLOW_DATABASE_URL || ''

export async function GET() {
  if (!MF_MAIN_DB) {
    return NextResponse.json(
      { error: 'MartFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(MF_MAIN_DB)

    // ─── Main DB Stats ─────────────────────────────────────────────
    const [tenantCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM tenants
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM tenants WHERE status = 'ACTIVE'
    `

    const [ownerCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "platform_users"
    `

    const clientsByPlan = await mainSql`
      SELECT plan, COUNT(*)::int AS count
      FROM tenants
      GROUP BY plan
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, name, slug, status, plan, email, phone, city, country,
        "businessType", "maxBranches", "maxUsers", "maxProducts",
        "dbStatus", "totalPaid", "outstandingAmount",
        "contactPerson", "contactEmail",
        "createdAt"
      FROM tenants
      ORDER BY "createdAt" DESC
    `

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalPaid"), 0)::float AS r FROM tenants
    `.catch(() => [{ r: 0 }])

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM invoices
    `.catch(() => [{ count: 0 }])

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM devices
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM devices WHERE status = 'ACTIVE'
    `.catch(() => [{ count: 0 }])

    // ─── Serial Key Stats ──
    const [serialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM serial_keys
    `.catch(() => [{ count: 0 }])

    const [activeSerialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM serial_keys WHERE status = 'ACTIVE'
    `.catch(() => [{ count: 0 }])

    const serialKeys = await mainSql`
      SELECT
        sk.id, sk.key, sk.status, sk.type, sk."packageName",
        sk."maxActivations", sk."currentActivations",
        sk."activatedAt", sk."expiresAt", sk."createdAt"
      FROM serial_keys sk
      ORDER BY sk."createdAt" DESC
    `.catch(() => [])

    // ─── Package Stats ──
    const [packageCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM packages
    `.catch(() => [{ count: 0 }])

    const packages = await mainSql`
      SELECT
        id, name, slug, "monthlyPrice", "yearlyPrice",
        "isPopular", "maxBranches", "maxUsers", "maxProducts"
      FROM packages
      ORDER BY "sortOrder"
    `.catch(() => [])

    // ─── Tenant DB stats (aggregate across tenant databases) ──
    const tenantDbs = await mainSql`
      SELECT name, "dbUrl"
      FROM tenants
      WHERE "dbUrl" IS NOT NULL
        AND "dbUrl" != ''
        AND status != 'SUSPENDED'
    `.catch(() => [])

    let totalProducts = 0
    let totalCustomers = 0
    let totalSalesOrders = 0
    let totalRevenue = 0
    let totalBranches = 0
    let totalWarehouses = 0
    let totalSuppliers = 0
    let totalPOSSales = 0
    let totalPurchaseOrders = 0
    let totalEmployees = 0

    for (const tenant of tenantDbs) {
      try {
        if (!tenant.dbUrl?.startsWith('postgresql://')) continue
        const tenantSql = neon(tenant.dbUrl)

        // Try to query operational tables (may not exist in platform-only DBs)
        const [prod] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Product"`.catch(() => [{ c: 0 }])
        const [cust] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Customer"`.catch(() => [{ c: 0 }])
        const [so] = await tenantSql`SELECT COUNT(*)::int AS c FROM "SalesOrder"`.catch(() => [{ c: 0 }])
        const [rev] = await tenantSql`SELECT COALESCE(SUM("total"), 0)::float AS r FROM "SalesOrder"`.catch(() => [{ r: 0 }])
        const [br] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Branch"`.catch(() => [{ c: 0 }])
        const [wh] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Warehouse"`.catch(() => [{ c: 0 }])
        const [sup] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Supplier"`.catch(() => [{ c: 0 }])
        const [pos] = await tenantSql`SELECT COUNT(*)::int AS c FROM "POSSale"`.catch(() => [{ c: 0 }])
        const [po] = await tenantSql`SELECT COUNT(*)::int AS c FROM "PurchaseOrder"`.catch(() => [{ c: 0 }])
        const [emp] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Employee"`.catch(() => [{ c: 0 }])

        totalProducts += prod.c
        totalCustomers += cust.c
        totalSalesOrders += so.c
        totalRevenue += rev.r
        totalBranches += br.c
        totalWarehouses += wh.c
        totalSuppliers += sup.c
        totalPOSSales += pos.c
        totalPurchaseOrders += po.c
        totalEmployees += emp.c
      } catch {
        // Skip tenants with connection errors
      }
    }

    return NextResponse.json({
      connected: true,
      mainDb: {
        totalClients: tenantCount?.count ?? 0,
        activeClients: activeClients?.count ?? 0,
        totalUsers: ownerCount?.count ?? 0,
        totalRevenue: revenueResult?.r ?? 0,
        totalInvoices: invoiceCount?.count ?? 0,
        totalDevices: deviceCount?.count ?? 0,
        activeDevices: activeDeviceCount?.count ?? 0,
        totalSerialKeys: serialKeyCount?.count ?? 0,
        activeSerialKeys: activeSerialKeyCount?.count ?? 0,
        totalPackages: packageCount?.count ?? 0,
        clientsByPlan,
        clientCompanies,
        serialKeys,
        packages,
      },
      operations: {
        products: totalProducts,
        customers: totalCustomers,
        salesOrders: totalSalesOrders,
        revenue: totalRevenue,
        branches: totalBranches,
        warehouses: totalWarehouses,
        suppliers: totalSuppliers,
        posSales: totalPOSSales,
        purchaseOrders: totalPurchaseOrders,
        employees: totalEmployees,
        tenantCount: tenantDbs.length,
      },
    })
  } catch (error) {
    console.error('[MF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MartFlow stats', connected: false },
      { status: 500 }
    )
  }
}
