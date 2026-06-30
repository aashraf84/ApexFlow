'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { PageLayout } from '@/components/shared/page-layout'
import { useNavigate } from '@/lib/use-navigate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, DollarSign, TrendingUp, UserPlus, MapPin, BarChart3,
  Settings2, Plug, Infinity, Headphones, Wrench, ShieldCheck,
  Server, RefreshCw, LayoutDashboard, CreditCard, PieChart,
  ArrowRight, ChevronRight, ChevronLeft, Target, Clock, Layers,
  Building2, Shirt, Hotel, GraduationCap, Quote, Send,
  Factory, Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InteractiveCard } from '@/components/shared/interactive-card'

/* ───────────────── SOLUTION CATEGORIES ───────────────── */
const solutionCategories = [
  {
    title: 'For Startups',
    subtitle: 'Launch fast, scale smart',
    iconColor: 'text-primary',
    iconBgClass: 'bg-primary/10',
    features: [
      { icon: <Zap className="w-6 h-6 text-primary" />, title: 'Quick Deployment', description: 'Go live in days, not months. Pre-configured workflows get you running immediately with zero infrastructure hassle.' },
      { icon: <DollarSign className="w-6 h-6 text-primary" />, title: 'Low Cost Entry', description: 'Start with only what you need. Pay-as-you-grow pricing means no upfront capital expenditure or long-term lock-in.' },
      { icon: <TrendingUp className="w-6 h-6 text-primary" />, title: 'Scalable Foundation', description: 'Built on the same architecture that powers enterprises. Upgrade seamlessly as your business evolves without re-platforming.' },
      { icon: <UserPlus className="w-6 h-6 text-primary" />, title: 'Rapid Onboarding', description: 'Guided setup wizards and intuitive interfaces get your team productive from day one with minimal training required.' },
    ],
  },
  {
    title: 'For Growing Businesses',
    subtitle: 'Expand without friction',
    iconColor: 'text-[var(--gg-violet)]',
    iconBgClass: 'bg-[var(--gg-violet)]/10',
    features: [
      { icon: <MapPin className="w-6 h-6 text-[var(--gg-violet)]" />, title: 'Multi-Location Support', description: 'Manage operations across branches, warehouses, and regions from a single unified platform with real-time visibility.' },
      { icon: <BarChart3 className="w-6 h-6 text-[var(--gg-violet)]" />, title: 'Advanced Analytics', description: 'Transform raw data into actionable insights with customizable dashboards, trend analysis, and predictive forecasting.' },
      { icon: <Settings2 className="w-6 h-6 text-[var(--gg-violet)]" />, title: 'Custom Workflows', description: 'Design approval chains, automate routine tasks, and tailor every process to match your unique operational logic.' },
      { icon: <Plug className="w-6 h-6 text-[var(--gg-violet)]" />, title: 'API Integrations', description: 'Connect to your existing tools and third-party services through our robust REST API and pre-built connector library.' },
    ],
  },
  {
    title: 'For Enterprise',
    subtitle: 'Power without limits',
    iconColor: 'text-[var(--gg-green)]',
    iconBgClass: 'bg-[var(--gg-green)]/10',
    features: [
      { icon: <Infinity className="w-6 h-6 text-[var(--gg-green)]" />, title: 'Unlimited Scale', description: 'Handle millions of transactions, thousands of users, and complex multi-entity structures without breaking a sweat.' },
      { icon: <Headphones className="w-6 h-6 text-[var(--gg-green)]" />, title: 'Dedicated Support', description: 'Your own support team with direct Slack channels, named account managers, and guaranteed response times around the clock.' },
      { icon: <Wrench className="w-6 h-6 text-[var(--gg-green)]" />, title: 'Custom Development', description: 'Our engineering team builds features specific to your organization, from bespoke modules to industry-specific compliance tools.' },
      { icon: <ShieldCheck className="w-6 h-6 text-[var(--gg-green)]" />, title: 'SLA Guarantees', description: '99.99% uptime commitment with financial penalties for breaches. Enterprise-grade security with SOC 2 and ISO 27001 compliance.' },
      { icon: <Server className="w-6 h-6 text-[var(--gg-green)]" />, title: 'On-Premise Option', description: 'Deploy within your own data center for maximum data sovereignty, regulatory compliance, and infrastructure control.' },
    ],
  },
  {
    title: 'For Multi-Industry Groups',
    subtitle: 'One platform, many verticals',
    iconColor: 'text-[var(--gg-amber)]',
    iconBgClass: 'bg-[var(--gg-amber)]/10',
    features: [
      { icon: <RefreshCw className="w-6 h-6 text-[var(--gg-amber)]" />, title: 'Cross-ERP Sync', description: 'Real-time data synchronization across all your industry ERPs. One change propagates everywhere — no silos, no duplicates.' },
      { icon: <LayoutDashboard className="w-6 h-6 text-[var(--gg-amber)]" />, title: 'Unified Dashboard', description: 'A single command center to monitor performance, revenue, and operations across every business vertical you operate.' },
      { icon: <CreditCard className="w-6 h-6 text-[var(--gg-amber)]" />, title: 'Centralized Billing', description: 'Consolidated invoicing, multi-currency support, and group-level financial reporting across all subsidiaries and brands.' },
      { icon: <PieChart className="w-6 h-6 text-[var(--gg-amber)]" />, title: 'Group Analytics', description: 'Cross-industry benchmarking, consolidated KPIs, and executive dashboards that reveal insights across your entire portfolio.' },
    ],
  },
]

