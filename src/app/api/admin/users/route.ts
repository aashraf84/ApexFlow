import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// GET /api/admin/users — List users with search and role filter
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (role && role !== 'all') {
      where.role = { name: role }
    }

    const users = await withRetry((d) =>
      d.adminUser.findMany({
        where,
        include: {
          adminRole: { select: { id: true, name: true } },
          _count: { select: { sessions: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ users: users.map(u => ({ ...u, role: u.adminRole?.name || u.roleId })) })
  } catch (error) {
    console.error('[ADMIN-USERS] Failed to list:', error)
    return NextResponse.json({ users: [], error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users — Create/invite user
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()
    if (!body.email || !body.name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Find or create role
    let roleId = body.roleId
    if (!roleId && body.role) {
      const role = await withRetry((d) => d.adminRole.findFirst({ where: { name: body.role } }))
      if (role) roleId = role.id
    }

    const user = await withRetry((d) =>
      d.adminUser.create({
        data: {
          name: body.name,
          email: body.email,
          password: 'changeme', // Default, should be changed on first login
          roleId: roleId || null,
          isActive: true,
        },
        include: { adminRole: { select: { id: true, name: true } } },
      })
    )

    return NextResponse.json({ user: { ...user, role: user.adminRole?.name || user.roleId } }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }
    console.error('[ADMIN-USERS] Failed to create:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

// PATCH /api/admin/users — Update user (activate/deactivate, change role)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'User id is required' }, { status: 400 })

    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.roleId !== undefined) data.roleId = body.roleId
    if (body.role !== undefined) {
      const role = await withRetry((d) => d.adminRole.findFirst({ where: { name: body.role } }))
      if (role) data.roleId = role.id
    }

    const user = await withRetry((d) =>
      d.adminUser.update({ where: { id: body.id }, data, include: { adminRole: { select: { id: true, name: true } } } })
    )

    return NextResponse.json({ user: { ...user, role: user.adminRole?.name || user.roleId } })
  } catch (error) {
    console.error('[ADMIN-USERS] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users — Delete user
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'User id is required' }, { status: 400 })

    await withRetry((d) => d.adminUser.delete({ where: { id: body.id } }))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN-USERS] Failed to delete:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
