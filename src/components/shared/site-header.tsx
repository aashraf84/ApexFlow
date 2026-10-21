'use client'

import { useAppStore } from '@/lib/store'
import { useNavigate } from '@/lib/use-navigate'
import { useErpSystems, getErpIcon, getErpColor } from '@/lib/erp-data'
import { useState, useEffect, useCallback, useRef, useMemo, createElement } from 'react'
import { useTheme } from 'next-themes'
import {
  Menu, X, ChevronDown, ChevronRight, ArrowRight, Search,
  Shirt, Hotel, GraduationCap, Pill, ShoppingCart,
  Factory, Truck, HardHat, HeartPulse, Palette,
  Wrench, Building2, Plane, UtensilsCrossed,
  TextCursorInput, Route as RouteIcon,
  Sun, Moon, Settings, BarChart3, Users,
  LineChart, Briefcase, Globe, Package,
  Sparkles, Star, Crown, Layers, Command,
  Rocket, Shield, Zap, BookOpen, Phone, LogIn, Compass,
  TrendingUp, Warehouse, Megaphone, Play, ChevronUp,
  CircleDot, LayoutGrid, Tag, Eye, Fuel, Scissors,
  Boxes, Home, Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteLogo } from '@/components/shared/site-logo'
import { useSiteSettings } from '@/lib/site-settings-store'
import { useContent } from '@/hooks/use-content'

/* ═══════════════════════════════════════════════════════════════
   ANIMATION CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const springTransition = { type: 'spring' as const, stiffness: 500, damping: 35 }
const smoothEase = [0.23, 1, 0.32, 1] as const

/* ═══════════════════════════════════════════════════════════════
   LINK MANAGER WIRING — icon map + helpers + fallbacks
   The admin-managed Link Manager stores nav_links / footer_links /
   social_links / cta_links as JSON arrays in SiteSetting rows under
   category='content' (group='navigation'/'footer'/'social'/'cta').
   The public /api/content endpoint serves them under their group page,
   so `get('navigation', 'nav_links', '[]')` returns the JSON string.
   These helpers map the simple `{id,label,href,icon,order}` rows to the
   rich DropdownItem shape the header already understands, with hardcoded
   fallbacks so the site works even if the API/DB is unreachable.
   ═══════════════════════════════════════════════════════════════ */

// ─── Shape of a stored nav link (mirrors /api/admin/content/links) ───
type StoredNavLink = {
  id: string
  label: string
  href: string
  icon?: string
  order?: number
  view?: string
  slug?: string
  description?: string
  badge?: string
  color?: string
}

type StoredCtaLink = {
  id: string
  key: string
  label: string
  href: string
}

// ─── Icon string → lucide-react component ─────────────────────────────
// Covers every icon the Link Manager defaults use plus every ERP product
// icon used in PRODUCTS_ITEMS, so dynamic nav links can render icons
// even when the admin picks an ERP slug as a top-level nav entry.
const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  globe: Globe,
  boxes: Boxes,
  layers: Layers,
  building2: Building2,
  tag: Tag,
  bookopen: BookOpen,
  book: BookOpen,
  mail: Mail,
  phone: Phone,
  shirt: Shirt,
  hotel: Hotel,
  graduationcap: GraduationCap,
  pill: Pill,
  shoppingcart: ShoppingCart,
  factory: Factory,
  truck: Truck,
  hardhat: HardHat,
  heartpulse: HeartPulse,
  palette: Palette,
  wrench: Wrench,
  plane: Plane,
  utensilscrossed: UtensilsCrossed,
  textcursorinput: TextCursorInput,
  route: RouteIcon,
  zap: Zap,
  compass: Compass,
  fuel: Fuel,
  scissors: Scissors,
  package: Package,
  sparkles: Sparkles,
  star: Star,
  crown: Crown,
  rocket: Rocket,
  shield: Shield,
  users: Users,
  briefcase: Briefcase,
  settings: Settings,
  barchart3: BarChart3,
  linechart: LineChart,
}

function lookupIcon(name?: string): LucideIcon {
  if (!name) return Globe
  const key = name.toLowerCase().replace(/[-_\s]/g, '')
  return ICON_MAP[key] || Globe
}

// ─── href → view + optional slug (for useNavigate) ───────────────────
function hrefToView(href: string): { view: string; slug?: string } {
  if (!href || href === '/' || href === '/home') return { view: 'home' }
  if (href === '/products') return { view: 'products' }
  if (href === '/solutions') return { view: 'solutions' }
  if (href === '/industries') return { view: 'industries' }
  if (href === '/pricing') return { view: 'pricing' }
  if (href === '/resources') return { view: 'resources' }
  if (href === '/contact') return { view: 'contact' }
  if (href === '/about') return { view: 'about' }
  if (href === '/careers') return { view: 'careers' }
  if (href === '/blog') return { view: 'blog' }
  if (href === '/become-partner') return { view: 'become-partner' }
  if (href === '/login' || href === '/signin') return { view: 'signin' }
  if (href === '/dashboard') return { view: 'dashboard' }
  if (href.startsWith('/erp/')) return { view: 'erp-detail', slug: href.slice('/erp/'.length) }
  if (href.startsWith('/industry/')) return { view: 'industry-detail', slug: href.slice('/industry/'.length) }
  if (href.startsWith('/legal/')) {
    const tail = href.slice('/legal/'.length)
    if (tail === 'terms') return { view: 'legal-terms' }
    if (tail === 'privacy') return { view: 'legal-privacy' }
    if (tail === 'refund') return { view: 'legal-refund' }
    if (tail === 'security') return { view: 'legal-security' }
  }
  // Unknown href → fall back to home so the link is always clickable.
  return { view: 'home' }
}

// ─── href → which dropdown (if any) the link should trigger ──────────
function hrefToDropdown(href: string): DropdownType {
  const { view } = hrefToView(href)
  if (view === 'products') return 'products'
  if (view === 'solutions') return 'solutions'
  if (view === 'industries') return 'industries'
  if (view === 'pricing') return 'pricing'
  return null
}

// ─── Hardcoded fallback nav links (mirror Link Manager defaults) ────
// Label uses 'Ecosystem' for the home entry so the no-override case
// preserves the existing header look verbatim.
const FALLBACK_NAV_LINKS: StoredNavLink[] = [
  { id: 'nav_home', label: 'Ecosystem', href: '/', icon: 'globe', order: 0 },
  { id: 'nav_products', label: 'Products', href: '/products', icon: 'boxes', order: 1 },
  { id: 'nav_solutions', label: 'Solutions', href: '/solutions', icon: 'layers', order: 2 },
  { id: 'nav_industries', label: 'Industries', href: '/industries', icon: 'building2', order: 3 },
  { id: 'nav_pricing', label: 'Pricing', href: '/pricing', icon: 'tag', order: 4 },
  { id: 'nav_resources', label: 'Resources', href: '/resources', icon: 'bookopen', order: 5 },
  { id: 'nav_contact', label: 'Contact', href: '/contact', icon: 'mail', order: 6 },
]

// ─── Hardcoded fallback CTA links ────────────────────────────────────
const FALLBACK_CTA_LINKS: StoredCtaLink[] = [
  { id: 'cta_get_started', key: 'get_started', label: 'Get Started', href: '/pricing' },
  { id: 'cta_explore_products', key: 'explore_products', label: 'Explore Products', href: '/products' },
  { id: 'cta_contact_sales', key: 'contact_sales', label: 'Contact Sales', href: '/contact' },
  { id: 'cta_become_partner', key: 'become_partner', label: 'Become a Partner', href: '/become-partner' },
]

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN ITEM TYPE
   ═══════════════════════════════════════════════════════════════ */
type DropdownItem = {
  label: string
  icon: LucideIcon
  view: string
  slug?: string
  description?: string
  badge?: string
  color?: string
}

type DropdownType = 'products' | 'solutions' | 'industries' | 'pricing' | null

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA — Products, Solutions, Industries, Pricing
   ═══════════════════════════════════════════════════════════════ */
