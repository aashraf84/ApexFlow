'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'
import { Badge } from '@/components/ui/badge'

interface EmployeeRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  cnic: string | null
  designation: string | null
  salary: number
  commission: number
  branch: { id: string; name: string } | null
  department: { id: string; name: string } | null
  hireDate: string | null
  isActive: boolean
}

export function EmployeesView() {
  return (
    <DataTable<EmployeeRow>
      title="Employees"
      fetchUrl="/api/electroflow/employees"
      searchPlaceholder="Search name, email, designation..."
      columns={[
        {
          key: 'name',
          label: 'Name',
          render: (item) => (
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              {item.email && <p className="text-[10px] text-muted-foreground">{item.email}</p>}
            </div>
          ),
        },
        {
          key: 'phone',
          label: 'Phone',
          render: (item) => <span className="font-mono text-xs">{item.phone || '-'}</span>,
        },
        {
          key: 'designation',
          label: 'Designation',
          render: (item) => <span className="text-xs">{item.designation || '-'}</span>,
        },
        {
          key: 'branch',
          label: 'Branch',
          render: (item) => <Badge variant="outline" className="text-[10px]">{item.branch?.name || '-'}</Badge>,
        },
        {
          key: 'department',
          label: 'Department',
          render: (item) => <span className="text-xs">{item.department?.name || '-'}</span>,
        },
        {
          key: 'salary',
          label: 'Salary',
          className: 'text-right',
          render: (item) => <span className="text-xs font-medium">{formatCurrency(item.salary)}</span>,
        },
        {
          key: 'commission',
          label: 'Commission',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.commission)}</span>,
        },
        {
          key: 'hireDate',
          label: 'Hire Date',
          className: 'text-right',
          render: (item) => item.hireDate
            ? <span className="text-xs text-muted-foreground">{formatDate(item.hireDate)}</span>
            : '-',
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
      ]}
    />
  )
}
