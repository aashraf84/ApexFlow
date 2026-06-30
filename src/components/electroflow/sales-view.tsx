'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'

interface SaleRow {
  id: string
  invoiceNumber: string
  customer: { name: string; phone: string } | null
  branch: { name: string } | null
  saleType: string
  totalAmount: number
  paidAmount: number
  paymentMethod: string | null
  status: string
  createdAt: string
  items: Array<{ id: string; productName: string; quantity: number; totalPrice: number }>
}

export function SalesView() {
  return (
    <DataTable<SaleRow>
      title="Sales"
      fetchUrl="/api/electroflow/sales"
      searchPlaceholder="Search invoices, customers..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
            { value: 'partial', label: 'Partial' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
        {
          key: 'saleType',
          label: 'Type',
          options: [
            { value: 'retail', label: 'Retail' },
            { value: 'wholesale', label: 'Wholesale' },
            { value: 'installment', label: 'Installment' },
          ],
        },
      ]}
      columns={[
        {
          key: 'invoiceNumber',
          label: 'Invoice',
          render: (item) => (
            <span className="font-mono text-xs font-medium">{item.invoiceNumber}</span>
          ),
        },
        {
          key: 'customer',
          label: 'Customer',
          render: (item) => item.customer?.name || <span className="text-muted-foreground">Walk-in</span>,
        },
        {
          key: 'saleType',
          label: 'Type',
          render: (item) => (
            <span className="text-xs capitalize px-2 py-0.5 rounded bg-accent">{item.saleType}</span>
          ),
        },
        {
          key: 'totalAmount',
          label: 'Total',
          className: 'text-right',
          render: (item) => <span className="font-medium">{formatCurrency(item.totalAmount)}</span>,
        },
        {
          key: 'paidAmount',
          label: 'Paid',
          className: 'text-right',
          render: (item) => (
            <span className={item.paidAmount < item.totalAmount ? 'text-amber-600' : 'text-emerald-600'}>
              {formatCurrency(item.paidAmount)}
            </span>
          ),
        },
        {
          key: 'items',
          label: 'Items',
          className: 'text-center',
          render: (item) => <span className="text-xs">{item.items?.length || 0}</span>,
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (item) => <StatusBadge status={item.status} />,
        },
        {
          key: 'createdAt',
          label: 'Date',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>,
        },
      ]}
    />
  )
}
