'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  DollarSign,
  Users,
  Handshake,
  CreditCard,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// ─── Chart Colors ──────────────────────────────────────────────────────────
const CHART_COLORS = [
  'var(--gg-vermillion)', // vermillion
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
]

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--gg-vermillion)',
  inactive: '#6b7280',
  prospect: '#3b82f6',
  trial: '#f59e0b',
  suspended: '#ef4444',
  churned: '#ef4444',
}

const STAGE_COLORS: Record<string, string> = {
  lead: '#3b82f6',
  qualified: '#8b5cf6',
  proposal: '#f59e0b',
  negotiation: '#f97316',
  closed_won: 'var(--gg-vermillion)',
  closed_lost: '#ef4444',
}

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  bank_transfer: '#3b82f6',
  credit_card: 'var(--gg-vermillion)',
  stripe: '#8b5cf6',
  cash: '#f59e0b',
  check: '#06b6d4',
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface RevenueData {
  type: 'revenue'
  totalPayments: number
  totalInvoiceRevenue: number
  paymentsByMonth: Record<string, number>
  invoiceByMonth: Record<string, number>
}

interface ClientReportData {
  type: 'clients'
  totalClients: number
  byStatus: { status: string; count: number }[]
  byIndustry: { industry: string; count: number }[]
}

interface DealReportData {
  type: 'deals'
  totalDeals: number
  totalValue: number
  byStage: { stage: string; count: number; totalValue: number }[]
}

interface PaymentReportData {
  type: 'payments'
  totalPayments: number
  totalAmount: number
  byMethod: { method: string; count: number; totalAmount: number }[]
  byStatus: { status: string; count: number; totalAmount: number }[]
}

