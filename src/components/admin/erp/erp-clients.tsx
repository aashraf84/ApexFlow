'use client'

import { useState, useEffect } from 'react'
import { UserCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface ErpClientsProps {
  erp: { slug: string }
}

interface ClientRow {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  status: string
  isActive: boolean
  industry: string | null
  licenseType: string | null
  createdAt: string
}

const clientStatusMap: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  active: 'success',
  trial: 'warning',
  churned: 'error',
  inactive: 'error',
  pending: 'warning',
}

export function ErpClients({ erp }: ErpClientsProps) {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [totalClients, setTotalClients] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`/api/erp-clients?slug=${erp.slug}&limit=50`)
        if (res.ok) {
          const data = await res.json()
          setClients(data.clients || [])
          setTotalClients(data.totalClients || 0)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    if (erp.slug) fetchClients()
  }, [erp.slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{totalClients} total clients registered</span>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <UserCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
          No clients registered yet
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Company</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">City</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0">
                          <UserCircle className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">{client.companyName}</span>
                          <span className="text-xs text-muted-foreground block truncate">{client.contactPerson}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{client.city || '—'}</span>
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
        </div>
      )}
    </div>
  )
}