'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientHeader } from './client-header'
import { ClientInfoTab } from './client-info-tab'
import { ClientSubscriptionsTab } from './client-subscriptions-tab'
import { ClientLicensesTab } from './client-licenses-tab'
import { ClientOrdersTab } from './client-orders-tab'
import { ClientInvoicesTab } from './client-invoices-tab'
import { ClientTimeline } from './client-timeline'

interface ClientDetail {
  id: string; companyName: string; contactPerson: string; email: string
  phone: string | null; address: string | null; city: string | null
  country: string | null; industry: string | null; status: string
  notes: string | null; erpSystemId: string | null; createdAt: string
  erpSystem: { id: string; name: string; slug: string } | null
  contacts: any[]; subscriptions: any[]; licenses: any[]
  orders: any[]; invoices: any[]; communicationTimeline: any[]
  deals: any[]
}

export function ClientDetailPage({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`)
      if (res.ok) {
        const json = await res.json()
        setClient(json.data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [clientId])

  useEffect(() => { fetchClient() }, [fetchClient])

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
  if (!client) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Client not found</p>
      <Link href="/admin/clients"><Button variant="outline" className="mt-4">Back to Clients</Button></Link>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/clients" className="hover:text-foreground transition-colors">Clients</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{client.companyName}</span>
      </div>
      <ClientHeader client={client} onRefresh={fetchClient} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4"><ClientInfoTab client={client} /></TabsContent>
        <TabsContent value="subscriptions" className="mt-4"><ClientSubscriptionsTab subscriptions={client.subscriptions} /></TabsContent>
        <TabsContent value="licenses" className="mt-4"><ClientLicensesTab licenses={client.licenses} /></TabsContent>
        <TabsContent value="orders" className="mt-4"><ClientOrdersTab orders={client.orders} /></TabsContent>
        <TabsContent value="invoices" className="mt-4"><ClientInvoicesTab invoices={client.invoices} /></TabsContent>
        <TabsContent value="timeline" className="mt-4"><ClientTimeline entries={client.communicationTimeline} /></TabsContent>
      </Tabs>
    </div>
  )
}