const PRODUCTS_ITEMS: DropdownItem[] = [
  { label: 'ApparelFlow', icon: Shirt, view: 'erp-detail', slug: 'apparelflow', description: 'Apparel & Textile', badge: 'LIVE', color: 'cyan' },
  { label: 'HotelFlow', icon: Hotel, view: 'erp-detail', slug: 'hotelflow', description: 'Hospitality', badge: 'LIVE', color: 'amber' },
  { label: 'EduFlow', icon: GraduationCap, view: 'erp-detail', slug: 'eduflow', description: 'Education', badge: 'LIVE', color: 'violet' },
  { label: 'PharmaFlow', icon: Pill, view: 'erp-detail', slug: 'pharmaflow', description: 'Pharmaceutical', badge: 'LIVE', color: 'emerald' },
  { label: 'MartFlow', icon: ShoppingCart, view: 'erp-detail', slug: 'martflow', description: 'Retail & POS', badge: 'LIVE', color: 'orange' },
  { label: 'BuildFlow', icon: HardHat, view: 'erp-detail', slug: 'buildflow', description: 'Real Estate', badge: 'LIVE', color: 'teal' },
  { label: 'TravelFlow', icon: Plane, view: 'erp-detail', slug: 'travelflow', description: 'Travel & Tourism', badge: 'LIVE', color: 'rose' },
  { label: 'TenantFlow', icon: Building2, view: 'erp-detail', slug: 'tenantflow', description: 'Property Mgmt', badge: 'LIVE', color: 'blue' },
  { label: 'FactoryFlow', icon: Factory, view: 'erp-detail', slug: 'factoryflow', description: 'Manufacturing', badge: 'LIVE', color: 'orange' },
  { label: 'FoodFlow', icon: UtensilsCrossed, view: 'erp-detail', slug: 'foodflow', description: 'Food & Restaurant', badge: 'LIVE', color: 'rose' },
  { label: 'AutoFlow', icon: Wrench, view: 'erp-detail', slug: 'autoflow', description: 'Automotive', badge: 'NEW', color: 'cyan' },
  { label: 'HealthFlow', icon: HeartPulse, view: 'erp-detail', slug: 'healthflow', description: 'Healthcare', badge: 'LIVE', color: 'emerald' },
  { label: 'TextileFlow', icon: TextCursorInput, view: 'erp-detail', slug: 'textileflow', description: 'Textile', badge: 'LIVE', color: 'pink' },
  { label: 'CreativeFlow', icon: Palette, view: 'erp-detail', slug: 'creativeflow', description: 'Creative & Design', badge: 'LIVE', color: 'violet' },
  { label: 'LogisticFlow', icon: Truck, view: 'erp-detail', slug: 'logisticflow', description: 'Logistics', badge: 'LIVE', color: 'teal' },
  { label: 'DistriFlow', icon: RouteIcon, view: 'erp-detail', slug: 'distriflow', description: 'Distribution', badge: 'LIVE', color: 'amber' },
  { label: 'ElectroFlow', icon: Zap, view: 'erp-detail', slug: 'electroflow', description: 'Consumer Electronics', badge: 'LIVE', color: 'emerald' },
  { label: 'FleetFlow', icon: Compass, view: 'erp-detail', slug: 'fleetflow', description: 'Fleet & Transportation', badge: 'LIVE', color: 'cyan' },
  { label: 'BookFlow', icon: BookOpen, view: 'erp-detail', slug: 'bookflow', description: 'Publishing & Books', badge: 'NEW', color: 'violet' },
  { label: 'FuelFlow', icon: Fuel, view: 'erp-detail', slug: 'fuelflow', description: 'Fuel & Energy', badge: 'NEW', color: 'orange' },
  { label: 'SalonFlow', icon: Scissors, view: 'erp-detail', slug: 'salonflow', description: 'Salon & Beauty', badge: 'NEW', color: 'pink' },
]

const SOLUTIONS_ITEMS: DropdownItem[] = [
  { label: 'By Industry', icon: Globe, view: 'solutions', description: 'Industry-specific solutions', color: 'teal' },
  { label: 'By Business Size', icon: Briefcase, view: 'solutions', description: 'Startup, SMB, Enterprise', color: 'amber' },
  { label: 'Operations Mgmt', icon: Settings, view: 'solutions', description: 'Streamline daily workflows', color: 'orange' },
  { label: 'Financial Control', icon: BarChart3, view: 'solutions', description: 'Budget, invoicing & reporting', color: 'emerald' },
  { label: 'Supply Chain', icon: Truck, view: 'solutions', description: 'End-to-end logistics', color: 'cyan' },
  { label: 'Customer Mgmt', icon: Users, view: 'solutions', description: 'CRM & client relationships', color: 'violet' },
  { label: 'Analytics & BI', icon: LineChart, view: 'solutions', description: 'Data-driven decisions', color: 'rose' },
]

const INDUSTRIES_ITEMS: DropdownItem[] = [
  { label: 'Apparel & Textile', icon: Shirt, view: 'industry-detail', slug: 'apparel', description: 'Production & order tracking', color: 'cyan' },
  { label: 'Hospitality', icon: Hotel, view: 'industry-detail', slug: 'hospitality', description: 'Hotels & guest management', color: 'amber' },
  { label: 'Education', icon: GraduationCap, view: 'industry-detail', slug: 'education', description: 'Schools & universities', color: 'violet' },
  { label: 'Pharmaceutical', icon: Pill, view: 'industry-detail', slug: 'pharma', description: 'Compliance & inventory', color: 'emerald' },
  { label: 'Retail', icon: ShoppingCart, view: 'industry-detail', slug: 'retail', description: 'Multi-store POS', color: 'orange' },
  { label: 'Property Mgmt', icon: Building2, view: 'industry-detail', slug: 'property', description: 'Real estate & tenants', color: 'teal' },
  { label: 'Travel & Tourism', icon: Plane, view: 'industry-detail', slug: 'travel', description: 'Hajj, Umrah & travel', color: 'rose' },
  { label: 'Manufacturing', icon: Factory, view: 'industry-detail', slug: 'manufacturing', description: 'Production & quality', color: 'orange' },
  { label: 'Food & Restaurant', icon: UtensilsCrossed, view: 'industry-detail', slug: 'food', description: 'Restaurant operations', color: 'rose' },
  { label: 'Automotive', icon: Wrench, view: 'industry-detail', slug: 'automotive', description: 'Workshop & service', color: 'cyan' },
  { label: 'Healthcare', icon: HeartPulse, view: 'industry-detail', slug: 'healthcare', description: 'Hospitals & clinics', color: 'emerald' },
  { label: 'Creative & Design', icon: Palette, view: 'industry-detail', slug: 'creative', description: 'Agencies & studios', color: 'violet' },
  { label: 'Logistics', icon: Truck, view: 'industry-detail', slug: 'logistics', description: 'Fleet & supply chain', color: 'teal' },
  { label: 'Distribution', icon: RouteIcon, view: 'industry-detail', slug: 'distribution', description: 'Wholesale ops', color: 'amber' },
  { label: 'Textile', icon: TextCursorInput, view: 'industry-detail', slug: 'textile', description: 'Weaving & yarn tracking', color: 'pink' },
  { label: 'Consumer Electronics', icon: Zap, view: 'industry-detail', slug: 'consumer-electronics', description: 'Electronics & appliances', color: 'emerald' },
  { label: 'Fleet & Transportation', icon: Compass, view: 'industry-detail', slug: 'fleet-transportation', description: 'Fleet management & logistics', color: 'cyan' },
  { label: 'Publishing & Books', icon: BookOpen, view: 'industry-detail', slug: 'publishing-books', description: 'Publishing & distribution', color: 'violet' },
  { label: 'Fuel & Energy', icon: Fuel, view: 'industry-detail', slug: 'fuel-energy', description: 'Fuel stations & energy', color: 'orange' },
  { label: 'Salon & Beauty', icon: Scissors, view: 'industry-detail', slug: 'salon-beauty', description: 'Salons & beauty clinics', color: 'pink' },
]

const PRICING_ITEMS: DropdownItem[] = [
  { label: 'Starter', icon: Rocket, view: 'pricing', description: 'From PKR 15,000/mo', color: 'teal' },
  { label: 'Professional', icon: Star, view: 'pricing', description: 'From PKR 35,000/mo', color: 'amber' },
  { label: 'Enterprise', icon: Crown, view: 'pricing', description: 'Custom pricing', color: 'violet' },
  { label: 'Custom Builder', icon: Package, view: 'pricing', description: 'Build your own package', color: 'orange' },
  { label: 'Compare Plans', icon: Layers, view: 'pricing', description: 'See all features', color: 'cyan' },
]

/* ═══════════════════════════════════════════════════════════════
   COLOR HELPERS — Golden Gate palette
   ═══════════════════════════════════════════════════════════════ */
