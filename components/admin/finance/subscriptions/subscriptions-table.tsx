'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Pencil, X, RefreshCw, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  active: 'success', trial: 'info', past_due: 'warning', cancelled: 'error', expired: 'neutral',
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise',
}

export function SubscriptionsTable({ subscriptions, onRefresh }: { subscriptions: any[]; onRefresh: () => void }) {
  const handleAction = async (id: string, action: string) => {
    if (action === 'cancel') {
      await fetch('/api/subscriptions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'cancelled' }) })
    } else if (action === 'renew') {
      const endDate = new Date(); endDate.setMonth(endDate.getMonth() + 1)
      await fetch('/api/subscriptions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'active', endDate: endDate.toISOString() }) })
    }
    onRefresh()
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase">Client</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden sm:table-cell">ERP</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Plan</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right hidden md:table-cell">Monthly Fee</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden lg:table-cell">Cycle</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden lg:table-cell">End Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <p className="text-sm font-medium truncate max-w-[140px]">{sub.client?.companyName || 'Unknown'}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{sub.erpSystem?.name || '-'}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{PLAN_LABELS[sub.plan] || sub.plan}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={STATUS_VARIANT[sub.status] || 'neutral'} size="sm">{sub.status.replace('_', ' ')}</StatusBadge>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm hidden md:table-cell">{formatPKR(sub.monthlyFee)}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground capitalize">{sub.billingCycle}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Pencil className="w-3.5 h-3.5" /> Edit</DropdownMenuItem>
                      {sub.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2 text-[var(--gg-rose)]" onClick={() => handleAction(sub.id, 'cancel')}>
                          <X className="w-3.5 h-3.5" /> Cancel
                        </DropdownMenuItem>
                      )}
                      {(sub.status === 'expired' || sub.status === 'cancelled') && (
                        <DropdownMenuItem className="gap-2" onClick={() => handleAction(sub.id, 'renew')}>
                          <RefreshCw className="w-3.5 h-3.5" /> Renew
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
