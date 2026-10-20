'use client'

// ═══════════════════════════════════════════════════════════════════════════
// ApexFlow Enterprise · Reports Center
// Professional enterprise reports module with print-ready letterhead layout.
// Pure CSS/SVG charts (no external chart libraries). Theme-aware. Print-aware.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  RefreshCw,
  Loader2,
  Printer,
  Save,
  Trash2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Users,
  CreditCard,
  LifeBuoy,
  Plug,
  DollarSign,
  FileText,
  BookmarkCheck,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  FileSpreadsheet,
  Braces,
  Building2,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType =
  | 'sales'
  | 'clients'
  | 'subscriptions'
  | 'support'
  | 'integrations'
  | 'financial'
type RangePreset = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom'

interface SummaryStat {
  label: string
  value: number
  format: 'currency' | 'number' | 'percent'
  trend?: number
}

interface ChartDatum {
  label: string
  value: number
  count?: number
  secondary?: number
}

interface ChartConfig {
  kind: 'bar' | 'line' | 'donut'
  title: string
  data: ChartDatum[]
  yLabel?: string
}

interface ReportTable {
  name: string
  columns: string[]
  rows: Record<string, unknown>[]
}

interface ReportPayload {
  type: string
  range: { from: string | null; to: string | null }
  generatedAt: string
  title: string
  description: string
  summary?: SummaryStat[]
  charts?: ChartConfig[]
  tables?: ReportTable[]
  meta?: Record<string, unknown>
}

interface SavedReport {
  id: string
  name: string
  type: string
  dateRange: string
  data: string
  generatedAt: string
  createdAt: string
  updatedAt: string
}

// ─── Categories ─────────────────────────────────────────────────────────────────

const CATEGORIES: {
  id: ReportType
  label: string
  short: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}[] = [
  {
    id: 'sales',
    label: 'Sales & Revenue',
    short: 'Revenue',
    description: 'Revenue by month, by ERP system, top clients, payment success rate.',
    icon: DollarSign,
    accent: 'var(--gg-vermillion)',
  },
  {
    id: 'clients',
    label: 'Clients & CRM',
    short: 'Clients',
    description: 'Client growth, distribution by status / ERP, retention metrics.',
    icon: Users,
    accent: 'var(--gg-teal)',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions & Licenses',
    short: 'Subs',
    description: 'Active subscriptions, MRR by plan, license utilization, churn.',
    icon: CreditCard,
    accent: 'var(--gg-amber)',
  },
  {
    id: 'support',
    label: 'Support',
    short: 'Support',
    description: 'Tickets by status / priority, average resolution time, agent perf.',
    icon: LifeBuoy,
    accent: 'var(--gg-rose)',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    short: 'Sync',
    description: 'Sync success rate, records synced by ERP, duration trends, errors.',
    icon: Plug,
    accent: 'var(--gg-violet)',
  },
  {
    id: 'financial',
    label: 'Financial',
    short: 'Finance',
    description: 'Outstanding invoices, gateway breakdown, revenue vs. expenses.',
    icon: FileText,
    accent: 'var(--gg-cyan)',
  },
]

const PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  year: 'This Year',
  custom: 'Custom',
}

const PRESETS: RangePreset[] = ['today', '7d', '30d', '90d', 'year', 'custom']

// Donut color palette (Golden Gate-inspired)
const DONUT_COLORS = [
  'var(--gg-vermillion)',
  'var(--gg-amber)',
  'var(--gg-teal)',
  'var(--gg-violet)',
  'var(--gg-rose)',
  'var(--gg-cyan)',
  'var(--gg-green)',
  '#f97316',
]

