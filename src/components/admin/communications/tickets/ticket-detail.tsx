'use client'

import { useState } from 'react'
import { X, Send, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Ticket {
  id: string; number: string; subject: string; client: string; priority: string;
  status: string; assignedTo: string | null; created: string; sla: string
}

const PRIORITY_VARIANT: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'neutral',
}
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  open: 'warning', in_progress: 'info', waiting_client: 'neutral', resolved: 'success', closed: 'success',
}

const MOCK_RESPONSES = [
  { id: 'r1', author: 'Ali Khan', isInternal: false, body: 'We\'re seeing sync failures with the SAP connector. It started this morning around 9 AM.', time: 'Jan 15, 10:30 AM' },
  { id: 'r2', author: 'Sara Ahmed', isInternal: false, body: 'I\'ve checked the logs — it looks like the SAP API endpoint is returning 503 errors. Let me escalate this.', time: 'Jan 15, 10:45 AM' },
  { id: 'r3', author: 'Sara Ahmed', isInternal: true, body: 'Internal note: SAP team confirmed they\'re doing maintenance on their API servers today. ETA for fix: 2 PM.', time: 'Jan 15, 11:00 AM' },
  { id: 'r4', author: 'Ali Khan', isInternal: false, body: 'Thanks for the update. We\'ll wait for the fix. Any workaround in the meantime?', time: 'Jan 15, 11:15 AM' },
]

interface TicketDetailProps {
  ticket: Ticket
  open: boolean
  onClose: () => void
}

export function TicketDetail({ ticket, open, onClose }: TicketDetailProps) {
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const handleReply = async () => {
    if (!reply.trim()) return
    try {
      await fetch('/api/communications/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, body: reply, isInternal }),
      })
      setReply('')
    } catch { /* error handled */ }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-mono">{ticket.number}</SheetTitle>
          </div>
          <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <StatusBadge variant={PRIORITY_VARIANT[ticket.priority] || 'neutral'} size="sm">{ticket.priority}</StatusBadge>
            <StatusBadge variant={STATUS_VARIANT[ticket.status] || 'neutral'} size="sm">{ticket.status.replace('_', ' ')}</StatusBadge>
          </div>
        </SheetHeader>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Client:</span><span className="text-foreground font-medium">{ticket.client}</span></div>
          <div className="flex justify-between"><span>Assigned To:</span><span className="text-foreground font-medium">{ticket.assignedTo || 'Unassigned'}</span></div>
          <div className="flex justify-between"><span>Created:</span><span>{ticket.created}</span></div>
          <div className="flex justify-between"><span>SLA:</span><span className={ticket.sla === 'Met' ? 'text-[var(--gg-green)]' : 'text-[var(--gg-amber)]'}>{ticket.sla}</span></div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Conversation</p>
          {MOCK_RESPONSES.map((r) => (
            <div key={r.id} className={`rounded-lg p-3 ${r.isInternal ? 'bg-[var(--gg-amber)]/5 border border-[var(--gg-amber)]/20' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold">{r.author}</span>
                {r.isInternal && <Badge variant="outline" className="text-[9px] px-1 py-0 text-[var(--gg-amber)] border-[var(--gg-amber)]/30">Internal Note</Badge>}
                <span className="text-[10px] text-muted-foreground ml-auto">{r.time}</span>
              </div>
              <p className="text-sm text-foreground/90">{r.body}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch id="internal-toggle" checked={isInternal} onCheckedChange={setIsInternal} />
            <Label htmlFor="internal-toggle" className="text-xs text-muted-foreground">Internal Note</Label>
          </div>
          <Textarea placeholder={isInternal ? 'Write an internal note...' : 'Type your reply...'} rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
          <Button onClick={handleReply} disabled={!reply.trim()} className="w-full gap-1.5" size="sm">
            {isInternal ? <StickyNote className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {isInternal ? 'Add Internal Note' : 'Send Reply'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
