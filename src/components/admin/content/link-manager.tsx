'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  Navigation,
  LayoutGrid,
  Share2,
  Zap,
  RotateCcw,
  GripVertical,
  ExternalLink,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// Types — mirror the API shape exactly
// ═══════════════════════════════════════════════════════════════════════════
interface NavLink {
  id: string
  label: string
  href: string
  icon?: string
  order: number
}
interface FooterLink {
  id: string
  column: string
  label: string
  href: string
  order: number
}
interface SocialLink {
  id: string
  platform: string
  url: string
  icon?: string
}
interface CtaLink {
  id: string
  key: string
  label: string
  href: string
}

interface LinkSection<T> {
  links: T[]
  saved: boolean
  updatedAt?: string
}

interface LinksState {
  nav_links: LinkSection<NavLink>
  footer_links: LinkSection<FooterLink>
  social_links: LinkSection<SocialLink>
  cta_links: LinkSection<CtaLink>
}

type LinkKey = 'nav_links' | 'footer_links' | 'social_links' | 'cta_links'

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════
const FOOTER_COLUMNS = ['Company', 'Products', 'Resources', 'Legal'] as const
const SOCIAL_PLATFORMS = [
  'GitHub',
  'Twitter/X',
  'LinkedIn',
  'Facebook',
  'Instagram',
  'YouTube',
] as const

const SECTION_META: Record<
  LinkKey,
  { label: string; icon: typeof Navigation; description: string }
