'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const TRIGGERS = [
  { value: 'new_order', label: 'New Order' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'subscription_expiring', label: 'Subscription Expiring' },
  { value: 'ticket_created', label: 'Ticket Created' },
  { value: 'erp_disconnected', label: 'ERP Disconnected' },
]

const CHANNELS = [
  { value: 'in_app', label: 'In-App', color: 'bg-primary/10 text-primary' },
  { value: 'email', label: 'Email', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'sms', label: 'SMS', color: 'bg-teal-500/10 text-teal-600' },
  { value: 'whatsapp', label: 'WhatsApp', color: 'bg-[#25D366]/10 text-[#25D366]' },
  { value: 'all', label: 'All Channels', color: 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)]' },
]

const MOCK_RULES = [
  { id: '1', name: 'Payment Confirmation', trigger: 'payment_received', channel: 'email', active: true },
  { id: '2', name: 'New Order Alert', trigger: 'new_order', channel: 'in_app', active: true },
  { id: '3', name: 'Expiry Warning', trigger: 'subscription_expiring', channel: 'all', active: true },
  { id: '4', name: 'Support Ticket', trigger: 'ticket_created', channel: 'in_app', active: true },
  { id: '5', name: 'ERP Down Alert', trigger: 'erp_disconnected', channel: 'whatsapp', active: false },
  { id: '6', name: 'Payment SMS Receipt', trigger: 'payment_received', channel: 'sms', active: false },
]

export function NotificationRules() {
  const [rules, setRules] = useState(MOCK_RULES)

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const getTriggerLabel = (v: string) => TRIGGERS.find((t) => t.value === v)?.label || v
  const getChannelInfo = (v: string) => CHANNELS.find((c) => c.value === v) || CHANNELS[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rules.length} rules configured</p>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" />Add Rule</Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => {
          const channelInfo = getChannelInfo(rule.channel)
          return (
            <Card key={rule.id} className="border-border/60 hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{rule.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                        {getTriggerLabel(rule.trigger)}
                      </Badge>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${channelInfo.color}`}>
                        {channelInfo.label}
                      </span>
                    </div>
                  </div>
                  <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
