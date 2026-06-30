'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AuditTable } from './audit-table'
import { AuditFilters } from './audit-filters'

export function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ action: 'all', entity: 'all', userId: 'all', dateFrom: '', dateTo: '' })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.action !== 'all') params.set('action', filters.action)
      if (filters.entity !== 'all') params.set('entity', filters.entity)
      if (filters.userId !== 'all') params.set('userId', filters.userId)
      if (filters.dateFrom) params.set('from', filters.dateFrom)
      if (filters.dateTo) params.set('to', filters.dateTo)
      const res = await fetch(`/api/admin/audit?${params}`)
      const json = await res.json()
      setLogs(json.logs || [])
    } catch { setLogs([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Track all system activities and changes" />

      <AuditFilters filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<ScrollText className="w-6 h-6" />} title="No audit logs found" description="Try adjusting your filters to find audit entries" />
      ) : (
        <AuditTable logs={logs} />
      )}
    </div>
  )
}
