'use client'

import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/admin/shared/page-header'
import { IntegrationManager } from './integration-manager'
import { IntegrationOverview } from './integration-overview'
import { SyncScheduler } from './sync-scheduler'
import { WebhookManager } from './webhook-manager'
import { SyncHistoryViewer } from './sync-history-viewer'
import {
  LayoutDashboard,
  Clock,
  Webhook,
  History,
  Plug,
} from 'lucide-react'

const TABS = [
  { value: 'integrations', label: 'Integrations', icon: Plug },
  { value: 'overview', label: 'Legacy', icon: LayoutDashboard },
  { value: 'scheduler', label: 'Sync Scheduler', icon: Clock },
  { value: 'webhooks', label: 'Webhooks', icon: Webhook },
  { value: 'history', label: 'Sync History', icon: History },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

export function IntegrationHubPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} custom={0}>
        <PageHeader
          title="Integration Hub"
          description="Auto-discover, configure, and monitor all ERP integrations in real-time"
        />
      </motion.div>

      <motion.div variants={fadeUp} custom={1}>
        <Tabs defaultValue="integrations" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs sm:text-sm">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="integrations" className="mt-4">
            <IntegrationManager />
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <IntegrationOverview />
          </TabsContent>

          <TabsContent value="scheduler" className="mt-4">
            <SyncScheduler />
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <WebhookManager />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <SyncHistoryViewer />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}