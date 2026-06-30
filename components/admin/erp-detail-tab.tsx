'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shirt, Hotel, GraduationCap, Plane, Pill, UtensilsCrossed, HardHat, Heart,
  Palette, ShoppingCart, Factory, Truck, Droplets, Ship, Wheat, Landmark,
  Users, DollarSign, KeyRound, ArrowLeft, CheckCircle2, XCircle, Clock,
  Package, AlertCircle, Database, ShoppingBag, Warehouse, Scissors,
  BarChart3, TruckIcon, FileText, CreditCard, UserCheck, BoxesIcon,
  BedDouble, CalendarDays, UserRound, Utensils, Sparkles, Building2,
  BookOpen, School, ClipboardList, Home, DoorOpen, Wrench, Cog, Gauge,
  TextCursorInput, Route, Zap, Fuel,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─── Icon mapping ───────────────────────────────────────────────────────────
const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  hotel: Hotel,
  graduation: GraduationCap,
  plane: Plane,
  pill: Pill,
  utensils: UtensilsCrossed,
  hardhat: HardHat,
  heart: Heart,
  palette: Palette,
  shopping: ShoppingCart,
  factory: Factory,
  truck: Truck,
  droplets: Droplets,
  ship: Ship,
  wheat: Wheat,
  landmark: Landmark,
  building: Building2,
  wrench: Wrench,
  textcursor: TextCursorInput,
  route: Route,
  zap: Zap,
  'book-open': BookOpen,
  fuel: Fuel,
}

function ErpIcon({ icon, className }: { icon: string; className?: string }) {
  const Comp = iconComponentMap[icon] || Package
  return <Comp className={className || 'w-8 h-8'} />
}

// ─── Color mapping ──────────────────────────────────────────────────────────
const colorMap: Record<string, { text: string; bg: string; border: string; gradient: string }> = {
  cyan:    { text: 'text-[var(--gg-teal)]',    bg: 'bg-[var(--gg-teal)]/10',    border: 'border-[var(--gg-teal)]/20',    gradient: 'from-[var(--gg-teal)]/20 to-[var(--gg-teal)]/5' },
  amber:   { text: 'text-[var(--gg-amber)]',   bg: 'bg-[var(--gg-amber)]/10',   border: 'border-[var(--gg-amber)]/20',   gradient: 'from-[var(--gg-amber)]/20 to-[var(--gg-amber)]/5' },
  violet:  { text: 'text-[var(--gg-violet)]',  bg: 'bg-[var(--gg-violet)]/10',  border: 'border-[var(--gg-violet)]/20',  gradient: 'from-[var(--gg-violet)]/20 to-[var(--gg-violet)]/5' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', gradient: 'from-emerald-500/20 to-emerald-500/5' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    gradient: 'from-rose-500/20 to-rose-500/5' },
  orange:  { text: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  gradient: 'from-orange-500/20 to-orange-500/5' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    gradient: 'from-blue-500/20 to-blue-500/5' },
  teal:    { text: 'text-teal-400',    bg: 'bg-teal-400/10',    border: 'border-teal-400/20',    gradient: 'from-teal-500/20 to-teal-500/5' },
  pink:    { text: 'text-pink-400',    bg: 'bg-pink-400/10',    border: 'border-pink-400/20',    gradient: 'from-pink-500/20 to-pink-500/5' },
  indigo:  { text: 'text-indigo-400',  bg: 'bg-indigo-400/10',  border: 'border-indigo-400/20',  gradient: 'from-indigo-500/20 to-indigo-500/5' },
  lime:    { text: 'text-lime-400',    bg: 'bg-lime-400/10',    border: 'border-lime-400/20',    gradient: 'from-lime-500/20 to-lime-500/5' },
  foodflow: { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/20', gradient: 'from-orange-500 to-amber-500' },
  sky:     { text: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/20',     gradient: 'from-sky-500/20 to-sky-500/5' },
  fuchsia: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20', gradient: 'from-fuchsia-500/20 to-fuchsia-500/5' },
  red:     { text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     gradient: 'from-red-500/20 to-red-500/5' },
  green:   { text: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/20',   gradient: 'from-green-500/20 to-green-500/5' },
  yellow:  { text: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/20',  gradient: 'from-yellow-500/20 to-yellow-500/5' },
}

const defaultColor = colorMap.teal

// ─── API types ──────────────────────────────────────────────────────────────
interface Module {
  id: string
  name: string
  slug: string
  description: string
  category: string | null
  price: number
  isActive: boolean
}

interface RecentClient {
  id: string
  companyName: string
  status: string
  licenseType: string | null
}

interface ErpData {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  status: string
  version: string
  website: string | null
  industry: string
  modules: Module[]
  clientCount: number
  revenue: number
  licenseCount: number
  recentClients: RecentClient[]
}

// ─── ApparelFlow Live Stats Types ───────────────────────────────────────────
interface AfClientCompany {
  id: string
  companyName: string
  adminEmail: string
  licenseType: string
  licenseStatus: string
  serialKey: string
  isActive: boolean
  databaseStatus: string | null
  industry: string | null
  maxUsers: number
  maxShops: number
  selectedModules: string | null
  createdAt: string
}

interface AfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    clientsByLicense: { licenseType: string; count: number }[]
    clientCompanies: AfClientCompany[]
  }
  tenants: {
    totalInventoryItems: number
    totalCustomers: number
    totalSalesOrders: number
    totalRevenue: number
    totalEmployees: number
    totalRetailShops: number
    totalProductionOrders: number
    totalWarehouses: number
    totalSuppliers: number
    totalPOSSales: number
    totalWholesaleOrders: number
    totalPurchaseOrders: number
    totalRawMaterials: number
    totalLeads: number
    tenantCount: number
  }
}

// ─── HotelFlow Live Stats Types ────────────────────────────────────────────
interface HfClientCompany {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  serialKey: string
  plan: string
  status: string
  monthlyFee: number
  maxProperties: number
  maxRooms: number
  maxUsers: number
  createdAt: string
}

interface HfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    activeTenants: number
    clientsByPlan: { plan: string; count: number }[]
    clientCompanies: HfClientCompany[]
  }
  operations: {
    properties: number
    rooms: number
    reservations: number
    guests: number
    staff: number
    events: number
    posOrders: number
    housekeepingTasks: number
    inventoryItems: number
  }
  snapshot: {
    occupancyRate: number
    adr: number
    revpar: number
    totalRevenue: number
    roomRevenue: number
    fbRevenue: number
  } | null
}

// ─── EduFlow Live Stats Types ──────────────────────────────────────────────
interface EfClientCompany {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  status: string
  createdAt: string
}

interface EfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    activeTenants: number
    totalSerialKeys: number
    activeSerialKeys: number
    clientsByPlan: { plan: string; count: number }[]
    clientCompanies: EfClientCompany[]
  }
  academics: {
    schools: number
    students: number
    teachers: number
    staff: number
    courses: number
    classes: number
    exams: number
    admissions: number
    alumni: number
    scholarships: number
  }
  finance: {
    feePayments: number
    feeRevenue: number
  }
  resources: {
    libraryBooks: number
    hostels: number
    transportRoutes: number
  }
}

// ─── MartFlow Live Stats Types ──────────────────────────────────────────────
interface MfClientCompany {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  email: string | null
  phone: string | null
  city: string | null
  country: string | null
  businessType: string | null
  maxBranches: number
  maxUsers: number
  maxProducts: number
  dbStatus: string | null
  totalPaid: number
  outstandingAmount: number
  contactPerson: string | null
  contactEmail: string | null
  createdAt: string
}

interface MfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    totalPackages: number
    clientsByPlan: { plan: string; count: number }[]
    clientCompanies: MfClientCompany[]
    serialKeys: { id: string; key: string; status: string; type: string; packageName: string | null; maxActivations: number; currentActivations: number; activatedAt: string | null; expiresAt: string | null; createdAt: string }[]
    packages: { id: string; name: string; slug: string; monthlyPrice: number; yearlyPrice: number; isPopular: boolean; maxBranches: number; maxUsers: number; maxProducts: number }[]
  }
  operations: {
    products: number
    customers: number
    salesOrders: number
    revenue: number
    branches: number
    warehouses: number
    suppliers: number
    posSales: number
    purchaseOrders: number
    employees: number
    tenantCount: number
  }
}

