'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Handshake,
  DollarSign,
  MessageSquare,
  Megaphone,
  BarChart3,
  Settings,
  Zap,
  ArrowLeft,
  Boxes,
  Plug,
  LifeBuoy,
  Repeat,
  KeyRound,
  ScrollText,
  Activity,
  Smartphone,
  FileText,
  CreditCard,
  Key,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  path: string
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'Activity Feed', icon: Activity, path: '/admin/activity', badge: 'NEW' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Clients', icon: Users, path: '/admin/clients' },
      { label: 'Deals', icon: Handshake, path: '/admin/deals' },
      { label: 'Support Tickets', icon: LifeBuoy, path: '/admin/support', badge: 'NEW' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Invoices', icon: FileText, path: '/admin/finance' },
      { label: 'Payments', icon: CreditCard, path: '/admin/payments', badge: 'NEW' },
      { label: 'Subscriptions', icon: Repeat, path: '/admin/subscriptions', badge: 'NEW' },
      { label: 'Licenses', icon: Key, path: '/admin/licenses', badge: 'NEW' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Campaigns', icon: Megaphone, path: '/admin/marketing' },
      { label: 'Communications', icon: MessageSquare, path: '/admin/communications' },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { label: 'Integration Hub', icon: Plug, path: '/admin/integrations', badge: 'LIVE' },
      { label: 'Sync Logs', icon: ScrollText, path: '/admin/sync-logs', badge: 'NEW' },
      { label: 'Devices', icon: Smartphone, path: '/admin/devices', badge: 'NEW' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'ERP Systems', icon: Boxes, path: '/admin/erp' },
      { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
      { label: 'Users & Roles', icon: KeyRound, path: '/admin/system/users' },
      { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit', badge: 'NEW' },
      { label: 'System Settings', icon: Settings, path: '/admin/system' },
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  // Auto-expand the group containing the active route
  const activeGroup = navGroups.find((g) =>
    g.items.some((i) => pathname === i.path || pathname.startsWith(i.path + '/'))
  )
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(activeGroup ? [activeGroup.label] : ['Overview', 'CRM'])
  )

  const toggleGroup = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className={cn('flex h-full flex-col bg-gradient-to-b from-gray-950 to-gray-900', className)}>
      {/* Subtle vermillion gradient overlay at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--gg-vermillion) 8%, transparent) 0%, transparent 100%)',
        }}
      />

      {/* Logo */}
      <div
        className="relative flex h-16 items-center gap-2 px-4"
        style={{ borderBottom: '1px solid var(--gg-separator)' }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-lg blur-md"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--gg-vermillion) 30%, transparent), transparent)' }}
          />
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">ApexFlow</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="relative flex-1 px-3 py-3">
        <motion.nav
          className="flex flex-col gap-1"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {navGroups.map((group) => {
            const isExpanded = expanded.has(group.label)
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform duration-200',
                      isExpanded ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-0.5 pt-1">
                        {group.items.map((item) => {
                          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
                          return (
                            <motion.div key={item.path} variants={itemVariants}>
                              <Link
                                href={item.path}
                                onClick={onNavClick}
                                className={cn(
                                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                  isActive
                                    ? 'text-[var(--gg-vermillion)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                )}
                                style={
                                  isActive
                                    ? { background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)' }
                                    : undefined
                                }
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full"
                                    style={{
                                      background: 'var(--gg-vermillion)',
                                      boxShadow: '0 0 8px color-mix(in srgb, var(--gg-vermillion) 50%, transparent)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                  />
                                )}
                                <item.icon
                                  className={cn('h-4 w-4 shrink-0 transition-all duration-200', isActive ? '' : 'text-gray-500 group-hover:text-gray-300')}
                                  style={isActive ? { color: 'var(--gg-vermillion)' } : undefined}
                                />
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 text-[9px] font-bold rounded-full leading-none',
                                      item.badge === 'LIVE'
                                        ? 'animate-pulse'
                                        : ''
                                    )}
                                    style={
                                      item.badge === 'LIVE'
                                        ? { background: 'color-mix(in srgb, #10b981 20%, transparent)', color: '#10b981' }
                                        : { background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)', color: 'var(--gg-vermillion)' }
                                    }
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.nav>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-3 space-y-1" style={{ borderTop: '1px solid var(--gg-separator)' }}>
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-white/5 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-[var(--gg-teal)]" />
          <span className="transition-colors duration-200 group-hover:text-[var(--gg-teal)]">Back to Site</span>
        </Link>
        <p className="px-3 pt-1 text-xs text-gray-600">ApexFlow Cloud Enterprise v2.0</p>
      </div>
    </div>
  )
}
