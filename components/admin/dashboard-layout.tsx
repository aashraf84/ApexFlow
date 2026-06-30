'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useNavigate } from '@/lib/use-navigate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FileText,
  KeyRound,
  Package,
  Plug,
  CreditCard,
  Shirt,
  Hotel,
  GraduationCap,
  Plane,
  Pill,
  UtensilsCrossed,
  HardHat,
  Building2,
  Heart,
  Palette,
  ShoppingCart,
  Factory,
  Truck,
  Droplets,
  Ship,
  Wheat,
  Landmark,
  Wrench,
  TextCursorInput,
  Route,
  Monitor,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Clock,
  Zap,
  Globe2,
  Layers,
  Database,
  BookOpen,
  Fuel,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { SiteLogo } from '@/components/shared/site-logo'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { OverviewTab } from '@/components/admin/overview-tab'
import { ClientsTab } from '@/components/admin/clients-tab'
import { InvoicesTab } from '@/components/admin/invoices-tab'
import { LicensesTab } from '@/components/admin/licenses-tab'
import { PackagesTab } from '@/components/admin/packages-tab'
import { IntegrationsTab } from '@/components/admin/integrations-tab'
import { ErpDetailTab } from '@/components/admin/erp-detail-tab'
import { ErpManagementTab } from '@/components/admin/erp-management-tab'
import { DevicesTab } from '@/components/admin/devices-tab'
import { OrdersTab } from '@/components/admin/orders-tab'
import dynamic from 'next/dynamic'
import { UnifiedSettingsTab } from '@/components/admin/unified-settings-tab'

const PaymentSettingsTab = dynamic(
  () => import('@/components/admin/payment-settings-tab').then((mod) => mod.PaymentSettingsTab),
  { 
    loading: () => (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 w-56 rounded-xl bg-card animate-pulse" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-32 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-card animate-pulse" />
      </div>
    ),
    ssr: false,
  }
)

// ─── Icon mapping ───────────────────────────────────────────────────────────
const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  hotel: Hotel,
  graduation: GraduationCap,
  plane: Plane,
  pill: Pill,
  utensils: UtensilsCrossed,
  hardhat: HardHat,
  building: Building2,
  heart: Heart,
  palette: Palette,
  shopping: ShoppingCart,
  factory: Factory,
  truck: Truck,
  droplets: Droplets,
  ship: Ship,
  wheat: Wheat,
  landmark: Landmark,
  wrench: Wrench,
  textcursor: TextCursorInput,
  route: Route,
  'book-open': BookOpen,
  fuel: Fuel,
}

// ─── Color mapping ──────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  cyan: 'text-primary',
  amber: 'text-[var(--gg-amber)]',
  violet: 'text-[var(--gg-violet)]',
  emerald: 'text-[var(--gg-green)]',
  rose: 'text-[var(--gg-rose)]',
  orange: 'text-[var(--gg-amber)]',
  blue: 'text-primary',
  teal: 'text-[var(--gg-teal)]',
  pink: 'text-[var(--gg-rose)]',
  indigo: 'text-[var(--gg-violet)]',
  lime: 'text-[var(--gg-green)]',
  sky: 'text-[var(--gg-teal)]',
  fuchsia: 'text-[var(--gg-violet)]',
  red: 'text-[var(--gg-rose)]',
  green: 'text-[var(--gg-green)]',
  yellow: 'text-[var(--gg-amber)]',
}

// ─── Types ──────────────────────────────────────────────────────────────────
type TabId = string

interface ErpListItem {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  status: string
  industry: string
  moduleCount: number
}

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactNode
  colorClass?: string
  isComingSoon?: boolean
}

// ─── Static navigation ──────────────────────────────────────────────────────
const mainNav: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
  { id: 'licenses', label: 'Serial Keys', icon: <KeyRound className="w-4 h-4" /> },
  { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug className="w-4 h-4" /> },
  { id: 'erp-management', label: 'ERP Systems', icon: <Database className="w-4 h-4" /> },
]

const systemNav: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { id: 'devices', label: 'Devices', icon: <Monitor className="w-4 h-4" /> },
]

