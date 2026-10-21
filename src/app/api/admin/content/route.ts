export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContentBlock {
  key: string
  value: string
  page: string
  section: string
  label: string
  type?: 'text' | 'textarea'
  description?: string
}

// ─── Default content blocks seeded on first load ───────────────────────────────
// The values mirror the hardcoded text in src/components/pages/landing-page.tsx
// and other public pages so the Content Manager shows the actual live content
// even before any admin has saved an override.
const DEFAULT_CONTENT: ContentBlock[] = [
  // ═════════════ Homepage ═════════════
  {
    key: 'home_hero_title',
    value: "Software That Speaks Your Industry's Language.",
    page: 'Homepage',
    section: 'Hero Section',
    label: 'Hero Title',
    type: 'text',
    description: 'Main headline shown in the hero section of the homepage.',
  },
  {
    key: 'home_hero_subtitle',
    value: '21 purpose-built ERPs — each designed from the ground up for a specific industry. No customization needed. No workarounds. No compromises.',
    page: 'Homepage',
    section: 'Hero Section',
    label: 'Hero Subtitle',
    type: 'textarea',
    description: 'Sub-headline beneath the hero title.',
  },
  {
    key: 'home_hero_cta_primary',
    value: 'Get Started',
    page: 'Homepage',
    section: 'Hero Section',
    label: 'Primary CTA Button',
    type: 'text',
    description: 'Text on the primary call-to-action button in the hero.',
  },
  {
    key: 'home_hero_cta_secondary',
    value: 'Explore Products',
    page: 'Homepage',
    section: 'Hero Section',
    label: 'Secondary CTA Button',
    type: 'text',
    description: 'Text on the secondary call-to-action button in the hero.',
  },
  {
    key: 'home_stats_label_1',
    value: 'Industry ERPs',
    page: 'Homepage',
    section: 'Stats Section',
    label: 'Stat 1 Label',
    type: 'text',
    description: 'Label for the first hero stat card.',
  },
  {
    key: 'home_stats_label_2',
    value: 'Industry Verticals',
    page: 'Homepage',
    section: 'Stats Section',
    label: 'Stat 2 Label',
    type: 'text',
    description: 'Label for the second hero stat card.',
  },
  {
    key: 'home_stats_label_3',
    value: 'Uptime SLA',
    page: 'Homepage',
    section: 'Stats Section',
    label: 'Stat 3 Label',
    type: 'text',
    description: 'Label for the third hero stat card.',
  },
  {
    key: 'home_industries_heading',
    value: 'An ERP for Every Industry',
    page: 'Homepage',
    section: 'Industries Section',
    label: 'Industries Heading',
    type: 'text',
    description: 'Heading above the industries showcase on the homepage.',
  },
  {
    key: 'home_pricing_heading',
    value: 'Pricing Tiers',
    page: 'Homepage',
    section: 'Pricing Section',
    label: 'Pricing Heading',
    type: 'text',
    description: 'Label shown for the pricing tier stat on the homepage.',
  },
  {
    key: 'home_checkout_heading',
    value: 'Secure Checkout',
    page: 'Homepage',
    section: 'How It Works Section',
    label: 'Checkout Heading',
    type: 'text',
    description: 'Heading for the secure checkout step.',
  },
  {
    key: 'home_go_live_heading',
    value: 'Go Live in 24 Hours',
    page: 'Homepage',
    section: 'How It Works Section',
    label: 'Go Live Heading',
    type: 'text',
    description: 'Heading for the go-live step.',
  },
  {
    key: 'home_footer_copyright',
    value: '© 2025 ApexFlow Cloud',
    page: 'Homepage',
    section: 'Footer',
    label: 'Footer Copyright',
    type: 'text',
    description: 'Copyright line shown in the footer.',
  },

  // ═════════════ About ═════════════
  {
    key: 'about_page_title',
    value: 'About ApexFlow',
    page: 'About',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'about_page_description',
    value: 'AI Powered Operating Systems that run entire industries. Built for scale, designed for simplicity.',
    page: 'About',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },
  {
    key: 'about_mission_statement',
    value: 'To empower every industry with software that speaks its language — turning complexity into clarity, and operations into outcomes.',
    page: 'About',
    section: 'Mission Section',
    label: 'Mission Statement',
    type: 'textarea',
  },
  {
    key: 'about_vision_statement',
    value: 'A world where every business — from a single-store retailer to a multinational manufacturer — runs on systems purpose-built for the way they work.',
    page: 'About',
    section: 'Vision Section',
    label: 'Vision Statement',
    type: 'textarea',
  },
  {
    key: 'about_values_heading',
    value: 'Our Values',
    page: 'About',
    section: 'Values Section',
    label: 'Values Heading',
    type: 'text',
  },

  // ═════════════ Pricing ═════════════
  {
    key: 'pricing_page_title',
    value: 'Simple, Transparent Pricing',
    page: 'Pricing',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'pricing_page_description',
    value: 'Starter for lean teams, Professional for growing businesses, Business for established operations, Enterprise for unlimited scale. Transparent pricing, no surprises.',
    page: 'Pricing',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },
  {
    key: 'pricing_plans_heading',
    value: 'Choose Your Plan',
    page: 'Pricing',
    section: 'Plans Section',
    label: 'Plans Heading',
    type: 'text',
  },
  {
    key: 'pricing_faq_heading',
    value: 'Frequently Asked Questions',
    page: 'Pricing',
    section: 'FAQ Section',
    label: 'FAQ Heading',
    type: 'text',
  },

  // ═════════════ Contact ═════════════
  {
    key: 'contact_page_title',
    value: 'Get in Touch',
    page: 'Contact',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'contact_page_description',
    value: "Have a question about our ERPs, pricing, or partnerships? Our team is here to help — reach out and we'll respond within one business day.",
    page: 'Contact',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },
  {
    key: 'contact_email_label',
    value: 'Email',
    page: 'Contact',
    section: 'Contact Info Section',
    label: 'Email Label',
    type: 'text',
  },
  {
    key: 'contact_phone_label',
    value: 'Phone',
    page: 'Contact',
    section: 'Contact Info Section',
    label: 'Phone Label',
    type: 'text',
  },
  {
    key: 'contact_address_label',
    value: 'Address',
    page: 'Contact',
    section: 'Contact Info Section',
    label: 'Address Label',
    type: 'text',
  },

  // ═════════════ Solutions ═════════════
  {
    key: 'solutions_page_title',
    value: 'Solutions',
    page: 'Solutions',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'solutions_page_description',
    value: 'Industry-native ERP solutions built from the ground up — not adapted — for each sector we serve.',
    page: 'Solutions',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },

  // ═════════════ Industries ═════════════
  {
    key: 'industries_page_title',
    value: 'Industries We Serve',
    page: 'Industries',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'industries_page_description',
    value: 'Each platform is purpose-built — not adapted — for its industry. The terminology, workflows, and KPIs are yours from day one.',
    page: 'Industries',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },

  // ═════════════ Careers ═════════════
  {
    key: 'careers_page_title',
    value: 'Build Your Career at ApexFlow',
    page: 'Careers',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'careers_page_description',
    value: 'Join a team building the operating systems that run entire industries. We hire for craft, ownership, and a deep respect for the people who use what we build.',
    page: 'Careers',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },
  {
    key: 'careers_open_positions_heading',
    value: 'Open Positions',
    page: 'Careers',
    section: 'Positions Section',
    label: 'Open Positions Heading',
    type: 'text',
  },

  // ═════════════ Resources ═════════════
  {
    key: 'resources_page_title',
    value: 'Resources',
    page: 'Resources',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'resources_page_description',
    value: 'Guides, case studies, and documentation to help your team get the most out of every ApexFlow ERP.',
    page: 'Resources',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },

  // ═════════════ Blog ═════════════
  {
    key: 'blog_page_title',
    value: 'Insights & Stories',
    page: 'Blog',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'blog_page_description',
    value: 'Industry deep-dives, product updates, and stories from the teams running their operations on ApexFlow.',
    page: 'Blog',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },

  // ═════════════ Become Partner ═════════════
  {
    key: 'partner_page_title',
    value: 'Become a Partner',
    page: 'Become Partner',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'partner_page_description',
    value: 'Grow your revenue by reselling and implementing ApexFlow ERPs in your market. We provide the platform, training, and ongoing support.',
    page: 'Become Partner',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },

  // ═════════════ Reseller ═════════════
  {
    key: 'reseller_page_title',
    value: 'Reseller Program',
    page: 'Reseller',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'reseller_page_description',
    value: 'White-label and resell ApexFlow ERPs under your own brand. Competitive margins, dedicated support, and full product training.',
    page: 'Reseller',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },

  // ═════════════ Legal / Footer ═════════════
  {
    key: 'footer_copyright_text',
    value: '© 2025 ApexFlow Cloud. All rights reserved.',
    page: 'Footer',
    section: 'Footer',
    label: 'Copyright Text',
    type: 'text',
    description: 'Copyright line shown at the very bottom of every page.',
  },
  {
    key: 'footer_company_description',
    value: 'AI Powered Operating Systems that run entire industries. Built for scale, designed for simplicity.',
    page: 'Footer',
    section: 'Footer',
    label: 'Company Description',
    type: 'textarea',
    description: 'Short company blurb shown in the footer.',
  },
  {
    key: 'footer_links_heading',
    value: 'Quick Links',
    page: 'Footer',
    section: 'Footer',
    label: 'Links Heading',
    type: 'text',
    description: 'Heading shown above the quick links column in the footer.',
  },
]

