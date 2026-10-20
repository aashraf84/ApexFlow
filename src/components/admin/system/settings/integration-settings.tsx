'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Plug,
  Clock,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Save,
  Loader2,
  Database,
  Zap,
  Webhook,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

/* ─── Types ─── */

interface IntegrationSettings {
  defaultSyncInterval: number
  globalAutoSync: boolean
  defaultDirection: string
  defaultType: string
  apiTimeout: number
  maxRetries: number
  retryBackoff: number
  webhookSecretRotation: boolean
  enableAuditLogging: boolean
  dataRetentionDays: number
  bulkDeleteEnabled: boolean
}

const DEFAULT_SETTINGS: IntegrationSettings = {
  defaultSyncInterval: 300,
  globalAutoSync: false,
  defaultDirection: 'bidirectional',
  defaultType: 'database',
  apiTimeout: 30000,
  maxRetries: 3,
  retryBackoff: 5,
  webhookSecretRotation: false,
  enableAuditLogging: true,
  dataRetentionDays: 90,
  bulkDeleteEnabled: false,
}

const SYNC_INTERVALS = [
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 21600, label: '6 hours' },
  { value: 43200, label: '12 hours' },
  { value: 86400, label: '24 hours' },
]

const DIRECTIONS = [
  { value: 'bidirectional', label: 'Bidirectional' },
  { value: 'inbound', label: 'Inbound Only' },
  { value: 'outbound', label: 'Outbound Only' },
]

const TYPES = [
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API' },
  { value: 'webhook', label: 'Webhook' },
]

/* ─── Main Component ─── */

