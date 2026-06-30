'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, XCircle, ChevronRight } from 'lucide-react'

interface AlertItem {
  id: string
  severity: 'warning' | 'error'
  title: string
  description: string
  actionLabel: string
  actionPath: string
}

interface AlertsPanelProps {
  alerts: AlertItem[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">System Alerts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No active alerts — all systems operational.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">System Alerts</CardTitle>
          <span className="text-xs text-muted-foreground">{alerts.length} active</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isWarning = alert.severity === 'warning'
            const Icon = isWarning ? AlertTriangle : XCircle
            const iconColor = isWarning ? 'text-[var(--gg-amber)]' : 'text-[var(--gg-rose)]'
            const iconBg = isWarning ? 'bg-[var(--gg-amber)]/10' : 'bg-[var(--gg-rose)]/10'
            const borderColor = isWarning ? 'border-[var(--gg-amber)]/15' : 'border-[var(--gg-rose)]/15'

            return (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${borderColor} bg-card`}>
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 text-xs h-7 gap-1 text-muted-foreground hover:text-foreground">
                  {alert.actionLabel}
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