/* ───────────────── CASE STUDIES ───────────────── */
// Default case studies for non-ApparelFlow ERPs
const defaultCaseStudies = [
  {
    company: 'Engro Corporation',
    industry: 'Manufacturing & Fertilizer',
    erp: 'FactoryFlow',
    icon: <Factory className="w-5 h-5 text-[var(--gg-violet)]" />,
    resultLabelColor: 'var(--gg-violet)',
    challenge: 'Multiple plants across Sindh and Punjab with disconnected production tracking, manual quality logs, and no real-time OEE visibility across units.',
    result: 'Unified manufacturing dashboard connecting all plants, real-time OEE monitoring, and automated quality compliance — replacing 12+ spreadsheets with one system.',
    metrics: [
      { label: 'OEE Improvement', value: '+17%' },
      { label: 'Quality Rate', value: '99.4%' },
      { label: 'Cost Savings', value: 'PKR 120M/yr' },
    ],
  },
  {
    company: 'Nishat Group',
    industry: 'Textile & Apparel',
    erp: 'TextileFlow',
    icon: <Shirt className="w-5 h-5 text-[var(--gg-green)]" />,
    resultLabelColor: 'var(--gg-green)',
    challenge: 'Pakistan\'s largest textile conglomerate managing spinning, weaving, dyeing, and stitching across 8 facilities with siloed data and manual compliance tracking.',
    result: 'End-to-end visibility from cotton to garment, automated OEKO-TEX and GOTS compliance, and energy monitoring that eliminated PKR 50M+ in annual waste.',
    metrics: [
      { label: 'Production Yield', value: '+35%' },
      { label: 'Energy Savings', value: 'PKR 50M/yr' },
      { label: 'Compliance Audits', value: '-80% time' },
    ],
  },
  {
    company: 'Systems Limited',
    industry: 'Technology & IT Services',
    erp: 'CreativeFlow',
    icon: <Palette className="w-5 h-5 text-[var(--gg-amber)]" />,
    resultLabelColor: 'var(--gg-amber)',
    challenge: 'Pakistan\'s largest IT company with 5,000+ employees across global delivery centers needed unified project management, resource allocation, and client delivery tracking.',
    result: 'Single platform connecting all delivery centers, automated time tracking and billing, and client portal that reduced review cycles by 60%.',
    metrics: [
      { label: 'Project Delivery', value: '+40% faster' },
      { label: 'Resource Utilization', value: '92%' },
      { label: 'Client Retention', value: '97%' },
    ],
  },
]

