'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Clock,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Save,
  Wifi,
  WifiOff,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { getErpIcon, getErpColor } from '@/lib/erp-data'
import { FALLBACK_ERP_DATA } from '@/lib/erp-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { EmptyState } from '@/components/admin/shared/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

/* ─── Constants ─── */

const SYNC_INTERVALS = [
  { value: 60, label: '1 min' },
  { value: 300, label: '5 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
  { value: 3600, label: '1 hr' },
  { value: 21600, label: '6 hr' },
  { value: 43200, label: '12 hr' },
  { value: 86400, label: '24 hr' },
] as const

function intervalLabel(seconds: number): string {
  const found = SYNC_INTERVALS.find((i) => i.value === seconds)
  return found ? found.label : `${seconds}s`
}

function formatTimeAgo(date: string | null): string {
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

function formatNextSync(lastSyncAt: string | null, intervalSec: number): string {
  if (!lastSyncAt || intervalSec <= 0) return '—'
  const next = new Date(lastSyncAt).getTime() + intervalSec * 1000
  const diff = next - Date.now()
  if (diff <= 0) return 'Overdue'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `~${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `~${hrs} hr`
  const days = Math.floor(hrs / 24)
  return `~${days}d`
}

function statusBadge(status: string) {
  if (status === 'connected') return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Connected</Badge>
  if (status === 'syncing') return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Syncing</Badge>
  if (status === 'error') return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Error</Badge>
  return <Badge variant="secondary" className="text-[10px]">Disconnected</Badge>
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
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
}

/* ─── SyncScheduler ─── */

export function SyncScheduler() {
  const [connectors, setConnectors] = useState<ConnectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkToggling, setBulkToggling] = useState(false)

  // Local edits before saving
  const [editedIntervals, setEditedIntervals] = useState<Record<string, number>>({})
  const [editedAutoSync, setEditedAutoSync] = useState<Record<string, boolean>>({})

  const fetchConnectors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/integrations')
      const json = await res.json()
      if (json.success) {
        setConnectors(json.data)
      } else {
        toast.error('Failed to fetch connectors')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectors()
  }, [fetchConnectors])

  const getInterval = (slug: string) => editedIntervals[slug] ?? 0
  const setLocalInterval = (slug: string, val: number) => {
    setEditedIntervals((prev) => ({ ...prev, [slug]: val }))
  }

  const getAutoSync = (slug: string): boolean => {
    if (slug in editedAutoSync) return editedAutoSync[slug]
    const conn = connectors.find((c) => c.erpSlug === slug)
    return conn?.autoSync ?? false
  }
  const setLocalAutoSync = (slug: string, val: boolean) => {
    setEditedAutoSync((prev) => ({ ...prev, [slug]: val }))
  }

  const hasChanges = useMemo(() => {
    if (Object.keys(editedIntervals).length === 0 && Object.keys(editedAutoSync).length === 0) return false
    for (const [slug, interval] of Object.entries(editedIntervals)) {
      const conn = connectors.find((c) => c.erpSlug === slug)
      if (conn && conn.syncInterval !== interval) return true
    }
    for (const [slug, val] of Object.entries(editedAutoSync)) {
      const conn = connectors.find((c) => c.erpSlug === slug)
      if (conn && conn.autoSync !== val) return true
    }
    return false
  }, [editedIntervals, editedAutoSync, connectors])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Apply interval changes via PATCH /api/admin/integrations
      const intervalPromises = Object.entries(editedIntervals)
        .filter(([slug, interval]) => {
          const conn = connectors.find((c) => c.erpSlug === slug)
          return conn && conn.syncInterval !== interval
        })
        .map(([slug, interval]) => {
          const conn = connectors.find((c) => c.erpSlug === slug)!
          return fetch('/api/admin/integrations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: conn.id, syncInterval: interval }),
          })
        })

      // Apply autoSync changes via /api/admin/sync-control
      const autoSyncPromises = Object.entries(editedAutoSync)
        .filter(([slug, val]) => {
          const conn = connectors.find((c) => c.erpSlug === slug)
          return conn && conn.autoSync !== val
        })
        .map(([slug, val]) =>
          fetch('/api/admin/sync-control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: val ? 'enable-auto' : 'disable-auto', erpSlug: slug }),
          }),
        )

      await Promise.all([...intervalPromises, ...autoSyncPromises])
      setEditedIntervals({})
      setEditedAutoSync({})
      toast.success('Schedule saved successfully')
      fetchConnectors()
    } catch {
      toast.error('Failed to save schedule')
    }
    setSaving(false)
  }

  const handleBulkToggle = async (enable: boolean) => {
    setBulkToggling(true)
    try {
      const promises = connectors.map((c) =>
        fetch('/api/admin/sync-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: enable ? 'enable-auto' : 'disable-auto', erpSlug: c.erpSlug }),
        }),
      )
      await Promise.all(promises)
      setEditedAutoSync({})
      toast.success(`Auto-sync ${enable ? 'enabled' : 'disabled'} for all connectors`)
      fetchConnectors()
    } catch {
      toast.error('Bulk toggle failed')
    }
    setBulkToggling(false)
  }

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header + bulk actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Sync Schedules
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure auto-sync intervals for each connector
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={bulkToggling}
            onClick={() => handleBulkToggle(true)}
          >
            {bulkToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />}
            Enable All Auto-Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={bulkToggling}
            onClick={() => handleBulkToggle(false)}
          >
            <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />
            Disable All
          </Button>
          {hasChanges && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Schedule
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {connectors.length === 0 && (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No connectors configured"
          description="Add connectors in the Overview tab to configure sync schedules."
        />
      )}

      {/* Scheduler table */}
      {connectors.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ERP</TableHead>
                    <TableHead className="text-xs">Sync Interval</TableHead>
                    <TableHead className="text-xs text-center">Auto-Sync</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Last Sync</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Next Sync</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectors.map((conn, idx) => {
                    const { icon: ErpIcon, color: colorData } = getErpMeta(conn.erpSlug)
                    const currentInterval = getInterval(conn.erpSlug) || conn.syncInterval
                    const currentAutoSync = getAutoSync(conn.erpSlug)
                    const isOverdue = conn.autoSync && conn.lastSyncAt && currentAutoSync
                      ? (Date.now() - new Date(conn.lastSyncAt).getTime()) > currentInterval * 1000
                      : false

                    return (
                      <motion.tr
                        key={conn.id}
                        variants={rowVariant}
                        initial="hidden"
                        animate="visible"
                        custom={idx}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${colorData.bg}`}>
                              <ErpIcon className={`w-4 h-4 ${colorData.text}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{conn.erpName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{conn.erpSlug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <Select
                            value={String(currentInterval)}
                            onValueChange={(val) => setLocalInterval(conn.erpSlug, Number(val))}
                          >
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SYNC_INTERVALS.map((si) => (
                                <SelectItem key={si.value} value={String(si.value)} className="text-xs">
                                  {si.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={currentAutoSync}
                              onCheckedChange={(val) => setLocalAutoSync(conn.erpSlug, val)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(conn.lastSyncAt)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                            <span className={`text-xs ${isOverdue ? 'text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                              {formatNextSync(conn.lastSyncAt, currentInterval)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          {statusBadge(conn.status)}
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual cron display */}
      {connectors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Upcoming Sync Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {connectors
                .filter((c) => getAutoSync(c.erpSlug))
                .sort((a, b) => {
                  const intervalA = getInterval(a.erpSlug) || a.syncInterval
                  const intervalB = getInterval(b.erpSlug) || b.syncInterval
                  const nextA = a.lastSyncAt ? new Date(a.lastSyncAt).getTime() + intervalA * 1000 - Date.now() : Infinity
                  const nextB = b.lastSyncAt ? new Date(b.lastSyncAt).getTime() + intervalB * 1000 - Date.now() : Infinity
                  return nextA - nextB
                })
                .map((conn) => {
                  const { icon: ErpIcon, color: colorData } = getErpMeta(conn.erpSlug)
                  const interval = getInterval(conn.erpSlug) || conn.syncInterval
                  const nextStr = formatNextSync(conn.lastSyncAt, interval)

                  return (
                    <motion.div
                      key={conn.erpSlug}
                      whileHover={{ scale: 1.03 }}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${colorData.bg} ${colorData.border}`}
                    >
                      <ErpIcon className={`w-3.5 h-3.5 ${colorData.text}`} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{conn.erpName}</p>
                        <p className="text-[10px] text-muted-foreground">Next: {nextStr}</p>
                      </div>
                    </motion.div>
                  )
                })}
              {connectors.filter((c) => !getAutoSync(c.erpSlug)).length === connectors.length && (
                <p className="text-xs text-muted-foreground py-2">No auto-sync schedules active. Enable auto-sync for connectors above.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}