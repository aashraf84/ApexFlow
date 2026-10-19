'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScrollText,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Activity,
  Zap,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCcw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ============================================
// Types
// ============================================
interface SyncLog {
  id: string
  erpSystemId: string | null
  erpSlug: string
  erpName: string
  direction: string
  status: string
  syncType: string
  recordsSynced: number
  recordsFailed: number
  durationMs: number
  errorMessage: string | null
  metadata: string | null
  startedAt: string
  completedAt: string | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

interface Stats {
  totalSyncsToday: number
  successfulToday: number
  failedToday: number
  partialToday: number
}

interface ErpOption {
  slug: string
  name: string
}

// ============================================
// Constants
// ============================================
const PAGE_SIZE = 25

const STATUS_OPTIONS = [
  { value: '__all__', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'partial', label: 'Partial' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
]

const DIRECTION_OPTIONS = [
  { value: '__all__', label: 'All Directions' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'bidirectional', label: 'Bidirectional' },
]

// ============================================
// Helpers
// ============================================
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 5) return 'Just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleString()
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const mins = Math.floor(ms / 60000)
  const secs = Math.round((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}

function truncate(text: string, max = 60): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

function prettyJson(obj: unknown): string {
  try {
    if (obj === null || obj === undefined) return '—'
    if (typeof obj === 'string') {
      try {
        const parsed = JSON.parse(obj)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return obj
      }
    }
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

// ============================================
// Status badge
// ============================================
function StatusBadge({ status }: { status: string }) {
  const isLoading = status === 'running' || status === 'pending'
  if (status === 'success') {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 py-0"
        style={{
          background: 'color-mix(in srgb, var(--gg-green, #10b981) 12%, transparent)',
          color: 'var(--gg-green, #10b981)',
          borderColor: 'color-mix(in srgb, var(--gg-green, #10b981) 20%, transparent)',
        }}
      >
        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
        Success
      </Badge>
    )
  }
  if (status === 'failed') {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20">
        <XCircle className="w-2.5 h-2.5 mr-0.5" />
        Failed
      </Badge>
    )
  }
  if (status === 'partial') {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
        <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
        Partial
      </Badge>
    )
  }
  if (isLoading) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-sky-500/10 text-sky-400 border-sky-500/20">
        <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize bg-muted/40 text-muted-foreground">
      {status}
    </Badge>
  )
}

// ============================================
// Direction badge
// ============================================
function DirectionBadge({ direction }: { direction: string }) {
  const label = direction.charAt(0).toUpperCase() + direction.slice(1)
  const isInbound = direction === 'inbound'
  const isOutbound = direction === 'outbound'
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 py-0 capitalize"
      style={{
        background: isInbound
          ? 'color-mix(in srgb, var(--gg-teal, #14b8a6) 12%, transparent)'
          : isOutbound
            ? 'color-mix(in srgb, var(--gg-vermillion, #f97316) 12%, transparent)'
            : 'rgba(168, 85, 247, 0.1)',
        color: isInbound
          ? 'var(--gg-teal, #14b8a6)'
          : isOutbound
            ? 'var(--gg-vermillion, #f97316)'
            : '#a855f7',
        borderColor: isInbound
          ? 'color-mix(in srgb, var(--gg-teal, #14b8a6) 20%, transparent)'
          : isOutbound
            ? 'color-mix(in srgb, var(--gg-vermillion, #f97316) 20%, transparent)'
            : 'rgba(168, 85, 247, 0.2)',
      }}
    >
      {isInbound ? (
        <ArrowDownToLine className="w-2.5 h-2.5 mr-0.5" />
      ) : isOutbound ? (
        <ArrowUpFromLine className="w-2.5 h-2.5 mr-0.5" />
      ) : (
        <RefreshCcw className="w-2.5 h-2.5 mr-0.5" />
      )}
      {label}
    </Badge>
  )
}

