'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DollarSign, Clock, CreditCard, RotateCcw, FileText, Plus, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatsCard } from '@/components/admin/shared/stats-card'
import { StatusBadge } from '@/components/admin/shared/status-badge'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

const PAYMENT_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success', pending: 'warning', failed: 'error', refunded: 'info',
}
const INVOICE_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral', sent: 'info', paid: 'success', overdue: 'error', cancelled: 'neutral',
}

export function FinanceOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/stats')
      const json = await res.json()
      setStats(json)
    } catch { setStats(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <PageHeader title="Finance Overview" description="Complete financial dashboard for ApexFlow"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/admin/finance/invoices?generate=1"><FileText className="w-4 h-4" />Generate Invoice</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/admin/finance/payments"><Plus className="w-4 h-4" />Record Payment</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/admin/finance/invoices"><BarChart3 className="w-4 h-4" />View Reports</Link>
            </Button>
          </div>
        } />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={<DollarSign className="w-5 h-5 text-[var(--gg-green)]" />} label="Total Revenue" value={formatPKR(stats?.totalRevenue || 0)} change={12.5} changeLabel="vs last month" iconBg="bg-[var(--gg-green)]/10" />
          <StatsCard icon={<Clock className="w-5 h-5 text-[var(--gg-amber)]" />} label="Pending Payments" value={stats?.pendingPayments || 0} change={-8} changeLabel="vs last month" iconBg="bg-[var(--gg-amber)]/10" />
          <StatsCard icon={<CreditCard className="w-5 h-5 text-[var(--gg-teal)]" />} label="Active Subscriptions" value={stats?.activeSubscriptions || 0} change={5} changeLabel="vs last month" iconBg="bg-[var(--gg-teal)]/10" />
          <StatsCard icon={<RotateCcw className="w-5 h-5 text-[var(--gg-rose)]" />} label="Refunds This Month" value={stats?.refundsThisMonth || 0} change={-15} changeLabel="vs last month" iconBg="bg-[var(--gg-rose)]/10" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/admin/finance/payments">View all</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
              <div className="space-y-3">
                {(stats?.recentPayments || []).slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.client?.companyName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge variant={PAYMENT_STATUS_VARIANT[p.status] || 'neutral'} size="sm">{p.status}</StatusBadge>
                      <span className="text-sm font-semibold">{formatPKR(p.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Upcoming Invoices</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/admin/finance/invoices">View all</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
              <div className="space-y-3">
                {(stats?.upcomingInvoices || []).slice(0, 5).map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.client?.companyName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{inv.invoiceNumber} · Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge variant={INVOICE_STATUS_VARIANT[inv.status] || 'neutral'} size="sm">{inv.status}</StatusBadge>
                      <span className="text-sm font-semibold">{formatPKR(inv.totalAmount || inv.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
