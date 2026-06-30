'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'

interface ServiceTicketRow {
  id: string
  ticketNumber: string
  customer: { id: string; name: string; phone: string } | null
  product: { id: string; name: string; sku: string | null }
  serialNumber: string | null
  imeiNumber: string | null
  issue: string
  priority: string
  status: string
  estimatedCost: number
  actualCost: number
  warrantyCovered: boolean
  receivedAt: string
  estimatedReady: string | null
  completedAt: string | null
}

export function ServiceView() {
  return (
    <DataTable<ServiceTicketRow>
      title="Service Tickets"
      fetchUrl="/api/electroflow/service-tickets"
      searchPlaceholder="Search ticket numbers..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'received', label: 'Received' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'delivered', label: 'Delivered' },
          ],
        },
      ]}
      columns={[
        {
          key: 'ticketNumber',
          label: 'Ticket #',
          render: (item) => <span className="font-mono text-xs font-medium">{item.ticketNumber}</span>,
        },
        {
          key: 'customer',
          label: 'Customer',
          render: (item) => item.customer?.name || '-',
        },
        {
          key: 'product',
          label: 'Product',
          render: (item) => (
            <div>
              <p className="text-sm">{item.product?.name}</p>
              {item.serialNumber && <p className="text-[10px] text-muted-foreground font-mono">SN: {item.serialNumber}</p>}
            </div>
          ),
        },
        {
          key: 'issue',
          label: 'Issue',
          render: (item) => <div className="max-w-[200px] truncate text-xs">{item.issue}</div>,
        },
        {
          key: 'priority',
          label: 'Priority',
          className: 'text-center',
          render: (item) => {
            const colors: Record<string, string> = {
              low: 'bg-gray-500/10 text-gray-600',
              normal: 'bg-blue-500/10 text-blue-600',
              high: 'bg-amber-500/10 text-amber-600',
              urgent: 'bg-red-500/10 text-red-600',
            }
            return (
              <span className={`text-[10px] capitalize px-2 py-0.5 rounded ${colors[item.priority] || ''}`}>
                {item.priority}
              </span>
            )
          },
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (item) => <StatusBadge status={item.status} />,
        },
        {
          key: 'warrantyCovered',
          label: 'Warranty',
          className: 'text-center',
          render: (item) => item.warrantyCovered
            ? <span className="text-[10px] text-emerald-600">Covered</span>
            : <span className="text-[10px] text-muted-foreground">No</span>,
        },
        {
          key: 'estimatedCost',
          label: 'Est. Cost',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.estimatedCost)}</span>,
        },
        {
          key: 'receivedAt',
          label: 'Received',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.receivedAt)}</span>,
        },
      ]}
    />
  )
}
