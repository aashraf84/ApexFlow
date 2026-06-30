'use client'

import { useSelectedErp } from '@/hooks/use-selected-erp'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Database } from 'lucide-react'

export function ErpSelector() {
  const { selectedErpId, setSelectedErpId, systems, isLoading } = useSelectedErp()

  if (isLoading) {
    return <Skeleton className="h-9 w-48" />
  }

  if (systems.length === 0) return null

  return (
    <Select value={selectedErpId || ''} onValueChange={setSelectedErpId}>
      <SelectTrigger className="w-56 bg-white border-slate-200">
        <Database className="h-4 w-4 mr-2 text-emerald-600" />
        <SelectValue placeholder="Select ERP System" />
      </SelectTrigger>
      <SelectContent>
        {systems.map(system => (
          <SelectItem key={system.id} value={system.id}>
            <div className="flex items-center gap-2">
              {system.color && (
                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: system.color }} />
              )}
              <span>{system.name}</span>
              <span className="text-xs text-muted-foreground">({system.industry})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}