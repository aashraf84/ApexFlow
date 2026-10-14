'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plug,
  Plus,
  RefreshCw,
  Trash2,
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  UserPlus,
  Users,
} from 'lucide-react'

interface ErpSystemLite {
  id: string
  name: string
  slug: string
  industry: string
  color: string
  website?: string | null
}

interface Connector {
  id: string
  erpSlug: string
  erpName: string
  status: string
  type: string
  direction: string
  connectionUrl: string | null
  apiKey: string | null
  schemaMapping: string | null
  autoSync: boolean
  syncInterval: number
  lastSyncAt: string | null
  lastError: string | null
  latencyMs: number | null
  clientCount: number
  erpSystem?: { id: string; name: string; industry: string; color: string } | null
  _syncCount?: number
  _lastSync?: { status: string; recordsSynced: number; startedAt: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  connected: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  disconnected: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  partial: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`${STATUS_STYLES[status] || STATUS_STYLES.disconnected} text-xs`}>
      {status}
    </Badge>
  )
}

function formatDate(d: string | null) {
  if (!d) return 'never'
  return new Date(d).toLocaleString()
}

export function IntegrationManager() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [erpSystems, setErpSystems] = useState<ErpSystemLite[]>([])
  const [loading, setLoading] = useState(true)

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedErpId, setSelectedErpId] = useState('')
  const [connectionUrl, setConnectionUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ connected: boolean; latency?: number; error?: string } | null>(null)
  const [discovering, setDiscovering] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [columns, setColumns] = useState<Array<{ name: string; dataType: string }>>([])
  const [mapping, setMapping] = useState<{ id: string; name: string; email: string; phone: string; company: string; status: string }>({ id: '', name: '', email: '', phone: '', company: '', status: '' })
  const [saving, setSaving] = useState(false)

  // List action state
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [registerDialog, setRegisterDialog] = useState<{ id: string; name: string } | null>(null)
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', company: '', status: 'active' })
  const [registering, setRegistering] = useState(false)

  const fetchConnectors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/integrations')
      const json = await res.json()
      setConnectors(json.data || [])
    } catch {
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchErpSystems = useCallback(async () => {
    try {
      const res = await fetch('/api/erp-systems')
      const json = await res.json()
      setErpSystems(json.data || [])
    } catch {
      /* non-fatal */
    }
  }, [])

  useEffect(() => {
    fetchConnectors()
    fetchErpSystems()
  }, [fetchConnectors, fetchErpSystems])

  // ---------- Wizard handlers ----------
  const resetWizard = () => {
    setStep(1); setSelectedErpId(''); setConnectionUrl(''); setApiKey('')
    setTestResult(null); setTables([]); setSelectedTable(''); setColumns([])
    setMapping({ id: '', name: '', email: '', phone: '', company: '', status: '' })
  }

  const handleTest = async () => {
    if (!connectionUrl) { toast.error('Enter a connection URL first'); return }
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/admin/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl }),
      })
      const json = await res.json()
      setTestResult(json)
      if (json.connected) toast.success(`Connected (${json.latency}ms)`)
      else toast.error(json.error || 'Connection failed')
    } catch (e) {
      setTestResult({ connected: false, error: String(e) })
      toast.error('Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleDiscoverTables = async () => {
    setDiscovering(true)
    try {
      const res = await fetch('/api/admin/integrations/discover-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl }),
      })
      const json = await res.json()
      setTables(json.tables || [])
      if ((json.tables || []).length === 0) toast.warning('No tables found — check the connection URL')
    } catch {
      toast.error('Schema discovery failed')
    } finally {
      setDiscovering(false)
    }
  }

  const handleTableSelect = async (table: string) => {
    setSelectedTable(table)
    setMapping({ id: '', name: '', email: '', phone: '', company: '', status: '' })
    try {
      const res = await fetch('/api/admin/integrations/discover-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl, table }),
      })
      const json = await res.json()
      setColumns(json.columns || [])
      // Auto-suggest common field names
      const cols = (json.columns || []).map((c: { name: string }) => c.name)
      const find = (candidates: string[]) => cols.find((c: string) => candidates.some((can) => c.toLowerCase() === can || c.toLowerCase().includes(can)))
      setMapping({
        id: find(['id', 'uuid', 'cuid']) || '',
        name: find(['contactperson', 'name', 'clientname', 'companyname']) || '',
        email: find(['email']) || '',
        phone: find(['phone', 'mobile']) || '',
        company: find(['company', 'companyname', 'organization']) || '',
        status: find(['status', 'isactive']) || '',
      })
    } catch {
      toast.error('Column discovery failed')
    }
  }

  const handleSave = async () => {
    const erp = erpSystems.find((e) => e.id === selectedErpId)
    if (!erp) { toast.error('Select an ERP'); return }
    if (!connectionUrl) { toast.error('Connection URL is required'); return }
    if (!mapping.id || !mapping.name || !mapping.email) {
      toast.error('Map at least the id, name, and email columns')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpSlug: erp.slug,
          erpName: erp.name,
          erpSystemId: erp.id,
          type: 'database',
          direction: 'bidirectional',
          connectionUrl,
          apiKey: apiKey || undefined,
          schemaMapping: { clientTable: selectedTable, ...mapping },
          autoSync: false,
          syncInterval: 300,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Integration with ${erp.name} created`)
        setWizardOpen(false); resetWizard()
        fetchConnectors()
      } else {
        toast.error(json.error || 'Failed to create integration')
      }
    } catch {
      toast.error('Failed to save integration')
    } finally {
      setSaving(false)
    }
  }

  // ---------- List action handlers ----------
  const handleTestConnector = async (id: string) => {
    setTestingId(id)
    try {
      const res = await fetch(`/api/admin/integrations/${id}/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const json = await res.json()
      if (json.connected) toast.success(`Connected (${json.latency}ms)`)
      else toast.error(json.error || 'Connection failed')
      fetchConnectors()
    } catch {
      toast.error('Test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleSync = async (id: string, name: string) => {
    setSyncingId(id)
    toast.info(`Syncing clients from ${name}…`)
    try {
      const res = await fetch(`/api/admin/integrations/${id}/sync`, { method: 'POST' })
      const json = await res.json()
      if (json.synced > 0) toast.success(`${name}: synced ${json.synced} clients${json.failed ? `, ${json.failed} failed` : ''}`)
      else toast.error(`${name}: ${json.error || 'no clients synced'}`)
      fetchConnectors()
    } catch {
      toast.error(`${name}: sync failed`)
    } finally {
      setSyncingId(null)
    }
  }

  const handleRegister = async () => {
    if (!registerDialog) return
    if (!registerForm.name || !registerForm.email) { toast.error('Name + email required'); return }
    setRegistering(true)
    try {
      const res = await fetch(`/api/admin/integrations/${registerDialog.id}/register-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Client registered in ${registerDialog.name} (external id: ${json.externalId || 'n/a'})`)
        setRegisterDialog(null)
        setRegisterForm({ name: '', email: '', phone: '', company: '', status: 'active' })
      } else {
        toast.error(json.error || 'Registration failed')
      }
    } catch {
      toast.error('Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove the ${name} integration? This disconnects the ERP but does not delete any clients.`)) return
    try {
      const res = await fetch('/api/admin/integrations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      const json = await res.json()
      if (json.success) { toast.success(`${name} integration removed`); fetchConnectors() }
      else toast.error(json.error || 'Failed to remove')
    } catch {
      toast.error('Failed to remove integration')
    }
  }

  const selectedErp = erpSystems.find((e) => e.id === selectedErpId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ERP Integrations</h2>
          <p className="text-muted-foreground mt-1">Link your ERP systems, sync clients, and register new clients from here.</p>
        </div>
        <Button
          onClick={() => { resetWizard(); setWizardOpen(true) }}
          className="hover:opacity-90 text-white"
          style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Connectors list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : connectors.length === 0 ? (
        <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No integrations yet</p>
            <p className="text-gray-500 text-sm mt-1 text-center max-w-md">
              Link your first ERP by clicking <strong>Add Integration</strong>. Paste the ERP&apos;s Neon/Postgres connection string, test it, auto-discover the client table, and map the fields — no code changes needed.
            </p>
            <Button
              onClick={() => { resetWizard(); setWizardOpen(true) }}
              className="mt-4 hover:opacity-90 text-white"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {connectors.map((c) => (
            <Card key={c.id} style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${c.erpSystem?.color || 'var(--gg-vermillion)'} 12%, transparent)` }}
                    >
                      <Database className="h-5 w-5" style={{ color: c.erpSystem?.color || 'var(--gg-vermillion)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.erpName}</p>
                      <p className="text-xs text-muted-foreground">{c.erpSlug} · {c.erpSystem?.industry || '—'}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-lg font-bold text-foreground">{c.clientCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Clients</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-lg font-bold text-foreground">{c.latencyMs ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Latency</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                    <p className="text-sm font-semibold text-foreground">{c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleDateString() : '—'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Last Sync</p>
                  </div>
                </div>

                {c.lastError && (
                  <p className="text-xs text-red-400 mb-3 truncate" title={c.lastError}>⚠ {c.lastError}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleTestConnector(c.id)} disabled={testingId === c.id} className="text-foreground">
                    {testingId === c.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Database className="h-3.5 w-3.5 mr-1.5" />}
                    Test
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSync(c.id, c.erpName)} disabled={syncingId === c.id} className="text-foreground">
                    {syncingId === c.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                    Sync
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setRegisterDialog({ id: c.id, name: c.erpName }); setRegisterForm({ name: '', email: '', phone: '', company: '', status: 'active' }) }} className="text-foreground">
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    Register
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id, c.erpName)} className="text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- Add Integration Wizard ---------- */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Plug className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
              {step === 1 ? 'Connect ERP — Step 1 of 2' : 'Map Client Schema — Step 2 of 2'}
            </DialogTitle>
          </DialogHeader>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Select ERP</Label>
                <Select value={selectedErpId} onValueChange={setSelectedErpId}>
                  <SelectTrigger className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                    <SelectValue placeholder="Choose an ERP from the registry" />
                  </SelectTrigger>
                  <SelectContent>
                    {erpSystems.map((erp) => (
                      <SelectItem key={erp.id} value={erp.id}>{erp.name} ({erp.industry})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground">Connection URL (Neon/Postgres)</Label>
                <Input
                  value={connectionUrl}
                  onChange={(e) => { setConnectionUrl(e.target.value); setTestResult(null) }}
                  placeholder="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
                  className="mt-1 text-foreground font-mono text-xs"
                  style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}
                />
                <p className="text-xs text-muted-foreground mt-1">Get this from the ERP&apos;s Neon dashboard → connection string (pooled).</p>
              </div>

              <div>
                <Label className="text-foreground">API Key (optional — for API-mode connectors, leave empty for DB-mode)</Label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-1 text-foreground font-mono text-xs"
                  style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}
                />
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${testResult.connected ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {testResult.connected ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                  <span className={`text-sm ${testResult.connected ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.connected ? `Connected — ${testResult.latency}ms latency` : `Failed: ${testResult.error}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="outline" onClick={() => setWizardOpen(false)} className="text-muted-foreground">Cancel</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTest} disabled={testing || !connectionUrl} className="text-foreground">
                    {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                    Test Connection
                  </Button>
                  <Button
                    onClick={() => { handleDiscoverTables(); setStep(2) }}
                    disabled={!testResult?.connected}
                    className="text-white"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedErp && (
                <div className="p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
                  <p className="text-sm text-foreground"><strong>{selectedErp.name}</strong> · connected</p>
                </div>
              )}

              <div>
                <Label className="text-foreground">Client Table</Label>
                {discovering ? (
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Discovering tables…</div>
                ) : tables.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">No tables found. Check the connection URL.</p>
                ) : (
                  <Select value={selectedTable} onValueChange={handleTableSelect}>
                    <SelectTrigger className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                      <SelectValue placeholder="Pick the clients table" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {tables.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedTable && columns.length > 0 && (
                <div className="space-y-3 p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
                  <p className="text-sm font-semibold text-foreground">Map columns → ApexFlow client fields</p>
                  {(['id', 'name', 'email', 'phone', 'company', 'status'] as const).map((field) => (
                    <div key={field} className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-muted-foreground text-xs uppercase">{field}</Label>
                      <Select
                        value={mapping[field]}
                        onValueChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}
                      >
                        <SelectTrigger className="col-span-2 text-foreground text-xs" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                          <SelectValue placeholder={`select ${field} column`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {columns.map((c) => (
                            <SelectItem key={c.name} value={c.name}>{c.name} ({c.dataType})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">id, name, and email are required. The others are optional.</p>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="text-muted-foreground">Back</Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !selectedTable || !mapping.id || !mapping.name || !mapping.email}
                  className="text-white"
                  style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plug className="h-4 w-4 mr-2" />}
                  Save Integration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Register Client Dialog ---------- */}
      <Dialog open={!!registerDialog} onOpenChange={(o) => !o && setRegisterDialog(null)}>
        <DialogContent className="max-w-md" style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
              Register Client in {registerDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-foreground">Name *</Label>
              <Input value={registerForm.name} onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }} />
            </div>
            <div>
              <Label className="text-foreground">Email *</Label>
              <Input value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-foreground">Phone</Label>
                <Input value={registerForm.phone} onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }} />
              </div>
              <div>
                <Label className="text-foreground">Company</Label>
                <Input value={registerForm.company} onChange={(e) => setRegisterForm((f) => ({ ...f, company: e.target.value }))} className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }} />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Status</Label>
              <Select value={registerForm.status} onValueChange={(v) => setRegisterForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1 text-foreground" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialog(null)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={handleRegister} disabled={registering} className="text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
              {registering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Register in ERP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