type ReportData = RevenueData | ClientReportData | DealReportData | PaymentReportData

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonth(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatLabel(str: string): string {
  return str
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)' }}
    >
      {label && <p className="mb-1 text-muted-foreground">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} className="text-foreground" style={{ color: entry.color }}>
          {formatLabel(entry.name)}: {typeof entry.value === 'number' && entry.name !== 'count'
            ? formatCurrency(entry.value)
            : entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </div>
          <div className="rounded-lg bg-white/5 p-3" style={{ color }}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async (type: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/reports?type=${type}`)
      if (!res.ok) throw new Error('Failed to fetch report')
      const json = await res.json()
      setData(json)
    } catch {
      setError('Failed to load report data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(activeTab)
  }, [activeTab, fetchReport])

  // ─── Revenue View ─────────────────────────────────────────────────────
  const renderRevenue = () => {
    const d = data as RevenueData
    if (!d || d.type !== 'revenue' || !d.paymentsByMonth) return null

    // Build chart data from paymentsByMonth
    const months = Object.keys(d.paymentsByMonth || {}).sort()
    const invoiceMonths = Object.keys(d.invoiceByMonth || {}).sort()
    const allMonths = [...new Set([...months, ...invoiceMonths])].sort()

    const chartData = allMonths.map((m) => ({
      month: formatMonth(m),
      Payments: d.paymentsByMonth[m] || 0,
      Invoices: d.invoiceByMonth[m] || 0,
    }))

    const tableData = allMonths.map((m) => ({
      month: formatMonth(m),
      key: m,
      payments: d.paymentsByMonth[m] || 0,
      invoices: d.invoiceByMonth[m] || 0,
    }))

    // Calculate trend
    const lastMonth = allMonths[allMonths.length - 1]
    const prevMonth = allMonths[allMonths.length - 2]
    const lastVal = lastMonth ? (d.paymentsByMonth[lastMonth] || 0) : 0
    const prevVal = prevMonth ? (d.paymentsByMonth[prevMonth] || 0) : 0
    const trendUp = prevVal > 0 ? ((lastVal - prevVal) / prevVal) * 100 : 0

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Payments"
            value={formatCurrency(d.totalPayments)}
            icon={DollarSign}
            color="var(--gg-vermillion)"
            sub="From completed payments"
          />
          <StatCard
            label="Invoice Revenue"
            value={formatCurrency(d.totalInvoiceRevenue)}
            icon={TrendingUp}
            color="#60a5fa"
            sub="From paid invoices"
          />
          <StatCard
            label="Monthly Trend"
            value={trendUp >= 0 ? `+${trendUp.toFixed(1)}%` : `${trendUp.toFixed(1)}%`}
            icon={trendUp >= 0 ? ArrowUpRight : ArrowDownRight}
            color={trendUp >= 0 ? 'var(--gg-vermillion)' : '#f87171'}
            sub="vs previous month"
          />
        </div>

        {/* Line Chart */}
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Revenue Trend</CardTitle>
            <CardDescription className="text-muted-foreground">
              Payments and invoice revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Payments"
                      stroke="var(--gg-vermillion)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--gg-vermillion)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Invoices"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No revenue data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Breakdown Table */}
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Month</TableHead>
                    <TableHead className="text-muted-foreground text-right">Payments</TableHead>
                    <TableHead className="text-muted-foreground text-right">Invoice Revenue</TableHead>
                    <TableHead className="text-muted-foreground text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.length > 0 ? (
                    tableData.map((row) => (
                      <TableRow key={row.key} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--gg-separator)' }}>
                        <TableCell className="text-foreground font-medium">{row.month}</TableCell>
                        <TableCell className="text-gray-300 text-right">{formatCurrency(row.payments)}</TableCell>
                        <TableCell className="text-gray-300 text-right">{formatCurrency(row.invoices)}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: 'var(--gg-vermillion)' }}>
                          {formatCurrency(row.payments + row.invoices)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Clients View ─────────────────────────────────────────────────────
  const renderClients = () => {
    const d = data as ClientReportData
    if (!d || !d.byStatus || d.type !== 'clients') return null

    const statusChartData = (d.byStatus || []).map((s) => ({
      name: formatLabel(s.status),
      value: s.count,
      color: STATUS_COLORS[s.status] || '#6b7280',
    }))

    const industryChartData = (d.byIndustry || []).map((i, idx) => ({
      name: formatLabel(i.industry),
      Clients: i.count,
      fill: CHART_COLORS[idx % CHART_COLORS.length],
    }))

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Clients"
            value={d.totalClients}
            icon={Users}
            color="var(--gg-vermillion)"
          />
          {(d.byStatus || []).map((s) => (
            <StatCard
              key={s.status}
              label={`${formatLabel(s.status)} Clients`}
              value={s.count}
              icon={Users}
              color={STATUS_COLORS[s.status] || '#6b7280'}
            />
          )).slice(0, 3)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - By Status */}
          <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
            <CardHeader>
              <CardTitle className="text-foreground">Clients by Status</CardTitle>
              <CardDescription className="text-muted-foreground">
                Distribution of clients across statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {statusChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No client data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - By Industry */}
          <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
            <CardHeader>
              <CardTitle className="text-foreground">Clients by Industry</CardTitle>
              <CardDescription className="text-muted-foreground">
                Number of clients per industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {industryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#6b7280"
                        fontSize={11}
                        width={90}
                      />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="Clients" radius={[0, 4, 4, 0]}>
                        {industryChartData.map((entry, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No industry data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown Table */}
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Status & Industry Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">By Status</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Count</TableHead>
                      <TableHead className="text-muted-foreground text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(d.byStatus || []).map((s) => (
                      <TableRow key={s.status} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--gg-separator)' }}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: STATUS_COLORS[s.status] || '#6b7280',
                              color: STATUS_COLORS[s.status] || '#6b7280',
                            }}
                          >
                            {formatLabel(s.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground text-right">{s.count}</TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {d.totalClients > 0 ? ((s.count / d.totalClients) * 100).toFixed(1) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">By Industry</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                      <TableHead className="text-muted-foreground">Industry</TableHead>
                      <TableHead className="text-muted-foreground text-right">Count</TableHead>
                      <TableHead className="text-muted-foreground text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.byIndustry.map((i) => (
                      <TableRow key={i.industry} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--gg-separator)' }}>
                        <TableCell className="text-foreground">{formatLabel(i.industry)}</TableCell>
                        <TableCell className="text-gray-300 text-right">{i.count}</TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {d.totalClients > 0 ? ((i.count / d.totalClients) * 100).toFixed(1) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Deals View ───────────────────────────────────────────────────────
  const renderDeals = () => {
    const d = data as DealReportData
    if (!d || !d.byStage || d.type !== 'deals') return null

    const stageChartData = (d.byStage || []).map((s) => ({
      name: formatLabel(s.stage),
      Count: s.count,
      Value: s.totalValue,
      fill: STAGE_COLORS[s.stage] || '#6b7280',
    }))

    const wonDeals = (d.byStage || []).find((s) => s.stage === 'closed_won')
    const lostDeals = (d.byStage || []).find((s) => s.stage === 'closed_lost')
    const closedTotal = (wonDeals?.count || 0) + (lostDeals?.count || 0)
    const winRate = closedTotal > 0 ? ((wonDeals?.count || 0) / closedTotal) * 100 : 0
    const avgDealValue = d.totalDeals > 0 ? d.totalValue / d.totalDeals : 0

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Deals"
            value={d.totalDeals}
            icon={Handshake}
            color="#60a5fa"
          />
          <StatCard
            label="Total Pipeline Value"
            value={formatCurrency(d.totalValue)}
            icon={DollarSign}
            color="var(--gg-vermillion)"
          />
          <StatCard
            label="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="#fbbf24"
            sub={`${wonDeals?.count || 0} won / ${lostDeals?.count || 0} lost`}
          />
          <StatCard
            label="Avg Deal Value"
            value={formatCurrency(avgDealValue)}
            icon={DollarSign}
            color="#a78bfa"
          />
        </div>

        {/* Bar Chart - By Stage */}
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Deals by Pipeline Stage</CardTitle>
            <CardDescription className="text-muted-foreground">
              Number of deals and total value in each stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {stageChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                    <Bar yAxisId="left" dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="Value" fill="var(--gg-vermillion)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No deal data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stage Breakdown Table */}
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Stage</TableHead>
                    <TableHead className="text-muted-foreground text-right">Deal Count</TableHead>
                    <TableHead className="text-muted-foreground text-right">Total Value</TableHead>
                    <TableHead className="text-muted-foreground text-right">Avg Value</TableHead>
                    <TableHead className="text-muted-foreground text-right">% of Pipeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(d.byStage || []).length > 0 ? (
                    (d.byStage || []).map((s) => (
                      <TableRow key={s.stage} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--gg-separator)' }}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: STAGE_COLORS[s.stage] || '#6b7280',
                              color: STAGE_COLORS[s.stage] || '#6b7280',
                            }}
                          >
                            {formatLabel(s.stage)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground text-right">{s.count}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: 'var(--gg-vermillion)' }}>
                          {formatCurrency(s.totalValue)}
                        </TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {s.count > 0 ? formatCurrency(s.totalValue / s.count) : '$0'}
                        </TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {d.totalValue > 0 ? ((s.totalValue / d.totalValue) * 100).toFixed(1) : 0}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No deal data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Payments View ────────────────────────────────────────────────────
  const renderPayments = () => {
    const d = data as PaymentReportData
    if (!d || !d.byMethod || d.type !== 'payments') return null

    const methodChartData = (d.byMethod || []).map((m) => ({
      name: formatLabel(m.method),
      value: m.totalAmount,
      count: m.count,
      color: PAYMENT_METHOD_COLORS[m.method] || '#6b7280',
    }))

    const statusChartData = (d.byStatus || []).map((s, idx) => ({
      name: formatLabel(s.status),
      Count: s.count,
      Amount: s.totalAmount,
      fill: CHART_COLORS[idx % CHART_COLORS.length],
    }))

    const completedAmount = (d.byStatus || []).find((s) => s.status === 'completed')?.totalAmount || 0
    const pendingAmount = (d.byStatus || []).find((s) => s.status === 'pending')?.totalAmount || 0
    const failedAmount = (d.byStatus || []).find((s) => s.status === 'failed')?.totalAmount || 0

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Payments"
            value={d.totalPayments}
            icon={CreditCard}
            color="var(--gg-vermillion)"
          />
          <StatCard
            label="Total Amount"
            value={formatCurrency(d.totalAmount)}
            icon={DollarSign}
            color="#60a5fa"
          />
          <StatCard
            label="Completed"
            value={formatCurrency(completedAmount)}
            icon={CreditCard}
            color="var(--gg-vermillion)"
          />
          <StatCard
            label="Pending / Failed"
            value={formatCurrency(pendingAmount + failedAmount)}
            icon={CreditCard}
            color="#fbbf24"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - By Method */}
          <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
            <CardHeader>
              <CardTitle className="text-foreground">Revenue by Payment Method</CardTitle>
              <CardDescription className="text-muted-foreground">
                Distribution of payment amounts by method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {methodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={methodChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {methodChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No payment data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - By Status */}
          <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
            <CardHeader>
              <CardTitle className="text-foreground">Payments by Status</CardTitle>
              <CardDescription className="text-muted-foreground">
                Count and amount by payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<DarkTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                      <Bar yAxisId="left" dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="Amount" fill="var(--gg-vermillion)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No payment status data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Tables */}
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Method */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">By Method</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                      <TableHead className="text-muted-foreground">Method</TableHead>
                      <TableHead className="text-muted-foreground text-right">Count</TableHead>
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(d.byMethod || []).map((m) => (
                      <TableRow key={m.method} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--gg-separator)' }}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: PAYMENT_METHOD_COLORS[m.method] || '#6b7280',
                              color: PAYMENT_METHOD_COLORS[m.method] || '#6b7280',
                            }}
                          >
                            {formatLabel(m.method)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground text-right">{m.count}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: 'var(--gg-vermillion)' }}>
                          {formatCurrency(m.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* By Status */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">By Status</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Count</TableHead>
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(d.byStatus || []).map((s) => (
                      <TableRow key={s.status} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--gg-separator)' }}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {formatLabel(s.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground text-right">{s.count}</TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {formatCurrency(s.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Comprehensive business insights powered by real-time data.
        </p>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="border"
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <TabsTrigger
            value="revenue"
            style={activeTab === 'revenue' ? { background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)', color: 'var(--gg-vermillion)' } : undefined}
          >
            <DollarSign className="h-4 w-4 mr-1.5" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Users className="h-4 w-4 mr-1.5" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="deals" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <Handshake className="h-4 w-4 mr-1.5" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <CreditCard className="h-4 w-4 mr-1.5" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="ml-3 text-muted-foreground">Loading revenue report...</span>
            </div>
          ) : error ? (
            <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          ) : (
            renderRevenue()
          )}
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-3 text-muted-foreground">Loading clients report...</span>
            </div>
          ) : error ? (
            <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          ) : (
            renderClients()
          )}
        </TabsContent>

        <TabsContent value="deals" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <span className="ml-3 text-muted-foreground">Loading deals report...</span>
            </div>
          ) : error ? (
            <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          ) : (
            renderDeals()
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <span className="ml-3 text-muted-foreground">Loading payments report...</span>
            </div>
          ) : error ? (
            <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          ) : (
            renderPayments()
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
