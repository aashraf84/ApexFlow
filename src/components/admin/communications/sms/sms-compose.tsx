'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SMS_TEMPLATES = [
  { id: '', name: 'No template' },
  { id: '1', name: 'Order Confirmation' },
  { id: '2', name: 'Payment Received' },
  { id: '3', name: 'License Reminder' },
  { id: '4', name: 'Welcome Message' },
]

export function SmsCompose() {
  const [to, setTo] = useState('')
  const [body, setBody] = useState('')
  const [template, setTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const charLimit = 160

  const handleSend = async () => {
    setSending(true)
    try {
      await fetch('/api/communications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body, templateId: template || null }),
      })
      setTo(''); setBody(''); setTemplate('')
    } finally { setSending(false) }
  }

  return (
    <Card className="border-border/60 max-w-xl">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
            <SelectContent>
              {SMS_TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input placeholder="+92 300 1234567" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Message</Label>
            <span className={`text-xs ${body.length > charLimit ? 'text-[var(--gg-rose)] font-medium' : 'text-muted-foreground'}`}>
              {body.length}/{charLimit}
            </span>
          </div>
          <Textarea placeholder="Type your SMS message..." rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={sending || !to || !body || body.length > charLimit} className="gap-1.5">
            <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send SMS'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
