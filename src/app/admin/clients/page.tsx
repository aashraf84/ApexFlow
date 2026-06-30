'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'companyName', label: 'Company' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'city', label: 'City' },
  {
    key: 'status',
    label: 'Status',
    render: (val) => {
      const variant = val === 'Active' ? 'default' : val === 'Inactive' ? 'destructive' : 'secondary'
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${val === 'Active' ? 'bg-emerald-100 text-emerald-700' : val === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

const formFields: FormField[] = [
  { name: 'companyName', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
  { name: 'contactPerson', label: 'Contact Person', type: 'text', placeholder: 'John Doe' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'company@example.com' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+92 300 1234567' },
  { name: 'mobile', label: 'Mobile', type: 'tel', placeholder: '+92 321 1234567' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
  { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Street address' },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Lahore' },
  { name: 'state', label: 'State/Province', type: 'text', placeholder: 'Punjab' },
  { name: 'country', label: 'Country', type: 'text', placeholder: 'Pakistan', defaultValue: 'Pakistan' },
  { name: 'postalCode', label: 'Postal Code', type: 'text', placeholder: '54000' },
  { name: 'taxNTN', label: 'NTN', type: 'text', placeholder: '0000000-0' },
  { name: 'taxSTN', label: 'STN', type: 'text', placeholder: '00-0000000-000-0000' },
  { name: 'industry', label: 'Industry', type: 'text', placeholder: 'Distribution' },
  { name: 'subDomain', label: 'Sub Domain', type: 'text', placeholder: 'acme' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Prospect', value: 'Prospect' },
      { label: 'Suspended', value: 'Suspended' },
    ],
    defaultValue: 'Active',
  },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
]

export default function ClientsPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/clients?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`)
      .then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow
      ? `/api/erp/clients/${editingRow.id}?erpId=${selectedErpId}`
      : `/api/erp/clients?erpId=${selectedErpId}`
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
    queryClient.invalidateQueries({ queryKey: ['clients'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    const res = await fetch(`/api/erp/clients/${deleteRow.id}?erpId=${selectedErpId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Failed to delete')
    } else {
      toast.success('Client deleted')
    }
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    setDeleteRow(null)
  }

  return (
    <div>
      <PageHeader title="Clients" description="Manage ERP client companies" icon={Building2} />
      <DataTable
        queryKey="clients"
        queryFn={fetchData}
        columns={columns}
        erpId={selectedErpId}
        searchPlaceholder="Search clients..."
        emptyTitle="No clients found"
        onEdit={(row) => { setEditingRow(row); setFormOpen(true) }}
        onDelete={(row) => setDeleteRow(row)}
        onCreate={() => { setEditingRow(null); setFormOpen(true) }}
        createLabel="Add Client"
      />
      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingRow ? 'Edit Client' : 'New Client'}
        description={editingRow ? 'Update client information' : 'Register a new client company'}
        fields={formFields}
        onSubmit={handleSave}
        initialValues={editingRow}
      />
      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={() => setDeleteRow(null)}
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteRow?.companyName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}