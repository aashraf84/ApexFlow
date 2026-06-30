import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const BF_MAIN_DB = process.env.BUILDFLOW_DATABASE_URL || ''

export async function GET() {
  if (!BF_MAIN_DB) {
    return NextResponse.json(
      { error: 'BuildFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(BF_MAIN_DB)

    // ─── Main DB Stats (BuildFlow uses ERPTenant, not Client) ─────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPTenant"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPTenant" WHERE "isActive" = true
    `

    const [userCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "User"
    `.catch(() => [{ count: 0 }])

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "ERPOwnerInvoice" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPOwnerInvoice"
    `.catch(() => [{ count: 0 }])

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPDevice"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPDevice" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    const [serialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPSerialKey"
    `.catch(() => [{ count: 0 }])

    const [activeSerialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPSerialKey" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    const [planCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ERPPricingPlan"
    `.catch(() => [{ count: 0 }])

    const clientsByPlan = await mainSql`
      SELECT "planType" AS plan, COUNT(*)::int AS count
      FROM "ERPTenant"
      WHERE "planType" IS NOT NULL
      GROUP BY "planType"
      ORDER BY count DESC
    `.catch(() => [])

    const clientsByType = await mainSql`
      SELECT 'Construction & Real Estate' AS "businessType", COUNT(*)::int AS count
      FROM "ERPTenant"
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "serialNumber", "companyName", "contactName", "contactEmail", "contactPhone",
        "city", "country", "planType", "status", "isActive",
        "maxUsers", "maxProjects", "currentUsers", "currentProjects",
        "databaseStatus", "adminEmail",
        "createdAt"
      FROM "ERPTenant"
      ORDER BY "createdAt" DESC
    `.catch(() => [])

    const serialKeys = await mainSql`
      SELECT
        sk.id, sk.key, sk.status,
        sk."issuedAt", sk."expiresAt", sk."createdAt",
        t."companyName" AS "businessName"
      FROM "ERPSerialKey" sk
      LEFT JOIN "ERPTenant" t ON sk."tenantId" = t.id
      ORDER BY sk."createdAt" DESC
    `.catch(() => [])

    const subscriptionPlans = await mainSql`
      SELECT
        id, name, slug, "monthlyPrice", "yearlyPrice",
        "maxProjects" AS "maxProperties", "maxUsers", "maxDevices"
      FROM "ERPPricingPlan"
      ORDER BY "monthlyPrice" ASC
    `.catch(() => [])

    // ─── Aggregate Tenant Stats (workspace databases) ──────────────
    const tenantDbUrls = await mainSql`
      SELECT "companyName", "databaseUrl"
      FROM "ERPTenant"
      WHERE "databaseUrl" IS NOT NULL
        AND "databaseUrl" != 'MAIN_DB'
        AND "databaseUrl" != ''
    `.catch(() => [])

    let totalProperties = 0
    let totalUnits = 0
    let totalTenants = 0
    let totalProjects = 0
    let totalHousingSchemes = 0
    let totalContractors = 0
    let totalEmployees = 0
    let totalRevenue = 0
    let totalMaintenance = 0
    let totalSuppliers = 0

    for (const tenant of tenantDbUrls) {
      try {
        if (!tenant.databaseUrl?.startsWith('postgresql://')) continue
        const tenantSql = neon(tenant.databaseUrl)

        const [prop] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Property"`.catch(() => [{ c: 0 }])
        const [unit] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Unit"`.catch(() => [{ c: 0 }])
        const [ten] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Tenant"`.catch(() => [{ c: 0 }])
        const [proj] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Project"`.catch(() => [{ c: 0 }])
        const [hs] = await tenantSql`SELECT COUNT(*)::int AS c FROM "HousingScheme"`.catch(() => [{ c: 0 }])
        const [con] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Contractor"`.catch(() => [{ c: 0 }])
        const [emp] = await tenantSql`SELECT COUNT(*)::int AS c FROM "User"`.catch(() => [{ c: 0 }])
        const [rev] = await tenantSql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`.catch(() => [{ r: 0 }])
        const [mt] = await tenantSql`SELECT COUNT(*)::int AS c FROM "MaintenanceRequest"`.catch(() => [{ c: 0 }])
        const [sup] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Supplier"`.catch(() => [{ c: 0 }])

        totalProperties += prop.c
        totalUnits += unit.c
        totalTenants += ten.c
        totalProjects += proj.c
        totalHousingSchemes += hs.c
        totalContractors += con.c
        totalEmployees += emp.c
        totalRevenue += rev.r
        totalMaintenance += mt.c
        totalSuppliers += sup.c
      } catch {
        // Skip tenants with connection errors
      }
    }

    return NextResponse.json({
      connected: true,
      mainDb: {
        totalClients: clientCount?.count ?? 0,
        activeClients: activeClients?.count ?? 0,
        totalUsers: userCount?.count ?? 0,
        totalRevenue: revenueResult?.r ?? 0,
        totalInvoices: invoiceCount?.count ?? 0,
        totalDevices: deviceCount?.count ?? 0,
        activeDevices: activeDeviceCount?.count ?? 0,
        totalSerialKeys: serialKeyCount?.count ?? 0,
        activeSerialKeys: activeSerialKeyCount?.count ?? 0,
        totalPlans: planCount?.count ?? 0,
        clientsByPlan,
        clientsByType,
        clientCompanies,
        serialKeys,
        subscriptionPlans,
      },
      operations: {
        properties: totalProperties,
        units: totalUnits,
        tenants: totalTenants,
        projects: totalProjects,
        housingSchemes: totalHousingSchemes,
        contractors: totalContractors,
        employees: totalEmployees,
        revenue: totalRevenue,
        maintenanceTickets: totalMaintenance,
        suppliers: totalSuppliers,
        tenantCount: tenantDbUrls.length,
      },
    })
  } catch (error) {
    console.error('[BF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch BuildFlow stats', connected: false },
      { status: 500 }
    )
  }
}
