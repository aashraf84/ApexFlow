'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Building2,
  Handshake,
  Wallet,
  MessageCircle,
  Megaphone,
  Settings2,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plug,
  Radio,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Integrations', href: '/admin/integrations', icon: Plug, badge: 'LIVE' },
  { label: 'Clients', href: '/admin/clients', icon: Building2 },
  { label: 'Deals', href: '/admin/deals', icon: Handshake },
  { label: 'Finance', href: '/admin/finance', icon: Wallet },
  { label: 'Communications', href: '/admin/communications', icon: MessageCircle },
  { label: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { label: 'System', href: '/admin/system', icon: Settings2 },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-[68px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-lg font-bold">ApexFlow</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  !sidebarOpen && 'justify-center'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && (
                  <span className="flex-1">{item.label}</span>
                )}
                {sidebarOpen && 'badge' in item && item.badge && (
                  <span className={cn(
                    'px-1.5 py-0.5 text-[9px] font-bold rounded-full leading-none',
                    item.badge === 'LIVE' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 animate-pulse'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )

            if (!sidebarOpen) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </div>
      </nav>
    </aside>
  )
}
