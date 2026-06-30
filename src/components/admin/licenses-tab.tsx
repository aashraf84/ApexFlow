'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Copy,
  Check,
  KeyRound,
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface License {
  id: string
  serialKey: string
  licenseKey: string
  clientName: string | null
  erpName: string | null
  type: 'trial' | 'standard' | 'professional' | 'enterprise'
  status: 'active' | 'expired' | 'revoked'
  maxUsers: number
  maxDevices: number
  activatedAt: string | null
  expiresAt: string | null
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

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const typeStyles: Record<string, string> = {
  trial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  standard: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
  professional: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
  enterprise: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  expired: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
}

/* ------------------------------------------------------------------ */
/*  Copy Button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-7 h-7 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LicensesTab() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [erpSystems, setErpSystems] = useState<ErpSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    erpSystemId: '',
    type: 'standard' as 'trial' | 'standard' | 'professional' | 'enterprise',
    maxUsers: '5',
    maxDevices: '3',
    expiresAt: '',
  })

  /* ---------- Fetch licenses ---------- */
  const fetchLicenses = useCallback(async () => {
    try {
      const res = await fetch('/api/licenses')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLicenses(Array.isArray(data.licenses) ? data.licenses : [])
    } catch {
      toast.error('Failed to load licenses')
      setLicenses([])
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- Fetch dropdown data ---------- */
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
    fetchLicenses()
    fetchDropdownData()
  }, [fetchLicenses, fetchDropdownData])

  /* ---------- Filtered list ---------- */
  const filtered = licenses.filter((lic) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (lic.serialKey ?? '').toLowerCase().includes(q) ||
      (lic.licenseKey ?? '').toLowerCase().includes(q) ||
      (lic.clientName ?? '').toLowerCase().includes(q)
    const matchesType = filterType === 'all' || lic.type === filterType
    return matchesSearch && matchesType
  })

  /* ---------- Generate License ---------- */
  const handleGenerate = async () => {
    if (!formData.clientId || !formData.erpSystemId) {
      toast.error('Please select a client and ERP system')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          erpSystemId: formData.erpSystemId,
          type: formData.type,
          maxUsers: Number(formData.maxUsers) || 5,
          maxDevices: Number(formData.maxDevices) || 3,
          expiresAt: formData.expiresAt || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('License generated successfully')
        await fetchLicenses()
      } else {
        toast.error(data.error || 'Failed to generate license')
      }
    } catch {
      toast.error('Network error — please try again')
    }
    setSubmitting(false)
    setShowGenerateDialog(false)
    setFormData({
      clientId: '',
      erpSystemId: '',
      type: 'standard',
      maxUsers: '5',
      maxDevices: '3',
      expiresAt: '',
    })
  }

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 rounded-xl bg-secondary" />
          <Skeleton className="h-10 w-44 rounded-xl bg-secondary" />
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
          <h2 className="text-xl font-bold text-foreground">Serial Keys</h2>
          <p className="text-sm text-muted-foreground">
            {licenses.length} total license{licenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowGenerateDialog(true)}
          className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl btn-glow"
        >
          <Plus className="w-4 h-4 mr-2" /> Generate License
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by key or client..."
            className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-44 bg-secondary border-border rounded-xl text-foreground">
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
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
          <h3 className="text-lg font-semibold text-foreground mb-1">No licenses found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Generate your first license to get started.'}
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
                  <TableHead className="text-muted-foreground">Serial Key</TableHead>
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">ERP</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Expires</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Max Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((lic) => (
                    <motion.tr
                      key={lic.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-border hover:bg-accent transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-[var(--gg-teal)] shrink-0" />
                          <span className="text-sm font-mono font-medium text-foreground">
                            {lic.serialKey}
                          </span>
                          <CopyButton text={lic.serialKey} />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lic.clientName ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {lic.erpName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`capitalize ${typeStyles[lic.type] ?? ''}`}
                        >
                          {lic.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`capitalize ${statusStyles[lic.status] ?? ''}`}
                        >
                          {lic.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        {formatDate(lic.expiresAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {lic.maxUsers}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Generate License Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Generate License</DialogTitle>
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

            {/* License Type */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">License Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    type: v as License['type'],
                  })
                }
              >
                <SelectTrigger className="bg-secondary border-border rounded-xl text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Users & Max Devices */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Max Users</Label>
                <Input
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                  placeholder="5"
                  className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Max Devices</Label>
                <Input
                  type="number"
                  value={formData.maxDevices}
                  onChange={(e) => setFormData({ ...formData, maxDevices: e.target.value })}
                  placeholder="3"
                  className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground"
              />
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
