'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, RefreshCw, CheckCircle2, XCircle, Loader2, Server, Copy, Table, HardDrive, Activity, Clock, Wifi, WifiOff, Globe, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DatabaseStatus } from './types'

interface ErpDbConnection {
  slug: string
  name: string
  connected: boolean
  latency: number | null
  clientCount: number
  error: string | null
}

interface EnhancedDatabaseStatus extends DatabaseStatus {
  erpDbConnections?: ErpDbConnection[]
  erpDbSummary?: {
    total: number
    configured: number
    connected: number
    disconnected: number
    notConfigured: number
  }
}

export function DatabaseSection() {
  const [dbStatus, setDbStatus] = useState<EnhancedDatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedTable, setExpandedTable] = useState<string | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/admin/database-status')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setDbStatus(data)
    } catch {
      setDbStatus(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const copyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied')).catch(() => toast.error('Failed to copy'))
  }

  if (loading) {
    return (
      <div className="space-y-3 p-2">
        <Skeleton className="h-24 rounded-xl bg-secondary" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  if (!dbStatus || !dbStatus.connected) {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Database Disconnected</p>
          <p className="text-xs text-muted-foreground mt-1">{dbStatus ? 'Connection failed' : 'Unable to check status'}</p>
          <Button variant="outline" size="sm" className="mt-3 border-border rounded-xl" onClick={() => fetchData(true)}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  const tables = dbStatus.database.tables || {}
  const tableEntries = Object.entries(tables)

  const tableLabels: Record<string, string> = {
    erpSystems: 'ERP Systems',
    clients: 'Clients',
    orders: 'Orders',
    payments: 'Payments',
    licenses: 'Licenses',
    invoices: 'Invoices',
    paymentAccounts: 'Payment Accounts',
    paymentSettings: 'Settings',
    auditLogs: 'Audit Logs',
    packages: 'Packages',
    subscriptions: 'Subscriptions',
  }

  const tableIcons: Record<string, string> = {
    erpSystems: '🏢',
    clients: '👥',
    orders: '📦',
    payments: '💳',
    licenses: '🔑',
    invoices: '📄',
    paymentAccounts: '🏦',
    paymentSettings: '⚙️',
    auditLogs: '📋',
    packages: '📦',
    subscriptions: '🔄',
  }

  const totalRecords = tableEntries.reduce((sum, [, count]) => sum + count, 0)
  const maxCount = Math.max(...tableEntries.map(([, count]) => count), 1)

  const erpSummary = dbStatus.erpDbSummary
  const erpDbConns = dbStatus.erpDbConnections || []

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Connected</p>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Active
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Server className="w-3 h-3" /> {dbStatus.database.type}</span>
                {dbStatus.database.size && <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {dbStatus.database.size}</span>}
                <span className={`flex items-center gap-1 ${dbStatus.latency < 500 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <Activity className="w-3 h-3" /> {dbStatus.latency}ms
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Table className="w-3 h-3" /> {tableEntries.length} tables
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  {totalRecords} total records
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border rounded-xl text-xs"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Live ERP Database Connectivity */}
      {erpSummary && erpSummary.total > 0 && (
        <div className="p-4 rounded-xl bg-card/90 backdrop-blur border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--gg-teal)]" />
              <p className="text-sm font-semibold text-foreground">Multi-Tenant ERP Databases</p>
            </div>
            <div className="flex items-center gap-2">
              {erpSummary.connected > 0 && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  <Wifi className="w-3 h-3 mr-0.5" /> {erpSummary.connected} Live
                </Badge>
              )}
              {erpSummary.disconnected > 0 && (
                <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                  <WifiOff className="w-3 h-3 mr-0.5" /> {erpSummary.disconnected} Down
                </Badge>
              )}
              {erpSummary.notConfigured > 0 && (
                <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-[10px]">
                  <Link2 className="w-3 h-3 mr-0.5" /> {erpSummary.notConfigured} Not Configured
                </Badge>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border text-center">
              <p className="text-lg font-bold text-foreground">{erpSummary.total}</p>
              <p className="text-[10px] text-muted-foreground">Total ERPs</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
              <p className="text-lg font-bold text-emerald-400">{erpSummary.connected}</p>
              <p className="text-[10px] text-muted-foreground">Connected</p>
            </div>
            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15 text-center">
              <p className="text-lg font-bold text-red-400">{erpSummary.disconnected}</p>
              <p className="text-[10px] text-muted-foreground">Down</p>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border text-center">
              <p className="text-lg font-bold text-muted-foreground">{erpSummary.notConfigured}</p>
              <p className="text-[10px] text-muted-foreground">Not Configured</p>
            </div>
          </div>

          {/* Live Connections List */}
          {erpDbConns.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
              {erpDbConns.map((conn) => (
                <div
                  key={conn.slug}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                    conn.connected
                      ? 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10'
                      : 'bg-red-500/5 border-red-500/15 hover:bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {conn.connected ? (
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-xs font-medium text-foreground">{conn.name}</span>
                    <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[9px]">
                      {conn.slug}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.connected ? (
                      <>
                        {conn.latency !== null && (
                          <span className={`text-[10px] font-medium ${
                            conn.latency < 500 ? 'text-emerald-400' : conn.latency < 2000 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {conn.latency}ms
                          </span>
                        )}
                        {conn.clientCount > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {conn.clientCount} clients
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-red-400/80 truncate max-w-[200px]" title={conn.error || ''}>
                        {conn.error || 'Unreachable'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {erpDbConns.length === 0 && erpSummary.notConfigured > 0 && (
            <div className="p-4 rounded-lg bg-secondary/30 border border-dashed border-border text-center">
              <Link2 className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No ERP databases configured yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Go to Integrations to configure database URLs</p>
            </div>
          )}
        </div>
      )}

      {/* Latency indicator */}
      <div className="p-3 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Response Latency
          </span>
          <span className={`text-xs font-semibold ${dbStatus.latency < 200 ? 'text-emerald-400' : dbStatus.latency < 1000 ? 'text-amber-400' : 'text-red-400'}`}>
            {dbStatus.latency}ms
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              dbStatus.latency < 200 ? 'bg-emerald-400' : dbStatus.latency < 1000 ? 'bg-amber-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(100, (dbStatus.latency / 2000) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">Fast (&lt;200ms)</span>
          <span className="text-[9px] text-muted-foreground">Normal (&lt;1s)</span>
          <span className="text-[9px] text-muted-foreground">Slow (&gt;1s)</span>
        </div>
      </div>

      {/* Table Count Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tableEntries.map(([key, count], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="bg-secondary/50 border border-border rounded-xl p-3 text-center hover:bg-secondary/80 transition-colors cursor-default"
          >
            <div className="text-lg mb-0.5">{tableIcons[key] || '📊'}</div>
            <p className="text-lg font-bold text-foreground">{count}</p>
            <p className="text-[10px] text-muted-foreground">{tableLabels[key] || key}</p>
            {count > 0 && (
              <div className="w-full bg-secondary rounded-full h-1 mt-2">
                <div
                  className="h-1 rounded-full bg-primary/50 transition-all"
                  style={{ width: `${Math.min(100, (count / maxCount) * 100)}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ERP Systems from DB */}
      {dbStatus.erpSystems && dbStatus.erpSystems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3 h-3" /> Registered ERP Systems
          </p>
          <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
            {dbStatus.erpSystems.map((erp: any) => (
              <div key={erp.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{erp.name}</span>
                  <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[9px]">
                    {erp.slug}
                  </Badge>
                  {erp.isActive ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-[9px]">
                      Inactive
                    </Badge>
                  )}
                  {erp.hasDatabaseUrl && (
                    <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[9px]">
                      <Database className="w-2.5 h-2.5 mr-0.5" /> DB
                    </Badge>
                  )}
                  {erp.moduleCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">{erp.moduleCount} modules</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => copyEndpoint(erp.slug)}
                  title="Copy slug"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection info */}
      <div className="p-3 rounded-xl bg-secondary/30 border border-border">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Engine:</span>
            <span className="text-foreground font-medium">{dbStatus.database.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Latency:</span>
            <span className={`font-medium ${dbStatus.latency < 500 ? 'text-emerald-400' : 'text-amber-400'}`}>{dbStatus.latency}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Table className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Tables:</span>
            <span className="text-foreground font-medium">{tableEntries.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Last check:</span>
            <span className="text-foreground font-medium">{new Date(dbStatus.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
