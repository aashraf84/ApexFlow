'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'

interface Conversation {
  id: string; name: string; phone: string; lastMessage: string; time: string; unread: number
}

interface ChatListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <Card className="border-border/60 flex flex-col h-full">
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/40">
          {filtered.map((conv) => (
            <button key={conv.id} onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30 ${
                selectedId === conv.id ? 'bg-primary/5 border-l-2 border-primary' : ''
              }`}>
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-[#25D366]/10 text-[#25D366] text-xs font-semibold">
                  {conv.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{conv.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate pr-2">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <Badge className="bg-[#25D366] text-white text-[9px] px-1.5 py-0 leading-4 shrink-0">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations found</p>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
