'use client'

import { Mail, Phone, Video, FileText, MessageSquare, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/admin/shared/empty-state'

const TYPE_ICON: Record<string, any> = { email: Mail, call: Phone, meeting: Video, note: FileText, sms: MessageSquare }
const TYPE_COLOR: Record<string, string> = {
  email: 'text-sky-500 bg-sky-500/10', call: 'text-emerald-500 bg-emerald-500/10',
  meeting: 'text-violet-500 bg-violet-500/10', note: 'text-amber-500 bg-amber-500/10',
  sms: 'text-rose-500 bg-rose-500/10',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
}

export function ClientTimeline({ entries }: { entries: any[] }) {

  if (entries.length === 0) {
    return <EmptyState icon={<FileText className="w-6 h-6" />} title="No activity" description="No communication timeline entries yet" actionLabel="Add Note" />
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base">Communication Timeline</CardTitle>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Note
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {entries.map((e: any, i: number) => {
            const Icon = TYPE_ICON[e.type] || FileText
            const color = TYPE_COLOR[e.type] || 'text-muted-foreground bg-muted'
            return (
              <div key={e.id} className="flex gap-3 relative pb-4">
                {i < entries.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                )}
                <div className={`shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-full ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{e.subject || e.type}</p>
                    {e.channel && <Badge variant="outline" className="text-[10px]">{e.channel}</Badge>}
                    {e.direction && <Badge variant="outline" className="text-[10px]">{e.direction}</Badge>}
                  </div>
                  {e.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.body}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(e.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
