'use client'

import { useState } from 'react'
import { MessageCircle, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ChatList } from './chat-list'
import { ChatWindow } from './chat-window'
import { WhatsAppConfig } from './whatsapp-config'

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Ali Khan', phone: '+92 300 1234567', lastMessage: 'Hi, need help with ERP setup', time: '15 min ago', unread: 2 },
  { id: '2', name: 'Sara Ahmed', phone: '+92 301 9876543', lastMessage: 'Thanks for the quick response!', time: '5 hrs ago', unread: 0 },
  { id: '3', name: 'Usman Malik', phone: '+92 312 5551234', lastMessage: 'Can we schedule a demo?', time: '1 day ago', unread: 1 },
]

const MOCK_MESSAGES = [
  { id: '1', direction: 'inbound', body: 'Hi, need help with ERP setup', timestamp: '10:30 AM', status: 'read' },
  { id: '2', direction: 'outbound', body: 'Of course! Which ERP system are you using?', timestamp: '10:32 AM', status: 'delivered' },
  { id: '3', direction: 'inbound', body: 'We have SAP Business One', timestamp: '10:35 AM', status: 'read' },
  { id: '4', direction: 'outbound', body: 'Great choice! Let me connect you with our integration specialist.', timestamp: '10:36 AM', status: 'sent' },
]

export function WhatsAppPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>('1')
  const selected = MOCK_CONVERSATIONS.find((c) => c.id === selectedChat)

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Business" description="Manage conversations and WhatsApp API configuration" />

      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations" className="gap-1.5"><MessageCircle className="w-4 h-4" />Conversations</TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5"><Settings className="w-4 h-4" />Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
            <ChatList conversations={MOCK_CONVERSATIONS} selectedId={selectedChat} onSelect={setSelectedChat} />
            <div className="lg:col-span-2">
              {selected ? (
                <ChatWindow contactName={selected.name} messages={MOCK_MESSAGES} />
              ) : (
                <div className="flex items-center justify-center h-full border border-border/60 rounded-xl text-muted-foreground text-sm">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config"><WhatsAppConfig /></TabsContent>
      </Tabs>
    </div>
  )
}
