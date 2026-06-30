'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { useNavigate } from '@/lib/use-navigate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CheckCircle2, TrendingUp, DollarSign, Users,
  Shield, Rocket, Handshake, BarChart3, Globe, Phone,
  ChevronRight, Sparkles, Crown, Star, Target, Zap,
  PieChart, Building2, Wallet, Percent, Banknote,
  Award, Gem, CircleDollarSign, LineChart, UserCheck,
  Lock, Clock, MapPin, Mail, Check, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
   ANIMATION CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const GG_EASE = [0.25, 0.46, 0.45, 0.94] as const
const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}
const smoothSpring = { type: 'spring' as const, stiffness: 400, damping: 35 }

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const RESELLER_TIERS = [
  {
    name: 'Starter Partner',
    clients: '1 – 5',
    commission: '10%',
    description: 'Begin your journey as an ApexFlow reseller and start earning from your very first client.',
    benefits: [
      '10% commission on every sale',
      'Dedicated partner dashboard',
      'Marketing collateral & brochures',
      'Lead referral support',
      'Monthly payout cycle',
      'Email & chat partner support',
    ],
    accentVar: '--gg-teal',
  },
  {
    name: 'Growth Partner',
    clients: '6 – 15',
    commission: '20%',
    description: 'Scale your business with increased commissions and exclusive partner resources.',
    benefits: [
      '20% commission on every sale',
      'Priority lead distribution',
      'Co-branded landing pages',
      'Quarterly business reviews',
      'Bi-weekly payout cycle',
      'Dedicated account manager',
      'Access to partner-only webinars',
    ],
    accentVar: '--gg-amber',
  },
  {
    name: 'Elite Partner',
    clients: '16+',
    commission: '35%',
    description: 'Join the top tier of ApexFlow partners with maximum earnings and strategic privileges.',
    benefits: [
      '35% commission on every sale',
      'Exclusive territory rights',
      'Custom demo environments',
      'Weekly payout cycle',
      'Executive account manager',
      'Co-marketing budget allocation',
      'Early access to new products',
      'Invitation to annual partner summit',
    ],
    accentVar: '--gg-vermillion',
  },
]

const INVESTOR_PLANS = [
  {
    name: 'Seed Investor',
    investment: 'PKR 1,000,000',
    profitShare: '30%',
    roi: 'Projected 36–60% annually',
    description: 'Invest in ApexFlow\'s growth and earn a substantial share of net profits every month. Your capital fuels expansion while you earn passively.',
    features: [
      '30% share of net monthly profit',
      'Quarterly financial performance reports',
      'Priority access to new ERP launches',
      'Annual investor meetup invitation',
      'Dedicated investor relations contact',
      'Legal profit-sharing agreement',
    ],
    accentVar: '--gg-amber',
  },
  {
    name: 'Strategic Investor',
    investment: 'PKR 5,000,000+',
    profitShare: '30%+',
    roi: 'Projected 48–72% annually',
    description: 'Become a strategic partner with enhanced profit-sharing, board advisory privileges, and direct influence on product direction.',
    features: [
      '30%+ share of net monthly profit',
      'Board advisory privileges',
      'Monthly financial & ops dashboard',
      'Custom ERP development priority',
      'Co-branded market expansion',
      'Legal profit-sharing agreement',
      'Escrow-protected investment',
      'Dedicated executive liaison',
    ],
    accentVar: '--gg-vermillion',
  },
]

const WHY_JOIN = [
  {
    icon: TrendingUp,
    title: 'Recurring Revenue',
    description: 'Earn commissions on every subscription — not just the first sale. As long as your client stays, you keep earning. Month after month. Year after year.',
  },
  {
    icon: Globe,
    title: '21 Ready-Made Products',
    description: 'No need to build software. You get 21 fully developed, industry-specific ERP systems ready to sell from day one across every major sector.',
  },
  {
    icon: Shield,
    title: 'Zero Technical Burden',
    description: 'We handle hosting, updates, security, and 24/7 support. You focus on what you do best — building relationships and closing deals.',
  },
  {
    icon: Zap,
    title: 'Instant Market Entry',
    description: 'Skip years of product development. Walk into any meeting with a battle-tested ERP that speaks your client\'s industry language fluently.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Dashboard',
    description: 'Track every lead, every deal, and every commission in real-time. Full visibility into your earnings pipeline — no black boxes, no surprises.',
  },
  {
    icon: Handshake,
    title: 'Dedicated Support',
    description: 'From demo environments to co-branded proposals — we arm you with everything you need to win. Your success is literally our success.',
  },
]

