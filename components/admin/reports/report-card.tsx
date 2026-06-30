'use client'

import { FileText, Play, Pencil, Copy, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface ReportCardProps {
  report: {
    id: string
    name: string
    type: string
    description: string | null
    schedule: string | null
    lastRunAt: string | null
  }
  onRun: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

const TYPE_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  financial: 'success', sales: 'info', crm: 'warning', marketing: 'neutral', operational: 'info', custom: 'neutral',
}

export function ReportCard({ report, onRun, onEdit, onDuplicate, onDelete }: ReportCardProps) {
  return (
    <Card className="border-border/60 hover:border-border transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{report.name}</h3>
              <StatusBadge variant={TYPE_VARIANT[report.type] || 'neutral'} size="sm">{report.type}</StatusBadge>
            </div>
            {report.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{report.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
              {report.lastRunAt && <span>Last run: {new Date(report.lastRunAt).toLocaleDateString()}</span>}
              {report.schedule && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-4">
                  {report.schedule}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => onRun(report.id)}>
            <Play className="w-3 h-3" /> Run
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => onEdit(report.id)}>
            <Pencil className="w-3 h-3" /> Edit
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => onDuplicate(report.id)}>
            <Copy className="w-3 h-3" /> Duplicate
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-[var(--gg-rose)] hover:text-[var(--gg-rose)]" onClick={() => onDelete(report.id)}>
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
