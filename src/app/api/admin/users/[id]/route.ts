import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/admin/users/[id] — Fetch a single admin user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const { id } = await params
    const user = await withRetry((d) =>
      d.adminUser.findUnique({
        where: { id },
        include: {
          adminRole: { select: { id: true, name: true, description: true, permissions: true } },
          _count: { select: { sessions: true, auditLogs: true } },
        },
      })
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        roleId: user.roleId,
        roleName: user.adminRole?.name || null,
        roleDescription: user.adminRole?.description || null,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        sessionsCount: user._count?.sessions ?? 0,
        auditLogsCount: user._count?.auditLogs ?? 0,
      },
    })
  } catch (error) {
    console.error('[ADMIN-USERS] Failed to fetch one:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PATCH /api/admin/users/[id] — Update user (name/email/role/isActive/password)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()

    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.avatar !== undefined) data.avatar = body.avatar
    if (body.roleId !== undefined) data.roleId = body.roleId || null
    if (body.role !== undefined) data.role = body.role
    if (body.roleName && body.roleId === undefined) {
      const role = await withRetry((d) => d.adminRole.findFirst({ where: { name: body.roleName } }))
      if (role) data.roleId = role.id
    }
    if (body.password && body.password.length >= 6) {
      data.password = await bcrypt.hash(body.password, 10)
    }

    const user = await withRetry((d) =>
      d.adminUser.update({
        where: { id },
        data,
        include: { adminRole: { select: { id: true, name: true, description: true } } },
      })
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        roleId: user.roleId,
        roleName: user.adminRole?.name || null,
        roleDescription: user.adminRole?.description || null,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('[ADMIN-USERS] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — Delete an admin user
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const { id } = await params
    await withRetry((d) => d.adminUser.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('[ADMIN-USERS] Failed to delete:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
