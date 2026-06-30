'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plug, Wifi, Loader2, ExternalLink, Copy, Zap, XCircle, CheckCircle2,
  RefreshCw, AlertTriangle, Database, Trash2, Save, FileText, Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { IntegrationConnector, IntegrationSummary } from './types'

export function IntegrationSection() {
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([])
  const [summary, setSummary] = useState<IntegrationSummary>({ total: 0, connected: 0, disconnected: 0 })
  const [loading, setLoading] = useState(true)
  const [testingErp, setTestingErp] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'failed' | 'testing'>>({})
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  // DB URL configuration state
  const [erpUrlStatus, setErpUrlStatus] = useState<Record<string, boolean>>({})
  const [configuringSlug, setConfiguringSlug] = useState<string | null>(null)
  const [dbUrlInputs, setDbUrlInputs] = useState<Record<string, string>>({})
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [testingSlugDb, setTestingSlugDb] = useState<string | null>(null)
  const [dbTestResults, setDbTestResults] = useState<Record<string, 'success' | 'failed'>>({})

  // Bulk configure state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setConnectors(data.connectors || [])
      setSummary(data.summary || { total: 0, connected: 0, disconnected: 0 })
    } catch {
      setConnectors([])
      setSummary({ total: 0, connected: 0, disconnected: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchErpUrlStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/erp-database-urls')
      if (!res.ok) return
      const data = await res.json()
      const status: Record<string, boolean> = {}
      for (const erp of data.erps || []) {
        status[erp.slug] = erp.hasUrl
      }
      setErpUrlStatus(status)
    } catch {
      // Silently fail — URL status is non-critical
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchErpUrlStatus()
  }, [fetchData, fetchErpUrlStatus])

  const handleTestConnection = async (slug: string) => {
    setTestingErp(slug)
    setTestResults((prev) => ({ ...prev, [slug]: 'testing' }))
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erpSlug: slug }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setTestResults((prev) => ({ ...prev, [slug]: data.connected ? 'success' : 'failed' }))
      toast[data.connected ? 'success' : 'error'](
        `${slug}: ${data.connected ? `Connected (${data.latency}ms)` : 'Connection failed'}`
      )
    } catch {
      setTestResults((prev) => ({ ...prev, [slug]: 'failed' }))
      toast.error(`${slug}: Connection test failed`)
    } finally {
      setTestingErp(null)
    }
  }

  // Test DB connection from the configure form
  const handleTestDbConnection = async (slug: string) => {
    setTestingSlugDb(slug)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erpSlug: slug }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setDbTestResults((prev) => ({ ...prev, [slug]: data.connected ? 'success' : 'failed' }))
      toast[data.connected ? 'success' : 'error'](
        `${slug}: ${data.connected ? `Connected (${data.latency}ms)` : 'Connection failed'}`
      )
    } catch {
      setDbTestResults((prev) => ({ ...prev, [slug]: 'failed' }))
      toast.error(`${slug}: Connection test failed`)
    } finally {
      setTestingSlugDb(null)
    }
  }

  // Save a single ERP database URL
  const handleSaveDbUrl = async (slug: string) => {
    const databaseUrl = dbUrlInputs[slug]?.trim()
    if (!databaseUrl) {
      toast.error('Please enter a database URL')
      return
    }
    if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
      toast.error('URL must start with postgresql:// or postgres://')
      return
    }

    setSavingSlug(slug)
    try {
      const res = await fetch('/api/admin/erp-database-urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, databaseUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      toast.success(`${slug}: Database URL saved`)
      setErpUrlStatus((prev) => ({ ...prev, [slug]: true }))
      setDbTestResults((prev) => {
        const next = { ...prev }
        delete next[slug]
        return next
      })

      // Auto-test the connection after saving
      await handleTestDbConnection(slug)

      // Refresh connector data
      fetchData()
      fetchErpUrlStatus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save database URL')
    } finally {
      setSavingSlug(null)
    }
  }

  // Clear an ERP database URL
  const handleClearDbUrl = async (slug: string) => {
    setSavingSlug(slug)
    try {
      const res = await fetch('/api/admin/erp-database-urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, databaseUrl: '' }),
      })
      if (!res.ok) throw new Error('Failed to clear')
      toast.success(`${slug}: Database URL cleared`)
      setErpUrlStatus((prev) => ({ ...prev, [slug]: false }))
      setDbUrlInputs((prev) => ({ ...prev, [slug]: '' }))
      setDbTestResults((prev) => {
        const next = { ...prev }
        delete next[slug]
        return next
      })
      fetchData()
      fetchErpUrlStatus()
    } catch {
      toast.error('Failed to clear database URL')
    } finally {
      setSavingSlug(null)
    }
  }

  // Toggle the configure form for a connector
  const handleToggleConfigure = (slug: string) => {
    if (configuringSlug === slug) {
      setConfiguringSlug(null)
    } else {
      setConfiguringSlug(slug)
      // Initialize the input if not already set
      if (!dbUrlInputs[slug]) {
        setDbUrlInputs((prev) => ({ ...prev, [slug]: '' }))
      }
    }
  }

  // Parse bulk text and save all URLs
  const handleBulkSave = async () => {
    const lines = bulkText.trim().split('\n').filter((l) => l.trim())
    const urls: Record<string, string> = {}

    for (const line of lines) {
      const trimmed = line.trim()
      // Support format: SLUG=postgresql://... or SLUG = postgres://...
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue

      const slug = trimmed.substring(0, eqIndex).trim().toLowerCase()
      const url = trimmed.substring(eqIndex + 1).trim()

      if (slug && url) {
        urls[slug] = url
      }
    }

    if (Object.keys(urls).length === 0) {
      toast.error('No valid entries found. Use format: SLUG=postgresql://...')
      return
    }

    setBulkSaving(true)
    try {
      const res = await fetch('/api/admin/erp-database-urls/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      if (!res.ok) throw new Error('Failed to save')

      const data = await res.json()
      toast.success(`Bulk configure: ${data.succeeded} succeeded, ${data.failed} failed`)

      // Refresh data
      fetchErpUrlStatus()
      fetchData()

      // Close dialog
      setBulkDialogOpen(false)
      setBulkText('')
    } catch {
      toast.error('Failed to bulk configure database URLs')
    } finally {
      setBulkSaving(false)
    }
  }

  const copyEndpoint = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success('Copied to clipboard')).catch(() => toast.error('Failed to copy'))
  }

  if (loading) {
    return (
      <div className="space-y-3 p-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl bg-secondary" />
        ))}
      </div>
    )
  }

  const connectedCount = connectors.filter(c => c.connected).length
  const disconnectedCount = connectors.filter(c => !c.connected).length
  const configuredCount = Object.values(erpUrlStatus).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            <CheckCircle2 className="w-3 h-3 mr-1" /> {connectedCount} Connected
          </Badge>
          <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
            <XCircle className="w-3 h-3 mr-1" /> {disconnectedCount} Disconnected
          </Badge>
          <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px]">
            <Database className="w-3 h-3 mr-1" /> {configuredCount} DB Configured
          </Badge>
          <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-[10px]">
            {connectors.length} Total
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border rounded-xl text-xs"
            onClick={() => setBulkDialogOpen(true)}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Bulk Configure
          </Button>
          <Button variant="outline" size="sm" className="border-border rounded-xl text-xs" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Connector cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {connectors.map((connector, i) => (
          <motion.div
            key={connector.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className={`bg-secondary/50 border rounded-xl p-4 transition-colors ${
              connector.connected ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-border hover:border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{connector.name}</span>
                {connector.connected ? (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    <Zap className="w-3 h-3 mr-0.5" /> Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                    Down
                  </Badge>
                )}
                {/* Database URL indicator */}
                {erpUrlStatus[connector.slug] ? (
                  <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px]">
                    <Database className="w-3 h-3 mr-0.5" /> DB
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-[10px]">
                    <Database className="w-3 h-3 mr-0.5 opacity-40" /> No DB
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {testResults[connector.slug] === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {testResults[connector.slug] === 'failed' && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              {connector.latency !== null && (
                <span className={connector.latency < 500 ? 'text-emerald-400' : connector.latency < 2000 ? 'text-amber-400' : 'text-red-400'}>
                  {connector.latency}ms
                </span>
              )}
              {connector.clientCount !== null && connector.clientCount > 0 && (
                <span>{connector.clientCount} clients</span>
              )}
              {!connector.connected && (
                <span className="flex items-center gap-1 text-red-400/80">
                  <AlertTriangle className="w-3 h-3" /> Unreachable
                </span>
              )}
            </div>

            {/* Connection error detail */}
            {!connector.connected && connector.connectionError && expandedSlug === connector.slug && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <p className="text-[10px] text-red-400/80 break-words">{connector.connectionError}</p>
              </motion.div>
            )}

            {/* DB URL configuration form */}
            <AnimatePresence>
              {configuringSlug === connector.slug && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-3 overflow-hidden"
                >
                  <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Database className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Database Connection</span>
                    </div>
                    <Input
                      type="password"
                      placeholder="postgresql://user:pass@host-pooler.neon.tech/dbname"
                      value={dbUrlInputs[connector.slug] || ''}
                      onChange={(e) => setDbUrlInputs((prev) => ({ ...prev, [connector.slug]: e.target.value }))}
                      className="h-8 text-xs rounded-lg bg-background border-border font-mono"
                      disabled={savingSlug === connector.slug}
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] rounded-lg border-border px-2.5"
                        onClick={() => handleTestDbConnection(connector.slug)}
                        disabled={testingSlugDb === connector.slug || !erpUrlStatus[connector.slug]}
                      >
                        {testingSlugDb === connector.slug ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Wifi className="w-3 h-3 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] rounded-lg border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2.5"
                        onClick={() => handleSaveDbUrl(connector.slug)}
                        disabled={savingSlug === connector.slug || !dbUrlInputs[connector.slug]?.trim()}
                      >
                        {savingSlug === connector.slug ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3 mr-1" />
                        )}
                        Save
                      </Button>
                      {erpUrlStatus[connector.slug] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10 px-2.5"
                          onClick={() => handleClearDbUrl(connector.slug)}
                          disabled={savingSlug === connector.slug}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                    {/* Test result indicator for the configure form */}
                    {dbTestResults[connector.slug] === 'success' && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Connection successful
                      </div>
                    )}
                    {dbTestResults[connector.slug] === 'failed' && (
                      <div className="flex items-center gap-1.5 text-[11px] text-red-400">
                        <XCircle className="w-3 h-3" /> Connection failed
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                onClick={() => handleTestConnection(connector.slug)}
                disabled={testingErp === connector.slug}
              >
                {testingErp === connector.slug ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wifi className="w-3 h-3 mr-1" />}
                Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                onClick={() => handleToggleConfigure(connector.slug)}
              >
                <Database className="w-3 h-3 mr-1" />
                {configuringSlug === connector.slug ? 'Hide DB' : 'Configure DB'}
              </Button>
              {!connector.connected && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                  onClick={() => setExpandedSlug(expandedSlug === connector.slug ? null : connector.slug)}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {expandedSlug === connector.slug ? 'Hide' : 'Details'}
                </Button>
              )}
              {connector.website && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                    onClick={() => copyEndpoint(connector.website!)}
                  >
                    <Copy className="w-3 h-3 mr-1" /> URL
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                    onClick={() => window.open(connector.website!, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {connectors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <Plug className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No integration connectors found</p>
        </div>
      )}

      {/* Bulk Configure Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Upload className="w-5 h-5 text-emerald-400" />
              Bulk Configure Database URLs
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Paste all ERP database URLs at once, one per line. Format: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">SLUG=postgresql://...</code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder={`apparelflow=postgresql://user:pass@apparelflow-pooler.neon.app/dbname\nhotelflow=postgresql://user:pass@hotelflow-pooler.neon.app/dbname\neduflow=postgresql://user:pass@eduflow-pooler.neon.app/dbname`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="min-h-[200px] text-xs font-mono bg-background border-border rounded-lg"
              disabled={bulkSaving}
            />
            <div className="text-[11px] text-muted-foreground space-y-1">
              <p>Available slugs: <span className="text-foreground">apparelflow, hotelflow, eduflow, martflow, pharmaflow, buildflow, travelflow, tenantflow, factoryflow, foodflow, autoflow, healthflow, textileflow, creativeflow, distriflow, logisticflow, fleetflow, electroflow, bookflow, fuelflow</span></p>
              <p>Use the Neon pooled connection string (with <code className="bg-secondary px-1 rounded">-pooler</code>) for best performance.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border text-xs"
              onClick={() => setBulkDialogOpen(false)}
              disabled={bulkSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleBulkSave}
              disabled={bulkSaving || !bulkText.trim()}
            >
              {bulkSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
