'use client'

import { Download, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReportViewerProps {
  report: any
  open: boolean
  onClose: () => void
  onExport: () => void
}

const COLORS = ['var(--gg-teal)', 'var(--gg-green)', 'var(--gg-amber)', 'var(--gg-rose)', 'var(--gg-violet)']

export function ReportViewer({ report, open, onClose, onExport }: ReportViewerProps) {
  const data = report?.data || []
  const chartType = report?.chartType || 'bar'
  const maxValue = Math.max(...data.map((d: any) => d.value), 1)

  const renderChart = () => {
    if (chartType === 'pie') {
      const total = data.reduce((s: number, d: any) => s + d.value, 0) || 1
      let cumulative = 0
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
          {data.map((d: any, i: number) => {
            const pct = d.value / total
            const start = cumulative * 2 * Math.PI
            cumulative += pct
            const end = cumulative * 2 * Math.PI
            const largeArc = pct > 0.5 ? 1 : 0
            const x1 = 100 + 80 * Math.cos(start - Math.PI / 2)
            const y1 = 100 + 80 * Math.sin(start - Math.PI / 2)
            const x2 = 100 + 80 * Math.cos(end - Math.PI / 2)
            const y2 = 100 + 80 * Math.sin(end - Math.PI / 2)
            return <path key={i} d={`M100 100 L${x1} ${y1} A80 80 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={COLORS[i % COLORS.length]} opacity={0.8} />
          })}
        </svg>
      )
    }
    if (chartType === 'line') {
      const pts = data.map((d: any, i: number) => `${(i / Math.max(data.length - 1, 1)) * 280 + 20},${180 - (d.value / maxValue) * 140}`).join(' ')
      return <svg viewBox="0 0 320 200" className="w-full h-40"><polyline fill="none" stroke={COLORS[0]} strokeWidth="2.5" points={pts} />{data.map((d: any, i: number) => { const x = (i / Math.max(data.length - 1, 1)) * 280 + 20; const y = 180 - (d.value / maxValue) * 140; return <circle key={i} cx={x} cy={y} r="4" fill={COLORS[0]} /> })}</svg>
    }
    // bar / table default to bar
    return (
      <div className="flex items-end gap-2 h-40">
        {data.map((d: any, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-foreground">{d.value.toLocaleString()}</span>
            <div className="w-full rounded-t-md" style={{ height: `${(d.value / maxValue) * 120}px`, backgroundColor: COLORS[i % COLORS.length], opacity: 0.8 }} />
            <span className="text-[10px] text-muted-foreground truncate max-w-full">{d.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{report?.name || 'Report'}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Generated: {new Date().toLocaleString()}</p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={onExport}>
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </DialogHeader>

        {chartType !== 'table' && (
          <div className="border border-border/60 rounded-lg p-4 bg-muted/30">
            {renderChart()}
            {chartType === 'pie' && (
              <div className="flex flex-wrap gap-3 justify-center mt-3">
                {data.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{d.label}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border border-border/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left px-3 py-2 font-medium text-muted-foreground">Label</th><th className="text-right px-3 py-2 font-medium text-muted-foreground">Value</th></tr></thead>
            <tbody>{data.map((d: any, i: number) => (
              <tr key={i} className="border-t border-border/40"><td className="px-3 py-2">{d.label}</td><td className="px-3 py-2 text-right font-medium">{d.value.toLocaleString()}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
