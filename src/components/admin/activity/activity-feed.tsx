'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type CategoryKey = 'All' | 'Auth' | 'Sync' | 'Clients' | 'Deals' | 'System'

interface UnifiedActivity {
  id: string
  type: 'audit' | 'sync' | 'client' | 'deal'
  category: 'Auth' | 'Sync' | 'Clients' | 'Deals' | 'System'
  actor: string
  action: string
  entity: string | null
  entityType: string | null
  entityId: string | null
  createdAt: string
  metadata?: Record<string, unknown>
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr).getTime()
    const diff = Date.now() - d
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function fullDate(dateStr: string): string {
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

function categoryIcon(category: string): { icon: typeof ActivityIcon; color: string } {
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

function statusPill(metadata?: Record<string, unknown>): {
  label: string
  className: string
  style?: React.CSSProperties
} | null {
  if (!metadata) return null
  const status = metadata.status as string | undefined
  if (!status) return null
  const lower = status.toLowerCase()
  if (lower === 'success' || lower === 'completed') {
    return {
      label: status,
      className: '',
      style: {
        background: 'color-mix(in srgb, #10b981 18%, transparent)',
        color: '#10b981',
        borderColor: 'color-mix(in srgb, #10b981 25%, transparent)',
      },
    }
  }
  if (lower === 'failed' || lower === 'error') {
    return {
      label: status,
      className: 'bg-red-500/15 text-red-400 border-red-500/25',
    }
  }
  return {
    label: status,
    className: 'bg-gray-500/15 text-gray-300 border-gray-500/25',
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
  const { icon: Icon, color } = categoryIcon(activity.category)
  const pill = statusPill(activity.metadata)
  const entityLink = activity.entity
    ? `/admin/${
        activity.category === 'Clients'
          ? `clients`
          : activity.category === 'Deals'
            ? 'deals'
            : activity.category === 'Sync'
              ? 'sync-logs'
              : activity.category === 'Auth'
                ? 'audit'
                : 'dashboard'
      }`
    : null

  return (
    <div className="relative pl-8 pb-5 last:pb-0">
      {/* Vertical line */}
      <div
        className="absolute left-[11px] top-1 bottom-0 w-px"
        style={{ background: 'var(--gg-separator)' }}
      />
      {/* Dot */}
      <div
        className="absolute left-1 top-1 h-3 w-3 rounded-full ring-2"
        style={{
          background: color,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 15%, transparent)`,
        }}
      />
      <div
        className="rounded-lg p-3 border"
        style={{
          background: 'var(--secondary)',
          borderColor: 'var(--gg-separator)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="rounded-lg p-1.5 shrink-0"
            style={{
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
            }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{activity.actor}</span>{' '}
                  <span className="text-muted-foreground">—</span>{' '}
                  <span className="text-gray-200">{activity.action}</span>
                </p>
                {activity.entity && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    on{' '}
                    {entityLink ? (
                      <a
                        href={entityLink}
                        className="underline-offset-2 hover:underline"
                        style={{ color: 'var(--gg-teal)' }}
                      >
                        {activity.entity}
                      </a>
                    ) : (
                      activity.entity
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
                <Badge variant="outline" className={`text-xs ${pill.className}`} style={pill.style}>
                  {pill.label}
                </Badge>
                {typeof activity.metadata?.recordsSynced === 'number' &&
                  (activity.metadata.recordsSynced as number) > 0 && (
                    <span className="text-xs text-gray-500">
                      {activity.metadata.recordsSynced as number} synced
                      {typeof activity.metadata.recordsFailed === 'number' &&
                      (activity.metadata.recordsFailed as number) > 0
                        ? ` · ${activity.metadata.recordsFailed as number} failed`
                        : ''}
                    </span>
                  )}
                {typeof activity.metadata?.durationMs === 'number' &&
                  (activity.metadata.durationMs as number) > 0 && (
                    <span className="text-xs text-gray-500">
                      · {activity.metadata.durationMs as number}ms
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
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [category, setCategory] = useState<CategoryKey>('All')
  const [visibleCount, setVisibleCount] = useState(50)
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchActivities = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true)
        else setLoading(true)
        const params = new URLSearchParams()
        if (category !== 'All') params.set('category', category)
        params.set('limit', '200')
        const res = await fetch(`/api/admin/activity?${params.toString()}`)
        if (res.ok) {
          const json = await res.json()
          setActivities(json.activities || [])
          setTotal(json.total || (json.activities || []).length)
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

  // Initial + on category change
  useEffect(() => {
    setVisibleCount(50)
    fetchActivities(false)
  }, [fetchActivities])

  // Auto-refresh every 30s (silent)
  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current)
    refreshTimer.current = setInterval(() => {
      fetchActivities(true)
    }, 30000)
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current)
    }
  }, [fetchActivities])

  const handleManualRefresh = () => {
    fetchActivities(true)
  }

  const visibleActivities = activities.slice(0, visibleCount)
  const hasMore = visibleCount < activities.length

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
            </button>
          )
        })}
        <span className="text-xs text-gray-500 ml-2">
          {loading ? 'Loading…' : `${total} event${total === 1 ? '' : 's'}`}
        </span>
      </div>

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
                <div key={i} className="flex items-start gap-3 pl-8">
                  <Skeleton className="h-8 w-8 rounded-full bg-white/5 absolute left-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ActivityIcon className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No activity yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Events from auth, sync, CRM and system will appear here
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="pr-2">
                {visibleActivities.map((a) => (
                  <TimelineRow key={`${a.type}-${a.id}`} activity={a} />
                ))}
                {hasMore && (
                  <div className="pt-2 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleCount((c) => c + 50)}
                      className="text-foreground"
                      style={{
                        borderColor: 'var(--gg-separator)',
                        background: 'var(--secondary)',
                      }}
                    >
                      <ChevronDown className="h-4 w-4 mr-1.5" />
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
