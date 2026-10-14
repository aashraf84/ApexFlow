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
import { Switch } from '@/components/ui/switch'
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
  // Serials (optional) mapping state
  const [syncSerials, setSyncSerials] = useState(false)
  const [serialTable, setSerialTable] = useState('')
  const [serialColumns, setSerialColumns] = useState<Array<{ name: string; dataType: string }>>([])
  const [serialMapping, setSerialMapping] = useState<{ serialId: string; serialKey: string; licenseKey: string; serialClientRef: string; serialProduct: string; serialStatus: string }>({ serialId: '', serialKey: '', licenseKey: '', serialClientRef: '', serialProduct: '', serialStatus: '' })
  const [serialDiscovering, setSerialDiscovering] = useState(false)
  // Devices (optional) mapping state
  const [syncDevices, setSyncDevices] = useState(false)
  const [deviceTable, setDeviceTable] = useState('')
  const [deviceColumns, setDeviceColumns] = useState<Array<{ name: string; dataType: string }>>([])
  const [deviceMapping, setDeviceMapping] = useState<{ deviceId: string; deviceSerial: string; deviceName: string; deviceType: string; deviceStatus: string; deviceClientRef: string }>({ deviceId: '', deviceSerial: '', deviceName: '', deviceType: '', deviceStatus: '', deviceClientRef: '' })
  const [deviceDiscovering, setDeviceDiscovering] = useState(false)
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
    setSyncSerials(false); setSerialTable(''); setSerialColumns([])
    setSerialMapping({ serialId: '', serialKey: '', licenseKey: '', serialClientRef: '', serialProduct: '', serialStatus: '' })
    setSyncDevices(false); setDeviceTable(''); setDeviceColumns([])
    setDeviceMapping({ deviceId: '', deviceSerial: '', deviceName: '', deviceType: '', deviceStatus: '', deviceClientRef: '' })
  }

  const handleDeviceTableSelect = async (table: string) => {
    setDeviceTable(table)
    setDeviceMapping({ deviceId: '', deviceSerial: '', deviceName: '', deviceType: '', deviceStatus: '', deviceClientRef: '' })
    setDeviceDiscovering(true)
    try {
      const res = await fetch('/api/admin/integrations/discover-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl, table }),
      })
      const json = await res.json()
      const cols = (json.columns || []).map((c: { name: string }) => c.name)
      setDeviceColumns(json.columns || [])
      const find = (candidates: string[]) => cols.find((c: string) => candidates.some((can) => c.toLowerCase() === can || c.toLowerCase().includes(can)))
      setDeviceMapping({
        deviceId: find(['id', 'uuid', 'cuid']) || '',
        deviceSerial: find(['serial', 'serialnumber', 'imei', 'deviceid', 'mac']) || '',
        deviceName: find(['name', 'devicename', 'model', 'product']) || '',
        deviceType: find(['type', 'devicetype', 'category', 'model']) || '',
        deviceStatus: find(['status', 'isactive', 'state']) || '',
        deviceClientRef: find(['clientid', 'customerid', 'ownerid', 'tenantid', 'userid']) || '',
      })
    } catch {
      toast.error('Device column discovery failed')
    } finally {
      setDeviceDiscovering(false)
    }
  }

  const handleSerialTableSelect = async (table: string) => {
    setSerialTable(table)
    setSerialMapping({ serialId: '', serialKey: '', licenseKey: '', serialClientRef: '', serialProduct: '', serialStatus: '' })
    setSerialDiscovering(true)
    try {
      const res = await fetch('/api/admin/integrations/discover-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl, table }),
      })
      const json = await res.json()
      const cols = (json.columns || []).map((c: { name: string }) => c.name)
      setSerialColumns(json.columns || [])
      // Auto-suggest common serial-field names
      const find = (candidates: string[]) => cols.find((c: string) => candidates.some((can) => c.toLowerCase() === can || c.toLowerCase().includes(can)))
      setSerialMapping({
        serialId: find(['id', 'uuid', 'cuid']) || '',
        serialKey: find(['serial', 'serialkey', 'serialnumber', 'imei', 'licensekey', 'key']) || '',
        licenseKey: find(['license', 'licensekey', 'activationkey']) || '',
        serialClientRef: find(['clientid', 'customerid', 'ownerid', 'tenantid', 'userid']) || '',
        serialProduct: find(['product', 'productname', 'sku', 'item']) || '',
        serialStatus: find(['status', 'isactive', 'activated']) || '',
      })
    } catch {
      toast.error('Serial column discovery failed')
    } finally {
      setSerialDiscovering(false)
    }
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
    if (syncSerials && (!serialTable || !serialMapping.serialKey)) {
      toast.error('For serials, pick a serial table + map the serialKey column')
      return
    }
    if (syncDevices && (!deviceTable || !deviceMapping.deviceSerial)) {
      toast.error('For devices, pick a device table + map the deviceSerial column')
      return
    }
    setSaving(true)
    try {
      const schemaMapping: Record<string, string> = { clientTable: selectedTable, ...mapping }
      if (syncSerials && serialTable && serialMapping.serialKey) {
        schemaMapping.serialTable = serialTable
        schemaMapping.serialId = serialMapping.serialId
        schemaMapping.serialKey = serialMapping.serialKey
        schemaMapping.licenseKey = serialMapping.licenseKey
        schemaMapping.serialClientRef = serialMapping.serialClientRef
        schemaMapping.serialProduct = serialMapping.serialProduct
        schemaMapping.serialStatus = serialMapping.serialStatus
      }
      if (syncDevices && deviceTable && deviceMapping.deviceSerial) {
        schemaMapping.deviceTable = deviceTable
        schemaMapping.deviceId = deviceMapping.deviceId
        schemaMapping.deviceSerial = deviceMapping.deviceSerial
        schemaMapping.deviceName = deviceMapping.deviceName
        schemaMapping.deviceType = deviceMapping.deviceType
        schemaMapping.deviceStatus = deviceMapping.deviceStatus
        schemaMapping.deviceClientRef = deviceMapping.deviceClientRef
      }
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
          schemaMapping,
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
    toast.info(`Syncing ${name}…`)
    try {
      const res = await fetch(`/api/admin/integrations/${id}/sync`, { method: 'POST' })
      const json = await res.json()
      const clients = json.clients || {}
      const serials = json.serials || {}
      const devices = json.devices || {}
      const totalSynced = (clients.synced || 0) + (serials.synced || 0) + (devices.synced || 0)
      if (totalSynced > 0) {
        const parts = []
        if (clients.synced) parts.push(`${clients.synced} clients`)
        if (serials.synced) parts.push(`${serials.synced} serials`)
        if (devices.synced) parts.push(`${devices.synced} devices`)
        const failed = (clients.failed || 0) + (serials.failed || 0) + (devices.failed || 0)
        toast.success(`${name}: synced ${parts.join(' + ')}${failed ? ` (${failed} failed)` : ''}`)
      } else {
        toast.error(`${name}: ${(clients.error || serials.error || devices.error || 'no records synced')}`)
      }
      fetchConnectors()
    } catch {
      toast.error(`${name}: sync failed`)
    } finally {
      setSyncingId(null)
    }
  }

  const handleSyncAll = async () => {
    if (connectors.length === 0) { toast.info('No integrations to sync'); return }
    toast.info(`Syncing all ${connectors.length} integrations…`)
    for (const c of connectors) {
      await handleSync(c.id, c.erpName)
    }
  }

  const handleToggleAutoSync = async (id: string, erpName: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, autoSync: !current }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`${erpName}: auto-sync ${!current ? 'enabled' : 'disabled'}`)
        fetchConnectors()
      } else toast.error(json.error || 'Failed to toggle')
    } catch {
      toast.error('Failed to toggle auto-sync')
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
        <div className="flex gap-2">
          {connectors.length > 0 && (
            <Button variant="outline" onClick={handleSyncAll} className="text-foreground">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          )}
          <Button
            onClick={() => { resetWizard(); setWizardOpen(true) }}
            className="hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
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

                <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                  <div>
                    <p className="text-xs font-medium text-foreground">Auto-sync</p>
                    <p className="text-[10px] text-muted-foreground">every {Math.round(c.syncInterval / 60)} min{c.autoSync ? ' · enabled' : ' · off'}</p>
                  </div>
                  <Switch
                    checked={c.autoSync}
                    onCheckedChange={() => handleToggleAutoSync(c.id, c.erpName, c.autoSync)}
                    aria-label={`Toggle auto-sync for ${c.erpName}`}
                  />
                </div>

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

              {/* Optional: serials mapping */}
              <div className="p-3 rounded-lg border" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Also sync serials/licenses?</p>
                    <p className="text-xs text-muted-foreground">Pull the ERP&apos;s serial/license table into ApexFlow Licenses.</p>
                  </div>
                  <Switch checked={syncSerials} onCheckedChange={setSyncSerials} aria-label="Toggle serials sync" />
                </div>

                {syncSerials && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label className="text-foreground text-xs">Serial / License Table</Label>
                      {serialDiscovering ? (
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Discovering…</div>
                      ) : (
                        <Select value={serialTable} onValueChange={handleSerialTableSelect}>
                          <SelectTrigger className="mt-1 text-foreground text-xs" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                            <SelectValue placeholder="Pick the serials table" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {tables.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {serialTable && serialColumns.length > 0 && (
                      <div className="space-y-2">
                        {(['serialKey', 'serialId', 'serialClientRef', 'licenseKey', 'serialProduct', 'serialStatus'] as const).map((field) => (
                          <div key={field} className="grid grid-cols-3 items-center gap-2">
                            <Label className="text-muted-foreground text-xs uppercase">{field.replace('serial', '').replace('Ref', ' client ref')}</Label>
                            <Select
                              value={serialMapping[field]}
                              onValueChange={(v) => setSerialMapping((m) => ({ ...m, [field]: v }))}
                            >
                              <SelectTrigger className="col-span-2 text-foreground text-xs" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                                <SelectValue placeholder={`select ${field} column`} />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {serialColumns.map((c) => (
                                  <SelectItem key={c.name} value={c.name}>{c.name} ({c.dataType})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">serialKey is required. serialClientRef links each serial to a synced client (the ERP column referencing the client id).</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional: devices mapping */}
              <div className="p-3 rounded-lg border" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Also sync devices?</p>
                    <p className="text-xs text-muted-foreground">Pull the ERP&apos;s hardware device table into ApexFlow ErpDevices.</p>
                  </div>
                  <Switch checked={syncDevices} onCheckedChange={setSyncDevices} aria-label="Toggle devices sync" />
                </div>

                {syncDevices && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label className="text-foreground text-xs">Device Table</Label>
                      {deviceDiscovering ? (
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Discovering…</div>
                      ) : (
                        <Select value={deviceTable} onValueChange={handleDeviceTableSelect}>
                          <SelectTrigger className="mt-1 text-foreground text-xs" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                            <SelectValue placeholder="Pick the devices table" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {tables.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {deviceTable && deviceColumns.length > 0 && (
                      <div className="space-y-2">
                        {(['deviceSerial', 'deviceId', 'deviceName', 'deviceType', 'deviceStatus', 'deviceClientRef'] as const).map((field) => (
                          <div key={field} className="grid grid-cols-3 items-center gap-2">
                            <Label className="text-muted-foreground text-xs uppercase">{field.replace('device', '').replace('Ref', ' client ref') || 'serial'}</Label>
                            <Select
                              value={deviceMapping[field]}
                              onValueChange={(v) => setDeviceMapping((m) => ({ ...m, [field]: v }))}
                            >
                              <SelectTrigger className="col-span-2 text-foreground text-xs" style={{ background: 'var(--background)', borderColor: 'var(--gg-separator)' }}>
                                <SelectValue placeholder={`select ${field} column`} />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {deviceColumns.map((c) => (
                                  <SelectItem key={c.name} value={c.name}>{c.name} ({c.dataType})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">deviceSerial is required. deviceClientRef links each device to a synced client.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="text-muted-foreground">Back</Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !selectedTable || !mapping.id || !mapping.name || !mapping.email || (syncSerials && (!serialTable || !serialMapping.serialKey)) || (syncDevices && (!deviceTable || !deviceMapping.deviceSerial))}
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
