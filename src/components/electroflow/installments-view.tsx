'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'

interface InstallmentRow {
  id: string
  customer: { id: string; name: string; phone: string }
  product: { id: string; name: string; salePrice: number }
  totalAmount: number
  downPayment: number
  financedAmount: number
  numberOfInstallments: number
  installmentAmount: number
  frequency: string
  nextDueDate: string
  status: string
  contractNumber: string | null
  payments: Array<{ id: string; installmentNumber: number; amount: number; paidAmount: number; status: string; dueDate: string }>
  _count: { penaltyCharges: number }
}

export function InstallmentsView() {
  return (
    <DataTable<InstallmentRow>
      title="Installment Plans"
      fetchUrl="/api/electroflow/installments"
      searchPlaceholder="Search plans..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'defaulted', label: 'Defaulted' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
      ]}
      columns={[
        {
          key: 'customer',
          label: 'Customer',
          render: (item) => (
            <div>
              <p className="text-sm font-medium">{item.customer?.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.customer?.phone}</p>
            </div>
          ),
        },
        {
          key: 'product',
          label: 'Product',
          render: (item) => (
            <div>
              <p className="text-sm">{item.product?.name}</p>
              <p className="text-[10px] text-muted-foreground">{formatCurrency(item.product?.salePrice || 0)}</p>
            </div>
          ),
        },
        {
          key: 'totalAmount',
          label: 'Total',
          className: 'text-right',
          render: (item) => <span className="font-medium text-sm">{formatCurrency(item.totalAmount)}</span>,
        },
        {
          key: 'downPayment',
          label: 'Down Pay',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.downPayment)}</span>,
        },
        {
          key: 'financedAmount',
          label: 'Financed',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.financedAmount)}</span>,
        },
        {
          key: 'installments',
          label: 'Plan',
          className: 'text-center',
          render: (item) => (
            <div>
              <p className="text-xs font-medium">{item.numberOfInstallments} × {formatCurrency(item.installmentAmount)}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{item.frequency}</p>
            </div>
          ),
        },
        {
          key: 'nextDueDate',
          label: 'Next Due',
          className: 'text-right',
          render: (item) => {
            const isOverdue = new Date(item.nextDueDate) < new Date()
            return (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                {formatDate(item.nextDueDate)}
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
          key: 'payments',
          label: 'Paid',
          className: 'text-center',
          render: (item) => {
            const paid = item.payments?.filter(p => p.status === 'paid').length || 0
            return <span className="text-xs">{paid}/{item.numberOfInstallments}</span>
          },
        },
      ]}
    />
  )
}
