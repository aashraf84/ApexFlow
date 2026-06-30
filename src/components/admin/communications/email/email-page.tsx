'use client'

import { useState } from 'react'
import { Mail, Inbox, Send, FileText, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmailTemplates } from './email-templates'
import { EmailCompose } from './email-compose'
import { SmtpSettings } from './smtp-settings'

const MOCK_INBOX = [
  { id: '1', from: 'Ali Khan', subject: 'Re: Invoice #1042 — Payment confirmation', time: '2 min ago', read: false },
  { id: '2', from: 'Support Bot', subject: 'Ticket #782 resolved and closed', time: '3 hrs ago', read: true },
  { id: '3', from: 'Sara Ahmed', subject: 'ERP integration question', time: '5 hrs ago', read: true },
  { id: '4', from: 'Usman Malik', subject: 'License renewal inquiry', time: '1 day ago', read: true },
]

const MOCK_SENT = [
  { id: '5', to: 'client@techcorp.pk', subject: 'Welcome to ApexFlow!', time: '1 hr ago' },
  { id: '6', to: 'info@alpha.pk', subject: 'Invoice #1042 attached', time: '3 hrs ago' },
  { id: '7', to: 'support@pakretail.com', subject: 'ERP sync completed', time: '1 day ago' },
]

export function EmailPage() {
  const [composeOpen, setComposeOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader title="Email Management" description="Send and manage emails, templates, and SMTP settings"
        actions={<EmailCompose open={composeOpen} onOpenChange={setComposeOpen} />} />

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5"><Inbox className="w-4 h-4" />Inbox</TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5"><Send className="w-4 h-4" />Sent</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><FileText className="w-4 h-4" />Templates</TabsTrigger>
          <TabsTrigger value="smtp" className="gap-1.5"><Settings className="w-4 h-4" />SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {MOCK_INBOX.map((email) => (
                <div key={email.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                  {!email.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!email.read ? 'font-semibold' : 'font-medium'}`}>{email.from}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{email.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {MOCK_SENT.map((email) => (
                <div key={email.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{email.to}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{email.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates"><EmailTemplates /></TabsContent>
        <TabsContent value="smtp"><SmtpSettings /></TabsContent>
      </Tabs>
    </div>
  )
}
