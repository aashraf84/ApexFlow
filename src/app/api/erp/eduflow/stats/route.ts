import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const EF_MAIN_DB = process.env.EDUFLOW_DATABASE_URL || ''

export async function GET() {
  if (!EF_MAIN_DB) {
    return NextResponse.json(
      { error: 'EduFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(EF_MAIN_DB)

    // ─── Main DB Stats ─────────────────────────────────────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Client" WHERE status = 'active'
    `

    const [ownerCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerUser"
    `

    const clientsByPlan = await mainSql`
      SELECT plan, COUNT(*)::int AS count
      FROM "SerialKey"
      GROUP BY plan
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "companyName", "contactPerson", "email", "phone",
        "city", "country", "status",
        "createdAt"
      FROM "Client"
      ORDER BY "createdAt" DESC
    `

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("total"), 0)::float AS r
      FROM "Invoice" WHERE status = 'paid'
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

    const [tenantCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Tenant" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    // ─── Education-specific stats ──
    const [schoolCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "School"
    `.catch(() => [{ count: 0 }])

    const [studentCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Student"
    `.catch(() => [{ count: 0 }])

    const [teacherCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Teacher"
    `.catch(() => [{ count: 0 }])

    const [staffCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "StaffMember"
    `.catch(() => [{ count: 0 }])

    const [courseCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Course"
    `.catch(() => [{ count: 0 }])

    const [classCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Class"
    `.catch(() => [{ count: 0 }])

    const [examCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Exam"
    `.catch(() => [{ count: 0 }])

    const [feePaymentCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "FeePayment"
    `.catch(() => [{ count: 0 }])

    const [feeRevenueResult] = await mainSql`
      SELECT COALESCE(SUM("paidAmount"), 0)::float AS r FROM "FeePayment" WHERE status = 'paid'
    `.catch(() => [{ r: 0 }])

    const [libraryBookCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "LibraryBook"
    `.catch(() => [{ count: 0 }])

    const [hostelCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Hostel"
    `.catch(() => [{ count: 0 }])

    const [transportRouteCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "TransportRoute"
    `.catch(() => [{ count: 0 }])

    const [scholarshipCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Scholarship"
    `.catch(() => [{ count: 0 }])

    const [admissionCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Admission"
    `.catch(() => [{ count: 0 }])

    const [alumniCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "Alumni"
    `.catch(() => [{ count: 0 }])

    // ─── Serial Key Stats ──
    const [serialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey"
    `.catch(() => [{ count: 0 }])

    const [activeSerialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

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
        activeTenants: tenantCount?.count ?? 0,
        totalSerialKeys: serialKeyCount?.count ?? 0,
        activeSerialKeys: activeSerialKeyCount?.count ?? 0,
        clientsByPlan,
        clientCompanies,
      },
      academics: {
        schools: schoolCount?.count ?? 0,
        students: studentCount?.count ?? 0,
        teachers: teacherCount?.count ?? 0,
        staff: staffCount?.count ?? 0,
        courses: courseCount?.count ?? 0,
        classes: classCount?.count ?? 0,
        exams: examCount?.count ?? 0,
        admissions: admissionCount?.count ?? 0,
        alumni: alumniCount?.count ?? 0,
        scholarships: scholarshipCount?.count ?? 0,
      },
      finance: {
        feePayments: feePaymentCount?.count ?? 0,
        feeRevenue: feeRevenueResult?.r ?? 0,
      },
      resources: {
        libraryBooks: libraryBookCount?.count ?? 0,
        hostels: hostelCount?.count ?? 0,
        transportRoutes: transportRouteCount?.count ?? 0,
      },
    })
  } catch (error) {
    console.error('[EF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch EduFlow stats', connected: false },
      { status: 500 }
    )
  }
}
