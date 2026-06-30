import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const subscriptions = await withRetry((db) =>
      db.subscription.findMany({
        include: {
          client: { select: { id: true, companyName: true, email: true } },
          erpSystem: { select: { id: true, name: true, color: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({
      success: true,
      data: subscriptions,
    })
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Failed to list:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const subscription = await withRetry((db) =>
      db.subscription.create({
        data: {
          clientId: body.clientId,
          erpSystemId: body.erpSystemId,
          plan: body.plan || 'starter',
          status: body.status || 'active',
          startDate: body.startDate ? new Date(body.startDate) : new Date(),
          endDate: body.endDate ? new Date(body.endDate) : null,
          trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : null,
          monthlyFee: body.monthlyFee || 0,
          currency: body.currency || 'PKR',
          billingCycle: body.billingCycle || 'monthly',
          maxUsers: body.maxUsers || 5,
          maxLocations: body.maxLocations || null,
          maxItems: body.maxItems || null,
          includedModules: body.includedModules || null,
        },
        include: {
          client: { select: { id: true, companyName: true, email: true } },
          erpSystem: { select: { id: true, name: true, color: true } },
        },
      })
    )

    return NextResponse.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Failed to create:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
