'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface RevenuePoint {
  month: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenuePoint[]
  trend?: number
}

function formatPKR(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export function RevenueChart({ data, trend }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null
    const maxVal = Math.max(...data.map((d) => d.revenue), 1)
    const minVal = Math.min(...data.map((d) => d.revenue))
    const range = maxVal - minVal || 1
    const w = 600
    const h = 240
    const padX = 40
    const padY = 20
    const chartW = w - padX * 2
    const chartH = h - padY * 2

    const points = data.map((d, i) => ({
      x: padX + (i / Math.max(data.length - 1, 1)) * chartW,
      y: padY + chartH - ((d.revenue - minVal) / range) * chartH,
      ...d,
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`

    return { points, linePath, areaPath, w, h, padX, padY, chartH, maxVal, minVal }
  }, [data])

  if (!chartData) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
            No revenue data available yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = trend !== undefined && trend >= 0

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
          {trend !== undefined && trend !== 0 && (
            <Badge variant="outline" className={`gap-1 text-xs ${isPositive ? 'text-[var(--gg-green)] border-[var(--gg-green)]/20 bg-[var(--gg-green)]/5' : 'text-[var(--gg-rose)] border-[var(--gg-rose)]/20 bg-[var(--gg-rose)]/5'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Monthly revenue in PKR</p>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${chartData.w} ${chartData.h}`} className="w-full h-60" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gg-teal)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--gg-teal)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((frac) => (
            <line key={frac} x1={chartData.padX} y1={chartData.padY + chartData.chartH * frac} x2={chartData.w - chartData.padX} y2={chartData.padY + chartData.chartH * frac} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
          ))}
          <path d={chartData.areaPath} fill="url(#areaGrad)" />
          <path d={chartData.linePath} fill="none" stroke="var(--gg-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {chartData.points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--gg-teal)" stroke="hsl(var(--background))" strokeWidth="2" />
              <text x={p.x} y={chartData.padY + chartData.chartH + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{p.month}</text>
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-muted-foreground text-[9px]">{formatPKR(p.revenue)}</text>
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  )
}
