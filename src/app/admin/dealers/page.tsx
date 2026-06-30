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
  { key: 'name', label: 'Dealer Name' },
  { key: 'code', label: 'Code' },
  { key: 'city', label: 'City' },
  { key: 'contactPerson', label: 'Contact', render: (val, row) => val || row.phone || '—' },
  { key: 'phone', label: 'Phone' },
  {
    key: 'outstandingBalance', label: 'Balance',
    render: (val) => <span className={val > 0 ? 'text-red-600 font-medium' : 'text-emerald-600'}>PKR {(val || 0).toLocaleString()}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: (val) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${val === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>,
  },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Dealer Name', type: 'text', required: true, placeholder: 'ABC Traders' },
  { name: 'code', label: 'Code', type: 'text', placeholder: 'DLR-001' },
  { name: 'contactPerson', label: 'Contact Person', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'mobile', label: 'Mobile', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address', type: 'textarea' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'region', label: 'Region', type: 'text' },
  { name: 'creditLimit', label: 'Credit Limit', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }, { label: 'Blocked', value: 'Blocked' }],
    defaultValue: 'Active',
  },
  { name: 'ntn', label: 'NTN', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function DealersPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/dealers?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/dealers/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/dealers?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['dealers'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/dealers/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['dealers'] })
    setDeleteRow(null)
    toast.success('Dealer deleted')
  }

  return (
    <div>
      <PageHeader title="Dealers" description="Distribution dealer management" icon={Building2} />
      <DataTable queryKey="dealers" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search dealers..." emptyTitle="No dealers found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Add Dealer" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Dealer' : 'New Dealer'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Dealer" description={`Delete "${deleteRow?.name}"?`} onConfirm={handleDelete} />
    </div>
  )
}