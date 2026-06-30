'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { CreditCard, Landmark, Smartphone, ArrowRightLeft, Settings, Wallet } from 'lucide-react'

const GATEWAY_ICONS: Record<string, React.ReactNode> = {
  stripe: <CreditCard className="w-5 h-5" />, bank_transfer: <Landmark className="w-5 h-5" />,
  jazzcash: <Smartphone className="w-5 h-5" />, easypaisa: <Smartphone className="w-5 h-5" />,
  raast: <ArrowRightLeft className="w-5 h-5" />, paypal: <Wallet className="w-5 h-5" />,
}
const GATEWAY_LABELS: Record<string, string> = {
  stripe: 'Stripe', bank_transfer: 'Bank Transfer', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa', raast: 'Raast', paypal: 'PayPal',
}
const GATEWAY_COLORS: Record<string, string> = {
  stripe: 'bg-violet-500/10 text-violet-600', bank_transfer: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)]',
  jazzcash: 'bg-red-500/10 text-red-600', easypaisa: 'bg-green-500/10 text-green-600',
  raast: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)]', paypal: 'bg-blue-500/10 text-blue-600',
}

export function GatewayCard({ gateway, onEdit, onRefresh }: { gateway: any; onEdit: (g: any) => void; onRefresh: () => void }) {
  const handleToggle = async () => {
    await fetch('/api/gateways', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: gateway.id, isActive: !gateway.isActive, isDefault: gateway.isDefault }),
    })
    onRefresh()
  }

  const icon = GATEWAY_ICONS[gateway.gateway] || <CreditCard className="w-5 h-5" />
  const colorClass = GATEWAY_COLORS[gateway.gateway] || 'bg-muted text-muted-foreground'

  return (
    <Card className={`border-border/60 transition-all hover:border-border ${!gateway.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colorClass}`}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {gateway.isDefault && <Badge className="text-[9px] px-1.5 py-0 leading-4 bg-primary/10 text-primary border-primary/20">Default</Badge>}
            <Switch checked={gateway.isActive} onCheckedChange={handleToggle} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm font-semibold text-foreground">{gateway.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{GATEWAY_LABELS[gateway.gateway] || gateway.gateway} · {gateway.type?.replace(/_/g, ' ')}</p>
        </div>
        {gateway.lastVerifiedAt && (
          <p className="text-[10px] text-muted-foreground mt-2">Verified {new Date(gateway.lastVerifiedAt).toLocaleDateString()}</p>
        )}
        <div className="mt-3 pt-3 border-t border-border/40">
          <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs" onClick={() => onEdit(gateway)}>
            <Settings className="w-3.5 h-3.5" /> Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
