'use client'

import { Badge } from '@/components/ui/badge'

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface StatusBadgeProps {
  variant: StatusVariant
  children: React.ReactNode
  size?: BadgeSize
  dot?: boolean
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20',
  warning: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
  error: 'bg-[var(--gg-rose)]/10 text-[var(--gg-rose)] border-[var(--gg-rose)]/20',
  info: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
  neutral: 'bg-muted text-muted-foreground border-border',
}

const dotColors: Record<StatusVariant, string> = {
  success: 'bg-[var(--gg-green)]',
  warning: 'bg-[var(--gg-amber)]',
  error: 'bg-[var(--gg-rose)]',
  info: 'bg-[var(--gg-teal)]',
  neutral: 'bg-muted-foreground',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0 leading-4',
  md: 'text-xs px-2 py-0.5',
}

export function StatusBadge({ variant, children, size = 'sm', dot = true }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${variantStyles[variant]} ${sizeStyles[size]} font-medium gap-1`}
    >
      {dot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </Badge>
  )
}
