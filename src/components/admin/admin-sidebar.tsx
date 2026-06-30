'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  Smartphone,
  Truck,
  Settings,
  ChevronDown,
  Boxes,
  ClipboardList,
  Package,
  ShoppingCart,
  Banknote,
  Warehouse,
  ClipboardCheck,
  KeyRound,
  ScrollText,
  ShieldCheck,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string; icon: React.ElementType }[]
  showForIndustry?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/admin/clients', icon: Building2 },
  { label: 'Users', href: '/admin/users', icon: Users },
  {
    label: 'Invoicing',
    href: '/admin/invoices',
    icon: FileText,
    children: [
      { label: 'Invoices', href: '/admin/invoices', icon: FileText },
      { label: 'Quotations', href: '/admin/quotations', icon: ScrollText },
    ],
  },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  {
    label: 'Devices',
    href: '/admin/devices',
    icon: Smartphone,
    children: [
      { label: 'Devices', href: '/admin/devices', icon: Smartphone },
      { label: 'Serial Keys', href: '/admin/serial-keys', icon: KeyRound },
    ],
  },
  {
    label: 'Distribution',
    href: '/admin/dealers',
    icon: Truck,
    showForIndustry: ['Distribution'],
    children: [
      { label: 'Dealers', href: '/admin/dealers', icon: Building2 },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Collections', href: '/admin/collections', icon: Banknote },
      { label: 'Warehouses', href: '/admin/warehouses', icon: Warehouse },
      { label: 'Vehicles', href: '/admin/vehicles', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Settings',
    href: '/admin/erp-settings',
    icon: Settings,
    children: [
      { label: 'ERP Systems', href: '/admin/erp-settings', icon: Boxes },
      { label: 'Audit Log', href: '/admin/audit-log', icon: ShieldCheck },
    ],
  },
]

interface AdminSidebarProps {
  className?: string
  onNavClick?: () => void
}

export function AdminSidebar({ className, onNavClick }: AdminSidebarProps) {
  const pathname = usePathname()
  const { selectedSystem } = useSelectedErp()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const industry = selectedSystem?.industry

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const filteredNav = navItems.filter(item => {
    if (!item.showForIndustry) return true
    return industry && item.showForIndustry.includes(industry)
  })

  return (
    <aside className={cn('fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col', className)}>
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-6 border-b border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <div>
          <h1 className="font-bold text-sm">ERP Hub</h1>
          <p className="text-[10px] text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {filteredNav.map(item => {
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expanded[item.label] ?? isActive(item.href)
            const active = !hasChildren && isActive(item.href)

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-800',
                      isActive(item.href) && 'bg-slate-800/80'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform', isExpanded && 'rotate-180')} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                      {item.children!.map(child => {
                        const childActive = isActive(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavClick}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-slate-800',
                              childActive
                                ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                                : 'text-slate-400'
                            )}
                          >
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-800',
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-slate-300'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-emerald-400' : 'text-slate-400')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        {selectedSystem && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {selectedSystem.color && (
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedSystem.color }} />
            )}
            <span>{selectedSystem.name}</span>
          </div>
        )}
      </div>
    </aside>
  )
}