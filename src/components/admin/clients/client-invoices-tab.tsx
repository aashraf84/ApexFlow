'use client'

import { FileText, Download, Eye } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'

const INV_STATUS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral', sent: 'info', paid: 'success', overdue: 'error', cancelled: 'warning',
}

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ClientInvoicesTab({ invoices }: { invoices: any[] }) {
  if (invoices.length === 0) {
    return <EmptyState icon={<FileText className="w-6 h-6" />} title="No invoices" description="No invoices generated for this client" />
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Invoice #</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv: any) => (
            <TableRow key={inv.id}>
              <TableCell>
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{inv.invoiceNumber}</code>
              </TableCell>
              <TableCell className="text-sm font-medium">{formatPKR(inv.amount)}</TableCell>
              <TableCell>
                <StatusBadge variant={INV_STATUS[inv.status] || 'neutral'} size="sm">{inv.status}</StatusBadge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
