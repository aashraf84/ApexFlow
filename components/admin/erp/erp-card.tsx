'use client'

import { createElement } from 'react'
import { Users, DollarSign, KeyRound, Eye, Zap, Settings2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { getErpIcon, getErpColor } from '@/lib/erp-data'
import Link from 'next/link'

interface ErpItem {
  id: string; name: string; slug: string; description: string
  icon: string; color: string; status: string; industry: string
  moduleCount: number; orderCount?: number
  connected?: boolean; clientCount?: number; revenue?: number; licenses?: number
}

interface ErpCardProps { erp: ErpItem; view: 'grid' | 'list' }

const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success', coming_soon: 'warning', maintenance: 'error',
}

export function ErpCard({ erp, view }: ErpCardProps) {
  const IconComp = getErpIcon(erp.icon)
  const color = getErpColor(erp.color)
  const statusLabel = erp.status === 'active' ? 'LIVE' : erp.status === 'coming_soon' ? 'COMING SOON' : 'MAINTENANCE'
  const statusVariant = statusMap[erp.status] || 'success'
  const connected = erp.connected !== false

  if (view === 'list') {
    return (
      <Link href={`/admin/erp/${erp.slug}`}>
        <Card className="border-border/60 hover:border-border hover:shadow-sm transition-all cursor-pointer">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${color.bg} shrink-0`}>
              {createElement(IconComp, { className: `w-5 h-5 ${color.text}` })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{erp.name}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <StatusBadge variant={statusVariant} size="sm">{statusLabel}</StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{erp.industry}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{erp.clientCount ?? 0}</span>
              <span className="flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" />{erp.licenses ?? 0}</span>
              <span className="flex items-center gap-1">{erp.moduleCount} mods</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/admin/erp/${erp.slug}`}>
      <Card className="border-border/60 hover:border-border hover:shadow-md transition-all cursor-pointer group h-full">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${color.bg}`}>
              {createElement(IconComp, { className: `w-5 h-5 ${color.text}` })}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <StatusBadge variant={statusVariant} size="sm">{statusLabel}</StatusBadge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{erp.name}</h3>
            <Badge variant="outline" className="mt-1 text-[10px]">{erp.industry}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/40">
            <div><p className="text-sm font-bold text-foreground">{erp.clientCount ?? 0}</p><p className="text-[10px] text-muted-foreground">Clients</p></div>
            <div><p className="text-sm font-bold text-foreground">{erp.licenses ?? 0}</p><p className="text-[10px] text-muted-foreground">Licenses</p></div>
            <div><p className="text-sm font-bold text-foreground">{erp.moduleCount}</p><p className="text-[10px] text-muted-foreground">Modules</p></div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1"><Eye className="w-3 h-3" />View</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1"><Zap className="w-3 h-3" />Test</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1"><Settings2 className="w-3 h-3" />Config</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
