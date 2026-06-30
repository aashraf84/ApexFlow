import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pkg = await withRetry((db) =>
      db.package.findUnique({
        where: { id },
        include: { erpSystem: { select: { name: true } } },
      })
    )

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('[PACKAGES] Failed to get:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await withRetry((db) =>
      db.package.findUnique({ where: { id } })
    )

    if (!existing) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    const pkg = await withRetry((db) =>
      db.package.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.slug !== undefined && { slug: body.slug }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.currency !== undefined && { currency: body.currency }),
          ...(body.plan !== undefined && { plan: body.plan }),
          ...(body.billingCycle !== undefined && { billingCycle: body.billingCycle }),
          ...(body.erpSystemId !== undefined && { erpSystemId: body.erpSystemId }),
          ...(body.features !== undefined && { features: body.features }),
          ...(body.includedOSSlugs !== undefined && { includedOSSlugs: body.includedOSSlugs }),
          ...(body.maxUsers !== undefined && { maxUsers: body.maxUsers != null ? Number(body.maxUsers) : null }),
          ...(body.maxLocations !== undefined && { maxLocations: body.maxLocations != null ? Number(body.maxLocations) : null }),
          ...(body.maxItems !== undefined && { maxItems: body.maxItems != null ? Number(body.maxItems) : null }),
          ...(body.isPopular !== undefined && { isPopular: Boolean(body.isPopular) }),
          ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
          ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
        },
      })
    )

    return NextResponse.json({ package: pkg })
  } catch (error: unknown) {
    console.error('[PACKAGES] Failed to update:', error)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A package with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await withRetry((db) =>
      db.package.findUnique({ where: { id } })
    )

    if (!existing) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)
    if (body.isPopular !== undefined) updateData.isPopular = Boolean(body.isPopular)
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder)
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.price !== undefined) updateData.price = Number(body.price)

    const pkg = await withRetry((db) =>
      db.package.update({
        where: { id },
        data: updateData,
      })
    )

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('[PACKAGES] Failed to patch:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await withRetry((db) =>
      db.package.findUnique({ where: { id } })
    )

    if (!existing) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    await withRetry((db) => db.package.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PACKAGES] Failed to delete:', error)
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    )
  }
}
