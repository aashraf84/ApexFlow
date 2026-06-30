'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { InvoicesTable } from './invoices-table'
import { InvoiceGenerator } from './invoice-generator'
import { FileText } from 'lucide-react'

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showGenerator, setShowGenerator] = useState(false)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/invoices')
      const json = await res.json()
      setInvoices(json.invoices || [])
    } catch { setInvoices([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const filtered = statusFilter === 'all' ? invoices : invoices.filter((i: any) => i.status === statusFilter)

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Create and manage invoices for clients"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setShowGenerator(true)}>
            <Plus className="w-4 h-4" /> Generate Invoice
          </Button>
        } />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-6 h-6" />} title="No invoices found" description="Try adjusting your filters or generate a new invoice" actionLabel="Generate Invoice" onAction={() => setShowGenerator(true)} />
      ) : (
        <InvoicesTable invoices={filtered} onRefresh={fetchInvoices} />
      )}

      <InvoiceGenerator open={showGenerator} onClose={() => setShowGenerator(false)} onSaved={fetchInvoices} />
    </div>
  )
}
