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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Integrations', icon: Plug, path: '/admin/integrations', badge: 'LIVE' },
  { label: 'Clients', icon: Users, path: '/admin/clients' },
  { label: 'Deals', icon: Handshake, path: '/admin/deals' },
  { label: 'Finance', icon: DollarSign, path: '/admin/finance' },
  { label: 'Communications', icon: MessageSquare, path: '/admin/communications' },
  { label: 'Marketing', icon: Megaphone, path: '/admin/marketing' },
  { label: 'ERP Systems', icon: Boxes, path: '/admin/erp' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { label: 'System', icon: Settings, path: '/admin/system' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname()

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
            style={{
              background: 'radial-gradient(circle, color-mix(in srgb, var(--gg-vermillion) 30%, transparent), transparent)',
            }}
          />
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
            }}
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">ApexFlow</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="relative flex-1 px-3 py-4">
        <motion.nav
          className="flex flex-col gap-1"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + '/')

            return (
              <motion.div key={item.path} variants={itemVariants}>
                <Link
                  href={item.path}
                  onClick={onNavClick}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-[var(--gg-vermillion)]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  )}
                  style={
                    isActive
                      ? {
                          background:
                            'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)',
                        }
                      : undefined
                  }
                >
                  {/* Active left border glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full"
                      style={{
                        background: 'var(--gg-vermillion)',
                        boxShadow:
                          '0 0 8px color-mix(in srgb, var(--gg-vermillion) 50%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-all duration-200',
                      isActive
                        ? ''
                        : 'text-gray-500 group-hover:text-gray-300'
                    )}
                    style={isActive ? { color: 'var(--gg-vermillion)' } : undefined}
                  />
                  <span className="flex-1">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded-full leading-none animate-pulse"
                      style={{
                        background: 'color-mix(in srgb, #10b981 20%, transparent)',
                        color: '#10b981',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      className="ml-auto h-1.5 w-1.5 rounded-full"
                      style={{
                        background: 'var(--gg-vermillion)',
                        boxShadow:
                          '0 0 6px color-mix(in srgb, var(--gg-vermillion) 60%, transparent)',
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </motion.nav>
      </ScrollArea>

      {/* Footer */}
      <div
        className="px-3 py-3 space-y-1"
        style={{ borderTop: '1px solid var(--gg-separator)' }}
      >
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-white/5 transition-all duration-200"
          style={{
            // Using a CSS approach: default gray, teal on hover via inline style group
          }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-[var(--gg-teal)]" />
          <span className="transition-colors duration-200 group-hover:text-[var(--gg-teal)]">Back to Site</span>
        </Link>
        <p className="px-3 pt-1 text-xs text-gray-600">
          ApexFlow Cloud v1.0
        </p>
      </div>
    </div>
  )
}
