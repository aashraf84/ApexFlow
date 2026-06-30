'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Menu, LogOut, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string | null
  }
  onMenuClick: () => void
}

// Map of path prefixes to page titles and section subtitles
const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Overview & Analytics' },
  '/admin/clients': { title: 'Clients', subtitle: 'CRM & Contacts' },
  '/admin/deals': { title: 'Deals', subtitle: 'Pipeline Management' },
  '/admin/finance': { title: 'Finance', subtitle: 'Billing & Revenue' },
  '/admin/communications': { title: 'Communications', subtitle: 'Support & Messaging' },
  '/admin/marketing': { title: 'Marketing', subtitle: 'Campaigns & Social' },
  '/admin/erp': { title: 'ERP Systems', subtitle: '21 Industry ERPs' },
  '/admin/reports': { title: 'Reports', subtitle: 'Analytics & Insights' },
  '/admin/system': { title: 'System', subtitle: 'Settings & Configuration' },
}

function getPageMeta(pathname: string): { title: string; subtitle: string } {
  // Exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname]

  // Prefix match for sub-routes
  const sortedPaths = Object.keys(PAGE_META).sort(
    (a, b) => b.length - a.length
  )
  for (const path of sortedPaths) {
    if (pathname.startsWith(path + '/')) return PAGE_META[path]
  }

  return { title: 'Admin', subtitle: 'Control Panel' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { title, subtitle } = getPageMeta(pathname)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors, still redirect
    }
    router.push('/admin/login')
  }

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-4 backdrop-blur-xl px-4 sm:px-6"
      style={{
        background: 'linear-gradient(to right, color-mix(in srgb, var(--background) 90%, transparent), color-mix(in srgb, var(--card) 90%, transparent), color-mix(in srgb, var(--background) 90%, transparent))',
        borderBottom: '1px solid var(--gg-separator)',
      }}
    >
      {/* Golden Gate gradient separator line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gg-vermillion), var(--gg-amber), transparent)',
          opacity: 0.6,
        }}
      />

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-400 hover:text-white hover:bg-white/5"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title with breadcrumb subtitle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-gray-600 shrink-0" />
          <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
          <span
            className="hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border"
            style={{
              background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
              color: 'var(--gg-vermillion)',
              borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 hover:bg-white/5"
          >
            <Avatar
              className="h-8 w-8 ring-2 ring-transparent transition-all duration-200"
              style={{ '--tw-ring-color': 'color-mix(in srgb, var(--gg-vermillion) 50%, transparent)' } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('--tw-ring-opacity', '1')
                e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--gg-vermillion) 50%, transparent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px transparent'
              }}
            >
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback
                className="text-xs font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
                  color: 'var(--gg-vermillion)',
                }}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm text-gray-200 font-medium">
              {user.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p
                className="text-xs capitalize"
                style={{ color: 'var(--gg-vermillion)' }}
              >
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/system')}>
              <User className="mr-2 h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
