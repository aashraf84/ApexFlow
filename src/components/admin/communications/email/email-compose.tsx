'use client'

import { useState } from 'react'
import { Send, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TEMPLATES = [
  { id: '', name: 'No template' },
  { id: '1', name: 'Welcome Email' },
  { id: '2', name: 'Invoice Notification' },
  { id: '3', name: 'License Expiry' },
  { id: '5', name: 'Support Ticket Update' },
]

const VARIABLES = ['name', 'company', 'invoice_number', 'amount', 'due_date', 'ticket_id', 'status']

interface EmailComposeProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EmailCompose({ open: controlledOpen, onOpenChange }: EmailComposeProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [template, setTemplate] = useState('')
  const [sending, setSending] = useState(false)

  const insertVariable = (v: string) => {
    setBody((prev) => prev + `{{${v}}}`)
  }

  const handleSend = async () => {
    setSending(true)
    try {
      await fetch('/api/communications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, templateId: template || null }),
      })
      setTo(''); setSubject(''); setBody(''); setTemplate('')
      setIsOpen(false)
    } finally { setSending(false) }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Send className="w-4 h-4" />Compose Email</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Compose Email</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-to">To</Label>
            <Input id="email-to" placeholder="recipient@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input id="email-subject" placeholder="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Body</Label>
              <div className="flex items-center gap-1 flex-wrap">
                {VARIABLES.slice(0, 4).map((v) => (
                  <button key={v} onClick={() => insertVariable(v)} className="text-[10px] bg-muted hover:bg-muted/80 px-1.5 py-0.5 rounded font-mono transition-colors">{`{{${v}}}`}</button>
                ))}
              </div>
            </div>
            <Textarea placeholder="Write your email..." rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending || !to || !subject} className="gap-1.5">
              <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
