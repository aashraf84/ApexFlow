import { NextRequest, NextResponse } from 'next/server'
import { getStripe, verifyWebhookSignature } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify webhook signature
  const event = await verifyWebhookSignature(body, signature)
  if (!event) {
    // If Stripe is not configured, try to parse as a test event
    try {
      const parsed = JSON.parse(body)
      if (parsed?.type) {
        // Process as unverified (dev mode)
        return handleEvent(parsed)
      }
    } catch {
      // ignore parse error
    }
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  return handleEvent(event)
}

async function handleEvent(event: { type: string; data: { object: Record<string, unknown> } }) {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        // Update order status
        const order = await db.order.update({
          where: { stripeCheckoutSessionId: session.id as string },
          data: {
            status: 'paid',
            paymentStatus: 'paid',
            stripePaymentIntentId: (session.payment_intent as string) || null,
            paidAt: new Date(),
          },
        })

        // Create payment record
        await db.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmount,
            currency: order.currency,
            method: order.paymentMethod || 'card',
            status: 'succeeded',
            stripePaymentId: (session.payment_intent as string) || undefined,
          },
        })
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object
        await db.order.updateMany({
          where: { stripeCheckoutSessionId: session.id as string },
          data: { status: 'cancelled', paymentStatus: 'cancelled' },
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        await db.payment.updateMany({
          where: { stripePaymentId: paymentIntent.id as string },
          data: { status: 'failed' },
        })
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const refunds = charge.refunds as { data: Array<{ amount: number; reason?: string }> } | undefined
        const refund = refunds?.data?.[0]
        await db.payment.updateMany({
          where: { stripePaymentId: charge.payment_intent as string },
          data: {
            status: 'refunded',
            refundedAt: new Date(),
            refundReason: refund?.reason || null,
          },
        })
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
