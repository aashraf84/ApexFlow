'use client'

import { createElement, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExternalLink, Globe, Shield, ArrowRight, Check, ChevronDown, ChevronUp,
  TrendingUp, Zap, Users, BarChart3, Star, Quote, HelpCircle,
  Package, Layers, Workflow, Lightbulb, DollarSign, MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { FALLBACK_ERP_DATA, getErpIcon, getErpColor } from '@/lib/erp-data'
import { ERP_DETAILS, getErpDetail } from '@/lib/erp-detail-data'

interface ErpDetailViewProps {
  slug: string
  onBack: () => void
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

export function ErpDetailView({ slug, onBack }: ErpDetailViewProps) {
  // Get basic info from fallback data
  const basicInfo = FALLBACK_ERP_DATA.find((e) => e.slug === slug)
  // Get rich detail from detail data
  const detail = getErpDetail(slug)

  if (!basicInfo) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">ERP system not found</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          Back to ERP List
        </Button>
      </div>
    )
  }

  const IconComp = getErpIcon(basicInfo.icon)
  const color = getErpColor(basicInfo.color)
  const moduleCount = basicInfo.moduleCount || basicInfo.modules?.length || 0

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="space-y-6"
    >
      {/* ─── Hero Section ──────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={0}>
        <ErpHero
          name={basicInfo.name}
          tagline={detail?.tagline || basicInfo.description}
          description={detail?.heroDescription || basicInfo.description}
          icon={IconComp}
          color={color}
          industry={basicInfo.industry}
          version={basicInfo.version}
          moduleCount={moduleCount}
          status={basicInfo.status}
          website={basicInfo.website}
          pricing={detail?.pricing || basicInfo.pricing || ''}
          stats={detail?.stats || []}
          onVisitDemo={() => basicInfo.website && window.open(basicInfo.website, '_blank')}
        />
      </motion.div>

      {/* ─── Tabbed Content ────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={1}>
        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="modules" className="gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modules</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Benefits</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-1.5">
              <Workflow className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">How It Works</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-1.5">
              <Star className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Testimonials</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-4">
            <ModulesSection
              modules={detail?.modules || basicInfo.modules?.map(m => ({ name: m.name, description: m.description, icon: 'package' })) || []}
              color={color}
            />
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <FeaturesSection
              moduleFeatures={detail?.moduleFeatures || []}
              differentiators={detail?.differentiators || []}
              securityFeatures={detail?.securityFeatures || []}
              color={color}
            />
          </TabsContent>

          <TabsContent value="benefits" className="mt-4">
            <BenefitsSection
              painPoints={detail?.painPoints || []}
              benefits={detail?.benefits || []}
              comparisonData={detail?.comparisonData || []}
              color={color}
            />
          </TabsContent>

          <TabsContent value="workflow" className="mt-4">
            <WorkflowSection
              workflow={detail?.workflow || []}
              integrations={detail?.integrations || []}
              color={color}
            />
          </TabsContent>

          <TabsContent value="testimonials" className="mt-4">
            <TestimonialsSection testimonials={detail?.testimonials || []} />
          </TabsContent>

          <TabsContent value="faq" className="mt-4">
            <FaqSection faqs={detail?.faqs || []} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Hero Section
   ═══════════════════════════════════════════════════════════ */
function ErpHero({
  name, tagline, description, icon: IconComp, color, industry,
  version, moduleCount, status, website, pricing, stats, onVisitDemo,
}: {
  name: string; tagline: string; description: string
  icon: React.ElementType; color: ReturnType<typeof getErpColor>
  industry: string; version: string; moduleCount: number; status: string
  website: string | null; pricing: string; stats: { label: string; value: string }[]
  onVisitDemo: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--gg-separator)' }}>
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${color.hex}15 0%, transparent 50%, ${color.hex}08 100%)`,
        }}
      />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: color.hex }} />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Icon + Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg"
                style={{ background: `${color.hex}20`, boxShadow: `0 8px 32px ${color.hex}30` }}
              >
                {createElement(IconComp, { className: `w-7 h-7 ${color.text}` })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{name}</h1>
                  <StatusBadge variant="success">LIVE</StatusBadge>
                </div>
                <p className={`text-sm font-medium mt-0.5 ${color.text}`}>{tagline}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{industry}</Badge>
              <Badge variant="outline">v{version}</Badge>
              <Badge variant="outline">{moduleCount} Modules</Badge>
              {pricing && (
                <Badge
                  className="font-medium"
                  style={{ background: `${color.hex}15`, color: color.hex, borderColor: `${color.hex}30` }}
                  variant="outline"
                >
                  {pricing}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {website && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  style={{ background: color.hex, color: 'white' }}
                  onClick={onVisitDemo}
                >
                  <Globe className="w-4 h-4" /> Visit Live Demo
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5">
                <Zap className="w-4 h-4" /> Request Integration
              </Button>
            </div>
          </div>

          {/* Stats grid (if available from detail data) */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:w-64 shrink-0">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-3 text-center border"
                  style={{ borderColor: `${color.hex}20`, background: `${color.hex}08` }}
                >
                  <p className="text-xl font-bold" style={{ color: color.hex }}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Modules Section
   ═══════════════════════════════════════════════════════════ */
function ModulesSection({
  modules,
  color,
}: {
  modules: { name: string; description: string; icon: string }[]
  color: ReturnType<typeof getErpColor>
}) {
  if (modules.length === 0) {
    return <EmptyTab title="No module data available" description="Module details will appear here once configured." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {modules.map((mod, i) => {
        const ModIcon = getErpIcon(mod.icon) || Package
        return (
          <motion.div
            key={mod.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Card className="h-full border-border/60 hover:border-border transition-all" style={{ borderColor: 'var(--gg-separator)' }}>
              <CardContent className="p-4 flex gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${color.bg} shrink-0`}>
                  {createElement(ModIcon, { className: `w-5 h-5 ${color.text}` })}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{mod.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Features Section
   ═══════════════════════════════════════════════════════════ */
function FeaturesSection({
  moduleFeatures,
  differentiators,
  securityFeatures,
  color,
}: {
  moduleFeatures: { moduleName: string; features: string[] }[]
  differentiators: string[]
  securityFeatures: string[]
  color: ReturnType<typeof getErpColor>
}) {
  return (
    <div className="space-y-6">
      {/* Detailed features per module */}
      {moduleFeatures.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleFeatures.map((mf) => (
            <Card key={mf.moduleName} style={{ borderColor: 'var(--gg-separator)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{mf.moduleName}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5">
                  {mf.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${color.text}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Differentiators */}
      {differentiators.length > 0 && (
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${color.text}`} />
              Key Differentiators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {differentiators.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color.hex }} />
                  {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Security features */}
      {securityFeatures.length > 0 && (
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {securityFeatures.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {moduleFeatures.length === 0 && differentiators.length === 0 && securityFeatures.length === 0 && (
        <EmptyTab title="No feature data available" description="Detailed feature information will appear here." />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Benefits Section
   ═══════════════════════════════════════════════════════════ */
function BenefitsSection({
  painPoints,
  benefits,
  comparisonData,
  color,
}: {
  painPoints: { title: string; before: string; after: string }[]
  benefits: { title: string; description: string; metric: string }[]
  comparisonData: { feature: string; manual: string; withErp: string }[]
  color: ReturnType<typeof getErpColor>
}) {
  return (
    <div className="space-y-6">
      {/* Benefits cards */}
      {benefits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {benefits.map((b) => (
            <Card key={b.title} className="relative overflow-hidden" style={{ borderColor: 'var(--gg-separator)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: color.hex }} />
              <CardContent className="relative p-4">
                <p className="text-2xl font-bold" style={{ color: color.hex }}>{b.metric}</p>
                <h4 className="text-sm font-semibold mt-1">{b.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Before/After pain points */}
      {painPoints.length > 0 && (
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Problems Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {painPoints.map((pp) => (
                <div key={pp.title} className="space-y-2">
                  <h4 className="text-sm font-semibold">{pp.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-lg p-3 bg-red-500/5 border border-red-500/10">
                      <p className="text-[10px] font-medium text-red-400 mb-1 uppercase tracking-wider">Before</p>
                      <p className="text-xs text-muted-foreground">{pp.before}</p>
                    </div>
                    <div className="rounded-lg p-3 border" style={{ background: `${color.hex}08`, borderColor: `${color.hex}20` }}>
                      <p className={`text-[10px] font-medium mb-1 uppercase tracking-wider ${color.text}`}>With {color.text.replace('text-', '')}</p>
                      <p className="text-xs text-muted-foreground">{pp.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {benefits.length === 0 && painPoints.length === 0 && comparisonData.length === 0 && (
        <EmptyTab title="No benefit data available" description="ROI and benefit information will appear here." />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Workflow Section
   ═══════════════════════════════════════════════════════════ */
function WorkflowSection({
  workflow,
  integrations,
  color,
}: {
  workflow: { step: string; title: string; description: string }[]
  integrations: { name: string; category: string; icon: string }[]
  color: ReturnType<typeof getErpColor>
}) {
  return (
    <div className="space-y-6">
      {/* Workflow steps */}
      {workflow.length > 0 && (
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Workflow className={`w-4 h-4 ${color.text}`} />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div
                className="absolute left-5 top-8 bottom-8 w-px"
                style={{ background: `linear-gradient(to bottom, ${color.hex}40, ${color.hex}10)` }}
              />
              <div className="space-y-6">
                {workflow.map((w) => (
                  <div key={w.step} className="flex gap-4 relative">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold text-white shrink-0 z-10"
                      style={{ background: color.hex }}
                    >
                      {w.step}
                    </div>
                    <div className="pt-1.5">
                      <h4 className="text-sm font-semibold">{w.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {integrations.length > 0 && (
        <Card style={{ borderColor: 'var(--gg-separator)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Integration Ecosystem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {integrations.map((ig) => (
                <Badge key={ig.name} variant="outline" className="text-xs gap-1.5">
                  {ig.name}
                  <span className="text-[9px] text-muted-foreground">{ig.category}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {workflow.length === 0 && integrations.length === 0 && (
        <EmptyTab title="No workflow data available" description="Workflow and integration information will appear here." />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Testimonials Section
   ═══════════════════════════════════════════════════════════ */
function TestimonialsSection({ testimonials }: { testimonials: { quote: string; name: string; title: string; company: string; avatar: string }[] }) {
  if (testimonials.length === 0) {
    return <EmptyTab title="No testimonials yet" description="Customer testimonials will appear here." />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <Card className="h-full" style={{ borderColor: 'var(--gg-separator)' }}>
            <CardContent className="p-5 flex flex-col h-full">
              <Quote className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground flex-1 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <Separator className="my-3" />
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'var(--gg-vermillion)' }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.title}, {t.company}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FAQ Section
   ═══════════════════════════════════════════════════════════ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border rounded-lg" style={{ borderColor: 'var(--gg-separator)' }}>
      <button
        className="flex items-center justify-between w-full p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  )
}

function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) {
    return <EmptyTab title="No FAQs available" description="Frequently asked questions will appear here." />
  }

  return (
    <div className="space-y-2">
      {faqs.map((f) => (
        <FaqItem key={f.question} q={f.question} a={f.answer} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Empty Tab State
   ═══════════════════════════════════════════════════════════ */
function EmptyTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
    </div>
  )
}