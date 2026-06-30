'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Send, CalendarDays, ImagePlus } from 'lucide-react'
import type { SocialAccount } from '@/types/admin'

const PLATFORM_META: Record<string, { color: string; label: string; icon: string; maxChars: number }> = {
  facebook: { color: '#1877F2', label: 'Facebook', icon: 'fb', maxChars: 63206 },
  instagram: { color: '#E4405F', label: 'Instagram', icon: 'ig', maxChars: 2200 },
  twitter: { color: '#000000', label: 'Twitter', icon: 'X', maxChars: 280 },
  linkedin: { color: '#0A66C2', label: 'LinkedIn', icon: 'in', maxChars: 3000 },
  tiktok: { color: '#000000', label: 'TikTok', icon: 'tt', maxChars: 2200 },
}

export function PostComposer({ accounts, onPosted }: { accounts: SocialAccount[]; onPosted: () => void }) {
  const connected = accounts.filter(a => a.isConnected)
  const [selected, setSelected] = useState<string[]>(connected.slice(0, 1).map(a => a.platform))
  const [content, setContent] = useState('')
  const [schedule, setSchedule] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [posting, setPosting] = useState(false)

  const togglePlatform = (p: string) => {
    setSelected(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p])
  }

  const minCharLimit = selected.length > 0 ? Math.min(...selected.map(p => PLATFORM_META[p]?.maxChars || 9999)) : 9999

  const handlePost = async (isSchedule: boolean) => {
    if (!content || selected.length === 0) return
    setPosting(true)
    try {
      await fetch('/api/marketing/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms: selected, scheduledAt: isSchedule ? scheduledAt : null, status: isSchedule ? 'scheduled' : 'published' }),
      })
      setContent(''); setSelected(connected.slice(0, 1).map(a => a.platform)); setSchedule(false); setScheduledAt('')
      onPosted()
    } finally { setPosting(false) }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Compose Post</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Platforms</Label>
          <div className="flex flex-wrap gap-3">{connected.map(a => {
            const meta = PLATFORM_META[a.platform]
            return (
              <label key={a.platform} className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg border transition-colors ${selected.includes(a.platform) ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border'}`}>
                <Checkbox checked={selected.includes(a.platform)} onCheckedChange={() => togglePlatform(a.platform)} />
                <span className="w-4 h-4 rounded-full" style={{ background: meta?.color || '#666' }} />
                <span className="text-xs font-medium">{meta?.label || a.platform}</span>
              </label>
            )
          })}</div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><Label>Content</Label><span className={`text-xs ${content.length > minCharLimit ? 'text-[var(--gg-rose)]' : 'text-muted-foreground'}`}>{content.length}/{minCharLimit}</span></div>
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" rows={4} className="resize-none" />
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/60 text-muted-foreground hover:border-border cursor-pointer transition-colors">
          <ImagePlus className="w-5 h-5" /><span className="text-sm">Add media (images, videos)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Switch checked={schedule} onCheckedChange={setSchedule} /><Label className="text-sm">Schedule</Label></div>
          {schedule && <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-auto" />}
        </div>
        <div className="flex justify-end gap-2">
          {schedule ? (
            <Button onClick={() => handlePost(true)} disabled={posting || !content || !scheduledAt}><CalendarDays className="w-4 h-4 mr-1" />{posting ? 'Scheduling...' : 'Schedule'}</Button>
          ) : (
            <Button onClick={() => handlePost(false)} disabled={posting || !content}><Send className="w-4 h-4 mr-1" />{posting ? 'Posting...' : 'Post Now'}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
