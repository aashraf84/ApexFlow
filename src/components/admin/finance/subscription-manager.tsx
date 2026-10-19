'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
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
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Building2,
  User,
  Package as PackageIcon,
  Ban,
  RefreshCcw,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClientInfo {
  id: string
  companyName: string
  contactPerson: string
  name: string | null
  email: string
  phone: string | null
  company: string | null
  status: string
  industry: string | null
  country: string | null
}

interface PackageInfo {
  id: string
  name: string
  price: number
  billingCycle: string
  plan: string
  currency: string
}

interface ErpInfo {
  id: string
  name: string
  slug: string
}

interface SubscriptionRecord {
  id: string
  clientId: string | null
  packageId: string | null
  erpSystemId: string | null
  plan: string
  status: string
  startDate: string
  endDate: string | null
  trialEndsAt: string | null
  monthlyFee: number
  currency: string
  billingCycle: string
  maxUsers: number
  maxLocations: number | null
  maxItems: number | null
  includedModules: string | null
  createdAt: string
  updatedAt: string
  client: ClientInfo | null
  package: PackageInfo | null
  erpSystem: ErpInfo | null
}

interface SubscriptionStats {
  mrr: number
  active: number
  trial: number
  pastDue: number
  cancelled: number
  expired: number
  total: number
  byPlan: Record<string, number>
}

// ─── Badge ───────────────────────────────────────────────────────────────────

function SubscriptionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; style?: React.CSSProperties; icon: React.ReactNode }> = {
    active: {
      color: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
        color: 'var(--gg-vermillion)',
        borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
      },
      icon: <CheckCircle className="h-3 w-3" />,
    },
    trial: {
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      icon: <Clock className="h-3 w-3" />,
    },
    past_due: {
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    cancelled: {
      color: 'bg-red-500/15 text-red-400 border-red-500/20',
      icon: <XCircle className="h-3 w-3" />,
    },
    expired: {
      color: 'bg-gray-500/15 text-muted-foreground border-gray-500/20',
      icon: <XCircle className="h-3 w-3" />,
    },
    paused: {
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      icon: <Clock className="h-3 w-3" />,
    },
  }
  const c = config[status] || config.active
  return (
    <Badge variant="outline" className={`${c.color} gap-1`} style={c.style}>
      {c.icon}
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </Badge>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (planFilter !== 'all') params.set('plan', planFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setSubscriptions(json.subscriptions || [])
        setStats(json.stats || null)
      } else {
        setSubscriptions([])
        setStats(null)
      }
    } catch {
      setSubscriptions([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, planFilter, search])

  useEffect(() => {
    const t = setTimeout(fetchSubscriptions, 300)
    return () => clearTimeout(t)
  }, [fetchSubscriptions])

  // When the user clicks a tab, sync the status filter
  useEffect(() => {
    if (activeTab === 'all') setStatusFilter('all')
    else if (activeTab === 'pastDue') setStatusFilter('past_due')
    else setStatusFilter(activeTab)
  }, [activeTab])

  const selected = useMemo(
    () => subscriptions.find((s) => s.id === selectedId) || null,
    [subscriptions, selectedId]
  )

  const handleCancel = async () => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, action: 'cancel' }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Subscription for ${clientDisplay(selected.client)} cancelled`)
      setSelectedId(null)
      fetchSubscriptions()
    } catch {
      toast.error('Failed to cancel subscription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangePlan = async () => {
    if (!selected) return
    toast.info('Change plan dialog — stub action. Wire up to a package picker to enable live plan changes.')
  }

  const handleReactivate = async () => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: 'active', endDate: null }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Subscription for ${clientDisplay(selected.client)} reactivated`)
      setSelectedId(null)
      fetchSubscriptions()
    } catch {
      toast.error('Failed to reactivate subscription')
    } finally {
      setActionLoading(false)
    }
  }

  // Stats cards
  const statCards = [
    {
      label: 'MRR',
      value: formatCurrency(stats?.mrr ?? 0, 'PKR'),
      icon: <TrendingUp className="h-5 w-5" />,
      accent: true,
    },
    {
      label: 'Active',
      value: stats?.active ?? 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Trial',
      value: stats?.trial ?? 0,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Past Due',
      value: stats?.pastDue ?? 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelled ?? 0,
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Subscriptions</h2>
        <p className="text-muted-foreground mt-1">
          Manage recurring client subscriptions, billing cycles, and plan changes.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p
                    className="text-xl font-bold mt-0.5"
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
                  className={`rounded-lg p-2.5 ${s.bg || ''}`}
                  style={
                    s.accent
                      ? {
                          background:
                            'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="border"
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            All ({stats?.total ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            Active ({stats?.active ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="trial"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            Trial ({stats?.trial ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="pastDue"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            Past Due ({stats?.pastDue ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            Cancelled ({stats?.cancelled ?? 0})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-white placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger
            className="w-full sm:w-44 text-white"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Filter plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={fetchSubscriptions}
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
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <RefreshCw className="h-10 w-10 mb-3 text-gray-600" />
              <p className="text-sm">No subscriptions found</p>
              <p className="text-xs text-gray-600 mt-1">
                Try adjusting filters or add a subscription from a client&apos;s profile.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Plan / Package</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Billing Cycle</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Next Billing</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                      style={{ borderColor: 'var(--gg-separator)' }}
                      onClick={() => setSelectedId(sub.id)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white truncate max-w-[180px]">
                            {clientDisplay(sub.client)}
                          </span>
                          {sub.client?.email && (
                            <span className="text-xs text-gray-500 truncate max-w-[180px]">
                              {sub.client.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-200">
                            {PLAN_LABELS[sub.plan] || sub.plan || '—'}
                          </span>
                          {sub.package ? (
                            <span className="text-xs text-gray-500 truncate max-w-[140px]">
                              {sub.package.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">No package</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-gray-300 capitalize">
                          {sub.billingCycle || 'monthly'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-white">
                        {formatCurrency(sub.monthlyFee || sub.package?.price || 0, sub.currency || sub.package?.currency || 'PKR')}
                        <span className="text-xs text-gray-500 ml-1">
                          /{sub.billingCycle === 'annual' ? 'yr' : 'mo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SubscriptionStatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {sub.endDate ? formatDate(sub.endDate) : '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(sub.startDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Drawer */}
      <Drawer
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <DrawerContent
          className="bg-gray-950 text-white"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <div className="mx-auto w-full sm:max-w-2xl flex flex-col max-h-[88vh] overflow-y-auto">
            <DrawerHeader className="border-b" style={{ borderColor: 'var(--gg-separator)' }}>
              <DrawerTitle className="text-xl text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
                Subscription Details
              </DrawerTitle>
              <DrawerDescription className="text-muted-foreground">
                {selected ? clientDisplay(selected.client) : ''} — manage subscription
              </DrawerDescription>
            </DrawerHeader>

            {selected && (
              <div className="p-4 space-y-5 flex-1">
                {/* Status banner */}
                <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}>
                  <div className="flex items-center gap-3">
                    <SubscriptionStatusBadge status={selected.status} />
                    <span className="text-xs text-muted-foreground">
                      ID: <span className="font-mono">{selected.id.slice(-8)}</span>
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(selected.createdAt)}
                  </span>
                </div>

                {/* Plan / billing grid */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow
                    label="Plan"
                    value={PLAN_LABELS[selected.plan] || selected.plan || '—'}
                    icon={<PackageIcon className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Package"
                    value={selected.package?.name || '—'}
                    icon={<PackageIcon className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Amount"
                    value={formatCurrency(
                      selected.monthlyFee || selected.package?.price || 0,
                      selected.currency || selected.package?.currency || 'PKR'
                    )}
                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Billing Cycle"
                    value={<span className="capitalize">{selected.billingCycle || 'monthly'}</span>}
                    icon={<RefreshCw className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Started"
                    value={formatDate(selected.startDate)}
                    icon={<Calendar className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Next Billing"
                    value={formatDate(selected.endDate)}
                    icon={<Calendar className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Trial Ends"
                    value={formatDate(selected.trialEndsAt)}
                    icon={<Clock className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="ERP System"
                    value={selected.erpSystem?.name || '—'}
                    icon={<Building2 className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Max Users"
                    value={selected.maxUsers}
                    icon={<User className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Max Locations"
                    value={selected.maxLocations ?? '—'}
                    icon={<Building2 className="h-3.5 w-3.5" />}
                  />
                </div>

                <Separator style={{ background: 'var(--gg-separator)' }} />

                {/* Client info */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Client Information
                  </h4>
                  {selected.client ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ClientDetailRow
                        label="Company"
                        value={selected.client.companyName}
                        icon={<Building2 className="h-3.5 w-3.5" />}
                      />
                      <ClientDetailRow
                        label="Contact Person"
                        value={selected.client.contactPerson}
                        icon={<User className="h-3.5 w-3.5" />}
                      />
                      <ClientDetailRow
                        label="Email"
                        value={selected.client.email}
                        icon={<Mail className="h-3.5 w-3.5" />}
                      />
                      <ClientDetailRow
                        label="Phone"
                        value={selected.client.phone || '—'}
                        icon={<Phone className="h-3.5 w-3.5" />}
                      />
                      <ClientDetailRow
                        label="Industry"
                        value={selected.client.industry || '—'}
                        icon={<Building2 className="h-3.5 w-3.5" />}
                      />
                      <ClientDetailRow
                        label="Country"
                        value={selected.client.country || '—'}
                        icon={<Building2 className="h-3.5 w-3.5" />}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No client linked</p>
                  )}
                </div>
              </div>
            )}

            <DrawerFooter className="border-t flex-row gap-2 flex-wrap" style={{ borderColor: 'var(--gg-separator)' }}>
              {selected?.client && (
                <Link href={`/admin/clients/${selected.client.id}`}>
                  <Button
                    variant="outline"
                    className="text-white hover:bg-white/5"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    View Client
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={handleChangePlan}
                className="text-white hover:bg-white/5"
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
              >
                <RefreshCcw className="h-4 w-4 mr-1.5" />
                Change Plan
              </Button>
              {selected && (selected.status === 'cancelled' || selected.status === 'expired') ? (
                <Button
                  onClick={handleReactivate}
                  disabled={actionLoading}
                  className="hover:opacity-90 text-white ml-auto"
                  style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Reactivate
                </Button>
              ) : (
                <Button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  variant="destructive"
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                  <Ban className="h-4 w-4 mr-1.5" />
                  Cancel Subscription
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" className="text-muted-foreground">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div>
      <Label className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </Label>
      <p className="text-sm font-medium text-white truncate">{value}</p>
    </div>
  )
}

function ClientDetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5 p-2 rounded-md" style={{ background: 'var(--secondary)' }}>
      <div className="text-gray-500 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm text-gray-200 truncate">{value}</p>
      </div>
    </div>
  )
}
