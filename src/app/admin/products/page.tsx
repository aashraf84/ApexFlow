'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelectedErp } from '@/hooks/use-selected-erp'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { FormDialog, FormField } from '@/components/admin/form-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Package } from 'lucide-react'
import { toast } from 'sonner'

const columns: Column[] = [
  { key: 'name', label: 'Product Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category', render: (val) => <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{val || '—'}</span> },
  {
    key: 'unitPrice', label: 'Price',
    render: (val) => <span className="font-medium">PKR {(val || 0).toLocaleString()}</span>,
  },
  { key: 'unit', label: 'Unit', render: (val) => val || '—' },
  {
    key: 'stock', label: 'Stock',
    render: (val) => <span className={val > 0 ? 'text-emerald-600' : val === 0 ? 'text-red-600' : 'text-muted-foreground'}>{val ?? '—'}</span>,
  },
  {
    key: 'isActive', label: 'Status',
    render: (val) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{val ? 'Active' : 'Inactive'}</span>,
  },
]

const formFields: FormField[] = [
  { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'Product name' },
  { name: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'SKU-001' },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'Beverages' },
  { name: 'unitPrice', label: 'Unit Price (PKR)', type: 'number', required: true },
  { name: 'costPrice', label: 'Cost Price (PKR)', type: 'number' },
  { name: 'unit', label: 'Unit', type: 'text', placeholder: 'Carton', defaultValue: 'Carton' },
  { name: 'stock', label: 'Current Stock', type: 'number', defaultValue: 0 },
  { name: 'minStock', label: 'Min Stock Alert', type: 'number' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
]

export default function ProductsPage() {
  const { selectedErpId } = useSelectedErp()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/products?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  const handleSave = async (values: Record<string, any>) => {
    const url = editingRow ? `/api/erp/products/${editingRow.id}?erpId=${selectedErpId}` : `/api/erp/products?erpId=${selectedErpId}`
    const res = await fetch(url, { method: editingRow ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(values) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const handleDelete = async () => {
    if (!deleteRow) return
    await fetch(`/api/erp/products/${deleteRow.id}?erpId=${selectedErpId}`, { method: 'DELETE', credentials: 'same-origin' })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    setDeleteRow(null)
    toast.success('Product deleted')
  }

  return (
    <div>
      <PageHeader title="Products" description="Product catalog management" icon={Package} />
      <DataTable queryKey="products" queryFn={fetchData} columns={columns} erpId={selectedErpId} searchPlaceholder="Search products..." emptyTitle="No products found" onEdit={(row) => { setEditingRow(row); setFormOpen(true) }} onDelete={(row) => setDeleteRow(row)} onCreate={() => { setEditingRow(null); setFormOpen(true) }} createLabel="Add Product" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRow ? 'Edit Product' : 'New Product'} fields={formFields} onSubmit={handleSave} initialValues={editingRow} />
      <ConfirmDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)} title="Delete Product" description={`Delete "${deleteRow?.name}"?`} onConfirm={handleDelete} />
    </div>
  )
}