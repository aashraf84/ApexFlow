'use client'

import { useState, useMemo, createElement, useRef, useEffect } from 'react'
import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { useErpSystems, getErpIcon, getErpColor } from '@/lib/erp-data'
import type { ErpSystemData } from '@/lib/erp-data'
import { getErpDetail } from '@/lib/erp-detail-data'
import type { ErpDetailData } from '@/lib/erp-detail-data'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Clock, ChevronRight, ChevronDown, Loader2, AlertCircle,
  ArrowRight, Zap, Layers, Check, ExternalLink, Sparkles,
  Factory, Package, ShoppingCart, Truck, ShieldCheck, Landmark, Scissors, Globe,
  Calendar, Monitor, UtensilsCrossed, HeartPulse, TrendingUp, Users, Moon,
  BookOpen, CreditCard, FileText, Library, Briefcase, Smartphone,
  BarChart3, Cpu, ClipboardList, Receipt, Car, Tag, Tv, Bus,
  Map as MapIcon, List, Bell, Wrench, Building2, MessageCircle,
  Hash, Phone, Mail, Cloud, Hotel, GraduationCap, Pill, Compass, Shirt, Fuel,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ═══════════════════════════════════════════════════════════════ */
/*  Module Icon Map                                                */
/* ═══════════════════════════════════════════════════════════════ */

const MODULE_ICON_MAP: Record<string, LucideIcon> = {
  factory: Factory,
  package: Package,
  shopping: ShoppingCart,
  truck: Truck,
  shield: ShieldCheck,
  landmark: Landmark,
  scissors: Scissors,
  globe: Globe,
  calendar: Calendar,
  monitor: Monitor,
  sparkles: Sparkles,
  utensils: UtensilsCrossed,
  heart: HeartPulse,
  'trending-up': TrendingUp,
  users: Users,
  moon: Moon,
  'book-open': BookOpen,
  'credit-card': CreditCard,
  'file-text': FileText,
  library: Library,
  briefcase: Briefcase,
  smartphone: Smartphone,
  'bar-chart': BarChart3,
  cpu: Cpu,
  clipboard: ClipboardList,
  receipt: Receipt,
  car: Car,
  tag: Tag,
  tv: Tv,
  bus: Bus,
  map: MapIcon,
  list: List,
  bell: Bell,
  wrench: Wrench,
  building: Building2,
  'message-circle': MessageCircle,
  hash: Hash,
  phone: Phone,
  mail: Mail,
  cloud: Cloud,
  hotel: Hotel,
  graduation: GraduationCap,
  pill: Pill,
  compass: Compass,
  fuel: Fuel,
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Category Definitions                                           */
/* ═══════════════════════════════════════════════════════════════ */

type CategoryKey = 'all' | 'manufacturing' | 'hospitality' | 'commerce' | 'property' | 'knowledge' | 'automotive' | 'electronics' | 'transport'

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'hospitality', label: 'Hospitality' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'property', label: 'Property' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'automotive', label: 'Automotive' },
  { key: 'transport', label: 'Transport' },
]

function industryToCategory(industry: string): CategoryKey {
  const lower = industry.toLowerCase()
  if (lower.includes('manufactur') || lower.includes('textile') || lower.includes('apparel')) return 'manufacturing'
  if (lower.includes('hospital') || lower.includes('food') || lower.includes('restaurant')) return 'hospitality'
  if (lower.includes('retail') || lower.includes('distribut') || lower.includes('wholesale') || lower.includes('logistic') || lower.includes('supply chain') || lower.includes('travel') || lower.includes('tourism')) return 'commerce'
  if (lower.includes('property') || lower.includes('real estate') || lower.includes('tenant') || lower.includes('construct') || lower.includes('build')) return 'property'
  if (lower.includes('educa') || lower.includes('health') || lower.includes('pharma') || lower.includes('creative') || lower.includes('design')) return 'knowledge'
  if (lower.includes('electron') || lower.includes('appliance')) return 'electronics'
  if (lower.includes('salon') || lower.includes('beauty')) return 'hospitality'
  if (lower.includes('automotive') || lower.includes('workshop')) return 'automotive'
  if (lower.includes('fleet') || lower.includes('transport')) return 'transport'
  return 'all'
}