const STATS = [
  { value: '21', label: 'Industry ERPs', icon: Building2 },
  { value: '35%', label: 'Max Commission', icon: Percent },
  { value: '30%', label: 'Investor Profit Share', icon: PieChart },
  { value: '24hr', label: 'Go-Live Time', icon: Clock },
]

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Apply',
    description: 'Fill out the partner application form. Tell us about your market, experience, and ambitions.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: 'Get Onboarded',
    description: 'Receive your partner dashboard, demo credentials, marketing kit, and dedicated account manager.',
    icon: Rocket,
  },
  {
    step: '03',
    title: 'Start Selling',
    description: 'Leverage our co-branded materials and product demos to close deals across 21 industry verticals.',
    icon: Target,
  },
  {
    step: '04',
    title: 'Earn & Grow',
    description: 'Watch your recurring commissions grow as your client base expands. Scale to Elite and maximize earnings.',
    icon: CircleDollarSign,
  },
]

const FAQ_ITEMS = [
  {
    q: 'How are commissions calculated?',
    a: 'Commissions are calculated as a percentage of the monthly subscription revenue from each client you refer. For example, as an Elite Partner at 35%, a client paying PKR 35,000/month earns you PKR 12,250 every month for as long as they remain subscribed.',
  },
  {
    q: 'When do I get paid?',
    a: 'Starter Partners receive monthly payouts. Growth Partners receive bi-weekly payouts. Elite Partners receive weekly payouts. All payments are processed within 5 business days of the payout period.',
  },
  {
    q: 'Is there a minimum sales target?',
    a: 'There is no minimum sales target to remain a partner. However, your tier is determined by your active client count — maintain 6+ active clients for Growth Partner status and 16+ for Elite Partner status.',
  },
  {
    q: 'How does the investor profit share work?',
    a: 'Investors receive 30% of ApexFlow\'s net monthly profit, calculated after all operational expenses. Profit calculations are transparent and shared via monthly financial reports. Payments are processed within 10 business days of month-end.',
  },
  {
    q: 'Can I be both a reseller and an investor?',
    a: 'Absolutely. Many of our partners choose to invest capital for passive income while also actively selling for commission. The two programs are independent — you earn from both streams simultaneously.',
  },
  {
    q: 'What support do resellers receive?',
    a: 'Every reseller gets: a dedicated account manager, co-branded marketing materials, pre-configured demo environments, technical pre-sales support, deal registration protection, and access to our partner knowledge base.',
  },
  {
    q: 'Is my investment protected?',
    a: 'Yes. All investor agreements include escrow-protected capital, audited financial statements, and a legally binding profit-sharing contract. Strategic Investors also receive quarterly board updates and direct access to our executive team.',
  },
]


/* ═══════════════════════════════════════════════════════════════
   RESeller PAGE
   ═══════════════════════════════════════════════════════════════ */