// ─── PharmaFlow Live Stats Types ──────────────────────────────────────────
interface PfClientCompany {
  id: string
  businessName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string | null
  city: string | null
  country: string | null
  status: string
  businessType: string | null
  maxBranches: number
  maxUsers: number
  maxDevices: number
  maxProducts: number
  verificationStatus: string
  registeredAt: string
  createdAt: string
}

interface PfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    totalPlans: number
    clientsByType: { businessType: string; count: number }[]
    clientCompanies: PfClientCompany[]
    serialKeys: { id: string; key: string; keyType: string; status: string; maxActivations: number; activationCount: number; businessName: string | null; activatedAt: string | null; expiresAt: string | null; createdAt: string }[]
    subscriptionPlans: { id: string; name: string; slug: string; monthlyPrice: number; yearlyPrice: number; maxBranches: number; maxUsers: number; maxDevices: number; maxProducts: number }[]
  }
  operations: {
    medicines: number
    customers: number
    sales: number
    revenue: number
    branches: number
    suppliers: number
    employees: number
    prescriptions: number
    purchaseOrders: number
    inventory: number
    tenantCount: number
  }
}

// ─── BuildFlow Live Stats Types ────────────────────────────────────────────
interface BfClientCompany {
  id: string
  serialNumber: string | null
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  city: string | null
  country: string | null
  planType: string | null
  status: string | null
  isActive: boolean
  maxUsers: number
  maxProjects: number
  currentUsers: number
  currentProjects: number
  databaseStatus: string | null
  adminEmail: string | null
  createdAt: string
}

interface BfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    totalPlans: number
    clientsByPlan: { plan: string; count: number }[]
    clientsByType: { businessType: string; count: number }[]
    clientCompanies: BfClientCompany[]
    serialKeys: { id: string; key: string; status: string; businessName: string | null; issuedAt: string | null; expiresAt: string | null; createdAt: string }[]
    subscriptionPlans: { id: string; name: string; slug: string; monthlyPrice: number; yearlyPrice: number; maxProperties: number; maxUsers: number; maxDevices: number }[]
  }
  operations: {
    properties: number
    units: number
    tenants: number
    projects: number
    housingSchemes: number
    contractors: number
    employees: number
    revenue: number
    maintenanceTickets: number
    suppliers: number
    tenantCount: number
  }
}

// ─── TravelFlow Live Stats Types ──────────────────────────────────────────
interface TfClientCompany {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  country: string | null
  city: string | null
  licenseKey: string
  licenseType: string
  licenseStatus: string
  maxPilgrims: number
  maxBranches: number
  maxStaff: number
  features: string | null
  salePrice: number
  currency: string
  paymentStatus: string
  billingCycle: string
  tenantId: string | null
  status: string
  createdAt: string
}

interface TfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    totalPlans: number
    clientsByPlan: { plan: string; count: number }[]
    clientCompanies: TfClientCompany[]
    serialKeys: { id: string; key: string; keyType: string; status: string; label: string | null; maxDevices: number; deviceCount: number; companyName: string | null; expiresAt: string | null; createdAt: string }[]
    subscriptionPlans: { id: string; name: string; slug: string; monthlyPrice: number; yearlyPrice: number; maxPilgrims: number; maxBranches: number; maxStaff: number; maxDevices: number; isPopular: boolean }[]
  }
  operations: {
    pilgrims: number
    bookings: number
    packages: number
    flightBookings: number
    hotels: number
    groups: number
    internationalTravels: number
    suppliers: number
    transports: number
    visaApplications: number
    crmLeads: number
    branches: number
    staff: number
    tenants: number
    tenantCount: number
  }
}

// ─── TenantFlow Live Stats Types ──────────────────────────────────────────
interface TnfClientCompany {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string
  status: string
  plan: string
  billingCycle: string
  monthlyFee: number
  setupFee: number
  maxProperties: number
  maxUsers: number
  maxDevices: number
  dbStatus: string
  features: string | null
  industry: string | null
  companySize: string | null
  website: string | null
  customDomain: string | null
  createdAt: string
}

interface TnfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalLicenseKeys: number
    activeLicenseKeys: number
    totalWorkspaces: number
    clientsByPlan: { plan: string; count: number }[]
    clientsByType: { businessType: string; count: number }[]
    clientCompanies: TnfClientCompany[]
    licenseKeys: { id: string; key: string; type: string; plan: string; status: string; maxDevices: number; maxUsers: number; companyName: string | null; activatedAt: string | null; expiresAt: string | null; createdAt: string }[]
    subscriptionPlans: { id: string; name: string; slug: string; monthlyPrice: number; yearlyPrice: number; maxProperties: number; maxUsers: number; maxDevices: number }[]
  }
  operations: {
    properties: number
    units: number
    tenants: number
    leases: number
    payments: number
    maintenanceTickets: number
    vendors: number
    employees: number
    revenue: number
    tenantCount: number
  }
}

// ─── FactoryFlow Live Stats Types ──────────────────────────────────────────
interface FfClientCompany {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  status: string
  billingCycle: string
  serialKey: string | null
  maxDevices: number
  maxUsers: number
  activatedAt: string | null
  notes: string | null
  createdAt: string
}

interface FfLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    totalPackages: number
    clientsByPlan: { plan: string; count: number }[]
    clientCompanies: FfClientCompany[]
    serialKeys: { id: string; key: string; status: string; maxDevices: number; activatedDevices: number; companyName: string | null; activatedAt: string | null; expiresAt: string | null; createdAt: string }[]
    packages: { id: string; name: string; priceMonthly: number; priceYearly: number; maxFactories: number; maxUsers: number; maxDevices: number; maxWarehouses: number; isActive: boolean; sortOrder: number }[]
    packageModules: { moduleKey: string; moduleName: string; included_count: number; premium_count: number }[]
  }
}

// ─── FoodFlow Live Stats Types ──────────────────────────────────────────
interface FoodFClientCompany {
  id: string
  businessName: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string | null
  city: string | null
  country: string | null
  status: string
  isActive: boolean
  maxBranches: number
  maxUsers: number
  billingCycle: string
  createdAt: string
}

interface FoodFLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    clientsByPlan: { plan: string; count: number }[]
    clientCompanies: FoodFClientCompany[]
    serialKeys: { id: string; key: string; status: string; maxActivations: number; currentActivations: number; businessName: string | null; activatedAt: string | null; expiresAt: string | null; createdAt: string }[]
  }
}

// ─── AutoFlow Live Stats Types ──────────────────────────────────────────
interface AutoFClientCompany {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  status: string
  plan: string | null
  billingCycle: string | null
  serialKey: string | null
  maxDevices: number
  maxUsers: number
  createdAt: string
}

interface AutoFLiveStats {
  connected: boolean
  mainDb: {
    totalClients: number
    activeClients: number
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalDevices: number
    activeDevices: number
    totalSerialKeys: number
    activeSerialKeys: number
    clientCompanies: AutoFClientCompany[]
    serialKeys: { id: string; key: string; status: string; maxActivations: number; currentActivations: number; companyName: string | null; activatedAt: string | null; expiresAt: string | null; createdAt: string }[]
  }
  operations: {
    vehicles: number
    serviceOrders: number
    inventoryItems: number
    suppliers: number
    purchaseOrders: number
    employees: number
    revenue: number
    tenants: number
  }
}

