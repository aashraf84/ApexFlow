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

const ACTIONS = ['all', 'create', 'update', 'delete', 'login', 'export']
const ENTITIES = ['all', 'client', 'order', 'invoice', 'payment', 'subscription', 'license', 'user', 'role', 'setting']

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const update = (key: string, value: string) => onFiltersChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-wrap">
      <div className="space-y-1.5">
        <Label className="text-xs">Action</Label>
        <Select value={filters.action} onValueChange={v => update('action', v)}>
          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a === 'all' ? 'All Actions' : a}</SelectItem>)}</SelectContent>
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
