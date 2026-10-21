'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import {
  Github, Twitter, Linkedin, Mail, MapPin, Phone,
  ArrowUp, Send, CheckCircle, Instagram, Youtube, Facebook, MessageCircle
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteLogo } from '@/components/shared/site-logo'
import { useSiteSettings } from '@/lib/site-settings-store'
import { useContent } from '@/hooks/use-content'

/* ═══════════════════════════════════════════════════════════════
   LINK MANAGER WIRING — types + icon map + fallbacks
   The admin-managed Link Manager stores footer_links + social_links as
   JSON arrays in SiteSetting rows (category='content', group='footer'/
   'social'). The public /api/content endpoint serves them under their
   group page, so `get('footer', 'footer_links', '[]')` returns the
   JSON string. Hardcoded fallbacks keep the site working when the API
   or DB is unreachable.
   ═══════════════════════════════════════════════════════════════ */

type StoredFooterLink = {
  id: string
  column: string
  label: string
  href: string
  order?: number
}

type StoredSocialLink = {
  id: string
  platform: string
  url: string
  icon?: string
}

// ─── Icon string → lucide-react component ─────────────────────────────
const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  github: Github,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  discord: MessageCircle,
  telegram: Send,
  email: Mail,
  mail: Mail,
}

function lookupSocialIcon(name?: string): LucideIcon {
  if (!name) return MessageCircle
  const key = name.toLowerCase().replace(/[-_\s]/g, '')
  return SOCIAL_ICON_MAP[key] || MessageCircle
}

// ─── Hardcoded fallback footer links (mirror the pre-wire look) ────
// Includes the four original "Security" legal entry so the bottom bar
// stays identical when no override has been saved.
const FALLBACK_FOOTER_LINKS: StoredFooterLink[] = [
  // Company
  { id: 'ftr_about', column: 'Company', label: 'About', href: '/about', order: 0 },
  { id: 'ftr_become_partner', column: 'Company', label: 'Become Partner', href: '/become-partner', order: 1 },
  { id: 'ftr_blog', column: 'Company', label: 'Blog', href: '/blog', order: 2 },
  { id: 'ftr_contact', column: 'Company', label: 'Contact', href: '/contact', order: 3 },
  // Resources
  { id: 'ftr_docs', column: 'Resources', label: 'Documentation', href: '/resources', order: 0 },
  { id: 'ftr_api', column: 'Resources', label: 'API Reference', href: '/resources', order: 1 },
  { id: 'ftr_status', column: 'Resources', label: 'Status', href: '/resources', order: 2 },
  { id: 'ftr_changelog', column: 'Resources', label: 'Changelog', href: '/resources', order: 3 },
  // Legal — rendered in the bottom bar
  { id: 'ftr_terms', column: 'Legal', label: 'Terms of Service', href: '/legal/terms', order: 0 },
  { id: 'ftr_privacy', column: 'Legal', label: 'Privacy Policy', href: '/legal/privacy', order: 1 },
  { id: 'ftr_refund', column: 'Legal', label: 'Refund Policy', href: '/legal/refund', order: 2 },
  { id: 'ftr_security', column: 'Legal', label: 'Security', href: '/legal/security', order: 3 },
]

// ─── Hardcoded fallback social links ──────────────────────────────────
const FALLBACK_SOCIAL_LINKS: StoredSocialLink[] = [
  { id: 'soc_github', platform: 'GitHub', url: 'https://github.com/apexflowerp', icon: 'github' },
  { id: 'soc_twitter', platform: 'Twitter/X', url: '', icon: 'twitter' },
  { id: 'soc_linkedin', platform: 'LinkedIn', url: '', icon: 'linkedin' },
  { id: 'soc_facebook', platform: 'Facebook', url: '', icon: 'facebook' },
  { id: 'soc_instagram', platform: 'Instagram', url: '', icon: 'instagram' },
  { id: 'soc_youtube', platform: 'YouTube', url: '', icon: 'youtube' },
]

/* ─────────────── Logo ─────────────── */
function Logo() {
  return <SiteLogo variant="full" size={36} />
}

/* ─────────────── Link Helpers ─────────────── */
function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: StoredFooterLink[]
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.12em] font-semibold mb-5 text-[var(--gg-vermillion)]">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.id || link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-[var(--gg-vermillion)] transition-colors duration-300 ease-out"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────── Social Link ─────────────── */
function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground transition-all duration-300 ease-out hover:text-[var(--gg-vermillion)] hover:scale-110"
      style={{
        background: 'color-mix(in srgb, var(--card) 60%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--gg-separator)',
        boxShadow: 'var(--gg-shadow-xs)',
      }}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </a>
  )
}

