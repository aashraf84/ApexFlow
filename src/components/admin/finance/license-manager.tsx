'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
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
  Key,
  RefreshCw,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Copy,
  Building2,
  Boxes,
  Smartphone,
  Users,
  Calendar,
  Ban,
  Power,
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

interface PackageInfo {
  id: string
  name: string
  price: number
  maxUsers: number | null
  billingCycle: string
}

interface ErpInfo {
  id: string
  name: string
  slug: string
}

interface LicenseRecord {
  id: string
  clientId: string | null
  erpSystemId: string | null
  serialKey: string
  licenseKey: string
  type: string
  status: string
  maxUsers: number
  maxDevices: number
  activatedAt: string | null
  expiresAt: string | null
  lastVerifiedAt: string | null
  createdAt: string
  updatedAt: string
  client: ClientInfo | null
  erpSystem: ErpInfo | null
}

interface LicenseStats {
  total: number
  active: number
  expired: number
  suspended: number
  revoked: number
  byErp: { name: string; count: number }[]
}

// normalizeStatus — defensive UI normalization.
// ERP sync writes String(isActive) ("true"/"false") into the License.status
// column. The /api/admin/licenses GET route also normalizes server-side,
// but we duplicate the rule here so any stale row (or any consumer that
// forgets to call the API in the future) still renders correctly.
function normalizeStatus(status: string | null | undefined): string {
  if (!status) return 'active'
  const lower = String(status).toLowerCase()
  if (lower === 'true' || lower === '1') return 'active'
  if (lower === 'false' || lower === '0') return 'revoked'
  return status
}

// ─── Badge ───────────────────────────────────────────────────────────────────

function LicenseStatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  const config: Record<string, { color: string; style?: React.CSSProperties; icon: React.ReactNode; label: string }> = {
    active: {
      color: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
        color: 'var(--gg-vermillion)',
        borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
      },
      icon: <CheckCircle className="h-3 w-3" />,
      label: 'Active',
    },
    expired: {
      color: 'bg-gray-500/15 text-muted-foreground border-gray-500/20',
      icon: <XCircle className="h-3 w-3" />,
      label: 'Expired',
    },
    suspended: {
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Suspended',
    },
    revoked: {
      color: 'bg-red-500/15 text-red-400 border-red-500/20',
      icon: <XCircle className="h-3 w-3" />,
      label: 'Inactive',
    },
    pending: {
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Pending',
    },
  }
  const c = config[normalized] || config.active
  return (
    <Badge variant="outline" className={`${c.color} gap-1`} style={c.style}>
      {c.icon}
      <span>{c.label}</span>
    </Badge>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (!key) return '—'
  // Show first 8 chars + last 4 chars, mask the middle
  if (key.length <= 12) return key
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`
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

function copyToClipboard(text: string, label: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  } else {
    toast.error('Clipboard not available')
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LicenseManager() {
  const [licenses, setLicenses] = useState<LicenseRecord[]>([])
  const [stats, setStats] = useState<LicenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [erpFilter, setErpFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Revoke/reactivate action state
  const [revokeTarget, setRevokeTarget] = useState<LicenseRecord | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Form state for "Generate License" dialog
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [packages, setPackages] = useState<PackageInfo[]>([])
  const [erpOptions, setErpOptions] = useState<ErpInfo[]>([])
  const [form, setForm] = useState({
    clientId: '',
    packageId: '',
    erpSystemId: '',
    type: 'standard',
    maxUsers: '5',
    maxDevices: '3',
    expiresAt: '',
  })

  const fetchLicenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (erpFilter !== 'all') params.set('erpId', erpFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/licenses?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setLicenses(json.licenses || [])
        setStats(json.stats || null)
      } else {
        setLicenses([])
        setStats(null)
      }
    } catch {
      setLicenses([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, erpFilter, search])

  // Fetch dropdown options (clients, packages, erp systems) — only when dialog opens
  const fetchOptions = useCallback(async () => {
    try {
      const [cRes, pRes, eRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/finance/packages'),
        fetch('/api/erp-systems'),
      ])
      if (cRes.ok) {
        const data = await cRes.json()
        const list = (data.data || data || []).map((c: any) => ({
          id: c.id,
          companyName: c.companyName || c.name || '',
          contactPerson: c.contactPerson || '',
          name: c.name || null,
          email: c.email || '',
          company: c.company || null,
        }))
        setClients(list)
      }
      if (pRes.ok) {
        const data = await pRes.json()
        const list = (data.data || data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          maxUsers: p.maxUsers ?? null,
          billingCycle: p.billingCycle || 'monthly',
        }))
        setPackages(list)
      }
      if (eRes.ok) {
        const data = await eRes.json()
        const list = (data.data || data || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
        }))
        setErpOptions(list)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchLicenses, 300)
    return () => clearTimeout(t)
  }, [fetchLicenses])

  useEffect(() => {
    if (createOpen) fetchOptions()
  }, [createOpen, fetchOptions])

  // Load ERP options on mount too — the ERP filter dropdown needs the
  // ErpSystem CUIDs to send as `?erpId=<cuid>` (the API filters by
  // `erpSystemId`, not by name). Without this, picking an ERP in the
  // filter would send the ERP display name as the erpId and return 0
  // results.
  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  // When package selected, auto-fill maxUsers if package specifies them
  useEffect(() => {
    if (!form.packageId) return
    const pkg = packages.find((p) => p.id === form.packageId)
    if (pkg?.maxUsers) {
      setForm((f) => ({ ...f, maxUsers: String(pkg.maxUsers) }))
    }
  }, [form.packageId, packages])

  const topErp = useMemo(() => stats?.byErp?.[0]?.name || '—', [stats])

  const statCards = [
    {
      label: 'Total Licenses',
      value: stats?.total ?? 0,
      icon: <Key className="h-5 w-5" />,
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
      label: 'Expired',
      value: stats?.expired ?? 0,
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
    },
    {
      label: 'Top ERP',
      value: topErp,
      icon: <Boxes className="h-5 w-5" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ]

  const handleGenerate = async () => {
    if (!form.clientId) {
      toast.error('Please select a client')
      return
    }
    setCreating(true)
    try {
      const payload = {
        clientId: form.clientId,
        packageId: form.packageId || undefined,
        erpSystemId: form.erpSystemId || undefined,
        type: form.type,
        maxUsers: parseInt(form.maxUsers) || 5,
        maxDevices: parseInt(form.maxDevices) || 3,
        expiresAt: form.expiresAt || undefined,
      }
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Failed')
      }
      const json = await res.json()
      toast.success(`License generated for ${clientDisplay(json.license?.client)}`)
      // Reset form + close dialog + refresh list
      setForm({
        clientId: '',
        packageId: '',
        erpSystemId: '',
        type: 'standard',
        maxUsers: '5',
        maxDevices: '3',
        expiresAt: '',
      })
      setCreateOpen(false)
      fetchLicenses()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate license')
    } finally {
      setCreating(false)
    }
  }

  // PATCH /api/admin/licenses accepts { id, action: 'revoke' | 'reactivate' | 'update' }
  // (and equivalently { id, status: 'revoked' | 'active' }). We send both
  // `action` and `status` for defensiveness — either triggers the right branch.
  const patchLicense = async (
    lic: LicenseRecord,
    action: 'revoke' | 'reactivate',
    status: 'revoked' | 'active'
  ) => {
    setActionLoadingId(lic.id)
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lic.id, action, status }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Failed')
      }
      toast.success(
        action === 'revoke'
          ? `License for ${clientDisplay(lic.client)} revoked`
          : `License for ${clientDisplay(lic.client)} reactivated`
      )
      fetchLicenses()
    } catch (e: any) {
      toast.error(e?.message || `Failed to ${action} license`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return
    await patchLicense(revokeTarget, 'revoke', 'revoked')
    setRevokeTarget(null)
  }

  const handleReactivate = (lic: LicenseRecord) => {
    void patchLicense(lic, 'reactivate', 'active')
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Licenses</h2>
          <p className="text-muted-foreground mt-1">
            Generate, monitor, and revoke software activation keys for clients.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="hover:opacity-90 text-white gap-1.5"
          style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
        >
          <Plus className="h-4 w-4" />
          Generate License
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p
                    className="text-xl font-bold mt-0.5 truncate"
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
                  className={`rounded-lg p-2.5 shrink-0 ${s.bg || ''}`}
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by serial or license key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-white placeholder:text-gray-500 font-mono text-sm"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-40 text-white"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={erpFilter} onValueChange={setErpFilter}>
          <SelectTrigger
            className="w-full sm:w-48 text-white"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Filter ERP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ERPs</SelectItem>
            {stats?.byErp?.map((e) => {
              // The API filters `where.erpSystemId = erpId`, which expects an
              // ErpSystem CUID (e.g. `cmv6my7eg004avfflmb4dbw2f`) — NOT the
              // ERP display name. The byErp stat only carries `name` + `count`,
              // so we resolve the CUID via the erpOptions list (loaded on mount).
              const erp = erpOptions.find((o) => o.name === e.name)
              const value = erp?.id || e.name
              return (
                <SelectItem key={e.name} value={value}>
                  {e.name} ({e.count})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={fetchLicenses}
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
          ) : licenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Key className="h-10 w-10 mb-3 text-gray-600" />
              <p className="text-sm">No licenses found</p>
              <p className="text-xs text-gray-600 mt-1">
                Click <span className="text-[var(--gg-vermillion)] font-medium">Generate License</span> to issue a new activation key.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
                  <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--gg-separator)' }}>
                    <TableHead className="text-muted-foreground">Serial Key</TableHead>
                    <TableHead className="text-muted-foreground">License Key</TableHead>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">ERP</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell text-center">Max Users</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell text-center">Max Devices</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Expires</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((lic) => (
                    <TableRow
                      key={lic.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'var(--gg-separator)' }}
                    >
                      <TableCell>
                        <button
                          onClick={() => copyToClipboard(lic.serialKey, 'Serial key')}
                          className="group flex items-center gap-1.5 text-xs font-mono text-white hover:text-[var(--gg-vermillion)] transition-colors"
                          title="Click to copy"
                        >
                          {lic.serialKey}
                          <Copy className="h-3 w-3 text-gray-600 group-hover:text-[var(--gg-vermillion)] transition-colors" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-gray-400">{maskKey(lic.licenseKey)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-200 truncate max-w-[160px] block">
                          {clientDisplay(lic.client)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-300">
                        {lic.erpSystem?.name || '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-gray-300 capitalize text-xs">
                          {lic.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <LicenseStatusBadge status={lic.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center text-sm text-gray-200">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          {lic.maxUsers}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center text-sm text-gray-200">
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-gray-500" />
                          {lic.maxDevices}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(lic.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(() => {
                          const normalized = normalizeStatus(lic.status)
                          const isLoading = actionLoadingId === lic.id
                          if (normalized === 'revoked') {
                            return (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isLoading}
                                onClick={() => handleReactivate(lic)}
                                className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                title="Reactivate license"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Power className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1 hidden md:inline">Reactivate</span>
                              </Button>
                            )
                          }
                          // active / expired / suspended / pending → show Revoke
                          return (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isLoading}
                              onClick={() => setRevokeTarget(lic)}
                              className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Revoke license"
                            >
                              {isLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Ban className="h-3.5 w-3.5" />
                              )}
                              <span className="ml-1 hidden md:inline">Revoke</span>
                            </Button>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate License Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="bg-gray-950 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
              Generate License
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Issue a new activation key for a client. Serial + license keys are auto-generated.
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
                <Label className="text-gray-300 text-xs">Package</Label>
                <Select
                  value={form.packageId}
                  onValueChange={(v) => setForm((f) => ({ ...f, packageId: v }))}
                >
                  <SelectTrigger
                    className="text-white"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">ERP System</Label>
                <Select
                  value={form.erpSystemId}
                  onValueChange={(v) => setForm((f) => ({ ...f, erpSystemId: v }))}
                >
                  <SelectTrigger
                    className="text-white"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {erpOptions.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">License Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger
                    className="text-white"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="perpetual">Perpetual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs">Expires At</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Max Users
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="5"
                  value={form.maxUsers}
                  onChange={(e) => setForm((f) => ({ ...f, maxUsers: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs flex items-center gap-1.5">
                  <Smartphone className="h-3 w-3" /> Max Devices
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="3"
                  value={form.maxDevices}
                  onChange={(e) => setForm((f) => ({ ...f, maxDevices: e.target.value }))}
                  className="text-white"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>
            <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: 'var(--secondary)', border: '1px solid var(--gg-separator)' }}>
              <Building2 className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                The serial key + license key will be auto-generated using a randomized
                alphanumeric format (e.g. <span className="font-mono text-gray-300">AF-LIC-XXXXXXXX-XXXXXXXX</span>).
                Provide an expiration date or leave empty for perpetual.
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
              onClick={handleGenerate}
              disabled={creating || !form.clientId}
              className="hover:opacity-90 text-white gap-1.5"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke License Confirmation Dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent
          className="bg-gray-950 text-white sm:max-w-md"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-400" />
              Revoke License
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              The client will no longer be able to activate new devices using this key.
              The license can be reactivated later from the same row.
            </DialogDescription>
          </DialogHeader>
          {revokeTarget && (
            <div
              className="rounded-lg p-3 space-y-1.5 text-sm"
              style={{ background: 'var(--secondary)', border: '1px solid var(--gg-separator)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Client</span>
                <span className="text-white truncate text-right">
                  {clientDisplay(revokeTarget.client)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Serial</span>
                <span className="font-mono text-xs text-gray-300 truncate text-right">
                  {revokeTarget.serialKey}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Current Status</span>
                <LicenseStatusBadge status={revokeTarget.status} />
              </div>
            </div>
          )}
          <DialogFooter className="mt-2">
            <Button
              variant="ghost"
              onClick={() => setRevokeTarget(null)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevokeConfirm}
              disabled={!revokeTarget || actionLoadingId === revokeTarget?.id}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
            >
              {actionLoadingId === revokeTarget?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Revoke License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
