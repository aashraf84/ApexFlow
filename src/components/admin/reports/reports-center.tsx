'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'
import {
  RefreshCw,
  Loader2,
  Download,
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
  CalendarDays,
  FileText,
  BookmarkCheck,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType = 'sales' | 'clients' | 'subscriptions' | 'support' | 'integrations' | 'financial'
type RangePreset = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom'

interface SummaryStat {
  label: string
  value: number
  format: 'currency' | 'number' | 'percent'
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

// ─── Category metadata ─────────────────────────────────────────────────────────

const CATEGORIES: {
  id: ReportType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    id: 'sales',
    label: 'Sales & Revenue',
    description: 'Revenue by month, by ERP, top clients, payment success rate',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    id: 'clients',
    label: 'Clients & CRM',
    description: 'Client growth, by status/ERP, retention',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions & Licenses',
    description: 'Active subs, MRR by plan, license utilization, churn',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Tickets by status/priority, avg resolution time, agent perf',
    icon: <LifeBuoy className="h-4 w-4" />,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Sync success rate, records by ERP, duration trends, errors',
    icon: <Plug className="h-4 w-4" />,
  },
  {
    id: 'financial',
    label: 'Financial',
    description: 'Outstanding invoices, gateway breakdown, revenue vs expenses',
    icon: <FileText className="h-4 w-4" />,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--card)',
  borderColor: 'var(--gg-separator)',
  boxShadow: 'var(--gg-shadow-card)',
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--card)',
  borderColor: 'var(--gg-separator)',
}

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
  if (typeof value === 'number') return formatNumber(value)
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

function getRangeFromPreset(preset: RangePreset, customFrom?: string, customTo?: string): { from: string; to: string } {
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

const PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  year: 'This Year',
  custom: 'Custom',
}

// ─── Sub-component: BarChart (pure divs) ──────────────────────────────────────

