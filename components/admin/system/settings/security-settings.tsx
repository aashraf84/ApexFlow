'use client'

import { useState } from 'react'
import { Save, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const addIp = () => { if (newIp.trim()) { setIpWhitelist([...ipWhitelist, newIp.trim()]); setNewIp('') } }
  const removeIp = (ip: string) => setIpWhitelist(ipWhitelist.filter(i => i !== ip))

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

        <Button className="gap-1.5"><Save className="w-4 h-4" /> Save Security Settings</Button>
      </CardContent>
    </Card>
  )
}
