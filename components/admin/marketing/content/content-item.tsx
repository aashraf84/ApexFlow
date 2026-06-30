'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Edit3, CheckCircle, CalendarDays, FileText } from 'lucide-react'
import type { ContentItem as ContentItemType } from '@/types/admin'

const TYPE_ICONS: Record<string, string> = { blog: '📝', social: '📱', email: '📧', video: '🎬', graphic: '🎨', infographic: '📊', whitepaper: '📄' }
const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  idea: 'neutral', draft: 'warning', review: 'info', approved: 'success', scheduled: 'info', published: 'success',
}
const TYPE_COLORS: Record<string, string> = {
  blog: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)]', social: 'bg-[var(--gg-rose)]/10 text-[var(--gg-rose)]',
  email: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)]', video: 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)]',
  graphic: 'bg-[var(--gg-cyan)]/10 text-[var(--gg-cyan)]',
}

export function ContentItem({ item }: { item: ContentItemType }) {
  const platforms: string[] = item.platforms ? JSON.parse(item.platforms) : []

  return (
    <Card className="border-border/60 hover:border-border transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TYPE_ICONS[item.type] || <FileText className="w-4 h-4" />}</span>
            <div><p className="text-sm font-semibold line-clamp-1">{item.title}</p><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type] || 'bg-muted text-muted-foreground'}`}>{item.type}</span></div>
          </div>
          <StatusBadge variant={STATUS_MAP[item.status] || 'neutral'}>{item.status}</StatusBadge>
        </div>
        {platforms.length > 0 && <div className="flex gap-1">{platforms.slice(0, 3).map(p => <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted capitalize">{p}</span>)}</div>}
        {item.scheduledAt && <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><CalendarDays className="w-3 h-3" />{new Date(item.scheduledAt).toLocaleDateString()}</div>}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1"><Edit3 className="w-3 h-3 mr-1" />Edit</Button>
          {item.status === 'review' && <Button size="sm" className="h-7 text-xs flex-1"><CheckCircle className="w-3 h-3 mr-1" />Approve</Button>}
          {item.status === 'approved' && <Button size="sm" className="h-7 text-xs flex-1"><CalendarDays className="w-3 h-3 mr-1" />Schedule</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
