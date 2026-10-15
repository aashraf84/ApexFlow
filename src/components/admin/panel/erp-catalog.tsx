'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Plus, RefreshCw, Loader2, Plug, ExternalLink, Zap, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { toast } from 'sonner'

interface Connector {
  id: string
  erpSlug: string
  erpName: string
  status: string
  type: string
  direction: string
  connectionUrl: string | null
  clientCount: number
  lastSyncAt: string | null
  lastError: string | null
  latencyMs: number | null
  autoSync: boolean
  erpSystem?: { id: string; name: string; industry: string; color: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  connected: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  disconnected: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  partial: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

function formatDate(d: string | null) {
  if (!d) return 'never'
  return new Date(d).toLocaleString()
}

interface ErpCatalogProps {
  onSelectErp?: (slug: string) => void
}

export function ErpCatalog({ onSelectErp }: ErpCatalogProps) {
  const router = useRouter()
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConnectors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/integrations')
      const json = await res.json()
      setConnectors(json.data || [])
    } catch {
      toast.error('Failed to load integrated ERPs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectors()
  }, [fetchConnectors])

  const handleIntegrate = () => {
    router.push('/admin/integrations')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="ERP Systems" description="Integrated ERP systems connected to your ApexFlow hub" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ERP Systems"
        description="Integrated ERP systems connected to your ApexFlow hub"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Integrated', value: connectors.length, color: 'var(--gg-vermillion)' },
          { label: 'Connected', value: connectors.filter((c) => c.status === 'connected').length, color: 'var(--gg-green)' },
          { label: 'Total Clients', value: connectors.reduce((s, c) => s + c.clientCount, 0), color: 'var(--gg-teal)' },
          { label: 'Auto-Sync', value: connectors.filter((c) => c.autoSync).length, color: 'var(--gg-amber)' },
        ].map((stat) => (
          <Card key={stat.label} style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {connectors.length === 0
            ? 'No ERP systems integrated yet. Link your ERPs from the Integration Hub.'
            : `${connectors.length} ERP${connectors.length !== 1 ? 's' : ''} integrated`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConnectors} className="text-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleIntegrate} className="text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
            <Plus className="h-4 w-4 mr-2" />
            Integrate ERP
          </Button>
        </div>
      </div>

      {/* Connectors grid */}
      {connectors.length === 0 ? (
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No ERPs integrated yet</p>
            <p className="text-gray-500 text-sm mt-1 text-center max-w-md">
              Go to the <strong>Integration Hub</strong> to link your first ERP. Paste its connection URL, test it, auto-discover the client table, and map fields — no code needed.
            </p>
            <Button onClick={handleIntegrate} className="mt-4 text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              <Plus className="h-4 w-4 mr-2" />
              Go to Integration Hub
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connectors.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:border-[var(--gg-vermillion)]/40 transition-colors"
              style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              onClick={() => router.push('/admin/integrations')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${c.erpSystem?.color || 'var(--gg-vermillion)'} 12%, transparent)` }}
                    >
                      {c.type === 'api' ? <Zap className="h-5 w-5" style={{ color: c.erpSystem?.color || 'var(--gg-vermillion)' }} /> : <Database className="h-5 w-5" style={{ color: c.erpSystem?.color || 'var(--gg-vermillion)' }} />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.erpName}</p>
                      <p className="text-xs text-muted-foreground">{c.erpSlug} · {c.erpSystem?.industry || '—'}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-lg font-bold text-foreground">{c.clientCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Clients</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-sm font-semibold text-foreground">{c.latencyMs ?? '—'}{c.latencyMs ? 'ms' : ''}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Latency</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-xs font-semibold text-foreground">{c.autoSync ? 'Auto' : 'Manual'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Sync</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last sync: {formatDate(c.lastSyncAt)}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] border-[var(--gg-separator)] text-muted-foreground">
                      {c.type === 'api' ? 'REST API' : 'Database'}
                    </Badge>
                  </div>
                </div>

                {c.lastError && (
                  <p className="text-xs text-red-400 mt-2 truncate" title={c.lastError}>⚠ {c.lastError}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
