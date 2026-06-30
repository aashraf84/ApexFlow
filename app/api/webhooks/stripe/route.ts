// ApexFlow Cloud — Stripe Webhook Handler
// POST /api/webhooks/stripe
// Handles Stripe webhook events: checkout.session.completed, checkout.session.expired

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { verifyWebhookSignature, isStripeConfigured, retrieveCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // ─── Only process if Stripe is configured ─────────────────────────────
    if (!isStripeConfigured) {
      return NextResponse.json(
        { success: false, message: 'Stripe not configured' },
        { status: 400 },
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header')
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 },
      )
    }

    // ─── Verify webhook signature ─────────────────────────────────────────
    const event = await verifyWebhookSignature(body, signature)

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 },
      )
    }

    // ─── Handle events ────────────────────────────────────────────────────
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          payment_status: string
          payment_intent?: string | null
          metadata?: {
            orderId?: string
            orderNumber?: string
          } | null
        }

        console.log(`[Stripe Webhook] checkout.session.completed: ${session.id}`)

        // Find order by session ID
        const order = await withRetry((tx) =>
          tx.order.findFirst({
            where: { stripeCheckoutSessionId: session.id },
          }),
        )

        if (!order) {
          console.error('[Stripe Webhook] Order not found for session:', session.id)
          break
        }

        // Only process if order is still pending
        if (order.status === 'pending' && session.payment_status === 'paid') {
          // The success route handles the full record creation.
          // The webhook acts as a backup in case the redirect was missed.
          await withRetry((tx) =>
            tx.order.update({
              where: { id: order.id },
              data: {
                status: 'completed',
                paymentStatus: 'paid',
                stripePaymentIntentId: session.payment_intent ?? undefined,
                paidAt: new Date(),
              },
            }),
          )
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as { id: string }

        console.log(`[Stripe Webhook] checkout.session.expired: ${session.id}`)

        const order = await withRetry((tx) =>
          tx.order.findFirst({
            where: { stripeCheckoutSessionId: session.id },
          }),
        )

        if (order && order.status === 'pending') {
          await withRetry((tx) =>
            tx.order.update({
              where: { id: order.id },
              data: {
                status: 'expired',
                paymentStatus: 'cancelled',
                notes: 'Checkout session expired',
              },
            }),
          )
        }
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing error' },
      { status: 500 },
    )
  }
}
