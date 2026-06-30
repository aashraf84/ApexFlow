import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const FF_MAIN_DB = process.env.FACTORYFLOW_DATABASE_URL || ''

export async function GET() {
  if (!FF_MAIN_DB) {
    return NextResponse.json(
      { error: 'FactoryFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(FF_MAIN_DB)

    // ─── Main DB Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerClient"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerClient" WHERE status = 'active'
    `

    const [ownerCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerUser"
    `.catch(() => [{ count: 0 }])

    const clientsByPlan = await mainSql`
      SELECT "billingCycle" AS plan, COUNT(*)::int AS count
      FROM "OwnerClient"
      GROUP BY "billingCycle"
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "companyName", "contactPerson", "email", "phone",
        "city", "country", "status", "billingCycle", "serialKey",
        "maxDevices", "maxUsers", "activatedAt", "notes",
        "createdAt"
      FROM "OwnerClient"
      ORDER BY "createdAt" DESC
    `

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerInvoice"
    `.catch(() => [{ count: 0 }])

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerDevice"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerDevice" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Serial Key Stats ──
    const [serialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerSerialKey"
    `.catch(() => [{ count: 0 }])

    const [activeSerialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerSerialKey" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    const serialKeys = await mainSql`
      SELECT
        sk.id, sk.key, sk.status, sk."maxDevices", sk."activatedDevices",
        sk."activatedAt", sk."expiresAt", sk."createdAt",
        oc."companyName"
      FROM "OwnerSerialKey" sk
      LEFT JOIN "OwnerClient" oc ON sk."clientId" = oc.id
      ORDER BY sk."createdAt" DESC
    `.catch(() => [])

    // ─── Package Stats ──
    const [packageCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerPackage"
    `.catch(() => [{ count: 0 }])

    const packages = await mainSql`
      SELECT
        id, name, "priceMonthly", "priceYearly",
        "maxFactories", "maxUsers", "maxDevices", "maxWarehouses",
        "isActive", "sortOrder"
      FROM "OwnerPackage"
      ORDER BY "sortOrder" ASC
    `.catch(() => [])

    // ─── Package Module Stats ──
    const packageModules = await mainSql`
      SELECT
        pm."moduleKey", pm."moduleName",
        COUNT(CASE WHEN pm."isIncluded" = true THEN 1 END) AS included_count,
        COUNT(CASE WHEN pm."isPremium" = true THEN 1 END) AS premium_count
      FROM "OwnerPackageModule" pm
      GROUP BY pm."moduleKey", pm."moduleName"
      ORDER BY pm."moduleKey" ASC
    `.catch(() => [])

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
        totalPackages: packageCount?.count ?? 0,
        clientsByPlan,
        clientCompanies,
        serialKeys,
        packages,
        packageModules,
      },
    })
  } catch (error) {
    console.error('[FF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FactoryFlow stats', connected: false },
      { status: 500 }
    )
  }
}
