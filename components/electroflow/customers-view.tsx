'use client'

import { DataTable, formatCurrency, formatDate } from './data-table'
import { Badge } from '@/components/ui/badge'

interface CustomerRow {
  id: string
  name: string
  email: string | null
  phone: string
  cnic: string | null
  city: string | null
  creditLimit: number
  riskScore: number
  isActive: boolean
  createdAt: string
  _count: { sales: number; installmentPlans: number }
}

export function CustomersView() {
  return (
    <DataTable<CustomerRow>
      title="Customers"
      fetchUrl="/api/electroflow/customers"
      searchPlaceholder="Search name, phone, email, CNIC..."
      filters={[
        {
          key: 'isActive',
          label: 'Status',
          options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Name',
          render: (item) => (
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              {item.email && <p className="text-xs text-muted-foreground">{item.email}</p>}
            </div>
          ),
        },
        {
          key: 'phone',
          label: 'Phone',
          render: (item) => <span className="font-mono text-xs">{item.phone}</span>,
        },
        {
          key: 'cnic',
          label: 'CNIC',
          render: (item) => <span className="font-mono text-xs">{item.cnic || '-'}</span>,
        },
        {
          key: 'city',
          label: 'City',
          render: (item) => item.city || '-',
        },
        {
          key: 'creditLimit',
          label: 'Credit Limit',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.creditLimit)}</span>,
        },
        {
          key: 'riskScore',
          label: 'Risk',
          className: 'text-center',
          render: (item) => {
            const score = item.riskScore
            const color = score > 70 ? 'text-red-600' : score > 40 ? 'text-amber-600' : 'text-emerald-600'
            return <span className={`text-xs font-medium ${color}`}>{score.toFixed(0)}%</span>
          },
        },
        {
          key: '_count',
          label: 'Sales',
          className: 'text-center',
          render: (item) => <span className="text-xs">{item._count?.sales || 0}</span>,
        },
        {
          key: 'isActive',
          label: 'Status',
          className: 'text-center',
          render: (item) => (
            <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-[10px]">
              {item.isActive ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
        {
          key: 'createdAt',
          label: 'Since',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>,
        },
      ]}
    />
  )
}
