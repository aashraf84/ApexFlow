'use client'

import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  Globe,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  Building2,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const CONTACT_INFO = [
  {
    icon: <Mail className="w-5 h-5 text-primary" />,
    label: 'Email',
    value: 'info@apexflow.cloud',
    desc: 'We reply within 24 hours',
    bgClass: 'bg-primary/10',
  },
  {
    icon: <Phone className="w-5 h-5 text-[var(--gg-violet)]" />,
    label: 'Phone',
    value: '+92 307 4903277',
    desc: 'Mon–Sat, 9AM–6PM PKT',
    bgClass: 'bg-[var(--gg-violet)]/10',
  },
  {
    icon: <MapPin className="w-5 h-5 text-[var(--gg-green)]" />,
    label: 'Office',
    value: 'Lahore, Pakistan',
    desc: 'Gulberg III',
    bgClass: 'bg-[var(--gg-green)]/10',
  },
  {
    icon: <Clock className="w-5 h-5 text-[var(--gg-amber)]" />,
    label: 'Hours',
    value: '9AM – 6PM PKT',
    desc: 'Monday to Saturday',
    bgClass: 'bg-[var(--gg-amber)]/10',
  },
]

const FAQS = [
  {
    q: 'How long does it take to get started?',
    a: 'Most businesses are up and running within 2–4 weeks. Our onboarding team handles data migration, configuration, and training to ensure a smooth transition.',
  },
  {
    q: 'Can I try before I buy?',
    a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can also request a personalized demo.',
  },
  {
    q: 'Do you offer custom development?',
    a: 'Absolutely. Our enterprise plan includes custom module development. We also offer dedicated development sprints for specific integrations or workflows.',
  },
  {
    q: 'What kind of support do you provide?',
    a: 'All plans include email support. Professional plans get priority support with 4-hour response times. Enterprise plans include 24/7 dedicated support with a named account manager.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted at rest and in transit. We use Neon PostgreSQL with enterprise-grade security, SOC 2 compliance, and regular penetration testing.',
  },
]

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Demo Request',
  'Technical Support',
  'Partnership',
  'Pricing Question',
]

