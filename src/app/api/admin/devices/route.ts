import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// GET /api/admin/devices — List devices (derived from sessions)
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Get sessions as device proxies
    const sessions = await withRetry((d) =>
      d.adminSession.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    )

    // Transform sessions into device-like objects
    let devices = sessions.map(s => ({
      id: s.id,
      name: s.device || s.browser || 'Unknown Device',
      os: extractOs(s.userAgent),
      browser: s.browser || extractBrowser(s.userAgent),
      ip: s.ip || '—',
      status: new Date(s.expiresAt) > new Date() ? 'active' : 'expired',
      registered: s.createdAt,
      lastActiveAt: s.createdAt,
      userName: s.user?.name || 'Unknown',
    }))

    if (search) {
      const q = search.toLowerCase()
      devices = devices.filter(d => d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.os.toLowerCase().includes(q))
    }
    if (status && status !== 'all') {
      devices = devices.filter(d => d.status === status)
    }

    return NextResponse.json({ devices })
  } catch (error) {
    console.error('[ADMIN-DEVICES] Failed to list:', error)
    return NextResponse.json({ devices: [], error: 'Failed to fetch devices' }, { status: 500 })
  }
}

// PATCH /api/admin/devices — Block/unblock device
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()
    const { id, status, reason } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Device id and status are required' }, { status: 400 })
    }

    // For blocking, we'd typically delete the session or mark it
    // In this implementation, we'll log the action
    console.log(`[ADMIN-DEVICES] Device ${id} status changed to ${status}${reason ? ` (reason: ${reason})` : ''}`)

    return NextResponse.json({ success: true, id, status })
  } catch (error) {
    console.error('[ADMIN-DEVICES] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 })
  }
}

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
