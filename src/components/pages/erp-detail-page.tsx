'use client'

import { useState, createElement, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { getErpDetail } from '@/lib/erp-detail-data'
import {
  useErpSystems,
  getErpIcon,
  getErpColor,
} from '@/lib/erp-data'
import { useContent } from '@/hooks/use-content'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  Star,
  Factory,
  Package,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Landmark,
  Scissors,
  Globe,
  Calendar,
  Monitor,
  Sparkles,
  UtensilsCrossed,
  HeartPulse,
  TrendingUp,
  Users,
  Moon,
  BookOpen,
  CreditCard,
  FileText,
  Library,
  Briefcase,
  Smartphone,
  BarChart3,
  Cpu,
  ClipboardList,
  Receipt,
  Car,
  Tag,
  Tv,
  Bus,
  Map as MapIcon,
  List,
  Bell,
  Wrench,
  Building2,
  Heart,
  Quote,
  Zap,
  AlertTriangle,
  CheckCheck,
  Shield,
  Lock,
  X,
  MessageCircle,
  Hash,
  Phone,
  Mail,
  Cloud,
  RotateCcw,
  Crown,
  Rocket,
  Gem,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  CircleCheck,
  CircleX,
  Timer,
  CircleDot,
  MoveRight,
  Eye,
  Layers,
  Activity,
  Award,
  ThumbsUp,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   Module Icon Map — maps module icon string to Lucide component
   ══════════════════════════════════════════════════════════════ */

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
}

function getModuleIcon(iconName: string): LucideIcon {
  return MODULE_ICON_MAP[iconName] || Package
}

/* ══════════════════════════════════════════════════════════════
   Section Navigation IDs
   ══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'pain-points', label: 'Pain Points' },
  { id: 'modules', label: 'Modules' },
  { id: 'performance', label: 'Performance' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'builder', label: 'Custom Builder' },
  { id: 'security', label: 'Security' },
  { id: 'differentiators', label: 'Differentiators' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'related', label: 'Related ERPs' },
]

/* ══════════════════════════════════════════════════════════════
   Animated Counter Component
   ══════════════════════════════════════════════════════════════ */

function AnimatedCounter({ value, className = '' }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(() => {
    const match = value.match(/^([\d.]+)(.*)$/)
    return match ? '0' + match[2] : value
  })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const match = value.match(/^([\d.]+)(.*)$/)
    if (!match) return

    const target = parseFloat(match[1])
    const suffix = match[2]
    const duration = 2000
    const startTime = performance.now()
    const isDecimal = match[1].includes('.')
    const decimalPlaces = isDecimal ? match[1].split('.')[1].length : 0

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased

      if (isDecimal) {
        setDisplay(current.toFixed(decimalPlaces) + suffix)
      } else {
        setDisplay(Math.round(current).toString() + suffix)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   Circular Progress Ring for Stats
   ══════════════════════════════════════════════════════════════ */

function CircularProgressRing({
  value,
  maxValue,
  color,
  size = 80,
  strokeWidth = 4,
  children,
}: {
  value: number
  maxValue: number
  color: string
  size?: number
  strokeWidth?: number
  children: React.ReactNode
}) {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percent = Math.min(value / maxValue, 1)
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => {
      setOffset(circumference - percent * circumference)
    }, 100)
    return () => clearTimeout(timer)
  }, [isInView, percent, circumference])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[2s] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Sticky Section Navigation
   ══════════════════════════════════════════════════════════════ */

