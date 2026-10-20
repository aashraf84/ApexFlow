export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const subscriptions = await withRetry((tx) =>
      tx.subscription.findMany({
        include: {
          client: { select: { id: true, name: true, company: true } },
          package: { select: { id: true, name: true, price: true, billingCycle: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: subscriptions })
  } catch (error) {
    console.error('[Subscriptions] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const { clientId, packageId, status, startDate, endDate } = body

    if (!clientId || !packageId) {
      return NextResponse.json({ error: 'ClientId and packageId are required' }, { status: 400 })
    }

    const subscription = await withRetry((tx) =>
      tx.subscription.create({
        data: {
          clientId,
          packageId,
          status: status || 'active',
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
          package: { select: { id: true, name: true, price: true, billingCycle: true } },
        },
      })
    )

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('[Subscriptions] POST error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
