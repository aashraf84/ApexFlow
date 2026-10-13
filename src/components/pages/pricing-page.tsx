'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { useNavigate } from '@/lib/use-navigate'
import { useErpSystems, getErpIcon, getErpColor } from '@/lib/erp-data'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ArrowRight,
  Users,
  BarChart3,
  Settings2,
  Plug,
  Headphones,
  HelpCircle,
  Shield,
  Smartphone,
  RefreshCw,
  Cpu,
  Lock,
  Globe,
  Zap,
  ChevronDown,
  ChevronRight,
  Star,
  Compass,
  CheckCircle2,
  XCircle,
  X,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { CheckoutModal } from '@/components/checkout/checkout-modal'
import type { PlanId } from '@/lib/pricing-config'

/* ------------------------------------------------------------------ */
/*  macOS 27 Golden Gate Animation Easing                              */
/* ------------------------------------------------------------------ */

const GG_EASE = [0.25, 0.46, 0.45, 0.94] as const

/* ------------------------------------------------------------------ */
/*  Currency Config                                                    */
/* ------------------------------------------------------------------ */

type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED'

const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string; rate: number }> = {
  PKR: { symbol: 'PKR', label: 'Pakistani Rupee', rate: 1 },
  USD: { symbol: '$', label: 'US Dollar', rate: 0.0036 },
  EUR: { symbol: '€', label: 'Euro', rate: 0.0033 },
  GBP: { symbol: '£', label: 'British Pound', rate: 0.0028 },
  SAR: { symbol: 'SAR', label: 'Saudi Riyal', rate: 0.0135 },
  AED: { symbol: 'AED', label: 'UAE Dirham', rate: 0.0132 },
}

function formatPrice(pkrPrice: number, currency: CurrencyCode): string {
  const c = CURRENCIES[currency]
  const converted = Math.round(pkrPrice * c.rate)
  if (currency === 'PKR') {
    return converted.toLocaleString('en-PK')
  }
  return converted.toLocaleString('en-US')
}

/* ------------------------------------------------------------------ */
/*  Pricing Tiers                                                      */
/* ------------------------------------------------------------------ */

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    pkrMonthly: 15000,
    description: 'Perfect for small teams getting started with a single ERP.',
    accentVar: '--gg-teal',
    color: '#0E8FA0',
    popular: false,
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
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    pkrMonthly: 35000,
    description: 'For growing businesses that need advanced capabilities per ERP.',
    accentVar: '--gg-vermillion',
    color: '#E2532F',
    popular: true,
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
    cta: 'Get Started',
  },
  {
    id: 'business',
    name: 'Business',
    pkrMonthly: 55000,
    description: 'For established organizations needing premium features per ERP.',
    accentVar: '--gg-amber',
    color: '#D4860B',
    popular: false,
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
    cta: 'Get Started',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    pkrMonthly: 80000,
    description: 'For large organizations that demand everything — unlimited scale, priority, and control per ERP.',
    accentVar: '--gg-violet',
    color: '#7C3AED',
    popular: false,
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
    cta: 'Contact Sales',
  },
]

/* ------------------------------------------------------------------ */
/*  Tier Accent Colors — Golden Gate palette                           */
/* ------------------------------------------------------------------ */

