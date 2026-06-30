import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const TF_MAIN_DB = process.env.TRAVELFLOW_DATABASE_URL || ''

export async function GET() {
  if (!TF_MAIN_DB) {
    return NextResponse.json(
      { error: 'TravelFlow database not configured' },
      { status: 503 }
    )
  }

  try {
    const mainSql = neon(TF_MAIN_DB)

    // ─── Main DB Stats (TravelFlow uses OwnerClient) ─────────────
    const [clientCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerClient"
    `

    const [activeClients] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "OwnerClient" WHERE "licenseStatus" = 'active'
    `.catch(() => [{ count: 0 }])

    const [userCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "User"
    `.catch(() => [{ count: 0 }])

    const [revenueResult] = await mainSql`
      SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Invoice" WHERE "paymentStatus" = 'paid'
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

    const [serialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey"
    `.catch(() => [{ count: 0 }])

    const [activeSerialKeyCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SerialKey" WHERE status = 'active'
    `.catch(() => [{ count: 0 }])

    const [planCount] = await mainSql`
      SELECT COUNT(*)::int AS count FROM "SubscriptionPlan"
    `.catch(() => [{ count: 0 }])

    const clientsByPlan = await mainSql`
      SELECT "licenseType" AS plan, COUNT(*)::int AS count
      FROM "OwnerClient"
      WHERE "licenseType" IS NOT NULL
      GROUP BY "licenseType"
      ORDER BY count DESC
    `.catch(() => [])

    const clientCompanies = await mainSql`
      SELECT
        id, "companyName", "contactName", email, phone,
        country, city, "licenseKey", "licenseType", "licenseStatus",
        "maxPilgrims", "maxBranches", "maxStaff", features,
        "salePrice", currency, "paymentStatus", "billingCycle", "tenantId", status,
        "createdAt"
      FROM "OwnerClient"
      ORDER BY "createdAt" DESC
    `.catch(() => [])

    const serialKeys = await mainSql`
      SELECT
        sk.id, sk.key, sk."keyType", sk.label, sk.status,
        sk."deviceCount", sk."maxDevices",
        sk."expiresAt", sk."createdAt",
        oc."companyName"
      FROM "SerialKey" sk
      LEFT JOIN "OwnerClient" oc ON sk."ownerId" = oc.id
      ORDER BY sk."createdAt" DESC
    `.catch(() => [])

    const subscriptionPlans = await mainSql`
      SELECT
        id, name, slug, description,
        "monthlyPrice", "yearlyPrice", "oneTimePrice", currency,
        "maxPilgrims", "maxBranches", "maxStaff", "maxDevices",
        features, status, "sortOrder", "isPopular",
        "createdAt"
      FROM "SubscriptionPlan"
      ORDER BY "monthlyPrice" ASC
    `.catch(() => [])

    // ─── Operational Stats (all in main DB, no tenant iteration) ──
    const [pilgrimCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Pilgrim"
    `.catch(() => [{ c: 0 }])

    const [bookingCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Booking"
    `.catch(() => [{ c: 0 }])

    const [packageCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Package"
    `.catch(() => [{ c: 0 }])

    const [flightBookingCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "FlightBooking"
    `.catch(() => [{ c: 0 }])

    const [hotelCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Hotel"
    `.catch(() => [{ c: 0 }])

    const [groupCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Group"
    `.catch(() => [{ c: 0 }])

    const [internationalTravelCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "InternationalTravel"
    `.catch(() => [{ c: 0 }])

    const [supplierCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Supplier"
    `.catch(() => [{ c: 0 }])

    const [transportCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Transport"
    `.catch(() => [{ c: 0 }])

    const [visaApplicationCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "VisaApplication"
    `.catch(() => [{ c: 0 }])

    const [crmLeadCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "CRMLead"
    `.catch(() => [{ c: 0 }])

    const [branchCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Branch"
    `.catch(() => [{ c: 0 }])

    const [staffCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Staff"
    `.catch(() => [{ c: 0 }])

    const [tenantCount] = await mainSql`
      SELECT COUNT(*)::int AS c FROM "Tenant"
    `.catch(() => [{ c: 0 }])

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
        totalSerialKeys: serialKeyCount?.count ?? 0,
        activeSerialKeys: activeSerialKeyCount?.count ?? 0,
        totalPlans: planCount?.count ?? 0,
        clientsByPlan,
        clientCompanies,
        serialKeys,
        subscriptionPlans,
      },
      operations: {
        pilgrims: pilgrimCount?.c ?? 0,
        bookings: bookingCount?.c ?? 0,
        packages: packageCount?.c ?? 0,
        flightBookings: flightBookingCount?.c ?? 0,
        hotels: hotelCount?.c ?? 0,
        groups: groupCount?.c ?? 0,
        internationalTravels: internationalTravelCount?.c ?? 0,
        suppliers: supplierCount?.c ?? 0,
        transports: transportCount?.c ?? 0,
        visaApplications: visaApplicationCount?.c ?? 0,
        crmLeads: crmLeadCount?.c ?? 0,
        branches: branchCount?.c ?? 0,
        staff: staffCount?.c ?? 0,
        tenants: tenantCount?.c ?? 0,
        tenantCount: tenantCount?.c ?? 0,
      },
    })
  } catch (error) {
    console.error('[TF-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch TravelFlow stats', connected: false },
      { status: 500 }
    )
  }
}
