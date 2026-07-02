'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { KpiRow } from './kpi-row'
import { RevenueChart } from './revenue-chart'
import { ErpBreakdown } from './erp-breakdown'
import { ActivityFeed } from './activity-feed'
import { AlertsPanel } from './alerts-panel'
import { QuickActions } from './quick-actions'
import { LiveSyncBar } from './live-sync-bar'
import { QuickStatsRow } from './quick-stats-row'
import { ConnectionHealthGrid } from './connection-health-grid'
import { SyncActivityTimeline } from './sync-activity-timeline'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Radio, Network, Clock } from 'lucide-react'

interface DashboardData {
  stats: {
    totalClients: number
    activeSubscriptions: number
    monthlyRevenue: number
    activeLicenses: number
    erpSystemsOnline: number
    erpSystemsTotal: number
    supportTicketsOpen: number
    clientTrend: number
    subscriptionTrend: number
    revenueTrend: number
    licenseTrend: number
    erpTrend: number
    ticketTrend: number
  }
  erpBreakdown: Array<{
    slug: string; name: string; clients: number; revenue: number
    licenses: number; connected: boolean; licenseUtilization: number
  }>
  revenueChart: Array<{ month: string; revenue: number }>
  recentActivity: Array<{
    id: string; action: string; entity?: string; entityId?: string
    details?: string; client: string | null; userName?: string
    time: string; type: 'success' | 'warning' | 'info'
  }>
  alerts: Array<{
    id: string; severity: 'warning' | 'error'; title: string
    description: string; actionLabel: string; actionPath: string
  }>
}

const DEFAULT_DATA: DashboardData = {
  stats: { totalClients: 0, activeSubscriptions: 0, monthlyRevenue: 0, activeLicenses: 0, erpSystemsOnline: 0, erpSystemsTotal: 21, supportTicketsOpen: 0, clientTrend: 0, subscriptionTrend: 0, revenueTrend: 0, licenseTrend: 0, erpTrend: 0, ticketTrend: 0 },
  erpBreakdown: [], revenueChart: [], recentActivity: [], alerts: [],
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('sync')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('[DashboardPage] Fetch error:', err)
      setError('Legacy dashboard data unavailable. Use Live Sync tab for real-time data.')
      setData(DEFAULT_DATA)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const d = data || DEFAULT_DATA

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        description="Real-time overview of your ApexFlow platform"
      />

      {error && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p>
            <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-10">
          <TabsTrigger value="command" className="gap-1.5 text-xs px-3">
            <LayoutDashboard className="w-3.5 h-3.5" /> Command Center
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-1.5 text-xs px-3">
            <Radio className="w-3.5 h-3.5" /> Live Sync
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-1.5 text-xs px-3">
            <Network className="w-3.5 h-3.5" /> Connections
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs px-3">
            <Clock className="w-3.5 h-3.5" /> Sync Activity
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Command Center (original dashboard) */}
        <TabsContent value="command" className="mt-6 space-y-6">
          <KpiRow stats={d.stats} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart data={d.revenueChart} trend={d.stats.revenueTrend} />
            </div>
            <AlertsPanel alerts={d.alerts} />
          </div>
          {d.erpBreakdown.length > 0 && <ErpBreakdown data={d.erpBreakdown} />}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed data={d.recentActivity} />
            </div>
            <QuickActions />
          </div>
        </TabsContent>

        {/* Tab 2: Live Sync */}
        <TabsContent value="sync" className="mt-6 space-y-6">
          <LiveSyncBar />
          <QuickStatsRow />
          <ConnectionHealthGrid />
        </TabsContent>

        {/* Tab 3: Connections */}
        <TabsContent value="connections" className="mt-6 space-y-6">
          <LiveSyncBar />
          <ConnectionHealthGrid />
        </TabsContent>

        {/* Tab 4: Sync Activity */}
        <TabsContent value="activity" className="mt-6 space-y-6">
          <QuickStatsRow />
          <SyncActivityTimeline />
        </TabsContent>
      </Tabs>
    </div>
  )
}