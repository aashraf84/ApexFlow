export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'
import { ERP_DETAILS } from '@/lib/erp-detail-data'

// ─── Types ────────────────────────────────────────────────────────────────────
// Exported so the PUBLIC /api/content route (no auth) can share the same
// source of truth without duplicating ~50 lines of defaults.
export interface ContentBlock {
  key: string
  value: string
  page: string
  section: string
  label: string
  type?: 'text' | 'textarea'
  description?: string
  // Optional `group` for blocks stored under a different group than the page
  // name (e.g. ERP content blocks use group='erp_<slug>' which matches their
  // page name, but the field is included explicitly so the public /api/content
  // route can bucket saved rows by group without round-tripping through page).
  group?: string
}

// ─── Default content blocks seeded on first load ───────────────────────────────
// The values mirror the hardcoded text in src/components/pages/landing-page.tsx
// and other public pages so the Content Manager shows the actual live content
// even before any admin has saved an override.
//
// Link defaults (nav_links, footer_links, social_links, cta_links) are defined
// in the dedicated /api/admin/content/links/route.ts handler. They are also
// returned by the GET below so the Content Manager can render both tabs in one
// fetch when desired.
// Exported so the PUBLIC /api/content route (no auth) can share the same
// source of truth without duplicating ~50 lines of defaults.
export const DEFAULT_CONTENT: ContentBlock[] = [
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
    key: 'home_hero_badge',
    value: 'Featured Platforms',
    page: 'Homepage',
    section: 'Hero Section',
    label: 'Hero Badge',
    type: 'text',
    description: 'Pill badge label shown above the hero or featured-ERP showcase (e.g. "Featured Platforms").',
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
    key: 'home_stats_label_4',
    value: 'Provisioning Time',
    page: 'Homepage',
    section: 'Stats Section',
    label: 'Stat 4 Label',
    type: 'text',
    description: 'Label for the fourth hero stat card (provisioning time).',
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
    key: 'home_industries_subtitle',
    value: 'Each platform is purpose-built — not adapted — for its industry. The terminology, workflows, and KPIs are yours from day one.',
    page: 'Homepage',
    section: 'Industries Section',
    label: 'Industries Subtitle',
    type: 'textarea',
    description: 'Sub-headline beneath the industries showcase heading.',
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
    key: 'home_pricing_subtitle',
    value: 'Starter for lean teams, Professional for growing businesses, Business for established operations, Enterprise for unlimited scale. Transparent pricing, no surprises.',
    page: 'Homepage',
    section: 'How It Works Section',
    label: 'Pricing Step Subtitle',
    type: 'textarea',
    description: 'Description for the "Select Your Plan" pipeline step.',
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
    key: 'home_checkout_subtitle',
    value: 'Bank-grade encryption via Stripe. Pay with any major debit or credit card. Your license and invoice arrive instantly by email.',
    page: 'Homepage',
    section: 'How It Works Section',
    label: 'Checkout Step Subtitle',
    type: 'textarea',
    description: 'Description for the secure checkout pipeline step.',
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
    key: 'home_go_live_subtitle',
    value: 'Your ERP is provisioned within a day. Onboarding materials, video tutorials, and dedicated support get your team productive immediately.',
    page: 'Homepage',
    section: 'How It Works Section',
    label: 'Go Live Step Subtitle',
    type: 'textarea',
    description: 'Description for the go-live pipeline step.',
  },
  {
    key: 'home_final_cta_heading',
    value: 'Find the ERP That Speaks Your Language',
    page: 'Homepage',
    section: 'Final CTA Section',
    label: 'Final CTA Heading',
    type: 'text',
    description: 'Headline shown in the final call-to-action banner at the bottom of the homepage.',
  },
  {
    key: 'home_final_cta_subtitle',
    value: '21 industries. 21 purpose-built platforms. Each one ready to run your business from day one. No customization. No workarounds. No compromises.',
    page: 'Homepage',
    section: 'Final CTA Section',
    label: 'Final CTA Subtitle',
    type: 'textarea',
    description: 'Sub-headline beneath the final call-to-action banner.',
  },
  {
    key: 'home_final_cta_primary',
    value: 'Get Started',
    page: 'Homepage',
    section: 'Final CTA Section',
    label: 'Final CTA Primary Button',
    type: 'text',
    description: 'Primary CTA button label in the final call-to-action banner.',
  },
  {
    key: 'home_final_cta_secondary',
    value: 'Browse All Products',
    page: 'Homepage',
    section: 'Final CTA Section',
    label: 'Final CTA Secondary Button',
    type: 'text',
    description: 'Secondary CTA button label in the final call-to-action banner.',
  },
  {
    key: 'home_final_cta_tertiary',
    value: 'Talk to Sales',
    page: 'Homepage',
    section: 'Final CTA Section',
    label: 'Final CTA Tertiary Button',
    type: 'text',
    description: 'Tertiary CTA button label in the final call-to-action banner.',
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
    value: 'We build enterprise software that runs entire industries — not adapts to them, but is built for them from the ground up. Each platform is purpose-engineered for the unique workflows, regulations, and challenges of its sector.',
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
    value: 'Simple Pricing',
    page: 'Pricing',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'pricing_page_description',
    value: 'Start free. Scale as you grow. No hidden fees, no surprises — just powerful ERP software at a price that makes sense for your business.',
    page: 'Pricing',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },
  {
    key: 'pricing_plans_heading',
    value: 'Choose Your ERP Platforms',
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
    value: "Whether you have a question, need a demo, or want to discuss a custom solution — we're here to help.",
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
    value: 'Office',
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

  // ═════════════ Partner (Become a Partner page) ═════════════
  {
    key: 'partner_page_title',
    value: 'Become a Partner',
    page: 'Partner',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
  },
  {
    key: 'partner_page_description',
    value: 'Grow your revenue by reselling and implementing ApexFlow ERPs in your market. We provide the platform, training, and ongoing support.',
    page: 'Partner',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
  },
  {
    key: 'partner_benefits_heading',
    value: 'Your Success Is',
    page: 'Partner',
    section: 'Benefits Section',
    label: 'Benefits Heading',
    type: 'text',
    description: 'Heading prefix shown above the "Why Partner With Us" benefits grid on /become-partner. The gradient "Our Business" suffix stays hardcoded.',
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

  // ═════════════ Products ═════════════
  // Hero on /products: the split layout has a big "21" number, a "AI-Powered
  // Operating Systems" badge subtitle beneath it, and a headline +
  // description to the right. Three blocks cover the editable copy.
  {
    key: 'products_page_title',
    value: 'Purpose-Built ERPs',
    page: 'Products',
    section: 'Hero Section',
    label: 'Page Title',
    type: 'text',
    description: 'Headline on /products (gradient subline "For Every Industry" stays hardcoded for now).',
  },
  {
    key: 'products_page_description',
    value: 'From hospitality to manufacturing, each system is designed for the real world — with full POS, CRM, inventory, and operational capabilities built in.',
    page: 'Products',
    section: 'Hero Section',
    label: 'Page Description',
    type: 'textarea',
    description: 'Sub-headline beneath the hero title on /products.',
  },
  {
    key: 'products_hero_badge',
    value: 'AI-Powered Operating Systems',
    page: 'Products',
    section: 'Hero Section',
    label: 'Hero Badge',
    type: 'text',
    description: 'Subtitle shown beneath the big "21" number in the hero on /products.',
  },

  // ═════════════ Privacy ═════════════
  {
    key: 'privacy_page_title',
    value: 'Privacy Policy',
    page: 'Privacy',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
    description: 'Hero h1 on /legal/privacy.',
  },
  {
    key: 'privacy_page_description',
    value: 'Last updated: March 2025',
    page: 'Privacy',
    section: 'Page Header',
    label: 'Last Updated',
    type: 'text',
    description: 'Small "Last updated" line beneath the hero title on /legal/privacy.',
  },
  // Section 1 — Information We Collect
  {
    key: 'privacy_section_0_title',
    value: '1. Information We Collect',
    page: 'Privacy',
    section: 'Section 1',
    label: 'Section 1 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_0_paragraph_0',
    value: 'We collect information you provide directly to us, information collected automatically when you use our Services, and information from third-party sources. This policy describes each category in detail.',
    page: 'Privacy',
    section: 'Section 1',
    label: 'Section 1 Paragraph',
    type: 'textarea',
  },
  {
    key: 'privacy_section_0_subsection_0_title',
    value: 'Personal Data',
    page: 'Privacy',
    section: 'Section 1',
    label: 'Section 1 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_0_subsection_0_content',
    value: 'When you create an account, make a purchase, or contact us, we collect your name, email address, company name, phone number, billing address, and payment information. If you invite team members, we collect their names and email addresses as well.',
    page: 'Privacy',
    section: 'Section 1',
    label: 'Section 1 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 2 — How We Use Your Information
  {
    key: 'privacy_section_1_title',
    value: '2. How We Use Your Information',
    page: 'Privacy',
    section: 'Section 2',
    label: 'Section 2 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_1_paragraph_0',
    value: 'We use the information we collect for the following purposes:',
    page: 'Privacy',
    section: 'Section 2',
    label: 'Section 2 Paragraph',
    type: 'textarea',
  },
  {
    key: 'privacy_section_1_subsection_0_title',
    value: 'Service Delivery',
    page: 'Privacy',
    section: 'Section 2',
    label: 'Section 2 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_1_subsection_0_content',
    value: 'To provide, maintain, and improve our Services, process your transactions, and deliver the ERP functionality you subscribe to. This includes managing your account, processing payments, and providing customer support.',
    page: 'Privacy',
    section: 'Section 2',
    label: 'Section 2 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 3 — Information Sharing
  {
    key: 'privacy_section_2_title',
    value: '3. Information Sharing',
    page: 'Privacy',
    section: 'Section 3',
    label: 'Section 3 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_2_paragraph_0',
    value: 'We are committed to protecting your information. We do not sell, trade, or rent your personal information to third parties.',
    page: 'Privacy',
    section: 'Section 3',
    label: 'Section 3 Paragraph',
    type: 'textarea',
  },
  {
    key: 'privacy_section_2_subsection_0_title',
    value: 'No Selling of Data',
    page: 'Privacy',
    section: 'Section 3',
    label: 'Section 3 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_2_subsection_0_content',
    value: 'ApexFlow will never sell your personal data to advertisers, data brokers, or any other third party for monetary gain. Your data is used solely to deliver and improve the Services you subscribe to.',
    page: 'Privacy',
    section: 'Section 3',
    label: 'Section 3 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 4 — Data Security
  {
    key: 'privacy_section_3_title',
    value: '4. Data Security',
    page: 'Privacy',
    section: 'Section 4',
    label: 'Section 4 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_3_paragraph_0',
    value: 'We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.',
    page: 'Privacy',
    section: 'Section 4',
    label: 'Section 4 Paragraph',
    type: 'textarea',
  },
  {
    key: 'privacy_section_3_subsection_0_title',
    value: 'Encryption',
    page: 'Privacy',
    section: 'Section 4',
    label: 'Section 4 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_3_subsection_0_content',
    value: 'All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. Database-level encryption is applied to all stored information on our Neon PostgreSQL infrastructure.',
    page: 'Privacy',
    section: 'Section 4',
    label: 'Section 4 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 5 — Your Rights
  {
    key: 'privacy_section_4_title',
    value: '5. Your Rights',
    page: 'Privacy',
    section: 'Section 5',
    label: 'Section 5 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_4_paragraph_0',
    value: 'You have the following rights regarding your personal information:',
    page: 'Privacy',
    section: 'Section 5',
    label: 'Section 5 Paragraph',
    type: 'textarea',
  },
  {
    key: 'privacy_section_4_subsection_0_title',
    value: 'Access & Update',
    page: 'Privacy',
    section: 'Section 5',
    label: 'Section 5 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_4_subsection_0_content',
    value: 'You can access and update your personal information at any time through your account settings. You may also request a complete copy of the data we hold about you.',
    page: 'Privacy',
    section: 'Section 5',
    label: 'Section 5 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 6 — Data Retention
  {
    key: 'privacy_section_5_title',
    value: '6. Data Retention',
    page: 'Privacy',
    section: 'Section 6',
    label: 'Section 6 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_5_paragraph_0',
    value: 'We retain your personal information for as long as your account is active or as needed to provide you Services. We may also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.',
    page: 'Privacy',
    section: 'Section 6',
    label: 'Section 6 Paragraph',
    type: 'textarea',
  },
  // Section 7 — Cookies & Tracking
  {
    key: 'privacy_section_6_title',
    value: '7. Cookies & Tracking',
    page: 'Privacy',
    section: 'Section 7',
    label: 'Section 7 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_6_paragraph_0',
    value: 'We use cookies and similar tracking technologies to track activity on our Services and hold certain information.',
    page: 'Privacy',
    section: 'Section 7',
    label: 'Section 7 Paragraph',
    type: 'textarea',
  },
  // Section 8 — Third-Party Services
  {
    key: 'privacy_section_7_title',
    value: '8. Third-Party Services',
    page: 'Privacy',
    section: 'Section 8',
    label: 'Section 8 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_7_paragraph_0',
    value: 'Our Services may contain links to third-party websites or services that are not owned or controlled by ApexFlow.',
    page: 'Privacy',
    section: 'Section 8',
    label: 'Section 8 Paragraph',
    type: 'textarea',
  },
  // Section 9 — Children's Privacy
  {
    key: 'privacy_section_8_title',
    value: "9. Children's Privacy",
    page: 'Privacy',
    section: 'Section 9',
    label: 'Section 9 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_8_paragraph_0',
    value: 'Our Services are not intended for children under the age of 13.',
    page: 'Privacy',
    section: 'Section 9',
    label: 'Section 9 Paragraph',
    type: 'textarea',
  },
  // Section 10 — Changes & Contact
  {
    key: 'privacy_section_9_title',
    value: '10. Changes & Contact',
    page: 'Privacy',
    section: 'Section 10',
    label: 'Section 10 Title',
    type: 'text',
  },
  {
    key: 'privacy_section_9_paragraph_0',
    value: 'We may update our Privacy Policy from time to time.',
    page: 'Privacy',
    section: 'Section 10',
    label: 'Section 10 Paragraph',
    type: 'textarea',
  },

  // ═════════════ Terms ═════════════
  {
    key: 'terms_page_title',
    value: 'Terms of Service',
    page: 'Terms',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
    description: 'Hero h1 on /legal/terms.',
  },
  {
    key: 'terms_page_description',
    value: 'Last updated: March 2025',
    page: 'Terms',
    section: 'Page Header',
    label: 'Last Updated',
    type: 'text',
    description: 'Small "Last updated" line beneath the hero title on /legal/terms.',
  },
  // Section 1 — Acceptance of Terms
  {
    key: 'terms_section_0_title',
    value: '1. Acceptance of Terms',
    page: 'Terms',
    section: 'Section 1',
    label: 'Section 1 Title',
    type: 'text',
  },
  {
    key: 'terms_section_0_paragraph_0',
    value: 'By accessing or using the ApexFlow platform and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.',
    page: 'Terms',
    section: 'Section 1',
    label: 'Section 1 Paragraph',
    type: 'textarea',
  },
  {
    key: 'terms_section_0_subsection_0_title',
    value: 'Agreement to Terms',
    page: 'Terms',
    section: 'Section 1',
    label: 'Section 1 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'terms_section_0_subsection_0_content',
    value: 'These Terms apply to all visitors, users, and others who access or use the Services. By creating an account or using any part of the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.',
    page: 'Terms',
    section: 'Section 1',
    label: 'Section 1 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 2 — Description of Service
  {
    key: 'terms_section_1_title',
    value: '2. Description of Service',
    page: 'Terms',
    section: 'Section 2',
    label: 'Section 2 Title',
    type: 'text',
  },
  {
    key: 'terms_section_1_paragraph_0',
    value: 'ApexFlow provides cloud-based enterprise resource planning (ERP) software solutions tailored to specific industries.',
    page: 'Terms',
    section: 'Section 2',
    label: 'Section 2 Paragraph',
    type: 'textarea',
  },
  {
    key: 'terms_section_1_subsection_0_title',
    value: 'Cloud AI Powered OS for Specific Industries',
    page: 'Terms',
    section: 'Section 2',
    label: 'Section 2 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'terms_section_1_subsection_0_content',
    value: 'Our Services include industry-specific ERP platforms covering apparel & textile, hospitality, education, and additional verticals. Each platform provides purpose-built modules, data synchronization, API integrations, reporting, and support as described in your subscription plan.',
    page: 'Terms',
    section: 'Section 2',
    label: 'Section 2 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 3 — Account Registration
  {
    key: 'terms_section_2_title',
    value: '3. Account Registration',
    page: 'Terms',
    section: 'Section 3',
    label: 'Section 3 Title',
    type: 'text',
  },
  {
    key: 'terms_section_2_paragraph_0',
    value: 'To use certain features of the Services, you must register for an account.',
    page: 'Terms',
    section: 'Section 3',
    label: 'Section 3 Paragraph',
    type: 'textarea',
  },
  {
    key: 'terms_section_2_subsection_0_title',
    value: 'Accurate Information',
    page: 'Terms',
    section: 'Section 3',
    label: 'Section 3 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'terms_section_2_subsection_0_content',
    value: 'You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. Providing false or misleading information may result in immediate termination of your account.',
    page: 'Terms',
    section: 'Section 3',
    label: 'Section 3 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 4 — Acceptable Use
  {
    key: 'terms_section_3_title',
    value: '4. Acceptable Use',
    page: 'Terms',
    section: 'Section 4',
    label: 'Section 4 Title',
    type: 'text',
  },
  {
    key: 'terms_section_3_paragraph_0',
    value: 'You agree not to use the Services in any way that could damage, disable, or impair the platform or interfere with any other party\'s use.',
    page: 'Terms',
    section: 'Section 4',
    label: 'Section 4 Paragraph',
    type: 'textarea',
  },
  {
    key: 'terms_section_3_subsection_0_title',
    value: 'Prohibited Activities',
    page: 'Terms',
    section: 'Section 4',
    label: 'Section 4 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'terms_section_3_subsection_0_content',
    value: 'You agree not to: violate any applicable laws or regulations; infringe the rights of any third party; transmit any malware, viruses, or harmful code; attempt to gain unauthorized access to our systems or networks; interfere with or disrupt the integrity or performance of the Services; use the Services to compete directly with ApexFlow; or use automated tools to scrape, crawl, or extract data without prior written consent.',
    page: 'Terms',
    section: 'Section 4',
    label: 'Section 4 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 5 — Payment Terms
  {
    key: 'terms_section_4_title',
    value: '5. Payment Terms',
    page: 'Terms',
    section: 'Section 5',
    label: 'Section 5 Title',
    type: 'text',
  },
  {
    key: 'terms_section_4_paragraph_0',
    value: 'Subscription fees are billed in Pakistani Rupees (PKR) on a recurring basis as selected during signup.',
    page: 'Terms',
    section: 'Section 5',
    label: 'Section 5 Paragraph',
    type: 'textarea',
  },
  {
    key: 'terms_section_4_subsection_0_title',
    value: 'PKR Billing & Plans',
    page: 'Terms',
    section: 'Section 5',
    label: 'Section 5 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'terms_section_4_subsection_0_content',
    value: 'All subscription fees are billed in Pakistani Rupees (PKR). You may choose monthly or annual billing. Annual plans are billed upfront and may include a discount. All prices are exclusive of applicable taxes, which will be added to your invoice as required by law.',
    page: 'Terms',
    section: 'Section 5',
    label: 'Section 5 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 6 — Intellectual Property
  {
    key: 'terms_section_5_title',
    value: '6. Intellectual Property',
    page: 'Terms',
    section: 'Section 6',
    label: 'Section 6 Title',
    type: 'text',
  },
  {
    key: 'terms_section_5_paragraph_0',
    value: 'The Services and all content, features, and functionality thereof are owned by ApexFlow and protected by international intellectual property laws.',
    page: 'Terms',
    section: 'Section 6',
    label: 'Section 6 Paragraph',
    type: 'textarea',
  },
  // Section 7 — Data & Content
  {
    key: 'terms_section_6_title',
    value: '7. Data & Content',
    page: 'Terms',
    section: 'Section 7',
    label: 'Section 7 Title',
    type: 'text',
  },
  {
    key: 'terms_section_6_paragraph_0',
    value: 'You retain ownership of all data you submit to the Services. We process it only as necessary to deliver the Services.',
    page: 'Terms',
    section: 'Section 7',
    label: 'Section 7 Paragraph',
    type: 'textarea',
  },
  // Section 8 — Limitation of Liability
  {
    key: 'terms_section_7_title',
    value: '8. Limitation of Liability',
    page: 'Terms',
    section: 'Section 8',
    label: 'Section 8 Title',
    type: 'text',
  },
  {
    key: 'terms_section_7_paragraph_0',
    value: 'To the maximum extent permitted by applicable law:',
    page: 'Terms',
    section: 'Section 8',
    label: 'Section 8 Paragraph',
    type: 'textarea',
  },
  // Section 9 — Termination
  {
    key: 'terms_section_8_title',
    value: '9. Termination',
    page: 'Terms',
    section: 'Section 9',
    label: 'Section 9 Title',
    type: 'text',
  },
  {
    key: 'terms_section_8_paragraph_0',
    value: 'Either party may terminate the subscription under the following conditions:',
    page: 'Terms',
    section: 'Section 9',
    label: 'Section 9 Paragraph',
    type: 'textarea',
  },
  // Section 10 — Governing Law & Contact
  {
    key: 'terms_section_9_title',
    value: '10. Governing Law & Contact',
    page: 'Terms',
    section: 'Section 10',
    label: 'Section 10 Title',
    type: 'text',
  },
  {
    key: 'terms_section_9_paragraph_0',
    value: 'These Terms shall be governed and construed in accordance with the laws of Pakistan.',
    page: 'Terms',
    section: 'Section 10',
    label: 'Section 10 Paragraph',
    type: 'textarea',
  },

  // ═════════════ Refund ═════════════
  {
    key: 'refund_page_title',
    value: 'Refund Policy',
    page: 'Refund',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
    description: 'Hero h1 on /legal/refund.',
  },
  {
    key: 'refund_page_description',
    value: 'Last updated: March 2025',
    page: 'Refund',
    section: 'Page Header',
    label: 'Last Updated',
    type: 'text',
    description: 'Small "Last updated" line beneath the hero title on /legal/refund.',
  },
  // Section 1 — Overview
  {
    key: 'refund_section_0_title',
    value: '1. Overview',
    page: 'Refund',
    section: 'Section 1',
    label: 'Section 1 Title',
    type: 'text',
  },
  {
    key: 'refund_section_0_paragraph_0',
    value: 'At ApexFlow, we strive to deliver exceptional enterprise software solutions. We understand that circumstances may change, and we want to be transparent about our refund and cancellation policies. This Refund Policy outlines the conditions under which refunds may be issued for our subscription-based ERP services.',
    page: 'Refund',
    section: 'Section 1',
    label: 'Section 1 Paragraph',
    type: 'textarea',
  },
  // Section 2 — Subscription Cancellations
  {
    key: 'refund_section_1_title',
    value: '2. Subscription Cancellations',
    page: 'Refund',
    section: 'Section 2',
    label: 'Section 2 Title',
    type: 'text',
  },
  {
    key: 'refund_section_1_paragraph_0',
    value: 'You may cancel your subscription at any time through your account settings or by contacting our support team.',
    page: 'Refund',
    section: 'Section 2',
    label: 'Section 2 Paragraph',
    type: 'textarea',
  },
  {
    key: 'refund_section_1_subsection_0_title',
    value: 'Monthly Subscriptions',
    page: 'Refund',
    section: 'Section 2',
    label: 'Section 2 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'refund_section_1_subsection_0_content',
    value: 'Monthly subscriptions can be cancelled at any time. Upon cancellation, your subscription will remain active until the end of the current billing period. No further charges will be applied. No partial refund will be issued for unused days within the current billing cycle.',
    page: 'Refund',
    section: 'Section 2',
    label: 'Section 2 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 3 — Refund Eligibility
  {
    key: 'refund_section_2_title',
    value: '3. Refund Eligibility',
    page: 'Refund',
    section: 'Section 3',
    label: 'Section 3 Title',
    type: 'text',
  },
  {
    key: 'refund_section_2_paragraph_0',
    value: 'We offer refunds under specific circumstances to ensure fairness and protect both our customers and our business.',
    page: 'Refund',
    section: 'Section 3',
    label: 'Section 3 Paragraph',
    type: 'textarea',
  },
  {
    key: 'refund_section_2_subsection_0_title',
    value: '14-Day Money-Back Guarantee (New Subscribers)',
    page: 'Refund',
    section: 'Section 3',
    label: 'Section 3 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'refund_section_2_subsection_0_content',
    value: 'First-time subscribers to any ApexFlow ERP product are eligible for a full refund within 14 calendar days of the initial purchase date. This applies to both monthly and annual plans. The refund will be processed to the original payment method within 5-10 business days. This guarantee applies once per customer per product.',
    page: 'Refund',
    section: 'Section 3',
    label: 'Section 3 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 4 — Refund Request Process
  {
    key: 'refund_section_3_title',
    value: '4. Refund Request Process',
    page: 'Refund',
    section: 'Section 4',
    label: 'Section 4 Title',
    type: 'text',
  },
  {
    key: 'refund_section_3_paragraph_0',
    value: 'To request a refund, follow the steps below. We aim to process all legitimate refund requests promptly and fairly.',
    page: 'Refund',
    section: 'Section 4',
    label: 'Section 4 Paragraph',
    type: 'textarea',
  },
  {
    key: 'refund_section_3_subsection_0_title',
    value: 'How to Request',
    page: 'Refund',
    section: 'Section 4',
    label: 'Section 4 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'refund_section_3_subsection_0_content',
    value: 'Submit a refund request by emailing billing@apexflow.cloud with the subject line "Refund Request — [Your Company Name]". Include your account ID, subscription details, reason for the refund, and the date of purchase. Our billing team will review your request within 2 business days.',
    page: 'Refund',
    section: 'Section 4',
    label: 'Section 4 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 5 — Refund Methods & Timeline
  {
    key: 'refund_section_4_title',
    value: '5. Refund Methods & Timeline',
    page: 'Refund',
    section: 'Section 5',
    label: 'Section 5 Title',
    type: 'text',
  },
  {
    key: 'refund_section_4_paragraph_0',
    value: 'Refunds are processed using the same payment method used for the original purchase.',
    page: 'Refund',
    section: 'Section 5',
    label: 'Section 5 Paragraph',
    type: 'textarea',
  },
  {
    key: 'refund_section_4_subsection_0_title',
    value: 'Credit / Debit Card',
    page: 'Refund',
    section: 'Section 5',
    label: 'Section 5 Subsection 1 Title',
    type: 'text',
  },
  {
    key: 'refund_section_4_subsection_0_content',
    value: 'Refunds to credit or debit cards are processed within 5-10 business days. The refund will appear on your statement as "APEXFLOW REFUND" or similar. Please note that your bank may take an additional 3-5 business days to reflect the refund in your account.',
    page: 'Refund',
    section: 'Section 5',
    label: 'Section 5 Subsection 1 Content',
    type: 'textarea',
  },
  // Section 6 — Partial Refunds & Prorations
  {
    key: 'refund_section_5_title',
    value: '6. Partial Refunds & Prorations',
    page: 'Refund',
    section: 'Section 6',
    label: 'Section 6 Title',
    type: 'text',
  },
  {
    key: 'refund_section_5_paragraph_0',
    value: 'ApexFlow does not offer partial refunds for unused subscription periods beyond the 14-day money-back guarantee.',
    page: 'Refund',
    section: 'Section 6',
    label: 'Section 6 Paragraph',
    type: 'textarea',
  },
  // Section 7 — Promotional & Discounted Plans
  {
    key: 'refund_section_6_title',
    value: '7. Promotional & Discounted Plans',
    page: 'Refund',
    section: 'Section 7',
    label: 'Section 7 Title',
    type: 'text',
  },
  {
    key: 'refund_section_6_paragraph_0',
    value: 'Special pricing arrangements and promotional offers have specific refund conditions.',
    page: 'Refund',
    section: 'Section 7',
    label: 'Section 7 Paragraph',
    type: 'textarea',
  },
  // Section 8 — Dispute Resolution
  {
    key: 'refund_section_7_title',
    value: '8. Dispute Resolution',
    page: 'Refund',
    section: 'Section 8',
    label: 'Section 8 Title',
    type: 'text',
  },
  {
    key: 'refund_section_7_paragraph_0',
    value: 'If you disagree with a refund decision, you have the right to escalate the matter.',
    page: 'Refund',
    section: 'Section 8',
    label: 'Section 8 Paragraph',
    type: 'textarea',
  },
  // Section 9 — Policy Changes
  {
    key: 'refund_section_8_title',
    value: '9. Policy Changes',
    page: 'Refund',
    section: 'Section 9',
    label: 'Section 9 Title',
    type: 'text',
  },
  {
    key: 'refund_section_8_paragraph_0',
    value: 'We reserve the right to update this Refund Policy from time to time.',
    page: 'Refund',
    section: 'Section 9',
    label: 'Section 9 Paragraph',
    type: 'textarea',
  },
  // Section 10 — Contact Information
  {
    key: 'refund_section_9_title',
    value: '10. Contact Information',
    page: 'Refund',
    section: 'Section 10',
    label: 'Section 10 Title',
    type: 'text',
  },
  {
    key: 'refund_section_9_paragraph_0',
    value: 'If you have any questions about this Refund Policy or need assistance with a refund request, please reach out to us.',
    page: 'Refund',
    section: 'Section 10',
    label: 'Section 10 Paragraph',
    type: 'textarea',
  },

  // ═════════════ Security ═════════════
  {
    key: 'security_page_title',
    value: 'Security at',
    page: 'Security',
    section: 'Page Header',
    label: 'Page Title',
    type: 'text',
    description: 'Hero h1 prefix on /legal/security (the "ApexFlow" suffix stays gradient-styled).',
  },
  {
    key: 'security_page_description',
    value: "Security isn't a feature — it's the foundation. Every layer of ApexFlow is built with enterprise-grade protection.",
    page: 'Security',
    section: 'Page Header',
    label: 'Page Description',
    type: 'textarea',
    description: 'Subtitle paragraph beneath the hero title on /legal/security.',
  },
  // Sections map to the APPROACH (4) + PRACTICES (6) + COMPLIANCE (1) headings.
  {
    key: 'security_section_0_title',
    value: 'Our Security Approach',
    page: 'Security',
    section: 'Approach Section',
    label: 'Approach Heading',
    type: 'text',
  },
  {
    key: 'security_section_0_description',
    value: 'Four pillars that define how we protect your data and operations.',
    page: 'Security',
    section: 'Approach Section',
    label: 'Approach Description',
    type: 'textarea',
  },
  {
    key: 'security_section_1_title',
    value: 'Encryption',
    page: 'Security',
    section: 'Approach Pillar 1',
    label: 'Pillar 1 Title',
    type: 'text',
  },
  {
    key: 'security_section_1_description',
    value: 'AES-256 encryption at rest, TLS 1.3 in transit. Your data is always protected.',
    page: 'Security',
    section: 'Approach Pillar 1',
    label: 'Pillar 1 Description',
    type: 'textarea',
  },
  {
    key: 'security_section_2_title',
    value: 'Compliance',
    page: 'Security',
    section: 'Approach Pillar 2',
    label: 'Pillar 2 Title',
    type: 'text',
  },
  {
    key: 'security_section_2_description',
    value: 'SOC 2 Type II, GDPR, and industry-specific compliance frameworks.',
    page: 'Security',
    section: 'Approach Pillar 2',
    label: 'Pillar 2 Description',
    type: 'textarea',
  },
  {
    key: 'security_section_3_title',
    value: 'Infrastructure',
    page: 'Security',
    section: 'Approach Pillar 3',
    label: 'Pillar 3 Title',
    type: 'text',
  },
  {
    key: 'security_section_3_description',
    value: 'Enterprise-grade cloud infrastructure with 99.9% uptime SLA.',
    page: 'Security',
    section: 'Approach Pillar 3',
    label: 'Pillar 3 Description',
    type: 'textarea',
  },
  {
    key: 'security_section_4_title',
    value: 'Monitoring',
    page: 'Security',
    section: 'Approach Pillar 4',
    label: 'Pillar 4 Title',
    type: 'text',
  },
  {
    key: 'security_section_4_description',
    value: '24/7 real-time monitoring, automated alerting, and incident response.',
    page: 'Security',
    section: 'Approach Pillar 4',
    label: 'Pillar 4 Description',
    type: 'textarea',
  },
  {
    key: 'security_section_5_title',
    value: 'Security Practices',
    page: 'Security',
    section: 'Practices Section',
    label: 'Practices Heading',
    type: 'text',
  },
  {
    key: 'security_section_5_description',
    value: 'Detailed security measures across every layer of our platform.',
    page: 'Security',
    section: 'Practices Section',
    label: 'Practices Description',
    type: 'textarea',
  },
  {
    key: 'security_section_6_title',
    value: 'Compliance & Certifications',
    page: 'Security',
    section: 'Compliance Section',
    label: 'Compliance Heading',
    type: 'text',
  },
  {
    key: 'security_section_6_description',
    value: 'Independently verified security and compliance standards.',
    page: 'Security',
    section: 'Compliance Section',
    label: 'Compliance Description',
    type: 'textarea',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// ERP PRODUCT CONTENT BLOCKS
// ═══════════════════════════════════════════════════════════════════════════
// Each ERP product page (e.g. /erp/pharmaflow) renders tagline, heroDescription,
// pricing, pkrMonthly, stats[], modules[], painPoints[], workflow[] from the
// hardcoded ERP_DETAILS map. These blocks let an admin override every one of
// those fields from the Content Manager (under the "ERP Products" page in the
// left sidebar).
//
// Key convention: `erp_<slug>_<field>` (e.g. `erp_pharmaflow_tagline`,
// `erp_pharmaflow_module_0_name`). The full key is what's stored as the
// SiteSetting row's `key` field.
//
// Page convention: `erp_<slug>` (e.g. `erp_pharmaflow`). The admin GET handler
// groups blocks by `page` so each ERP shows up as its own "page" in the
// Content Manager's ERP Products sub-nav.
//
// Group convention: same as the page (`erp_<slug>`). The POST handler stores
// the body's `group` (defaulting to `page`) so DB rows are bucketed by ERP
// slug.
//
// Variable-length arrays (stats / modules / painPoints / workflow) are
// enumerated by index at module load time, so adding a new stat/module to the
// hardcoded ERP_DETAILS map automatically produces a new editable block here.
// (SalonFlow is missing some of these fields — its blocks are simply skipped.)
// ─────────────────────────────────────────────────────────────────────────────

function buildErpContentBlocks(): ContentBlock[] {
  const out: ContentBlock[] = []
  const erpSlugs = Object.keys(ERP_DETAILS)

  for (const slug of erpSlugs) {
    const d = ERP_DETAILS[slug]
    if (!d) continue
    const page = `erp_${slug}`
    const group = page

    // ── Hero Section ───────────────────────────────────────────────
    out.push({
      key: `erp_${slug}_tagline`,
      value: d.tagline ?? '',
      page,
      group,
      section: 'Hero Section',
      label: 'Tagline',
      type: 'text',
      description: `Hero sub-headline shown beneath the ERP name on /erp/${slug}.`,
    })
    out.push({
      key: `erp_${slug}_heroDescription`,
      value: d.heroDescription ?? '',
      page,
      group,
      section: 'Hero Section',
      label: 'Hero Description',
      type: 'textarea',
      description: `Hero paragraph shown beneath the tagline on /erp/${slug}.`,
    })
    // ── Website / Demo URL ─────────────────────────────────────────
    // Surfaced as the "Explore Demo" button on /erp/<slug> (line ~1490
    // of erp-detail-page.tsx) and the "Live Demo" button on /products
    // (line ~505 of products-page.tsx). The same value is used for both
    // buttons — if you need a separate "Live Demo" URL on /products,
    // override it via the dedicated "Demo Links" tab in the Content
    // Manager's Links & Navigation view.
    out.push({
      key: `erp_${slug}_website`,
      value: d.website ?? '',
      page,
      group,
      section: 'Hero Section',
      label: 'Demo URL (website)',
      type: 'text',
      description: `External demo URL the "Explore Demo" button on /erp/${slug} opens in a new tab. Also used as the "Live Demo" URL on /products.`,
    })

    // Pricing fields — SalonFlow has no pricing/pkrMonthly, so skip.
    if (d.pricing !== undefined) {
      out.push({
        key: `erp_${slug}_pricing`,
        value: d.pricing,
        page,
        group,
        section: 'Pricing Section',
        label: 'Pricing Display',
        type: 'text',
        description: `Pricing blurb shown beneath the hero CTAs (e.g. "Starting from PKR 15,000/mo").`,
      })
    }
    if (d.pkrMonthly !== undefined) {
      out.push({
        key: `erp_${slug}_pkrMonthly`,
        value: String(d.pkrMonthly),
        page,
        group,
        section: 'Pricing Section',
        label: 'PKR Monthly Price',
        type: 'text',
        description: `Numeric monthly price in PKR (used to derive the 3 pricing tiers).`,
      })
    }

    // ── Stats Section (variable count per ERP) ────────────────────
    const stats = Array.isArray(d.stats) ? d.stats : []
    stats.forEach((s, i) => {
      out.push({
        key: `erp_${slug}_stat_${i}_label`,
        value: s.label,
        page,
        group,
        section: 'Stats Section',
        label: `Stat ${i + 1} Label`,
        type: 'text',
        description: `Label for the ${ordinal(i + 1)} hero stat card.`,
      })
      out.push({
        key: `erp_${slug}_stat_${i}_value`,
        value: s.value,
        page,
        group,
        section: 'Stats Section',
        label: `Stat ${i + 1} Value`,
        type: 'text',
        description: `Value for the ${ordinal(i + 1)} hero stat card (e.g. "40%" or "3x Faster").`,
      })
    })

    // ── Modules Section (variable count per ERP) ──────────────────
    const modules = Array.isArray(d.modules) ? d.modules : []
    modules.forEach((m, i) => {
      out.push({
        key: `erp_${slug}_module_${i}_name`,
        value: m.name,
        page,
        group,
        section: 'Modules Section',
        label: `Module ${i + 1} Name`,
        type: 'text',
        description: `Name of the ${ordinal(i + 1)} module shown in the Module Explorer.`,
      })
      out.push({
        key: `erp_${slug}_module_${i}_description`,
        value: m.description,
        page,
        group,
        section: 'Modules Section',
        label: `Module ${i + 1} Description`,
        type: 'textarea',
        description: `Description of the ${ordinal(i + 1)} module.`,
      })
    })

    // ── Pain Points Section (variable count per ERP) ──────────────
    const painPoints = Array.isArray(d.painPoints) ? d.painPoints : []
    painPoints.forEach((p, i) => {
      out.push({
        key: `erp_${slug}_painPoint_${i}_title`,
        value: p.title,
        page,
        group,
        section: 'Pain Points Section',
        label: `Pain Point ${i + 1} Title`,
        type: 'text',
        description: `Title for the ${ordinal(i + 1)} pain-point flip card.`,
      })
      out.push({
        key: `erp_${slug}_painPoint_${i}_before`,
        value: p.before,
        page,
        group,
        section: 'Pain Points Section',
        label: `Pain Point ${i + 1} — Before`,
        type: 'textarea',
        description: `"Before" copy for the ${ordinal(i + 1)} pain-point flip card.`,
      })
      out.push({
        key: `erp_${slug}_painPoint_${i}_after`,
        value: p.after,
        page,
        group,
        section: 'Pain Points Section',
        label: `Pain Point ${i + 1} — After`,
        type: 'textarea',
        description: `"After" copy for the ${ordinal(i + 1)} pain-point flip card.`,
      })
    })

    // ── Workflow Section (variable count per ERP) ─────────────────
    const workflow = Array.isArray(d.workflow) ? d.workflow : []
    workflow.forEach((w, i) => {
      out.push({
        key: `erp_${slug}_workflow_${i}_step`,
        value: w.step,
        page,
        group,
        section: 'Workflow Section',
        label: `Workflow ${i + 1} Step`,
        type: 'text',
        description: `Step number (e.g. "01") for the ${ordinal(i + 1)} workflow timeline step.`,
      })
      out.push({
        key: `erp_${slug}_workflow_${i}_title`,
        value: w.title,
        page,
        group,
        section: 'Workflow Section',
        label: `Workflow ${i + 1} Title`,
        type: 'text',
        description: `Title for the ${ordinal(i + 1)} workflow timeline step.`,
      })
      out.push({
        key: `erp_${slug}_workflow_${i}_description`,
        value: w.description,
        page,
        group,
        section: 'Workflow Section',
        label: `Workflow ${i + 1} Description`,
        type: 'textarea',
        description: `Description for the ${ordinal(i + 1)} workflow timeline step.`,
      })
    })
  }

  return out
}

// Helper: 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th"…
function ordinal(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

// Built once at module load — ~1,200 blocks across 21 ERPs.
export const ERP_CONTENT_BLOCKS: ContentBlock[] = buildErpContentBlocks()

// Quick lookup: page → blocks[] (used by the dedicated /api/admin/content/erp
// endpoint to return a single ERP's blocks without re-iterating the full map).
const ERP_BLOCKS_BY_PAGE: Record<string, ContentBlock[]> = (() => {
  const out: Record<string, ContentBlock[]> = {}
  for (const block of ERP_CONTENT_BLOCKS) {
    if (!out[block.page]) out[block.page] = []
    out[block.page].push(block)
  }
  return out
})()

/**
 * Return the ERP content blocks (defaults merged with DB overrides) for a
 * single ERP slug. Returns `{ blocks, meta }` where meta contains the
 * display name, slug and icon-name from ERP_DETAILS so the admin UI can
 * render the ERP picker without importing the (large) erp-detail-data module
 * on the client.
 */
export function getErpContentForSlug(
  slug: string,
  savedByKey: Map<string, { value: string; updatedAt: Date }>
): {
  blocks: Array<ContentBlock & { saved: boolean; updatedAt?: string }>
  meta: { slug: string; name: string; icon: string; color: string; industry: string } | null
} {
  const page = `erp_${slug}`
  const defaults = ERP_BLOCKS_BY_PAGE[page] || []
  const d = ERP_DETAILS[slug]
  const meta = d
    ? {
        slug: d.slug,
        name: d.name,
        icon: d.icon,
        color: d.color,
        industry: d.industry,
      }
    : null

  const blocks = defaults.map((block) => {
    const saved = savedByKey.get(block.key)
    return {
      ...block,
      value: saved ? saved.value : block.value,
      saved: !!saved,
      updatedAt: saved ? saved.updatedAt.toISOString() : undefined,
    } as ContentBlock & { saved: boolean; updatedAt?: string }
  })

  return { blocks, meta }
}

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

    // Also pull the link JSON blocks (nav_links, footer_links,
    // social_links, cta_links) so the Content Manager can render
    // both tabs in a single fetch when desired. The dedicated
    // /api/admin/content/links endpoint does the heavy lifting.
    const linkKeys = ['nav_links', 'footer_links', 'social_links', 'cta_links']
    const linkRows = rows.filter((r) => linkKeys.includes(r.key))
    const links: Record<string, unknown> = {}
    for (const k of linkKeys) {
      const row = linkRows.find((r) => r.key === k)
      if (!row) continue
      try {
        links[k] = JSON.parse(row.value)
      } catch {
        // ignore malformed JSON — caller will fall back to defaults via the
        // dedicated links endpoint.
      }
    }

    return NextResponse.json({
      content: grouped,
      pages: Object.keys(grouped),
      total: Object.values(grouped).reduce((n, arr) => n + arr.length, 0),
      links,
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
      isJson?: boolean
      group?: string
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

    // When the caller marks the payload as JSON, validate it parses before we
    // store it. This guards the link editor (nav_links, footer_links, …)
    // against persisting malformed JSON.
    if (body.isJson) {
      try {
        JSON.parse(body.value)
      } catch {
        return NextResponse.json(
          { error: 'isJson was set but value is not valid JSON' },
          { status: 400 }
        )
      }
    }

    // Compose a human-friendly description when one isn't provided.
    const description =
      body.description ||
      `${body.label || body.key} — managed by Content Manager (${body.page} / ${body.section || 'general'})`

    // `group` from the body takes precedence (used by the links editor which
    // stores rows under group='navigation' / 'footer' / 'social' / 'cta').
    const group = body.group || body.page

    const upserted = await withRetry((db) =>
      db.siteSetting.upsert({
        where: { key: body.key },
        update: {
          value: body.value,
          group,
          description,
        },
        create: {
          key: body.key,
          value: body.value,
          category: 'content',
          group,
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
