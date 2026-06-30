'use client'

import { createElement } from 'react'
import { Zap, RefreshCw, Pencil, ExternalLink, Users, DollarSign, Package, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { getErpIcon, getErpColor, getErpWebsite } from '@/lib/erp-data'

interface ErpHeaderProps {
  erp: {
    id: string; name: string; slug: string; description: string
    icon: string; color: string; status: string; industry: string
    version: string; website: string | null; moduleCount: number
    clientCount: number; revenue: number; licenseCount: number
  }
}

const statusMap: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  active: { variant: 'success', label: 'LIVE' },
  coming_soon: { variant: 'warning', label: 'COMING SOON' },
  maintenance: { variant: 'error', label: 'MAINTENANCE' },
}

export function ErpHeader({ erp }: ErpHeaderProps) {
  const IconComp = getErpIcon(erp.icon)
  const color = getErpColor(erp.color)
  const st = statusMap[erp.status] || statusMap.active
  const website = erp.website || getErpWebsite(erp.slug)

  const stats = [
    { icon: <Users className="w-4 h-4" />, label: 'Clients', value: erp.clientCount ?? 0 },
    { icon: <DollarSign className="w-4 h-4" />, label: 'Revenue', value: `PKR ${(erp.revenue ?? 0).toLocaleString()}` },
    { icon: <Package className="w-4 h-4" />, label: 'Modules', value: erp.moduleCount },
    { icon: <Clock className="w-4 h-4" />, label: 'Uptime', value: '99.9%' },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-start gap-5 p-5 rounded-xl border border-border/60 bg-card">
      <div className="relative">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br"
          style={{ background: `linear-gradient(135deg, ${color.glow}, ${color.hex}20)` }}>
          {createElement(IconComp, { className: `w-8 h-8 ${color.text}` })}
        </div>
        <div className="absolute -inset-1 rounded-2xl opacity-30 blur-md" style={{ background: color.glow }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">{erp.name}</h1>
          <StatusBadge variant={st.variant} size="sm">{st.label}</StatusBadge>
          <Badge variant="outline" className="text-[10px]">{erp.industry}</Badge>
          <Badge variant="outline" className="text-[10px]">v{erp.version}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{erp.description}</p>
        <div className="flex items-center gap-5 mt-3">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">{s.icon}</span>
              <span className="font-semibold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <a href={`/api/erp/${erp.slug}/test-connection`} target="_blank"><Zap className="w-3.5 h-3.5" />Test</a>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Sync</Button>
        <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="w-3.5 h-3.5" />Edit</Button>
        {website && website !== '#' && (
          <Button size="sm" className="gap-1.5" asChild>
            <a href={website} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" />View Live</a>
          </Button>
        )}
      </div>
    </div>
  )
}
