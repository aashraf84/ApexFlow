import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/roles — List all admin roles with user count + parsed permissions
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const roles = await withRetry((d) =>
      d.adminRole.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' },
      })
    )

    return NextResponse.json({
      roles: roles.map((r) => {
        let perms: string[] = []
        try {
          const parsed = JSON.parse(r.permissions)
          if (Array.isArray(parsed)) perms = parsed.filter((p) => typeof p === 'string')
        } catch {
          perms = []
        }
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: perms,
          usersCount: r._count?.users ?? 0,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }
      }),
    })
  } catch (error) {
    console.error('[ADMIN-ROLES] Failed to list:', error)
    return NextResponse.json({ roles: [], error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// POST /api/admin/roles — Create a new role
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const body = await request.json()
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    let permissions: string[] = []
    if (Array.isArray(body.permissions)) {
      permissions = body.permissions.filter((p: unknown) => typeof p === 'string')
    } else if (body.copyPermissionsFrom) {
      const source = await withRetry((d) => d.adminRole.findUnique({ where: { id: body.copyPermissionsFrom } }))
      if (source) {
        try {
          const parsed = JSON.parse(source.permissions)
          if (Array.isArray(parsed)) permissions = parsed.filter((p) => typeof p === 'string')
        } catch {
          permissions = []
        }
      }
    }

    const role = await withRetry((d) =>
      d.adminRole.create({
        data: {
          name: body.name.trim(),
          description: body.description?.trim() || null,
          permissions: JSON.stringify(permissions),
        },
        include: { _count: { select: { users: true } } },
      })
    )

    return NextResponse.json(
      {
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions,
          usersCount: role._count?.users ?? 0,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 409 })
    }
    console.error('[ADMIN-ROLES] Failed to create:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
