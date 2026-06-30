'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { MarketingCampaign } from '@/types/admin'

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F' },
  { id: 'twitter', label: 'Twitter', color: '#000000' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
]
const CAMPAIGN_TYPES = ['awareness', 'lead_gen', 'conversion', 'retention']

interface FormState {
  name: string; type: string; platforms: string[]; budget: string;
  startDate: string; endDate: string; targetAudience: string; description: string;
}

export function CampaignForm({ open, onClose, campaign }: { open: boolean; onClose: () => void; campaign: MarketingCampaign | null }) {
  const [form, setForm] = useState<FormState>({
    name: '', type: 'awareness', platforms: [], budget: '1000', startDate: '', endDate: '', targetAudience: '', description: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name, type: campaign.type, platforms: campaign.platforms ? JSON.parse(campaign.platforms) : [],
        budget: String(campaign.budget), startDate: campaign.startDate?.split('T')[0] || '', endDate: campaign.endDate?.split('T')[0] || '',
        targetAudience: campaign.targetAudience || '', description: '',
      })
    } else {
      setForm({ name: '', type: 'awareness', platforms: [], budget: '1000', startDate: '', endDate: '', targetAudience: '', description: '' })
    }
  }, [campaign, open])

  const togglePlatform = (id: string) => {
    setForm(f => ({ ...f, platforms: f.platforms.includes(id) ? f.platforms.filter(p => p !== id) : [...f.platforms, id] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: campaign?.id }),
      })
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{campaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Campaign name" /></div>
          <div className="space-y-1.5"><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CAMPAIGN_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Platforms</Label><div className="flex flex-wrap gap-3">{PLATFORMS.map(p => (
            <label key={p.id} className="flex items-center gap-1.5 cursor-pointer"><Checkbox checked={form.platforms.includes(p.id)} onCheckedChange={() => togglePlatform(p.id)} /><span className="w-4 h-4 rounded-full" style={{ background: p.color }} /><span className="text-sm">{p.label}</span></label>
          ))}</div></div>
          <div className="space-y-1.5"><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Target Audience</Label><Input value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="e.g., 25-34, tech professionals" /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Campaign description..." rows={3} /></div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : campaign ? 'Update' : 'Create'}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
