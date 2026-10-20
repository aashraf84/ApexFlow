'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Save, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

/**
 * EmailSettings — email_* sub-tab under System Settings.
 *
 * Previously the "Save Email Settings" button had NO `onClick` handler so
 * no form state was ever persisted (Bug #1). Now the button PATCHes
 * /api/admin/site-settings with `{ updates: [{ key, value }] }`. Values are
 * hydrated from the same GET on mount.
 */
export function EmailSettings() {
  const [fromName, setFromName] = useState('ApexFlow')
  const [fromEmail, setFromEmail] = useState('noreply@apexflow.com')
  const [footerTemplate, setFooterTemplate] = useState('© 2024 ApexFlow. All rights reserved.')
  const [saving, setSaving] = useState(false)
  const fetched = useRef(false)

  // Hydrate from /api/admin/site-settings (grouped). Flatten into key→value.
  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch('/api/admin/site-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.settings) return
        const flat: Record<string, string> = {}
        for (const groupKey of Object.keys(json.settings)) {
          const bucket = json.settings[groupKey] || {}
          for (const k of Object.keys(bucket)) {
            const entry = bucket[k]
            if (entry && typeof entry === 'object' && 'value' in entry) {
              flat[k] = String(entry.value)
            } else if (typeof entry === 'string') {
              flat[k] = entry
            }
          }
        }
        if (flat.email_from_name !== undefined) setFromName(flat.email_from_name)
        if (flat.email_from_address !== undefined) setFromEmail(flat.email_from_address)
        if (flat.email_footer_template !== undefined) setFooterTemplate(flat.email_footer_template)
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: 'email_from_name', value: fromName },
        { key: 'email_from_address', value: fromEmail },
        { key: 'email_footer_template', value: footerTemplate },
      ]
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const json = await res.json()
      if (res.ok && (json.updated !== undefined || json.success)) {
        toast.success('Email settings saved')
      } else {
        toast.error(json.error || 'Failed to save email settings')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

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

        <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Email Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}
