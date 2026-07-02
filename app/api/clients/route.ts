import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Clients API
 * GET: List all clients with ERP name resolution
 * POST: Create a new client
 */

function getErpName(slug: string): string {
  if (!slug) return null
  const nameMap: Record<string, string> = {
    apparelflow: 'ApparelFlow',
    hotelflow: 'HotelFlow',
    eduflow: 'EduFlow',
    martflow: 'MartFlow',
    pharmaflow: 'PharmaFlow',
    buildflow: 'BuildFlow',
    travelflow: 'TravelFlow',
    tenantflow: 'TenantFlow',
    factoryflow: 'FactoryFlow',
    foodflow: 'FoodFlow',
    autoflow: 'AutoFlow',
    healthflow: 'HealthFlow',
    textileflow: 'TextileFlow',
    creativeflow: 'CreativeFlow',
    logisticflow: 'LogisticFlow',
    distriflow: 'DistriFlow',
    fleetflow: 'FleetFlow',
    electroflow: 'ElectroFlow',
    bookflow: 'BookFlow',
    fuelflow: 'FuelFlow',
    salonflow: 'SalonFlow',
  }
  return nameMap[slug] || slug
}

function extractLicenseType(notes: string | null): string | null {
  if (!notes) return null
  try {
    const parsed = JSON.parse(notes)
    return parsed.licenseType || null
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const clients = await db.client.findMany({
      include: {
        erpSystem: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const clientList = clients.map((c) => ({
        id: c.id,
        name: c.companyName,
        companyName: c.companyName,
        company: c.companyName,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        state: c.state,
        country: c.country,
        zipCode: c.postalCode,
        website: c.website,
        industry: c.industry,
        status: c.status,
        notes: c.notes,
        avatar: null as string | null,
        erpName: c.erpSystem?.name || getErpName(c.erpSlug),
        erpSystemId: c.erpSystemId,
        licenseType: extractLicenseType(c.notes),
        databaseStatus: null as string | null,
        source: 'local' as const,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))

    return NextResponse.json({
      data: clientList,
      clients: clientList,
    })
  } catch (error) {
    console.error('[CLIENTS] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['companyName', 'contactPerson', 'email']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const client = await db.client.create({
      data: {
        companyName: body.companyName,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        country: body.country ?? null,
        postalCode: body.postalCode ?? null,
        website: body.website ?? null,
        taxId: body.taxId ?? null,
        status: body.status ?? 'trial',
        industry: body.industry ?? null,
        businessType: body.businessType ?? null,
        companySize: body.companySize ?? null,
        notes: body.notes ?? null,
        erpSlug: body.erpSlug ?? null,
        erpSystemId: body.erpSystemId ?? null,
        databaseName: body.databaseName ?? null,
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error: unknown) {
    console.error('[CLIENTS] Failed to create:', error)
    const msg = error instanceof Error && error.message.includes('unique') ? 'Email already exists' : 'Failed to create client'
    const status = error instanceof Error && error.message.includes('unique') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}