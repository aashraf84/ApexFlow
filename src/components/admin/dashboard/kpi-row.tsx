'use client'

import { Users, CreditCard, DollarSign, Key, Database, Ticket } from 'lucide-react'
import { StatsCard } from '@/components/admin/shared/stats-card'

interface KpiStats {
  totalClients: number
  activeSubscriptions: number
  monthlyRevenue: number
  activeLicenses: number
  erpSystemsOnline: number
  erpSystemsTotal: number
  supportTicketsOpen: number
  clientTrend: number
  subscriptionTrend: number
  revenueTrend: number
  licenseTrend: number
  erpTrend: number
  ticketTrend: number
}

function formatPKR(n: number): string {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(0)}K`
  return `PKR ${n.toLocaleString()}`
}

interface KpiRowProps {
  stats: KpiStats
}

export function KpiRow({ stats }: KpiRowProps) {
  const cards = [
    {
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      label: 'Total Clients',
      value: stats.totalClients.toLocaleString(),
      change: stats.clientTrend,
      changeLabel: 'vs last month',
      iconBg: 'bg-emerald-500/10',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-cyan-500" />,
      label: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      change: stats.subscriptionTrend,
      changeLabel: 'vs last month',
      iconBg: 'bg-cyan-500/10',
    },
    {
      icon: <DollarSign className="w-5 h-5 text-amber-500" />,
      label: 'Monthly Revenue PKR',
      value: formatPKR(stats.monthlyRevenue),
      change: stats.revenueTrend,
      changeLabel: 'vs last month',
      iconBg: 'bg-amber-500/10',
    },
    {
      icon: <Key className="w-5 h-5 text-violet-500" />,
      label: 'Active Licenses',
      value: stats.activeLicenses.toLocaleString(),
      change: stats.licenseTrend,
      changeLabel: 'vs last month',
      iconBg: 'bg-violet-500/10',
    },
    {
      icon: <Database className="w-5 h-5 text-teal-500" />,
      label: 'ERP Systems Online',
      value: `${stats.erpSystemsOnline}/${stats.erpSystemsTotal}`,
      change: stats.erpTrend,
      changeLabel: 'connected systems',
      iconBg: 'bg-teal-500/10',
    },
    {
      icon: <Ticket className="w-5 h-5 text-rose-500" />,
      label: 'Support Tickets Open',
      value: stats.supportTicketsOpen.toLocaleString(),
      change: stats.ticketTrend,
      changeLabel: 'requires attention',
      iconBg: 'bg-rose-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <StatsCard
          key={card.label}
          icon={card.icon}
          label={card.label}
          value={card.value}
          change={card.change}
          changeLabel={card.changeLabel}
          iconBg={card.iconBg}
        />
      ))}
    </div>
  )
}
