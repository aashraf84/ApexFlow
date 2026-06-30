'use client'

import { DataTable, StatusBadge, formatCurrency, formatDate } from './data-table'

interface InventoryRow {
  id: string
  product: { id: string; name: string; sku: string | null; salePrice: number; image: string | null }
  warehouse: { id: string; name: string }
  branch: { id: string; name: string }
  quantity: number
  reservedQty: number
  serialNumber: string | null
  imeiNumber: string | null
  batchNumber: string | null
  condition: string
  purchaseDate: string | null
  updatedAt: string
}

export function InventoryView() {
  return (
    <DataTable<InventoryRow>
      title="Inventory"
      fetchUrl="/api/electroflow/inventory"
      searchPlaceholder="Search products..."
      columns={[
        {
          key: 'product',
          label: 'Product',
          render: (item) => (
            <div>
              <p className="font-medium text-sm">{item.product?.name}</p>
              {item.product?.sku && <p className="text-[10px] text-muted-foreground font-mono">{item.product.sku}</p>}
            </div>
          ),
        },
        {
          key: 'branch',
          label: 'Branch',
          render: (item) => <span className="text-xs">{item.branch?.name}</span>,
        },
        {
          key: 'warehouse',
          label: 'Warehouse',
          render: (item) => <span className="text-xs">{item.warehouse?.name}</span>,
        },
        {
          key: 'quantity',
          label: 'Quantity',
          className: 'text-center',
          render: (item) => {
            const available = item.quantity - item.reservedQty
            return (
              <div>
                <span className="font-medium text-sm">{item.quantity}</span>
                {item.reservedQty > 0 && (
                  <p className="text-[10px] text-amber-600">{item.reservedQty} reserved</p>
                )}
              </div>
            )
          },
        },
        {
          key: 'serialNumber',
          label: 'Serial / IMEI',
          render: (item) => (
            <div>
              {item.serialNumber && <p className="font-mono text-[10px]">SN: {item.serialNumber}</p>}
              {item.imeiNumber && <p className="font-mono text-[10px]">IMEI: {item.imeiNumber}</p>}
              {!item.serialNumber && !item.imeiNumber && <span className="text-xs text-muted-foreground">-</span>}
            </div>
          ),
        },
        {
          key: 'condition',
          label: 'Condition',
          className: 'text-center',
          render: (item) => <StatusBadge status={item.condition} />,
        },
        {
          key: 'product.salePrice',
          label: 'Unit Price',
          className: 'text-right',
          render: (item) => <span className="text-xs">{formatCurrency(item.product?.salePrice || 0)}</span>,
        },
        {
          key: 'totalValue',
          label: 'Total Value',
          className: 'text-right',
          render: (item) => (
            <span className="text-xs font-medium">{formatCurrency(item.quantity * (item.product?.salePrice || 0))}</span>
          ),
        },
        {
          key: 'updatedAt',
          label: 'Updated',
          className: 'text-right',
          render: (item) => <span className="text-xs text-muted-foreground">{formatDate(item.updatedAt)}</span>,
        },
      ]}
    />
  )
}
