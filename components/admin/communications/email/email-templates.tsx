'use client'

import { useState } from 'react'
import { Plus, Copy, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'

const MOCK_TEMPLATES = [
  { id: '1', name: 'Welcome Email', subject: 'Welcome to ApexFlow, {{name}}!', category: 'onboarding', variables: ['name', 'company'], active: true },
  { id: '2', name: 'Invoice Notification', subject: 'Invoice #{{invoice_number}} from ApexFlow', category: 'billing', variables: ['invoice_number', 'amount', 'due_date'], active: true },
  { id: '3', name: 'License Expiry', subject: 'Your license expires on {{expiry_date}}', category: 'billing', variables: ['license_key', 'expiry_date'], active: true },
  { id: '4', name: 'ERP Sync Alert', subject: 'ERP sync {{status}} for {{erp_name}}', category: 'system', variables: ['status', 'erp_name', 'timestamp'], active: false },
  { id: '5', name: 'Support Ticket Update', subject: 'Ticket #{{ticket_id}} — {{status}}', category: 'support', variables: ['ticket_id', 'status', 'assignee'], active: true },
  { id: '6', name: 'Payment Reminder', subject: 'Payment reminder: {{amount}} due', category: 'billing', variables: ['amount', 'due_date', 'invoice_number'], active: true },
]

const CATEGORY_COLORS: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  onboarding: 'success', billing: 'info', system: 'warning', support: 'neutral',
}

export function EmailTemplates() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES)

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{templates.length} templates</p>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" />Create Template</Button>
      </div>

      <div className="space-y-3">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="border-border/60 hover:border-border transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{tpl.name}</span>
                    <StatusBadge variant={CATEGORY_COLORS[tpl.category] || 'neutral'} size="sm">{tpl.category}</StatusBadge>
                    {!tpl.active && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{tpl.subject}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tpl.variables.map((v) => (
                      <code key={v} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{'{{'}{v}{'}}'}</code>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="w-8 h-8"><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8"><Copy className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-[var(--gg-rose)]" onClick={() => handleDelete(tpl.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
