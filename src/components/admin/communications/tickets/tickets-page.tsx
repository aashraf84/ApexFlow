'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/admin/shared/page-header'
import { TicketTable } from './ticket-table'
import { TicketForm } from './ticket-form'

const MOCK_TICKETS = [
  { id: '1', number: 'TKT-783', subject: 'ERP sync issue with SAP', client: 'TechCorp Pakistan', priority: 'critical', status: 'open', assignedTo: 'Ali Khan', created: '2025-01-15', sla: '2 hrs left' },
  { id: '2', number: 'TKT-782', subject: 'License activation failed', client: 'Alpha Industries', priority: 'high', status: 'in_progress', assignedTo: 'Sara Ahmed', created: '2025-01-14', sla: '12 hrs left' },
  { id: '3', number: 'TKT-781', subject: 'Invoice not generating', client: 'Pak Retail Ltd', priority: 'medium', status: 'waiting_client', assignedTo: 'Usman Malik', created: '2025-01-13', sla: '1 day left' },
  { id: '4', number: 'TKT-780', subject: 'Dashboard loading slow', client: 'Metro Systems', priority: 'low', status: 'resolved', assignedTo: 'Ali Khan', created: '2025-01-12', sla: 'Met' },
  { id: '5', number: 'TKT-779', subject: 'Payment gateway timeout', client: 'Sindh Trading', priority: 'high', status: 'closed', assignedTo: 'Sara Ahmed', created: '2025-01-10', sla: 'Met' },
  { id: '6', number: 'TKT-778', subject: 'ERP data mismatch', client: 'Quick Foods', priority: 'medium', status: 'open', assignedTo: null, created: '2025-01-09', sla: '4 hrs left' },
]

export function TicketsPage() {
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)

  const filtered = MOCK_TICKETS.filter((t) => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.number.toLowerCase().includes(search.toLowerCase())) return false
    if (priority !== 'all' && t.priority !== priority) return false
    if (status !== 'all' && t.status !== status) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Track and manage support requests"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4" />Create Ticket
          </Button>
        } />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_client">Waiting Client</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TicketTable tickets={filtered} />
      <TicketForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
