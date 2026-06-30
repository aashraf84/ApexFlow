'use client'

import { useState } from 'react'
import { KeyRound, Copy, Ban, Plus, Search, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface SerialKey {
  id: string; key: string; type: string; status: string; clientName: string | null
  maxUsers: number; maxDevices: number; expiresAt: string | null
}

const MOCK_KEYS: SerialKey[] = [
  { id: '1', key: 'AFW-XXXX-YYYY-ZZZZ-ABCD', type: 'enterprise', status: 'active', clientName: 'Acme Corp', maxUsers: 50, maxDevices: 100, expiresAt: '2026-12-31' },
  { id: '2', key: 'HFL-XXXX-YYYY-ZZZZ-EFGH', type: 'professional', status: 'active', clientName: 'Hotel Paradise', maxUsers: 25, maxDevices: 50, expiresAt: '2025-06-30' },
  { id: '3', key: 'EFL-XXXX-YYYY-ZZZZ-IJKL', type: 'standard', status: 'expired', clientName: 'Edu Academy', maxUsers: 10, maxDevices: 20, expiresAt: '2024-01-01' },
  { id: '4', key: 'BFL-XXXX-YYYY-ZZZZ-MNOP', type: 'trial', status: 'active', clientName: null, maxUsers: 3, maxDevices: 5, expiresAt: '2025-04-15' },
  { id: '5', key: 'PFL-XXXX-YYYY-ZZZZ-QRST', type: 'enterprise', status: 'revoked', clientName: 'Old Client', maxUsers: 100, maxDevices: 200, expiresAt: null },
]

const keyStatusMap: Record<string, 'success' | 'warning' | 'error'> = { active: 'success', expired: 'warning', revoked: 'error' }
const typeColors: Record<string, string> = { trial: 'bg-muted text-muted-foreground', standard: 'bg-sky-500/10 text-sky-500', professional: 'bg-violet-500/10 text-violet-500', enterprise: 'bg-amber-500/10 text-amber-500' }

export function ErpSerialKeys({ erp }: { erp: { id: string; name: string } }) {
  const [keys] = useState<SerialKey[]>(MOCK_KEYS)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showGen, setShowGen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = keys.filter(k => (filterType === 'all' || k.type === filterType) && (filterStatus === 'all' || k.status === filterStatus))
  const maskKey = (k: string) => k.slice(0, 8) + '••••••••' + k.slice(-4)

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="trial">Trial</SelectItem><SelectItem value="standard">Standard</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="revoked">Revoked</SelectItem></SelectContent>
        </Select>
        <Button size="sm" className="gap-1.5 ml-auto" onClick={() => setShowGen(true)}><Plus className="w-3.5 h-3.5" />Generate Key</Button>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr><th className="text-left p-3 text-xs font-medium text-muted-foreground">Key</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Client</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Users/Devices</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Expires</th><th className="p-3" /></tr></thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map(k => (
              <tr key={k.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs"><span className="mr-1">{maskKey(k.key)}</span><Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyKey(k.id, k.key)}>{copiedId === k.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}</Button></td>
                <td className="p-3"><Badge className={`text-[10px] ${typeColors[k.type] || ''}`}>{k.type}</Badge></td>
                <td className="p-3"><StatusBadge variant={keyStatusMap[k.status] || 'neutral'} size="sm">{k.status}</StatusBadge></td>
                <td className="p-3 text-muted-foreground">{k.clientName || '—'}</td>
                <td className="p-3 text-muted-foreground">{k.maxUsers}/{k.maxDevices}</td>
                <td className="p-3 text-muted-foreground">{k.expiresAt || 'Never'}</td>
                <td className="p-3">{k.status === 'active' && <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-600"><Ban className="w-3 h-3 mr-1" />Revoke</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showGen} onOpenChange={setShowGen}>
        <DialogContent><DialogHeader><DialogTitle>Generate Serial Key</DialogTitle></DialogHeader>
          <div className="space-y-3"><Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="trial">Trial</SelectItem><SelectItem value="standard">Standard</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select><Input type="number" placeholder="Max users" /><Input type="number" placeholder="Max devices" /><Input type="date" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowGen(false)}>Cancel</Button><Button onClick={() => setShowGen(false)}>Generate</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