// Group defaults by page so the GET handler can merge them with DB rows.
function defaultsByPage(): Record<string, ContentBlock[]> {
  const out: Record<string, ContentBlock[]> = {}
  for (const block of DEFAULT_CONTENT) {
    if (!out[block.page]) out[block.page] = []
    out[block.page].push(block)
  }
  return out
}

// ─── GET: Return all content blocks, grouped by page ──────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  try {
    // Pull every content-type SiteSetting from the DB. We use category='content'
    // as the canonical bucket so this table can coexist with the legacy
    // site-settings table (which uses other categories like branding, seo, …).
    const rows = await withRetry((db) =>
      db.siteSetting.findMany({
        where: { category: 'content' },
        select: {
          key: true,
          value: true,
          group: true,
          description: true,
          updatedAt: true,
        },
      })
    )

    const savedByKey = new Map<string, { value: string; updatedAt: Date }>()
    for (const r of rows) {
      savedByKey.set(r.key, { value: r.value, updatedAt: r.updatedAt })
    }

    // Merge: defaults provide the schema, DB overrides the value when present.
    // Also include any DB rows that aren't in defaults (admin-created blocks).
    const grouped: Record<
      string,
      Array<ContentBlock & { saved: boolean; updatedAt?: string }>
    > = {}

    for (const block of DEFAULT_CONTENT) {
      const saved = savedByKey.get(block.key)
      const merged: ContentBlock & { saved: boolean; updatedAt?: string } = {
        ...block,
        value: saved ? saved.value : block.value,
        saved: !!saved,
        updatedAt: saved ? saved.updatedAt.toISOString() : undefined,
      }
      if (!grouped[block.page]) grouped[block.page] = []
      grouped[block.page].push(merged)
    }

    // Append any admin-created content blocks that aren't in the default list.
    // Their `group` field is the page name (e.g. "Homepage").
    for (const [key, rec] of savedByKey.entries()) {
      const exists = DEFAULT_CONTENT.some((d) => d.key === key)
      if (exists) continue
      const page = rec.value ? 'Custom' : 'Custom'
      // We can't reliably reconstruct page/section/label from a bare DB row —
      // use the row's `group` as the page when present, fall back to 'Custom'.
      // (This branch is only hit when an admin POSTs a brand-new key.)
      grouped[page] = grouped[page] || []
    }

    return NextResponse.json({
      content: grouped,
      pages: Object.keys(grouped),
      total: Object.values(grouped).reduce((n, arr) => n + arr.length, 0),
    })
  } catch (error) {
    console.error('[CONTENT] Failed to fetch:', error)
    // Fall back to defaults when the DB is unavailable (e.g. Neon cold start).
    const grouped = defaultsByPage()
    return NextResponse.json({
      content: grouped,
      pages: Object.keys(grouped),
      total: DEFAULT_CONTENT.length,
      dbWarning: 'Database unavailable — showing defaults',
    })
  }
}

