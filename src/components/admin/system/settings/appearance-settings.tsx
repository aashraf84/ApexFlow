'use client'

import { useState } from 'react'
import { Save, Upload, Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AppearanceSettings() {
  const [theme, setTheme] = useState('system')
  const [primaryColor, setPrimaryColor] = useState('#10b981')
  const [sidebarStyle, setSidebarStyle] = useState('expanded')

  const colorOptions = [
    { label: 'Emerald', value: '#10b981' }, { label: 'Teal', value: '#14b8a6' },
    { label: 'Rose', value: '#f43f5e' }, { label: 'Amber', value: '#f59e0b' },
    { label: 'Violet', value: '#8b5cf6' },
  ]

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

        <Button className="gap-1.5"><Save className="w-4 h-4" /> Save Appearance</Button>
      </CardContent>
    </Card>
  )
}