// ─── Helper: build ERP nav from API data ────────────────────────────────────
function buildErpNav(erps: ErpListItem[]): { active: NavItem[]; comingSoon: NavItem[] } {
  const active: NavItem[] = []
  const comingSoon: NavItem[] = []

  for (const erp of erps) {
    const IconComp = iconComponentMap[erp.icon] || Package
    const colorClass = colorMap[erp.color] || 'text-primary'
    const navItem: NavItem = {
      id: erp.slug,
      label: erp.name,
      icon: <IconComp className={`w-4 h-4 ${colorClass}`} />,
      colorClass,
      isComingSoon: erp.status === 'coming_soon',
    }
    if (erp.status === 'coming_soon') {
      comingSoon.push(navItem)
    } else {
      active.push(navItem)
    }
  }

  return { active, comingSoon }
}

// ─── Logo ───────────────────────────────────────────────────────────────────
function Logo() {
  return <SiteLogo variant="full" size={44} />
}

// ─── NavButton ──────────────────────────────────────────────────────────────
function NavButton({
  item,
  activeTab,
  sidebarOpen,
  onTabChange,
}: {
  item: NavItem
  activeTab: TabId
  sidebarOpen: boolean
  onTabChange: (id: TabId) => void
}) {
  const isActive = activeTab === item.id

  return (
    <button
      onClick={() => onTabChange(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
        item.isComingSoon && !isActive
          ? 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50'
          : isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      }`}
    >
      <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>
      {sidebarOpen && (
        <span className="flex-1 text-left truncate">{item.label}</span>
      )}
      {sidebarOpen && item.isComingSoon && (
        <Badge className="bg-[var(--gg-amber)]/10 text-[var(--gg-amber)]/80 border-[var(--gg-amber)]/15 text-[9px] px-1.5 py-0 leading-4">
          Soon
        </Badge>
      )}
    </button>
  )
}

// ─── SidebarCategory ────────────────────────────────────────────────────────
function SidebarCategory({
  title,
  icon,
  items,
  defaultOpen = true,
  sidebarOpen,
  activeTab,
  onTabChange,
  loading = false,
  loadingCount = 3,
}: {
  title: string
  icon: React.ReactNode
  items: NavItem[]
  defaultOpen?: boolean
  sidebarOpen: boolean
  activeTab: TabId
  onTabChange: (id: TabId) => void
  loading?: boolean
  loadingCount?: number
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // When sidebar is collapsed, show only icon buttons without category headers
  if (!sidebarOpen) {
    return (
      <div className="space-y-1">
        {items.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            activeTab={activeTab}
            sidebarOpen={sidebarOpen}
            onTabChange={onTabChange}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Category header - clickable to toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/30"
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-3 h-3" />
        </motion.span>
      </button>

      {/* Collapsible items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1">
              {loading ? (
                [...Array(loadingCount)].map((_, i) => (
                  <div key={i} className="px-3 py-2.5">
                    <Skeleton className="h-4 w-24 rounded bg-secondary" />
                  </div>
                ))
              ) : (
                items.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    activeTab={activeTab}
                    sidebarOpen={sidebarOpen}
                    onTabChange={onTabChange}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── SidebarContent ─────────────────────────────────────────────────────────
function SidebarContent({
  activeTab,
  sidebarOpen,
  onTabChange,
  onToggleSidebar,
  onLogout,
  onCloseMobile,
  erpNavActive,
  erpNavComingSoon,
  erpLoading,
}: {
  activeTab: TabId
  sidebarOpen: boolean
  onTabChange: (id: TabId) => void
  onToggleSidebar: () => void
  onLogout: () => void
  onCloseMobile: () => void
  erpNavActive: NavItem[]
  erpNavComingSoon: NavItem[]
  erpLoading: boolean
}) {
  const handleTabChange = (id: TabId) => {
    onTabChange(id)
    onCloseMobile()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        {sidebarOpen && <Logo />}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-muted-foreground hover:text-foreground w-8 h-8"
          onClick={onToggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground w-8 h-8"
          onClick={onCloseMobile}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation - NO scrolling, overflow-hidden */}
      <div className="flex-1 overflow-hidden px-3 py-4">
        <div className="space-y-2">
          {/* Main category */}
          <SidebarCategory
            title="Main"
            icon={<Layers className="w-3 h-3" />}
            items={mainNav}
            defaultOpen={true}
            sidebarOpen={sidebarOpen}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* ERP Systems category */}
          {(erpLoading || erpNavActive.length > 0) && (
            <SidebarCategory
              title="ERP Systems"
              icon={<Zap className="w-3 h-3" />}
              items={erpNavActive}
              defaultOpen={true}
              sidebarOpen={sidebarOpen}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              loading={erpLoading}
              loadingCount={3}
            />
          )}

          {/* Coming Soon category */}
          {erpNavComingSoon.length > 0 && (
            <SidebarCategory
              title="Coming Soon"
              icon={<Clock className="w-3 h-3" />}
              items={erpNavComingSoon}
              defaultOpen={false}
              sidebarOpen={sidebarOpen}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {/* System category */}
          <SidebarCategory
            title="System"
            icon={<Globe2 className="w-3 h-3" />}
            items={systemNav}
            defaultOpen={true}
            sidebarOpen={sidebarOpen}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* Exit */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-[var(--gg-rose)] hover:bg-[var(--gg-rose)]/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span>Exit</span>}
        </button>
      </div>
    </div>
  )
}

// ─── Main DashboardLayout ───────────────────────────────────────────────────
export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [erpNavActive, setErpNavActive] = useState<NavItem[]>([])
  const [erpNavComingSoon, setErpNavComingSoon] = useState<NavItem[]>([])
  const [erpLoading, setErpLoading] = useState(true)
  const [erpMap, setErpMap] = useState<Record<string, ErpListItem>>({})
  const { adminUser, setAdminUser } = useAppStore()
  const { navigate } = useNavigate()

  // Fetch all ERPs on mount
  useEffect(() => {
    let cancelled = false
    fetch('/api/erp')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const erps: ErpListItem[] = data.erpSystems || []
        const { active, comingSoon } = buildErpNav(erps)
        setErpNavActive(active)
        setErpNavComingSoon(comingSoon)

        const map: Record<string, ErpListItem> = {}
        for (const erp of erps) {
          map[erp.slug] = erp
        }
        setErpMap(map)
      })
      .catch((err) => {
        console.error('[Dashboard] Failed to fetch ERPs:', err)
      })
      .finally(() => { if (!cancelled) setErpLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleLogout = () => {
    setAdminUser(null)
    navigate('landing')
  }

  const getTabLabel = (id: TabId) => {
    const allStatic = [...mainNav, ...systemNav]
    const staticItem = allStatic.find((i) => i.id === id)
    if (staticItem) return staticItem.label

    const erp = erpMap[id]
    if (erp) return erp.name

    return 'Overview'
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'clients':
        return <ClientsTab />
      case 'orders':
        return <OrdersTab />
      case 'invoices':
        return <InvoicesTab />
      case 'licenses':
        return <LicensesTab />
      case 'packages':
        return <PackagesTab />
      case 'integrations':
        return <IntegrationsTab />
      case 'erp-management':
        return <ErpManagementTab />
      case 'devices':
        return <DevicesTab />
      case 'settings':
        return <UnifiedSettingsTab />
      default:
        const erp = erpMap[activeTab]
        if (erp) {
          return <ErpDetailTab erpId={erp.slug} name={erp.name} />
        }
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <SidebarContent
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          onTabChange={setActiveTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          erpNavActive={erpNavActive}
          erpNavComingSoon={erpNavComingSoon}
          erpLoading={erpLoading}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileSidebarOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="relative w-64 h-full bg-card border-r border-border"
          >
            <SidebarContent
              activeTab={activeTab}
              sidebarOpen={true}
              onTabChange={setActiveTab}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onLogout={handleLogout}
              onCloseMobile={() => setMobileSidebarOpen(false)}
              erpNavActive={erpNavActive}
              erpNavComingSoon={erpNavComingSoon}
              erpLoading={erpLoading}
            />
          </motion.aside>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground w-9 h-9"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{getTabLabel(activeTab)}</span>
            </div>
            <span className="sm:hidden text-sm font-medium text-foreground">{getTabLabel(activeTab)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 rounded-xl h-9 w-56 text-sm"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground w-9 h-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border text-foreground rounded-xl"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{adminUser?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{adminUser?.email || 'admin@apexflow.cloud'}</p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-sm text-muted-foreground focus:text-foreground focus:bg-secondary cursor-pointer"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-sm text-[var(--gg-rose)] focus:text-[var(--gg-rose)] focus:bg-[var(--gg-rose)]/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderTabContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
