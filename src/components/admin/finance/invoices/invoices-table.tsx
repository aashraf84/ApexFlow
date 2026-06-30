'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Eye, Check, X, Download } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral', sent: 'info', paid: 'success', overdue: 'error', cancelled: 'neutral',
}

export function InvoicesTable({ invoices, onRefresh }: { invoices: any[]; onRefresh: () => void }) {
  const handleAction = async (id: string, action: string) => {
    if (action === 'paid') {
      await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) })
    } else if (action === 'cancelled') {
      await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) })
    }
    onRefresh()
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase">Invoice #</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Client</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right hidden sm:table-cell">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden md:table-cell">Due Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-xs font-medium">{inv.invoiceNumber}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium truncate max-w-[160px]">{inv.client?.companyName || 'Unknown'}</p>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm hidden sm:table-cell">
                  {formatPKR(inv.totalAmount || inv.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge variant={STATUS_VARIANT[inv.status] || 'neutral'} size="sm">{inv.status}</StatusBadge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Eye className="w-3.5 h-3.5" /> View</DropdownMenuItem>
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2" onClick={() => handleAction(inv.id, 'paid')}>
                          <Check className="w-3.5 h-3.5" /> Mark Paid
                        </DropdownMenuItem>
                      )}
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <DropdownMenuItem className="gap-2 text-[var(--gg-rose)]" onClick={() => handleAction(inv.id, 'cancelled')}>
                          <X className="w-3.5 h-3.5" /> Cancel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2"><Download className="w-3.5 h-3.5" /> Download PDF</DropdownMenuItem>
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