export function IntegrationSettings() {
  const [settings, setSettings] = useState<IntegrationSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch('/api/admin/site-settings')
      .then((res) => res.json())
      .then((json) => {
        // The GET response shape is `{ settings: { [group]: { [key]: { value, description? } } } }`.
        // Flatten it into a plain key → value map so we can look up the
        // `integrationSettings` key regardless of which group/category the
        // server chose to bucket it under.
        const grouped = json.settings || {}
        const flat: Record<string, string> = {}
        for (const groupKey of Object.keys(grouped)) {
          const bucket = grouped[groupKey] || {}
          for (const k of Object.keys(bucket)) {
            const entry = bucket[k]
            if (entry && typeof entry === 'object' && 'value' in entry) {
              flat[k] = String(entry.value)
            } else if (typeof entry === 'string') {
              flat[k] = entry
            }
          }
        }
        const raw = flat.integrationSettings
        if (raw) {
          try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
            setSettings((prev) => ({ ...prev, ...parsed }))
          } catch {
            // use defaults
          }
        }
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const update = <K extends keyof IntegrationSettings>(key: K, value: IntegrationSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // Submit the entire IntegrationSettings object as a single JSON-stringified
  // value under the `integrationSettings` key. The /api/admin/site-settings
  // PATCH handler expects body shape `{ updates: [{ key, value }] }` —
  // previously we sent `{ integrationSettings: '...' }` which the route
  // rejected with 400 "No updates provided" (Bug #2).
  const buildPatchBody = (payload: IntegrationSettings) => ({
    updates: [{ key: 'integrationSettings', value: JSON.stringify(payload) }],
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPatchBody(settings)),
      })
      const json = await res.json()
      if (res.ok && (json.updated !== undefined || json.success)) {
        toast.success('Integration settings saved')
      } else {
        toast.error(json.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  const handleReset = async () => {
    setResetting(true)
    setSettings(DEFAULT_SETTINGS)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPatchBody(DEFAULT_SETTINGS)),
      })
      const json = await res.json()
      if (res.ok && (json.updated !== undefined || json.success)) {
        toast.success('Settings reset to defaults')
        setResetDialogOpen(false)
      } else {
        toast.error(json.error || 'Failed to reset settings')
      }
    } catch {
      toast.error('Network error')
    }
    setResetting(false)
  }

  const handleClearAllIntegrations = async () => {
    setClearingAll(true)
    try {
      // Fetch all connectors, then delete each
      const listRes = await fetch('/api/admin/integrations')
      const listJson = await listRes.json()
      if (!listJson.success) {
        toast.error('Failed to fetch connectors')
        setClearingAll(false)
        return
      }

      const connectors = listJson.data || []
      if (connectors.length === 0) {
        toast.info('No connectors to clear')
        setClearDialogOpen(false)
        setClearingAll(false)
        return
      }

      await Promise.all(
        connectors.map((c: { id: string }) =>
          fetch('/api/admin/integrations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: c.id }),
          }),
        ),
      )

      toast.success(`Cleared all ${connectors.length} connectors`)
      setClearDialogOpen(false)
    } catch {
      toast.error('Failed to clear connectors')
    }
    setClearingAll(false)
  }

  const intervalLabel = (val: number) =>
    SYNC_INTERVALS.find((i) => i.value === val)?.label || `${val}s`

  return (
    <div className="space-y-6">
      {/* ── Default Sync Configuration ── */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Default Sync Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Default values applied when creating new connectors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Default Sync Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Default Sync Interval</Label>
              <Select
                value={String(settings.defaultSyncInterval)}
                onValueChange={(v) => update('defaultSyncInterval', Number(v))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYNC_INTERVALS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                New connectors will use {intervalLabel(settings.defaultSyncInterval)} as default
              </p>
            </div>

            {/* Global Auto-Sync */}
            <div className="space-y-2">
              <Label className="text-sm">Global Auto-Sync</Label>
              <div className="flex items-center gap-3 h-9 rounded-md border border-border/60 px-3">
                <Switch
                  checked={settings.globalAutoSync}
                  onCheckedChange={(v) => update('globalAutoSync', v)}
                />
                <span className="text-sm text-muted-foreground">
                  {settings.globalAutoSync ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Enable auto-sync for all new connectors by default
              </p>
            </div>
          </div>

          {/* Default Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
                Default Direction
              </Label>
              <Select
                value={settings.defaultDirection}
                onValueChange={(v) => update('defaultDirection', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-sm">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Type */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-muted-foreground" />
                Default Connector Type
              </Label>
              <Select
                value={settings.defaultType}
                onValueChange={(v) => update('defaultType', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-sm">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Connection & Retry Settings ── */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            Connection &amp; Retry
          </CardTitle>
          <CardDescription className="text-xs">
            Fine-tune how connectors handle failures and timeouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* API Timeout */}
            <div className="space-y-2">
              <Label className="text-sm">API Timeout (ms)</Label>
              <Input
                type="number"
                min={5000}
                max={120000}
                step={1000}
                value={settings.apiTimeout}
                onChange={(e) => update('apiTimeout', Number(e.target.value) || 30000)}
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                {settings.apiTimeout / 1000}s before request timeout
              </p>
            </div>

            {/* Max Retries */}
            <div className="space-y-2">
              <Label className="text-sm">Max Retries</Label>
              <Select
                value={String(settings.maxRetries)}
                onValueChange={(v) => update('maxRetries', Number(v))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 5, 10].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-sm">
                      {n} {n === 1 ? 'retry' : 'retries'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Retry Backoff */}
            <div className="space-y-2">
              <Label className="text-sm">Retry Backoff (s)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.retryBackoff}
                onChange={(e) => update('retryBackoff', Number(e.target.value) || 5)}
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Wait {settings.retryBackoff}s between retries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Security & Data ── */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            Security &amp; Data
          </CardTitle>
          <CardDescription className="text-xs">
            Webhook security, audit logging, and data retention policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Webhook Secret Rotation */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Webhook className="w-3.5 h-3.5 text-muted-foreground" />
                  Auto-Rotate Webhook Secrets
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Rotate webhook secrets every 90 days
                </p>
              </div>
              <Switch
                checked={settings.webhookSecretRotation}
                onCheckedChange={(v) => update('webhookSecretRotation', v)}
              />
            </div>

            {/* Audit Logging */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  Audit Logging
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Log all integration changes for compliance
                </p>
              </div>
              <Switch
                checked={settings.enableAuditLogging}
                onCheckedChange={(v) => update('enableAuditLogging', v)}
              />
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-2">
            <Label className="text-sm">Sync History Retention (days)</Label>
            <div className="flex items-center gap-3 max-w-xs">
              <Input
                type="number"
                min={7}
                max={365}
                value={settings.dataRetentionDays}
                onChange={(e) => update('dataRetentionDays', Number(e.target.value) || 90)}
                className="h-9 text-sm"
              />
              <Badge variant="outline" className="text-xs shrink-0">
                {settings.dataRetentionDays} days
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sync logs older than this will be automatically purged
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger Zone ── */}
      <Card className="border-red-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">
            Irreversible actions — use with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Clear All Connectors */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Clear All Connectors</Label>
              <p className="text-[11px] text-muted-foreground">
                Permanently remove all integration connectors and their configuration
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 gap-1.5 shrink-0"
              onClick={() => setClearDialogOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          </div>

          {/* Reset Settings */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Reset to Defaults</Label>
              <p className="text-[11px] text-muted-foreground">
                Restore all integration settings to their factory defaults
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setResetDialogOpen(true)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Save Button ── */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setResetDialogOpen(true)}>
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </Button>
        <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Settings
        </Button>
      </div>

      {/* ── Reset Confirmation Dialog ── */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Integration Settings</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all integration settings to their default values. Any custom configuration
              will be lost. This action only affects settings — existing connectors are not removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={resetting}
              className="gap-1.5"
            >
              {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Clear All Connectors Dialog ── */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Clear All Connectors</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold text-foreground">all integration connectors</span> and their
              configuration. This action cannot be undone. You can re-add connectors using Auto-Discover or
              manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllIntegrations}
              disabled={clearingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {clearingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete All Connectors
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}