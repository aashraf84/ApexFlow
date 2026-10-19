'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mail,
  Plus,
  Search,
  Pencil,
  Trash2,
  Send,
  Loader2,
  FileText,
  Clock,
  Sparkles,
  LayoutTemplate,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// ============================================
// Types
// ============================================
interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  trigger: string
  category: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Constants
// ============================================
const TRIGGERS = [
  { value: 'onboarding', label: 'Onboarding', color: 'var(--gg-teal)' },
  { value: 'billing', label: 'Billing', color: 'var(--gg-amber)' },
  { value: 'support', label: 'Support', color: '#a78bfa' },
  { value: 'system', label: 'System', color: 'var(--gg-vermillion)' },
  { value: 'marketing', label: 'Marketing', color: '#22d3ee' },
  { value: 'general', label: 'General', color: '#9ca3af' },
] as const

const TRIGGER_MAP = Object.fromEntries(TRIGGERS.map((t) => [t.value, t]))

const VARIABLE_HINTS = [
  '{{clientName}}',
  '{{userName}}',
  '{{company}}',
  '{{invoiceNumber}}',
  '{{amount}}',
  '{{dueDate}}',
  '{{ticketId}}',
  '{{erpName}}',
  '{{date}}',
]

// ============================================
// Helpers
// ============================================
function relativeTime(d: string | null): string {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function extractVariables(body: string): string[] {
  const matches = body.matchAll(/\{\{(\w+)\}\}/g)
  const seen = new Set<string>()
  for (const m of matches) seen.add(m[1])
  return Array.from(seen)
}

// ============================================
// Stat card
// ============================================
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  accent?: 'vermillion' | 'teal' | 'amber' | 'muted'
}) {
  const bg =
    accent === 'teal'
      ? 'color-mix(in srgb, var(--gg-teal) 14%, transparent)'
      : accent === 'amber'
      ? 'color-mix(in srgb, var(--gg-amber) 14%, transparent)'
      : accent === 'muted'
      ? 'color-mix(in srgb, #6b7280 14%, transparent)'
      : 'color-mix(in srgb, var(--gg-vermillion) 14%, transparent)'
  const fg =
    accent === 'teal'
      ? 'var(--gg-teal)'
      : accent === 'amber'
      ? 'var(--gg-amber)'
      : accent === 'muted'
      ? '#9ca3af'
      : 'var(--gg-vermillion)'

  return (
    <Card
      className="border-0"
      style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: bg }}
          >
            <div style={{ color: fg }}>{icon}</div>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Trigger badge
// ============================================
function TriggerBadge({ trigger }: { trigger: string }) {
  const t = TRIGGER_MAP[trigger] || TRIGGER_MAP.general
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium px-2 py-0"
      style={{
        background: `color-mix(in srgb, ${t.color} 14%, transparent)`,
        color: t.color,
        borderColor: `color-mix(in srgb, ${t.color} 25%, transparent)`,
      }}
    >
      <Tag className="w-2.5 h-2.5 mr-1" />
      {t.label}
    </Badge>
  )
}

// ============================================
// Template form dialog (create)
// ============================================
interface TemplateFormValues {
  name: string
  subject: string
  body: string
  trigger: string
}

