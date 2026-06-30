'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { SelectedErpProvider } from '@/hooks/use-selected-erp'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setAuthenticated(true)
        } else {
          window.location.href = '/login'
        }
      })
      .catch(() => {
        window.location.href = '/login'
      })
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <SelectedErpProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar onNavClick={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main area */}
        <div className="lg:ml-64">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SelectedErpProvider>
  )
}