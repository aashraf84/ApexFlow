import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SALONFLOW_DB_URL = process.env.SALONFLOW_DATABASE_URL || ''

export async function GET() {
  if (!SALONFLOW_DB_URL) {
    return NextResponse.json({ error: 'SalonFlow database URL not configured' }, { status: 500 })
  }

  try {
    const sql = neon(SALONFLOW_DB_URL)

    // Use Promise.allSettled so individual failures don't crash the whole route
    const [
      clients, activeClients, revenue, invoiceCount, appointmentCount,
      customerCount, staffCount, serviceCount, branchCount, activeBranches,
      activeKeys, membershipCount, activeMemberships, membershipPlanCount,
      loyaltyMembers, totalLoyaltyPoints,
    ] = await Promise.allSettled([
      sql`SELECT COUNT(*) as count FROM "OwnerClient"`,
      sql`SELECT COUNT(*) as count FROM "OwnerClient" WHERE status = 'active'`,
      sql`SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "OwnerInvoice" WHERE "paymentStatus" = 'paid'`,
      sql`SELECT COUNT(*) as count FROM "OwnerInvoice"`,
      sql`SELECT COUNT(*) as count FROM "Appointment"`,
      sql`SELECT COUNT(*) as count FROM "Customer"`,
      sql`SELECT COUNT(*) as count FROM "Staff"`,
      sql`SELECT COUNT(*) as count FROM "Service"`,
      sql`SELECT COUNT(*) as count FROM "Branch"`,
      sql`SELECT COUNT(*) as count FROM "Branch" WHERE "isActive" = true`,
      sql`SELECT COUNT(*) as count FROM "SerialKey" WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM "Membership"`,
      sql`SELECT COUNT(*) as count FROM "Membership" WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM "MembershipPlan" WHERE "isActive" = true`,
      sql`SELECT COUNT(*) as count FROM "Customer" WHERE "loyaltyPoints" > 0`,
      sql`SELECT COALESCE(SUM("loyaltyPoints"), 0) as total FROM "Customer"`,
    ])

    const getCount = (result: PromiseSettledResult<any[]>) =>
      result.status === 'fulfilled' ? Number(result.value[0]?.count || 0) : 0
    const getTotal = (result: PromiseSettledResult<any[]>) =>
      result.status === 'fulfilled' ? Number(result.value[0]?.total || 0) : 0

    // Optional detailed queries — wrapped in try/catch
    let revenueByService: any[] = []
    try {
      revenueByService = await sql`
        SELECT sc.name AS category, COUNT(a.id)::int AS appointments,
          COALESCE(SUM(a."totalAmount"), 0)::float AS revenue
        FROM "ServiceCategory" sc
        LEFT JOIN "Service" s ON s."categoryId" = sc.id
        LEFT JOIN "AppointmentService" aps ON aps."serviceId" = s.id
        LEFT JOIN "Appointment" a ON aps."appointmentId" = a.id AND a.status = 'completed'
        GROUP BY sc.name
        ORDER BY revenue DESC
      `
    } catch { /* ignore */ }

    let revenueByBranch: any[] = []
    try {
      revenueByBranch = await sql`
        SELECT b.id, b.name, b."branchCode",
          COUNT(a.id)::int AS appointments,
          COALESCE(SUM(a."totalAmount"), 0)::float AS revenue
        FROM "Branch" b
        LEFT JOIN "Appointment" a ON a."branchId" = b.id AND a.status = 'completed'
        GROUP BY b.id, b.name, b."branchCode"
        ORDER BY revenue DESC
      `
    } catch { /* ignore */ }

    let topStaff: any[] = []
    try {
      topStaff = await sql`
        SELECT s.id, s."firstName", s."lastName", s.role, s.specialization,
          COUNT(a.id)::int AS appointments,
          COALESCE(SUM(a."totalAmount"), 0)::float AS revenue
        FROM "Staff" s
        LEFT JOIN "Appointment" a ON a."staffId" = s.id AND a.status = 'completed'
        GROUP BY s.id, s."firstName", s."lastName", s.role, s.specialization
        ORDER BY appointments DESC
        LIMIT 10
      `
    } catch { /* ignore */ }

    let recentAppointments: any[] = []
    try {
      recentAppointments = await sql`
        SELECT a.id, a.date, a."startTime", a."endTime", a.status, a."totalAmount", a.type,
          c."firstName" || ' ' || c."lastName" AS "customerName",
          s."firstName" || ' ' || s."lastName" AS "staffName",
          b.name AS "branchName"
        FROM "Appointment" a
        LEFT JOIN "Customer" c ON a."customerId" = c.id
        LEFT JOIN "Staff" s ON a."staffId" = s.id
        LEFT JOIN "Branch" b ON a."branchId" = b.id
        ORDER BY a."createdAt" DESC LIMIT 10
      `
    } catch { /* ignore */ }

    let revenueByMonth: any[] = []
    try {
      revenueByMonth = await sql`
        SELECT TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "OwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC LIMIT 6
      `
    } catch { /* ignore */ }

    let serialKeys: any[] = []
    try {
      serialKeys = await sql`
        SELECT key, type, status, "maxDevices", "activeDevices",
          "activatedAt", "validUntil"
        FROM "SerialKey" ORDER BY "createdAt" DESC
      `
    } catch { /* ignore */ }

    return NextResponse.json({
      slug: 'salonflow',
      name: 'SalonFlow',
      connected: true,
      stats: {
        clients: getCount(clients),
        activeClients: getCount(activeClients),
        totalRevenue: getTotal(revenue),
        totalInvoices: getCount(invoiceCount),
        appointments: getCount(appointmentCount),
        customers: getCount(customerCount),
        staff: getCount(staffCount),
        services: getCount(serviceCount),
        branches: getCount(branchCount),
        activeBranches: getCount(activeBranches),
        activeLicenses: getCount(activeKeys),
        memberships: getCount(membershipCount),
        activeMemberships: getCount(activeMemberships),
        membershipPlans: getCount(membershipPlanCount),
        loyaltyMembers: getCount(loyaltyMembers),
        totalLoyaltyPoints: getTotal(totalLoyaltyPoints),
      },
      revenueByService,
      revenueByBranch,
      topStaff,
      recentAppointments,
      revenueByMonth,
      serialKeys,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[SalonFlow Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SalonFlow stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
