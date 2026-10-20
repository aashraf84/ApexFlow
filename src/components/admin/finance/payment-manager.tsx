'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  RefreshCw,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  Download,
  CreditCard,
  Wallet,
  Banknote,
  Globe,
  Plus,
  Building2,
  FileText,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientInfo {
  id: string
  companyName: string
  contactPerson: string
  name: string | null
  email: string
  company: string | null
}

interface InvoiceInfo {
  id: string
  invoiceNumber: string | null
  number: string | null
  total: number | null
  currency: string | null
}

interface PaymentRecord {
  id: string
  orderId: string | null
  invoiceId: string | null
  clientId: string | null
  amount: number
  currency: string
  method: string
  status: string
  transactionId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  client: ClientInfo | null
  invoice: InvoiceInfo | null
}

interface MonthlyBucket {
  label: string
  year: number
  month: number
  revenue: number
  count: number
}

interface PaymentStats {
  totalRevenue: number
  thisMonthRevenue: number
  successful: number
  failed: number
  pending: number
  refunded: number
  total: number
  byGateway: { gateway: string; count: number; revenue: number }[]
  monthly: MonthlyBucket[]
}

// ─── Badge ───────────────────────────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; style?: React.CSSProperties; icon: React.ReactNode }> = {
    completed: {
      color: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
        color: 'var(--gg-vermillion)',
        borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
      },
      icon: <CheckCircle className="h-3 w-3" />,
    },
    pending: {
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      icon: <Clock className="h-3 w-3" />,
    },
    failed: {
      color: 'bg-red-500/15 text-red-400 border-red-500/20',
      icon: <XCircle className="h-3 w-3" />,
    },
    refunded: {
      color: 'bg-gray-500/15 text-muted-foreground border-gray-500/20',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    succeeded: {
      color: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
        color: 'var(--gg-vermillion)',
        borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
      },
      icon: <CheckCircle className="h-3 w-3" />,
    },
  }
  const c = config[status] || config.pending
  return (
    <Badge variant="outline" className={`${c.color} gap-1`} style={c.style}>
      {c.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GATEWAY_LABELS: Record<string, string> = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  manual: 'Manual',
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  cash: 'Cash',
  check: 'Check',
  card: 'Card',
  wallet: 'Wallet',
}

function gatewayIcon(method: string) {
  const m = (method || '').toLowerCase()
  if (m.includes('stripe') || m.includes('card')) return <CreditCard className="h-4 w-4" />
  if (m.includes('paypal') || m.includes('wallet')) return <Wallet className="h-4 w-4" />
  if (m.includes('cash') || m.includes('bank')) return <Banknote className="h-4 w-4" />
  return <Globe className="h-4 w-4" />
}

function formatCurrency(value: number, currency = 'PKR') {
  if (!value) value = 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'PKR' ? 'PKR' : currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function clientDisplay(client: ClientInfo | null): string {
  if (!client) return 'Unknown'
  return client.companyName || client.name || client.contactPerson || client.email || 'Unknown'
}

function escapeCsv(value: string): string {
  if (!value) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PaymentManager() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gatewayFilter, setGatewayFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Record Payment dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [invoices, setInvoices] = useState<InvoiceInfo[]>([])
  const [form, setForm] = useState({
    clientId: '',
    amount: '',
    currency: 'PKR',
    method: 'manual',
    status: 'completed',
    transactionId: '',
    invoiceId: '',
    notes: '',
  })

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (gatewayFilter !== 'all') params.set('gateway', gatewayFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/payments?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setPayments(json.payments || [])
        setStats(json.stats || null)
      } else {
        setPayments([])
        setStats(null)
      }
    } catch {
      setPayments([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, gatewayFilter, dateFrom, dateTo, search])

  // Fetch dropdown options (clients + invoices) — only when dialog opens
  const fetchOptions = useCallback(async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/finance/invoices'),
      ])
      if (cRes.ok) {
        const data = await cRes.json()
        const list = (data.data || data || []).map((c: ClientInfo & { company?: string | null }) => ({
          id: c.id,
          companyName: c.companyName || c.name || '',
          contactPerson: c.contactPerson || '',
          name: c.name || null,
          email: c.email || '',
          company: c.company || null,
        }))
        setClients(list)
      }
      if (iRes.ok) {
        const data = await iRes.json()
        const list = (data.data || data || []).map((i: InvoiceInfo) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber || null,
          number: i.number || null,
          total: i.total ?? null,
          currency: i.currency || null,
        }))
        setInvoices(list)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (createOpen) fetchOptions()
  }, [createOpen, fetchOptions])

  useEffect(() => {
    const t = setTimeout(fetchPayments, 300)
    return () => clearTimeout(t)
  }, [fetchPayments])

  // Revenue chart data — last 6 months
  const chartData = useMemo(() => {
    const buckets = stats?.monthly || []
    const max = Math.max(1, ...buckets.map((b) => b.revenue))
    return buckets.map((b) => ({
      label: b.label,
      value: b.revenue,
      count: b.count,
      pct: Math.round((b.revenue / max) * 100),
    }))
  }, [stats])

  // Stats cards
  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0, 'PKR'),
      icon: <DollarSign className="h-5 w-5" />,
      accent: true,
    },
    {
      label: 'This Month',
      value: formatCurrency(stats?.thisMonthRevenue ?? 0, 'PKR'),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Successful',
      value: stats?.successful ?? 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Failed',
      value: stats?.failed ?? 0,
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Refunded',
      value: stats?.refunded ?? 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
    },
  ]

  const handleExportCsv = () => {
    if (!payments.length) {
      toast.error('No payments to export')
      return
    }
    const headers = [
      'ID',
      'Client',
      'Email',
      'Amount',
      'Currency',
      'Gateway',
      'Status',
      'Invoice #',
      'Transaction ID',
      'Date',
    ]
    const rows = payments.map((p) =>
      [
        p.id,
        clientDisplay(p.client),
        p.client?.email || '',
        String(p.amount),
        p.currency || 'PKR',
        GATEWAY_LABELS[p.method] || p.method,
        p.status,
        p.invoice?.invoiceNumber || p.invoice?.number || '',
        p.transactionId || '',
        new Date(p.createdAt).toISOString(),
      ].map(escapeCsv).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const stamp = new Date().toISOString().slice(0, 10)
    a.download = `apexflow-payments-${stamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${payments.length} payments to CSV`)
  }

  const handleRecord = async () => {
    if (!form.clientId) {
      toast.error('Please select a client')
      return
    }
    const amountNum = parseFloat(form.amount)
    if (Number.isNaN(amountNum) || amountNum < 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setCreating(true)
    try {
      const payload: Record<string, unknown> = {
        clientId: form.clientId,
        amount: amountNum,
        currency: form.currency,
        method: form.method,
        status: form.status,
      }
      if (form.transactionId) payload.transactionId = form.transactionId
      if (form.invoiceId && form.invoiceId !== 'none') payload.invoiceId = form.invoiceId
      if (form.notes) payload.notes = form.notes

      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Failed')
      }
      const json = await res.json()
      toast.success(`Payment recorded for ${clientDisplay(json.payment?.client)}`)
      setForm({
        clientId: '',
        amount: '',
        currency: 'PKR',
        method: 'manual',
        status: 'completed',
        transactionId: '',
        invoiceId: '',
        notes: '',
      })
      setCreateOpen(false)
      fetchPayments()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to record payment'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-muted-foreground mt-1">
            Track client payments, gateway transactions, and revenue trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPayments}
            disabled={loading}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="hover:opacity-90 text-white gap-1.5"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
          <Button
            onClick={handleExportCsv}
            className="hover:opacity-90 text-white gap-1.5"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', color: 'var(--foreground)' }}
            disabled={!payments.length}
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            style={{
              background: 'var(--card)',
              borderColor: 'var(--gg-separator)',
              boxShadow: 'var(--gg-shadow-card)',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  <p
                    className="text-lg font-bold mt-0.5 truncate"
                    style={
                      s.accent
                        ? { color: 'var(--gg-vermillion)' }
                        : { color: 'var(--foreground)' }
                    }
                  >
                    {s.value}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-2 shrink-0 ${s.bg || ''}`}
                  style={
                    s.accent
                      ? {
                          background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                          color: 'var(--gg-vermillion)',
                        }
                      : { color: s.color }
                  }
                >
                  {s.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart + gateway breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card
          className="lg:col-span-2"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--gg-separator)',
            boxShadow: 'var(--gg-shadow-card)',
          }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
              Revenue (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end justify-between gap-2 h-44 px-2">
              {chartData.map((b, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-2 h-full"
                >
                  <div className="text-xs font-semibold text-white">
                    {b.value > 0 ? formatCurrency(b.value, 'PKR') : ''}
                  </div>
                  <div
                    className="w-full rounded-t-md transition-all duration-300 hover:opacity-90"
                    style={{
                      height: `${b.pct}%`,
                      minHeight: '6px',
                      background: 'linear-gradient(180deg, var(--gg-vermillion), var(--gg-amber))',
                      boxShadow: '0 0 12px -2px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)',
                    }}
                    title={`${b.label}: ${formatCurrency(b.value, 'PKR')} (${b.count} payments)`}
                  />
                  <div className="text-xs text-muted-foreground">{b.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gateway breakdown */}
        <Card
          style={{
            background: 'var(--card)',
            borderColor: 'var(--gg-separator)',
            boxShadow: 'var(--gg-shadow-card)',
          }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
              By Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {stats?.byGateway && stats.byGateway.length > 0 ? (
                stats.byGateway.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-2"
                    style={{ background: 'var(--secondary)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="rounded p-1.5 shrink-0"
                        style={{
                          background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                          color: 'var(--gg-vermillion)',
                        }}
                      >
                        {gatewayIcon(g.gateway)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {GATEWAY_LABELS[g.gateway] || g.gateway}
                        </p>
                        <p className="text-xs text-muted-foreground">{g.count} payments</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white shrink-0">
                      {formatCurrency(g.revenue, 'PKR')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">No gateway data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by client, invoice, or txn id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-white placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-36 text-white"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
          <SelectTrigger
            className="w-full sm:w-36 text-white"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Gateway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gateways</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="check">Check</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-white text-sm w-full sm:w-36"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
            title="From date"
          />
          <span className="text-muted-foreground text-xs">→</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-white text-sm w-full sm:w-36"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
            title="To date"
          />
        </div>
      </div>

      {/* Table */}
      <Card
        style={{
          background: 'var(--card)',
          borderColor: 'var(--gg-separator)',
          boxShadow: 'var(--gg-shadow-card)',
        }}
      >
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <CreditCard className="h-12 w-12 mb-4 text-gray-600" />
              <p className="text-base font-medium text-foreground">No payments yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md text-center">
                Payments are recorded automatically when clients are charged via checkout,
                but you can also manually record a payment for any client using the button below.
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                className="mt-5 hover:opacity-90 text-white gap-1.5"
                style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
              >
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Currency</TableHead>
                    <TableHead className="text-muted-foreground">Gateway</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Invoice #</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Transaction</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'var(--gg-separator)' }}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white truncate max-w-[160px]">
                            {clientDisplay(p.client)}
                          </span>
                          {p.client?.email && (
                            <span className="text-xs text-gray-500 truncate max-w-[160px]">
                              {p.client.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-white">
                        {formatCurrency(p.amount, p.currency || 'PKR')}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-gray-300 text-xs">
                          {p.currency || 'PKR'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-gray-500"
                            style={{ color: 'var(--gg-vermillion)' }}
                          >
                            {gatewayIcon(p.method)}
                          </span>
                          <span className="text-sm text-gray-200">
                            {GATEWAY_LABELS[p.method] || p.method}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-300 font-mono">
                        {p.invoice?.invoiceNumber || p.invoice?.number || '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-gray-400 font-mono">
                        {p.transactionId ? (
                          <span className="truncate inline-block max-w-[140px]" title={p.transactionId}>
                            {p.transactionId}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="bg-gray-950 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
              Record Payment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manually record a payment for a client. A unique transaction ID is auto-generated if you leave the field blank.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Client *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
              >
                <SelectTrigger
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                >
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName || c.name || c.contactPerson || c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className="text-xs text-gray-500">Loading clients...</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3" /> Amount *
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                >
                  <SelectTrigger
                    className="text-white"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">PKR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Gateway / Method</Label>
                <Select
                  value={form.method}
                  onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}
                >
                  <SelectTrigger
                    className="text-white"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger
                    className="text-white"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Invoice (optional)
              </Label>
              <Select
                value={form.invoiceId || 'none'}
                onValueChange={(v) => setForm((f) => ({ ...f, invoiceId: v === 'none' ? '' : v }))}
              >
                <SelectTrigger
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                >
                  <SelectValue placeholder="No invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No invoice</SelectItem>
                  {invoices.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.invoiceNumber || i.number || i.id.slice(-8)}{i.total ? ` — ${i.total}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Transaction ID (optional)</Label>
              <Input
                type="text"
                placeholder="Auto-generated if blank"
                value={form.transactionId}
                onChange={(e) => setForm((f) => ({ ...f, transactionId: e.target.value }))}
                className="text-white font-mono text-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Notes (optional)</Label>
              <Input
                type="text"
                placeholder="Reference, check #, etc."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="text-white"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{ background: 'var(--secondary)', border: '1px solid var(--gg-separator)' }}
            >
              <Building2 className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Payments are normally created via Stripe webhooks when clients are
                charged. Use this form to manually record a payment — it will appear
                immediately in the revenue chart and stats.
              </p>
            </div>
          </div>
          <Separator style={{ background: 'var(--gg-separator)' }} />
          <DialogFooter className="mt-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecord}
              disabled={creating || !form.clientId || !form.amount}
              className="hover:opacity-90 text-white gap-1.5"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
