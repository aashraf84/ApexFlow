import { create } from 'zustand'

export type FleetFlowModule =
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'trips'
  | 'fuel'
  | 'maintenance'
  | 'deliveries'
  | 'expenses'
  | 'reports'

interface FleetFlowState {
  activeModule: FleetFlowModule
  setActiveModule: (module: FleetFlowModule) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useFleetFlowStore = create<FleetFlowState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
