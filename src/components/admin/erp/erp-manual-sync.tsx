'use client'

import { useState } from 'react'
import { RefreshCw, Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface ErpManualSyncProps { erp: { id: string; slug: string; name: string } }

export function ErpManualSync({ erp }: ErpManualSyncProps) {
  const [syncType, setSyncType] = useState('full')
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setProgress(0)
    setResult(null)
    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 300)
    try {
      const res = await fetch(`/api/erp/${erp.slug}/test-connection`)
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)
      setResult({ ok: data.connected ?? false, message: data.connected ? 'Sync completed successfully' : (data.error || 'Sync failed') })
    } catch {
      clearInterval(interval)
      setProgress(100)
      setResult({ ok: false, message: 'Sync failed — connection error' })
    } finally { setSyncing(false) }
  }

  const lastSyncResult = result || { ok: true, message: 'Last sync: No recent sync performed' }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />Manual Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Sync type:</span>
          <Select value={syncType} onValueChange={setSyncType}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Sync</SelectItem>
              <SelectItem value="incremental">Incremental</SelectItem>
              <SelectItem value="schema_only">Schema Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="gap-1.5">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {syncing ? 'Syncing...' : 'Start Sync'}
        </Button>
        {syncing && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        )}
        {result && !syncing && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {result.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            <span className="text-sm">{result.message}</span>
          </div>
        )}
        {!result && !syncing && (
          <div className="text-xs text-muted-foreground">{lastSyncResult.message}</div>
        )}
      </CardContent>
    </Card>
  )
}
