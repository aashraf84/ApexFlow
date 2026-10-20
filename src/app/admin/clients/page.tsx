'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Users,
  Search,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  ShieldCheck,
  KeyRound,
  CreditCard,
  Activity as ActivityIcon,
  RefreshCcw,
  Star,
  ExternalLink,
  Hash,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface ClientListItem {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  industry: string | null
  status: string
  erpSlug: string | null
  erpSystemId: string | null
  erpSystem: { id: string; name: string; slug: string; color: string } | null
  createdAt: string
  dealCount: number
  licenseCount: number
  subscriptionCount: number
  activeSubscriptionCount: number
  invoiceCount: number
  activityCount: number
}

interface ErpOption {
  id: string
  name: string
  slug: string
  color: string
}

interface ErpBreakdown {
  slug: string
  count: number
}

interface ClientListResponse {
  success: boolean
  data: ClientListItem[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  stats: { total: number; active: number; prospect: number; churned: number; inactive: number }
  erpSystems: ErpOption[]
  erpBreakdown: ErpBreakdown[]
}

interface ClientContact {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean
  notes: string | null
  createdAt: string
}

interface ClientDeal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  source: string | null
  expectedCloseDate: string | null
  createdAt: string
}

interface ClientLicense {
  id: string
  serialKey: string
  licenseKey: string
  type: string
  status: string
  maxUsers: number
  maxDevices: number
  expiresAt: string | null
  erpSystem: { id: string; name: string; slug: string } | null
  createdAt: string
}

interface ClientSubscription {
  id: string
  plan: string
  status: string
  billingCycle: string
  monthlyFee: number
  currency: string
  startDate: string
  endDate: string | null
  erpSystem: { id: string; name: string; slug: string } | null
}

interface ClientActivityRow {
  id: string
  type: string
  subject: string
  notes: string | null
  createdAt: string
}

