'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  LifeBuoy,
  Plus,
  Search,
  Send,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  ChevronRight,
  User,
  Mail,
  Tag,
  RefreshCw,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface TicketClient {
  id: string
  companyName: string | null
  contactPerson: string | null
  name: string | null
  company: string | null
  email: string | null
  phone?: string | null
}

interface TicketResponse {
  id: string
  ticketId: string
  author: string
  message: string
  createdAt: string
  updatedAt: string
}

interface SupportTicket {
  id: string
  subject: string
  clientId: string | null
  name: string
  email: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent' | string
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string
  message: string
  createdAt: string
  updatedAt: string
  client?: TicketClient | null
  _count?: { responses: number }
  responses?: TicketResponse[]
}

interface ClientOption {
  id: string
  companyName: string
  contactPerson: string
  email: string
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function priorityBadge(priority: string): { label: string; className: string; style?: React.CSSProperties } {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        className: '',
        style: {
          background: 'color-mix(in srgb, var(--gg-vermillion) 18%, transparent)',
          color: 'var(--gg-vermillion)',
          borderColor: 'color-mix(in srgb, var(--gg-vermillion) 25%, transparent)',
        },
      }
    case 'high':
      return { label: 'High', className: 'bg-red-500/15 text-red-400 border-red-500/25' }
    case 'medium':
      return { label: 'Medium', className: 'bg-amber-500/15 text-amber-400 border-amber-500/25' }
    case 'low':
      return { label: 'Low', className: 'bg-gray-500/15 text-gray-300 border-gray-500/25' }
    default:
      return { label: priority, className: 'bg-gray-500/15 text-gray-300 border-gray-500/25' }
  }
}

function statusBadge(status: string): { label: string; className: string; style?: React.CSSProperties } {
  switch (status) {
    case 'open':
      return { label: 'Open', className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' }
    case 'in_progress':
      return { label: 'In Progress', className: 'bg-purple-500/15 text-purple-400 border-purple-500/25' }
    case 'resolved':
      return { label: 'Resolved', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' }
    case 'closed':
      return { label: 'Closed', className: 'bg-gray-500/15 text-gray-400 border-gray-500/25' }
    default:
      return { label: status, className: 'bg-gray-500/15 text-gray-400 border-gray-500/25' }
  }
}

function clientDisplayName(client?: TicketClient | null): string {
  if (!client) return '—'
  return client.companyName || client.company || client.contactPerson || client.name || 'Unknown Client'
}

function formatDate(dateStr: string): string {
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

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
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

function relativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr).getTime()
    const diff = Date.now() - d
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return formatDate(dateStr)
  } catch {
    return dateStr
  }
}

