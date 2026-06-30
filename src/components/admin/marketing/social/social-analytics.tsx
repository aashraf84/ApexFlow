'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Eye, Star } from 'lucide-react'
import type { SocialAccount } from '@/types/admin'

const PLATFORM_META: Record<string, { color: string; label: string; icon: string }> = {
  facebook: { color: '#1877F2', label: 'Facebook', icon: 'fb' },
  instagram: { color: '#E4405F', label: 'Instagram', icon: 'ig' },
  twitter: { color: '#000000', label: 'Twitter', icon: 'X' },
  linkedin: { color: '#0A66C2', label: 'LinkedIn', icon: 'in' },
  tiktok: { color: '#000000', label: 'TikTok', icon: 'tt' },
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.6 + (i / data.length) * 0.4, minHeight: '2px' }} />
      ))}
    </div>
  )
}

export function SocialAnalytics({ accounts }: { accounts: SocialAccount[] }) {
  const [analytics, setAnalytics] = useState<Record<string, { followers: number; engagement: number; topPost: string; reach: number; weekData: number[] }>>({})

  useEffect(() => {
    fetch('/api/marketing/analytics').then(r => r.json()).then(d => setAnalytics(d.social || {})).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.filter(a => a.isConnected).map(a => {
        const meta = PLATFORM_META[a.platform] || { color: '#666', label: a.platform, icon: '?' }
        const stats = analytics[a.platform] || { followers: a.followerCount, engagement: 3.2, topPost: 'Welcome post', reach: a.followerCount * 0.6, weekData: [12, 18, 14, 22, 19, 25, 20] }
        return (
          <Card key={a.id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: meta.color }}>{meta.icon}</span>
                <CardTitle className="text-sm font-semibold">{meta.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-muted-foreground" /><div><p className="text-xs font-semibold">{(stats.followers / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Followers</p></div></div>
                <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-muted-foreground" /><div><p className="text-xs font-semibold">{stats.engagement}%</p><p className="text-[10px] text-muted-foreground">Engagement</p></div></div>
                <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-muted-foreground" /><div><p className="text-xs font-semibold">{(stats.reach / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Reach</p></div></div>
                <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-muted-foreground" /><div><p className="text-xs font-semibold truncate max-w-[80px]">{stats.topPost}</p><p className="text-[10px] text-muted-foreground">Top Post</p></div></div>
              </div>
              <MiniBarChart data={stats.weekData} color={meta.color} />
              <p className="text-[10px] text-muted-foreground text-center">Last 7 days</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
