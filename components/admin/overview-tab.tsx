'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, CreditCard, DollarSign, KeyRound, TrendingUp, TrendingDown, Activity, Inbox, Shirt, Hotel, GraduationCap, Database, ShoppingCart, Pill, HardHat, Building2, Factory, Utensils, Plane, Wrench, HeartPulse, TextCursorInput, Palette, Truck, Route, BookOpen, Fuel } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DashboardStats {
  totalClients: number
  activeSubscriptions: number
  monthlyRevenue: number
  activeLicenses: number
  clientTrend: number
  subscriptionTrend: number
  revenueTrend: number
  licenseTrend: number
}

interface ErpBreakdown {
  slug: string
  name: string
  clients: number
  revenue: number
  licenses: number
}

interface RevenueDataPoint {
  month: string
  revenue: number
}

interface ActivityItem {
  id: string
  action: string
  entity?: string
  entityId?: string
  details?: string
  client: string | null
  userName?: string
  time: string
  type: 'success' | 'warning' | 'info'
}

interface DashboardData {
  stats: DashboardStats
  erpBreakdown?: ErpBreakdown[]
  revenueChart: RevenueDataPoint[]
  recentActivity: ActivityItem[]
}

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  trend: number
  color: string
}) {
  return (
    <div
      className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 transition-shadow duration-300"
      style={{ boxShadow: `0 0 0px ${color}20` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${color}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0px ${color}20`
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${
            color === '#06b6d4' ? 'text-cyan-400' :
            color === '#8b5cf6' ? 'text-violet-400' :
            color === '#10b981' ? 'text-emerald-400' :
            'text-amber-400'
          }`}
        >
          {icon}
        </div>
        {trend !== 0 && !isNaN(trend) && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function formatPKR(n: number): string {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(0)}K`
  return `Rs. ${n.toLocaleString('en-PK')}`
}

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function RevenueBarChart({ data }: { data: RevenueDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No revenue data available yet.
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="h-64 flex items-end gap-2 px-2">
      {data.map((item, i) => {
        const heightPercent = (item.revenue / maxRevenue) * 100
        const isLast = i === data.length - 1

        return (
          <div
            key={item.month}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            {/* Tooltip on hover */}
            <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
              {formatPKR(item.revenue)}
            </div>

            {/* Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(heightPercent, 2)}%` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              className={`w-full rounded-t-lg transition-all duration-200 ${
                isLast
                  ? 'bg-gradient-to-t from-[var(--gg-vermillion)] to-[var(--gg-amber)]'
                  : 'bg-gradient-to-t from-[var(--gg-teal)]/30 to-[var(--gg-amber)]/30 group-hover:from-[var(--gg-teal)]/50 group-hover:to-[var(--gg-amber)]/50'
              }`}
              style={{ minHeight: '4px' }}
            />

            {/* Month label */}
            <span className="mt-2 text-xs text-muted-foreground">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}

export function OverviewTab() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('[OverviewTab] Fetch error:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-card" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl bg-card" />
        <Skeleton className="h-48 rounded-2xl bg-card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-foreground font-medium mb-2">Something went wrong</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm text-[var(--gg-teal)] hover:text-[var(--gg-amber)] transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  const stats = data.stats ?? { totalClients: 0, activeSubscriptions: 0, monthlyRevenue: 0, activeLicenses: 0, clientTrend: 0, subscriptionTrend: 0, revenueTrend: 0, licenseTrend: 0 }
  const erpBreakdown = data.erpBreakdown ?? []

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Clients"
            value={stats.totalClients.toString()}
            trend={stats.clientTrend}
            color="#06b6d4"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard
            icon={<CreditCard className="w-5 h-5" />}
            label="Active Subscriptions"
            value={stats.activeSubscriptions.toString()}
            trend={stats.subscriptionTrend}
            color="#8b5cf6"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Monthly Revenue (PKR)"
            value={formatPKR(stats.monthlyRevenue)}
            trend={stats.revenueTrend}
            color="#10b981"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            icon={<KeyRound className="w-5 h-5" />}
            label="Active Licenses"
            value={stats.activeLicenses.toString()}
            trend={stats.licenseTrend}
            color="#f59e0b"
          />
        </motion.div>
      </div>

      {/* ERP Breakdown */}
      {erpBreakdown && erpBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Connected ERPs</h3>
              <p className="text-xs text-muted-foreground">{erpBreakdown.length} system{erpBreakdown.length !== 1 ? 's' : ''} connected</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {erpBreakdown.map((erp) => {
              const erpIconMap: Record<string, React.ReactNode> = {
                apparelflow: <Shirt className="w-4 h-4 text-teal-400" />,
                hotelflow: <Hotel className="w-4 h-4 text-amber-400" />,
                eduflow: <GraduationCap className="w-4 h-4 text-emerald-400" />,
                martflow: <ShoppingCart className="w-4 h-4 text-yellow-400" />,
                pharmaflow: <Pill className="w-4 h-4 text-red-400" />,
                buildflow: <HardHat className="w-4 h-4 text-orange-400" />,
                tenantflow: <Building2 className="w-4 h-4 text-pink-400" />,
                factoryflow: <Factory className="w-4 h-4 text-lime-400" />,
                foodflow: <Utensils className="w-4 h-4 text-rose-400" />,
                travelflow: <Plane className="w-4 h-4 text-cyan-400" />,
                autoflow: <Wrench className="w-4 h-4 text-sky-400" />,
                healthflow: <HeartPulse className="w-4 h-4 text-fuchsia-400" />,
                textileflow: <TextCursorInput className="w-4 h-4 text-violet-400" />,
                creativeflow: <Palette className="w-4 h-4 text-pink-400" />,
                logisticflow: <Truck className="w-4 h-4 text-green-400" />,
                distriflow: <Route className="w-4 h-4 text-amber-400" />,
                bookflow: <BookOpen className="w-4 h-4 text-violet-400" />,
                fuelflow: <Fuel className="w-4 h-4 text-orange-400" />,
              }
              const erpColorMap: Record<string, string> = {
                apparelflow: 'border-teal-500/10 hover:border-teal-500/20',
                hotelflow: 'border-amber-500/10 hover:border-amber-500/20',
                eduflow: 'border-emerald-500/10 hover:border-emerald-500/20',
                martflow: 'border-yellow-500/10 hover:border-yellow-500/20',
                pharmaflow: 'border-red-500/10 hover:border-red-500/20',
                buildflow: 'border-orange-500/10 hover:border-orange-500/20',
                tenantflow: 'border-pink-500/10 hover:border-pink-500/20',
                factoryflow: 'border-lime-500/10 hover:border-lime-500/20',
                foodflow: 'border-rose-500/10 hover:border-rose-500/20',
                travelflow: 'border-cyan-500/10 hover:border-cyan-500/20',
                autoflow: 'border-sky-500/10 hover:border-sky-500/20',
                healthflow: 'border-fuchsia-500/10 hover:border-fuchsia-500/20',
                textileflow: 'border-violet-500/10 hover:border-violet-500/20',
                creativeflow: 'border-pink-500/10 hover:border-pink-500/20',
                logisticflow: 'border-green-500/10 hover:border-green-500/20',
                distriflow: 'border-amber-500/10 hover:border-amber-500/20',
                bookflow: 'border-violet-500/10 hover:border-violet-500/20',
                fuelflow: 'border-orange-500/10 hover:border-orange-500/20',
              }
              const erpBgMap: Record<string, string> = {
                apparelflow: 'bg-teal-400/10',
                hotelflow: 'bg-amber-400/10',
                eduflow: 'bg-emerald-400/10',
                martflow: 'bg-yellow-400/10',
                pharmaflow: 'bg-red-400/10',
                buildflow: 'bg-orange-400/10',
                tenantflow: 'bg-pink-400/10',
                factoryflow: 'bg-lime-400/10',
                foodflow: 'bg-rose-400/10',
                travelflow: 'bg-cyan-400/10',
                autoflow: 'bg-sky-400/10',
                healthflow: 'bg-fuchsia-400/10',
                textileflow: 'bg-violet-400/10',
                creativeflow: 'bg-pink-400/10',
                logisticflow: 'bg-green-400/10',
                distriflow: 'bg-amber-400/10',
                bookflow: 'bg-violet-400/10',
                fuelflow: 'bg-orange-400/10',
              }

              return (
                <div
                  key={erp.slug}
                  className={`p-4 rounded-xl bg-secondary border ${erpColorMap[erp.slug] || 'border-cyan-500/10 hover:border-cyan-500/20'} transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${erpBgMap[erp.slug] || 'bg-cyan-400/10'} flex items-center justify-center`}>
                      {erpIconMap[erp.slug] || <Shirt className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{erp.name}</p>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        Connected
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-lg font-bold text-foreground">{erp.clients}</p>
                      <p className="text-xs text-muted-foreground">Clients</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{formatPKR(erp.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{erp.licenses}</p>
                      <p className="text-xs text-muted-foreground">Licenses</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Revenue Chart */}
      {data.revenueChart.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue in PKR</p>
            </div>
            {stats.revenueTrend !== 0 && (
              <Badge
                variant="secondary"
                className={`${
                  stats.revenueTrend >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                {stats.revenueTrend >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stats.revenueTrend >= 0 ? '+' : ''}
                {stats.revenueTrend}%
              </Badge>
            )}
          </div>
          <RevenueBarChart data={data.revenueChart} />
        </div>
      )}

      {/* Empty State for no data at all */}
      {stats.totalClients === 0 && data.revenueChart.length === 0 && data.recentActivity.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-2">No data yet</p>
          <p className="text-sm text-muted-foreground">
            Connect an ERP system to see live data on your dashboard.
          </p>
        </motion.div>
      )}

      {/* Recent Activity */}
      {data.recentActivity.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Action</TableHead>
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Details</TableHead>
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentActivity.map((item) => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell className="text-sm font-medium">
                      {item.action}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.client || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.details || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimeAgo(item.time)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          item.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.type === 'warning'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