interface ClientDetail {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  website: string | null
  taxId: string | null
  status: string
  industry: string | null
  notes: string | null
  databaseName: string | null
  erpSlug: string | null
  erpSystemId: string | null
  createdAt: string
  erpSystem: { id: string; name: string; slug: string; color: string; website: string | null } | null
  contacts: ClientContact[]
  deals: ClientDeal[]
  licenses: ClientLicense[]
  subscriptions: ClientSubscription[]
  invoices: any[]
  activities: ClientActivityRow[]
  _count: {
    deals: number
    licenses: number
    subscriptions: number
    invoices: number
    activities: number
    orders: number
    payments: number
  }
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatMoney(amount: number, currency = 'PKR') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  } catch {
    return `${currency} ${(amount || 0).toLocaleString()}`
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; style?: React.CSSProperties }> = {
    active: {
      label: 'Active',
      cls: '',
      style: {
        background: 'color-mix(in srgb, #10b981 18%, transparent)',
        color: '#10b981',
        borderColor: 'color-mix(in srgb, #10b981 30%, transparent)',
      },
    },
    trial: {
      label: 'Trial',
      cls: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-amber) 18%, transparent)',
        color: 'var(--gg-amber)',
        borderColor: 'color-mix(in srgb, var(--gg-amber) 30%, transparent)',
      },
    },
    prospect: { label: 'Prospect', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    inactive: { label: 'Inactive', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
    suspended: { label: 'Suspended', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
    churned: { label: 'Churned', cls: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  }
  const c = map[status] || { label: status, cls: 'bg-gray-500/15 text-gray-400 border-gray-500/20' }
  return (
    <Badge variant="outline" className={`text-xs ${c.cls}`} style={c.style}>
      {c.label}
    </Badge>
  )
}

function ErpBadge({ erp }: { erp: ClientListItem['erpSystem'] }) {
  if (!erp) {
    return (
      <Badge variant="outline" className="text-xs bg-white/5 text-gray-500" style={{ borderColor: 'var(--gg-separator)' }}>
        no ERP
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="text-xs"
      style={{
        background: `color-mix(in srgb, ${erp.color || 'var(--gg-vermillion)'} 15%, transparent)`,
        color: erp.color || 'var(--gg-vermillion)',
        borderColor: `color-mix(in srgb, ${erp.color || 'var(--gg-vermillion)'} 30%, transparent)`,
      }}
    >
      {erp.slug}
    </Badge>
  )
}

function DealStageBadge({ stage }: { stage: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    lead: { label: 'Lead', cls: 'bg-gray-500/15 text-gray-300 border-gray-500/20' },
    qualified: { label: 'Qualified', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
    proposal: { label: 'Proposal', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    negotiation: { label: 'Negotiation', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    closed_won: { label: 'Won', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    closed_lost: { label: 'Lost', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  }
  const c = map[stage] || { label: stage, cls: 'bg-gray-500/15 text-gray-300 border-gray-500/20' }
  return (
    <Badge variant="outline" className={`text-xs ${c.cls}`}>
      {c.label}
    </Badge>
  )
}

function LicenseStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    suspended: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    revoked: 'bg-red-500/15 text-red-400 border-red-500/20',
    expired: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  }
  return (
    <Badge variant="outline" className={`text-xs ${map[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
      {status}
    </Badge>
  )
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    trial: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    past_due: 'bg-red-500/15 text-red-400 border-red-500/20',
    cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    expired: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  }
  return (
    <Badge variant="outline" className={`text-xs ${map[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
      {status}
    </Badge>
  )
}

// ──────────────────────────────────────────────────────────────
// New Client Form
// ──────────────────────────────────────────────────────────────
interface NewClientForm {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  industry: string
  status: string
  erpSlug: string
}

const emptyForm: NewClientForm = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  industry: '',
  status: 'trial',
  erpSlug: '',
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [erpFilter, setErpFilter] = useState('all')
  const [sort, setSort] = useState<'createdAt' | 'companyName' | 'status'>('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const [erpOptions, setErpOptions] = useState<ErpOption[]>([])
  const [erpBreakdown, setErpBreakdown] = useState<ErpBreakdown[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, prospect: 0, churned: 0, inactive: 0 })
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)

  // Detail drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ClientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // New Client dialog
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [newForm, setNewForm] = useState<NewClientForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // ── Fetch list ──
  const fetchClients = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true)
        else setLoading(true)
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (erpFilter !== 'all') params.set('erpSlug', erpFilter)
        params.set('sort', sort)
        params.set('order', order)
        params.set('page', String(page))
        params.set('pageSize', '25')

        const res = await fetch(`/api/admin/clients?${params.toString()}`)
        if (res.ok) {
          const json: ClientListResponse = await res.json()
          setClients(json.data || [])
          setPagination(json.pagination)
          setStats(json.stats)
          setErpOptions(json.erpSystems || [])
          setErpBreakdown(json.erpBreakdown || [])
        } else {
          if (!silent) toast.error('Failed to load clients')
        }
      } catch {
        if (!silent) toast.error('Failed to load clients')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [debouncedSearch, statusFilter, erpFilter, sort, order, page]
  )

  useEffect(() => {
    fetchClients(false)
  }, [fetchClients])

  // Reset to page 1 when filters/sort change.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, erpFilter, sort, order])

  // ── Fetch detail ──
  const fetchDetail = useCallback(async (id: string) => {
    try {
      setDetailLoading(true)
      const res = await fetch(`/api/admin/clients/${id}`)
      if (res.ok) {
        const json = await res.json()
        setDetail(json.data)
      } else {
        toast.error('Failed to load client details')
      }
    } catch {
      toast.error('Failed to load client details')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId)
    else setDetail(null)
  }, [selectedId, fetchDetail])

  // ── Sync Now ──
  const handleSyncNow = async () => {
    if (!detail?.erpSlug) {
      toast.error('This client has no linked ERP — cannot sync')
      return
    }
    try {
      setSyncing(true)
      const res = await fetch('/api/admin/sync-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', erpSlug: detail.erpSlug }),
      })
      const json = await res.json()
      if (res.ok && json.success !== false) {
        toast.success(json.message || `Sync completed for ${detail.erpSlug}`)
      } else {
        toast.error(json.error || 'Sync failed')
      }
    } catch {
      toast.error('Sync request failed')
    } finally {
      setSyncing(false)
    }
  }

  // ── New Client submit ──
  const handleNewClient = async () => {
    if (!newForm.companyName.trim() || !newForm.contactPerson.trim() || !newForm.email.trim()) {
      toast.error('Company name, contact person, and email are required')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: newForm.companyName,
          contactPerson: newForm.contactPerson,
          email: newForm.email,
          phone: newForm.phone,
          industry: newForm.industry,
          status: newForm.status,
          erpSlug: newForm.erpSlug || undefined,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success !== false) {
        toast.success('Client created successfully')
        setNewDialogOpen(false)
        setNewForm(emptyForm)
        fetchClients(true)
      } else {
        toast.error(json.error || 'Failed to create client')
      }
    } catch {
      toast.error('Failed to create client')
    } finally {
      setSubmitting(false)
    }
  }

  const sortedErpOptions = useMemo(() => {
    return erpOptions.map((o) => ({
      ...o,
      count: erpBreakdown.find((b) => b.slug === o.slug)?.count || 0,
    }))
  }, [erpOptions, erpBreakdown])

  const toggleSort = (col: 'createdAt' | 'companyName' | 'status') => {
    if (sort === col) setOrder(order === 'asc' ? 'desc' : 'asc')
    else {
      setSort(col)
      setOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clients</h2>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships, deals, licenses and ERP syncs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchClients(true)}
            disabled={refreshing}
            className="text-foreground"
            style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button
            onClick={() => {
              setNewForm(emptyForm)
              setNewDialogOpen(true)
            }}
            className="hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Clients', value: stats.total, icon: Users, accent: true },
          { label: 'Active', value: stats.active, icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Prospects', value: stats.prospect, icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Churned', value: stats.churned, icon: Building2, color: 'text-gray-400' },
        ].map((s) => (
          <Card
            key={s.label}
            style={{
              background: 'var(--card)',
              borderColor: 'var(--gg-separator)',
              boxShadow: 'var(--gg-shadow-card)',
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-white/5 p-2">
                {s.accent ? (
                  <s.icon className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                ) : (
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by company, contact, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-foreground placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-44 text-foreground" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={erpFilter} onValueChange={setErpFilter}>
          <SelectTrigger className="w-full lg:w-56 text-foreground" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
            <SelectValue placeholder="All ERPs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ERPs</SelectItem>
            {sortedErpOptions.map((e) => (
              <SelectItem key={e.id} value={e.slug}>
                {e.name} ({e.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-full lg:w-40 text-foreground" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="companyName">Company Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className="text-foreground"
          style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)' }}
        >
          <ArrowUpDown className="h-4 w-4 mr-1.5" />
          {order === 'asc' ? 'Asc' : 'Desc'}
        </Button>
      </div>

      {/* Table */}
      <Card
        style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
      >
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02]">
                  <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                  <Skeleton className="h-6 w-16 bg-white/5" />
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-gray-600 mb-4" />
              {debouncedSearch || statusFilter !== 'all' || erpFilter !== 'all' ? (
                <>
                  <p className="text-muted-foreground text-lg font-medium">No matching clients</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('all')
                      setErpFilter('all')
                    }}
                    className="mt-4 text-foreground"
                    style={{ borderColor: 'var(--gg-separator)' }}
                  >
                    Clear filters
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-lg font-medium">No clients yet</p>
                  <p className="text-gray-500 text-sm mt-1">Get started by creating your first client</p>
                  <Button
                    onClick={() => setNewDialogOpen(true)}
                    className="mt-4 hover:opacity-90 text-white"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Client
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort('companyName')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Company
                        {sort === 'companyName' && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">Contact</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Email / Phone</TableHead>
                    <TableHead className="text-muted-foreground font-medium">ERP</TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort('status')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Status
                        {sort === 'status' && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Deals</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Licenses</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Active Subs</TableHead>
                    <TableHead
                      className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                      onClick={() => toggleSort('createdAt')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Created
                        {sort === 'createdAt' && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow
                      key={c.id}
                      className="hover:bg-white/[0.03] cursor-pointer"
                      style={{ borderColor: 'var(--gg-separator)' }}
                      onClick={() => setSelectedId(c.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)' }}
                          >
                            <span
                              className="text-sm font-semibold"
                              style={{ color: 'var(--gg-vermillion)' }}
                            >
                              {c.companyName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground truncate">{c.companyName}</p>
                            {c.industry && (
                              <p className="text-xs text-gray-500 truncate">{c.industry}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.contactPerson || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {c.email && (
                            <span className="text-xs text-muted-foreground truncate max-w-[180px]">{c.email}</span>
                          )}
                          {c.phone && (
                            <span className="text-xs text-gray-500 truncate max-w-[180px]">{c.phone}</span>
                          )}
                          {!c.email && !c.phone && <span className="text-gray-600">—</span>}
                        </div>
                      </TableCell>
                      <TableCell><ErpBadge erp={c.erpSystem} /></TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-medium ${c.dealCount > 0 ? 'text-foreground' : 'text-gray-600'}`}>
                          {c.dealCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-medium ${c.licenseCount > 0 ? 'text-foreground' : 'text-gray-600'}`}>
                          {c.licenseCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-medium ${c.activeSubscriptionCount > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                          {c.activeSubscriptionCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(c.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {(pagination.page - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => {
                const next = Math.max(1, pagination.page - 1)
                setPage(next)
              }}
              className="text-foreground"
              style={{ borderColor: 'var(--gg-separator)' }}
            >
              Previous
            </Button>
            <span className="py-1 px-2 text-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {
                const next = Math.min(pagination.totalPages, pagination.page + 1)
                setPage(next)
              }}
              className="text-foreground"
              style={{ borderColor: 'var(--gg-separator)' }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full sm:!max-w-2xl flex flex-col p-0"
          style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}
        >
          <SheetHeader
            className="border-b shrink-0"
            style={{ borderColor: 'var(--gg-separator)' }}
          >
            <SheetTitle className="text-foreground">
              {detailLoading ? 'Loading…' : detail?.companyName || 'Client Detail'}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Full client record — deals, licenses, subscriptions, activities
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />
              ))}
            </div>
          ) : detail ? (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-5">
                {/* Header card */}
                <Card
                  style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)' }}
                      >
                        <span className="text-lg font-bold" style={{ color: 'var(--gg-vermillion)' }}>
                          {detail.companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-foreground font-semibold truncate">{detail.companyName}</h3>
                          <StatusBadge status={detail.status} />
                          {detail.erpSystem && <ErpBadge erp={detail.erpSystem} />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{detail.contactPerson}</p>
                      </div>
                      {detail.erpSlug && (
                        <Button
                          size="sm"
                          onClick={handleSyncNow}
                          disabled={syncing}
                          className="hover:opacity-90 text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                        >
                          <RefreshCcw className={`h-4 w-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                          {syncing ? 'Syncing…' : 'Sync Now'}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      <ContactLine icon={Mail} value={detail.email} href={`mailto:${detail.email}`} />
                      <ContactLine icon={Phone} value={detail.phone || ''} href={detail.phone ? `tel:${detail.phone}` : null} />
                      <ContactLine icon={Building2} value={detail.industry || ''} />
                      <ContactLine icon={MapPin} value={[detail.city, detail.country].filter(Boolean).join(', ')} />
                      <ContactLine icon={Globe} value={detail.website || ''} href={detail.website || null} />
                      <ContactLine icon={Calendar} value={`Created ${formatDate(detail.createdAt)}`} />
                    </div>

                    {detail.erpSystem?.website && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--gg-separator)' }}>
                        <Link
                          href={`/admin/integrations?erp=${detail.erpSystem.slug}`}
                          className="inline-flex items-center gap-1 text-xs hover:underline"
                          style={{ color: 'var(--gg-teal)' }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View integration for {detail.erpSystem.name}
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Deals', value: detail._count?.deals ?? detail.deals?.length ?? 0, icon: TrendingUp },
                    { label: 'Licenses', value: detail._count?.licenses ?? detail.licenses?.length ?? 0, icon: KeyRound },
                    { label: 'Subscriptions', value: detail._count?.subscriptions ?? detail.subscriptions?.length ?? 0, icon: CreditCard },
                    { label: 'Invoices', value: detail._count?.invoices ?? detail.invoices?.length ?? 0, icon: FileText },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg border p-3"
                      style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                    >
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <s.icon className="h-3 w-3" />
                        <span className="text-xs">{s.label}</span>
                      </div>
                      <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Deals */}
                <DetailSection title="Deals" icon={TrendingUp} count={detail.deals?.length ?? 0}>
                  {!detail.deals || detail.deals.length === 0 ? (
                    <EmptyRow text="No deals for this client" />
                  ) : (
                    <div className="space-y-2">
                      {detail.deals.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-2.5 rounded-lg"
                          style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)', borderWidth: 1 }}
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-foreground font-medium truncate">{d.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <DealStageBadge stage={d.stage} />
                              <span className="text-xs text-gray-500">{d.probability}% prob.</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground">{formatMoney(d.value)}</p>
                            {d.source && <p className="text-xs text-gray-500">{d.source}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DetailSection>

                {/* Licenses */}
                <DetailSection title="Licenses" icon={KeyRound} count={detail.licenses?.length ?? 0}>
                  {!detail.licenses || detail.licenses.length === 0 ? (
                    <EmptyRow text="No licenses for this client" />
                  ) : (
                    <div className="space-y-2">
                      {detail.licenses.map((l) => (
                        <div
                          key={l.id}
                          className="p-2.5 rounded-lg"
                          style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)', borderWidth: 1 }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-mono text-foreground truncate">{l.serialKey}</p>
                            <LicenseStatusBadge status={l.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {l.type}
                            </span>
                            <span>{l.maxUsers} users · {l.maxDevices} devices</span>
                            {l.expiresAt && (
                              <span>exp {formatDate(l.expiresAt)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DetailSection>

                {/* Subscriptions */}
                <DetailSection title="Subscriptions" icon={CreditCard} count={detail.subscriptions?.length ?? 0}>
                  {!detail.subscriptions || detail.subscriptions.length === 0 ? (
                    <EmptyRow text="No subscriptions for this client" />
                  ) : (
                    <div className="space-y-2">
                      {detail.subscriptions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2.5 rounded-lg"
                          style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)', borderWidth: 1 }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-foreground font-medium capitalize">{s.plan}</p>
                              <SubStatusBadge status={s.status} />
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {s.billingCycle} · started {formatDate(s.startDate)}
                              {s.erpSystem ? ` · ${s.erpSystem.name}` : ''}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground shrink-0">
                            {formatMoney(s.monthlyFee, s.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </DetailSection>

                {/* Contacts */}
                <DetailSection title="Contacts" icon={Users} count={detail.contacts?.length ?? 0}>
                  {!detail.contacts || detail.contacts.length === 0 ? (
                    <EmptyRow text="No contacts for this client" />
                  ) : (
                    <div className="space-y-2">
                      {detail.contacts.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2.5 rounded-lg"
                          style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)', borderWidth: 1 }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-foreground font-medium truncate">{c.name}</p>
                              {c.isPrimary && (
                                <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/20 px-1.5">
                                  <Star className="h-2.5 w-2.5 mr-0.5 inline" />
                                  Primary
                                </Badge>
                              )}
                              {c.role && (
                                <Badge variant="outline" className="text-[10px] bg-white/5 text-muted-foreground px-1.5" style={{ borderColor: 'var(--gg-separator)' }}>
                                  {c.role}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                              {c.email && <span className="truncate">{c.email}</span>}
                              {c.phone && <span>{c.phone}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DetailSection>

                {/* Recent Activities */}
                <DetailSection title="Recent Activities" icon={ActivityIcon} count={detail.activities?.length ?? 0}>
                  {!detail.activities || detail.activities.length === 0 ? (
                    <EmptyRow text="No activities logged yet" />
                  ) : (
                    <div className="relative pl-6">
                      <div
                        className="absolute left-2 top-1 bottom-2 w-px"
                        style={{ background: 'var(--gg-separator)' }}
                      />
                      <div className="space-y-3">
                        {detail.activities.map((a) => (
                          <div key={a.id} className="relative">
                            <div
                              className="absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full"
                              style={{ background: 'var(--gg-vermillion)', boxShadow: '0 0 0 3px var(--background)' }}
                            />
                            <div className="rounded-lg p-2.5" style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)', borderWidth: 1 }}>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-foreground font-medium truncate">{a.subject}</p>
                                <span className="text-xs text-gray-500 shrink-0" title={a.createdAt}>
                                  {formatDateTime(a.createdAt)}
                                </span>
                              </div>
                              {a.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.notes}</p>
                              )}
                              <Badge variant="outline" className="mt-1.5 text-[10px] bg-white/5 text-muted-foreground px-1.5" style={{ borderColor: 'var(--gg-separator)' }}>
                                {a.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </DetailSection>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-muted-foreground">Client not found</p>
              <Button variant="outline" onClick={() => setSelectedId(null)} className="mt-4 text-foreground" style={{ borderColor: 'var(--gg-separator)' }}>
                Close
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Client Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="text-foreground max-w-lg" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle>New Client</DialogTitle>
            <DialogDescription>Create a new client record. You can edit the rest of the fields later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Company Name *</Label>
              <Input
                value={newForm.companyName}
                onChange={(e) => setNewForm({ ...newForm, companyName: e.target.value })}
                placeholder="Acme Corp"
                style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Contact Person *</Label>
              <Input
                value={newForm.contactPerson}
                onChange={(e) => setNewForm({ ...newForm, contactPerson: e.target.value })}
                placeholder="Jane Doe"
                style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email *</Label>
                <Input
                  type="email"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="jane@acme.com"
                  style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Phone</Label>
                <Input
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Industry</Label>
                <Input
                  value={newForm.industry}
                  onChange={(e) => setNewForm({ ...newForm, industry: e.target.value })}
                  placeholder="e.g. Apparel, Retail"
                  style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Select
                  value={newForm.status}
                  onValueChange={(v) => setNewForm({ ...newForm, status: v })}
                >
                  <SelectTrigger style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Optional ERP link */}
            {erpOptions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Linked ERP (optional)</Label>
                <Select
                  value={newForm.erpSlug}
                  onValueChange={(v) =>
                    setNewForm({ ...newForm, erpSlug: v })
                  }
                >
                  <SelectTrigger style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="No ERP linked" />
                  </SelectTrigger>
                  <SelectContent>
                    {erpOptions.map((e) => (
                      <SelectItem key={e.id} value={e.slug}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Note: erpSlug is saved on the client; full ERP sync configuration is in the Integration Hub.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setNewDialogOpen(false)}
              className="text-muted-foreground"
              style={{ borderColor: 'var(--gg-separator)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewClient}
              disabled={submitting}
              className="hover:opacity-90 text-white"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {submitting ? 'Saving…' : 'Create Client'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Small building blocks
// ──────────────────────────────────────────────────────────────
function ContactLine({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  href?: string | null
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
      {href ? (
        <a href={href} className="text-muted-foreground hover:underline truncate">{value}</a>
      ) : (
        <span className="text-muted-foreground truncate">{value}</span>
      )}
    </div>
  )
}

function DetailSection({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Badge variant="outline" className="text-[10px] bg-white/5 text-muted-foreground px-1.5" style={{ borderColor: 'var(--gg-separator)' }}>
          {count}
        </Badge>
      </div>
      {children}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-4 text-center" style={{ borderColor: 'var(--gg-separator)' }}>
      <p className="text-xs text-gray-500">{text}</p>
    </div>
  )
}
