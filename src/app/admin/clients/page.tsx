'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Users,
  Download,
  Plus,
  Search,
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Star,
  UserPlus,
  PhoneCall,
  Calendar,
  FileText,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
} from 'lucide-react'

// ============================================
// Types
// ============================================
interface ClientContact {
  id: string
  clientId: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ClientActivity {
  id: string
  clientId: string
  type: string
  subject: string
  notes: string | null
  createdAt: string
}

interface Deal {
  id: string
  title: string
  clientId: string | null
  value: number
  stage: string
  probability: number
  source: string | null
  expectedCloseDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface ClientData {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zipCode: string | null
  website: string | null
  industry: string | null
  status: string
  notes: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
  contacts?: ClientContact[]
  activities?: ClientActivity[]
  deals?: Deal[]
  _count?: {
    deals: number
    invoices: number
    payments: number
    subscriptions: number
  }
}

// ============================================
// Status badge helper
// ============================================
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; style?: React.CSSProperties }> = {
    active: {
      label: 'Active',
      className: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
        color: 'var(--gg-vermillion)',
        borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
      },
    },
    inactive: { label: 'Inactive', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
    prospect: { label: 'Prospect', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    churned: { label: 'Churned', className: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  }
  const c = config[status] || config.prospect
  return (
    <Badge variant="outline" className={`text-xs ${c.className}`} style={c.style}>
      {c.label}
    </Badge>
  )
}

// ============================================
// Activity icon helper
// ============================================
function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    call: <PhoneCall className="h-4 w-4 text-blue-400" />,
    email: <Mail className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />,
    meeting: <Calendar className="h-4 w-4 text-purple-400" />,
    note: <FileText className="h-4 w-4 text-amber-400" />,
    deal_update: <TrendingUp className="h-4 w-4 text-cyan-400" />,
  }
  return <>{icons[type] || <MessageSquare className="h-4 w-4 text-gray-400" />}</>
}

