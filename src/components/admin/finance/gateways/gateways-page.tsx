'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { GatewayCard } from './gateway-card'
import { GatewayForm } from './gateway-form'

export function GatewaysPage() {
  const [gateways, setGateways] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editGateway, setEditGateway] = useState<any>(null)

  const fetchGateways = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gateways')
      const json = await res.json()
      setGateways(json.gateways || [])
    } catch { setGateways([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchGateways() }, [fetchGateways])

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Gateways" description="Configure payment methods and gateway integrations"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => { setEditGateway(null); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Add Gateway
          </Button>
        } />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : gateways.length === 0 ? (
        <EmptyState icon={<Landmark className="w-6 h-6" />} title="No gateways configured" description="Add a payment gateway to start accepting payments" actionLabel="Add Gateway" onAction={() => { setEditGateway(null); setShowForm(true) }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gw) => (
            <GatewayCard key={gw.id} gateway={gw} onEdit={(g: any) => { setEditGateway(g); setShowForm(true) }} onRefresh={fetchGateways} />
          ))}
        </div>
      )}

      <GatewayForm open={showForm} onClose={() => { setShowForm(false); setEditGateway(null) }} onSaved={fetchGateways} gateway={editGateway} />
    </div>
  )
}
