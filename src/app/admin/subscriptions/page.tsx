'use client'

import { useSelectedErp } from '@/hooks/use-selected-erp'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { Badge } from '@/components/ui/badge'

const columns: Column[] = [
  { key: 'planName', label: 'Plan', render: (val, row) => val || row.plan || '—' },
  { key: 'clientName', label: 'Client', render: (val, row) => val || row.clientId || '—' },
  { key: 'startDate', label: 'Start', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  { key: 'endDate', label: 'End', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-100 text-emerald-700', Expired: 'bg-red-100 text-red-700', Trial: 'bg-amber-100 text-amber-700', Cancelled: 'bg-slate-100 text-slate-700' }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

export default function SubscriptionsPage() {
  const { selectedErpId } = useSelectedErp()

  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans', selectedErpId],
    queryFn: () => fetch(`/api/erp/subscription-plans?erpId=${selectedErpId}`).then(r => r.json()),
    enabled: !!selectedErpId,
  })

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/subscriptions?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Client subscription management" icon={CreditCard} />

      {/* Subscription Plans */}
      {plans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan: any) => (
              <Card key={plan.id} className="relative overflow-hidden">
                {plan.isPopular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-emerald-600 text-white">Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    PKR {plan.price?.toLocaleString() || 0}
                    {plan.billingCycle && <span className="text-sm font-normal text-muted-foreground">/{plan.billingCycle}</span>}
                  </div>
                  {plan.maxDevices && <p className="text-sm text-muted-foreground mt-1">{plan.maxDevices} devices</p>}
                  {plan.features && (
                    <ul className="mt-3 space-y-1">
                      {plan.features.map((f: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <h2 className="text-lg font-semibold">Client Subscriptions</h2>
      <DataTable
        queryKey="subscriptions"
        queryFn={fetchData}
        columns={columns}
        erpId={selectedErpId}
        searchPlaceholder="Search subscriptions..."
        emptyTitle="No subscriptions found"
      />
    </div>
  )
}