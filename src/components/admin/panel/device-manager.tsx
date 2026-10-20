'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Boxes,
  HardDrive,
  Activity,
  ExternalLink,
  Hash,
  Cpu,
  User,
  Building2,
  Calendar,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

// ============================================
// Types
// ============================================
interface ErpSystem {
  id: string
  name: string
  slug: string
  color: string
  icon: string | null
}

interface UnifiedDevice {
  id: string
  source: 'device' | 'erp_device'
  serialNumber: string | null
  name: string | null
  type: string | null
  status: string
  os: string | null
  browser: string | null
  ip: string | null
  userAgent: string | null
  lastActiveAt: string | null
  lastSyncedAt: string | null
  externalId: string | null
  createdAt: string
  updatedAt: string
  clientId: string | null
  clientName: string | null
  clientEmail: string | null
  erpSystemId: string | null
  erpSystemName: string | null
  erpSystemSlug: string | null
  erpSystemColor: string | null
}

interface Stats {
  totalDevices: number
  active: number
  offline: number
  byErp: number
  deviceCount: number
  erpDeviceCount: number
}

// ============================================
// Helpers
// ============================================
function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '—'
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
  return new Date(dateStr).toLocaleDateString()
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function isOnline(status: string): boolean {
  return status === 'active' || status === 'online'
}

