'use client'

import { Bell, ListFilter } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/admin/shared/page-header'
import { NotificationList } from './notification-list'
import { NotificationRules } from './notification-rules'

export function NotificationsPage() {
  const handleMarkAllRead = async () => {
    await fetch('/api/communications/notifications', { method: 'PATCH' })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Manage notification feed and automation rules"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAllRead}>
            <Bell className="w-4 h-4" />Mark All Read
          </Button>
        } />

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed" className="gap-1.5"><ListFilter className="w-4 h-4" />Notification Feed</TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5"><Bell className="w-4 h-4" />Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="feed"><NotificationList /></TabsContent>
        <TabsContent value="rules"><NotificationRules /></TabsContent>
      </Tabs>
    </div>
  )
}
