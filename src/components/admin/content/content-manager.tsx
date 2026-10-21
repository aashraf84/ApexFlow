'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Info,
  Tag,
  Mail,
  Boxes,
  Building2,
  Briefcase,
  BookOpen,
  Newspaper,
  Handshake,
  Store,
  FileText,
  Search,
  Save,
  RotateCcw,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContentBlock {
  key: string
  value: string
  page: string
  section: string
  label: string
  type?: 'text' | 'textarea'
  description?: string
  saved?: boolean
  updatedAt?: string
}

type ContentMap = Record<string, ContentBlock[]>

// ─── Static page catalog (matches the order in the left nav) ──────────────────
interface PageMeta {
  page: string
  label: string
  icon: typeof Home
  description: string
}

const PAGE_CATALOG: PageMeta[] = [
  { page: 'Homepage', label: 'Homepage', icon: Home, description: 'Hero, stats, sections & footer copyright' },
  { page: 'About', label: 'About', icon: Info, description: 'Mission, vision & values' },
  { page: 'Pricing', label: 'Pricing', icon: Tag, description: 'Plans & FAQ headings' },
  { page: 'Contact', label: 'Contact', icon: Mail, description: 'Contact info labels' },
  { page: 'Solutions', label: 'Solutions', icon: Boxes, description: 'Page title & description' },
  { page: 'Industries', label: 'Industries', icon: Building2, description: 'Page title & description' },
  { page: 'Careers', label: 'Careers', icon: Briefcase, description: 'Open positions & description' },
  { page: 'Resources', label: 'Resources', icon: BookOpen, description: 'Page title & description' },
  { page: 'Blog', label: 'Blog', icon: Newspaper, description: 'Page title & description' },
  { page: 'Become Partner', label: 'Become Partner', icon: Handshake, description: 'Partner program copy' },
  { page: 'Reseller', label: 'Reseller', icon: Store, description: 'Reseller program copy' },
  { page: 'Footer', label: 'Legal / Footer', icon: FileText, description: 'Copyright, blurb & link heading' },
]

