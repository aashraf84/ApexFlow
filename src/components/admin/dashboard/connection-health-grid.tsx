'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  Users,
  Clock,
  Wifi,
  WifiOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { getErpIcon, getErpColor, FALLBACK_ERP_DATA } from '@/lib/erp-data'

/* ── Types ─────────────────────────────────────────────── */

interface Connector {
  id: string
  erpSlug: string
  erpName: string
  status: string
  latencyMs: number | null
  autoSync: boolean
  lastSyncAt: string | null
  lastError: string | null
  clientCount: number
  tenantCount: number
  type: string
  direction: string
  _count?: { erpSystem: number }
}

interface SyncStatusResponse {
  success: boolean
  data: {
    connectors: Connector[]
    recentSyncLogs: unknown[]
    stats: unknown
  }
}

/* ── Helpers ───────────────────────────────────────────── */

const ERP_LOOKUP: Record<string, { icon: string; color: string; industry: string }> = {}
for (const erp of FALLBACK_ERP_DATA) {
  ERP_LOOKUP[erp.slug] = { icon: erp.icon, color: erp.color, industry: erp.industry }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'connected':
      return {
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
        label: 'Connected',
        Icon: CheckCircle2,
      }
    case 'syncing':
      return {
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        dot: 'bg-amber-500',
        label: 'Syncing',
        Icon: Loader2,
      }
    case 'error':
      return {
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        dot: 'bg-red-500',
        label: 'Error',
        Icon: XCircle,
      }
    default:
      return {
        color: 'text-zinc-400',
        bg: 'bg-zinc-500/10',
        border: 'border-zinc-500/20',
        dot: 'bg-zinc-400',
        label: 'Disconnected',
        Icon: WifiOff,
      }
  }
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

/* ── Card skeleton ─────────────────────────────────────── */

function ConnectorCardSkeleton() {
  return (
    <Card className="py-4">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Single connector card ─────────────────────────────── */

function ConnectorCard({ connector }: { connector: Connector }) {
  const [syncing, setSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(connector.autoSync)
  const lookup = ERP_LOOKUP[connector.erpSlug]
  const IconComponent = getErpIcon(lookup?.icon ?? 'zap')
  const colorData = getErpColor(lookup?.color ?? 'teal')
  const statusConfig = getStatusConfig(connector.status)
  const StatusIcon = statusConfig.Icon

  const handleToggleAutoSync = async (checked: boolean) => {
    setAutoSync(checked)
    try {
      await fetch('/api/admin/sync-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: checked ? 'enable-auto' : 'disable-auto',
          erpSlug: connector.erpSlug,
        }),
      })
    } catch {
      setAutoSync(!checked) // Revert on error
    }
  }

  const handleSyncNow = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      await fetch('/api/admin/sync-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', erpSlug: connector.erpSlug }),
      })
    } catch {
      // Silently handle
    } finally {
      setSyncing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className="py-4 gap-3 transition-shadow hover:shadow-md">
        <CardContent className="p-4 space-y-3">
          {/* Header: Icon + Name + Industry */}
          <div className="flex items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${colorData.hex}15` }}
            >
              <IconComponent className="size-5" style={{ color: colorData.hex }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {connector.erpName}
                </h3>
              </div>
              {lookup?.industry && (
                <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                  {lookup.industry}
                </Badge>
              )}
            </div>
          </div>

          {/* Status + Latency */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
            >
              <StatusIcon
                className={`size-3 ${connector.status === 'syncing' ? 'animate-spin' : ''}`}
              />
              {statusConfig.label}
            </div>
            {connector.latencyMs != null && connector.latencyMs > 0 && (
              <Badge variant="outline" className="text-[10px] tabular-nums gap-1">
                <Activity className="size-2.5" />
                {connector.latencyMs}ms
              </Badge>
            )}
          </div>

          {/* Error message */}
          {connector.lastError && (
            <div className="flex items-start gap-1.5 rounded-md bg-red-500/5 border border-red-500/10 px-2.5 py-1.5">
              <AlertTriangle className="size-3.5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-[11px] text-red-400 leading-tight">{connector.lastError}</span>
            </div>
          )}

          {/* Footer: Client count + Auto-sync + Sync Now + Last sync */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" />
                    {connector.clientCount} clients
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{connector.clientCount} client(s) connected</p>
                </TooltipContent>
              </Tooltip>
              {connector.lastSyncAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {relativeTime(connector.lastSyncAt)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={autoSync}
                      onCheckedChange={handleToggleAutoSync}
                      className="scale-75 origin-right"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled'}</p>
                </TooltipContent>
              </Tooltip>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncNow}
                disabled={syncing}
                className="h-7 text-xs gap-1 px-2"
              >
                {syncing ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
                Sync Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ── Empty state ───────────────────────────────────────── */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <WifiOff className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No Connectors Found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        No ERP connectors have been configured yet. Seed some connectors to get started with
        real-time sync monitoring.
      </p>
    </motion.div>
  )
}

/* ── Main grid component ───────────────────────────────── */

export function ConnectionHealthGrid() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConnectors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sync-status')
      const json: SyncStatusResponse = await res.json()
      if (json.success) {
        setConnectors(json.data.connectors)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectors()
  }, [fetchConnectors])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ConnectorCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (connectors.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {connectors.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </AnimatePresence>
    </div>
  )
}