/* ═══════════════════════════════════════════════════════════════ */
/*  iOS Accent Color Map                                           */
/* ═══════════════════════════════════════════════════════════════ */

const ACCENT_BG: Record<string, string> = {
  teal: 'var(--gg-teal)',
  cyan: 'var(--gg-teal)',
  amber: 'var(--gg-amber)',
  emerald: 'var(--gg-green)',
  orange: 'var(--gg-amber)',
  red: 'var(--gg-rose)',
  yellow: 'var(--gg-amber)',
  lime: 'var(--gg-green)',
  pink: 'var(--gg-rose)',
  rose: 'var(--gg-rose)',
  fuchsia: 'var(--gg-violet)',
  sky: 'var(--gg-teal)',
  violet: 'var(--gg-violet)',
  green: 'var(--gg-green)',
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Animation Variants                                             */
/* ═══════════════════════════════════════════════════════════════ */

const iosEase = [0.25, 0.46, 0.45, 0.94] as const

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: iosEase } },
}

const moduleStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const moduleFadeIn = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: iosEase } },
}

const cardFadeIn = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: iosEase } },
}

const featureReveal = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: iosEase } },
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Animated Counter Component                                     */
/* ═══════════════════════════════════════════════════════════════ */

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useMemo(() => {
    let start = 0
    const duration = 1200
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * value)
      setDisplay(start)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [value])

  return <>{display}{suffix}</>
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Get module icon                                                */
/* ═══════════════════════════════════════════════════════════════ */

