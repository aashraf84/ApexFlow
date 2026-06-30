import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, reason } = await req.json()
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      // Sandbox mode — simulate refund
      await db.payment.updateMany({
        where: { stripePaymentId: paymentIntentId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          refundReason: reason || 'Admin initiated refund (sandbox)',
        },
      })

      await db.order.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: 'refunded', paymentStatus: 'refunded' },
      })

      return NextResponse.json({ success: true, refundId: `re_sandbox_${Date.now()}` })
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: { adminReason: reason || '' },
    })

    await db.payment.updateMany({
      where: { stripePaymentId: paymentIntentId },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
        refundReason: reason || 'Admin initiated refund',
      },
    })

    await db.order.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: 'refunded', paymentStatus: 'refunded' },
    })

    return NextResponse.json({ success: true, refundId: refund.id })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 })
  }
}