const ERP_COLORS: Record<string, string> = {
  cyan: '#1B9C85',
  amber: '#D4930D',
  violet: '#9B6DFF',
  emerald: '#2D8F4E',
  orange: '#F07B38',
  teal: '#0E8FA0',
  rose: '#C4375A',
  blue: '#18B0C8',
  pink: '#E04872',
  red: '#D43131',
  green: '#2D8F4E',
  yellow: '#EAB308',
}

function erpColorHex(color?: string): string {
  return (color && ERP_COLORS[color]) || 'var(--gg-teal)'
}

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE — Smooth spring transition
   ═══════════════════════════════════════════════════════════════ */
function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="relative w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/6 transition-all duration-300 overflow-hidden"
      aria-label="Toggle theme"
    >
      {mounted ? (
        <>
          <Sun className="w-[14px] h-[14px] absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] dark:opacity-0 dark:rotate-90 dark:scale-0 opacity-100 rotate-0 scale-100" />
          <Moon className="w-[14px] h-[14px] absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] dark:opacity-100 dark:rotate-0 dark:scale-100 opacity-0 -rotate-90 scale-0" />
        </>
      ) : (
        <Sun className="w-[14px] h-[14px]" />
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LOGO — Full logo with click handler
   ═══════════════════════════════════════════════════════════════ */
function Logo({ onClick }: { onClick: () => void }) {
  return <SiteLogo variant="full" size={28} onClick={onClick} />
}

/* ═══════════════════════════════════════════════════════════════
   FEATURED PRODUCTS — Curated highlight set for mega menu
   ═══════════════════════════════════════════════════════════════ */
const ERP_DESCRIPTIONS: Record<string, string> = {
  apparelflow: 'Complete apparel production suite — track orders from cut to ship, manage BOM with auto costing, handle multi-size colorways, production planning with capacity scheduling, and real-time factory floor monitoring with WIP tracking across all stitching units.',
  hotelflow: 'Full-spectrum hotel management — front desk operations with check-in/out automation, housekeeping scheduling, F&B cost control, channel manager for OTA sync, banquet & event billing, guest loyalty programs, and dynamic room pricing with occupancy analytics.',
  eduflow: 'End-to-end campus administration — student admissions with online enrollment, automated attendance via biometric integration, exam grading with GPA calculation, fee collection with installment plans, timetable scheduling, library management, and parent portal access.',
  pharmaflow: 'Pharmaceutical compliance platform — batch & lot tracking with full traceability, expiry date monitoring with auto alerts, controlled substance compliance, multi-location inventory with stock transfer, POS integration for retail pharmacies, and regulatory reporting for health authorities.',
  martflow: 'Multi-store retail command center — POS with barcode scanning & quick billing, inventory management with auto-reorder points, customer loyalty programs with points & rewards, real-time sales dashboards, purchase order management, and inter-branch stock transfers with margin analysis.',
  buildflow: 'Real estate project lifecycle management — site progress tracking with milestone planning, sales CRM with buyer follow-ups, payment schedule management with installment tracking, buyer portal for document access, vendor & contractor billing, and project profitability analytics with cost variance reporting.',
  travelflow: 'Complete travel operations platform — booking engine with airline & hotel integration, Hajj & Umrah package management with visa processing, itinerary builder with day-by-day planning, agent commission tracking, supplier payment management, and customer portal with booking status & document uploads.',
  tenantflow: 'Property management made simple — rent collection with auto-reminders & late fee calculation, maintenance ticket system with priority tracking, lease agreement management with renewal alerts, tenant portal for online payments & requests, expense tracking, and property ROI analytics with occupancy dashboards.',
  factoryflow: 'Manufacturing execution system — production planning with BOM & routing, shop floor control with work order tracking, quality control with inspection checklists, raw material inventory with auto-replenishment, machine downtime tracking, and production costing with yield variance analysis across all production lines.',
  foodflow: 'Restaurant operations powerhouse — recipe costing with margin analysis, table reservation & waitlist management, kitchen display system for order routing, delivery tracking with driver management, supplier purchase orders, multi-branch reporting, and food cost control with waste tracking & variance alerts.',
  autoflow: 'Auto workshop management system — job card creation with service checklist, parts inventory with bin location tracking, service scheduling with bay allocation, customer vehicle history, vendor purchase orders for spare parts, labor time tracking, and service profitability analysis with technician performance dashboards.',
  healthflow: 'Healthcare operations platform — patient records with medical history, appointment scheduling with doctor availability, billing with insurance claim processing, pharmacy inventory integration, lab test order management, room & bed allocation, and revenue cycle analytics with department-wise performance reporting.',
  textileflow: 'Textile production management — weaving & knitting order tracking, yarn inventory with lot management, dyeing process scheduling with recipe management, quality inspection at each production stage, fabric roll tracking with barcode integration, and production costing from raw yarn to finished fabric with wastage analysis.',
  creativeflow: 'Creative agency management — project pipeline with kanban boards, time logging with timer integration, client brief management with approval workflows, resource allocation across teams, automated invoicing from tracked hours, expense management with receipt uploads, and profitability reporting per client & project.',
  logisticflow: 'Logistics operations command center — fleet tracking with real-time GPS, route optimization for deliveries, proof of delivery with e-signature capture, warehouse management with pick-pack-ship, customer order tracking portal, driver performance monitoring, and delivery cost analytics with route-wise profitability analysis.',
  distriflow: 'Distribution management platform — warehouse operations with pick-pack-ship workflows, sales route planning with territory mapping, demand forecasting with seasonal trends, distributor order portal, van sales with on-road invoicing, return & damage tracking, and margin analysis by SKU, route & salesperson.',
  electroflow: 'Consumer electronics management — serial number tracking from warehouse to customer, warranty management with claim processing, repair center with technician assignment, product return & replacement workflows, supplier RMA management, stock aging analysis, and post-sale service profitability reporting.',
  fleetflow: 'Fleet management & tracking — GPS vehicle tracking with geofence alerts, fuel monitoring with consumption analytics, preventive maintenance scheduling with service reminders, driver behavior monitoring with scoring, trip logging with route playback, tire & battery lifecycle tracking, and total cost of ownership analytics per vehicle.',
  bookflow: 'Publishing workflow platform — title management from manuscript to market, print run planning with cost estimation, distribution channel management with order tracking, royalty calculation with author portal, ISBN management, inventory tracking by edition & format, and sales analytics by channel, region & title.',
  fuelflow: 'Fuel station operations system — tank level monitoring with dip chart integration, shift management with cash reconciliation, fuel price management with margin tracking, loyalty card processing, wet stock management with variance alerts, dispenser calibration tracking, and daily P&L reporting with theft detection analytics.',
  salonflow: 'Salon & beauty business platform — appointment booking with online self-scheduling, stylist chair management with service assignment, POS with product & service billing, customer profile with treatment history, inventory tracking for retail products, commission calculation for stylists, and business analytics with peak hour & revenue dashboards.',
}

const FEATURED_PRODUCTS = PRODUCTS_ITEMS.filter(p => ['electroflow', 'fleetflow', 'apparelflow', 'hotelflow'].includes(p.slug || ''))

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CATEGORIES — For mega menu grouping
   ═══════════════════════════════════════════════════════════════ */
const PRODUCT_CATEGORIES = [
  {
    label: 'Manufacturing',
    icon: Factory,
    slugs: ['factoryflow', 'apparelflow', 'textileflow', 'creativeflow'],
  },
  {
    label: 'Service & Hospitality',
    icon: Hotel,
    slugs: ['hotelflow', 'eduflow', 'healthflow', 'foodflow'],
  },
  {
    label: 'Retail & Distribution',
    icon: ShoppingCart,
    slugs: ['martflow', 'distriflow', 'logisticflow', 'pharmaflow'],
  },
  {
    label: 'Transport & Fleet',
    icon: Compass,
    slugs: ['fleetflow', 'travelflow', 'autoflow'],
  },
  {
    label: 'Property & Electronics',
    icon: Building2,
    slugs: ['buildflow', 'tenantflow', 'electroflow'],
  },
  {
    label: 'Lifestyle & Energy',
    icon: Sparkles,
    slugs: ['salonflow', 'fuelflow', 'bookflow'],
  },
]

/* ═══════════════════════════════════════════════════════════════
   PRODUCTS MEGA MENU — Full-width, 3-panel showpiece
   Left: Category tabs | Center: Products grid | Right: Spotlight
   ═══════════════════════════════════════════════════════════════ */
function ProductsMegaMenu({
  isOpen,
  onItemClick,
  onViewAll,
  onMouseEnter,
  onMouseLeave,
}: {
  isOpen: boolean
  onItemClick: (item: DropdownItem) => void
  onViewAll: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const [activeCategory, setActiveCategory] = useState('Manufacturing')

  const categorizedProducts = useMemo(() => {
    return PRODUCT_CATEGORIES.map(cat => ({
      ...cat,
      items: PRODUCTS_ITEMS.filter(p => cat.slugs.includes(p.slug || '')),
    })).filter(cat => cat.items.length > 0)
  }, [])

  const activeItems = useMemo(() => {
    const cat = categorizedProducts.find(c => c.label === activeCategory)
    return cat?.items ?? categorizedProducts[0]?.items ?? []
  }, [activeCategory, categorizedProducts])

  const spotlightProduct = activeItems[0]
  const SpotlightIcon = spotlightProduct?.icon
  const spotlightHex = erpColorHex(spotlightProduct?.color)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3, ease: smoothEase }}
          className="fixed left-4 right-4 z-50"
          style={{ top: 60, paddingTop: 16 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 8%, transparent)',
            }}
          >
            {/* Animated gradient top accent */}
            <div className="h-[3px] w-full overflow-hidden relative" style={{ background: 'linear-gradient(90deg, var(--gg-vermillion), var(--gg-amber), var(--gg-teal), var(--gg-violet), var(--gg-vermillion))' }}>
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Header */}
            <div className="px-8 pt-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">Purpose-Built ERP Systems</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">21 industry-specific platforms, each engineered for excellence</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--gg-green) 10%, transparent)', color: 'var(--gg-green)', border: '1px solid color-mix(in srgb, var(--gg-green) 15%, transparent)' }}>
                  21 LIVE
                </span>
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--gg-teal) 10%, transparent)', color: 'var(--gg-teal)', border: '1px solid color-mix(in srgb, var(--gg-teal) 15%, transparent)' }}>
                  4 NEW
                </span>
              </div>
            </div>

            {/* Three-Panel Layout */}
            <div className="px-8 pb-5 flex gap-0 min-h-[340px]">
              {/* ─── Left Panel: Category Navigation (Apple-style shifting) ─── */}
              <div className="w-[220px] shrink-0 pr-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <LayoutGrid className="w-3 h-3 text-[var(--gg-teal)]" />
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Categories</span>
                </div>
                <div className="space-y-1">
                  {categorizedProducts.map((cat, catIdx) => {
                    const CatIcon = cat.icon
                    const isActive = activeCategory === cat.label
                    return (
                      <motion.button
                        key={cat.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 + catIdx * 0.03, duration: 0.2, ease: smoothEase }}
                        onClick={() => setActiveCategory(cat.label)}
                        onMouseEnter={() => setActiveCategory(cat.label)}
                        className="group/cat w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left relative z-10"
                      >
                        {/* Apple-style floating background pill — shifts via layoutId */}
                        {isActive && (
                          <motion.span
                            layoutId="catBgPill"
                            className="absolute inset-0 rounded-xl z-[-1]"
                            style={{
                              background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 8%, transparent), color-mix(in srgb, var(--gg-amber) 4%, transparent))',
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                          />
                        )}
                        {/* Active indicator bar */}
                        {isActive && (
                          <motion.span
                            layoutId="catIndicator"
                            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                            style={{ background: 'linear-gradient(180deg, var(--gg-vermillion), var(--gg-amber))' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <motion.div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          animate={{
                            backgroundColor: isActive
                              ? 'color-mix(in srgb, var(--gg-vermillion) 14%, transparent)'
                              : 'color-mix(in srgb, var(--foreground) 5%, transparent)',
                            scale: isActive ? 1.08 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                          <CatIcon className="w-4 h-4 transition-colors" style={{ color: isActive ? 'var(--gg-vermillion)' : 'var(--muted-foreground)' }} />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[13px] font-semibold transition-colors truncate block ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover/cat:text-foreground'}`}>
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-foreground/50 tabular-nums font-medium">{cat.items.length}</span>
                        <ChevronRight className={`w-3 h-3 transition-all duration-200 ${isActive ? 'text-[var(--gg-vermillion)]' : 'text-foreground/30 group-hover/cat:text-foreground/50'}`} />
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* ─── Vertical Divider ─── */}
              <div className="w-px my-1 shrink-0" style={{ background: 'linear-gradient(180deg, transparent, var(--gg-separator-strong), var(--gg-separator-strong), transparent)' }} />

              {/* ─── Center Panel: Products Grid ─── */}
              <div className="flex-1 min-w-0 px-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3 h-3 text-[var(--gg-amber)]" />
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{activeCategory}</span>
                  <div className="flex-1 h-px ml-2" style={{ background: 'var(--gg-separator)' }} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: smoothEase }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {activeItems.map((item, i) => {
                      const ItemIcon = item.icon
                      const hex = erpColorHex(item.color)
                      const isNew = item.badge === 'NEW'
                      const richDesc = ERP_DESCRIPTIONS[item.slug || ''] || item.description
                      return (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.25, ease: smoothEase }}
                          onClick={() => onItemClick(item)}
                          className="group/prod flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 relative overflow-hidden"
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = `linear-gradient(135deg, color-mix(in srgb, ${hex} 8%, transparent), color-mix(in srgb, ${hex} 3%, transparent))`
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover/prod:scale-110 relative"
                            style={{ backgroundColor: `color-mix(in srgb, ${hex} 10%, transparent)` }}
                          >
                            <ItemIcon className="w-[18px] h-[18px] transition-colors" style={{ color: hex }} />
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover/prod:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 16px -4px ${hex}50` }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[15px] font-semibold text-foreground group-hover/prod:text-primary transition-colors truncate">
                                {item.label}
                              </span>
                              {isNew && (
                                <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-md leading-none shrink-0" style={{ background: `color-mix(in srgb, var(--gg-teal) 12%, transparent)`, color: 'var(--gg-teal)', border: '1px solid color-mix(in srgb, var(--gg-teal) 18%, transparent)' }}>
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[13px] text-muted-foreground leading-snug truncate block">{item.description}</span>
                            <span className="text-[13px] text-foreground/50 leading-relaxed line-clamp-2 mt-1 block">{richDesc}</span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ─── Vertical Divider ─── */}
              <div className="w-px my-1 shrink-0" style={{ background: 'linear-gradient(180deg, transparent, var(--gg-separator-strong), var(--gg-separator-strong), transparent)' }} />

              {/* ─── Right Panel: Spotlight Product ─── */}
              <div className="w-[240px] shrink-0 pl-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Eye className="w-3 h-3 text-[var(--gg-violet)]" />
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Spotlight</span>
                </div>
                {spotlightProduct && SpotlightIcon && (
                  <motion.div
                    key={spotlightProduct.label}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: smoothEase }}
                    className="rounded-xl p-5 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, color-mix(in srgb, ${spotlightHex} 8%, var(--card)), color-mix(in srgb, ${spotlightHex} 3%, var(--card)))`,
                      border: `1px solid color-mix(in srgb, ${spotlightHex} 15%, transparent)`,
                    }}
                  >
                    {/* Spotlight glow accent */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: spotlightHex }} />

                    <div className="relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
                        style={{ backgroundColor: `color-mix(in srgb, ${spotlightHex} 15%, transparent)`, boxShadow: `0 0 24px -8px ${spotlightHex}40` }}
                      >
                        <SpotlightIcon className="w-7 h-7" style={{ color: spotlightHex }} />
                      </div>
                      <h4 className="text-base font-bold text-foreground mb-1">{spotlightProduct.label}</h4>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{spotlightProduct.description} ERP solution with powerful modules and real-time analytics.</p>

                      {/* Key features list */}
                      <div className="space-y-1.5 mb-5">
                        {['Real-time Dashboard', 'Multi-branch Support', 'Advanced Analytics'].map((feat) => (
                          <div key={feat} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: spotlightHex }} />
                            <span className="text-[11.5px] text-muted-foreground">{feat}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onItemClick(spotlightProduct)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl transition-all duration-250 group/spot"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${spotlightHex} 14%, transparent), color-mix(in srgb, ${spotlightHex} 6%, transparent))`,
                          border: `1px solid color-mix(in srgb, ${spotlightHex} 20%, transparent)`,
                          color: spotlightHex,
                        }}
                      >
                        <span>Explore {spotlightProduct.label}</span>
                        <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/spot:translate-x-0.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Quick Demo promo */}
                <div
                  className="mt-3 p-3.5 rounded-xl relative overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 8%, transparent), color-mix(in srgb, var(--gg-violet) 5%, transparent))',
                    border: '1px solid color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                  }}
                  onClick={() => onItemClick(spotlightProduct || PRODUCTS_ITEMS[0])}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)' }}>
                      <Play className="w-3.5 h-3.5 text-[var(--gg-vermillion)]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">Quick Demo</span>
                      <span className="text-[10px] text-muted-foreground">See any ERP in action</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer — Gradient CTA Strip */}
            <div className="px-8 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--gg-separator)', background: 'linear-gradient(90deg, color-mix(in srgb, var(--gg-vermillion) 3%, transparent), color-mix(in srgb, var(--gg-amber) 3%, transparent), color-mix(in srgb, var(--gg-teal) 2%, transparent))' }}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[var(--gg-amber)]" />
                <span className="text-[13px] text-muted-foreground">
                  <span className="font-semibold text-foreground">21 industry-specific</span> ERP platforms ready to deploy
                </span>
              </div>
              <button
                onClick={onViewAll}
                className="flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-250 group/cta"
                style={{
                  background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                  color: 'white',
                  boxShadow: '0 4px 16px -4px color-mix(in srgb, var(--gg-vermillion) 40%, transparent)',
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Explore All 21 Products</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SOLUTIONS MEGA MENU — Full-width 2-column grid
   ═══════════════════════════════════════════════════════════════ */
function SolutionsMegaMenu({
  isOpen,
  onItemClick,
  onViewAll,
  onMouseEnter,
  onMouseLeave,
}: {
  isOpen: boolean
  onItemClick: (item: DropdownItem) => void
  onViewAll: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const SOLUTION_DETAILS: Record<string, string[]> = {
    'By Industry': ['Tailored workflows', 'Industry templates', 'Compliance built-in'],
    'By Business Size': ['Startup-ready', 'SMB scaling', 'Enterprise grade'],
    'Operations Mgmt': ['Task automation', 'Workflow builder', 'Real-time monitoring'],
    'Financial Control': ['GL & sub-ledgers', 'Budget tracking', 'Tax compliance'],
    'Supply Chain': ['Procurement', 'Warehouse mgmt', 'Delivery tracking'],
    'Customer Mgmt': ['360° client view', 'Pipeline tracking', 'Automated follow-ups'],
    'Analytics & BI': ['Custom dashboards', 'Predictive insights', 'Export & share'],
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3, ease: smoothEase }}
          className="fixed left-4 right-4 z-50"
          style={{ top: 60, paddingTop: 16 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 8%, transparent)',
            }}
          >
            {/* Top gradient accent */}
            <div className="h-[3px] w-full overflow-hidden relative" style={{ background: 'linear-gradient(90deg, var(--gg-vermillion), var(--gg-amber), var(--gg-vermillion))' }}>
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Header */}
            <div className="px-8 pt-6 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gg-teal), var(--gg-cyan))' }}>
                <Globe className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Solutions for Every Need</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Comprehensive solutions designed to scale with your business</p>
              </div>
            </div>

            {/* 2-column grid */}
            <div className="px-8 pb-5 grid grid-cols-2 gap-3">
              {SOLUTIONS_ITEMS.map((item, i) => {
                const ItemIcon = item.icon
                const hex = erpColorHex(item.color)
                const bullets = SOLUTION_DETAILS[item.label] || []
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25, ease: smoothEase }}
                    onClick={() => onItemClick(item)}
                    className="group/sol flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-250 relative overflow-hidden"
                    style={{ border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = `linear-gradient(135deg, color-mix(in srgb, ${hex} 6%, transparent), color-mix(in srgb, ${hex} 2%, transparent))`
                      el.style.borderColor = `color-mix(in srgb, ${hex} 20%, transparent)`
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.borderColor = 'color-mix(in srgb, var(--border) 60%, transparent)'
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover/sol:scale-110 relative"
                      style={{ backgroundColor: `color-mix(in srgb, ${hex} 12%, transparent)` }}
                    >
                      <ItemIcon className="w-5 h-5 transition-colors" style={{ color: hex }} />
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover/sol:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 16px -4px ${hex}40` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground group-hover/sol:text-primary transition-colors block mb-1">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight block mb-2">{item.description}</span>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {bullets.map(b => (
                          <span key={b} className="text-[11px] text-foreground/60 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full" style={{ background: hex }} />
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover/sol:text-primary/60 shrink-0 mt-1 transition-all duration-200 group-hover/sol:translate-x-0.5" />
                  </motion.button>
                )
              })}
            </div>

            {/* Footer CTA */}
            <div className="px-8 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--gg-separator)' }}>
              <span className="text-[13px] text-muted-foreground">
                Find the <span className="font-semibold text-foreground">perfect solution</span> for your business
              </span>
              <button
                onClick={onViewAll}
                className="flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-250 group/sol-cta"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-teal) 12%, transparent), color-mix(in srgb, var(--gg-cyan) 8%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--gg-teal) 18%, transparent)',
                  color: 'var(--gg-teal)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--gg-teal) 20%, transparent), color-mix(in srgb, var(--gg-cyan) 14%, transparent))'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--gg-teal) 12%, transparent), color-mix(in srgb, var(--gg-cyan) 8%, transparent))'
                }}
              >
                <span>Explore All Solutions</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/sol-cta:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   INDUSTRIES MEGA MENU — Full-width 4-column grid
   ═══════════════════════════════════════════════════════════════ */
function IndustriesMegaMenu({
  isOpen,
  onItemClick,
  onViewAll,
  onMouseEnter,
  onMouseLeave,
}: {
  isOpen: boolean
  onItemClick: (item: DropdownItem) => void
  onViewAll: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3, ease: smoothEase }}
          className="fixed left-4 right-4 z-50"
          style={{ top: 60, paddingTop: 16 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 8%, transparent)',
            }}
          >
            {/* Top gradient accent */}
            <div className="h-[3px] w-full overflow-hidden relative" style={{ background: 'linear-gradient(90deg, var(--gg-teal), var(--gg-violet), var(--gg-vermillion), var(--gg-amber))' }}>
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Header */}
            <div className="px-8 pt-6 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gg-violet), var(--gg-rose))' }}>
                <Briefcase className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Industry Verticals</h3>
                <p className="text-xs text-muted-foreground mt-0.5">20 specialized industries with dedicated ERP solutions</p>
              </div>
            </div>

            {/* 4-column grid */}
            <div className="px-8 pb-5 grid grid-cols-4 gap-2 max-h-[380px] overflow-y-auto custom-scrollbar">
              {INDUSTRIES_ITEMS.map((item, i) => {
                const ItemIcon = item.icon
                const hex = erpColorHex(item.color)
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2, ease: smoothEase }}
                    onClick={() => onItemClick(item)}
                    className="group/ind flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = `linear-gradient(135deg, color-mix(in srgb, ${hex} 6%, transparent), color-mix(in srgb, ${hex} 2%, transparent))`
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-250 group-hover/ind:scale-110"
                      style={{ backgroundColor: `color-mix(in srgb, ${hex} 10%, transparent)` }}
                    >
                      <ItemIcon className="w-4 h-4" style={{ color: hex }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <span className="text-[13px] font-semibold text-foreground group-hover/ind:text-primary transition-colors truncate block">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate block leading-tight mt-0.5">{item.description}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Footer CTA */}
            <div className="px-8 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--gg-separator)' }}>
              <span className="text-[13px] text-muted-foreground">
                Serving <span className="font-semibold text-foreground">20+ industries</span> worldwide
              </span>
              <button
                onClick={onViewAll}
                className="flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-250 group/ind-cta"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-teal) 12%, transparent), color-mix(in srgb, var(--gg-vermillion) 8%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--gg-teal) 18%, transparent)',
                  color: 'var(--gg-teal)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--gg-teal) 20%, transparent), color-mix(in srgb, var(--gg-vermillion) 14%, transparent))'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--gg-teal) 12%, transparent), color-mix(in srgb, var(--gg-vermillion) 8%, transparent))'
                }}
              >
                <span>View All Industries</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/ind-cta:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PRICING MEGA MENU — Full-width horizontal plan cards
   ═══════════════════════════════════════════════════════════════ */
function PricingMegaMenu({
  isOpen,
  onItemClick,
  onViewAll,
  onMouseEnter,
  onMouseLeave,
}: {
  isOpen: boolean
  onItemClick: (item: DropdownItem) => void
  onViewAll: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const PLAN_FEATURES: Record<string, string> = {
    'Starter': 'Up to 5 users, 2 branches',
    'Professional': 'Up to 25 users, 10 branches',
    'Enterprise': 'Unlimited users & branches',
    'Custom Builder': 'Pick only what you need',
    'Compare Plans': 'Side-by-side feature matrix',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3, ease: smoothEase }}
          className="fixed left-4 right-4 z-50"
          style={{ top: 60, paddingTop: 16 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 8%, transparent)',
            }}
          >
            {/* Top gradient accent */}
            <div className="h-[3px] w-full overflow-hidden relative" style={{ background: 'linear-gradient(90deg, var(--gg-teal), var(--gg-amber), var(--gg-vermillion))' }}>
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Header */}
            <div className="px-8 pt-6 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gg-amber), var(--gg-vermillion))' }}>
                <Tag className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Plans & Pricing</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Flexible pricing to match your scale and ambitions</p>
              </div>
            </div>

            {/* Horizontal plan cards */}
            <div className="px-8 pb-5 flex gap-3">
              {PRICING_ITEMS.map((item, i) => {
                const ItemIcon = item.icon
                const hex = erpColorHex(item.color)
                const feature = PLAN_FEATURES[item.label] || ''
                const isProfessional = item.label === 'Professional'
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25, ease: smoothEase }}
                    onClick={() => onItemClick(item)}
                    className="group/plan flex-1 p-5 rounded-xl text-left transition-all duration-250 relative overflow-hidden"
                    style={{
                      background: isProfessional
                        ? `linear-gradient(145deg, color-mix(in srgb, ${hex} 10%, transparent), color-mix(in srgb, ${hex} 4%, transparent))`
                        : 'transparent',
                      border: isProfessional
                        ? `1px solid color-mix(in srgb, ${hex} 25%, transparent)`
                        : '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = `linear-gradient(145deg, color-mix(in srgb, ${hex} 10%, transparent), color-mix(in srgb, ${hex} 4%, transparent))`
                      el.style.borderColor = `color-mix(in srgb, ${hex} 25%, transparent)`
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      if (!isProfessional) {
                        el.style.background = 'transparent'
                        el.style.borderColor = 'color-mix(in srgb, var(--border) 60%, transparent)'
                      }
                    }}
                  >
                    {isProfessional && (
                      <span className="absolute top-2 right-2 text-[7px] font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${hex} 15%, transparent)`, color: hex, border: `1px solid color-mix(in srgb, ${hex} 20%, transparent)` }}>
                        POPULAR
                      </span>
                    )}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover/plan:scale-110"
                      style={{ backgroundColor: `color-mix(in srgb, ${hex} 12%, transparent)` }}
                    >
                      <ItemIcon className="w-5 h-5" style={{ color: hex }} />
                    </div>
                    <h4 className="text-[15px] font-bold text-foreground group-hover/plan:text-primary transition-colors mb-1">{item.label}</h4>
                    <p className="text-[13px] font-semibold mb-1" style={{ color: hex }}>{item.description}</p>
                    <p className="text-[11px] text-muted-foreground">{feature}</p>
                  </motion.button>
                )
              })}
            </div>

            {/* Footer CTA */}
            <div className="px-8 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--gg-separator)' }}>
              <span className="text-[13px] text-muted-foreground">
                All plans include <span className="font-semibold text-foreground">free setup</span> and <span className="font-semibold text-foreground">24/7 support</span>
              </span>
              <button
                onClick={onViewAll}
                className="flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-250 group/price-cta"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-amber) 12%, transparent), color-mix(in srgb, var(--gg-vermillion) 8%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--gg-amber) 18%, transparent)',
                  color: 'var(--gg-amber)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--gg-amber) 20%, transparent), color-mix(in srgb, var(--gg-vermillion) 14%, transparent))'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'linear-gradient(135deg, color-mix(in srgb, var(--gg-amber) 12%, transparent), color-mix(in srgb, var(--gg-vermillion) 8%, transparent))'
                }}
              >
                <span>View Full Pricing</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/price-cta:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NAV LINK — Pill-shaped with animated Golden Gate underline
   ═══════════════════════════════════════════════════════════════ */