function getModuleIcon(iconName: string): LucideIcon {
  return MODULE_ICON_MAP[iconName] || Layers
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Sliding Pill Tab Indicator                                     */
/* ═══════════════════════════════════════════════════════════════ */

function CategoryPillTabs({
  categories,
  activeKey,
  onChange,
  counts,
}: {
  categories: { key: CategoryKey; label: string }[]
  activeKey: CategoryKey
  onChange: (key: CategoryKey) => void
  counts: Record<string, number>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const activeEl = containerRef.current.querySelector(`[data-cat-key="${activeKey}"]`) as HTMLElement
    if (activeEl) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const elRect = activeEl.getBoundingClientRect()
      setIndicator({
        left: elRect.left - containerRect.left + containerRef.current.scrollLeft,
        width: elRect.width,
      })
    }
  }, [activeKey])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1.5 py-2 overflow-x-auto custom-scrollbar"
    >
      {/* Sliding indicator pill */}
      <motion.div
        className="absolute top-2 h-[calc(100%-16px)] rounded-full bg-foreground/[0.07] dark:bg-foreground/[0.12] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />
      {categories.map((cat) => {
        const isActive = activeKey === cat.key
        return (
          <button
            key={cat.key}
            data-cat-key={cat.key}
            onClick={() => onChange(cat.key)}
            className={`
              relative z-10 shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              flex items-center gap-1.5
              ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}
            `}
          >
            {cat.label}
            <span
              className={`
                inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold
                transition-colors duration-200
                ${isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-secondary/60 text-muted-foreground'
                }
              `}
            >
              {counts[cat.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Products Page Component                                        */
/* ═══════════════════════════════════════════════════════════════ */

export function ProductsPage() {
  const { navigate } = useNavigate()
  const { activeErps, comingSoonErps, loading, error, industryVerticals } = useErpSystems()

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [expandedErp, setExpandedErp] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const allErps = useMemo(() => [...activeErps, ...comingSoonErps], [activeErps, comingSoonErps])

  const filteredErps = useMemo(() => {
    if (activeCategory === 'all') return allErps
    return allErps.filter((erp) => industryToCategory(erp.industry) === activeCategory)
  }, [allErps, activeCategory])

  const filteredActive = useMemo(() => filteredErps.filter((e) => e.status === 'active'), [filteredErps])
  const filteredComingSoon = useMemo(() => filteredErps.filter((e) => e.status === 'coming_soon'), [filteredErps])

  // Compute total modules across all active ERPs
  const totalModules = useMemo(() => {
    let count = 0
    activeErps.forEach((erp) => {
      const detail = getErpDetail(erp.slug)
      if (detail) count += detail.modules.length
    })
    return count
  }, [activeErps])

  // Category counts for pill tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    CATEGORIES.forEach((cat) => {
      if (cat.key === 'all') {
        counts[cat.key] = allErps.length
      } else {
        counts[cat.key] = allErps.filter((erp) => industryToCategory(erp.industry) === cat.key).length
      }
    })
    return counts
  }, [allErps])

  const toggleErp = (slug: string) => {
    setExpandedErp((prev) => (prev === slug ? null : slug))
    setExpandedModule(null)
  }

  return (
    <PageLayout>
      {/* ═══════════════════════════ SPLIT-LAYOUT HERO ═══════════════════════ */}
      <section className="relative pt-20 pb-14 sm:pt-24 sm:pb-16 bg-gradient-to-b from-secondary/50 to-background overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* LEFT: Large "21" number display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: iosEase }}
              className="flex flex-col items-center lg:items-start shrink-0"
            >
              <div className="text-[7rem] sm:text-[9rem] lg:text-[11rem] font-black leading-none tracking-tighter bg-gradient-to-br from-[var(--gg-green)] via-[var(--gg-teal)] to-[var(--gg-amber)] bg-clip-text text-transparent select-none">
                21
              </div>
              <p className="text-sm sm:text-base font-semibold text-muted-foreground mt-1 text-center lg:text-left tracking-wide">
                AI-Powered Operating Systems
              </p>
            </motion.div>

            {/* RIGHT: Headline + stats + CTAs */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: iosEase }}
              className="flex-1 text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground">
                Purpose-Built ERPs
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  For Every Industry
                </span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                From hospitality to manufacturing, each system is designed for the real world —
                with full POS, CRM, inventory, and operational capabilities built in.
              </p>

              {/* Stats in horizontal row */}
              {!loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: iosEase }}
                  className="mt-6 flex items-center gap-4 sm:gap-6 justify-center lg:justify-start"
                >
                  {[
                    { label: 'Active ERPs', value: activeErps.length, suffix: '' },
                    { label: 'Modules', value: totalModules, suffix: '+' },
                    { label: 'Industries', value: industryVerticals, suffix: '' },
                  ].map((stat, i) => (
                    <div key={stat.label} className="flex items-center gap-2.5">
                      {i > 0 && <div className="w-px h-8 bg-border" />}
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-white font-semibold rounded-xl px-7 h-12 btn-glow shadow-[var(--gg-shadow-sm)] transition-all duration-200"
                  onClick={() => navigate('pricing')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground/80 hover:bg-secondary/50 hover:text-foreground rounded-xl px-7 h-12 transition-all duration-200"
                  onClick={() => navigate('pricing')}
                >
                  View Pricing
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FEATURED ERP SHOWCASE ═══════════════════════════ */}
      <section className="py-12 sm:py-16 bg-[var(--gg-grouped-bg)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: iosEase }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Flagship <span className="bg-gradient-to-r from-[var(--gg-green)] to-[var(--gg-teal)] bg-clip-text text-transparent">Systems</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Three integrated platforms leading the ecosystem
            </p>
          </motion.div>

          {/* 3-column equal layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PharmaFlow — red accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: iosEase }}
              className="group relative gg-card bg-card rounded-2xl overflow-hidden shadow-[var(--gg-shadow-sm)] hover:shadow-[var(--gg-shadow-card)] transition-all duration-300"
              style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(to right, #ef4444, #f97316) 1' }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Pill className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">PharmaFlow</h3>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                        <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                        Live
                      </span>
                    </div>
                    <p className="text-sm font-medium text-red-500">Pharmaceutical</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Complete pharmaceutical management system — e-prescriptions, drug interaction alerts,
                  batch & expiry tracking, DRAP compliance, controlled substance logs, and multi-pharmacy operations.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { icon: 'pill', label: 'Prescriptions' },
                    { icon: 'package', label: 'Batch & Expiry' },
                    { icon: 'shield', label: 'DRAP Compliance' },
                    { icon: 'building', label: 'Multi-Branch' },
                    { icon: 'shopping', label: 'POS & Insurance' },
                    { icon: 'bar-chart', label: 'Analytics' },
                  ].map((cap) => {
                    const CapIcon = MODULE_ICON_MAP[cap.icon] || Layers
                    return (
                      <div key={cap.label} className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                        <CapIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="text-xs font-medium text-foreground/80">{cap.label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-5 h-10 shadow-[var(--gg-shadow-sm)] transition-all duration-200"
                    onClick={() => navigate('erp-detail', 'pharmaflow')}
                  >
                    Explore PharmaFlow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-5 h-10 transition-all duration-200"
                    onClick={() => window.open('https://pharmaflowerp.vercel.app/', '_blank', 'noopener')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Live Demo
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* ApparelFlow — cyan accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: iosEase, delay: 0.1 }}
              className="group relative gg-card bg-card rounded-2xl overflow-hidden shadow-[var(--gg-shadow-sm)] hover:shadow-[var(--gg-shadow-card)] transition-all duration-300"
              style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(to right, var(--gg-teal), #0891b2) 1' }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--gg-teal)]/10 border border-[var(--gg-teal)]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Shirt className="w-7 h-7 text-[var(--gg-teal)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">ApparelFlow</h3>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                        <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                        Live
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--gg-teal)]">Apparel & Textile</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  End-to-end ERP for the garment industry — from fabric requisition and cutting plans to stitching WIP,
                  washing, packing, and shipment. Track every order from PO to delivery with real-time production dashboards.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { icon: 'factory', label: 'Production Orders' },
                    { icon: 'package', label: 'Fabric Inventory' },
                    { icon: 'credit-card', label: 'Costing & Billing' },
                    { icon: 'truck', label: 'Shipment Tracking' },
                    { icon: 'bar-chart', label: 'WIP Dashboard' },
                    { icon: 'users', label: 'Vendor Mgmt' },
                  ].map((cap) => {
                    const CapIcon = MODULE_ICON_MAP[cap.icon] || Layers
                    return (
                      <div key={cap.label} className="flex items-center gap-2 bg-[var(--gg-teal)]/5 border border-[var(--gg-teal)]/10 rounded-lg px-3 py-2">
                        <CapIcon className="w-3.5 h-3.5 text-[var(--gg-teal)] shrink-0" />
                        <span className="text-xs font-medium text-foreground/80">{cap.label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className="bg-[var(--gg-teal)] hover:bg-[var(--gg-teal)] text-white font-semibold rounded-xl px-5 h-10 shadow-[var(--gg-shadow-sm)] transition-all duration-200"
                    onClick={() => navigate('erp-detail', 'apparelflow')}
                  >
                    Explore ApparelFlow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-5 h-10 transition-all duration-200"
                    onClick={() => navigate('pricing')}
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* FuelFlow — orange accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: iosEase, delay: 0.2 }}
              className="group relative gg-card bg-card rounded-2xl overflow-hidden shadow-[var(--gg-shadow-sm)] hover:shadow-[var(--gg-shadow-card)] transition-all duration-300"
              style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(to right, #f97316, #eab308) 1' }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Fuel className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">FuelFlow</h3>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                        <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                        Live
                      </span>
                    </div>
                    <p className="text-sm font-medium text-orange-500">Fuel & Energy</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Comprehensive fuel station management — IoT-enabled dispenser control, ATG tank monitoring,
                  forecourt automation, fuel delivery tracking, CNG/EV support, and multi-station operations.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { icon: 'fuel', label: 'Dispenser Control' },
                    { icon: 'package', label: 'Tank Monitoring' },
                    { icon: 'truck', label: 'Delivery Tracking' },
                    { icon: 'wrench', label: 'CNG & EV' },
                    { icon: 'building', label: 'Multi-Station' },
                    { icon: 'bar-chart', label: 'Shift & Reports' },
                  ].map((cap) => {
                    const CapIcon = MODULE_ICON_MAP[cap.icon] || Layers
                    return (
                      <div key={cap.label} className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/10 rounded-lg px-3 py-2">
                        <CapIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="text-xs font-medium text-foreground/80">{cap.label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl px-5 h-10 shadow-[var(--gg-shadow-sm)] transition-all duration-200"
                    onClick={() => navigate('erp-detail', 'fuelflow')}
                  >
                    Explore FuelFlow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-5 h-10 transition-all duration-200"
                    onClick={() => window.open('https://fuelflowerp.vercel.app/', '_blank', 'noopener')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Live Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CATEGORY FILTERS — PILL TABS ═══════════════════════════ */}
      <section className="bg-background border-t border-[var(--gg-separator)] sticky top-16 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryPillTabs
            categories={CATEGORIES}
            activeKey={activeCategory}
            onChange={(key) => { setActiveCategory(key); setExpandedErp(null); setExpandedModule(null) }}
            counts={categoryCounts}
          />
        </div>
      </section>

      {/* ═══════════════════════════ LOADING STATE ═══════════════════════════ */}
      {loading && (
        <section className="py-20 bg-background">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading ERP platforms...</p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════ ERROR STATE ═══════════════════════════ */}
      {error && !loading && (
        <section className="py-20 bg-background">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-muted-foreground">Failed to load ERP platforms. Please try again later.</p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════ PRODUCT LIST — MINI CARD GRID ═══════════════════════════ */}
      {!loading && !error && (
        <section className="py-12 sm:py-16 bg-[var(--gg-grouped-bg)]">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Active Products — Mini Card Grid */}
            {filteredActive.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                    Active Platforms
                  </h2>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {filteredActive.length}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredActive.map((erp) => (
                      <ErpCard
                        key={erp.id}
                        erp={erp}
                        onNavigate={(slug: string) => navigate('erp-detail', slug)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Coming Soon Products — Dashed Cards */}
            {filteredComingSoon.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <Clock className="w-4 h-4 text-[var(--gg-amber)]" />
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                    Coming Soon
                  </h2>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-[var(--gg-amber)]/10 text-[var(--gg-amber)]">
                    {filteredComingSoon.length}
                  </span>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  key={`soon-${activeCategory}`}
                  className="flex flex-wrap gap-3"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredComingSoon.map((erp) => (
                      <ComingSoonCard
                        key={erp.id}
                        erp={erp}
                        onNavigate={(slug: string) => navigate('erp-detail', slug)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Empty state */}
            {filteredActive.length === 0 && filteredComingSoon.length === 0 && (
              <div className="py-20 text-center">
                <Layers className="w-10 h-10 text-foreground/35 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No products found in this category.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════ CTA — FULL-WIDTH GRADIENT BANNER ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gg-green)] via-[var(--gg-teal)] to-[var(--gg-amber)]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          {/* Floating card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: iosEase }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl gg-glass p-8 sm:p-12 max-w-2xl mx-auto text-center shadow-2xl"
          >
            <Sparkles className="w-8 h-8 text-white/80 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
              Your Industry Is Next
            </h2>
            <p className="text-white/70 max-w-md mx-auto mb-8">
              Don&apos;t see your industry? We&apos;re always expanding. Let us know what you need.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-white/90 font-semibold rounded-xl px-7 h-12 shadow-lg transition-all duration-200"
                onClick={() => navigate('contact')}
              >
                Suggest an Industry
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl px-7 h-12 transition-all duration-200"
                onClick={() => navigate('pricing')}
              >
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
/*  ERP Card — Mini card with colored left border + hover glow    */
/* ═══════════════════════════════════════════════════════════════ */

function ErpCard({
  erp,
  onNavigate,
}: {
  erp: ErpSystemData
  onNavigate: (slug: string) => void
}) {
  const colors = getErpColor(erp.color)
  const accentColor = ACCENT_BG[erp.color] || 'var(--gg-teal)'
  const detail = getErpDetail(erp.slug)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      variants={cardFadeIn}
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate(erp.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNavigate(erp.slug)
        }
      }}
      aria-label={`View ${erp.name} details`}
    >
      {/* Glow backdrop */}
      <motion.div
        className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.hex}15, transparent 70%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Main card — with colored left border and slow zoom */}
      <div
        className="relative gg-card bg-card rounded-xl overflow-hidden h-full flex flex-col transition-all duration-700 ease-out group-hover:scale-[1.03]"
        style={{
          borderLeft: `3px solid ${colors.hex}`,
          border: `1px solid ${isHovered ? colors.hoverBorder : 'var(--border)'}`,
          borderLeftWidth: '3px',
          borderLeftColor: colors.hex,
          boxShadow: isHovered
            ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.hex}10, 0 4px 16px rgba(0,0,0,0.08)`
            : 'var(--gg-shadow-sm)',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.7s ease-out',
        }}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Icon + Name + Status Row */}
          <div className="flex items-center gap-3.5 mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500"
              style={{
                backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                boxShadow: isHovered ? `0 0 12px ${colors.glow}` : 'none',
              }}
            >
              {createElement(getErpIcon(erp.icon), { className: 'w-5 h-5', style: { color: colors.hex } })}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground truncate">{erp.name}</h3>
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--gg-green)]" />
              </div>
              <p className="text-xs text-muted-foreground truncate">{erp.industry}</p>
            </div>

            {/* Status badge */}
            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
              Active
            </span>
          </div>

          {/* Tagline */}
          {detail && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{detail.tagline}</p>
          )}

          {/* Module count + pricing row */}
          <div className="mt-auto flex items-center justify-between">
            {detail && (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: colors.hex }} />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {detail.modules.length} Modules
                </span>
              </div>
            )}
            <motion.div animate={{ x: isHovered ? 4 : 0 }} transition={{ duration: 0.3 }}>
              <ArrowRight
                className="w-4 h-4 transition-colors duration-300"
                style={{ color: isHovered ? colors.hex : 'var(--muted-foreground)' }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
/*  ERP Section — Collapsed/Expanded for Active ERPs              */
/* ═══════════════════════════════════════════════════════════════ */

function ErpSection({
  erp,
  isExpanded,
  expandedModule,
  onToggle,
  onToggleModule,
  onNavigate,
}: {
  erp: ErpSystemData
  isExpanded: boolean
  expandedModule: string | null
  onToggle: () => void
  onToggleModule: (key: string) => void
  onNavigate: (slug: string) => void
}) {
  const colors = getErpColor(erp.color)
  const accentColor = ACCENT_BG[erp.color] || 'var(--gg-teal)'
  const detail = getErpDetail(erp.slug)

  return (
    <motion.div
      variants={fadeUp}
      layout
      className="gg-elevated bg-card border border-border rounded-2xl shadow-[var(--gg-shadow-sm)] overflow-hidden"
      style={isExpanded ? { boxShadow: `0 4px 24px color-mix(in srgb, ${colors.hex} 10%, transparent)` } : undefined}
    >
      {/* ─── Collapsed Header ─── */}
      <div
        className="p-5 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-colors duration-200"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${erp.name} modules`}
      >
        <div className="flex items-start gap-4">
          {/* Icon with brand color glow */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
              boxShadow: isExpanded ? `0 0 20px color-mix(in srgb, ${colors.hex} 15%, transparent)` : 'none',
            }}
          >
            {createElement(getErpIcon(erp.icon), { className: 'w-7 h-7', style: { color: colors.hex } })}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Badges Row */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{erp.name}</h3>
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                Active
              </span>
              <Badge variant="outline" className="text-[10px] font-medium border-border">
                {erp.industry}
              </Badge>
            </div>

            {/* Tagline */}
            {detail && (
              <p className="text-sm font-medium text-muted-foreground mb-2">{detail.tagline}</p>
            )}

            {/* Key Stats Row */}
            {detail && (
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-2">
                {detail.stats.slice(0, 4).map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{stat.value}</span>
                    <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing */}
            {detail && (
              <p className="text-xs font-medium text-primary">{detail.pricing}</p>
            )}
          </div>

          {/* Expand/Collapse button */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: iosEase }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              {isExpanded ? 'Collapse' : 'Explore'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Expanded Content ─── */}
      <AnimatePresence>
        {isExpanded && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: iosEase }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--gg-separator)]">
              {/* Hero Description */}
              <div className="px-5 sm:px-6 pt-5 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                  {detail.heroDescription}
                </p>
              </div>

              {/* Benefits Bar */}
              <div className="px-5 sm:px-6 pb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {detail.benefits.slice(0, 4).map((benefit) => (
                    <div
                      key={benefit.title}
                      className="bg-secondary/40 rounded-xl px-3 py-2.5 border border-border/50"
                    >
                      <div className="text-lg font-bold text-foreground">{benefit.metric}</div>
                      <div className="text-[11px] text-muted-foreground font-medium leading-tight">{benefit.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules Section */}
              <div className="px-5 sm:px-6 pb-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {detail.modules.length} Core Modules
                  </h4>
                </div>

                <motion.div
                  variants={moduleStagger}
                  initial="hidden"
                  animate="visible"
                  className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  {detail.modules.map((mod, modIdx) => {
                    const modKey = `${erp.slug}-${modIdx}`
                    const isModExpanded = expandedModule === modKey
                    const modFeatures = detail.moduleFeatures.find(
                      (mf) => mf.moduleName === mod.name
                    )
                    const ModIcon = getModuleIcon(mod.icon)

                    return (
                      <motion.div
                        key={modKey}
                        variants={moduleFadeIn}
                        className={`
                          rounded-xl border transition-all duration-200
                          ${isModExpanded
                            ? 'bg-card border-border shadow-[var(--gg-shadow-card)] sm:col-span-2 lg:col-span-2'
                            : 'bg-secondary/30 border-border/50 hover:border-border hover:bg-secondary/60'
                          }
                        `}
                      >
                        {/* Module Header */}
                        <div
                          className="flex items-center gap-2.5 p-3 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onToggleModule(modKey) }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleModule(modKey) } }}
                          aria-expanded={isModExpanded}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
                          >
                            <ModIcon className="w-4 h-4" style={{ color: colors.hex }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-semibold text-foreground truncate">{mod.name}</h5>
                          </div>
                          <motion.div
                            animate={{ rotate: isModExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          </motion.div>
                        </div>

                        {/* Module Description (always visible) */}
                        <div className="px-3 pb-2">
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{mod.description}</p>
                        </div>

                        {/* Expanded Module Features */}
                        <AnimatePresence>
                          {isModExpanded && modFeatures && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: iosEase }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 border-t border-[var(--gg-separator)] pt-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  {modFeatures.features.length} Features
                                </p>
                                <motion.div
                                  variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
                                  }}
                                  initial="hidden"
                                  animate="visible"
                                  className="grid grid-cols-1 sm:grid-cols-2 gap-1"
                                >
                                  {modFeatures.features.map((feature) => (
                                    <motion.div
                                      key={feature}
                                      variants={featureReveal}
                                      className="flex items-start gap-1.5 py-0.5"
                                    >
                                      <Check className="w-3 h-3 text-[var(--gg-green)] shrink-0 mt-0.5" />
                                      <span className="text-[11px] text-foreground/80 leading-tight">{feature}</span>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>

              {/* Quick Pricing + CTAs */}
              <div className="px-5 sm:px-6 pb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/30 rounded-xl border border-border/50 p-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">
                        Starting from PKR {detail.pkrMonthly.toLocaleString()}/mo
                      </span>
                      <Badge className="bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20 text-[10px]">
                        Save 20% Annual
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Annual: PKR {Math.round(detail.pkrMonthly * 12 * 0.8).toLocaleString()}/year — includes all {detail.modules.length} modules
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-[var(--gg-teal)] hover:bg-[var(--gg-teal)]/90 text-white font-semibold rounded-lg h-9 px-4 shadow-[var(--gg-shadow-sm)]"
                      onClick={(e) => { e.stopPropagation(); navigate('pricing') }}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5" />
                      Get Started
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground/80 hover:bg-secondary/50 rounded-lg h-9 px-4"
                      onClick={(e) => { e.stopPropagation(); onNavigate(erp.slug) }}
                    >
                      View Full Details
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Differentiators */}
              {detail.differentiators.length > 0 && (
                <div className="px-5 sm:px-6 pb-5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">What Makes {erp.name} Different</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {detail.differentiators.map((diff) => (
                      <div key={diff} className="flex items-start gap-2 bg-secondary/20 rounded-lg p-2.5">
                        <Check className="w-3.5 h-3.5 text-[var(--gg-green)] shrink-0 mt-0.5" />
                        <span className="text-[11px] text-foreground/80 leading-tight">{diff}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrations Preview */}
              {detail.integrations.length > 0 && (
                <div className="px-5 sm:px-6 pb-5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Integrations</h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.integrations.slice(0, 8).map((integ) => {
                      const IntIcon = getModuleIcon(integ.icon)
                      return (
                        <div
                          key={integ.name}
                          className="inline-flex items-center gap-1.5 bg-secondary/40 border border-border/50 rounded-lg px-2.5 py-1.5"
                        >
                          <IntIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] font-medium text-foreground/80">{integ.name}</span>
                        </div>
                      )
                    })}
                    {detail.integrations.length > 8 && (
                      <div className="inline-flex items-center gap-1 bg-secondary/40 border border-border/50 rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] font-medium text-primary">+{detail.integrations.length - 8} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Coming Soon Card — Dashed border + watermark                  */
/* ═══════════════════════════════════════════════════════════════ */

function ComingSoonCard({ erp, onNavigate }: {
  erp: ErpSystemData
  onNavigate: (slug: string) => void
}) {
  const colors = getErpColor(erp.color)
  const accentColor = ACCENT_BG[erp.color] || 'var(--gg-teal)'

  return (
    <motion.div
      variants={fadeUp}
      className="bg-card/60 border-2 border-dashed border-border/70 rounded-xl cursor-pointer group relative overflow-hidden w-[calc(50%-6px)] sm:w-auto sm:min-w-[180px] sm:flex-1"
      onClick={() => onNavigate(erp.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNavigate(erp.slug)
        }
      }}
      aria-label={`View ${erp.name} details`}
    >
      {/* "Coming Soon" watermark */}
      <div className="absolute top-1 right-1 text-[7px] font-bold text-foreground/10 uppercase tracking-widest rotate-12 select-none pointer-events-none">
        Soon
      </div>

      <div className="p-4">
        {/* Icon + Name + Badge row — compact */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 opacity-50"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
            }}
          >
            {createElement(getErpIcon(erp.icon), { className: 'w-4 h-4', style: { color: colors.hex } })}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-sm font-semibold text-foreground/80 truncate">
                {erp.name}
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gg-amber)] shrink-0" />
            </div>
            <p className="text-[11px] text-foreground/60 truncate">{erp.industry}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-foreground/50 leading-relaxed line-clamp-2 mb-2">
          {erp.description}
        </p>

        {/* Learn more link */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-primary/60 group-hover:text-primary transition-colors duration-200">
          Learn more
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  )
}
