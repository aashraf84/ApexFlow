'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { PaymentsTable } from './payments-table'
import { PaymentDetail } from './payment-detail'
import { Wallet } from 'lucide-react'

export function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/payments?${params}`)
      const json = await res.json()
      setPayments(json.payments || [])
    } catch { setPayments([]) }
    finally { setLoading(false) }
  }, [statusFilter, search])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track and manage all payment transactions"
        actions={
          <Button size="sm" className="gap-1.5" onClick={fetchPayments}>
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        } />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : payments.length === 0 ? (
        <EmptyState icon={<Wallet className="w-6 h-6" />} title="No payments found" description="Try adjusting your filters or record a new payment" />
      ) : (
        <PaymentsTable payments={payments} onSelect={setSelectedPayment} />
      )}

      <PaymentDetail payment={selectedPayment} open={!!selectedPayment} onClose={() => setSelectedPayment(null)} onSaved={fetchPayments} />
    </div>
  )
}
