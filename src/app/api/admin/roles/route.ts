import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// GET /api/admin/roles — List roles with user count
export async function GET() {
  try {
    const roles = await withRetry((d) =>
      d.adminRole.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' },
      })
    )

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('[ADMIN-ROLES] Failed to list:', error)
    return NextResponse.json({ roles: [], error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// POST /api/admin/roles — Create role
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()
    if (!body.name) return NextResponse.json({ error: 'Role name is required' }, { status: 400 })

    let permissions = '[]'
    // Copy permissions from existing role if specified
    if (body.copyPermissionsFrom) {
      const source = await withRetry((d) => d.adminRole.findUnique({ where: { id: body.copyPermissionsFrom } }))
      if (source) permissions = source.permissions
    }

    const role = await withRetry((d) =>
      d.adminRole.create({
        data: { name: body.name, description: body.description || null, permissions },
      })
    )

    return NextResponse.json({ role }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 409 })
    }
    console.error('[ADMIN-ROLES] Failed to create:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}

// PUT /api/admin/roles — Update role permissions
export async function PUT(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: 'Role id is required' }, { status: 400 })

    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.permissions !== undefined) data.permissions = JSON.stringify(body.permissions)

    const role = await withRetry((d) =>
      d.adminRole.update({ where: { id: body.id }, data })
    )

    return NextResponse.json({ role })
  } catch (error) {
    console.error('[ADMIN-ROLES] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
