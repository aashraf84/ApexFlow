'use client'

import { CreditCard } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Badge } from '@/components/ui/badge'

const SUB_STATUS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  active: 'success', trial: 'info', past_due: 'warning', cancelled: 'error', expired: 'neutral',
}

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ClientSubscriptionsTab({ subscriptions }: { subscriptions: any[] }) {
  if (subscriptions.length === 0) {
    return <EmptyState icon={<CreditCard className="w-6 h-6" />} title="No subscriptions" description="This client has no active subscriptions" />
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Monthly Fee</TableHead>
            <TableHead>Billing Cycle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((s: any) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{s.plan}</Badge>
                  {s.erpSystem && <span className="text-xs text-muted-foreground">{s.erpSystem.name}</span>}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge variant={SUB_STATUS[s.status] || 'neutral'} size="sm">
                  {s.status?.replace('_', ' ')}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(s.startDate)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(s.endDate)}</TableCell>
              <TableCell className="text-sm font-medium">{formatPKR(s.monthlyFee)}</TableCell>
              <TableCell className="text-sm text-muted-foreground capitalize">{s.billingCycle}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
