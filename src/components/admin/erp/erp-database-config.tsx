'use client'

import { useState } from 'react'
import { Database, Eye, EyeOff, Zap, Loader2, Table2, GitBranch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface ErpDatabaseConfigProps {
  erp: { id: string; slug: string; databaseUrl?: string | null; version?: string }
}

export function ErpDatabaseConfig({ erp }: ErpDatabaseConfigProps) {
  const [showUrl, setShowUrl] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newUrl, setNewUrl] = useState(erp.databaseUrl || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; latency: number } | null>(null)

  const dbUrl = erp.databaseUrl || 'Not configured'
  const maskUrl = (url: string) => url.replace(/\/\/[^@]+@/, '//****:****@')

  const handleTest = async () => {
    setTesting(true)
    try {
      const res = await fetch(`/api/erp/${erp.slug}/test-connection`)
      const data = await res.json()
      setTestResult({ ok: data.connected ?? false, latency: data.latency ?? 0 })
    } catch { setTestResult({ ok: false, latency: 0 }) }
    finally { setTesting(false) }
  }

  const mockTables = [
    { name: 'users', rows: 1250 }, { name: 'orders', rows: 8430 },
    { name: 'products', rows: 342 }, { name: 'invoices', rows: 5670 },
    { name: 'settings', rows: 48 },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Database className="w-4 h-4" />Database URL</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="postgresql://user:pass@host:5432/db" className="font-mono text-xs" />
              <Button size="sm" onClick={() => setEditing(false)}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-3 py-2 rounded flex-1 truncate font-mono">
                {showUrl ? dbUrl : maskUrl(dbUrl)}
              </code>
              <Button variant="ghost" size="sm" onClick={() => setShowUrl(!showUrl)}>
                {showUrl ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleTest} disabled={testing} className="gap-1.5">
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}Test
            </Button>
            {testResult && (
              <StatusBadge variant={testResult.ok ? 'success' : 'error'}>
                {testResult.ok ? `Connected (${testResult.latency}ms)` : 'Failed'}
              </StatusBadge>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Table2 className="w-4 h-4" />Table Counts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockTables.map(t => (
              <div key={t.name} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{t.name}</span>
                <Badge variant="outline" className="text-[10px]">{t.rows.toLocaleString()} rows</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><GitBranch className="w-4 h-4" />Schema Version</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline">v{erp.version || '1.0.0'}</Badge>
            <span className="text-xs text-muted-foreground">Last migrated: 2 days ago</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
