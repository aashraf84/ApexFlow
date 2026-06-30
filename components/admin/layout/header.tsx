'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Menu, LogOut, Settings } from 'lucide-react'

const PATH_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/clients': 'Clients',
  '/admin/deals': 'Deals',
  '/admin/finance': 'Finance',
  '/admin/communications': 'Communications',
  '/admin/marketing': 'Marketing',
  '/admin/system': 'System',
  '/admin/reports': 'Reports',
}

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { adminUser, setAdminUser, setSidebarOpen } = useAppStore()

  const title = PATH_TITLES[pathname] || 'Admin Panel'

  const handleLogout = () => {
    setAdminUser(null)
    router.push('/admin/login')
  }

  const initials = adminUser?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'A'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-card px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">{adminUser?.name || 'Admin'}</span>
                <span className="text-xs text-muted-foreground capitalize">{adminUser?.role || 'admin'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/admin/system')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
