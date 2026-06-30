'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { DealStage } from '@/types/admin'

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'lead', label: 'Lead' }, { key: 'qualified', label: 'Qualified' },
  { key: 'proposal', label: 'Proposal' }, { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' }, { key: 'closed_lost', label: 'Closed Lost' },
]
const EMPTY_FORM = { title: '', value: 0, stage: 'lead', clientId: '', erpSystemId: '', probability: 0, expectedCloseDate: '', notes: '' }

export function DealForm({ open, onClose, onSaved, deal }: {
  open: boolean; onClose: () => void; onSaved: () => void; deal?: any
}) {
  const [clients, setClients] = useState<any[]>([])
  const [erps, setErps] = useState<any[]>([])
  const initialForm = useMemo(() => deal
    ? { title: deal.title || '', value: deal.value || 0, stage: deal.stage || 'lead', clientId: deal.clientId || '', erpSystemId: deal.erpSystemId || '', probability: deal.probability || 0, expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '', notes: deal.notes || '' }
    : { ...EMPTY_FORM }
  , [open, deal?.id])
  const [form, setForm] = useState(initialForm)

  useEffect(() => { setForm(initialForm) }, [initialForm])

  useEffect(() => {
    if (open) {
      fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {})
      fetch('/api/erp').then(r => r.json()).then(d => setErps(d.erpSystems || [])).catch(() => {})
    }
  }, [open])

  const handleSubmit = async () => {
    const url = deal ? '/api/deals' : '/api/deals'
    const method = deal ? 'PUT' : 'POST'
    const body = { ...form, ...(deal ? { id: deal.id } : {}) }
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{deal ? 'Edit Deal' : 'Add Deal'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Value (PKR)</Label>
              <Input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Client</Label>
              <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ERP System</Label>
              <Select value={form.erpSystemId} onValueChange={v => setForm({ ...form, erpSystemId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{erps.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Probability: {form.probability}%</Label>
            <Slider value={[form.probability]} onValueChange={v => setForm({ ...form, probability: v[0] })} max={100} step={5} />
          </div>
          <div className="grid gap-2">
            <Label>Expected Close Date</Label>
            <Input type="date" value={form.expectedCloseDate} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
