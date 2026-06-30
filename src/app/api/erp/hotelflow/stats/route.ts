import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const HF_MAIN_DB = process.env.HOTELFLOW_DATABASE_URL || ''

export async function GET() {
  if (!HF_MAIN_DB) {
    return NextResponse.json(
      { error: 'HotelFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(HF_MAIN_DB)

    // ─── Main DB Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerClient"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerClient" WHERE status = 'active'
    `

    const [userCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "User"
    `

    const clientsByPlan = await mainSql`
      SELECT plan, COUNT(*)::int AS count
      FROM "OwnerClient"
      GROUP BY plan
      ORDER BY count DESC
    `

    const clientCompanies = await mainSql`
      SELECT
        id, "companyName", "contactPerson", "email", "phone",
        "serialKey", "plan", "status", "monthlyFee",
        "maxProperties", "maxRooms", "maxUsers",
        "createdAt"
      FROM "OwnerClient"
      ORDER BY "createdAt" DESC
    `

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r
      FROM "OwnerInvoice" WHERE status = 'paid'
    `

    const [invoiceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerInvoice"
    `

    const [deviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerDevice"
    `

    const [activeDeviceCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerDevice" WHERE "isActive" = true
    `

    const [tenantCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "TenantRegistry" WHERE status = 'active'
    `

    // ─── Property/Room/Reservation Stats (across all properties) ──
    const [propertyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Property"
    `

    const [roomCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Room"
    `

    const [reservationCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Reservation"
    `

    const [guestCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Guest"
    `

    const [staffCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Staff"
    `

    const [eventCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Event"
    `

    const [posOrderCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "POSOrder"
    `

    const [housekeepingCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "HousekeepingTask"
    `

    const [inventoryCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "InventoryItem"
    `

    // ─── Latest occupancy snapshot ──
    const [latestSnapshot] = await mainSql`
      SELECT "occupancyRate", "adr", "revpar", "totalRevenue", "roomRevenue", "fbRevenue"
      FROM "DailySnapshot"
      ORDER BY date DESC
      LIMIT 1
    `.catch(() => [null])

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
        activeTenants: tenantCount?.count ?? 0,
        clientsByPlan,
        clientCompanies,
      },
      operations: {
        properties: propertyCount?.count ?? 0,
        rooms: roomCount?.count ?? 0,
        reservations: reservationCount?.count ?? 0,
        guests: guestCount?.count ?? 0,
        staff: staffCount?.count ?? 0,
        events: eventCount?.count ?? 0,
        posOrders: posOrderCount?.count ?? 0,
        housekeepingTasks: housekeepingCount?.count ?? 0,
        inventoryItems: inventoryCount?.count ?? 0,
      },
      snapshot: latestSnapshot || null,
    })
  } catch (error) {
    console.error('[HF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HotelFlow stats', connected: false },
      { status: 500 }
    )
  }
}
