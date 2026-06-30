'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'key', label: 'Serial Key', render: (val) => <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{val || '—'}</code> },
  { key: 'plan', label: 'Plan' },
  { key: 'maxDevices', label: 'Max Devices' },
  { key: 'companyName', label: 'Company' },
  { key: 'contactEmail', label: 'Email' },
  { key: 'validFrom', label: 'Valid From', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  { key: 'validUntil', label: 'Valid Until', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-100 text-emerald-700', Expired: 'bg-red-100 text-red-700', Inactive: 'bg-slate-100 text-slate-700' }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

export default function SerialKeysPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const formFields: FormField[] = [
    { name: 'tenantId', label: 'Tenant ID', type: 'text' },
    { name: 'key', label: 'Serial Key', type: 'text', required: true, placeholder: 'XXXX-XXXX-XXXX' },
    { name: 'plan', label: 'Plan', type: 'text', placeholder: 'Premium' },
    { name: 'maxDevices', label: 'Max Devices', type: 'number', defaultValue: 5 },
    { name: 'companyName', label: 'Company Name', type: 'text' },
    { name: 'contactEmail', label: 'Contact Email', type: 'email' },
    { name: 'contactPhone', label: 'Contact Phone', type: 'tel' },
    { name: 'clientId', label: 'Client ID', type: 'text' },
    { name: 'validFrom', label: 'Valid From', type: 'date' },
    { name: 'validUntil', label: 'Valid Until', type: 'date' },
    {
      name: 'status', label: 'Status', type: 'select',
      options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }, { label: 'Expired', value: 'Expired' }],
      defaultValue: 'Active',
    },
  ]

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/serial-keys?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/serial-keys/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/serial-keys?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['serial-keys'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/serial-keys/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['serial-keys'] })
    setDeleteRow(null)
    toast.success('Serial key deleted')
  }

  return (
    <div>
      <PageHeader title="Serial Keys" description="Manage license serial keys" icon={KeyRound} />
      <DataTable queryKey="serial-keys" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search serial keys..." emptyTitle="No serial keys found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Generate Key" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Serial Key' : 'Generate Serial Key'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Serial Key" description="Are you sure? This may affect connected devices." onConfirm={handleDelete} />
    </div>
  )
}