'use client'

import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Smartphone } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'deviceName', label: 'Device Name' },
  { key: 'deviceId', label: 'Device ID' },
  { key: 'tenantName', label: 'Tenant', render: (val, row) => val || row.tenantId || '—' },
  { key: 'serialKey', label: 'Serial Key', render: (val, row) => val || row.serialKeyId || '—' },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-100 text-emerald-700', Inactive: 'bg-slate-100 text-slate-700', Blocked: 'bg-red-100 text-red-700' }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

export default function DevicesPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const { data: serialKeys = [] } = useQuery({
    queryKey: ['serial-keys-dropdown', selectedErpId],
    queryFn: () => fetch(`/api/erp/serial-keys?erpId=${selectedErpId}&pageSize=200`).then(r => r.json()).then(d => d.data || []),
    enabled: !!selectedErpId && formOpen,
  })

  const formFields: FormField[] = [
    { name: 'tenantId', label: 'Tenant ID', type: 'text' },
    { name: 'deviceId', label: 'Device ID', type: 'text', required: true, placeholder: 'DEV-001' },
    {
      name: 'serialKeyId', label: 'Serial Key', type: 'select',
      options: serialKeys.map((sk: any) => ({ label: sk.key || sk.id, value: sk.id })),
    },
    { name: 'deviceName', label: 'Device Name', type: 'text', placeholder: 'Samsung Galaxy Tab' },
    {
      name: 'status', label: 'Status', type: 'select',
      options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }, { label: 'Blocked', value: 'Blocked' }],
      defaultValue: 'Active',
    },
  ]

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/devices?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/devices/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/devices?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['devices'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/devices/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['devices'] })
    setDeleteRow(null)
    toast.success('Device deleted')
  }

  return (
    <div>
      <PageHeader title="Devices" description="Manage registered devices" icon={Smartphone} />
      <DataTable queryKey="devices" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search devices..." emptyTitle="No devices found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Register Device" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Device' : 'Register Device'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Device" description={`Remove device "${deleteRow?.deviceName || deleteRow?.deviceId}"?`} onConfirm={handleDelete} />
    </div>
  )
}