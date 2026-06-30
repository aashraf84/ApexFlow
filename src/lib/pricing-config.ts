// ApexFlow Cloud — Pricing Plan Configuration
// Defines the 4 pricing tiers with features, limits, and Stripe price IDs.

export type PlanId = 'starter' | 'professional' | 'business' | 'enterprise'
export type BillingCycle = 'monthly' | 'annual'

export interface PricingPlan {
  id: PlanId
  name: string
  description: string
  monthlyPricePKR: number
  /** Monthly price when billed annually (annualTotal / 12, rounded) */
  annualMonthlyPricePKR: number
  /** Total annual cost (pay for 10 months, use for 12) */
  annualTotalPKR: number
  features: string[]
  limits: {
    maxUsers: number | null // null = unlimited
    maxLocations: number | null
    maxItems: number | null
    customFields: number | null
  }
  support: {
    level: string
    responseTime: string
    accountManager: boolean
    quarterlyReviews: boolean
  }
  /** Stripe Price ID for monthly billing (set in env) */
  stripePriceIdMonthly: string | null
  /** Stripe Price ID for annual billing (set in env) */
  stripePriceIdAnnual: string | null
  popular: boolean
  cta: string
}

// ─── Annual Pricing Calculation ──────────────────────────────────────────────
// Annual billing: Pay for 10 months, use for 12 (2 months free)
// This is more intuitive than a percentage discount.
// annualTotal = monthlyPrice * 10
// annualMonthlyRate = Math.round(annualTotal / 12)

// ─── Plan Definitions ────────────────────────────────────────────────────────

export const PRICING_PLANS: Record<PlanId, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started with a single ERP.',
    monthlyPricePKR: 15000,
    annualMonthlyPricePKR: 12500, // Math.round(150000 / 12)
    annualTotalPKR: 150000, // 15000 * 10
    features: [
      '1 ERP platform of your choice',
      'Up to 5 users',
      '1 business location',
      '1,000 items / SKUs',
      'Email support (48hr response)',
      'Basic reporting & dashboards',
      '5 custom fields',
      'Mobile app access',
      'Daily data backups',
    ],
    limits: {
      maxUsers: 5,
      maxLocations: 1,
      maxItems: 1000,
      customFields: 5,
    },
    support: {
      level: 'Email',
      responseTime: '48 hours',
      accountManager: false,
      quarterlyReviews: false,
    },
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? null,
    popular: false,
    cta: 'Get Started',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses that need advanced capabilities per ERP.',
    monthlyPricePKR: 35000,
    annualMonthlyPricePKR: 29167, // Math.round(350000 / 12)
    annualTotalPKR: 350000, // 35000 * 10
    features: [
      '1 ERP platform of your choice',
      'Up to 25 users',
      '5 business locations',
      '10,000 items / SKUs',
      'Priority support (4hr response)',
      'Advanced reporting & analytics',
      '50 custom fields',
      'API access & webhooks',
      'Custom workflows',
      'SSO / SAML authentication',
      'Real-time data sync',
      '30-day audit logs',
    ],
    limits: {
      maxUsers: 25,
      maxLocations: 5,
      maxItems: 10000,
      customFields: 50,
    },
    support: {
      level: 'Priority',
      responseTime: '4 hours',
      accountManager: false,
      quarterlyReviews: false,
    },
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL ?? null,
    popular: true,
    cta: 'Get Started',
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For established organizations needing premium features per ERP.',
    monthlyPricePKR: 55000,
    annualMonthlyPricePKR: 45833, // Math.round(550000 / 12)
    annualTotalPKR: 550000, // 55000 * 10
    features: [
      '1 ERP platform of your choice',
      'Up to 75 users',
      '20 business locations',
      '100,000 items / SKUs',
      'Dedicated support manager',
      'Custom reporting & BI tools',
      'Unlimited custom fields',
      'Full API access (unlimited rate)',
      'Advanced workflow automation',
      'Multi-currency & multi-language',
      '1-year audit logs',
      'Data export & migration tools',
      'Quarterly business reviews',
    ],
    limits: {
      maxUsers: 75,
      maxLocations: 20,
      maxItems: 100000,
      customFields: null, // unlimited
    },
    support: {
      level: 'Dedicated Manager',
      responseTime: '2 hours',
      accountManager: true,
      quarterlyReviews: true,
    },
    stripePriceIdMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL ?? null,
    popular: false,
    cta: 'Get Started',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations that demand everything — unlimited scale, priority, and control per ERP.',
    monthlyPricePKR: 80000,
    annualMonthlyPricePKR: 66667, // Math.round(800000 / 12)
    annualTotalPKR: 800000, // 80000 * 10
    features: [
      '1 ERP platform of your choice',
      'Unlimited users',
      'Unlimited locations',
      'Unlimited items / SKUs',
      '24/7 dedicated support + SLA',
      'Custom reporting engine',
      'Unlimited custom fields',
      'Full API + custom integrations',
      'White-label branding',
      'On-premise deployment option',
      '99.9% uptime SLA guarantee',
      'Unlimited audit logs',
      'Custom module development',
      'Dedicated account manager',
      'Priority feature requests',
      'Data residency options',
    ],
    limits: {
      maxUsers: null,
      maxLocations: null,
      maxItems: null,
      customFields: null,
    },
    support: {
      level: '24/7 Dedicated',
      responseTime: '1 hour',
      accountManager: true,
      quarterlyReviews: true,
    },
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? null,
    popular: false,
    cta: 'Contact Sales',
  },
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/** Get a pricing plan by ID */
export function getPlan(planId: PlanId): PricingPlan {
  const plan = PRICING_PLANS[planId]
  if (!plan) throw new Error(`Unknown plan: ${planId}`)
  return plan
}

/** Get the price for a specific plan and billing cycle */
export function getPlanPrice(planId: PlanId, billingCycle: BillingCycle): number {
  const plan = getPlan(planId)
  return billingCycle === 'annual' ? plan.annualTotalPKR : plan.monthlyPricePKR
}

/** Get the monthly-equivalent price for display */
export function getMonthlyDisplayPrice(planId: PlanId, billingCycle: BillingCycle): number {
  const plan = getPlan(planId)
  return billingCycle === 'annual' ? plan.annualMonthlyPricePKR : plan.monthlyPricePKR
}

/** Get the Stripe Price ID for a plan and billing cycle */
export function getStripePriceId(planId: PlanId, billingCycle: BillingCycle): string | null {
  const plan = getPlan(planId)
  return billingCycle === 'annual' ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly
}

/** Validate that a plan ID is valid */
export function isValidPlanId(planId: string): planId is PlanId {
  return planId in PRICING_PLANS
}

/** Validate that a billing cycle is valid */
export function isValidBillingCycle(cycle: string): cycle is BillingCycle {
  return cycle === 'monthly' || cycle === 'annual'
}

/** Get all plan IDs */
export function getAllPlanIds(): PlanId[] {
  return Object.keys(PRICING_PLANS) as PlanId[]
}
