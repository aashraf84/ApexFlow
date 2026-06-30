import { NextRequest, NextResponse } from 'next/server'
import { PRICING_PLANS, type PlanId, type BillingCycle } from '@/lib/pricing-config'
import {
  SUPPORTED_CURRENCIES,
  PAYMENT_METHODS,
  type PaymentMethodId,
  simulatePaymentResponse,
  getBankDetails,
  generatePaymentReference,
  convertFromPKR,
} from '@/lib/payment-gateways'
import { db } from '@/lib/db'

interface ModulePriceInput {
  id: string
  price: number // price in PKR (monthly)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      erpSlug,
      plan,
      billingCycle,
      customerEmail,
      customerName,
      customerPhone,
      companyName,
      paymentMethod,
      currency,
      modules,
      modulePrices, // Array of { id, price } objects from frontend
    } = body

    // ── Validate required fields ──
    if (!customerEmail || !plan || !paymentMethod || !erpSlug) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: email, plan, payment method, and ERP selection are required.' },
        { status: 400 }
      )
    }

    const planKey = plan as PlanId
    const planConfig = PRICING_PLANS[planKey]
    if (!planConfig) {
      return NextResponse.json(
        { success: false, message: 'Invalid plan selected.' },
        { status: 400 }
      )
    }

    const cycle = (billingCycle || 'monthly') as BillingCycle
    const cur = currency || 'PKR'
    const methodId = paymentMethod as PaymentMethodId
    const methodConfig = PAYMENT_METHODS[methodId]

    if (!methodConfig) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment method.' },
        { status: 400 }
      )
    }

    // ── Calculate amounts ──
    // Plan amount: for annual, use annualTotalPKR (full year); for monthly, use monthlyPricePKR
    const planAmountPKR = cycle === 'annual' ? planConfig.annualTotalPKR : planConfig.monthlyPricePKR

    // Module amount: use actual module prices from frontend (not flat 2000)
    // modulePrices is an array of { id, price } where price is monthly PKR
    let moduleMonthlyPKR = 0
    if (Array.isArray(modulePrices) && modulePrices.length > 0) {
      // Use actual prices sent from the frontend
      moduleMonthlyPKR = modulePrices.reduce((sum: number, m: ModulePriceInput) => sum + (m.price || 0), 0)
    } else if (Array.isArray(modules) && modules.length > 0) {
      // Fallback: flat rate per module if no prices provided
      moduleMonthlyPKR = modules.length * 2000
    }

    // For annual billing, module cost = monthly module cost × 12 × 0.8 (20% annual discount)
    // For monthly billing, module cost = monthly module cost
    const moduleAmountPKR = cycle === 'annual' ? Math.round(moduleMonthlyPKR * 12 * 0.8) : moduleMonthlyPKR

    // Total amount in PKR
    const totalAmountPKR = planAmountPKR + moduleAmountPKR

    // Display amount in selected currency (PKR is source of truth)
    const totalDisplayAmount = cur === 'PKR'
      ? totalAmountPKR
      : Math.round(convertFromPKR(totalAmountPKR, cur))

    // Monthly display price for subscription recurrence text
    const discountedModuleMonthlyPKR = cycle === 'annual' ? Math.round(moduleMonthlyPKR * 0.8) : moduleMonthlyPKR
    const monthlyDisplayPrice = cur === 'PKR'
      ? (cycle === 'annual' ? planConfig.annualMonthlyPricePKR + discountedModuleMonthlyPKR : planConfig.monthlyPricePKR + discountedModuleMonthlyPKR)
      : Math.round(convertFromPKR(
          cycle === 'annual' ? planConfig.annualMonthlyPricePKR + discountedModuleMonthlyPKR : planConfig.monthlyPricePKR + discountedModuleMonthlyPKR,
          cur
        ))

    // ── Find or default the ERP system ──
    let erpSystemId = 'unknown'
    try {
      if (erpSlug) {
        const erp = await db.erpSystem.findUnique({ where: { slug: erpSlug } })
        if (erp) erpSystemId = erp.id
      }
    } catch {
      // DB might not be available in all environments
    }

    // ── Generate order number ──
    const orderNumber = `APX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    // ── Check if Stripe is properly configured ──
    const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || ''
    const STRIPE_CONFIGURED = STRIPE_KEY.startsWith('sk_live_') || (STRIPE_KEY.startsWith('sk_test_') && STRIPE_KEY.length > 30)

    // ── Card / Apple Pay / Google Pay — Use Stripe if configured ──
    if (['card', 'apple_pay', 'google_pay'].includes(methodId) && STRIPE_CONFIGURED) {
      const { getStripe } = await import('@/lib/stripe')
      const stripe = getStripe()

      if (stripe) {
        // For Stripe subscription, use the RECURRING amount (per interval)
        // Monthly: monthlyPlanPrice + monthlyModulePrice
        // Annual: annualTotalPlan + (monthlyModulePrice * 12)
        const stripeRecurringAmount = totalAmountPKR

        const session = await stripe.checkout.sessions.create({
          customer_email: customerEmail,
          payment_method_types: methodId === 'card' ? ['card'] : [methodId === 'apple_pay' ? 'apple_pay' : 'card'],
          line_items: [
            {
              price_data: {
                currency: 'pkr',
                product_data: {
                  name: `ApexFlow ${planConfig.name} — ${erpSlug}`,
                  description: `${planConfig.name} plan · ${cycle} billing${moduleMonthlyPKR > 0 ? ` + ${Array.isArray(modules) ? modules.length : 0} modules` : ''}`,
                },
                unit_amount: stripeRecurringAmount * 100,
                recurring: cycle === 'annual' ? { interval: 'year' } : { interval: 'month' },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?checkout=cancelled`,
          metadata: {
            orderNumber,
            plan: planKey,
            erpSlug,
            billingCycle: cycle,
            customerName: customerName || '',
            companyName: companyName || '',
            modules: Array.isArray(modules) ? modules.join(',') : '',
            moduleMonthlyPKR: String(moduleMonthlyPKR),
          },
        })

        // Create order in DB
        try {
          await db.order.create({
            data: {
              orderNumber,
              erpSystemId,
              plan: planKey,
              billingCycle: cycle,
              unitPrice: planAmountPKR,
              totalAmount: totalAmountPKR,
              currency: cur,
              status: 'pending',
              paymentStatus: 'pending',
              stripeCheckoutSessionId: session.id,
              customerEmail,
              customerName: customerName || customerEmail,
              customerPhone: customerPhone || null,
              companyName: companyName || null,
              paymentMethod: methodId,
              modules: Array.isArray(modules) ? JSON.stringify(modules) : null,
            },
          })
        } catch {
          // DB might not be available
        }

        return NextResponse.json({
          success: true,
          data: {
            orderNumber,
            mode: 'stripe',
            paymentMethod: methodId,
            currency: cur,
            totalAmount: totalDisplayAmount,
            monthlyDisplayPrice,
            checkoutUrl: session.url,
          },
        })
      }
    }

    // ── Sandbox / Simulation mode (no real Stripe, or non-card methods) ──
    const simulation = simulatePaymentResponse(methodId, totalAmountPKR, cur)

    // Create order in DB
    let order
    try {
      order = await db.order.create({
        data: {
          orderNumber,
          erpSystemId,
          plan: planKey,
          billingCycle: cycle,
          unitPrice: planAmountPKR,
          totalAmount: totalAmountPKR,
          currency: cur,
          status: methodConfig.type === 'manual' ? 'pending' : 'paid',
          paymentStatus: methodConfig.type === 'manual' ? 'pending' : 'paid',
          customerEmail,
          customerName: customerName || customerEmail,
          customerPhone: customerPhone || null,
          companyName: companyName || null,
          paymentMethod: methodId,
          paymentReference: simulation.transactionId,
          modules: Array.isArray(modules) ? JSON.stringify(modules) : null,
          paidAt: methodConfig.type === 'manual' ? null : new Date(),
        },
      })
    } catch {
      // DB might not be available — create a mock order ID
      order = { id: `mock-${Date.now()}` }
    }

    // Create payment record
    try {
      await db.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmountPKR,
          currency: cur,
          method: methodId,
          status: methodConfig.type === 'manual' ? 'pending' : 'succeeded',
          cardBrand: methodId === 'card' ? 'visa' : null,
          cardLast4: methodId === 'card' ? '4242' : null,
        },
      })
    } catch {
      // DB might not be available
    }

    // ── Build response data based on payment method ──
    const responseData: Record<string, unknown> = {
      orderNumber,
      mode: 'sandbox',
      paymentMethod: methodId,
      currency: cur,
      totalAmount: totalDisplayAmount,
      monthlyDisplayPrice,
      transactionId: simulation.transactionId,
      paymentReference: generatePaymentReference(),
      paymentMessage: simulation.message,
      qrCodeData: simulation.qrCodeData,
    }

    // Add bank details for wire transfer
    if (methodId === 'bank_transfer') {
      responseData.bankDetails = getBankDetails(cur)
    }

    // For card/apple/google in sandbox mode — no redirect, immediate success
    if (['card', 'apple_pay', 'google_pay'].includes(methodId)) {
      responseData.mode = 'sandbox'
      responseData.checkoutUrl = null
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('[Checkout Create] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process checkout. Please try again.' },
      { status: 500 }
    )
  }
}
