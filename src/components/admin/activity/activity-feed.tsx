'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Activity as ActivityIcon,
  RefreshCw,
  ShieldCheck,
  RefreshCcw,
  Users,
  Handshake,
  Cpu,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type CategoryKey = 'All' | 'Auth' | 'Sync' | 'Clients' | 'Deals' | 'System'

interface UnifiedActivity {
  /** Composite key — `<type>-<id>` — used to dedupe during auto-refresh. */
  key: string
  id: string
  type: 'audit' | 'sync' | 'client' | 'deal'
  category: 'Auth' | 'Sync' | 'Clients' | 'Deals' | 'System'
  actor: string
  actorEmail?: string | null
  action: string
  entity: string | null
  entityType: string | null
  entityId: string | null
  /** Deep-link to the relevant admin module (null when no sensible target). */
  href: string | null
  createdAt: string
  metadata?: Record<string, unknown>
}

interface ActivityResponse {
  activities: UnifiedActivity[]
  total: number
  hasMore: boolean
  cursor: string | null
  errors?: string[]
}

// ──────────────────────────────────────────────────────────────
// Helpers — relative time + absolute time
// ──────────────────────────────────────────────────────────────
const rtf = typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl
  ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  : null

function relativeTime(dateStr: string): string {
  try {
    const then = new Date(dateStr).getTime()
    if (Number.isNaN(then)) return dateStr
    const diffSec = Math.round((then - Date.now()) / 1000) // negative — past
    const abs = Math.abs(diffSec)
    if (rtf) {
      if (abs < 60) return rtf.format(diffSec, 'second') // "2 seconds ago"
      if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute') // "5 minutes ago"
      if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour') // "3 hours ago"
      if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day') // "2 days ago"
      if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month')
      return rtf.format(Math.round(diffSec / 31536000), 'year')
    }
    // Fallback: simple "5m ago" / "3h ago" / "2d ago"
    if (abs < 60) return 'just now'
    if (abs < 3600) return `${Math.floor(abs / 60)}m ago`
    if (abs < 86400) return `${Math.floor(abs / 3600)}h ago`
    if (abs < 2592000) return `${Math.floor(abs / 86400)}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function fullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ──────────────────────────────────────────────────────────────
// Category icon/color
// ──────────────────────────────────────────────────────────────
function categoryMeta(
  category: string
): { icon: React.ComponentType<{ className?: string }>; color: string } {
  switch (category) {
    case 'Auth':
      return { icon: ShieldCheck, color: 'var(--gg-vermillion)' }
    case 'Sync':
      return { icon: RefreshCcw, color: 'var(--gg-amber)' }
    case 'Clients':
      return { icon: Users, color: 'var(--gg-teal)' }
    case 'Deals':
      return { icon: Handshake, color: '#10b981' }
    case 'System':
      return { icon: Cpu, color: '#9ca3af' }
    default:
      return { icon: ActivityIcon, color: '#9ca3af' }
  }
}

function statusPill(metadata?: Record<string, unknown>) {
  if (!metadata) return null
  const status = metadata.status as string | undefined
  if (!status) return null
  const lower = status.toLowerCase()
  if (lower === 'success' || lower === 'completed') {
    return {
      label: status,
      style: {
        background: 'color-mix(in srgb, #10b981 18%, transparent)',
        color: '#10b981',
        borderColor: 'color-mix(in srgb, #10b981 30%, transparent)',
      } as React.CSSProperties,
    }
  }
  if (lower === 'failed' || lower === 'error') {
    return {
      label: status,
      style: {
        background: 'color-mix(in srgb, #ef4444 18%, transparent)',
        color: '#ef4444',
        borderColor: 'color-mix(in srgb, #ef4444 30%, transparent)',
      } as React.CSSProperties,
    }
  }
  return {
    label: status,
    style: {
      background: 'color-mix(in srgb, #9ca3af 18%, transparent)',
      color: '#9ca3af',
      borderColor: 'color-mix(in srgb, #9ca3af 25%, transparent)',
    } as React.CSSProperties,
  }
}

const FILTERS: { key: CategoryKey; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Auth', label: 'Auth' },
  { key: 'Sync', label: 'Sync' },
  { key: 'Clients', label: 'Clients' },
  { key: 'Deals', label: 'Deals' },
  { key: 'System', label: 'System' },
]

// ──────────────────────────────────────────────────────────────
// Timeline row
// ──────────────────────────────────────────────────────────────
function TimelineRow({ activity }: { activity: UnifiedActivity }) {
  const { icon: Icon, color } = categoryMeta(activity.category)
  const pill = statusPill(activity.metadata)

  const EntityLink = activity.href ? Link : null
  const entityHref = activity.href || '#'
  const entityClickable = !!activity.href

  return (
    <div className="relative pl-9 pb-4 last:pb-0">
      {/* Vertical line — connects to the next dot. */}
      <div
        className="absolute left-[14px] top-3 bottom-0 w-px"
        style={{ background: 'var(--gg-separator)' }}
      />
      {/* Dot with subtle halo */}
      <span
        className="absolute left-2 top-1.5 h-3 w-3 rounded-full ring-2"
        style={{
          background: color,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 15%, transparent)`,
          // The ring color matches the page background so the dot "pops" off the line.
          // @ts-expect-error -- CSS var for ring color
          '--tw-ring-color': 'var(--background)',
        }}
      />
      {/* Icon chip */}
      <span
        className="absolute -left-0.5 top-0.5 rounded-md p-1 hidden sm:inline-flex"
        style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </span>

      <div
        className="rounded-lg p-3 border transition-colors hover:bg-white/[0.02]"
        style={{
          background: 'var(--secondary)',
          borderColor: 'var(--gg-separator)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{activity.actor}</span>{' '}
                  <span className="text-muted-foreground">—</span>{' '}
                  <span className="text-foreground/90">{activity.action}</span>
                </p>
                {activity.entity && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    on{' '}
                    {entityClickable ? (
                      <EntityLink
                        href={entityHref}
                        className="inline-flex items-center gap-0.5 underline-offset-2 hover:underline"
                        style={{ color: 'var(--gg-teal)' }}
                      >
                        {activity.entity}
                        <ExternalLink className="h-3 w-3 inline" />
                      </EntityLink>
                    ) : (
                      <span>{activity.entity}</span>
                    )}
                  </p>
                )}
              </div>
              <span
                className="text-xs text-gray-500 whitespace-nowrap shrink-0"
                title={fullDate(activity.createdAt)}
              >
                {relativeTime(activity.createdAt)}
              </span>
            </div>
            {pill && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs" style={pill.style}>
                  {pill.label}
                </Badge>
                {typeof activity.metadata?.recordsSynced === 'number' &&
                  (activity.metadata.recordsSynced as number) > 0 && (
                    <span className="text-xs text-gray-500">
                      {(activity.metadata.recordsSynced as number)} synced
                      {typeof activity.metadata.recordsFailed === 'number' &&
                      (activity.metadata.recordsFailed as number) > 0
                        ? ` · ${(activity.metadata.recordsFailed as number)} failed`
                        : ''}
                    </span>
                  )}
                {typeof activity.metadata?.durationMs === 'number' &&
                  (activity.metadata.durationMs as number) > 0 && (
                    <span className="text-xs text-gray-500">
                      · {(activity.metadata.durationMs as number)}ms
                    </span>
                  )}
                {typeof activity.metadata?.error === 'string' &&
                  activity.metadata.error && (
                    <span className="text-xs text-red-400 truncate max-w-[200px]" title={activity.metadata.error}>
                      · {activity.metadata.error}
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export function ActivityFeed() {
  const [activities, setActivities] = useState<UnifiedActivity[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [category, setCategory] = useState<CategoryKey>('All')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  // Use a ref to read the latest autoRefresh inside the interval closure.
  const autoRefreshRef = useRef(autoRefresh)
  useEffect(() => {
    autoRefreshRef.current = autoRefresh
  }, [autoRefresh])

  // ── Fetch initial / when category changes (replace list) ──
  const fetchActivities = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true)
        else setLoading(true)
        const params = new URLSearchParams()
        if (category !== 'All') params.set('category', category)
        params.set('limit', '60')
        const res = await fetch(`/api/admin/activity?${params.toString()}`)
        if (res.ok) {
          const json: ActivityResponse = await res.json()
          // Dedupe by `key` to be defensive against any partial-failure re-fetches.
          const seen = new Set<string>()
          const deduped: UnifiedActivity[] = []
          for (const a of json.activities || []) {
            if (!seen.has(a.key)) {
              seen.add(a.key)
              deduped.push(a)
            }
          }
          setActivities(deduped)
          setTotal(json.total ?? deduped.length)
          setHasMore(!!json.hasMore)
          setCursor(json.cursor || null)
          setErrors(json.errors || [])
        } else if (!silent) {
          toast.error('Failed to load activity feed')
        }
      } catch {
        if (!silent) toast.error('Failed to load activity feed')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [category]
  )

  useEffect(() => {
    fetchActivities(false)
  }, [fetchActivities])

  // ── Load more (append older entries) ──
  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return
    try {
      setLoadingMore(true)
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      params.set('limit', '60')
      params.set('before', cursor)
      const res = await fetch(`/api/admin/activity?${params.toString()}`)
      if (res.ok) {
        const json: ActivityResponse = await res.json()
        // Merge with existing list, dedupe by key.
        setActivities((prev) => {
          const seen = new Set(prev.map((a) => a.key))
          const merged = [...prev]
          for (const a of json.activities || []) {
            if (!seen.has(a.key)) {
              seen.add(a.key)
              merged.push(a)
            }
          }
          return merged
        })
        setHasMore(!!json.hasMore)
        setCursor(json.cursor || null)
        if (json.errors?.length) setErrors((prev) => [...prev, ...json.errors!])
      } else {
        toast.error('Failed to load more events')
      }
    } catch {
      toast.error('Failed to load more events')
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, cursor, loadingMore, category])

  // ── Auto-refresh every 30s (silent, dedup by key) ──
  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current)
    refreshTimer.current = setInterval(() => {
      if (autoRefreshRef.current) fetchActivities(true)
    }, 30000)
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current)
    }
  }, [fetchActivities])

  const handleManualRefresh = () => fetchActivities(true)

  // Category counts — pre-computed from the current loaded list.
  const counts = useMemo(() => {
    const base: Record<CategoryKey, number> = {
      All: 0,
      Auth: 0,
      Sync: 0,
      Clients: 0,
      Deals: 0,
      System: 0,
    }
    for (const a of activities) {
      base.All += 1
      if (a.category in base) base[a.category as CategoryKey] += 1
    }
    return base
  }, [activities])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activity Feed</h2>
          <p className="text-muted-foreground mt-1">
            Unified timeline across authentication, sync, CRM and system events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              aria-label="Toggle auto-refresh"
            />
            Auto-refresh
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="text-foreground"
            style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = category === f.key
          return (
            <button
              key={f.key}
              onClick={() => setCategory(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                      borderColor: 'transparent',
                    }
                  : {
                      background: 'var(--secondary)',
                      borderColor: 'var(--gg-separator)',
                    }
              }
            >
              {f.label}
              {f.key !== 'All' && counts[f.key] > 0 && (
                <span
                  className={`ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 ${
                    isActive ? 'bg-white/20' : 'bg-white/5'
                  }`}
                >
                  {counts[f.key]}
                </span>
              )}
            </button>
          )
        })}
        <span className="text-xs text-gray-500 ml-2">
          {loading ? 'Loading…' : `${total} event${total === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Partial-failure warning */}
      {errors.length > 0 && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg border text-xs"
          style={{
            background: 'color-mix(in srgb, var(--gg-amber) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--gg-amber) 30%, transparent)',
            color: 'var(--gg-amber)',
          }}
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Partial failure — some sources unavailable.</p>
            <p className="text-gray-500 mt-0.5">
              Showing data from the sources that responded. Failed: {errors.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <Card
        style={{
          background: 'var(--secondary)',
          borderColor: 'var(--gg-separator)',
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <ActivityIcon className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 pl-9 relative">
                  <div
                    className="absolute left-2 top-3 h-3 w-3 rounded-full bg-white/10"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ActivityIcon className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No activity yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Events from auth, sync, CRM and system will appear here
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[65vh]">
              <div className="pr-2">
                {activities.map((a) => (
                  <TimelineRow key={a.key} activity={a} />
                ))}
                <div className="pt-2 flex justify-center">
                  {loadingMore ? (
                    <Skeleton className="h-8 w-28 bg-white/5" />
                  ) : hasMore ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      className="text-foreground"
                      style={{
                        borderColor: 'var(--gg-separator)',
                        background: 'var(--secondary)',
                      }}
                    >
                      <ChevronDown className="h-4 w-4 mr-1.5" />
                      Load more
                    </Button>
                  ) : (
                    <p className="text-xs text-gray-500 py-2">— End of feed —</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
