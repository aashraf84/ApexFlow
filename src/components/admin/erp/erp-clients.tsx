'use client'

import { UserCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import Link from 'next/link'

interface ErpClientsProps {
  erp: {
    recentClients: { id: string; companyName: string; status: string; licenseType: string | null }[]
    clientCount: number
  }
}

const clientStatusMap: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  active: 'success', trial: 'info', churned: 'error', pending: 'warning',
}

export function ErpClients({ erp }: ErpClientsProps) {
  const clients = erp.recentClients || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{erp.clientCount} total clients</span>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No clients assigned yet</div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Company</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                        <UserCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{client.companyName}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {client.licenseType ? (
                      <Badge variant="outline" className="text-[10px]">{client.licenseType}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge variant={clientStatusMap[client.status] || 'neutral'} size="sm">
                      {client.status}
                    </StatusBadge>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/clients/${client.id}`} className="text-xs text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
