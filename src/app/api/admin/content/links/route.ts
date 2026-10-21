export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// ═══════════════════════════════════════════════════════════════════════════
// Link Management — ApexFlow Content Manager
// ═══════════════════════════════════════════════════════════════════════════
// Stores nav, footer, social and CTA links as JSON arrays in SiteSetting rows
// under category='content'. Defaults mirror the links hardcoded in
// src/components/shared/site-header.tsx and src/components/shared/site-footer.tsx
// so the admin sees the live set even before any override is saved.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Link row shapes ──────────────────────────────────────────────────────────
export interface NavLink {
  id: string
  label: string
  href: string
  icon?: string
  order: number
}
export interface FooterLink {
  id: string
  column: string
  label: string
  href: string
  order: number
}
export interface SocialLink {
  id: string
  platform: string
  url: string
  icon?: string
}
export interface CtaLink {
  id: string
  key: string
  label: string
  href: string
}

type LinkSection = 'nav_links' | 'footer_links' | 'social_links' | 'cta_links'

// ─── Default nav links (header) ───────────────────────────────────────────────
const DEFAULT_NAV_LINKS: NavLink[] = [
  { id: 'nav_home', label: 'Home', href: '/', icon: 'home', order: 0 },
  { id: 'nav_products', label: 'Products', href: '/products', icon: 'boxes', order: 1 },
  { id: 'nav_solutions', label: 'Solutions', href: '/solutions', icon: 'layers', order: 2 },
  { id: 'nav_industries', label: 'Industries', href: '/industries', icon: 'building2', order: 3 },
  { id: 'nav_pricing', label: 'Pricing', href: '/pricing', icon: 'tag', order: 4 },
  { id: 'nav_resources', label: 'Resources', href: '/resources', icon: 'bookopen', order: 5 },
  { id: 'nav_contact', label: 'Contact', href: '/contact', icon: 'mail', order: 6 },
]

// ─── Default footer links — grouped by column ─────────────────────────────────
const ERP_SLUGS = [
  'apparelflow',
  'hotelflow',
  'eduflow',
  'pharmaflow',
  'martflow',
  'buildflow',
  'travelflow',
  'tenantflow',
  'factoryflow',
  'foodflow',
  'autoflow',
  'healthflow',
  'textileflow',
  'creativeflow',
  'logisticflow',
  'distriflow',
  'electroflow',
  'fleetflow',
  'bookflow',
  'fuelflow',
  'salonflow',
]

const DEFAULT_FOOTER_LINKS: FooterLink[] = [
  // Company
  { id: 'ftr_about', column: 'Company', label: 'About', href: '/about', order: 0 },
  { id: 'ftr_careers', column: 'Company', label: 'Careers', href: '/careers', order: 1 },
  { id: 'ftr_blog', column: 'Company', label: 'Blog', href: '/blog', order: 2 },
  { id: 'ftr_contact', column: 'Company', label: 'Contact', href: '/contact', order: 3 },
  // Resources
  { id: 'ftr_docs', column: 'Resources', label: 'Documentation', href: '/resources', order: 0 },
  { id: 'ftr_api', column: 'Resources', label: 'API Reference', href: '/resources', order: 1 },
  { id: 'ftr_support', column: 'Resources', label: 'Support', href: '/contact', order: 2 },
  // Legal
  { id: 'ftr_privacy', column: 'Legal', label: 'Privacy', href: '/legal/privacy', order: 0 },
  { id: 'ftr_terms', column: 'Legal', label: 'Terms', href: '/legal/terms', order: 1 },
  { id: 'ftr_refund', column: 'Legal', label: 'Refund', href: '/legal/refund', order: 2 },
  // Products — list of all ERP systems (uses the slug-based ERP detail route)
  ...ERP_SLUGS.map<FooterLink>((slug, i) => ({
    id: `ftr_erp_${slug}`,
    column: 'Products',
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
    href: `/erp/${slug}`,
    order: i,
  })),
]

// ─── Default social media links ───────────────────────────────────────────────
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { id: 'soc_github', platform: 'GitHub', url: 'https://github.com/apexflowerp', icon: 'github' },
  { id: 'soc_twitter', platform: 'Twitter/X', url: '', icon: 'twitter' },
  { id: 'soc_linkedin', platform: 'LinkedIn', url: '', icon: 'linkedin' },
  { id: 'soc_facebook', platform: 'Facebook', url: '', icon: 'facebook' },
  { id: 'soc_instagram', platform: 'Instagram', url: '', icon: 'instagram' },
  { id: 'soc_youtube', platform: 'YouTube', url: '', icon: 'youtube' },
]