function isToday(dateStr: string): boolean {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  icon: typeof LifeBuoy
  accent?: 'vermillion' | 'amber' | 'emerald' | 'gray'
}) {
  const colorMap: Record<string, string> = {
    vermillion: 'var(--gg-vermillion)',
    amber: 'var(--gg-amber)',
    emerald: '#10b981',
    gray: '#9ca3af',
  }
  const color = accent ? colorMap[accent] : '#9ca3af'
  return (
    <Card
      style={{
        background: 'var(--secondary)',
        borderColor: 'var(--gg-separator)',
      }}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className="rounded-lg p-2"
          style={{
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export function SupportManager() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all')

  // New ticket dialog
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [newForm, setNewForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    clientId: '',
    assignee: '',
    name: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Detail sheet
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [responseAuthor, setResponseAuthor] = useState('')
  const [responding, setResponding] = useState(false)

  // Status update (inline on detail)
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTicket, setDeletingTicket] = useState<SupportTicket | null>(null)

  // ── Fetch ticket list ──
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/support?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setTickets(json.tickets || [])
      } else {
        toast.error('Failed to load tickets')
      }
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, search])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // ── Fetch client options (lightweight list, only on dialog open) ──
  useEffect(() => {
    if (!newDialogOpen) return
    let cancelled = false
    ;(async () => {
      try {
        // Reuse the existing clients list endpoint (no auth wrapper required for read).
        const res = await fetch('/api/clients')
        if (!res.ok) return
        const json = await res.json()
        const list: ClientOption[] = (json.data || json.clients || []).map((c: any) => ({
          id: c.id,
          companyName: c.companyName || c.company || c.name || 'Unknown',
          contactPerson: c.contactPerson || c.name || '',
          email: c.email || '',
        }))
        if (!cancelled) setClients(list)
      } catch {
        // silent: clients are an optional helper
      }
    })()
    return () => {
      cancelled = true
    }
  }, [newDialogOpen])

  // ── Fetch full ticket detail ──
  const fetchTicketDetail = useCallback(async (id: string) => {
    try {
      setDetailLoading(true)
      const res = await fetch(`/api/admin/support/${id}`)
      if (res.ok) {
        const json = await res.json()
        setSelectedTicket(json.ticket || null)
        // Pre-fill author with the ticket's last response author or admin user name (read from cookie session)
        if (json.ticket?.responses?.length) {
          setResponseAuthor(json.ticket.responses[json.ticket.responses.length - 1].author || '')
        }
      } else {
        toast.error('Failed to load ticket')
      }
    } catch {
      toast.error('Failed to load ticket')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // ── Open detail sheet ──
  const openDetail = (id: string) => {
    setSelectedTicketId(id)
    setSelectedTicket(null)
    setResponseText('')
  }

  // When sheet opens, load detail
  useEffect(() => {
    if (selectedTicketId) fetchTicketDetail(selectedTicketId)
  }, [selectedTicketId, fetchTicketDetail])

  // ── Create ticket ──
  const handleCreate = async () => {
    if (!newForm.subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!newForm.description.trim()) {
      toast.error('Description is required')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newForm.subject,
          description: newForm.description,
          priority: newForm.priority,
          clientId: newForm.clientId || undefined,
          assignee: newForm.assignee,
          name: newForm.name,
          email: newForm.email,
        }),
      })
      if (res.ok) {
        toast.success('Ticket created')
        setNewDialogOpen(false)
        setNewForm({
          subject: '',
          description: '',
          priority: 'medium',
          clientId: '',
          assignee: '',
          name: '',
          email: '',
        })
        fetchTickets()
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j.error || 'Failed to create ticket')
      }
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Add response ──
  const handleAddResponse = async () => {
    if (!selectedTicket || !selectedTicketId) return
    if (!responseAuthor.trim()) {
      toast.error('Your name is required')
      return
    }
    if (!responseText.trim()) {
      toast.error('Response cannot be empty')
      return
    }
    try {
      setResponding(true)
      const res = await fetch(`/api/admin/support/${selectedTicketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          author: responseAuthor.trim(),
          message: responseText.trim(),
        }),
      })
      if (res.ok) {
        toast.success('Response added')
        setResponseText('')
        fetchTicketDetail(selectedTicketId)
        fetchTickets()
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j.error || 'Failed to add response')
      }
    } catch {
      toast.error('Failed to add response')
    } finally {
      setResponding(false)
    }
  }

  // ── Update status ──
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicketId) return
    try {
      setStatusUpdating(true)
      const res = await fetch(`/api/admin/support/${selectedTicketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`)
        fetchTicketDetail(selectedTicketId)
        fetchTickets()
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j.error || 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  // ── Delete ticket ──
  const handleDelete = async () => {
    if (!deletingTicket) return
    try {
      const res = await fetch(`/api/admin/support/${deletingTicket.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Ticket deleted')
        setDeleteDialogOpen(false)
        if (selectedTicketId === deletingTicket.id) {
          setSelectedTicketId(null)
          setSelectedTicket(null)
        }
        setDeletingTicket(null)
        fetchTickets()
      } else {
        toast.error('Failed to delete ticket')
      }
    } catch {
      toast.error('Failed to delete ticket')
    }
  }

  // ── Derived stats ──
  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((t) => t.status === 'open').length
    const urgent = tickets.filter((t) => t.priority === 'urgent').length
    const resolvedToday = tickets.filter(
      (t) => t.status === 'resolved' && isToday(t.updatedAt)
    ).length
    return { total, open, urgent, resolvedToday }
  }, [tickets])

  // ── Tab filter ──
  const tabbedTickets = useMemo(() => {
    if (activeTab === 'all') return tickets
    return tickets.filter((t) => t.status === activeTab)
  }, [tickets, activeTab])

  // ── Loading skeletons ──
  const renderSkeletons = () => (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--secondary)' }}>
          <Skeleton className="h-9 w-9 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 bg-white/5" />
            <Skeleton className="h-3 w-1/3 bg-white/5" />
          </div>
          <Skeleton className="h-6 w-16 bg-white/5" />
          <Skeleton className="h-6 w-16 bg-white/5" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Support Tickets</h2>
          <p className="text-muted-foreground mt-1">
            Track, prioritize and resolve customer support requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            className="text-foreground"
            style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setNewDialogOpen(true)}
            className="text-white hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Tickets" value={stats.total} icon={Inbox} accent="gray" />
        <StatCard label="Open" value={stats.open} icon={Clock} accent="amber" />
        <StatCard label="Urgent" value={stats.urgent} icon={AlertTriangle} accent="vermillion" />
        <StatCard label="Resolved Today" value={stats.resolvedToday} icon={CheckCircle2} accent="emerald" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by subject, name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-foreground placeholder:text-gray-500"
            style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger
            className="w-full sm:w-44 text-foreground"
            style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-44 text-foreground"
            style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs by status */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="border w-full sm:w-auto overflow-x-auto"
          style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
        >
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
          >
            All Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger
            value="open"
            className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
          >
            Open
          </TabsTrigger>
          <TabsTrigger
            value="in_progress"
            className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
          >
            Resolved
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="data-[state=active]:bg-[var(--gg-vermillion)] data-[state=active]:text-white text-muted-foreground"
          >
            Closed
          </TabsTrigger>
        </TabsList>

        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card
              style={{
                background: 'var(--secondary)',
                borderColor: 'var(--gg-separator)',
              }}
            >
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4">{renderSkeletons()}</div>
                ) : tabbedTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <LifeBuoy className="h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">
                      No {tab === 'all' ? '' : tab.replace('_', ' ')} tickets
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {search || priorityFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create a new ticket to get started'}
                    </p>
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
                            <TableHead className="text-muted-foreground font-medium">Subject</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Client</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Priority</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Assignee</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Created</TableHead>
                            <TableHead className="w-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tabbedTickets.map((ticket) => {
                            const pb = priorityBadge(ticket.priority)
                            const sb = statusBadge(ticket.status)
                            return (
                              <TableRow
                                key={ticket.id}
                                className="hover:bg-white/[0.03] cursor-pointer"
                                style={{ borderColor: 'var(--gg-separator)' }}
                                onClick={() => openDetail(ticket.id)}
                              >
                                <TableCell className="font-medium text-foreground max-w-xs">
                                  <div className="truncate">{ticket.subject}</div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {ticket._count?.responses ? `${ticket._count.responses} response(s)` : 'No responses'}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {clientDisplayName(ticket.client)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-xs ${pb.className}`} style={pb.style}>
                                    {pb.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-xs ${sb.className}`} style={sb.style}>
                                    {sb.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {ticket.responses?.[0]?.author || ticket.name || '—'}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {formatDate(ticket.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile cards */}
                    <div
                      className="md:hidden divide-y"
                      style={{ borderColor: 'var(--gg-separator)' }}
                    >
                      {tabbedTickets.map((ticket) => {
                        const pb = priorityBadge(ticket.priority)
                        const sb = statusBadge(ticket.status)
                        return (
                          <div
                            key={ticket.id}
                            className="p-4 hover:bg-white/[0.03] cursor-pointer"
                            onClick={() => openDetail(ticket.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-foreground font-medium flex-1 line-clamp-2">
                                {ticket.subject}
                              </p>
                              <ChevronRight className="h-4 w-4 text-gray-600 shrink-0 mt-1" />
                            </div>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`text-xs ${pb.className}`} style={pb.style}>
                                {pb.label}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${sb.className}`} style={sb.style}>
                                {sb.label}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {clientDisplayName(ticket.client)}
                              </span>
                              <span className="text-xs text-gray-600">·</span>
                              <span className="text-xs text-gray-500">
                                {relativeTime(ticket.createdAt)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* ── New Ticket Dialog ── */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent
          className="sm:max-w-lg"
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-subject" className="text-foreground">
                Subject <span style={{ color: 'var(--gg-vermillion)' }}>*</span>
              </Label>
              <Input
                id="t-subject"
                value={newForm.subject}
                onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                placeholder="Brief summary of the issue"
                className="text-foreground placeholder:text-gray-500"
                style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc" className="text-foreground">
                Description <span style={{ color: 'var(--gg-vermillion)' }}>*</span>
              </Label>
              <Textarea
                id="t-desc"
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="text-foreground placeholder:text-gray-500 resize-none"
                style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="t-priority" className="text-foreground">Priority</Label>
                <Select
                  value={newForm.priority}
                  onValueChange={(v) => setNewForm({ ...newForm, priority: v })}
                >
                  <SelectTrigger
                    id="t-priority"
                    className="text-foreground"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-client" className="text-foreground">Client</Label>
                <Select
                  value={newForm.clientId}
                  onValueChange={(v) => setNewForm({ ...newForm, clientId: v })}
                >
                  <SelectTrigger
                    id="t-client"
                    className="text-foreground"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No clients available
                      </SelectItem>
                    ) : (
                      clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.companyName}
                          {c.contactPerson ? ` — ${c.contactPerson}` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-assignee" className="text-foreground">Assignee (internal)</Label>
              <Input
                id="t-assignee"
                value={newForm.assignee}
                onChange={(e) => setNewForm({ ...newForm, assignee: e.target.value })}
                placeholder="Name of the support agent handling this ticket"
                className="text-foreground placeholder:text-gray-500"
                style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
              />
            </div>
            {!newForm.clientId && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'var(--gg-separator)' }}>
                <div className="space-y-2">
                  <Label htmlFor="t-name" className="text-foreground">Reporter Name</Label>
                  <Input
                    id="t-name"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="Name"
                    className="text-foreground placeholder:text-gray-500"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-email" className="text-foreground">Reporter Email</Label>
                  <Input
                    id="t-email"
                    type="email"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="text-foreground placeholder:text-gray-500"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setNewDialogOpen(false)}
              className="text-foreground"
              style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="text-white hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Ticket Detail Sheet ── */}
      <Sheet
        open={!!selectedTicketId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketId(null)
            setSelectedTicket(null)
          }
        }}
      >
        <SheetContent
          side="right"
          className="sm:max-w-xl w-full p-0 flex flex-col"
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <SheetHeader
            className="p-4 border-b"
            style={{ borderColor: 'var(--gg-separator)' }}
          >
            <SheetTitle className="text-foreground text-base">
              {detailLoading || !selectedTicket ? 'Loading ticket…' : selectedTicket.subject}
            </SheetTitle>
            {selectedTicket && (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {(() => {
                  const pb = priorityBadge(selectedTicket.priority)
                  const sb = statusBadge(selectedTicket.status)
                  return (
                    <>
                      <Badge variant="outline" className={`text-xs ${pb.className}`} style={pb.style}>
                        {pb.label}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${sb.className}`} style={sb.style}>
                        {sb.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Opened {formatDate(selectedTicket.createdAt)}
                      </span>
                    </>
                  )
                })()}
              </div>
            )}
          </SheetHeader>

          {detailLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-2/3 bg-white/5" />
              <Skeleton className="h-20 w-full bg-white/5" />
              <Skeleton className="h-6 w-1/3 bg-white/5" />
            </div>
          ) : !selectedTicket ? (
            <div className="p-4 text-center text-muted-foreground">Ticket not found</div>
          ) : (
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">
                {/* Client info */}
                {selectedTicket.client && (
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      background: 'var(--secondary)',
                      borderColor: 'var(--gg-separator)',
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                      <span className="font-medium text-foreground">
                        {clientDisplayName(selectedTicket.client)}
                      </span>
                    </div>
                    {selectedTicket.client.email && (
                      <div className="flex items-center gap-2 text-xs mt-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{selectedTicket.client.email}</span>
                      </div>
                    )}
                    {selectedTicket.category && (
                      <div className="flex items-center gap-2 text-xs mt-1.5 text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="capitalize">{selectedTicket.category}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Original message */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">
                    Original Message
                  </p>
                  <div
                    className="rounded-lg p-3 border text-sm text-gray-200 whitespace-pre-wrap"
                    style={{
                      background: 'var(--secondary)',
                      borderColor: 'var(--gg-separator)',
                    }}
                  >
                    {selectedTicket.message}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5">
                    Submitted by {selectedTicket.name || selectedTicket.email || 'Unknown'}
                  </p>
                </div>

                {/* Responses */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Responses ({selectedTicket.responses?.length || 0})
                  </p>
                  {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTicket.responses.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-lg p-3 border"
                          style={{
                            background: 'var(--secondary)',
                            borderColor: 'var(--gg-separator)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--gg-vermillion)' }}
                            >
                              {r.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(r.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No responses yet</p>
                  )}
                </div>

                {/* Add response */}
                <div
                  className="rounded-lg p-3 border space-y-3"
                  style={{
                    background: 'var(--secondary)',
                    borderColor: 'var(--gg-separator)',
                  }}
                >
                  <Label htmlFor="r-author" className="text-foreground text-sm">
                    Your Name
                  </Label>
                  <Input
                    id="r-author"
                    value={responseAuthor}
                    onChange={(e) => setResponseAuthor(e.target.value)}
                    placeholder="Your name"
                    className="text-foreground placeholder:text-gray-500"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--gg-separator)',
                    }}
                  />
                  <Label htmlFor="r-text" className="text-foreground text-sm">
                    Reply
                  </Label>
                  <Textarea
                    id="r-text"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                    className="text-foreground placeholder:text-gray-500 resize-none"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--gg-separator)',
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddResponse}
                    disabled={responding}
                    className="text-white hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    {responding ? 'Sending...' : 'Add Response'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Footer actions */}
          {selectedTicket && (
            <div
              className="p-3 border-t flex items-center gap-2 flex-wrap"
              style={{ borderColor: 'var(--gg-separator)', background: 'var(--secondary)' }}
            >
              <Select
                value={selectedTicket.status}
                onValueChange={(v) => handleStatusChange(v)}
                disabled={statusUpdating}
                  >
                  <SelectTrigger
                    className="w-36 h-9 text-foreground"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
                  >
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeletingTicket(selectedTicket)
                  setDeleteDialogOpen(true)
                }}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Delete confirm ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete ticket?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {deletingTicket
                ? `This will permanently delete "${deletingTicket.subject}" and all of its responses.`
                : 'This will permanently delete the ticket and all of its responses.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-foreground"
              style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
