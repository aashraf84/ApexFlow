'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  UserPlus, FileText, Key, Wifi, BarChart3, Bell,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { icon: UserPlus, label: 'Add Client', color: 'text-emerald-500', bg: 'bg-emerald-500/10', hover: 'hover:bg-emerald-500/20' },
  { icon: FileText, label: 'Generate Invoice', color: 'text-cyan-500', bg: 'bg-cyan-500/10', hover: 'hover:bg-cyan-500/20' },
  { icon: Key, label: 'Create License', color: 'text-violet-500', bg: 'bg-violet-500/10', hover: 'hover:bg-violet-500/20' },
  { icon: Wifi, label: 'Test Connections', color: 'text-teal-500', bg: 'bg-teal-500/10', hover: 'hover:bg-teal-500/20' },
  { icon: BarChart3, label: 'View Reports', color: 'text-amber-500', bg: 'bg-amber-500/10', hover: 'hover:bg-amber-500/20' },
  { icon: Bell, label: 'Send Notification', color: 'text-rose-500', bg: 'bg-rose-500/10', hover: 'hover:bg-rose-500/20' },
]

export function QuickActions() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className={`flex items-center gap-2.5 h-auto py-3 px-3 justify-start rounded-xl border border-transparent hover:border-border ${action.hover}`}
            >
              <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
