import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const PF_MAIN_DB = process.env.PHARMAFLOW_DATABASE_URL || ''

export async function GET() {
  if (!PF_MAIN_DB) {
    return NextResponse.json(
      { error: 'PharmaFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(PF_MAIN_DB)

    // ─── Main DB Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client" WHERE status = 'active'
    `

    const [ownerCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerUser"
    `.catch(() => [{ count: 0 }])

    const clientsByType = await mainSql`
      SELECT "businessType", COUNT(*)::int AS count
      FROM "Client"
      GROUP BY "businessType"
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "businessName", "contactPerson", "contactEmail", "contactPhone",
        city, country, status, "businessType",
        "maxBranches", "maxUsers", "maxDevices", "maxProducts",
        "verificationStatus", "registeredAt", "createdAt"
      FROM "Client"
      ORDER BY "createdAt" DESC
    `

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerInvoice"
    `.catch(() => [{ count: 0 }])

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ClientDevice"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ClientDevice" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Serial Key Stats ──
    const [serialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey"
    `.catch(() => [{ count: 0 }])

    const [activeSerialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    const serialKeys = await mainSql`
      SELECT
        sk.id, sk.key, sk."keyType", sk.status,
        sk."maxActivations", sk."activationCount",
        sk."activatedAt", sk."expiresAt", sk."createdAt",
        c."businessName"
      FROM "SerialKey" sk
      LEFT JOIN "Client" c ON sk."clientId" = c.id
      ORDER BY sk."createdAt" DESC
    `.catch(() => [])

    // ─── Subscription Plan Stats ──
    const [planCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SubscriptionPlan"
    `.catch(() => [{ count: 0 }])

    const subscriptionPlans = await mainSql`
      SELECT
        id, name, slug, "monthlyPrice", "yearlyPrice",
        "maxBranches", "maxUsers", "maxDevices", "maxProducts"
      FROM "SubscriptionPlan"
      ORDER BY "monthlyPrice" ASC
    `.catch(() => [])

    // ─── Tenant DB stats (aggregate across tenant databases) ──
    const tenantDbs = await mainSql`
      SELECT "businessName", "connectionString"
      FROM "Client"
      WHERE "connectionString" IS NOT NULL
        AND "connectionString" != ''
        AND status != 'suspended'
    `.catch(() => [])

    let totalMedicines = 0
    let totalCustomers = 0
    let totalSales = 0
    let totalRevenue = 0
    let totalBranches = 0
    let totalSuppliers = 0
    let totalEmployees = 0
    let totalPrescriptions = 0
    let totalPurchaseOrders = 0
    let totalInventory = 0

    for (const tenant of tenantDbs) {
      try {
        if (!tenant.connectionString?.startsWith('postgresql://')) continue
        const tenantSql = neon(tenant.connectionString)

        const [med] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Medicine"`.catch(() => [{ c: 0 }])
        const [cust] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Customer"`.catch(() => [{ c: 0 }])
        const [sale] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Sale"`.catch(() => [{ c: 0 }])
        const [rev] = await tenantSql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Sale"`.catch(() => [{ r: 0 }])
        const [br] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Branch"`.catch(() => [{ c: 0 }])
        const [sup] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Supplier"`.catch(() => [{ c: 0 }])
        const [emp] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Employee"`.catch(() => [{ c: 0 }])
        const [presc] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Prescription"`.catch(() => [{ c: 0 }])
        const [po] = await tenantSql`SELECT COUNT(*)::int AS c FROM "PurchaseOrder"`.catch(() => [{ c: 0 }])
        const [inv] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Inventory"`.catch(() => [{ c: 0 }])

        totalMedicines += med.c
        totalCustomers += cust.c
        totalSales += sale.c
        totalRevenue += rev.r
        totalBranches += br.c
        totalSuppliers += sup.c
        totalEmployees += emp.c
        totalPrescriptions += presc.c
        totalPurchaseOrders += po.c
        totalInventory += inv.c
      } catch {
        // Skip tenants with connection errors
      }
    }

    return NextResponse.json({
      connected: true,
      mainDb: {
        totalClients: clientCount?.count ?? 0,
        activeClients: activeClients?.count ?? 0,
        totalUsers: ownerCount?.count ?? 0,
        totalRevenue: revenueResult?.r ?? 0,
        totalInvoices: invoiceCount?.count ?? 0,
        totalDevices: deviceCount?.count ?? 0,
        activeDevices: activeDeviceCount?.count ?? 0,
        totalSerialKeys: serialKeyCount?.count ?? 0,
        activeSerialKeys: activeSerialKeyCount?.count ?? 0,
        totalPlans: planCount?.count ?? 0,
        clientsByType,
        clientCompanies,
        serialKeys,
        subscriptionPlans,
      },
      operations: {
        medicines: totalMedicines,
        customers: totalCustomers,
        sales: totalSales,
        revenue: totalRevenue,
        branches: totalBranches,
        suppliers: totalSuppliers,
        employees: totalEmployees,
        prescriptions: totalPrescriptions,
        purchaseOrders: totalPurchaseOrders,
        inventory: totalInventory,
        tenantCount: tenantDbs.length,
      },
    })
  } catch (error) {
    console.error('[PF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PharmaFlow stats', connected: false },
      { status: 500 }
    )
  }
}