const SOCIAL_LINKS = [
  { icon: <Twitter className="w-5 h-5" />, label: 'Twitter', href: '#', brandColor: '#1DA1F2', bgGradient: 'from-[#1DA1F2]/20 to-[#1DA1F2]/5' },
  { icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', href: '#', brandColor: '#0A66C2', bgGradient: 'from-[#0A66C2]/20 to-[#0A66C2]/5' },
  { icon: <Github className="w-5 h-5" />, label: 'GitHub', href: '#', brandColor: '#6e7681', bgGradient: 'from-[#6e7681]/20 to-[#6e7681]/5' },
  { icon: <Youtube className="w-5 h-5" />, label: 'YouTube', href: '#', brandColor: '#FF0000', bgGradient: 'from-[#FF0000]/20 to-[#FF0000]/5' },
]

/* Accent colors for FAQ items — avoids indigo/blue as primary */
const FAQ_ACCENTS = [
  { num: '01', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { num: '02', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { num: '03', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  { num: '04', color: 'text-[var(--gg-teal)]', bg: 'bg-[var(--gg-teal)]/10', border: 'border-[var(--gg-teal)]/20' },
  { num: '05', color: 'text-[var(--gg-violet)]', bg: 'bg-[var(--gg-violet)]/10', border: 'border-[var(--gg-violet)]/20' },
]

/* Contact info accent colors and larger icon mapping */
const CONTACT_ACCENTS = [
  { accent: 'border-l-primary', glow: 'shadow-primary/10', iconBg: 'bg-primary/15', largeIcon: <Mail className="w-6 h-6 text-primary" /> },
  { accent: 'border-l-[var(--gg-violet)]', glow: 'shadow-[var(--gg-violet)]/10', iconBg: 'bg-[var(--gg-violet)]/15', largeIcon: <Phone className="w-6 h-6 text-[var(--gg-violet)]" /> },
  { accent: 'border-l-[var(--gg-green)]', glow: 'shadow-[var(--gg-green)]/10', iconBg: 'bg-[var(--gg-green)]/15', largeIcon: <MapPin className="w-6 h-6 text-[var(--gg-green)]" /> },
  { accent: 'border-l-[var(--gg-amber)]', glow: 'shadow-[var(--gg-amber)]/10', iconBg: 'bg-[var(--gg-amber)]/15', largeIcon: <Clock className="w-6 h-6 text-[var(--gg-amber)]" /> },
]

export function ContactPage() {
  const { navigate } = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    toast.success("Message sent successfully! We'll get back to you within 24 hours.")

    setFormData({
      name: '',
      email: '',
      company: '',
      subject: 'General Inquiry',
      message: '',
    })
    setIsSubmitting(false)
  }

  return (
    <PageLayout>
      {/* ═══════════════════════════════════════════════════════════
          HERO — Full-width split: Form (60%) + Contact Info (40%)
          Geometric pattern overlay, gradient background, no separate hero
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-0 sm:pt-24 overflow-hidden">
        {/* Gradient background with geometric pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
            backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          }}
        />
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--gg-teal)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

            {/* ─── LEFT: Contact Form (60%) — Dark frosted glass card ─── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-3 pb-16 sm:pb-24"
            >
              {/* Intro text — replaces centered hero */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--gg-teal)]" />
                  <span>We&apos;d love to hear from you</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight"
                >
                  Get in{' '}
                  <span className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] bg-clip-text text-transparent">
                    Touch
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-3 text-muted-foreground max-w-lg leading-relaxed"
                >
                  Whether you have a question, need a demo, or want to discuss a custom solution —
                  we&apos;re here to help.
                </motion.p>
              </div>

              {/* Dark frosted glass form card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden"
              >
                {/* Gradient stripe at top */}
                <div className="h-1.5 bg-gradient-to-r from-[var(--gg-vermillion)] via-[var(--gg-amber)] to-[var(--gg-teal)]" />

                {/* Card body — dark frosted glass */}
                <div
                  className="relative p-6 sm:p-8"
                  style={{
                    background: 'color-mix(in srgb, var(--card) 80%, transparent)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                    borderLeft: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                    borderRight: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                    borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                    borderBottomLeftRadius: '1rem',
                    borderBottomRightRadius: '1rem',
                  }}
                >
                  <h2 className="text-lg font-extrabold text-foreground mb-1">Send us a message</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Fill out the form below and our team will respond within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Name field with floating-style label effect */}
                      <div className="relative space-y-1.5">
                        <label
                          className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                            focusedField === 'name' ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'
                          }`}
                        >
                          Name <span className="text-[var(--gg-teal)]">*</span>
                        </label>
                        <div
                          className={`relative rounded-xl transition-all duration-300 ${
                            focusedField === 'name'
                              ? 'shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_0_12px_rgba(6,182,212,0.08)]'
                              : ''
                          }`}
                        >
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Your name"
                            className="bg-secondary/40 border-border/60 focus:border-[var(--gg-teal)]/50 focus:ring-[var(--gg-teal)]/20 rounded-xl h-11 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      {/* Email field */}
                      <div className="relative space-y-1.5">
                        <label
                          className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                            focusedField === 'email' ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'
                          }`}
                        >
                          Email <span className="text-[var(--gg-teal)]">*</span>
                        </label>
                        <div
                          className={`relative rounded-xl transition-all duration-300 ${
                            focusedField === 'email'
                              ? 'shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_0_12px_rgba(6,182,212,0.08)]'
                              : ''
                          }`}
                        >
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="you@company.com"
                            className="bg-secondary/40 border-border/60 focus:border-[var(--gg-teal)]/50 focus:ring-[var(--gg-teal)]/20 rounded-xl h-11 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Company field */}
                      <div className="relative space-y-1.5">
                        <label
                          className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                            focusedField === 'company' ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'
                          }`}
                        >
                          Company
                        </label>
                        <div
                          className={`relative rounded-xl transition-all duration-300 ${
                            focusedField === 'company'
                              ? 'shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_0_12px_rgba(6,182,212,0.08)]'
                              : ''
                          }`}
                        >
                          <Input
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('company')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Company name"
                            className="bg-secondary/40 border-border/60 focus:border-[var(--gg-teal)]/50 focus:ring-[var(--gg-teal)]/20 rounded-xl h-11 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Subject field */}
                      <div className="relative space-y-1.5">
                        <label
                          className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                            focusedField === 'subject' ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'
                          }`}
                        >
                          Subject
                        </label>
                        <div
                          className={`relative rounded-xl transition-all duration-300 ${
                            focusedField === 'subject'
                              ? 'shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_0_12px_rgba(6,182,212,0.08)]'
                              : ''
                          }`}
                        >
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            onFocus={() => setFocusedField('subject')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full h-11 rounded-xl bg-secondary/40 border border-border/60 text-sm text-foreground px-3 focus:border-[var(--gg-teal)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--gg-teal)]/20 appearance-none cursor-pointer transition-all duration-300"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2386868B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 12px center',
                            }}
                          >
                            {SUBJECT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-card text-foreground">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Message field */}
                    <div className="relative space-y-1.5">
                      <label
                        className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                          focusedField === 'message' ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'
                        }`}
                      >
                        Message <span className="text-[var(--gg-teal)]">*</span>
                      </label>
                      <div
                        className={`relative rounded-xl transition-all duration-300 ${
                          focusedField === 'message'
                            ? 'shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_0_12px_rgba(6,182,212,0.08)]'
                            : ''
                        }`}
                      >
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Tell us about your needs, challenges, and what you're looking for..."
                          rows={5}
                          className="bg-secondary/40 border-border/60 focus:border-[var(--gg-teal)]/50 focus:ring-[var(--gg-teal)]/20 rounded-xl resize-none transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Gradient submit button */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full font-semibold rounded-xl h-12 disabled:opacity-60 relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                        boxShadow: 'var(--gg-shadow-glow)',
                      }}
                    >
                      {/* Shimmer overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                      <span className="relative flex items-center justify-center gap-2 text-white">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <Send className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>
                </div>
              </motion.div>
            </motion.div>

            {/* ─── RIGHT: Contact Info (40%) — Vertical stack with colored accents ─── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="lg:col-span-2 space-y-4 pt-0 sm:pt-28 pb-16 sm:pb-24"
            >
              {CONTACT_INFO.map((info, i) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
                    <div
                      className={`bg-card rounded-xl p-5 border-l-4 ${CONTACT_ACCENTS[i].accent}`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${CONTACT_ACCENTS[i].iconBg} flex items-center justify-center shrink-0`}
                        >
                          {CONTACT_ACCENTS[i].largeIcon}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            {info.label}
                          </p>
                          <p className="text-foreground font-semibold mt-0.5 text-base">
                            {info.value}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{info.desc}</p>
                        </div>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}

              {/* Enterprise CTA Card — with gradient accent */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <InteractiveCard variant="default" glowColor="var(--gg-green)">
                  <div className="bg-gradient-to-br from-[var(--gg-vermillion)]/10 to-[var(--gg-amber)]/10 rounded-xl p-5 border-l-4 border-l-emerald-400">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Headphones className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Need immediate help?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          Enterprise customers get 24/7 dedicated support with guaranteed response
                          times.
                        </p>
                        <button
                          onClick={() => navigate('pricing')}
                          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 font-medium"
                        >
                          View Enterprise Plan <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OFFICE SECTION — Full-width gradient card with decorative elements
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 border-t border-border overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Our{' '}
              <span className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] bg-clip-text text-transparent">
                Office
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Located in the heart of Lahore&apos;s business district.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--gg-shadow-card)]">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-secondary/50" />

              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Building silhouettes */}
                <Building2 className="absolute top-8 right-8 w-24 h-24 text-foreground/[0.03] rotate-12" />
                <Building2 className="absolute bottom-12 left-12 w-16 h-16 text-foreground/[0.03] -rotate-6" />
                <MapPin className="absolute top-12 left-1/4 w-10 h-10 text-[var(--gg-teal)]/[0.06]" />
                <MapPin className="absolute bottom-8 right-1/4 w-8 h-8 text-emerald-500/[0.06]" />
                {/* Geometric lines */}
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                  }}
                />
              </div>

              <div className="relative">
                {/* Map area with stylized pin */}
                <div className="relative aspect-[21/9] bg-secondary/20 flex items-center justify-center overflow-hidden">
                  {/* Grid lines overlay */}
                  <div className="absolute inset-0 opacity-[0.05]">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                      }}
                    />
                  </div>

                  {/* Pulsing ring around pin */}
                  <div className="absolute flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border border-[var(--gg-teal)]/20 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                    <div className="absolute w-20 h-20 rounded-full border border-[var(--gg-teal)]/15" />
                  </div>

                  {/* Location Pin */}
                  <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="relative"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gg-vermillion)] to-[var(--gg-amber)] flex items-center justify-center shadow-lg shadow-[var(--gg-vermillion)]/20">
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 text-center"
                    >
                      <p className="text-foreground font-semibold text-lg">Lahore, Pakistan</p>
                      <p className="text-sm text-muted-foreground mt-1">Gulberg III, Punjab</p>
                    </motion.div>
                  </div>
                </div>

                {/* Info Bar with gradient dividers */}
                <div className="grid grid-cols-3 relative">
                  {/* Gradient dividers between columns */}
                  <div className="absolute left-1/3 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                  <div className="absolute left-2/3 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                  <div className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <Building2 className="w-4 h-4 text-[var(--gg-teal)]" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Type</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Headquarters</p>
                  </div>
                  <div className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <Clock className="w-4 h-4 text-[var(--gg-amber)]" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Hours</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">9AM–6PM PKT</p>
                  </div>
                  <div className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Region</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">South Asia</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ SECTION — 2-column grid with colored numbers
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Quick answers to common questions. Can&apos;t find what you need? Contact us above.
            </p>
          </motion.div>

          {/* 2-column grid for FAQ */}
          <div className="grid sm:grid-cols-2 gap-4">
            {FAQS.map((faq, i) => {
              const accent = FAQ_ACCENTS[i]
              const isOpen = openFaq === i

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`${i === FAQS.length - 1 && FAQS.length % 2 !== 0 ? 'sm:col-span-2 sm:max-w-md sm:mx-auto' : ''}`}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
                    <div className="gg-card bg-card rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full flex items-start justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Colored number */}
                          <span
                            className={`text-lg font-black ${accent.color} ${accent.bg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            {accent.num}
                          </span>
                          <span className="text-sm sm:text-base font-medium text-foreground pr-4">
                            {faq.q}
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="shrink-0 mt-1"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? 'auto' : 0,
                          opacity: isOpen ? 1 : 0,
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 ml-12">
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SOCIAL SECTION — Larger cards with brand colors & hover reveal
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Connect with{' '}
              <span className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] bg-clip-text text-transparent">
                Us
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Follow us on social media for the latest updates, tips, and announcements.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SOCIAL_LINKS.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group relative rounded-xl overflow-hidden cursor-pointer"
                style={{
                  border: `1px solid color-mix(in srgb, ${social.brandColor} 20%, var(--border))`,
                }}
                aria-label={social.label}
              >
                {/* Brand color top accent */}
                <div
                  className="h-1 transition-all duration-300 group-hover:h-1.5"
                  style={{ background: social.brandColor }}
                />

                <div className="bg-card p-5 flex flex-col items-center gap-3 relative overflow-hidden">
                  {/* Hover background reveal */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${social.brandColor} 8%, transparent), transparent)`,
                    }}
                  />

                  {/* Icon with brand color on hover */}
                  <div
                    className="relative w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div
                      className="opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: social.brandColor }}
                    >
                      {social.icon &&
                        (() => {
                          // Re-render icon with brand color
                          const iconMap: Record<string, React.ReactNode> = {
                            Twitter: <Twitter className="w-5 h-5" />,
                            LinkedIn: <Linkedin className="w-5 h-5" />,
                            GitHub: <Github className="w-5 h-5" />,
                            YouTube: <Youtube className="w-5 h-5" />,
                          }
                          return iconMap[social.label] || social.icon
                        })()}
                    </div>
                  </div>

                  {/* Platform name — revealed on hover */}
                  <div className="relative text-center">
                    <span
                      className="text-xs font-semibold opacity-60 group-hover:opacity-100 transition-all duration-300"
                      style={{ color: social.brandColor }}
                    >
                      {social.label}
                    </span>
                    <div className="flex items-center justify-center mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <span className="text-[10px] text-muted-foreground">Follow</span>
                      <ArrowRight className="w-2.5 h-2.5 ml-0.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
