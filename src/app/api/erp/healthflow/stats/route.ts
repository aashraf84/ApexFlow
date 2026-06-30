import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const HLF_MAIN_DB = process.env.HEALTHFLOW_DATABASE_URL || ''

export async function GET() {
  if (!HLF_MAIN_DB) {
    return NextResponse.json(
      { connected: false, error: 'Database not configured' },
      { status: 200 }
    )
  }

  try {
    const mainSql = neon(HLF_MAIN_DB)

    // ─── Client Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client"
    `.catch(() => [{ count: 0 }])

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Invoice Stats ────────────────────────────────────────────
    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "ClientInvoice"
    `.catch(() => [{ count: 0 }])

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r
      FROM "ClientInvoice" WHERE status = 'paid'
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
      SELECT COUNT(*)::int AS count FROM "DeviceActivation"
    `.catch(() => [{ count: 0 }])

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "DeviceActivation" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Client List ──────────────────────────────────────────────
    const clientCompanies = await mainSql`
      SELECT
        id, "businessName" as company, "contactPerson", "contactEmail",
        "contactPhone", city, country, status, "businessType",
        "verificationStatus", "createdAt"
      FROM "Client"
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
    console.error('[HLF-STATS] Failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { connected: false, error: message },
      { status: 200 }
    )
  }
}
