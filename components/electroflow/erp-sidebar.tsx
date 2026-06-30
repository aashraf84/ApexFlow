'use client'

import { useERPStore, type ERPModule } from '@/lib/erp-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  LayoutDashboard, ShoppingCart, Users, Package, Warehouse,
  Truck, CreditCard, UserCog, TruckIcon, Wrench, Building2,
  Receipt, ChevronLeft, ChevronRight, Zap, Menu, X, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { SiteLogo } from '@/components/shared/site-logo'

const navItems: { module: ERPModule; label: string; icon: React.ElementType; group: string }[] = [
  { module: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { module: 'sales', label: 'Sales', icon: ShoppingCart, group: 'Sales & CRM' },
  { module: 'customers', label: 'Customers', icon: Users, group: 'Sales & CRM' },
  { module: 'products', label: 'Products', icon: Package, group: 'Inventory' },
  { module: 'inventory', label: 'Stock', icon: Warehouse, group: 'Inventory' },
  { module: 'purchases', label: 'Purchases', icon: Truck, group: 'Procurement' },
  { module: 'suppliers', label: 'Suppliers', icon: Building2, group: 'Procurement' },
  { module: 'installments', label: 'Installments', icon: CreditCard, group: 'Finance' },
  { module: 'expenses', label: 'Expenses', icon: Receipt, group: 'Finance' },
  { module: 'employees', label: 'Employees', icon: UserCog, group: 'HR' },
  { module: 'deliveries', label: 'Deliveries', icon: TruckIcon, group: 'Logistics' },
  { module: 'service', label: 'Service', icon: Wrench, group: 'Support' },
]

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { activeModule, setActiveModule } = useERPStore()

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border/50",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">ElectroFlow</span>
            <span className="text-[10px] text-muted-foreground">ERP System</span>
          </div>
        )}
      </div>

      {/* Cross-link to ApexFlow */}
      <div className={cn("px-2 pb-1", collapsed && "flex justify-center")}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-lg text-xs font-medium transition-colors",
            "bg-gradient-to-r from-[var(--gg-vermillion)]/10 to-[var(--gg-amber)]/10",
            "hover:from-[var(--gg-vermillion)]/15 hover:to-[var(--gg-amber)]/15",
            "text-[var(--gg-vermillion)] dark:text-[var(--gg-vermillion)]",
            "border border-[var(--gg-vermillion)]/10 hover:border-[var(--gg-vermillion)]/20",
            collapsed ? "justify-center p-2" : "px-3 py-2"
          )}
        >
          <SiteLogo variant="icon" size={20} />
          {!collapsed && <SiteLogo variant="full" size={32} />}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2">
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const isActive = activeModule === item.module
                return (
                  <button
                    key={item.module}
                    onClick={() => { setActiveModule(item.module); onNavigate?.() }}
                    className={cn(
                      "flex items-center w-full rounded-lg text-sm font-medium transition-all duration-150",
                      collapsed
                        ? "justify-center px-2 py-2.5 mx-auto w-10"
                        : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn("border-t border-border/50 p-3", collapsed && "flex justify-center")}>
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 text-xs font-bold">
                EF
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">ElectroFlow Admin</span>
                <span className="text-[10px] text-muted-foreground truncate">admin@electroflow.com</span>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group/af"
            >
              <SiteLogo variant="icon" size={20} />
              <span>Back to ApexFlow</span>
            </Link>
          </div>
        )}
        {collapsed && (
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Back to ApexFlow"
          >
            <SiteLogo variant="icon" size={22} />
          </Link>
        )}
      </div>
    </div>
  )
}

export function ERPSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useERPStore()
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur border-b flex items-center px-4 gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">ElectroFlow</span>
          </div>
        </div>
        <div className="h-14" />
      </>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-background border-r border-border/50 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <SidebarContent collapsed={sidebarCollapsed} />
      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-background border rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors z-50"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  )
}
