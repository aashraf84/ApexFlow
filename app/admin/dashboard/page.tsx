'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  Handshake,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react'

interface DashboardStats {
  totalClients: number
  activeDeals: number
  totalRevenue: number
  pendingInvoices: number
  openTickets: number
  activeSubscriptions: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // Dashboard stats not available yet
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Clients', value: stats.totalClients, icon: Users, accent: 'var(--gg-vermillion)' },
        { label: 'Active Deals', value: stats.activeDeals, icon: Handshake, accent: 'var(--gg-teal)' },
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, accent: 'var(--gg-amber)' },
        { label: 'Pending Invoices', value: stats.pendingInvoices, icon: TrendingUp, accent: 'var(--gg-vermillion)' },
        { label: 'Open Tickets', value: stats.openTickets, icon: MessageSquare, accent: 'var(--gg-violet)' },
        { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: Activity, accent: 'var(--gg-cyan)' },
      ]
    : [
        { label: 'Total Clients', value: '—', icon: Users, accent: 'var(--gg-vermillion)' },
        { label: 'Active Deals', value: '—', icon: Handshake, accent: 'var(--gg-teal)' },
        { label: 'Total Revenue', value: '—', icon: DollarSign, accent: 'var(--gg-amber)' },
        { label: 'Pending Invoices', value: '—', icon: TrendingUp, accent: 'var(--gg-vermillion)' },
        { label: 'Open Tickets', value: '—', icon: MessageSquare, accent: 'var(--gg-violet)' },
        { label: 'Active Subscriptions', value: '—', icon: Activity, accent: 'var(--gg-cyan)' },
      ]

  const quickActions = [
    { label: 'Add Client', path: '/admin/clients', accent: 'var(--gg-vermillion)' },
    { label: 'New Deal', path: '/admin/deals', accent: 'var(--gg-teal)' },
    { label: 'Create Invoice', path: '/admin/finance', accent: 'var(--gg-amber)' },
    { label: 'View Reports', path: '/admin/reports', accent: 'var(--gg-violet)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome to ApexFlow Admin Panel. Here&apos;s your business overview.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--card)',
              boxShadow: 'var(--gg-shadow-card)',
              border: '1px solid var(--gg-separator)',
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {loading ? (
                      <span
                        className="inline-block w-16 h-7 animate-pulse rounded"
                        style={{ background: 'color-mix(in srgb, var(--gg-separator) 2%, var(--card))' }}
                      />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `color-mix(in srgb, ${card.accent} 10%, transparent)`,
                    color: card.accent,
                  }}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--card)',
          boxShadow: 'var(--gg-shadow-card)',
          border: '1px solid var(--gg-separator)',
        }}
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.path}
                className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `color-mix(in srgb, ${action.accent} 10%, transparent)`,
                  color: action.accent,
                  border: `1px solid color-mix(in srgb, ${action.accent} 15%, transparent)`,
                }}
              >
                {action.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  )
}
