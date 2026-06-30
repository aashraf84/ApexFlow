'use client'

import { Megaphone, Pause, Play, Archive, Edit3, Eye, MousePointerClick, TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { MarketingCampaign } from '@/types/admin'

const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  active: 'success', draft: 'neutral', paused: 'warning', completed: 'info', cancelled: 'error',
}
const PLATFORM_COLORS: Record<string, string> = { facebook: '#1877F2', instagram: '#E4405F', twitter: '#000000', linkedin: '#0A66C2', tiktok: '#000000' }
const PLATFORM_LABELS: Record<string, string> = { facebook: 'fb', instagram: 'ig', twitter: 'X', linkedin: 'in', tiktok: 'tt' }

export function CampaignDetail({ campaign }: { campaign: MarketingCampaign }) {
  const platforms: string[] = campaign.platforms ? JSON.parse(campaign.platforms) : []
  const spentPercent = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0
  const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'
  const cpc = campaign.clicks > 0 ? (campaign.spent / campaign.clicks).toFixed(2) : '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--gg-rose)]/10 flex items-center justify-center"><Megaphone className="w-5 h-5 text-[var(--gg-rose)]" /></div>
          <div><h2 className="text-lg font-bold">{campaign.name}</h2><StatusBadge variant={STATUS_MAP[campaign.status] || 'neutral'} size="md">{campaign.status}</StatusBadge></div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Edit3 className="w-4 h-4 mr-1" />Edit</Button>
          {campaign.status === 'active' ? (
            <Button size="sm" variant="outline"><Pause className="w-4 h-4 mr-1" />Pause</Button>
          ) : campaign.status === 'paused' ? (
            <Button size="sm" variant="outline"><Play className="w-4 h-4 mr-1" />Resume</Button>
          ) : null}
          <Button size="sm" variant="outline"><Archive className="w-4 h-4 mr-1" />Archive</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/60"><CardContent className="p-4 text-center"><Eye className="w-5 h-5 mx-auto text-[var(--gg-teal)] mb-1" /><p className="text-lg font-bold">{(campaign.impressions / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Impressions</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 text-center"><MousePointerClick className="w-5 h-5 mx-auto text-[var(--gg-amber)] mb-1" /><p className="text-lg font-bold">{(campaign.clicks / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Clicks</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 text-center"><TrendingUp className="w-5 h-5 mx-auto text-[var(--gg-rose)] mb-1" /><p className="text-lg font-bold">{ctr}%</p><p className="text-xs text-muted-foreground">CTR</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 text-center"><DollarSign className="w-5 h-5 mx-auto text-[var(--gg-green)] mb-1" /><p className="text-lg font-bold">{campaign.conversions}</p><p className="text-xs text-muted-foreground">Conversions</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 text-center"><DollarSign className="w-5 h-5 mx-auto text-[var(--gg-violet)] mb-1" /><p className="text-lg font-bold">${cpc}</p><p className="text-xs text-muted-foreground">Cost/Click</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Budget & Spend</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Spent</span><span className="font-medium">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span></div>
            <Progress value={spentPercent} className="h-2" />
            {platforms.length > 0 && (
              <div className="pt-2 space-y-1">
                <p className="text-xs text-muted-foreground">Platform Breakdown</p>
                <div className="flex gap-2">{platforms.map(p => (
                  <span key={p} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: PLATFORM_COLORS[p] || '#666' }}>{PLATFORM_LABELS[p] || '?'}</span>
                ))}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Posts Timeline</CardTitle></CardHeader>
          <CardContent>
            {campaign.posts && campaign.posts.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {campaign.posts.map(post => (
                  <div key={post.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/60">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: PLATFORM_COLORS[post.platform] || '#666' }}>{PLATFORM_LABELS[post.platform] || '?'}</span>
                    <p className="text-xs flex-1 truncate">{post.content}</p>
                    <StatusBadge variant={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'info' : 'neutral'} size="sm">{post.status}</StatusBadge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No posts yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
