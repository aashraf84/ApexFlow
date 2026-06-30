'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Mail, MessageCircle, Smartphone, TicketCheck, Send, Plus, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatsCard } from '@/components/admin/shared/stats-card'
import { StatusBadge } from '@/components/admin/shared/status-badge'

const MOCK_MESSAGES = [
  { id: '1', channel: 'email', from: 'Ali Khan', preview: 'Re: Invoice #1042 — Payment confirmation', time: '2 min ago', unread: true },
  { id: '2', channel: 'whatsapp', from: 'Sara Ahmed', preview: 'Hi, need help with ERP setup', time: '15 min ago', unread: true },
  { id: '3', channel: 'sms', from: '+92 300 1234567', preview: 'Order confirmed. Tracking: PK12345', time: '1 hr ago', unread: false },
  { id: '4', channel: 'email', from: 'Support Bot', preview: 'Ticket #782 resolved and closed', time: '3 hrs ago', unread: false },
  { id: '5', channel: 'whatsapp', from: 'Usman Malik', preview: 'Thanks for the quick response!', time: '5 hrs ago', unread: false },
]

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  sms: <Smartphone className="w-4 h-4" />,
}

const CHANNEL_COLORS: Record<string, string> = {
  email: 'bg-blue-500/10 text-blue-600',
  whatsapp: 'bg-[#25D366]/10 text-[#25D366]',
  sms: 'bg-teal-500/10 text-teal-600',
}

export function CommunicationsOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/communications/email')
      const json = await res.json()
      setStats(json.stats || null)
    } catch { setStats(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <PageHeader title="Communications Hub" description="Manage all communication channels from one place"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/admin/communications/email"><Mail className="w-4 h-4" />Compose Email</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/admin/communications/sms"><Smartphone className="w-4 h-4" />Send SMS</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/admin/communications/tickets"><TicketCheck className="w-4 h-4" />View Tickets</Link>
            </Button>
          </div>
        } />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={<Mail className="w-5 h-5 text-blue-600" />} label="Emails Sent Today" value={stats?.emailsSent || 47} change={12} changeLabel="vs yesterday" iconBg="bg-blue-500/10" />
          <StatsCard icon={<MessageCircle className="w-5 h-5 text-[#25D366]" />} label="WhatsApp Messages" value={stats?.whatsappMessages || 128} change={8} changeLabel="vs yesterday" iconBg="bg-[#25D366]/10" />
          <StatsCard icon={<Smartphone className="w-5 h-5 text-teal-600" />} label="SMS Sent" value={stats?.smsSent || 34} change={-3} changeLabel="vs yesterday" iconBg="bg-teal-500/10" />
          <StatsCard icon={<TicketCheck className="w-5 h-5 text-[var(--gg-amber)]" />} label="Open Tickets" value={stats?.openTickets || 15} change={5} changeLabel="vs last week" iconBg="bg-[var(--gg-amber)]/10" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Channel Status</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { name: 'Email (SMTP)', icon: <Mail className="w-4 h-4" />, connected: true, color: 'blue' },
              { name: 'WhatsApp Business', icon: <MessageCircle className="w-4 h-4" />, connected: true, color: '#25D366' },
              { name: 'SMS (Twilio)', icon: <Smartphone className="w-4 h-4" />, connected: false, color: 'teal' },
            ].map((ch) => (
              <div key={ch.name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2">
                  <span style={{ color: ch.color }}>{ch.icon}</span>
                  <span className="text-sm font-medium">{ch.name}</span>
                </div>
                <StatusBadge variant={ch.connected ? 'success' : 'warning'} size="sm">{ch.connected ? 'Connected' : 'Disconnected'}</StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Messages</CardTitle>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {MOCK_MESSAGES.map((msg) => (
                <div key={msg.id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${CHANNEL_COLORS[msg.channel]}`}>
                    {CHANNEL_ICONS[msg.channel]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{msg.from}</span>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
