'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Save, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * SecuritySettings — security_* sub-tab under System Settings.
 *
 * Previously the "Save Security Settings" button had NO `onClick` handler so
 * no form state was ever persisted (Bug #1). Now the button PATCHes
 * /api/admin/site-settings with `{ updates: [{ key, value }] }` mirroring the
 * IntegrationSettings sub-tab. Values are hydrated from the same GET on
 * mount.
 */
export function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [minLength, setMinLength] = useState('8')
  const [requireUppercase, setRequireUppercase] = useState(true)
  const [requireNumbers, setRequireNumbers] = useState(true)
  const [requireSymbols, setRequireSymbols] = useState(false)
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([])
  const [newIp, setNewIp] = useState('')
  const [loginAttempts, setLoginAttempts] = useState('5')
  const [lockoutDuration, setLockoutDuration] = useState('15')
  const [saving, setSaving] = useState(false)
  const fetched = useRef(false)

  // Hydrate from /api/admin/site-settings (grouped by group/category).
  // Flatten the response into a key→value map, then read the security_* keys.
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
        const truthy = (v?: string) => v === 'true' || v === '1'
        if (flat.security_2fa_enabled !== undefined) setTwoFactor(truthy(flat.security_2fa_enabled))
        if (flat.security_session_timeout !== undefined) setSessionTimeout(flat.security_session_timeout)
        if (flat.security_max_login_attempts !== undefined) setLoginAttempts(flat.security_max_login_attempts)
        if (flat.security_lockout_duration !== undefined) setLockoutDuration(flat.security_lockout_duration)
        if (flat.security_ip_whitelist !== undefined) {
          const list = flat.security_ip_whitelist
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          setIpWhitelist(list)
        }
        if (flat.security_password_min_length !== undefined) setMinLength(flat.security_password_min_length)
        if (flat.security_password_require_uppercase !== undefined) setRequireUppercase(truthy(flat.security_password_require_uppercase))
        if (flat.security_password_require_numbers !== undefined) setRequireNumbers(truthy(flat.security_password_require_numbers))
        if (flat.security_password_require_symbols !== undefined) setRequireSymbols(truthy(flat.security_password_require_symbols))
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const addIp = () => { if (newIp.trim()) { setIpWhitelist([...ipWhitelist, newIp.trim()]); setNewIp('') } }
  const removeIp = (ip: string) => setIpWhitelist(ipWhitelist.filter(i => i !== ip))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: 'security_2fa_enabled', value: String(twoFactor) },
        { key: 'security_session_timeout', value: String(sessionTimeout) },
        { key: 'security_max_login_attempts', value: String(loginAttempts) },
        { key: 'security_lockout_duration', value: String(lockoutDuration) },
        { key: 'security_ip_whitelist', value: ipWhitelist.join(',') },
        { key: 'security_password_min_length', value: String(minLength) },
        { key: 'security_password_require_uppercase', value: String(requireUppercase) },
        { key: 'security_password_require_numbers', value: String(requireNumbers) },
        { key: 'security_password_require_symbols', value: String(requireSymbols) },
      ]
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const json = await res.json()
      if (res.ok && (json.updated !== undefined || json.success)) {
        toast.success('Security settings saved')
      } else {
        toast.error(json.error || 'Failed to save security settings')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Security Settings</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Label>Two-Factor Authentication</Label><p className="text-xs text-muted-foreground">Require 2FA for all admin users</p></div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>

        <div className="space-y-2">
          <Label>Session Timeout (minutes)</Label>
          <Input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="w-32" />
          <p className="text-xs text-muted-foreground">Inactive sessions will expire after this duration</p>
        </div>

        <div className="space-y-3">
          <Label>Password Policy</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-2">
            <div className="space-y-2"><Label className="text-xs">Minimum Length</Label><Input type="number" value={minLength} onChange={e => setMinLength(e.target.value)} className="w-24" /></div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2"><Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} /><span className="text-sm">Require uppercase</span></div>
              <div className="flex items-center gap-2"><Switch checked={requireNumbers} onCheckedChange={setRequireNumbers} /><span className="text-sm">Require numbers</span></div>
              <div className="flex items-center gap-2"><Switch checked={requireSymbols} onCheckedChange={setRequireSymbols} /><span className="text-sm">Require symbols</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>IP Whitelist</Label>
          <div className="flex gap-2">
            <Input placeholder="e.g. 192.168.1.0/24" value={newIp} onChange={e => setNewIp(e.target.value)} className="max-w-xs" />
            <Button variant="outline" size="sm" onClick={addIp} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
          </div>
          {ipWhitelist.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ipWhitelist.map(ip => (
                <span key={ip} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">{ip}<button onClick={() => removeIp(ip)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button></span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Login Attempt Limit</Label><Input type="number" value={loginAttempts} onChange={e => setLoginAttempts(e.target.value)} className="w-32" /></div>
          <div className="space-y-2"><Label>Lockout Duration (minutes)</Label><Input type="number" value={lockoutDuration} onChange={e => setLockoutDuration(e.target.value)} className="w-32" /></div>
        </div>

        <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}
