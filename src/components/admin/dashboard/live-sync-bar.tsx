'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/badge'
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
}

interface SyncStatusResponse {
  success: boolean
  data: {
    connectors: Connector[]
    recentSyncLogs: Array<{ startedAt: string; completedAt: string | null }>
    stats: {
      totalConnectors: number
      activeConnectors: number
      totalSyncs: number
      failedSyncs: number
      avgLatencyMs: number
    }
  }
}

/* ── Helpers ───────────────────────────────────────────── */

const ERP_LOOKUP: Record<string, { icon: string; color: string; industry: string }> = {}
for (const erp of FALLBACK_ERP_DATA) {
  ERP_LOOKUP[erp.slug] = { icon: erp.icon, color: erp.color, industry: erp.industry }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'connected': return 'bg-emerald-500'
    case 'syncing': return 'bg-amber-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-zinc-400'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'connected': return 'Connected'
    case 'syncing': return 'Syncing'
    case 'error': return 'Error'
    default: return 'Offline'
  }
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

/* ── Component ─────────────────────────────────────────── */

export function LiveSyncBar() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sync-status')
      const json: SyncStatusResponse = await res.json()
      if (json.success) {
        setConnectors(json.data.connectors)
        // Derive last sync from most recent log or connector
        const mostRecent = json.data.recentSyncLogs[0]?.completedAt
          ?? json.data.connectors
            .filter((c) => c.lastSyncAt)
            .sort((a, b) => new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime())[0]
            ?.lastSyncAt
          ?? null
        setLastSync(mostRecent)
      }
    } catch {
      // Silently handle — will retry on next interval
    } finally {
      setLoading(false)
    }
  }, [])

  const seedConnectors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/connectors/seed', { method: 'POST' })
      const json = await res.json()
      if (json.success && json.data?.created > 0) {
        // Re-fetch after seeding
        await fetchData()
      }
    } catch {
      // Non-critical
    }
  }, [fetchData])

  useEffect(() => {
    fetchData().then(() => {
      // Seed if no connectors exist
      if (connectors.length === 0) {
        seedConnectors()
      }
    })

    intervalRef.current = setInterval(fetchData, 10_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData, seedConnectors])

  const handleSyncAll = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const promises = connectors.map((c) =>
        fetch('/api/admin/sync-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'trigger', erpSlug: c.erpSlug }),
        }),
      )
      await Promise.allSettled(promises)
      setLastSync(new Date().toISOString())
      await fetchData()
    } catch {
      // Silently handle
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
      {/* Left: Live Sync indicator */}
      <div className="flex shrink-0 items-center gap-2">
        <motion.div
          className="relative flex size-2.5"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </motion.div>
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">Live Sync</span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border shrink-0" />

      {/* Middle: Scrollable ERP pills */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-none py-0.5"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-7 w-28 animate-pulse items-center gap-2 rounded-full bg-muted"
            />
          ))
        ) : connectors.length === 0 ? (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            No connectors configured
          </span>
        ) : (
          connectors.map((connector) => {
            const lookup = ERP_LOOKUP[connector.erpSlug]
            const IconComponent = getErpIcon(lookup?.icon ?? 'zap')
            const colorData = getErpColor(lookup?.color ?? 'teal')

            return (
              <Tooltip key={connector.id}>
                <TooltipTrigger asChild>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 transition-colors hover:bg-accent/50 cursor-default">
                    <IconComponent
                      className="size-3.5 shrink-0"
                      style={{ color: colorData.hex }}
                    />
                    <span className="text-xs font-medium text-foreground max-w-20 truncate">
                      {connector.erpName.replace('Flow', '')}
                    </span>
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${getStatusColor(connector.status)}`}
                    />
                    {connector.latencyMs != null && (
                      <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {connector.latencyMs}ms
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{connector.erpName}</p>
                  <p className="text-xs opacity-80">
                    {getStatusLabel(connector.status)}
                    {connector.latencyMs != null && ` · ${connector.latencyMs}ms`}
                  </p>
                  {connector.lastError && (
                    <p className="text-xs text-red-400 mt-0.5">{connector.lastError}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })
        )}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border shrink-0 hidden sm:block" />

      {/* Right: Last sync + Sync All */}
      <div className="flex shrink-0 items-center gap-3">
        {lastSync && (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden md:inline">
            Last: {relativeTime(lastSync)}
          </span>
        )}
        <button
          onClick={handleSyncAll}
          disabled={syncing || connectors.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          <motion.div
            animate={syncing ? { rotate: 360 } : {}}
            transition={syncing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <Zap className="size-3" />
          </motion.div>
          Sync All
        </button>
      </div>
    </div>
  )
}