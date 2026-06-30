'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { SubscriptionsTable } from './subscriptions-table'
import { CreditCard } from 'lucide-react'

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions')
      const json = await res.json()
      setSubscriptions(json.subscriptions || [])
    } catch { setSubscriptions([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSubscriptions() }, [fetchSubscriptions])

  const filtered = subscriptions.filter((s: any) =>
    s.client?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    s.erpSystem?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.plan?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Manage client ERP subscriptions and billing"
        actions={
          <Button size="sm" className="gap-1.5" onClick={fetchSubscriptions}>
            <Plus className="w-4 h-4" /> Create Subscription
          </Button>
        } />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search subscriptions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-6 h-6" />} title="No subscriptions found" description="Create a new subscription to get started" />
      ) : (
        <SubscriptionsTable subscriptions={filtered} onRefresh={fetchSubscriptions} />
      )}
    </div>
  )
}
