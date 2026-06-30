'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Check, X, ArrowRightLeft } from 'lucide-react'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  requested: 'warning', approved: 'info', processed: 'success', rejected: 'error',
}

export function RefundTable({ refunds, onRefresh }: { refunds: any[]; onRefresh: () => void }) {
  const handleAction = async (id: string, status: string) => {
    await fetch('/api/refunds', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    onRefresh()
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase">Request ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Client</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden sm:table-cell">Reason</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden md:table-cell">Requested</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map((r) => (
              <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-xs">{r.id.slice(0, 8)}…</TableCell>
                <TableCell>
                  <p className="text-sm font-medium truncate max-w-[140px]">{r.payment?.client?.companyName || 'Unknown'}</p>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">{formatPKR(r.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.reason}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={STATUS_VARIANT[r.status] || 'neutral'} size="sm">{r.status}</StatusBadge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {r.status === 'requested' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--gg-teal)] hover:bg-[var(--gg-teal)]/10" onClick={() => handleAction(r.id, 'approved')} title="Approve"><Check className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--gg-rose)] hover:bg-[var(--gg-rose)]/10" onClick={() => handleAction(r.id, 'rejected')} title="Reject"><X className="w-3.5 h-3.5" /></Button>
                      </>
                    )}
                    {r.status === 'approved' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--gg-green)] hover:bg-[var(--gg-green)]/10" onClick={() => handleAction(r.id, 'processed')} title="Process"><ArrowRightLeft className="w-3.5 h-3.5" /></Button>
                    )}
                    {r.status !== 'requested' && r.status !== 'approved' && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
