'use client'

import Link from 'next/link'
import { getViewPath } from '@/lib/use-navigate'
import { useState, useEffect } from 'react'
import {
  Github, Twitter, Linkedin, Mail, MapPin, Phone,
  ArrowUp, Send, CheckCircle, Instagram, Youtube, Facebook, MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { SiteLogo } from '@/components/shared/site-logo'
import { useSiteSettings } from '@/lib/site-settings-store'

/* ─────────────── Logo ─────────────── */
function Logo() {
  return <SiteLogo variant="full" size={36} />
}

/* ─────────────── Link Helpers ─────────────── */
type FooterLink = { label: string; view: string; slug?: string }

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: FooterLink[]
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.12em] font-semibold mb-5 text-[var(--gg-vermillion)]">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={getViewPath(link.view, link.slug)}
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

  // Read footer settings
  const companyDescription = getSetting('footer_company_description', 'AI Powered Operating Systems that run entire industries. Built for scale, designed for simplicity.')
  const footerEmail = getSetting('footer_email', 'info@apexflow.cloud')
  const footerPhone = getSetting('footer_phone', '+92 307 4903277')
  const footerAddress = getSetting('footer_address', 'Lahore, Pakistan')
  const githubUrl = getSetting('social_github_url', 'https://github.com/apexflowerp')
  const twitterUrl = getSetting('social_twitter_url', '')
  const linkedinUrl = getSetting('social_linkedin_url', '')
  const instagramUrl = getSetting('social_instagram_url', '')
  const youtubeUrl = getSetting('social_youtube_url', '')
  const facebookUrl = getSetting('social_facebook_url', '')
  const discordUrl = getSetting('social_discord_url', '')
  const telegramUrl = getSetting('social_telegram_url', '')
  const showNewsletter = getSetting('footer_show_newsletter', 'true') === 'true'
  const copyrightText = getSetting('footer_copyright_text', '')
  const tagline = getSetting('footer_tagline', 'Built for industries that demand more.')
  const siteName = getSetting('site_name', 'ApexFlow')

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

  const companyLinks: FooterLink[] = [
    { label: 'About', view: 'about' },
    { label: 'Become Partner', view: 'become-partner' },
    { label: 'Blog', view: 'blog' },
    { label: 'Contact', view: 'contact' },
  ]

  const resourceLinks: FooterLink[] = [
    { label: 'Documentation', view: 'resources' },
    { label: 'API Reference', view: 'resources' },
    { label: 'Status', view: 'resources' },
    { label: 'Changelog', view: 'resources' },
  ]

  const legalLinks: FooterLink[] = [
    { label: 'Terms of Service', view: 'legal-terms' },
    { label: 'Privacy Policy', view: 'legal-privacy' },
    { label: 'Refund Policy', view: 'legal-refund' },
    { label: 'Security', view: 'legal-security' },
  ]

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
            <div className="flex items-center gap-2.5 mt-6">
              {githubUrl && <SocialLink href={githubUrl} icon={Github} label="GitHub" />}
              {twitterUrl && <SocialLink href={twitterUrl} icon={Twitter} label="Twitter" />}
              {linkedinUrl && <SocialLink href={linkedinUrl} icon={Linkedin} label="LinkedIn" />}
              {facebookUrl && <SocialLink href={facebookUrl} icon={Facebook} label="Facebook" />}
              {instagramUrl && <SocialLink href={instagramUrl} icon={Instagram} label="Instagram" />}
              {youtubeUrl && <SocialLink href={youtubeUrl} icon={Youtube} label="YouTube" />}
              {discordUrl && <SocialLink href={discordUrl} icon={MessageCircle} label="Discord" />}
            </div>
          </div>

          {/* Column 2 — Company */}
          <div className="lg:col-span-2">
            <FooterLinkColumn title="Company" links={companyLinks} />
          </div>

          {/* Column 3 — Resources */}
          <div className="lg:col-span-2">
            <FooterLinkColumn title="Resources" links={resourceLinks} />
          </div>

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
          <p className="text-xs text-muted-foreground">
            {copyrightText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {legalLinks.map((link, i) => (
              <span key={link.label} className="flex items-center">
                <Link
                  href={getViewPath(link.view)}
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
