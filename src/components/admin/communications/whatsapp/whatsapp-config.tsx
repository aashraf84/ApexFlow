'use client'

import { useState } from 'react'
import { Save, Plug, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function WhatsAppConfig() {
  const [form, setForm] = useState({
    phoneNumber: '', businessName: 'ApexFlow', apiToken: '',
    webhookVerifyToken: '', phoneNumberId: '', businessId: '',
  })
  const [connected, setConnected] = useState(false)
  const [testing, setTesting] = useState(false)

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleConnect = async () => {
    setTesting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setConnected(true); setTesting(false)
  }

  return (
    <Card className="border-border/60 max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">WhatsApp Business API</CardTitle>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${
            connected
              ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20'
              : 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />{connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="+92 300 0000000" value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>API Token</Label>
            <Input type="password" placeholder="EAAx..." value={form.apiToken} onChange={(e) => update('apiToken', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Webhook Verify Token</Label>
            <Input placeholder="verify_token" value={form.webhookVerifyToken} onChange={(e) => update('webhookVerifyToken', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number ID</Label>
            <Input placeholder="1234567890" value={form.phoneNumberId} onChange={(e) => update('phoneNumberId', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Business ID</Label>
            <Input placeholder="9876543210" value={form.businessId} onChange={(e) => update('businessId', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Button variant="outline" onClick={() => setConnected(false)} className="gap-1.5 text-[var(--gg-rose)]">
              <Unplug className="w-4 h-4" />Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={testing} className="gap-1.5 bg-[#25D366] hover:bg-[#25D366]/90">
              <Plug className="w-4 h-4" />{testing ? 'Connecting...' : 'Connect'}
            </Button>
          )}
          <Button variant="outline" className="gap-1.5"><Save className="w-4 h-4" />Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}
