'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Warehouse } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'name', label: 'Warehouse Name' },
  { key: 'code', label: 'Code' },
  { key: 'city', label: 'City' },
  { key: 'address', label: 'Address' },
  { key: 'manager', label: 'Manager', render: (val) => val || '—' },
  { key: 'phone', label: 'Phone' },
  {
    key: 'isActive', label: 'Status',
    render: (val) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{val ? 'Active' : 'Inactive'}</span>,
  },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Warehouse Name', type: 'text', required: true },
  { name: 'code', label: 'Code', type: 'text', placeholder: 'WH-001' },
  { name: 'address', label: 'Address', type: 'textarea' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'region', label: 'Region', type: 'text' },
  { name: 'manager', label: 'Manager', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
]

export default function WarehousesPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/warehouses?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/warehouses/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/warehouses?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/warehouses/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    setDeleteRow(null)
    toast.success('Warehouse deleted')
  }

  return (
    <div>
      <PageHeader title="Warehouses" description="Warehouse and storage management" icon={Warehouse} />
      <DataTable queryKey="warehouses" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search warehouses..." emptyTitle="No warehouses found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Add Warehouse" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Warehouse' : 'New Warehouse'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Warehouse" description={`Delete "${deleteRow?.name}"?`} onConfirm={handleDelete} />
    </div>
  )
}