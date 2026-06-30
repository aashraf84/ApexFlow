'use client'

import { useState, useEffect, useRef } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GeneralSettings() {
  const [settings, setSettings] = useState({ siteName: 'ApexFlow', siteUrl: 'https://apexflow.com', adminEmail: 'admin@apexflow.com', currency: 'PKR', timezone: 'Asia/Karachi', dateFormat: 'DD/MM/YYYY' })
  const [saving, setSaving] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(json => { if (json.settings) setSettings(prev => ({ ...prev, ...json.settings })) })
      .catch(() => { /* use defaults */ })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try { await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }) } catch { /* handled */ }
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
        <Button className="gap-1.5" onClick={handleSave} disabled={saving}><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}</Button>
      </CardContent>
    </Card>
  )
}
