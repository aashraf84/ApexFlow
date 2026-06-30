'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErpHeader } from './erp-header'
import { ErpConnections } from './erp-connections'
import { ErpModules } from './erp-modules'
import { ErpSerialKeys } from './erp-serial-keys'
import { ErpClients } from './erp-clients'
import { ErpStats } from './erp-stats'
import { ErpDatabaseConfig } from './erp-database-config'
import { ErpActivityLog } from './erp-activity-log'
import Link from 'next/link'

interface ErpDetail {
  id: string; name: string; slug: string; description: string
  icon: string; color: string; status: string; industry: string
  version: string; website: string | null; moduleCount: number
  databaseUrl: string | null; features: string | null
  pricing: string | null; createdAt: string; updatedAt: string
}

export function ErpDetailPage({ slug }: { slug: string }) {
  const [erp, setErp] = useState<ErpDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const fetchErp = async () => {
      try {
        const res = await fetch(`/api/erp/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setErp(data)
        }
      } catch {
        // silent
      } finally { setLoading(false) }
    }
    fetchErp()
  }, [slug])

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
  if (!erp) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">ERP system not found</p>
      <Link href="/admin/erp"><Button variant="outline" className="mt-4">Back to ERP List</Button></Link>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/erp" className="hover:text-foreground transition-colors">ERP Ecosystem</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{erp.name}</span>
      </div>
      <ErpHeader erp={erp} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="serial-keys">Serial Keys</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="sync-log">Sync Log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4"><ErpStats erp={erp} /></TabsContent>
        <TabsContent value="modules" className="mt-4"><ErpModules erp={erp} /></TabsContent>
        <TabsContent value="connections" className="mt-4"><ErpConnections erp={erp} /></TabsContent>
        <TabsContent value="serial-keys" className="mt-4"><ErpSerialKeys erp={erp} /></TabsContent>
        <TabsContent value="clients" className="mt-4"><ErpClients erp={erp} /></TabsContent>
        <TabsContent value="database" className="mt-4"><ErpDatabaseConfig erp={erp} /></TabsContent>
        <TabsContent value="sync-log" className="mt-4"><ErpActivityLog erp={erp} /></TabsContent>
      </Tabs>
    </div>
  )
}