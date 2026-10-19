import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateKey(prefix: string, segments = 4, segLen = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const parts: string[] = []
  for (let p = 0; p < segments; p++) {
    let seg = ''
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)]
    }
    parts.push(seg)
  }
  return `${prefix}-${parts.join('-')}`
}

function generateSerialKey(): string {
  // AF-LIC-XXXXXXXX-XXXX format (ErpFlow / ApparelFlow-style serial)
  return generateKey('AF-LIC', 2, 8)
}

function generateLicenseKey(): string {
  // 5 segments of 5 chars (standard long-form license)
  return generateKey('AF', 5, 5)
}

// GET /api/admin/licenses — list licenses with filters (search, status, erpId)
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const status = searchParams.get('status') || ''
    const erpId = searchParams.get('erpId') || ''

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (erpId && erpId !== 'all') where.erpSystemId = erpId

    if (search) {
      where.OR = [
        { serialKey: { contains: search, mode: 'insensitive' } },
        { licenseKey: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { contactPerson: { contains: search, mode: 'insensitive' } } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const licenses = await withRetry((d) =>
      d.license.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              name: true,
              email: true,
              company: true,
            },
          },
          erpSystem: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
    )

    // Stats from ALL licenses
    const allLicenses = await withRetry((d) =>
      d.license.findMany({
        select: {
          status: true,
          erpSystemId: true,
          erpSystem: { select: { name: true, slug: true } },
        },
      })
    )

    const byErp: Record<string, { name: string; count: number }> = {}
    const counts: Record<string, number> = {
      active: 0,
      expired: 0,
      suspended: 0,
      revoked: 0,
      pending: 0,
    }

    for (const l of allLicenses) {
      counts[l.status] = (counts[l.status] || 0) + 1
      const erpName = l.erpSystem?.name || 'Unassigned'
      if (!byErp[erpName]) byErp[erpName] = { name: erpName, count: 0 }
      byErp[erpName].count++
    }

    return NextResponse.json({
      licenses,
      stats: {
        total: allLicenses.length,
        active: counts.active || 0,
        expired: counts.expired || 0,
        suspended: counts.suspended || 0,
        revoked: counts.revoked || 0,
        byErp: Object.values(byErp).sort((a, b) => b.count - a.count),
      },
    })
  } catch (error) {
    console.error('[ADMIN-LICENSES] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch licenses', licenses: [], stats: null },
      { status: 500 }
    )
  }
}

// POST /api/admin/licenses — generate a new license
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const {
      clientId,
      packageId,
      erpSystemId,
      type = 'standard',
      maxUsers = 5,
      maxDevices = 3,
      expiresAt,
    } = body as {
      clientId?: string
      packageId?: string
      erpSystemId?: string
      type?: string
      maxUsers?: number
      maxDevices?: number
      expiresAt?: string
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }

    // Validate client exists
    const client = await withRetry((d) =>
      d.client.findUnique({ where: { id: clientId }, select: { id: true, companyName: true, erpSystemId: true } })
    )
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Resolve ERP system — prefer request body, fall back to client's ERP
    const resolvedErpId = erpSystemId || client.erpSystemId || undefined

    // Resolve package + apply its limits if provided
    let pkgMaxUsers: number | undefined
    let pkgMaxDevices: number | undefined
    if (packageId) {
      const pkg = await withRetry((d) =>
        d.package.findUnique({ where: { id: packageId }, select: { id: true, name: true, maxUsers: true } })
      )
      if (!pkg) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 })
      }
      pkgMaxUsers = pkg.maxUsers ?? undefined
    }

    // Generate unique serialKey + licenseKey (retry on collision)
    let serialKey = ''
    let licenseKey = ''
    let attempts = 0
    while (attempts < 10) {
      serialKey = generateSerialKey()
      licenseKey = generateLicenseKey()
      const existing = await withRetry((d) =>
        d.license.findFirst({
          where: { OR: [{ serialKey }, { licenseKey }] },
          select: { id: true },
        })
      )
      if (!existing) break
      attempts++
    }

    const created = await withRetry((d) =>
      d.license.create({
        data: {
          clientId,
          erpSystemId: resolvedErpId || null,
          serialKey,
          licenseKey,
          type,
          status: 'active',
          maxUsers: Number(pkgMaxUsers || maxUsers || 5),
          maxDevices: Number(maxDevices || 3),
          activatedAt: new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
        include: {
          client: { select: { id: true, companyName: true } },
          erpSystem: { select: { id: true, name: true, slug: true } },
        },
      })
    )

    return NextResponse.json({ license: created })
  } catch (error) {
    console.error('[ADMIN-LICENSES] Failed to create:', error)
    return NextResponse.json({ error: 'Failed to generate license' }, { status: 500 })
  }
}

// PATCH /api/admin/licenses — revoke / reactivate / update fields
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { id, action, status, maxUsers, maxDevices, expiresAt } = body as {
      id?: string
      action?: 'revoke' | 'reactivate' | 'update'
      status?: string
      maxUsers?: number
      maxDevices?: number
      expiresAt?: string
    }

    if (!id) {
      return NextResponse.json({ error: 'License id is required' }, { status: 400 })
    }

    const existing = await withRetry((d) => d.license.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (action === 'revoke' || status === 'revoked') {
      data.status = 'revoked'
    } else if (action === 'reactivate' || status === 'active') {
      data.status = 'active'
      data.activatedAt = new Date()
    } else if (status) {
      data.status = status
    }
    if (maxUsers !== undefined) data.maxUsers = Number(maxUsers)
    if (maxDevices !== undefined) data.maxDevices = Number(maxDevices)
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null

    const updated = await withRetry((d) =>
      d.license.update({ where: { id }, data })
    )

    return NextResponse.json({ license: updated })
  } catch (error) {
    console.error('[ADMIN-LICENSES] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update license' }, { status: 500 })
  }
}
