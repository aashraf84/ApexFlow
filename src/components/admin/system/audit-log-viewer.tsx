'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ShieldAlert,
  LogIn,
  CalendarDays,
  Filter,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
interface AuditLogUser {
  id: string
  name: string
  email: string
}

interface AuditLog {
  id: string
  userId: string | null
  action: string
  module: string | null
  entity: string | null
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: AuditLogUser | null
  status: 'success' | 'failure'
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

interface Stats {
  eventsToday: number
  eventsThisWeek: number
  criticalActions: number
  failedLogins: number
}

interface UserOption {
  id: string
  name: string
  email: string
}

// ============================================
// Constants — common action filter shortcuts
// ============================================
const ACTION_FILTERS = [
  { value: '__all__', label: 'All Actions' },
  { value: 'user.login', label: 'User Login' },
  { value: 'user.logout', label: 'User Logout' },
  { value: 'user.create', label: 'User Create' },
  { value: 'user.update', label: 'User Update' },
  { value: 'user.delete', label: 'User Delete' },
  { value: 'client.create', label: 'Client Create' },
  { value: 'client.update', label: 'Client Update' },
  { value: 'client.delete', label: 'Client Delete' },
  { value: 'integration.sync', label: 'Integration Sync' },
  { value: 'settings.update', label: 'Settings Update' },
]

const PAGE_SIZE = 25

// ============================================
// Helpers
// ============================================
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
  return formatDateTime(dateStr)
}

