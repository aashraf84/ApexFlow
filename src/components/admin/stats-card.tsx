'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: { value: number; label: string }
  isLoading?: boolean
  className?: string
}

export function StatsCard({ title, value, icon: Icon, description, trend, isLoading, className }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 mt-3" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={cn('font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {trend && description && ' '}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}