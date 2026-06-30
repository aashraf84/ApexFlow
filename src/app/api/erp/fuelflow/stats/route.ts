import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const FUELFLOW_DB_URL = process.env.FUELFLOW_DATABASE_URL || ''

export async function GET() {
  if (!FUELFLOW_DB_URL) {
    return NextResponse.json({ error: 'FuelFlow database URL not configured' }, { status: 500 })
  }

  try {
    const sql = neon(FUELFLOW_DB_URL)

    // ── Overview stats ──
    const [stationCount] = await sql`SELECT COUNT(*)::int AS c FROM "Station"`
    const [activeStations] = await sql`SELECT COUNT(*)::int AS c FROM "Station" WHERE "isActive" = true`
    const [revenue] = await sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Fueling" WHERE status = 'completed'`
    const [fuelingCount] = await sql`SELECT COUNT(*)::int AS c FROM "Fueling"`
    const [tankCount] = await sql`SELECT COUNT(*)::int AS c FROM "Tank"`
    const [dispenserCount] = await sql`SELECT COUNT(*)::int AS c FROM "Dispenser"`
    const [employeeCount] = await sql`SELECT COUNT(*)::int AS c FROM "Employee"`
    const [deliveryCount] = await sql`SELECT COUNT(*)::int AS c FROM "FuelDelivery"`
    const [activeKeys] = await sql`SELECT COUNT(*)::int AS c FROM "SerialKey" WHERE status = 'active'`
    const [totalVolume] = await sql`SELECT COALESCE(SUM(volume), 0)::float AS v FROM "Fueling" WHERE status = 'completed'`

    // ── Revenue by fuel type ──
    const revenueByFuelType = await sql`
      SELECT "fuelType", COUNT(*)::int AS transactions,
        COALESCE(SUM("totalAmount"), 0)::float AS revenue,
        COALESCE(SUM(volume), 0)::float AS volume
      FROM "Fueling" WHERE status = 'completed'
      GROUP BY "fuelType" ORDER BY revenue DESC
    `

    // ── Revenue by station ──
    const revenueByStation = await sql`
      SELECT s.id, s.name, s.code, s.city, s."stationType",
        COUNT(f.id)::int AS transactions,
        COALESCE(SUM(f."totalAmount"), 0)::float AS revenue,
        COALESCE(SUM(f.volume), 0)::float AS volume
      FROM "Station" s
      LEFT JOIN "Fueling" f ON s.id = f."stationId" AND f.status = 'completed'
      GROUP BY s.id, s.name, s.code, s.city, s."stationType"
      ORDER BY revenue DESC
    `

    // ── Tank inventory ──
    const tankInventory = await sql`
      SELECT t.name, t.code, t.capacity, t."currentLevel", t."fuelType", t.status,
        s.name AS "stationName"
      FROM "Tank" t
      LEFT JOIN "Station" s ON t."stationId" = s.id
      ORDER BY t.name
    `

    // ── Recent fueling transactions ──
    const recentFuelings = await sql`
      SELECT f.id, f."fuelType", f.volume, f."pricePerUnit", f."totalAmount",
        f."paymentMethod", f.status, f."completedAt",
        s.name AS "stationName"
      FROM "Fueling" f
      LEFT JOIN "Station" s ON f."stationId" = s.id
      ORDER BY f."createdAt" DESC LIMIT 10
    `

    // ── Recent fuel deliveries ──
    const recentDeliveries = await sql`
      SELECT fd.id, fd."productType", fd."expectedVolume", fd."actualVolume",
        fd."totalCost", fd.status, fd."deliveryDate",
        s.name AS "stationName"
      FROM "FuelDelivery" fd
      LEFT JOIN "Station" s ON fd."stationId" = s.id
      ORDER BY fd."createdAt" DESC
    `

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await sql`
      SELECT TO_CHAR("completedAt", 'Mon') AS month,
        COALESCE(SUM("totalAmount"), 0)::float AS revenue
      FROM "Fueling"
      WHERE status = 'completed' AND "completedAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("completedAt", 'Mon'), DATE_TRUNC('month', "completedAt")
      ORDER BY DATE_TRUNC('month', "completedAt") ASC LIMIT 6
    `

    // ── Serial keys (licenses) ──
    const serialKeys = await sql`
      SELECT key, plan, status, "maxStations", "maxDispensers", "maxUsers",
        "activatedAt", "expiresAt"
      FROM "SerialKey" ORDER BY "createdAt" DESC
    `

    return NextResponse.json({
      erp: 'FuelFlow',
      industry: 'Fuel & Energy',
      overview: {
        stations: stationCount.c,
        activeStations: activeStations.c,
        totalRevenue: revenue.r,
        totalTransactions: fuelingCount.c,
        totalVolume: totalVolume.v,
        tanks: tankCount.c,
        dispensers: dispenserCount.c,
        employees: employeeCount.c,
        deliveries: deliveryCount.c,
        activeLicenses: activeKeys.c,
      },
      revenueByFuelType,
      revenueByStation,
      tankInventory,
      recentFuelings,
      recentDeliveries,
      revenueByMonth,
      serialKeys,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[FuelFlow Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FuelFlow stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
