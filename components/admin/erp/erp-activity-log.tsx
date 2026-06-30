'use client'

import { useState } from 'react'
import { Activity, RefreshCw, Zap, Package, KeyRound, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface LogEntry {
  id: string; timestamp: string; type: string; status: string; duration: string; message: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '2025-03-04 14:23:01', type: 'sync', status: 'success', duration: '2.3s', message: 'Full sync completed — 142 records updated' },
  { id: '2', timestamp: '2025-03-04 14:00:00', type: 'connection_test', status: 'success', duration: '45ms', message: 'Connection test passed' },
  { id: '3', timestamp: '2025-03-04 12:15:33', type: 'module_change', status: 'success', duration: '0.1s', message: 'Module "Inventory" activated' },
  { id: '4', timestamp: '2025-03-04 10:00:00', type: 'sync', status: 'error', duration: '1.1s', message: 'Incremental sync failed — timeout' },
  { id: '5', timestamp: '2025-03-03 18:45:12', type: 'key_generated', status: 'success', duration: '0.2s', message: 'Enterprise key generated for client #1042' },
  { id: '6', timestamp: '2025-03-03 16:30:00', type: 'sync', status: 'success', duration: '3.1s', message: 'Full sync completed — 89 records updated' },
  { id: '7', timestamp: '2025-03-03 14:00:00', type: 'connection_test', status: 'error', duration: '5000ms', message: 'Connection timeout after 5s' },
  { id: '8', timestamp: '2025-03-03 09:00:00', type: 'module_change', status: 'success', duration: '0.1s', message: 'Module "Reports" deactivated' },
]

const typeIcons: Record<string, typeof RefreshCw> = { sync: RefreshCw, connection_test: Zap, module_change: Package, key_generated: KeyRound }
const statusMap: Record<string, 'success' | 'error'> = { success: 'success', error: 'error' }

export function ErpActivityLog({ erp }: { erp: { id: string; name: string } }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? MOCK_LOGS : MOCK_LOGS.filter(l => l.type === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sync">Sync</SelectItem>
            <SelectItem value="connection_test">Connection Test</SelectItem>
            <SelectItem value="module_change">Module Change</SelectItem>
            <SelectItem value="key_generated">Key Generated</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} events</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40 max-h-96 overflow-y-auto">
            {filtered.map(entry => {
              const Icon = typeIcons[entry.type] || Activity
              return (
                <div key={entry.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${entry.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <Icon className={`w-4 h-4 ${entry.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-foreground">{entry.message}</span>
                      <StatusBadge variant={statusMap[entry.status] || 'success'} size="sm" dot={false}>{entry.status}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.timestamp}</span>
                      <span>Duration: {entry.duration}</span>
                      <Badge variant="outline" className="text-[9px]">{entry.type.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
