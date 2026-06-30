'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'

interface PurchaseRow {
  id: string
  poNumber: string
  supplier: { id: string; name: string; phone: string | null }
  status: string
  totalAmount: number
  orderDate: string
  expectedDate: string | null
  receivedDate: string | null
  notes: string | null
  items: Array<{ id: string; product: { name: string; sku: string | null }; quantity: number; unitPrice: number; receivedQty: number }>
}

export function PurchasesView() {
  return (
    <DataTable<PurchaseRow>
      title="Purchase Orders"
      fetchUrl="/api/electroflow/purchases"
      searchPlaceholder="Search PO numbers..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'partial', label: 'Partial' },
            { value: 'received', label: 'Received' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
      ]}
      columns={[
        {
          key: 'poNumber',
          label: 'PO Number',
          render: (item) => <span className="font-mono text-xs font-medium">{item.poNumber}</span>,
        },
        {
          key: 'supplier',
          label: 'Supplier',
          render: (item) => (
            <div>
              <p className="text-sm">{item.supplier?.name}</p>
              {item.supplier?.phone && <p className="text-[10px] text-muted-foreground">{item.supplier.phone}</p>}
            </div>
          ),
        },
        {
          key: 'items',
          label: 'Items',
          className: 'text-center',
          render: (item) => <span className="text-xs">{item.items?.length || 0}</span>,
        },
        {
          key: 'totalAmount',
          label: 'Total',
          className: 'text-right',
          render: (item) => <span className="font-medium text-sm">{formatCurrency(item.totalAmount)}</span>,
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (item) => <StatusBadge status={item.status} />,
        },
        {
          key: 'orderDate',
          label: 'Order Date',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.orderDate)}</span>,
        },
        {
          key: 'expectedDate',
          label: 'Expected',
          className: 'text-right',
          render: (item) => item.expectedDate
            ? <span className="text-xs text-muted-foreground">{formatDate(item.expectedDate)}</span>
            : <span className="text-xs text-muted-foreground">-</span>,
        },
      ]}
    />
  )
}