// ============================================
// Stat card
// ============================================
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent: string
}) {
  return (
    <Card
      style={{
        background: 'var(--secondary)',
        borderColor: 'var(--gg-separator)',
        boxShadow: 'var(--gg-shadow-card)',
      }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)` }}
          >
            <div style={{ color: accent }}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main component
// ============================================
export function SyncLogViewer() {
  // Data state
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSyncsToday: 0,
    successfulToday: 0,
    failedToday: 0,
    partialToday: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    hasMore: false,
  })
  const [erpSystems, setErpSystems] = useState<ErpOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('__all__')
  const [directionFilter, setDirectionFilter] = useState('__all__')
  const [erpFilter, setErpFilter] = useState('__all__')

  // Pagination
  const [page, setPage] = useState(1)

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false)
  const autoRefreshRef = useRef(autoRefresh)
  autoRefreshRef.current = autoRefresh

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // ============================================
  // Fetch logs
  // ============================================
  const fetchLogs = useCallback(
    async (opts: { resetPage?: boolean; silent?: boolean } = {}) => {
      const resetPage = opts.resetPage ?? false
      const silent = opts.silent ?? false
      const targetPage = resetPage ? 1 : page
      if (resetPage && page !== 1) setPage(1)

      if (!silent) setLoading(true)
      else setRefreshing(true)

      try {
        const params = new URLSearchParams()
        params.set('page', String(targetPage))
        params.set('limit', String(PAGE_SIZE))
        if (statusFilter && statusFilter !== '__all__') params.set('status', statusFilter)
        if (directionFilter && directionFilter !== '__all__') params.set('direction', directionFilter)
        if (erpFilter && erpFilter !== '__all__') params.set('erpSlug', erpFilter)
        if (search) params.set('search', search)

        const res = await fetch(`/api/admin/sync-logs?${params.toString()}`)
        const json = await res.json()

        if (json.success) {
          setLogs(json.data.logs)
          setStats(json.data.stats)
          setPagination(json.data.pagination)
          if (json.data.erpSystems) {
            setErpSystems(json.data.erpSystems)
          }
        } else {
          toast.error(json.error || 'Failed to fetch sync logs')
        }
      } catch {
        toast.error('Network error')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [statusFilter, directionFilter, erpFilter, search, page],
  )

  // Refetch on filter change (debounced search).
  useEffect(() => {
    const t = setTimeout(() => {
      fetchLogs({ resetPage: true, silent: true })
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, statusFilter, directionFilter, erpFilter])

  // Fetch on page change.
  useEffect(() => {
    fetchLogs({ silent: true })
  }, [page])

  // Auto-refresh every 15s when enabled.
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchLogs({ silent: true })
    }, 15000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // ============================================
  // CSV export
  // ============================================
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '1000')
      if (statusFilter && statusFilter !== '__all__') params.set('status', statusFilter)
      if (directionFilter && directionFilter !== '__all__') params.set('direction', directionFilter)
      if (erpFilter && erpFilter !== '__all__') params.set('erpSlug', erpFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/sync-logs?${params.toString()}`)
      const json = await res.json()
      if (!json.success) {
        toast.error('Failed to export')
        return
      }

      const rows: SyncLog[] = json.data.logs || []
      if (rows.length === 0) {
        toast.error('No data to export')
        return
      }

      const headers = [
        'Started At',
        'Completed At',
        'ERP Name',
        'ERP Slug',
        'Direction',
        'Status',
        'Sync Type',
        'Records Synced',
        'Records Failed',
        'Duration (ms)',
        'Error',
      ]
      const csvRows = rows.map((l) => [
        new Date(l.startedAt).toISOString(),
        l.completedAt ? new Date(l.completedAt).toISOString() : '',
        l.erpName,
        l.erpSlug,
        l.direction,
        l.status,
        l.syncType,
        l.recordsSynced,
        l.recordsFailed,
        l.durationMs,
        l.errorMessage || '',
      ])

      const csvContent = [headers, ...csvRows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sync-logs-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${rows.length} sync logs`)
    } catch {
      toast.error('Failed to export CSV')
    }
  }

  // ============================================
  // Pagination / filter helpers
  // ============================================
  const goToPage = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return
    setPage(p)
    setExpandedId(null)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('__all__')
    setDirectionFilter('__all__')
    setErpFilter('__all__')
    setPage(1)
  }

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== '__all__' ||
    directionFilter !== '__all__' ||
    erpFilter !== '__all__'

  // ============================================
  // Render helpers
  // ============================================
  const renderSkeletons = () => (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <ScrollText className="h-12 w-12 text-gray-600 mb-4" />
      <p className="text-muted-foreground text-lg font-medium">No sync logs found</p>
      <p className="text-gray-500 text-sm mt-1">
        {hasActiveFilters
          ? 'Try adjusting your filters to see more events.'
          : 'Sync logs will appear here as integrations run.'}
      </p>
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="mt-4 text-foreground">
          Clear filters
        </Button>
      )}
    </div>
  )

  const rowVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.015, duration: 0.2 },
    }),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ScrollText className="h-6 w-6" style={{ color: 'var(--gg-vermillion)' }} />
            Sync Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time view of data syncs between ApexFlow and connected ERP systems.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}>
            <Label htmlFor="auto-refresh" className="text-xs text-muted-foreground cursor-pointer">
              Auto-refresh
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            {autoRefresh && (
              <span className="text-[10px] text-muted-foreground animate-pulse">·  15s</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs({ silent: true })}
            disabled={refreshing}
            className="text-foreground"
          >
            {refreshing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="text-foreground"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Total Syncs Today"
          value={stats.totalSyncsToday}
          accent="var(--gg-vermillion, #f97316)"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Successful Today"
          value={stats.successfulToday}
          accent="var(--gg-green, #10b981)"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Failed Today"
          value={stats.failedToday}
          accent="#ef4444"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Partial Today"
          value={stats.partialToday}
          accent="var(--gg-amber, #f59e0b)"
        />
      </div>

      {/* Filters */}
      <Card
        style={{
          background: 'var(--secondary)',
          borderColor: 'var(--gg-separator)',
        }}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="space-y-1 lg:col-span-1">
                <Label className="text-[10px] text-muted-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    placeholder="ERP name or error..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs text-foreground"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Direction</Label>
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="All directions" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">ERP</Label>
                <Select value={erpFilter} onValueChange={setErpFilter}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="All ERPs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" className="text-xs">All ERPs</SelectItem>
                    {erpSystems.map((e) => (
                      <SelectItem key={e.slug} value={e.slug} className="text-xs">
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground h-7">
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card
        style={{
          background: 'var(--secondary)',
          borderColor: 'var(--gg-separator)',
          boxShadow: 'var(--gg-shadow-card)',
        }}
      >
        <CardContent className="p-0">
          {loading ? (
            renderSkeletons()
          ) : logs.length === 0 ? (
            renderEmpty()
          ) : (
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-transparent">
                    <TableHead className="text-xs w-8" />
                    <TableHead className="text-xs text-muted-foreground font-medium">Timestamp</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">ERP</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">Direction</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden sm:table-cell">Synced / Failed</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden sm:table-cell">Duration</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => {
                    const isExpanded = expandedId === log.id
                    const hasError = !!log.errorMessage || !!log.metadata
                    return (
                      <>
                        <motion.tr
                          key={log.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className={`border-b transition-colors cursor-pointer ${
                            isExpanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'
                          }`}
                          style={{ borderColor: 'var(--gg-separator)' }}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          <TableCell className="py-2.5 w-8">
                            {hasError ? (
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              </motion.div>
                            ) : null}
                          </TableCell>
                          <TableCell className="py-2.5 whitespace-nowrap">
                            <div className="text-xs text-foreground">{relativeTime(log.startedAt)}</div>
                            <div className="text-[10px] text-muted-foreground">{formatDateTime(log.startedAt)}</div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="flex items-center justify-center w-5 h-5 rounded shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                                }}
                              >
                                <Zap className="h-3 w-3 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">{log.erpName}</div>
                                <div className="text-[10px] text-muted-foreground font-mono truncate">{log.erpSlug}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 hidden md:table-cell">
                            <DirectionBadge direction={log.direction} />
                          </TableCell>
                          <TableCell className="py-2.5">
                            <StatusBadge status={log.status} />
                          </TableCell>
                          <TableCell className="py-2.5 hidden sm:table-cell">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-foreground font-medium">{log.recordsSynced}</span>
                              {log.recordsFailed > 0 && (
                                <span className="text-red-400">/ {log.recordsFailed} failed</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatDuration(log.durationMs)}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 max-w-xs">
                            {log.errorMessage ? (
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                <span className="text-xs text-red-400 truncate" title={log.errorMessage}>
                                  {truncate(log.errorMessage, 50)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </motion.tr>

                        {/* Expanded row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              key={`${log.id}-expanded`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <TableCell colSpan={8} className="p-0">
                                <div
                                  className="px-4 py-3"
                                  style={{
                                    background: 'color-mix(in srgb, var(--gg-vermillion, #f97316) 4%, transparent)',
                                    borderTop: '1px solid var(--gg-separator)',
                                  }}
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Started</p>
                                      <p className="text-xs text-foreground mt-0.5">{formatDateTime(log.startedAt)}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed</p>
                                      <p className="text-xs text-foreground mt-0.5">
                                        {log.completedAt ? formatDateTime(log.completedAt) : '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sync Type</p>
                                      <p className="text-xs text-foreground mt-0.5 capitalize">{log.syncType}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
                                      <p className="text-xs text-foreground font-mono mt-0.5">{formatDuration(log.durationMs)}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Records Synced</p>
                                      <p className="text-xs text-foreground mt-0.5">{log.recordsSynced}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Records Failed</p>
                                      <p className="text-xs mt-0.5" style={{ color: log.recordsFailed > 0 ? '#ef4444' : 'var(--foreground)' }}>
                                        {log.recordsFailed}
                                      </p>
                                    </div>
                                  </div>
                                  {log.errorMessage && (
                                    <div className="mb-3">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Error Message</p>
                                      <pre
                                        className="text-[11px] text-red-300 p-3 rounded-md overflow-x-auto max-h-40 whitespace-pre-wrap break-words font-mono"
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.08)',
                                          border: '1px solid rgba(239, 68, 68, 0.2)',
                                        }}
                                      >
                                        {log.errorMessage}
                                      </pre>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Metadata</p>
                                    <pre
                                      className="text-[11px] text-foreground p-3 rounded-md overflow-x-auto max-h-64 font-mono"
                                      style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid var(--gg-separator)',
                                      }}
                                    >
                                      {prettyJson(log.metadata)}
                                    </pre>
                                  </div>
                                </div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing{' '}
            <span className="text-foreground font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="text-foreground font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span> syncs
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="text-foreground h-8"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasMore}
              className="text-foreground h-8"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
