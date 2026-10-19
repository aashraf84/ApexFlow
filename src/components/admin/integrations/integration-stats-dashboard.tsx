'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plug,
  Wifi,
  WifiOff,
  Users,
  Key,
  Smartphone,
  RefreshCw,
  Activity as ActivityIcon,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'

interface Stats {
  totalConnectors: number
  connected: number
  disconnected: number
  error: number
  autoSyncEnabled: number
  totalClients: number
  totalLicenses: number
  totalDevices: number
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  recentConnectors: Array<{
    id: string
    erpName: string
    erpSlug: string
    status: string
    latencyMs: number | null
    lastSyncAt: string | null
    clientCount: number
    autoSync: boolean
  }>
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
}

export function IntegrationStatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/integrations/stats')
      const json = await res.json()
      setStats(json)
    } catch {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-card/50 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="bg-card/50">
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Unable to load integration stats.
        </CardContent>
      </Card>
    )
  }

  const successRate = stats.totalSyncs > 0
    ? Math.round((stats.successfulSyncs / stats.totalSyncs) * 100)
    : 0

  const statCards = [
    { label: 'Total Connectors', value: stats.totalConnectors, icon: Plug, color: 'var(--gg-vermillion)' },
    { label: 'Connected', value: stats.connected, icon: Wifi, color: '#10b981' },
    { label: 'Disconnected', value: stats.disconnected, icon: WifiOff, color: '#f59e0b' },
    { label: 'Errors', value: stats.error, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Synced Clients', value: stats.totalClients, icon: Users, color: '#3b82f6' },
    { label: 'Synced Licenses', value: stats.totalLicenses, icon: Key, color: '#8b5cf6' },
    { label: 'Synced Devices', value: stats.totalDevices, icon: Smartphone, color: '#06b6d4' },
    { label: 'Auto-Sync Active', value: stats.autoSyncEnabled, icon: Zap, color: 'var(--gg-amber)' },
  ]

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div key={card.label} custom={i} variants={fadeUp} initial="hidden" animate="show">
            <Card className="bg-card/50" style={{ borderColor: 'var(--gg-separator)' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <card.icon className="h-4 w-4" style={{ color: card.color }} />
                  <span className="text-2xl font-bold text-foreground">{card.value}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sync health banner */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="show">
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: successRate >= 80 ? 'color-mix(in srgb, #10b981 15%, transparent)' : 'color-mix(in srgb, #f59e0b 15%, transparent)' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: successRate >= 80 ? '#10b981' : '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Sync Health</p>
                  <p className="text-xs text-muted-foreground">{stats.successfulSyncs} successful / {stats.totalSyncs} total runs</p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.failedSyncs}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Failed Runs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent connectors */}
      <motion.div custom={9} variants={fadeUp} initial="hidden" animate="show">
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Recent Connectors</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                {stats.recentConnectors.length} shown
              </Badge>
            </div>
            {stats.recentConnectors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No connectors yet. Add an integration to get started.</p>
            ) : (
              <div className="space-y-2">
                {stats.recentConnectors.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-background/50 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--background)' }}>
                      <Plug className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.erpName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.clientCount} clients · {c.latencyMs ? `${c.latencyMs}ms` : 'no latency data'}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        background: c.status === 'connected' ? 'color-mix(in srgb, #10b981 15%, transparent)' : c.status === 'error' ? 'color-mix(in srgb, #ef4444 15%, transparent)' : 'color-mix(in srgb, #f59e0b 15%, transparent)',
                        color: c.status === 'connected' ? '#10b981' : c.status === 'error' ? '#ef4444' : '#f59e0b',
                        borderColor: c.status === 'connected' ? 'rgba(16,185,129,0.3)' : c.status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
                      }}
                    >
                      {c.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleDateString() : 'never'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
