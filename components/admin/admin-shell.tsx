'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface AdminShellProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string | null
  }
  children: React.ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMenuClick = useCallback(() => {
    setMobileOpen(true)
  }, [])

  const handleNavClick = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Subtle background atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 10% 20%, color-mix(in srgb, var(--gg-vermillion) 3%, transparent) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 80%, color-mix(in srgb, var(--gg-amber) 2%, transparent) 0%, transparent 50%)
          `,
        }}
      />

      {/* Desktop sidebar — always visible on lg+, fixed height, never scrolls with page */}
      <aside
        className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:h-full lg:overflow-hidden relative z-10"
        style={{ borderRight: '1px solid var(--gg-separator)' }}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar — Sheet/drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0"
          style={{ background: 'var(--card)', borderRight: '1px solid var(--gg-separator)' }}
        >
          <Sidebar onNavClick={handleNavClick} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Header user={user} onMenuClick={handleMenuClick} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
