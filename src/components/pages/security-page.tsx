'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Server, CheckCircle2, AlertTriangle, ArrowRight, Mail, ExternalLink, ChevronRight } from 'lucide-react'
import { useNavigate } from '@/lib/use-navigate'
import { Button } from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const APPROACH = [
  { icon: Lock, color: 'text-primary', title: 'Encryption', desc: 'AES-256 encryption at rest, TLS 1.3 in transit. Your data is always protected.', bgClass: 'bg-primary/10' },
  { icon: CheckCircle2, color: 'text-[var(--gg-violet)]', title: 'Compliance', desc: 'SOC 2 Type II, GDPR, and industry-specific compliance frameworks.', bgClass: 'bg-[var(--gg-violet)]/10' },
  { icon: Server, color: 'text-[var(--gg-green)]', title: 'Infrastructure', desc: 'Enterprise-grade cloud infrastructure with 99.9% uptime SLA.', bgClass: 'bg-[var(--gg-green)]/10' },
  { icon: Eye, color: 'text-[var(--gg-amber)]', title: 'Monitoring', desc: '24/7 real-time monitoring, automated alerting, and incident response.', bgClass: 'bg-[var(--gg-amber)]/10' },
]

type AccentColor = 'cyan' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue'

const PRACTICES: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  accent: AccentColor
  points: string[]
}[] = [
  {
    icon: Lock,
    title: 'Data Encryption',
    accent: 'cyan',
    points: [
      'AES-256 encryption for all data at rest',
      'TLS 1.3 for all data in transit',
      'Database-level encryption on Neon PostgreSQL',
      'Encrypted backups with separate key management',
    ],
  },
  {
    icon: Shield,
    title: 'Access Controls',
    accent: 'violet',
    points: [
      'Role-based access control (RBAC)',
      'Multi-factor authentication (MFA)',
      'Single sign-on (SSO) via SAML 2.0',
      'Principle of least privilege',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    accent: 'emerald',
    points: [
      'VPC isolation for all production workloads',
      'Automated security patching',
      'Network segmentation and firewalls',
      'DDoS protection and rate limiting',
    ],
  },
  {
    icon: CheckCircle2,
    title: 'Compliance',
    accent: 'amber',
    points: [
      'SOC 2 Type II certification',
      'GDPR compliance',
      'Data residency options',
      'Regular third-party audits',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    accent: 'red',
    points: [
      '24/7 security operations center (SOC) team',
      'Documented incident response playbook',
      'Automated threat detection and alerting',
      '< 1 hour response time SLA',
    ],
  },
  {
    icon: Eye,
    title: 'Regular Audits',
    accent: 'blue',
    points: [
      'Quarterly penetration testing',
      'Annual third-party security audits',
      'Continuous vulnerability scanning',
      'Code review security gates',
    ],
  },
]

const ACCENT_MAP: Record<AccentColor, { text: string; dot: string; bg: string }> = {
  cyan: { text: 'text-primary', dot: 'bg-primary', bg: 'bg-primary/10' },
  violet: { text: 'text-[var(--gg-violet)]', dot: 'bg-[var(--gg-violet)]', bg: 'bg-[var(--gg-violet)]/10' },
  emerald: { text: 'text-[var(--gg-green)]', dot: 'bg-[var(--gg-green)]', bg: 'bg-[var(--gg-green)]/10' },
  amber: { text: 'text-[var(--gg-amber)]', dot: 'bg-[var(--gg-amber)]', bg: 'bg-[var(--gg-amber)]/10' },
  red: { text: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-400/10' },
  blue: { text: 'text-[var(--gg-teal)]', dot: 'bg-[var(--gg-teal)]', bg: 'bg-[var(--gg-teal)]/10' },
}

const COMPLIANCE_BADGES = [
  { label: 'SOC 2', sublabel: 'Type II', bgClass: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary' },
  { label: 'GDPR', sublabel: 'Compliant', bgClass: 'bg-[var(--gg-violet)]/10', border: 'border-[var(--gg-violet)]/20', text: 'text-[var(--gg-violet)]' },
  { label: 'ISO 27001', sublabel: 'Certified', bgClass: 'bg-[var(--gg-green)]/10', border: 'border-[var(--gg-green)]/20', text: 'text-[var(--gg-green)]' },
  { label: 'PKI', sublabel: 'Validated', bgClass: 'bg-[var(--gg-amber)]/10', border: 'border-[var(--gg-amber)]/20', text: 'text-[var(--gg-amber)]' },
]

const DISCLOSURE_GUIDELINES = [
  'Allow us reasonable time to respond and fix the issue before public disclosure',
  'Do not access, modify, or delete data belonging to others',
  'Do not degrade the quality of service for other users',
  'Make a good faith effort to avoid privacy violations',
  'Provide sufficient detail to reproduce and validate the vulnerability',
  'Do not use vulnerabilities for personal gain or to exploit other users',
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SecurityPage() {
  const { navigate } = useNavigate()

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-border flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Security at{' '}
              <span className="text-primary">ApexFlow</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Security isn&apos;t a feature — it&apos;s the foundation. Every layer of ApexFlow is built with enterprise-grade protection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Security Approach ─────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Our Security Approach</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Four pillars that define how we protect your data and operations.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {APPROACH.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-teal)">
                    <div className="gg-card bg-card rounded-2xl p-6 text-center group">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Security Practices ────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Security Practices</h2>
            <p className="mt-3 text-muted-foreground">Detailed security measures across every layer of our platform.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRACTICES.map((practice, i) => {
              const Icon = practice.icon
              const accent = ACCENT_MAP[practice.accent]
              return (
                <motion.div
                  key={practice.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
                    <div className="gg-card bg-card rounded-2xl p-6 group">
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-5 h-5 ${accent.text}`} />
                        </div>
                        <h3 className="font-semibold text-foreground">{practice.title}</h3>
                      </div>
                      <ul className="space-y-3">
                        {practice.points.map((point) => (
                          <li key={point} className="text-sm text-muted-foreground flex items-start gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${accent.dot} mt-2 shrink-0`} />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Compliance Badges ─────────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Compliance & Certifications</h2>
            <p className="mt-3 text-muted-foreground">Independently verified security and compliance standards.</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPLIANCE_BADGES.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                  <div className="gg-card bg-card rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                    <div className={`w-14 h-14 rounded-2xl border ${badge.border} bg-gradient-to-br ${badge.bgClass} flex items-center justify-center mb-4`}>
                      <Shield className={`w-7 h-7 ${badge.text}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${badge.text} mb-1`}>{badge.label}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{badge.sublabel}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Responsible Disclosure ────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <InteractiveCard variant="default" glowColor="var(--gg-teal)">
              <div className="gg-card bg-card rounded-2xl p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-extrabold">Responsible Disclosure</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We take security vulnerabilities seriously. If you discover a security issue in any ApexFlow product or service, we encourage you to report it responsibly. We ask that you follow these guidelines:
                </p>
                <ul className="space-y-3 mb-8">
                  {DISCLOSURE_GUIDELINES.map((guideline) => (
                    <li key={guideline} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-[var(--gg-teal)] mt-0.5 shrink-0" />
                      {guideline}
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary border border-border rounded-xl p-5 mb-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We commit to acknowledging your report within 24 hours, providing a detailed response within 72 hours, and keeping you informed of our progress throughout the resolution. We also maintain a public recognition page for security researchers who help keep ApexFlow safe.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button
                    className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-foreground font-medium btn-glow rounded-xl px-6 h-11"
                    onClick={() => navigate('contact')}
                  >
                    Report a Security Issue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <a
                      href="mailto:security@apexflow.cloud"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gg-teal)] transition-colors"
                    >
                      <Mail className="w-4 h-4" /> security@apexflow.cloud
                    </a>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> PGP Key Available
                    </span>
                  </div>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>

      {/* ── Security Contact CTA ──────────────────────────────── */}
      <section className="py-20 border-t border-border bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InteractiveCard variant="strong" glowColor="var(--gg-teal)">
              <div className="gg-card bg-card rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gg-vermillion)]/10 to-[var(--gg-amber)]/10 border border-border flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-[var(--gg-teal)]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Your Security is Our Priority</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                  Have questions about our security practices or need to report a vulnerability? Our security team is ready to help.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-foreground font-semibold btn-glow rounded-xl px-8 h-12"
                    onClick={() => navigate('contact')}
                  >
                    Contact Security Team <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/[0.12] text-foreground hover:bg-secondary rounded-xl px-8 h-12"
                    onClick={() => navigate('legal-privacy')}
                  >
                    View Privacy Policy
                  </Button>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