// ─── Default CTA links ────────────────────────────────────────────────────────
const DEFAULT_CTA_LINKS: CtaLink[] = [
  { id: 'cta_get_started', key: 'get_started', label: 'Get Started', href: '/pricing' },
  { id: 'cta_explore_products', key: 'explore_products', label: 'Explore Products', href: '/products' },
  { id: 'cta_contact_sales', key: 'contact_sales', label: 'Contact Sales', href: '/contact' },
  { id: 'cta_become_partner', key: 'become_partner', label: 'Become a Partner', href: '/become-partner' },
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────
const DEFAULTS: Record<LinkSection, unknown[]> = {
  nav_links: DEFAULT_NAV_LINKS,
  footer_links: DEFAULT_FOOTER_LINKS,
  social_links: DEFAULT_SOCIAL_LINKS,
  cta_links: DEFAULT_CTA_LINKS,
}

const LINK_GROUPS: Record<LinkSection, string> = {
  nav_links: 'navigation',
  footer_links: 'footer',
  social_links: 'social',
  cta_links: 'cta',
}

const LINK_DESCRIPTIONS: Record<LinkSection, string> = {
  nav_links: 'Header navigation links — managed by Content Manager / Links & Navigation',
  footer_links: 'Footer links grouped by column — managed by Content Manager / Links & Navigation',
  social_links: 'Social media profile links — managed by Content Manager / Links & Navigation',
  cta_links: 'Key call-to-action buttons across the site — managed by Content Manager / Links & Navigation',
}

// ─── GET: return all four link arrays, merged over defaults ──────────────────
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  try {
    const rows = await withRetry((db) =>
      db.siteSetting.findMany({
        where: {
          category: 'content',
          key: {
            in: ['nav_links', 'footer_links', 'social_links', 'cta_links'],
          },
        },
        select: { key: true, value: true, updatedAt: true },
      })
    )

    const savedByKey = new Map(rows.map((r) => [r.key, r]))

    const out: Record<LinkSection, { links: unknown[]; saved: boolean; updatedAt?: string }> = {
      nav_links: { links: DEFAULT_NAV_LINKS, saved: false },
      footer_links: { links: DEFAULT_FOOTER_LINKS, saved: false },
      social_links: { links: DEFAULT_SOCIAL_LINKS, saved: false },
      cta_links: { links: DEFAULT_CTA_LINKS, saved: false },
    }

    for (const key of Object.keys(DEFAULTS) as LinkSection[]) {
      const row = savedByKey.get(key)
      if (!row) continue
      try {
        const parsed = JSON.parse(row.value)
        if (Array.isArray(parsed)) {
          out[key] = {
            links: parsed,
            saved: true,
            updatedAt: row.updatedAt.toISOString(),
          }
        }
      } catch {
        // ignore malformed JSON — caller falls back to defaults
      }
    }

    return NextResponse.json({
      nav_links: out.nav_links,
      footer_links: out.footer_links,
      social_links: out.social_links,
      cta_links: out.cta_links,
    })
  } catch (error) {
    console.error('[CONTENT/LINKS] Failed to fetch:', error)
    // Fall back to defaults when the DB is unavailable (e.g. Neon cold start).
    return NextResponse.json({
      nav_links: { links: DEFAULT_NAV_LINKS, saved: false },
      footer_links: { links: DEFAULT_FOOTER_LINKS, saved: false },
      social_links: { links: DEFAULT_SOCIAL_LINKS, saved: false },
      cta_links: { links: DEFAULT_CTA_LINKS, saved: false },
      dbWarning: 'Database unavailable — showing default links',
    })
  }
}

// ─── POST: upsert a single link section ──────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  try {
    const body = (await request.json()) as {
      section: LinkSection
      links: unknown[]
    }

    if (!body.section || !(body.section in DEFAULTS)) {
      return NextResponse.json(
        { error: 'Invalid section. Must be one of nav_links, footer_links, social_links, cta_links.' },
        { status: 400 }
      )
    }
    if (!Array.isArray(body.links)) {
      return NextResponse.json({ error: 'links must be an array' }, { status: 400 })
    }

    // Serialize + validate JSON.
    let serialized: string
    try {
      serialized = JSON.stringify(body.links)
    } catch {
      return NextResponse.json({ error: 'Links payload is not serializable' }, { status: 400 })
    }
    // Round-trip check — guards against non-JSON values inside the array.
    try {
      JSON.parse(serialized)
    } catch {
      return NextResponse.json({ error: 'Links payload is not valid JSON' }, { status: 400 })
    }

    const section = body.section
    const upserted = await withRetry((db) =>
      db.siteSetting.upsert({
        where: { key: section },
        update: {
          value: serialized,
          category: 'content',
          group: LINK_GROUPS[section],
          description: LINK_DESCRIPTIONS[section],
        },
        create: {
          key: section,
          value: serialized,
          category: 'content',
          group: LINK_GROUPS[section],
          description: LINK_DESCRIPTIONS[section],
        },
      })
    )

    return NextResponse.json({
      ok: true,
      section: upserted.key,
      links: body.links,
      updatedAt: upserted.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[CONTENT/LINKS] Failed to upsert:', error)
    return NextResponse.json({ error: 'Failed to save links' }, { status: 500 })
  }
}

// ─── DELETE: reset a single section to defaults ──────────────────────────────
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') as LinkSection | null

    if (!section || !(section in DEFAULTS)) {
      return NextResponse.json(
        { error: 'Invalid section. Must be one of nav_links, footer_links, social_links, cta_links.' },
        { status: 400 }
      )
    }

    // Removing the override row reverts the section to defaults on the next GET.
    await withRetry((db) =>
      db.siteSetting
        .delete({ where: { key: section } })
        .catch(() => {
          /* ignore "not found" — row may simply not exist yet */
        })
    )

    return NextResponse.json({ deleted: section, reset: true })
  } catch (error) {
    console.error('[CONTENT/LINKS] Failed to reset:', error)
    return NextResponse.json({ error: 'Failed to reset section' }, { status: 500 })
  }
}
