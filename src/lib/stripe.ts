// ApexFlow Cloud — Stripe Configuration
// Handles Stripe initialization and helper functions.
// In sandbox/dev mode (no STRIPE_SECRET_KEY), all operations simulate success.

import Stripe from 'stripe'

/** Whether Stripe is properly configured with a secret key */
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY

/** Stripe client instance — only created when a secret key is available */
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  }
  return stripeInstance
}

// ─── Checkout Session Helpers ────────────────────────────────────────────────

export interface CreateCheckoutParams {
  /** Price in PKR (smallest unit — we treat PKR as having no decimals) */
  amount: number
  /** Display name for the line item */
  planName: string
  /** ERP system name */
  erpName: string
  /** Billing cycle label */
  billingCycle: string
  /** Customer email */
  customerEmail: string
  /** Success URL (with {CHECKOUT_SESSION_ID} placeholder) */
  successUrl: string
  /** Cancel URL */
  cancelUrl: string
  /** Metadata to attach to the session */
  metadata: Record<string, string>
}

/**
 * Create a Stripe Checkout Session for a one-time payment.
 * Returns the session URL, or null if Stripe is not configured.
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams,
): Promise<{ sessionId: string; sessionUrl: string } | null> {
  const stripe = getStripe()
  if (!stripe) return null

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'pkr',
          unit_amount: params.amount,
          product_data: {
            name: `${params.planName} — ${params.erpName}`,
            description: `${params.erpName} ERP · ${params.billingCycle} billing`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  })

  return {
    sessionId: session.id,
    sessionUrl: session.url ?? '',
  }
}

/**
 * Retrieve a Stripe Checkout Session by ID.
 * Returns null if Stripe is not configured.
 */
export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session | null> {
  const stripe = getStripe()
  if (!stripe) return null

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  })
}

// ─── Webhook Helpers ─────────────────────────────────────────────────────────

/**
 * Verify a Stripe webhook signature.
 * Returns the parsed event, or null if verification fails or Stripe is not configured.
 */
export async function verifyWebhookSignature(
  body: string | Buffer,
  signature: string,
): Promise<Stripe.Event | null> {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) return null

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return event
  } catch {
    console.error('[Stripe] Webhook signature verification failed')
    return null
  }
}

// ─── Sandbox Mode Simulation ─────────────────────────────────────────────────

/**
 * Generate a fake session ID for sandbox mode.
 */
export function generateSandboxSessionId(): string {
  return `cs_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Simulated checkout session data for sandbox mode.
 */
export interface SandboxCheckoutResult {
  sessionId: string
  sessionUrl: string
}

/**
 * Simulate a successful checkout for sandbox/dev mode.
 * Returns a fake session ID and a success URL directly.
 */
export function simulateCheckout(
  successUrl: string,
): SandboxCheckoutResult {
  const sessionId = generateSandboxSessionId()
  // In sandbox mode, we redirect directly to the success URL
  const url = successUrl.replace('{CHECKOUT_SESSION_ID}', sessionId)
  return {
    sessionId,
    sessionUrl: url,
  }
}
