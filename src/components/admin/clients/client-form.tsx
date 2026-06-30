'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const INDUSTRIES = ['Technology', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Hospitality', 'Finance', 'Real Estate', 'Logistics', 'Other']
const EMPTY_FORM = { companyName: '', contactPerson: '', email: '', phone: '', address: '', city: '', country: '', industry: '', erpSystemId: '', status: 'trial', notes: '' }

interface ErpOption { id: string; name: string; slug: string }

export function ClientForm({ open, onClose, onSaved, client }: {
  open: boolean; onClose: () => void; onSaved: () => void
  client?: any
}) {
  const [erps, setErps] = useState<ErpOption[]>([])
  const initialForm = useMemo(() => client
    ? { companyName: client.companyName || '', contactPerson: client.contactPerson || '', email: client.email || '', phone: client.phone || '', address: client.address || '', city: client.city || '', country: client.country || '', industry: client.industry || '', erpSystemId: client.erpSystemId || '', status: client.status || 'trial', notes: client.notes || '' }
    : { ...EMPTY_FORM }
  , [open, client?.id])
  const [form, setForm] = useState(initialForm)

  useEffect(() => { setForm(initialForm) }, [initialForm])

  useEffect(() => {
    if (open) {
      fetch('/api/erp').then(r => r.json()).then(d => setErps(d.erpSystems || [])).catch(() => {})
    }
  }, [open])

  const handleSubmit = async () => {
    const url = client ? `/api/clients/${client.id}` : '/api/clients'
    const method = client ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="cn">Company Name *</Label>
            <Input id="cn" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cp">Contact Person *</Label>
            <Input id="cp" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="em">Email *</Label>
              <Input id="em" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ph">Phone</Label>
              <Input id="ph" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ad">Address</Label>
            <Input id="ad" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ci">City</Label>
              <Input id="ci" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="co">Country</Label>
              <Input id="co" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ERP System</Label>
              <Select value={form.erpSystemId} onValueChange={v => setForm({ ...form, erpSystemId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{erps.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nt">Notes</Label>
            <Textarea id="nt" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.companyName || !form.contactPerson || !form.email}>
              {client ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
