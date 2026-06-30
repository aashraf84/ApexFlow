import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const TNF_MAIN_DB = process.env.TENANTFLOW_DATABASE_URL || ''

export async function GET() {
  if (!TNF_MAIN_DB) {
    return NextResponse.json(
      { error: 'TenantFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(TNF_MAIN_DB)

    // ─── Main DB Stats (TenantFlow uses "Client" model) ─────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    const [userCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "User"
    `.catch(() => [{ count: 0 }])

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("total"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Invoice"
    `.catch(() => [{ count: 0 }])

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Device"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Device" WHERE status = 'activated'
    `.catch(() => [{ count: 0 }])

    const [licenseKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "LicenseKey"
    `.catch(() => [{ count: 0 }])

    const [activeLicenseKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "LicenseKey" WHERE status = 'activated'
    `.catch(() => [{ count: 0 }])

    const [workspaceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Workspace"
    `.catch(() => [{ count: 0 }])

    const clientsByPlan = await mainSql`
      SELECT plan, COUNT(*)::int AS count
      FROM "Client"
      WHERE plan IS NOT NULL
      GROUP BY plan
      ORDER BY count DESC
    `.catch(() => [])

    const clientsByType = await mainSql`
      SELECT COALESCE("industry", 'Property Management') AS "businessType", COUNT(*)::int AS count
      FROM "Client"
      GROUP BY "industry"
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "companyName", "contactName", email, phone,
        "address", city, state, "zipCode", country,
        status, plan, "billingCycle", "monthlyFee", "setupFee",
        "maxProperties", "maxUsers", "maxDevices",
        "dbStatus", features, industry, "companySize",
        website, "customDomain",
        "createdAt"
      FROM "Client"
      ORDER BY "createdAt" DESC
    `.catch(() => [])

    const licenseKeys = await mainSql`
      SELECT
        lk.id, lk.key, lk.type, lk.plan, lk.status,
        lk."maxDevices", lk."maxUsers",
        lk."activatedAt", lk."expiresAt", lk."createdAt",
        c."companyName"
      FROM "LicenseKey" lk
      LEFT JOIN "Client" c ON lk."clientId" = c.id
      ORDER BY lk."createdAt" DESC
    `.catch(() => [])

    const subscriptionPlans = await mainSql`
      SELECT
        id, name, slug,
        "monthlyPrice", "yearlyPrice",
        "maxProperties", "maxUsers", "maxDevices"
      FROM "SubscriptionPlan"
      ORDER BY "monthlyPrice" ASC
    `.catch(() => [])

    // ─── Operational Stats from Tenant Workspaces ───────────────
    // TenantFlow has database-per-tenant architecture
    const tenantDbUrls = await mainSql`
      SELECT "companyName", "databaseUrl"
      FROM "Client"
      WHERE "databaseUrl" IS NOT NULL
        AND "databaseUrl" != ''
        AND "dbStatus" = 'active'
    `.catch(() => [])

    let totalProperties = 0
    let totalUnits = 0
    let totalTenants = 0
    let totalLeases = 0
    let totalPayments = 0
    let totalMaintenanceTickets = 0
    let totalVendors = 0
    let totalEmployees = 0
    let totalRevenue = 0
    let totalWorkspaces = 0

    for (const tenant of tenantDbUrls) {
      try {
        if (!tenant.databaseUrl?.startsWith('postgresql://')) continue
        const tenantSql = neon(tenant.databaseUrl)

        const [prop] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Property"`.catch(() => [{ c: 0 }])
        const [unit] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Unit"`.catch(() => [{ c: 0 }])
        const [ten] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Tenant"`.catch(() => [{ c: 0 }])
        const [lease] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Lease"`.catch(() => [{ c: 0 }])
        const [pay] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Payment"`.catch(() => [{ c: 0 }])
        const [mt] = await tenantSql`SELECT COUNT(*)::int AS c FROM "MaintenanceTicket"`.catch(() => [{ c: 0 }])
        const [ven] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Vendor"`.catch(() => [{ c: 0 }])
        const [emp] = await tenantSql`SELECT COUNT(*)::int AS c FROM "User"`.catch(() => [{ c: 0 }])
        const [rev] = await tenantSql`SELECT COALESCE(SUM("amount"), 0)::float AS r FROM "Payment" WHERE status = 'completed'`.catch(() => [{ r: 0 }])
        const [ws] = await tenantSql`SELECT COUNT(*)::int AS c FROM "Workspace"`.catch(() => [{ c: 0 }])

        totalProperties += prop.c
        totalUnits += unit.c
        totalTenants += ten.c
        totalLeases += lease.c
        totalPayments += pay.c
        totalMaintenanceTickets += mt.c
        totalVendors += ven.c
        totalEmployees += emp.c
        totalRevenue += rev.r
        totalWorkspaces += ws.c
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
        totalLicenseKeys: licenseKeyCount?.count ?? 0,
        activeLicenseKeys: activeLicenseKeyCount?.count ?? 0,
        totalWorkspaces: workspaceCount?.count ?? 0,
        clientsByPlan,
        clientsByType,
        clientCompanies,
        licenseKeys,
        subscriptionPlans,
      },
      operations: {
        properties: totalProperties,
        units: totalUnits,
        tenants: totalTenants,
        leases: totalLeases,
        payments: totalPayments,
        maintenanceTickets: totalMaintenanceTickets,
        vendors: totalVendors,
        employees: totalEmployees,
        revenue: totalRevenue,
        tenantCount: tenantDbUrls.length,
      },
    })
  } catch (error) {
    console.error('[TNF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch TenantFlow stats', connected: false },
      { status: 500 }
    )
  }
}
