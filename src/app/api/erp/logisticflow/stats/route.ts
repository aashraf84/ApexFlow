import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const LFL_MAIN_DB = process.env.LOGISTICFLOW_DATABASE_URL || ''

export async function GET() {
  if (!LFL_MAIN_DB) {
    return NextResponse.json(
      { connected: false, error: 'Database not configured' },
      { status: 200 }
    )
  }

  try {
    const mainSql = neon(LFL_MAIN_DB)

    // ─── Client Stats (Tenant table — same DB as DistriFlow) ──────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Tenant"
    `.catch(() => [{ count: 0 }])

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Tenant" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Invoice Stats (only `amount`, no breakdown) ──────────────
    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Invoice"
    `.catch(() => [{ count: 0 }])

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("amount"), 0)::float AS r
      FROM "Invoice" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    // ─── License Stats ────────────────────────────────────────────
    const [licenseCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey"
    `.catch(() => [{ count: 0 }])

    const [activeLicenseCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Device Stats ─────────────────────────────────────────────
    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Device"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Device" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Client List ──────────────────────────────────────────────
    const clientCompanies = await mainSql`
      SELECT
        id, name, email, phone, city, country,
        status, plan, "dbStatus", "createdAt"
      FROM "Tenant"
      ORDER BY "createdAt" DESC
    `.catch(() => [])

    return NextResponse.json({
      connected: true,
      mainDb: {
        totalClients: clientCount?.count ?? 0,
        activeClients: activeClients?.count ?? 0,
        totalInvoices: invoiceCount?.count ?? 0,
        totalRevenue: revenueResult?.r ?? 0,
        totalLicenses: licenseCount?.count ?? 0,
        activeLicenses: activeLicenseCount?.count ?? 0,
        totalDevices: deviceCount?.count ?? 0,
        activeDevices: activeDeviceCount?.count ?? 0,
        clientCompanies,
      },
    })
  } catch (error) {
    console.error('[LFL-STATS] Failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { connected: false, error: message },
      { status: 200 }
    )
  }
}
