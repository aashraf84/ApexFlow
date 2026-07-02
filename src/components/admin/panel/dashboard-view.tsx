'use client'

import { motion } from 'framer-motion'
import {
  Boxes, Zap, Users, DollarSign, TrendingUp, Activity,
  ArrowRight, Globe, CheckCircle2, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { FALLBACK_ERP_DATA, getErpIcon, getErpColor } from '@/lib/erp-data'
import { createElement } from 'react'

export type PanelSection =
  | 'dashboard'
  | 'erp'
  | `erp-detail:${string}`
  | 'integrations'
  | 'clients'
  | 'deals'
  | 'finance'
  | 'communications'
  | 'marketing'
  | 'reports'
  | 'system'

interface DashboardViewProps {
  onNavigate: (section: PanelSection) => void
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const totalErps = FALLBACK_ERP_DATA.length
  const totalModules = FALLBACK_ERP_DATA.reduce((sum, e) => sum + (e.moduleCount || e.modules?.length || 0), 0)
  const industries = new Set(FALLBACK_ERP_DATA.map((e) => e.industry)).size

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} custom={0}>
        <PageHeader
          title="Dashboard"
          description="ApexFlow ERP ecosystem overview — 21 industry-specific systems, one unified platform"
        />
      </motion.div>

      {/* KPI Stats */}
      <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total ERPs', value: totalErps, icon: Boxes, color: 'var(--gg-vermillion)', sub: 'All Active' },
          { label: 'Total Modules', value: totalModules, icon: Zap, color: 'var(--gg-amber)', sub: `${(totalModules / totalErps).toFixed(1)} avg/ERP` },
          { label: 'Industries', value: industries, icon: Globe, color: 'var(--gg-teal)', sub: 'Vertical coverage' },
          { label: 'System Health', value: '99.9%', icon: Activity, color: 'var(--gg-green)', sub: 'Uptime SLA' },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden" style={{ borderColor: 'var(--gg-separator)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-15" style={{ background: stat.color }} />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <StatusBadge variant="success" size="sm">OK</StatusBadge>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={fadeUp} custom={2} className="lg:col-span-1">
          <Card style={{ borderColor: 'var(--gg-separator)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Browse All ERPs', icon: Boxes, section: 'erp' as PanelSection, desc: 'View the full catalog' },
                { label: 'Integration Hub', icon: Zap, section: 'integrations' as PanelSection, desc: 'Sync & webhooks' },
                { label: 'System Settings', icon: Activity, section: 'system' as PanelSection, desc: 'Configuration' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.section)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <action.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured ERPs */}
        <motion.div variants={fadeUp} custom={3} className="lg:col-span-2">
          <Card style={{ borderColor: 'var(--gg-separator)' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">ERP Systems Overview</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => onNavigate('erp')}
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {FALLBACK_ERP_DATA.slice(0, 12).map((erp) => {
                  const IconComp = getErpIcon(erp.icon)
                  const color = getErpColor(erp.color)
                  return (
                    <button
                      key={erp.slug}
                      onClick={() => onNavigate(`erp-detail:${erp.slug}`)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color.bg} transition-transform group-hover:scale-110`}>
                        {createElement(IconComp, { className: `w-4 h-4 ${color.text}` })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{erp.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{erp.industry}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        {erp.moduleCount || erp.modules?.length || 0} mods
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row: Status overview */}
      <motion.div variants={fadeUp} custom={4}>
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'API Gateway', status: 'Operational', ok: true },
                { label: 'Database Cluster', status: 'Connected', ok: true },
                { label: 'Sync Engine', status: 'Active', ok: true },
                { label: 'CDN & Assets', status: 'Operational', ok: true },
                { label: 'Auth Service', status: 'Secure', ok: true },
                { label: 'Webhook Delivery', status: 'Real-time', ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 p-2 rounded-lg">
                  {item.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.status}</p>
                  </div>
                  <StatusBadge variant="success" size="sm">{item.status}</StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}