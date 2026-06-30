'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  DollarSign,
  FileText,
  CreditCard,
  Package,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
  Search,
  TrendingUp,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientOption {
  id: string
  name: string
  company: string | null
}

interface InvoiceRecord {
  id: string
  number: string
  clientId: string
  amount: number
  tax: number
  total: number
  status: string
  dueDate: string
  items: string
  notes: string | null
  paidAt: string | null
  createdAt: string
  client: { id: string; name: string; company: string | null }
}

interface PaymentRecord {
  id: string
  invoiceId: string | null
  clientId: string
  amount: number
  method: string
  status: string
  transactionId: string | null
  notes: string | null
  createdAt: string
  client: { id: string; name: string; company: string | null } | null
  invoice: { id: string; number: string } | null
}

interface PackageRecord {
  id: string
  name: string
  description: string | null
  price: number
  billingCycle: string
  features: string
  isActive: boolean
  createdAt: string
}

interface SubscriptionRecord {
  id: string
  clientId: string
  packageId: string
  status: string
  startDate: string
  endDate: string | null
  createdAt: string
  client: { id: string; name: string; company: string | null }
  package: { id: string; name: string; price: number; billingCycle: string }
}

// ─── Badge Helpers ──────────────────────────────────────────────────────────

function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; style?: React.CSSProperties; icon: React.ReactNode }> = {
    draft: { color: 'bg-gray-500/15 text-muted-foreground border-gray-500/20', icon: <FileText className="h-3 w-3" /> },
    sent: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', icon: <Clock className="h-3 w-3" /> },
    paid: { color: '', style: { background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' }, icon: <CheckCircle className="h-3 w-3" /> },
    overdue: { color: 'bg-red-500/15 text-red-400 border-red-500/20', icon: <AlertTriangle className="h-3 w-3" /> },
    cancelled: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: <XCircle className="h-3 w-3" /> },
  }
  const c = config[status] || config.draft
  return (
    <Badge variant="outline" className={`${c.color} gap-1`} style={c.style}>
      {c.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; style?: React.CSSProperties }> = {
    pending: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    completed: { color: '', style: { background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' } },
    failed: { color: 'bg-red-500/15 text-red-400 border-red-500/20' },
    refunded: { color: 'bg-gray-500/15 text-muted-foreground border-gray-500/20' },
  }
  const c = config[status] || config.pending
  return (
    <Badge variant="outline" className={`${c.color}`} style={c.style}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; style?: React.CSSProperties }> = {
    active: { color: '', style: { background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' } },
    paused: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    cancelled: { color: 'bg-red-500/15 text-red-400 border-red-500/20' },
    expired: { color: 'bg-gray-500/15 text-muted-foreground border-gray-500/20' },
  }
  const c = config[status] || config.active
  return (
    <Badge variant="outline" className={`${c.color}`} style={c.style}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// ─── Utility ────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminFinancePage() {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [activeTab, setActiveTab] = useState('invoices')

  // Fetch clients once for dropdowns
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/clients')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setClients(data.data || data)
        }
      } catch { /* ignore */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Finance</h2>
        <p className="text-muted-foreground mt-1">Manage invoices, payments, packages, and subscriptions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]">
            <FileText className="h-4 w-4 mr-1.5" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]">
            <CreditCard className="h-4 w-4 mr-1.5" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="packages" className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]">
            <Package className="h-4 w-4 mr-1.5" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoicesTab clients={clients} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab clients={clients} />
        </TabsContent>
        <TabsContent value="packages">
          <PackagesTab />
        </TabsContent>
        <TabsContent value="subscriptions">
          <SubscriptionsTab clients={clients} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Invoices Tab ───────────────────────────────────────────────────────────

function InvoicesTab({ clients }: { clients: ClientOption[] }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<InvoiceRecord | null>(null)
  const [deleting, setDeleting] = useState<InvoiceRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Form state
  const [form, setForm] = useState({
    number: '',
    clientId: '',
    amount: '',
    tax: '',
    total: '',
    status: 'draft',
    dueDate: '',
    items: '[]',
    notes: '',
  })

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/finance/invoices${params}`)
      if (res.ok) { const j = await res.json(); setInvoices(j.data || j) }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const openCreate = () => {
    setEditing(null)
    setForm({ number: '', clientId: '', amount: '', tax: '', total: '', status: 'draft', dueDate: new Date().toISOString().slice(0, 10), items: '[]', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (inv: InvoiceRecord) => {
    setEditing(inv)
    setForm({
      number: inv.number,
      clientId: inv.clientId,
      amount: String(inv.amount),
      tax: String(inv.tax),
      total: String(inv.total),
      status: inv.status,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '',
      items: inv.items || '[]',
      notes: inv.notes || '',
    })
    setDialogOpen(true)
  }

  const autoCalcTotal = () => {
    const a = parseFloat(form.amount) || 0
    const t = parseFloat(form.tax) || 0
    setForm(f => ({ ...f, total: String(a + t) }))
  }

  const handleSave = async () => {
    if (!form.clientId) { toast.error('Please select a client'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount) || 0,
        tax: parseFloat(form.tax) || 0,
        total: parseFloat(form.total) || (parseFloat(form.amount) || 0) + (parseFloat(form.tax) || 0),
      }

      if (editing) {
        const res = await fetch(`/api/finance/invoices/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Invoice updated')
      } else {
        const res = await fetch('/api/finance/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Invoice created')
      }
      setDialogOpen(false)
      fetchInvoices()
    } catch {
      toast.error('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      const res = await fetch(`/api/finance/invoices/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Invoice deleted')
      fetchInvoices()
    } catch {
      toast.error('Failed to delete invoice')
    } finally {
      setDeleteDialogOpen(false)
      setDeleting(null)
    }
  }

  const markAsPaid = async (inv: InvoiceRecord) => {
    try {
      const res = await fetch(`/api/finance/invoices/${inv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsPaid: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Invoice marked as paid')
      fetchInvoices()
    } catch {
      toast.error('Failed to mark as paid')
    }
  }

  // Stats
  const totalAmount = invoices.reduce((s, i) => s + i.total, 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  const filtered = invoices.filter(i => {
    if (!search) return true
    const q = search.toLowerCase()
    return i.number.toLowerCase().includes(q) || i.client?.name?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-xl font-bold" style={{ color: 'var(--gg-vermillion)' }}>{formatCurrency(paidAmount)}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoices</p>
                <p className="text-xl font-bold text-foreground">{invoices.length}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-red-400">{overdueCount}</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-2.5 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-white placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="hover:opacity-90 text-white gap-1.5" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
          <Plus className="h-4 w-4" /> Add Invoice
        </Button>
      </div>

      {/* Table */}
      <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <FileText className="h-10 w-10 mb-3 text-gray-600" />
              <p className="text-sm">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Number</TableHead>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Tax</TableHead>
                    <TableHead className="text-muted-foreground">Total</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Due Date</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(inv => (
                    <TableRow
                      key={inv.id}
                      className="hover:bg-white/5 cursor-pointer"
                      style={{ borderColor: 'var(--gg-separator)' }}
                      onClick={() => openEdit(inv)}
                    >
                      <TableCell className="font-medium text-white">{inv.number}</TableCell>
                      <TableCell className="text-gray-300">{inv.client?.name || '—'}</TableCell>
                      <TableCell className="text-gray-300">{formatCurrency(inv.amount)}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">{formatCurrency(inv.tax)}</TableCell>
                      <TableCell className="text-white font-semibold">{formatCurrency(inv.total)}</TableCell>
                      <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[var(--gg-vermillion)] hover:opacity-80 hover:bg-[color-mix(in_srgb,var(--gg-vermillion)_10%,transparent)]"
                              onClick={() => markAsPaid(inv)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-muted-foreground hover:text-white hover:bg-white/10"
                            onClick={() => openEdit(inv)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => { setDeleting(inv); setDeleteDialogOpen(true) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg" style={{ borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing ? 'Update invoice details' : 'Fill in the details to create a new invoice'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Invoice Number</Label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={form.number}
                  onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Client *</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setTimeout(autoCalcTotal, 0) }}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Tax</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.tax}
                  onChange={e => { setForm(f => ({ ...f, tax: e.target.value })); setTimeout(autoCalcTotal, 0) }}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.total}
                  onChange={e => setForm(f => ({ ...f, total: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Items (JSON)</Label>
              <Textarea
                placeholder='[{"description":"Service","quantity":1,"price":100}]'
                value={form.items}
                onChange={e => setForm(f => ({ ...f, items: e.target.value }))}
                className="text-white font-mono text-xs min-h-[80px]"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="text-white min-h-[60px]"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="hover:opacity-90 text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-950 text-white" style={{ borderColor: 'var(--gg-separator)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete invoice {deleting?.number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Payments Tab ───────────────────────────────────────────────────────────

function PaymentsTab({ clients }: { clients: ClientOption[] }) {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [invoices, setInvoices] = useState<{ id: string; number: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentRecord | null>(null)
  const [deleting, setDeleting] = useState<PaymentRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    invoiceId: '',
    clientId: '',
    amount: '',
    method: 'bank_transfer',
    status: 'pending',
    transactionId: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [payRes, invRes] = await Promise.all([
        fetch('/api/finance/payments'),
        fetch('/api/finance/invoices'),
      ])
      if (payRes.ok) { const j = await payRes.json(); setPayments(j.data || j) }
      if (invRes.ok) {
        const invData = await invRes.json()
        const list = invData.data || invData
        setInvoices(list.map((i: InvoiceRecord) => ({ id: i.id, number: i.number })))
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ invoiceId: '', clientId: '', amount: '', method: 'bank_transfer', status: 'pending', transactionId: '', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (p: PaymentRecord) => {
    setEditing(p)
    setForm({
      invoiceId: p.invoiceId || '',
      clientId: p.clientId,
      amount: String(p.amount),
      method: p.method,
      status: p.status,
      transactionId: p.transactionId || '',
      notes: p.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.clientId) { toast.error('Please select a client'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        invoiceId: form.invoiceId || null,
        amount: parseFloat(form.amount) || 0,
      }

      if (editing) {
        const res = await fetch(`/api/finance/payments/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Payment updated')
      } else {
        const res = await fetch('/api/finance/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Payment recorded')
      }
      setDialogOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to save payment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      const res = await fetch(`/api/finance/payments/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Payment deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete payment')
    } finally {
      setDeleteDialogOpen(false)
      setDeleting(null)
    }
  }

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0)
  const completedAmount = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)

  const filtered = payments.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (p.client?.name || '').toLowerCase().includes(q) ||
      (p.invoice?.number || '').toLowerCase().includes(q) ||
      (p.transactionId || '').toLowerCase().includes(q)
  })

  const methodLabel: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    stripe: 'Stripe',
    cash: 'Cash',
    check: 'Check',
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Payments</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold" style={{ color: 'var(--gg-vermillion)' }}>{formatCurrency(completedAmount)}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Count</p>
                <p className="text-xl font-bold text-foreground">{payments.length}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-white placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Button onClick={openCreate} className="hover:opacity-90 text-white gap-1.5" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
          <Plus className="h-4 w-4" /> Add Payment
        </Button>
      </div>

      {/* Table */}
      <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <CreditCard className="h-10 w-10 mb-3 text-gray-600" />
              <p className="text-sm">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Invoice</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Method</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id} className="hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--gg-separator)' }} onClick={() => openEdit(p)}>
                      <TableCell className="text-white">{p.client?.name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">{p.invoice?.number || '—'}</TableCell>
                      <TableCell className="text-white font-semibold">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-gray-300 hidden md:table-cell">{methodLabel[p.method] || p.method}</TableCell>
                      <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">{formatDate(p.createdAt)}</TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-muted-foreground hover:text-white hover:bg-white/10" onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { setDeleting(p); setDeleteDialogOpen(true) }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg" style={{ borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing ? 'Update payment details' : 'Record a new payment'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Client *</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Invoice</Label>
                <Select value={form.invoiceId} onValueChange={v => setForm(f => ({ ...f, invoiceId: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No invoice</SelectItem>
                    {invoices.map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Method</Label>
                <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Transaction ID</Label>
                <Input
                  placeholder="Optional"
                  value={form.transactionId}
                  onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="text-white min-h-[60px]"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="hover:opacity-90 text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {editing ? 'Update' : 'Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-950 text-white" style={{ borderColor: 'var(--gg-separator)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Packages Tab ───────────────────────────────────────────────────────────

function PackagesTab() {
  const [packages, setPackages] = useState<PackageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PackageRecord | null>(null)
  const [deleting, setDeleting] = useState<PackageRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    features: '[]',
    isActive: true,
  })

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance/packages')
      if (res.ok) { const j = await res.json(); setPackages(j.data || j) }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPackages() }, [fetchPackages])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', billingCycle: 'monthly', features: '[]', isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (pkg: PackageRecord) => {
    setEditing(pkg)
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      price: String(pkg.price),
      billingCycle: pkg.billingCycle,
      features: pkg.features || '[]',
      isActive: pkg.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
      }

      if (editing) {
        const res = await fetch(`/api/finance/packages/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Package updated')
      } else {
        const res = await fetch('/api/finance/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Package created')
      }
      setDialogOpen(false)
      fetchPackages()
    } catch {
      toast.error('Failed to save package')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      const res = await fetch(`/api/finance/packages/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Cannot delete package (may have subscriptions)')
        return
      }
      toast.success('Package deleted')
      fetchPackages()
    } catch {
      toast.error('Failed to delete package')
    } finally {
      setDeleteDialogOpen(false)
      setDeleting(null)
    }
  }

  const cycleLabel: Record<string, string> = { monthly: 'Monthly', yearly: 'Yearly', one_time: 'One-time' }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Packages</p>
                <p className="text-xl font-bold text-foreground">{packages.length}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold" style={{ color: 'var(--gg-vermillion)' }}>{packages.filter(p => p.isActive).length}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg. Price</p>
                <p className="text-xl font-bold text-foreground">
                  {packages.length ? formatCurrency(packages.reduce((s, p) => s + p.price, 0) / packages.length) : '$0.00'}
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <Button onClick={openCreate} className="hover:opacity-90 text-white gap-1.5" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
        </div>
      ) : packages.length === 0 ? (
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Package className="h-10 w-10 mb-3 text-gray-600" />
            <p className="text-sm">No packages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => {
            let featuresList: string[] = []
            try {
              featuresList = JSON.parse(pkg.features || '[]')
            } catch { /* ignore */ }

            return (
              <Card key={pkg.id} className={`relative ${!pkg.isActive ? 'opacity-60' : ''}`} style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm mt-0.5">{pkg.description || 'No description'}</CardDescription>
                    </div>
                    <Badge variant="outline" className={pkg.isActive ? '' : 'bg-gray-500/15 text-muted-foreground border-gray-500/20'} style={pkg.isActive ? { background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' } : undefined}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-2xl font-bold text-foreground">{formatCurrency(pkg.price)}</span>
                    <span className="text-muted-foreground text-sm ml-1">/ {cycleLabel[pkg.billingCycle] || pkg.billingCycle}</span>
                  </div>
                  {featuresList.length > 0 && (
                    <div className="space-y-1.5">
                      {featuresList.slice(0, 5).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--gg-vermillion)' }} />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      {featuresList.length > 5 && (
                        <p className="text-xs text-gray-500">+{featuresList.length - 5} more</p>
                      )}
                    </div>
                  )}
                  <Separator className="bg-white/5" />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-muted-foreground hover:text-white hover:bg-white/10 gap-1.5"
                      onClick={() => openEdit(pkg)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                      onClick={() => { setDeleting(pkg); setDeleteDialogOpen(true) }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Package Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg" style={{ borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Create Package'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing ? 'Update package details' : 'Define a new service package'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Name *</Label>
                <Input
                  placeholder="Package name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Description</Label>
              <Textarea
                placeholder="Package description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="text-white min-h-[60px]"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Billing Cycle</Label>
                <Select value={form.billingCycle} onValueChange={v => setForm(f => ({ ...f, billingCycle: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end gap-3">
                <div className="flex items-center gap-2 pb-1">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                  />
                  <Label className="text-gray-300 text-xs">{form.isActive ? 'Active' : 'Inactive'}</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Features (JSON array)</Label>
              <Textarea
                placeholder='["Feature 1", "Feature 2", "Feature 3"]'
                value={form.features}
                onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                className="text-white font-mono text-xs min-h-[80px]"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="hover:opacity-90 text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-950 text-white" style={{ borderColor: 'var(--gg-separator)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleting?.name}&quot;? This action cannot be undone. Packages with active subscriptions cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Subscriptions Tab ──────────────────────────────────────────────────────

function SubscriptionsTab({ clients }: { clients: ClientOption[] }) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [packages, setPackages] = useState<PackageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionRecord | null>(null)
  const [deleting, setDeleting] = useState<SubscriptionRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    clientId: '',
    packageId: '',
    status: 'active',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [subRes, pkgRes] = await Promise.all([
        fetch('/api/finance/subscriptions'),
        fetch('/api/finance/packages'),
      ])
      if (subRes.ok) { const j = await subRes.json(); setSubscriptions(j.data || j) }
      if (pkgRes.ok) { const j = await pkgRes.json(); setPackages(j.data || j) }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ clientId: '', packageId: '', status: 'active', startDate: new Date().toISOString().slice(0, 10), endDate: '' })
    setDialogOpen(true)
  }

  const openEdit = (sub: SubscriptionRecord) => {
    setEditing(sub)
    setForm({
      clientId: sub.clientId,
      packageId: sub.packageId,
      status: sub.status,
      startDate: sub.startDate ? new Date(sub.startDate).toISOString().slice(0, 10) : '',
      endDate: sub.endDate ? new Date(sub.endDate).toISOString().slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.clientId) { toast.error('Please select a client'); return }
    if (!form.packageId) { toast.error('Please select a package'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        endDate: form.endDate || null,
      }

      if (editing) {
        const res = await fetch(`/api/finance/subscriptions/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Subscription updated')
      } else {
        const res = await fetch('/api/finance/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Subscription created')
      }
      setDialogOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to save subscription')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      const res = await fetch(`/api/finance/subscriptions/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Subscription deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete subscription')
    } finally {
      setDeleteDialogOpen(false)
      setDeleting(null)
    }
  }

  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const price = s.package?.price || 0
      const cycle = s.package?.billingCycle
      return sum + (cycle === 'yearly' ? price / 12 : cycle === 'one_time' ? 0 : price)
    }, 0)

  const filtered = subscriptions.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (s.client?.name || '').toLowerCase().includes(q) ||
      (s.package?.name || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Subscriptions</p>
                <p className="text-xl font-bold" style={{ color: 'var(--gg-vermillion)' }}>{activeCount}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MRR</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(mrr)}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{subscriptions.length}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-white placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Button onClick={openCreate} className="hover:opacity-90 text-white gap-1.5" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
          <Plus className="h-4 w-4" /> Add Subscription
        </Button>
      </div>

      {/* Table */}
      <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <RefreshCw className="h-10 w-10 mb-3 text-gray-600" />
              <p className="text-sm">No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Package</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Start Date</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">End Date</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(sub => (
                    <TableRow key={sub.id} className="hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--gg-separator)' }} onClick={() => openEdit(sub)}>
                      <TableCell className="text-white">{sub.client?.name || '—'}</TableCell>
                      <TableCell>
                        <div>
                          <span className="text-white">{sub.package?.name || '—'}</span>
                          <span className="text-muted-foreground text-xs ml-1.5">{sub.package ? formatCurrency(sub.package.price) : ''}</span>
                        </div>
                      </TableCell>
                      <TableCell><SubscriptionStatusBadge status={sub.status} /></TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">{formatDate(sub.startDate)}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(sub.endDate)}</TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-muted-foreground hover:text-white hover:bg-white/10" onClick={() => openEdit(sub)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { setDeleting(sub); setDeleteDialogOpen(true) }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg" style={{ borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Subscription' : 'Create Subscription'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing ? 'Update subscription details' : 'Assign a package to a client'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Client *</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Package *</Label>
                <Select value={form.packageId} onValueChange={v => setForm(f => ({ ...f, packageId: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="hover:opacity-90 text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-950 text-white" style={{ borderColor: 'var(--gg-separator)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
