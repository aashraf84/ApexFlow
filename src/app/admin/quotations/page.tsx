'use client'

import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { ScrollText } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'quotationNumber', label: 'Quotation #' },
  { key: 'clientName', label: 'Client', render: (val, row) => val || row.clientId || '—' },
  { key: 'quotationDate', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  {
    key: 'totalAmount', label: 'Total',
    render: (val) => <span className="font-medium">PKR {(val || 0).toLocaleString()}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = {
        Draft: 'bg-slate-100 text-slate-700',
        Sent: 'bg-blue-100 text-blue-700',
        Accepted: 'bg-emerald-100 text-emerald-700',
        Rejected: 'bg-red-100 text-red-700',
        Expired: 'bg-amber-100 text-amber-700',
      }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
  { key: 'validUntil', label: 'Valid Until', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
]

export default function QuotationsPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-dropdown', selectedErpId],
    queryFn: () => fetch(`/api/erp/clients?erpId=${selectedErpId}&pageSize=200`).then(r => r.json()).then(d => d.data || []),
    enabled: !!selectedErpId && formOpen,
  })

  const formFields: FormField[] = [
    {
      name: 'clientId', label: 'Client', type: 'select', required: true,
      options: clients.map((c: any) => ({ label: c.companyName || c.name, value: c.id })),
    },
    { name: 'quotationDate', label: 'Quotation Date', type: 'date', required: true },
    { name: 'validUntil', label: 'Valid Until', type: 'date' },
    { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'PKR' },
    {
      name: 'status', label: 'Status', type: 'select',
      options: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Sent', value: 'Sent' },
        { label: 'Accepted', value: 'Accepted' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Expired', value: 'Expired' },
      ],
      defaultValue: 'Draft',
    },
    { name: 'terms', label: 'Terms', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ]

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/quotations?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`)
      .then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow
      ? `/api/erp/quotations/${editingRow.id}?erpId=${selectedErpId}`
      : `/api/erp/quotations?erpId=${selectedErpId}`
    const method = editingRow ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['quotations'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/quotations/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['quotations'] })
    setDeleteRow(null)
    toast.success('Quotation deleted')
  }

  return (
    <div>
      <PageHeader title="Quotations" description="Manage sales quotations" icon={ScrollText} />
      <DataTable
        queryKey="quotations" queryFn={fetchData} columns={columns} erpId={selectedErpId}
        searchPlaceholder="Search quotations..." emptyTitle="No quotations found"
        onEdit={(row) => { setEditingRow(row); setFormOpen(true) }}
        onDelete={(row) => setDeleteRow(row)}
        onCreate={() => { setEditingRow(null); setFormOpen(true) }}
        createLabel="Create Quotation"
      />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Quotation' : 'New Quotation'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Quotation" description={`Delete quotation "${deleteRow?.quotationNumber}"?`} onConfirm={handleDelete} />
    </div>
  )
}