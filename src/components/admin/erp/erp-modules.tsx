'use client'

import { createElement, useState } from 'react'
import { Package, Star, ToggleLeft, ToggleRight, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getErpColor } from '@/lib/erp-data'

interface ErpModule {
  id: string; name: string; slug: string; description: string
  category?: string | null; price: number; isActive: boolean
  isPremium?: boolean; icon?: string | null
}

interface ErpModulesProps { erp: { color: string; modules: ErpModule[]; moduleCount: number } }

export function ErpModules({ erp }: ErpModulesProps) {
  const [modules, setModules] = useState(() =>
    (erp.modules || []).map(m => ({ ...m, isPremium: m.isPremium ?? m.price > 0 }))
  )
  const color = getErpColor(erp.color)
  const activeCount = modules.filter(m => m.isActive).length

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
  }

  const toggleAll = (active: boolean) => {
    setModules(prev => prev.map(m => ({ ...m, isActive: active })))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{activeCount} of {modules.length} active</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="text-xs">Activate All</Button>
          <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="text-xs">Deactivate All</Button>
        </div>
      </div>
      {modules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No modules configured</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map(mod => (
            <Card key={mod.id} className={`border-border/60 transition-all ${mod.isActive ? `${color.border}` : 'opacity-60'}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${mod.isActive ? color.bg : 'bg-muted'}`}>
                  <Package className={`w-4 h-4 ${mod.isActive ? color.text : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">{mod.name}</span>
                    {mod.isPremium && (
                      <Badge className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <Star className="w-2.5 h-2.5 mr-0.5" />PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{mod.description}</p>
                  {mod.category && <Badge variant="outline" className="text-[9px] mt-1">{mod.category}</Badge>}
                </div>
                <Switch checked={mod.isActive} onCheckedChange={() => toggleModule(mod.id)} className="shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
