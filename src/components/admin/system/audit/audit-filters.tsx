'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuditFiltersProps {
  filters: { action: string; entity: string; userId: string; dateFrom: string; dateTo: string }
  onFiltersChange: (filters: any) => void
}

// Bare verbs still work because the API uses substring (`contains`) matching
// for `action` and `entity` (see /api/admin/audit/route.ts). The namespaced
// options are also provided so users can narrow down to a specific module
// (Bug #5 — previously the bare-verb options never matched any stored action
// because the route did exact match against namespaced strings like
// 'user.create' / 'client.update').
const ACTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'export', label: 'Export' },
  { value: 'user.', label: 'User actions' },
  { value: 'client.', label: 'Client actions' },
  { value: 'support.', label: 'Support actions' },
  { value: 'integration.', label: 'Integration actions' },
  { value: 'settings.', label: 'Settings actions' },
]
const ENTITIES = ['all', 'client', 'order', 'invoice', 'payment', 'subscription', 'license', 'user', 'role', 'setting']

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const update = (key: string, value: string) => onFiltersChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-wrap">
      <div className="space-y-1.5">
        <Label className="text-xs">Action</Label>
        <Select value={filters.action} onValueChange={v => update('action', v)}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Entity</Label>
        <Select value={filters.entity} onValueChange={v => update('entity', v)}>
          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{ENTITIES.map(e => <SelectItem key={e} value={e}>{e === 'all' ? 'All Entities' : e}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">From</Label>
        <Input type="date" className="w-36 h-9" value={filters.dateFrom} onChange={e => update('dateFrom', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">To</Label>
        <Input type="date" className="w-36 h-9" value={filters.dateTo} onChange={e => update('dateTo', e.target.value)} />
      </div>
      <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => onFiltersChange({ action: 'all', entity: 'all', userId: 'all', dateFrom: '', dateTo: '' })}>
        <RotateCcw className="w-3.5 h-3.5" /> Reset
      </Button>
    </div>
  )
}
