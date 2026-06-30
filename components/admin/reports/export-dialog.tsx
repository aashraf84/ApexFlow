'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  report: any
}

const FORMATS = ['CSV', 'PDF', 'Excel', 'JSON']
const ALL_COLUMNS = ['Name', 'Email', 'Industry', 'Status', 'Amount', 'Date', 'Method']

export function ExportDialog({ open, onClose, report }: ExportDialogProps) {
  const [format, setFormat] = useState('CSV')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedCols, setSelectedCols] = useState<string[]>(ALL_COLUMNS)

  const toggleCol = (col: string) => {
    setSelectedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])
  }

  const handleExport = () => {
    const params = new URLSearchParams({ format, ...(dateFrom && { from: dateFrom }), ...(dateTo && { to: dateTo }), columns: selectedCols.join(',') })
    console.log('Export:', params.toString())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Download className="w-4 h-4" /> Export Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="flex-1" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Columns to Include</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_COLUMNS.map(col => (
                <label key={col} className="flex items-center gap-1.5 text-sm">
                  <Checkbox checked={selectedCols.includes(col)} onCheckedChange={() => toggleCol(col)} />
                  {col}
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full gap-1.5" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export as {format}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
