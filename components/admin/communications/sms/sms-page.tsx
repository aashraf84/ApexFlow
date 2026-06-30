'use client'

import { useState } from 'react'
import { Smartphone, Send, History, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { SmsCompose } from './sms-compose'
import { SmsProvider } from './sms-provider'

const MOCK_HISTORY = [
  { id: '1', to: '+92 300 1234567', body: 'Your order #1042 has been confirmed.', status: 'delivered', time: '1 hr ago' },
  { id: '2', to: '+92 301 9876543', body: 'Payment of PKR 15,000 received. Thank you!', status: 'delivered', time: '3 hrs ago' },
  { id: '3', to: '+92 312 5551234', body: 'Your license expires in 3 days. Please renew.', status: 'sent', time: '5 hrs ago' },
  { id: '4', to: '+92 333 7778899', body: 'Welcome to ApexFlow! Your account is ready.', status: 'delivered', time: '1 day ago' },
  { id: '5', to: '+92 345 1112233', body: 'Ticket #782 has been resolved.', status: 'failed', time: '2 days ago' },
]

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  delivered: 'success', sent: 'warning', failed: 'error', pending: 'neutral',
}

export function SmsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="SMS Management" description="Send SMS messages and manage provider settings" />

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose" className="gap-1.5"><Send className="w-4 h-4" />Compose</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><History className="w-4 h-4" />History</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><Settings className="w-4 h-4" />Provider</TabsTrigger>
        </TabsList>

        <TabsContent value="compose"><SmsCompose /></TabsContent>

        <TabsContent value="history">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {MOCK_HISTORY.map((sms) => (
                <div key={sms.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                  <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{sms.to}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{sms.body}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                      sms.status === 'delivered' ? 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20'
                      : sms.status === 'sent' ? 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20'
                      : sms.status === 'failed' ? 'bg-[var(--gg-rose)]/10 text-[var(--gg-rose)] border-[var(--gg-rose)]/20'
                      : 'bg-muted text-muted-foreground border-border'
                    }`}>{sms.status}</span>
                    <span className="text-[10px] text-muted-foreground">{sms.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings"><SmsProvider /></TabsContent>
      </Tabs>
    </div>
  )
}