const TIER_ACCENTS: Record<string, {
  stripe: string
  check: string
  headerBg: string
  headerText: string
  glow?: string
  cardBg: string
  priceText: string
  badgeBg: string
  badgeText: string
  btnClass: string
  iconBg: string
  savingsText: string
}> = {
  starter: {
    stripe: 'from-[#0E8FA0] to-[#14B8A6]',
    check: 'text-[#0E8FA0]',
    headerBg: 'bg-[#0E8FA0]/[0.06]',
    headerText: 'text-[#0E8FA0]',
    cardBg: 'bg-[#0E8FA0]/[0.02]',
    priceText: 'text-[#0E8FA0]',
    badgeBg: 'bg-[#0E8FA0]/10',
    badgeText: 'text-[#0E8FA0]',
    btnClass: 'bg-[#0E8FA0] hover:bg-[#0B7A8C] text-white',
    iconBg: 'bg-[#0E8FA0]/10',
    savingsText: 'text-[#0E8FA0]',
  },
  professional: {
    stripe: 'from-[#E2532F] to-[#F59E0B]',
    check: 'text-[#E2532F]',
    headerBg: 'bg-[#E2532F]/[0.06]',
    headerText: 'text-[#E2532F]',
    glow: 'shadow-[var(--gg-shadow-glow)]',
    cardBg: 'bg-[#E2532F]/[0.02]',
    priceText: 'text-gradient-primary',
    badgeBg: 'bg-[#E2532F]/10',
    badgeText: 'text-[#E2532F]',
    btnClass: 'bg-[#E2532F] hover:bg-[#C94527] text-white btn-glow',
    iconBg: 'bg-[#E2532F]/10',
    savingsText: 'text-[#0E8FA0]',
  },
  business: {
    stripe: 'from-[#D4860B] to-[#F59E0B]',
    check: 'text-[#D4860B]',
    headerBg: 'bg-[#D4860B]/[0.06]',
    headerText: 'text-[#D4860B]',
    cardBg: 'bg-[#D4860B]/[0.02]',
    priceText: 'text-[#D4860B]',
    badgeBg: 'bg-[#D4860B]/10',
    badgeText: 'text-[#D4860B]',
    btnClass: 'bg-[#D4860B] hover:bg-[#B8730A] text-white',
    iconBg: 'bg-[#D4860B]/10',
    savingsText: 'text-[#0E8FA0]',
  },
  enterprise: {
    stripe: 'from-[#7C3AED] to-[#A855F7]',
    check: 'text-[#7C3AED]',
    headerBg: 'bg-[#7C3AED]/[0.06]',
    headerText: 'text-[#7C3AED]',
    cardBg: 'bg-[#7C3AED]/[0.02]',
    priceText: 'text-[#7C3AED]',
    badgeBg: 'bg-[#7C3AED]/10',
    badgeText: 'text-[#7C3AED]',
    btnClass: 'bg-[#7C3AED] hover:bg-[#6B2FCC] text-white',
    iconBg: 'bg-[#7C3AED]/10',
    savingsText: 'text-[#0E8FA0]',
  },
}

/* ------------------------------------------------------------------ */
/*  Comparison Table Data                                              */
/* ------------------------------------------------------------------ */

