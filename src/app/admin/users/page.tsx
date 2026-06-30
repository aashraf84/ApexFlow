'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

const columns: Column[] = [
  { key: 'username', label: 'Username' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role', render: (val) => <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{val || '—'}</span> },
  {
    key: 'isActive', label: 'Status',
    render: (val) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {val ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

const baseFormFields: FormField[] = [
  { name: 'username', label: 'Username', type: 'text', required: true, placeholder: 'johndoe' },
  { name: 'password', label: 'Password', type: 'password', required: true, placeholder: '••••••••' },
  { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+92 300 1234567' },
  {
    name: 'role', label: 'Role', type: 'select', required: true,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Manager', value: 'manager' },
      { label: 'Salesman', value: 'salesman' },
      { label: 'Viewer', value: 'viewer' },
    ],
    defaultValue: 'viewer',
  },
  { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
]

export default function UsersPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', selectedErpId],
    queryFn: () => fetch(`/api/erp/clients?erpId=${selectedErpId}&pageSize=100`).then(r => r.json()).then(d => d.data || []),
    enabled: !!selectedErpId,
  })

  const formFields: FormField[] = [
    {
      name: 'tenantId', label: 'Tenant', type: 'select',
      options: tenants.map((t: any) => ({ label: t.companyName || t.name, value: t.id })),
    },
    ...baseFormFields,
  ]

  const editFields = editingRow
    ? formFields.map(f => f.name === 'password' ? { ...f, required: false, placeholder: 'Leave blank to keep current' } : f)
    : formFields

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/users?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`)
      .then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow
      ? `/api/erp/users/${editingRow.id}?erpId=${selectedErpId}`
      : `/api/erp/users?erpId=${selectedErpId}`
    const method = editingRow ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to save')
    }
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/users/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['users'] })
    setDeleteRow(null)
    toast.success('User deleted')
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage ERP user accounts" icon={Users} />
      <DataTable
        queryKey="users"
        queryFn={fetchData}
        columns={columns}
        erpId={selectedErpId}
        searchPlaceholder="Search users..."
        emptyTitle="No users found"
        onEdit={(row) => { setEditingRow(row); setFormOpen(true) }}
        onDelete={(row) => setDeleteRow(row)}
        onCreate={() => { setEditingRow(null); setFormOpen(true) }}
        createLabel="Add User"
      />
      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingRow ? 'Edit User' : 'New User'}
        fields={editFields}
        onSubmit={handleSave}
        initialValues={editingRow}
      />
      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={() => setDeleteRow(null)}
        title="Delete User"
        description={`Delete user "${deleteRow?.fullName || deleteRow?.username}"?`}
        onConfirm={handleDelete}
      />
    </div>
  )
}