function BarChartCard({ chart, supportSecondary }: { chart: ChartConfig; supportSecondary?: boolean }) {
  const data = chart.data || []
  const maxValue = Math.max(1, ...data.map((d) => d.value), ...(supportSecondary ? data.map((d) => d.secondary || 0) : []))
  return (
    <Card style={CARD_STYLE} className="report-chart">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
          {chart.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-2 h-44 px-2">
          {data.length === 0 ? (
            <div className="w-full text-center text-sm text-muted-foreground py-12">No data</div>
          ) : (
            data.map((d, i) => {
              const pct = Math.round((d.value / maxValue) * 100)
              const secPct = supportSecondary
                ? Math.round(((d.secondary || 0) / maxValue) * 100)
                : 0
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-1 h-full min-w-0"
                >
                  <div className="text-[10px] font-semibold text-foreground whitespace-nowrap">
                    {d.value > 0 ? formatNumber(d.value) : ''}
                  </div>
                  <div className="w-full flex items-end gap-0.5 h-full justify-center">
                    {supportSecondary && (
                      <div
                        className="flex-1 rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${secPct}%`,
                          minHeight: '4px',
                          background: 'var(--gg-separator)',
                        }}
                        title={`Collected: ${formatNumber(d.secondary || 0)}`}
                      />
                    )}
                    <div
                      className="flex-1 rounded-t-md transition-all duration-300 hover:opacity-90"
                      style={{
                        height: `${pct}%`,
                        minHeight: '6px',
                        background: 'linear-gradient(180deg, var(--gg-vermillion), var(--gg-amber))',
                        boxShadow: '0 0 12px -2px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)',
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
      </CardContent>
    </Card>
  )
}

// ─── Sub-component: LineChart (pure divs) ────────────────────────────────────

function LineChartCard({ chart }: { chart: ChartConfig }) {
  const data = chart.data || []
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const w = 100 // viewBox width percentage
  const h = 100
  if (data.length === 0) {
    return (
      <Card style={CARD_STYLE} className="report-chart">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
            {chart.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No data</div>
        </CardContent>
      </Card>
    )
  }
  // Build SVG polyline points (so the line is "pure div/SVG" — no chart lib)
  const points = data
    .map((d, i) => {
      const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w
      const y = h - (d.value / maxValue) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <Card style={CARD_STYLE} className="report-chart">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
          {chart.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative w-full" style={{ height: '180px' }}>
          <svg
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gg-vermillion)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--gg-vermillion)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={`0,${h} ${points} ${w},${h}`}
              fill="url(#lineGrad)"
              stroke="none"
            />
            <polyline
              points={points}
              fill="none"
              stroke="var(--gg-vermillion)"
              strokeWidth="1.5"
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
                  r="1.5"
                  fill="var(--gg-amber)"
                  stroke="var(--gg-vermillion)"
                  strokeWidth="0.5"
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
      </CardContent>
    </Card>
  )
}

// ─── Sub-component: DonutChart (pure SVG divs) ────────────────────────────────

const DONUT_COLORS = [
  'var(--gg-vermillion)',
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

function DonutChartCard({ chart }: { chart: ChartConfig }) {
  const data = (chart.data || []).filter((d) => d.value > 0)
  const total = data.reduce((a, b) => a + b.value, 0)
  if (data.length === 0 || total === 0) {
    return (
      <Card style={CARD_STYLE} className="report-chart">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
            {chart.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No data</div>
        </CardContent>
      </Card>
    )
  }
  // Build SVG donut
  const cx = 50
  const cy = 50
  const rOuter = 40
  const rInner = 24
  let angle = -Math.PI / 2 // start at top
  const segments: { path: string; color: string; label: string; value: number; pct: number }[] = []
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
    <Card style={CARD_STYLE} className="report-chart">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
          {chart.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 flex-wrap">
          <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0">
            {segments.map((s, i) => (
              <path key={i} d={s.path} fill={s.color} stroke="var(--card)" strokeWidth="0.5">
                <title>{`${s.label}: ${formatNumber(s.value)} (${s.pct.toFixed(1)}%)`}</title>
              </path>
            ))}
            <text x="50" y="50" textAnchor="middle" dy="0.3em" className="fill-foreground" style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {formatNumber(total)}
            </text>
          </svg>
          <div className="flex-1 min-w-[140px] space-y-1 max-h-36 overflow-y-auto pr-1">
            {segments.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="text-foreground truncate">{s.label}</span>
                </div>
                <span className="text-muted-foreground shrink-0">
                  {formatNumber(s.value)} · {s.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Sub-component: Sortable Data Table ───────────────────────────────────────

function SortableTable({ table }: { table: ReportTable }) {
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
    <Card style={CARD_STYLE} className="report-table">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-foreground">{table.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
              <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                {table.columns.map((col) => (
                  <TableHead
                    key={col}
                    onClick={() => handleSort(col)}
                    className="text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap"
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
                        <ChevronDown className="h-3 w-3 opacity-30" />
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={table.columns.length} className="text-center text-muted-foreground py-8">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.slice(0, 500).map((row, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderColor: 'var(--gg-separator)' }}
                  >
                    {table.columns.map((col) => {
                      const v = row[col]
                      // numeric columns get right-aligned + accent color
                      const isNumeric = typeof v === 'number' || (!isNaN(Number(v)) && v !== '' && v !== null && v !== undefined)
                      return (
                        <TableCell
                          key={col}
                          className={
                            isNumeric
                              ? 'text-sm text-right font-medium text-foreground tabular-nums'
                              : 'text-sm text-foreground'
                          }
                        >
                          {formatCellValue(v)}
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing 500 of {sortedRows.length} rows. Export CSV/JSON for full data.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-component: Stat Card ─────────────────────────────────────────────────

function StatCard({ stat }: { stat: SummaryStat }) {
  return (
    <Card style={CARD_STYLE} className="report-stat">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
        <p
          className="text-xl font-bold mt-1 truncate"
          style={{ color: 'var(--gg-vermillion)' }}
        >
          {formatValue(stat.value, stat.format)}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Main ReportsCenter Component ─────────────────────────────────────────────

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
    // Bump the report title into the print-header before printing
    if (data) {
      const el = document.getElementById('print-report-title')
      if (el) el.textContent = data.title
      const el2 = document.getElementById('print-report-range')
      if (el2) {
        const from = data.range.from || 'Beginning'
        const to = data.range.to || new Date().toISOString().slice(0, 10)
        el2.textContent = `${from} → ${to}`
      }
    }
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

  const activeCategory = CATEGORIES.find((c) => c.id === activeType) || CATEGORIES[0]
  const dateRangeLabel = useMemo(() => {
    if (preset === 'custom') {
      return `${range.from || '—'} → ${range.to || '—'}`
    }
    return PRESET_LABELS[preset]
  }, [preset, range.from, range.to])

  return (
    <div className="space-y-6 print:space-y-2">
      {/* ─── Hidden print-only header ──────────────────────────────────────── */}
      <div id="print-header" className="hidden print:block">
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
          <div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              ApexFlow Enterprise
            </div>
            <div id="print-report-title" className="text-base font-semibold mt-1" style={{ fontFamily: 'Georgia, serif' }}>
              {data?.title}
            </div>
            <div id="print-report-range" className="text-xs text-gray-700 mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>
              {dateRangeLabel}
            </div>
          </div>
          <div className="text-right text-xs text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
            <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="mt-1">Confidential · Internal Use Only</div>
          </div>
        </div>
      </div>

      {/* ─── Page header ───────────────────────────────────────────────────── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports Center</h2>
          <p className="text-muted-foreground mt-1">
            Enterprise analytics, printable reports, and exports for ApexFlow.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchReport}
            disabled={loading}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
            style={INPUT_STYLE}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Printer className="h-4 w-4" />
            <span className="ml-1.5">Print Report</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveOpen}
            disabled={!data}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Save className="h-4 w-4" />
            <span className="ml-1.5">Save Report</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Download className="h-4 w-4" />
            <span className="ml-1.5">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportJson}
            disabled={!data}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
            style={INPUT_STYLE}
          >
            <Download className="h-4 w-4" />
            <span className="ml-1.5">Export JSON</span>
          </Button>
        </div>
      </div>

      {/* ─── Main layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-6 print:block">
        {/* ─── Left sidebar: Categories ──────────────────────────────────── */}
        <Card style={CARD_STYLE} className="no-print lg:sticky lg:top-4 self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
              Report Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <nav className="space-y-1">
              {CATEGORIES.map((c) => {
                const active = c.id === activeType
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveType(c.id)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm transition-all flex items-start gap-2 ${
                      active
                        ? 'text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                          }
                        : undefined
                    }
                  >
                    <span className={`shrink-0 mt-0.5 ${active ? 'text-white' : 'text-muted-foreground'}`}>
                      {c.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium truncate">{c.label}</span>
                      <span className="block text-[10px] leading-tight opacity-80 truncate">
                        {c.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* ─── Center: Active report ─────────────────────────────────────── */}
        <div ref={printAreaRef} className="space-y-6 min-w-0">
          {/* Date range filter (no-print) */}
          <Card style={CARD_STYLE} className="no-print">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Date Range</Label>
                  <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
                    <SelectTrigger className="w-full sm:w-44 text-foreground" style={INPUT_STYLE}>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {preset === 'custom' && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
                      <Input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="w-full sm:w-40 text-foreground"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
                      <Input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="w-full sm:w-40 text-foreground"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <Button
                      onClick={fetchReport}
                      disabled={loading}
                      className="hover:opacity-90 text-white gap-1.5"
                      style={{
                        background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                      }}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                      Apply
                    </Button>
                  </>
                )}
                {preset !== 'custom' && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                    <CalendarDays className="h-3 w-3" />
                    Range: <span className="text-foreground font-medium">{dateRangeLabel}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report header (visible on print) */}
          <div className="flex items-center gap-3">
            <div
              className="rounded-lg p-2.5 shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                color: 'var(--gg-vermillion)',
              }}
            >
              {activeCategory.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground truncate">
                {data?.title || activeCategory.label}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {data?.description || activeCategory.description}
              </p>
            </div>
          </div>

          {/* Loading / error / empty states */}
          {loading && (
            <Card style={CARD_STYLE}>
              <CardContent className="p-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
                <span className="ml-3 text-sm text-muted-foreground">Generating report…</span>
              </CardContent>
            </Card>
          )}

          {error && !loading && (
            <Card style={CARD_STYLE}>
              <CardContent className="p-12 flex flex-col items-center justify-center">
                <p className="text-sm text-red-400">{error}</p>
                <Button
                  onClick={fetchReport}
                  variant="outline"
                  className="mt-3"
                  style={INPUT_STYLE}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary stat cards */}
          {!loading && !error && data?.summary && data.summary.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
              {data.summary.map((s) => (
                <StatCard key={s.label} stat={s} />
              ))}
            </div>
          )}

          {/* Charts */}
          {!loading && !error && data?.charts && data.charts.length > 0 && (
            <div
              className={
                data.charts.length > 1
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2'
                  : ''
              }
            >
              {data.charts.map((c, i) => {
                const key = `${c.kind}-${i}`
                if (c.kind === 'bar') {
                  // Financial "Invoiced vs Collected" passes `secondary`
                  const supportsSecondary = c.data.some((d) => d.secondary !== undefined)
                  return <BarChartCard key={key} chart={c} supportSecondary={supportsSecondary} />
                }
                if (c.kind === 'line') return <LineChartCard key={key} chart={c} />
                return <DonutChartCard key={key} chart={c} />
              })}
            </div>
          )}

          {/* Tables */}
          {!loading && !error && data?.tables && data.tables.length > 0 && (
            <div className="space-y-6">
              {data.tables.map((t, i) => (
                <SortableTable key={`${t.name}-${i}`} table={t} />
              ))}
            </div>
          )}

          {!loading && !error && data && (!data.tables || data.tables.length === 0) && (!data.charts || data.charts.length === 0) && (
            <Card style={CARD_STYLE}>
              <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">No data available for this report in the selected range.</p>
              </CardContent>
            </Card>
          )}

          {/* Print-only footer */}
          <div className="hidden print:block" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="border-t border-black mt-6 pt-2 text-xs text-gray-700">
              ApexFlow Enterprise · {data?.title || activeCategory.label} · Generated {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* ─── Right sidebar: Saved Reports ──────────────────────────────── */}
        <Card style={CARD_STYLE} className="no-print lg:sticky lg:top-4 self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
              Saved Reports
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Click to re-run a saved report.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {savedLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
              </div>
            ) : savedReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <Bookmark className="h-6 w-6 mb-2 opacity-50" />
                <p className="text-xs">No saved reports yet.</p>
                <p className="text-[10px] mt-1 text-center">Use the "Save Report" button to store a config.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {savedReports.map((sr) => {
                  const cat = CATEGORIES.find((c) => c.id === sr.type)
                  return (
                    <div
                      key={sr.id}
                      className="group relative rounded-md border p-2 hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'var(--gg-separator)' }}
                    >
                      <button
                        onClick={() => handleLoadSaved(sr)}
                        className="w-full text-left flex items-start gap-2 pr-6"
                      >
                        <span className="shrink-0 mt-0.5 text-muted-foreground">
                          {cat?.icon || <Bookmark className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{sr.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {cat?.label || sr.type} · {PRESET_LABELS[sr.dateRange as RangePreset] || sr.dateRange}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(sr.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setDeletingId(sr.id)}
                        className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                        title="Delete saved report"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Save Dialog ───────────────────────────────────────────────────── */}
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
              <Label className="text-xs text-muted-foreground mb-1 block">Report Name</Label>
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
              <p>Category: <span className="text-foreground font-medium">{activeCategory.label}</span></p>
              <p>Date range: <span className="text-foreground font-medium">{dateRangeLabel}</span></p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} style={INPUT_STYLE}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfirm}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete confirmation ───────────────────────────────────────────── */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent style={CARD_STYLE}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete saved report?</AlertDialogTitle>
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

      {/* ─── Print stylesheet ────────────────────────────────────────────── */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 18mm 14mm 16mm 14mm;
          }
          html, body {
            background: white !important;
            color: black !important;
            font-family: Georgia, 'Times New Roman', serif !important;
          }
          /* Hide everything except the reports page */
          body * {
            visibility: hidden;
          }
          /* Show the reports page itself + print-only elements */
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          /* The print header is hidden by default — show on print */
          #print-header,
          #print-header * {
            visibility: visible !important;
            display: block !important;
          }
          #print-header {
            margin-bottom: 8mm;
          }
          /* The main content area — make visible */
          main, section, article, [role="main"] {
            visibility: visible !important;
          }
          /* Force the report area + all descendants visible */
          .report-chart,
          .report-table,
          .report-stat,
          .report-chart *,
          .report-table *,
          .report-stat * {
            visibility: visible !important;
          }
          /* Re-color everything that should be black-on-white */
          .text-foreground,
          .text-muted-foreground,
          [class*="text-white"],
          [class*="text-gray"],
          p, span, div, td, th, h2, h3, h4 {
            color: black !important;
            background: white !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          /* Cards become plain white boxes with thin borders */
          [data-slot="card"],
          .rounded-lg,
          .rounded-xl,
          .rounded-md {
            background: white !important;
            border: 1px solid #999 !important;
            box-shadow: none !important;
            border-radius: 4px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Tables — black borders */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #444 !important;
            color: black !important;
            background: white !important;
            padding: 4px 8px !important;
            font-size: 10px !important;
          }
          th {
            background: #eee !important;
            font-weight: bold !important;
          }
          /* SVG charts — keep vermillion→amber gradient on white */
          svg {
            background: white !important;
          }
          /* Hide scrollbars */
          ::-webkit-scrollbar {
            display: none !important;
          }
          /* Hide sticky shadows */
          .sticky {
            position: static !important;
          }
          /* Page number footer — printed at bottom of every page via @page */
          #print-footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #555;
            border-top: 1px solid #999;
            padding-top: 4px;
          }
          /* Hide page scroll containers — let tables flow naturally */
          .max-h-\\[60vh\\], .max-h-44, .max-h-96, .overflow-y-auto, .overflow-x-auto {
            max-height: none !important;
            overflow: visible !important;
          }
          /* Layout: stack everything full-width */
          .grid {
            display: block !important;
          }
          .grid > * {
            margin-bottom: 6mm;
          }
          /* Force the 3-column layout to single column */
          .lg\\:grid-cols-\\[200px_1fr_220px\\] {
            display: block !important;
          }
          /* Make gradient buttons look like outline boxes */
          button {
            display: none !important;
          }
          /* SVG donut/pie — colored fills are fine, they print in color */
          [fill] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Section headers */
          h2, h3, h4 {
            font-family: Georgia, 'Times New Roman', serif !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ReportsCenter
