'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * GeneralSettings — the "General" sub-tab under System Settings.
 *
 * Previously this sub-tab had THREE bugs (per the audit worklog):
 *
 *   (1) Form state used camelCase keys (`siteName`, `siteUrl`, `adminEmail`,
 *       `currency`, `timezone`, `dateFormat`) but the seeded site settings
 *       use snake_case (`site_name`, `site_url`, `payment_currency`, etc.).
 *       On save, the route upserted NEW keys with the camelCase name —
 *       polluting the table with duplicate bogus rows that never updated
 *       the real snake_case keys.
 *   (2) GET response shape `{settings:{key:value}}` was spread into state
 *       with `{...prev, ...json.settings}` — so the camelCase form fields
 *       never got populated from the actual DB values; the form always
 *       showed hardcoded defaults.
 *   (3) The PATCH was sent to `/api/admin/settings` whose PATCH handler
 *       force-reset `category:'general'` on every touched key (Bug #3).
 *
 * Now this sub-tab:
 *   - Keeps camelCase keys in local state for ergonomic JSX, but maps them
 *     to the snake_case DB keys (`site_name`, `site_url`, `admin_email`,
 *     `payment_currency`, `site_timezone`, `site_date_format`) before
 *     PATCHing.
 *   - PATCHes `/api/admin/site-settings` with `{ updates: [{ key, value }] }`
 *     (the same endpoint + body shape used by all other settings sub-tabs).
 *     Bug #3 is no longer reachable from this component.
 *   - Hydrates from `/api/admin/site-settings` GET by flattening the grouped
 *     response into a key→value map so the snake_case DB keys actually map
 *     to the camelCase form state.
 */
export function GeneralSettings() {
  const [settings, setSettings] = useState({
    siteName: 'ApexFlow',
    siteUrl: 'https://apexflow.com',
    adminEmail: 'admin@apexflow.com',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    dateFormat: 'DD/MM/YYYY',
  })
  const [saving, setSaving] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch('/api/admin/site-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.settings) return
        // Flatten the grouped `{ [group]: { [key]: { value, description? } } } }`
        // response into a flat key→value map so we can hydrate the form from
        // the snake_case DB keys.
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
        setSettings((prev) => ({
          siteName: flat.site_name ?? prev.siteName,
          siteUrl: flat.site_url ?? prev.siteUrl,
          adminEmail: flat.admin_email ?? prev.adminEmail,
          currency: flat.payment_currency ?? prev.currency,
          timezone: flat.site_timezone ?? prev.timezone,
          dateFormat: flat.site_date_format ?? prev.dateFormat,
        }))
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Map camelCase form state → snake_case DB keys so we never create
      // duplicate bogus rows (Bug #7).
      const updates = [
        { key: 'site_name', value: settings.siteName },
        { key: 'site_url', value: settings.siteUrl },
        { key: 'admin_email', value: settings.adminEmail },
        { key: 'payment_currency', value: settings.currency },
        { key: 'site_timezone', value: settings.timezone },
        { key: 'site_date_format', value: settings.dateFormat },
      ]
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const json = await res.json()
      if (res.ok && (json.updated !== undefined || json.success)) {
        toast.success('General settings saved')
      } else {
        toast.error(json.error || 'Failed to save general settings')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">General Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Site Name</Label><Input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} /></div>
          <div className="space-y-2"><Label>Site URL</Label><Input value={settings.siteUrl} onChange={e => setSettings({ ...settings, siteUrl: e.target.value })} /></div>
          <div className="space-y-2"><Label>Admin Email</Label><Input type="email" value={settings.adminEmail} onChange={e => setSettings({ ...settings, adminEmail: e.target.value })} /></div>
          <div className="space-y-2"><Label>Default Currency</Label>
            <Select value={settings.currency} onValueChange={v => setSettings({ ...settings, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem><SelectItem value="USD">USD - US Dollar</SelectItem><SelectItem value="EUR">EUR - Euro</SelectItem><SelectItem value="GBP">GBP - British Pound</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Timezone</Label>
            <Select value={settings.timezone} onValueChange={v => setSettings({ ...settings, timezone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Asia/Karachi">Asia/Karachi (UTC+5)</SelectItem><SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem><SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem><SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Date Format</Label>
            <Select value={settings.dateFormat} onValueChange={v => setSettings({ ...settings, dateFormat: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}
