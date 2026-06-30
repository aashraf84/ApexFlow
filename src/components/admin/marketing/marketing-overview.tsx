'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Megaphone, Eye, MousePointerClick, Users, Plus, PenSquare, BarChart3, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/admin/shared/stats-card'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface Campaign { id: string; name: string; type: string; status: string; budget: number; spent: number; impressions: number; clicks: number }
interface Platform { id: string; platform: string; handle: string; followerCount: number; isConnected: boolean; lastSyncedAt: string | null }
interface Post { id: string; platform: string; content: string; scheduledAt: string | null; status: string }

const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  active: 'success', draft: 'neutral', paused: 'warning', completed: 'info', cancelled: 'error',
}
const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E4405F', twitter: '#000000', linkedin: '#0A66C2', tiktok: '#000000',
}
const PLATFORM_ICONS: Record<string, string> = {
  facebook: 'fb', instagram: 'ig', twitter: 'X', linkedin: 'in', tiktok: 'tt',
}

export function MarketingOverview() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/marketing/campaigns').then(r => r.json()).catch(() => ({ campaigns: [] })),
      fetch('/api/marketing/social').then(r => r.json()).catch(() => ({ accounts: [] })),
      fetch('/api/marketing/posts').then(r => r.json()).catch(() => ({ posts: [] })),
    ]).then(([c, s, p]) => {
      setCampaigns(c.campaigns || [])
      setPlatforms(s.accounts || [])
      setPosts(p.posts || [])
    })
  }, [])

  const totalImpressions = campaigns.reduce((a, c) => a + c.impressions, 0)
  const totalClicks = campaigns.reduce((a, c) => a + c.clicks, 0)
  const socialReach = platforms.reduce((a, p) => a + p.followerCount, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Megaphone className="w-5 h-5 text-[var(--gg-rose)]" />} label="Active Campaigns" value={activeCampaigns} change={12} iconBg="bg-[var(--gg-rose)]/10" />
        <StatsCard icon={<Eye className="w-5 h-5 text-[var(--gg-teal)]" />} label="Total Impressions" value={(totalImpressions / 1000).toFixed(1) + 'K'} change={8} iconBg="bg-[var(--gg-teal)]/10" />
        <StatsCard icon={<MousePointerClick className="w-5 h-5 text-[var(--gg-amber)]" />} label="Click Rate" value={totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) + '%' : '0%'} change={3} iconBg="bg-[var(--gg-amber)]/10" />
        <StatsCard icon={<Users className="w-5 h-5 text-[var(--gg-violet)]" />} label="Social Reach" value={(socialReach / 1000).toFixed(1) + 'K'} change={5} iconBg="bg-[var(--gg-violet)]/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Active Campaigns</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {campaigns.filter(c => c.status === 'active').slice(0, 3).map(c => (
              <Link key={c.id} href={`/admin/marketing/campaigns?id=${c.id}`} className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:border-border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gg-rose)]/10 flex items-center justify-center"><Megaphone className="w-4 h-4 text-[var(--gg-rose)]" /></div>
                  <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.type} · ${c.budget.toLocaleString()}</p></div>
                </div>
                <StatusBadge variant={STATUS_MAP[c.status] || 'neutral'}>{c.status}</StatusBadge>
              </Link>
            ))}
            {campaigns.filter(c => c.status === 'active').length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No active campaigns</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Connected Platforms</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {platforms.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: PLATFORM_COLORS[p.platform] || '#666' }}>{PLATFORM_ICONS[p.platform] || '?'}</span>
                  <div><p className="text-xs font-medium capitalize">{p.platform}</p><p className="text-[10px] text-muted-foreground">{p.handle}</p></div>
                </div>
                <Badge variant={p.isConnected ? 'default' : 'secondary'} className="text-[10px]">{p.isConnected ? 'Connected' : 'Offline'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Recent Scheduled Posts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {posts.filter(p => p.status === 'scheduled').slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: PLATFORM_COLORS[p.platform] || '#666' }}>{PLATFORM_ICONS[p.platform] || '?'}</span>
                <p className="text-sm flex-1 truncate">{p.content}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString() : '—'}</div>
              </div>
            ))}
            {posts.filter(p => p.status === 'scheduled').length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No scheduled posts</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/marketing/campaigns"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Campaign</Button></Link>
        <Link href="/admin/marketing/social"><Button size="sm" variant="outline"><PenSquare className="w-4 h-4 mr-1" />Compose Post</Button></Link>
        <Link href="/admin/marketing/analytics"><Button size="sm" variant="outline"><BarChart3 className="w-4 h-4 mr-1" />View Analytics</Button></Link>
      </div>
    </div>
  )
}
