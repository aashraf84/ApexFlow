import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pkg = await withRetry((tx) =>
      tx.package.findUnique({
        where: { id },
        include: { subscriptions: true },
      })
    )

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('[Package] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.package.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const pkg = await withRetry((tx) =>
      tx.package.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description ?? undefined,
          price: body.price !== undefined ? parseFloat(String(body.price)) : undefined,
          billingCycle: body.billingCycle,
          features: body.features,
          isActive: body.isActive !== undefined ? body.isActive : undefined,
        },
      })
    )

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('[Package] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.package.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.package.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Package] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
