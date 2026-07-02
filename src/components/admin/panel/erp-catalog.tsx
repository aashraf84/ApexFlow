'use client'

import { useState, useEffect, useMemo } from 'react'
import { createElement } from 'react'
import { Search, LayoutGrid, List, Plus, Database, ExternalLink, Eye, Zap, Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { FALLBACK_ERP_DATA, getErpIcon, getErpColor } from '@/lib/erp-data'
import { motion, AnimatePresence } from 'framer-motion'

interface ErpCatalogProps {
  onSelectErp: (slug: string) => void
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

const cardVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

/* Industry filter options derived from data */
const INDUSTRIES = Array.from(
  new Set(FALLBACK_ERP_DATA.map((e) => e.industry))
).sort()

export function ErpCatalog({ onSelectErp }: ErpCatalogProps) {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [industryFilter, setIndustryFilter] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Small delay for mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return FALLBACK_ERP_DATA.filter((erp) => {
      const matchSearch =
        erp.name.toLowerCase().includes(search.toLowerCase()) ||
        erp.industry?.toLowerCase().includes(search.toLowerCase()) ||
        erp.description?.toLowerCase().includes(search.toLowerCase())
      const matchIndustry = !industryFilter || erp.industry === industryFilter
      return matchSearch && matchIndustry
    })
  }, [search, industryFilter])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <PageHeader title="ERP Ecosystem" description="Loading..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
        <motion.div variants={fadeUp} custom={0}>
          <PageHeader
            title="ERP Ecosystem"
            description={`${FALLBACK_ERP_DATA.length} industry-specific ERP systems — click any system to view details, modules, and integration status`}
            actions={
              <Button size="sm" className="gap-1.5" style={{ background: 'var(--gg-vermillion)', color: 'white' }}>
                <Plus className="w-4 h-4" /> Add Custom ERP
              </Button>
            }
          />
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total ERPs', value: FALLBACK_ERP_DATA.length, color: 'var(--gg-vermillion)' },
            { label: 'Active', value: FALLBACK_ERP_DATA.filter(e => e.status === 'active').length, color: 'var(--gg-green)' },
            { label: 'Industries', value: INDUSTRIES.length, color: 'var(--gg-amber)' },
            { label: 'Total Modules', value: FALLBACK_ERP_DATA.reduce((sum, e) => sum + (e.moduleCount || e.modules?.length || 0), 0), color: 'var(--gg-teal)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)' }}
            >
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & filters */}
        <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ERP systems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Industry filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setIndustryFilter(null)}
              className={`shrink-0 px-2.5 py-1 text-xs rounded-full border transition-all ${
                !industryFilter
                  ? 'border-[var(--gg-vermillion)] text-[var(--gg-vermillion)] bg-[var(--gg-vermillion)]/10 font-medium'
                  : 'border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              All
            </button>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustryFilter(industryFilter === ind ? null : ind)}
                className={`shrink-0 px-2.5 py-1 text-xs rounded-full border transition-all whitespace-nowrap ${
                  industryFilter === ind
                    ? 'border-[var(--gg-vermillion)] text-[var(--gg-vermillion)] bg-[var(--gg-vermillion)]/10 font-medium'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden shrink-0" style={{ borderColor: 'var(--gg-separator)' }}>
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="rounded-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} system{filtered.length !== 1 ? 's' : ''} found</span>
        {industryFilter && (
          <button onClick={() => setIndustryFilter(null)} className="hover:text-foreground transition-colors">
            Clear filter
          </button>
        )}
      </div>

      {/* ERP Grid / List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Database className="w-6 h-6" />}
          title="No ERP systems found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <AnimatePresence mode="popLayout">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {filtered.map((erp, i) => (
                <motion.div key={erp.slug} variants={cardVariants} layout>
                  <ErpGridCard erp={erp} index={i} onSelect={() => onSelectErp(erp.slug)} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="flex flex-col gap-3"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {filtered.map((erp, i) => (
                <motion.div key={erp.slug} variants={cardVariants} layout>
                  <ErpListCard erp={erp} index={i} onSelect={() => onSelectErp(erp.slug)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

/* ─── Grid Card ──────────────────────────────────────────── */
function ErpGridCard({
  erp,
  index,
  onSelect,
}: {
  erp: typeof FALLBACK_ERP_DATA[number]
  index: number
  onSelect: () => void
}) {
  const IconComp = getErpIcon(erp.icon)
  const color = getErpColor(erp.color)
  const moduleCount = erp.moduleCount || erp.modules?.length || 0

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <Card
        className="border-border/60 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full overflow-hidden"
        style={{ borderColor: 'var(--gg-separator)' }}
        onClick={onSelect}
      >
        {/* Color accent bar at top */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${color.hex}, transparent)` }}
        />

        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-xl ${color.bg} transition-transform duration-300 group-hover:scale-110`}
            >
              {createElement(IconComp, { className: `w-5 h-5 ${color.text}` })}
            </div>
            <StatusBadge variant="success" size="sm">LIVE</StatusBadge>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-base">{erp.name}</h3>
            <Badge variant="outline" className="mt-1.5 text-[10px]">{erp.industry}</Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
            {erp.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t" style={{ borderColor: 'var(--gg-separator)' }}>
            <div>
              <p className="text-sm font-bold text-foreground">{moduleCount}</p>
              <p className="text-[10px] text-muted-foreground">Modules</p>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">v{erp.version || '1.0'}</p>
              <p className="text-[10px] text-muted-foreground">Version</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 flex-1"
              onClick={(e) => { e.stopPropagation(); onSelect() }}
            >
              <Eye className="w-3 h-3" />Details
            </Button>
            {erp.website && (
              <a
                href={erp.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <ExternalLink className="w-3 h-3" />Demo
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── List Card ──────────────────────────────────────────── */
function ErpListCard({
  erp,
  index,
  onSelect,
}: {
  erp: typeof FALLBACK_ERP_DATA[number]
  index: number
  onSelect: () => void
}) {
  const IconComp = getErpIcon(erp.icon)
  const color = getErpColor(erp.color)
  const moduleCount = erp.moduleCount || erp.modules?.length || 0

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <Card
        className="border-border/60 hover:shadow-sm transition-all duration-200 cursor-pointer group"
        style={{ borderColor: 'var(--gg-separator)' }}
        onClick={onSelect}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl ${color.bg} shrink-0 transition-transform duration-200 group-hover:scale-110`}
          >
            {createElement(IconComp, { className: `w-5 h-5 ${color.text}` })}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground truncate">{erp.name}</span>
              <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
              <StatusBadge variant="success" size="sm">LIVE</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{erp.industry} &middot; {erp.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <div className="text-center hidden sm:block">
              <p className="font-bold text-foreground">{moduleCount}</p>
              <p>Modules</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-bold text-foreground">v{erp.version || '1.0'}</p>
              <p>Version</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}