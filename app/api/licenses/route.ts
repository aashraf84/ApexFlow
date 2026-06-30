import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { randomUUID } from 'crypto'
import { getAggregatedStats } from '@/lib/erp-connector'

export async function GET() {
  try {
    // Get local licenses
    const localLicenses = await withRetry((db) =>
      db.license.findMany({
        include: {
          client: { select: { companyName: true } },
          erpSystem: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    // Get live licenses from connected ERPs
    const erpStats = await getAggregatedStats()

    // Combine both sources
    const allLicenses = [
      ...localLicenses.map((lic) => ({
        id: lic.id,
        serialKey: lic.serialKey,
        licenseKey: lic.licenseKey,
        clientName: lic.client?.companyName || 'Unknown',
        erpName: lic.erpSystem?.name || null,
        erpSlug: null as string | null,
        type: lic.type || 'standard',
        status: lic.status,
        maxUsers: lic.maxUsers || 5,
        maxDevices: lic.maxDevices || 3,
        deviceName: null as string | null,
        activatedAt: lic.activatedAt,
        expiresAt: lic.expiresAt,
        source: 'local' as const,
        createdAt: lic.createdAt,
      })),
      ...erpStats.licenses.map((lic) => ({
        id: lic.id,
        serialKey: lic.serialKey,
        licenseKey: lic.serialKey, // AF uses serialKey as the main key
        clientName: lic.clientName,
        erpName: lic.erpName,
        erpSlug: lic.erpSlug,
        type: lic.licenseType || 'standard',
        status: lic.status,
        maxUsers: null as number | null,
        maxDevices: null as number | null,
        deviceName: lic.deviceName,
        activatedAt: lic.activatedAt,
        expiresAt: lic.expiresAt,
        source: 'erp' as const,
        createdAt: lic.createdAt,
      })),
    ]

    return NextResponse.json({ licenses: allLicenses })
  } catch (error) {
    console.error('[LICENSES] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.clientId || !body.erpSystemId) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, erpSystemId' },
        { status: 400 }
      )
    }

    const serialKey = `SN-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`
    const licenseKey = `LIC-${randomUUID().toUpperCase()}`

    const license = await withRetry((db) =>
      db.license.create({
        data: {
          clientId: body.clientId,
          serialKey,
          licenseKey,
          erpSystemId: body.erpSystemId,
          type: body.type ?? 'standard',
          status: body.status ?? 'active',
          maxUsers: body.maxUsers ?? 5,
          maxDevices: body.maxDevices ?? 3,
          activatedAt: body.activatedAt ? new Date(body.activatedAt) : null,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          lastVerifiedAt: body.lastVerifiedAt ? new Date(body.lastVerifiedAt) : null,
        },
      })
    )

    return NextResponse.json({ license }, { status: 201 })
  } catch (error: unknown) {
    console.error('[LICENSES] Failed to create:', error)
    const msg = error instanceof Error && error.message.includes('unique') ? 'Serial key or license key already exists' : 'Failed to create license'
    const status = error instanceof Error && error.message.includes('unique') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
