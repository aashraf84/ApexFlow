'use client'

import { useState } from 'react'
import { Database, Columns3, Filter, Calculator, Group, BarChart3, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CustomBuilderProps {
  open: boolean
  onClose: () => void
  onPreview: (report: any) => void
}

const DATA_SOURCES = ['Clients', 'Orders', 'Payments', 'Invoices', 'ERP Stats', 'Subscriptions']
const SOURCE_COLUMNS: Record<string, string[]> = {
  Clients: ['Name', 'Email', 'Industry', 'Status', 'Created'],
  Orders: ['Order #', 'Client', 'Amount', 'Status', 'Date'],
  Payments: ['Payment #', 'Client', 'Amount', 'Method', 'Status'],
  Invoices: ['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'],
  'ERP Stats': ['System', 'Modules', 'Users', 'Uptime', 'Sync Status'],
  Subscriptions: ['Client', 'Plan', 'Fee', 'Status', 'Renewal'],
}
const CHART_TYPES = ['table', 'bar', 'line', 'pie']
const AGGREGATIONS = ['sum', 'count', 'average']

export function CustomBuilder({ open, onClose, onPreview }: CustomBuilderProps) {
  const [source, setSource] = useState('Clients')
  const [selectedCols, setSelectedCols] = useState<string[]>(['Name', 'Status'])
  const [filters, setFilters] = useState([{ field: '', operator: 'eq', value: '' }])
  const [aggregation, setAggregation] = useState('count')
  const [groupBy, setGroupBy] = useState('')
  const [chartType, setChartType] = useState('table')

  const toggleCol = (col: string) => {
    setSelectedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])
  }

  const handlePreview = () => {
    onPreview({
      id: 'custom', name: `Custom ${source} Report`, type: 'custom',
      description: `${aggregation} of ${source} grouped by ${groupBy || 'none'}`,
      data: [{ label: 'Group A', value: 120 }, { label: 'Group B', value: 85 }, { label: 'Group C', value: 210 }],
      chartType, columns: selectedCols,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Custom Report Builder</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Data Source</Label>
            <Select value={source} onValueChange={v => { setSource(v); setSelectedCols([]); setGroupBy('') }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DATA_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Columns3 className="w-3.5 h-3.5" /> Columns</Label>
            <div className="flex flex-wrap gap-3">
              {(SOURCE_COLUMNS[source] || []).map(col => (
                <label key={col} className="flex items-center gap-1.5 text-sm">
                  <Checkbox checked={selectedCols.includes(col)} onCheckedChange={() => toggleCol(col)} />
                  {col}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Filters</Label>
            {filters.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={f.field} onValueChange={v => { const u = [...filters]; u[i] = { ...u[i], field: v }; setFilters(u) }}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Field" /></SelectTrigger>
                  <SelectContent>{(SOURCE_COLUMNS[source] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={f.operator} onValueChange={v => { const u = [...filters]; u[i] = { ...u[i], operator: v }; setFilters(u) }}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq">Equals</SelectItem>
                    <SelectItem value="neq">Not equals</SelectItem>
                    <SelectItem value="gt">Greater than</SelectItem>
                    <SelectItem value="lt">Less than</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="flex-1" placeholder="Value" value={f.value} onChange={e => { const u = [...filters]; u[i] = { ...u[i], value: e.target.value }; setFilters(u) }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFilters([...filters, { field: '', operator: 'eq', value: '' }])}>+ Add Filter</Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> Aggregation</Label>
              <Select value={aggregation} onValueChange={setAggregation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AGGREGATIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Group className="w-3.5 h-3.5" /> Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(SOURCE_COLUMNS[source] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHART_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full gap-1.5" onClick={handlePreview}><Eye className="w-4 h-4" /> Preview Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