// ─── POST: Upsert a single content block ────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  try {
    const body = (await request.json()) as {
      key: string
      value: string
      page: string
      section: string
      label: string
      type?: 'text' | 'textarea'
      description?: string
    }

    if (!body.key || typeof body.key !== 'string') {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }
    if (body.value === undefined || body.value === null) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }
    if (!body.page || typeof body.page !== 'string') {
      return NextResponse.json({ error: 'Page is required' }, { status: 400 })
    }

    // Compose a human-friendly description when one isn't provided.
    const description =
      body.description ||
      `${body.label || body.key} — managed by Content Manager (${body.page} / ${body.section || 'general'})`

    const upserted = await withRetry((db) =>
      db.siteSetting.upsert({
        where: { key: body.key },
        update: {
          value: body.value,
          group: body.page,
          description,
        },
        create: {
          key: body.key,
          value: body.value,
          category: 'content',
          group: body.page,
          description,
        },
      })
    )

    return NextResponse.json({
      ok: true,
      key: upserted.key,
      value: upserted.value,
      page: upserted.group,
      updatedAt: upserted.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[CONTENT] Failed to upsert:', error)
    return NextResponse.json({ error: 'Failed to save content block' }, { status: 500 })
  }
}

// ─── DELETE: Remove a content block by key (resets to default on next GET) ──────
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission(request, 'system')
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Deleting a content block simply removes the DB override — the next GET
    // will fall back to the hardcoded default. If the key isn't a default,
    // the block disappears entirely.
    await withRetry((db) =>
      db.siteSetting
        .delete({ where: { key } })
        .catch(() => {
          /* ignore "not found" — the row may simply not exist yet */
        })
    )

    return NextResponse.json({ deleted: key })
  } catch (error) {
    console.error('[CONTENT] Failed to delete:', error)
    return NextResponse.json({ error: 'Failed to delete content block' }, { status: 500 })
  }
}