// ─── Style constants ───────────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--card)',
  borderColor: 'var(--gg-separator)',
  boxShadow: 'var(--gg-shadow-card)',
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--card)',
  borderColor: 'var(--gg-separator-strong)',
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = 'PKR') {
  if (!value || isNaN(value)) value = 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'PKR' ? 'PKR' : currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

function formatNumber(value: number) {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value: number) {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  return `${value.toFixed(1)}%`
}

function formatValue(value: unknown, format: 'currency' | 'number' | 'percent' = 'number') {
  const num = typeof value === 'number' ? value : Number(value) || 0
  if (format === 'currency') return formatCurrency(num)
  if (format === 'percent') return formatPercent(num)
  return formatNumber(num)
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') {
    // Round to 2 decimals if non-integer
    if (!Number.isInteger(value)) return value.toFixed(2)
    return formatNumber(value)
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  const s = String(value)
  // ISO date → YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10)
  return s
}

function escapeCsv(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getRangeFromPreset(
  preset: RangePreset,
  customFrom?: string,
  customTo?: string
): { from: string; to: string } {
  const now = new Date()
  let from = new Date()
  let to = new Date()
  switch (preset) {
    case 'today':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case '7d':
      from = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      from = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      from = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      from = new Date(now.getFullYear(), 0, 1)
      break
    case 'custom':
      if (customFrom) from = new Date(customFrom)
      if (customTo) to = new Date(customTo)
      break
  }
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

// ─── Status badge helpers ─────────────────────────────────────────────────────

function isNumericValue(v: unknown): boolean {
  if (typeof v === 'number') return true
  if (v === null || v === undefined || v === '') return false
  const n = Number(v)
  return !isNaN(n) && isFinite(n)
}

function isStatusColumn(col: string): boolean {
  const c = col.toLowerCase().trim()
  return c === 'status' || c === 'state' || c === 'state '
}

const STATUS_TONES: { keywords: string[]; bg: string; fg: string }[] = [
  // Positive — green
  {
    keywords: ['active', 'paid', 'completed', 'succeeded', 'resolved', 'connected', 'success', 'live', 'delivered'],
    bg: 'color-mix(in srgb, var(--gg-teal) 18%, transparent)',
    fg: 'var(--gg-teal)',
  },
  // Neutral / in-progress — amber
  {
    keywords: ['pending', 'processing', 'trial', 'open', 'in progress', 'draft', 'unassigned', 'partial', 'in-progress'],
    bg: 'color-mix(in srgb, var(--gg-amber) 18%, transparent)',
    fg: 'var(--gg-amber)',
  },
  // Warning / overdue — orange-rose
  {
    keywords: ['past due', 'past_due', 'overdue', 'warning', 'due'],
    bg: 'color-mix(in srgb, var(--gg-amber) 22%, transparent)',
    fg: 'var(--gg-amber)',
  },
  // Negative — rose
  {
    keywords: ['cancelled', 'canceled', 'failed', 'expired', 'suspended', 'disconnected', 'revoked', 'error', 'refunded', 'declined', 'void'],
    bg: 'color-mix(in srgb, var(--gg-rose) 18%, transparent)',
    fg: 'var(--gg-rose)',
  },
  // Closed / inactive — muted
  {
    keywords: ['inactive', 'closed', 'cancelled', 'paused'],
    bg: 'color-mix(in srgb, var(--muted-foreground) 18%, transparent)',
    fg: 'var(--muted-foreground)',
  },
]

function statusToneFor(value: string): { bg: string; fg: string } | null {
  const v = value.toLowerCase().trim()
  if (!v) return null
  for (const tone of STATUS_TONES) {
    if (tone.keywords.some((k) => v === k || v.includes(k))) {
      return { bg: tone.bg, fg: tone.fg }
    }
  }
  return null
}

// ─── Trend indicator ──────────────────────────────────────────────────────────

function TrendIndicator({ trend }: { trend: number | undefined }) {
  if (trend === undefined || trend === null || isNaN(trend)) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
        style={{
          background: 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)',
          color: 'var(--muted-foreground)',
        }}
      >
        <Minus className="h-3 w-3" />
        N/A
      </span>
    )
  }
  const isUp = trend > 0
  const isFlat = Math.abs(trend) < 0.05
  const isDown = trend < 0
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown
  const color = isFlat
    ? 'var(--muted-foreground)'
    : isUp
    ? 'var(--gg-teal)'
    : 'var(--gg-rose)'
  const bg = isFlat
    ? 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)'
    : isUp
    ? 'color-mix(in srgb, var(--gg-teal) 15%, transparent)'
    : 'color-mix(in srgb, var(--gg-rose) 15%, transparent)'
  const label = isFlat ? '0%' : `${isUp ? '+' : ''}${trend.toFixed(1)}%`
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
      style={{ background: bg, color }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

// ─── KPI tile ─────────────────────────────────────────────────────────────────

function KpiTile({ stat, icon: Icon }: { stat: SummaryStat; icon?: React.ComponentType<{ className?: string }> }) {
  const isCurrency = stat.format === 'currency'
  const isPercent = stat.format === 'percent'
  const accent = isCurrency
    ? 'var(--gg-vermillion)'
    : isPercent
    ? 'var(--gg-amber)'
    : 'var(--gg-teal)'
  return (
    <div
      className="kpi-tile rounded-xl border p-4 flex flex-col gap-1 min-w-0"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--gg-separator)',
        boxShadow: 'var(--gg-shadow-xs)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">
          {stat.label}
        </p>
        {Icon ? (
          <span
            className="shrink-0 rounded-md p-1"
            style={{
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              color: accent,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <p
        className="text-2xl font-bold leading-tight truncate"
        style={{ color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatValue(stat.value, stat.format)}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <TrendIndicator trend={stat.trend} />
        <span className="text-[10px] text-muted-foreground">vs. prev. period</span>
      </div>
    </div>
  )
}

// ─── Bar Chart (pure CSS divs) ────────────────────────────────────────────────

function BarChartCard({
  chart,
  supportSecondary,
}: {
  chart: ChartConfig
  supportSecondary?: boolean
}) {
  const data = chart.data || []
  const maxValue = Math.max(
    1,
    ...data.map((d) => d.value),
    ...(supportSecondary ? data.map((d) => d.secondary || 0) : [])
  )
  return (
    <div
      className="report-chart rounded-xl border p-4 break-inside-avoid"
      style={CARD_STYLE}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
        <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
      </div>
      <div className="flex items-end justify-between gap-2 h-48 px-1">
        {data.length === 0 ? (
          <div className="w-full text-center text-sm text-muted-foreground py-12">
            No data available for this range.
          </div>
        ) : (
          data.map((d, i) => {
            const pct = Math.round((d.value / maxValue) * 100)
            const secPct = supportSecondary
              ? Math.round(((d.secondary || 0) / maxValue) * 100)
              : 0
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-1 h-full min-w-0 group"
              >
                <div className="text-[10px] font-semibold text-foreground whitespace-nowrap opacity-70 group-hover:opacity-100">
                  {d.value > 0 ? formatNumber(d.value) : ''}
                </div>
                <div className="w-full flex items-end gap-0.5 h-full justify-center">
                  {supportSecondary && (
                    <div
                      className="flex-1 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${secPct}%`,
                        minHeight: '4px',
                        background: 'var(--gg-separator-strong)',
                      }}
                      title={`Collected: ${formatNumber(d.secondary || 0)}`}
                    />
                  )}
                  <div
                    className="flex-1 rounded-t-md transition-all duration-300 hover:opacity-90"
                    style={{
                      height: `${pct}%`,
                      minHeight: '6px',
                      background:
                        'linear-gradient(180deg, var(--gg-vermillion), var(--gg-amber))',
                      boxShadow:
                        '0 0 12px -2px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)',
                    }}
                    title={`${d.label}: ${formatNumber(d.value)}${d.count ? ` (${formatNumber(d.count)})` : ''}`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground truncate w-full text-center">
                  {d.label}
                </div>
              </div>
            )
          })
        )}
      </div>
      {supportSecondary && (
        <div className="flex items-center justify-end gap-3 mt-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: 'var(--gg-vermillion)' }}
            />
            Invoiced
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: 'var(--gg-separator-strong)' }}
            />
            Collected
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Line Chart (pure SVG) ─────────────────────────────────────────────────────

function LineChartCard({ chart }: { chart: ChartConfig }) {
  const data = chart.data || []
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const w = 100
  const h = 100
  // Stable gradient ID — computed once, before any conditional returns
  const gradId = useMemo(
    () => `line-grad-${Math.random().toString(36).slice(2, 9)}`,
    []
  )
  if (data.length === 0) {
    return (
      <div
        className="report-chart rounded-xl border p-4 break-inside-avoid"
        style={CARD_STYLE}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
          <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
          No data available for this range.
        </div>
      </div>
    )
  }
  // Build SVG polyline points
  const points = data
    .map((d, i) => {
      const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w
      const y = h - (d.value / maxValue) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <div
      className="report-chart rounded-xl border p-4 break-inside-avoid"
      style={CARD_STYLE}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
        <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
      </div>
      <div className="relative w-full" style={{ height: '200px' }}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gg-vermillion)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--gg-vermillion)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={`0,${h} ${points} ${w},${h}`}
            fill={`url(#${gradId})`}
            stroke="none"
          />
          <polyline
            points={points}
            fill="none"
            stroke="var(--gg-vermillion)"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {data.map((d, i) => {
            const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w
            const y = h - (d.value / maxValue) * h
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.75"
                fill="var(--gg-amber)"
                stroke="var(--gg-vermillion)"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              >
                <title>{`${d.label}: ${formatNumber(d.value)}`}</title>
              </circle>
            )
          })}
        </svg>
      </div>
      <div className="flex flex-wrap justify-between mt-2 gap-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────────

function DonutChartCard({ chart }: { chart: ChartConfig }) {
  const data = (chart.data || []).filter((d) => d.value > 0)
  const total = data.reduce((a, b) => a + b.value, 0)
  if (data.length === 0 || total === 0) {
    return (
      <div
        className="report-chart rounded-xl border p-4 break-inside-avoid"
        style={CARD_STYLE}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
          <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
          No data available for this range.
        </div>
      </div>
    )
  }
  const cx = 50
  const cy = 50
  const rOuter = 40
  const rInner = 24
  let angle = -Math.PI / 2
  const segments: {
    path: string
    color: string
    label: string
    value: number
    pct: number
  }[] = []
  for (const d of data) {
    const slice = (d.value / total) * Math.PI * 2
    const a1 = angle
    const a2 = angle + slice
    const x1o = cx + rOuter * Math.cos(a1)
    const y1o = cy + rOuter * Math.sin(a1)
    const x2o = cx + rOuter * Math.cos(a2)
    const y2o = cy + rOuter * Math.sin(a2)
    const x1i = cx + rInner * Math.cos(a2)
    const y1i = cy + rInner * Math.sin(a2)
    const x2i = cx + rInner * Math.cos(a1)
    const y2i = cy + rInner * Math.sin(a1)
    const large = slice > Math.PI ? 1 : 0
    const path = [
      `M ${x1o} ${y1o}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${x2i} ${y2i}`,
      'Z',
    ].join(' ')
    segments.push({
      path,
      color: DONUT_COLORS[segments.length % DONUT_COLORS.length],
      label: d.label,
      value: d.value,
      pct: (d.value / total) * 100,
    })
    angle = a2
  }
  return (
    <div
      className="report-chart rounded-xl border p-4 break-inside-avoid"
      style={CARD_STYLE}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
        <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0">
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              stroke="var(--card)"
              strokeWidth="0.5"
            >
              <title>{`${s.label}: ${formatNumber(s.value)} (${s.pct.toFixed(1)}%)`}</title>
            </path>
          ))}
          <text
            x="50"
            y="46"
            textAnchor="middle"
            dy="0.3em"
            className="fill-foreground"
            style={{ fontSize: '7px', fontWeight: 'bold' }}
          >
            TOTAL
          </text>
          <text
            x="50"
            y="55"
            textAnchor="middle"
            dy="0.3em"
            className="fill-foreground"
            style={{ fontSize: '11px', fontWeight: 'bold' }}
          >
            {formatNumber(total)}
          </text>
        </svg>
        <div className="flex-1 min-w-[140px] space-y-1 max-h-40 overflow-y-auto pr-1">
          {segments.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 text-xs py-0.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-foreground truncate">{s.label}</span>
              </div>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {formatNumber(s.value)} · {s.pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Professional sortable table ──────────────────────────────────────────────

function ProfessionalTable({ table }: { table: ReportTable }) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortCol) return table.rows
    const copy = [...table.rows]
    copy.sort((a, b) => {
      const av = a[sortCol]
      const bv = b[sortCol]
      const aNum = typeof av === 'number' ? av : Number(av)
      const bNum = typeof bv === 'number' ? bv : Number(bv)
      const aNaN = isNaN(aNum)
      const bNaN = isNaN(bNum)
      if (aNaN && bNaN) {
        const as = String(av || '')
        const bs = String(bv || '')
        return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
      }
      if (aNaN) return 1
      if (bNaN) return -1
      return sortDir === 'asc' ? aNum - bNum : bNum - aNum
    })
    return copy
  }, [table.rows, sortCol, sortDir])

  return (
    <div
      className="report-table rounded-xl border overflow-hidden break-inside-avoid"
      style={CARD_STYLE}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--gg-separator)' }}>
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
          {table.name}
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {sortedRows.length} {sortedRows.length === 1 ? 'row' : 'rows'}
          </Badge>
        </h4>
      </div>
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <Table>
          <TableHeader
            className="sticky top-0 z-10"
            style={{ background: 'var(--card)' }}
          >
            <TableRow
              className="hover:bg-transparent border-b"
              style={{ borderColor: 'var(--gg-separator-strong)' }}
            >
              {table.columns.map((col) => (
                <TableHead
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap text-[11px] uppercase tracking-wide font-semibold py-2.5"
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    {sortCol === col ? (
                      sortDir === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : (
                      <ChevronDown className="h-3 w-3 opacity-25" />
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No data
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.slice(0, 500).map((row, i) => (
                <TableRow
                  key={i}
                  className="transition-colors"
                  style={{
                    borderColor: 'var(--gg-separator)',
                    background:
                      i % 2 === 1
                        ? 'color-mix(in srgb, var(--muted-foreground) 4%, transparent)'
                        : 'transparent',
                  }}
                >
                  {table.columns.map((col, ci) => {
                    const v = row[col]
                    const statusCol = isStatusColumn(col)
                    const tone = statusCol && typeof v === 'string' ? statusToneFor(v) : null
                    const isNumeric = isNumericValue(v) && !statusCol
                    const shouldShowBadge = statusCol && tone && v
                    return (
                      <TableCell
                        key={col}
                        className={
                          isNumeric
                            ? 'text-sm text-right font-medium text-foreground tabular-nums py-2'
                            : 'text-sm text-foreground py-2'
                        }
                        style={ci === 0 ? { fontWeight: 500 } : undefined}
                      >
                        {shouldShowBadge ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold capitalize"
                            style={{
                              background: tone!.bg,
                              color: tone!.fg,
                              borderColor: 'color-mix(in srgb, ' + tone!.fg + ' 30%, transparent)',
                            }}
                          >
                            {String(v)}
                          </Badge>
                        ) : (
                          formatCellValue(v)
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {sortedRows.length > 500 && (
        <p className="text-xs text-muted-foreground mt-2 text-center px-4 py-2 border-t" style={{ borderColor: 'var(--gg-separator)' }}>
          Showing 500 of {sortedRows.length} rows. Export CSV/JSON for full data.
        </p>
      )}
    </div>
  )
}

// ─── Report selector grid ─────────────────────────────────────────────────────

function ReportSelectorGrid({
  activeType,
  onSelect,
}: {
  activeType: ReportType
  onSelect: (t: ReportType) => void
}) {
  return (
    <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CATEGORIES.map((c) => {
        const active = c.id === activeType
        const Icon = c.icon
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="group relative text-left rounded-xl border p-4 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: 'var(--card)',
              borderColor: active
                ? c.accent
                : 'var(--gg-separator-strong)',
              boxShadow: active
                ? `0 4px 16px -4px color-mix(in srgb, ${c.accent} 25%, transparent)`
                : 'var(--gg-shadow-xs)',
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="shrink-0 rounded-lg p-2.5 transition-colors"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${c.accent}, color-mix(in srgb, ${c.accent} 60%, white))`
                    : `color-mix(in srgb, ${c.accent} 12%, transparent)`,
                  color: active ? 'white' : c.accent,
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {c.label}
                  </h4>
                  {active && (
                    <Badge
                      className="text-[10px] ml-auto shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${c.accent} 15%, transparent)`,
                        color: c.accent,
                        borderColor: 'transparent',
                      }}
                    >
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                  {c.description}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main ReportsCenter component ─────────────────────────────────────────────

export function ReportsCenter() {
  const [activeType, setActiveType] = useState<ReportType>('sales')
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [data, setData] = useState<ReportPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Saved reports
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const printAreaRef = useRef<HTMLDivElement>(null)

  // Compute range from preset
  const range = useMemo(() => {
    if (preset === 'custom') {
      return getRangeFromPreset('custom', customFrom, customTo)
    }
    return getRangeFromPreset(preset)
  }, [preset, customFrom, customTo])

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('from', range.from)
      params.set('to', range.to)
      const res = await fetch(`/api/admin/reports/${activeType}?${params.toString()}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `Failed (${res.status})`)
      }
      const json = (await res.json()) as ReportPayload
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [activeType, range.from, range.to])

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true)
    try {
      const res = await fetch('/api/admin/saved-reports')
      const json = await res.json()
      if (res.ok) {
        setSavedReports(json.reports || [])
      }
    } catch {
      // silent
    } finally {
      setSavedLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  // ─── Export handlers ─────────────────────────────────────────────────────────

  const handleExportCsv = () => {
    if (!data || !data.tables || data.tables.length === 0) {
      toast.error('No data to export')
      return
    }
    const sections: string[] = []
    sections.push(`# ApexFlow Enterprise — ${data.title}`)
    sections.push(`# Generated: ${new Date(data.generatedAt).toISOString()}`)
    sections.push(`# Range: ${data.range.from || 'all'} → ${data.range.to || 'all'}`)
    sections.push('')
    for (const t of data.tables) {
      sections.push(`# ${t.name}`)
      sections.push(t.columns.map(escapeCsv).join(','))
      for (const row of t.rows) {
        sections.push(t.columns.map((c) => escapeCsv(row[c])).join(','))
      }
      sections.push('')
    }
    const csv = sections.join('\n')
    const stamp = new Date().toISOString().slice(0, 10)
    downloadBlob(csv, `apexflow-report-${activeType}-${stamp}.csv`, 'text/csv;charset=utf-8;')
    toast.success(`Exported ${data.tables.length} table(s) to CSV`)
  }

  const handleExportJson = () => {
    if (!data) {
      toast.error('No data to export')
      return
    }
    const json = JSON.stringify(data, null, 2)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadBlob(json, `apexflow-report-${activeType}-${stamp}.json`, 'application/json')
    toast.success('Exported report to JSON')
  }

  const handlePrint = () => {
    if (typeof window === 'undefined') return
    window.print()
  }

  const handleSaveOpen = () => {
    if (!data) {
      toast.error('No report data to save')
      return
    }
    const defaultName = `${data.title} — ${PRESET_LABELS[preset]}`
    setSaveName(defaultName)
    setSaveDialogOpen(true)
  }

  const handleSaveConfirm = async () => {
    if (!data) return
    if (!saveName.trim()) {
      toast.error('Please enter a name')
      return
    }
    try {
      const res = await fetch('/api/admin/saved-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          type: activeType,
          dateRange: preset,
          data: { from: range.from, to: range.to, tables: data.tables?.length || 0 },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to save')
      }
      toast.success('Report saved')
      setSaveDialogOpen(false)
      setSaveName('')
      fetchSaved()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save report')
    }
  }

  const handleLoadSaved = (sr: SavedReport) => {
    setActiveType(sr.type as ReportType)
    if (sr.dateRange && sr.dateRange !== 'custom') {
      setPreset(sr.dateRange as RangePreset)
    } else if (sr.data) {
      try {
        const parsed = JSON.parse(sr.data)
        if (parsed.from && parsed.to) {
          setPreset('custom')
          setCustomFrom(parsed.from)
          setCustomTo(parsed.to)
        }
      } catch {
        // ignore
      }
    }
    toast.success(`Loaded saved report: ${sr.name}`)
  }

  const handleDeleteSaved = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/admin/saved-reports/${deletingId}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to delete')
      }
      toast.success('Saved report deleted')
      setSavedReports((prev) => prev.filter((r) => r.id !== deletingId))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeType) || CATEGORIES[0]
  const ActiveIcon = activeCategory.icon

  const dateRangeLabel = useMemo(() => {
    if (preset === 'custom') {
      return `${range.from || '—'} → ${range.to || '—'}`
    }
    return PRESET_LABELS[preset]
  }, [preset, range.from, range.to])

  const generatedAtDisplay = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

  // For print: report title + range + brand
  const printBrand = 'APEXFLOW'
  const printSubtitle = 'Enterprise ERP Platform'

  return (
    <div className="reports-page space-y-6">
      {/* ═══ PRINT-ONLY FIXED HEADER (position: fixed — repeats on every printed page) ═══ */}
      <div
        className="print-only print-fixed-header"
        style={{ display: 'none' }}
        aria-hidden
      >
        <div className="flex items-start justify-between gap-4 pb-2 border-b-2 border-black">
          <div>
            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '20pt',
                fontWeight: 'bold',
                letterSpacing: '0.08em',
                color: '#000',
                lineHeight: 1.1,
              }}
            >
              {printBrand}
            </div>
            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '9pt',
                color: '#555',
                marginTop: '1pt',
              }}
            >
              {printSubtitle}
            </div>
          </div>
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              textAlign: 'right',
              fontSize: '9pt',
              color: '#000',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{data?.title || activeCategory.label}</div>
            <div style={{ color: '#555', marginTop: '1pt' }}>
              Range: {dateRangeLabel}
            </div>
            <div style={{ color: '#555', marginTop: '1pt' }}>
              Generated: {generatedAtDisplay}
            </div>
            <div
              style={{
                marginTop: '2pt',
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              CONFIDENTIAL
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PRINT-ONLY FIXED FOOTER (position: fixed — repeats on every printed page) ═══ */}
      <div
        className="print-only print-fixed-footer"
        style={{ display: 'none' }}
        aria-hidden
      >
        <div
          className="pt-1 border-t border-black text-center"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '8pt',
            color: '#555',
          }}
        >
          Generated by ApexFlow Enterprise · {generatedAtDisplay} · © {new Date().getFullYear()} ApexFlow Enterprise · Confidential — Internal Use Only
        </div>
      </div>

      {/* ═══ PAGE HEADER ═══ */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex rounded-lg p-2"
              style={{
                background:
                  'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                color: 'white',
              }}
            >
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                Reports Center
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Enterprise analytics, printable reports, and exports for ApexFlow.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchReport}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            style={INPUT_STYLE}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!data}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Printer className="h-4 w-4" />
            <span className="ml-1.5">Print</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="ml-1.5">CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportJson}
            disabled={!data}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Braces className="h-4 w-4" />
            <span className="ml-1.5">JSON</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveOpen}
            disabled={!data}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Save className="h-4 w-4" />
            <span className="ml-1.5">Save</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                style={INPUT_STYLE}
              >
                <BookmarkCheck className="h-4 w-4" />
                <span className="ml-1.5">Saved</span>
                {savedReports.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-[10px] h-4 px-1"
                  >
                    {savedReports.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
                Saved Reports
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    style={{ color: 'var(--gg-vermillion)' }}
                  />
                </div>
              ) : savedReports.length === 0 ? (
                <div className="py-4 px-2 text-center">
                  <Bookmark className="h-5 w-5 mx-auto mb-1 opacity-50" />
                  <p className="text-xs text-muted-foreground">No saved reports yet.</p>
                </div>
              ) : (
                savedReports.map((sr) => {
                  const cat = CATEGORIES.find((c) => c.id === sr.type)
                  const SrIcon = cat?.icon || Bookmark
                  return (
                    <div
                      key={sr.id}
                      className="group flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-sm relative"
                    >
                      <button
                        onClick={() => handleLoadSaved(sr)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <SrIcon
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: cat?.accent || 'var(--muted-foreground)' }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {sr.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {cat?.label || sr.type} ·{' '}
                            {PRESET_LABELS[sr.dateRange as RangePreset] || sr.dateRange}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setDeletingId(sr.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ═══ REPORT SELECTOR GRID ═══ */}
      <ReportSelectorGrid activeType={activeType} onSelect={setActiveType} />

      {/* ═══ TOOLBAR: Date range + Generate ═══ */}
      <Card className="no-print" style={CARD_STYLE}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
                Date Range
              </Label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all border"
                    style={{
                      background:
                        preset === p
                          ? 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))'
                          : 'transparent',
                      color: preset === p ? 'white' : 'var(--muted-foreground)',
                      borderColor:
                        preset === p
                          ? 'transparent'
                          : 'var(--gg-separator-strong)',
                    }}
                  >
                    {PRESET_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            {preset === 'custom' && (
              <>
                <Separator
                  orientation="vertical"
                  className="hidden sm:block h-8"
                />
                <div>
                  <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
                    From
                  </Label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full sm:w-40 text-foreground"
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
                    To
                  </Label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full sm:w-40 text-foreground"
                    style={INPUT_STYLE}
                  />
                </div>
              </>
            )}
            <div className="sm:ml-auto flex items-end gap-2">
              <Button
                onClick={fetchReport}
                disabled={loading}
                className="text-white gap-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ PRINTABLE REPORT CONTENT AREA ═══ */}
      <div ref={printAreaRef} className="report-print-area space-y-6 min-w-0">
        {/* ─── Report header (brand + title + meta) ─── */}
        <Card style={CARD_STYLE} className="report-header break-inside-avoid">
          <CardContent className="p-6">
            {/* Brand row */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--gg-separator)' }}>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex rounded-lg p-2"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                    color: 'white',
                  }}
                >
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p
                    className="text-base font-bold tracking-wide text-foreground"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    APEXFLOW ENTERPRISE
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Enterprise ERP Platform · Reports Suite
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    background:
                      'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                    color: 'var(--gg-vermillion)',
                    borderColor:
                      'color-mix(in srgb, var(--gg-vermillion) 30%, transparent)',
                  }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  Confidential
                </Badge>
              </div>
            </div>

            {/* Title + meta row */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="shrink-0 rounded-lg p-2.5"
                  style={{
                    background: `color-mix(in srgb, ${activeCategory.accent} 12%, transparent)`,
                    color: activeCategory.accent,
                  }}
                >
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-2xl font-bold text-foreground leading-tight">
                    {data?.title || activeCategory.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-prose">
                    {data?.description || activeCategory.description}
                  </p>
                </div>
              </div>
              <div className="sm:text-right text-xs space-y-1 shrink-0">
                <div className="flex sm:justify-end items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Range: </span>
                  <span className="text-foreground font-medium">{dateRangeLabel}</span>
                </div>
                <div className="flex sm:justify-end items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Generated: </span>
                  <span className="text-foreground font-medium">{generatedAtDisplay}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Loading state ─── */}
        {loading && (
          <Card style={CARD_STYLE} className="no-print">
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2
                className="h-6 w-6 animate-spin"
                style={{ color: 'var(--gg-vermillion)' }}
              />
              <span className="ml-3 text-sm text-muted-foreground">
                Generating report…
              </span>
            </CardContent>
          </Card>
        )}

        {/* ─── Error state ─── */}
        {error && !loading && (
          <Card style={CARD_STYLE} className="no-print">
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <p className="text-sm text-red-500">{error}</p>
              <Button
                onClick={fetchReport}
                variant="outline"
                className="mt-3"
                style={INPUT_STYLE}
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── KPI summary row ─── */}
        {!loading && !error && data?.summary && data.summary.length > 0 && (
          <div className="report-summary-section break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 no-print">
              <BarChart3
                className="h-4 w-4"
                style={{ color: 'var(--gg-vermillion)' }}
              />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Executive Summary
              </h3>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 print-grid-kpi">
              {data.summary.map((s, i) => {
                const cat = CATEGORIES.find((c) => c.id === activeType)
                const TileIcon = i === 0 ? cat?.icon : i === 1 ? TrendingUp : i === 2 ? Sparkles : ArrowRight
                return <KpiTile key={s.label} stat={s} icon={TileIcon} />
              })}
            </div>
          </div>
        )}

        {/* ─── Charts section ─── */}
        {!loading && !error && data?.charts && data.charts.length > 0 && (
          <div className="report-charts-section break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 no-print">
              <BarChart3
                className="h-4 w-4"
                style={{ color: 'var(--gg-vermillion)' }}
              />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Visualizations
              </h3>
              <Separator className="flex-1" />
            </div>
            <div
              className={
                data.charts.length > 1
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 print-grid-charts'
                  : 'grid grid-cols-1 gap-4'
              }
            >
              {data.charts.map((c, i) => {
                const key = `${c.kind}-${i}`
                if (c.kind === 'bar') {
                  const supportsSecondary = c.data.some(
                    (d) => d.secondary !== undefined
                  )
                  return (
                    <BarChartCard
                      key={key}
                      chart={c}
                      supportSecondary={supportsSecondary}
                    />
                  )
                }
                if (c.kind === 'line') return <LineChartCard key={key} chart={c} />
                return <DonutChartCard key={key} chart={c} />
              })}
            </div>
          </div>
        )}

        {/* ─── Tables section ─── */}
        {!loading && !error && data?.tables && data.tables.length > 0 && (
          <div className="report-tables-section space-y-6">
            <div className="flex items-center gap-2 no-print">
              <FileText
                className="h-4 w-4"
                style={{ color: 'var(--gg-vermillion)' }}
              />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Data Tables
              </h3>
              <Separator className="flex-1" />
            </div>
            {data.tables.map((t, i) => (
              <ProfessionalTable key={`${t.name}-${i}`} table={t} />
            ))}
          </div>
        )}

        {/* ─── Empty state ─── */}
        {!loading &&
          !error &&
          data &&
          (!data.tables || data.tables.length === 0) &&
          (!data.charts || data.charts.length === 0) && (
            <Card style={CARD_STYLE}>
              <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">
                  No data available for this report in the selected range.
                </p>
              </CardContent>
            </Card>
          )}

        {/* ─── On-screen report footer (also visible in print as final block) ─── */}
        {!loading && !error && data && (
          <div
            className="report-footer pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 break-inside-avoid"
            style={{ borderColor: 'var(--gg-separator)' }}
          >
            <p className="text-[11px] text-muted-foreground">
              Generated by <span className="font-semibold text-foreground">ApexFlow Enterprise</span>{' '}
              · {generatedAtDisplay}
            </p>
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} ApexFlow Enterprise ·{' '}
              <span style={{ color: 'var(--gg-vermillion)' }}>Confidential</span> — Internal Use Only
            </p>
          </div>
        )}
      </div>

      {/* ═══ SAVE DIALOG ═══ */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent style={CARD_STYLE}>
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Save className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
              Save Report
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Store this report&apos;s category and date range for quick re-running later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Report Name
              </Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Q3 Revenue by ERP"
                className="text-foreground"
                style={INPUT_STYLE}
                autoFocus
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Category:{' '}
                <span className="text-foreground font-medium">
                  {activeCategory.label}
                </span>
              </p>
              <p>
                Date range:{' '}
                <span className="text-foreground font-medium">
                  {dateRangeLabel}
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              style={INPUT_STYLE}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfirm}
              className="text-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
              }}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRMATION ═══ */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent style={CARD_STYLE}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete saved report?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove the saved report configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={INPUT_STYLE}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSaved}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ PRINT STYLESHEET ═══ */}
      <style>{`
        @media print {
          /* ─── Page setup ─── */
          @page {
            size: A4 portrait;
            margin: 18mm 15mm 20mm 15mm;
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-family: Georgia, 'Times New Roman', serif;
              font-size: 8pt;
              color: #555;
            }
            @bottom-left {
              content: "ApexFlow Enterprise";
              font-family: Georgia, 'Times New Roman', serif;
              font-size: 8pt;
              color: #555;
            }
          }

          /* ─── Reset to white-on-black, serif font ─── */
          html, body {
            background: white !important;
            color: black !important;
            font-family: Georgia, 'Times New Roman', serif !important;
            font-size: 10pt !important;
            line-height: 1.4 !important;
          }

          /* ─── Hide everything by default ─── */
          body * {
            visibility: hidden;
          }

          /* ─── Show only the print area + print-only elements ─── */
          .report-print-area,
          .report-print-area *,
          .print-only,
          .print-only * {
            visibility: visible !important;
          }

          /* ─── Hide no-print elements entirely ─── */
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }

          /* ─── Show print-only elements (hidden on screen) ─── */
          .print-only {
            display: block !important;
            visibility: visible !important;
          }

          /* ─── Fixed page header (repeats on every printed page) ─── */
          .print-fixed-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            margin-bottom: 4mm !important;
            padding-bottom: 2mm !important;
          }

          /* ─── Fixed page footer (repeats on every printed page) ─── */
          .print-fixed-footer {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            padding-top: 2mm !important;
          }

          /* ─── Reset all colors to black-on-white ─── */
          [class*="text-"],
          p, span, div, h1, h2, h3, h4, h5, h6,
          td, th, label, li, strong, em, small {
            color: black !important;
            background: transparent !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* ─── Hide all buttons ─── */
          button, [role="button"] {
            display: none !important;
          }

          /* ─── Cards become plain white boxes with thin borders ─── */
          [data-slot="card"],
          .report-chart,
          .report-table,
          .report-header,
          .rounded-xl,
          .rounded-lg,
          .rounded-md {
            background: white !important;
            border: 1px solid #888 !important;
            box-shadow: none !important;
            border-radius: 2px !important;
            margin-bottom: 4mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* ─── Tables: professional styling ─── */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-bottom: 2mm !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          thead tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          th, td {
            border: 1px solid #555 !important;
            padding: 3pt 5pt !important;
            color: black !important;
            background: white !important;
            font-size: 9pt !important;
          }
          th {
            background: #e8e8e8 !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            font-size: 8pt !important;
            letter-spacing: 0.04em !important;
          }
          /* Zebra striping */
          tbody tr:nth-child(even) td {
            background: #f5f5f5 !important;
          }
          /* Sticky table header becomes normal in print */
          .sticky {
            position: static !important;
          }

          /* ─── Status badges: keep their colors with print-color-adjust ─── */
          [data-slot="badge"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border: 1px solid #888 !important;
            padding: 1pt 4pt !important;
            font-size: 8pt !important;
            font-weight: bold !important;
          }

          /* ─── SVG charts: keep colors ─── */
          svg {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            max-height: 80mm;
          }
          svg path, svg polyline, svg circle, svg rect {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ─── Hide scrollbars, let content flow ─── */
          ::-webkit-scrollbar {
            display: none !important;
          }
          .overflow-y-auto,
          .overflow-x-auto,
          [class*="max-h-"],
          [class*="max-h-\\["] {
            overflow: visible !important;
            max-height: none !important;
          }

          /* ─── Force single-column layout for grids ─── */
          .grid {
            display: block !important;
          }
          .grid > * {
            margin-bottom: 4mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-grid-kpi {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 2mm !important;
          }
          .print-grid-kpi > * {
            flex: 1 1 22% !important;
            min-width: 30mm !important;
            margin-bottom: 2mm !important;
          }
          .print-grid-charts {
            display: block !important;
          }

          /* ─── Page breaks before major sections ─── */
          .report-tables-section {
            page-break-before: auto !important;
            break-before: auto !important;
          }
          .report-tables-section > * + * {
            page-break-before: auto !important;
          }

          /* ─── Hide sidebars, navigation, and other app chrome ─── */
          aside, nav, header:not(.print-fixed-header):not(.report-header),
          footer:not(.print-fixed-footer):not(.report-footer) {
            display: none !important;
          }

          /* ─── Headings: serif, avoid orphan ─── */
          h1, h2, h3, h4, h5, h6 {
            font-family: Georgia, 'Times New Roman', serif !important;
            color: black !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* ─── KPI tile print styling ─── */
          .kpi-tile {
            border: 1px solid #888 !important;
            background: white !important;
            box-shadow: none !important;
          }
          .kpi-tile p,
          .kpi-tile span {
            color: black !important;
          }

          /* ─── Print color adjust: ensure all gradients print in color ─── */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ─── Remove sticky positioning from headings ─── */
          [class*="sticky"] {
            position: static !important;
          }

          /* ─── Report header in print: professional letterhead ─── */
          .report-header {
            border: 2px solid #000 !important;
            margin-bottom: 6mm !important;
          }

          /* ─── Report footer ─── */
          .report-footer {
            border-top: 1px solid #888 !important;
            margin-top: 4mm !important;
            padding-top: 2mm !important;
            color: #555 !important;
          }
          .report-footer * {
            color: #555 !important;
          }

          /* ─── Brand wordmark visibility ─── */
          [class*="tracking-wide"],
          [class*="uppercase"] {
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ReportsCenter
