import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const TFL_MAIN_DB = process.env.TEXTILEFLOW_DATABASE_URL || ''

export async function GET() {
  if (!TFL_MAIN_DB) {
    return NextResponse.json(
      { connected: false, error: 'Database not configured' },
      { status: 200 }
    )
  }

  try {
    const mainSql = neon(TFL_MAIN_DB)

    // ─── Client Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "owner_clients"
    `.catch(() => [{ count: 0 }])

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "owner_clients" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Invoice Stats ────────────────────────────────────────────
    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "owner_invoices"
    `.catch(() => [{ count: 0 }])

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("total_amount"), 0)::float AS r
      FROM "owner_invoices" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    // ─── License Stats ────────────────────────────────────────────
    const [licenseCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "serial_keys"
    `.catch(() => [{ count: 0 }])

    const [activeLicenseCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "serial_keys" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Device Stats ─────────────────────────────────────────────
    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "devices"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "devices" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Client List ──────────────────────────────────────────────
    const clientCompanies = await mainSql`
      SELECT
        id, "company_name", "contact_person", email, phone,
        city, country, status, plan, "created_at"
      FROM "owner_clients"
      ORDER BY "created_at" DESC
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
    console.error('[TFL-STATS] Failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { connected: false, error: message },
      { status: 200 }
    )
  }
}
