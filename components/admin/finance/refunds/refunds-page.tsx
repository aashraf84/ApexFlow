'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { RefundTable } from './refund-table'

export function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchRefunds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/refunds')
      const json = await res.json()
      setRefunds(json.refunds || [])
    } catch { setRefunds([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRefunds() }, [fetchRefunds])

  const filtered = statusFilter === 'all' ? refunds : refunds.filter((r: any) => r.status === statusFilter)

  return (
    <div className="space-y-6">
      <PageHeader title="Refunds" description="Process and manage refund requests" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search refunds..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<RotateCcw className="w-6 h-6" />} title="No refund requests" description="No refunds match your current filters" />
      ) : (
        <RefundTable refunds={filtered} onRefresh={fetchRefunds} />
      )}
    </div>
  )
}
