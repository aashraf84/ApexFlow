'use client'

import { useState, useRef, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════════ */
/*  InteractiveCard — macOS 27 Golden Gate Edition                */
/*  Frosted glass, warm vermillion glow, layered depth           */
/* ═══════════════════════════════════════════════════════════════ */

/* Helper: resolve glowColor to a proper rgba for canvas-style usage */
function hexToRgba(hex: string, alpha: number): string {
  // Handle CSS variables — return a CSS color-mix fallback
  if (hex.startsWith('var(')) {
    const pct = Math.round(alpha * 100)
    return `color-mix(in srgb, ${hex} ${pct}%, transparent)`
  }
  // Handle hex colors
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2]
  }
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/* Helper: build a warm vermillion→amber gradient string for shimmer */
function warmShimmerGradient(primary: string, secondary: string): string {
  const primaryMix = primary.startsWith('var(')
    ? `color-mix(in srgb, ${primary} 8%, transparent)`
    : hexToRgba(primary, 0.08)
  const secondaryMix = secondary.startsWith('var(')
    ? `color-mix(in srgb, ${secondary} 5%, transparent)`
    : hexToRgba(secondary, 0.05)
  return `linear-gradient(105deg, transparent 35%, ${primaryMix} 45%, ${secondaryMix} 50%, ${primaryMix} 55%, transparent 65%)`
}

export interface InteractiveCardProps {
  children: ReactNode
  /** Accent color for glow (hex or CSS var). Default: var(--gg-vermillion) */
  glowColor?: string
  /** Secondary accent for shimmer sweep. Default: var(--gg-amber) */
  shimmerColor?: string
  /** Hover scale. Default 1.02 */
  hoverScale?: number
  /** Hover y-shift in px. Default -4 */
  hoverY?: number
  /** Additional className on the outer wrapper */
  className?: string
  /** onClick handler */
  onClick?: () => void
  /** HTML role */
  role?: string
  /** tabIndex for keyboard navigation */
  tabIndex?: number
  /** aria-label */
  ariaLabel?: string
  /** Disable all effects */
  disabled?: boolean
  /** Show cursor-following spotlight. Default true */
  spotlight?: boolean
  /** Variant: subtle | default | strong */
  variant?: 'default' | 'subtle' | 'strong'
}

export function InteractiveCard({
  children,
  glowColor = 'var(--gg-vermillion)',
  shimmerColor = 'var(--gg-amber)',
  hoverScale = 1.02,
  hoverY = -4,
  className = '',
  onClick,
  role,
  tabIndex,
  ariaLabel,
  disabled = false,
  spotlight = true,
  variant = 'default',
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  /* Variant configs — warm Golden Gate palette */
  const cfg = {
    default: { scale: hoverScale, y: hoverY, glowAlpha: 0.18, borderAlpha: 0.35, spotlightAlpha: 0.04 },
    subtle: { scale: 1.008, y: -2, glowAlpha: 0.09, borderAlpha: 0.18, spotlightAlpha: 0.02 },
    strong: { scale: 1.04, y: -6, glowAlpha: 0.28, borderAlpha: 0.55, spotlightAlpha: 0.07 },
  }[variant]

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      whileHover={{ y: cfg.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
    >
      {/* ── Warm vermillion glow backdrop — follows cursor ── */}
      <div
        className="absolute -inset-[1px] pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          borderRadius: '1rem',
          background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${hexToRgba(glowColor, cfg.glowAlpha)}, transparent 40%)`,
        }}
      />

      {/* ── Cursor-following warm spotlight ── */}
      {spotlight && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 overflow-hidden"
          style={{ opacity: isHovered ? 1 : 0, borderRadius: '1rem' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(300px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${hexToRgba(glowColor, cfg.spotlightAlpha)}, transparent 50%)`,
            }}
          />
          {/* Inner warm tint that follows cursor — frosted glass warmth */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(250px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, color-mix(in srgb, ${shimmerColor} 3%, transparent), transparent 60%)`,
            }}
          />
        </div>
      )}

      {/* ── Shimmer sweep on hover — vermillion→amber ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease', borderRadius: '1rem' }}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-card-shimmer"
          style={{
            background: warmShimmerGradient(glowColor, shimmerColor),
          }}
        />
      </div>

      {/* ── Card content — frosted glass with warm tint, dynamic border + shadow ── */}
      <motion.div
        className="relative h-full flex-1 flex flex-col min-h-0"
        animate={{ scale: isHovered ? cfg.scale : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
        style={{
          /* Frosted glass with warm tint */
          borderRadius: '1rem',
          background: isHovered
            ? 'color-mix(in srgb, var(--card) 82%, color-mix(in srgb, var(--gg-vermillion) 4%, transparent))'
            : 'var(--card)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          /* Border — warm vermillion glow on hover */
          border: isHovered
            ? `1px solid ${hexToRgba(glowColor, cfg.borderAlpha)}`
            : '1px solid var(--border)',
          /* Shadow — layered Golden Gate shadows */
          boxShadow: isHovered
            ? `var(--gg-shadow-card-hover), 0 0 24px ${hexToRgba(glowColor, 0.1)}, 0 0 48px ${hexToRgba(glowColor, 0.04)}`
            : 'var(--gg-shadow-card)',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
