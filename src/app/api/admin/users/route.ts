import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/users — List admin users with search and role filter
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
          adminRole: { select: { id: true, name: true, description: true } },
          _count: { select: { sessions: true, auditLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        roleId: u.roleId,
        roleName: u.adminRole?.name || null,
        roleDescription: u.adminRole?.description || null,
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        sessionsCount: u._count?.sessions ?? 0,
        auditLogsCount: u._count?.auditLogs ?? 0,
      })),
    })
  } catch (error) {
    console.error('[ADMIN-USERS] Failed to list:', error)
    return NextResponse.json({ users: [], error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users — Create / invite a new admin user (bcrypt-hashed password)
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const body = await request.json()
    if (!body.email || !body.name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }
    if (!body.password || body.password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Resolve role: explicit roleId takes precedence, else look up by name
    let roleId: string | null = null
    if (body.roleId) {
      const found = await withRetry((d) => d.adminRole.findUnique({ where: { id: body.roleId } }))
      if (!found) {
        return NextResponse.json({ error: 'Selected role not found' }, { status: 400 })
      }
      roleId = found.id
    } else if (body.role) {
      const role = await withRetry((d) => d.adminRole.findFirst({ where: { name: body.role } }))
      if (role) roleId = role.id
    }

    const hashed = await bcrypt.hash(body.password, 10)

    const user = await withRetry((d) =>
      d.adminUser.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashed,
          avatar: body.avatar || null,
          roleId: roleId || null,
          role: body.role || 'admin',
          isActive: body.isActive ?? true,
        },
        include: { adminRole: { select: { id: true, name: true, description: true } } },
      })
    )

    return NextResponse.json(
      {
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
          sessionsCount: 0,
          auditLogsCount: 0,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }
    console.error('[ADMIN-USERS] Failed to create:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
