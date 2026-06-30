'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

interface LineItem { description: string; qty: number; unitPrice: number }

const EMPTY_ITEM: LineItem = { description: '', qty: 1, unitPrice: 0 }

export function InvoiceGenerator({ open, onClose, onSaved }: {
  open: boolean; onClose: () => void; onSaved: () => void
}) {
  const [clients, setClients] = useState<any[]>([])
  const [erps, setErps] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [erpSystemId, setErpSystemId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tax, setTax] = useState(15)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }])

  useEffect(() => {
    if (open) {
      fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {})
      fetch('/api/erp').then(r => r.json()).then(d => setErps(d.erpSystems || [])).catch(() => {})
    }
  }, [open])

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.unitPrice, 0), [items])
  const taxAmount = useMemo(() => subtotal * (tax / 100), [subtotal, tax])
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount])

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  const handleSubmit = async () => {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, erpSystemId, amount: subtotal, tax, totalAmount: total, dueDate, notes, items, currency: 'PKR', status: 'draft' }),
    })
    onSaved()
    onClose()
    setClientId(''); setErpSystemId(''); setDueDate(''); setTax(15); setNotes(''); setItems([{ ...EMPTY_ITEM }])
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ERP System *</Label>
              <Select value={erpSystemId} onValueChange={setErpSystemId}>
                <SelectTrigger><SelectValue placeholder="Select ERP" /></SelectTrigger>
                <SelectContent>{erps.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Due Date *</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Line Items</Label>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={addItem}><Plus className="w-3 h-3" /> Add Item</Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_60px_100px_32px] gap-2 items-end">
                <Input placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                <Input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} min={1} />
                <Input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} min={0} />
                <Button variant="ghost" size="icon" className="h-9 w-8 text-muted-foreground hover:text-[var(--gg-rose)]" onClick={() => removeItem(idx)} disabled={items.length === 1}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Tax %</Label><Input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} min={0} max={100} /></div>
            <div className="grid gap-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
          </div>
          <Separator />
          <div className="rounded-lg border border-border/60 p-4 space-y-2 bg-muted/30">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax ({tax}%)</span><span>{formatPKR(taxAmount)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold"><span>Total</span><span className="text-lg">{formatPKR(total)}</span></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!clientId || !erpSystemId || !dueDate || subtotal === 0}>Create Invoice</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
