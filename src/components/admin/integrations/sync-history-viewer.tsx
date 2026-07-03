'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  History,
  Loader2,
  Download,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { getErpIcon, getErpColor, FALLBACK_ERP_DATA } from '@/lib/erp-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EmptyState } from '@/components/admin/shared/empty-state'

/* ─── Types ─── */

interface SyncLogEntry {
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
  startedAt: string
  completedAt: string | null
}

interface Pagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/* ─── Constants ─── */

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'partial', label: 'Partial' },
  { value: 'running', label: 'Running' },
]

const PAGE_SIZE = 50

const ERP_OPTIONS = [
  { value: '', label: 'All ERPs' },
  ...FALLBACK_ERP_DATA.map((e) => ({ value: e.slug, label: e.name })),
]

/* ─── Helpers ─── */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 5) return 'Just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const mins = Math.floor(ms / 60000)
  const secs = Math.round((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}

function statusBadgeVariant(status: string): { className: string } {
  switch (status) {
    case 'success':
      return { className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    case 'failed':
      return { className: 'bg-red-500/10 text-red-400 border-red-500/20' }
    case 'partial':
      return { className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    case 'running':
      return { className: 'bg-sky-500/10 text-sky-400 border-sky-500/20' }
    default:
      return { className: 'bg-muted text-muted-foreground' }
  }
}

function getErpMeta(slug: string) {
  const fallback = FALLBACK_ERP_DATA.find((e) => e.slug === slug)
  return {
    icon: getErpIcon(fallback?.icon || 'zap'),
    color: getErpColor(fallback?.color || 'teal'),
  }
}

/* ─── Row animation ─── */

const rowVariant = {
  hidden: { opacity: 0, x: -6 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.02, duration: 0.25 },
  }),
}

const highlightVariant = {
  initial: { backgroundColor: 'rgba(250,204,21,0.1)' },
  animate: { backgroundColor: 'rgba(250,204,21,0)' },
  transition: { duration: 2 },
}

/* ─── SyncHistoryViewer ─── */

export function SyncHistoryViewer() {
  const [logs, setLogs] = useState<SyncLogEntry[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, limit: PAGE_SIZE, offset: 0, hasMore: false })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Filters
  const [erpFilter, setErpFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // New entries highlight
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set())
  const prevLogIdsRef = useRef<Set<string>>(new Set())

  // Clearing
  const [clearing, setClearing] = useState(false)

  const fetchLogs = useCallback(async (append = false) => {
    const offset = append ? logs.length : 0
    const isLoadMore = append

    if (isLoadMore) {
      setLoadingMore(true)
    } else if (loading && !append) {
      // Already loading initial
    }

    try {
      const params = new URLSearchParams()
      params.set('limit', String(PAGE_SIZE))
      params.set('offset', String(offset))
      if (erpFilter) params.set('erpSlug', erpFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/sync-history?${params.toString()}`)
      const json = await res.json()

      if (json.success) {
        const newLogs: SyncLogEntry[] = json.data.logs
        const newPagination: Pagination = json.data.pagination

        // Detect new entries for highlight
        if (!append) {
          const newIds = new Set(newLogs.map((l: SyncLogEntry) => l.id))
          const added = new Set<string>()
          for (const id of newIds) {
            if (!prevLogIdsRef.current.has(id)) {
              added.add(id)
            }
          }
          if (added.size > 0) {
            setHighlightIds(added)
            setTimeout(() => setHighlightIds(new Set()), 2200)
          }
          prevLogIdsRef.current = newIds
          setLogs(newLogs)
        } else {
          setLogs((prev) => [...prev, ...newLogs])
        }

        setPagination(newPagination)
      } else {
        toast.error('Failed to fetch sync history')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [erpFilter, statusFilter, logs.length, loading])

  // Initial fetch
  useEffect(() => {
    setLoading(true)
    setLogs([])
    prevLogIdsRef.current = new Set()
    fetchLogs().then(() => setLoading(false))
  }, [erpFilter, statusFilter])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs()
    }, 30000)
    return () => clearInterval(interval)
  }, [erpFilter, statusFilter])

  const handleLoadMore = () => {
    fetchLogs(true)
  }

  const handleClearHistory = async () => {
    setClearing(true)
    try {
      // No dedicated clear endpoint, use DELETE on sync-history isn't available
      // We'll just reset the view
      toast.info('History cleared from view. Database records are preserved.')
      setLogs([])
      setPagination({ total: 0, limit: PAGE_SIZE, offset: 0, hasMore: false })
      prevLogIdsRef.current = new Set()
    } catch {
      toast.error('Failed to clear history')
    }
    setClearing(false)
  }

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Timestamp', 'ERP', 'Direction', 'Type', 'Status', 'Records Synced', 'Records Failed', 'Duration (ms)', 'Error']
    const rows = logs.map((log) => [
      new Date(log.startedAt).toISOString(),
      log.erpName,
      log.direction,
      log.syncType,
      log.status,
      log.recordsSynced,
      log.recordsFailed,
      log.durationMs,
      log.errorMessage || '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sync-history-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported successfully')
  }

  const formatDateInput = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Sync History
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total} total record{pagination.total !== 1 ? 's' : ''} &middot; Auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fetchLogs()}>
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCSV} disabled={logs.length === 0}>
            <Download className="w-3 h-3" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            disabled={clearing || logs.length === 0}
            onClick={handleClearHistory}
          >
            {clearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Clear
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <div className="space-y-1 flex-1 min-w-0">
                <Label className="text-[10px] text-muted-foreground">ERP</Label>
                <Select value={erpFilter} onValueChange={(val) => setErpFilter(val === '__all__' ? '' : val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All ERPs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" className="text-xs">All ERPs</SelectItem>
                    {ERP_OPTIONS.filter((e) => e.value !== '').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <Label className="text-[10px] text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === '__all__' ? '' : val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value || '__all__'} value={opt.value || '__all__'} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No sync history"
          description="Sync history will appear here once integrations start syncing data."
        />
      )}

      {/* History table */}
      {!loading && logs.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8" />
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">ERP</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Direction</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Records</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Duration</TableHead>
                    <TableHead className="text-xs">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => {
                    const { icon: ErpIcon, color: colorData } = getErpMeta(log.erpSlug)
                    const isExpanded = expandedId === log.id
                    const isHighlighted = highlightIds.has(log.id)
                    const sv = statusBadgeVariant(log.status)

                    return (
                      <>
                        <motion.tr
                          key={log.id}
                          variants={rowVariant}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className={`border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${isHighlighted ? 'bg-yellow-500/5' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          <TableCell className="py-2.5 w-8">
                            {log.errorMessage ? (
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              </motion.div>
                            ) : null}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {relativeTime(log.startedAt)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {new Date(log.startedAt).toLocaleString()}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <ErpIcon className={`w-3.5 h-3.5 ${colorData.text}`} />
                              <span className="text-xs font-medium text-foreground">{log.erpName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 hidden md:table-cell">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/50">
                              {log.direction}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 hidden lg:table-cell">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/50 capitalize">
                              {log.syncType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${sv.className}`}>
                              {log.status === 'running' && <Loader2 className="w-2.5 h-2.5 animate-spin mr-0.5" />}
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 hidden sm:table-cell">
                            <span className="text-xs text-foreground">
                              {log.recordsSynced}
                            </span>
                            {log.recordsFailed > 0 && (
                              <span className="text-xs text-red-400"> / {log.recordsFailed}</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatDuration(log.durationMs)}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {log.errorMessage ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs">{log.errorMessage}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </motion.tr>

                        {/* Expanded error row */}
                        <AnimatePresence>
                          {isExpanded && log.errorMessage && (
                            <motion.tr
                              key={`${log.id}-expanded`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <TableCell colSpan={9} className="p-0">
                                <div className="bg-red-500/5 border-t border-red-500/10 px-4 py-3">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-red-400 mb-1">Error Details</p>
                                      <p className="text-xs text-muted-foreground font-mono break-all">{log.errorMessage}</p>
                                      {log.completedAt && (
                                        <p className="text-[10px] text-muted-foreground mt-2">
                                          Completed: {new Date(log.completedAt).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
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

            {/* Load more */}
            {pagination.hasMore && (
              <div className="flex justify-center py-3 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                >
                  {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  Load More ({pagination.total - logs.length} remaining)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}