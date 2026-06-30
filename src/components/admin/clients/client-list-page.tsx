'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { ClientTable } from './client-table'
import { ClientForm } from './client-form'

interface ClientRow {
  id: string; companyName: string; contactPerson: string
  email: string; phone: string | null; status: string
  industry: string | null; erpName: string | null
  erpSystemId: string | null; city: string | null
  country: string | null; createdAt: string
}

export function ClientListPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [erpFilter, setErpFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      const json = await res.json()
      setClients(json.clients || [])
    } catch { setClients([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const filtered = clients.filter(c => {
    const matchSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchErp = erpFilter === 'all' || c.erpName === erpFilter
    return matchSearch && matchStatus && matchErp
  })

  const erpNames = [...new Set(clients.map(c => c.erpName).filter(Boolean))] as string[]

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Manage client accounts, subscriptions, and relationships"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        } />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={erpFilter} onValueChange={setErpFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="ERP System" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ERP</SelectItem>
            {erpNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-6 h-6" />} title="No clients found"
          description="Add your first client or adjust filters" actionLabel="Add Client" onAction={() => setShowForm(true)} />
      ) : (
        <ClientTable clients={filtered} />
      )}
      <ClientForm open={showForm} onClose={() => setShowForm(false)} onSaved={fetchClients} />
    </div>
  )
}
