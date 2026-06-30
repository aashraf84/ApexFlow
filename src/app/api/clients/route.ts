import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { getAggregatedStats } from '@/lib/erp-connector'

export async function GET() {
  try {
    // Get local ApexFlow clients
    const localClients = await withRetry((db) =>
      db.client.findMany({
        include: {
          erpSystem: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    // Get live clients from connected ERPs
    const erpStats = await getAggregatedStats()

    // Combine both sources
    const allClients = [
      ...localClients.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        city: c.city,
        country: c.country,
        status: c.status,
        industry: c.industry,
        erpName: c.erpSystem?.name || null,
        erpSystemId: c.erpSystemId,
        licenseType: null as string | null,
        databaseStatus: null as string | null,
        source: 'local' as const,
        createdAt: c.createdAt,
      })),
      ...erpStats.clients.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        city: c.city,
        country: c.country,
        status: c.status,
        industry: c.industry,
        erpName: c.erpName,
        erpSystemId: null as string | null,
        licenseType: c.licenseType,
        databaseStatus: c.databaseStatus,
        source: 'erp' as const,
        createdAt: c.createdAt,
      })),
    ]

    return NextResponse.json({ clients: allClients })
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

    const client = await withRetry((db) =>
      db.client.create({
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
          erpSystemId: body.erpSystemId ?? null,
          databaseName: body.databaseName ?? null,
        },
      })
    )

    return NextResponse.json({ client }, { status: 201 })
  } catch (error: unknown) {
    console.error('[CLIENTS] Failed to create:', error)
    const msg = error instanceof Error && error.message.includes('unique') ? 'Email already exists' : 'Failed to create client'
    const status = error instanceof Error && error.message.includes('unique') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
