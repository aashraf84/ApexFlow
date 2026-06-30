'use client'

import { Megaphone, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { MarketingCampaign } from '@/types/admin'

const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  active: 'success', draft: 'neutral', paused: 'warning', completed: 'info', cancelled: 'error',
}
const TYPE_COLORS: Record<string, string> = {
  awareness: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)]',
  conversion: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)]',
  engagement: 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)]',
  traffic: 'bg-[var(--gg-cyan)]/10 text-[var(--gg-cyan)]',
  leads: 'bg-[var(--gg-rose)]/10 text-[var(--gg-rose)]',
}
const PLATFORM_COLORS: Record<string, string> = { facebook: '#1877F2', instagram: '#E4405F', twitter: '#000000', linkedin: '#0A66C2', tiktok: '#000000' }
const PLATFORM_LABELS: Record<string, string> = { facebook: 'fb', instagram: 'ig', twitter: 'X', linkedin: 'in', tiktok: 'tt' }

export function CampaignCard({ campaign, onEdit }: { campaign: MarketingCampaign; onEdit: () => void }) {
  const platforms: string[] = campaign.platforms ? JSON.parse(campaign.platforms) : []
  const spentPercent = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0
  const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'

  return (
    <Card className="border-border/60 hover:border-border cursor-pointer transition-colors" onClick={onEdit}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--gg-rose)]/10 flex items-center justify-center"><Megaphone className="w-4 h-4 text-[var(--gg-rose)]" /></div>
            <div><p className="text-sm font-semibold line-clamp-1">{campaign.name}</p><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[campaign.type] || 'bg-muted text-muted-foreground'}`}>{campaign.type}</span></div>
          </div>
          <StatusBadge variant={STATUS_MAP[campaign.status] || 'neutral'}>{campaign.status}</StatusBadge>
        </div>
        {platforms.length > 0 && (
          <div className="flex gap-1">{platforms.slice(0, 4).map(p => (
            <span key={p} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: PLATFORM_COLORS[p] || '#666' }}>{PLATFORM_LABELS[p] || '?'}</span>
          ))}</div>
        )}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Budget</span><span>${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span></div>
          <Progress value={spentPercent} className="h-1.5" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-xs font-semibold">{(campaign.impressions / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Impressions</p></div>
          <div><p className="text-xs font-semibold">{(campaign.clicks / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Clicks</p></div>
          <div><p className="text-xs font-semibold">{ctr}%</p><p className="text-[10px] text-muted-foreground">CTR</p></div>
        </div>
        {campaign.startDate && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="w-3 h-3" />{new Date(campaign.startDate).toLocaleDateString()} — {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}</div>
        )}
      </CardContent>
    </Card>
  )
}
