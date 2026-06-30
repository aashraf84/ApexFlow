'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'
import { Badge } from '@/components/ui/badge'

interface ExpenseRow {
  id: string
  category: { id: string; name: string }
  amount: number
  description: string | null
  date: string
  paidBy: string | null
  receipt: string | null
  status: string
  createdAt: string
}

export function ExpensesView() {
  return (
    <DataTable<ExpenseRow>
      title="Expenses"
      fetchUrl="/api/electroflow/expenses"
      searchPlaceholder="Search expenses..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'paid', label: 'Paid' },
            { value: 'rejected', label: 'Rejected' },
          ],
        },
      ]}
      columns={[
        {
          key: 'category',
          label: 'Category',
          render: (item) => (
            <Badge variant="outline" className="text-[10px]">{item.category?.name || 'Uncategorized'}</Badge>
          ),
        },
        {
          key: 'amount',
          label: 'Amount',
          className: 'text-right',
          render: (item) => <span className="font-medium text-sm">{formatCurrency(item.amount)}</span>,
        },
        {
          key: 'description',
          label: 'Description',
          render: (item) => (
            <div className="max-w-[250px] truncate text-xs">{item.description || '-'}</div>
          ),
        },
        {
          key: 'date',
          label: 'Date',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>,
        },
        {
          key: 'paidBy',
          label: 'Paid By',
          render: (item) => <span className="text-xs">{item.paidBy || '-'}</span>,
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (item) => <StatusBadge status={item.status} />,
        },
      ]}
    />
  )
}
