import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const FOODF_MAIN_DB = process.env.FOODFLOW_DATABASE_URL || ''

export async function GET() {
  if (!FOODF_MAIN_DB) {
    return NextResponse.json(
      { error: 'FoodFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(FOODF_MAIN_DB)

    // ─── Main DB Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Tenant"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Tenant" WHERE "isActive" = true
    `.catch(() => [{ count: 0 }])

    const [ownerCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerUser"
    `.catch(() => [{ count: 0 }])

    const clientsByPlan = await mainSql`
      SELECT "billingCycle" AS plan, COUNT(*)::int AS count
      FROM "Tenant"
      GROUP BY "billingCycle"
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "businessName", "ownerName", "ownerEmail", "ownerPhone",
        city, country, status, "isActive",
        "maxBranches", "maxUsers", "billingCycle",
        "createdAt"
      FROM "Tenant"
      ORDER BY "createdAt" DESC
    `

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Invoice"
    `.catch(() => [{ count: 0 }])

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Device"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Device" WHERE status = 'active'
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
        sk.id, sk.key, sk.status, sk."maxActivations", sk."currentActivations",
        sk."activatedAt", sk."expiresAt", sk."createdAt",
        t."businessName"
      FROM "SerialKey" sk
      LEFT JOIN "Tenant" t ON sk."tenantId" = t.id
      ORDER BY sk."createdAt" DESC
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
        clientsByPlan,
        clientCompanies,
        serialKeys,
      },
    })
  } catch (error) {
    console.error('[FOODF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FoodFlow stats', connected: false },
      { status: 500 }
    )
  }
}
