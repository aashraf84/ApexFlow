'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Handshake,
  Plus,
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  ArrowRightLeft,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { DealType, DealStage, DealActivityType, ClientType } from '@/types/admin'

// ── Stage Config ──────────────────────────────────────────────
interface StageConfig {
  key: DealStage
  label: string
  color: string
  bgColor: string
  borderColor: string
  dotColor: string
  colorStyle?: React.CSSProperties
  bgColorStyle?: React.CSSProperties
  borderColorStyle?: React.CSSProperties
  dotColorStyle?: React.CSSProperties
}

const STAGES: StageConfig[] = [
  { key: 'lead', label: 'Lead', color: 'text-muted-foreground', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20', dotColor: 'bg-gray-400' },
  { key: 'qualified', label: 'Qualified', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', dotColor: 'bg-amber-400' },
  { key: 'proposal', label: 'Proposal', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', dotColor: 'bg-blue-400' },
  { key: 'negotiation', label: 'Negotiation', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', dotColor: 'bg-purple-400' },
  {
    key: 'closed_won',
    label: 'Closed Won',
    color: '',
    bgColor: '',
    borderColor: '',
    dotColor: '',
    colorStyle: { color: 'var(--gg-vermillion)' },
    bgColorStyle: { background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)' },
    borderColorStyle: { borderColor: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' },
    dotColorStyle: { background: 'var(--gg-vermillion)' },
  },
  { key: 'closed_lost', label: 'Closed Lost', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', dotColor: 'bg-red-400' },
]

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'other', label: 'Other' },
]

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'note', label: 'Note', icon: MessageSquare },
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'stage_change', label: 'Stage Change', icon: ArrowRightLeft },
]

// ── Helpers ───────────────────────────────────────────────────
function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getStageConfig(stage: DealStage) {
  return STAGES.find(s => s.key === stage) || STAGES[0]
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'call': return Phone
    case 'email': return Mail
    case 'stage_change': return ArrowRightLeft
    case 'value_change': return DollarSign
    default: return MessageSquare
  }
}

