'use client'

import { useState } from 'react'
import { Send, Check, CheckCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string; direction: string; body: string; timestamp: string; status: string
}

interface ChatWindowProps {
  contactName: string
  messages: Message[]
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  sent: <Check className="w-3 h-3 text-muted-foreground" />,
  delivered: <CheckCheck className="w-3 h-3 text-muted-foreground" />,
  read: <CheckCheck className="w-3 h-3 text-blue-500" />,
  failed: <span className="text-[10px] text-[var(--gg-rose)]">!</span>,
}

export function ChatWindow({ contactName, messages }: ChatWindowProps) {
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      await fetch('/api/communications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: input }),
      })
      setInput('')
    } catch { /* error handled */ }
  }

  return (
    <Card className="border-border/60 flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366]/10">
          <span className="text-[#25D366] text-xs font-semibold">{contactName.split(' ').map((n) => n[0]).join('')}</span>
        </div>
        <div>
          <p className="text-sm font-semibold">{contactName}</p>
          <p className="text-[10px] text-[#25D366]">Online</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOut = msg.direction === 'outbound'
            return (
              <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  isOut
                    ? 'bg-[#25D366] text-white rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                }`}>
                  <p className="text-sm">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isOut ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${isOut ? 'text-white/70' : 'text-muted-foreground'}`}>{msg.timestamp}</span>
                    {isOut && STATUS_ICONS[msg.status]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 h-9 text-sm" />
          <Button size="icon" className="h-9 w-9 bg-[#25D366] hover:bg-[#25D366]/90 shrink-0" onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
