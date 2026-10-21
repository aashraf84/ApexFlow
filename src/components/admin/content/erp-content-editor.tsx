'use client'

// ═══════════════════════════════════════════════════════════════════════════
// ErpContentEditor — the "ERP Products" tab of the Content Manager
// ═══════════════════════════════════════════════════════════════════════════
//
// Renders a sub-nav (pills) of all 21 ERP slugs and, for the active ERP, the
// editable content fields grouped by section (Hero / Pricing / Stats /
// Modules / Pain Points / Workflow). Each field is editable with a per-block
// Save button — same UX pattern as the existing Page Content editor.
//
// ERP content blocks are NOT loaded by the main /api/admin/content GET handler
// (that would balloon the initial Content Manager payload from ~50 blocks to
// ~1,250). Instead this component lazily fetches /api/admin/content/erp on
// first mount so opening the Content Manager stays fast.
//
// Per-block Save / per-ERP Reset / Save All all POST/DELETE to the regular
// /api/admin/content route — ERP overrides are stored as ordinary SiteSetting
// rows with category='content' and group='erp_<slug>'.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Boxes,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles,
  Search,
  X,
} from 'lucide-react'
import { ERP_DETAILS } from '@/lib/erp-detail-data'
import { ContentField, type ContentBlock } from './content-manager'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ErpMeta {
  slug: string
  name: string
  icon: string
  color: string
  industry: string
}

interface ErpPayload {
  meta: ErpMeta | null
  blocks: Array<ContentBlock & { saved: boolean; updatedAt?: string }>
  sections: Record<string, Array<ContentBlock & { saved: boolean; updatedAt?: string }>>
}

interface ErpContentState {
  erps: Record<string, ErpPayload>
  slugs: string[]
  total: number
  dbWarning?: string
}

// ─── ERP slug list (static — used to render the pill sub-nav even before the
// fetch resolves so the user sees the full picker immediately) ──────────────
const ERP_SLUGS = Object.keys(ERP_DETAILS)

