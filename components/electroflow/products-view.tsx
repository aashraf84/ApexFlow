'use client'

import { DataTable, formatCurrency, formatDate } from './data-table'
import { Badge } from '@/components/ui/badge'

interface ProductRow {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  brand: string | null
  category: { id: string; name: string } | null
  costPrice: number
  salePrice: number
  unit: string
  hasSerial: boolean
  hasIMEI: boolean
  hasWarranty: boolean
  reorderLevel: number
  isActive: boolean
  _count: { stockItems: number; saleItems: number }
}

export function ProductsView() {
  return (
    <DataTable<ProductRow>
      title="Products"
      fetchUrl="/api/electroflow/products"
      searchPlaceholder="Search name, SKU, barcode, brand..."
      filters={[
        {
          key: 'isActive',
          label: 'Status',
          options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Product',
          render: (item) => (
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.sku && <span className="text-[10px] text-muted-foreground font-mono">SKU: {item.sku}</span>}
                {item.brand && <span className="text-[10px] text-muted-foreground">{item.brand}</span>}
              </div>
            </div>
          ),
        },
        {
          key: 'category',
          label: 'Category',
          render: (item) => (
            <Badge variant="outline" className="text-[10px]">{item.category?.name || 'Uncategorized'}</Badge>
          ),
        },
        {
          key: 'costPrice',
          label: 'Cost',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.costPrice)}</span>,
        },
        {
          key: 'salePrice',
          label: 'Sale Price',
          className: 'text-right',
          render: (item) => <span className="text-xs font-medium">{formatCurrency(item.salePrice)}</span>,
        },
        {
          key: 'unit',
          label: 'Unit',
          className: 'text-center',
          render: (item) => <span className="text-xs capitalize">{item.unit}</span>,
        },
        {
          key: 'features',
          label: 'Features',
          className: 'text-center',
          render: (item) => (
            <div className="flex items-center justify-center gap-1">
              {item.hasSerial && <span className="text-[9px] px-1 py-0.5 rounded bg-accent">SN</span>}
              {item.hasIMEI && <span className="text-[9px] px-1 py-0.5 rounded bg-accent">IMEI</span>}
              {item.hasWarranty && <span className="text-[9px] px-1 py-0.5 rounded bg-accent">W</span>}
            </div>
          ),
        },
        {
          key: '_count',
          label: 'In Stock',
          className: 'text-center',
          render: (item) => {
            const qty = item._count?.stockItems || 0
            return <span className={`text-xs font-medium ${qty <= item.reorderLevel ? 'text-red-600' : 'text-emerald-600'}`}>{qty}</span>
          },
        },
        {
          key: 'isActive',
          label: 'Status',
          className: 'text-center',
          render: (item) => (
            <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-[10px]">
              {item.isActive ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
      ]}
    />
  )
}
