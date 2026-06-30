'use client'

import { Users, KeyRound, DollarSign, Package, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { StatsCard } from '@/components/admin/shared/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { getErpColor } from '@/lib/erp-data'

interface ErpStatsProps {
  erp: {
    clientCount: number; revenue: number; licenseCount: number
    moduleCount: number; color: string; status: string
    modules: { isActive: boolean }[]
  }
}

export function ErpStats({ erp }: ErpStatsProps) {
  const color = getErpColor(erp.color)
  const activeModules = erp.modules?.filter(m => m.isActive).length ?? erp.moduleCount
  const syncHealth = erp.status === 'active' ? 'Healthy' : 'Issues'
  const syncVariant = erp.status === 'active' ? 'success' as const : 'error' as const

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Users className="w-5 h-5 text-emerald-500" />}
          label="Client Count"
          value={erp.clientCount ?? 0}
          change={12}
          changeLabel="vs last month"
          iconBg="bg-emerald-500/10"
        />
        <StatsCard
          icon={<KeyRound className="w-5 h-5 text-violet-500" />}
          label="Active Licenses"
          value={erp.licenseCount ?? 0}
          change={8}
          changeLabel="vs last month"
          iconBg="bg-violet-500/10"
        />
        <StatsCard
          icon={<DollarSign className="w-5 h-5 text-amber-500" />}
          label="Monthly Revenue"
          value={`PKR ${(erp.revenue ?? 0).toLocaleString()}`}
          change={5}
          changeLabel="vs last month"
          iconBg="bg-amber-500/10"
        />
        <StatsCard
          icon={<Package className="w-5 h-5 text-cyan-500" />}
          label="Active Modules"
          value={activeModules}
          change={0}
          changeLabel="no change"
          iconBg="bg-cyan-500/10"
        />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" /> Sync Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <StatusBadge variant={syncVariant}>{syncHealth}</StatusBadge>
            <span className="text-sm text-muted-foreground">
              {erp.status === 'active' ? 'All systems operational and syncing normally' : 'Connection issues detected — check Connections tab'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