// ─── Helper: a block is "dirty" when its local edit differs from the saved value
function isDirty(
  localValue: string | undefined,
  block: ContentBlock | undefined
): boolean {
  if (!block) return false
  const base = localValue ?? block.value
  return base !== block.value
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ErpContentEditor() {
  const [data, setData] = useState<ErpContentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeErp, setActiveErp] = useState<string>(ERP_SLUGS[0] || 'apparelflow')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [resettingErp, setResettingErp] = useState<string | null>(null)
  // localEdits: key → override value (so the user can type without committing)
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // ─── Fetch all ERP content (defaults merged with DB overrides) ─────────────
  const fetchErpContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/erp', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const json = (await res.json()) as ErpContentState
      setData(json)
    } catch {
      toast.error('Failed to load ERP content blocks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchErpContent()
  }, [fetchErpContent])

  // ─── Per-block save (POSTs to the regular /api/admin/content endpoint) ─────
  const saveBlock = useCallback(
    async (block: ContentBlock) => {
      const override = localEdits[block.key]
      const value = override ?? block.value
      setSavingKey(block.key)
      try {
        const res = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: block.key,
            value,
            page: block.page,
            section: block.section,
            label: block.label,
            type: block.type || 'text',
            description: block.description,
            // group is what the public /api/content route uses to bucket
            // ERP overrides under page='erp_<slug>'. The POST handler stores
            // body.group (defaulting to body.page when omitted) — we send
            // the explicit group so the row is correctly bucketed even if
            // the page name and group ever diverge.
            group: block.group || block.page,
          }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Save failed')
        }
        // Commit the local edit into central state and clear the override.
        setData((prev) => {
          if (!prev) return prev
          const next: ErpContentState = { ...prev, erps: { ...prev.erps } }
          const pageKey = block.page
          const erpPayload = next.erps[pageKey]
          if (!erpPayload) return prev
          const updatedBlocks = erpPayload.blocks.map((b) =>
            b.key === block.key
              ? {
                  ...b,
                  value,
                  saved: true,
                  updatedAt: new Date().toISOString(),
                }
              : b
          )
          const updatedSections: Record<string, typeof updatedBlocks> = {}
          for (const [sName, arr] of Object.entries(erpPayload.sections)) {
            updatedSections[sName] = arr.map((b) =>
              b.key === block.key
                ? {
                    ...b,
                    value,
                    saved: true,
                    updatedAt: new Date().toISOString(),
                  }
                : b
            )
          }
          next.erps[pageKey] = {
            ...erpPayload,
            blocks: updatedBlocks,
            sections: updatedSections,
          }
          return next
        })
        setLocalEdits((prev) => {
          if (!prev[block.key]) return prev
          const next = { ...prev }
          delete next[block.key]
          return next
        })
        toast.success(`Saved “${block.label}”`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save block')
      } finally {
        setSavingKey(null)
      }
    },
    [localEdits]
  )

  // ─── Save-all for the active ERP (or all search results when searching) ───
  const dirtyBlocksForActive = useMemo(() => {
    const payload = data?.erps[`erp_${activeErp}`]
    if (!payload) return [] as Array<ContentBlock>
    return payload.blocks.filter((b) => isDirty(localEdits[b.key], b))
  }, [data, activeErp, localEdits])

  const saveAll = useCallback(async () => {
    const isSearching = searchQuery.trim().length > 0
    const targets: ContentBlock[] = isSearching
      ? Object.values(data?.erps || {})
          .flatMap((e) => e.blocks)
          .filter((b) => isDirty(localEdits[b.key], b))
      : dirtyBlocksForActive

    if (targets.length === 0) {
      toast.info('No unsaved changes to commit')
      return
    }
    setSavingAll(true)
    let okCount = 0
    let errCount = 0
    await Promise.all(
      targets.map(async (block) => {
        try {
          const value = localEdits[block.key] ?? block.value
          const res = await fetch('/api/admin/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: block.key,
              value,
              page: block.page,
              section: block.section,
              label: block.label,
              type: block.type || 'text',
              description: block.description,
              group: block.group || block.page,
            }),
          })
          if (!res.ok) throw new Error('save failed')
          okCount++
          setData((prev) => {
            if (!prev) return prev
            const next: ErpContentState = { ...prev, erps: { ...prev.erps } }
            const pageKey = block.page
            const erpPayload = next.erps[pageKey]
            if (!erpPayload) return prev
            const updatedBlocks = erpPayload.blocks.map((b) =>
              b.key === block.key
                ? {
                    ...b,
                    value,
                    saved: true,
                    updatedAt: new Date().toISOString(),
                  }
                : b
            )
            const updatedSections: Record<string, typeof updatedBlocks> = {}
            for (const [sName, arr] of Object.entries(erpPayload.sections)) {
              updatedSections[sName] = arr.map((b) =>
                b.key === block.key
                  ? {
                      ...b,
                      value,
                      saved: true,
                      updatedAt: new Date().toISOString(),
                    }
                  : b
              )
            }
            next.erps[pageKey] = {
              ...erpPayload,
              blocks: updatedBlocks,
              sections: updatedSections,
            }
            return next
          })
          setLocalEdits((prev) => {
            if (!prev[block.key]) return prev
            const next = { ...prev }
            delete next[block.key]
            return next
          })
        } catch {
          errCount++
        }
      })
    )
    setSavingAll(false)
    if (errCount === 0) {
      toast.success(`Saved ${okCount} block${okCount === 1 ? '' : 's'}`)
    } else if (okCount > 0) {
      toast.warning(`Saved ${okCount}, ${errCount} failed`)
    } else {
      toast.error('Failed to save changes')
    }
  }, [data, dirtyBlocksForActive, localEdits, searchQuery])

  // ─── Reset the active ERP to defaults (DELETE all overrides) ──────────────
  const resetErpToDefault = useCallback(async () => {
    const payload = data?.erps[`erp_${activeErp}`]
    if (!payload) return
    const blocks = payload.blocks
    if (blocks.length === 0) return
    setResettingErp(activeErp)
    try {
      await Promise.all(
        blocks.map((b) =>
          fetch(`/api/admin/content?key=${encodeURIComponent(b.key)}`, {
            method: 'DELETE',
          })
        )
      )
      await fetchErpContent()
      setLocalEdits((prev) => {
        const next = { ...prev }
        for (const b of blocks) delete next[b.key]
        return next
      })
      toast.success(`Reset “${payload.meta?.name || activeErp}” to defaults`)
    } catch {
      toast.error('Reset failed')
    } finally {
      setResettingErp(null)
    }
  }, [data, activeErp, fetchErpContent])

  // ─── Local edit handler ───────────────────────────────────────────────────
  const onEdit = (key: string, value: string) => {
    setLocalEdits((prev) => ({ ...prev, [key]: value }))
  }

  // ─── Search across all ERP blocks (flat list across every ERP) ───────────
  const isSearching = searchQuery.trim().length > 0
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return [] as Array<ContentBlock & { erpName: string; erpSlug: string }>
    const out: Array<ContentBlock & { erpName: string; erpSlug: string }> = []
    if (!data) return out
    for (const slug of data.slugs) {
      const payload = data.erps[`erp_${slug}`]
      if (!payload) continue
      const erpName = payload.meta?.name || slug
      for (const b of payload.blocks) {
        const hay = `${b.label} ${b.key} ${b.value} ${b.section} ${erpName} ${slug}`.toLowerCase()
        if (hay.includes(q)) out.push({ ...b, erpName, erpSlug: slug })
      }
    }
    return out
  }, [data, searchQuery])

  const dirtyCount = isSearching
    ? searchResults.filter((b) => isDirty(localEdits[b.key], b)).length
    : dirtyBlocksForActive.length

  const activePayload = data?.erps[`erp_${activeErp}`]
  const activeSections = activePayload?.sections || {}
  const activeMeta = activePayload?.meta
  const activeBlockCount = activePayload?.blocks.length || 0

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
        <span className="ml-3 text-muted-foreground">Loading ERP content blocks…</span>
      </div>
    )
  }

  if (!data || Object.keys(data.erps).length === 0) {
    return (
      <Card
        style={{
          background: 'var(--card)',
          borderColor: 'var(--gg-separator)',
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            No ERP content blocks available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 14%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))',
              }}
            >
              <Boxes className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
            </span>
            ERP Products
          </h2>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">
            Edit every ERP product page&apos;s copy — tagline, hero description, pricing, stats,
            modules, pain points &amp; workflow. Stored under <code className="text-foreground/80">SiteSetting</code> rows
            with group <code className="text-foreground/80">erp_&lt;slug&gt;</code> and surfaced
            to <code className="text-foreground/80">/erp/&lt;slug&gt;</code> on the next render.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={resetErpToDefault}
            disabled={resettingErp !== null || isSearching || activeBlockCount === 0}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {resettingErp === activeErp ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1.5" />
            )}
            Reset ERP
          </Button>
          <Button
            onClick={saveAll}
            disabled={savingAll || dirtyCount === 0}
            className="text-white hover:opacity-90"
            style={{
              background:
                'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
            }}
          >
            {savingAll ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save All Changes
            {dirtyCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 h-5 px-1.5 text-[10px] font-bold leading-none"
              >
                {dirtyCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* ─── ERP Picker (pills) ─── */}
      <Card
        style={{
          background: 'var(--card)',
          borderColor: 'var(--gg-separator)',
          boxShadow: 'var(--gg-shadow-card)',
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--gg-vermillion)' }}
                />
                ERP Products ({data.slugs.length})
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Pick an ERP to edit its content. Each product page renders tagline, hero,
                pricing, stats, modules, pain points &amp; workflow from these blocks.
              </CardDescription>
            </div>
            {data.total > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-border text-muted-foreground"
              >
                {data.total} blocks total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {data.slugs.map((slug) => {
              const meta = data.erps[`erp_${slug}`]?.meta
              const label = meta?.name || slug
              const isActive = !isSearching && activeErp === slug
              const blockCount = data.erps[`erp_${slug}`]?.blocks.length || 0
              const dirtyInErp =
                (data.erps[`erp_${slug}`]?.blocks || []).filter((b) =>
                  isDirty(localEdits[b.key], b)
                ).length
              return (
                <button
                  key={slug}
                  onClick={() => {
                    setActiveErp(slug)
                    setSearchQuery('')
                  }}
                  className={`relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            'color-mix(in srgb, var(--gg-vermillion) 14%, transparent)',
                          borderColor:
                            'color-mix(in srgb, var(--gg-vermillion) 35%, transparent)',
                        }
                      : {
                          background: 'color-mix(in srgb, var(--card) 60%, transparent)',
                          borderColor: 'var(--gg-separator)',
                        }
                  }
                  title={meta ? `${meta.industry} • ${blockCount} fields` : `${blockCount} fields`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeErpPill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        boxShadow:
                          '0 0 0 1px color-mix(in srgb, var(--gg-vermillion) 50%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                  {dirtyInErp > 0 && (
                    <span
                      className="relative text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                      style={{
                        background:
                          'color-mix(in srgb, var(--gg-amber) 20%, transparent)',
                        color: 'var(--gg-amber)',
                      }}
                    >
                      {dirtyInErp}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Search Bar (searches across all ERP blocks) ─── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search across all ERP content blocks (label, key, value, section, ERP name)…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11 border-border text-foreground placeholder:text-muted-foreground/70"
          style={{ background: 'var(--card)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ─── Main area: search results OR per-ERP blocks grouped by section ─── */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="erp-search"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Card
              style={{
                background: 'var(--card)',
                borderColor: 'var(--gg-separator)',
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-base text-foreground flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      Search Results
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {searchResults.length} block
                      {searchResults.length === 1 ? '' : 's'} match “{searchQuery}”
                      {searchResults.length === 0 && ' — try a different term'}
                    </CardDescription>
                  </div>
                  {searchResults.length > 0 && dirtyCount > 0 && (
                    <Button
                      size="sm"
                      onClick={saveAll}
                      disabled={savingAll}
                      className="text-white hover:opacity-90"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                      }}
                    >
                      {savingAll ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Save {dirtyCount} Change{dirtyCount === 1 ? '' : 's'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No ERP content blocks match your search.
                    </p>
                  </div>
                )}
                {searchResults.map((b) => (
                  <ContentField
                    key={b.key}
                    block={b}
                    localValue={localEdits[b.key]}
                    saving={savingKey === b.key}
                    dirty={isDirty(localEdits[b.key], b)}
                    onChange={(v) => onEdit(b.key, v)}
                    onSave={() => saveBlock(b)}
                    pageLabel={`${b.erpName} · ${b.section}`}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={`erp-${activeErp}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {activeBlockCount === 0 ? (
              <Card
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--gg-separator)',
                }}
              >
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles
                    className="h-10 w-10 mb-3"
                    style={{ color: 'var(--gg-vermillion)' }}
                  />
                  <p className="text-muted-foreground text-sm">
                    No editable content blocks defined for “{activeMeta?.name || activeErp}”.
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(activeSections).map(([sectionName, blocks]) => (
                <Card
                  key={`erp-${activeErp}-${sectionName}`}
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--gg-separator)',
                    boxShadow: 'var(--gg-shadow-card)',
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle className="text-base text-foreground flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: 'var(--gg-vermillion)' }}
                          />
                          {sectionName}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {blocks.length} field{blocks.length === 1 ? '' : 's'} in this section
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-border text-muted-foreground"
                      >
                        {activeMeta?.name || activeErp}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {blocks.map((b) => (
                      <ContentField
                        key={b.key}
                        block={b}
                        localValue={localEdits[b.key]}
                        saving={savingKey === b.key}
                        dirty={isDirty(localEdits[b.key], b)}
                        onChange={(v) => onEdit(b.key, v)}
                        onSave={() => saveBlock(b)}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))
            )}

            {/* ─── Footer Summary ─── */}
            <div
              className="flex items-center justify-between gap-3 text-xs text-muted-foreground px-4 py-3 rounded-xl border"
              style={{
                borderColor: 'var(--gg-separator)',
                background: 'color-mix(in srgb, var(--card) 60%, transparent)',
              }}
            >
              <span className="flex items-center gap-2">
                <Boxes className="h-3.5 w-3.5" />
                {activeBlockCount} editable field
                {activeBlockCount === 1 ? '' : 's'} for {activeMeta?.name || activeErp}
              </span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span className="hidden sm:flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: dirtyCount > 0 ? 'var(--gg-amber)' : 'var(--gg-green)',
                  }}
                />
                {dirtyCount > 0
                  ? `${dirtyCount} unsaved change${dirtyCount === 1 ? '' : 's'}`
                  : 'All changes saved'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
