import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

// GET /api/erp — List all ERP systems (database only, no fallbacks)
export async function GET() {
  try {
    const erpSystems = await withRetry((d) =>
      d.erpSystem.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })
    )

    return NextResponse.json({ erpSystems })
  } catch (error) {
    console.error('[ERP] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ERP systems', erpSystems: [] },
      { status: 500 }
    )
  }
}

// POST /api/erp — Create a new ERP system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, slug, description, icon, color, status, version,
      website, industry, features, pricing, databaseUrl, sortOrder, moduleCount,
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const existing = await withRetry((d) =>
      d.erpSystem.findUnique({ where: { slug } })
    )
    if (existing) {
      return NextResponse.json(
        { error: 'An ERP system with this slug already exists' },
        { status: 409 }
      )
    }

    const erp = await withRetry((d) =>
      d.erpSystem.create({
        data: {
          name, slug,
          description: description || null,
          icon: icon || 'building',
          color: color || 'cyan',
          status: status || 'active',
          version: version || '1.0.0',
          website: website || null,
          industry: industry || null,
          features: features || null,
          pricing: pricing || null,
          databaseUrl: databaseUrl || null,
          sortOrder: sortOrder ?? 0,
          moduleCount: moduleCount ?? 0,
        },
      })
    )

    return NextResponse.json({ erpSystem: erp }, { status: 201 })
  } catch (error) {
    console.error('[ERP] Failed to create:', error)
    return NextResponse.json(
      { error: 'Failed to create ERP system' },
      { status: 500 }
    )
  }
}

// PUT /api/erp — Update an existing ERP system
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id, name, slug, description, icon, color, status, version,
      website, industry, features, pricing, databaseUrl, sortOrder, moduleCount,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ERP system id is required' },
        { status: 400 }
      )
    }

    const existing = await withRetry((d) =>
      d.erpSystem.findUnique({ where: { id } })
    )
    if (!existing) {
      return NextResponse.json(
        { error: 'ERP system not found' },
        { status: 404 }
      )
    }

    if (slug && slug !== existing.slug) {
      const slugConflict = await withRetry((d) =>
        d.erpSystem.findUnique({ where: { slug } })
      )
      if (slugConflict) {
        return NextResponse.json(
          { error: 'An ERP system with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const erp = await withRetry((d) =>
      d.erpSystem.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(icon !== undefined && { icon }),
          ...(color !== undefined && { color }),
          ...(status !== undefined && { status }),
          ...(version !== undefined && { version }),
          ...(website !== undefined && { website }),
          ...(industry !== undefined && { industry }),
          ...(features !== undefined && { features }),
          ...(pricing !== undefined && { pricing }),
          ...(databaseUrl !== undefined && { databaseUrl }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(moduleCount !== undefined && { moduleCount }),
        },
      })
    )

    return NextResponse.json({ erpSystem: erp })
  } catch (error) {
    console.error('[ERP] Failed to update:', error)
    return NextResponse.json(
      { error: 'Failed to update ERP system' },
      { status: 500 }
    )
  }
}