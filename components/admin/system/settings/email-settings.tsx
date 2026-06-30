'use client'

import { useState } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function EmailSettings() {
  const [fromName, setFromName] = useState('ApexFlow')
  const [fromEmail, setFromEmail] = useState('noreply@apexflow.com')
  const [footerTemplate, setFooterTemplate] = useState('© 2024 ApexFlow. All rights reserved.')

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Email Settings</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Default From Name</Label><Input value={fromName} onChange={e => setFromName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Default From Email</Label><Input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} /></div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SMTP Configuration</p>
              <p className="text-xs text-muted-foreground mt-0.5">Configure SMTP servers in Communications → Email</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/admin/communications/email"><ExternalLink className="w-3.5 h-3.5" /> Go to SMTP</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email Footer Template</Label>
          <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" value={footerTemplate} onChange={e => setFooterTemplate(e.target.value)} />
          <p className="text-xs text-muted-foreground">This footer will be appended to all outgoing emails</p>
        </div>

        <Button className="gap-1.5"><Save className="w-4 h-4" /> Save Email Settings</Button>
      </CardContent>
    </Card>
  )
}
