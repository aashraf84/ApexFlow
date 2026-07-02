'use client'

import { useRouter } from 'next/navigation'
import { DashboardView } from '@/components/admin/panel/dashboard-view'
import type { PanelSection } from '@/components/admin/panel/dashboard-view'

export default function AdminDashboardPage() {
  const router = useRouter()
  const handleNavigate = (section: PanelSection) => {
    if (section === 'dashboard') {
      router.push('/admin/dashboard')
      return
    }
    if (section.startsWith('erp-detail:')) {
      router.push(`/admin/erp/${section.replace('erp-detail:', '')}`)
      return
    }
    const sectionPathMap: Record<string, string> = {
      erp: '/admin/erp',
      integrations: '/admin/integrations',
      clients: '/admin/clients',
      deals: '/admin/deals',
      finance: '/admin/finance',
      communications: '/admin/communications',
      marketing: '/admin/marketing',
      reports: '/admin/reports',
      system: '/admin/system',
    }
    const path = sectionPathMap[section]
    if (path) router.push(path)
  }

  return <DashboardView onNavigate={handleNavigate} />
}