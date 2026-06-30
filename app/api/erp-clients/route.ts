import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

/**
 * Generic ERP Clients API
 * Fetches real client data from any ERP's connected database.
 * Falls back gracefully if the ERP database is not configured or unreachable.
 *
 * Query params:
 *   slug — ERP slug (e.g. 'apparelflow', 'hotelflow')
 *   limit — max clients to return (default 10)
 */

const TIMEOUT_MS = 10_000

function fetchTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]).catch(() => fallback)
}

// Map each ERP slug to its database URL env var
function getDbUrl(slug: string): string {
  const envMap: Record<string, string> = {
    apparelflow: process.env.APPARELFLOW_DATABASE_URL || '',
    hotelflow: process.env.HOTELFLOW_DATABASE_URL || '',
    eduflow: process.env.EDUFLOW_DATABASE_URL || '',
    martflow: process.env.MARTFLOW_DATABASE_URL || '',
    pharmaflow: process.env.PHARMAFLOW_DATABASE_URL || '',
    buildflow: process.env.BUILDFLOW_DATABASE_URL || '',
    travelflow: process.env.TRAVELFLOW_DATABASE_URL || '',
    tenantflow: process.env.TENANTFLOW_DATABASE_URL || '',
    factoryflow: process.env.FACTORYFLOW_DATABASE_URL || '',
    foodflow: process.env.FOODFLOW_DATABASE_URL || '',
    autoflow: process.env.AUTOFLOW_DATABASE_URL || '',
    healthflow: process.env.HEALTHFLOW_DATABASE_URL || '',
    textileflow: process.env.TEXTILEFLOW_DATABASE_URL || '',
    creativeflow: process.env.CREATIVEFLOW_DATABASE_URL || '',
    logisticflow: process.env.LOGISTICFLOW_DATABASE_URL || '',
    distriflow: process.env.DISTRIFLOW_DATABASE_URL || '',
    fleetflow: process.env.FLEETFLOW_DATABASE_URL || '',
    electroflow: process.env.ELECTROFLOW_DATABASE_URL || '',
    bookflow: process.env.BOOKFLOW_DATABASE_URL || '',
    fuelflow: process.env.FUELFLOW_DATABASE_URL || '',
    salonflow: process.env.SALONFLOW_DATABASE_URL || '',
  }
  return envMap[slug] || ''
}

// Per-ERP query function — each ERP has a different client table schema
async function fetchClients(slug: string, dbUrl: string, limit: number): Promise<any[]> {
  const sql = neon(dbUrl)

  switch (slug) {
    case 'apparelflow':
      return fetchTimeout(
        sql`SELECT id, "companyName", "contactPerson", "email", "phone", "city", "country", "isActive", "businessType" as industry, "licenseType", "createdAt" FROM "ClientCompany" WHERE "isActive" = true AND "companyName" IS NOT NULL AND "companyName" != 'Unknown' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    case 'hotelflow':
      return fetchTimeout(
        sql`SELECT id, "companyName", "contactPerson", "email", "phone", NULL as city, NULL as country, CASE WHEN status = 'active' THEN true ELSE false END as "isActive", NULL as industry, plan as "licenseType", "createdAt" FROM "OwnerClient" WHERE status = 'active' AND "companyName" IS NOT NULL AND "companyName" != '' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    case 'eduflow':
      return fetchTimeout(
        sql`SELECT id, "institutionName" as "companyName", "contactPerson", "email", "phone", "city", NULL as country, CASE WHEN status = 'active' THEN true ELSE false END as "isActive", NULL as industry, plan as "licenseType", "createdAt" FROM "Client" WHERE status = 'active' AND "institutionName" IS NOT NULL AND "institutionName" != '' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    case 'pharmaflow':
    case 'foodflow':
    case 'autoflow':
    case 'textileflow':
    case 'creativeflow':
    case 'logisticflow':
    case 'distriflow':
    case 'electroflow':
    case 'bookflow':
      return fetchTimeout(
        sql`SELECT id, "companyName", "contactPerson", "email", "phone", "city", NULL as country, CASE WHEN status = 'active' THEN true ELSE false END as "isActive", NULL as industry, plan as "licenseType", "createdAt" FROM "Client" WHERE status = 'active' AND "companyName" IS NOT NULL AND "companyName" != '' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    case 'buildflow':
    case 'travelflow':
    case 'tenantflow':
    case 'healthflow':
    case 'fleetflow':
    case 'fuelflow':
    case 'salonflow':
      return fetchTimeout(
        sql`SELECT id, "companyName", "contactPerson", "email", "phone", NULL as city, NULL as country, CASE WHEN status = 'active' THEN true ELSE false END as "isActive", NULL as industry, plan as "licenseType", "createdAt" FROM "OwnerClient" WHERE status = 'active' AND "companyName" IS NOT NULL AND "companyName" != '' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    case 'martflow':
      return fetchTimeout(
        sql`SELECT id, "companyName", "ownerName" as "contactPerson", "email", "phone", "city", NULL as country, CASE WHEN status = 'active' THEN true ELSE false END as "isActive", NULL as industry, plan as "licenseType", "createdAt" FROM "tenants" WHERE status = 'active' AND "companyName" IS NOT NULL AND "companyName" != '' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    case 'factoryflow':
      return fetchTimeout(
        sql`SELECT id, "companyName", "contactPerson", "email", "phone", "city", NULL as country, CASE WHEN status = 'active' THEN true ELSE false END as "isActive", NULL as industry, plan as "licenseType", "createdAt" FROM "Client" WHERE status = 'active' AND "companyName" IS NOT NULL AND "companyName" != '' ORDER BY "createdAt" DESC LIMIT ${limit}`,
        TIMEOUT_MS, []
      )

    default:
      return []
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!slug) {
    return NextResponse.json(
      { error: 'slug query parameter is required' },
      { status: 400 }
    )
  }

  const dbUrl = getDbUrl(slug)
  if (!dbUrl) {
    return NextResponse.json({
      connected: false,
      error: `${slug} database not configured`,
      clients: [],
    })
  }

  try {
    const clients = await fetchClients(slug, dbUrl, limit)

    return NextResponse.json({
      connected: true,
      slug,
      totalClients: clients.length,
      clients: (clients as any[]).map((c: any) => ({
        id: c.id,
        companyName: c.companyName,
        contactPerson: c.contactPerson || '—',
        email: c.email || '',
        phone: c.phone || null,
        city: c.city || null,
        country: c.country || 'Pakistan',
        isActive: c.isActive ?? true,
        industry: c.industry || null,
        licenseType: c.licenseType || null,
        createdAt: c.createdAt,
      })),
    })
  } catch (error) {
    console.error(`[ERP-CLIENTS] Failed for ${slug}:`, error)
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      clients: [],
    })
  }
}
