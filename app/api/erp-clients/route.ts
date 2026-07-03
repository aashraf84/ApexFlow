import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * ERP Clients API
 *
 * Fetches clients registered under a specific ERP slug from the local database.
 * Falls back to demo data when no local DB records exist.
 *
 * Query params:
 *   slug — ERP slug (e.g. 'apparelflow', 'hotelflow')
 *   limit — max clients to return (default 10)
 */

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

  try {
    // Fetch from local Client table by erpSlug
    const clients = await db.client.findMany({
      where: { erpSlug: slug },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get total count for this ERP
    const totalClients = await db.client.count({
      where: { erpSlug: slug },
    })

    return NextResponse.json({
      connected: true,
      slug,
      totalClients,
      clients: clients.map((c) => {
        // Extract licenseType from notes JSON if present
        let licenseType: string | null = null
        if (c.notes) {
          try {
            const parsed = JSON.parse(c.notes)
            licenseType = parsed.licenseType || null
          } catch { /* ignore */ }
        }

        return {
          id: c.id,
          companyName: c.companyName,
          contactPerson: c.contactPerson || '—',
          email: c.email || '',
          phone: c.phone || null,
          city: c.city || null,
          country: c.country || 'Pakistan',
          isActive: c.status === 'active',
          status: c.status,
          industry: c.industry || null,
          licenseType,
          createdAt: c.createdAt,
        }
      }),
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