function prettyJson(obj: unknown): string {
  try {
    if (obj === null || obj === undefined) return '—'
    if (typeof obj === 'string') {
      // Try to parse the details string as JSON for pretty-printing.
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
function StatusBadge({ status }: { status: 'success' | 'failure' }) {
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
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20"
    >
      <XCircle className="w-2.5 h-2.5 mr-0.5" />
      Failure
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
export function AuditLogViewer() {
  // Data state
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats>({
    eventsToday: 0,
    eventsThisWeek: 0,
    criticalActions: 0,
    failedLogins: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    hasMore: false,
  })
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter state
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('__all__')
  const [userFilter, setUserFilter] = useState('__all__')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // ============================================
  // Fetch users for the filter dropdown
  // ============================================
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/users?pageSize=200')
        if (cancelled) return
        if (res.ok) {
          const json = await res.json()
          // Normalize — the users endpoint returns either {data:[...]} or
          // {users:[...]} depending on the catch-all path. Handle both.
          const list = json.data || json.users || json.items || []
          const mapped: UserOption[] = list.map((u: any) => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || '',
          }))
          setUsers(mapped)
        }
      } catch {
        // Non-fatal — the dropdown just stays empty.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
        if (actionFilter && actionFilter !== '__all__') params.set('action', actionFilter)
        if (userFilter && userFilter !== '__all__') params.set('userId', userFilter)
        if (dateFrom) params.set('dateFrom', dateFrom)
        if (dateTo) params.set('dateTo', dateTo)
        if (search) params.set('search', search)

        const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
        const json = await res.json()

        if (json.success) {
          setLogs(json.data.logs)
          setStats(json.data.stats)
          setPagination(json.data.pagination)
        } else {
          toast.error(json.error || 'Failed to fetch audit logs')
        }
      } catch {
        toast.error('Network error')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [actionFilter, userFilter, dateFrom, dateTo, search, page],
  )

  // Initial fetch + refetch when filters change (debounced search).
  useEffect(() => {
    const t = setTimeout(() => {
      fetchLogs({ resetPage: true, silent: true })
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, actionFilter, userFilter, dateFrom, dateTo])

  // Fetch the correct page when `page` changes.
  useEffect(() => {
    fetchLogs({ silent: true })
  }, [page])

  // ============================================
  // CSV export — uses the CURRENT filter set, fetches up to 1000 rows
  // ============================================
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '1000')
      if (actionFilter && actionFilter !== '__all__') params.set('action', actionFilter)
      if (userFilter && userFilter !== '__all__') params.set('userId', userFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const json = await res.json()

      if (!json.success) {
        toast.error('Failed to export')
        return
      }

      const rows: AuditLog[] = json.data.logs || []
      if (rows.length === 0) {
        toast.error('No data to export')
        return
      }

      const headers = [
        'Timestamp',
        'User',
        'Email',
        'Action',
        'Module',
        'Entity',
        'Entity ID',
        'IP Address',
        'Status',
        'Details',
      ]
      const csvRows = rows.map((log) => [
        new Date(log.createdAt).toISOString(),
        log.user?.name || '—',
        log.user?.email || '',
        log.action,
        log.module || '',
        log.entity || '',
        log.entityId || '',
        log.ipAddress || '',
        log.status,
        log.details || '',
      ])

      const csvContent = [headers, ...csvRows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${rows.length} audit logs`)
    } catch {
      toast.error('Failed to export CSV')
    }
  }

  // ============================================
  // Pagination helpers
  // ============================================
  const goToPage = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return
    setPage(p)
    setExpandedId(null)
  }

  const clearFilters = () => {
    setSearch('')
    setActionFilter('__all__')
    setUserFilter('__all__')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters =
    search !== '' ||
    actionFilter !== '__all__' ||
    userFilter !== '__all__' ||
    dateFrom !== '' ||
    dateTo !== ''

  // ============================================
  // Render: loading skeletons
  // ============================================
  const renderSkeletons = () => (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  // ============================================
  // Render: empty state
  // ============================================
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <ScrollText className="h-12 w-12 text-gray-600 mb-4" />
      <p className="text-muted-foreground text-lg font-medium">No audit events found</p>
      <p className="text-gray-500 text-sm mt-1">
        {hasActiveFilters
          ? 'Try adjusting your filters to see more events.'
          : 'Audit events will appear here as admin actions are recorded.'}
      </p>
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="mt-4 text-foreground">
          Clear filters
        </Button>
      )}
    </div>
  )

  // ============================================
  // Render: table row (with expand)
  // ============================================
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
            Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable record of admin actions — logins, mutations, and security events.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          icon={<CalendarDays className="h-5 w-5" />}
          label="Events Today"
          value={stats.eventsToday}
          accent="var(--gg-vermillion, #f97316)"
        />
        <StatCard
          icon={<ScrollText className="h-5 w-5" />}
          label="This Week"
          value={stats.eventsThisWeek}
          accent="var(--gg-amber, #f59e0b)"
        />
        <StatCard
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Critical Actions"
          value={stats.criticalActions}
          accent="#ef4444"
        />
        <StatCard
          icon={<LogIn className="h-5 w-5" />}
          label="Failed Logins"
          value={stats.failedLogins}
          accent="#f43f5e"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              {/* Search */}
              <div className="space-y-1 lg:col-span-1">
                <Label className="text-[10px] text-muted-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    placeholder="Action or entity ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs text-foreground"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  />
                </div>
              </div>
              {/* Action filter */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_FILTERS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* User filter */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">User</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" className="text-xs">All Users</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.name} {u.email ? `· ${u.email}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date from */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs text-foreground"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              {/* Date to */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs text-foreground"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
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
                    <TableHead className="text-xs text-muted-foreground font-medium">User</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Action</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">Entity</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden lg:table-cell">Entity ID</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden lg:table-cell">IP Address</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => {
                    const isExpanded = expandedId === log.id
                    const hasDetails = !!log.details || !!log.module
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
                            {hasDetails ? (
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              </motion.div>
                            ) : null}
                          </TableCell>
                          <TableCell className="py-2.5 whitespace-nowrap">
                            <div className="text-xs text-foreground">{relativeTime(log.createdAt)}</div>
                            <div className="text-[10px] text-muted-foreground">{formatDateTime(log.createdAt)}</div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {log.user ? (
                              <div>
                                <div className="text-xs font-medium text-foreground">{log.user.name}</div>
                                <div className="text-[10px] text-muted-foreground">{log.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">System</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-mono"
                              style={{
                                background: 'color-mix(in srgb, var(--gg-vermillion, #f97316) 10%, transparent)',
                                color: 'var(--gg-vermillion, #f97316)',
                                borderColor: 'color-mix(in srgb, var(--gg-vermillion, #f97316) 20%, transparent)',
                              }}
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{log.entity || '—'}</span>
                          </TableCell>
                          <TableCell className="py-2.5 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground font-mono">{log.entityId || '—'}</span>
                          </TableCell>
                          <TableCell className="py-2.5 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground font-mono">{log.ipAddress || '—'}</span>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <StatusBadge status={log.status} />
                          </TableCell>
                        </motion.tr>

                        {/* Expanded details row */}
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
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module</p>
                                      <p className="text-xs text-foreground mt-0.5">{log.module || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IP Address</p>
                                      <p className="text-xs text-foreground font-mono mt-0.5">{log.ipAddress || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entity</p>
                                      <p className="text-xs text-foreground mt-0.5">{log.entity || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entity ID</p>
                                      <p className="text-xs text-foreground font-mono mt-0.5 break-all">{log.entityId || '—'}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Metadata</p>
                                    <pre
                                      className="text-[11px] text-foreground p-3 rounded-md overflow-x-auto max-h-64 font-mono"
                                      style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid var(--gg-separator)',
                                      }}
                                    >
                                      {prettyJson(log.details)}
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
            of <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span> events
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
