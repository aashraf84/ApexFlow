'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'

interface DeliveryRow {
  id: string
  orderNumber: string
  customer: { id: string; name: string; phone: string } | null
  deliveryAddress: string
  city: string | null
  phone: string | null
  courierName: string | null
  trackingNumber: string | null
  status: string
  deliveryFee: number
  codAmount: number
  scheduledDate: string | null
  shippedAt: string | null
  deliveredAt: string | null
  createdAt: string
}

export function DeliveriesView() {
  return (
    <DataTable<DeliveryRow>
      title="Deliveries"
      fetchUrl="/api/electroflow/deliveries"
      searchPlaceholder="Search order numbers..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'returned', label: 'Returned' },
          ],
        },
      ]}
      columns={[
        {
          key: 'orderNumber',
          label: 'Order #',
          render: (item) => <span className="font-mono text-xs font-medium">{item.orderNumber}</span>,
        },
        {
          key: 'customer',
          label: 'Customer',
          render: (item) => item.customer?.name || <span className="text-muted-foreground">-</span>,
        },
        {
          key: 'deliveryAddress',
          label: 'Address',
          render: (item) => (
            <div className="max-w-[200px] truncate text-xs">{item.deliveryAddress}</div>
          ),
        },
        {
          key: 'courierName',
          label: 'Courier',
          render: (item) => item.courierName || '-',
        },
        {
          key: 'trackingNumber',
          label: 'Tracking',
          render: (item) => item.trackingNumber
            ? <span className="font-mono text-[10px]">{item.trackingNumber}</span>
            : '-',
        },
        {
          key: 'deliveryFee',
          label: 'Fee',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.deliveryFee)}</span>,
        },
        {
          key: 'codAmount',
          label: 'COD',
          className: 'text-right',
          render: (item) => item.codAmount > 0
            ? <span className="text-xs font-medium">{formatCurrency(item.codAmount)}</span>
            : '-',
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (item) => <StatusBadge status={item.status} />,
        },
        {
          key: 'createdAt',
          label: 'Created',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>,
        },
      ]}
    />
  )
}
