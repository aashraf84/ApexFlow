'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare,
  Mail,
  Plus,
  Search,
  Pencil,
  Trash2,
  Send,
  ArrowLeft,
  Loader2,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface ClientOption {
  id: string
  name: string
  company: string | null
}

interface SupportTicket {
  id: string
  subject: string
  clientId: string | null
  name: string
  email: string
  category: string
  priority: string
  status: string
  message: string
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string; company: string | null } | null
  _count?: { responses: number }
  responses?: TicketResponse[]
}

interface TicketResponse {
  id: string
  ticketId: string
  author: string
  message: string
  createdAt: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
  createdAt: string
  updatedAt: string
}

// ── Priority & Status Config ─────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-gray-500/15 border-gray-500/20' },
  medium: { label: 'Medium', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/20' },
  high: { label: 'High', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/20' },
  urgent: { label: 'Urgent', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/20' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock; style?: Record<string, string>; iconStyle?: Record<string, string> }> = {
  open: {
    label: 'Open',
    color: '',
    bgColor: 'border',
    icon: AlertCircle,
    style: {
      color: 'var(--gg-vermillion)',
      background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)',
      borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
    },
    iconStyle: {
      color: 'var(--gg-vermillion)',
    },
  },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'text-muted-foreground', bgColor: 'bg-gray-500/15 border-gray-500/20', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-gray-500/15 border-gray-500/20', icon: XCircle },
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  general: { label: 'General', color: 'text-muted-foreground', bgColor: 'bg-gray-500/15 border-gray-500/20' },
  technical: { label: 'Technical', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/20' },
  billing: { label: 'Billing', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/20' },
  feature_request: { label: 'Feature Request', color: 'text-purple-400', bgColor: 'bg-purple-500/15 border-purple-500/20' },
  marketing: { label: 'Marketing', color: 'text-pink-400', bgColor: 'bg-pink-500/15 border-pink-500/20' },
  notification: { label: 'Notification', color: 'text-cyan-400', bgColor: 'bg-cyan-500/15 border-cyan-500/20' },
}

const TEMPLATE_CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
  general: { color: 'text-muted-foreground', bgColor: 'bg-gray-500/15 border-gray-500/20' },
  billing: { color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/20' },
  marketing: { color: 'text-pink-400', bgColor: 'bg-pink-500/15 border-pink-500/20' },
  notification: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/15 border-cyan-500/20' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`} style={config.style}>
      <Icon className="h-3 w-3" style={config.iconStyle} />
      {config.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  )
}

// ── Loading Skeletons ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24 mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminCommunicationsPage() {
  // ── Tickets State ──
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [ticketSearch, setTicketSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null)
  const [deletingTicket, setDeletingTicket] = useState(false)

  // ── New Ticket Form ──
  const [newTicket, setNewTicket] = useState({
    subject: '',
    clientId: '',
    name: '',
    email: '',
    category: 'general',
    priority: 'medium',
    message: '',
  })
  const [creatingTicket, setCreatingTicket] = useState(false)

  // ── Clients for dropdown ──
  const [clients, setClients] = useState<ClientOption[]>([])

  // ── Email Templates State ──
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templateSearch, setTemplateSearch] = useState('')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState(false)

  // ── Template Form ──
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
  })
  const [savingTemplate, setSavingTemplate] = useState(false)

  // ── Fetch Tickets ──
  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter)

      const res = await fetch(`/api/communications/tickets?${params.toString()}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setTickets(json.data || json)
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setTicketsLoading(false)
    }
  }, [statusFilter, priorityFilter])

  // ── Fetch Clients ──
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setClients(json.data || json)
    } catch {
      // silently fail - clients are optional
    }
  }, [])

  // ── Fetch Templates ──
  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    try {
      const res = await fetch('/api/communications/email-templates')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setTemplates(json.data || json)
    } catch {
      toast.error('Failed to load email templates')
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  // ── Fetch Ticket Detail ──
  const fetchTicketDetail = useCallback(async (id: string) => {
    setTicketDetailLoading(true)
    try {
      const res = await fetch(`/api/communications/tickets/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSelectedTicket(data)
    } catch {
      toast.error('Failed to load ticket details')
    } finally {
      setTicketDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // ── Create Ticket ──
  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.name || !newTicket.email || !newTicket.message) {
      toast.error('Subject, name, email, and message are required')
      return
    }
    setCreatingTicket(true)
    try {
      const res = await fetch('/api/communications/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          clientId: newTicket.clientId || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Ticket created successfully')
      setShowTicketDialog(false)
      setNewTicket({ subject: '', clientId: '', name: '', email: '', category: 'general', priority: 'medium', message: '' })
      fetchTickets()
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setCreatingTicket(false)
    }
  }

  // ── Update Ticket Status ──
  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/communications/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Ticket status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, status: newStatus })
      }
      fetchTickets()
    } catch {
      toast.error('Failed to update ticket status')
    }
  }

  // ── Delete Ticket ──
  const handleDeleteTicket = async () => {
    if (!deleteTicketId) return
    setDeletingTicket(true)
    try {
      const res = await fetch(`/api/communications/tickets/${deleteTicketId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Ticket deleted successfully')
      if (selectedTicket?.id === deleteTicketId) {
        setSelectedTicket(null)
      }
      fetchTickets()
    } catch {
      toast.error('Failed to delete ticket')
    } finally {
      setDeletingTicket(false)
      setDeleteTicketId(null)
    }
  }

  // ── Add Response ──
  const handleAddResponse = async () => {
    if (!selectedTicket || !responseText.trim()) return
    setSubmittingResponse(true)
    try {
      const res = await fetch(`/api/communications/tickets/${selectedTicket.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'admin', message: responseText.trim() }),
      })
      if (!res.ok) throw new Error()
      toast.success('Response added')
      setResponseText('')
      fetchTicketDetail(selectedTicket.id)
    } catch {
      toast.error('Failed to add response')
    } finally {
      setSubmittingResponse(false)
    }
  }

  // ── Save Template (Create or Update) ──
  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      toast.error('Name, subject, and body are required')
      return
    }
    setSavingTemplate(true)
    try {
      if (editingTemplate) {
        const res = await fetch(`/api/communications/email-templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        })
        if (!res.ok) throw new Error()
        toast.success('Template updated successfully')
      } else {
        const res = await fetch('/api/communications/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        })
        if (!res.ok) throw new Error()
        toast.success('Template created successfully')
      }
      setShowTemplateDialog(false)
      setEditingTemplate(null)
      setTemplateForm({ name: '', subject: '', body: '', category: 'general' })
      fetchTemplates()
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSavingTemplate(false)
    }
  }

  // ── Delete Template ──
  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return
    setDeletingTemplate(true)
    try {
      const res = await fetch(`/api/communications/email-templates/${deleteTemplateId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Template deleted successfully')
      fetchTemplates()
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setDeletingTemplate(false)
      setDeleteTemplateId(null)
    }
  }

  // ── Open Edit Template Dialog ──
  const openEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
    })
    setShowTemplateDialog(true)
  }

  // ── Open New Template Dialog ──
  const openNewTemplate = () => {
    setEditingTemplate(null)
    setTemplateForm({ name: '', subject: '', body: '', category: 'general' })
    setShowTemplateDialog(true)
  }

  // ── Filter tickets by search ──
  const filteredTickets = tickets.filter((t) => {
    if (!ticketSearch) return true
    const q = ticketSearch.toLowerCase()
    return (
      t.subject.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    )
  })

  // ── Filter templates by search ──
  const filteredTemplates = templates.filter((t) => {
    if (!templateSearch) return true
    const q = templateSearch.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    )
  })

  // ── Ticket Stats ──
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Communications</h2>
        <p className="text-muted-foreground mt-1">Manage support tickets and email templates.</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)' }}>
                <MessageSquare className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-xl font-bold text-foreground">{ticketStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)' }}>
                <AlertCircle className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-xl font-bold text-foreground">{ticketStats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold text-foreground">{ticketStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-xl font-bold text-foreground">{ticketStats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }} className="border">
          <TabsTrigger value="tickets" className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_15%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_15%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]">
            <Mail className="h-4 w-4 mr-2" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: SUPPORT TICKETS
            ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="tickets" className="space-y-4">
          {selectedTicket ? (
            /* ── Ticket Detail View ── */
            <TicketDetailView
              ticket={selectedTicket}
              loading={ticketDetailLoading}
              responseText={responseText}
              setResponseText={setResponseText}
              submittingResponse={submittingResponse}
              onAddResponse={handleAddResponse}
              onUpdateStatus={handleUpdateStatus}
              onBack={() => setSelectedTicket(null)}
              onDelete={() => setDeleteTicketId(selectedTicket.id)}
            />
          ) : (
            /* ── Ticket List View ── */
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1 w-full">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search tickets..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="pl-9 border-white/10 text-foreground placeholder:text-gray-500"
                      style={{ background: 'var(--card)' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] border-white/10 text-foreground" style={{ background: 'var(--card)' }}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[140px] border-white/10 text-foreground" style={{ background: 'var(--card)' }}>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setNewTicket({ subject: '', clientId: '', name: '', email: '', category: 'general', priority: 'medium', message: '' })
                    setShowTicketDialog(true)
                  }}
                  className="hover:opacity-90 text-foreground shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ticket
                </Button>
              </div>

              {/* Tickets Table */}
              <Card className="overflow-hidden" style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
                {ticketsLoading ? (
                  <CardContent className="p-4">
                    <TableSkeleton />
                  </CardContent>
                ) : filteredTickets.length === 0 ? (
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <MessageSquare className="h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">No tickets found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {ticketSearch || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first support ticket'}
                    </p>
                  </CardContent>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-transparent">
                          <TableHead className="text-muted-foreground font-medium">Subject</TableHead>
                          <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Name</TableHead>
                          <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Category</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Priority</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                          <TableHead className="text-muted-foreground font-medium hidden sm:table-cell">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((ticket) => (
                          <TableRow
                            key={ticket.id}
                            style={{ borderColor: 'var(--gg-separator)' }}
                            className="hover:bg-white/5 cursor-pointer transition-colors"
                            onClick={() => fetchTicketDetail(ticket.id)}
                          >
                            <TableCell>
                              <div>
                                <p className="text-foreground font-medium text-sm">{ticket.subject}</p>
                                <p className="text-gray-500 text-xs mt-0.5 md:hidden">{ticket.name} · {ticket.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div>
                                <p className="text-foreground text-sm">{ticket.name}</p>
                                <p className="text-gray-500 text-xs">{ticket.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <CategoryBadge category={ticket.category} />
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={ticket.priority} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                              {formatDate(ticket.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: EMAIL TEMPLATES
            ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="templates" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-9 border-white/10 text-foreground placeholder:text-gray-500"
                style={{ background: 'var(--card)' }}
              />
            </div>
            <Button onClick={openNewTemplate} className="hover:opacity-90 text-foreground shrink-0" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          {/* Templates Grid */}
          {templatesLoading ? (
            <CardGridSkeleton />
          ) : filteredTemplates.length === 0 ? (
            <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mail className="h-12 w-12 text-gray-600 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No templates found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {templateSearch ? 'Try adjusting your search' : 'Create your first email template'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const catConfig = TEMPLATE_CATEGORY_COLORS[template.category] || TEMPLATE_CATEGORY_COLORS.general
                return (
                  <Card key={template.id} className="hover:border-white/10 transition-colors" style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-foreground text-base truncate">{template.name}</CardTitle>
                          <p className="text-muted-foreground text-sm mt-1 truncate">{template.subject}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                            onClick={() => openEditTemplate(template)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeleteTemplateId(template.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-500 text-sm line-clamp-3 mb-3">{template.body}</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${catConfig.bgColor} ${catConfig.color}`}>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(template.updatedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════════════════
          DIALOGS
          ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Create Ticket Dialog ── */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="border-white/10 text-foreground max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Support Ticket</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details to create a new support ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Subject *</Label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="border-white/10 text-foreground placeholder:text-gray-500"
                style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Name *</Label>
                <Input
                  value={newTicket.name}
                  onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                  placeholder="Contact name"
                  className="border-white/10 text-foreground placeholder:text-gray-500"
                  style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Email *</Label>
                <Input
                  type="email"
                  value={newTicket.email}
                  onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                  placeholder="Email address"
                  className="border-white/10 text-foreground placeholder:text-gray-500"
                  style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Client (optional)</Label>
                <Select value={newTicket.clientId} onValueChange={(v) => setNewTicket({ ...newTicket, clientId: v === '_none' ? '' : v })}>
                  <SelectTrigger className="border-white/10 text-foreground" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                    <SelectItem value="_none">No client</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Category</Label>
                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                  <SelectTrigger className="border-white/10 text-foreground" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Priority</Label>
              <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                <SelectTrigger className="border-white/10 text-foreground" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Message *</Label>
              <Textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="border-white/10 text-foreground placeholder:text-gray-500 resize-none"
                style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTicketDialog(false)} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} disabled={creatingTicket} className="hover:opacity-90 text-foreground" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {creatingTicket ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Email Template Dialog ── */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="border-white/10 text-foreground max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingTemplate ? 'Edit Template' : 'Create Email Template'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingTemplate ? 'Update the template details.' : 'Create a new reusable email template.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Template Name *</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g. Welcome Email"
                className="border-white/10 text-foreground placeholder:text-gray-500"
                style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Subject *</Label>
              <Input
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                placeholder="Email subject line"
                className="border-white/10 text-foreground placeholder:text-gray-500"
                style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Category</Label>
              <Select value={templateForm.category} onValueChange={(v) => setTemplateForm({ ...templateForm, category: v })}>
                <SelectTrigger className="border-white/10 text-foreground" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Body *</Label>
              <Textarea
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                placeholder="Email body content..."
                rows={8}
                className="border-white/10 text-foreground placeholder:text-gray-500 resize-none"
                style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTemplateDialog(false)} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate} className="hover:opacity-90 text-foreground" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {savingTemplate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Ticket Confirmation ── */}
      <AlertDialog open={!!deleteTicketId} onOpenChange={() => setDeleteTicketId(null)}>
        <AlertDialogContent className="border-white/10" style={{ background: 'var(--card)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this ticket? This action cannot be undone and will also delete all responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-gray-300 hover:bg-gray-700" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTicket}
              disabled={deletingTicket}
              className="bg-red-600 hover:bg-red-700 text-foreground"
            >
              {deletingTicket ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Template Confirmation ── */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent className="border-white/10" style={{ background: 'var(--card)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Template</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this email template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-gray-300 hover:bg-gray-700" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              disabled={deletingTemplate}
              className="bg-red-600 hover:bg-red-700 text-foreground"
            >
              {deletingTemplate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TICKET DETAIL VIEW COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

function TicketDetailView({
  ticket,
  loading,
  responseText,
  setResponseText,
  submittingResponse,
  onAddResponse,
  onUpdateStatus,
  onBack,
  onDelete,
}: {
  ticket: SupportTicket
  loading: boolean
  responseText: string
  setResponseText: (v: string) => void
  submittingResponse: boolean
  onAddResponse: () => void
  onUpdateStatus: (id: string, status: string) => void
  onBack: () => void
  onDelete: () => void
}) {
  const responses = ticket.responses || []

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground hover:bg-white/5 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tickets
      </Button>

      {loading ? (
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Ticket Header */}
          <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-foreground text-xl">{ticket.subject}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                    <CategoryBadge category={ticket.category} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={ticket.status} onValueChange={(v) => onUpdateStatus(ticket.id, v)}>
                    <SelectTrigger className="w-[150px] border-white/10 text-foreground h-9" style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'var(--card)' }} className="border-white/10">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 h-9 w-9" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Ticket Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm text-foreground">{ticket.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-foreground">{ticket.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm text-foreground">{ticket.client?.company || ticket.client?.name || '—'}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5 my-4" />

              {/* Original Message */}
              <div className="rounded-lg p-4" style={{ background: 'color-mix(in srgb, var(--card) 50%, black)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' }}>
                    <User className="h-3.5 w-3.5" style={{ color: 'var(--gg-vermillion)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ticket.name}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(ticket.createdAt)}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-500 border border-white/10 rounded px-2 py-0.5">Original</span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap pl-9">{ticket.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Response Thread */}
          <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                Responses ({responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {responses.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No responses yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  <div className="space-y-3 pr-4">
                    {responses.map((resp) => {
                      const isAdmin = resp.author === 'admin'
                      return (
                        <div
                          key={resp.id}
                          className={`rounded-lg p-4 ${
                            isAdmin ? '' : ''
                          }`}
                          style={isAdmin ? {
                            background: 'color-mix(in srgb, var(--gg-vermillion) 5%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                            border: '1px solid',
                          } : { background: 'color-mix(in srgb, var(--card) 50%, black)' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center`} style={isAdmin ? { background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' } : { background: 'rgba(59,130,246,0.2)' }}>
                              {isAdmin ? (
                                <User className="h-3.5 w-3.5" style={{ color: 'var(--gg-vermillion)' }} />
                              ) : (
                                <User className="h-3.5 w-3.5 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {isAdmin ? 'Admin' : ticket.name}
                              </p>
                              <p className="text-xs text-gray-500">{formatDateTime(resp.createdAt)}</p>
                            </div>
                            {isAdmin && (
                              <span className="ml-auto text-xs rounded px-2 py-0.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 15%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)', border: '1px solid' }}>
                                Staff
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap pl-9">{resp.message}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}

              <Separator className="bg-white/5 my-4" />

              {/* Add Response Form */}
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm">Add Response</Label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="border-white/10 text-foreground placeholder:text-gray-500 resize-none"
                  style={{ background: 'color-mix(in srgb, var(--card) 80%, black)' }}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={onAddResponse}
                    disabled={submittingResponse || !responseText.trim()}
                    className="hover:opacity-90 text-foreground"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    {submittingResponse ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Response
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
