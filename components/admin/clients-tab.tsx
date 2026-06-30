'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  Eye,
  Pencil,
  Trash2,
  Inbox,
  RefreshCw,
  Shirt,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'

interface Client {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  status: 'trial' | 'active' | 'inactive'
  industry: string | null
  erpName: string | null
  erpSystemId: string | null
  licenseType: string | null
  databaseStatus: string | null
  source: 'local' | 'erp'
  createdAt: string
}

interface ERPSystem {
  id: string
  name: string
}

const STATUS_CONFIG = {
  trial: {
    label: 'Trial',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
} as const

const INDUSTRIES = ['Apparel', 'Hospitality', 'Education', 'Manufacturing', 'Retail', 'Healthcare', 'Pharmaceutical', 'Finance', 'Other']

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([])
  const [erpSystems, setErpSystems] = useState<ERPSystem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    industry: '',
    erpSystemId: '',
    status: 'trial' as 'trial' | 'active' | 'inactive',
  })

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setClients(json.clients ?? [])
    } catch (err) {
      console.error('[ClientsTab] Fetch error:', err)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchErpSystems = useCallback(async () => {
    try {
      const res = await fetch('/api/erp-systems')
      if (!res.ok) return
      const json = await res.json()
      setErpSystems(json.data ?? json.erpSystems ?? [])
    } catch {
      // Non-critical; ERP dropdown will just be empty
    }
  }, [])

  useEffect(() => {
    fetchClients()
    fetchErpSystems()
  }, [fetchClients, fetchErpSystems])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (c.companyName ?? '').toLowerCase().includes(q) ||
      (c.contactPerson ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      industry: '',
      erpSystemId: '',
      status: 'trial',
    })
  }

  const handleAddClient = async () => {
    if (!formData.companyName.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      toast.error('Company name, contact person, and email are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
          erpSystemId: formData.erpSystemId || undefined,
          status: formData.status,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success('Client added successfully')
        setShowAddDialog(false)
        resetForm()
        fetchClients()
      } else {
        toast.error(json.error || 'Failed to add client')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (clientId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`)
        fetchClients()
      } else {
        const json = await res.json()
        toast.error(json.message || 'Failed to update status')
      }
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Client deleted')
        fetchClients()
      } else {
        const json = await res.json()
        toast.error(json.message || 'Failed to delete client')
      }
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setShowViewDialog(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl bg-card" />
        <Skeleton className="h-96 rounded-2xl bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Clients</h2>
          <p className="text-sm text-muted-foreground">{clients.length} total clients across all ERPs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setLoading(true)
              fetchClients()
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setShowAddDialog(true)
            }}
            className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl btn-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Client
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border rounded-xl">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {clients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-2">No clients yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first client to get started.
          </p>
          <Button
            onClick={() => {
              resetForm()
              setShowAddDialog(true)
            }}
            className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl btn-glow"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Client
          </Button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-2">No matching clients</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      ) : (
        /* Table */
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden">
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Company</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">License</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">ERP</TableHead>
                  <TableHead className="text-muted-foreground hidden xl:table-cell">Joined</TableHead>
                  <TableHead className="text-muted-foreground w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => {
                  const statusCfg = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.trial
                  return (
                    <TableRow key={client.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-[var(--gg-teal)]" />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[160px]">
                            {client.companyName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.contactPerson}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {client.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {client.licenseType ? (
                          <Badge
                            variant="secondary"
                            className={
                              client.licenseType === 'enterprise'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : client.licenseType === 'professional'
                                ? 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20'
                                : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                            }
                          >
                            {client.licenseType}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.erpName ? (
                          <div className="flex items-center gap-1.5">
                            {client.source === 'erp' && (
                              <Shirt className="w-3 h-3 text-[var(--gg-teal)]" />
                            )}
                            <span className="text-sm text-muted-foreground">{client.erpName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
                        {formatDate(client.createdAt)}
                      </TableCell>
                      <TableCell>
                        {client.source === 'local' ? (
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
                              className="bg-card border-border text-foreground rounded-xl"
                            >
                              <DropdownMenuItem
                                className="text-sm text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer"
                                onClick={() => handleViewClient(client)}
                              >
                                <Eye className="w-4 h-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-sm text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer">
                                  <Pencil className="w-4 h-4 mr-2" /> Edit Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="bg-card border-border text-foreground rounded-xl">
                                  {(['trial', 'active', 'inactive'] as const).map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      className={`text-sm cursor-pointer ${s === client.status ? 'text-foreground' : 'text-muted-foreground'} focus:text-foreground focus:bg-accent`}
                                      disabled={s === client.status}
                                      onClick={() => handleUpdateStatus(client.id, s)}
                                    >
                                      <Badge
                                        variant="secondary"
                                        className={`mr-2 ${STATUS_CONFIG[s].className}`}
                                      >
                                        {STATUS_CONFIG[s].label}
                                      </Badge>
                                      {s === client.status && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                          Current
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator className="bg-muted" />
                              <DropdownMenuItem
                                variant="destructive"
                                className="text-sm text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                                onClick={() => handleDeleteClient(client.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Company Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Enter company name"
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Contact Person <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                placeholder="Enter contact person"
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Email <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                  className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+92-XXX-XXXXXXX"
                  className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g. Lahore"
                  className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g. Pakistan"
                  className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(v) =>
                    setFormData({ ...formData, industry: v })
                  }
                >
                  <SelectTrigger className="bg-secondary border-border rounded-xl">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">ERP System</Label>
                <Select
                  value={formData.erpSystemId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, erpSystemId: v })
                  }
                >
                  <SelectTrigger className="bg-secondary border-border rounded-xl">
                    <SelectValue placeholder="Select ERP" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {erpSystems.map((erp) => (
                      <SelectItem key={erp.id} value={erp.id}>
                        {erp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    status: v as 'trial' | 'active' | 'inactive',
                  })
                }
              >
                <SelectTrigger className="bg-secondary border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAddDialog(false)}
              className="text-muted-foreground"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={submitting}
              className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl btn-glow"
            >
              {submitting ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--gg-teal)]" />
              {selectedClient?.companyName}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge
                    variant="secondary"
                    className={STATUS_CONFIG[selectedClient.status].className}
                  >
                    {STATUS_CONFIG[selectedClient.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Industry</p>
                  <p className="text-sm">{selectedClient.industry || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                  <p className="text-sm">{selectedClient.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ERP System</p>
                  <div className="flex items-center gap-1.5">
                    {selectedClient.source === 'erp' && (
                      <Shirt className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                    )}
                    <p className="text-sm">{selectedClient.erpName || '—'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm">{selectedClient.email}</p>
              </div>
              {selectedClient.phone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm">{selectedClient.phone}</p>
                </div>
              )}
              {selectedClient.licenseType && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">License Type</p>
                  <Badge
                    variant="secondary"
                    className={
                      selectedClient.licenseType === 'enterprise'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : selectedClient.licenseType === 'professional'
                        ? 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20'
                        : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                    }
                  >
                    {selectedClient.licenseType}
                  </Badge>
                </div>
              )}
              {selectedClient.databaseStatus && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Database Status</p>
                  <Badge
                    variant="secondary"
                    className={
                      selectedClient.databaseStatus === 'ready'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }
                  >
                    {selectedClient.databaseStatus}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">City</p>
                  <p className="text-sm">{selectedClient.city || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Country</p>
                  <p className="text-sm">{selectedClient.country || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Joined</p>
                <p className="text-sm">{formatDate(selectedClient.createdAt)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowViewDialog(false)}
              className="text-muted-foreground"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
