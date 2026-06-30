'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/admin/shared/page-header'
import { CampaignCard } from './campaign-card'
import { CampaignForm } from './campaign-form'
import type { MarketingCampaign } from '@/types/admin'

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editCampaign, setEditCampaign] = useState<MarketingCampaign | null>(null)

  useEffect(() => {
    fetch('/api/marketing/campaigns').then(r => r.json()).then(d => setCampaigns(d.campaigns || [])).catch(() => {})
  }, [])

  const filtered = campaigns.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns" description="Manage your marketing campaigns across platforms"
        actions={<Button size="sm" onClick={() => { setEditCampaign(null); setShowForm(true) }}><Plus className="w-4 h-4 mr-1" />Create Campaign</Button>}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <CampaignCard key={c.id} campaign={c} onEdit={() => { setEditCampaign(c); setShowForm(true) }} />
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No campaigns found</p>}
      <CampaignForm open={showForm} onClose={() => { setShowForm(false); setEditCampaign(null) }} campaign={editCampaign} />
    </div>
  )
}
