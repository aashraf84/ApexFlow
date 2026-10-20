'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Repeat,
  DollarSign,
  LifeBuoy,
  Plug,
  Key,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  Activity,
  Clock,
  Zap,
  CircleDot,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatusBadge } from '@/components/admin/shared/status-badge'

// ──────────────────────────────────────────────────────────────────
// Types — mirror the API response shape in /api/admin/dashboard
// ──────────────────────────────────────────────────────────────────
interface KpiDeltas {
  totalClients: { value: number; delta: number; deltaPct: number }
  activeSubscriptions: { value: number; mrr: number; currency: string }
  revenueThisMonth: {
    value: number
    currency: string
    deltaPct: number
    previous: number
  }
  openTickets: { value: number; urgent: number }
  connectedErps: { connected: number; total: number }
  syncedLicenses: { value: number }
}

interface TrendPoint {
  month: string
  revenue: number
}

interface GrowthPoint {
  month: string
  count: number
}

interface RecentClient {
  id: string
  name: string
  company: string
  erpSlug: string | null
  status: string
  createdAt: string
}

interface RecentSync {
  id: string
  erpName: string
  direction: string
  status: string
  recordsSynced: number
  recordsFailed: number
  durationMs: number
  startedAt: string
  completedAt: string | null
}

interface IntegrationHealth {
  id: string
  erpName: string
  erpSlug: string
  status: string
  latencyMs: number | null
  lastSyncAt: string | null
  autoSync: boolean
  syncInterval: number
  clientCount: number
  lastError: string | null
}

interface ActivityEntry {
  id: string
  user: string
  action: string
  module: string | null
  entity: string | null
  entityId: string | null
  ipAddress: string | null
  createdAt: string
  status: 'success' | 'failure'
}

interface DashboardData {
  kpis: KpiDeltas
  revenueTrend: TrendPoint[]
  clientGrowth: GrowthPoint[]
  recentClients: RecentClient[]
  recentSyncs: RecentSync[]
  integrationHealth: IntegrationHealth[]
  recentActivity: ActivityEntry[]
  generatedAt: string
}

// ──────────────────────────────────────────────────────────────────
// Animation variants (Framer Motion)
// ──────────────────────────────────────────────────────────────────
const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString('en-US')
}

function formatCurrency(n: number, currency = 'PKR'): string {
  const prefix = currency === 'USD' ? '$' : currency === 'PKR' ? 'Rs ' : ''
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `${prefix}${(n / 1000).toFixed(1)}k`
  return `${prefix}${Math.round(n).toLocaleString('en-US')}`
}

function timeAgo(dateIso: string): string {
  if (!dateIso) return '—'
  const date = new Date(dateIso)
  if (isNaN(date.getTime())) return '—'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function statusToBadgeVariant(
  status: string,
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const s = (status || '').toLowerCase()
  if (
    ['success', 'completed', 'active', 'paid', 'connected', 'completed'].includes(s)
  )
    return 'success'
  if (['pending', 'running', 'partial', 'trial', 'in_progress', 'in-progress'].includes(s))
    return 'warning'
  if (['failed', 'error', 'disconnected', 'blocked', 'cancelled', 'expired'].includes(s))
    return 'error'
  if (['synced', 'sync'].includes(s)) return 'info'
  return 'neutral'
}

function clientStatusVariant(status: string): 'success' | 'warning' | 'info' | 'neutral' {
  const s = (status || '').toLowerCase()
  if (['active', 'paid'].includes(s)) return 'success'
  if (['trial', 'pending'].includes(s)) return 'warning'
  if (['churned', 'cancelled'].includes(s)) return 'error' as any
  return 'info'
}

function directionIcon(direction: string) {
  const d = (direction || '').toLowerCase()
  if (d === 'inbound') return '↓'
  if (d === 'outbound') return '↑'
  return '↔'
}

function prettifyAction(action: string): string {
  if (!action) return 'Activity'
  // Take the last segment after a . or _ and title-case it.
  const parts = action.split(/[._]/).filter(Boolean)
  const last = parts[parts.length - 1] || action
  return last.charAt(0).toUpperCase() + last.slice(1)
}

// ──────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: typeof Users
  gradient: string // CSS gradient string for the icon background
  iconColor: string
  trend?: { pct: number; label: string } // optional trend arrow
}

