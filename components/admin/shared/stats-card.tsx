'use client'

import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  icon: ReactNode
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  iconBg?: string
}

export function StatsCard({ icon, label, value, change, changeLabel, iconBg = 'bg-primary/10' }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <Card className="border-border/60 hover:border-border transition-colors">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBg}`}>
            {icon}
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                isPositive
                  ? 'text-[var(--gg-green)] bg-[var(--gg-green)]/10'
                  : isNegative
                  ? 'text-[var(--gg-rose)] bg-[var(--gg-rose)]/10'
                  : 'text-muted-foreground bg-muted'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : isNegative ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
        {changeLabel && (
          <p className="text-[11px] text-muted-foreground mt-1">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
