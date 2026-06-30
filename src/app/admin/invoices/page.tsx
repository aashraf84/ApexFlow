'use client'

import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'clientName', label: 'Client', render: (val, row) => val || row.clientId || '—' },
  { key: 'invoiceDate', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
  {
    key: 'totalAmount', label: 'Total',
    render: (val) => <span className="font-medium">PKR {(val || 0).toLocaleString()}</span>,
  },
  {
    key: 'paidAmount', label: 'Paid',
    render: (val) => <span className="text-emerald-600">PKR {(val || 0).toLocaleString()}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = {
        Paid: 'bg-emerald-100 text-emerald-700',
        Unpaid: 'bg-amber-100 text-amber-700',
        Overdue: 'bg-red-100 text-red-700',
        Partial: 'bg-blue-100 text-blue-700',
      }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

export default function InvoicesPage() {
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
    { name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date' },
    { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'PKR' },
    { name: 'terms', label: 'Terms', type: 'text', placeholder: 'Net 30' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ]

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/invoices?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`)
      .then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow
      ? `/api/erp/invoices/${editingRow.id}?erpId=${selectedErpId}`
      : `/api/erp/invoices?erpId=${selectedErpId}`
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
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/invoices/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    setDeleteRow(null)
    toast.success('Invoice deleted')
  }

  return (
    <div>
      <PageHeader title="Invoices" description="Manage client invoices and billing" icon={FileText} />
      <DataTable
        queryKey="invoices"
        queryFn={fetchData}
        columns={columns}
        erpId={selectedErpId}
        searchPlaceholder="Search invoices..."
        emptyTitle="No invoices found"
        onEdit={(row) => { setEditingRow(row); setFormOpen(true) }}
        onDelete={(row) => setDeleteRow(row)}
        onCreate={() => { setEditingRow(null); setFormOpen(true) }}
        createLabel="Create Invoice"
      />
      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingRow ? 'Edit Invoice' : 'New Invoice'}
        fields={formFields}
        onSubmit={handleSave}
        initialValues={editingRow}
      />
      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={() => setDeleteRow(null)}
        title="Delete Invoice"
        description={`Delete invoice "${deleteRow?.invoiceNumber}"?`}
        onConfirm={handleDelete}
      />
    </div>
  )
}