// ============================================
// Deal stage badge
// ============================================
function DealStageBadge({ stage }: { stage: string }) {
  const config: Record<string, { label: string; className: string; style?: React.CSSProperties }> = {
    lead: { label: 'Lead', className: 'bg-gray-500/15 text-gray-300 border-gray-500/20' },
    qualified: { label: 'Qualified', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    proposal: { label: 'Proposal', className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    negotiation: { label: 'Negotiation', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    closed_won: {
      label: 'Won',
      className: '',
      style: {
        background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
        color: 'var(--gg-vermillion)',
        borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
      },
    },
    closed_lost: { label: 'Lost', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  }
  const c = config[stage] || config.lead
  return (
    <Badge variant="outline" className={`text-xs ${c.className}`} style={c.style}>
      {c.label}
    </Badge>
  )
}

// ============================================
// Client form data
// ============================================
interface ClientFormData {
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  website: string
  industry: string
  status: string
  notes: string
}

const emptyClientForm: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  website: '',
  industry: '',
  status: 'prospect',
  notes: '',
}

// ============================================
// Main Component
// ============================================
export default function AdminClientsPage() {
  // State
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // View state
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Dialog state
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientData | null>(null)
  const [clientForm, setClientForm] = useState<ClientFormData>(emptyClientForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<ClientData | null>(null)

  // Contact dialog
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    isPrimary: false,
    notes: '',
  })

  // Activity dialog
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [activityForm, setActivityForm] = useState({
    type: 'note',
    subject: '',
    notes: '',
  })

  // Contact delete
  const [deleteContactDialogOpen, setDeleteContactDialogOpen] = useState(false)
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null)

  // ============================================
  // Fetch clients
  // ============================================
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      params.set('pageSize', '100')

      const res = await fetch(`/api/clients?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setClients(json.data || [])
      }
    } catch {
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // ============================================
  // Fetch client detail
  // ============================================
  const fetchClientDetail = async (id: string) => {
    try {
      setDetailLoading(true)
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) {
        const json = await res.json()
        setSelectedClient(json.data)
      } else {
        toast.error('Failed to load client details')
      }
    } catch {
      toast.error('Failed to load client details')
    } finally {
      setDetailLoading(false)
    }
  }

  // ============================================
  // Client CRUD
  // ============================================
  const openCreateDialog = () => {
    setEditingClient(null)
    setClientForm(emptyClientForm)
    setClientDialogOpen(true)
  }

  const openEditDialog = (client: ClientData) => {
    setEditingClient(client)
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || '',
      zipCode: client.zipCode || '',
      website: client.website || '',
      industry: client.industry || '',
      status: client.status,
      notes: client.notes || '',
    })
    setClientDialogOpen(true)
  }

  const handleClientSubmit = async () => {
    if (!clientForm.name.trim()) {
      toast.error('Client name is required')
      return
    }

    try {
      setSubmitting(true)

      if (editingClient) {
        // Update
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientForm),
        })
        if (res.ok) {
          toast.success('Client updated successfully')
          setClientDialogOpen(false)
          fetchClients()
          if (selectedClient?.id === editingClient.id) {
            fetchClientDetail(editingClient.id)
          }
        } else {
          const json = await res.json()
          toast.error(json.error || 'Failed to update client')
        }
      } else {
        // Create
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientForm),
        })
        if (res.ok) {
          toast.success('Client created successfully')
          setClientDialogOpen(false)
          fetchClients()
        } else {
          const json = await res.json()
          toast.error(json.error || 'Failed to create client')
        }
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!deletingClient) return
    try {
      const res = await fetch(`/api/clients/${deletingClient.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Client deleted successfully')
        setDeleteDialogOpen(false)
        setDeletingClient(null)
        if (selectedClient?.id === deletingClient.id) {
          setSelectedClient(null)
        }
        fetchClients()
      } else {
        toast.error('Failed to delete client')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  // ============================================
  // Bulk operations
  // ============================================
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = clients.length > 0 && selectedIds.size === clients.length
  const selectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(clients.map((c) => c.id)))
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} client(s)? This cannot be undone.`)) return
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/clients/${id}`, { method: 'DELETE' }).then((r) => r.ok)
        )
      )
      const ok = results.filter(Boolean).length
      const fail = results.length - ok
      if (fail === 0) toast.success(`Deleted ${ok} client(s)`)
      else toast.warning(`Deleted ${ok}, ${fail} failed`)
      if (selectedClient && selectedIds.has(selectedClient.id)) setSelectedClient(null)
      clearSelection()
      fetchClients()
    } catch {
      toast.error('Bulk delete failed')
    }
  }

  const exportClientsCSV = () => {
    const selected = clients.filter((c) => selectedIds.has(c.id))
    const rows = selected.length > 0 ? selected : clients
    const header = ['Name', 'Email', 'Company', 'Status', 'Industry', 'Phone', 'City', 'Country', 'CreatedAt']
    const lines = rows.map((c) =>
      [c.name, c.email, c.company, c.status, c.industry, c.phone, c.city, c.country, c.createdAt]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apexflow-clients-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rows.length} client(s) to CSV`)
  }

  // ============================================
  // Contact CRUD
  // ============================================
  const handleAddContact = async () => {
    if (!selectedClient || !contactForm.name.trim()) {
      toast.error('Contact name is required')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`/api/clients/${selectedClient.id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (res.ok) {
        toast.success('Contact added successfully')
        setContactDialogOpen(false)
        setContactForm({ name: '', email: '', phone: '', role: '', isPrimary: false, notes: '' })
        fetchClientDetail(selectedClient.id)
      } else {
        toast.error('Failed to add contact')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!selectedClient || !deletingContactId) return
    try {
      const res = await fetch(
        `/api/clients/${selectedClient.id}/contacts?contactId=${deletingContactId}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        toast.success('Contact deleted')
        setDeleteContactDialogOpen(false)
        setDeletingContactId(null)
        fetchClientDetail(selectedClient.id)
      } else {
        toast.error('Failed to delete contact')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  // ============================================
  // Activity CRUD
  // ============================================
  const handleAddActivity = async () => {
    if (!selectedClient || !activityForm.subject.trim()) {
      toast.error('Subject is required')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`/api/clients/${selectedClient.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityForm),
      })
      if (res.ok) {
        toast.success('Activity added successfully')
        setActivityDialogOpen(false)
        setActivityForm({ type: 'note', subject: '', notes: '' })
        fetchClientDetail(selectedClient.id)
      } else {
        toast.error('Failed to add activity')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================
  // Format date
  // ============================================
  const formatDate = (dateStr: string) => {
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

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // ============================================
  // Render: Loading skeletons
  // ============================================
  const renderSkeletons = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02]">
          <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 bg-white/5" />
            <Skeleton className="h-3 w-56 bg-white/5" />
          </div>
          <Skeleton className="h-6 w-20 bg-white/5" />
        </div>
      ))}
    </div>
  )

  // ============================================
  // RENDER: Client List View
  // ============================================
  const renderClientList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clients</h2>
          <p className="text-muted-foreground mt-1">Manage your client relationships and CRM</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="hover:opacity-90 text-white"
          style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search clients by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-foreground placeholder:text-gray-500"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-44 text-foreground"
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-xl border flex-wrap"
          style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
        >
          <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={exportClientsCSV} className="text-foreground">
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="text-muted-foreground">
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Client Table / Cards */}
      <Card
        style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
      >
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">{renderSkeletons()}</div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-gray-600 mb-4" />
              {search ? (
                <>
                  <p className="text-muted-foreground text-lg font-medium">No results for “{search}”</p>
                  <p className="text-gray-500 text-sm mt-1">No clients match your search</p>
                  <Button variant="outline" onClick={() => setSearch('')} className="mt-4 text-foreground">
                    Clear search
                  </Button>
                </>
              ) : statusFilter !== 'all' ? (
                <>
                  <p className="text-muted-foreground text-lg font-medium">No {statusFilter} clients</p>
                  <p className="text-gray-500 text-sm mt-1">No clients match this status filter</p>
                  <Button variant="outline" onClick={() => setStatusFilter('all')} className="mt-4 text-foreground">
                    Clear filter
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-lg font-medium">No clients yet</p>
                  <p className="text-gray-500 text-sm mt-1">Get started by adding your first client</p>
                  <Button
                    onClick={openCreateDialog}
                    className="mt-4 hover:opacity-90 text-white"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow
                      className="hover:bg-transparent"
                      style={{ borderColor: 'var(--gg-separator)' }}
                    >
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={selectAll}
                          aria-label="Select all clients"
                        />
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Company</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Industry</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Created</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="hover:bg-white/[0.03] cursor-pointer"
                        style={{ borderColor: 'var(--gg-separator)' }}
                        onClick={() => fetchClientDetail(client.id)}
                      >
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(client.id)}
                            onCheckedChange={() => toggleSelect(client.id)}
                            aria-label={`Select ${client.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center"
                              style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)' }}
                            >
                              <span
                                className="text-sm font-semibold"
                                style={{ color: 'var(--gg-vermillion)' }}
                              >
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{client.email || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{client.company || '—'}</TableCell>
                        <TableCell><StatusBadge status={client.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{client.industry || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(client.createdAt)}</TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[var(--gg-separator)]">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 hover:bg-white/[0.03] cursor-pointer"
                    onClick={() => fetchClientDetail(client.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                          <Checkbox
                            checked={selectedIds.has(client.id)}
                            onCheckedChange={() => toggleSelect(client.id)}
                            aria-label={`Select ${client.name}`}
                          />
                        </span>
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)' }}
                        >
                          <span
                            className="font-semibold"
                            style={{ color: 'var(--gg-vermillion)' }}
                          >
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{client.name}</p>
                          <p className="text-muted-foreground text-sm">{client.company || client.email || '—'}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={client.status} />
                      {client.industry && (
                        <span className="text-xs text-gray-500">{client.industry}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // ============================================
  // RENDER: Client Detail View
  // ============================================
  const renderClientDetail = () => {
    if (!selectedClient) return null

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedClient(null)}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Client Info Card */}
        <Card
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
        >
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)' }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: 'var(--gg-vermillion)' }}
                  >
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">{selectedClient.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedClient.status} />
                    {selectedClient.industry && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-white/5 text-gray-300"
                        style={{ borderColor: 'var(--gg-separator)' }}
                      >
                        {selectedClient.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(selectedClient)}
                  style={{ borderColor: 'var(--gg-separator)' }}
                  className="text-foreground hover:bg-white/5"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeletingClient(selectedClient)
                    setDeleteDialogOpen(true)
                  }}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedClient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">{selectedClient.email}</span>
                </div>
              )}
              {selectedClient.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">{selectedClient.phone}</span>
                </div>
              )}
              {selectedClient.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">{selectedClient.company}</span>
                </div>
              )}
              {selectedClient.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">{selectedClient.website}</span>
                </div>
              )}
              {(selectedClient.city || selectedClient.state || selectedClient.country) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">
                    {[selectedClient.city, selectedClient.state, selectedClient.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {selectedClient.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-muted-foreground">Created {formatDate(selectedClient.createdAt)}</span>
                </div>
              )}
            </div>
            {selectedClient.notes && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--gg-separator)' }}>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-300">{selectedClient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Deals', value: selectedClient._count?.deals ?? 0, icon: TrendingUp, color: 'text-cyan-400' },
            { label: 'Invoices', value: selectedClient._count?.invoices ?? 0, icon: FileText, color: 'text-amber-400' },
            { label: 'Payments', value: selectedClient._count?.payments ?? 0, icon: CheckCircle2, ggColor: true },
            { label: 'Contacts', value: selectedClient.contacts?.length ?? 0, icon: Users, color: 'text-purple-400' },
          ].map((stat) => (
            <Card
              key={stat.label}
              style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-lg bg-white/5 p-2 ${stat.ggColor ? '' : stat.color}`}>
                  <stat.icon
                    className="h-4 w-4"
                    {...(stat.ggColor ? { style: { color: 'var(--gg-vermillion)' } } : {})}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
            className="border"
          >
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
            >
              Contacts
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="deals"
              className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
            >
              Deals
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card
              style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-base">Contacts</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setContactForm({ name: '', email: '', phone: '', role: '', isPrimary: false, notes: '' })
                      setContactDialogOpen(true)
                    }}
                    className="hover:opacity-90 text-white"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedClient.contacts || selectedClient.contacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Users className="h-10 w-10 text-gray-600 mb-3" />
                    <p className="text-muted-foreground text-sm">No contacts yet</p>
                    <p className="text-gray-500 text-xs mt-1">Add a contact for this client</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedClient.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                            {contact.isPrimary ? (
                              <Star className="h-4 w-4 text-amber-400" />
                            ) : (
                              <User className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-foreground text-sm font-medium truncate">{contact.name}</p>
                              {contact.isPrimary && (
                                <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/20 px-1.5">
                                  Primary
                                </Badge>
                              )}
                              {contact.role && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-white/5 text-muted-foreground px-1.5"
                                  style={{ borderColor: 'var(--gg-separator)' }}
                                >
                                  {contact.role}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {contact.email && (
                                <span className="text-gray-500 text-xs truncate">{contact.email}</span>
                              )}
                              {contact.phone && (
                                <span className="text-gray-500 text-xs">{contact.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingContactId(contact.id)
                            setDeleteContactDialogOpen(true)
                          }}
                          className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card
              style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-base">Activities</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActivityForm({ type: 'note', subject: '', notes: '' })
                      setActivityDialogOpen(true)
                    }}
                    className="hover:opacity-90 text-white"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Log Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedClient.activities || selectedClient.activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Clock className="h-10 w-10 text-gray-600 mb-3" />
                    <p className="text-muted-foreground text-sm">No activities yet</p>
                    <p className="text-gray-500 text-xs mt-1">Log a call, email, or meeting</p>
                  </div>
                ) : (
                  <div className="relative max-h-96 overflow-y-auto">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-2 bottom-2 w-px bg-white/5" />
                    <div className="space-y-1">
                      {selectedClient.activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] relative">
                          <div
                            className="relative z-10 h-8 w-8 rounded-full bg-gray-800 border flex items-center justify-center shrink-0"
                            style={{ borderColor: 'var(--gg-separator)' }}
                          >
                            <ActivityIcon type={activity.type} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-foreground text-sm font-medium truncate">{activity.subject}</p>
                              <span className="text-gray-500 text-xs shrink-0">{formatDateTime(activity.createdAt)}</span>
                            </div>
                            {activity.notes && (
                              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{activity.notes}</p>
                            )}
                            <Badge
                              variant="outline"
                              className="mt-1 text-[10px] bg-white/5 text-muted-foreground px-1.5"
                              style={{ borderColor: 'var(--gg-separator)' }}
                            >
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals">
            <Card
              style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-base">Deals</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedClient.deals || selectedClient.deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <TrendingUp className="h-10 w-10 text-gray-600 mb-3" />
                    <p className="text-muted-foreground text-sm">No deals yet</p>
                    <p className="text-gray-500 text-xs mt-1">Deals for this client will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedClient.deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04]"
                      >
                        <div>
                          <p className="text-foreground text-sm font-medium">{deal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <DealStageBadge stage={deal.stage} />
                            {deal.source && (
                              <span className="text-gray-500 text-xs">{deal.source}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground text-sm font-semibold">
                            ${deal.value.toLocaleString()}
                          </p>
                          <p className="text-gray-500 text-xs">{deal.probability}% prob.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // ============================================
  // RENDER: Client Form Dialog
  // ============================================
  const renderClientDialog = () => (
    <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
      <DialogContent
        className="bg-gray-900 text-foreground max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ borderColor: 'var(--gg-separator)' }}
      >
        <DialogHeader>
          <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-gray-300">Name *</Label>
            <Input
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              placeholder="Client name"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Email</Label>
            <Input
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              placeholder="email@example.com"
              type="email"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Phone</Label>
            <Input
              value={clientForm.phone}
              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Company</Label>
            <Input
              value={clientForm.company}
              onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
              placeholder="Company name"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Industry</Label>
            <Input
              value={clientForm.industry}
              onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
              placeholder="e.g. Technology, Finance"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Status</Label>
            <Select
              value={clientForm.status}
              onValueChange={(v) => setClientForm({ ...clientForm, status: v })}
            >
              <SelectTrigger
                className="bg-gray-800 text-foreground"
                style={{ borderColor: 'var(--gg-separator)' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Website</Label>
            <Input
              value={clientForm.website}
              onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
              placeholder="https://example.com"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-gray-300">Address</Label>
            <Input
              value={clientForm.address}
              onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
              placeholder="Street address"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">City</Label>
            <Input
              value={clientForm.city}
              onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
              placeholder="City"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">State</Label>
            <Input
              value={clientForm.state}
              onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
              placeholder="State"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Country</Label>
            <Input
              value={clientForm.country}
              onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
              placeholder="Country"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Zip Code</Label>
            <Input
              value={clientForm.zipCode}
              onChange={(e) => setClientForm({ ...clientForm, zipCode: e.target.value })}
              placeholder="Zip code"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={clientForm.notes}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
              placeholder="Additional notes about this client..."
              rows={3}
              className="bg-gray-800 text-foreground placeholder:text-gray-500 resize-none"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setClientDialogOpen(false)}
            style={{ borderColor: 'var(--gg-separator)' }}
            className="text-gray-300 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClientSubmit}
            disabled={submitting}
            className="hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            {submitting ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  // ============================================
  // RENDER: Delete Confirmation Dialog
  // ============================================
  const renderDeleteDialog = () => (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent className="bg-gray-900" style={{ borderColor: 'var(--gg-separator)' }}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Delete Client</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="text-foreground font-medium">{deletingClient?.name}</span>?
            This action cannot be undone. All associated contacts, activities, and deals will also be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            style={{ borderColor: 'var(--gg-separator)' }}
            className="text-gray-300 hover:bg-white/5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteClient}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  // ============================================
  // RENDER: Contact Dialog
  // ============================================
  const renderContactDialog = () => (
    <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
      <DialogContent
        className="bg-gray-900 text-foreground max-w-md"
        style={{ borderColor: 'var(--gg-separator)' }}
      >
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Name *</Label>
            <Input
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              placeholder="Contact name"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Email</Label>
            <Input
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              placeholder="email@example.com"
              type="email"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Phone</Label>
            <Input
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Role</Label>
            <Select
              value={contactForm.role}
              onValueChange={(v) => setContactForm({ ...contactForm, role: v })}
            >
              <SelectTrigger
                className="bg-gray-800 text-foreground"
                style={{ borderColor: 'var(--gg-separator)' }}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decision_maker">Decision Maker</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={contactForm.isPrimary}
              onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
              className="h-4 w-4 rounded bg-gray-800 text-[var(--gg-vermillion)] focus:ring-[var(--gg-vermillion)]"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
            <Label htmlFor="isPrimary" className="text-gray-300 cursor-pointer">
              Primary contact
            </Label>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={contactForm.notes}
              onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
              placeholder="Notes about this contact..."
              rows={2}
              className="bg-gray-800 text-foreground placeholder:text-gray-500 resize-none"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setContactDialogOpen(false)}
            style={{ borderColor: 'var(--gg-separator)' }}
            className="text-gray-300 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddContact}
            disabled={submitting}
            className="hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            {submitting ? 'Adding...' : 'Add Contact'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  // ============================================
  // RENDER: Activity Dialog
  // ============================================
  const renderActivityDialog = () => (
    <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
      <DialogContent
        className="bg-gray-900 text-foreground max-w-md"
        style={{ borderColor: 'var(--gg-separator)' }}
      >
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Type</Label>
            <Select
              value={activityForm.type}
              onValueChange={(v) => setActivityForm({ ...activityForm, type: v })}
            >
              <SelectTrigger
                className="bg-gray-800 text-foreground"
                style={{ borderColor: 'var(--gg-separator)' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">📞 Call</SelectItem>
                <SelectItem value="email">✉️ Email</SelectItem>
                <SelectItem value="meeting">📅 Meeting</SelectItem>
                <SelectItem value="note">📝 Note</SelectItem>
                <SelectItem value="deal_update">💰 Deal Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Subject *</Label>
            <Input
              value={activityForm.subject}
              onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
              placeholder="Activity subject"
              className="bg-gray-800 text-foreground placeholder:text-gray-500"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={activityForm.notes}
              onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
              placeholder="Activity details..."
              rows={3}
              className="bg-gray-800 text-foreground placeholder:text-gray-500 resize-none"
              style={{ borderColor: 'var(--gg-separator)' }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setActivityDialogOpen(false)}
            style={{ borderColor: 'var(--gg-separator)' }}
            className="text-gray-300 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddActivity}
            disabled={submitting}
            className="hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            {submitting ? 'Saving...' : 'Log Activity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  // ============================================
  // RENDER: Delete Contact Confirmation
  // ============================================
  const renderDeleteContactDialog = () => (
    <AlertDialog open={deleteContactDialogOpen} onOpenChange={setDeleteContactDialogOpen}>
      <AlertDialogContent className="bg-gray-900" style={{ borderColor: 'var(--gg-separator)' }}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Delete Contact</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to remove this contact? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            style={{ borderColor: 'var(--gg-separator)' }}
            className="text-gray-300 hover:bg-white/5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteContact}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  // ============================================
  // Main Render
  // ============================================
  return (
    <div className="space-y-6">
      {detailLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-24 bg-white/5" />
          <Card
            style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-xl bg-white/5" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 bg-white/5" />
                  <Skeleton className="h-5 w-24 bg-white/5" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-40 bg-white/5" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : selectedClient ? (
        renderClientDetail()
      ) : (
        renderClientList()
      )}

      {renderClientDialog()}
      {renderDeleteDialog()}
      {renderContactDialog()}
      {renderActivityDialog()}
      {renderDeleteContactDialog()}
    </div>
  )
}