// ─── ElectroFlow Live Stats Types ──────────────────────────────────────────
interface ElFLiveStats {
  connected: boolean
  core: {
    tenants: number
    branches: number
    employees: number
    users: number
  }
  sales: {
    totalOrders: number
    totalRevenue: number
    totalPaid: number
    outstanding: number
    salesByType: { type: string; count: number; revenue: number }[]
    salesByMonth: { month: string; count: number; revenue: number }[]
    recentSales: { invoiceNumber: string; totalAmount: number; saleType: string; status: string; customerName: string | null; createdAt: string }[]
  }
  customers: { total: number }
  products: { total: number; categories: number; topProducts: { name: string; salePrice: number; totalSold: number; totalRevenue: number }[]; totalStock: number; lowStock: number }
  installments: { active: number; completed: number; overduePayments: number; financedAmount: number }
  procurement: { purchaseOrders: number; suppliers: number }
  service: { total: number; open: number }
  delivery: { total: number; pending: number }
  expenses: { total: number }
  branches: { name: string; code: string; city: string | null; isActive: boolean; salesCount: number; revenue: number }[]
}

interface ErpDetailTabProps {
  erpId: string
  name: string
  onBack?: () => void
}

// ─── Format helper ──────────────────────────────────────────────────────────
function formatPKR(n: number): string {
  return `PKR ${n.toLocaleString('en-PK')}`
}

