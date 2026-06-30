// ApexFlow Admin Panel — Zustand Store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '@/types/admin'

interface AdminStoreState {
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  collapsedSections: Record<string, boolean>

  // User state
  currentUser: AdminUser | null

  // Department state
  currentDepartment: string

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSection: (sectionId: string) => void
  setSectionCollapsed: (sectionId: string, collapsed: boolean) => void
  setCurrentUser: (user: AdminUser | null) => void
  setCurrentDepartment: (department: string) => void
  reset: () => void
}

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  collapsedSections: {} as Record<string, boolean>,
  currentUser: null as AdminUser | null,
  currentDepartment: 'overview',
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) =>
        set({ sidebarOpen: open }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      toggleSection: (sectionId: string) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [sectionId]: !state.collapsedSections[sectionId],
          },
        })),

      setSectionCollapsed: (sectionId: string, collapsed: boolean) =>
        set((state) => ({
          collapsedSections: {
            ...state.collapsedSections,
            [sectionId]: collapsed,
          },
        })),

      setCurrentUser: (user: AdminUser | null) =>
        set({ currentUser: user }),

      setCurrentDepartment: (department: string) =>
        set({ currentDepartment: department }),

      reset: () =>
        set(initialState),
    }),
    {
      name: 'apexflow-admin-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        collapsedSections: state.collapsedSections,
        currentDepartment: state.currentDepartment,
      }),
    }
  )
)