const PAGE_BY_KEY: Record<string, PageMeta> = Object.fromEntries(
  PAGE_CATALOG.map((p) => [p.page, p])
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isDirty(localValue: string | undefined, block: ContentBlock | undefined): boolean {
  if (!block) return false
  const base = localValue ?? block.value
  return base !== block.value
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ContentManager() {
  const [content, setContent] = useState<ContentMap>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [resettingPage, setResettingPage] = useState<string | null>(null)
  const [activePage, setActivePage] = useState<string>('Homepage')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  // localEdits: key → override value (so the user can type without committing)
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setContent(data.content || {})
    } catch {
      toast.error('Failed to load content blocks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // ─── Per-block save ──────────────────────────────────────────────────────────
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
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Save failed')
        }
        // Commit the local edit into the central state and clear the override.
        setContent((prev) => ({
          ...prev,
          [block.page]: (prev[block.page] || []).map((b) =>
            b.key === block.key
              ? {
                  ...b,
                  value,
                  saved: true,
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        }))
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

  // ─── Save-all for the active page (and search results when searching) ────────
  const dirtyBlocksForActive = useMemo(() => {
    const list = content[activePage] || []
    return list.filter((b) => isDirty(localEdits[b.key], b))
  }, [content, activePage, localEdits])

  const saveAll = useCallback(async () => {
    // When searching, save every dirty block across every page.
    const isSearching = searchQuery.trim().length > 0
    const targets: ContentBlock[] = isSearching
      ? Object.values(content)
          .flat()
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
            }),
          })
          if (!res.ok) throw new Error('save failed')
          okCount++
          // commit local edit
          setContent((prev) => ({
            ...prev,
            [block.page]: (prev[block.page] || []).map((b) =>
              b.key === block.key
                ? {
                    ...b,
                    value,
                    saved: true,
                    updatedAt: new Date().toISOString(),
                  }
                : b
            ),
          }))
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
  }, [content, dirtyBlocksForActive, localEdits, searchQuery])

  // ─── Reset to default for the active page ───────────────────────────────────
  const resetPageToDefault = useCallback(async () => {
    const blocks = content[activePage] || []
    if (blocks.length === 0) return
    setResettingPage(activePage)
    try {
      await Promise.all(
        blocks.map((b) =>
          fetch(`/api/admin/content?key=${encodeURIComponent(b.key)}`, {
            method: 'DELETE',
          })
        )
      )
      // Refetch so the UI picks up the seeded defaults again.
      await fetchContent()
      setLocalEdits((prev) => {
        const next = { ...prev }
        for (const b of blocks) delete next[b.key]
        return next
      })
      toast.success(`Reset “${activePage}” to defaults`)
    } catch {
      toast.error('Reset failed')
    } finally {
      setResettingPage(null)
    }
  }, [content, activePage, fetchContent])

  // ─── Local edit handler ─────────────────────────────────────────────────────
  const onEdit = (key: string, value: string) => {
    setLocalEdits((prev) => ({ ...prev, [key]: value }))
  }

  // ─── Search results: flat list of matching blocks across all pages ──────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return [] as Array<ContentBlock & { pageMeta: PageMeta }>
    const out: Array<ContentBlock & { pageMeta: PageMeta }> = []
    for (const page of Object.keys(content)) {
      const meta = PAGE_BY_KEY[page]
      if (!meta) continue
      for (const b of content[page]) {
        const hay = `${b.label} ${b.key} ${b.value} ${b.section} ${page}`.toLowerCase()
        if (hay.includes(q)) out.push({ ...b, pageMeta: meta })
      }
    }
    return out
  }, [content, searchQuery])

  const isSearching = searchQuery.trim().length > 0
  const activeBlocks = content[activePage] || []
  const dirtyCount = isSearching
    ? searchResults.filter((b) => isDirty(localEdits[b.key], b)).length
    : dirtyBlocksForActive.length

  // Group active page blocks by section.
  const sections = useMemo(() => {
    const map: Record<string, ContentBlock[]> = {}
    for (const b of activeBlocks) {
      if (!map[b.section]) map[b.section] = []
      map[b.section].push(b)
    }
    return map
  }, [activeBlocks])

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
        <span className="ml-3 text-muted-foreground">Loading content blocks…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
              <FileText className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
            </span>
            Content Manager
          </h2>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">
            Edit every page&apos;s copy — hero headings, descriptions, CTAs, footer & more.
            Changes are stored as <code className="text-foreground/80">SiteSetting</code> rows
            and surfaced to the public site on the next render.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={resetPageToDefault}
            disabled={resettingPage !== null || isSearching || activeBlocks.length === 0}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {resettingPage === activePage ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1.5" />
            )}
            Reset Page
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

      {/* ─── Search Bar ─── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search content blocks across all pages (label, key, value, section)…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
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

      {/* ─── Body: sidebar + main area ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
        {/* ── Left Nav ── */}
        <Card
          className="lg:sticky lg:top-4 overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Editable Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1.5">
            <ScrollArea className="max-h-[70vh] pr-1">
              <nav className="flex flex-col gap-0.5">
                {PAGE_CATALOG.map((p) => {
                  const isActive = !isSearching && activePage === p.page
                  const Icon = p.icon
                  const dirtyInPage =
                    (content[p.page] || []).filter((b) =>
                      isDirty(localEdits[b.key], b)
                    ).length
                  return (
                    <button
                      key={p.page}
                      onClick={() => {
                        setActivePage(p.page)
                        setSearchQuery('')
                      }}
                      className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-left ${
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)',
                            }
                          : undefined
                      }
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeContentNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full"
                          style={{
                            background: 'var(--gg-vermillion)',
                            boxShadow:
                              '0 0 8px color-mix(in srgb, var(--gg-vermillion) 50%, transparent)',
                          }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <Icon
                        className="h-4 w-4 shrink-0 transition-colors"
                        style={isActive ? { color: 'var(--gg-vermillion)' } : undefined}
                      />
                      <span className="flex-1 truncate">{p.label}</span>
                      {dirtyInPage > 0 && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                          style={{
                            background:
                              'color-mix(in srgb, var(--gg-amber) 20%, transparent)',
                            color: 'var(--gg-amber)',
                          }}
                        >
                          {dirtyInPage}
                        </span>
                      )}
                      {(content[p.page] || []).length > 0 && dirtyInPage === 0 && (
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          {(content[p.page] || []).length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ── Main Content Area ── */}
        <div className="space-y-5 min-w-0">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="search"
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
                          No content blocks match your search.
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
                        pageLabel={`${b.pageMeta.label} · ${b.section}`}
                      />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {activeBlocks.length === 0 ? (
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
                        No editable content blocks defined for “{activePage}” yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  Object.entries(sections).map(([sectionName, blocks]) => (
                    <Card
                      key={`${activePage}-${sectionName}`}
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
                            {activePage}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Footer Summary ─── */}
          {!isSearching && (
            <div
              className="flex items-center justify-between gap-3 text-xs text-muted-foreground px-4 py-3 rounded-xl border"
              style={{
                borderColor: 'var(--gg-separator)',
                background: 'color-mix(in srgb, var(--card) 60%, transparent)',
              }}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                {activeBlocks.length} editable field
                {activeBlocks.length === 1 ? '' : 's'} on this page
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
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Single content field (Input or Textarea + Save button) ───────────────────
interface ContentFieldProps {
  block: ContentBlock
  localValue?: string
  saving: boolean
  dirty: boolean
  onChange: (value: string) => void
  onSave: () => void
  pageLabel?: string
}

function ContentField({
  block,
  localValue,
  saving,
  dirty,
  onChange,
  onSave,
  pageLabel,
}: ContentFieldProps) {
  const value = localValue ?? block.value
  const isTextarea = block.type === 'textarea' || value.length > 80

  return (
    <div
      className="rounded-lg border border-border/60 bg-background/30 hover:bg-background/50 transition-colors p-3.5"
    >
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Label
              htmlFor={block.key}
              className="text-sm font-semibold text-foreground"
            >
              {block.label}
            </Label>
            {block.saved && (
              <Badge
                variant="outline"
                className="text-[9px] font-mono py-0 px-1.5 leading-none border-[var(--gg-green)]/30 text-[var(--gg-green)]"
              >
                <Check className="h-2.5 w-2.5 mr-0.5" />
                SAVED
              </Badge>
            )}
            {dirty && (
              <Badge
                variant="outline"
                className="text-[9px] font-mono py-0 px-1.5 leading-none border-[var(--gg-amber)]/40 text-[var(--gg-amber)]"
              >
                UNSAVED
              </Badge>
            )}
          </div>
          {block.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {block.description}
            </p>
          )}
          {pageLabel && (
            <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono uppercase tracking-wider">
              {pageLabel}
            </p>
          )}
        </div>
        <code className="text-[10px] text-muted-foreground/60 font-mono bg-muted/40 px-1.5 py-0.5 rounded">
          {block.key}
        </code>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1 min-w-0">
          {isTextarea ? (
            <Textarea
              id={block.key}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={Math.min(6, Math.max(2, Math.ceil(value.length / 60)))}
              className="bg-background border-border text-foreground resize-y min-h-[60px]"
              placeholder={`Enter ${block.label.toLowerCase()}…`}
            />
          ) : (
            <Input
              id={block.key}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-background border-border text-foreground h-9"
              placeholder={`Enter ${block.label.toLowerCase()}…`}
            />
          )}
        </div>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || !dirty}
          className="shrink-0 h-9 sm:w-[100px] justify-center text-foreground hover:opacity-90 disabled:opacity-40"
          style={
            dirty
              ? {
                  background:
                    'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                  color: 'white',
                }
              : { background: 'var(--muted)' }
          }
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : dirty ? (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <Check className="h-3.5 w-3.5 mr-1.5" />
          )}
          {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </Button>
      </div>

      {block.updatedAt && (
        <p className="text-[10px] text-muted-foreground/50 mt-1.5">
          Last updated {new Date(block.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
