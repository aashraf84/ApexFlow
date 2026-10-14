'use client'

import { SiteHeader } from '@/components/shared/site-header'
import { SiteFooter } from '@/components/shared/site-footer'
import { type ReactNode } from 'react'

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Skip-to-content link — a11y: keyboard users jump past the header nav */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-22 w-full">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
