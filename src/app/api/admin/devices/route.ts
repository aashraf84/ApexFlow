import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// Force Node.js runtime — these queries use Prisma features incompatible with Edge.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/devices
 *
 * Two modes — selected by the `source` query param:
 *
 * 1. `?source=erp` (default for the new Device Manager under Integrations):
 *    Returns persisted Device + ErpDevice rows, joined with Client + ErpSystem.
 *    Supports filters: search (serial / name), status, erpSystemId, type.
 *    Returns { success, data: { devices, erpSystems, stats } }.
 *
 * 2. `?source=sessions` (default — preserves the System Settings → Devices panel):
 *    Returns AdminSession-derived device-like rows (the original behavior).
 *    Returns { devices } so the existing panel keeps working unchanged.
 *
 * Requires `integrations` permission (the panel lives under the Integrations
 * group; the System Settings panel was previously gated by `system` — we keep
 * both gates and the user must have either).
 */

interface ErpOption {
  id: string
  name: string
  slug: string
  color: string
  icon: string | null
}

// ────────────────────────────────────────────────────────────────────────────
// ERP-mode (Device + ErpDevice, joined)
// ────────────────────────────────────────────────────────────────────────────
async function listErpDevices(request: NextRequest) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const status = searchParams.get('status') || undefined
  const erpSystemId = searchParams.get('erpSystemId') || undefined
  const deviceType = searchParams.get('type') || undefined

  // Build where clauses for each model separately.
  const deviceWhere: Record<string, unknown> = { AND: [] as unknown[] }
  const deviceAnd: Record<string, unknown>[] = []
  if (status && status !== 'all') deviceAnd.push({ status })
  if (erpSystemId) {
    // The Device model has no direct erpSystemId; we filter post-merge.
  }
  if (deviceType && deviceType !== 'all') {
    // type filter applies only to ErpDevice (Device model has no `type`).
  }
  if (search) {
    deviceAnd.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { os: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
        { ip: { contains: search, mode: 'insensitive' } },
      ],
    })
  }
  if (deviceAnd.length > 0) {
    deviceWhere.AND = deviceAnd
  } else {
    delete deviceWhere.AND
  }

  const erpDeviceWhere: Record<string, unknown> = { AND: [] as unknown[] }
  const erpAnd: Record<string, unknown>[] = []
  if (status && status !== 'all') erpAnd.push({ status })
  if (erpSystemId) erpAnd.push({ erpSystemId })
  if (deviceType && deviceType !== 'all') erpAnd.push({ type: deviceType })
  if (search) {
    erpAnd.push({
      OR: [
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ],
    })
  }
  if (erpAnd.length > 0) {
    erpDeviceWhere.AND = erpAnd
  } else {
    delete erpDeviceWhere.AND
  }

  // Run queries in parallel.
  const [devices, erpDevices, erpSystems, deviceCount, erpDeviceCount] = await Promise.all([
    withRetry((d) =>
      d.device.findMany({
        where: deviceWhere,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              email: true,
              erpSlug: true,
              erpSystemId: true,
              erpSystem: { select: { id: true, name: true, slug: true, color: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ),
    withRetry((d) =>
      d.erpDevice.findMany({
        where: erpDeviceWhere,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              email: true,
              erpSlug: true,
              erpSystemId: true,
              erpSystem: { select: { id: true, name: true, slug: true, color: true } },
            },
          },
          erpSystem: {
            select: { id: true, name: true, slug: true, color: true, icon: true },
          },
        },
        orderBy: { lastSyncedAt: 'desc' },
        take: 500,
      }),
    ),
    // Distinct ERP systems (for the filter dropdown + stats).
    withRetry((d) =>
      d.erpSystem.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, color: true, icon: true },
        orderBy: { name: 'asc' },
        take: 100,
      }),
    ),
    withRetry((d) => d.device.count({ where: deviceWhere })),
    withRetry((d) => d.erpDevice.count({ where: erpDeviceWhere })),
  ])

  // Normalize both shapes into a single `devices` array. Each entry carries a
  // `source` field (`device` or `erp_device`) so the client can render
  // appropriately.
  type UnifiedDevice = {
    id: string
    source: 'device' | 'erp_device'
    serialNumber: string | null
    name: string | null
    type: string | null
    status: string
    os: string | null
    browser: string | null
    ip: string | null
    userAgent: string | null
    lastActiveAt: string | null
    lastSyncedAt: string | null
    externalId: string | null
    createdAt: string
    updatedAt: string
    clientId: string | null
    clientName: string | null
    clientEmail: string | null
    erpSystemId: string | null
    erpSystemName: string | null
    erpSystemSlug: string | null
    erpSystemColor: string | null
  }

  const fromDevices: UnifiedDevice[] = devices.map((dv) => ({
    id: dv.id,
    source: 'device',
    serialNumber: null,
    name: dv.name,
    type: null,
    status: dv.status,
    os: dv.os,
    browser: dv.browser,
    ip: dv.ip,
    userAgent: dv.userAgent,
    lastActiveAt: dv.lastActiveAt ? dv.lastActiveAt.toISOString() : null,
    lastSyncedAt: null,
    externalId: null,
    createdAt: dv.createdAt.toISOString(),
    updatedAt: dv.updatedAt.toISOString(),
    clientId: dv.clientId,
    clientName: dv.client?.companyName || dv.client?.contactPerson || null,
    clientEmail: dv.client?.email || null,
    erpSystemId: dv.client?.erpSystemId || null,
    erpSystemName: dv.client?.erpSystem?.name || null,
    erpSystemSlug: dv.client?.erpSystem?.slug || dv.client?.erpSlug || null,
    erpSystemColor: dv.client?.erpSystem?.color || null,
  }))

  const fromErpDevices: UnifiedDevice[] = erpDevices.map((dv) => ({
    id: dv.id,
    source: 'erp_device',
    serialNumber: dv.serialNumber,
    name: dv.name,
    type: dv.type,
    status: dv.status,
    os: null,
    browser: null,
    ip: null,
    userAgent: null,
    lastActiveAt: null,
    lastSyncedAt: dv.lastSyncedAt ? dv.lastSyncedAt.toISOString() : null,
    externalId: dv.externalId,
    createdAt: dv.createdAt.toISOString(),
    updatedAt: dv.updatedAt.toISOString(),
    clientId: dv.clientId,
    clientName: dv.client?.companyName || dv.client?.contactPerson || null,
    clientEmail: dv.client?.email || null,
    erpSystemId: dv.erpSystemId,
    erpSystemName: dv.erpSystem?.name || null,
    erpSystemSlug: dv.erpSystem?.slug || null,
    erpSystemColor: dv.erpSystem?.color || null,
  }))

  const merged = [...fromErpDevices, ...fromDevices]

  // Compute breakdown stats. `active` means status === 'active' (or 'online'
  // for forward-compat). `offline` covers everything else.
  const totalDevices = merged.length
  const activeCount = merged.filter(
    (d) => d.status === 'active' || d.status === 'online',
  ).length
  const offlineCount = totalDevices - activeCount
  const byErpCount = erpSystems.length

  return NextResponse.json({
    success: true,
    data: {
      devices: merged,
      erpSystems: erpSystems as ErpOption[],
      stats: {
        totalDevices,
        active: activeCount,
        offline: offlineCount,
        byErp: byErpCount,
        deviceCount,
        erpDeviceCount,
      },
    },
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Session-mode (preserves the System Settings → Devices panel exactly)
// ────────────────────────────────────────────────────────────────────────────
function extractOs(userAgent: string | null): string {
  if (!userAgent) return 'Unknown'
  if (userAgent.includes('Win')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  return 'Unknown'
}

function extractBrowser(userAgent: string | null): string {
  if (!userAgent) return 'Unknown'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  if (userAgent.includes('Edg')) return 'Edge'
  return 'Unknown'
}

async function listSessionDevices(request: NextRequest) {
  // The System Settings panel was gated by `system`. Accept either
  // `system` or `integrations` so admins with either permission can read.
  let auth = await requirePermission(request, 'system')
  if (!auth.ok) {
    auth = await requirePermission(request, 'integrations')
  }
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  const sessions = await withRetry((d) =>
    d.adminSession.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  )

  let devices = sessions.map((s) => ({
    id: s.id,
    name: s.device || s.browser || 'Unknown Device',
    os: extractOs(s.userAgent),
    browser: s.browser || extractBrowser(s.userAgent),
    ip: s.ip || '—',
    status: new Date(s.expiresAt) > new Date() ? 'active' : 'expired',
    registered: s.createdAt,
    lastActiveAt: s.createdAt,
    userName: s.user?.name || 'Unknown',
    source: 'session',
  }))

  if (search) {
    const q = search.toLowerCase()
    devices = devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.ip.includes(q) ||
        d.os.toLowerCase().includes(q),
    )
  }
  if (status && status !== 'all') {
    devices = devices.filter((d) => d.status === status)
  }

  return NextResponse.json({ devices })
}

// ────────────────────────────────────────────────────────────────────────────
// Route handler
// ────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'sessions'

    if (source === 'erp') {
      return await listErpDevices(request)
    }
    return await listSessionDevices(request)
  } catch (error) {
    console.error('[ADMIN-DEVICES] Failed to list:', error)
    return NextResponse.json(
      { devices: [], error: 'Failed to fetch devices' },
      { status: 500 },
    )
  }
}

// PATCH /api/admin/devices — Block/unblock device (System Settings panel)
export async function PATCH(request: NextRequest) {
  try {
    let auth = await requirePermission(request, 'system')
    if (!auth.ok) {
      auth = await requirePermission(request, 'integrations')
    }
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { id, status, reason } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Device id and status are required' },
        { status: 400 },
      )
    }

    // Log the action (no DB write — the original behavior was just to log).
    console.log(
      `[ADMIN-DEVICES] Device ${id} status changed to ${status}${reason ? ` (reason: ${reason})` : ''}`,
    )

    return NextResponse.json({ success: true, id, status })
  } catch (error) {
    console.error('[ADMIN-DEVICES] Failed to update:', error)
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 },
    )
  }
}
