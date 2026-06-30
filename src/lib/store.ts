import { create } from 'zustand'

export type ViewMode =
  | 'landing'
  | 'products'
  | 'solutions'
  | 'industries'
  | 'industry-detail'
  | 'pricing'
  | 'resources'
  | 'contact'
  | 'about'
  | 'careers'
  | 'blog'
  | 'legal-privacy'
  | 'legal-terms'
  | 'legal-security'
  | 'login'
  | 'dashboard'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
}

type AppState = {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectedIndustry: string | null
  setSelectedIndustry: (industry: string | null) => void
  adminUser: AdminUser | null
  setAdminUser: (user: AdminUser | null) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'landing',
  setViewMode: (mode) => set({ viewMode: mode, mobileMenuOpen: false }),
  selectedIndustry: null,
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
  adminUser: null,
  setAdminUser: (user) => set({ adminUser: user }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
