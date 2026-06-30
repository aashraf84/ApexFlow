'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'vehicleNumber', label: 'Vehicle #' },
  { key: 'type', label: 'Type' },
  { key: 'driver', label: 'Driver', render: (val) => val || '—' },
  { key: 'driverPhone', label: 'Driver Phone' },
  { key: 'capacity', label: 'Capacity' },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = { Available: 'bg-emerald-100 text-emerald-700', OnRoute: 'bg-blue-100 text-blue-700', Maintenance: 'bg-amber-100 text-amber-700', OutOfService: 'bg-red-100 text-red-700' }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

const formFields: FormField[] = [
  { name: 'vehicleNumber', label: 'Vehicle Number', type: 'text', required: true, placeholder: 'LEA-1234' },
  { name: 'type', label: 'Type', type: 'text', placeholder: 'Truck, Van, etc.' },
  { name: 'driver', label: 'Driver Name', type: 'text' },
  { name: 'driverPhone', label: 'Driver Phone', type: 'tel' },
  { name: 'capacity', label: 'Capacity (tons)', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [{ label: 'Available', value: 'Available' }, { label: 'On Route', value: 'OnRoute' }, { label: 'Maintenance', value: 'Maintenance' }, { label: 'Out of Service', value: 'OutOfService' }],
    defaultValue: 'Available',
  },
  { name: 'warehouseId', label: 'Base Warehouse ID', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function VehiclesPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/vehicles?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/vehicles/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/vehicles?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/vehicles/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    setDeleteRow(null)
    toast.success('Vehicle deleted')
  }

  return (
    <div>
      <PageHeader title="Vehicles" description="Fleet and vehicle management" icon={ClipboardCheck} />
      <DataTable queryKey="vehicles" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search vehicles..." emptyTitle="No vehicles found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Add Vehicle" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Vehicle' : 'New Vehicle'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Vehicle" description={`Delete vehicle "${deleteRow?.vehicleNumber}"?`} onConfirm={handleDelete} />
    </div>
  )
}