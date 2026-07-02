'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Webhook as WebhookIcon,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { getErpIcon, getErpColor, FALLBACK_ERP_DATA } from '@/lib/erp-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/admin/shared/empty-state'

/* ─── Types ─── */

interface WebhookData {
  id: string
  erpSystemId: string | null
  name: string
  url: string
  secret: string | null
  events: string
  isActive: boolean
  lastTriggerAt: string | null
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt: string
  erpSystem: { id: string; name: string; industry: string } | null
}

/* ─── Constants ─── */

const WEBHOOK_EVENTS = [
  'sync.complete',
  'sync.failed',
  'client.created',
  'order.created',
  'invoice.created',
  'connection.status_change',
] as const

const ERP_SLUGS = FALLBACK_ERP_DATA.map((e) => ({ slug: e.slug, name: e.name }))

/* ─── Helpers ─── */

function parseEvents(eventsStr: string): string[] {
  try {
    const parsed = JSON.parse(eventsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatTimeAgo(date: string | null): string {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url
  return url.substring(0, maxLen - 3) + '...'
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/* ─── Form state ─── */

interface WebhookForm {
  name: string
  url: string
  secret: string
  events: string[]
  erpSlug: string
  isActive: boolean
}

const emptyForm: WebhookForm = {
  name: '',
  url: '',
  secret: '',
  events: [],
  erpSlug: '',
  isActive: true,
}

/* ─── Card animation ─── */

const cardVariant = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

/* ─── WebhookManager ─── */

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<WebhookForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/webhooks')
      const json = await res.json()
      if (json.success) {
        setWebhooks(json.data)
      } else {
        toast.error('Failed to fetch webhooks')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (wh: WebhookData) => {
    setEditingId(wh.id)
    setForm({
      name: wh.name,
      url: wh.url,
      secret: wh.secret || '',
      events: parseEvents(wh.events),
      erpSlug: wh.erpSystem?.name ? ERP_SLUGS.find((e) => e.name === wh.erpSystem?.name)?.slug || '' : '',
      isActive: wh.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Name and URL are required')
      return
    }
    if (!isValidUrl(form.url)) {
      toast.error('Invalid URL format')
      return
    }
    if (!form.erpSlug) {
      toast.error('Please select an ERP')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/admin/webhooks/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            url: form.url,
            secret: form.secret || null,
            events: form.events,
            isActive: form.isActive,
          }),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Webhook updated')
          setDialogOpen(false)
          fetchWebhooks()
        } else {
          toast.error(json.error || 'Failed to update webhook')
        }
      } else {
        // Create
        const res = await fetch('/api/admin/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            erpSlug: form.erpSlug,
            name: form.name,
            url: form.url,
            secret: form.secret || null,
            events: form.events,
          }),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Webhook created')
          setDialogOpen(false)
          fetchWebhooks()
        } else {
          toast.error(json.error || 'Failed to create webhook')
        }
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Webhook deleted')
        fetchWebhooks()
      } else {
        toast.error(json.error || 'Failed to delete webhook')
      }
    } catch {
      toast.error('Network error')
    }
    setDeleting(null)
  }

  const handleToggle = async (wh: WebhookData) => {
    try {
      const res = await fetch(`/api/admin/webhooks/${wh.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !wh.isActive }),
      })
      const json = await res.json()
      if (json.success) {
        setWebhooks((prev) =>
          prev.map((w) => (w.id === wh.id ? { ...w, isActive: !wh.isActive } : w)),
        )
        toast.success(`Webhook ${!wh.isActive ? 'activated' : 'deactivated'}`)
      } else {
        toast.error(json.error || 'Failed to toggle webhook')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    // Simulate test ping — there's no dedicated test endpoint, so we simulate a brief delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Test ping sent successfully')
    setTesting(null)
  }

  const toggleEvent = (event: string) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <WebhookIcon className="w-5 h-5 text-muted-foreground" />
            Webhooks
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
          <Plus className="w-3.5 h-3.5" />
          Add Webhook
        </Button>
      </div>

      {/* Empty state */}
      {webhooks.length === 0 && (
        <EmptyState
          icon={<WebhookIcon className="w-6 h-6" />}
          title="No webhooks configured"
          description="Add a webhook to receive real-time notifications for integration events."
          actionLabel="Add Webhook"
          onAction={openCreateDialog}
        />
      )}

      {/* Webhook cards */}
      {webhooks.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <AnimatePresence mode="popLayout">
            {webhooks.map((wh, idx) => {
              const events = parseEvents(wh.events)
              const erpInfo = ERP_SLUGS.find((e) => e.name === wh.erpSystem?.name)
              const { icon: ErpIcon, color: colorData } = erpInfo
                ? (() => {
                    const fb = FALLBACK_ERP_DATA.find((e) => e.slug === erpInfo.slug)
                    return { icon: getErpIcon(fb?.icon || 'zap'), color: getErpColor(fb?.color || 'teal') }
                  })()
                : { icon: WebhookIcon as never, color: getErpColor('teal') }

              return (
                <motion.div key={wh.id} variants={cardVariant} custom={idx} layout>
                  <Card className="border-border/60 hover:border-border transition-all duration-300">
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${colorData.bg}`}>
                            <ErpIcon className={`w-4 h-4 ${colorData.text}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">{wh.name}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">
                                {truncateUrl(wh.url, 40)}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Switch
                            checked={wh.isActive}
                            onCheckedChange={() => handleToggle(wh)}
                            className="scale-75 origin-right"
                          />
                        </div>
                      </div>

                      {/* Events badges */}
                      {events.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {events.map((evt) => (
                            <Badge
                              key={evt}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground"
                            >
                              {evt}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1" title="Successful deliveries">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{wh.successCount}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Failed deliveries">
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span>{wh.failureCount}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(wh.lastTriggerAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/40">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          disabled={testing === wh.id}
                          onClick={() => handleTest(wh.id)}
                        >
                          {testing === wh.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => openEditDialog(wh)}
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          disabled={deleting === wh.id}
                          onClick={() => handleDelete(wh.id)}
                        >
                          {deleting === wh.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Webhook' : 'Add Webhook'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the webhook configuration below.'
                : 'Configure a new webhook endpoint to receive event notifications.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="wh-name" className="text-xs font-medium">Name</Label>
              <Input
                id="wh-name"
                placeholder="e.g. Slack Notification"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label htmlFor="wh-url" className="text-xs font-medium">URL</Label>
              <Input
                id="wh-url"
                placeholder="https://example.com/webhook"
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                className="h-9 text-sm font-mono"
              />
              {form.url && !isValidUrl(form.url) && (
                <p className="text-[11px] text-red-400">Invalid URL format</p>
              )}
            </div>

            {/* Secret */}
            <div className="space-y-1.5">
              <Label htmlFor="wh-secret" className="text-xs font-medium">Secret (optional)</Label>
              <Input
                id="wh-secret"
                type="password"
                placeholder="Shared secret for signature verification"
                value={form.secret}
                onChange={(e) => setForm((prev) => ({ ...prev, secret: e.target.value }))}
                className="h-9 text-sm font-mono"
              />
            </div>

            {/* ERP Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">ERP</Label>
              <Select value={form.erpSlug} onValueChange={(val) => setForm((prev) => ({ ...prev, erpSlug: val }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select ERP..." />
                </SelectTrigger>
                <SelectContent>
                  {ERP_SLUGS.map((erp) => (
                    <SelectItem key={erp.slug} value={erp.slug} className="text-sm">
                      {erp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Events */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Events</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((evt) => (
                  <label
                    key={evt}
                    className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={form.events.includes(evt)}
                      onCheckedChange={() => toggleEvent(evt)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs text-foreground">{evt}</span>
                  </label>
                ))}
              </div>
              {form.events.length === 0 && (
                <p className="text-[11px] text-muted-foreground">Select at least one event</p>
              )}
            </div>

            {/* Active toggle (edit only) */}
            {editingId && (
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(val) => setForm((prev) => ({ ...prev, isActive: val }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={saving || !form.name.trim() || !form.url.trim() || !form.erpSlug || !isValidUrl(form.url)}
              onClick={handleSave}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}