export function ResellerPage() {
  const { navigate } = useNavigate()
  const [activeTab, setActiveTab] = useState<'reseller' | 'investor'>('reseller')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <PageLayout>
      <div className="relative overflow-hidden">

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* Background accents */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--gg-vermillion)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: 'var(--gg-amber)' }} />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: GG_EASE }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 10%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))',
                border: '1px solid color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
              }}
            >
              <Handshake className="w-4 h-4" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--gg-vermillion)' }}>Partner Program</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: GG_EASE }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]"
            >
              Turn Your Network Into{' '}
              <span className="text-gradient-golden">Recurring Wealth</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: GG_EASE }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Join 200+ partners earning up to <span className="font-bold text-foreground">35% commission</span> on every sale — or invest and collect{' '}
              <span className="font-bold text-foreground">30% of net profits monthly</span>.
              With 21 industry-specific ERPs, the opportunities are limitless.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: GG_EASE }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="font-bold rounded-xl px-8 h-13 text-white btn-glow"
                style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                onClick={() => {
                  const el = document.getElementById('apply-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Apply Now — It&apos;s Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold rounded-xl px-8 h-13 border-border/60"
                onClick={() => {
                  const el = document.getElementById('plans-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                View Plans
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: GG_EASE }}
              className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {STATS.map((stat, i) => {
                const StatIcon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: GG_EASE }}
                    className="gg-card p-5 text-center"
                  >
                    <StatIcon className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--gg-vermillion)' }} />
                    <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ WHY JOIN ═══════════════ */}
        <section className="py-20 lg:py-24" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
              >
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-vermillion)' }}>Why Partner With Us</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Your Success Is <span className="text-gradient-primary">Our Business</span>
                </h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                  We don&apos;t just give you a product to sell — we give you an entire ecosystem designed to make you money.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_JOIN.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: GG_EASE }}
                    className="group gg-card p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 12%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))' }}
                    >
                      <ItemIcon className="w-5.5 h-5.5" style={{ color: 'var(--gg-vermillion)' }} />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ PLANS SECTION ═══════════════ */}
        <section id="plans-section" className="py-20 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
              >
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-vermillion)' }}>Choose Your Path</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Two Ways to <span className="text-gradient-primary">Earn Big</span>
                </h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                  Whether you sell or invest — or both — ApexFlow rewards your commitment with industry-leading returns.
                </p>
              </motion.div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center justify-center mb-12">
              <div
                className="inline-flex items-center p-1 rounded-xl"
                style={{
                  background: 'color-mix(in srgb, var(--card) 80%, transparent)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => setActiveTab('reseller')}
                  className="relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                  style={{
                    background: activeTab === 'reseller' ? 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' : 'transparent',
                    color: activeTab === 'reseller' ? 'white' : 'var(--muted-foreground)',
                    boxShadow: activeTab === 'reseller' ? '0 4px 12px -4px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)' : 'none',
                  }}
                >
                  <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Reseller Program
                </button>
                <button
                  onClick={() => setActiveTab('investor')}
                  className="relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                  style={{
                    background: activeTab === 'investor' ? 'linear-gradient(135deg, var(--gg-amber), var(--gg-vermillion))' : 'transparent',
                    color: activeTab === 'investor' ? 'white' : 'var(--muted-foreground)',
                    boxShadow: activeTab === 'investor' ? '0 4px 12px -4px color-mix(in srgb, var(--gg-amber) 30%, transparent)' : 'none',
                  }}
                >
                  <Wallet className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Investor Program
                </button>
              </div>
            </div>

            {/* Reseller Tiers */}
            <AnimatePresence mode="wait">
              {activeTab === 'reseller' && (
                <motion.div
                  key="reseller"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: GG_EASE }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Earn <span className="text-gradient-primary">10% to 35%</span> Commission on Every Sale
                    </h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      The more clients you bring, the higher your tier — and the bigger your commission. There&apos;s no cap on earnings.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {RESELLER_TIERS.map((tier, i) => (
                      <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: GG_EASE }}
                        className="relative group"
                      >
                        {i === 2 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                            <span
                              className="text-[10px] font-bold px-3 py-1 rounded-full"
                              style={{
                                background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                                color: 'white',
                              }}
                            >
                              HIGHEST EARNERS
                            </span>
                          </div>
                        )}
                        <div
                          className="gg-elevated p-7 h-full flex flex-col transition-all duration-300 hover:shadow-xl"
                          style={{
                            borderTop: `3px solid var(${tier.accentVar})`,
                          }}
                        >
                          <div className="mb-5">
                            <h4 className="text-lg font-bold text-foreground">{tier.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{tier.clients} active clients</p>
                          </div>

                          {/* Commission highlight */}
                          <div
                            className="rounded-xl p-4 mb-5 text-center"
                            style={{
                              background: `linear-gradient(135deg, color-mix(in srgb, var(${tier.accentVar}) 10%, transparent), color-mix(in srgb, var(${tier.accentVar}) 4%, transparent))`,
                              border: `1px solid color-mix(in srgb, var(${tier.accentVar}) 15%, transparent)`,
                            }}
                          >
                            <span className="text-3xl font-extrabold" style={{ color: `var(${tier.accentVar})` }}>{tier.commission}</span>
                            <span className="text-sm text-muted-foreground ml-1.5">commission</span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{tier.description}</p>

                          <ul className="space-y-2.5 mb-6">
                            {tier.benefits.map((benefit) => (
                              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `var(${tier.accentVar})` }} />
                                <span className="text-foreground/80">{benefit}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            className="w-full font-semibold rounded-xl"
                            style={{
                              background: i === 2 ? `linear-gradient(135deg, var(${tier.accentVar}), var(--gg-amber))` : 'transparent',
                              color: i === 2 ? 'white' : `var(${tier.accentVar})`,
                              border: i === 2 ? 'none' : `1px solid color-mix(in srgb, var(${tier.accentVar}) 25%, transparent)`,
                            }}
                            onClick={() => {
                              const el = document.getElementById('apply-section')
                              el?.scrollIntoView({ behavior: 'smooth' })
                            }}
                          >
                            {i === 2 ? 'Become Elite Partner' : 'Get Started'}
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'investor' && (
                <motion.div
                  key="investor"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: GG_EASE }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Invest & Earn <span className="text-gradient-primary">30% of Net Profit Monthly</span>
                    </h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      From PKR 1,000,000 — earn a guaranteed share of ApexFlow&apos;s net profits, paid monthly. Your capital works while you sleep.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {INVESTOR_PLANS.map((plan, i) => (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.5, ease: GG_EASE }}
                        className="relative group"
                      >
                        {i === 1 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                            <span
                              className="text-[10px] font-bold px-3 py-1 rounded-full"
                              style={{
                                background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-rose))',
                                color: 'white',
                              }}
                            >
                              PREMIUM
                            </span>
                          </div>
                        )}
                        <div
                          className="gg-elevated p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl"
                          style={{
                            borderTop: `3px solid var(${plan.accentVar})`,
                          }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(${plan.accentVar}) 15%, transparent), color-mix(in srgb, var(${plan.accentVar}) 5%, transparent))` }}
                            >
                              {i === 0 ? <Banknote className="w-5 h-5" style={{ color: `var(${plan.accentVar})` }} /> : <Crown className="w-5 h-5" style={{ color: `var(${plan.accentVar})` }} />}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                              <p className="text-xs text-muted-foreground">{plan.investment}</p>
                            </div>
                          </div>

                          {/* Profit share highlight */}
                          <div
                            className="rounded-xl p-5 mb-5 text-center"
                            style={{
                              background: `linear-gradient(135deg, color-mix(in srgb, var(${plan.accentVar}) 10%, transparent), color-mix(in srgb, var(${plan.accentVar}) 4%, transparent))`,
                              border: `1px solid color-mix(in srgb, var(${plan.accentVar}) 15%, transparent)`,
                            }}
                          >
                            <div className="text-4xl font-extrabold" style={{ color: `var(${plan.accentVar})` }}>{plan.profitShare}</div>
                            <span className="text-sm text-muted-foreground">net monthly profit</span>
                            <div className="mt-2 text-xs font-semibold" style={{ color: `var(${plan.accentVar})` }}>{plan.roi}</div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{plan.description}</p>

                          <ul className="space-y-2.5 mb-6">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2.5 text-sm">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `var(${plan.accentVar})` }} />
                                <span className="text-foreground/80">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            className="w-full font-semibold rounded-xl"
                            style={{
                              background: i === 1 ? `linear-gradient(135deg, var(${plan.accentVar}), var(--gg-rose))` : 'transparent',
                              color: i === 1 ? 'white' : `var(${plan.accentVar})`,
                              border: i === 1 ? 'none' : `1px solid color-mix(in srgb, var(${plan.accentVar}) 25%, transparent)`,
                            }}
                            onClick={() => {
                              const el = document.getElementById('apply-section')
                              el?.scrollIntoView({ behavior: 'smooth' })
                            }}
                          >
                            {i === 1 ? 'Become Strategic Investor' : 'Start Investing'}
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Investor trust signals */}
                  <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      { icon: Lock, label: 'Escrow Protected' },
                      { icon: Shield, label: 'Legal Agreement' },
                      { icon: LineChart, label: 'Transparent Reports' },
                      { icon: Award, label: 'Audited Finances' },
                    ].map((item, i) => {
                      const ItemIcon = item.icon
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: GG_EASE }}
                          className="flex items-center gap-2.5 justify-center p-3 rounded-xl"
                          style={{ background: 'color-mix(in srgb, var(--card) 60%, transparent)', border: '1px solid var(--border)' }}
                        >
                          <ItemIcon className="w-4 h-4" style={{ color: 'var(--gg-teal)' }} />
                          <span className="text-xs font-semibold text-foreground">{item.label}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ═══════════════ COMMISSION CALCULATOR ═══════════════ */}
        <section className="py-16 lg:py-20" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
              >
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-amber)' }}>Earnings Preview</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  See What You Could <span className="text-gradient-warm">Earn</span>
                </h2>
              </motion.div>
            </div>

            <div className="gg-elevated overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--gg-separator)' }}>
                {[
                  { tier: 'Starter Partner', comm: '10%', example: '5 clients × PKR 35,000', monthly: 'PKR 17,500', yearly: 'PKR 210,000', color: '--gg-teal' },
                  { tier: 'Growth Partner', comm: '20%', example: '12 clients × PKR 35,000', monthly: 'PKR 84,000', yearly: 'PKR 1,008,000', color: '--gg-amber' },
                  { tier: 'Elite Partner', comm: '35%', example: '20 clients × PKR 35,000', monthly: 'PKR 245,000', yearly: 'PKR 2,940,000', color: '--gg-vermillion' },
                ].map((row, i) => (
                  <motion.div
                    key={row.tier}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: GG_EASE }}
                    className="p-6 text-center"
                  >
                    <div className="text-sm font-bold text-foreground mb-1">{row.tier}</div>
                    <div className="text-xs text-muted-foreground mb-3">{row.example}</div>
                    <div
                      className="text-3xl font-extrabold mb-1"
                      style={{ color: `var(${row.color})` }}
                    >
                      {row.monthly}
                    </div>
                    <div className="text-xs text-muted-foreground">per month</div>
                    <div className="mt-3 text-sm font-semibold text-foreground">
                      {row.yearly}<span className="text-xs text-muted-foreground font-normal"> /year</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">at {row.comm} commission</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="py-20 lg:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
              >
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-teal)' }}>Getting Started</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Four Steps to <span className="text-gradient-cool">Your First Check</span>
                </h2>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_STEPS.map((step, i) => {
                const StepIcon = step.icon
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: GG_EASE }}
                    className="relative text-center"
                  >
                    {/* Connector line */}
                    {i < 3 && (
                      <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-px" style={{ background: 'var(--gg-separator-strong)' }} />
                    )}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
                      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 12%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))', border: '1px solid color-mix(in srgb, var(--gg-vermillion) 15%, transparent)' }}
                    >
                      <StepIcon className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
                        {step.step}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section className="py-20 lg:py-24" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: GG_EASE }}
              >
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-violet)' }}>FAQ</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Questions? <span className="text-gradient-primary">We&apos;ve Got Answers</span>
                </h2>
              </motion.div>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: GG_EASE }}
                  className="gg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-300 ${expandedFaq === i ? 'rotate-90' : ''}`} style={{ color: 'var(--gg-vermillion)' }} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: GG_EASE }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <div className="h-px mb-4" style={{ background: 'var(--gg-separator)' }} />
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ APPLY SECTION ═══════════════ */}
        <section id="apply-section" className="py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: GG_EASE }}
              className="gg-elevated overflow-hidden"
            >
              {/* Gradient top bar */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--gg-vermillion), var(--gg-amber), var(--gg-teal))' }} />

              <div className="p-8 sm:p-12 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 15%, transparent), color-mix(in srgb, var(--gg-amber) 10%, transparent))' }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: 'var(--gg-vermillion)' }} />
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                  Ready to <span className="text-gradient-golden">Start Earning?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join 200+ partners already building wealth with ApexFlow. Apply today — it&apos;s free, takes 2 minutes, and could be the decision that changes everything.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="font-bold rounded-xl px-10 h-13 text-white btn-glow"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                    onClick={() => navigate('contact')}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Apply as Reseller
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-semibold rounded-xl px-8 h-13 border-border/60"
                    onClick={() => navigate('contact')}
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Discuss Investment
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" style={{ color: 'var(--gg-teal)' }} />
                    No upfront fees
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" style={{ color: 'var(--gg-teal)' }} />
                    Legal agreements
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--gg-teal)' }} />
                    24hr response time
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" style={{ color: 'var(--gg-teal)' }} />
                    Pakistan & GCC
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 5%, transparent), color-mix(in srgb, var(--gg-amber) 3%, transparent), color-mix(in srgb, var(--gg-violet) 2%, transparent))' }} />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4">
              The Best Time to Start Was Yesterday. The Second Best Is Now.
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Every day you wait, another partner signs your future client. Don&apos;t watch from the sidelines — claim your territory today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="font-bold rounded-xl px-8 h-12 text-white btn-glow"
                style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                onClick={() => navigate('contact')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Us: +92 307 4903277
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold rounded-xl px-8 h-12 border-border/60"
                onClick={() => navigate('contact')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  )
}
