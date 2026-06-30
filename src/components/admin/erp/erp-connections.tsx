'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wifi, WifiOff, Eye, EyeOff, RefreshCw, Zap, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface ErpConnectionsProps { erp: { id: string; name: string; slug: string; databaseUrl?: string | null } }

export function ErpConnections({ erp }: ErpConnectionsProps) {
  const [connected, setConnected] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [testing, setTesting] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState('15min')
  const [lastSync, setLastSync] = useState<string>('Never')
  const [history, setHistory] = useState<{ time: string; latency: number; ok: boolean }[]>([])

  const testConnection = useCallback(async () => {
    setTesting(true)
    try {
      const res = await fetch(`/api/erp/${erp.slug}/test-connection`)
      const data = await res.json()
      setConnected(data.connected ?? false)
      setLatency(data.latency ?? null)
      setHistory(prev => [{ time: new Date().toLocaleTimeString(), latency: data.latency ?? 0, ok: data.connected ?? false }, ...prev.slice(0, 9)])
      setLastSync(new Date().toLocaleTimeString())
    } catch { setConnected(false) }
    finally { setTesting(false) }
  }, [erp.slug])

  useEffect(() => { testConnection() }, [testConnection])

  const maskUrl = (url: string) => url.replace(/\/\/[^@]+@/, '//****:****@')
  const dbUrl = erp.databaseUrl || 'Not configured'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Connection Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connected ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
              <div>
                <StatusBadge variant={connected ? 'success' : 'error'}>{connected ? 'Connected' : 'Disconnected'}</StatusBadge>
                {latency !== null && <span className="ml-2 text-xs text-muted-foreground">{latency}ms</span>}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={testConnection} disabled={testing} className="gap-1.5">
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}Test Connection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate font-mono">
              {showUrl ? dbUrl : maskUrl(dbUrl)}
            </code>
            <Button variant="ghost" size="sm" onClick={() => setShowUrl(!showUrl)}>
              {showUrl ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">Last sync: {lastSync}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Auto-Sync Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Enable auto-sync</span>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          {autoSync && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Interval:</span>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5min">5 minutes</SelectItem>
                  <SelectItem value="15min">15 minutes</SelectItem>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="1hr">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Manual Sync</Button>
        </CardContent>
      </Card>
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Connection History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">{h.time}</span>
                  <span className={h.ok ? 'text-emerald-500' : 'text-red-500'}>{h.ok ? 'Connected' : 'Failed'}</span>
                  <span className="text-muted-foreground">{h.latency}ms</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
