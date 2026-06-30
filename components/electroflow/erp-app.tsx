'use client'

import { useERPStore, type ERPModule } from '@/lib/erp-store'
import { ERPSidebar } from './erp-sidebar'
import { DashboardView } from './dashboard-view'
import { SalesView } from './sales-view'
import { CustomersView } from './customers-view'
import { ProductsView } from './products-view'
import { InventoryView } from './inventory-view'
import { PurchasesView } from './purchases-view'
import { InstallmentsView } from './installments-view'
import { EmployeesView } from './employees-view'
import { DeliveriesView } from './deliveries-view'
import { ServiceView } from './service-view'
import { SuppliersView } from './suppliers-view'
import { ExpensesView } from './expenses-view'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

const moduleComponents: Record<ERPModule, React.ComponentType> = {
  dashboard: DashboardView,
  sales: SalesView,
  customers: CustomersView,
  products: ProductsView,
  inventory: InventoryView,
  purchases: PurchasesView,
  installments: InstallmentsView,
  employees: EmployeesView,
  deliveries: DeliveriesView,
  service: ServiceView,
  suppliers: SuppliersView,
  expenses: ExpensesView,
}

const moduleTitles: Record<ERPModule, string> = {
  dashboard: 'Dashboard',
  sales: 'Sales Management',
  customers: 'Customer Management',
  products: 'Product Catalog',
  inventory: 'Inventory Management',
  purchases: 'Purchase Orders',
  installments: 'Installment Plans',
  employees: 'Employee Management',
  deliveries: 'Delivery Tracking',
  service: 'Service & Repair',
  suppliers: 'Supplier Management',
  expenses: 'Expense Tracking',
}

export function ERPApp() {
  const { activeModule, sidebarCollapsed } = useERPStore()
  const isMobile = useIsMobile()
  const ActiveComponent = moduleComponents[activeModule]

  return (
    <div className="min-h-screen bg-background">
      <ERPSidebar />
      <main
        className={cn(
          "transition-all duration-300",
          isMobile ? "px-4 pb-6" : sidebarCollapsed ? "ml-16 p-6" : "ml-60 p-6"
        )}
      >
        <ActiveComponent />
      </main>
    </div>
  )
}
