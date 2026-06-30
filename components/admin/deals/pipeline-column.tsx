'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { DealCard } from './deal-card'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Handshake } from 'lucide-react'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

interface PipelineColumnProps {
  stage: { key: string; label: string; color: string; deals: any[] }
  onEditDeal: (deal: any) => void
}

export function PipelineColumn({ stage, onEditDeal }: PipelineColumnProps) {
  const totalValue = stage.deals.reduce((s: number, d: any) => s + d.value, 0)

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-muted/30 min-h-[300px]">
      <div className="p-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
          <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{stage.deals.length} deal{stage.deals.length !== 1 ? 's' : ''}</span>
          <span className="font-medium">{formatPKR(totalValue)}</span>
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        {stage.deals.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground">No deals</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stage.deals.map((d: any) => (
              <DealCard key={d.id} deal={d} stageColor={stage.color} onClick={() => onEditDeal(d)} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
