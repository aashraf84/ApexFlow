'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Palette, Mail, ShieldCheck, Plug } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { GeneralSettings } from './general-settings'
import { AppearanceSettings } from './appearance-settings'
import { EmailSettings } from './email-settings'
import { SecuritySettings } from './security-settings'
import { IntegrationSettings } from './integration-settings'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure platform preferences, appearance, and security" />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="general" className="gap-1.5 text-xs"><Settings className="w-3.5 h-3.5" /> General</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5 text-xs"><Plug className="w-3.5 h-3.5" /> Integrations</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" /> Appearance</TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 text-xs"><Mail className="w-3.5 h-3.5" /> Email</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs"><ShieldCheck className="w-3.5 h-3.5" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general"><GeneralSettings /></TabsContent>
        <TabsContent value="integrations"><IntegrationSettings /></TabsContent>
        <TabsContent value="appearance"><AppearanceSettings /></TabsContent>
        <TabsContent value="email"><EmailSettings /></TabsContent>
        <TabsContent value="security"><SecuritySettings /></TabsContent>
      </Tabs>
    </div>
  )
}