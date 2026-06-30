'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  UserPlus, CreditCard, FileText, Key, AlertTriangle, CheckCircle, Info, ShoppingCart,
} from 'lucide-react'

interface ActivityItem {
  id: string
  action: string
  entity?: string
  entityId?: string
  details?: string
  client: string | null
  userName?: string
  time: string
  type: 'success' | 'warning' | 'info'
}

interface ActivityFeedProps {
  data: ActivityItem[]
}

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function getActionIcon(action: string) {
  const lower = (action || '').toLowerCase()
  if (lower.includes('client') || lower.includes('user')) return UserPlus
  if (lower.includes('payment') || lower.includes('pay')) return CreditCard
  if (lower.includes('invoice')) return FileText
  if (lower.includes('license')) return Key
  if (lower.includes('order')) return ShoppingCart
  if (lower.includes('error') || lower.includes('fail')) return AlertTriangle
  if (lower.includes('create') || lower.includes('success')) return CheckCircle
  return Info
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'success': return { cls: 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20', label: 'Success' }
    case 'warning': return { cls: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20', label: 'Warning' }
    default: return { cls: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20', label: 'Info' }
  }
}

export function ActivityFeed({ data }: ActivityFeedProps) {
  if (!data || data.length === 0) return null

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <Badge variant="outline" className="text-xs">{data.length} events</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-96">
          <div className="space-y-1">
            {data.map((item) => {
              const Icon = getActionIcon(item.action)
              const badge = getTypeBadge(item.type)

              return (
                <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${badge.cls} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{item.action}</p>
                      {item.entity && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 leading-3 shrink-0">{item.entity}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.client && <span className="text-xs text-muted-foreground truncate">{item.client}</span>}
                      {item.userName && <span className="text-xs text-muted-foreground">by {item.userName}</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{formatTimeAgo(item.time)}</span>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
