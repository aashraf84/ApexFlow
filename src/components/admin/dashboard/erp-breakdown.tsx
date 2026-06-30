'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Shirt, Hotel, GraduationCap, ShoppingCart, Pill, HardHat, Building2,
  Factory, Utensils, Plane, Wrench, HeartPulse, TextCursorInput, Palette,
  Truck, Route, Database, Leaf, BookOpen, Fuel,
} from 'lucide-react'

interface ErpItem {
  slug: string
  name: string
  clients: number
  revenue: number
  licenses: number
  connected: boolean
  licenseUtilization: number
}

interface ErpBreakdownProps {
  data: ErpItem[]
}

const ERP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  apparelflow: Shirt, hotelflow: Hotel, eduflow: GraduationCap, martflow: ShoppingCart,
  pharmaflow: Pill, buildflow: HardHat, tenantflow: Building2, factoryflow: Factory,
  foodflow: Utensils, travelflow: Plane, autoflow: Wrench, healthflow: HeartPulse,
  textileflow: TextCursorInput, creativeflow: Palette, logisticflow: Truck,
  distriflow: Route, electroflow: Database, greenflow: Leaf, bookflow: BookOpen,
  fuelflow: Fuel,
}

const ERP_COLORS: Record<string, string> = {
  apparelflow: 'text-teal-400', hotelflow: 'text-amber-400', eduflow: 'text-emerald-400',
  martflow: 'text-yellow-400', pharmaflow: 'text-red-400', buildflow: 'text-orange-400',
  tenantflow: 'text-pink-400', factoryflow: 'text-lime-400', foodflow: 'text-rose-400',
  travelflow: 'text-cyan-400', autoflow: 'text-sky-400', healthflow: 'text-fuchsia-400',
  textileflow: 'text-violet-400', creativeflow: 'text-pink-400', logisticflow: 'text-green-400',
  distriflow: 'text-amber-400', electroflow: 'text-blue-400', greenflow: 'text-emerald-400',
  bookflow: 'text-violet-400',
  fuelflow: 'text-orange-400',
}

const ERP_BG: Record<string, string> = {
  apparelflow: 'bg-teal-400/10', hotelflow: 'bg-amber-400/10', eduflow: 'bg-emerald-400/10',
  martflow: 'bg-yellow-400/10', pharmaflow: 'bg-red-400/10', buildflow: 'bg-orange-400/10',
  tenantflow: 'bg-pink-400/10', factoryflow: 'bg-lime-400/10', foodflow: 'bg-rose-400/10',
  travelflow: 'bg-cyan-400/10', autoflow: 'bg-sky-400/10', healthflow: 'bg-fuchsia-400/10',
  textileflow: 'bg-violet-400/10', creativeflow: 'bg-pink-400/10', logisticflow: 'bg-green-400/10',
  distriflow: 'bg-amber-400/10', electroflow: 'bg-blue-400/10', greenflow: 'bg-emerald-400/10',
  bookflow: 'bg-violet-400/10',
  fuelflow: 'bg-orange-400/10',
}

function formatPKR(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export function ErpBreakdown({ data }: ErpBreakdownProps) {
  if (!data || data.length === 0) return null

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">ERP Systems</CardTitle>
            <p className="text-xs text-muted-foreground">{data.length} system{data.length !== 1 ? 's' : ''} &middot; {data.filter((e) => e.connected).length} connected</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-[420px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((erp) => {
              const Icon = ERP_ICONS[erp.slug] || Database
              const color = ERP_COLORS[erp.slug] || 'text-cyan-400'
              const bg = ERP_BG[erp.slug] || 'bg-cyan-400/10'

              return (
                <div key={erp.slug} className="p-3 rounded-xl border border-border/60 bg-card hover:border-border transition-colors">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{erp.name}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${erp.connected ? 'bg-[var(--gg-green)]' : 'bg-[var(--gg-rose)]'}`} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2.5">
                    <div>
                      <p className="text-sm font-bold">{erp.clients}</p>
                      <p className="text-[10px] text-muted-foreground">Clients</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{formatPKR(erp.revenue)}</p>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{erp.licenses}</p>
                      <p className="text-[10px] text-muted-foreground">Licenses</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Utilization</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 leading-3">{erp.licenseUtilization}%</Badge>
                    </div>
                    <Progress value={erp.licenseUtilization} className="h-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
