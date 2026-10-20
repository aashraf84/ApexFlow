'use client'

import { useRouter } from 'next/navigation'
import { AdvancedDashboard } from '@/components/admin/panel/advanced-dashboard'

export default function AdminDashboardPage() {
  const router = useRouter()
  const handleNavigate = (section: string) => {
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
      payments: '/admin/payments',
      subscriptions: '/admin/subscriptions',
      licenses: '/admin/licenses',
      support: '/admin/support',
      'sync-logs': '/admin/sync-logs',
      audit: '/admin/audit-logs',
      activity: '/admin/activity',
      devices: '/admin/devices',
      communications: '/admin/communications',
      marketing: '/admin/marketing',
      reports: '/admin/reports',
      system: '/admin/system',
    }
    const path = sectionPathMap[section]
    if (path) router.push(path)
  }

  return <AdvancedDashboard onNavigate={handleNavigate} />
}
