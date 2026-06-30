import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subscription = await withRetry((tx) =>
      tx.subscription.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, company: true } },
          package: { select: { id: true, name: true, price: true, billingCycle: true, features: true } },
        },
      })
    )

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[Subscription] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.subscription.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const subscription = await withRetry((tx) =>
      tx.subscription.update({
        where: { id },
        data: {
          status: body.status,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined,
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
          package: { select: { id: true, name: true, price: true, billingCycle: true } },
        },
      })
    )

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[Subscription] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
