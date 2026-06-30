'use client'

import { CreditCard, Landmark, Smartphone, ArrowRightLeft, Wallet } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/shared/status-badge'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success', pending: 'warning', failed: 'error', refunded: 'info',
}

function MethodIcon({ method }: { method: string }) {
  const cls = 'w-4 h-4'
  switch (method) {
    case 'stripe': return <CreditCard className={cls} />
    case 'bank_transfer': return <Landmark className={cls} />
    case 'jazzcash': case 'easypaisa': return <Smartphone className={cls} />
    case 'raast': return <ArrowRightLeft className={cls} />
    default: return <Wallet className={cls} />
  }
}

const METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe', bank_transfer: 'Bank Transfer', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa', raast: 'Raast', paypal: 'PayPal',
}

export function PaymentsTable({ payments, onSelect }: { payments: any[]; onSelect: (p: any) => void }) {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase">Transaction ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Client</TableHead>
              <TableHead className="text-xs font-semibold uppercase text-right">Amount (PKR)</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden sm:table-cell">Method</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelect(p)}
              >
                <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}…</TableCell>
                <TableCell>
                  <p className="text-sm font-medium truncate max-w-[160px]">{p.client?.companyName || 'Unknown'}</p>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">{formatPKR(p.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <MethodIcon method={p.method} />
                    <span className="text-xs text-muted-foreground">{METHOD_LABELS[p.method] || p.method}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={STATUS_VARIANT[p.status] || 'neutral'} size="sm">{p.status}</StatusBadge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