/* ─────────────── Main Footer ─────────────── */
export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { getSetting } = useSiteSettings()
  const { get: getContent } = useContent()

  // Read footer settings from the site-settings store (contact info,
  // theme toggles, etc. — these aren't part of the Link Manager scope).
  const companyDescription = getSetting('footer_company_description', 'AI Powered Operating Systems that run entire industries. Built for scale, designed for simplicity.')
  const footerEmail = getSetting('footer_email', 'info@apexflow.cloud')
  const footerPhone = getSetting('footer_phone', '+92 307 4903277')
  const footerAddress = getSetting('footer_address', 'Lahore, Pakistan')
  const showNewsletter = getSetting('footer_show_newsletter', 'true') === 'true'
  const tagline = getSetting('footer_tagline', 'Built for industries that demand more.')
  const siteName = getSetting('site_name', 'ApexFlow')

  /* ─── Link Manager — dynamic footer + social links + copyright ────
     Pulls footer_links, social_links, and footer_copyright_text from
     the public content endpoint via the useContent singleton hook.
     On any failure (API down, malformed JSON, empty override), falls
     back to FALLBACK_FOOTER_LINKS / FALLBACK_SOCIAL_LINKS / a
     dynamic `© {year} {siteName}` string so the footer renders
     identically to the pre-wire version. */
  const footerLinks = useMemo<StoredFooterLink[]>(() => {
    const raw = getContent('footer', 'footer_links', '[]')
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (l) =>
            l &&
            typeof l.label === 'string' &&
            typeof l.href === 'string' &&
            typeof l.column === 'string'
        )
      }
    } catch {
      /* malformed JSON → fall through to defaults */
    }
    return FALLBACK_FOOTER_LINKS
  }, [getContent])

  const socialLinks = useMemo<StoredSocialLink[]>(() => {
    const raw = getContent('social', 'social_links', '[]')
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (l) => l && typeof l.platform === 'string' && typeof l.url === 'string'
        )
      }
    } catch {
      /* malformed JSON → fall through to defaults */
    }
    return FALLBACK_SOCIAL_LINKS
  }, [getContent])

  /* Copyright: prefer the Link Manager override (page='Footer'), then
     fall back to the site-settings value, then to a dynamic
     `© {year} {siteName}. All rights reserved.` string. This preserves
     the pre-wire fallback chain. */
  const copyrightText = useMemo(() => {
    const fromContent = getContent('Footer', 'footer_copyright_text', '')
    if (fromContent && fromContent.trim() !== '') return fromContent
    const fromSettings = getSetting('footer_copyright_text', '')
    if (fromSettings && fromSettings.trim() !== '') return fromSettings
    return `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`
  }, [getContent, getSetting, siteName])

  /* Group footer_links by `column`, sort each column's links by `order`,
     then sort the columns themselves by their minimum link order so the
     admin's intended column ordering is respected. The Legal column is
     excluded here — it's rendered separately in the bottom bar. */
  const footerColumns = useMemo(() => {
    const groups: Record<string, StoredFooterLink[]> = {}
    for (const l of footerLinks) {
      if (!groups[l.column]) groups[l.column] = []
      groups[l.column].push(l)
    }
    return Object.entries(groups)
      .map(([column, links]) => ({
        column,
        links: links.sort(
          (a, b) =>
            (typeof a.order === 'number' ? a.order : 0) -
            (typeof b.order === 'number' ? b.order : 0)
        ),
        minOrder: links.reduce(
          (m, l) => Math.min(m, typeof l.order === 'number' ? l.order : 0),
          0
        ),
      }))
      .filter((g) => g.column !== 'Legal')
      .sort((a, b) => a.minOrder - b.minOrder)
  }, [footerLinks])

  /* Legal links go in the bottom bar. Sorted by `order`. */
  const legalLinks = useMemo(
    () =>
      footerLinks
        .filter((l) => l.column === 'Legal')
        .sort(
          (a, b) =>
            (typeof a.order === 'number' ? a.order : 0) -
            (typeof b.order === 'number' ? b.order : 0)
        ),
    [footerLinks]
  )

  /* Social links with a non-empty URL — empty-URL entries are skipped
     so the row doesn't render blank icons. */
  const visibleSocialLinks = useMemo(
    () => socialLinks.filter((s) => s.url && s.url.trim() !== ''),
    [socialLinks]
  )

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative mt-auto" style={{ background: 'var(--background)' }}>
      {/* Golden Gate accent top line */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gg-vermillion), var(--gg-amber), transparent)' }}
      />

      {/* Subtle warm surface overlay for footer */}
      <div
        className="absolute inset-0 top-px pointer-events-none"
        style={{
          background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ───── Main Grid ───── */}
        <div className="py-14 lg:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1 — Brand + Description + Socials */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo />
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {companyDescription}
            </p>
            {/* Social links — sourced from the admin-managed Link Manager
                (social_links JSON array). Empty-URL entries are skipped. */}
            <div className="flex items-center gap-2.5 mt-6">
              {visibleSocialLinks.map((s) => (
                <SocialLink
                  key={s.id}
                  href={s.url}
                  icon={lookupSocialIcon(s.icon)}
                  label={s.platform}
                />
              ))}
            </div>
          </div>

          {/* Link columns — sourced from the admin-managed Link Manager
              (footer_links JSON array, grouped by `column`). The Legal
              column is rendered separately in the bottom bar. Each column
              gets lg:col-span-2 to match the pre-wire 12-col grid layout;
              if the admin configures more than 2 link columns the extra
              ones wrap to a new row. */}
          {footerColumns.map((col) => (
            <div key={col.column} className="lg:col-span-2">
              <FooterLinkColumn title={col.column} links={col.links} />
            </div>
          ))}

          {/* Column 4 — Contact Info */}
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.12em] font-semibold mb-5 text-[var(--gg-vermillion)]">Contact</h4>
            <div className="space-y-4">
              {footerEmail && (
                <a
                  href={`mailto:${footerEmail}`}
                  className="flex items-center gap-3.5 text-sm text-muted-foreground hover:text-[var(--gg-vermillion)] transition-colors duration-300 ease-out group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-vermillion) 10%, transparent)',
                    }}
                  >
                    <Mail className="w-4 h-4 text-[var(--gg-vermillion)]" />
                  </div>
                  <span className="truncate">{footerEmail}</span>
                </a>
              )}
              {footerPhone && (
                <a
                  href={`tel:${footerPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3.5 text-sm text-muted-foreground hover:text-[var(--gg-violet)] transition-colors duration-300 ease-out group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-violet) 10%, transparent)',
                    }}
                  >
                    <Phone className="w-4 h-4 text-[var(--gg-violet)]" />
                  </div>
                  <span>{footerPhone}</span>
                </a>
              )}
              {footerAddress && (
                <div className="flex items-center gap-3.5 text-sm text-muted-foreground">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-teal) 10%, transparent)',
                    }}
                  >
                    <MapPin className="w-4 h-4 text-[var(--gg-teal)]" />
                  </div>
                  <span>{footerAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───── Newsletter Section ───── */}
        {showNewsletter && (
          <div
            className="py-8"
            style={{ borderTop: '1px solid var(--gg-separator)' }}
          >
            <div
              className="gg-glass p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)',
                  }}
                >
                  <Send className="w-4.5 h-4.5 text-[var(--gg-vermillion)]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Stay Updated</h4>
                  <p className="text-xs text-muted-foreground mt-1">Get the latest from {siteName} delivered to your inbox</p>
                </div>
              </div>
              <form onSubmit={handleSubscribe} className="flex gap-2.5 w-full md:w-auto items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 md:w-72 h-11 px-4 text-sm rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300"
                  style={{
                    background: 'color-mix(in srgb, var(--card) 60%, transparent)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--gg-separator-strong)',
                    boxShadow: 'var(--gg-shadow-xs)',
                  }}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="btn-glow h-11 px-5 rounded-xl shrink-0 transition-all duration-300 text-sm font-medium"
                  style={{
                    background: 'var(--gg-vermillion)',
                    color: '#FFFFFF',
                    boxShadow: 'var(--gg-shadow-sm)',
                  }}
                >
                  {subscribed ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[var(--gg-teal)] flex items-center gap-1.5 font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Thanks for subscribing!
                </motion.p>
              )}
            </div>
          </div>
        )}

        {/* ───── Bottom Bar ───── */}
        <div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--gg-separator)' }}
        >
          {/* Copyright — sourced from the Link Manager
              (page='Footer', key='footer_copyright_text'), with a
              dynamic `© {year} {siteName}` fallback when no override
              exists. */}
          <p className="text-xs text-muted-foreground">
            {copyrightText}
          </p>
          {/* Legal links — sourced from the admin-managed Link Manager
              (footer_links filtered to column='Legal'). Falls back to
              the four hardcoded entries in FALLBACK_FOOTER_LINKS when no
              override exists. */}
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {legalLinks.map((link, i) => (
              <span key={link.id || link.label} className="flex items-center">
                <Link
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-[var(--gg-vermillion)] transition-colors duration-300 px-2.5 py-1.5 rounded-md"
                >
                  {link.label}
                </Link>
                {i < legalLinks.length - 1 && (
                  <span
                    className="text-xs mx-1"
                    style={{ color: 'var(--gg-separator-strong)' }}
                  >
                    |
                  </span>
                )}
              </span>
            ))}
          </div>
          {tagline && (
            <p className="text-xs text-gradient-primary font-medium italic">
              {tagline}
            </p>
          )}
        </div>
      </div>

      {/* ───── Back to Top ───── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-[var(--gg-vermillion)] transition-all duration-300 hover:scale-110"
            style={{
              background: 'color-mix(in srgb, var(--card) 65%, transparent)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--gg-separator-strong)',
              boxShadow: 'var(--gg-shadow-lg)',
            }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-4.5 h-4.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
