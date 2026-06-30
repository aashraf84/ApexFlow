'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar } from 'lucide-react'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
}

const STAGE_BORDER: Record<string, string> = {
  lead: 'border-l-sky-500', qualified: 'border-l-amber-500',
  proposal: 'border-l-violet-500', negotiation: 'border-l-orange-500',
  closed_won: 'border-l-emerald-500', closed_lost: 'border-l-rose-500',
}

interface DealCardProps {
  deal: {
    id: string; title: string; value: number; stage: string
    probability: number; expectedCloseDate: string | null
    client: { id: string; companyName: string } | null
  }
  stageColor: string
  onClick: () => void
}

export function DealCard({ deal, stageColor, onClick }: DealCardProps) {
  const borderClass = STAGE_BORDER[deal.stage] || 'border-l-muted'

  return (
    <Card className={`border-l-2 ${borderClass} cursor-pointer hover:shadow-md transition-shadow bg-card`}
      onClick={onClick}>
      <CardContent className="p-3 space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground line-clamp-1">{deal.title}</p>
          {deal.client && (
            <p className="text-xs text-muted-foreground">{deal.client.companyName}</p>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground">{formatPKR(deal.value)}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Probability</span>
            <span>{deal.probability}%</span>
          </div>
          <Progress value={deal.probability} className="h-1.5" />
        </div>
        {deal.expectedCloseDate && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Close: {formatDate(deal.expectedCloseDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
