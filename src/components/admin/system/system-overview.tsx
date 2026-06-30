'use client'

import { Activity, Clock, Users, Database, Zap, CheckCircle2, XCircle, AlertCircle, Server, Mail, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatsCard } from '@/components/admin/shared/stats-card'
import { StatusBadge } from '@/components/admin/shared/status-badge'

const SERVICES = [
  { name: 'Database', icon: Database, status: 'operational', latency: '12ms' },
  { name: 'API Server', icon: Server, status: 'operational', latency: '45ms' },
  { name: 'ERP Connections', icon: Activity, status: 'degraded', latency: '230ms' },
  { name: 'Email Service', icon: Mail, status: 'operational', latency: '180ms' },
  { name: 'WhatsApp API', icon: MessageCircle, status: 'operational', latency: '95ms' },
]

const STATUS_MAP: Record<string, { variant: 'success' | 'warning' | 'error'; icon: typeof CheckCircle2 }> = {
  operational: { variant: 'success', icon: CheckCircle2 },
  degraded: { variant: 'warning', icon: AlertCircle },
  down: { variant: 'error', icon: XCircle },
}

export function SystemOverview() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Overview" description="Monitor system health, performance, and service status" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Activity className="w-5 h-5 text-[var(--gg-green)]" />} label="Uptime" value="99.97%" change={0.02} changeLabel="vs last month" iconBg="bg-[var(--gg-green)]/10" />
        <StatsCard icon={<Users className="w-5 h-5 text-[var(--gg-teal)]" />} label="Active Users" value="24" change={8} changeLabel="vs last hour" iconBg="bg-[var(--gg-teal)]/10" />
        <StatsCard icon={<Database className="w-5 h-5 text-[var(--gg-amber)]" />} label="DB Size" value="1.2 GB" change={12} changeLabel="vs last month" iconBg="bg-[var(--gg-amber)]/10" />
        <StatsCard icon={<Zap className="w-5 h-5 text-[var(--gg-rose)]" />} label="API Response" value="45ms" change={-15} changeLabel="vs last week" iconBg="bg-[var(--gg-rose)]/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Service Status</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            {SERVICES.map(svc => {
              const status = STATUS_MAP[svc.status]
              const IconComp = status.icon
              return (
                <div key={svc.name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <svc.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{svc.latency}</span>
                    <StatusBadge variant={status.variant} size="sm">
                      <IconComp className="w-3 h-3" /> {svc.status}
                    </StatusBadge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">System Information</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[
                { label: 'Version', value: '2.4.1' },
                { label: 'Last Deploy', value: new Date(Date.now() - 86400000).toLocaleString() },
                { label: 'Environment', value: 'Production' },
                { label: 'Region', value: 'US-East-1' },
                { label: 'Node.js', value: '20.11.0' },
                { label: 'Next.js', value: '16.1.1' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
