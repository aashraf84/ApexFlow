'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion } from 'framer-motion'
import {
  Plug,
  AlertTriangle,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Repeat,
  Users,
  Wifi,
  WifiOff,
  ExternalLink,
  RefreshCw,
  Shirt,
  Hotel,
  GraduationCap,
  ShoppingCart,
  Pill,
  HardHat,
  Building2,
  Package,
  Activity,
  DollarSign,
  KeyRound,
  Plane,
  Factory,
  UtensilsCrossed,
  Wrench,
  Database,
  Loader2,
  Heart,
  TextCursorInput,
  Palette,
  Compass,
  Route,
  Truck,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

interface RecentEvent {
  id: string
  eventType: string
  status: string
  createdAt: string
}

interface Integration {
  id: string
  slug: string
  name: string
  erpName: string
  type: string
  status: string
  icon: string
  color: string
  website: string
  connected: boolean
  latency: number | null
  connectionError: string | null
  clientCount: number
  lastSyncAt: string | null
  syncCount: number
  errorCount: number
  tenantCount: number
  recentEvents: RecentEvent[]
}

interface Summary {
  total: number
  active: number
  error: number
  totalClients: number
  totalRevenue: number
  totalLicenses: number
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  hotel: Hotel,
  graduation: GraduationCap,
  shopping: ShoppingCart,
  pill: Pill,
  hardhat: HardHat,
  building: Building2,
  plane: Plane,
  factory: Factory,
  utensils: UtensilsCrossed,
  wrench: Wrench,
  heart: Heart,
  textcursor: TextCursorInput,
  palette: Palette,
  compass: Compass,
  route: Route,
  truck: Truck,
  zap: Zap,
}

const colorClassMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  teal: { bg: 'bg-teal-400/10', text: 'text-teal-400', border: 'border-teal-500/20', glow: 'rgba(20,184,166,' },
  amber: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'rgba(245,158,11,' },
  emerald: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,' },
  yellow: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-500/20', glow: 'rgba(234,179,8,' },
  red: { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'rgba(239,68,68,' },
  cyan: { bg: 'bg-cyan-400/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'rgba(6,182,212,' },
  violet: { bg: 'bg-violet-400/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'rgba(139,92,246,' },
  orange: { bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'rgba(249,115,22,' },
  lime: { bg: 'bg-lime-400/10', text: 'text-lime-400', border: 'border-lime-500/20', glow: 'rgba(132,204,22,' },
  sky: { bg: 'bg-sky-400/10', text: 'text-sky-400', border: 'border-sky-500/20', glow: 'rgba(56,189,248,' },
  pink: { bg: 'bg-pink-400/10', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'rgba(236,72,153,' },
  fuchsia: { bg: 'bg-fuchsia-400/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', glow: 'rgba(217,70,239,' },
  rose: { bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'rgba(244,63,94,' },
  green: { bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-500/20', glow: 'rgba(34,197,94,' },
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  bidirectional: {
    label: 'Bidirectional',
    icon: <ArrowRightLeft className="w-3 h-3" />,
    className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  inbound: {
    label: 'Inbound',
    icon: <ArrowDownToLine className="w-3 h-3" />,
    className: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  outbound: {
    label: 'Outbound',
    icon: <ArrowUpFromLine className="w-3 h-3" />,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
}

function timeAgo(date: string | null): string {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function eventStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const eventStatusColor: Record<string, string> = {
  completed: 'text-emerald-400',
  success: 'text-emerald-400',
  failed: 'text-red-400',
  error: 'text-red-400',
  pending: 'text-amber-400',
  processing: 'text-cyan-400',
}

function formatPKR(n: number): string {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(0)}K`
  return `Rs. ${n.toLocaleString('en-PK')}`
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
}

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // WebSocket state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string>('')

  // Database URL configuration dialog
  const [configErp, setConfigErp] = useState<Integration | null>(null)
  const [dbUrl, setDbUrl] = useState('')
  const [saving, setSaving] = useState(false)

  // Keep a ref to integrations so the WS callback can read the latest value
  const integrationsRef = useRef<Integration[]>(integrations)
  integrationsRef.current = integrations

  const fetchIntegrations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setError(null)
      }
      const res = await fetch('/api/integrations')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setIntegrations(data.connectors ?? [])
      setSummary(data.summary ?? null)
    } catch {
      setError('Failed to load integrations')
      setIntegrations([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const handleSaveDbUrl = async () => {
    if (!configErp) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/erp-database-urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: configErp.slug, databaseUrl: dbUrl }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save')
      }
      toast.success(`Database URL updated for ${configErp.name}`)
      setConfigErp(null)
      setDbUrl('')
      fetchIntegrations(true) // Refresh to test the new connection
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save database URL')
    } finally {
      setSaving(false)
    }
  }

  // WebSocket connection — connects once on mount
  useEffect(() => {
    const s = io('/?XTransformPort=3031', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    s.on('connect', () => {
      console.log('[WS] Connected to ERP Sync service')
      setWsConnected(true)
    })

    s.on('disconnect', () => {
      console.log('[WS] Disconnected from ERP Sync service')
      setWsConnected(false)
    })

    s.on('erp:status', (statuses: any[]) => {
      // Map WebSocket statuses to the existing Integration interface
      const mapped = statuses.map((status: any) => {
        // Find existing integration data to preserve extra fields
        const existing = integrationsRef.current.find(i => i.slug === status.slug)
        return {
          id: existing?.id || status.slug,
          slug: status.slug,
          name: status.name,
          erpName: status.name,
          type: 'bidirectional' as const,
          status: status.connected ? 'active' : 'inactive',
          icon: existing?.icon || status.slug,
          color: existing?.color || 'teal',
          website: status.website || `https://${status.slug}erp.vercel.app`,
          connected: status.connected,
          latency: status.latency,
          connectionError: status.error || null,
          clientCount: status.clientCount || existing?.clientCount || 0,
          lastSyncAt: status.lastChecked,
          syncCount: existing?.syncCount || 0,
          errorCount: existing?.errorCount || 0,
          tenantCount: existing?.tenantCount || 0,
          recentEvents: existing?.recentEvents || [],
        }
      })
      setIntegrations(mapped)
      setLoading(false)
    })

    s.on('erp:summary', (data: any) => {
      setSummary(prev => prev ? {
        ...prev,
        total: data.total,
        active: data.connected,
        error: data.total - data.connected,
      } : {
        total: data.total,
        active: data.connected,
        error: data.total - data.connected,
        totalClients: 0,
        totalRevenue: 0,
        totalLicenses: 0,
      })
      setLastSync(data.lastSync)
    })

    s.on('erp:sync-started', () => {
      setSyncing(true)
    })

    s.on('erp:sync-complete', () => {
      setSyncing(false)
    })

    s.on('erp:test-result', (result: any) => {
      setIntegrations(prev => prev.map(i =>
        i.slug === result.slug ? { ...i, connected: result.connected, latency: result.latency, connectionError: result.error || null, lastSyncAt: result.lastChecked } : i
      ))
      setRefreshing(false)
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, []) // Only connect once on mount

  // REST API fetch as fallback (for initial load)
  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  // Fetch live ERP status from website health checks
  useEffect(() => {
    const fetchLiveStatus = async () => {
      try {
        const res = await fetch('/api/integration/live-status')
        if (res.ok) {
          const data = await res.json()
          if (data.statuses && Array.isArray(data.statuses)) {
            setIntegrations(prev => prev.map(i => {
              const live = data.statuses.find((s: any) => s.slug === i.slug)
              if (live) {
                return { 
                  ...i, 
                  connected: live.connected, 
                  latency: live.latency, 
                  connectionError: live.error || null,
                }
              }
              return i
            }))
          }
        }
      } catch {
        // Silently fail - WebSocket data takes priority
      }
    }

    // Fetch immediately
    fetchLiveStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSyncAll = () => {
    if (socket && wsConnected) {
      setSyncing(true)
      socket.emit('erp:sync')
    } else {
      // Fallback to REST API
      fetchIntegrations()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56 rounded-xl bg-card" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-card" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-[var(--gg-teal)] hover:text-[var(--gg-amber)]"
          onClick={() => fetchIntegrations()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (integrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Plug className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No integrations configured yet.</p>
      </div>
    )
  }

  const activeCount = integrations.filter((i) => i.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Integration Connectors</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} of {integrations.length} connector{integrations.length !== 1 ? 's' : ''} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: wsConnected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${wsConnected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: wsConnected ? '#22c55e' : '#ef4444',
            }}
          >
            <span className="relative flex h-2 w-2">
              {wsConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            {wsConnected ? 'LIVE' : 'OFFLINE'}
          </div>

          {/* Sync All button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={syncing}
            className="gap-2"
          >
            {syncing ? (
              <><div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />Syncing...</>
            ) : (
              <><RefreshCw className="w-3.5 h-3.5" />Sync All</>
            )}
          </Button>

          {/* Manual Refresh button (fallback) */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => fetchIntegrations(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Plug className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
            <p className="text-xl font-bold text-foreground">{summary.active}<span className="text-sm text-muted-foreground">/{summary.total}</span></p>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span className="text-xs text-muted-foreground">Total Clients</span>
            </div>
            <p className="text-xl font-bold text-foreground">{summary.totalClients}</p>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatPKR(summary.totalRevenue)}</p>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs text-muted-foreground">Active Licenses</span>
            </div>
            <p className="text-xl font-bold text-foreground">{summary.totalLicenses}</p>
          </div>
        </div>
      )}

      {/* Connector Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration, i) => {
          const tc = typeConfig[integration.type] ?? typeConfig.bidirectional
          const hasErrors = integration.errorCount > 0
          const colors = colorClassMap[integration.color] || colorClassMap.cyan
          const IconComp = iconMap[integration.icon] || Package

          return (
            <motion.div
              key={integration.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`bg-card/90 backdrop-blur border rounded-2xl p-5 hover:border-border transition-all duration-300 ${
                integration.connected ? colors.border : 'border-red-500/20'
              }`}
              style={hasErrors ? { boxShadow: `0 0 24px ${colors.glow}0.08)` } : undefined}
            >
              {/* Top row: icon + name + status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                    <IconComp className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{integration.name}</h3>
                    <p className="text-xs text-muted-foreground">{integration.erpName} ERP</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {integration.connected ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                  )}
                  <Badge variant="secondary" className={tc.className}>
                    {tc.icon}
                    <span className="ml-1">{tc.label}</span>
                  </Badge>
                </div>
              </div>

              {/* Connection Status */}
              <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${
                integration.connected
                  ? 'bg-emerald-500/5 border border-emerald-500/15'
                  : 'bg-red-500/5 border border-red-500/15'
              }`}>
                {integration.connected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400">
                      Connected{integration.latency ? ` — ${integration.latency}ms` : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-xs text-red-400 truncate">
                      {integration.connectionError || 'Connection failed'}
                    </span>
                  </>
                )}
              </div>

              {/* Test Connection button */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 w-full text-xs border border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ erpSlug: integration.slug }),
                    })
                    const data = await res.json()
                    if (data.connected) {
                      toast.success(`${integration.name}: Connected (${data.latency}ms)`)
                      fetchIntegrations(true)
                    } else {
                      toast.error(`${integration.name}: ${data.error || 'Connection failed'}`)
                    }
                  } catch {
                    toast.error(`${integration.name}: Test failed`)
                  }
                }}
              >
                <Wifi className="w-3 h-3 mr-1" />
                Test Connection
              </Button>

              {/* Configure Database URL button */}
              {(
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-xs border border-border/50 hover:border-primary/30 hover:bg-primary/5"
                  onClick={async () => { 
                    setConfigErp(integration)
                    setDbUrl('')
                    try {
                      const res = await fetch('/api/admin/erp-database-urls')
                      if (res.ok) {
                        const data = await res.json()
                        const erp = data.erps?.find((e: any) => e.slug === integration.slug)
                        if (erp?.databaseUrl) {
                          setDbUrl(erp.databaseUrl)
                        }
                      }
                    } catch {}
                  }}
                >
                  <Database className="w-3 h-3 mr-1" />
                  {integration.connected ? 'Database Settings' : 'Configure Database URL'}
                </Button>
              )}

              {/* Error warning */}
              {hasErrors && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-400">{integration.errorCount} error{integration.errorCount !== 1 ? 's' : ''} recorded</span>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{integration.clientCount} clients</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{timeAgo(integration.lastSyncAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{integration.syncCount} syncs</span>
                </div>
              </div>

              {/* Website link */}
              {integration.website && (
                <div className="border-t border-border pt-3 mt-1">
                  <a
                    href={integration.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[var(--gg-teal)] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {integration.website.replace('https://', '')}
                  </a>
                </div>
              )}

              {/* Recent Events */}
              {integration.recentEvents && integration.recentEvents.length > 0 && (
                <div className="border-t border-border pt-3 mt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Recent Events</p>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {integration.recentEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate">{event.eventType.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={eventStatusColor[event.status] ?? 'text-muted-foreground'}>
                            {eventStatusLabel(event.status)}
                          </span>
                          <span className="text-muted-foreground">{timeAgo(event.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Last sync time display */}
      {lastSync && (
        <p className="text-xs text-muted-foreground text-center">
          Last sync: {new Date(lastSync).toLocaleTimeString()} • Auto-sync every 30s
        </p>
      )}

      {/* Summary bar for errors */}
      {integrations.some((i) => i.errorCount > 0) && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-400">
            {integrations.filter((i) => i.errorCount > 0).length} connector{integrations.filter((i) => i.errorCount > 0).length !== 1 ? 's' : ''} with errors — review recommended
          </span>
        </div>
      )}

      {/* Error summary for disconnected */}
      {integrations.some((i) => !i.connected) && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/15">
          <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs text-red-400">
            {integrations.filter((i) => !i.connected).length} connector{integrations.filter((i) => !i.connected).length !== 1 ? 's' : ''} disconnected — check database configuration
          </span>
        </div>
      )}

      {/* Database URL Configuration Dialog */}
      <Dialog open={!!configErp} onOpenChange={(open) => { if (!open) setConfigErp(null) }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Configure Database — {configErp?.name}</DialogTitle>
            <DialogDescription>
              Enter the Neon PostgreSQL connection string for {configErp?.name}. This URL will be used to connect to the ERP's database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Database URL</Label>
              <Input
                type="password"
                placeholder="postgresql://user:pass@host/database?sslmode=require"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="bg-secondary border-border rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Neon PostgreSQL connection string. Format: postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfigErp(null)} className="border border-border">
              Cancel
            </Button>
            <Button
              onClick={handleSaveDbUrl}
              disabled={saving || !dbUrl}
              className="bg-[var(--gg-vermillion)] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
              Save & Test Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
