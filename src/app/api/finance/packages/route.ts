import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const packages = await withRetry((tx) =>
      tx.package.findMany({
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: packages })
  } catch (error) {
    console.error('[Packages] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, billingCycle, features, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    const pkg = await withRetry((tx) =>
      tx.package.create({
        data: {
          name,
          description: description || null,
          price: parseFloat(String(price)),
          billingCycle: billingCycle || 'monthly',
          features: features || '[]',
          isActive: isActive !== undefined ? isActive : true,
        },
      })
    )

    return NextResponse.json(pkg, { status: 201 })
  } catch (error) {
    console.error('[Packages] POST error:', error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
