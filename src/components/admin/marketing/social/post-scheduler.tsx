'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { CalendarDays, Clock, X, Edit3 } from 'lucide-react'
import type { SocialPost } from '@/types/admin'

const PLATFORM_COLORS: Record<string, string> = { facebook: '#1877F2', instagram: '#E4405F', twitter: '#000000', linkedin: '#0A66C2', tiktok: '#000000' }
const PLATFORM_LABELS: Record<string, string> = { facebook: 'fb', instagram: 'ig', twitter: 'X', linkedin: 'in', tiktok: 'tt' }
const POST_STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  published: 'success', scheduled: 'info', draft: 'neutral', failed: 'error',
}

export function PostScheduler({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<SocialPost[]>([])

  useEffect(() => {
    fetch('/api/marketing/posts').then(r => r.json()).then(d => setPosts((d.posts || []).filter((p: SocialPost) => p.status === 'scheduled'))).catch(() => {})
  }, [refreshKey])

  const handleCancel = async (id: string) => {
    await fetch('/api/marketing/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'cancel' }),
    })
    setPosts(p => p.filter(x => x.id !== id))
  }

  const grouped = posts.reduce<Record<string, SocialPost[]>>((acc, p) => {
    const date = p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Unscheduled'
    acc[date] = acc[date] || []; acc[date].push(p); return acc
  }, {})

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4" />Scheduled Posts</CardTitle></CardHeader>
      <CardContent>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No scheduled posts</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{date}</p>
                <div className="space-y-2">
                  {items.map(post => (
                    <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-border transition-colors">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: PLATFORM_COLORS[post.platform] || '#666' }}>{PLATFORM_LABELS[post.platform] || '?'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{post.content}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          <StatusBadge variant={POST_STATUS_MAP[post.status] || 'neutral'} size="sm">{post.status}</StatusBadge>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="w-7 h-7"><Edit3 className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-[var(--gg-rose)]" onClick={() => handleCancel(post.id)}><X className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
