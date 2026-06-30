'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { useNavigate } from '@/lib/use-navigate'
import { motion } from 'framer-motion'
import {
  Shirt, Hotel, GraduationCap, HardHat, Plane, Pill,
  UtensilsCrossed, Palette, HeartPulse, ShoppingCart, Factory,
  Package, Scissors, Truck, Wheat, Landmark, ArrowRight, Wrench,
  CheckCircle2, Clock, ChevronRight, Zap, Globe,
  Rocket, Sparkles, Building2, Cpu, Compass, Fuel, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { useTheme } from 'next-themes'

/* ───────────────── INDUSTRY DATA ───────────────── */
type IndustryStatus = 'Active' | 'Coming Soon'
type Industry = {
  icon: React.ReactNode
  name: string
  slug: string
  erp: string
  description: string
  features: string[]
  status: IndustryStatus
  colorHex: string
}

const industries: Industry[] = [
  {
    icon: <Shirt className="w-7 h-7 text-primary" />,
    name: 'Apparel & Textile',
    slug: 'apparel-textile',
    erp: 'ApparelFlow',
    description: 'End-to-end management from raw material procurement to finished goods distribution, production planning, and quality control.',
    features: ['Production Planning', 'Inventory Management', 'Quality Control'],
    status: 'Active',
    colorHex: 'var(--gg-teal)',
  },
  {
    icon: <Hotel className="w-7 h-7 text-[var(--gg-violet)]" />,
    name: 'Hospitality',
    slug: 'hospitality',
    erp: 'HotelFlow',
    description: 'Complete hotel operations management including reservations, F&B, housekeeping, revenue management, and guest experience.',
    features: ['Reservation System', 'F&B Management', 'Revenue Optimization'],
    status: 'Active',
    colorHex: 'var(--gg-violet)',
  },
  {
    icon: <GraduationCap className="w-7 h-7 text-[var(--gg-green)]" />,
    name: 'Education',
    slug: 'education',
    erp: 'EduFlow',
    description: 'Comprehensive school and university management from admissions and academics to alumni tracking and institutional analytics.',
    features: ['Student Management', 'Academic Planning', 'Fee Collection'],
    status: 'Active',
    colorHex: 'var(--gg-green)',
  },
  {
    icon: <HardHat className="w-7 h-7 text-[var(--gg-amber)]" />,
    name: 'Construction',
    slug: 'property-management',
    erp: 'BuildFlow',
    description: 'Project management, resource allocation, contractor coordination, and real-time progress tracking for construction firms.',
    features: ['Project Management', 'Resource Planning', 'Contractor Portal'],
    status: 'Active',
    colorHex: 'var(--gg-amber)',
  },
  {
    icon: <Plane className="w-7 h-7 text-primary" />,
    name: 'Travel',
    slug: 'travel-tourism',
    erp: 'TravelFlow',
    description: 'Tour package management, booking engines, itinerary planning, and vendor coordination for travel agencies and operators.',
    features: ['Booking Engine', 'Itinerary Builder', 'Vendor Management'],
    status: 'Active',
    colorHex: 'var(--gg-teal)',
  },
  {
    icon: <Pill className="w-7 h-7 text-[var(--gg-rose)]" />,
    name: 'Pharma',
    slug: 'pharmaceutical',
    erp: 'PharmaFlow',
    description: 'Regulatory compliance, batch tracking, expiry management, and distribution control for pharmaceutical companies.',
    features: ['Batch Tracking', 'Regulatory Compliance', 'Distribution Control'],
    status: 'Active',
    colorHex: 'var(--gg-rose)',
  },
  {
    icon: <UtensilsCrossed className="w-7 h-7 text-[var(--gg-amber)]" />,
    name: 'Food & Restaurant',
    slug: 'food-restaurant',
    erp: 'FoodFlow',
    description: 'Multi-location restaurant operations, recipe management, POS integration, and supply chain optimization for F&B businesses.',
    features: ['Recipe Management', 'POS Integration', 'Supply Chain'],
    status: 'Active',
    colorHex: 'var(--gg-amber)',
  },
  {
    icon: <Palette className="w-7 h-7 text-[var(--gg-rose)]" />,
    name: 'Creative',
    slug: 'creative',
    erp: 'CreativeFlow',
    description: 'Project tracking, client management, resource scheduling, and billing for creative agencies and design studios.',
    features: ['Project Tracking', 'Client Portal', 'Resource Scheduling'],
    status: 'Active',
    colorHex: 'var(--gg-rose)',
  },
  {
    icon: <HeartPulse className="w-7 h-7 text-[var(--gg-rose)]" />,
    name: 'Healthcare',
    slug: 'healthcare',
    erp: 'HealthFlow',
    description: 'Patient management, clinical workflows, pharmacy integration, and compliance reporting for healthcare providers.',
    features: ['Patient Records', 'Clinical Workflows', 'Compliance Reporting'],
    status: 'Active',
    colorHex: 'var(--gg-rose)',
  },
  {
    icon: <ShoppingCart className="w-7 h-7 text-[var(--gg-teal)]" />,
    name: 'Retail',
    slug: 'retail',
    erp: 'MartFlow',
    description: 'Omnichannel retail management, POS systems, inventory optimization, and customer loyalty programs for retail chains.',
    features: ['Omnichannel POS', 'Inventory Optimization', 'Loyalty Programs'],
    status: 'Active',
    colorHex: 'var(--gg-teal)',
  },
  {
    icon: <Factory className="w-7 h-7 text-muted-foreground" />,
    name: 'Manufacturing',
    slug: 'manufacturing',
    erp: 'FactoryFlow',
    description: 'Production scheduling, BOM management, quality assurance, and shop floor control for manufacturing enterprises.',
    features: ['Production Scheduling', 'BOM Management', 'Quality Assurance'],
    status: 'Active',
    colorHex: 'var(--muted-foreground)',
  },
  {
    icon: <Wrench className="w-7 h-7 text-primary" />,
    name: 'Automotive & Workshop',
    slug: 'automotive-workshop',
    erp: 'AutoFlow',
    description: 'Workshop management, parts inventory, service reminders, and customer CRM for automotive service businesses.',
    features: ['Workshop Management', 'Parts Inventory', 'Service Reminders'],
    status: 'Active',
    colorHex: 'var(--gg-teal)',
  },
  {
    icon: <Package className="w-7 h-7 text-[var(--gg-violet)]" />,
    name: 'Distribution',
    slug: 'distribution',
    erp: 'DistriFlow',
    description: 'Warehouse management, route optimization, demand forecasting, and multi-channel distribution for wholesale distributors.',
    features: ['Warehouse Management', 'Route Optimization', 'Demand Forecasting'],
    status: 'Active',
    colorHex: 'var(--gg-violet)',
  },
  {
    icon: <Scissors className="w-7 h-7 text-[var(--gg-rose)]" />,
    name: 'Textile',
    slug: 'textile',
    erp: 'TextileFlow',
    description: 'Weaving and dyeing process management, yarn tracking, order fulfillment, and supply chain visibility for textile mills.',
    features: ['Process Management', 'Yarn Tracking', 'Order Fulfillment'],
    status: 'Active',
    colorHex: 'var(--gg-rose)',
  },
  {
    icon: <Truck className="w-7 h-7 text-[var(--gg-green)]" />,
    name: 'Logistics',
    slug: 'logistics',
    erp: 'LogisticFlow',
    description: 'Fleet management, shipment tracking, last-mile delivery optimization, and freight forwarding for logistics companies.',
    features: ['Fleet Management', 'Shipment Tracking', 'Last-Mile Delivery'],
    status: 'Active',
    colorHex: 'var(--gg-green)',
  },
  {
    icon: <Wheat className="w-7 h-7 text-[var(--gg-amber)]" />,
    name: 'Agriculture',
    slug: 'agriculture',
    erp: 'AgroFlow',
    description: 'Crop planning, farm management, harvest tracking, and market linkage for agricultural enterprises and cooperatives.',
    features: ['Crop Planning', 'Farm Management', 'Market Linkage'],
    status: 'Coming Soon',
    colorHex: 'var(--gg-amber)',
  },
  {
    icon: <Landmark className="w-7 h-7 text-[var(--gg-green)]" />,
    name: 'Banking & Finance',
    slug: 'banking-finance',
    erp: 'FinanceFlow',
    description: 'Transaction processing, risk management, regulatory compliance, and customer relationship management for financial institutions.',
    features: ['Transaction Processing', 'Risk Management', 'Regulatory Compliance'],
    status: 'Coming Soon',
    colorHex: 'var(--gg-green)',
  },
  {
    icon: <Zap className="w-7 h-7 text-[var(--gg-green)]" />,
    name: 'Consumer Electronics',
    slug: 'consumer-electronics',
    erp: 'ElectroFlow',
    description: 'Complete ERP for electronics and appliance retailers with POS, installment management, service & repair, warranty tracking, and multi-branch operations.',
    features: ['POS & Installments', 'Service & Repair', 'Warranty Management'],
    status: 'Active',
    colorHex: 'var(--gg-green)',
  },
  {
    icon: <Compass className="w-7 h-7 text-[var(--gg-teal)]" />,
    name: 'Fleet & Transportation',
    slug: 'fleet-transportation',
    erp: 'FleetFlow',
    description: 'Complete fleet and vehicle management platform — GPS tracking, driver management, fuel monitoring, trip planning, maintenance scheduling, and delivery optimization for transportation companies.',
    features: ['Fleet Tracking', 'Driver Management', 'Fuel Monitoring'],
    status: 'Active',
    colorHex: 'var(--gg-teal)',
  },
  {
    icon: <Fuel className="w-7 h-7 text-[var(--gg-amber)]" />,
    name: 'Fuel & Energy',
    slug: 'fuel-energy',
    erp: 'FuelFlow',
    description: 'Comprehensive fuel station management — IoT dispenser control, ATG tank monitoring, forecourt automation, fuel delivery tracking, CNG/EV support, and multi-station operations.',
    features: ['Dispenser Control', 'Tank Monitoring', 'Fuel Delivery'],
    status: 'Active',
    colorHex: 'var(--gg-amber)',
  },
  {
    icon: <Scissors className="w-7 h-7 text-[var(--gg-rose)]" />,
    name: 'Salon & Beauty',
    slug: 'salon-beauty',
    erp: 'SalonFlow',
    description: 'Appointment booking, stylist scheduling, inventory management, and customer loyalty for salons and beauty businesses.',
    features: ['Appointment Booking', 'Stylist Management', 'Loyalty Programs'],
    status: 'Active',
    colorHex: 'var(--gg-rose)',
  },
  {
    icon: <Building2 className="w-7 h-7 text-[var(--gg-violet)]" />,
    name: 'Property Management',
    slug: 'property-mgmt',
    erp: 'TenantFlow',
    description: 'Rental property management, tenant tracking, lease management, maintenance requests, and payment collection for property managers.',
    features: ['Tenant Tracking', 'Lease Management', 'Payment Collection'],
    status: 'Active',
    colorHex: 'var(--gg-violet)',
  },
  {
    icon: <BookOpen className="w-7 h-7 text-[var(--gg-violet)]" />,
    name: 'Publishing',
    slug: 'publishing',
    erp: 'BookFlow',
    description: 'Manuscript management, print production, distribution tracking, and royalty management for publishers and book distributors.',
    features: ['Manuscript Tracking', 'Print Production', 'Royalty Management'],
    status: 'Active',
    colorHex: 'var(--gg-violet)',
  },
]

/* ───────────────── PIPELINE PHASES ───────────────── */
const pipelinePhases = [
  {
    phase: 'Phase 1 — Live Now',
    status: 'active' as const,
    cssColor: 'var(--gg-green)',
    items: [
      'Pharma (PharmaFlow)', 'Apparel (ApparelFlow)', 'Fuel Station (FuelFlow)',
      'Hospitality (HotelFlow)', 'Electronics (ElectroFlow)', 'Fleet Mgmt (FleetFlow)',
    ],
    moreCount: 15,
  },
  {
    phase: 'Phase 2 — Q3 2026',
    status: 'development' as const,
    cssColor: 'var(--gg-teal)',
    items: ['Agriculture (AgroFlow)', 'Banking & Finance (FinanceFlow)', 'Event Mgmt (EventFlow)', 'Sports & Fitness (FitFlow)'],
  },
  {
    phase: 'Phase 3 — Q1 2027',
    status: 'planned' as const,
    cssColor: 'var(--gg-violet)',
    items: ['Legal (LegalFlow)', 'Mining (MineFlow)', 'Maritime (PortFlow)', 'Aviation (SkyFlow)'],
  },
  {
    phase: 'Phase 4 — Q3 2027',
    status: 'research' as const,
    cssColor: 'var(--gg-amber)',
    items: ['Defense (DefenseFlow)', 'Space & Satellite (SpaceFlow)', 'Nuclear Energy (NuclearFlow)'],
  },
]

/* ───────────────── FLOATING HERO ICONS ───────────────── */
const heroFloatingIcons = [
  { Icon: Shirt, x: '8%', y: '18%', size: 28, delay: 0, duration: 6, opacity: 0.12 },
  { Icon: Hotel, x: '85%', y: '12%', size: 32, delay: 1.2, duration: 7, opacity: 0.10 },
  { Icon: GraduationCap, x: '75%', y: '70%', size: 26, delay: 0.5, duration: 8, opacity: 0.11 },
  { Icon: HardHat, x: '15%', y: '75%', size: 24, delay: 2, duration: 6.5, opacity: 0.09 },
  { Icon: Plane, x: '92%', y: '45%', size: 22, delay: 0.8, duration: 7.5, opacity: 0.08 },
  { Icon: Pill, x: '5%', y: '50%', size: 20, delay: 1.5, duration: 8.5, opacity: 0.07 },
  { Icon: Factory, x: '60%', y: '85%', size: 30, delay: 0.3, duration: 6, opacity: 0.10 },
  { Icon: ShoppingCart, x: '40%', y: '10%', size: 24, delay: 2.2, duration: 7, opacity: 0.08 },
  { Icon: Cpu, x: '25%', y: '40%', size: 20, delay: 1, duration: 9, opacity: 0.06 },
  { Icon: Globe, x: '70%', y: '25%', size: 26, delay: 1.8, duration: 6.8, opacity: 0.09 },
]

/* ───────────────── PROGRESS RING COMPONENT ───────────────── */
function ProgressRing({ value, max, color, size = 56, strokeWidth = 4 }: { value: number; max: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / max) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: circumference - progress }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

/* ───────────────── INDUSTRY CARD (ALL INDUSTRIES — BUBBLE STYLE) ───────────────── */
function IndustryCard({ industry, index, onNavigate }: { industry: Industry; index: number; onNavigate: (slug: string) => void }) {
  const isActive = industry.status === 'Active'

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -2 }}
      onClick={() => onNavigate(industry.slug)}
      className={`
        group relative inline-flex items-center gap-2.5 rounded-full border transition-all duration-300 cursor-pointer
        ${isActive
          ? 'bg-card border-border px-5 py-3 shadow-[var(--gg-shadow-sm)] hover:shadow-[var(--gg-shadow-card)]'
          : 'bg-secondary/40 border-border/50 px-4 py-2.5 opacity-60 hover:opacity-80'
        }
      `}
    >
      {/* Colored dot */}
      <span
        className="shrink-0 rounded-full"
        style={{
          width: isActive ? 10 : 6,
          height: isActive ? 10 : 6,
          background: isActive ? industry.colorHex : 'var(--muted-foreground)',
        }}
      />
      {/* Industry name */}
      <span className={`font-semibold whitespace-nowrap ${isActive ? 'text-sm text-foreground' : 'text-xs text-muted-foreground'}`}>
        {industry.name}
      </span>
      {/* ERP name */}
      {isActive && (
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
          {industry.erp}
        </span>
      )}
      {/* Status indicator */}
      {isActive ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : (
        <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
      )}
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export function IndustriesPage() {
  const { navigate } = useNavigate()
  const { resolvedTheme } = useTheme()
  const activeIndustries = industries.filter((i) => i.status === 'Active')
  const isDark = resolvedTheme === 'dark'

  const navigateToIndustry = (slug: string) => {
    navigate('industry-detail', slug)
  }

  return (
    <PageLayout>
      {/* ═══════════════════════ HERO — MOSAIC / COLLAGE ═══════════════════════ */}
      <section className="relative pt-20 pb-20 sm:pt-32 sm:pb-28 overflow-hidden bg-gradient-to-br from-[var(--gg-vermillion)]/5 via-background to-[var(--gg-teal)]/5 dark:bg-[#0a0a1a]">
        {/* Radial gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(139,92,246,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(6,182,212,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_70%,rgba(16,185,129,0.06),transparent_50%)]" />
        </div>

        {/* Grid lines background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Floating decorative icons */}
        {heroFloatingIcons.map(({ Icon, x, y, size, delay, duration, opacity }, i) => (
          <motion.div
            key={i}
            className="absolute text-foreground/10 dark:text-white pointer-events-none"
            style={{ left: x, top: y, opacity }}
            animate={{
              y: [0, -14, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          >
            <Icon className="text-foreground/10 dark:text-white" style={{ width: size, height: size }} />
          </motion.div>
        ))}

        {/* Vertical decorative labels */}
        <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-foreground/8 dark:text-white/10 -rotate-90 origin-center whitespace-nowrap">
            Industry-Specific ERP
          </span>
        </div>
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-foreground/8 dark:text-white/10 rotate-90 origin-center whitespace-nowrap">
            Purpose-Built Platforms
          </span>
        </div>

        {/* Main content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* "Built for" small label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm sm:text-base font-medium tracking-[0.25em] uppercase text-foreground/60 dark:text-white/40 mb-4"
            >
              Built for
            </motion.p>

            {/* Large gradient headline */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 100 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-teal), var(--gg-green))'
                    : 'linear-gradient(135deg, #8B3A20, #0E7A68, #1A6B35)',
                  backgroundSize: '200% 200%',
                }}
              >
                YOUR
              </span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(135deg, var(--gg-teal), var(--gg-green), var(--gg-amber))'
                    : 'linear-gradient(135deg, #0E7A68, #1A6B35, #8B6914)',
                  backgroundSize: '200% 200%',
                }}
              >
                INDUSTRY
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-base sm:text-lg text-foreground/60 dark:text-white/50 max-w-xl mx-auto leading-relaxed"
            >
              ApexFlow doesn&apos;t adapt to industries — we engineer purpose-built ERPs
              from the ground up. Each product is designed for the workflows, challenges,
              and opportunities unique to your sector.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-white font-semibold btn-glow rounded-full px-8 h-12 shadow-lg shadow-[var(--gg-vermillion)]/20 border-0"
                onClick={() => navigate('products')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Products <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border dark:border-white/20 text-foreground/70 dark:text-white/70 hover:bg-secondary dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white rounded-full px-8 h-12"
                onClick={() => navigate('contact')}
              >
                Request Industry Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border dark:via-white/10 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════ ACTIVE INDUSTRIES — MOSAIC / MASONRY ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with horizontal rule accent */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-[3px] rounded-full bg-gradient-to-r from-[var(--gg-green)] to-[var(--gg-violet)]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Active Industries</h2>
            </div>
            <p className="text-muted-foreground text-lg ml-14">Production-ready ERP platforms serving businesses today.</p>
          </motion.div>

          {/* Mosaic grid: first 3 span 2 cols on lg, rest 1 col */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeIndustries.map((ind, i) => {
              const isFeatured = i < 3
              return (
                <motion.div
                  key={ind.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={isFeatured ? 'md:col-span-2' : ''}
                >
                  <InteractiveCard variant="default" glowColor={ind.colorHex}>
                    <div
                      className="relative overflow-hidden group"
                      style={{
                        borderRadius: '1rem 1rem 0.5rem 0.5rem',
                      }}
                    >
                      {/* Colored top accent bar */}
                      <div
                        className="h-1.5 w-full"
                        style={{ background: `linear-gradient(90deg, ${ind.colorHex}, ${ind.colorHex}88)` }}
                      />

                      {/* Gradient tinted background */}
                      <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${ind.colorHex}, transparent 70%)` }}
                      />

                      <div className="bg-card p-6 relative">
                        {/* Active badge */}
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">Active</span>
                          </div>
                        </div>

                        <div className="w-14 h-14 rounded-xl border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `linear-gradient(135deg, ${ind.colorHex}15, ${ind.colorHex}05)` }}
                        >
                          {ind.icon}
                        </div>
                        <h3 className={`font-bold mb-1 ${isFeatured ? 'text-2xl' : 'text-lg'}`}>{ind.name}</h3>
                        <p className="text-sm font-medium mb-3" style={{ color: ind.colorHex }}>Powered by {ind.erp}</p>
                        <p className={`text-sm text-muted-foreground leading-relaxed mb-5 ${isFeatured ? '' : 'line-clamp-2'}`}>
                          {ind.description}
                        </p>

                        {/* Feature tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {ind.features.map((f) => (
                            <span key={f} className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-lg border border-border">{f}</span>
                          ))}
                        </div>

                        <Button
                          variant="ghost"
                          className="p-0 hover:bg-transparent"
                          style={{ color: ind.colorHex }}
                          onClick={() => navigate('products')}
                        >
                          Learn More <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURED INTEGRATED ERPs — ASYMMETRIC ═══════════════════════ */}
      <section className="py-16 sm:py-20 bg-[var(--gg-grouped-bg)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-emerald-500" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Featured Integrated ERPs</h2>
            </div>
            <p className="text-muted-foreground text-lg">Standalone ERP systems with deep industry integration and full operational capabilities.</p>
          </motion.div>

          {/* Asymmetric layout: 60/40 */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* ElectroFlow Card — 60% width (3/5) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="gg-elevated bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--gg-shadow-sm)] h-full">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Zap className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-2xl font-bold text-foreground">ElectroFlow</h3>
                        {/* Pulse animation Live badge */}
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2.5 py-1 rounded-full border border-[var(--gg-green)]/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gg-green)] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gg-green)]" />
                          </span>
                          Live
                        </span>
                      </div>
                      <p className="text-sm font-medium text-emerald-500">Consumer Electronics & Appliances</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Complete ERP for electronics and appliance retailers — POS with installment management, service & repair, warranty tracking, and multi-branch operations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {['POS & Sales', 'Installment Plans', 'Service & Repair', 'Warranty Mgmt'].map((cap) => (
                      <div key={cap} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-foreground/80">{cap}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5 h-10 text-sm" onClick={() => navigate('erp-detail', 'electroflow')}>
                      Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button variant="outline" className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-5 h-10 text-sm" onClick={() => window.open('https://electroflowerp.vercel.app/', '_blank', 'noopener')}>
                      Live Demo
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FleetFlow Card — 40% width (2/5) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="gg-elevated bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--gg-shadow-sm)] h-full">
                <div className="h-1.5 bg-gradient-to-r from-[var(--gg-teal)] to-[var(--gg-vermillion)]" />
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--gg-teal)]/10 border border-[var(--gg-teal)]/20 flex items-center justify-center shrink-0">
                      <Compass className="w-6 h-6 text-[var(--gg-teal)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">FleetFlow</h3>
                        {/* Pulse animation Live badge */}
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gg-green)] opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--gg-green)]" />
                          </span>
                          Live
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--gg-teal)]">Fleet & Transportation</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Complete ERP for fleet and transportation companies — GPS tracking, driver management, fuel monitoring, trip planning, and maintenance scheduling.
                  </p>
                  <div className="grid grid-cols-1 gap-2 mb-5">
                    {['GPS Tracking', 'Driver Mgmt', 'Fuel Monitoring', 'Trip Planning'].map((cap) => (
                      <div key={cap} className="flex items-center gap-2 bg-[var(--gg-teal)]/5 border border-[var(--gg-teal)]/10 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gg-teal)] shrink-0" />
                        <span className="text-xs font-medium text-foreground/80">{cap}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button className="bg-[var(--gg-teal)] hover:bg-[var(--gg-teal)] text-white font-semibold rounded-xl px-4 h-9 text-sm" onClick={() => navigate('erp-detail', 'fleetflow')}>
                      Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button variant="outline" className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-4 h-9 text-sm" onClick={() => window.open('https://fleetflowerp.vercel.app/', '_blank', 'noopener')}>
                      Live Demo
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ALL INDUSTRIES — TAG CLOUD / BUBBLE ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              21 Industries.{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-teal))' }}>
                One Ecosystem.
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
              Each industry ERP is a standalone powerhouse that connects seamlessly with the ApexFlow ecosystem.
            </p>
          </motion.div>

          {/* Bubble / tag cloud layout */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {industries.map((industry, i) => (
              <IndustryCard key={industry.name} industry={industry} index={i} onNavigate={navigateToIndustry} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS — HORIZONTAL SCROLL TICKER + PROGRESS RINGS ═══════════════════════ */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Full-width gradient card */}
          <div
            className="relative rounded-2xl overflow-hidden p-8 sm:p-12 border border-border dark:border-0"
            style={isDark ? {
              background: 'linear-gradient(135deg, #1a1a2e 0%, #1e1a2e 50%, #2a1a1e 100%)',
            } : undefined}
          >
            {/* Subtle noise overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            {/* Desktop: full row */}
            <div className="hidden md:grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { icon: <Globe className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '21', label: 'Industry ERPs', color: 'var(--gg-violet)', pct: 90 },
                { icon: <CheckCircle2 className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '21', label: 'Live Products', color: 'var(--gg-green)', pct: 95 },
                { icon: <Clock className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '0', label: 'In Development', color: 'var(--gg-amber)', pct: 25 },
                { icon: <Zap className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '100+', label: 'Modules Planned', color: 'var(--gg-teal)', pct: 70 },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <ProgressRing value={stat.pct} max={100} color={stat.color} size={72} strokeWidth={5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                  <motion.div
                    className="text-4xl font-black text-foreground dark:text-white"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="mt-1.5 text-sm text-muted-foreground dark:text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Mobile: horizontal scroll ticker */}
            <div className="md:hidden flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory relative z-10 -mx-2 px-2">
              {[
                { icon: <Globe className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '21', label: 'Industry ERPs', color: 'var(--gg-violet)', pct: 90 },
                { icon: <CheckCircle2 className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '21', label: 'Live Products', color: 'var(--gg-green)', pct: 95 },
                { icon: <Clock className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '0', label: 'In Development', color: 'var(--gg-amber)', pct: 25 },
                { icon: <Zap className="w-5 h-5 text-muted-foreground dark:text-white/70" />, value: '100+', label: 'Modules Planned', color: 'var(--gg-teal)', pct: 70 },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center shrink-0 snap-center min-w-[140px]"
                >
                  <div className="relative mb-3">
                    <ProgressRing value={stat.pct} max={100} color={stat.color} size={64} strokeWidth={4} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-foreground dark:text-white">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground dark:text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PIPELINE — HORIZONTAL ROADMAP ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-[var(--gg-grouped-bg)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Industry{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--gg-teal), var(--gg-green))' }}>
                Pipeline
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed mx-auto sm:mx-0">Our roadmap for bringing industry-specific ERPs to market. Each phase is carefully planned with real-world validation.</p>
          </motion.div>

          {/* ── Horizontal connector line (desktop) ── */}
          <div className="relative">
            {/* Desktop horizontal connector */}
            <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[3px] z-0">
              {/* Background track */}
              <div className="absolute inset-0 rounded-full bg-border" />
              {/* Animated filled portion — Phase 1 fully live, extending into Phase 2 */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--gg-green), var(--gg-teal))',
                }}
                initial={{ width: '0%' }}
                whileInView={{ width: '62.5%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>

            {/* Mobile vertical connector */}
            <div className="lg:hidden absolute left-6 top-0 bottom-0 w-[3px] z-0">
              <div className="absolute inset-0 rounded-full bg-border" />
              <motion.div
                className="absolute inset-x-0 top-0 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, var(--gg-green), var(--gg-teal))',
                }}
                initial={{ height: '0%' }}
                whileInView={{ height: '25%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>

            {/* Phase cards — horizontal on desktop, vertical on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-5 xl:gap-6">
              {pipelinePhases.map((phase, i) => {
                const statusConfig: Record<string, { badge: string; badgeBg: string; badgeTextClass: string; progressFill: number; progressLabel: string }> = {
                  active: { badge: 'Live', badgeBg: 'color-mix(in srgb, var(--gg-green) 10%, transparent)', badgeTextClass: 'text-[var(--gg-green)]', progressFill: 100, progressLabel: '100%' },
                  development: { badge: 'In Development', badgeBg: 'color-mix(in srgb, var(--gg-teal) 10%, transparent)', badgeTextClass: 'text-[var(--gg-teal)]', progressFill: 55, progressLabel: '55%' },
                  planned: { badge: 'Planned', badgeBg: 'color-mix(in srgb, var(--gg-violet) 10%, transparent)', badgeTextClass: 'text-[var(--gg-violet)]', progressFill: 0, progressLabel: '0%' },
                  research: { badge: 'Research', badgeBg: 'color-mix(in srgb, var(--gg-amber) 10%, transparent)', badgeTextClass: 'text-[var(--gg-amber)]', progressFill: 0, progressLabel: '0%' },
                }
                const cfg = statusConfig[phase.status]
                const isActive = phase.status === 'active'
                const isFuture = phase.status === 'planned' || phase.status === 'research'

                return (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
                    className="relative"
                  >
                    {/* Connector node — desktop */}
                    <div className="hidden lg:flex items-center justify-center mb-4 relative z-10">
                      <motion.div
                        className="relative flex items-center justify-center"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 + 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                      >
                        {/* Outer ring */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{
                            background: isFuture ? 'var(--card)' : phase.cssColor,
                            boxShadow: isActive ? `0 0 0 4px color-mix(in srgb, ${phase.cssColor} 20%, transparent)` : undefined,
                            border: isFuture ? '2px dashed var(--border)' : 'none',
                          }}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : phase.status === 'development' ? (
                            <Zap className="w-4 h-4 text-white" />
                          ) : phase.status === 'planned' ? (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Compass className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        {/* Pulse ring for active phase */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ border: `2px solid ${phase.cssColor}` }}
                            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                          />
                        )}
                      </motion.div>
                    </div>

                    {/* Connector node — mobile */}
                    <div className="lg:hidden absolute left-0 top-0 z-10">
                      <motion.div
                        className="relative flex items-center justify-center"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{
                            background: isFuture ? 'var(--card)' : phase.cssColor,
                            boxShadow: isActive ? `0 0 0 4px color-mix(in srgb, ${phase.cssColor} 20%, transparent)` : undefined,
                            border: isFuture ? '2px dashed var(--border)' : 'none',
                          }}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : phase.status === 'development' ? (
                            <Zap className="w-4 h-4 text-white" />
                          ) : phase.status === 'planned' ? (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Compass className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ border: `2px solid ${phase.cssColor}` }}
                            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                          />
                        )}
                      </motion.div>
                    </div>

                    {/* Phase card */}
                    <div className="lg:pl-0 pl-14">
                      <InteractiveCard variant="subtle" glowColor={phase.cssColor} className={isFuture ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}>
                        <div
                          className="bg-card rounded-xl p-5 sm:p-6 relative overflow-hidden"
                          style={{ borderTop: `3px solid ${phase.cssColor}` }}
                        >
                          {/* Large watermark phase number */}
                          <div
                            className="absolute -top-2 -right-1 text-[80px] sm:text-[96px] font-black leading-none pointer-events-none select-none"
                            style={{ color: `color-mix(in srgb, ${phase.cssColor} 8%, transparent)` }}
                          >
                            {i + 1}
                          </div>

                          {/* Content */}
                          <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-foreground">{phase.phase}</h3>
                              <span className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.badgeBg} ${cfg.badgeTextClass}`}>
                                {cfg.badge}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Progress</span>
                                <span className="text-[10px] font-bold" style={{ color: phase.cssColor }}>{cfg.progressLabel}</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: phase.cssColor }}
                                  initial={{ width: '0%' }}
                                  whileInView={{ width: `${cfg.progressFill}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 + 0.4 }}
                                />
                              </div>
                            </div>

                            {/* Industry items as pills */}
                            <div className="flex flex-wrap gap-1.5">
                              {phase.items.map((item) => (
                                <span
                                  key={item}
                                  className="text-[11px] sm:text-xs bg-secondary/80 text-muted-foreground px-2.5 py-1 rounded-lg border border-border/60 hover:border-border transition-colors"
                                >
                                  {item}
                                </span>
                              ))}
                              {'moreCount' in phase && (phase as { moreCount?: number }).moreCount && (
                                <span className="text-[11px] sm:text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-lg border border-primary/20">
                                  +{(phase as { moreCount?: number }).moreCount} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </InteractiveCard>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA — FULL-WIDTH GRADIENT BANNER ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <div
          className="py-20 sm:py-28"
          style={isDark ? {
            background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 40%, #0a2e1a 100%)',
          } : undefined}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(139,92,246,0.1),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(16,185,129,0.08),transparent_60%)]" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {/* Decorative icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary dark:bg-white/5 border border-border dark:border-white/10 mb-8">
                <Building2 className="w-7 h-7 text-foreground/60 dark:text-white/60" />
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground dark:text-white mb-6 leading-[1.1]">
                Don&apos;t See Your{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: isDark
                    ? 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-teal))'
                    : 'linear-gradient(135deg, #8B3A20, #0E7A68)'
                  }}
                >
                  Industry?
                </span>
              </h2>
              <p className="text-foreground/60 dark:text-white/40 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                We&apos;re constantly expanding. Tell us about your industry and we&apos;ll explore
                building a purpose-built AI Powered Operating System for your sector.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-white font-semibold btn-glow rounded-full px-8 h-12 shadow-lg shadow-[var(--gg-vermillion)]/20 border-0"
                  onClick={() => navigate('contact')}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Propose an Industry <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border dark:border-white/20 text-foreground/70 dark:text-white/70 hover:bg-secondary dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white rounded-full px-8 h-12"
                  onClick={() => navigate('products')}
                >
                  View All Products
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