function KpiCard({ label, value, sub, icon: Icon, gradient, iconColor, trend }: KpiCardProps) {
  return (
    <motion.div variants={fadeUp} custom={0}>
      <Card
        className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        style={{ borderColor: 'var(--gg-separator)' }}
      >
        {/* Subtle gradient glow at top-right */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-3xl"
          style={{ background: gradient }}
        />
        <CardContent className="relative p-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
              style={{ background: gradient }}
            >
              <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </div>
            {trend && (
              <div
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${
                  trend.pct >= 0
                    ? 'text-[var(--gg-green)] bg-[var(--gg-green)]/10'
                    : 'text-[var(--gg-rose)] bg-[var(--gg-rose)]/10'
                }`}
              >
                {trend.pct >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>
                  {trend.pct >= 0 ? '+' : ''}
                  {trend.pct}%
                </span>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-sm font-medium text-foreground/80 mt-0.5">{label}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Pure-CSS bar chart for the revenue trend. */
function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  const maxRevenue = useMemo(() => {
    const m = Math.max(...data.map((d) => d.revenue), 0)
    return m === 0 ? 1 : m
  }, [data])

  return (
    <div className="flex items-end justify-between gap-2 h-44 w-full px-1">
      {data.map((d, i) => {
        const heightPct = (d.revenue / maxRevenue) * 100
        const isLatest = i === data.length - 1
        return (
          <div
            key={`${d.month}-${i}`}
            className="group relative flex flex-1 flex-col items-center gap-1.5"
          >
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -top-9 z-10 hidden group-hover:block">
              <div className="rounded-md border border-border bg-popover px-2 py-1 text-[11px] shadow-md">
                <span className="font-semibold text-foreground">
                  {formatCurrency(d.revenue)}
                </span>
                <span className="ml-1 text-muted-foreground">{d.month}</span>
              </div>
            </div>
            {/* Bar */}
            <div className="flex h-full w-full items-end justify-center">
              <div
                className="w-full max-w-[36px] rounded-t-md bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] transition-all duration-500 ease-out"
                style={{
                  height: `${Math.max(heightPct, d.revenue > 0 ? 6 : 2)}%`,
                  boxShadow: isLatest
                    ? '0 0 16px color-mix(in srgb, var(--gg-amber) 45%, transparent)'
                    : '0 0 6px color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
                  opacity: d.revenue > 0 ? 1 : 0.35,
                }}
              />
            </div>
            {/* Month label */}
            <span
              className={`text-[10px] font-medium ${
                isLatest ? 'text-[var(--gg-amber)]' : 'text-muted-foreground'
              }`}
            >
              {d.month}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Pure-CSS area/line chart for client growth. */
function ClientGrowthChart({ data }: { data: GrowthPoint[] }) {
  const maxCount = useMemo(() => {
    const m = Math.max(...data.map((d) => d.count), 0)
    return m === 0 ? 1 : m
  }, [data])

  // Build the SVG polyline points + area polygon for a smooth area chart.
  const { linePoints, areaPath, dots } = useMemo(() => {
    const w = 100
    const h = 100
    const stepX = data.length > 1 ? w / (data.length - 1) : w
    const pts = data.map((d, i) => {
      const x = i * stepX
      const y = h - (d.count / maxCount) * h
      return { x, y, count: d.count, month: d.month }
    })
    const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ')
    const areaPath = `M0,${h} L${pts.map((p) => `${p.x},${p.y}`).join(' L')} L${w},${h} Z`
    return { linePoints, areaPath, dots: pts }
  }, [data, maxCount])

  return (
    <div className="relative h-44 w-full">
      {/* Y-axis grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-t border-dashed border-border/40"
            style={{ opacity: 0.4 }}
          />
        ))}
      </div>

      {/* SVG chart */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="clientGrowthArea" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--gg-vermillion)"
              stopOpacity="0.55"
            />
            <stop
              offset="100%"
              stopColor="var(--gg-vermillion)"
              stopOpacity="0.05"
            />
          </linearGradient>
          <linearGradient id="clientGrowthLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gg-vermillion)" />
            <stop offset="100%" stopColor="var(--gg-amber)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#clientGrowthArea)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="url(#clientGrowthLine)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Data dots + labels */}
      <div className="absolute inset-0">
        {dots.map((dot, i) => {
          const isLatest = i === dots.length - 1
          return (
            <div
              key={i}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  isLatest ? 'h-3 w-3' : 'h-2 w-2 group-hover:h-3 group-hover:w-3'
                }`}
                style={{
                  background: isLatest
                    ? 'var(--gg-amber)'
                    : 'var(--gg-vermillion)',
                  boxShadow: isLatest
                    ? '0 0 10px color-mix(in srgb, var(--gg-amber) 60%, transparent)'
                    : 'none',
                }}
              />
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-9 hidden group-hover:block z-10">
                <div className="rounded-md border border-border bg-popover px-2 py-1 text-[11px] shadow-md whitespace-nowrap">
                  <span className="font-semibold text-foreground">{dot.count}</span>
                  <span className="ml-1 text-muted-foreground">{dot.month}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* X-axis month labels */}
      <div className="absolute -bottom-5 inset-x-0 flex justify-between px-1">
        {data.map((d, i) => (
          <span
            key={`${d.month}-${i}`}
            className={`text-[10px] font-medium ${
              i === data.length - 1 ? 'text-[var(--gg-amber)]' : 'text-muted-foreground'
            }`}
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  )
}

interface SectionCardProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  icon?: typeof Users
  children: React.ReactNode
  className?: string
}

function SectionCard({
  title,
  actionLabel,
  onAction,
  icon: Icon,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <Card
      className={`h-full transition-all duration-200 hover:shadow-md ${className}`}
      style={{ borderColor: 'var(--gg-separator)' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {Icon && (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
            {title}
          </CardTitle>
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[11px]"
              onClick={onAction}
            >
              {actionLabel}
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────
// Skeleton loaders
// ──────────────────────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <Card style={{ borderColor: 'var(--gg-separator)' }}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2.5 w-24 mt-2" />
      </CardContent>
    </Card>
  )
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Main AdvancedDashboard component
// ──────────────────────────────────────────────────────────────────
interface AdvancedDashboardProps {
  onNavigate?: (section: string) => void
}

export function AdvancedDashboard({ onNavigate }: AdvancedDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/dashboard', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load dashboard')
      setData(json.data as DashboardData)
    } catch (err) {
      console.error('[AdvancedDashboard] fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 60 seconds (non-blocking, silent)
    const interval = setInterval(() => fetchData(true), 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = () => fetchData(true)

  // ── KPI cards config ──
  const kpiCards = useMemo(() => {
    if (!data) return []
    const k = data.kpis
    return [
      {
        label: 'Total Clients',
        value: formatNumber(k.totalClients.value),
        sub: `+${k.totalClients.delta} this month`,
        icon: Users,
        gradient: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
        iconColor: '#ffffff',
        trend: { pct: k.totalClients.deltaPct, label: 'vs last month' },
      },
      {
        label: 'Active Subscriptions',
        value: formatNumber(k.activeSubscriptions.value),
        sub: `MRR ${formatCurrency(k.activeSubscriptions.mrr, k.activeSubscriptions.currency)}`,
        icon: Repeat,
        gradient: 'linear-gradient(135deg, #10b981, #34d399)',
        iconColor: '#ffffff',
      },
      {
        label: 'Revenue (This Month)',
        value: formatCurrency(k.revenueThisMonth.value, k.revenueThisMonth.currency),
        sub: `Prev: ${formatCurrency(k.revenueThisMonth.previous, k.revenueThisMonth.currency)}`,
        icon: DollarSign,
        gradient: 'linear-gradient(135deg, var(--gg-amber), #fbbf24)',
        iconColor: '#1c1917',
        trend: { pct: k.revenueThisMonth.deltaPct, label: 'vs last month' },
      },
      {
        label: 'Open Support Tickets',
        value: formatNumber(k.openTickets.value),
        sub:
          k.openTickets.urgent > 0
            ? `${k.openTickets.urgent} urgent priority`
            : 'No urgent tickets',
        icon: LifeBuoy,
        gradient:
          k.openTickets.urgent > 0
            ? 'linear-gradient(135deg, var(--gg-rose), #fb7185)'
            : 'linear-gradient(135deg, var(--gg-teal), #2dd4bf)',
        iconColor: '#ffffff',
      },
      {
        label: 'Connected ERPs',
        value: `${k.connectedErps.connected}/${k.connectedErps.total}`,
        sub:
          k.connectedErps.total > 0
            ? `${Math.round((k.connectedErps.connected / k.connectedErps.total) * 100)}% connectivity`
            : 'No connectors yet',
        icon: Plug,
        gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
        iconColor: '#ffffff',
      },
      {
        label: 'Synced Licenses',
        value: formatNumber(k.syncedLicenses.value),
        sub: 'All serial keys',
        icon: Key,
        gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
        iconColor: '#ffffff',
      },
    ]
  }, [data])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Enterprise Dashboard
            </h1>
            <Badge
              variant="outline"
              className="gap-1 border-[var(--gg-green)]/30 bg-[var(--gg-green)]/10 text-[var(--gg-green)]"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gg-green)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gg-green)]" />
              </span>
              LIVE
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Real-time overview of clients, revenue, support, integrations &amp; sync health across the
            ApexFlow ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data?.generatedAt && (
            <span className="hidden sm:inline text-[11px] text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1 -mt-0.5" />
              Updated {timeAgo(data.generatedAt)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeUp} custom={1}>
          <Card
            className="border-[var(--gg-rose)]/30 bg-[var(--gg-rose)]/5"
            style={{ borderColor: 'color-mix(in srgb, var(--gg-rose) 30%, transparent)' }}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-[var(--gg-rose)] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Failed to load dashboard</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Row 1: 6 KPI stat cards ── */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpiCards.map((card) => (
              <KpiCard key={card.label} label={card.label} value={card.value} sub={card.sub} icon={card.icon} gradient={card.gradient} iconColor={card.iconColor} trend={card.trend} />
            ))}
      </motion.div>

      {/* ── Row 2: Revenue trend (2/3) + Client growth (1/3) ── */}
      <motion.div variants={fadeUp} custom={2} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card
          className="lg:col-span-2"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[var(--gg-amber)]" />
                  Revenue Trend
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last 6 months · successful payments only
                </p>
              </div>
              {data && data.revenueTrend.length > 0 && (
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Total (6mo)</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(
                      data.revenueTrend.reduce((sum, d) => sum + d.revenue, 0),
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : data && data.revenueTrend.length > 0 ? (
              <RevenueTrendChart data={data.revenueTrend} />
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Growth */}
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--gg-vermillion)]" />
                Client Growth
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Cumulative · last 6 months</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : data && data.clientGrowth.length > 0 ? (
              <ClientGrowthChart data={data.clientGrowth} />
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                No client data yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 3: Recent Clients | Recent Sync Activity | Integration Health ── */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Recent Clients */}
        <SectionCard
          title="Recent Clients"
          icon={Users}
          actionLabel="View All"
          onAction={() => onNavigate?.('clients')}
        >
          {loading ? (
            <ListSkeleton rows={5} />
          ) : data && data.recentClients.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-1 space-y-1.5 -mr-1">
              {data.recentClients.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 text-xs font-bold uppercase text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                    }}
                  >
                    {(c.name || c.company || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.company}
                      {c.erpSlug && (
                        <span className="ml-1 opacity-70">· {c.erpSlug}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge variant={clientStatusVariant(c.status)} size="sm">
                      {c.status}
                    </StatusBadge>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No clients yet
            </div>
          )}
        </SectionCard>

        {/* Recent Sync Activity */}
        <SectionCard
          title="Recent Sync Activity"
          icon={Activity}
          actionLabel="View All"
          onAction={() => onNavigate?.('sync-logs')}
        >
          {loading ? (
            <ListSkeleton rows={5} />
          ) : data && data.recentSyncs.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-1 space-y-1.5 -mr-1">
              {data.recentSyncs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0 text-sm">
                    {directionIcon(s.direction)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {s.erpName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {s.recordsSynced} synced
                        {s.recordsFailed > 0 && (
                          <span className="text-[var(--gg-rose)]">
                            {' '}
                            · {s.recordsFailed} failed
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge variant={statusToBadgeVariant(s.status)} size="sm">
                      {s.status}
                    </StatusBadge>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(s.completedAt || s.startedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No sync activity yet
            </div>
          )}
        </SectionCard>

        {/* Integration Health */}
        <SectionCard
          title="Integration Health"
          icon={Plug}
          actionLabel="Configure"
          onAction={() => onNavigate?.('integrations')}
        >
          {loading ? (
            <ListSkeleton rows={5} />
          ) : data && data.integrationHealth.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-1 space-y-1.5 -mr-1">
              {data.integrationHealth.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{
                      background:
                        c.status === 'connected'
                          ? 'color-mix(in srgb, var(--gg-green) 15%, transparent)'
                          : c.status === 'disconnected' || c.status === 'error'
                            ? 'color-mix(in srgb, var(--gg-rose) 15%, transparent)'
                            : 'var(--muted)',
                    }}
                  >
                    <Plug
                      className="h-4 w-4"
                      style={{
                        color:
                          c.status === 'connected'
                            ? 'var(--gg-green)'
                            : c.status === 'disconnected' || c.status === 'error'
                              ? 'var(--gg-rose)'
                              : 'var(--muted-foreground)',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.erpName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.latencyMs !== null
                        ? `${c.latencyMs}ms latency`
                        : c.lastSyncAt
                          ? `Synced ${timeAgo(c.lastSyncAt)}`
                          : 'No sync yet'}
                      {c.autoSync && (
                        <span className="ml-1 text-[var(--gg-teal)]">· auto</span>
                      )}
                    </p>
                  </div>
                  <StatusBadge variant={statusToBadgeVariant(c.status)} size="sm">
                    {c.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No integrations yet
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ── Row 4: Recent Activity Feed (full width) ── */}
      <motion.div variants={fadeUp} custom={4}>
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4 text-[var(--gg-vermillion)]" />
                Recent Activity Feed
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => onNavigate?.('audit')}
              >
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={8} />
            ) : data && data.recentActivity.length > 0 ? (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {data.recentActivity.map((a) => (
                    <div
                      key={a.id}
                      className="relative flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                    >
                      {/* Timeline dot */}
                      <div
                        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full shrink-0 border-2 bg-card"
                        style={{
                          borderColor:
                            a.status === 'success'
                              ? 'var(--gg-green)'
                              : 'var(--gg-rose)',
                        }}
                      >
                        <CircleDot
                          className="h-4 w-4"
                          style={{
                            color:
                              a.status === 'success'
                                ? 'var(--gg-green)'
                                : 'var(--gg-rose)',
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {a.user}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            performed
                          </span>
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground/80">
                            {prettifyAction(a.action)}
                          </span>
                          {a.entity && (
                            <>
                              <span className="text-xs text-muted-foreground">on</span>
                              <span className="text-xs font-medium text-foreground/90">
                                {a.entity}
                              </span>
                            </>
                          )}
                          <StatusBadge
                            variant={
                              a.status === 'success' ? 'success' : 'error'
                            }
                            size="sm"
                          >
                            {a.status}
                          </StatusBadge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {timeAgo(a.createdAt)}
                          {a.ipAddress && ` · ${a.ipAddress}`}
                          {a.module && ` · ${a.module}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