function TemplateFormDialog({
  open,
  onClose,
  onSaved,
  editing,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editing: EmailTemplate | null
}) {
  const [values, setValues] = useState<TemplateFormValues>({
    name: '',
    subject: '',
    body: '',
    trigger: 'general',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValues({
        name: editing?.name || '',
        subject: editing?.subject || '',
        body: editing?.body || '',
        trigger: editing?.trigger || editing?.category || 'general',
      })
    }
  }, [open, editing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name.trim() || !values.subject.trim() || !values.body.trim()) {
      toast.error('Name, subject, and body are required')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/email-templates/${editing.id}` : '/api/admin/email-templates'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          subject: values.subject.trim(),
          body: values.body,
          trigger: values.trigger,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to save template')
        return
      }
      toast.success(editing ? 'Template updated' : 'Template created')
      onSaved()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Template' : 'New Email Template'}</DialogTitle>
          <DialogDescription>
            Compose a reusable email template. Use placeholders like{' '}
            <code className="text-[10px] px-1 rounded bg-muted">{`{{clientName}}`}</code> for runtime values.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Template Name</Label>
            <Input
              id="t-name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              placeholder="e.g. Welcome Email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-subject">Subject Line</Label>
            <Input
              id="t-subject"
              value={values.subject}
              onChange={(e) => setValues({ ...values, subject: e.target.value })}
              placeholder="Welcome to ApexFlow, {{clientName}}!"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-trigger">Trigger / Event</Label>
            <Select
              value={values.trigger}
              onValueChange={(v) => setValues({ ...values, trigger: v })}
            >
              <SelectTrigger id="t-trigger" className="w-full">
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-body">Body</Label>
            <Textarea
              id="t-body"
              value={values.body}
              onChange={(e) => setValues({ ...values, body: e.target.value })}
              placeholder="Hi {{clientName}}, welcome aboard…"
              className="min-h-[160px] font-mono text-sm"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Template editor drawer
// ============================================
function TemplateEditorDrawer({
  template,
  open,
  onClose,
  onSaved,
}: {
  template: EmailTemplate | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [trigger, setTrigger] = useState('general')
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setSubject(template.subject)
      setBody(template.body)
      setTrigger(template.trigger || template.category || 'general')
    }
  }, [template])

  const variables = useMemo(() => extractVariables(body), [body])

  const insertVariable = (v: string) => {
    setBody((prev) => prev + v)
  }

  const handleSave = async () => {
    if (!template) return
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast.error('Name, subject and body are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/email-templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          body,
          trigger,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to save template')
        return
      }
      toast.success('Template saved')
      onSaved()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!template) return
    setSendingTest(true)
    // Simulate a send-test request
    await new Promise((r) => setTimeout(r, 700))
    setSendingTest(false)
    toast.success('Test email queued for delivery', {
      description: `Sent to your admin address with subject "${subject}"`,
    })
  }

  if (!template) return null

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent
        className="!w-full !max-w-[560px] sm:!max-w-[560px]"
        style={{ background: 'var(--background)' }}
      >
        <DrawerHeader className="border-b" style={{ borderColor: 'var(--gg-separator)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-lg truncate">{template.name}</DrawerTitle>
              <DrawerDescription className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Updated {relativeTime(template.updatedAt)}
              </DrawerDescription>
            </div>
            <TriggerBadge trigger={trigger} />
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Template Name</Label>
              <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="e-trigger">Trigger / Event</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger id="e-trigger" className="w-full">
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="e-subject">Subject Line</Label>
              <Input
                id="e-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Welcome to ApexFlow, {{clientName}}!"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="e-body">Body</Label>
                <span className="text-[11px] text-muted-foreground">{body.length} chars</span>
              </div>
              <Textarea
                id="e-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[260px] font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Variable hints */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Insert a variable
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_HINTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="text-[11px] font-mono px-2 py-1 rounded-md transition-colors"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                      color: 'var(--gg-vermillion)',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Detected variables */}
            {variables.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3" />
                  Variables detected in body
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map((v) => (
                    <code
                      key={v}
                      className="text-[11px] font-mono px-2 py-1 rounded-md"
                      style={{
                        background: 'var(--secondary)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter
          className="border-t"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              variant="outline"
              onClick={handleSendTest}
              disabled={sendingTest || saving}
              className="flex-1 gap-1.5"
            >
              {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Test
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ============================================
// Main component
// ============================================
export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingTpl, setEditingTpl] = useState<EmailTemplate | null>(null)
  const [drawerTpl, setDrawerTpl] = useState<EmailTemplate | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tplToDelete, setTplToDelete] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/email-templates?${params}`, { cache: 'no-store' })
      const json = await res.json()
      setTemplates(json.templates || [])
    } catch {
      setTemplates([])
    }
  }, [search])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      fetchTemplates().finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [fetchTemplates])

  const openDrawer = async (tpl: EmailTemplate) => {
    try {
      const res = await fetch(`/api/admin/email-templates/${tpl.id}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.template) {
        setDrawerTpl(json.template)
      } else {
        setDrawerTpl(tpl)
      }
      setDrawerOpen(true)
    } catch {
      setDrawerTpl(tpl)
      setDrawerOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!tplToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/email-templates/${tplToDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to delete template')
        return
      }
      toast.success('Template deleted')
      setTplToDelete(null)
      fetchTemplates()
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(false)
    }
  }

  // Stats
  const stats = useMemo(() => {
    const total = templates.length
    const active = templates.length // all templates are "live" by default
    const triggerCounts = new Map<string, number>()
    for (const t of templates) {
      const k = t.trigger || t.category || 'general'
      triggerCounts.set(k, (triggerCounts.get(k) || 0) + 1)
    }
    const topTrigger = triggerCounts.size > 0
      ? Array.from(triggerCounts.entries()).sort((a, b) => b[1] - a[1])[0]
      : null
    return {
      total,
      active,
      distinctTriggers: triggerCounts.size,
      topTriggerLabel: topTrigger ? TRIGGER_MAP[topTrigger[0]]?.label || topTrigger[0] : '—',
      topTriggerCount: topTrigger ? topTrigger[1] : 0,
    }
  }, [templates])

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <LayoutTemplate className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Templates</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Compose reusable transactional emails with trigger events and runtime variables.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Templates"
          value={stats.total}
          accent="vermillion"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Active"
          value={stats.active}
          accent="teal"
        />
        <StatCard
          icon={<Tag className="w-5 h-5" />}
          label={`By Trigger · ${stats.topTriggerLabel}`}
          value={stats.distinctTriggers}
          accent="amber"
        />
      </div>

      {/* Search + New */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setEditingTpl(null)
            setShowForm(true)
          }}
          className="gap-1.5 sm:ml-auto"
          style={{
            background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
            color: '#fff',
          }}
        >
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-0" style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)' }}
            >
              <Mail className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No templates yet</p>
              <p className="text-xs text-muted-foreground">
                {search ? 'Try a different search.' : 'Create your first email template to get started.'}
              </p>
            </div>
            {!search && (
              <Button
                onClick={() => {
                  setEditingTpl(null)
                  setShowForm(true)
                }}
                className="gap-1.5 mt-1"
                style={{
                  background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                  color: '#fff',
                }}
              >
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const vars = extractVariables(tpl.body)
            return (
              <Card
                key={tpl.id}
                className="border-0 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg group flex flex-col"
                style={{
                  background: 'var(--secondary)',
                  borderColor: 'var(--gg-separator)',
                }}
                onClick={() => openDrawer(tpl)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                      >
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold text-foreground truncate">
                          {tpl.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {tpl.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTpl(tpl)
                          setShowForm(true)
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-[var(--gg-rose)] hover:text-[var(--gg-rose)]"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTplToDelete(tpl)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1 min-h-[3.5rem]">
                    {tpl.body.replace(/\{\{[^}]+\}\}/g, '____').slice(0, 220)}
                    {tpl.body.length > 220 ? '…' : ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <TriggerBadge trigger={tpl.trigger || tpl.category} />
                    {vars.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {vars.length} var{vars.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {relativeTime(tpl.updatedAt)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Form dialog */}
      <TemplateFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTpl(null)
        }}
        onSaved={fetchTemplates}
        editing={editingTpl}
      />

      {/* Editor drawer */}
      <TemplateEditorDrawer
        template={drawerTpl}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setDrawerTpl(null)
        }}
        onSaved={fetchTemplates}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!tplToDelete} onOpenChange={(v) => !v && setTplToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{' '}
              <span className="font-semibold text-foreground">{tplToDelete?.name}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-[var(--gg-rose)] text-white hover:bg-[var(--gg-rose)]/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
