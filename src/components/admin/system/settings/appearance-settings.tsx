'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Save, Upload, Monitor, Moon, Sun, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * AppearanceSettings — appearance/branding sub-tab under System Settings.
 *
 * Previously the "Save Appearance" button had NO `onClick` handler so no form
 * state was ever persisted (Bug #1). Now the button PATCHes
 * /api/admin/site-settings with `{ updates: [{ key, value }] }`. Values are
 * hydrated from the same GET on mount.
 */
export function AppearanceSettings() {
  const [theme, setTheme] = useState('system')
  const [primaryColor, setPrimaryColor] = useState('#10b981')
  const [sidebarStyle, setSidebarStyle] = useState('expanded')
  const [saving, setSaving] = useState(false)
  const fetched = useRef(false)

  const colorOptions = [
    { label: 'Emerald', value: '#10b981' }, { label: 'Teal', value: '#14b8a6' },
    { label: 'Rose', value: '#f43f5e' }, { label: 'Amber', value: '#f59e0b' },
    { label: 'Violet', value: '#8b5cf6' },
  ]

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
        if (flat.appearance_theme !== undefined) setTheme(flat.appearance_theme)
        if (flat.site_primary_color !== undefined) setPrimaryColor(flat.site_primary_color)
        if (flat.appearance_sidebar_style !== undefined) setSidebarStyle(flat.appearance_sidebar_style)
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: 'appearance_theme', value: theme },
        { key: 'site_primary_color', value: primaryColor },
        { key: 'appearance_sidebar_style', value: sidebarStyle },
      ]
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const json = await res.json()
      if (res.ok && (json.updated !== undefined || json.success)) {
        toast.success('Appearance settings saved')
      } else {
        toast.error(json.error || 'Failed to save appearance settings')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Appearance</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Theme</Label>
          <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={opt.value} />
                <opt.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Primary Color</Label>
          <div className="flex gap-2">
            {colorOptions.map(c => (
              <button key={c.value} onClick={() => setPrimaryColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${primaryColor === c.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c.value }} title={c.label} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Logo</Label>
          <div className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center hover:border-border transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload logo</p>
            <p className="text-xs text-muted-foreground mt-1">SVG, PNG or JPG (max 2MB)</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Sidebar Default</Label>
          <RadioGroup value={sidebarStyle} onValueChange={setSidebarStyle} className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="expanded" /><span className="text-sm">Expanded</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="collapsed" /><span className="text-sm">Collapsed</span></label>
          </RadioGroup>
        </div>

        <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Appearance'}
        </Button>
      </CardContent>
    </Card>
  )
}