function getActivityColor(type: string): { className: string; style?: React.CSSProperties } {
  switch (type) {
    case 'call': return { className: 'text-blue-400 bg-blue-500/10' }
    case 'email': return { className: 'text-purple-400 bg-purple-500/10' }
    case 'stage_change': return { className: 'text-amber-400 bg-amber-500/10' }
    case 'value_change': return { className: '', style: { color: 'var(--gg-vermillion)', background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)' } }
    default: return { className: 'text-muted-foreground bg-gray-500/10' }
  }
}

// ── Form State Type ───────────────────────────────────────────
interface DealFormData {
  title: string
  clientId: string
  value: string
  stage: DealStage
  probability: string
  source: string
  expectedCloseDate: string
  notes: string
}

const emptyForm: DealFormData = {
  title: '',
  clientId: '',
  value: '',
  stage: 'lead',
  probability: '0',
  source: '',
  expectedCloseDate: '',
  notes: '',
}

// ── Main Component ────────────────────────────────────────────
export default function AdminDealsPage() {
  // Data state
  const [deals, setDeals] = useState<DealType[]>([])
  const [clients, setClients] = useState<Pick<ClientType, 'id' | 'name' | 'company'>[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<DealType | null>(null)
  const [formData, setFormData] = useState<DealFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailDeal, setDetailDeal] = useState<DealType | null>(null)
  const [detailActivities, setDetailActivities] = useState<DealActivityType[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Activity form state
  const [activityType, setActivityType] = useState('note')
  const [activityContent, setActivityContent] = useState('')
  const [activitySubmitting, setActivitySubmitting] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)

  // Delete confirmation
  const [deleteDeal, setDeleteDeal] = useState<DealType | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Data fetching ─────────────────────────────────────────
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals')
      if (res.ok) {
        const json = await res.json()
        setDeals(json.data || [])
      }
    } catch {
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const json = await res.json()
        // API returns array directly or wrapped in { data: [...] }
        const list = Array.isArray(json) ? json : (json.data || [])
        setClients(list)
      }
    } catch {
      // Silent fail — clients dropdown just won't populate
    }
  }, [])

  useEffect(() => {
    fetchDeals()
    fetchClients()
  }, [fetchDeals, fetchClients])

  // ── Computed values ───────────────────────────────────────
  const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedPipelineValue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
  const avgDealSize = activeDeals.length > 0 ? totalPipelineValue / activeDeals.length : 0

  // Group deals by stage
  const dealsByStage = STAGES.map(stage => ({
    ...stage,
    deals: deals.filter(d => d.stage === stage.key),
    totalValue: deals.filter(d => d.stage === stage.key).reduce((sum, d) => sum + d.value, 0),
  }))

  // ── Form handlers ─────────────────────────────────────────
  function openCreateForm() {
    setEditingDeal(null)
    setFormData(emptyForm)
    setFormOpen(true)
  }

  function openEditForm(deal: DealType) {
    setEditingDeal(deal)
    setFormData({
      title: deal.title,
      clientId: deal.clientId || '',
      value: deal.value.toString(),
      stage: deal.stage,
      probability: deal.probability.toString(),
      source: deal.source || '',
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
      notes: deal.notes || '',
    })
    setFormOpen(true)
  }

  async function handleSubmit() {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingDeal) {
        // Update
        const res = await fetch(`/api/deals/${editingDeal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            clientId: formData.clientId || null,
            value: formData.value,
            stage: formData.stage,
            probability: formData.probability,
            source: formData.source || null,
            expectedCloseDate: formData.expectedCloseDate || null,
            notes: formData.notes || null,
          }),
        })
        if (!res.ok) throw new Error()
        toast.success('Deal updated successfully')
      } else {
        // Create
        const res = await fetch('/api/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            clientId: formData.clientId || null,
            value: formData.value,
            stage: formData.stage,
            probability: formData.probability,
            source: formData.source || null,
            expectedCloseDate: formData.expectedCloseDate || null,
            notes: formData.notes || null,
          }),
        })
        if (!res.ok) throw new Error()
        toast.success('Deal created successfully')
      }
      setFormOpen(false)
      fetchDeals()
    } catch {
      toast.error(editingDeal ? 'Failed to update deal' : 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Stage change (quick move) ─────────────────────────────
  async function changeStage(deal: DealType, newStage: DealStage) {
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Moved to ${STAGES.find(s => s.key === newStage)?.label}`)
      fetchDeals()
      // Refresh detail if open
      if (detailDeal?.id === deal.id) {
        fetchDetail(deal.id)
      }
    } catch {
      toast.error('Failed to update stage')
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteDeal) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/deals/${deleteDeal.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Deal deleted')
      setDeleteDeal(null)
      setDetailOpen(false)
      setDetailDeal(null)
      fetchDeals()
    } catch {
      toast.error('Failed to delete deal')
    } finally {
      setDeleting(false)
    }
  }

  // ── Detail view ────────────────────────────────────────────
  async function fetchDetail(dealId: string) {
    setDetailLoading(true)
    try {
      const [dealRes, actRes] = await Promise.all([
        fetch(`/api/deals/${dealId}`),
        fetch(`/api/deals/${dealId}/activities`),
      ])
      if (dealRes.ok) {
        const json = await dealRes.json()
        setDetailDeal(json.data)
      }
      if (actRes.ok) {
        const json = await actRes.json()
        setDetailActivities(json.data || [])
      }
    } catch {
      toast.error('Failed to load deal details')
    } finally {
      setDetailLoading(false)
    }
  }

  function openDetail(deal: DealType) {
    setDetailDeal(deal)
    setDetailOpen(true)
    setShowActivityForm(false)
    setActivityContent('')
    setActivityType('note')
    fetchDetail(deal.id)
  }

  // ── Add activity ───────────────────────────────────────────
  async function handleAddActivity() {
    if (!detailDeal || !activityContent.trim()) return
    setActivitySubmitting(true)
    try {
      const res = await fetch(`/api/deals/${detailDeal.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activityType, content: activityContent }),
      })
      if (!res.ok) throw new Error()
      toast.success('Activity added')
      setActivityContent('')
      setShowActivityForm(false)
      fetchDetail(detailDeal.id)
    } catch {
      toast.error('Failed to add activity')
    } finally {
      setActivitySubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Deal Pipeline</h2>
          <p className="text-muted-foreground mt-1">Track and manage your sales pipeline.</p>
        </div>
        <Button onClick={openCreateForm} className="hover:opacity-90 text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Deals</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {loading ? <Skeleton className="h-7 w-12 inline-block" /> : deals.length}
                </p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)', color: 'var(--gg-vermillion)' }}>
                <Handshake className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {loading ? <Skeleton className="h-7 w-24 inline-block" /> : formatCurrency(totalPipelineValue)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Weighted Value</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {loading ? <Skeleton className="h-7 w-24 inline-block" /> : formatCurrency(weightedPipelineValue)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Deal Size</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {loading ? <Skeleton className="h-7 w-24 inline-block" /> : formatCurrency(avgDealSize)}
                </p>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Pipeline View */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGES.map(stage => (
            <div key={stage.key} className="space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-132 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-[700px]">
            {dealsByStage.map(stage => (
              <div key={stage.key} className="flex flex-col">
                {/* Column header */}
                <div
                  className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${stage.bgColor} border ${stage.borderColor}`}
                  style={{ ...stage.bgColorStyle, ...stage.borderColorStyle }}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${stage.dotColor}`} style={stage.dotColorStyle} />
                  <h3 className={`text-sm font-semibold ${stage.color}`} style={stage.colorStyle}>{stage.label}</h3>
                  <Badge variant="secondary" className="ml-auto text-xs bg-white/5 text-muted-foreground border-0">
                    {stage.deals.length}
                  </Badge>
                </div>

                {/* Column value */}
                <div className="px-3 mb-2">
                  <p className="text-xs text-gray-500">{formatCurrency(stage.totalValue)}</p>
                </div>

                {/* Deal cards */}
                <div className="space-y-2 flex-1 min-h-[100px]">
                  {stage.deals.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-4 text-center" style={{ borderColor: 'var(--gg-separator)' }}>
                      <p className="text-xs text-gray-600">No deals</p>
                    </div>
                  ) : (
                    stage.deals.map(deal => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        stageConfig={stage}
                        onClick={() => openDetail(deal)}
                        onStageChange={(newStage) => changeStage(deal, newStage)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Deal Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-gray-900 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingDeal ? 'Edit Deal' : 'Add New Deal'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingDeal ? 'Update deal information below.' : 'Fill in the details to create a new deal.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="deal-title" className="text-gray-300 text-sm">Title *</Label>
              <Input
                id="deal-title"
                placeholder="Deal title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800/50 text-white placeholder:text-gray-600"
                style={{ borderColor: 'var(--gg-separator)' }}
              />
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(val) => setFormData(prev => ({ ...prev, clientId: val }))}
              >
                <SelectTrigger className="bg-gray-800/50 text-white w-full" style={{ borderColor: 'var(--gg-separator)' }}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900" style={{ borderColor: 'var(--gg-separator)' }}>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-white focus:bg-gray-800 focus:text-white">
                      {c.company || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value & Probability row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deal-value" className="text-gray-300 text-sm">Value ($)</Label>
                <Input
                  id="deal-value"
                  type="number"
                  placeholder="0"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  className="bg-gray-800/50 text-white placeholder:text-gray-600"
                  style={{ borderColor: 'var(--gg-separator)' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deal-probability" className="text-gray-300 text-sm">Probability (%)</Label>
                <Input
                  id="deal-probability"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.probability}
                  onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value }))}
                  className="bg-gray-800/50 text-white placeholder:text-gray-600"
                  style={{ borderColor: 'var(--gg-separator)' }}
                />
              </div>
            </div>

            {/* Stage & Source row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, stage: val as DealStage }))}
                >
                  <SelectTrigger className="bg-gray-800/50 text-white w-full" style={{ borderColor: 'var(--gg-separator)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900" style={{ borderColor: 'var(--gg-separator)' }}>
                    {STAGES.map(s => (
                      <SelectItem key={s.key} value={s.key} className="text-white focus:bg-gray-800 focus:text-white">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${s.dotColor}`} style={s.dotColorStyle} />
                          {s.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, source: val }))}
                >
                  <SelectTrigger className="bg-gray-800/50 text-white w-full" style={{ borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900" style={{ borderColor: 'var(--gg-separator)' }}>
                    {SOURCE_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-white focus:bg-gray-800 focus:text-white">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Close Date */}
            <div className="space-y-2">
              <Label htmlFor="deal-close-date" className="text-gray-300 text-sm">Expected Close Date</Label>
              <Input
                id="deal-close-date"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                className="bg-gray-800/50 text-white placeholder:text-gray-600"
                style={{ borderColor: 'var(--gg-separator)' }}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="deal-notes" className="text-gray-300 text-sm">Notes</Label>
              <Textarea
                id="deal-notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-gray-800/50 text-white placeholder:text-gray-600 min-h-[80px]"
                style={{ borderColor: 'var(--gg-separator)' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="hover:bg-white/5"
              style={{ borderColor: 'var(--gg-separator)', color: 'var(--gg-vermillion)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="hover:opacity-90 text-white"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {submitting ? 'Saving...' : editingDeal ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deal Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) { setDetailDeal(null); setDetailActivities([]) } }}>
        <DialogContent className="bg-gray-900 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ borderColor: 'var(--gg-separator)' }}>
          {detailLoading && !detailDeal ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          ) : detailDeal ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-foreground text-xl">{detailDeal.title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                      {detailDeal.client?.company || detailDeal.client?.name || 'No client assigned'}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setDetailOpen(false); openEditForm(detailDeal) }}
                      className="hover:bg-white/5"
                      style={{ borderColor: 'var(--gg-separator)', color: 'var(--gg-vermillion)' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDeal(detailDeal)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Deal Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                <div className="bg-gray-800/50 rounded-lg p-3 border" style={{ borderColor: 'var(--gg-separator)' }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Value</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--gg-vermillion)' }}>{formatCurrency(detailDeal.value)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border" style={{ borderColor: 'var(--gg-separator)' }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Stage</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`h-2 w-2 rounded-full ${getStageConfig(detailDeal.stage).dotColor}`} style={getStageConfig(detailDeal.stage).dotColorStyle} />
                    <p className={`text-sm font-medium ${getStageConfig(detailDeal.stage).color}`} style={getStageConfig(detailDeal.stage).colorStyle}>
                      {getStageConfig(detailDeal.stage).label}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border" style={{ borderColor: 'var(--gg-separator)' }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Probability</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{detailDeal.probability}%</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border" style={{ borderColor: 'var(--gg-separator)' }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Close Date</p>
                  <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(detailDeal.expectedCloseDate)}
                  </p>
                </div>
              </div>

              {/* Quick Stage Change */}
              <div className="flex items-center gap-2 py-1">
                <span className="text-xs text-gray-500">Move to:</span>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.filter(s => s.key !== detailDeal.stage).map(s => (
                    <button
                      key={s.key}
                      onClick={() => changeStage(detailDeal, s.key)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${s.bgColor} ${s.color} border ${s.borderColor} hover:opacity-80`}
                      style={{ ...s.bgColorStyle, ...s.colorStyle, ...s.borderColorStyle }}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${s.dotColor}`} style={s.dotColorStyle} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source & Notes */}
              {(detailDeal.source || detailDeal.notes) && (
                <div className="space-y-2 py-1">
                  {detailDeal.source && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">Source:</span>
                      <Badge variant="secondary" className="bg-white/5 text-gray-300 border-0 capitalize">
                        {detailDeal.source.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  {detailDeal.notes && (
                    <div>
                      <span className="text-xs text-gray-500">Notes:</span>
                      <p className="text-sm text-gray-300 mt-1 bg-gray-800/50 rounded-lg p-3 border" style={{ borderColor: 'var(--gg-separator)' }}>
                        {detailDeal.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Timeline */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Activity Timeline</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActivityForm(!showActivityForm)}
                    className="hover:opacity-80 h-7 text-xs"
                    style={{ color: 'var(--gg-vermillion)' }}
                  >
                    {showActivityForm ? (
                      <><ChevronUp className="h-3 w-3 mr-1" /> Cancel</>
                    ) : (
                      <><Plus className="h-3 w-3 mr-1" /> Add Activity</>
                    )}
                  </Button>
                </div>

                {/* Add Activity Form */}
                {showActivityForm && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border mb-3 space-y-3" style={{ borderColor: 'var(--gg-separator)' }}>
                    <div className="flex gap-2">
                      <Select value={activityType} onValueChange={setActivityType}>
                        <SelectTrigger className="bg-gray-800/50 text-white w-36 h-8 text-xs" style={{ borderColor: 'var(--gg-separator)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900" style={{ borderColor: 'var(--gg-separator)' }}>
                          {ACTIVITY_TYPE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-gray-800 focus:text-white text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a note, call summary..."
                        value={activityContent}
                        onChange={(e) => setActivityContent(e.target.value)}
                        className="bg-gray-800/50 text-white placeholder:text-gray-600 h-8 text-sm"
                        style={{ borderColor: 'var(--gg-separator)' }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddActivity() } }}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddActivity}
                        disabled={activitySubmitting || !activityContent.trim()}
                        className="hover:opacity-90 text-white h-8 px-3"
                        style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Activities list */}
                <ScrollArea className="max-h-64">
                  {detailActivities.length === 0 ? (
                    <div className="text-center py-6">
                      <MessageSquare className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No activities yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailActivities.map(activity => {
                        const Icon = getActivityIcon(activity.type)
                        const { className: colorClass, style: colorStyle } = getActivityColor(activity.type)
                        return (
                          <div key={activity.id} className="flex gap-3 items-start group">
                            <div className={`rounded-md p-1.5 mt-0.5 ${colorClass} shrink-0`} style={colorStyle}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-300">{activity.content}</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Weighted value */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--gg-separator)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Weighted Value</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--gg-vermillion)' }}>
                    {formatCurrency(detailDeal.value * detailDeal.probability / 100)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDeal} onOpenChange={(open) => { if (!open) setDeleteDeal(null) }}>
        <AlertDialogContent className="bg-gray-900 text-white" style={{ borderColor: 'var(--gg-separator)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Deal</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteDeal?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-white/5" style={{ borderColor: 'var(--gg-separator)', color: 'var(--gg-vermillion)' }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── DealCard Sub-component ────────────────────────────────────
function DealCard({
  deal,
  stageConfig,
  onClick,
  onStageChange,
}: {
  deal: DealType
  stageConfig: StageConfig
  onClick: () => void
  onStageChange: (stage: DealStage) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Card
      className={`border ${stageConfig.borderColor} bg-gray-800/40 hover:bg-gray-800/70 cursor-pointer transition-all duration-150 group`}
      style={{ ...stageConfig.borderColorStyle, boxShadow: 'var(--gg-shadow-card)' }}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2 flex-1">{deal.title}</h4>
          {/* Stage change dropdown */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
            >
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-50 bg-gray-800 border rounded-lg shadow-xl py-1 min-w-[140px]" style={{ borderColor: 'var(--gg-separator)' }}>
                  <p className="px-3 py-1.5 text-xs text-gray-500 font-medium">Move to stage</p>
                  {STAGES.filter(s => s.key !== deal.stage).map(s => (
                    <button
                      key={s.key}
                      onClick={() => { onStageChange(s.key); setMenuOpen(false) }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <div className={`h-2 w-2 rounded-full ${s.dotColor}`} style={s.dotColorStyle} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Client */}
        {deal.client && (
          <p className="text-xs text-gray-500 truncate">
            {deal.client.company || deal.client.name}
          </p>
        )}

        {/* Value & Probability */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--gg-vermillion)' }}>{formatCurrency(deal.value)}</span>
          <Badge variant="secondary" className="text-[10px] bg-white/5 text-muted-foreground border-0 px-1.5 py-0">
            {deal.probability}%
          </Badge>
        </div>

        {/* Close date */}
        {deal.expectedCloseDate && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            {formatDate(deal.expectedCloseDate)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
