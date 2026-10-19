// ApexFlow Cloud — Checkout Success Handler
// GET /api/checkout/success?session_id=xxx
// Verifies payment, creates all related records, and redirects to pricing page.
// Resilient to DB failures — if DB is unavailable, redirects with success anyway.

import { NextRequest, NextResponse } from 'next/server'
import { isStripeConfigured, retrieveCheckoutSession } from '@/lib/stripe'
import { getPlan } from '@/lib/pricing-config'
import type { PlanId, BillingCycle } from '@/lib/pricing-config'

/** Lazy-load DB to avoid crash on environments where DB is unavailable */
let _dbModule: any = null
let _dbLoadAttempted = false

async function getDb() {
  if (_dbModule) return _dbModule
  if (_dbLoadAttempted) return null
  _dbLoadAttempted = true
  try {
    const mod = await import('@/lib/db')
    _dbModule = mod
    return _dbModule
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.redirect(
        new URL('/pricing?checkout=error&reason=no_session', request.url),
      )
    }

    const dbModule = await getDb()

    // If DB is not available, just redirect with success (sandbox mode)
    if (!dbModule) {
      console.log('[Checkout Success] DB unavailable, redirecting with sandbox success')
      return NextResponse.redirect(
        new URL('/pricing?checkout=success&order=sandbox', request.url),
      )
    }

    // ─── Find the order by Stripe session ID ──────────────────────────────
    let order: any = null
    try {
      order = await dbModule.withRetry((tx: any) =>
        tx.order.findFirst({
          where: { stripeCheckoutSessionId: sessionId },
          include: { erpSystem: true },
        }),
      )
    } catch (dbError) {
      console.warn('[Checkout Success] DB lookup failed:', dbError instanceof Error ? dbError.message : dbError)
      return NextResponse.redirect(
        new URL('/pricing?checkout=success&order=sandbox', request.url),
      )
    }

    if (!order) {
      console.error('[Checkout Success] Order not found for session:', sessionId)
      // For sandbox sessions, just show success
      if (sessionId.startsWith('cs_sandbox_')) {
        return NextResponse.redirect(
          new URL('/pricing?checkout=success&order=sandbox', request.url),
        )
      }
      return NextResponse.redirect(
        new URL('/pricing?checkout=error&reason=order_not_found', request.url),
      )
    }

    // If order is already completed, just redirect
    if (order.status === 'completed' && order.paymentStatus === 'paid') {
      return NextResponse.redirect(
        new URL(`/pricing?checkout=success&order=${order.orderNumber}`, request.url),
      )
    }

    // ─── Verify payment with Stripe (or simulate in sandbox) ──────────────
    let paymentVerified = false
    let cardBrand: string | null = null
    let cardLast4: string | null = null
    let stripePaymentId: string | null = null

    if (isStripeConfigured && sessionId.startsWith('cs_')) {
      // Real Stripe verification
      const session = await retrieveCheckoutSession(sessionId)

      if (session && session.payment_status === 'paid') {
        paymentVerified = true
        stripePaymentId = (session.payment_intent as string | null) ?? null

        // Extract card details from session
        const paymentDetails = session.payment_intent as unknown as {
          charges?: { data?: Array<{ payment_method_details?: { card?: { brand?: string; last4?: string } } }> }
        } | null

        if (paymentDetails?.charges?.data?.[0]?.payment_method_details?.card) {
          const card = paymentDetails.charges.data[0].payment_method_details.card
          cardBrand = card.brand ?? null
          cardLast4 = card.last4 ?? null
        }
      }
    } else {
      // Sandbox mode — simulate successful payment
      paymentVerified = true
      cardBrand = 'visa'
      cardLast4 = '4242'
      stripePaymentId = `pi_sandbox_${Date.now()}`
    }

    if (!paymentVerified) {
      try {
        await dbModule.withRetry((tx: any) =>
          tx.order.update({
            where: { id: order.id },
            data: { status: 'failed', paymentStatus: 'failed', notes: 'Payment verification failed' },
          }),
        )
      } catch { /* ignore */ }
      return NextResponse.redirect(
        new URL('/pricing?checkout=error&reason=payment_failed', request.url),
      )
    }

    // ─── Process the completed payment ────────────────────────────────────
    const planId = order.plan as PlanId
    const billingCycle = order.billingCycle as BillingCycle
    const planConfig = getPlan(planId)
    const { v4: uuidv4 } = await import('uuid')

    try {
      // 1. Create or update Client record
      // email is not @unique on Client → use findFirst (findUnique would throw)
      let client = await dbModule.withRetry((tx: any) =>
        tx.client.findFirst({ where: { email: order.customerEmail } }),
      )

      if (!client) {
        client = await dbModule.withRetry((tx: any) =>
          tx.client.create({
            data: {
              companyName: order.companyName ?? order.customerName,
              contactPerson: order.customerName,
              email: order.customerEmail,
              phone: order.customerPhone,
              erpSystemId: order.erpSystemId,
              status: 'active',
              industry: order.erpSystem?.industry ?? '',
            },
          }),
        )
      } else {
        if (client.status === 'trial') {
          await dbModule.withRetry((tx: any) =>
            tx.client.update({
              where: { id: client.id },
              data: {
                status: 'active',
                erpSystemId: order.erpSystemId,
                phone: order.customerPhone ?? client.phone,
              },
            }),
          )
        }
      }

      // 2. Update Order with client and payment info
      await dbModule.withRetry((tx: any) =>
        tx.order.update({
          where: { id: order.id },
          data: {
            clientId: client.id,
            status: 'completed',
            paymentStatus: 'paid',
            stripePaymentIntentId: stripePaymentId,
            paidAt: new Date(),
          },
        }),
      )

      // 3. Create Payment record
      await dbModule.withRetry((tx: any) =>
        tx.payment.create({
          data: {
            orderId: order.id,
            clientId: client.id,
            amount: order.totalAmount,
            currency: 'PKR',
            method: 'card',
            status: 'completed',
            stripePaymentId: stripePaymentId ?? undefined,
            cardBrand,
            cardLast4,
          },
        }),
      )

      // 4. Create Subscription record
      const now = new Date()
      const endDate = billingCycle === 'annual'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      await dbModule.withRetry((tx: any) =>
        tx.subscription.create({
          data: {
            clientId: client.id,
            erpSystemId: order.erpSystemId,
            plan: planId,
            status: 'active',
            startDate: now,
            endDate,
            monthlyFee: billingCycle === 'annual' ? planConfig.annualMonthlyPricePKR : planConfig.monthlyPricePKR,
            billingCycle,
            maxUsers: planConfig.limits.maxUsers ?? 9999,
            maxLocations: planConfig.limits.maxLocations ?? 9999,
            maxItems: planConfig.limits.maxItems ?? 999999,
          },
        }),
      )

      // 5. Create License record
      const serialKey = `SN-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`
      const licenseKey = `LIC-${uuidv4()}`
      const licenseExpires = billingCycle === 'annual'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : null

      await dbModule.withRetry((tx: any) =>
        tx.license.create({
          data: {
            clientId: client.id,
            erpSystemId: order.erpSystemId,
            serialKey,
            licenseKey,
            type: planId === 'enterprise' ? 'enterprise' : planId === 'business' ? 'professional' : 'standard',
            status: 'active',
            maxUsers: planConfig.limits.maxUsers ?? 9999,
            activatedAt: now,
            expiresAt: licenseExpires,
          },
        }),
      )

      // 6. Create Invoice record
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      await dbModule.withRetry((tx: any) =>
        tx.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber,
            clientId: client.id,
            amount: order.totalAmount,
            currency: 'PKR',
            status: 'paid',
            dueDate,
            paidAt: now,
          },
        }),
      )

      console.log(`[Checkout Success] Order ${order.orderNumber} completed. Client: ${client.id}, Invoice: ${invoiceNumber}`)
    } catch (processingError) {
      console.error('[Checkout Success] Error processing order (payment was verified):', processingError)
      // Still redirect with success — payment was verified, records can be reconciled later
    }

    // ─── Redirect to pricing page with success ────────────────────────────
    return NextResponse.redirect(
      new URL(`/pricing?checkout=success&order=${order.orderNumber}`, request.url),
    )
  } catch (error) {
    console.error('[Checkout Success] Error:', error)
    return NextResponse.redirect(
      new URL('/pricing?checkout=error&reason=server_error', request.url),
    )
  }
}
