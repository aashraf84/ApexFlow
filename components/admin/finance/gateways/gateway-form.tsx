'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const GATEWAY_TYPES = [
  { value: 'stripe', label: 'Stripe' }, { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' }, { value: 'easypaisa', label: 'EasyPaisa' },
  { value: 'raast', label: 'Raast' }, { value: 'paypal', label: 'PayPal' },
]

interface FormState {
  name: string; type: string; isDefault: boolean; isActive: boolean
  stripePk: string; stripeSk: string
  bankName: string; accountName: string; accountNumber: string; iban: string
  merchantId: string; apiKey: string; apiSecret: string
  raastId: string; raastIban: string
  paypalClientId: string; paypalClientSecret: string
}

const EMPTY: FormState = {
  name: '', type: 'stripe', isDefault: false, isActive: true,
  stripePk: '', stripeSk: '', bankName: '', accountName: '', accountNumber: '', iban: '',
  merchantId: '', apiKey: '', apiSecret: '', raastId: '', raastIban: '', paypalClientId: '', paypalClientSecret: '',
}

export function GatewayForm({ open, onClose, onSaved, gateway }: {
  open: boolean; onClose: () => void; onSaved: () => void; gateway: any
}) {
  const getInitial = (): FormState => gateway
    ? { ...EMPTY, name: gateway.label || '', type: gateway.gateway || 'stripe', isDefault: gateway.isDefault || false, isActive: gateway.isActive !== false }
    : { ...EMPTY }

  const [form, setForm] = useState<FormState>(getInitial)
  const prevId = gateway?.id
  if ((gateway && form.name !== (gateway.label || '') && form.type !== (gateway.gateway || 'stripe')) || (!gateway && form.name !== '' && prevId === undefined)) {
    setForm(getInitial())
  }

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    const body: Record<string, unknown> = { label: form.name, gateway: form.type, type: getTypeCategory(form.type), isActive: form.isActive, isDefault: form.isDefault }
    if (form.type === 'stripe') { body.stripePublishableKey = form.stripePk; body.stripeSecretKey = form.stripeSk }
    else if (form.type === 'bank_transfer') { body.bankName = form.bankName; body.accountTitle = form.accountName; body.accountNumber = form.accountNumber; body.iban = form.iban }
    else if (form.type === 'jazzcash' || form.type === 'easypaisa') { body.walletProvider = form.type; body.walletAccount = form.merchantId; body.walletAccountName = form.accountName }
    else if (form.type === 'raast') { body.raastId = form.raastId; body.iban = form.raastIban }
    else if (form.type === 'paypal') { body.paypalClientId = form.paypalClientId; body.paypalClientSecret = form.paypalClientSecret }

    if (gateway) {
      await fetch('/api/gateways', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: gateway.id, ...body }) })
    } else {
      await fetch('/api/gateways', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    onSaved(); onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gateway ? 'Configure Gateway' : 'Add Gateway'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Gateway Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. HBL Corporate Account" /></div>
          <div className="grid gap-2"><Label>Type *</Label>
            <Select value={form.type} onValueChange={v => set('type', v)} disabled={!!gateway}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GATEWAY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between"><Label>Default Gateway</Label><Switch checked={form.isDefault} onCheckedChange={v => set('isDefault', v)} /></div>
          <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} /></div>
          <Separator />

          {form.type === 'stripe' && (
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>Publishable Key</Label><Input value={form.stripePk} onChange={e => set('stripePk', e.target.value)} placeholder="pk_live_..." /></div>
              <div className="grid gap-2"><Label>Secret Key</Label><Input type="password" value={form.stripeSk} onChange={e => set('stripeSk', e.target.value)} placeholder="sk_live_..." /></div>
            </div>
          )}
          {form.type === 'bank_transfer' && (
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>Account Name</Label><Input value={form.accountName} onChange={e => set('accountName', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Account Number</Label><Input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Bank Name</Label><Input value={form.bankName} onChange={e => set('bankName', e.target.value)} /></div>
              <div className="grid gap-2"><Label>IBAN</Label><Input value={form.iban} onChange={e => set('iban', e.target.value)} placeholder="PK36..." /></div>
            </div>
          )}
          {(form.type === 'jazzcash' || form.type === 'easypaisa') && (
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>Merchant ID</Label><Input value={form.merchantId} onChange={e => set('merchantId', e.target.value)} /></div>
              <div className="grid gap-2"><Label>API Key</Label><Input value={form.apiKey} onChange={e => set('apiKey', e.target.value)} /></div>
              <div className="grid gap-2"><Label>API Secret</Label><Input type="password" value={form.apiSecret} onChange={e => set('apiSecret', e.target.value)} /></div>
            </div>
          )}
          {form.type === 'raast' && (
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>RII ID</Label><Input value={form.raastId} onChange={e => set('raastId', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Account IBAN</Label><Input value={form.raastIban} onChange={e => set('raastIban', e.target.value)} placeholder="PK36..." /></div>
            </div>
          )}
          {form.type === 'paypal' && (
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>Client ID</Label><Input value={form.paypalClientId} onChange={e => set('paypalClientId', e.target.value)} /></div>
              <div className="grid gap-2"><Label>Client Secret</Label><Input type="password" value={form.paypalClientSecret} onChange={e => set('paypalClientSecret', e.target.value)} /></div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name}>{gateway ? 'Save Changes' : 'Add Gateway'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getTypeCategory(gw: string) {
  if (gw === 'stripe' || gw === 'paypal') return 'payment_gateway'
  if (gw === 'bank_transfer') return 'bank_account'
  if (gw === 'jazzcash' || gw === 'easypaisa') return 'mobile_wallet'
  if (gw === 'raast') return 'instant_payment'
  return 'payment_gateway'
}
