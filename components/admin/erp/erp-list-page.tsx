'use client'

import { useState, useEffect } from 'react'
import { Search, LayoutGrid, List, Plus, Database } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { ErpCard } from './erp-card'

interface ErpItem {
  id: string; name: string; slug: string; description: string
  icon: string; color: string; status: string; industry: string
  moduleCount: number; databaseUrl?: string | null
}

export function ErpListPage() {
  const [erps, setErps] = useState<ErpItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchErps = async () => {
      try {
        const res = await fetch('/api/erp')
        if (res.ok) {
          const json = await res.json()
          setErps(json.erpSystems || [])
        }
      } catch {
        // silent
      } finally { setLoading(false) }
    }
    fetchErps()
  }, [])

  const filtered = erps.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.industry?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="ERP Ecosystem"
        description="Manage all ERP systems, connections, modules, and integrations"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Add ERP
          </Button>
        }
      />
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search ERP systems..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm"
            onClick={() => setView('grid')} className="rounded-none">
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm"
            onClick={() => setView('list')} className="rounded-none">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Database className="w-6 h-6" />}
          title={erps.length === 0 ? 'No ERP systems configured' : 'No ERP systems found'}
          description={erps.length === 0
            ? 'Add your first ERP system to get started with integrations and real-time sync.'
            : 'Try adjusting your search criteria'
          }
        />
      ) : (
        <div className={view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
        }>
          {filtered.map(erp => (
            <ErpCard key={erp.id} erp={erp} view={view} />
          ))}
        </div>
      )}
    </div>
  )
}