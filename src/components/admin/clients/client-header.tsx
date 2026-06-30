'use client'

import { Pencil, Trash2, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'info' | 'warning'> = {
  active: 'success', inactive: 'neutral', trial: 'info', suspended: 'warning',
}

interface ClientHeaderProps {
  client: {
    id: string; companyName: string; contactPerson: string; email: string
    phone: string | null; status: string; industry: string | null
    erpSystem: { id: string; name: string; slug: string } | null
    subscriptions: any[]; licenses: any[]; deals: any[]
  }
  onRefresh?: () => void
}

export function ClientHeader({ client, onRefresh }: ClientHeaderProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    window.location.href = '/admin/clients'
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{client.companyName}</h1>
              <StatusBadge variant={STATUS_MAP[client.status] || 'neutral'} size="md">
                {client.status}
              </StatusBadge>
              {client.industry && (
                <Badge variant="outline" className="text-xs">{client.industry}</Badge>
              )}
              {client.erpSystem && (
                <Badge variant="outline" className="text-xs gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {client.erpSystem.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{client.contactPerson}</span>
              <span>{client.email}</span>
              {client.phone && <span>{client.phone}</span>}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{client.subscriptions?.length || 0} subscriptions</span>
              <span>{client.licenses?.length || 0} licenses</span>
              <span>{client.deals?.length || 0} deals</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Invoice
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[var(--gg-rose)] hover:text-[var(--gg-rose)]"
              onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