const COMPARISON_CATEGORIES = [
  {
    category: 'ERP Access',
    icon: <Globe className="w-4 h-4 text-primary" />,
    rows: [
      { label: 'ERP Platforms (per subscription)', starter: '1', professional: '1', business: '1', enterprise: '1' },
      { label: 'Cross-ERP Analytics', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
      { label: 'Cross-ERP Data Sync', starter: '—', professional: '✓', business: '✓', enterprise: '✓' },
    ],
  },
  {
    category: 'Users & Scale',
    icon: <Users className="w-4 h-4 text-[var(--gg-amber)]" />,
    rows: [
      { label: 'Users', starter: 'Up to 5', professional: 'Up to 25', business: 'Up to 75', enterprise: 'Unlimited' },
      { label: 'Locations', starter: '1', professional: '5', business: '20', enterprise: 'Unlimited' },
      { label: 'Items / SKUs', starter: '1,000', professional: '10,000', business: '100,000', enterprise: 'Unlimited' },
      { label: 'Custom Fields', starter: '5', professional: '50', business: 'Unlimited', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Support',
    icon: <Headphones className="w-4 h-4 text-[var(--gg-green)]" />,
    rows: [
      { label: 'Support Level', starter: 'Email', professional: 'Priority', business: 'Dedicated Manager', enterprise: '24/7 Dedicated' },
      { label: 'Response Time', starter: '48 hours', professional: '4 hours', business: '2 hours', enterprise: '1 hour' },
      { label: 'Account Manager', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
      { label: 'Quarterly Reviews', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
    ],
  },
  {
    category: 'Reporting & Analytics',
    icon: <BarChart3 className="w-4 h-4 text-[var(--gg-amber)]" />,
    rows: [
      { label: 'Reporting', starter: 'Basic', professional: 'Advanced', business: 'Custom BI', enterprise: 'Custom Engine' },
      { label: 'Dashboards', starter: '5', professional: '25', business: 'Unlimited', enterprise: 'Unlimited' },
      { label: 'Custom Reports', starter: '—', professional: '✓', business: '✓', enterprise: '✓' },
      { label: 'Audit Logs', starter: '30 days', professional: '30 days', business: '1 year', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'API & Integration',
    icon: <Plug className="w-4 h-4 text-primary" />,
    rows: [
      { label: 'API Access', starter: '—', professional: '✓', business: 'Full', enterprise: 'Full' },
      { label: 'Webhooks', starter: '—', professional: '✓', business: '✓', enterprise: '✓' },
      { label: 'Custom Integrations', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
      { label: 'Rate Limit', starter: '—', professional: '500/min', business: '5,000/min', enterprise: 'Unlimited' },
      { label: 'Data Migration Tools', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: <Shield className="w-4 h-4 text-[var(--gg-violet)]" />,
    rows: [
      { label: 'Encryption', starter: 'AES-256', professional: 'AES-256', business: 'AES-256', enterprise: 'AES-256' },
      { label: '2FA', starter: '✓', professional: '✓', business: '✓', enterprise: '✓' },
      { label: 'SSO / SAML', starter: '—', professional: '✓', business: '✓', enterprise: '✓' },
      { label: 'SLA Guarantee', starter: '—', professional: '—', business: '99.5%', enterprise: '99.9%' },
      { label: 'Data Residency', starter: '—', professional: '—', business: '—', enterprise: '✓' },
      { label: 'On-Premise Option', starter: '—', professional: '—', business: '—', enterprise: '✓' },
    ],
  },
  {
    category: 'Customization',
    icon: <Settings2 className="w-4 h-4 text-[var(--gg-teal)]" />,
    rows: [
      { label: 'Custom Workflows', starter: '—', professional: '✓', business: '✓', enterprise: '✓' },
      { label: 'White Label', starter: '—', professional: '—', business: '—', enterprise: '✓' },
      { label: 'Custom Modules', starter: '—', professional: '—', business: '—', enterprise: '✓' },
      { label: 'Multi-Currency', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
      { label: 'Multi-Language', starter: '—', professional: '—', business: '✓', enterprise: '✓' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  FAQs                                                               */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! Every plan comes with a 14-day free trial. No credit card required. You get full access to all features in your chosen tier so you can evaluate everything before committing.',
  },
  {
    question: 'Can I switch plans at any time?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately and billing is prorated. Downgrades take effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens when I exceed my plan limits?',
    answer: "We'll notify you before you hit any limits. You can upgrade your plan at any time to accommodate growth. We never cut off service unexpectedly — your operations continue running while we help you find the right tier.",
  },
  {
    question: 'Is the pricing per ERP or per organization?',
    answer: 'Pricing is per ERP. Each subscription covers one ERP platform. If you need multiple ERPs, you can subscribe to each one separately at the same per-ERP price. For example, 2 ERPs on the Professional plan would be 2 × PKR 35,000/month. Volume discounts are available for 3+ ERPs — contact sales.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major debit and credit cards (Visa, Mastercard, American Express) through our secure payment partner Stripe. We also support bank transfers, JazzCash, and EasyPaisa. For Enterprise plans, we offer purchase orders and custom invoicing with net-30 payment terms. All transactions are protected with bank-grade encryption and 3D Secure authentication.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, annual billing gives you 2 months free — you pay for 10 months and use for 12. That\'s a savings of roughly 17% compared to monthly pricing. We also offer special pricing for non-profits, educational institutions, and startups in their first year. Reach out to learn more.',
  },
  {
    question: 'Which ERP platforms can I choose?',
    answer: 'ApexFlow offers 21 active ERP platforms across industries including Apparel, Hospitality, Education, Retail, Pharma, Real Estate, Travel, Manufacturing, Food, Automotive, Healthcare, Creative, Logistics, Distribution, and more. You select the ones that match your business needs.',
  },
  {
    question: 'Can I add more ERP platforms later?',
    answer: 'Yes! Each ERP is a separate subscription, so you can add new ERPs at any time. Choose the plan tier (Starter, Professional, Business, or Enterprise) for each ERP independently. Mix and match tiers across your ERPs based on what each business unit needs.',
  },
]

/* ------------------------------------------------------------------ */
/*  Included Features                                                  */
/* ------------------------------------------------------------------ */

const INCLUDED_FEATURES = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'Core Platform',
    desc: 'All plans include the full ApexFlow engine with industry-specific modules and workflows.',
    accentVar: '--gg-teal',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Data Security',
    desc: 'Enterprise-grade encryption, daily backups, and role-based access control across every tier.',
    accentVar: '--gg-violet',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Mobile Access',
    desc: 'Native mobile apps for iOS and Android with offline sync on every plan.',
    accentVar: '--gg-green',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Updates',
    desc: 'Continuous feature updates and security patches included at no extra cost.',
    accentVar: '--gg-amber',
  },
]

/* ------------------------------------------------------------------ */
/*  macOS 27 Golden Gate Segmented Control                             */
/* ------------------------------------------------------------------ */

function SegmentedControl({
  isAnnual,
  onChange,
}: {
  isAnnual: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative flex bg-secondary/80 rounded-xl p-1 border border-[var(--gg-separator-strong)]">
        {/* Sliding indicator — vermillion for active state */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-card shadow-[var(--gg-shadow-sm)]"
          animate={{
            left: isAnnual ? 'calc(50% + 2px)' : '4px',
            width: 'calc(50% - 6px)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        <button
          onClick={() => onChange(false)}
          className={`relative z-10 px-5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            !isAnnual ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange(true)}
          className={`relative z-10 px-5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1.5 ${
            isAnnual ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Annual
        </button>
      </div>
      <span className="text-xs font-semibold text-[var(--gg-green)] bg-[var(--gg-green)]/10 border border-[var(--gg-green)]/20 px-2.5 py-1 rounded-full">
        Save 20%
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pricing Card Component — Golden Gate design                        */
/* ------------------------------------------------------------------ */

function PricingCard({
  tier,
  index,
  isAnnual,
  currency,
  onSelectPlan,
}: {
  tier: (typeof PRICING_TIERS)[number]
  index: number
  isAnnual: boolean
  currency: CurrencyCode
  onSelectPlan: (planId: string) => void
}) {
  const { navigate } = useNavigate()
  const isPopular = tier.popular
  const monthlyPrice = tier.pkrMonthly
  // Annual calculation: 2 months free (pay for 10 months, use for 12)
  // This is more intuitive: "Pay for 10, get 12"
  const annualTotal = monthlyPrice * 10
  const annualMonthlyRate = Math.round(annualTotal / 12)
  const savingsAmount = monthlyPrice * 12 - annualTotal // = monthlyPrice * 2
  const savingsPercent = Math.round((savingsAmount / (monthlyPrice * 12)) * 100) // ~17%
  const price = isAnnual ? annualMonthlyRate : monthlyPrice
  const accent = TIER_ACCENTS[tier.id]

  const [featuresExpanded, setFeaturesExpanded] = useState(false)
  const INITIAL_FEATURES_COUNT = 4
  const visibleFeatures = featuresExpanded
    ? tier.features
    : tier.features.slice(0, INITIAL_FEATURES_COUNT)
  const hasMoreFeatures = tier.features.length > INITIAL_FEATURES_COUNT

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className={`relative flex flex-col h-full ${isPopular ? 'xl:-mt-4 xl:mb-4 z-10' : ''}`}
    >
      {/* Glow behind popular card — vermillion/amber glow */}
      {isPopular && (
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-b from-[var(--gg-vermillion)]/20 via-[var(--gg-amber)]/10 to-transparent blur-xl pointer-events-none" />
      )}

      <InteractiveCard
        glowColor={`var(${tier.accentVar})`}
        variant={isPopular ? 'strong' : 'default'}
        className="flex-1 flex flex-col"
      >
        <div className={`relative bg-card overflow-hidden group flex flex-col h-full ${isPopular ? 'gg-elevated' : 'gg-card'}`}>
          {/* Colored accent bar at top */}
          <div className={`h-1.5 bg-gradient-to-r ${accent.stripe}`} />

          {/* Popular Badge */}
          {isPopular && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-[#E2532F] to-[#F59E0B] text-xs font-bold px-4 py-1.5 rounded-full text-white shadow-lg gg-pill">
                Most Popular
              </div>
            </div>
          )}

          <div className={`relative flex flex-col flex-1 p-9 ${isPopular ? 'pt-14' : ''}`}>
            {/* Colored background tint for card */}
            <div className={`absolute inset-0 ${accent.cardBg} pointer-events-none`} />
            
            {/* Gradient overlay for popular */}
            {isPopular && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#E2532F]/[0.06] to-[#F59E0B]/[0.03] pointer-events-none" />
            )}

            <div className="relative flex flex-col flex-1">
              {/* Tier Name with colored badge */}
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`text-xl font-bold ${
                    isPopular
                      ? 'text-gradient-primary'
                      : accent.priceText
                  }`}
                >
                  {tier.name}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accent.badgeBg} ${accent.badgeText}`}>
                  {tier.id === 'starter' ? 'Basic' : tier.id === 'professional' ? 'Growth' : tier.id === 'business' ? 'Scale' : 'Unlimited'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-extrabold ${accent.badgeText}`}>
                    {CURRENCIES[currency].symbol}{formatPrice(price, currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo per ERP</span>
                </div>
                {isAnnual ? (
                  <p className="text-xs text-[var(--gg-green)] mt-1">
                    {CURRENCIES[currency].symbol}{formatPrice(annualTotal, currency)}/yr billed annually · save {CURRENCIES[currency].symbol}{formatPrice(savingsAmount, currency)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    or {CURRENCIES[currency].symbol}{formatPrice(annualMonthlyRate, currency)}/mo billed annually (2 months free)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-2 flex-1">
                {visibleFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Check className={`w-4 h-4 ${accent.check}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <AnimatePresence initial={false}>
                {hasMoreFeatures && (
                  <button
                    onClick={() => setFeaturesExpanded(!featuresExpanded)}
                    className="text-xs text-[var(--gg-vermillion)] hover:underline mb-4 flex items-center gap-1 transition-colors"
                  >
                    {featuresExpanded
                      ? 'Show less'
                      : `+${tier.features.length - INITIAL_FEATURES_COUNT} more features`
                    }
                    <motion.span
                      animate={{ rotate: featuresExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="inline-flex"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.span>
                  </button>
                )}
              </AnimatePresence>
              {!hasMoreFeatures && <div className="mb-4" />}

              {/* CTA Button */}
              <Button
                size="lg"
                className={`w-full h-12 rounded-xl font-semibold ${accent.btnClass}`}
                onClick={() => (tier.id === 'enterprise' ? navigate('contact') : onSelectPlan(tier.id))}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </InteractiveCard>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ Item Component — Golden Gate card with numbered indicator      */
/* ------------------------------------------------------------------ */

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string
  answer: string
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: GG_EASE }}
      className={`gg-card overflow-hidden transition-all duration-200 ${
        isOpen ? 'border-[var(--gg-vermillion)]/30' : ''
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3 pr-4">
          {/* Numbered indicator */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors font-mono text-xs font-bold ${
            isOpen ? 'bg-[var(--gg-vermillion)]/10 text-[var(--gg-vermillion)]' : 'bg-secondary text-muted-foreground'
          }`}>
            {num}
          </div>
          <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-foreground' : 'text-foreground/80'}`}>
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-[var(--gg-vermillion)]' : 'text-muted-foreground'}`} />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-0 ml-11">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Currency Selector Dropdown — Golden Gate                           */
/* ------------------------------------------------------------------ */

function CurrencySelector({
  currency,
  setCurrency,
}: {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-[var(--gg-separator-strong)] rounded-xl px-4 py-2.5 text-sm text-foreground shadow-[var(--gg-shadow-sm)] hover:shadow-[var(--gg-shadow-md)] transition-shadow duration-200"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{currency}</span>
        <span className="text-muted-foreground hidden sm:inline">· {CURRENCIES[currency].label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full mt-2 right-0 z-[200] bg-card border border-border rounded-xl p-1.5 min-w-[200px] shadow-[var(--gg-shadow-xl)]"
        >
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
            <button
              key={code}
              onClick={() => {
                setCurrency(code)
                setOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                currency === code
                  ? 'bg-[var(--gg-vermillion)]/10 text-[var(--gg-vermillion)] font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="font-medium">{CURRENCIES[code].symbol}</span>
                <span>{code}</span>
                <span className="text-muted-foreground hidden sm:inline">· {CURRENCIES[code].label}</span>
              </span>
              {currency === code && <Check className="w-3.5 h-3.5 text-[var(--gg-vermillion)]" />}
            </button>
          ))}
          <div className="border-t border-[var(--gg-separator)] mt-1 pt-1.5 px-3">
            <p className="text-[10px] text-muted-foreground">Prices in selected currency. PKR is the billing currency.</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Dot Grid Background Pattern — Warm vermillion dots                 */
/* ------------------------------------------------------------------ */

function DotGridPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pricing-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--gg-vermillion)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pricing-dots)" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export function PricingPage() {
  const { navigate } = useNavigate()
  const [isAnnual, setIsAnnual] = useState(false)
  const [currency, setCurrency] = useState<CurrencyCode>('PKR')
  const { activeErps, loading: erpsLoading } = useErpSystems()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)

  // Checkout status from URL params - parse once on mount using ref
  const [checkoutStatus, setCheckoutStatus] = useState<{ type: 'success' | 'cancelled' | 'error'; order?: string } | null>(null)
  const hasParsedCheckout = useRef(false)

  useEffect(() => {
    if (hasParsedCheckout.current) return
    hasParsedCheckout.current = true
    const params = new URLSearchParams(window.location.search)
    const checkout = params.get('checkout')
    if (checkout) {
      const timer = setTimeout(() => {
        if (checkout === 'success') {
          setCheckoutStatus({ type: 'success', order: params.get('order') ?? undefined })
        } else if (checkout === 'cancelled') {
          setCheckoutStatus({ type: 'cancelled' })
        } else {
          setCheckoutStatus({ type: 'error' })
        }
        const url = new URL(window.location.href)
        url.searchParams.delete('checkout')
        url.searchParams.delete('order')
        url.searchParams.delete('reason')
        window.history.replaceState({}, '', url.pathname)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId as PlanId)
    setCheckoutOpen(true)
  }

  const faqs = FAQS.map((faq) => {
    if (faq.question === 'Which ERP platforms can I choose?') {
      const erpNames = activeErps.length > 0
        ? activeErps.map((e) => e.name).join(', ')
        : 'multiple'
      return {
        ...faq,
        answer: `ApexFlow offers ${erpsLoading ? 'multiple' : activeErps.length} active ERP platforms: ${erpNames}. You select the ones that match your business needs.`,
      }
    }
    return faq
  })

  // Filter out ElectroFlow and FleetFlow from the "other ERPs" list since they get featured treatment
  const otherErps = activeErps.filter((e) => e.slug !== 'electroflow' && e.slug !== 'fleetflow')

  return (
    <PageLayout>
      {/* ── Checkout Status Banner ── */}
      <AnimatePresence>
        {checkoutStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-0 left-0 right-0 z-[100] ${
              checkoutStatus.type === 'success'
                ? 'bg-[var(--gg-green)]'
                : checkoutStatus.type === 'cancelled'
                ? 'bg-[var(--gg-amber)]'
                : 'bg-[var(--gg-rose)]'
            } text-white`}
          >
            <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {checkoutStatus.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : checkoutStatus.type === 'cancelled' ? (
                  <XCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {checkoutStatus.type === 'success'
                      ? 'Payment Successful!'
                      : checkoutStatus.type === 'cancelled'
                      ? 'Payment Cancelled'
                      : 'Payment Error'}
                  </p>
                  <p className="text-xs opacity-90">
                    {checkoutStatus.type === 'success'
                      ? checkoutStatus.order
                        ? `Order ${checkoutStatus.order} confirmed. Check your email for details.`
                        : 'Your order has been confirmed. Check your email for details.'
                      : checkoutStatus.type === 'cancelled'
                      ? 'Your checkout was cancelled. No charge was made.'
                      : 'Something went wrong. Please try again or contact support.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutStatus(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section — Warm gradient with frosted glass ── */}
      <section className="relative z-20 overflow-visible bg-gradient-to-b from-background via-secondary/40 to-background pt-24 pb-16 sm:pt-32 sm:pb-20">
        <DotGridPattern />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: GG_EASE }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight max-w-3xl mx-auto text-foreground">
              Simple{' '}
              <span className="text-gradient-golden">
                Pricing
              </span>
            </h1>

            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Start free. Scale as you grow. No hidden fees, no surprises — just powerful ERP
              software at a price that makes sense for your business.
            </p>

            {/* ── Billing Toggle + Currency Selector — temporarily hidden ── */}
            <div className="mt-8 flex justify-center relative z-50">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: GG_EASE }}
                className="inline-flex items-center gap-2 p-3 bg-[var(--gg-vermillion)]/10 border border-[var(--gg-vermillion)]/20 rounded-xl"
              >
                <Zap className="w-4 h-4 text-[var(--gg-vermillion)]" />
                <span className="text-sm font-medium text-[var(--gg-vermillion)]">Custom pricing available — request a quote</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Cards — Golden Gate accent stripes ── */}
      <section className="relative z-0 pt-16 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier, i) => (
              <PricingCard key={tier.id} tier={tier} index={i} isAnnual={isAnnual} currency={currency} onSelectPlan={handleSelectPlan} />
            ))}
          </div>

          {/* Billing note — Get Quote CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              All plans include a 14-day free trial.{' '}
              <button
                onClick={() => navigate('contact')}
                className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
              >
                Contact us for a custom quote
              </button>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Available ERP Platforms — 2-column featured + list ── */}
      <section className="py-16 sm:py-24 border-t border-[var(--gg-separator)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE }}
            className="mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Choose Your{' '}
              <span className="text-gradient-cool">ERP Platforms</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              {activeErps.length} industry-specific ERPs, each purpose-built for real-world operations. Subscribe to each ERP separately at the plan tier that fits your needs.
            </p>
          </motion.div>

          {/* 2-column layout: featured on left, scrollable list on right */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Featured ERPs */}
            <div className="lg:col-span-3 space-y-5">
              {/* Featured Integrated ERP — ElectroFlow */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
                className="gg-card border-[var(--gg-green)]/20 overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-[var(--gg-green)] to-[var(--gg-teal)]" />
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--gg-green)]/10 border border-[var(--gg-green)]/20 flex items-center justify-center shrink-0">
                    <Zap className="w-7 h-7 text-[var(--gg-green)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">ElectroFlow</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                        <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                        Featured
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">· Consumer Electronics & Appliances</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete ERP with POS, installment management, service & repair, warranty tracking, and multi-branch operations.
                      Starting from <span className="font-semibold text-foreground">PKR 15,000/mo</span> per ERP.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-[var(--gg-green)] hover:bg-[var(--gg-green)]/90 text-white font-semibold rounded-xl px-4 h-9"
                      onClick={() => navigate('erp-detail', 'electroflow')}
                    >
                      Learn More
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-4 h-9"
                      onClick={() => window.open('https://electroflowerp.vercel.app/', '_blank', 'noopener')}
                    >
                      Live Demo
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Featured Integrated ERP — FleetFlow */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
                className="gg-card border-[var(--gg-cyan)]/20 overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-[var(--gg-cyan)] to-[var(--gg-teal)]" />
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[var(--gg-cyan)]/10 border border-[var(--gg-cyan)]/20 flex items-center justify-center shrink-0">
                    <Compass className="w-7 h-7 text-[var(--gg-cyan)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">FleetFlow</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                        <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                        Featured
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">· Fleet & Transportation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete fleet ERP with GPS tracking, driver management, fuel monitoring, trip planning, and maintenance scheduling.
                      Starting from <span className="font-semibold text-foreground">PKR 15,000/mo</span> per ERP.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-[var(--gg-cyan)] hover:bg-[var(--gg-cyan)]/90 text-white font-semibold rounded-xl px-4 h-9"
                      onClick={() => navigate('erp-detail', 'fleetflow')}
                    >
                      Learn More
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-4 h-9"
                      onClick={() => window.open('https://fleetflowerp.vercel.app/', '_blank', 'noopener')}
                    >
                      Live Demo
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Scrollable list of other ERPs */}
            <div className="lg:col-span-2">
              <div className="gg-card p-4 max-h-[420px] overflow-y-auto lg:sticky lg:top-24 custom-scrollbar">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  All Available ERPs
                  <span className="text-xs text-muted-foreground font-normal">({activeErps.length})</span>
                </h3>
                <div className="space-y-2">
                  {otherErps.map((erp, i) => {
                    const Icon = getErpIcon(erp.icon)
                    const colors = getErpColor(erp.color)
                    return (
                      <motion.button
                        key={erp.slug}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.03, duration: 0.3, ease: GG_EASE }}
                        className="w-full bg-secondary/50 border border-[var(--gg-separator)] rounded-xl p-3 flex items-center gap-3 text-left hover:bg-secondary hover:shadow-[var(--gg-shadow-sm)] transition-all duration-200"
                        onClick={() => navigate('erp-detail', erp.slug)}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            color: colors.hex,
                            background: `linear-gradient(135deg, ${colors.hex}12, ${colors.hex}06)`,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{erp.name}</h4>
                            <span className="text-[9px] bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-1.5 py-0.5 rounded font-medium">Active</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{erp.industry}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </motion.button>
                    )
                  })}
                  {/* Also include ElectroFlow and FleetFlow in the list for completeness */}
                  {activeErps.filter((e) => e.slug === 'electroflow' || e.slug === 'fleetflow').map((erp, i) => {
                    const Icon = getErpIcon(erp.icon)
                    const colors = getErpColor(erp.color)
                    return (
                      <motion.button
                        key={erp.slug}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.03, duration: 0.3, ease: GG_EASE }}
                        className="w-full bg-secondary/50 border border-[var(--gg-green)]/10 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-secondary hover:shadow-[var(--gg-shadow-sm)] transition-all duration-200"
                        onClick={() => navigate('erp-detail', erp.slug)}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            color: colors.hex,
                            background: `linear-gradient(135deg, ${colors.hex}12, ${colors.hex}06)`,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{erp.name}</h4>
                            <span className="text-[9px] bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-1.5 py-0.5 rounded font-medium">Featured</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{erp.industry}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Per-ERP pricing summary */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRICING_TIERS.map((tier) => {
              const monthlyPrice = tier.pkrMonthly
              const annualTotal = monthlyPrice * 10
              const annualMonthlyRate = Math.round(annualTotal / 12)
              const accent = TIER_ACCENTS[tier.id]
              return (
                <div key={tier.id} className={`${accent.cardBg} gg-card p-4 text-center relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.stripe}`} />
                  <p className={`text-sm font-semibold ${accent.headerText}`}>{tier.name}</p>
                  {isAnnual ? (
                    <>
                      <p className="text-xs text-muted-foreground mt-1">
                        {CURRENCIES[currency].symbol} {formatPrice(annualMonthlyRate, currency)}/mo per ERP
                      </p>
                      <p className={`text-[11px] ${accent.savingsText} mt-0.5`}>
                        Billed {CURRENCIES[currency].symbol}{formatPrice(annualTotal, currency)}/yr
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground mt-1">
                        {CURRENCIES[currency].symbol} {formatPrice(monthlyPrice, currency)}/mo per ERP
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Annual: {CURRENCIES[currency].symbol} {formatPrice(annualTotal, currency)}/yr (2 months free)
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── What's Included — Horizontal Banner ── */}
      <section className="py-16 sm:py-24 border-t border-[var(--gg-separator)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              What&apos;s{' '}
              <span className="text-gradient-primary">Included</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Every plan comes with the core ApexFlow platform — the differences are in scale,
              support, and customization.
            </p>
          </motion.div>

          {/* Horizontal banner layout */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE, delay: 0.1 }}
            className="gg-card overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--gg-separator)]">
              {INCLUDED_FEATURES.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 flex flex-col items-center text-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: `var(${item.accentVar})` }}>
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Comparison Table — Warm separators, Golden Gate headers ── */}
      <section className="py-16 sm:py-24 border-t border-[var(--gg-separator)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Feature{' '}
              <span className="text-gradient-golden">Comparison</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              A detailed breakdown of what each plan includes. Every tier is built on the same powerful foundation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE, delay: 0.1 }}
            className="gg-card overflow-x-auto"
          >
            {/* Table Header — colored per tier with Golden Gate palette */}
            <div className="grid grid-cols-5 min-w-[640px] border-b border-[var(--gg-separator-strong)]">
              <div className="p-4 bg-secondary">
                <span className="text-sm font-medium text-muted-foreground">Feature</span>
              </div>
              {PRICING_TIERS.map((tier) => {
                const tierPrice = isAnnual ? Math.round((tier.pkrMonthly * 10) / 12) : tier.pkrMonthly
                const accent = TIER_ACCENTS[tier.id]
                return (
                  <div key={tier.id} className={`p-4 text-center border-l border-[var(--gg-separator)] ${accent.headerBg} ${tier.popular ? 'relative' : ''}`}>
                    {tier.popular && (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-sm font-semibold ${accent.headerText}`}>{tier.name}</span>
                        <span className={`text-[10px] bg-[var(--gg-vermillion)]/10 text-[var(--gg-vermillion)] px-1.5 py-0.5 rounded font-medium gg-pill`}>
                          Popular
                        </span>
                      </div>
                    )}
                    {!tier.popular && (
                      <span className={`text-sm font-semibold ${accent.headerText}`}>{tier.name}</span>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {CURRENCIES[currency].symbol} {formatPrice(tierPrice, currency)}/mo
                      {isAnnual && (
                        <span className="text-[var(--gg-green)]"> (2 months free)</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Table Body */}
            {COMPARISON_CATEGORIES.map((category) => (
              <div key={category.category}>
                {/* Category Header */}
                <div className="grid grid-cols-5 min-w-[640px] border-b border-[var(--gg-separator)] bg-secondary/50">
                  <div className="p-3 col-span-5 flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center">
                      {category.icon}
                    </div>
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      {category.category}
                    </span>
                  </div>
                </div>

                {/* Category Rows — alternating backgrounds */}
                {category.rows.map((row, rowIdx) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-5 min-w-[640px] border-b border-[var(--gg-separator)] last:border-b-0 ${
                      rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                    }`}
                  >
                    <div className="p-3">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                    </div>
                    {(['starter', 'professional', 'business', 'enterprise'] as const).map((tierKey) => {
                      const value = (row as Record<string, string>)[tierKey]
                      return (
                        <div key={tierKey} className="p-3 text-center border-l border-[var(--gg-separator)]">
                          {value === '✓' ? (
                            <div className="w-5 h-5 rounded-md flex items-center justify-center mx-auto bg-[var(--gg-green)]/10">
                              <Check className="w-3 h-3 text-[var(--gg-green)]" strokeWidth={3} />
                            </div>
                          ) : (
                            <span className={`text-sm ${value === '—' ? 'text-foreground/35' : 'text-foreground'}`}>
                              {value}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section — 2-column with numbered indicators ── */}
      <section className="py-16 sm:py-24 border-t border-[var(--gg-separator)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE }}
            className="mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Frequently Asked{' '}
              <span className="text-gradient-golden">Questions</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Got questions? We&apos;ve got answers. If you don&apos;t find what you need, reach out
              to our team.
            </p>
          </motion.div>

          {/* 2-column FAQ grid */}
          <div className="grid md:grid-cols-2 gap-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section — Split layout (text left, buttons right) ── */}
      <section className="py-20 sm:py-28 border-t border-[var(--gg-separator)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: GG_EASE }}
            className="gg-elevated p-8 sm:p-12 overflow-hidden relative"
          >
            {/* Decorative gradient accent — vermillion→amber */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--gg-vermillion)] via-[var(--gg-amber)] to-[var(--gg-vermillion)]" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left: Text */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mb-5">
                  <Zap className="w-3.5 h-3.5 text-[var(--gg-vermillion)]" />
                  <span className="text-xs text-muted-foreground font-medium">Start your free trial today</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-foreground">
                  Ready to{' '}
                  <span className="text-gradient-golden">Get Started?</span>
                </h2>
                <p className="text-muted-foreground max-w-lg">
                  Join thousands of businesses already using ApexFlow to streamline their operations.
                  14-day free trial, no credit card required.
                </p>
              </div>

              {/* Right: Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Button
                  size="lg"
                  className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion-light)] text-white font-semibold rounded-xl px-8 h-12 shadow-[var(--gg-shadow-sm)] btn-glow transition-all duration-200"
                  onClick={() => handleSelectPlan('professional')}
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/50 rounded-xl px-8 h-12 transition-all duration-200"
                  onClick={() => navigate('contact')}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Checkout Modal ── */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        preselectedPlan={selectedPlan}
      />
    </PageLayout>
  )
}