function StickyNav({ activeSection }: { activeSection: string }) {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="sticky top-16 z-30 border-b border-[var(--gg-separator)] shadow-[var(--gg-shadow-sm)]" style={{ background: 'color-mix(in srgb, var(--background) 78%, transparent)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`relative whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                activeSection === section.id
                  ? 'text-[var(--gg-vermillion)] bg-[var(--gg-vermillion)]/8'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {section.label}
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full"
                  style={{ width: '60%', background: 'linear-gradient(to right, var(--gg-vermillion), var(--gg-amber))' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Flip Card for Pain Points
   ══════════════════════════════════════════════════════════════ */

function FlipCard({ title, before, after, index }: { title: string; before: string; after: string; index: number }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group"
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center center',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front - Before */}
        <div
          className="gg-elevated overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="p-5 sm:p-6 border-b border-border">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">{title}</h3>
          </div>
          <div className="p-5 sm:p-6 bg-[var(--gg-rose)]/5 min-h-[120px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--gg-rose)]/10 flex items-center justify-center">
                <CircleX className="w-4 h-4 text-[var(--gg-rose)]" />
              </div>
              <span className="text-xs font-semibold text-[var(--gg-rose)] uppercase tracking-wider">Before</span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">{before}</p>
          </div>
          <div className="px-5 sm:px-6 py-3 bg-secondary/30 text-center">
            <span className="text-xs text-muted-foreground">Click to see the solution →</span>
          </div>
        </div>

        {/* Back - After */}
        <div
          className="gg-elevated overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', top: 0, left: 0, right: 0 }}
        >
          <div className="p-5 sm:p-6 border-b border-border">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">{title}</h3>
          </div>
          <div className="p-5 sm:p-6 bg-[var(--gg-green)]/5 min-h-[120px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--gg-green)]/10 flex items-center justify-center">
                <CircleCheck className="w-4 h-4 text-[var(--gg-green)]" />
              </div>
              <span className="text-xs font-semibold text-[var(--gg-green)] uppercase tracking-wider">After</span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">{after}</p>
          </div>
          <div className="px-5 sm:px-6 py-3 bg-secondary/30 text-center">
            <span className="text-xs text-muted-foreground">← Click to see the problem</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Module Explorer Component — expandable accordion
   ══════════════════════════════════════════════════════════════ */

function ModuleExplorer({
  modules,
  moduleFeatures,
  colors,
}: {
  modules: { name: string; description: string; icon: string }[]
  moduleFeatures: { moduleName: string; features: string[] }[]
  colors: { hex: string; glow: string; gradient: string }
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = useCallback((name: string) => {
    setExpanded((prev) => (prev === name ? null : name))
  }, [])

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {modules.map((mod, i) => {
        const ModIcon = getModuleIcon(mod.icon)
        const isOpen = expanded === mod.name
        const features = moduleFeatures.find((mf) => mf.moduleName === mod.name)
        const featureCount = features?.features.length || 0
        const totalPossible = 8
        const coveragePercent = Math.round((featureCount / totalPossible) * 100)

        return (
          <motion.div
            key={mod.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className={`gg-card overflow-hidden transition-all duration-300 ${
              isOpen ? 'ring-1 ring-primary/30 shadow-[var(--gg-shadow-card-hover)]' : ''
            }`}
          >
            <button
              onClick={() => toggle(mod.name)}
              className="w-full p-5 sm:p-6 flex items-start gap-4 text-left group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 7%, transparent)' }}
              >
                <ModIcon className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-foreground">{mod.name}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                    {featureCount} features
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {mod.description}
                </p>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 mt-1"
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && features && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                    <div className="h-px mb-4 bg-border" />
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Feature Coverage</span>
                        <span className="font-semibold text-primary">{coveragePercent}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${coveragePercent}%` }}
                          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(to right, var(--gg-vermillion), var(--gg-amber))' }}
                        />
                      </div>
                    </div>
                    <ul className="space-y-2.5">
                      {features.features.map((feature, fi) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: fi * 0.05, duration: 0.3 }}
                          className="flex items-start gap-2.5"
                        >
                          <CheckCircle2
                            className="w-4 h-4 shrink-0 mt-0.5 text-primary"
                          />
                          <span className="text-sm text-foreground/80 leading-relaxed">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FAQ Accordion Item
   ══════════════════════════════════════════════════════════════ */

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={`gg-card overflow-hidden transition-all duration-300 ${
        open ? 'border-primary/30 shadow-[var(--gg-shadow-card-hover)]' : ''
      }`}
    >
      <button
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm sm:text-base font-semibold text-foreground">{question}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="shrink-0"
        >
          <Plus className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Custom Package Builder — interactive module selector
   ══════════════════════════════════════════════════════════════ */

interface ModuleItem {
  name: string
  description: string
  icon: string
}

interface CustomPackageBuilderProps {
  detail: {
    name: string
    industry: string
    modules: ModuleItem[]
    pkrMonthly: number
    slug: string
  }
  colors: { hex: string; glow: string; gradient: string }
  onNavigate: (view: string, slug?: string) => void
}

function CustomPackageBuilder({ detail, colors, onNavigate }: CustomPackageBuilderProps) {
  const [selectedModules, setSelectedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    detail.modules.slice(0, 3).forEach((m) => initial.add(m.name))
    return initial
  })

  const perModulePrice = Math.round(detail.pkrMonthly * 1.5 / detail.modules.length / 100) * 100

  const toggleModule = useCallback((moduleName: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleName)) {
        if (next.size > 3) next.delete(moduleName)
      } else {
        next.add(moduleName)
      }
      return next
    })
  }, [])

  const resetSelection = useCallback(() => {
    setSelectedModules(() => {
      const initial = new Set<string>()
      detail.modules.slice(0, 3).forEach((m) => initial.add(m.name))
      return initial
    })
  }, [detail.modules])

  const totalPrice = selectedModules.size * perModulePrice
  const individualTotal = Math.round(perModulePrice * 1.3 * selectedModules.size)
  const savingsPercent = individualTotal > 0 ? Math.round(((individualTotal - totalPrice) / individualTotal) * 100) : 0

  const annualFullPrice = totalPrice * 12
  const annualDiscountedPrice = Math.round(annualFullPrice * 0.8)
  const annualSavings = annualFullPrice - annualDiscountedPrice
  const progressPercent = Math.round((selectedModules.size / detail.modules.length) * 100)

  return (
    <section id="builder" className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
            <Package className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Custom</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Build Your <span className="text-gradient-primary">Custom Package</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select only the modules your business needs. Mix and match to create the perfect {detail.name} configuration.
          </p>
        </motion.div>

        <div className="gg-glass overflow-hidden">
          {/* Price summary bar */}
          <div className="sticky top-0 z-10 p-4 sm:p-5 border-b border-[var(--gg-separator)]" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', backdropFilter: 'blur(20px)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      PKR {totalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedModules.size} of {detail.modules.length} modules selected
                  </p>
                </div>
                {savingsPercent > 0 && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--gg-vermillion)]/10 text-[var(--gg-vermillion)] border border-[var(--gg-vermillion)]/20 gg-pill">
                    Save up to {savingsPercent}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={resetSelection}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <Button
                  size="sm"
                  className="font-semibold rounded-xl px-6 h-10 btn-glow"
                  onClick={() => onNavigate('pricing')}
                  disabled={selectedModules.size < 3}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, var(--gg-vermillion), var(--gg-amber))' }}
                />
              </div>
            </div>
          </div>

          {/* Module grid */}
          <div className="p-5 sm:p-6">
            {selectedModules.size < 3 && (
              <div className="mb-5 p-3 rounded-xl border border-[var(--gg-amber)]/30 bg-[var(--gg-amber)]/5 text-center">
                <p className="text-sm text-[var(--gg-amber)]">
                  Minimum 3 modules required ({3 - selectedModules.size} more to go)
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {detail.modules.map((mod, i) => {
                const isSelected = selectedModules.has(mod.name)
                const ModIcon = getModuleIcon(mod.icon)

                return (
                  <motion.button
                    key={mod.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleModule(mod.name)}
                    className={`relative text-left p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--gg-vermillion)]/5 border-[var(--gg-vermillion)]/40 shadow-sm'
                        : 'bg-muted/50 hover:bg-secondary border-border'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center bg-[var(--gg-vermillion)]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                      </motion.div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200 ${
                        isSelected ? 'bg-[var(--gg-vermillion)]/10' : 'bg-secondary'
                      }`}>
                        <ModIcon className="w-5 h-5" style={{ color: 'var(--gg-vermillion)' }} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-sm font-semibold text-foreground mb-0.5 truncate">
                          {mod.name}
                        </h4>
                        <span className="text-xs font-medium text-[var(--gg-vermillion)]">
                          PKR {perModulePrice.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Summary section */}
          <div className="border-t border-[var(--gg-separator)] p-5 sm:p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--gg-vermillion)]" />
                  Your Selected Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detail.modules
                    .filter((m) => selectedModules.has(m.name))
                    .map((mod) => {
                      const ModIcon = getModuleIcon(mod.icon)
                      return (
                        <span
                          key={mod.name}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[var(--gg-vermillion)]/10 text-[var(--gg-vermillion)] border border-[var(--gg-vermillion)]/20"
                        >
                          <ModIcon className="w-3.5 h-3.5" />
                          {mod.name}
                        </span>
                      )
                    })}
                  {selectedModules.size === 0 && (
                    <span className="text-xs text-muted-foreground">No modules selected</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--gg-vermillion)]" />
                  Price Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {selectedModules.size} modules × PKR {perModulePrice.toLocaleString()}
                    </span>
                    <span className="text-foreground font-medium">
                      PKR {totalPrice.toLocaleString()}/mo
                    </span>
                  </div>
                  {savingsPercent > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--gg-green)]">Bundle discount</span>
                      <span className="text-[var(--gg-green)] font-medium">
                        -PKR {(individualTotal - totalPrice).toLocaleString()}/mo
                      </span>
                    </div>
                  )}
                  <div className="h-px my-1 bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Monthly Total</span>
                    <span className="text-lg font-extrabold text-[var(--gg-vermillion)]">
                      PKR {totalPrice.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl gg-glass">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">Annual Billing</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--gg-green)]/10 text-[var(--gg-green)] border border-[var(--gg-green)]/20 gg-pill">
                        Save 20%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        PKR {annualFullPrice.toLocaleString()}/yr
                      </span>
                      <span className="text-base font-extrabold text-[var(--gg-vermillion)]">
                        PKR {annualDiscountedPrice.toLocaleString()}/yr
                      </span>
                    </div>
                    <p className="text-xs text-[var(--gg-green)] mt-1">
                      You save PKR {annualSavings.toLocaleString()}/year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA - sticky on mobile */}
          <div className="lg:hidden sticky bottom-0 z-10 p-4 border-t border-[var(--gg-separator)]" style={{ background: 'color-mix(in srgb, var(--card) 95%, transparent)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-lg font-extrabold text-foreground">
                  PKR {totalPrice.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <Button
                size="sm"
                className="font-semibold rounded-xl px-5 h-10 btn-glow"
                onClick={() => onNavigate('pricing')}
                disabled={selectedModules.size < 3}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   Testimonials Carousel — supports both static and live client data
   ══════════════════════════════════════════════════════════════ */

interface TestimonialItem {
  quote: string
  name: string
  title: string
  company: string
  avatar: string
}

function TestimonialsCarousel({
  testimonials,
  colors,
}: {
  testimonials: TestimonialItem[]
  colors: { hex: string }
}) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPaused || testimonials.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPaused, testimonials.length])

  const goTo = useCallback((idx: number) => setCurrent(idx), [])
  const next = useCallback(() => setCurrent((prev) => (prev + 1) % testimonials.length), [testimonials.length])
  const prev = useCallback(() => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length), [testimonials.length])

  if (testimonials.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-2xl gg-card flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">No testimonials yet</p>
        <p className="text-sm text-muted-foreground">
          Client stories will appear here as businesses join ApparelFlow.
        </p>
      </div>
    )
  }

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="gg-glass p-8 sm:p-10 text-center"
        >
          {/* Quote icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6"
            style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 8%, transparent)' }}
          >
            <Quote className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
          </motion.div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * s, duration: 0.3 }}
              >
                <Star className="w-5 h-5 fill-[var(--gg-amber)] text-[var(--gg-amber)]" />
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <p className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-6 italic">
            &ldquo;{testimonials[current].quote}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {testimonials[current].avatar}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">{testimonials[current].name}</div>
              <div className="text-xs text-muted-foreground">
                {testimonials[current].title}, {testimonials[current].company}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-9 h-9 rounded-full gg-inline flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-9 h-9 rounded-full gg-inline flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </>
      )}

      {/* Dots */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === current ? 'w-6 h-2' : 'w-2 h-2'
              }`}
              style={{
                backgroundColor: idx === current ? 'var(--gg-vermillion)' : 'var(--muted-foreground)',
                opacity: idx === current ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════ */

export function ErpDetailPage({ slug }: { slug: string }) {
  const { navigate } = useNavigate()
  const { activeErps } = useErpSystems()
  // Pull admin-editable content overrides. Falls back to the hardcoded ERP_DETAILS
  // values when no override exists (or when the public /api/content fetch fails).
  // See /api/admin/content/erp/route.ts for the editable field schema.
  const { get: getContent } = useContent()
  const [activeSection, setActiveSection] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [integrationFilter, setIntegrationFilter] = useState('All')

  const rawDetail = getErpDetail(slug)

  // ── Apply admin overrides on top of the hardcoded ERP_DETAILS shape ────────
  // The public content API stores overrides under page='erp_<slug>' with the
  // `erp_<slug>_` prefix stripped from the key, so `get('erp_pharmaflow',
  // 'tagline', fallback)` returns the override (or the hardcoded fallback).
  // We rebuild a fully-typed ErpDetailData-shaped object so the render path
  // below stays unchanged — only the data source is swapped.
  const detail = rawDetail
    ? {
        ...rawDetail,
        tagline: getContent(`erp_${slug}`, 'tagline', rawDetail.tagline ?? ''),
        heroDescription: getContent(
          `erp_${slug}`,
          'heroDescription',
          rawDetail.heroDescription ?? ''
        ),
        pricing:
          rawDetail.pricing !== undefined
            ? getContent(`erp_${slug}`, 'pricing', rawDetail.pricing)
            : rawDetail.pricing,
        pkrMonthly:
          rawDetail.pkrMonthly !== undefined
            ? Number(
                getContent(
                  `erp_${slug}`,
                  'pkrMonthly',
                  String(rawDetail.pkrMonthly)
                )
              ) || rawDetail.pkrMonthly
            : rawDetail.pkrMonthly,
        stats: (rawDetail.stats ?? []).map((s, i) => ({
          ...s,
          label: getContent(
            `erp_${slug}`,
            `stat_${i}_label`,
            s.label
          ),
          value: getContent(
            `erp_${slug}`,
            `stat_${i}_value`,
            s.value
          ),
        })),
        modules: (rawDetail.modules ?? []).map((m, i) => ({
          ...m,
          name: getContent(`erp_${slug}`, `module_${i}_name`, m.name),
          description: getContent(
            `erp_${slug}`,
            `module_${i}_description`,
            m.description
          ),
        })),
        painPoints: (rawDetail.painPoints ?? []).map((p, i) => ({
          ...p,
          title: getContent(`erp_${slug}`, `painPoint_${i}_title`, p.title),
          before: getContent(`erp_${slug}`, `painPoint_${i}_before`, p.before),
          after: getContent(`erp_${slug}`, `painPoint_${i}_after`, p.after),
        })),
        workflow: (rawDetail.workflow ?? []).map((w, i) => ({
          ...w,
          step: getContent(`erp_${slug}`, `workflow_${i}_step`, w.step),
          title: getContent(`erp_${slug}`, `workflow_${i}_title`, w.title),
          description: getContent(
            `erp_${slug}`,
            `workflow_${i}_description`,
            w.description
          ),
        })),
      }
    : rawDetail

  const colors = getErpColor(detail?.color || 'cyan')
  const erpIconComponent = detail ? getErpIcon(detail.icon) : Building2
  const relatedErps = activeErps.filter((e) => e.slug !== slug).slice(0, 6)
  // Cross-link ElectroFlow with other ERPs
  const electroflowErp = activeErps.find((e) => e.slug === 'electroflow')
  const isElectroFlow = slug === 'electroflow'

  // ── Fetch real clients from the ERP's database for testimonials ──
  const [liveTestimonials, setLiveTestimonials] = useState<TestimonialItem[]>([])
  const [liveClients, setLiveClients] = useState<Array<{
    id: string
    companyName: string
    contactPerson: string
    city: string | null
    country: string | null
    licenseType: string | null
    isActive: boolean
  }> | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchClients = async () => {
      try {
        // Use the ApparelFlow-specific endpoint for full stats,
        // or the generic erp-clients endpoint for other ERPs
        const endpoint = slug === 'apparelflow'
          ? '/api/erp/apparelflow/clients'
          : `/api/erp-clients?slug=${slug}&limit=10`

        const res = await fetch(endpoint)
        if (!res.ok) return
        const json = await res.json()
        if (cancelled || !json.clients?.length) return

        setLiveClients(json.clients)

        // Generate testimonials from real client data
        const erpName = detail?.name || slug
        const quotes: Record<string, string[]> = {
          apparelflow: [
            `${erpName} transformed our operations. Real-time inventory tracking and production planning have completely eliminated the chaos we used to face.`,
            'The platform gives us complete visibility across our entire operation. From procurement to retail POS, everything flows seamlessly.',
            'Managing multi-warehouse operations used to be our biggest challenge. Now it\'s effortless with real-time stock tracking and automated reordering.',
            'Our order fulfillment speed has increased dramatically. Buyers can track their orders in real-time, and support inquiries have dropped significantly.',
            'The production planning module alone justified our investment. We can now plan capacity, track BOM, and manage cost sheets all in one place.',
            'From raw materials to finished goods, every step is tracked. The batch-level traceability gives us complete quality control confidence.',
          ],
          hotelflow: [
            `${erpName} unified our reservation systems across all properties. Revenue optimization paid for the entire platform in the first quarter.`,
            'Housekeeping used to be our biggest headache. Now it runs like clockwork with auto-assignment and real-time room status tracking.',
            'Our guest satisfaction scores jumped significantly within months. The CRM remembers every preference — guests feel truly valued.',
          ],
          eduflow: [
            `${erpName} gave us a single source of truth for students, faculty, and courses. The academic planning module is revolutionary.`,
            'Our fee collection rate improved dramatically after implementation. The automated reminders and payment gateway integration made all the difference.',
            'Parents love the portal. They can check grades, attendance, and fee status anytime. Our office phone stopped ringing off the hook.',
          ],
          default: [
            `${erpName} transformed our operations. The platform gave us complete visibility across our entire business — from inventory to financials.`,
            'We went from scattered spreadsheets to a unified system. The efficiency gains alone justified the investment within the first quarter.',
            'The real-time dashboards and automated workflows eliminated the manual chaos we used to face daily. Everything just flows now.',
            'Managing multiple locations used to be our biggest challenge. Now everything is connected and visible from a single dashboard.',
            'The compliance and reporting features saved us countless hours. What used to take days now takes minutes.',
            'Our team adopted the system quickly because it actually understands how our industry works. No workarounds needed.',
          ],
        }

        const erpQuotes = quotes[slug] || quotes.default
        const titles = ['Operations Director', 'CEO', 'General Manager', 'VP Operations', 'Managing Director', 'Technical Director']

        const testimonials: TestimonialItem[] = json.clients
          .filter((c: any) => c.isActive && c.companyName && c.companyName !== 'Unknown')
          .slice(0, 6)
          .map((c: any, i: number) => {
            const contactName = c.contactPerson && c.contactPerson !== '—' ? c.contactPerson : null
            const initials = contactName
              ? contactName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : c.companyName.slice(0, 2).toUpperCase()

            return {
              quote: erpQuotes[i % erpQuotes.length],
              name: contactName || c.companyName,
              avatar: initials,
              title: titles[i % titles.length],
              company: [c.companyName, c.city, c.country].filter(Boolean).join(', '),
            }
          })

        setLiveTestimonials(testimonials)
      } catch (err) {
        console.error(`[ERP-DETAIL] Failed to fetch ${slug} clients:`, err)
      }
    }
    fetchClients()
    return () => { cancelled = true }
  }, [slug, detail?.name])

  // Use real testimonials from the database when available, otherwise fall back to static data
  const testimonials = liveTestimonials.length > 0 ? liveTestimonials : (detail?.testimonials ?? [])

  // Track active section for sticky nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' } as const,
    transition: { duration: 0.7 },
  }

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true } as const,
    transition: { delay: i * 0.1, duration: 0.6 },
  })

  const efficiencyChartConfig: ChartConfig = {
    efficiency: { label: 'Efficiency %', color: 'var(--gg-vermillion)' },
  }
  const revenueChartConfig: ChartConfig = {
    revenue: { label: 'Revenue Growth', color: 'var(--gg-amber)' },
  }
  const satisfactionChartConfig: ChartConfig = {
    satisfaction: { label: 'Satisfaction', color: 'var(--gg-teal)' },
  }

  if (!detail) {
    return (
      <PageLayout>
        <section className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-6 shadow-[var(--gg-shadow-card)]">
                <AlertTriangle className="w-10 h-10 text-[var(--gg-amber)]" />
              </div>
              <h2 className="text-3xl font-extrabold mb-3 text-foreground">ERP Not Found</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                The ERP system you&apos;re looking for doesn&apos;t exist or hasn&apos;t been configured yet.
              </p>
              <Button
                size="lg"
                className="font-semibold rounded-xl px-8 h-12 btn-glow"
                onClick={() => navigate('products')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </motion.div>
          </div>
        </section>
      </PageLayout>
    )
  }

  // Chart improvement calculations (after null check — detail is guaranteed non-null)
  const chartDataArr = detail.chartData
  const firstData = chartDataArr[0]
  const lastData = chartDataArr[chartDataArr.length - 1]
  const chartImprovements = chartDataArr.length >= 2
    ? {
        efficiency: Math.round(lastData.efficiency - firstData.efficiency),
        revenue: Math.round(((lastData.revenue - firstData.revenue) / firstData.revenue) * 100),
        satisfaction: Math.round(((lastData.satisfaction - firstData.satisfaction) / firstData.satisfaction) * 100),
      }
    : { efficiency: 0, revenue: 0, satisfaction: 0 }

  // Integration categories
  const integrationCategorySet = new Set(detail.integrations.map((intg) => intg.category))
  const integrationCategories = ['All', ...Array.from(integrationCategorySet)]
  const filteredIntegrations = integrationFilter === 'All'
    ? detail.integrations
    : detail.integrations.filter((intg) => intg.category === integrationFilter)

  // Pricing tiers
  const basePrice = detail.pkrMonthly
  const pricingTiers = [
    {
      name: 'Starter',
      monthly: basePrice,
      description: `Essential ${detail.name} for small teams`,
      features: [`${detail.modules.length} core modules`, '5 user accounts', 'Email support', 'Basic analytics', 'Monthly data backups'],
      popular: false,
      icon: Rocket,
    },
    {
      name: 'Professional',
      monthly: Math.round(basePrice * 2),
      description: `Full ${detail.name} power for growing businesses`,
      features: [`${detail.modules.length} core + advanced modules`, '25 user accounts', 'Priority support', 'Advanced analytics & reporting', 'Daily data backups', 'API access', 'Custom workflows'],
      popular: true,
      icon: Crown,
    },
    {
      name: 'Enterprise',
      monthly: Math.round(basePrice * 4),
      description: `Unlimited ${detail.name} for large organizations`,
      features: ['All modules + custom development', 'Unlimited users', '24/7 dedicated support', 'Business intelligence suite', 'Real-time backups & DR', 'Full API access', 'Custom integrations', 'On-premise option', 'SLA guarantee'],
      popular: false,
      icon: Gem,
    },
  ]

  return (
    <PageLayout>
      {/* ═══════════════════════════════════════════════════════════
          1. ANIMATED HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-20 sm:pt-28 pb-20 sm:pb-28 overflow-hidden bg-background">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              background: [
                `radial-gradient(ellipse 80% 50% at 20% 40%, ${colors.hex}12, transparent)`,
                `radial-gradient(ellipse 80% 50% at 60% 60%, ${colors.hex}18, transparent)`,
                `radial-gradient(ellipse 80% 50% at 20% 40%, ${colors.hex}12, transparent)`,
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
          />
          <motion.div
            animate={{
              background: [
                `radial-gradient(ellipse 60% 40% at 80% 30%, ${colors.hex}0a, transparent)`,
                `radial-gradient(ellipse 60% 40% at 40% 70%, ${colors.hex}0f, transparent)`,
                `radial-gradient(ellipse 60% 40% at 80% 30%, ${colors.hex}0a, transparent)`,
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Back link */}
            <button
              onClick={() => navigate('products')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Products</span>
            </button>

            {/* Icon with Pulsing Glow + Badge Row */}
            <div className="flex items-center gap-4 sm:gap-5 mb-6">
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 20px ${colors.hex}20, 0 0 40px ${colors.hex}10`,
                    `0 0 30px ${colors.hex}30, 0 0 60px ${colors.hex}15`,
                    `0 0 20px ${colors.hex}20, 0 0 40px ${colors.hex}10`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gg-card flex items-center justify-center"
              >
                {createElement(erpIconComponent, { className: 'w-9 h-9 sm:w-11 sm:h-11', style: { color: 'var(--gg-vermillion)' } })}
              </motion.div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs sm:text-sm bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-3 py-1 rounded-full border border-[var(--gg-green)]/20 font-medium flex items-center gap-1.5 gg-pill">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--gg-green)]"
                  />
                  Active
                </span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full border font-medium bg-secondary text-muted-foreground border-border gg-pill">
                  {detail.industry}
                </span>
              </div>
            </div>

            {/* Name + Tagline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-foreground"
            >
              {detail.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-foreground/80 font-medium mb-6"
            >
              {detail.tagline}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8"
            >
              {detail.heroDescription}
            </motion.p>

            {/* CTAs with hover scale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-8"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="font-semibold rounded-xl px-8 h-12 bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] text-white shadow-lg btn-glow"
                  onClick={() => navigate('pricing')}
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary rounded-xl px-8 h-12"
                  onClick={() => window.open(detail.website, '_blank', 'noopener')}
                >
                  Explore Demo <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-2 mb-10"
            >
              <span className="text-2xl font-bold text-foreground">{detail.pricing}</span>
            </motion.div>
          </motion.div>

          {/* Stats with Circular Progress Rings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {detail.stats.map((stat, i) => {
              const numMatch = stat.value.match(/^([\d.]+)/)
              const numVal = numMatch ? parseFloat(numMatch[1]) : 50
              const isPercent = stat.value.includes('%')
              const maxVal = isPercent ? 100 : (stat.value.includes('x') ? 10 : (stat.value.includes('/') ? 5 : 100))
              const progressVal = Math.min(numVal, maxVal)

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="gg-card p-5 sm:p-6 text-center cursor-default group"
                >
                  <div className="flex justify-center mb-3">
                    <CircularProgressRing value={progressVal} maxValue={maxVal} color="var(--gg-vermillion)" size={64} strokeWidth={3}>
                      <span className="text-sm font-extrabold text-primary">
                        <AnimatedCounter value={stat.value} />
                      </span>
                    </CircularProgressRing>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. STICKY SECTION NAVIGATION
          ═══════════════════════════════════════════════════════════ */}
      <StickyNav activeSection={activeSection} />

      {/* ═══════════════════════════════════════════════════════════
          3. PAIN POINTS — FLIP CARDS
          ═══════════════════════════════════════════════════════════ */}
      <section id="pain-points" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--gg-amber)]" />
              <span className="text-xs text-muted-foreground">Pain Points</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Challenges We Solve</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real problems that {detail.name} eliminates. Click any card to see the solution.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {detail.painPoints.map((point, i) => (
              <FlipCard key={point.title} title={point.title} before={point.before} after={point.after} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. INTERACTIVE MODULE EXPLORER
          ═══════════════════════════════════════════════════════════ */}
      <section id="modules" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Modules</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Interactive Module Explorer</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Click any module to explore its detailed capabilities. Everything you need to run your {detail.industry.toLowerCase()} business — built in, not bolted on.
            </p>
          </motion.div>

          <ModuleExplorer
            modules={detail.modules}
            moduleFeatures={detail.moduleFeatures}
            colors={colors}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. PERFORMANCE CHARTS (ENHANCED — 3 charts + summary cards)
          ═══════════════════════════════════════════════════════════ */}
      <section id="performance" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Performance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Measurable Growth</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See the trajectory businesses experience after implementing {detail.name}.
            </p>
          </motion.div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Efficiency Gain', value: `+${chartImprovements.efficiency}%`, icon: Activity, color: 'var(--gg-vermillion)' },
              { label: 'Revenue Growth', value: `+${chartImprovements.revenue}%`, icon: TrendingUp, color: 'var(--gg-amber)' },
              { label: 'Satisfaction Uplift', value: `+${chartImprovements.satisfaction}%`, icon: ThumbsUp, color: 'var(--gg-teal)' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="gg-card p-4 sm:p-5 text-center cursor-default"
              >
                <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: item.color }} />
                <div className="text-xl sm:text-2xl font-extrabold text-primary">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Efficiency Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="gg-card p-5 sm:p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-1">Efficiency Growth</h3>
              <p className="text-sm text-muted-foreground mb-4">Operational efficiency over 6 months</p>
              <ChartContainer config={efficiencyChartConfig} className="h-[240px] w-full">
                <AreaChart data={detail.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`effFill-${detail.slug}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gg-vermillion)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--gg-vermillion)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="efficiency" stroke="var(--gg-vermillion)" strokeWidth={2} fill={`url(#effFill-${detail.slug})`} isAnimationActive={true} animationDuration={1800} animationEasing="ease-out" />
                </AreaChart>
              </ChartContainer>
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="gg-card p-5 sm:p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-1">Revenue Growth</h3>
              <p className="text-sm text-muted-foreground mb-4">Monthly revenue after implementation</p>
              <ChartContainer config={revenueChartConfig} className="h-[240px] w-full">
                <BarChart data={detail.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--gg-amber)" radius={[4, 4, 0, 0]} opacity={0.85} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ChartContainer>
            </motion.div>

            {/* Satisfaction Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="gg-card p-5 sm:p-6 md:col-span-2 lg:col-span-1"
            >
              <h3 className="text-lg font-bold text-foreground mb-1">Customer Satisfaction</h3>
              <p className="text-sm text-muted-foreground mb-4">Satisfaction score over 6 months</p>
              <ChartContainer config={satisfactionChartConfig} className="h-[240px] w-full">
                <LineChart data={detail.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="satisfaction" stroke="var(--gg-teal)" strokeWidth={2.5} dot={{ fill: 'var(--gg-teal)', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" />
                </LineChart>
              </ChartContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. FEATURE COMPARISON TABLE (ENHANCED)
          ═══════════════════════════════════════════════════════════ */}
      <section id="comparison" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Manual vs. {detail.name}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See the difference between traditional methods and automated ERP workflows.
            </p>
          </motion.div>

          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden sm:block gg-card overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 sm:p-5 text-sm font-semibold text-muted-foreground bg-secondary/50">Feature</th>
                  <th className="text-left p-4 sm:p-5 text-sm font-semibold text-[var(--gg-rose)] bg-[var(--gg-rose)]/5">
                    <div className="flex items-center gap-2"><CircleX className="w-4 h-4" />Manual</div>
                  </th>
                  <th className="text-left p-4 sm:p-5 text-sm font-semibold bg-[var(--gg-vermillion)]/5" style={{ color: 'var(--gg-vermillion)' }}>
                    <div className="flex items-center gap-2"><CircleCheck className="w-4 h-4" />{detail.name}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.comparisonData.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 sm:p-5 text-sm font-semibold text-foreground">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-sm text-foreground/60">{row.manual}</td>
                    <td className="p-4 sm:p-5 text-sm text-foreground/80 relative">
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 shrink-0 mt-0.5 text-[var(--gg-vermillion)]" />
                        <span>{row.withErp}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Mobile Cards with toggle */}
          <div className="sm:hidden space-y-4">
            <Tabs defaultValue="erp" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-10">
                <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
                <TabsTrigger value="erp" className="text-xs">{detail.name}</TabsTrigger>
              </TabsList>
            </Tabs>
            {detail.comparisonData.map((row, i) => (
              <motion.div
                key={row.feature}
                {...stagger(i)}
                className="gg-card p-4"
              >
                <h4 className="text-sm font-bold text-foreground mb-2">{row.feature}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--gg-rose)]/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CircleX className="w-3 h-3 text-[var(--gg-rose)]" />
                      <span className="text-[10px] font-semibold text-[var(--gg-rose)] uppercase">Manual</span>
                    </div>
                    <p className="text-xs text-foreground/60 leading-relaxed">{row.manual}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--gg-vermillion)]/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CircleCheck className="w-3 h-3 text-[var(--gg-vermillion)]" />
                      <span className="text-[10px] font-semibold text-[var(--gg-vermillion)] uppercase">ERP</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{row.withErp}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. ANIMATED WORKFLOW TIMELINE
          ═══════════════════════════════════════════════════════════ */}
      <section id="workflow" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Timer className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A streamlined workflow from start to finish with {detail.name}.
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Animated connecting line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5" style={{ background: 'var(--gg-separator)' }} />
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute left-6 sm:left-8 top-0 w-0.5"
              style={{ background: 'linear-gradient(to bottom, var(--gg-vermillion), var(--gg-amber), transparent)' }}
            />

            <div className="space-y-10 sm:space-y-12">
              {detail.workflow.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative flex items-start gap-5 sm:gap-6"
                >
                  {/* Step circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.2, duration: 0.5, type: 'spring' }}
                    className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <span className="text-sm sm:text-lg font-extrabold text-white">{step.step}</span>
                    {/* Sparkle on active */}
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="absolute -inset-1 rounded-full"
                      style={{ border: '2px solid color-mix(in srgb, var(--gg-amber) 25%, transparent)' }}
                    />
                  </motion.div>

                  {/* Step content */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex-1 gg-card p-5 sm:p-6"
                  >
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. BENEFITS / ROI WITH ANIMATED COUNTERS
          ═══════════════════════════════════════════════════════════ */}
      <section id="benefits" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">ROI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Real Results, Real ROI</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Measurable outcomes that businesses achieve with {detail.name}.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {detail.benefits.map((benefit, i) => {
              const numMatch = benefit.metric.match(/^([\d.]+)/)
              const numVal = numMatch ? parseFloat(numMatch[1]) : 50
              const isPercent = benefit.metric.includes('%')
              const maxVal = isPercent ? 100 : (benefit.metric.includes('/') ? 5 : (benefit.metric.includes('x') ? 10 : 100))
              const progressVal = Math.min(numVal, maxVal)

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="gg-card p-6 text-center cursor-default group"
                >
                  <div className="flex justify-center mb-4">
                    <CircularProgressRing value={progressVal} maxValue={maxVal} color="var(--gg-vermillion)" size={80} strokeWidth={4}>
                      <span className="text-lg font-extrabold text-[var(--gg-vermillion)]">
                        <AnimatedCounter value={benefit.metric} />
                      </span>
                    </CircularProgressRing>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. INTEGRATION ECOSYSTEM (ENHANCED)
          ═══════════════════════════════════════════════════════════ */}
      <section id="integrations" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Layers className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Integrations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Integration Ecosystem</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {detail.name} connects seamlessly with the tools you already use.
            </p>
          </motion.div>

          {/* Category filter tabs */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {integrationCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setIntegrationFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                  integrationFilter === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredIntegrations.map((integration, i) => {
                const IntIcon = getModuleIcon(integration.icon)
                return (
                  <motion.div
                    key={integration.name}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="gg-card p-4 text-center cursor-default group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 7%, transparent)' }}
                    >
                      <IntIcon className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{integration.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{integration.category}</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. SUBSCRIPTION PACKAGES (ENHANCED)
          ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Crown className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
              Choose Your <span className="text-gradient-primary">Plan</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Flexible pricing that scales with your business. All plans include {detail.name} core features.
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-12 h-6 rounded-full transition-colors duration-200"
                style={{ backgroundColor: billingCycle === 'annual' ? 'var(--gg-vermillion)' : 'var(--secondary)' }}
              >
                <motion.div
                  animate={{ x: billingCycle === 'annual' ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <Badge className="bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20 text-xs gg-pill">
                  Save 20%
                </Badge>
              )}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => {
              const monthlyPrice = tier.monthly
              const annualPrice = Math.round(monthlyPrice * 12 * 0.8)
              const displayPrice = billingCycle === 'monthly' ? monthlyPrice : annualPrice
              const priceSuffix = billingCycle === 'monthly' ? '/mo' : '/yr'
              const TierIcon = tier.icon

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`relative gg-card overflow-hidden ${
                    tier.popular
                      ? 'border-primary shadow-[var(--gg-shadow-card-hover)]'
                      : ''
                  }`}
                >
                  {/* Popular glow */}
                  {tier.popular && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 30px color-mix(in srgb, var(--gg-vermillion) 6%, transparent), 0 0 20px color-mix(in srgb, var(--gg-vermillion) 3%, transparent)` }}
                    />
                  )}

                  <div className="p-6 sm:p-8">
                    {tier.popular && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] text-white border-0 text-[10px]">
                        Most Popular
                      </Badge>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 7%, transparent)' }}>
                        <TierIcon className="w-5 h-5" style={{ color: 'var(--gg-vermillion)' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                        <p className="text-xs text-muted-foreground">{tier.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={displayPrice}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl font-extrabold text-foreground"
                          >
                            PKR {displayPrice.toLocaleString()}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-sm text-muted-foreground">{priceSuffix}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-xs text-muted-foreground line-through mt-0.5">
                          PKR {(monthlyPrice * 12).toLocaleString()}/yr
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, fi) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: fi * 0.05 + i * 0.1, duration: 0.3 }}
                          className="flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className={`w-full font-semibold rounded-xl h-11 ${
                          tier.popular
                            ? 'bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] text-white btn-glow'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                        variant={tier.popular ? 'default' : 'outline'}
                        onClick={() => navigate('pricing')}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. CUSTOM PACKAGE BUILDER
          ═══════════════════════════════════════════════════════════ */}
      <CustomPackageBuilder detail={detail} colors={colors} onNavigate={navigate} />

      {/* ═══════════════════════════════════════════════════════════
          12. SECURITY & COMPLIANCE
          ═══════════════════════════════════════════════════════════ */}
      <section id="security" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 7%, transparent)' }}
            >
              <Shield className="w-7 h-7" style={{ color: 'var(--gg-vermillion)' }} />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Security & Compliance</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your data is protected by enterprise-grade security. {detail.name} is built for trust.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {detail.securityFeatures.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="gg-card p-4 cursor-default group"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary group-hover:bg-[var(--gg-vermillion)]/10 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-[var(--gg-vermillion)]" />
                  </motion.div>
                  <span className="text-sm text-foreground/80 leading-relaxed">{feature}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. DIFFERENTIATORS
          ═══════════════════════════════════════════════════════════ */}
      <section id="differentiators" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Why Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">What Sets Us Apart</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Key reasons businesses choose {detail.name} over generic alternatives.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {detail.differentiators.map((diff, i) => (
              <motion.div
                key={diff}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ x: 6, scale: 1.01 }}
                className="gg-card p-5 sm:p-6 cursor-default group relative overflow-hidden"
              >
                {/* Spotlight glow on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in srgb, var(--gg-vermillion) 3%, transparent), transparent)` }}
                />
                <div className="relative flex items-start gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 7%, transparent)' }}
                  >
                    <Star className="w-4 h-4" style={{ color: 'var(--gg-vermillion)' }} />
                  </motion.div>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{diff}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13.5. TRUSTED BY — Real Client Companies
          ═══════════════════════════════════════════════════════════ */}
      {liveClients && liveClients.filter((c) => c.isActive).length > 0 && (
        <section className="py-20 sm:py-28 border-t border-border">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeInUp} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
                <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
                <span className="text-xs text-muted-foreground">Trusted By</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
                Trusted by <span className="text-[var(--gg-vermillion)]">{liveClients.filter((c) => c.isActive).length}</span> {detail?.name || 'Businesses'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Real companies running their operations on {detail?.name || slug} every day.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveClients
                .filter((c) => c.isActive)
                .slice(0, 9)
                .map((client, i) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="gg-card p-5 sm:p-6 group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                      >
                        {client.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">{client.companyName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{[client.city, client.country].filter(Boolean).join(', ') || 'Pakistan'}</p>
                      </div>
                      {client.licenseType && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto shrink-0 text-[10px] ${
                            client.licenseType === 'enterprise'
                              ? 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20'
                              : client.licenseType === 'professional'
                              ? 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] border-[var(--gg-violet)]/20'
                              : 'bg-[var(--gg-cyan)]/10 text-[var(--gg-cyan)] border-[var(--gg-cyan)]/20'
                          }`}
                        >
                          {client.licenseType}
                        </Badge>
                      )}
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {client.licenseType ? `${client.licenseType.charAt(0).toUpperCase() + client.licenseType.slice(1)} plan` : 'Active client'}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>

            {liveClients.filter((c) => c.isActive).length > 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-8"
              >
                <p className="text-sm text-muted-foreground">
                  + {liveClients.filter((c) => c.isActive).length - 9} more active clients
                </p>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          14. TESTIMONIALS CAROUSEL
          ═══════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Quote className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">What Our Clients Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real stories from businesses transformed by {detail.name}.
            </p>
          </motion.div>

          <TestimonialsCarousel testimonials={testimonials} colors={colors} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. FAQ ACCORDION (ENHANCED)
          ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <MessageCircle className="w-3.5 h-3.5" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs text-muted-foreground">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about {detail.name}.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {detail.faqs.map((faq, i) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. RELATED ERPs
          ═══════════════════════════════════════════════════════════ */}
      <section id="related" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border gg-pill px-4 py-1.5 mb-5">
              <Building2 className="w-3.5 h-3.5" style={{ color: colors.hex }} />
              <span className="text-xs text-muted-foreground">Explore More</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">Related ERP Systems</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover other industry-specific solutions in the ApexFlow ecosystem.
            </p>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none">
            {/* Cross-link: ElectroFlow featured card when viewing other ERPs */}
            {!isElectroFlow && electroflowErp && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.03 }}
                onClick={() => navigate('erp-detail', 'electroflow')}
                className="min-w-[260px] sm:min-w-[300px] bg-gradient-to-br from-[var(--gg-teal)]/10 to-[var(--gg-green)]/5 border border-[var(--gg-teal)]/20 rounded-xl p-5 shadow-[var(--gg-shadow-card)] cursor-pointer snap-start relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--gg-teal)] to-[var(--gg-green)]" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--gg-teal)]/15">
                    <Zap className="w-5 h-5 text-[var(--gg-teal)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate">ElectroFlow</h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--gg-teal)]/15 text-[var(--gg-teal)] border border-[var(--gg-teal)]/20 gg-pill">LIVE APP</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Consumer Electronics & Appliances</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">Complete ERP for electronics retail with POS, installments, service & repair, warranty tracking, and multi-branch operations.</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--gg-teal)]">
                  Learn more <MoveRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            )}
            {relatedErps.map((erp, i) => {
              const relColor = getErpColor(erp.color || 'cyan')
              const RelIcon = getErpIcon(erp.icon || 'building')
              return (
                <motion.div
                  key={erp.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  onClick={() => navigate('erp-detail', erp.slug)}
                  className="min-w-[220px] sm:min-w-[260px] gg-card p-5 cursor-pointer snap-start"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 7%, transparent)' }}
                    >
                      {createElement(RelIcon, { className: 'w-5 h-5', style: { color: 'var(--gg-vermillion)' } })}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{erp.name}</h3>
                      <span className="text-xs text-muted-foreground">{erp.industry}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{erp.description}</p>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--gg-vermillion)]">
                    Learn more <MoveRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. FINAL CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 border-t border-border relative overflow-hidden">
        {/* Gradient background with shimmer */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gg-vermillion)]/5 via-[var(--gg-amber)]/5 to-[var(--gg-vermillion)]/5" />
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
          />
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ backgroundColor: 'color-mix(in srgb, var(--gg-vermillion) 8%, transparent)' }}
            >
                {createElement(erpIconComponent, { className: 'w-8 h-8', style: { color: 'var(--gg-vermillion)' } })}
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
              Ready to Transform Your <span className="text-gradient-primary">{detail.industry}</span> Business?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Join hundreds of businesses already using {detail.name} to streamline operations, boost revenue, and delight customers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="font-semibold rounded-xl px-10 h-13 text-base bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] text-white shadow-lg btn-glow relative overflow-hidden"
                  onClick={() => navigate('pricing')}
                >
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                  <span className="relative">Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 ml-2 relative" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary rounded-xl px-8 h-13 text-base"
                  onClick={() => window.open(detail.website, '_blank', 'noopener')}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Live Demo
                </Button>
              </motion.div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              No credit card required · Free 14-day trial · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
