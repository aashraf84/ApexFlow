'use client'

import { useQuery } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { StatsCard } from '@/components/admin/stats-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/admin/page-header'
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
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Building2, Users, ShoppingCart, DollarSign,
  Smartphone, Banknote, Package, Warehouse,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { selectedErpId, selectedSystem, isLoading: erpLoading } = useSelectedErp()

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard', selectedErpId],
    queryFn: () => fetch(`/api/erp/dashboard?erpId=${selectedErpId}`).then(r => r.json()),
    enabled: !!selectedErpId,
    refetchInterval: 30000,
  })

  const { data: charts } = useQuery({
    queryKey: ['dashboard-charts', selectedErpId],
    queryFn: () => fetch(`/api/erp/dashboard/charts?erpId=${selectedErpId}`).then(r => r.json()),
    enabled: !!selectedErpId,
    refetchInterval: 30000,
  })

  const isDist = selectedSystem?.industry === 'Distribution'

  // Format chart data
  const formatMonth = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) } catch { return d }
  }
  const monthlySalesData = (charts?.monthlySales || []).map((d: any) => ({ ...d, month: formatMonth(d.month) }))
  const collectionTrendsData = (charts?.collectionTrends || []).map((d: any) => ({ ...d, month: formatMonth(d.month) }))

  if (erpLoading || !selectedErpId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Loading..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const m = dashboard?.metrics ?? dashboard ?? {}

  const stats = [
    { title: 'Clients', value: m.ownerClients ?? m.ownerClientCount ?? m.dealers ?? 0, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Users', value: m.users ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Orders', value: m.orders ?? 0, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Revenue', value: `PKR ${Math.round(m.invoiceTotal ?? m.ownerInvoiceTotal ?? m.totalCollections ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
    ...(isDist ? [
      { title: 'Products', value: m.products ?? 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
      { title: 'Collections', value: `PKR ${Math.round(m.totalCollections ?? 0).toLocaleString()}`, icon: Banknote, color: 'text-rose-600', bg: 'bg-rose-50' },
    ] : []),
    ...(isDist ? [
      { title: 'Warehouses', value: m.warehouses ?? 0, icon: Warehouse, color: 'text-cyan-600', bg: 'bg-cyan-50' },
      { title: 'Invoices', value: m.invoiceCount ?? m.invoices ?? 0, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ] : [
      { title: 'Invoices', value: m.invoices ?? 0, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { title: 'Devices', value: 0, icon: Smartphone, color: 'text-teal-600', bg: 'bg-teal-50' },
    ]),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${selectedSystem?.name ?? 'ERP'} — ${selectedSystem?.industry ?? ''} overview`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            isLoading={dashLoading}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Sales</CardTitle>
            <CardDescription>Revenue by month</CardDescription>
          </CardHeader>
          <CardContent>
            {charts?.monthlySales ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[280px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection Trends</CardTitle>
            <CardDescription>Collections over time</CardDescription>
          </CardHeader>
          <CardContent>
            {charts?.collectionTrends ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={collectionTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Collections']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[280px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Dealers (Distribution only) */}
      {isDist && charts?.topDealers && charts.topDealers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Dealers</CardTitle>
            <CardDescription>By sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.topDealers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : dashboard?.recentOrders?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboard.recentOrders || []).slice(0, 5).map((order: any, i: number) => (
                    <TableRow key={order.id || i}>
                      <TableCell className="font-medium">{order.orderNo || order.id}</TableCell>
                      <TableCell>{order.dealerName || order.dealerId}</TableCell>
                      <TableCell className="text-right">PKR {Math.round(order.netAmount || order.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent orders</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Collections</CardTitle>
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : dashboard?.recentCollections?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboard.recentCollections || []).slice(0, 5).map((col: any, i: number) => (
                    <TableRow key={col.id || i}>
                      <TableCell>{col.collectionDate ? new Date(col.collectionDate).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{col.dealerName || col.dealerId}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        PKR {Math.round(col.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{col.paymentMethod || 'Cash'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent collections</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}