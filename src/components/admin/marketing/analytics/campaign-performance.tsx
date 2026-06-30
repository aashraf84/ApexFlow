'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, MousePointerClick, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react'
import type { MarketingCampaign } from '@/types/admin'

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{(d.value / 1000).toFixed(0)}K</span>
          <div className="w-full rounded-t-md transition-all" style={{ height: `${(d.value / max) * 100}%`, background: d.color, minHeight: '4px' }} />
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function CampaignPerformance() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])

  useEffect(() => {
    fetch('/api/marketing/campaigns').then(r => r.json()).then(d => setCampaigns(d.campaigns || [])).catch(() => {})
  }, [])

  const totalImpressions = campaigns.reduce((a, c) => a + c.impressions, 0)
  const totalClicks = campaigns.reduce((a, c) => a + c.clicks, 0)
  const totalConversions = campaigns.reduce((a, c) => a + c.conversions, 0)
  const totalSpent = campaigns.reduce((a, c) => a + c.spent, 0)
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
  const costPerConversion = totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : '—'

  const chartData = campaigns.slice(0, 6).map(c => ({
    label: c.name.length > 8 ? c.name.slice(0, 8) + '…' : c.name,
    value: c.impressions,
    color: c.status === 'active' ? 'var(--gg-teal)' : c.status === 'completed' ? 'var(--gg-amber)' : 'var(--muted-foreground)',
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><Eye className="w-8 h-8 text-[var(--gg-teal)]" /><div><p className="text-lg font-bold">{(totalImpressions / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Impressions</p></div></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><MousePointerClick className="w-8 h-8 text-[var(--gg-amber)]" /><div><p className="text-lg font-bold">{(totalClicks / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Clicks</p></div></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="w-8 h-8 text-[var(--gg-rose)]" /><div><p className="text-lg font-bold">{avgCtr}%</p><p className="text-xs text-muted-foreground">CTR</p></div></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><ArrowUpRight className="w-8 h-8 text-[var(--gg-green)]" /><div><p className="text-lg font-bold">{totalConversions}</p><p className="text-xs text-muted-foreground">Conversions</p></div></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><DollarSign className="w-8 h-8 text-[var(--gg-violet)]" /><div><p className="text-lg font-bold">${costPerConversion}</p><p className="text-xs text-muted-foreground">Cost/Conv.</p></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Campaign Impressions</CardTitle></CardHeader>
          <CardContent>{chartData.length > 0 ? <BarChart data={chartData} /> : <p className="text-sm text-muted-foreground text-center py-8">No campaign data</p>}</CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Top Performing Campaigns</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {[...campaigns].sort((a, b) => b.clicks - a.clicks).slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2"><span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span><span className="text-sm font-medium truncate">{c.name}</span></div>
                  <div className="text-xs text-muted-foreground">{(c.impressions / 1000).toFixed(1)}K imp · {c.conversions} conv</div>
                </div>
              ))}
              {campaigns.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No campaigns</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
