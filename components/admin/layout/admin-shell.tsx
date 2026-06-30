'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { AdminSidebar } from './sidebar'
import { AdminHeader } from './header'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'ml-64' : 'ml-[68px]'
        )}
      >
        <AdminHeader />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
