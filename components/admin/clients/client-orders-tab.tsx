'use client'

import { ShoppingBag } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Badge } from '@/components/ui/badge'

const ORDER_STATUS: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  pending: 'warning', processing: 'info', completed: 'success', cancelled: 'neutral',
}

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ClientOrdersTab({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <EmptyState icon={<ShoppingBag className="w-6 h-6" />} title="No orders" description="This client has no orders yet" />
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Order ID</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount (PKR)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o: any) => (
            <TableRow key={o.id}>
              <TableCell>
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{o.orderNumber}</code>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{o.plan}</Badge>
                  {o.erpSystem && <span className="text-xs text-muted-foreground">×{o.quantity}</span>}
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">{formatPKR(o.totalAmount)}</TableCell>
              <TableCell>
                <StatusBadge variant={ORDER_STATUS[o.status] || 'neutral'} size="sm">{o.status}</StatusBadge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