> = {
  nav_links: {
    label: 'Navigation',
    icon: Navigation,
    description: 'Header navigation links — the main menu visitors see at the top of every page.',
  },
  footer_links: {
    label: 'Footer',
    icon: LayoutGrid,
    description: 'Footer links grouped by column — Company, Products, Resources, Legal.',
  },
  social_links: {
    label: 'Social',
    icon: Share2,
    description: 'Social media profile links rendered as icons in the footer.',
  },
  cta_links: {
    label: 'CTAs',
    icon: Zap,
    description: 'Key call-to-action buttons used across the site (hero, sections, partner page).',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════
function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`
}

function jsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

// Deep compare two arrays-of-links by their JSON-stringified form. Cheap and
// order-sensitive — exactly what we want for dirty detection.
function isSectionDirty(a: unknown[] | undefined, b: unknown[] | undefined): boolean {
  return jsonStringify(a ?? []) !== jsonStringify(b ?? [])
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return arr
  const next = arr.slice()
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

// ═══════════════════════════════════════════════════════════════════════════
// Main LinkManager component
// ═══════════════════════════════════════════════════════════════════════════
export function LinkManager() {
  const [original, setOriginal] = useState<LinksState | null>(null)
  const [draft, setDraft] = useState<LinksState | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [resettingSection, setResettingSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<LinkKey>('nav_links')

  // ─── Fetch all link sections ──────────────────────────────────────────────
  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/links', { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const data = (await res.json()) as LinksState
      setOriginal(data)
      setDraft(data)
    } catch {
      toast.error('Failed to load link configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  // ─── Dirty counts per section + total ──────────────────────────────────────
  const dirtyCounts = useMemo(() => {
    const out: Record<LinkKey, number> = {
      nav_links: 0,
      footer_links: 0,
      social_links: 0,
      cta_links: 0,
    }
    if (!original || !draft) return out
    ;(Object.keys(out) as LinkKey[]).forEach((k) => {
      if (isSectionDirty(original[k].links, draft[k].links)) out[k] = 1
    })
    return out
  }, [original, draft])

  const totalDirty = useMemo(
    () => Object.values(dirtyCounts).reduce((a, b) => a + b, 0),
    [dirtyCounts]
  )

  // ─── Generic section mutation helpers ─────────────────────────────────────
  const updateSection = useCallback(
    <K extends LinkKey>(key: K, links: LinksState[K]['links']) => {
      setDraft((prev) => (prev ? { ...prev, [key]: { ...prev[key], links } } : prev))
    },
    []
  )

  // ─── Save a single section ─────────────────────────────────────────────────
  const saveSection = useCallback(
    async (key: LinkKey) => {
      if (!draft) return
      setSavingSection(key)
      try {
        const res = await fetch('/api/admin/content/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: key, links: draft[key].links }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Save failed')
        }
        const data = await res.json()
        setOriginal((prev) =>
          prev
            ? {
                ...prev,
                [key]: {
                  links: draft[key].links,
                  saved: true,
                  updatedAt: data.updatedAt,
                },
              }
            : prev
        )
        setDraft((prev) =>
          prev ? { ...prev, [key]: { ...prev[key], saved: true, updatedAt: data.updatedAt } } : prev
        )
        toast.success(`${SECTION_META[key].label} links saved`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save links')
      } finally {
        setSavingSection(null)
      }
    },
    [draft]
  )

  // ─── Save all dirty sections ───────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    if (!draft || !original) return
    const dirty: LinkKey[] = (Object.keys(SECTION_META) as LinkKey[]).filter((k) =>
      isSectionDirty(original[k].links, draft[k].links)
    )
    if (dirty.length === 0) {
      toast.info('No unsaved link changes')
      return
    }
    setSavingAll(true)
    let ok = 0
    let fail = 0
    await Promise.all(
      dirty.map(async (k) => {
        try {
          const res = await fetch('/api/admin/content/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section: k, links: draft[k].links }),
          })
          if (!res.ok) throw new Error('save failed')
          const data = await res.json()
          setOriginal((prev) =>
            prev
              ? {
                  ...prev,
                  [k]: { links: draft[k].links, saved: true, updatedAt: data.updatedAt },
                }
              : prev
          )
          setDraft((prev) =>
            prev
              ? { ...prev, [k]: { ...prev[k], saved: true, updatedAt: data.updatedAt } }
              : prev
          )
          ok++
        } catch {
          fail++
        }
      })
    )
    setSavingAll(false)
    if (fail === 0) toast.success(`Saved ${ok} link section${ok === 1 ? '' : 's'}`)
    else if (ok > 0) toast.warning(`Saved ${ok}, ${fail} failed`)
    else toast.error('Failed to save links')
  }, [draft, original])

  // ─── Reset a single section to defaults ───────────────────────────────────
  const resetSection = useCallback(
    async (key: LinkKey) => {
      setResettingSection(key)
      try {
        const res = await fetch(
          `/api/admin/content/links?section=${encodeURIComponent(key)}`,
          { method: 'DELETE' }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Reset failed')
        }
        // Refetch to repopulate defaults.
        await fetchLinks()
        toast.success(`Reset ${SECTION_META[key].label} to defaults`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Reset failed')
      } finally {
        setResettingSection(null)
      }
    },
    [fetchLinks]
  )

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading || !draft || !original) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
        <span className="ml-3 text-muted-foreground">Loading link configuration…</span>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
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
              <Navigation className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
            </span>
            Links &amp; Navigation
          </h2>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">
            Edit header navigation, footer columns, social profiles and key CTA
            buttons. Each section is stored as a JSON array in{' '}
            <code className="text-foreground/80">SiteSetting</code> under{' '}
            <code className="text-foreground/80">category=&quot;content&quot;</code>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => resetSection(activeTab)}
            disabled={
              resettingSection === activeTab || !draft[activeTab].saved
            }
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {resettingSection === activeTab ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1.5" />
            )}
            Reset {SECTION_META[activeTab].label}
          </Button>
          <Button
            onClick={saveAll}
            disabled={savingAll || totalDirty === 0}
            className="text-white hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
            }}
          >
            {savingAll ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save All Links
            {totalDirty > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 h-5 px-1.5 text-[10px] font-bold leading-none"
              >
                {totalDirty}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as LinkKey)}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60">
          {(Object.keys(SECTION_META) as LinkKey[]).map((k) => {
            const meta = SECTION_META[k]
            const Icon = meta.icon
            const dirty = dirtyCounts[k] > 0
            return (
              <TabsTrigger key={k} value={k} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
                {dirty && (
                  <span
                    className="ml-1 h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--gg-amber)' }}
                  />
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* ─── Navigation Links ─── */}
        <TabsContent value="nav_links" className="outline-none">
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
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Navigation className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                    Navigation Links
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Top-of-page header navigation. Use up/down arrows to reorder.
                  </CardDescription>
                </div>
                <SectionSaveButton
                  section="nav_links"
                  saving={savingSection === 'nav_links'}
                  dirty={dirtyCounts.nav_links > 0}
                  onSave={() => saveSection('nav_links')}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence initial={false}>
                {draft.nav_links.links.map((link, i) => (
                  <NavRow
                    key={link.id}
                    link={link}
                    index={i}
                    total={draft.nav_links.links.length}
                    onChange={(next) => {
                      const links = draft.nav_links.links.slice()
                      links[i] = next
                      updateSection('nav_links', links)
                    }}
                    onMoveUp={() =>
                      updateSection(
                        'nav_links',
                        swap(draft.nav_links.links, i, i - 1)
                      )
                    }
                    onMoveDown={() =>
                      updateSection(
                        'nav_links',
                        swap(draft.nav_links.links, i, i + 1)
                      )
                    }
                    onDelete={() => {
                      const links = draft.nav_links.links.slice()
                      links.splice(i, 1)
                      updateSection('nav_links', links)
                    }}
                  />
                ))}
              </AnimatePresence>
              {draft.nav_links.links.length === 0 && (
                <EmptyState label="No navigation links yet" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSection('nav_links', [
                    ...draft.nav_links.links,
                    {
                      id: makeId('nav'),
                      label: 'New Link',
                      href: '/',
                      icon: '',
                      order: draft.nav_links.links.length,
                    },
                  ])
                }
                className="border-dashed text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Navigation Link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Footer Links ─── */}
        <TabsContent value="footer_links" className="outline-none">
          <div className="space-y-4">
            {FOOTER_COLUMNS.map((col) => {
              const colLinks = draft.footer_links.links.filter(
                (l) => l.column === col
              )
              return (
                <Card
                  key={col}
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
                            <LayoutGrid className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                            {col}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {colLinks.length} link{colLinks.length === 1 ? '' : 's'} in this column
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = draft.footer_links.links.slice()
                            next.push({
                              id: makeId('ftr'),
                              column: col,
                              label: 'New Link',
                              href: '/',
                              order: colLinks.length,
                            })
                            updateSection('footer_links', next)
                          }}
                          className="border-dashed text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Add to {col}
                        </Button>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence initial={false}>
                      {colLinks.map((link, i) => {
                        // Find the absolute index in the parent array (for swap ops)
                        const absIdx = draft.footer_links.links.findIndex(
                          (l) => l.id === link.id
                        )
                        const prevInCol = colLinks[i - 1]
                        const nextInCol = colLinks[i + 1]
                        return (
                          <FooterRow
                            key={link.id}
                            link={link}
                            index={i}
                            total={colLinks.length}
                            canMoveUp={!!prevInCol}
                            canMoveDown={!!nextInCol}
                            onChange={(next) => {
                              const links = draft.footer_links.links.slice()
                              links[absIdx] = next
                              updateSection('footer_links', links)
                            }}
                            onMoveUp={() => {
                              if (!prevInCol) return
                              const links = draft.footer_links.links.slice()
                              const prevAbs = links.findIndex(
                                (l) => l.id === prevInCol.id
                              )
                              // Swap the two sibling links (and their order)
                              const tmpOrder = links[absIdx].order
                              links[absIdx] = { ...links[absIdx], order: links[prevAbs].order }
                              links[prevAbs] = { ...links[prevAbs], order: tmpOrder }
                              // swap positions in array so swaps are visible
                              const tmp = links[absIdx]
                              links[absIdx] = links[prevAbs]
                              links[prevAbs] = tmp
                              updateSection('footer_links', links)
                            }}
                            onMoveDown={() => {
                              if (!nextInCol) return
                              const links = draft.footer_links.links.slice()
                              const nextAbs = links.findIndex(
                                (l) => l.id === nextInCol.id
                              )
                              const tmpOrder = links[absIdx].order
                              links[absIdx] = { ...links[absIdx], order: links[nextAbs].order }
                              links[nextAbs] = { ...links[nextAbs], order: tmpOrder }
                              const tmp = links[absIdx]
                              links[absIdx] = links[nextAbs]
                              links[nextAbs] = tmp
                              updateSection('footer_links', links)
                            }}
                            onDelete={() => {
                              const links = draft.footer_links.links.slice()
                              links.splice(absIdx, 1)
                              updateSection('footer_links', links)
                            }}
                            onColumnChange={(newCol) => {
                              const links = draft.footer_links.links.slice()
                              links[absIdx] = { ...links[absIdx], column: newCol, order: 0 }
                              updateSection('footer_links', links)
                            }}
                          />
                        )
                      })}
                    </AnimatePresence>
                    {colLinks.length === 0 && (
                      <EmptyState
                        label={`No links in ${col} column yet`}
                        compact
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
            <div className="flex justify-end pt-1">
              <SectionSaveButton
                section="footer_links"
                saving={savingSection === 'footer_links'}
                dirty={dirtyCounts.footer_links > 0}
                onSave={() => saveSection('footer_links')}
              />
            </div>
          </div>
        </TabsContent>

        {/* ─── Social Links ─── */}
        <TabsContent value="social_links" className="outline-none">
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
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Share2 className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                    Social Media Links
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Rendered as icon links in the footer. Leave URL blank to hide a platform.
                  </CardDescription>
                </div>
                <SectionSaveButton
                  section="social_links"
                  saving={savingSection === 'social_links'}
                  dirty={dirtyCounts.social_links > 0}
                  onSave={() => saveSection('social_links')}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence initial={false}>
                {draft.social_links.links.map((link, i) => (
                  <SocialRow
                    key={link.id}
                    link={link}
                    index={i}
                    total={draft.social_links.links.length}
                    onChange={(next) => {
                      const links = draft.social_links.links.slice()
                      links[i] = next
                      updateSection('social_links', links)
                    }}
                    onMoveUp={() =>
                      updateSection(
                        'social_links',
                        swap(draft.social_links.links, i, i - 1)
                      )
                    }
                    onMoveDown={() =>
                      updateSection(
                        'social_links',
                        swap(draft.social_links.links, i, i + 1)
                      )
                    }
                    onDelete={() => {
                      const links = draft.social_links.links.slice()
                      links.splice(i, 1)
                      updateSection('social_links', links)
                    }}
                  />
                ))}
              </AnimatePresence>
              {draft.social_links.links.length === 0 && (
                <EmptyState label="No social links configured" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSection('social_links', [
                    ...draft.social_links.links,
                    {
                      id: makeId('soc'),
                      platform: 'GitHub',
                      url: '',
                      icon: 'github',
                    },
                  ])
                }
                className="border-dashed text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Social Link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CTA Links ─── */}
        <TabsContent value="cta_links" className="outline-none">
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
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" style={{ color: 'var(--gg-vermillion)' }} />
                    CTA Links
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Key call-to-action buttons used across the homepage, hero, and partner pages.
                  </CardDescription>
                </div>
                <SectionSaveButton
                  section="cta_links"
                  saving={savingSection === 'cta_links'}
                  dirty={dirtyCounts.cta_links > 0}
                  onSave={() => saveSection('cta_links')}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence initial={false}>
                {draft.cta_links.links.map((link, i) => (
                  <CtaRow
                    key={link.id}
                    link={link}
                    index={i}
                    total={draft.cta_links.links.length}
                    onChange={(next) => {
                      const links = draft.cta_links.links.slice()
                      links[i] = next
                      updateSection('cta_links', links)
                    }}
                    onDelete={() => {
                      const links = draft.cta_links.links.slice()
                      links.splice(i, 1)
                      updateSection('cta_links', links)
                    }}
                  />
                ))}
              </AnimatePresence>
              {draft.cta_links.links.length === 0 && (
                <EmptyState label="No CTA links configured" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSection('cta_links', [
                    ...draft.cta_links.links,
                    {
                      id: makeId('cta'),
                      key: `cta_${Date.now().toString(36)}`,
                      label: 'New CTA',
                      href: '/',
                    },
                  ])
                }
                className="border-dashed text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add CTA Link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Section Save button (used inside each section's Card header)
// ═══════════════════════════════════════════════════════════════════════════
function SectionSaveButton({
  section,
  saving,
  dirty,
  onSave,
}: {
  section: string
  saving: boolean
  dirty: boolean
  onSave: () => void
}) {
  return (
    <Button
      size="sm"
      onClick={onSave}
      disabled={saving}
      className="text-white hover:opacity-90 disabled:opacity-40"
      style={
        dirty
          ? { background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }
          : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
      }
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : dirty ? (
        <Save className="h-3.5 w-3.5 mr-1.5" />
      ) : (
        <Save className="h-3.5 w-3.5 mr-1.5 opacity-50" />
      )}
      {saving ? 'Saving…' : dirty ? `Save ${section.split('_')[0]}` : 'Saved'}
      {dirty && (
        <span
          className="ml-1 text-[9px] font-bold px-1 py-0.5 rounded-full leading-none"
          style={{
            background: 'color-mix(in srgb, var(--gg-amber) 20%, transparent)',
            color: 'var(--gg-amber)',
          }}
        >
          UNSAVED
        </span>
      )}
    </Button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Row handle — drag handle + up/down arrows + delete
// ═══════════════════════════════════════════════════════════════════════════
function RowControls({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
}: {
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <GripVertical
        className="h-4 w-4 text-muted-foreground/40 hidden sm:block"
        aria-hidden
      />
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp || index === 0}
        aria-label="Move up"
        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown || index === total - 1}
        aria-label="Move down"
        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <Separator orientation="vertical" className="h-5 mx-0.5" />
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete link"
        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-destructive transition-colors"
        style={{ ['--tw-bg-opacity' as string]: 1 }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Navigation link row
// ═══════════════════════════════════════════════════════════════════════════
function NavRow({
  link,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  link: NavLink
  index: number
  total: number
  onChange: (next: NavLink) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="rounded-lg border border-border/60 bg-background/30 hover:bg-background/50 transition-colors p-3 flex items-center gap-2"
    >
      <RowControls
        index={index}
        total={total}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      />
      <Badge
        variant="outline"
        className="text-[10px] font-mono px-1.5 py-0 leading-none border-border text-muted-foreground shrink-0"
      >
        {String(index + 1).padStart(2, '0')}
      </Badge>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_0.9fr] gap-2 min-w-0">
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Label
          </Label>
          <Input
            value={link.label}
            onChange={(e) => onChange({ ...link, label: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm"
            placeholder="Home"
          />
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Href
          </Label>
          <Input
            value={link.href}
            onChange={(e) => onChange({ ...link, href: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm font-mono"
            placeholder="/products"
          />
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Icon (optional)
          </Label>
          <Input
            value={link.icon || ''}
            onChange={(e) => onChange({ ...link, icon: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm font-mono"
            placeholder="home"
          />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Footer link row (with column selector)
// ═══════════════════════════════════════════════════════════════════════════
function FooterRow({
  link,
  index,
  total,
  canMoveUp,
  canMoveDown,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onColumnChange,
}: {
  link: FooterLink
  index: number
  total: number
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (next: FooterLink) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onColumnChange: (col: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="rounded-lg border border-border/60 bg-background/30 hover:bg-background/50 transition-colors p-3 flex items-center gap-2"
    >
      <RowControls
        index={index}
        total={total}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      />
      <Badge
        variant="outline"
        className="text-[10px] font-mono px-1.5 py-0 leading-none border-border text-muted-foreground shrink-0"
      >
        {String(index + 1).padStart(2, '0')}
      </Badge>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[0.8fr_1fr_1.4fr] gap-2 min-w-0">
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Column
          </Label>
          <Select
            value={link.column}
            onValueChange={onColumnChange}
          >
            <SelectTrigger className="h-8 bg-background border-border text-foreground text-sm">
              <SelectValue placeholder="Column" />
            </SelectTrigger>
            <SelectContent>
              {FOOTER_COLUMNS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              <SelectItem value="Custom">Custom…</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Label
          </Label>
          <Input
            value={link.label}
            onChange={(e) => onChange({ ...link, label: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm"
            placeholder="About"
          />
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Href
          </Label>
          <Input
            value={link.href}
            onChange={(e) => onChange({ ...link, href: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm font-mono"
            placeholder="/about"
          />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Social link row
// ═══════════════════════════════════════════════════════════════════════════
function SocialRow({
  link,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  link: SocialLink
  index: number
  total: number
  onChange: (next: SocialLink) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const isCustom = !SOCIAL_PLATFORMS.includes(link.platform as typeof SOCIAL_PLATFORMS[number])
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="rounded-lg border border-border/60 bg-background/30 hover:bg-background/50 transition-colors p-3 flex items-center gap-2"
    >
      <RowControls
        index={index}
        total={total}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      />
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[0.8fr_1.6fr_0.8fr] gap-2 min-w-0">
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Platform
          </Label>
          <Select
            value={isCustom ? 'Custom' : link.platform}
            onValueChange={(v) => {
              if (v === 'Custom') {
                onChange({ ...link, platform: '', icon: '' })
              } else {
                onChange({ ...link, platform: v, icon: v.toLowerCase().replace(/[ /]/g, '') })
              }
            }}
          >
            <SelectTrigger className="h-8 bg-background border-border text-foreground text-sm">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
              <SelectItem value="Custom">Custom…</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            URL
          </Label>
          <div className="relative">
            <Input
              value={link.url}
              onChange={(e) => onChange({ ...link, url: e.target.value })}
              className="h-8 bg-background border-border text-foreground text-sm font-mono pr-8"
              placeholder="https://github.com/yourorg"
            />
            {link.url && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Open URL"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Icon (lucide)
          </Label>
          <Input
            value={link.icon || ''}
            onChange={(e) => onChange({ ...link, icon: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm font-mono"
            placeholder="github"
          />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA link row (key + label + href)
// ═══════════════════════════════════════════════════════════════════════════
function CtaRow({
  link,
  index,
  total,
  onChange,
  onDelete,
}: {
  link: CtaLink
  index: number
  total: number
  onChange: (next: CtaLink) => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="rounded-lg border border-border/60 bg-background/30 hover:bg-background/50 transition-colors p-3 flex items-center gap-2"
    >
      <div className="flex items-center gap-0.5 shrink-0">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 hidden sm:block" aria-hidden />
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete CTA"
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <Badge
        variant="outline"
        className="text-[10px] font-mono px-1.5 py-0 leading-none border-border text-muted-foreground shrink-0"
      >
        {String(index + 1).padStart(2, '0')}
      </Badge>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_1.4fr] gap-2 min-w-0">
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Key (machine)
          </Label>
          <Input
            value={link.key}
            onChange={(e) => onChange({ ...link, key: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm font-mono"
            placeholder="get_started"
          />
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Label
          </Label>
          <Input
            value={link.label}
            onChange={(e) => onChange({ ...link, label: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm"
            placeholder="Get Started"
          />
        </div>
        <div className="min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Href
          </Label>
          <Input
            value={link.href}
            onChange={(e) => onChange({ ...link, href: e.target.value })}
            className="h-8 bg-background border-border text-foreground text-sm font-mono"
            placeholder="/pricing"
          />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Empty state placeholder
// ═══════════════════════════════════════════════════════════════════════════
function EmptyState({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-10'}`}
    >
      <GripVertical className="h-6 w-6 text-muted-foreground/30 mb-2" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
