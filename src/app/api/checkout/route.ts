import { NextRequest, NextResponse } from 'next/server'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing-config'
import { db } from '@/lib/db'

// Check if Stripe is properly configured (not a placeholder key)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_CONFIGURED = STRIPE_KEY.startsWith('sk_live_') || (STRIPE_KEY.startsWith('sk_test_') && STRIPE_KEY.length > 30)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, companyName, contactName, phone, plan, erpSlug, billingCycle } = body

    if (!email || !plan) {
      return NextResponse.json({ error: 'Email and plan are required' }, { status: 400 })
    }

    const planKey = plan as PlanId
    const planConfig = PRICING_PLANS[planKey]
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const amount = billingCycle === 'annual' ? planConfig.annualTotalPKR : planConfig.monthlyPricePKR

    // Enterprise requires custom quote
    if (planKey === 'enterprise') {
      // Try to find or create an ERP system
      let erpSystem = null
      if (erpSlug) {
        erpSystem = await db.erpSystem.findUnique({ where: { slug: erpSlug } })
      }

      const order = await db.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          erpSystemId: erpSystem?.id ?? 'unknown',
          plan: planKey,
          billingCycle: billingCycle || 'monthly',
          unitPrice: amount,
          totalAmount: amount,
          currency: 'PKR',
          status: 'pending',
          paymentStatus: 'pending',
          customerEmail: email,
          customerName: contactName || email,
          customerPhone: phone || null,
          companyName: companyName || null,
        },
      })
      return NextResponse.json({ requiresContact: true, orderId: order.id })
    }

    // If Stripe is not configured, create order and return demo success
    if (!STRIPE_CONFIGURED) {
      let erpSystem = null
      if (erpSlug) {
        erpSystem = await db.erpSystem.findUnique({ where: { slug: erpSlug } })
      }

      const order = await db.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          erpSystemId: erpSystem?.id ?? 'unknown',
          plan: planKey,
          billingCycle: billingCycle || 'monthly',
          unitPrice: amount,
          totalAmount: amount,
          currency: planConfig.monthlyPricePKR > 0 ? 'PKR' : 'PKR',
          status: 'paid',
          paymentStatus: 'paid',
          customerEmail: email,
          customerName: contactName || email,
          customerPhone: phone || null,
          companyName: companyName || null,
          paidAt: new Date(),
        },
      })

      // Create payment record for demo
      await db.payment.create({
        data: {
          orderId: order.id,
          amount: amount,
          currency: 'PKR',
          status: 'succeeded',
          method: 'card',
          cardBrand: 'visa',
          cardLast4: '4242',
        },
      })

      // Return success URL directly (demo mode)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      return NextResponse.json({ url: `${appUrl}/?checkout=success&order=${order.id}` })
    }

    // Production: Create Stripe checkout session
    const { getStripe } = await import('@/lib/stripe')
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: `ApexFlow ${planConfig.name} - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'}`,
              description: planConfig.features.slice(0, 3).join(', '),
            },
            unit_amount: amount,
            recurring: billingCycle === 'annual'
              ? { interval: 'year' }
              : { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?checkout=cancelled`,
      metadata: {
        plan: planKey,
        erpSlug: erpSlug || '',
        billingCycle: billingCycle || 'monthly',
        companyName: companyName || '',
        contactName: contactName || '',
        phone: phone || '',
      },
    })

    // Create order record
    let erpSystem = null
    if (erpSlug) {
      erpSystem = await db.erpSystem.findUnique({ where: { slug: erpSlug } })
    }

    await db.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        erpSystemId: erpSystem?.id ?? 'unknown',
        plan: planKey,
        billingCycle: billingCycle || 'monthly',
        unitPrice: amount,
        totalAmount: amount,
        currency: 'PKR',
        status: 'pending',
        paymentStatus: 'pending',
        stripeCheckoutSessionId: session.id,
        customerEmail: email,
        customerName: contactName || email,
        customerPhone: phone || null,
        companyName: companyName || null,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
