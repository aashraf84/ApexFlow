'use client'

import { useState } from 'react'
import { Save, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PROVIDERS = [
  { id: 'twilio', name: 'Twilio' },
  { id: 'vonage', name: 'Vonage' },
  { id: 'bulk-sms', name: 'Bulk SMS' },
  { id: 'junaid', name: 'Junaid SMS' },
]

export function SmsProvider() {
  const [provider, setProvider] = useState('twilio')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [senderId, setSenderId] = useState('ApexFlow')
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setTesting(false)
  }

  return (
    <Card className="border-border/60 max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">SMS Provider</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input type="password" placeholder="Enter API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>API Secret</Label>
          <Input type="password" placeholder="Enter API secret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Sender ID</Label>
          <Input placeholder="ApexFlow" value={senderId} onChange={(e) => setSenderId(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testing} className="gap-1.5">
            <Smartphone className="w-4 h-4" />{testing ? 'Sending...' : 'Test SMS'}
          </Button>
          <Button className="gap-1.5"><Save className="w-4 h-4" />Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}
