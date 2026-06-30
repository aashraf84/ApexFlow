'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PipelineColumn } from './pipeline-column'
import { DealForm } from './deal-form'
import type { DealStage } from '@/types/admin'

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-sky-500' },
  { key: 'qualified', label: 'Qualified', color: 'bg-amber-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-violet-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { key: 'closed_won', label: 'Closed Won', color: 'bg-emerald-500' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'bg-rose-500' },
]

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

export function PipelinePage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editDeal, setEditDeal] = useState<any>(null)

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals')
      const json = await res.json()
      setDeals(json.deals || [])
    } catch { setDeals([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const totalValue = deals.reduce((s, d) => s + d.value, 0)

  const grouped = STAGES.map(stage => ({
    ...stage,
    deals: deals.filter(d => d.stage === stage.key),
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Deal Pipeline" description="Track and manage your sales pipeline"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => { setEditDeal(null); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Add Deal
          </Button>
        } />
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
          <p className="text-xl font-bold text-foreground">{formatPKR(totalValue)}</p>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">{deals.length} deals</div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {grouped.map(g => (
            <PipelineColumn key={g.key} stage={g} onEditDeal={(d: any) => { setEditDeal(d); setShowForm(true) }} />
          ))}
        </div>
      )}
      <DealForm open={showForm} onClose={() => { setShowForm(false); setEditDeal(null) }}
        onSaved={fetchDeals} deal={editDeal} />
    </div>
  )
}
