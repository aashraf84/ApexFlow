'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'orderNumber', label: 'Order #' },
  { key: 'dealerName', label: 'Dealer', render: (val, row) => val || row.dealerId || '—' },
  { key: 'orderDate', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
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
        Pending: 'bg-amber-100 text-amber-700', Confirmed: 'bg-blue-100 text-blue-700',
        Processing: 'bg-indigo-100 text-indigo-700', Shipped: 'bg-purple-100 text-purple-700',
        Delivered: 'bg-emerald-100 text-emerald-700', Cancelled: 'bg-red-100 text-red-700',
        Returned: 'bg-orange-100 text-orange-700',
      }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
]

export default function OrdersPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const formFields: FormField[] = [
    { name: 'dealerId', label: 'Dealer ID', type: 'text', required: true },
    { name: 'orderDate', label: 'Order Date', type: 'date', required: true },
    { name: 'deliveryDate', label: 'Delivery Date', type: 'date' },
    {
      name: 'status', label: 'Status', type: 'select',
      options: [
        { label: 'Pending', value: 'Pending' }, { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Processing', value: 'Processing' }, { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' }, { label: 'Cancelled', value: 'Cancelled' },
      ],
      defaultValue: 'Pending',
    },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ]

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/orders?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/orders/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/orders?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/orders/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    setDeleteRow(null)
    toast.success('Order deleted')
  }

  return (
    <div>
      <PageHeader title="Sales Orders" description="Manage distribution sales orders" icon={ShoppingCart} />
      <DataTable queryKey="orders" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search orders..." emptyTitle="No orders found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="New Order" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Order' : 'New Order'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Order" description={`Delete order "${deleteRow?.orderNumber}"?`} onConfirm={handleDelete} />
    </div>
  )
}