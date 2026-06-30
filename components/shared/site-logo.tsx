'use client'

import Link from 'next/link'
import { useSiteSettings } from '@/lib/site-settings-store'
import { motion } from 'framer-motion'

/**
 * SiteLogo — Premium interactive logo with Outfit display font.
 *
 * Features:
 * - "Apex" in Black (900) foreground with Outfit display font
 * - "Flow" with animated golden gradient (shimmer) + micro-glow
 * - Hover: letter-spacing expands, "Apex" warms to vermillion, "Flow" intensifies
 * - Golden underline accent that slides in on hover
 * - Scale lift + glow on hover
 *
 * Variants:
 * - "full"  → Full "ApexFlow" text
 * - "icon"  → Compact "AF" monogram
 */
interface SiteLogoProps {
  variant?: 'full' | 'icon'
  size?: number
  href?: string
  className?: string
  onClick?: () => void
}

export function SiteLogo({
  variant = 'full',
  size: sizeProp,
  href = '/',
  className = '',
  onClick,
}: SiteLogoProps) {
  const { getSetting } = useSiteSettings()

  const settingsLogoHeight = getSetting('site_logo_height', '36')
  const size = sizeProp ?? (parseInt(settingsLogoHeight, 10) || 36)

  const siteName = getSetting('site_name', 'ApexFlow')
  const firstPart = siteName.substring(0, Math.ceil(siteName.length / 2))
  const secondPart = siteName.substring(Math.ceil(siteName.length / 2))

  const isFull = variant === 'full'
  const fontSize = isFull ? `${size * 0.72}px` : `${size * 0.55}px`

  // ── Full variant: "ApexFlow" ──
  const fullLogo = (
    <span
      className="site-logo-root inline-flex items-baseline shrink-0 select-none group"
      style={{ lineHeight: 1 }}
    >
      <span
        className="site-logo-text inline-flex items-baseline transition-all duration-300 ease-out group-hover:tracking-[0.14em]"
        style={{
          fontSize,
          fontWeight: 900,
          fontFamily: 'var(--font-display), sans-serif',
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        <span className="site-logo-first text-foreground">{firstPart}</span>
        <span
          className="site-logo-second text-gradient-golden animate-gradient-text"
          style={{ backgroundSize: '200% auto' }}
        >
          {secondPart}
        </span>
      </span>

      {/* Animated underline accent */}
      <motion.span
        className="site-logo-underline absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, var(--gg-vermillion), var(--gg-amber), var(--gg-rose))',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      <span className="sr-only">{siteName}</span>
    </span>
  )

  // ── Icon variant: "AF" monogram ──
  const iconLogo = (
    <span
      className="site-logo-root inline-flex items-center justify-center shrink-0 select-none group"
      style={{ lineHeight: 1 }}
    >
      <span
        className="inline-flex items-baseline transition-all duration-300 ease-out"
        style={{
          fontSize,
          fontWeight: 900,
          fontFamily: 'var(--font-display), sans-serif',
          letterSpacing: '0.06em',
          lineHeight: 1,
        }}
      >
        <span className="site-logo-first text-foreground">
          {siteName.charAt(0)}
        </span>
        <span
          className="site-logo-second text-gradient-golden animate-gradient-text"
          style={{ backgroundSize: '200% auto' }}
        >
          {siteName.charAt(Math.ceil(siteName.length / 2))}
        </span>
      </span>
      <span className="sr-only">{siteName}</span>
    </span>
  )

  const logoElement = isFull ? fullLogo : iconLogo

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        className={`site-logo-container flex items-center shrink-0 relative ${className}`}
        style={{ height: `${size}px` }}
        aria-label={siteName}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {logoElement}
      </motion.button>
    )
  }

  return (
    <Link
      href={href}
      className={`site-logo-container flex items-center shrink-0 relative ${className}`}
      style={{ height: `${size}px` }}
      aria-label={siteName}
    >
      {logoElement}
    </Link>
  )
}
