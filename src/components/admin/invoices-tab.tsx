'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  FileX2,
  Inbox,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string | null
  erpName: string | null
  type: string
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  amount: number
  tax: number
  discount: number
  totalAmount: number
  currency: string
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

interface Client {
  id: string
  companyName: string
}

interface ErpSystem {
  id: string
  name: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatPKR = (n: number) =>
  `PKR ${n.toLocaleString('en-PK')}`

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [erpSystems, setErpSystems] = useState<ErpSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    erpSystemId: '',
    amount: '',
    tax: '',
    discount: '',
    dueDate: '',
    type: 'subscription',
    notes: '',
  })

  /* ---------- Fetch invoices ---------- */
  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setInvoices(Array.isArray(data.invoices) ? data.invoices : [])
    } catch {
      toast.error('Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- Fetch clients & ERP for dropdowns ---------- */
  const fetchDropdownData = useCallback(async () => {
    try {
      const [clientsRes, erpRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/erp'),
      ])
      if (clientsRes.ok) {
        const cData = await clientsRes.json()
        setClients(Array.isArray(cData.clients) ? cData.clients : [])
      }
      if (erpRes.ok) {
        const eData = await erpRes.json()
        setErpSystems(Array.isArray(eData.erpSystems) ? eData.erpSystems : [])
      }
    } catch {
      /* dropdowns will just be empty */
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
    fetchDropdownData()
  }, [fetchInvoices, fetchDropdownData])

  /* ---------- Filtered list ---------- */
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (inv.invoiceNumber ?? '').toLowerCase().includes(q) ||
      (inv.clientName ?? '').toLowerCase().includes(q)
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  /* ---------- Generate Invoice ---------- */
  const handleGenerate = async () => {
    if (!formData.clientId || !formData.erpSystemId || !formData.amount || !formData.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          erpSystemId: formData.erpSystemId,
          amount: Number(formData.amount),
          tax: formData.tax ? Number(formData.tax) : undefined,
          discount: formData.discount ? Number(formData.discount) : undefined,
          dueDate: formData.dueDate,
          type: formData.type,
          notes: formData.notes || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Invoice generated successfully')
        await fetchInvoices()
      } else {
        toast.error(data.error || 'Failed to generate invoice')
      }
    } catch {
      toast.error('Network error — please try again')
    }
    setSubmitting(false)
    setShowGenerateDialog(false)
    setFormData({
      clientId: '',
      erpSystemId: '',
      amount: '',
      tax: '',
      discount: '',
      dueDate: '',
      type: 'subscription',
      notes: '',
    })
  }

  /* ---------- Action: Mark as Paid ---------- */
  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (res.ok) {
        toast.success('Invoice marked as paid')
        await fetchInvoices()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update invoice')
      }
    } catch {
      toast.error('Network error — please try again')
    }
  }

  /* ---------- Action: Cancel ---------- */
  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (res.ok) {
        toast.success('Invoice cancelled')
        await fetchInvoices()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to cancel invoice')
      }
    } catch {
      toast.error('Network error — please try again')
    }
  }

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 rounded-xl bg-secondary" />
          <Skeleton className="h-10 w-40 rounded-xl bg-secondary" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl bg-secondary" />
          <Skeleton className="h-10 w-40 rounded-xl bg-secondary" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  /* ---------- Main render ---------- */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {invoices.length} total invoice{invoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowGenerateDialog(true)}
          className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl btn-glow"
        >
          <Plus className="w-4 h-4 mr-2" /> Generate Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44 bg-secondary border-border rounded-xl text-foreground">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center"
        >
          <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No invoices found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Generate your first invoice to get started.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden"
        >
          <div className="max-h-[520px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Invoice #</TableHead>
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Due Date</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">ERP</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((inv) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-border hover:bg-accent transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--gg-amber)] shrink-0" />
                          <span className="text-sm font-medium font-mono text-foreground">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.clientName ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {formatPKR(inv.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`capitalize ${statusStyles[inv.status] ?? ''}`}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        {formatDate(inv.dueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {inv.erpName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-card border-border"
                          >
                            {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                              <DropdownMenuItem
                                className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer"
                                onClick={() => handleMarkPaid(inv.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer"
                              onClick={() => toast.success('Download started')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                              <>
                            <DropdownMenuSeparator className="bg-muted" />
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="cursor-pointer"
                                  onClick={() => handleCancel(inv.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Invoice
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Generate Invoice Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Client */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(v) => setFormData({ ...formData, clientId: v })}
              >
                <SelectTrigger className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ERP System */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">ERP System *</Label>
              <Select
                value={formData.erpSystemId}
                onValueChange={(v) => setFormData({ ...formData, erpSystemId: v })}
              >
                <SelectTrigger className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground">
                  <SelectValue placeholder="Select ERP system" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {erpSystems.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Amount (PKR) *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Tax & Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tax</Label>
                <Input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  placeholder="0"
                  className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Discount</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0"
                  className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Due Date *</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="bg-secondary border-border rounded-xl text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowGenerateDialog(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={submitting}
              className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl btn-glow"
            >
              {submitting ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
