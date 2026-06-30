import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const AF_MAIN_DB = process.env.AUTOFLOW_DATABASE_URL || ''

export async function GET() {
  if (!AF_MAIN_DB) {
    return NextResponse.json(
      { connected: false, error: 'AutoFlow database not configured' },
      { status: 200 }
    )
  }

  try {
    const mainSql = neon(AF_MAIN_DB)

    // ─── Main DB Stats (AutoFlow uses Client/Invoice/License/Device tables) ──
    const [clientCount] = await mainSql`SELECT COUNT(*)::int AS count FROM "Client"`.catch(() => [{ count: 0 }])
    const [activeClients] = await mainSql`SELECT COUNT(*)::int AS count FROM "Client" WHERE status = 'active'`.catch(() => [{ count: 0 }])
    const [userCount] = await mainSql`SELECT COUNT(*)::int AS count FROM "User"`.catch(() => [{ count: 0 }])
    const [totalRevenue] = await mainSql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS total FROM "Invoice" WHERE status = 'paid'`.catch(() => [{ total: 0 }])
    const [totalInvoices] = await mainSql`SELECT COUNT(*)::int AS count FROM "Invoice"`.catch(() => [{ count: 0 }])
    const [totalDevices] = await mainSql`SELECT COUNT(*)::int AS count FROM "Device"`.catch(() => [{ count: 0 }])
    const [activeDevices] = await mainSql`SELECT COUNT(*)::int AS count FROM "Device" WHERE status = 'active'`.catch(() => [{ count: 0 }])
    const [totalSerialKeys] = await mainSql`SELECT COUNT(*)::int AS count FROM "License"`.catch(() => [{ count: 0 }])
    const [activeSerialKeys] = await mainSql`SELECT COUNT(*)::int AS count FROM "License" WHERE status = 'active'`.catch(() => [{ count: 0 }])

    const clientCompanies = await mainSql`
      SELECT id, "companyName", "contactPerson", email, phone, city, country, status, industry, "businessType", "companySize", "createdAt"
      FROM "Client" ORDER BY "createdAt" DESC LIMIT 20
    `.catch(() => [])

    const serialKeys = await mainSql`
      SELECT l.id, l."serialKey", l.status, l.type, l."maxUsers", l."maxDevices", l."activatedAt", l."expiresAt", l."createdAt",
        c."companyName"
      FROM "License" l
      LEFT JOIN "Client" c ON l."clientId" = c.id
      ORDER BY l."createdAt" DESC LIMIT 20
    `.catch(() => [])

    return NextResponse.json({
      connected: true,
      mainDb: {
        totalClients: clientCount?.count || 0,
        activeClients: activeClients?.count || 0,
        totalUsers: userCount?.count || 0,
        totalRevenue: totalRevenue?.total || 0,
        totalInvoices: totalInvoices?.count || 0,
        totalDevices: totalDevices?.count || 0,
        activeDevices: activeDevices?.count || 0,
        totalSerialKeys: totalSerialKeys?.count || 0,
        activeSerialKeys: activeSerialKeys?.count || 0,
        clientCompanies: clientCompanies || [],
        serialKeys: serialKeys || [],
      },
      operations: {
        vehicles: 0,
        serviceOrders: 0,
        inventoryItems: 0,
        suppliers: 0,
        purchaseOrders: 0,
        employees: 0,
        revenue: 0,
        tenants: 0,
      },
    })
  } catch (error) {
    console.error('[AUTOFLOW STATS] Error:', error)
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    )
  }
}