/* ───────────────── ROI DATA ───────────────── */
const roiData = [
  { category: 'Manual Processes', before: 35, after: 8, barColor: 'var(--gg-teal)' },
  { category: 'Operational Costs', before: 100, after: 62, barColor: 'var(--gg-violet)' },
  { category: 'Decision Speed', before: 40, after: 90, barColor: 'var(--gg-green)' },
  { category: 'Data Accuracy', before: 72, after: 99, barColor: 'var(--gg-amber)' },
]

/* ───────────────── TAB CONFIG ───────────────── */
const tabConfig = [
  { key: 'startups', label: 'Startups', gradient: 'from-orange-950 via-slate-950 to-slate-950', lightGradient: 'from-orange-50 via-slate-50 to-slate-100', accent: 'var(--gg-vermillion)', accentClass: 'text-[var(--gg-vermillion)]', borderClass: 'border-[var(--gg-vermillion)]', bgAccent: 'bg-[var(--gg-vermillion)]', stripeColor: 'from-[var(--gg-vermillion)] to-[var(--gg-amber)]', dotClass: 'bg-[var(--gg-vermillion)]' },
  { key: 'growing', label: 'Growing', gradient: 'from-amber-950 via-slate-950 to-slate-950', lightGradient: 'from-amber-50 via-slate-50 to-slate-100', accent: 'var(--gg-amber)', accentClass: 'text-[var(--gg-amber)]', borderClass: 'border-[var(--gg-amber)]', bgAccent: 'bg-[var(--gg-amber)]', stripeColor: 'from-[var(--gg-amber)] to-[var(--gg-vermillion)]', dotClass: 'bg-[var(--gg-amber)]' },
  { key: 'enterprise', label: 'Enterprise', gradient: 'from-emerald-950 via-slate-950 to-slate-950', lightGradient: 'from-emerald-50 via-slate-50 to-slate-100', accent: 'var(--gg-green)', accentClass: 'text-[var(--gg-green)]', borderClass: 'border-[var(--gg-green)]', bgAccent: 'bg-[var(--gg-green)]', stripeColor: 'from-[var(--gg-green)] to-[var(--gg-teal)]', dotClass: 'bg-[var(--gg-green)]' },
  { key: 'multi', label: 'Multi-Industry', gradient: 'from-amber-950 via-slate-950 to-slate-950', lightGradient: 'from-amber-50 via-slate-50 to-slate-100', accent: 'var(--gg-amber)', accentClass: 'text-[var(--gg-amber)]', borderClass: 'border-[var(--gg-amber)]', bgAccent: 'bg-[var(--gg-amber)]', stripeColor: 'from-[var(--gg-amber)] to-[var(--gg-vermillion)]', dotClass: 'bg-[var(--gg-amber)]' },
]

const heroMessages: Record<string, { headline: string; highlight: string; sub: string }> = {
  startups: {
    headline: 'Move Fast.',
    highlight: 'Scale Smart.',
    sub: 'From MVP to market leader — ApexFlow gives startups the tools to launch quickly and grow without re-platforming.',
  },
  growing: {
    headline: 'Expand.',
    highlight: 'Without Friction.',
    sub: 'Multi-location operations, advanced analytics, and custom workflows — everything you need to scale confidently.',
  },
  enterprise: {
    headline: 'Unlimited.',
    highlight: 'Uncompromising.',
    sub: 'Enterprise-grade power with dedicated support, SLA guarantees, and custom development for your unique requirements.',
  },
  multi: {
    headline: 'One Platform.',
    highlight: 'Many Verticals.',
    sub: 'Unify operations across diverse industries with cross-ERP sync, centralized billing, and group-wide analytics.',
  },
}

