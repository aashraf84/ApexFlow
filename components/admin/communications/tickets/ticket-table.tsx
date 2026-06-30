'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { TicketDetail } from './ticket-detail'

interface Ticket {
  id: string; number: string; subject: string; client: string; priority: string;
  status: string; assignedTo: string | null; created: string; sla: string
}

const PRIORITY_VARIANT: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'neutral',
}
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  open: 'warning', in_progress: 'info', waiting_client: 'neutral', resolved: 'success', closed: 'success',
}

interface TicketTableProps {
  tickets: Ticket[]
}

export function TicketTable({ tickets }: TicketTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = tickets.find((t) => t.id === selectedId)

  return (
    <>
      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Ticket #</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Subject</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Client</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Priority</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Assigned To</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Created</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">SLA</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} onClick={() => setSelectedId(ticket.id)}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{ticket.number}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{ticket.subject}</td>
                  <td className="px-4 py-3 hidden md:table-cell truncate">{ticket.client}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={PRIORITY_VARIANT[ticket.priority] || 'neutral'} size="sm">{ticket.priority}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge variant={STATUS_VARIANT[ticket.status] || 'neutral'} size="sm">
                      {ticket.status.replace('_', ' ')}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{ticket.assignedTo || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{ticket.created}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      ticket.sla === 'Met' ? 'text-[var(--gg-green)]' :
                      ticket.sla.includes('hrs') && parseInt(ticket.sla) <= 4 ? 'text-[var(--gg-rose)]' :
                      'text-[var(--gg-amber)]'
                    }`}>{ticket.sla}</span>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No tickets found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {selected && (
        <TicketDetail ticket={selected} open={!!selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  )
}
