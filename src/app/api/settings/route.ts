import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { testErpConnection } from '@/lib/erp-connector'

export async function GET() {
  try {
    // Try adminUser first (admin panel auth)
    const adminUser = await withRetry((d) =>
      d.adminUser.findFirst({
        where: { role: 'super_admin' },
        select: { id: true, name: true, email: true, role: true, avatar: true },
      })
    )

    if (adminUser) {
      return NextResponse.json({ profile: adminUser })
    }

    // Fallback: try User model (tenant-based)
    try {
      const user = await withRetry((d) =>
        d.user.findFirst({
          where: { role: 'admin' },
          select: { id: true, name: true, email: true, role: true },
        })
      )

      if (user) {
        return NextResponse.json({ profile: user })
      }
    } catch {
      // User model might not have data
    }

    return NextResponse.json({ profile: null }, { status: 404 })
  } catch (error) {
    console.error('[SETTINGS] Failed to fetch profile:', error)
    return NextResponse.json({ profile: null, dbWarning: 'Database unavailable' })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const data: { name?: string; email?: string; avatar?: string | null } = {}
    if (body.name !== undefined) {
      data.name = body.name
    }
    if (body.email !== undefined) {
      data.email = body.email
    }
    if (body.avatar !== undefined) {
      data.avatar = body.avatar
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Find admin user first
    const adminUser = await withRetry((d) =>
      d.adminUser.findFirst({
        where: { role: 'super_admin' },
        select: { id: true },
      })
    )

    if (adminUser) {
      const user = await withRetry((d) =>
        d.adminUser.update({
          where: { id: adminUser.id },
          data,
          select: { id: true, name: true, email: true, role: true, avatar: true },
        })
      )
      return NextResponse.json({ profile: user })
    }

    return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
  } catch (error) {
    console.error('[SETTINGS] Failed to update profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// Connection test endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { erpSlug } = body

    if (!erpSlug) {
      return NextResponse.json({ error: 'erpSlug is required' }, { status: 400 })
    }

    const result = await testErpConnection(erpSlug)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[SETTINGS] Connection test failed:', error)
    return NextResponse.json(
      { connected: false, error: 'Connection test failed' },
      { status: 500 }
    )
  }
}
