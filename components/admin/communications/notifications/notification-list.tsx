'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Smartphone, Bell, CreditCard, AlertTriangle, Ticket, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  payment: { icon: <CreditCard className="w-4 h-4" />, color: 'text-[var(--gg-green)] bg-[var(--gg-green)]/10' },
  deal: { icon: <Zap className="w-4 h-4" />, color: 'text-[var(--gg-teal)] bg-[var(--gg-teal)]/10' },
  subscription: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-[var(--gg-amber)] bg-[var(--gg-amber)]/10' },
  ticket: { icon: <Ticket className="w-4 h-4" />, color: 'text-[var(--gg-violet)] bg-[var(--gg-violet)]/10' },
  erp: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-[var(--gg-rose)] bg-[var(--gg-rose)]/10' },
  email: { icon: <Mail className="w-4 h-4" />, color: 'text-blue-600 bg-blue-500/10' },
  whatsapp: { icon: <MessageCircle className="w-4 h-4" />, color: 'text-[#25D366] bg-[#25D366]/10' },
  sms: { icon: <Smartphone className="w-4 h-4" />, color: 'text-teal-600 bg-teal-500/10' },
  system: { icon: <Bell className="w-4 h-4" />, color: 'text-primary bg-primary/10' },
}

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'payment', title: 'Payment Received', body: 'PKR 150,000 from TechCorp Pakistan via Stripe', time: '5 min ago', read: false },
  { id: '2', type: 'ticket', title: 'New Support Ticket', body: 'Ticket #783 created by Ali Khan — ERP sync issue', time: '30 min ago', read: false },
  { id: '3', type: 'subscription', title: 'Subscription Expiring', body: 'Alpha Industries subscription expires in 5 days', time: '2 hrs ago', read: false },
  { id: '4', type: 'erp', title: 'ERP Disconnected', body: 'SAP Business One connection lost for Pak Retail Ltd', time: '3 hrs ago', read: true },
  { id: '5', type: 'deal', title: 'Deal Stage Changed', body: 'Metro Systems moved to Negotiation stage', time: '5 hrs ago', read: true },
  { id: '6', type: 'system', title: 'System Update', body: 'ApexFlow v2.4.1 deployed successfully', time: '1 day ago', read: true },
  { id: '7', type: 'payment', title: 'Payment Failed', body: 'PKR 50,000 from Sindh Trading — JazzCash timeout', time: '1 day ago', read: true },
]

export function NotificationList() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    fetch('/api/communications/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <ScrollArea className="max-h-[500px]">
          {notifications.map((notif) => {
            const typeInfo = TYPE_ICONS[notif.type] || TYPE_ICONS.system
            return (
              <button key={notif.id} onClick={() => markAsRead(notif.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border/40 last:border-0 text-left transition-colors hover:bg-muted/30 ${
                  !notif.read ? 'bg-primary/5' : ''
                }`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5 ${typeInfo.color}`}>
                  {typeInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}>{notif.title}</span>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{notif.time}</span>
              </button>
            )
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