/* ═══════════════════════════════════════════════════════ */
export function SolutionsPage() {
  const { navigate } = useNavigate()
  const { resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })
  const isDark = resolvedTheme === 'dark'

  // ── Fetch real clients from ERP databases for case studies ──
  const [caseStudies, setCaseStudies] = useState(defaultCaseStudies)

  // ── Case studies carousel state ──
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const totalSlides = caseStudies.length

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 'right' : 'left')
    setCurrentSlide(index)
  }, [currentSlide])

  const nextSlide = useCallback(() => {
    setDirection('right')
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setDirection('left')
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-play every 5 seconds, pauses on hover
  useEffect(() => {
    if (isHovered || totalSlides <= 1) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isHovered, nextSlide, totalSlides])

  useEffect(() => {
    let cancelled = false
    // Fetch real clients from multiple ERPs to build case studies
    const erpSlugs = ['apparelflow', 'hotelflow', 'factoryflow']
    const erpMeta: Record<string, { industry: string; erp: string; icon: any; color: string }> = {
      apparelflow: { industry: 'Apparel & Textile', erp: 'ApparelFlow', icon: <Shirt className="w-5 h-5 text-primary" />, color: 'var(--gg-teal)' },
      hotelflow: { industry: 'Hospitality', erp: 'HotelFlow', icon: <Hotel className="w-5 h-5 text-[var(--gg-violet)]" />, color: 'var(--gg-violet)' },
      factoryflow: { industry: 'Manufacturing', erp: 'FactoryFlow', icon: <Factory className="w-5 h-5 text-[var(--gg-amber)]" />, color: 'var(--gg-amber)' },
    }

    const fetchClients = async () => {
      try {
        const liveCaseStudies: any[] = []

        // Fetch from each ERP in parallel
        const results = await Promise.allSettled(
          erpSlugs.map(async (slug) => {
            const endpoint = slug === 'apparelflow'
              ? '/api/erp/apparelflow/clients'
              : `/api/erp-clients?slug=${slug}&limit=3`

            const res = await fetch(endpoint)
            if (!res.ok) return null
            const json = await res.json()
            if (!json.clients?.length) return null

            const activeClients = json.clients.filter((c: any) => c.isActive && c.companyName && c.companyName !== 'Unknown')
            if (activeClients.length === 0) return null

            const meta = erpMeta[slug]
            if (!meta) return null

            // Build a case study from the first active client
            return {
              company: activeClients[0].companyName,
              industry: meta.industry,
              erp: meta.erp,
              icon: meta.icon,
              resultLabelColor: meta.color,
              challenge: `Managing operations with disconnected systems was causing inefficiencies, lack of real-time visibility, and missed revenue opportunities.`,
              result: activeClients[0].tenantStats
                ? `Unified platform managing ${activeClients[0].tenantStats.inventoryItems?.toLocaleString() || 'all'} inventory items, ${activeClients[0].tenantStats.customers?.toLocaleString() || 'all'} customers with complete real-time visibility.`
                : `Unified ${meta.erp} platform providing complete real-time visibility across all operations with automated workflows and intelligent reporting.`,
              metrics: activeClients[0].tenantStats
                ? [
                    { label: 'Inventory Items', value: (activeClients[0].tenantStats.inventoryItems || 0).toLocaleString() },
                    { label: 'Active Customers', value: (activeClients[0].tenantStats.customers || 0).toLocaleString() },
                    { label: 'Sales Orders', value: (activeClients[0].tenantStats.salesOrders || 0).toLocaleString() },
                  ]
                : [
                    { label: 'Efficiency', value: '+40%' },
                    { label: 'Accuracy', value: '99.2%' },
                    { label: 'ROI', value: '3.2x' },
                  ],
            }
          })
        )

        for (const result of results) {
          if (result.status === 'fulfilled' && result.value) {
            liveCaseStudies.push(result.value)
          }
        }

        if (!cancelled && liveCaseStudies.length > 0) {
          // Use live case studies plus any remaining defaults
          const liveCompanies = new Set(liveCaseStudies.map((cs: any) => cs.company))
          const remainingDefaults = defaultCaseStudies.filter((d) => !liveCompanies.has(d.company))
          setCaseStudies([...liveCaseStudies, ...remainingDefaults])
        }
      } catch (err) {
        console.error('[SOLUTIONS] Failed to fetch ERP clients:', err)
      }
    }
    fetchClients()
    return () => { cancelled = true }
  }, [])

  const activeCategory = solutionCategories[activeTab]
  const activeTabCfg = tabConfig[activeTab]

  return (
    <PageLayout>
      {/* ═══════════════════════ TABBED HERO ═══════════════════════ */}
      <section className={`relative pt-20 pb-20 sm:pt-28 sm:pb-24 overflow-hidden bg-gradient-to-b ${isDark ? activeTabCfg.gradient : activeTabCfg.lightGradient} transition-all duration-700`}>
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(128,128,128,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl transition-colors duration-700" style={{ background: activeTabCfg.accent }} />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Tab bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-muted/50 dark:bg-white/[0.06] backdrop-blur-sm border border-border dark:border-white/[0.08]">
              {tabConfig.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(i)}
                  className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === i
                      ? `${tab.accentClass} bg-muted/50 dark:bg-white/[0.08]`
                      : 'text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70 hover:bg-muted/30 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {activeTab === i && (
                    <motion.div
                      layoutId="heroTabIndicator"
                      className="absolute inset-0 rounded-xl border"
                      style={{ borderColor: `${tab.accent}40` }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Hero content per tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground dark:text-white">
                {heroMessages[tabConfig[activeTab].key].headline}
                <br />
                <span style={{ color: activeTabCfg.accent }}>
                  {heroMessages[tabConfig[activeTab].key].highlight}
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground dark:text-white/50 max-w-xl mx-auto leading-relaxed">
                {heroMessages[tabConfig[activeTab].key].sub}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="font-semibold rounded-xl px-7 h-11 text-white border-0 shadow-lg"
                  style={{ background: activeTabCfg.accent, boxShadow: `0 0 24px ${activeTabCfg.accent}30` }}
                  onClick={() => navigate('pricing')}
                >
                  View Pricing <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border dark:border-white/15 text-foreground dark:text-white/80 hover:bg-muted/50 dark:hover:bg-white/[0.06] hover:text-foreground dark:hover:text-white rounded-xl px-7 h-11"
                  onClick={() => navigate('contact')}
                >
                  Talk to Sales
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════ ACTIVE CATEGORY FEATURES ═══════════════════════ */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with subtitle from active category */}
          <motion.div
            key={`header-${activeTab}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 flex items-end justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${activeTabCfg.dotClass}`} />
                <span className={`text-sm font-medium ${activeTabCfg.accentClass} uppercase tracking-wider`}>
                  {activeCategory.title}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">{activeCategory.subtitle}</h2>
            </div>
            <p className="hidden lg:block text-sm text-muted-foreground max-w-sm text-right">
              Tailored features for your stage. Switch tabs above to explore other solutions.
            </p>
          </motion.div>

          {/* 2x2 (or adaptive) grid with gradient-border cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`features-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`grid sm:grid-cols-2 ${activeCategory.features.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-5`}
            >
              {activeCategory.features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <InteractiveCard variant="subtle" glowColor={activeTabCfg.accent}>
                    <div className="relative gg-card bg-card rounded-2xl overflow-hidden group">
                      {/* Colored top stripe */}
                      <div className={`h-1 w-full bg-gradient-to-r ${activeTabCfg.stripeColor}`} />

                      <div className="p-6">
                        {/* Numbered indicator */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                          <span className={`text-3xl font-black ${activeTabCfg.accentClass} opacity-20 select-none`}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════ CASE STUDIES CAROUSEL ═══════════════════════ */}
      <section className="py-16 sm:py-24 bg-secondary/30 dark:bg-[#06060f]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground dark:text-white">
              Real Impact.{' '}
              <span className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] bg-clip-text text-transparent">Real Results.</span>
            </h2>
            <p className="mt-3 text-muted-foreground dark:text-white/40 max-w-lg">See how organizations across Pakistan are transforming their operations with ApexFlow.</p>
          </motion.div>

          {/* Auto-playing single-card carousel */}
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Carousel viewport */}
            <div className="relative overflow-hidden rounded-2xl">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: direction === 'right' ? 80 : -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === 'right' ? -80 : 80 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="w-full"
                >
                  {(() => {
                    const cs = caseStudies[currentSlide]
                    return (
                      <InteractiveCard variant="strong" glowColor={cs.resultLabelColor}>
                        <div className="bg-card dark:bg-[#0a0a1a]/95 backdrop-blur rounded-2xl w-full">
                          {/* Quote mark */}
                          <div className="relative p-6 sm:p-8 pb-0">
                            <Quote className="w-12 h-12 text-foreground/10 dark:text-white/[0.06] absolute top-4 right-6" />
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-12 h-12 rounded-xl bg-muted/50 dark:bg-white/[0.05] flex items-center justify-center">
                                {cs.icon}
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground dark:text-white text-lg">{cs.company}</h3>
                                <p className="text-xs text-muted-foreground dark:text-white/40">{cs.industry} &middot; Powered by {cs.erp}</p>
                              </div>
                            </div>
                          </div>

                          <div className="px-6 sm:px-8 space-y-5">
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-muted-foreground dark:text-white/30 font-medium mb-1.5">Challenge</div>
                              <p className="text-sm text-muted-foreground dark:text-white/50 leading-relaxed">{cs.challenge}</p>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-wider font-medium mb-1.5" style={{ color: cs.resultLabelColor }}>Result</div>
                              <p className="text-sm text-foreground dark:text-white/70 leading-relaxed font-medium">{cs.result}</p>
                            </div>
                          </div>

                          {/* Metrics — large and highlighted */}
                          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-5">
                            <div className="grid grid-cols-3 gap-4 p-4 sm:p-5 rounded-xl bg-muted/30 dark:bg-white/[0.03] border border-border dark:border-white/[0.06]">
                              {cs.metrics.map((m) => (
                                <div key={m.label} className="text-center">
                                  <div className="text-xl sm:text-2xl font-extrabold" style={{ color: cs.resultLabelColor }}>{m.value}</div>
                                  <div className="text-[11px] text-muted-foreground dark:text-white/35 mt-0.5">{m.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </InteractiveCard>
                    )
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Left / Right arrow buttons */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="Previous case study"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 dark:bg-white/10 backdrop-blur-sm border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white/70 hover:bg-background dark:hover:bg-white/20 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next case study"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 dark:bg-white/10 backdrop-blur-sm border border-border dark:border-white/10 flex items-center justify-center text-foreground dark:text-white/70 hover:bg-background dark:hover:bg-white/20 transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Navigation dots */}
            {totalSlides > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {caseStudies.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to case study ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? 'w-8 bg-[var(--gg-vermillion)]'
                        : 'w-2 bg-muted-foreground/30 dark:bg-white/20 hover:bg-muted-foreground/50 dark:hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ROI — BEFORE/AFTER ═══════════════════════ */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Before &amp;{' '}
              <span className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] bg-clip-text text-transparent">After ApexFlow</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">See the measurable impact across key operational metrics.</p>
          </motion.div>

          {/* Single large card with floating ROI badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Floating ROI badge */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 3 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
              className="absolute -top-5 -right-2 sm:right-6 z-20 bg-gradient-to-br from-[var(--gg-vermillion)] to-[var(--gg-amber)] text-white rounded-2xl px-5 py-3 shadow-lg shadow-[var(--gg-vermillion)]/20"
            >
              <div className="text-2xl sm:text-3xl font-black leading-none">340%</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mt-0.5">ROI</div>
            </motion.div>

            <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
              <div className="bg-card dark:bg-[#0a0a1a]/90 backdrop-blur rounded-2xl p-6 sm:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Before column */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30 dark:bg-white/30" />
                      <span className="text-sm font-semibold text-muted-foreground dark:text-white/40 uppercase tracking-wider">Before ApexFlow</span>
                    </div>
                    <div className="space-y-5">
                      {roiData.map((item, i) => (
                        <div key={`before-${item.category}`}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground dark:text-white/40">{item.category}</span>
                            <span className="text-foreground/50 dark:text-white/30">{item.before}%</span>
                          </div>
                          <div className="h-3 bg-muted/40 dark:bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.before}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                              className="h-full rounded-full bg-muted dark:bg-white/[0.12]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* After column */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">After ApexFlow</span>
                    </div>
                    <div className="space-y-5">
                      {roiData.map((item, i) => (
                        <div key={`after-${item.category}`}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-foreground dark:text-white/60">{item.category}</span>
                            <span style={{ color: item.barColor }}>{item.after}%</span>
                          </div>
                          <div className="h-3 bg-muted/40 dark:bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.after}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              className="h-full rounded-full"
                              style={{ background: item.barColor }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom improvement summary */}
                <div className="mt-8 pt-6 border-t border-border dark:border-white/[0.06] flex flex-wrap justify-center gap-6 sm:gap-10">
                  {roiData.map((item) => {
                    const isReduction = item.category === 'Operational Costs' || item.category === 'Manual Processes'
                    const pct = isReduction
                      ? Math.round(((item.before - item.after) / item.before) * 100)
                      : Math.round(((item.after - item.before) / item.before) * 100)
                    return (
                      <div key={item.category} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" style={{ color: item.barColor }} />
                        <span className="text-sm font-semibold" style={{ color: item.barColor }}>
                          {pct}% {isReduction ? 'reduction' : 'improvement'}
                        </span>
                        <span className="text-xs text-muted-foreground dark:text-white/30">in {item.category}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ CONSULTATIVE CTA ═══════════════════════ */}
      <section className="py-16 sm:py-24 bg-secondary/30 dark:bg-[#06060f]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <InteractiveCard variant="strong" glowColor="var(--gg-violet)">
            <div className="bg-card dark:bg-gradient-to-br dark:from-[#0c0c1e] dark:to-[#0a0a16] rounded-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left — Mini form */}
                <div className="p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-border dark:border-white/[0.06]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="inline-flex items-center gap-2 bg-[var(--gg-violet)]/10 border border-[var(--gg-violet)]/20 rounded-full px-3 py-1 mb-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--gg-violet)] animate-pulse" />
                      <span className="text-xs font-medium text-[var(--gg-violet)]">Free consultation</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white mb-2">
                      Get a Custom Proposal
                    </h2>
                    <p className="text-sm text-muted-foreground dark:text-white/40 mb-8">
                      Tell us about your business and we&apos;ll craft a tailored solution recommendation.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground dark:text-white/40 uppercase tracking-wider mb-1.5">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          className="w-full bg-muted/40 dark:bg-white/[0.04] border border-border dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-white/20 focus:outline-none focus:border-[var(--gg-violet)]/50 focus:ring-1 focus:ring-[var(--gg-violet)]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground dark:text-white/40 uppercase tracking-wider mb-1.5">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="you@company.com"
                          className="w-full bg-muted/40 dark:bg-white/[0.04] border border-border dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-white/20 focus:outline-none focus:border-[var(--gg-violet)]/50 focus:ring-1 focus:ring-[var(--gg-violet)]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground dark:text-white/40 uppercase tracking-wider mb-1.5">Company</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Your company name"
                          className="w-full bg-muted/40 dark:bg-white/[0.04] border border-border dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-white/20 focus:outline-none focus:border-[var(--gg-violet)]/50 focus:ring-1 focus:ring-[var(--gg-violet)]/20 transition-all"
                        />
                      </div>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-white font-semibold btn-glow rounded-xl h-12 shadow-lg shadow-[var(--gg-vermillion)]/20 mt-2"
                        onClick={() => navigate('contact')}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Request Custom Proposal
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Right — Description */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-4">
                      Not sure which solution fits?
                    </h3>
                    <p className="text-muted-foreground dark:text-white/40 leading-relaxed mb-6">
                      Every business is unique. Our solution architects will analyze your workflows, identify bottlenecks, and recommend the perfect ApexFlow configuration — no commitment required.
                    </p>

                    <div className="space-y-4">
                      {[
                        { label: 'Personalized demo with your data', icon: <Target className="w-5 h-5 text-[var(--gg-teal)]" /> },
                        { label: 'ROI estimate for your specific case', icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
                        { label: 'Implementation timeline & roadmap', icon: <Clock className="w-5 h-5 text-[var(--gg-violet)]" /> },
                        { label: 'No-obligation consultation', icon: <Layers className="w-5 h-5 text-amber-400" /> },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted/40 dark:bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <span className="text-sm text-foreground dark:text-white/60">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border dark:border-white/[0.06]">
                      <p className="text-xs text-muted-foreground dark:text-white/25">
                        Average response time: <span className="text-muted-foreground dark:text-white/50 font-medium">under 2 hours</span>
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </InteractiveCard>
        </div>
      </section>
    </PageLayout>
  )
}
