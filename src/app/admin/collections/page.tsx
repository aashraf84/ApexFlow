'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Banknote } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'collectionNumber', label: 'Collection #' },
  { key: 'dealerName', label: 'Dealer', render: (val, row) => val || row.dealerId || '—' },
  { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  {
    key: 'amount', label: 'Amount',
    render: (val) => <span className="font-medium text-emerald-600">PKR {(val || 0).toLocaleString()}</span>,
  },
  { key: 'method', label: 'Method', render: (val) => <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{val || '—'}</span> },
  { key: 'reference', label: 'Reference' },
  { key: 'bank', label: 'Bank', render: (val) => val || '—' },
  { key: 'collectedBy', label: 'Collected By', render: (val) => val || '—' },
]

export default function CollectionsPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const formFields: FormField[] = [
    { name: 'dealerId', label: 'Dealer ID', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'amount', label: 'Amount (PKR)', type: 'number', required: true },
    {
      name: 'method', label: 'Method', type: 'select',
      options: [
        { label: 'Cash', value: 'Cash' }, { label: 'Cheque', value: 'Cheque' },
        { label: 'Bank Transfer', value: 'Bank Transfer' }, { label: 'Online', value: 'Online' },
      ],
      defaultValue: 'Cash',
    },
    { name: 'reference', label: 'Reference #', type: 'text' },
    { name: 'bank', label: 'Bank Name', type: 'text' },
    { name: 'collectedBy', label: 'Collected By', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ]

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/collections?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/collections/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/collections?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['collections'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/collections/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['collections'] })
    setDeleteRow(null)
    toast.success('Collection deleted')
  }

  return (
    <div>
      <PageHeader title="Collections" description="Payment collections from dealers" icon={Banknote} />
      <DataTable queryKey="collections" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search collections..." emptyTitle="No collections found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Record Collection" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Collection' : 'Record Collection'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Collection" description={`Delete collection "${deleteRow?.collectionNumber}"?`} onConfirm={handleDelete} />
    </div>
  )
}