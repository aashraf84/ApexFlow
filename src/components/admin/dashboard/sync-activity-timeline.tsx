'use client'

import { createElement, useState, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Clock,
  FileText,
  Zap,
  CalendarClock,
  Hand,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getErpIcon, getErpColor, FALLBACK_ERP_DATA } from '@/lib/erp-data'

/* ── Types ─────────────────────────────────────────────── */

interface SyncLogEntry {
  id: string
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

interface SyncHistoryResponse {
  success: boolean
  data: {
    logs: SyncLogEntry[]
    pagination: { total: number; limit: number; offset: number; hasMore: boolean }
  }
}

/* ── Helpers ───────────────────────────────────────────── */

const ERP_LOOKUP: Record<string, { icon: string; color: string; industry: string }> = {}
for (const erp of FALLBACK_ERP_DATA) {
  ERP_LOOKUP[erp.slug] = { icon: erp.icon, color: erp.color, industry: erp.industry }
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getDirectionConfig(direction: string) {
  switch (direction) {
    case 'inbound':
      return { label: 'Inbound', Icon: ArrowDownToLine, className: 'bg-sky-500/10 text-sky-500 border-sky-500/20' }
    case 'outbound':
      return { label: 'Outbound', Icon: ArrowUpFromLine, className: 'bg-violet-500/10 text-violet-500 border-violet-500/20' }
    default:
      return { label: 'Bidirectional', Icon: ArrowLeftRight, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  }
}

function getSyncTypeConfig(syncType: string) {
  switch (syncType) {
    case 'manual':
      return { label: 'Manual', Icon: Hand, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
    case 'scheduled':
      return { label: 'Scheduled', Icon: CalendarClock, className: 'bg-violet-500/10 text-violet-500 border-violet-500/20' }
    default:
      return { label: 'Auto', Icon: Zap, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  }
}

function getStatusDisplay(status: string) {
  switch (status) {
    case 'success':
      return { Icon: CheckCircle2, color: 'text-emerald-500', label: 'Success' }
    case 'failed':
      return { Icon: XCircle, color: 'text-red-500', label: 'Failed' }
    case 'partial':
      return { Icon: AlertTriangle, color: 'text-amber-500', label: 'Partial' }
    case 'running':
      return { Icon: Loader2, color: 'text-blue-500', label: 'Running', spin: true }
    default:
      return { Icon: Clock, color: 'text-zinc-400', label: 'Pending' }
  }
}

/* ── Timeline entry ────────────────────────────────────── */

function renderErpIcon(iconName: string, className: string, style: CSSProperties): ReactNode {
  const Icon = getErpIcon(iconName)
  return createElement(Icon, { className, style })
}

function TimelineEntry({ entry, index }: { entry: SyncLogEntry; index: number }) {
  const lookup = ERP_LOOKUP[entry.erpSlug]
  const colorData = getErpColor(lookup?.color ?? 'teal')
  const dirConfig = getDirectionConfig(entry.direction)
  const typeConfig = getSyncTypeConfig(entry.syncType)
  const statusDisplay = getStatusDisplay(entry.status)
  const isLeft = index % 2 === 0

  return (
    <div className="relative flex md:items-start gap-4 md:gap-0 pb-8 last:pb-0">
      {/* Desktop: left content (even items) / spacer (odd) */}
      <div className="hidden md:block md:w-[calc(50%-1.25rem)]">
        {isLeft && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="text-right pr-6 space-y-2"
          >
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-medium text-foreground">{entry.erpName}</span>
              <div
                className="flex size-7 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: `${colorData.hex}15` }}
              >
                {renderErpIcon(lookup?.icon ?? 'zap', 'size-3.5', { color: colorData.hex })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] gap-1 border ${dirConfig.className}`}>
                <dirConfig.Icon className="size-2.5" />
                {dirConfig.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] gap-1 border ${typeConfig.className}`}>
                <typeConfig.Icon className="size-2.5" />
                {typeConfig.label}
              </Badge>
            </div>
            {entry.status === 'running' ? null : (
              <div className="flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3" />
                  {entry.recordsSynced} synced
                  {entry.recordsFailed > 0 && (
                    <span className="text-red-400">({entry.recordsFailed} failed)</span>
                  )}
                </span>
                {entry.durationMs > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDuration(entry.durationMs)}
                  </span>
                )}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">{relativeTime(entry.startedAt)}</p>
            {entry.errorMessage && (
              <p className="text-[11px] text-red-400 text-right">{entry.errorMessage}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Center timeline line + dot */}
      <div className="hidden md:flex flex-col items-center shrink-0 relative">
        <div className="absolute top-7 bottom-0 w-px bg-border last:hidden" />
        <div
          className={`flex size-7 items-center justify-center rounded-full border-2 border-background z-10 ${statusDisplay.color}`}
          style={{
            backgroundColor:
              entry.status === 'success'
                ? 'rgba(16,185,129,0.1)'
                : entry.status === 'failed'
                  ? 'rgba(239,68,68,0.1)'
                  : entry.status === 'partial'
                    ? 'rgba(245,158,11,0.1)'
                    : entry.status === 'running'
                      ? 'rgba(59,130,246,0.1)'
                      : 'rgba(161,161,170,0.1)',
          }}
        >
          <statusDisplay.Icon className={`size-3.5 ${statusDisplay.spin ? 'animate-spin' : ''}`} />
        </div>
      </div>

      {/* Desktop: right content (odd items) / spacer (even) */}
      <div className="hidden md:block md:w-[calc(50%-1.25rem)]">
        {!isLeft && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="pl-6 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="flex size-7 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: `${colorData.hex}15` }}
              >
                {renderErpIcon(lookup?.icon ?? 'zap', 'size-3.5', { color: colorData.hex })}
              </div>
              <span className="text-sm font-medium text-foreground">{entry.erpName}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] gap-1 border ${dirConfig.className}`}>
                <dirConfig.Icon className="size-2.5" />
                {dirConfig.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] gap-1 border ${typeConfig.className}`}>
                <typeConfig.Icon className="size-2.5" />
                {typeConfig.label}
              </Badge>
            </div>
            {entry.status === 'running' ? null : (
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3" />
                  {entry.recordsSynced} synced
                  {entry.recordsFailed > 0 && (
                    <span className="text-red-400">({entry.recordsFailed} failed)</span>
                  )}
                </span>
                {entry.durationMs > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDuration(entry.durationMs)}
                  </span>
                )}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">{relativeTime(entry.startedAt)}</p>
            {entry.errorMessage && (
              <p className="text-[11px] text-red-400">{entry.errorMessage}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Mobile: single column layout */}
      <div className="flex md:hidden items-start gap-3 flex-1 min-w-0">
        <div className="flex flex-col items-center shrink-0 relative">
          <div className="absolute top-8 bottom-0 w-px bg-border last:hidden" />
          <div
            className={`flex size-7 items-center justify-center rounded-full border-2 border-background z-10 ${statusDisplay.color}`}
            style={{
              backgroundColor:
                entry.status === 'success'
                  ? 'rgba(16,185,129,0.1)'
                  : entry.status === 'failed'
                    ? 'rgba(239,68,68,0.1)'
                    : entry.status === 'partial'
                      ? 'rgba(245,158,11,0.1)'
                      : entry.status === 'running'
                        ? 'rgba(59,130,246,0.1)'
                        : 'rgba(161,161,170,0.1)',
            }}
          >
            <statusDisplay.Icon className={`size-3.5 ${statusDisplay.spin ? 'animate-spin' : ''}`} />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          className="flex-1 space-y-1.5 min-w-0 pb-4"
        >
          <div className="flex items-center gap-2">
            <div
              className="flex size-6 items-center justify-center rounded-md shrink-0"
              style={{ backgroundColor: `${colorData.hex}15` }}
            >
              {renderErpIcon(lookup?.icon ?? 'zap', 'size-3', { color: colorData.hex })}
            </div>
            <span className="text-sm font-medium text-foreground truncate">{entry.erpName}</span>
            <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">
              {relativeTime(entry.startedAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={`text-[10px] gap-1 border ${dirConfig.className}`}>
              <dirConfig.Icon className="size-2.5" />
              {dirConfig.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] gap-1 border ${typeConfig.className}`}>
              <typeConfig.Icon className="size-2.5" />
              {typeConfig.label}
            </Badge>
          </div>
          {entry.status === 'running' ? null : (
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <FileText className="size-3" />
                {entry.recordsSynced} synced
                {entry.recordsFailed > 0 && (
                  <span className="text-red-400">({entry.recordsFailed} failed)</span>
                )}
              </span>
              {entry.durationMs > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDuration(entry.durationMs)}
                </span>
              )}
            </div>
          )}
          {entry.errorMessage && (
            <p className="text-[11px] text-red-400">{entry.errorMessage}</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* ── Skeleton ──────────────────────────────────────────── */

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-md" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ───────────────────────────────────────── */

function EmptyTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Clock className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">No Sync Activity Yet</h3>
      <p className="text-xs text-muted-foreground max-w-xs">
        Sync events will appear here once connectors start syncing data.
      </p>
    </motion.div>
  )
}

/* ── Main component ────────────────────────────────────── */

export function SyncActivityTimeline() {
  const [entries, setEntries] = useState<SyncLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sync-history?limit=15')
      const json: SyncHistoryResponse = await res.json()
      if (json.success) {
        setEntries(json.data.logs)
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 15_000)
    return () => clearInterval(interval)
  }, [fetchHistory])

  return (
    <div className="relative">
      {/* Desktop: vertical center line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border" />

      {loading ? (
        <TimelineSkeleton />
      ) : entries.length === 0 ? (
        <EmptyTimeline />
      ) : (
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <TimelineEntry key={entry.id} entry={entry} index={index} />
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}