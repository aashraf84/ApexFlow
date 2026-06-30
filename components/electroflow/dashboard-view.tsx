'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign, Users, Package, ShoppingCart, CreditCard,
  Truck, Wrench, TrendingUp, TrendingDown, Building2, UserCog,
  ArrowUpRight, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

interface DashboardData {
  totalRevenue: number
  customerCount: number
  productCount: number
  pendingOrders: number
  activeInstallments: number
  branchCount: number
  employeeCount: number
  overdueInstallments: number
  pendingDeliveries: number
  openTickets: number
  monthlyExpense: number
  recentSales: Array<{
    id: string
    invoiceNumber: string
    customerName: string
    totalAmount: number
    status: string
    saleType: string
    createdAt: string
    itemCount: number
  }>
  salesByMonth: Array<{ month: string; total: number }>
  topProducts: Array<{
    productId: string
    productName: string
    totalQty: number
    totalRevenue: number
  }>
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1']

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/electroflow/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!data) return <div className="p-6 text-center text-muted-foreground">Failed to load dashboard data</div>

  const kpiCards = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'emerald', trend: '+12.5%' },
    { label: 'Customers', value: formatNumber(data.customerCount), icon: Users, color: 'teal', trend: '+3.2%' },
    { label: 'Products', value: formatNumber(data.productCount), icon: Package, color: 'cyan', trend: '+1.8%' },
    { label: 'Pending Orders', value: formatNumber(data.pendingOrders), icon: ShoppingCart, color: 'amber', trend: '-5.1%' },
    { label: 'Active Installments', value: formatNumber(data.activeInstallments), icon: CreditCard, color: 'violet', trend: '+8.3%' },
    { label: 'Monthly Expense', value: formatCurrency(data.monthlyExpense), icon: TrendingDown, color: 'rose', trend: '+2.1%' },
    { label: 'Branches', value: formatNumber(data.branchCount), icon: Building2, color: 'blue', trend: '' },
    { label: 'Employees', value: formatNumber(data.employeeCount), icon: UserCog, color: 'indigo', trend: '+1.5%' },
  ]

  const alertCards = [
    { label: 'Overdue Installments', value: data.overdueInstallments, icon: CreditCard, color: 'text-red-500' },
    { label: 'Pending Deliveries', value: data.pendingDeliveries, icon: Truck, color: 'text-amber-500' },
    { label: 'Open Service Tickets', value: data.openTickets, icon: Wrench, color: 'text-blue-500' },
  ]

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    teal: 'bg-teal-500/10 text-teal-600',
    cyan: 'bg-cyan-500/10 text-cyan-600',
    amber: 'bg-amber-500/10 text-amber-600',
    violet: 'bg-violet-500/10 text-violet-600',
    rose: 'bg-rose-500/10 text-rose-600',
    blue: 'bg-blue-500/10 text-blue-600',
    indigo: 'bg-indigo-500/10 text-indigo-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back to ElectroFlow ERP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
                <div className={cn('p-2 rounded-lg', colorMap[kpi.color])}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              {kpi.trend && (
                <div className="flex items-center mt-2 text-xs">
                  {kpi.trend.startsWith('+') ? (
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  )}
                  <span className={kpi.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}>
                    {kpi.trend}
                  </span>
                  <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {alertCards.map((alert) => (
          <Card key={alert.label} className="border-l-4 border-l-amber-400">
            <CardContent className="p-4 flex items-center gap-3">
              <alert.icon className={cn('w-5 h-5', alert.color)} />
              <div>
                <p className="text-sm font-medium">{alert.label}</p>
                <p className="text-2xl font-bold">{alert.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.map((product, i) => (
                  <div key={product.productId} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">{product.totalQty} sold</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No product data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Sales</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Last 10</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Invoice</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Items</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{sale.invoiceNumber}</td>
                    <td className="py-2.5 px-3">{sale.customerName}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] capitalize">{sale.saleType}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(sale.totalAmount)}</td>
                    <td className="py-2.5 px-3 text-center">{sale.itemCount}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={sale.status === 'completed' ? 'default' : 'secondary'}
                        className={cn(
                          'text-[10px] capitalize',
                          sale.status === 'completed' && 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                        )}
                      >
                        {sale.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(' ')
}