// ─── Stat card for live data ────────────────────────────────────────────────
function LiveStatCard({
  icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${color}/10 flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────
export function ErpDetailTab({ erpId, name, onBack }: ErpDetailTabProps) {
  const [data, setData] = useState<ErpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ApparelFlow live stats
  const [afStats, setAfStats] = useState<AfLiveStats | null>(null)
  const [afLoading, setAfLoading] = useState(false)
  const [afError, setAfError] = useState<string | null>(null)

  // HotelFlow live stats
  const [hfStats, setHfStats] = useState<HfLiveStats | null>(null)
  const [hfLoading, setHfLoading] = useState(false)
  const [hfError, setHfError] = useState<string | null>(null)

  // EduFlow live stats
  const [efStats, setEfStats] = useState<EfLiveStats | null>(null)
  const [efLoading, setEfLoading] = useState(false)
  const [efError, setEfError] = useState<string | null>(null)

  // MartFlow live stats
  const [mfStats, setMfStats] = useState<MfLiveStats | null>(null)
  const [mfLoading, setMfLoading] = useState(false)
  const [mfError, setMfError] = useState<string | null>(null)

  // PharmaFlow live stats
  const [pfStats, setPfStats] = useState<PfLiveStats | null>(null)
  const [pfLoading, setPfLoading] = useState(false)
  const [pfError, setPfError] = useState<string | null>(null)

  // BuildFlow live stats
  const [bfStats, setBfStats] = useState<BfLiveStats | null>(null)
  const [bfLoading, setBfLoading] = useState(false)
  const [bfError, setBfError] = useState<string | null>(null)

  // TravelFlow live stats
  const [tfStats, setTfStats] = useState<TfLiveStats | null>(null)
  const [tfLoading, setTfLoading] = useState(false)
  const [tfError, setTfError] = useState<string | null>(null)

  // TenantFlow live stats
  const [tnfStats, setTnfStats] = useState<TnfLiveStats | null>(null)
  const [tnfLoading, setTnfLoading] = useState(false)
  const [tnfError, setTnfError] = useState<string | null>(null)

  // FactoryFlow live stats
  const [ffStats, setFfStats] = useState<FfLiveStats | null>(null)
  const [ffLoading, setFfLoading] = useState(false)
  const [ffError, setFfError] = useState<string | null>(null)

  // FoodFlow live stats
  const [foodFStats, setFoodFStats] = useState<FoodFLiveStats | null>(null)
  const [foodFLoading, setFoodFLoading] = useState(false)
  const [foodFError, setFoodFError] = useState<string | null>(null)

  // AutoFlow live stats
  const [autoFStats, setAutoFStats] = useState<AutoFLiveStats | null>(null)
  const [autoFLoading, setAutoFLoading] = useState(false)
  const [autoFError, setAutoFError] = useState<string | null>(null)

  // ElectroFlow live stats
  const [elfStats, setElfStats] = useState<ElFLiveStats | null>(null)
  const [elfLoading, setElfLoading] = useState(false)
  const [elfError, setElfError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/erp/${erpId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch ERP details')
        return res.json()
      })
      .then((d: ErpData) => {
        if (!cancelled) setData(d)
        // If this is ApparelFlow, fetch live stats
        if (d.slug === 'apparelflow' && d.status === 'active') {
          setAfLoading(true)
          fetch('/api/erp/apparelflow/stats')
            .then((r) => r.json())
            .then((stats: AfLiveStats) => {
              if (!cancelled) setAfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setAfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setAfLoading(false)
            })
        }
        // If this is HotelFlow, fetch live stats
        if (d.slug === 'hotelflow' && d.status === 'active') {
          setHfLoading(true)
          fetch('/api/erp/hotelflow/stats')
            .then((r) => r.json())
            .then((stats: HfLiveStats) => {
              if (!cancelled) setHfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setHfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setHfLoading(false)
            })
        }
        // If this is EduFlow, fetch live stats
        if (d.slug === 'eduflow' && d.status === 'active') {
          setEfLoading(true)
          fetch('/api/erp/eduflow/stats')
            .then((r) => r.json())
            .then((stats: EfLiveStats) => {
              if (!cancelled) setEfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setEfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setEfLoading(false)
            })
        }
        // If this is MartFlow, fetch live stats
        if (d.slug === 'martflow' && d.status === 'active') {
          setMfLoading(true)
          fetch('/api/erp/martflow/stats')
            .then((r) => r.json())
            .then((stats: MfLiveStats) => {
              if (!cancelled) setMfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setMfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setMfLoading(false)
            })
        }
        // If this is PharmaFlow, fetch live stats
        if (d.slug === 'pharmaflow' && d.status === 'active') {
          setPfLoading(true)
          fetch('/api/erp/pharmaflow/stats')
            .then((r) => r.json())
            .then((stats: PfLiveStats) => {
              if (!cancelled) setPfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setPfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setPfLoading(false)
            })
        }
        // If this is BuildFlow, fetch live stats
        if (d.slug === 'buildflow' && d.status === 'active') {
          setBfLoading(true)
          fetch('/api/erp/buildflow/stats')
            .then((r) => r.json())
            .then((stats: BfLiveStats) => {
              if (!cancelled) setBfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setBfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setBfLoading(false)
            })
        }
        // If this is TravelFlow, fetch live stats
        if (d.slug === 'travelflow' && d.status === 'active') {
          setTfLoading(true)
          fetch('/api/erp/travelflow/stats')
            .then((r) => r.json())
            .then((stats: TfLiveStats) => {
              if (!cancelled) setTfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setTfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setTfLoading(false)
            })
        }
        // If this is TenantFlow, fetch live stats
        if (d.slug === 'tenantflow' && d.status === 'active') {
          setTnfLoading(true)
          fetch('/api/erp/tenantflow/stats')
            .then((r) => r.json())
            .then((stats: TnfLiveStats) => {
              if (!cancelled) setTnfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setTnfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setTnfLoading(false)
            })
        }
        // If this is FactoryFlow, fetch live stats
        if (d.slug === 'factoryflow' && d.status === 'active') {
          setFfLoading(true)
          fetch('/api/erp/factoryflow/stats')
            .then((r) => r.json())
            .then((stats: FfLiveStats) => {
              if (!cancelled) setFfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setFfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setFfLoading(false)
            })
        }
        // If this is FoodFlow, fetch live stats
        if (d.slug === 'foodflow' && d.status === 'active') {
          setFoodFLoading(true)
          fetch('/api/erp/foodflow/stats')
            .then((r) => r.json())
            .then((stats: FoodFLiveStats) => {
              if (!cancelled) setFoodFStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setFoodFError(err.message)
            })
            .finally(() => {
              if (!cancelled) setFoodFLoading(false)
            })
        }
        // If this is AutoFlow, fetch live stats
        if (d.slug === 'autoflow' && d.status === 'active') {
          setAutoFLoading(true)
          fetch('/api/erp/autoflow/stats')
            .then((r) => r.json())
            .then((stats: AutoFLiveStats) => {
              if (!cancelled) setAutoFStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setAutoFError(err.message)
            })
            .finally(() => {
              if (!cancelled) setAutoFLoading(false)
            })
        }
        // If this is ElectroFlow, fetch live stats
        if (d.slug === 'electroflow' && d.status === 'active') {
          setElfLoading(true)
          fetch('/api/erp/electroflow/stats')
            .then((r) => r.json())
            .then((stats: ElFLiveStats) => {
              if (!cancelled) setElfStats(stats)
            })
            .catch((err) => {
              if (!cancelled) setElfError(err.message)
            })
            .finally(() => {
              if (!cancelled) setElfLoading(false)
            })
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [erpId])

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl bg-card" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-card" />
      </div>
    )
  }

  // ── Error state ──
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load ERP</h3>
        <p className="text-sm text-muted-foreground mb-4">{error || 'No data available'}</p>
        <Button
          variant="outline"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  const colors = colorMap[data.slug === 'foodflow' ? 'foodflow' : data.color] || defaultColor
  const isComingSoon = data.status === 'coming_soon'
  const isApparelFlow = data.slug === 'apparelflow' && data.status === 'active'
  const isHotelFlow = data.slug === 'hotelflow' && data.status === 'active'
  const isEduFlow = data.slug === 'eduflow' && data.status === 'active'
  const isMartFlow = data.slug === 'martflow' && data.status === 'active'
  const isPharmaFlow = data.slug === 'pharmaflow' && data.status === 'active'
  const isBuildFlow = data.slug === 'buildflow' && data.status === 'active'
  const isTravelFlow = data.slug === 'travelflow' && data.status === 'active'
  const isTenantFlow = data.slug === 'tenantflow' && data.status === 'active'
  const isFactoryFlow = data.slug === 'factoryflow' && data.status === 'active'
  const isFoodFlow = data.slug === 'foodflow' && data.status === 'active'
  const isAutoFlow = data.slug === 'autoflow' && data.status === 'active'
  const isElectroFlow = data.slug === 'electroflow' && data.status === 'active'

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative bg-card/90 backdrop-blur border border-border rounded-2xl p-6 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50 pointer-events-none`} />
        <div className="relative">
          <div className="flex items-start gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary -ml-2 mt-1"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <ErpIcon icon={data.icon} className={`w-8 h-8 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{data.name}</h2>
                {isComingSoon ? (
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    Coming Soon
                  </Badge>
                ) : (
                  <Badge className={`${colors.bg} ${colors.text} ${colors.border} px-3 py-0.5 text-xs font-semibold`}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
                <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                  v{data.version}
                </Badge>
                {isApparelFlow && afStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isHotelFlow && hfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isEduFlow && efStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isMartFlow && mfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isPharmaFlow && pfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isBuildFlow && bfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isTravelFlow && tfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isTenantFlow && tnfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isFactoryFlow && ffStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isFoodFlow && foodFStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isAutoFlow && autoFStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isElectroFlow && elfStats?.connected && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-0.5 text-xs font-semibold">
                    <Database className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.industry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Coming Soon placeholder ── */}
      {isComingSoon && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-amber-500/10 rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">This ERP is Under Development</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {data.name} for {data.industry} is currently being built. Stay tuned for updates on its release.
          </p>
          {data.modules.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              {data.modules.length} module{data.modules.length !== 1 ? 's' : ''} planned
            </p>
          )}
        </motion.div>
      )}

      {/* ── ApparelFlow Live Stats ── */}
      {isApparelFlow && (
        <>
          {/* Connection Status */}
          {afLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {afError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to ApparelFlow database: {afError}</span>
            </div>
          )}

          {afStats && !afLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Users className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Client Companies"
                  value={afStats.mainDb?.totalClients}
                  color="text-[var(--gg-teal)]"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={afStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-violet-400" />}
                  label="Total Users"
                  value={afStats.mainDb?.totalUsers}
                  color="text-violet-400"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-amber-400" />}
                  label="Tenant Databases"
                  value={afStats.tenants?.tenantCount}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Tenant Aggregate Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gg-teal)]/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[var(--gg-teal)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Live Tenant Data</h3>
                    <p className="text-xs text-muted-foreground">Aggregated across {afStats.tenants?.tenantCount} tenant database{afStats.tenants?.tenantCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Inventory</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalInventoryItems}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Customers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalCustomers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Sales Orders</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalSalesOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(afStats.tenants?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Employees</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalEmployees}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Retail Shops</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalRetailShops}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Scissors className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Production</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalProductionOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Warehouse className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Warehouses</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalWarehouses}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <TruckIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Suppliers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalSuppliers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-muted-foreground">POS Sales</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{afStats.tenants?.totalPOSSales}</p>
                  </div>
                </div>
              </motion.div>

              {/* License Distribution */}
              {afStats.mainDb?.clientsByLicense?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">License Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {afStats.mainDb?.clientsByLicense.map((item) => {
                      const licenseColors: Record<string, string> = {
                        basic: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      }
                      return (
                        <div key={item.licenseType} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${licenseColors[item.licenseType] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.licenseType}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {afStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Client Companies
                    <span className="text-sm font-normal text-muted-foreground ml-2">({afStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Email</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">License</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">DB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {afStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.adminEmail}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.licenseType === 'enterprise'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : client.licenseType === 'professional'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.licenseType}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <Badge
                                variant="secondary"
                                className={
                                  client.databaseStatus === 'ready'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }
                              >
                                {client.databaseStatus || 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── HotelFlow Live Stats ── */}
      {isHotelFlow && (
        <>
          {/* Connection Status */}
          {hfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {hfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to HotelFlow database: {hfError}</span>
            </div>
          )}

          {hfStats && !hfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Users className="w-4 h-4 text-violet-400" />}
                  label="Hotel Clients"
                  value={hfStats.mainDb?.totalClients}
                  color="text-violet-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={hfStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Total Users"
                  value={hfStats.mainDb?.totalUsers}
                  color="text-[var(--gg-teal)]"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-amber-400" />}
                  label="Active Tenants"
                  value={hfStats.mainDb?.activeTenants}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Revenue & Financial Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
                    <p className="text-xs text-muted-foreground">Revenue and billing from HotelFlow</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Total Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(hfStats.mainDb?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.mainDb?.totalInvoices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Active Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.mainDb?.activeDevices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Total Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.mainDb?.totalDevices}</p>
                  </div>
                </div>
              </motion.div>

              {/* Operational Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-400/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Operational Data</h3>
                    <p className="text-xs text-muted-foreground">Across all hotel properties</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Properties</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.properties}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BedDouble className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Rooms</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.rooms}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Reservations</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.reservations}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Guests</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.guests}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Staff</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.staff}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-muted-foreground">Events</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.events}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Utensils className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">POS Orders</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.posOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Inventory</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{hfStats.operations?.inventoryItems}</p>
                  </div>
                </div>

                {/* Occupancy Snapshot */}
                {hfStats.snapshot && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">Latest Occupancy Snapshot</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10 text-center">
                        <p className="text-sm font-bold text-violet-400">{hfStats.snapshot?.occupancyRate.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">Occupancy</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--gg-teal)]/5 border border-[var(--gg-teal)]/10 text-center">
                        <p className="text-sm font-bold text-[var(--gg-teal)]">{formatPKR(hfStats.snapshot?.adr)}</p>
                        <p className="text-[10px] text-muted-foreground">ADR</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                        <p className="text-sm font-bold text-emerald-400">{formatPKR(hfStats.snapshot?.revpar)}</p>
                        <p className="text-[10px] text-muted-foreground">RevPAR</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                        <p className="text-sm font-bold text-amber-400">{formatPKR(hfStats.snapshot?.totalRevenue)}</p>
                        <p className="text-[10px] text-muted-foreground">Day Revenue</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Plan Distribution */}
              {hfStats.mainDb?.clientsByPlan?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Plan Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {hfStats.mainDb?.clientsByPlan.map((item) => {
                      const planColors: Record<string, string> = {
                        starter: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      }
                      return (
                        <div key={item.plan} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${planColors[item.plan] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.plan}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {hfStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Hotel Clients
                    <span className="text-sm font-normal text-muted-foreground ml-2">({hfStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Contact</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Serial Key</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hfStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactPerson}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.plan === 'enterprise'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : client.plan === 'professional'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.plan}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{client.serialKey}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── EduFlow Live Stats ── */}
      {isEduFlow && (
        <>
          {/* Connection Status */}
          {efLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {efError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to EduFlow database: {efError}</span>
            </div>
          )}

          {efStats && !efLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<GraduationCap className="w-4 h-4 text-emerald-400" />}
                  label="Client Institutions"
                  value={efStats.mainDb?.totalClients}
                  color="text-emerald-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={efStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Total Users"
                  value={efStats.mainDb?.totalUsers}
                  color="text-[var(--gg-teal)]"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-amber-400" />}
                  label="Active Tenants"
                  value={efStats.mainDb?.activeTenants}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Academic Data */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Academic Data</h3>
                    <p className="text-xs text-muted-foreground">Across all educational institutions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <School className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Schools</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.schools}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Students</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.students}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Teachers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.teachers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Staff</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.staff}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Courses</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.courses}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Classes</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.classes}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-muted-foreground">Exams</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.exams}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserRound className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Admissions</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.admissions}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Alumni</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.alumni}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Scholarships</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.academics?.scholarships}</p>
                  </div>
                </div>
              </motion.div>

              {/* Financial Overview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
                    <p className="text-xs text-muted-foreground">Revenue and billing from EduFlow</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Total Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(efStats.mainDb?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.mainDb?.totalInvoices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Fee Payments</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.finance?.feePayments}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Fee Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(efStats.finance?.feeRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Active Serial Keys</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.mainDb?.activeSerialKeys}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-muted-foreground">Total Serial Keys</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.mainDb?.totalSerialKeys}</p>
                  </div>
                </div>
              </motion.div>

              {/* Resources */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Resources</h3>
                    <p className="text-xs text-muted-foreground">Library, hostel and transport data</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Library Books</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.resources?.libraryBooks}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Hostels</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.resources?.hostels}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <TruckIcon className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Transport Routes</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{efStats.resources?.transportRoutes}</p>
                  </div>
                </div>
              </motion.div>

              {/* Plan Distribution */}
              {efStats.mainDb?.clientsByPlan?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Plan Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {efStats.mainDb?.clientsByPlan.map((item) => {
                      const planColors: Record<string, string> = {
                        starter: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      }
                      return (
                        <div key={item.plan} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${planColors[item.plan] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.plan}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Institutions Table */}
              {efStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Client Institutions
                    <span className="text-sm font-normal text-muted-foreground ml-2">({efStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Contact</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">City</th>
                        </tr>
                      </thead>
                      <tbody>
                        {efStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactPerson}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground hidden md:table-cell">{client.city || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── MartFlow Live Stats ── */}
      {isMartFlow && (
        <>
          {/* Connection Status */}
          {mfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {mfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to MartFlow database: {mfError}</span>
            </div>
          )}

          {mfStats && !mfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<ShoppingCart className="w-4 h-4 text-yellow-400" />}
                  label="Retail Tenants"
                  value={mfStats.mainDb?.totalClients}
                  color="text-yellow-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={mfStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Platform Users"
                  value={mfStats.mainDb?.totalUsers}
                  color="text-[var(--gg-teal)]"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<KeyRound className="w-4 h-4 text-amber-400" />}
                  label="Serial Keys"
                  value={mfStats.mainDb?.totalSerialKeys}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Operational Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Operational Data</h3>
                    <p className="text-xs text-muted-foreground">Across {mfStats.operations?.tenantCount} tenant database{mfStats.operations?.tenantCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Products</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.products}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Customers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.customers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Sales Orders</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.salesOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(mfStats.operations?.revenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Branches</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.branches}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Warehouse className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Warehouses</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.warehouses}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <TruckIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Suppliers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.suppliers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">POS Sales</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.posSales}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Purchase Orders</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.purchaseOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Employees</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{mfStats.operations?.employees}</p>
                  </div>
                </div>
              </motion.div>

              {/* Plan Distribution */}
              {mfStats.mainDb?.clientsByPlan?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Plan Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {mfStats.mainDb?.clientsByPlan.map((item) => {
                      const planColors: Record<string, string> = {
                        STARTER: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        PROFESSIONAL: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        ENTERPRISE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      }
                      return (
                        <div key={item.plan} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${planColors[item.plan] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.plan}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Tenant Companies Table */}
              {mfStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Retail Tenants
                    <span className="text-sm font-normal text-muted-foreground ml-2">({mfStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Email</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">DB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mfStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.name}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactEmail || client.email || '\u2014'}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.plan === 'ENTERPRISE'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : client.plan === 'PROFESSIONAL'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.plan}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'TRIAL'
                                    ? 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <Badge
                                variant="secondary"
                                className={
                                  client.dbStatus === 'READY'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }
                              >
                                {client.dbStatus || 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── PharmaFlow Live Stats ── */}
      {isPharmaFlow && (
        <>
          {/* Connection Status */}
          {pfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {pfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to PharmaFlow database: {pfError}</span>
            </div>
          )}

          {pfStats && !pfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Pill className="w-4 h-4 text-red-400" />}
                  label="Pharma Clients"
                  value={pfStats.mainDb?.totalClients}
                  color="text-red-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={pfStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Platform Users"
                  value={pfStats.mainDb?.totalUsers}
                  color="text-[var(--gg-teal)]"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<KeyRound className="w-4 h-4 text-amber-400" />}
                  label="Serial Keys"
                  value={pfStats.mainDb?.totalSerialKeys}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Financial Overview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
                    <p className="text-xs text-muted-foreground">Revenue and billing from PharmaFlow</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Total Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(pfStats.mainDb?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.mainDb?.totalInvoices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Active Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.mainDb?.activeDevices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Active Keys</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.mainDb?.activeSerialKeys}</p>
                  </div>
                </div>
              </motion.div>

              {/* Operational Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Operational Data</h3>
                    <p className="text-xs text-muted-foreground">Across {pfStats.operations?.tenantCount} tenant database{pfStats.operations?.tenantCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-muted-foreground">Medicines</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.medicines}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Customers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.customers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Prescriptions</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.prescriptions}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(pfStats.operations?.revenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Branches</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.branches}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <TruckIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Suppliers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.suppliers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Employees</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.employees}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Sales</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.sales}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Purchase Orders</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.purchaseOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Inventory</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{pfStats.operations?.inventory}</p>
                  </div>
                </div>
              </motion.div>

              {/* Client Type Distribution */}
              {pfStats.mainDb?.clientsByType?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Client Type Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {pfStats.mainDb?.clientsByType.map((item) => {
                      const typeColors: Record<string, string> = {
                        pharmacy: 'bg-red-500/10 text-red-400 border-red-500/20',
                        clinic: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        hospital: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        restaurant: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        retail: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                        distributor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      }
                      return (
                        <div key={item.businessType} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${typeColors[item.businessType] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.businessType || 'Other'}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {pfStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Client Businesses
                    <span className="text-sm font-normal text-muted-foreground ml-2">({pfStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Business</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Contact</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Type</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pfStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.businessName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactPerson}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className="bg-red-500/10 text-red-400 border-red-500/20"
                              >
                                {client.businessType || 'Other'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <Badge
                                variant="secondary"
                                className={
                                  client.verificationStatus === 'verified'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }
                              >
                                {client.verificationStatus || 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Standard Stats (for non-connected active ERPs) ── */}
      {!isComingSoon && !isApparelFlow && !isHotelFlow && !isEduFlow && !isMartFlow && !isPharmaFlow && !isFactoryFlow && !isFoodFlow && !isAutoFlow && !isElectroFlow && (
        <div className="grid sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className={`w-5 h-5 ${colors.text}`} />
                <span className="text-sm text-muted-foreground">Clients</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{data.clientCount}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-muted-foreground">Revenue (PKR)</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{formatPKR(data.revenue)}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="w-5 h-5 text-violet-400" />
                <span className="text-sm text-muted-foreground">Licenses</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{data.licenseCount}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modules ── */}
      {!isComingSoon && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Modules
            <span className="text-sm font-normal text-muted-foreground ml-2">({data.modules.length})</span>
          </h3>

          {data.modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No modules configured yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.modules.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.03 }}
                  className={`relative bg-secondary border rounded-xl p-4 transition-colors ${
                    mod.isActive
                      ? 'border-border hover:border-border'
                      : 'border-border opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium text-foreground leading-tight">{mod.name}</h4>
                    {mod.isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                  </div>
                  {mod.category && (
                    <Badge
                      variant="secondary"
                      className={`${colors.bg} ${colors.text} ${colors.border} text-[10px] px-2 py-0.5 mb-2`}
                    >
                      {mod.category}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{mod.description}</p>
                  {mod.price > 0 ? (
                    <p className="text-xs font-medium text-foreground">
                      PKR {mod.price.toLocaleString('en-PK')}
                      <span className="text-muted-foreground">/mo</span>
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-emerald-400">Included</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── BuildFlow Live Stats ── */}
      {isBuildFlow && (
        <>
          {/* Connection Status */}
          {bfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {bfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to BuildFlow database: {bfError}</span>
            </div>
          )}

          {bfStats && !bfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Users className="w-4 h-4 text-orange-400" />}
                  label="Client Companies"
                  value={bfStats.mainDb?.totalClients}
                  color="text-orange-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={bfStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Total Users"
                  value={bfStats.mainDb?.totalUsers}
                  color="text-[var(--gg-teal)]"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-amber-400" />}
                  label="Tenant Databases"
                  value={bfStats.operations?.tenantCount}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Financial Overview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
                    <p className="text-xs text-muted-foreground">Revenue and billing from BuildFlow</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(bfStats.mainDb?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.mainDb?.totalInvoices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Active Licenses</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.mainDb?.activeSerialKeys}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Active Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.mainDb?.activeDevices}</p>
                  </div>
                </div>
              </motion.div>

              {/* Property & Construction Operations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Property & Construction Operations</h3>
                    <p className="text-xs text-muted-foreground">Aggregated across {bfStats.operations?.tenantCount} tenant database{bfStats.operations?.tenantCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Properties</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.properties}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <HardHat className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Projects</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.projects}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Tenants</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.tenants}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Units</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.units}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(bfStats.operations?.revenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Maintenance</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.maintenanceTickets}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Contractors</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.contractors}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserRound className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Employees</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.employees}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-muted-foreground">Housing Schemes</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.housingSchemes}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Suppliers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{bfStats.operations?.suppliers}</p>
                  </div>
                </div>
              </motion.div>

              {/* Plan Distribution */}
              {bfStats.mainDb?.clientsByPlan?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Plan Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {bfStats.mainDb?.clientsByPlan.map((item) => {
                      const planColors: Record<string, string> = {
                        basic: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        starter: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      }
                      return (
                        <div key={item.plan} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${planColors[item.plan] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.plan}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {bfStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Client Companies
                    <span className="text-sm font-normal text-muted-foreground ml-2">({bfStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Contact</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Projects</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bfStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactName}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.planType === 'enterprise'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : client.planType === 'professional'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.planType || '—'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }
                              >
                                {client.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">{client.maxProjects} max / {client.currentProjects} current</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Serial Keys Table */}
              {bfStats.mainDb?.serialKeys?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    License Keys
                    <span className="text-sm font-normal text-muted-foreground ml-2">({bfStats.mainDb?.serialKeys?.length})</span>
                  </h3>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Key</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Client</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bfStats.mainDb?.serialKeys.slice(0, 20).map((sk) => (
                          <tr key={sk.id} className="border-b border-border last:border-0">
                            <td className="py-2.5 text-xs font-mono text-muted-foreground">{sk.key}</td>
                            <td className="py-2.5 text-sm text-muted-foreground hidden sm:table-cell">{sk.businessName || '—'}</td>
                            <td className="py-2.5">
                              <Badge
                                variant="secondary"
                                className={
                                  sk.status?.toLowerCase() === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {sk.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── TravelFlow Live Stats ── */}
      {isTravelFlow && (
        <>
          {/* Connection Status */}
          {tfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {tfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to TravelFlow database: {tfError}</span>
            </div>
          )}

          {tfStats && !tfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Plane className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Client Companies"
                  value={tfStats.mainDb?.totalClients}
                  color="text-[var(--gg-teal)]"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={tfStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-violet-400" />}
                  label="Total Users"
                  value={tfStats.mainDb?.totalUsers}
                  color="text-violet-400"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-amber-400" />}
                  label="Tenant Databases"
                  value={tfStats.operations?.tenantCount}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* TravelFlow Operational Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gg-teal)]/10 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-[var(--gg-teal)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Travel & Hajj Operations</h3>
                    <p className="text-xs text-muted-foreground">Aggregated across {tfStats.operations?.tenantCount} tenant database{tfStats.operations?.tenantCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Pilgrims</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.pilgrims}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Bookings</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.bookings}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Packages</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.packages}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Plane className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Flight Bookings</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.flightBookings}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Hotels</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.hotels}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Tour Groups</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.groups}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Plane className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-muted-foreground">International Travel</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.internationalTravels}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <TruckIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Suppliers</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.suppliers}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-3.5 h-3.5 text-lime-400" />
                      <span className="text-xs text-muted-foreground">Transports</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.transports}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Visa Applications</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.visaApplications}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserRound className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span className="text-xs text-muted-foreground">CRM Leads</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.crmLeads}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Branches</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.branches}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">Staff</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tfStats.operations?.staff}</p>
                  </div>
                </div>
              </motion.div>

              {/* License Distribution */}
              {tfStats.mainDb?.clientsByPlan?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">License Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {tfStats.mainDb?.clientsByPlan.map((item) => {
                      const planColors: Record<string, string> = {
                        basic: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        starter: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      }
                      return (
                        <div key={item.plan} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${planColors[item.plan] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.plan}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {tfStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Client Companies
                    <span className="text-sm font-normal text-muted-foreground ml-2">({tfStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Contact</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">License</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Pilgrims</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tfStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactName}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.licenseType === 'enterprise'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : client.licenseType === 'professional'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.licenseType}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">{client.maxPilgrims} max</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Subscription Plans */}
              {tfStats.mainDb?.subscriptionPlans?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Subscription Plans
                    <span className="text-sm font-normal text-muted-foreground ml-2">({tfStats.mainDb?.subscriptionPlans?.length})</span>
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tfStats.mainDb?.subscriptionPlans.map((plan) => (
                      <div key={plan.id} className="p-4 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-sm font-semibold text-foreground">{plan.name}</h4>
                          {plan.isPopular && (
                            <Badge className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[10px]">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-muted-foreground">Monthly</div>
                          <div className="text-foreground text-right">{formatPKR(plan.monthlyPrice)}</div>
                          <div className="text-muted-foreground">Yearly</div>
                          <div className="text-foreground text-right">{formatPKR(plan.yearlyPrice)}</div>
                          <div className="text-muted-foreground">Max Pilgrims</div>
                          <div className="text-foreground text-right">{plan.maxPilgrims}</div>
                          <div className="text-muted-foreground">Max Branches</div>
                          <div className="text-foreground text-right">{plan.maxBranches}</div>
                          <div className="text-muted-foreground">Max Staff</div>
                          <div className="text-foreground text-right">{plan.maxStaff}</div>
                          <div className="text-muted-foreground">Max Devices</div>
                          <div className="text-foreground text-right">{plan.maxDevices}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── TenantFlow Live Stats ── */}
      {isTenantFlow && (
        <>
          {/* Connection Status */}
          {tnfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {tnfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to TenantFlow database: {tnfError}</span>
            </div>
          )}

          {tnfStats && !tnfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Building2 className="w-4 h-4 text-[var(--gg-teal)]" />}
                  label="Client Companies"
                  value={tnfStats.mainDb?.totalClients}
                  color="text-[var(--gg-teal)]"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={tnfStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-violet-400" />}
                  label="Total Users"
                  value={tnfStats.mainDb?.totalUsers}
                  color="text-violet-400"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-amber-400" />}
                  label="Tenant Databases"
                  value={tnfStats.operations?.tenantCount}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* TenantFlow Operational Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gg-teal)]/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[var(--gg-teal)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Property Management Operations</h3>
                    <p className="text-xs text-muted-foreground">Aggregated across {tnfStats.operations?.tenantCount} tenant database{tnfStats.operations?.tenantCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Properties</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.properties}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DoorOpen className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Units</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.units}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Tenants</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.tenants}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Leases</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.leases}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-xs text-muted-foreground">Payments</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.payments}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Maintenance</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.maintenanceTickets}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-muted-foreground">Vendors</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.vendors}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs text-muted-foreground">Employees</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{tnfStats.operations?.employees}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(tnfStats.operations?.revenue)}</p>
                  </div>
                </div>
              </motion.div>

              {/* License Distribution */}
              {tnfStats.mainDb?.clientsByPlan?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">License Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {tnfStats.mainDb?.clientsByPlan.map((item) => {
                      const planColors: Record<string, string> = {
                        basic: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
                        professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        starter: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      }
                      return (
                        <div key={item.plan} className="p-4 rounded-xl bg-secondary border border-border text-center">
                          <Badge className={`${planColors[item.plan] || 'bg-border text-foreground border-border'} mb-2`}>
                            {item.plan}
                          </Badge>
                          <p className="text-2xl font-bold text-foreground">{item.count}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {tnfStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Client Companies
                    <span className="text-sm font-normal text-muted-foreground ml-2">({tnfStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Contact</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">DB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tnfStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.contactName}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.plan === 'enterprise'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : client.plan === 'professional'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.plan}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <Badge
                                variant="secondary"
                                className={
                                  client.dbStatus === 'ready'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }
                              >
                                {client.dbStatus || 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Serial Keys Table */}
              {tnfStats.mainDb?.licenseKeys?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Serial Keys
                    <span className="text-sm font-normal text-muted-foreground ml-2">({tnfStats.mainDb?.licenseKeys?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Key</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Type</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden lg:table-cell">Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tnfStats.mainDb?.licenseKeys.map((lk) => (
                          <tr key={lk.id} className="border-b border-border last:border-0">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5 text-[var(--gg-teal)] shrink-0" />
                                <span className="text-sm font-mono text-foreground">{lk.key}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                                {lk.type}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20">
                                {lk.plan}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  lk.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : lk.status === 'expired'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }
                              >
                                {lk.status}
                              </Badge>
                            </td>
                            <td className="py-3 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">{lk.companyName || '—'}</span>
                            </td>
                            <td className="py-3 hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">{lk.expiresAt ? new Date(lk.expiresAt).toLocaleDateString() : '—'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── FactoryFlow Live Stats ── */}
      {isFactoryFlow && (
        <>
          {ffLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {ffError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to FactoryFlow database: {ffError}</span>
            </div>
          )}

          {ffStats && !ffLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Factory className="w-4 h-4 text-lime-400" />}
                  label="Factory Clients"
                  value={ffStats.mainDb?.totalClients}
                  color="text-lime-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={ffStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<UserCheck className="w-4 h-4 text-violet-400" />}
                  label="Total Users"
                  value={ffStats.mainDb?.totalUsers}
                  color="text-violet-400"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<KeyRound className="w-4 h-4 text-amber-400" />}
                  label="Active Serial Keys"
                  value={ffStats.mainDb?.activeSerialKeys}
                  color="text-amber-400"
                  delay={0.15}
                />
              </div>

              {/* Financial & License Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Financial & License Overview</h3>
                    <p className="text-xs text-muted-foreground">Revenue, billing, and license data from FactoryFlow</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(ffStats.mainDb?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{ffStats.mainDb?.totalInvoices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Serial Keys</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{ffStats.mainDb?.totalSerialKeys}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{ffStats.mainDb?.totalDevices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Active Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{ffStats.mainDb?.activeDevices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-3.5 h-3.5 text-lime-400" />
                      <span className="text-xs text-muted-foreground">Packages</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{ffStats.mainDb?.totalPackages}</p>
                  </div>
                </div>
              </motion.div>

              {/* Package Modules */}
              {ffStats.mainDb?.packageModules?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center">
                      <Cog className="w-4 h-4 text-lime-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Factory Modules</h3>
                      <p className="text-xs text-muted-foreground">{ffStats.mainDb?.packageModules?.length} modules available</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ffStats.mainDb?.packageModules.map((mod) => (
                      <div key={mod.moduleKey} className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Wrench className="w-3 h-3 text-lime-400" />
                          <span className="text-xs text-muted-foreground">{mod.moduleName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-lime-500/10 text-lime-400 border-lime-500/20 text-[9px]">
                            {mod.included_count} included
                          </Badge>
                          {mod.premium_count > 0 && (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]">
                              {mod.premium_count} premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Client Companies Table */}
              {ffStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Factory Clients
                    <span className="text-sm font-normal text-muted-foreground ml-2">({ffStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Company</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Email</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Max Users</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ffStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.email}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.billingCycle === 'yearly'
                                    ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.billingCycle}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }
                              >
                                {client.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground hidden md:table-cell">{client.maxUsers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {isFoodFlow && (
        <>
          {foodFLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {foodFError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to FoodFlow database: {foodFError}</span>
            </div>
          )}

          {foodFStats && !foodFLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Utensils className="w-4 h-4 text-orange-400" />}
                  label="Restaurant Clients"
                  value={foodFStats.mainDb?.totalClients}
                  color="text-orange-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={foodFStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<KeyRound className="w-4 h-4 text-amber-400" />}
                  label="Active Serial Keys"
                  value={foodFStats.mainDb?.activeSerialKeys}
                  color="text-amber-400"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<Database className="w-4 h-4 text-violet-400" />}
                  label="Total Devices"
                  value={foodFStats.mainDb?.totalDevices}
                  color="text-violet-400"
                  delay={0.15}
                />
              </div>

              {/* Financial & License Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Financial & License Overview</h3>
                    <p className="text-xs text-muted-foreground">Revenue, billing, and license data from FoodFlow</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPKR(foodFStats.mainDb?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground">Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{foodFStats.mainDb?.totalInvoices}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs text-muted-foreground">Serial Keys</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{foodFStats.mainDb?.totalSerialKeys}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <BoxesIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Active Devices</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{foodFStats.mainDb?.activeDevices}</p>
                  </div>
                </div>
              </motion.div>

              {/* Client Companies Table */}
              {foodFStats.mainDb?.clientCompanies?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Restaurant Clients
                    <span className="text-sm font-normal text-muted-foreground ml-2">({foodFStats.mainDb?.clientCompanies?.length})</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Business</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden sm:table-cell">Email</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Plan</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Max Users</th>
                        </tr>
                      </thead>
                      <tbody>
                        {foodFStats.mainDb?.clientCompanies.map((client) => (
                          <tr key={client.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">{client.businessName}</td>
                            <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{client.ownerEmail}</td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.billingCycle === 'yearly'
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                                }
                              >
                                {client.billingCycle}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant="secondary"
                                className={
                                  client.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : client.status === 'trial'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20'
                                }
                              >
                                {client.isActive ? 'active' : client.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground hidden md:table-cell">{client.maxUsers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── AutoFlow Live Stats ── */}
      {isAutoFlow && (
        <>
          {/* Connection Status */}
          {autoFLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {autoFError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to AutoFlow database: {autoFError}</span>
            </div>
          )}

          {autoFStats && !autoFLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard
                  icon={<Users className="w-4 h-4 text-sky-400" />}
                  label="Client Companies"
                  value={autoFStats.mainDb?.totalClients}
                  color="text-sky-400"
                  delay={0}
                />
                <LiveStatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Active Clients"
                  value={autoFStats.mainDb?.activeClients}
                  color="text-emerald-400"
                  delay={0.05}
                />
                <LiveStatCard
                  icon={<KeyRound className="w-4 h-4 text-amber-400" />}
                  label="Active Serial Keys"
                  value={autoFStats.mainDb?.activeSerialKeys}
                  color="text-amber-400"
                  delay={0.1}
                />
                <LiveStatCard
                  icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                  label="Total Revenue"
                  value={formatPKR(autoFStats.mainDb?.totalRevenue)}
                  color="text-emerald-400"
                  delay={0.15}
                />
              </div>

              {/* Operations Stats */}
              {autoFStats.operations && (
                <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Workshop Operations</h3>
                      <p className="text-xs text-muted-foreground">{autoFStats.operations?.tenants} tenant database{autoFStats.operations?.tenants !== 1 ? 's' : ''} aggregated</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.operations?.vehicles}</p>
                      <p className="text-xs text-muted-foreground">Vehicles</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.operations?.serviceOrders}</p>
                      <p className="text-xs text-muted-foreground">Service Orders</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.operations?.inventoryItems}</p>
                      <p className="text-xs text-muted-foreground">Inventory Items</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.operations?.suppliers}</p>
                      <p className="text-xs text-muted-foreground">Suppliers</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.operations?.purchaseOrders}</p>
                      <p className="text-xs text-muted-foreground">Purchase Orders</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.operations?.employees}</p>
                      <p className="text-xs text-muted-foreground">Employees</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-emerald-400">{formatPKR(autoFStats.operations?.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Service Revenue</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <p className="text-2xl font-bold text-foreground">{autoFStats.mainDb?.totalDevices}</p>
                      <p className="text-xs text-muted-foreground">Registered Devices</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Companies Table */}
              {autoFStats.mainDb?.clientCompanies && autoFStats.mainDb?.clientCompanies?.length > 0 && (
                <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Client Companies</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Company</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Contact</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Plan</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {autoFStats.mainDb?.clientCompanies.slice(0, 10).map((c) => (
                          <tr key={c.id} className="border-b border-border">
                            <td className="py-2 px-3 text-foreground font-medium">{c.companyName}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.contactPerson || c.email}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.plan || '—'}</td>
                            <td className="py-2 px-3">
                              <Badge variant="secondary" className={
                                c.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }>
                                {c.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── ElectroFlow Live Stats ── */}
      {isElectroFlow && (
        <>
          {elfLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
              ))}
            </div>
          )}

          {elfError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400">Could not connect to ElectroFlow database: {elfError}</span>
            </div>
          )}

          {elfStats && !elfLoading && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <LiveStatCard icon={<DollarSign className="w-4 h-4 text-emerald-400" />} label="Total Revenue" value={formatPKR(elfStats.sales?.totalRevenue)} color="text-emerald-400" delay={0} />
                <LiveStatCard icon={<ShoppingBag className="w-4 h-4 text-[var(--gg-teal)]" />} label="Total Sales" value={elfStats.sales?.totalOrders} color="text-[var(--gg-teal)]" delay={0.05} />
                <LiveStatCard icon={<Users className="w-4 h-4 text-violet-400" />} label="Customers" value={elfStats.customers?.total} color="text-violet-400" delay={0.1} />
                <LiveStatCard icon={<Package className="w-4 h-4 text-amber-400" />} label="Products" value={elfStats.products?.total} color="text-amber-400" delay={0.15} />
              </div>

              {/* Sales & Finance */}
              <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Sales & Finance</h3>
                    <p className="text-xs text-muted-foreground">Revenue and payment analytics</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-emerald-400">{formatPKR(elfStats.sales?.totalPaid)}</p>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-amber-400">{formatPKR(elfStats.sales?.outstanding)}</p>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.installments?.active}</p>
                    <p className="text-xs text-muted-foreground">Active Installments</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-red-400">{elfStats.installments?.overduePayments}</p>
                    <p className="text-xs text-muted-foreground">Overdue Payments</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{formatPKR(elfStats.installments?.financedAmount)}</p>
                    <p className="text-xs text-muted-foreground">Financed Amount</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{formatPKR(elfStats.expenses?.total)}</p>
                    <p className="text-xs text-muted-foreground">Total Expenses</p>
                  </div>
                </div>

                {/* Sales by Type */}
                {elfStats.sales?.salesByType && elfStats.sales.salesByType.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-3">Sales by Type</p>
                    <div className="flex gap-3">
                      {elfStats.sales.salesByType.map((st) => (
                        <div key={st.type} className="bg-secondary rounded-lg px-4 py-2 border border-border">
                          <p className="text-xs text-muted-foreground capitalize">{st.type}</p>
                          <p className="text-lg font-bold">{st.count}</p>
                          <p className="text-xs text-muted-foreground">{formatPKR(st.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Operations */}
              <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gg-teal)]/10 flex items-center justify-center">
                    <BoxesIcon className="w-4 h-4 text-[var(--gg-teal)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Operations</h3>
                    <p className="text-xs text-muted-foreground">Inventory, procurement & service</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.products?.totalStock}</p>
                    <p className="text-xs text-muted-foreground">Total Stock</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-red-400">{elfStats.products?.lowStock}</p>
                    <p className="text-xs text-muted-foreground">Low Stock Items</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.procurement?.purchaseOrders}</p>
                    <p className="text-xs text-muted-foreground">Purchase Orders</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.procurement?.suppliers}</p>
                    <p className="text-xs text-muted-foreground">Suppliers</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.service?.open}</p>
                    <p className="text-xs text-muted-foreground">Open Service Tickets</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.delivery?.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending Deliveries</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.core?.branches}</p>
                    <p className="text-xs text-muted-foreground">Branches</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 border border-border">
                    <p className="text-2xl font-bold text-foreground">{elfStats.core?.employees}</p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              {elfStats.products?.topProducts && elfStats.products.topProducts.length > 0 && (
                <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Product</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Unit Price</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Sold</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {elfStats.products.topProducts.map((p, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 px-3 text-foreground font-medium">{p.name}</td>
                            <td className="py-2 px-3 text-right text-muted-foreground">{formatPKR(p.salePrice)}</td>
                            <td className="py-2 px-3 text-right">{p.totalSold}</td>
                            <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatPKR(p.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Sales */}
              {elfStats.sales?.recentSales && elfStats.sales.recentSales.length > 0 && (
                <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Invoice</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Customer</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                          <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {elfStats.sales.recentSales.slice(0, 10).map((s) => (
                          <tr key={s.invoiceNumber} className="border-b border-border">
                            <td className="py-2 px-3 font-mono text-xs">{s.invoiceNumber}</td>
                            <td className="py-2 px-3">{s.customerName || 'Walk-in'}</td>
                            <td className="py-2 px-3 capitalize text-muted-foreground">{s.saleType}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatPKR(s.totalAmount)}</td>
                            <td className="py-2 px-3 text-center">
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] capitalize">
                                {s.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Branch Performance */}
              {elfStats.branches && elfStats.branches.length > 0 && (
                <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Branch Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Branch</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Code</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">City</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Sales</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {elfStats.branches.map((b) => (
                          <tr key={b.code} className="border-b border-border">
                            <td className="py-2 px-3 font-medium">{b.name}</td>
                            <td className="py-2 px-3 text-muted-foreground">{b.code}</td>
                            <td className="py-2 px-3 text-muted-foreground">{b.city || '—'}</td>
                            <td className="py-2 px-3 text-right">{b.salesCount}</td>
                            <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatPKR(b.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Recent Clients (for non-connected active ERPs) ── */}
      {!isComingSoon && !isApparelFlow && !isHotelFlow && !isEduFlow && !isMartFlow && !isPharmaFlow && !isBuildFlow && !isTravelFlow && !isTenantFlow && !isFactoryFlow && !isFoodFlow && !isAutoFlow && !isElectroFlow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Clients on {name}</h3>

          {data.recentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No clients yet</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Client</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">License</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentClients.map((client) => (
                    <tr key={client.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm font-medium text-foreground">{client.companyName}</td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            client.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : client.status === 'trial'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20'
                          }
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{client.licenseType || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
