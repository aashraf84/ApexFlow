'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Users, Hash } from 'lucide-react'
import type { SocialAccount } from '@/types/admin'

const PLATFORM_META: Record<string, { color: string; label: string; icon: string }> = {
  facebook: { color: '#1877F2', label: 'Facebook', icon: 'fb' },
  instagram: { color: '#E4405F', label: 'Instagram', icon: 'ig' },
  twitter: { color: '#000000', label: 'Twitter', icon: 'X' },
  linkedin: { color: '#0A66C2', label: 'LinkedIn', icon: 'in' },
  tiktok: { color: '#000000', label: 'TikTok', icon: 'tt' },
}

export function PlatformCard({ account, onToggle }: { account: SocialAccount; onToggle: () => void }) {
  const [toggling, setToggling] = useState(false)
  const meta = PLATFORM_META[account.platform] || { color: '#666', label: account.platform, icon: '?' }

  const handleToggle = async () => {
    setToggling(true)
    try {
      await fetch('/api/marketing/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, action: account.isConnected ? 'disconnect' : 'connect' }),
      })
      onToggle()
    } finally { setToggling(false) }
  }

  return (
    <Card className={`border-border/60 ${account.isConnected ? '' : 'opacity-70'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: meta.color }}>{meta.icon}</span>
            <div><p className="text-sm font-semibold">{meta.label}</p><p className="text-xs text-muted-foreground">@{account.handle}</p></div>
          </div>
          <Badge variant={account.isConnected ? 'default' : 'secondary'} className="text-[10px] gap-1">
            {account.isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {account.isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" /><span>{(account.followerCount / 1000).toFixed(1)}K followers</span></div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Hash className="w-3 h-3" /><span>{Math.floor(Math.random() * 8 + 2)} posts/wk</span></div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">{account.lastSyncedAt ? `Synced ${new Date(account.lastSyncedAt).toLocaleDateString()}` : 'Never synced'}</p>
          <Button size="sm" variant={account.isConnected ? 'outline' : 'default'} className="h-7 text-xs" onClick={handleToggle} disabled={toggling}>
            {toggling ? '...' : account.isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
