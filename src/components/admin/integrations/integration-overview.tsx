'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plug,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Database,
  Wifi,
  WifiOff,
  Zap,
  Users,
  Building2,
  Activity,
  RefreshCw,
  Radar,
  Settings,
  TestTube2,
} from 'lucide-react'
import { getErpIcon, getErpColor } from '@/lib/erp-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { FALLBACK_ERP_DATA } from '@/lib/erp-data'

/* ─── Types ─── */

interface ConnectorData {
  id: string
  erpSlug: string
  erpName: string
  type: string
  direction: string
  status: string
  config: string | null
  autoSync: boolean
  syncInterval: number
  lastSyncAt: string | null
  lastError: string | null
  latencyMs: number | null
  clientCount: number
  tenantCount: number
  erpSystem: { id: string; name: string; industry: string; status: string; color: string } | null
  _syncCount: number
  _lastSync: { id: string; status: string; startedAt: string; completedAt: string | null } | null
  _webhookCount: number
}

/* ─── Direction config ─── */

const directionConfig: Record<string, { label: string; icon: typeof ArrowRightLeft; className: string }> = {
  bidirectional: { label: 'Bidirectional', icon: ArrowRightLeft, className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  inbound: { label: 'Inbound', icon: ArrowDownToLine, className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  outbound: { label: 'Outbound', icon: ArrowUpFromLine, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

/* ─── Helpers ─── */

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

function getErpMeta(slug: string) {
  const fallback = FALLBACK_ERP_DATA.find((e) => e.slug === slug)
  return {
    icon: getErpIcon(fallback?.icon || 'zap'),
    color: getErpColor(fallback?.color || 'teal'),
  }
}

/* ─── Card animation variants ─── */

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

/* ─── ConnectorCard ─── */

function ConnectorCard({ connector, onAutoSyncToggle, onTestConnection }: {
  connector: ConnectorData
  onAutoSyncToggle: (slug: string, enabled: boolean) => void
  onTestConnection: (slug: string) => void
}) {
  const [configOpen, setConfigOpen] = useState(false)
  const [dbUrl, setDbUrl] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)
  const [testing, setTesting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const { icon: ErpIcon, color: colorData } = getErpMeta(connector.erpSlug)
  const dirConfig = directionConfig[connector.direction] || directionConfig.bidirectional
  const DirIcon = dirConfig.icon

  const isStatusConnected = connector.status === 'connected'
  const isStatusError = connector.status === 'error'
  const isStatusSyncing = connector.status === 'syncing'

  const handleToggleAutoSync = async () => {
    setToggling(true)
    await onAutoSyncToggle(connector.erpSlug, !connector.autoSync)
    setToggling(false)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    await onTestConnection(connector.erpSlug)
    setTesting(false)
  }

  const handleSaveConfig = async () => {
    if (!dbUrl.trim()) return
    setSavingConfig(true)
    try {
      const res = await fetch('/api/admin/erp-database-urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: connector.erpSlug, databaseUrl: dbUrl.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Database URL updated for ${connector.erpName}`)
        setConfigOpen(false)
      } else {
        toast.error(json.error || 'Failed to update database URL')
      }
    } catch {
      toast.error('Network error')
    }
    setSavingConfig(false)
  }

  return (
    <motion.div variants={cardVariant} custom={0} layout>
      <Card className="border-border/60 hover:border-border transition-all duration-300 overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${colorData.bg}`}>
              <ErpIcon className={`w-5 h-5 ${colorData.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm truncate">{connector.erpName}</h3>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {connector.erpSlug}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${connector.type === 'database' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : connector.type === 'api' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}`}>
                  <Database className="w-2.5 h-2.5 mr-0.5" />
                  {connector.type}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${dirConfig.className}`}>
                  <DirIcon className="w-2.5 h-2.5 mr-0.5" />
                  {dirConfig.label}
                </Badge>
              </div>
            </div>
            {/* Status indicator */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium shrink-0">
                    {isStatusConnected && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />}
                    {isStatusError && <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]" />}
                    {isStatusSyncing && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
                    {!isStatusConnected && !isStatusError && !isStatusSyncing && <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />}
                    <span className={isStatusConnected ? 'text-emerald-400' : isStatusError ? 'text-red-400' : isStatusSyncing ? 'text-amber-400' : 'text-muted-foreground'}>
                      {connector.status}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isStatusError && connector.lastError ? connector.lastError : `${connector.erpName} is ${connector.status}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>{connector.latencyMs != null ? `${connector.latencyMs}ms` : '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{connector.clientCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>{connector.tenantCount}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <RefreshCw className="w-3 h-3" />
              <span>{timeAgo(connector.lastSyncAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Label htmlFor={`auto-sync-${connector.id}`} className="text-xs text-muted-foreground cursor-pointer select-none">
                Auto-Sync
              </Label>
              <Switch
                id={`auto-sync-${connector.id}`}
                checked={connector.autoSync}
                disabled={toggling}
                onCheckedChange={handleToggleAutoSync}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={testing}
                      onClick={handleTestConnection}
                    >
                      {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube2 className="w-3 h-3" />}
                      <span className="ml-1 hidden sm:inline">Test</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Test Connection</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setConfigOpen((prev) => !prev)}
                    >
                      <Settings className="w-3 h-3" />
                      <span className="ml-1 hidden sm:inline">Configure</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configure Connector</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Inline config panel */}
          <AnimatePresence>
            {configOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-border/40 space-y-3">
                  <Label className="text-xs font-medium">Database URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="postgresql://user:pass@host:5432/db"
                      value={dbUrl}
                      onChange={(e) => setDbUrl(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs shrink-0"
                      disabled={savingConfig || !dbUrl.trim()}
                      onClick={handleSaveConfig}
                    >
                      {savingConfig ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                  {connector.config && (
                    <p className="text-[10px] text-muted-foreground font-mono break-all">
                      Current: {connector.config.substring(0, 80)}…
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── Skeleton Grid ─── */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ─── Summary Bar ─── */

function SummaryBar({ connectors }: { connectors: ConnectorData[] }) {
  const total = connectors.length
  const active = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing').length
  const errors = connectors.filter((c) => c.status === 'error').length
  const totalClients = connectors.reduce((sum, c) => sum + c.clientCount, 0)
  const autoSyncEnabled = connectors.filter((c) => c.autoSync).length

  const items = [
    { label: 'Total Connectors', value: total, icon: Plug, iconBg: 'bg-primary/10' },
    { label: 'Active', value: active, icon: Wifi, iconBg: 'bg-emerald-500/10' },
    { label: 'Errors', value: errors, icon: WifiOff, iconBg: errors > 0 ? 'bg-red-500/10' : 'bg-muted' },
    { label: 'Total Clients', value: totalClients, icon: Users, iconBg: 'bg-amber-500/10' },
    { label: 'Auto-Sync Enabled', value: autoSyncEnabled, icon: RefreshCw, iconBg: 'bg-cyan-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${item.iconBg}`}>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-foreground leading-none">{item.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.label}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Main Overview Component ─── */

export function IntegrationOverview() {
  const [connectors, setConnectors] = useState<ConnectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const fetchConnectors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/integrations')
      const json = await res.json()
      if (json.success) {
        setConnectors(json.data)
      } else {
        toast.error('Failed to fetch integrations')
      }
    } catch {
      toast.error('Network error fetching integrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectors()
  }, [fetchConnectors])

  const handleAutoSyncToggle = async (erpSlug: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/sync-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: enabled ? 'enable-auto' : 'disable-auto', erpSlug }),
      })
      const json = await res.json()
      if (json.success) {
        setConnectors((prev) =>
          prev.map((c) => (c.erpSlug === erpSlug ? { ...c, autoSync: enabled } : c)),
        )
        toast.success(`Auto-sync ${enabled ? 'enabled' : 'disabled'} for ${erpSlug}`)
      } else {
        toast.error(json.error || 'Failed to toggle auto-sync')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleTestConnection = async (erpSlug: string) => {
    try {
      const res = await fetch('/api/admin/sync-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', erpSlug }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || `Connection test for ${erpSlug} succeeded`)
        // Refresh to get updated status
        fetchConnectors()
      } else {
        toast.error(json.error || `Connection test for ${erpSlug} failed`)
      }
    } catch {
      toast.error('Network error during connection test')
    }
  }

  const handleAutoDiscover = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/connectors/seed', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || 'Connectors discovered successfully')
        fetchConnectors()
      } else {
        toast.error(json.error || 'Auto-discover failed')
      }
    } catch {
      toast.error('Network error during auto-discover')
    }
    setSeeding(false)
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {connectors.length} connector{connectors.length !== 1 ? 's' : ''} registered
        </h2>
        <Button
          size="sm"
          onClick={handleAutoDiscover}
          disabled={seeding}
          className="gap-1.5"
        >
          {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radar className="w-3.5 h-3.5" />}
          Auto-Discover
        </Button>
      </div>

      {/* Summary bar */}
      {!loading && connectors.length > 0 && <SummaryBar connectors={connectors} />}

      {/* Loading state */}
      {loading && <SkeletonGrid />}

      {/* Empty state */}
      {!loading && connectors.length === 0 && (
        <EmptyState
          icon={<Plug className="w-6 h-6" />}
          title="No integrations found"
          description="Run Auto-Discover to scan for available ERP connectors and add them to the hub."
          actionLabel="Auto-Discover Connectors"
          onAction={handleAutoDiscover}
        />
      )}

      {/* Connector cards grid */}
      {!loading && connectors.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          <AnimatePresence mode="popLayout">
            {connectors.map((connector) => (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                onAutoSyncToggle={handleAutoSyncToggle}
                onTestConnection={handleTestConnection}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}