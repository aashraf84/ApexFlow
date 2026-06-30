'use client'

import { useState } from 'react'
import { Save, Plug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SmtpSettings() {
  const [form, setForm] = useState({
    host: 'smtp.gmail.com', port: '587', username: '', password: '',
    fromEmail: 'noreply@apexflow.com', fromName: 'ApexFlow', encryption: 'tls',
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleTest = async () => {
    setTesting(true); setTestResult(null)
    await new Promise((r) => setTimeout(r, 1500))
    setTestResult('Connection successful!')
    setTesting(false)
  }

  return (
    <Card className="border-border/60 max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">SMTP Configuration</CardTitle>
          <StatusBadge variant="success" size="sm">Connected</StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Host</Label>
            <Input value={form.host} onChange={(e) => update('host', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input value={form.port} onChange={(e) => update('port', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={form.username} onChange={(e) => update('username', e.target.value)} placeholder="smtp_username" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>From Email</Label>
            <Input value={form.fromEmail} onChange={(e) => update('fromEmail', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>From Name</Label>
            <Input value={form.fromName} onChange={(e) => update('fromName', e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Encryption</Label>
            <Select value={form.encryption} onValueChange={(v) => update('encryption', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {testResult && <p className="text-sm text-[var(--gg-green)] font-medium">{testResult}</p>}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testing} className="gap-1.5">
            <Plug className="w-4 h-4" />{testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button className="gap-1.5"><Save className="w-4 h-4" />Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ variant, size, children }: { variant: string; size: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    success: 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20',
    warning: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${colors[variant] || 'bg-muted text-muted-foreground'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{children}
    </span>
  )
}