// ============================================
// Status badge
// ============================================
function StatusBadge({ status }: { status: string }) {
  if (isOnline(status)) {
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
        Active
      </Badge>
    )
  }
  if (status === 'expired' || status === 'inactive' || status === 'offline') {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-500/10 text-gray-400 border-gray-500/20">
        <XCircle className="w-2.5 h-2.5 mr-0.5" />
        Offline
      </Badge>
    )
  }
  if (status === 'blocked') {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20">
        <XCircle className="w-2.5 h-2.5 mr-0.5" />
        Blocked
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
export function DeviceManager() {
  // Data state
  const [devices, setDevices] = useState<UnifiedDevice[]>([])
  const [erpSystems, setErpSystems] = useState<ErpSystem[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDevices: 0,
    active: 0,
    offline: 0,
    byErp: 0,
    deviceCount: 0,
    erpDeviceCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [erpFilter, setErpFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'offline' | 'by_erp'>('all')

  // Detail drawer
  const [selectedDevice, setSelectedDevice] = useState<UnifiedDevice | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // ============================================
  // Fetch devices
  // ============================================
  const fetchDevices = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)

      try {
        const params = new URLSearchParams()
        params.set('source', 'erp')
        if (search) params.set('search', search)
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (erpFilter !== 'all') params.set('erpSystemId', erpFilter)

        const res = await fetch(`/api/admin/devices?${params.toString()}`)
        const json = await res.json()

        if (json.success) {
          setDevices(json.data.devices)
          setErpSystems(json.data.erpSystems)
          setStats(json.data.stats)
        } else {
          toast.error(json.error || 'Failed to fetch devices')
        }
      } catch {
        toast.error('Network error')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [search, statusFilter, erpFilter],
  )

  // Refetch on filter change (debounced search).
  useEffect(() => {
    const t = setTimeout(() => {
      fetchDevices(true)
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, statusFilter, erpFilter])

  // Initial fetch.
  useEffect(() => {
    fetchDevices(false)
  }, [])

  // ============================================
  // Derived / tab-filtered devices
  // ============================================
  const visibleDevices = (() => {
    if (activeTab === 'active') return devices.filter((d) => isOnline(d.status))
    if (activeTab === 'offline') return devices.filter((d) => !isOnline(d.status))
    if (activeTab === 'by_erp') {
      // Show only ERP-linked devices (i.e. have an erpSystemName).
      return devices.filter((d) => !!d.erpSystemName)
    }
    return devices
  })()

  // ============================================
  // Open detail
  // ============================================
  const openDetail = (device: UnifiedDevice) => {
    setSelectedDevice(device)
    setDetailOpen(true)
  }

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

  const renderEmpty = () => {
    const hasFilters = search || statusFilter !== 'all' || erpFilter !== 'all'
    if (hasFilters) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Smartphone className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No devices match your filters</p>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your filters to see more devices.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
              setErpFilter('all')
            }}
            className="mt-4 text-foreground"
          >
            Clear filters
          </Button>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Smartphone className="h-12 w-12 text-gray-600 mb-4" />
        <p className="text-muted-foreground text-lg font-medium">No devices synced</p>
        <p className="text-gray-500 text-sm mt-1 max-w-md">
          Map a device table in the{' '}
          <a
            href="/admin/integrations"
            className="font-medium text-foreground hover:underline"
            style={{ color: 'var(--gg-vermillion)' }}
          >
            Integration Hub
          </a>{' '}
          to sync devices from your ERP.
        </p>
        <a href="/admin/integrations" className="mt-4 inline-block">
          <Button
            variant="outline"
            className="text-foreground"
            style={{ borderColor: 'var(--gg-separator)' }}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Open Integration Hub
          </Button>
        </a>
      </div>
    )
  }

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
            <Smartphone className="h-6 w-6" style={{ color: 'var(--gg-vermillion)' }} />
            Devices
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hardware devices synced from connected ERPs and active client sessions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDevices(true)}
          disabled={refreshing}
          className="text-foreground"
        >
          {refreshing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Smartphone className="h-5 w-5" />}
          label="Total Devices"
          value={stats.totalDevices}
          accent="var(--gg-vermillion, #f97316)"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Active"
          value={stats.active}
          accent="var(--gg-green, #10b981)"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Offline"
          value={stats.offline}
          accent="#ef4444"
        />
        <StatCard
          icon={<Boxes className="h-5 w-5" />}
          label="By ERP System"
          value={stats.byErp}
          accent="var(--gg-amber, #f59e0b)"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto sm:inline-flex">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
          <TabsTrigger value="offline" className="text-xs">Offline</TabsTrigger>
          <TabsTrigger value="by_erp" className="text-xs">By ERP System</TabsTrigger>
        </TabsList>
      </Tabs>

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    placeholder="Serial number or name..."
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
                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="offline" className="text-xs">Offline</SelectItem>
                    <SelectItem value="blocked" className="text-xs">Blocked</SelectItem>
                    <SelectItem value="expired" className="text-xs">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">ERP System</Label>
                <Select value={erpFilter} onValueChange={setErpFilter}>
                  <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="All ERPs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All ERPs</SelectItem>
                    {erpSystems.map((e) => (
                      <SelectItem key={e.id} value={e.id} className="text-xs">
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
          ) : visibleDevices.length === 0 ? (
            renderEmpty()
          ) : (
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground font-medium">Serial Number</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">Type</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden lg:table-cell">Client</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">ERP</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium hidden sm:table-cell">Last Synced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDevices.map((device, idx) => (
                    <motion.tr
                      key={`${device.source}-${device.id}`}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      custom={idx}
                      className="border-b hover:bg-white/[0.03] transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--gg-separator)' }}
                      onClick={() => openDetail(device)}
                    >
                      <TableCell className="py-2.5">
                        {device.serialNumber ? (
                          <span className="text-xs text-foreground font-mono">{device.serialNumber}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No serial</span>
                        )}
                        {device.source === 'erp_device' && (
                          <Badge variant="outline" className="ml-2 text-[9px] px-1 py-0 bg-purple-500/10 text-purple-300 border-purple-500/20">
                            ERP
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="text-xs font-medium text-foreground">{device.name || 'Unnamed'}</div>
                        {device.externalId && (
                          <div className="text-[10px] text-muted-foreground font-mono">ext: {device.externalId}</div>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 hidden md:table-cell">
                        {device.type || device.os ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/40 text-muted-foreground capitalize">
                            <Cpu className="w-2.5 h-2.5 mr-0.5" />
                            {device.type || device.os}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 hidden lg:table-cell">
                        {device.clientName ? (
                          <div>
                            <div className="text-xs text-foreground">{device.clientName}</div>
                            {device.clientEmail && (
                              <div className="text-[10px] text-muted-foreground">{device.clientEmail}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 hidden md:table-cell">
                        {device.erpSystemName ? (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: device.erpSystemColor || '#6366f1' }}
                            />
                            <span className="text-xs text-foreground">{device.erpSystemName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusBadge status={device.status} />
                      </TableCell>
                      <TableCell className="py-2.5 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {relativeTime(device.lastSyncedAt || device.lastActiveAt)}
                        </span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination summary (just count — full pagination could be added later) */}
      {!loading && visibleDevices.length > 0 && (
        <div className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            Showing <span className="text-foreground font-medium">{visibleDevices.length}</span> of{' '}
            <span className="text-foreground font-medium">{stats.totalDevices.toLocaleString()}</span> devices
            {activeTab !== 'all' && (
              <span className="text-muted-foreground"> · filtered by {activeTab.replace('_', ' ')}</span>
            )}
          </p>
        </div>
      )}

      {/* Device detail drawer (Dialog used as a right-side drawer) */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden" style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}>
          <DialogHeader className="px-5 py-4" style={{ borderBottom: '1px solid var(--gg-separator)' }}>
            <DialogTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-foreground">
                <Smartphone className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                Device Details
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailOpen(false)}
                className="h-7 w-7 p-0 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="overflow-y-auto max-h-[calc(90vh-65px)] px-5 py-4 space-y-4">
              {/* Identity card */}
              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'color-mix(in srgb, var(--gg-vermillion, #f97316) 6%, transparent)',
                  border: '1px solid var(--gg-separator)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                    }}
                  >
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedDevice.name || 'Unnamed Device'}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {selectedDevice.serialNumber || selectedDevice.externalId || selectedDevice.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={selectedDevice.status} />
                  {selectedDevice.source === 'erp_device' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-300 border-purple-500/20">
                      ERP-synced
                    </Badge>
                  )}
                  {selectedDevice.source === 'device' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/40 text-muted-foreground">
                      Client session
                    </Badge>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Device Specs
                </p>
                <div className="space-y-1.5">
                  <DetailRow
                    icon={<Hash className="h-3.5 w-3.5" />}
                    label="Serial Number"
                    value={selectedDevice.serialNumber || '—'}
                    mono
                  />
                  <DetailRow
                    icon={<Cpu className="h-3.5 w-3.5" />}
                    label="Type"
                    value={selectedDevice.type || selectedDevice.os || '—'}
                  />
                  {selectedDevice.browser && (
                    <DetailRow
                      icon={<Cpu className="h-3.5 w-3.5" />}
                      label="Browser"
                      value={selectedDevice.browser}
                    />
                  )}
                  {selectedDevice.ip && (
                    <DetailRow
                      icon={<ExternalLink className="h-3.5 w-3.5" />}
                      label="IP Address"
                      value={selectedDevice.ip}
                      mono
                    />
                  )}
                  {selectedDevice.externalId && (
                    <DetailRow
                      icon={<Hash className="h-3.5 w-3.5" />}
                      label="External ID"
                      value={selectedDevice.externalId}
                      mono
                    />
                  )}
                </div>
              </div>

              {/* Linked client */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Linked Client
                </p>
                {selectedDevice.clientName ? (
                  <div
                    className="p-3 rounded-lg space-y-1.5"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-teal, #14b8a6) 6%, transparent)',
                      border: '1px solid var(--gg-separator)',
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {selectedDevice.clientName}
                    </div>
                    {selectedDevice.clientEmail && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        {selectedDevice.clientEmail}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    This device is not linked to any client.
                  </p>
                )}
              </div>

              {/* ERP system */}
              {selectedDevice.erpSystemName && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    ERP System
                  </p>
                  <div
                    className="p-3 rounded-lg flex items-center gap-2"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-amber, #f59e0b) 6%, transparent)',
                      border: '1px solid var(--gg-separator)',
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: selectedDevice.erpSystemColor || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-foreground font-medium">{selectedDevice.erpSystemName}</div>
                      {selectedDevice.erpSystemSlug && (
                        <div className="text-[11px] text-muted-foreground font-mono">{selectedDevice.erpSystemSlug}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Timeline
                </p>
                <div className="space-y-1.5">
                  {selectedDevice.lastSyncedAt && (
                    <DetailRow
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Last Synced"
                      value={formatDateTime(selectedDevice.lastSyncedAt)}
                    />
                  )}
                  {selectedDevice.lastActiveAt && (
                    <DetailRow
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Last Active"
                      value={formatDateTime(selectedDevice.lastActiveAt)}
                    />
                  )}
                  <DetailRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Created"
                    value={formatDateTime(selectedDevice.createdAt)}
                  />
                  <DetailRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Updated"
                    value={formatDateTime(selectedDevice.updatedAt)}
                  />
                </div>
              </div>

              {/* Raw IDs */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  System IDs
                </p>
                <div className="space-y-1">
                  <DetailRow label="Device ID" value={selectedDevice.id} mono small />
                  {selectedDevice.clientId && (
                    <DetailRow label="Client ID" value={selectedDevice.clientId} mono small />
                  )}
                  {selectedDevice.erpSystemId && (
                    <DetailRow label="ERP System ID" value={selectedDevice.erpSystemId} mono small />
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Detail row helper
// ============================================
function DetailRow({
  icon,
  label,
  value,
  mono = false,
  small = false,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  mono?: boolean
  small?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        {icon}
        {label}
      </div>
      <span
        className={`text-right ${small ? 'text-[10px]' : 'text-xs'} text-foreground ${mono ? 'font-mono' : ''} truncate max-w-[60%]`}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}
