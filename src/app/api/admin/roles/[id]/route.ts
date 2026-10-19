import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/admin/roles/[id] — Fetch a single role with parsed permissions
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const { id } = await params
    const role = await withRetry((d) =>
      d.adminRole.findUnique({
        where: { id },
        include: { _count: { select: { users: true } } },
      })
    )
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

    let perms: string[] = []
    try {
      const parsed = JSON.parse(role.permissions)
      if (Array.isArray(parsed)) perms = parsed.filter((p) => typeof p === 'string')
    } catch {
      perms = []
    }

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: perms,
        usersCount: role._count?.users ?? 0,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    })
  } catch (error) {
    console.error('[ADMIN-ROLES] Failed to fetch one:', error)
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
  }
}

// PATCH /api/admin/roles/[id] — Update a role (name/description/permissions)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()

    const data: any = {}
    if (body.name !== undefined) data.name = String(body.name).trim()
    if (body.description !== undefined) data.description = body.description?.trim() || null
    if (Array.isArray(body.permissions)) {
      data.permissions = JSON.stringify(body.permissions.filter((p) => typeof p === 'string'))
    }

    const role = await withRetry((d) =>
      d.adminRole.update({
        where: { id },
        data,
        include: { _count: { select: { users: true } } },
      })
    )

    let perms: string[] = []
    try {
      const parsed = JSON.parse(role.permissions)
      if (Array.isArray(parsed)) perms = parsed.filter((p) => typeof p === 'string')
    } catch {
      perms = []
    }

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: perms,
        usersCount: role._count?.users ?? 0,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 409 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    console.error('[ADMIN-ROLES] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

// DELETE /api/admin/roles/[id] — Delete a role (only if it has no users)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response

    const { id } = await params
    const role = await withRetry((d) =>
      d.adminRole.findUnique({ where: { id }, include: { _count: { select: { users: true } } } })
    )
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    if (role._count?.users && role._count.users > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${role._count.users} user(s) are still assigned to this role` },
        { status: 409 }
      )
    }

    await withRetry((d) => d.adminRole.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    console.error('[ADMIN-ROLES] Failed to delete:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
