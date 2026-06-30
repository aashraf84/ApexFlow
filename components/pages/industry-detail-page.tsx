'use client'

import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/shared/page-layout'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { useAppStore } from '@/lib/store'
import { useNavigate } from '@/lib/use-navigate'
import { motion } from 'framer-motion'
import {
  Shirt, Hotel, GraduationCap, ArrowRight,
  TrendingUp, Users, Clock, BarChart3,
  AlertTriangle, XCircle, AlertOctagon,
  CheckCircle2, Zap, Shield, Cpu,
  Calendar, Target, Rocket,
  DollarSign, Percent, ArrowUpRight,
  Layers, Globe, Lock,
  ChevronRight, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ───────────────── INDUSTRY DATA ───────────────── */
type IndustryDetail = {
  icon: React.ReactNode
  name: string
  erp: string
  tagline: string
  description: string
  colorHex: string
  accentColor: string
}

const INDUSTRY_DETAILS: Record<string, IndustryDetail> = {
  'apparel-textile': {
    icon: <Shirt className="w-8 h-8 text-[var(--gg-teal)]" />,
    name: 'Apparel & Textile',
    erp: 'ApparelFlow',
    tagline: 'From fiber to fashion — streamlined.',
    description: 'End-to-end management from raw material procurement to finished goods distribution, production planning, and quality control. Built for the unique challenges of the apparel and textile industry.',
    colorHex: 'var(--gg-teal)',
    accentColor: 'cyan',
  },
  hospitality: {
    icon: <Hotel className="w-8 h-8 text-[var(--gg-violet)]" />,
    name: 'Hospitality',
    erp: 'HotelFlow',
    tagline: 'Exceptional stays, effortless operations.',
    description: 'Complete hotel operations management including reservations, F&B, housekeeping, revenue management, and guest experience optimization.',
    colorHex: 'var(--gg-violet)',
    accentColor: 'violet',
  },
  education: {
    icon: <GraduationCap className="w-8 h-8 text-[var(--gg-green)]" />,
    name: 'Education',
    erp: 'EduFlow',
    tagline: 'Empowering institutions, inspiring minds.',
    description: 'Comprehensive school and university management from admissions and academics to alumni tracking and institutional analytics.',
    colorHex: 'var(--gg-green)',
    accentColor: 'emerald',
  },
  'consumer-electronics': {
    icon: <Zap className="w-8 h-8 text-[var(--gg-green)]" />,
    name: 'Consumer Electronics',
    erp: 'ElectroFlow',
    tagline: 'Powering electronics retail — from showroom to service.',
    description: 'Complete ERP for electronics and appliance retailers with POS, installment management, service & repair, warranty tracking, serial/IMEI tracking, and multi-branch operations. Built for the unique challenges of consumer electronics retail.',
    colorHex: 'var(--gg-green)',
    accentColor: 'emerald',
  },
  // Alias: 'apparel' redirects to same data as 'apparel-textile'
  apparel: {
    icon: <Shirt className="w-8 h-8 text-[var(--gg-teal)]" />,
    name: 'Apparel & Textile',
    erp: 'ApparelFlow',
    tagline: 'From fiber to fashion — streamlined.',
    description: 'End-to-end management from raw material procurement to finished goods distribution, production planning, and quality control. Built for the unique challenges of the apparel and textile industry.',
    colorHex: 'var(--gg-teal)',
    accentColor: 'cyan',
  },
}

/* ───────────────── STATS DATA ───────────────── */
const STATS = [
  { icon: <TrendingUp className="w-5 h-5 text-[var(--gg-teal)]" />, value: '47%', label: 'Efficiency Gain' },
  { icon: <Users className="w-5 h-5 text-[var(--gg-teal)]" />, value: '12K+', label: 'Active Users' },
  { icon: <Clock className="w-5 h-5 text-[var(--gg-teal)]" />, value: '60%', label: 'Time Saved' },
  { icon: <BarChart3 className="w-5 h-5 text-[var(--gg-teal)]" />, value: '3.2x', label: 'ROI Average' },
]

/* ───────────────── PAIN POINTS ───────────────── */
const PAIN_POINTS = [
  { icon: <AlertTriangle className="w-6 h-6 text-red-400" />, title: 'Supply Chain Fragmentation', desc: 'Disconnected systems across procurement, production, and distribution lead to delays and costly errors.' },
  { icon: <XCircle className="w-6 h-6 text-red-400" />, title: 'Manual Data Entry', desc: 'Hours wasted on redundant data entry across spreadsheets, legacy tools, and paper-based processes.' },
  { icon: <AlertOctagon className="w-6 h-6 text-red-400" />, title: 'Compliance Gaps', desc: 'Difficulty maintaining regulatory compliance with evolving industry standards and audit requirements.' },
  { icon: <AlertTriangle className="w-6 h-6 text-red-400" />, title: 'Poor Visibility', desc: 'Lack of real-time insights into operations, inventory, and financial performance across departments.' },
]

/* ───────────────── SOLUTIONS ───────────────── */
const SOLUTIONS = [
  { icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />, title: 'Unified Platform', desc: 'One integrated system connecting every department, eliminating data silos and manual handoffs.' },
  { icon: <Zap className="w-6 h-6 text-emerald-400" />, title: 'Workflow Automation', desc: 'Automate repetitive tasks from purchase orders to invoicing, reducing errors and freeing your team.' },
  { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: 'Built-in Compliance', desc: 'Stay ahead of regulations with automated compliance checks, audit trails, and reporting.' },
  { icon: <Cpu className="w-6 h-6 text-emerald-400" />, title: 'Real-time Analytics', desc: 'Live dashboards and AI-powered insights to make data-driven decisions at every level.' },
]

/* ───────────────── TIMELINE ───────────────── */
const TIMELINE = [
  { phase: 'Week 1–2', title: 'Discovery & Audit', desc: 'Deep dive into your current workflows, pain points, and requirements.', icon: <Target className="w-5 h-5 text-[var(--gg-violet)]" /> },
  { phase: 'Week 3–4', title: 'Configuration & Setup', desc: 'Tailor the platform to your specific industry processes and data structures.', icon: <Layers className="w-5 h-5 text-[var(--gg-violet)]" /> },
  { phase: 'Week 5–6', title: 'Migration & Training', desc: 'Seamless data migration and comprehensive team training programs.', icon: <Globe className="w-5 h-5 text-[var(--gg-violet)]" /> },
  { phase: 'Week 7–8', title: 'Go Live & Optimize', desc: 'Launch with full support, monitor performance, and iterate for maximum impact.', icon: <Rocket className="w-5 h-5 text-[var(--gg-violet)]" /> },
]

/* ───────────────── BENEFITS / ROI ───────────────── */
const BENEFITS = [
  { icon: <DollarSign className="w-5 h-5 text-emerald-400" />, title: 'Cost Reduction', desc: 'Cut operational costs by up to 35% through automation and process optimization.', metric: '35%' },
  { icon: <Percent className="w-5 h-5 text-emerald-400" />, title: 'Revenue Growth', desc: 'Unlock new revenue streams with better visibility and faster order fulfillment.', metric: '28%' },
  { icon: <ArrowUpRight className="w-5 h-5 text-emerald-400" />, title: 'Productivity Boost', desc: 'Empower teams to focus on high-value work instead of manual data management.', metric: '47%' },
  { icon: <Clock className="w-5 h-5 text-emerald-400" />, title: 'Faster Decisions', desc: 'Real-time data and AI insights enable decisions in minutes, not days.', metric: '5x' },
]

/* ───────────────── FEATURES ───────────────── */
const FEATURES = [
  { icon: <Layers className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'Multi-Location Management', desc: 'Centralized control across warehouses, factories, and offices worldwide.' },
  { icon: <Lock className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'Role-Based Access', desc: 'Granular permissions ensuring the right people see the right data.' },
  { icon: <BarChart3 className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'Custom Dashboards', desc: 'Role-specific dashboards with KPIs that matter to your business.' },
  { icon: <Globe className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'API-First Architecture', desc: 'Seamless integrations with your existing tools and third-party services.' },
  { icon: <Zap className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'Smart Alerts', desc: 'Proactive notifications for anomalies, deadlines, and opportunities.' },
  { icon: <Calendar className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'Resource Planning', desc: 'AI-driven resource allocation and capacity planning for optimal output.' },
]

/* ───────────────── RELATED INDUSTRIES ───────────────── */
const RELATED_INDUSTRIES = [
  { name: 'Textile', erp: 'TextileFlow', desc: 'Weaving and dyeing process management for textile mills.' },
  { name: 'Manufacturing', erp: 'FactoryFlow', desc: 'Production scheduling and shop floor control.' },
  { name: 'Distribution', erp: 'DistriFlow', desc: 'Warehouse management and route optimization.' },
]

/* ═══════════════════════════════════════════════════════════════ */
/*  Component                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export function IndustryDetailPage({ slug: slugProp }: { slug?: string }) {
  const selectedIndustry = useAppStore((s) => s.selectedIndustry)
  const { navigate } = useNavigate()
  const slug = slugProp || selectedIndustry || 'apparel-textile'
  const industry = INDUSTRY_DETAILS[slug] || INDUSTRY_DETAILS['apparel-textile']
  const isElectronics = slug === 'consumer-electronics'

  // ── Fetch real ApparelFlow clients for the apparel industry page ──
  const [afClients, setAfClients] = useState<Array<{
    id: string
    companyName: string
    contactPerson: string
    city: string | null
    country: string | null
    licenseType: string | null
    isActive: boolean
    tenantStats: {
      inventoryItems: number
      customers: number
      salesOrders: number
      employees: number
      retailShops: number
      productionOrders: number
    } | null
  }> | null>(null)

  useEffect(() => {
    if (slug !== 'apparel-textile' && slug !== 'apparel') return
    let cancelled = false
    const fetchAfClients = async () => {
      try {
        const res = await fetch('/api/erp/apparelflow/clients')
        if (!res.ok) return
        const json = await res.json()
        if (cancelled) return
        setAfClients(json.clients?.filter((c: any) => c.isActive) ?? [])
      } catch (err) {
        console.error('[INDUSTRY-DETAIL] Failed to fetch ApparelFlow clients:', err)
      }
    }
    fetchAfClients()
    return () => { cancelled = true }
  }, [slug])

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="grid-bg relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none top-10 -left-40 animate-float" style={{ background: industry.colorHex }} />
        <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none top-32 right-0 animate-float" style={{ background: 'var(--gg-violet)', animationDelay: '2s' }} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <button
              onClick={() => navigate('industries')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Industries
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                {industry.icon}
              </div>
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: industry.colorHex }}>Powered by {industry.erp}</div>
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">{industry.name}</h1>
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl leading-relaxed">{industry.tagline}</p>
            <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">{industry.description}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                size="lg"
                className="btn-glow font-semibold rounded-xl px-8 h-12 text-white"
                style={{ background: `linear-gradient(to right, ${industry.colorHex}, var(--gg-amber))` }}
                onClick={() => navigate('contact')}
              >
                Request Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/[0.12] text-foreground hover:bg-secondary rounded-xl px-8 h-12"
                onClick={() => navigate('products')}
              >
                View {industry.erp} Details
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-16 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-teal)">
                  <div className="gg-card bg-card rounded-2xl p-6 text-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">{stat.icon}</div>
                    <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: industry.colorHex }}>{stat.value}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points ──────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Industry Challenges</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">The pain points that hold businesses back — and that we solve every day.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAIN_POINTS.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-rose)">
                  <div className="gg-card bg-card rounded-2xl p-6 group">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {point.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ────────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">How {industry.erp} Helps</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Purpose-built solutions that address your industry&apos;s unique challenges head-on.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <InteractiveCard variant="default" glowColor="var(--gg-green)">
                  <div className="gg-card bg-card rounded-2xl p-6 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {sol.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{sol.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sol.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Implementation Timeline ──────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Implementation Timeline</h2>
            <p className="mt-3 text-muted-foreground">Go live in 8 weeks with our proven implementation methodology.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-[var(--gg-vermillion)]/20 via-[var(--gg-amber)]/20 to-[var(--gg-vermillion)]/20" />
            {TIMELINE.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-violet)">
                  <div className="gg-card bg-card rounded-2xl p-6 text-center group relative">
                    <div className="w-12 h-12 rounded-full bg-[var(--gg-violet)]/10 border border-border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform relative z-10">
                      {step.icon}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mb-2">{step.phase}</div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits / ROI ───────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Measurable Impact</h2>
            <p className="mt-3 text-muted-foreground">Real numbers from real deployments across the industry.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
                  <div className="gg-card bg-card rounded-2xl p-6 text-center group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      {benefit.icon}
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[var(--gg-green)] to-[var(--gg-teal)] bg-clip-text text-transparent mb-2">
                      {benefit.metric}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted By — Real ApparelFlow Clients (apparel industry only) ── */}
      {(slug === 'apparel-textile' || slug === 'apparel') && afClients && afClients.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold">Trusted by <span style={{ color: industry.colorHex }}>{afClients.length}</span> Apparel Businesses</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Real companies running their operations on ApparelFlow every day.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {afClients.slice(0, 6).map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-teal)">
                    <div className="gg-card bg-card rounded-2xl p-6 group">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                          style={{ background: `linear-gradient(135deg, ${industry.colorHex}, ${industry.colorHex}88)` }}
                        >
                          {client.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">{client.companyName}</h3>
                          <p className="text-xs text-muted-foreground truncate">{[client.city, client.country].filter(Boolean).join(', ') || 'Pakistan'}</p>
                        </div>
                        {client.licenseType && (
                          <Badge
                            variant="secondary"
                            className={`shrink-0 text-[10px] ${
                              client.licenseType === 'enterprise'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : client.licenseType === 'professional'
                                ? 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] border-[var(--gg-violet)]/20'
                                : 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20'
                            }`}
                          >
                            {client.licenseType}
                          </Badge>
                        )}
                      </div>
                      {client.tenantStats && (
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                          <div>
                            <p className="text-lg font-bold text-foreground">{client.tenantStats.inventoryItems}</p>
                            <p className="text-[10px] text-muted-foreground">Inventory</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground">{client.tenantStats.customers}</p>
                            <p className="text-[10px] text-muted-foreground">Customers</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground">{client.tenantStats.salesOrders}</p>
                            <p className="text-[10px] text-muted-foreground">Orders</p>
                          </div>
                        </div>
                      )}
                      {!client.tenantStats && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground">Onboarding in progress...</p>
                        </div>
                      )}
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </div>
            {afClients.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-8"
              >
                <p className="text-sm text-muted-foreground">+ {afClients.length - 6} more active clients</p>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ── Key Features ─────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Key Features</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Everything you need to run your {industry.name.toLowerCase()} operations at scale.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-teal)">
                  <div className="gg-card bg-card rounded-2xl p-6 group">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gg-teal)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related Industries ───────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Related Industries</h2>
            <p className="mt-3 text-muted-foreground">Explore other industry-specific solutions in the ApexFlow ecosystem.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {RELATED_INDUSTRIES.map((rel, i) => (
              <motion.div
                key={rel.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <InteractiveCard variant="default" glowColor="var(--gg-teal)">
                  <div className="gg-card bg-card rounded-2xl p-6 group">
                    <div className="text-sm font-medium text-teal-400 mb-2">{rel.erp}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{rel.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{rel.desc}</p>
                    <button
                      className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                      onClick={() => navigate('industries')}
                    >
                      Learn More <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ElectroFlow Cross-Link (Consumer Electronics only) ── */}
      {isElectronics && (
        <section className="py-20 border-t border-border bg-[var(--gg-grouped-bg)]">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="bg-card border border-emerald-500/20 rounded-2xl overflow-hidden shadow-[var(--gg-shadow-card)]">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground">Try ElectroFlow Live</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gg-green)]/10 text-[var(--gg-green)] px-2 py-0.5 rounded-full border border-[var(--gg-green)]/20">
                        <span className="w-1 h-1 rounded-full bg-[var(--gg-green)]" />
                        Live ERP
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Experience the full ElectroFlow ERP in action — a complete operating system for consumer electronics
                      retail with POS, installments, inventory, service & repair, and multi-branch management.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5 h-10 shadow-[var(--gg-shadow-sm)]"
                        onClick={() => navigate('electroflow')}
                      >
                        Launch ElectroFlow Demo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border text-foreground/80 hover:bg-secondary/50 rounded-xl px-5 h-10"
                        onClick={() => navigate('erp-detail', 'electroflow')}
                      >
                        View ERP Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InteractiveCard variant="strong" glowColor="var(--gg-teal)">
              <div className="gg-card bg-card rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl border border-border flex items-center justify-center mx-auto mb-6" style={{ background: `${industry.colorHex}10` }}>
                  {industry.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                  Ready to Transform Your{' '}
                  <span style={{ color: industry.colorHex }}>{industry.name}</span> Operations?
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                  Join hundreds of businesses already using {industry.erp} to streamline operations and drive growth.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="btn-glow font-semibold rounded-xl px-8 h-12 text-white"
                    style={{ background: `linear-gradient(to right, ${industry.colorHex}, var(--gg-amber))` }}
                    onClick={() => navigate('contact')}
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/[0.12] text-foreground hover:bg-secondary rounded-xl px-8 h-12"
                    onClick={() => navigate('pricing')}
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