function NavLink({
  children,
  isActive,
  onClick,
  hasDropdown,
  isOpen,
  badge,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
  hasDropdown?: boolean
  isOpen?: boolean
  badge?: React.ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative flex items-center gap-1 text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-250 ${
        isActive || isOpen
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {/* Hover/Active background */}
      <span className={`absolute inset-0 rounded-full transition-all duration-250 ${
        isOpen
          ? 'bg-foreground/8'
          : isActive
            ? 'bg-foreground/5'
            : 'group-hover:bg-foreground/6'
      }`} />

      {children}
      {badge}

      {hasDropdown && (
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      )}

      {/* Animated underline indicator — Golden Gate gradient */}
      {(isActive || isOpen) && (
        <motion.span
          layoutId="navIndicator"
          className="absolute -bottom-[2px] left-3 right-3 h-[2px] rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--gg-vermillion), var(--gg-amber))' }}
          transition={springTransition}
        />
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE — ⌘K Quick Search with rounded frosted glass
   ═══════════════════════════════════════════════════════════════ */
function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean
  onClose: () => void
  onNavigate: (view: string, slug?: string) => void
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => {
    const pages = [
      { label: 'Ecosystem', view: 'home', icon: Globe, description: 'Home & ecosystem overview' },
      { label: 'Products', view: 'products', icon: Layers, description: 'Browse all 21 ERPs' },
      { label: 'Solutions', view: 'solutions', icon: Globe, description: 'Industry solutions' },
      { label: 'Industries', view: 'industries', icon: Briefcase, description: 'Industry verticals' },
      { label: 'Pricing', view: 'pricing', icon: Star, description: 'Plans & pricing' },
      { label: 'Resources', view: 'resources', icon: BookOpen, description: 'Docs & guides' },
      { label: 'Contact', view: 'contact', icon: Phone, description: 'Get in touch' },
      { label: 'Security', view: 'legal-security', icon: Shield, description: 'Security overview' },
    ]
    const erps = PRODUCTS_ITEMS.map((p) => ({ ...p, description: p.description || '' }))
    const industries = INDUSTRIES_ITEMS.map((ind) => ({ ...ind, description: ind.description || '' }))
    return [
      { title: 'Pages', items: pages },
      { title: 'Products', items: erps },
      { title: 'Industries', items: industries },
    ]
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems
    const q = query.toLowerCase()
    return allItems
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0)
  }, [query, allItems])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setQuery('')
        setTimeout(() => inputRef.current?.focus(), 100)
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Palette — rounded frosted glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: smoothEase }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 w-full max-w-lg rounded-2xl overflow-hidden z-[101]"
            style={{
              background: 'color-mix(in srgb, var(--card) 92%, transparent)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--gg-shadow-xl), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 6%, transparent)',
            }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5" style={{ borderBottom: '1px solid var(--gg-separator)' }}>
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products, pages, industries..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary/50 border border-border/50 rounded-md px-1.5 py-0.5 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((section) => (
                  <div key={section.title} className="mb-2 last:mb-0">
                    <div className="px-3 py-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {section.title}
                      </span>
                    </div>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            onNavigate(item.view, item.slug)
                            onClose()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-primary/8 transition-colors group/result"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover/result:bg-primary/12 transition-colors">
                            <ItemIcon className="w-3.5 h-3.5 text-muted-foreground group-hover/result:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-medium text-foreground group-hover/result:text-primary transition-colors">{item.label}</span>
                            {item.description && (
                              <span className="text-[11px] text-muted-foreground ml-2">{item.description}</span>
                            )}
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/result:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--gg-separator)' }}>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary/50 border border-border/50 rounded px-1 py-px font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary/50 border border-border/50 rounded px-1 py-px font-mono">↵</kbd>
                  Open
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {filtered.reduce((sum, s) => sum + s.items.length, 0)} results
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU — Rounded drawer with frosted glass
   ═══════════════════════════════════════════════════════════════ */
function MobileMenu({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean
  onClose: () => void
  onNavigate: (view: string, slug?: string) => void
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>('products')
  const { activeErps, comingSoonErps } = useErpSystems()
  const { get: getContent } = useContent()

  // ─── CTA links (admin-managed) ────────────────────────────────────
  // Used for the bottom "Explore Products" button. Falls back to the
  // hardcoded label/href if the Link Manager hasn't been saved or the
  // API is down.
  const exploreCta = useMemo<StoredCtaLink | null>(() => {
    const raw = getContent('cta', 'cta_links', '[]')
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const found = parsed.find((c) => c && c.key === 'explore_products')
        if (found && typeof found.label === 'string' && typeof found.href === 'string') {
          return found
        }
      }
    } catch {
      /* malformed JSON → fall through to default */
    }
    return FALLBACK_CTA_LINKS.find((c) => c.key === 'explore_products') || null
  }, [getContent])

  const sections = useMemo(() => [
    {
      id: 'ecosystem',
      title: 'Ecosystem',
      icon: Globe,
      items: [
        { label: 'Home', view: 'home', description: 'Ecosystem overview', icon: Globe },
      ],
    },
    {
      id: 'products',
      title: 'Products',
      icon: Layers,
      items: [
        ...activeErps.map((erp) => ({
          label: erp.name,
          view: 'erp-detail',
          slug: erp.slug,
          tag: (erp.slug === 'autoflow' ? 'New' : 'Active') as string,
          color: erp.color,
          icon: getErpIcon(erp.icon),
        })),
        ...comingSoonErps.map((erp) => ({
          label: erp.name,
          view: 'erp-detail',
          slug: erp.slug,
          tag: 'Soon' as string,
          color: erp.color,
          icon: getErpIcon(erp.icon),
        })),
      ],
    },
    {
      id: 'solutions',
      title: 'Solutions',
      icon: Globe,
      items: SOLUTIONS_ITEMS.map((s) => ({ label: s.label, view: s.view, description: s.description, icon: s.icon })),
    },
    {
      id: 'industries',
      title: 'Industries',
      icon: Briefcase,
      items: INDUSTRIES_ITEMS.map((ind) => ({ label: ind.label, view: ind.view, slug: ind.slug, description: ind.description, icon: ind.icon })),
    },
    {
      id: 'pricing',
      title: 'Pricing',
      icon: Star,
      items: PRICING_ITEMS.map((p) => ({ label: p.label, view: p.view, description: p.description, icon: p.icon })),
    },
    {
      id: 'company',
      title: 'Company',
      icon: Building2,
      items: [
        { label: 'About', view: 'about', icon: Zap },
        { label: 'Contact', view: 'contact', icon: Phone },
        { label: 'Security', view: 'legal-security', icon: Shield },
        { label: 'Resources', view: 'resources', icon: BookOpen },
      ],
    },
  ], [activeErps, comingSoonErps])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={onClose}
          />

          {/* Menu Panel — frosted glass rounded drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-3 right-3 bottom-3 w-[85%] max-w-sm rounded-2xl z-[61] lg:hidden flex flex-col overflow-hidden"
            style={{
              background: 'color-mix(in srgb, var(--card) 92%, transparent)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--border)',
              boxShadow: '-10px 0 40px -10px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--gg-separator)' }}>
              <span className="text-sm font-semibold text-foreground">Navigation</span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Accordion Sections */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
              {sections.map((section) => {
                const SectionIcon = section.icon
                const isExpanded = expandedSection === section.id
                const sectionItems = section.items

                return (
                  <div key={section.id} style={{ borderBottom: '1px solid var(--gg-separator)' }} className="last:border-b-0">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                          <SectionIcon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{section.title}</span>
                        {'items' in section && section.items.length > 0 && (
                          <span className="text-[11px] font-medium text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-full">
                            {section.items.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: smoothEase }}
                          className="overflow-hidden"
                        >
                          <div className="pb-2 px-2 max-h-72 overflow-y-auto custom-scrollbar">
                            {sectionItems.map((item, i) => {
                              const ItemIcon = 'icon' in item ? item.icon as LucideIcon : Package
                              const hex = 'color' in item ? erpColorHex(item.color as string) : ''
                              return (
                                <motion.button
                                  key={`${item.label}-${i}`}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.015, duration: 0.2 }}
                                  onClick={() => {
                                    onNavigate(item.view, 'slug' in item ? item.slug : undefined)
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-primary/8 transition-colors group/mob"
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={hex ? { backgroundColor: `color-mix(in srgb, ${hex} 10%, transparent)` } : undefined}
                                  >
                                    <ItemIcon className="w-3.5 h-3.5" style={hex ? { color: hex } : undefined} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[13px] font-medium text-foreground group-hover/mob:text-primary transition-colors">{item.label}</span>
                                      {'tag' in item && item.tag && (
                                        <span className={`text-[8px] font-bold px-1 py-px rounded leading-none shrink-0 ${
                                          item.tag === 'New'
                                            ? 'bg-[var(--gg-teal)]/15 text-[var(--gg-teal)]'
                                            : item.tag === 'Active'
                                              ? 'bg-[var(--gg-green)]/15 text-[var(--gg-green)]'
                                              : 'bg-[var(--gg-amber)]/15 text-[var(--gg-amber)]'
                                        }`}>
                                          {item.tag}
                                        </span>
                                      )}
                                    </div>
                                    {'description' in item && item.description && (
                                      <span className="text-[11px] text-muted-foreground truncate block">{item.description}</span>
                                    )}
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-foreground/45 group-hover/mob:text-primary shrink-0" />
                                </motion.button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="p-4 shrink-0 space-y-2" style={{ borderTop: '1px solid var(--gg-separator)' }}>
              <Button
                className="w-full font-semibold rounded-xl h-11 text-white hover:opacity-90 transition-opacity btn-glow"
                style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                onClick={() => { onNavigate('signin'); onClose() }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant="outline"
                className="w-full font-semibold rounded-xl h-10 border-border/60"
                onClick={() => {
                  // Follow the admin-managed CTA href (defaults to
                  // /products → view 'products'). Falls back to
                  // 'products' if hrefToView can't parse the saved href.
                  const target = exploreCta ? hrefToView(exploreCta.href) : { view: 'products' }
                  onNavigate(target.view, target.slug)
                  onClose()
                }}
              >
                {exploreCta?.label || 'Explore Products'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HEADER COMPONENT — Floating pill-shaped frosted glass bar
   ═══════════════════════════════════════════════════════════════ */
export function SiteHeader() {
  const { mobileMenuOpen, setMobileMenuOpen } = useAppStore()
  const { navigate: navigateToView, isActive } = useNavigate()
  const { getSetting } = useSiteSettings()
  const { get: getContent } = useContent()
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null)
  const [scrolled, setScrolled] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showSearch = getSetting('header_show_search', 'true') === 'true'
  const showThemeToggle = getSetting('header_show_theme_toggle', 'true') === 'true'

  /* ─── Link Manager — dynamic nav + CTA links ─────────────────────────
     Pulls `nav_links` and `cta_links` JSON arrays from the public content
     endpoint via the useContent singleton hook. On any failure (API down,
     malformed JSON, empty override), falls back to FALLBACK_NAV_LINKS /
     FALLBACK_CTA_LINKS so the header renders identically to the pre-wire
     version. useMemo'd against the live `getContent` closure so admin
     saves propagate on the next 60s cache refresh. */
  const navLinks = useMemo<StoredNavLink[]>(() => {
    const raw = getContent('navigation', 'nav_links', '[]')
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sort by `order` if present, falling back to the natural array order.
        return parsed
          .filter((l) => l && typeof l.label === 'string' && typeof l.href === 'string')
          .sort((a, b) => (typeof a.order === 'number' ? a.order : 0) - (typeof b.order === 'number' ? b.order : 0))
      }
    } catch {
      /* malformed JSON → fall through to defaults */
    }
    return FALLBACK_NAV_LINKS
  }, [getContent])

  /* Navigate helper */
  const navigate = useCallback(
    (view: string, slug?: string) => {
      navigateToView(view, slug)
      setOpenDropdown(null)
      setMobileMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigateToView, setMobileMenuOpen]
  )

  /* Handle dropdown item click */
  const handleDropdownClick = useCallback((item: DropdownItem) => {
    navigate(item.view, item.slug)
  }, [navigate])

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close dropdown on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setMobileMenuOpen(false)
        setCommandOpen(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setMobileMenuOpen])

  /* Close dropdown on click outside */
  useEffect(() => {
    if (!openDropdown) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-nav-area]') && !target.closest('[data-mega-menu]')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [openDropdown])

  /* Hover handlers with delay */
  const handleDropdownEnter = useCallback((menu: DropdownType) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setOpenDropdown(menu)
  }, [])

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 500)
  }, [])

  return (
    <>
      {/* ─── Floating Pill Header ─── */}
      <motion.header
        className="fixed z-50 left-3 right-3 sm:left-4 sm:right-4"
        style={{ top: scrolled ? 8 : 12 }}
        animate={{
          height: scrolled ? 52 : 56,
        }}
        transition={{ duration: 0.35, ease: smoothEase }}
        data-nav-area
      >
        <motion.div
          className="w-full h-full rounded-2xl flex items-center justify-between px-3 sm:px-4 lg:px-5 relative overflow-hidden"
          style={{
            background: scrolled
              ? 'color-mix(in srgb, var(--card) 92%, transparent)'
              : 'color-mix(in srgb, var(--card) 80%, transparent)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid var(--border)',
            boxShadow: scrolled
              ? '0 8px 32px -8px rgba(0,0,0,0.18), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 6%, transparent)'
              : '0 4px 16px -4px rgba(0,0,0,0.08)',
          }}
          animate={{
            boxShadow: scrolled
              ? '0 8px 32px -8px rgba(0,0,0,0.18), 0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 6%, transparent)'
              : '0 4px 16px -4px rgba(0,0,0,0.08)',
          }}
          transition={{ duration: 0.35, ease: smoothEase }}
        >
          {/* Subtle gradient border glow at bottom */}
          <div
            className="absolute bottom-0 left-4 right-4 h-px transition-opacity duration-500 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--gg-vermillion), var(--gg-amber), transparent)',
              opacity: scrolled ? 0.3 : 0,
            }}
          />

          {/* Logo */}
          <div className="shrink-0">
            <Logo onClick={() => navigate('landing')} />
          </div>

          {/* ─── Desktop Navigation ─── */}
          {/* Links are loaded dynamically from the admin Link Manager
              (nav_links JSON array in SiteSetting). Falls back to
              FALLBACK_NAV_LINKS on any failure. Each link is mapped to
              the right NavLink variant — dropdown-wrapped for the four
              mega-menu pages, ERP-styled for /erp/[slug] entries, plain
              for everything else. */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
            {navLinks.map((link) => {
              const { view, slug } = hrefToView(link.href)
              const dropdownType = hrefToDropdown(link.href)
              const hasDropdown = dropdownType !== null

              // Active-state: products also lights up on erp-detail pages,
              // industries on industry-detail pages.
              let active = isActive(view)
              if (view === 'products') active = active || isActive('erp-detail')
              if (view === 'industries') active = active || isActive('industry-detail')

              // Badge: "21" count on the Products entry (preserves the
              // pre-wire look), ERP badge (LIVE/NEW) on /erp/[slug] entries.
              let badgeNode: React.ReactNode = null
              if (view === 'products') {
                badgeNode = (
                  <span className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[var(--gg-vermillion)]/15 to-[var(--gg-amber)]/15 text-[var(--gg-vermillion)] border border-[var(--gg-vermillion)]/20 leading-none">
                    {PRODUCTS_ITEMS.length}
                  </span>
                )
              } else if (view === 'erp-detail' && slug) {
                const erp = PRODUCTS_ITEMS.find((p) => p.slug === slug)
                if (erp?.badge) {
                  badgeNode = (
                    <span className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[var(--gg-vermillion)]/15 to-[var(--gg-amber)]/15 text-[var(--gg-vermillion)] border border-[var(--gg-vermillion)]/20 leading-none">
                      {erp.badge}
                    </span>
                  )
                }
              }

              // Icon: render for the Ecosystem/home entry (matches the
              // pre-wire header look) and for ERP product entries (use the
              // ERP's own icon + color so a top-level /erp/apparelflow nav
              // link looks consistent with the mega-menu tiles).
              const isHome = view === 'home'
              const isErp = view === 'erp-detail' && !!slug
              const showIcon = isHome || isErp
              const IconComp = isErp
                ? (PRODUCTS_ITEMS.find((p) => p.slug === slug)?.icon || lookupIcon(link.icon))
                : lookupIcon(link.icon)
              const iconColor = isErp
                ? erpColorHex(PRODUCTS_ITEMS.find((p) => p.slug === slug)?.color)
                : undefined

              const inner = (
                <>
                  {showIcon && (
                    <IconComp
                      className="w-3.5 h-3.5 mr-1"
                      style={iconColor ? { color: iconColor } : undefined}
                    />
                  )}
                  {link.label}
                </>
              )

              if (hasDropdown && dropdownType) {
                return (
                  <div
                    key={link.id}
                    onMouseEnter={() => handleDropdownEnter(dropdownType)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <NavLink
                      isActive={active}
                      onClick={() => navigate(view, slug)}
                      hasDropdown
                      isOpen={openDropdown === dropdownType}
                      badge={badgeNode}
                    >
                      {inner}
                    </NavLink>
                  </div>
                )
              }

              return (
                <NavLink
                  key={link.id}
                  isActive={active}
                  onClick={() => navigate(view, slug)}
                  badge={badgeNode}
                >
                  {inner}
                </NavLink>
              )
            })}
          </nav>

          {/* ─── Right Side Actions ─── */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {/* Search / Command Palette */}
            {showSearch && (
              <button
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-2 h-8 px-3 rounded-full border border-border/50 bg-foreground/3 text-muted-foreground hover:text-foreground hover:border-[var(--gg-vermillion)]/25 transition-all duration-200 text-[13px]"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[12px]">Search</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-foreground/50 bg-secondary/60 border border-border/40 rounded-md px-1.5 py-px font-mono ml-1">
                  ⌘K
                </kbd>
              </button>
            )}

            {showThemeToggle && <ThemeToggle />}

            {/* Sign In Button */}
            <Button
              size="sm"
              className="font-semibold rounded-full px-4 h-8 text-white hover:opacity-90 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
              onClick={() => navigate('signin')}
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Sign In
            </Button>
          </div>

          {/* ─── Mobile Actions ─── */}
          <div className="flex lg:hidden items-center gap-1 shrink-0">
            <button
              onClick={() => setCommandOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/6 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-foreground/6 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 h-[1.5px] bg-foreground rounded-full transition-all duration-300 ${mobileMenuOpen ? 'top-[9px] w-5 rotate-45' : 'top-[5px] w-5'}`} />
                <span className={`absolute left-0 h-[1.5px] bg-foreground rounded-full transition-all duration-300 ${mobileMenuOpen ? 'top-[9px] w-5 -rotate-45' : 'top-[13px] w-3.5'}`} />
              </div>
            </button>
          </div>
        </motion.div>
      </motion.header>

      {/* ─── Mega Menus (rendered outside header to avoid overflow clipping) ─── */}
      <div data-mega-menu>
        <ProductsMegaMenu
          isOpen={openDropdown === 'products'}
          onItemClick={handleDropdownClick}
          onViewAll={() => navigate('products')}
          onMouseEnter={() => handleDropdownEnter('products')}
          onMouseLeave={handleDropdownLeave}
        />
        <SolutionsMegaMenu
          isOpen={openDropdown === 'solutions'}
          onItemClick={handleDropdownClick}
          onViewAll={() => navigate('solutions')}
          onMouseEnter={() => handleDropdownEnter('solutions')}
          onMouseLeave={handleDropdownLeave}
        />
        <IndustriesMegaMenu
          isOpen={openDropdown === 'industries'}
          onItemClick={handleDropdownClick}
          onViewAll={() => navigate('industries')}
          onMouseEnter={() => handleDropdownEnter('industries')}
          onMouseLeave={handleDropdownLeave}
        />
        <PricingMegaMenu
          isOpen={openDropdown === 'pricing'}
          onItemClick={handleDropdownClick}
          onViewAll={() => navigate('pricing')}
          onMouseEnter={() => handleDropdownEnter('pricing')}
          onMouseLeave={handleDropdownLeave}
        />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={navigate}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
      />
    </>
  )
}
