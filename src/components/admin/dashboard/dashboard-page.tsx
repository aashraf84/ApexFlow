'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { KpiRow } from './kpi-row'
import { RevenueChart } from './revenue-chart'
import { ErpBreakdown } from './erp-breakdown'
import { ActivityFeed } from './activity-feed'
import { AlertsPanel } from './alerts-panel'
import { QuickActions } from './quick-actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--gg-rose)]/10 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-[var(--gg-rose)]" />
        </div>
        <p className="font-medium mb-2">Something went wrong</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>Try again</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        description="Real-time overview of your ApexFlow platform"
      />
      <KpiRow stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data.revenueChart} trend={data.stats.revenueTrend} />
        </div>
        <AlertsPanel alerts={data.alerts} />
      </div>

      <ErpBreakdown data={data.erpBreakdown} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed data={data.recentActivity} />
        </div>
        <QuickActions />
      </div>
    </div>
  )
}
