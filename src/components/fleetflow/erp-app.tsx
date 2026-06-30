'use client'

import { useFleetFlowStore, type FleetFlowModule } from '@/lib/fleetflow-store'
import { FleetFlowSidebar } from './erp-sidebar'
import { DashboardView } from './dashboard-view'
import { VehiclesView } from './vehicles-view'
import { DriversView } from './drivers-view'
import { TripsView } from './trips-view'
import { FuelView } from './fuel-view'
import { MaintenanceView } from './maintenance-view'
import { DeliveriesView } from './deliveries-view'
import { ExpensesView } from './expenses-view'
import { ReportsView } from './reports-view'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

const moduleComponents: Record<FleetFlowModule, React.ComponentType> = {
  dashboard: DashboardView,
  vehicles: VehiclesView,
  drivers: DriversView,
  trips: TripsView,
  fuel: FuelView,
  maintenance: MaintenanceView,
  deliveries: DeliveriesView,
  expenses: ExpensesView,
  reports: ReportsView,
}

export function FleetFlowERPApp() {
  const { activeModule, sidebarCollapsed } = useFleetFlowStore()
  const isMobile = useIsMobile()
  const ActiveComponent = moduleComponents[activeModule]

  return (
    <div className="min-h-screen bg-background">
      <FleetFlowSidebar />
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
