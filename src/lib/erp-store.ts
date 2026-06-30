import { create } from 'zustand'

export type ERPModule =
  | 'dashboard'
  | 'sales'
  | 'customers'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'installments'
  | 'employees'
  | 'deliveries'
  | 'service'
  | 'suppliers'
  | 'expenses'

interface ERPState {
  activeModule: ERPModule
  setActiveModule: (module: ERPModule) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useERPStore = create<ERPState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
