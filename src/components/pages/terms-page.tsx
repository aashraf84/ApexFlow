'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { motion } from 'framer-motion'
import { FileText, ChevronDown, Mail, MapPin, ArrowRight, CheckCircle2, Briefcase, UserPlus, ShieldAlert, CreditCard, Lightbulb, Database, AlertOctagon, Scale, Gavel } from 'lucide-react'
import { useNavigate } from '@/lib/use-navigate'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { useContent } from '@/hooks/use-content'

/* ------------------------------------------------------------------ */
/*  Section Data                                                       */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: 'acceptance-of-terms',
    title: '1. Acceptance of Terms',
    icon: CheckCircle2,
    paragraphs: [
      'By accessing or using the ApexFlow platform and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.',
    ],
    subsections: [
      {
        title: 'Agreement to Terms',
        content: 'These Terms apply to all visitors, users, and others who access or use the Services. By creating an account or using any part of the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.',
      },
      {
        title: 'Changes to Terms',
        content: 'We reserve the right to modify these Terms at any time. Material changes will be communicated via email to the address associated with your account at least 30 days before they take effect. Your continued use of the Services after changes become effective constitutes acceptance of the revised Terms.',
      },
    ],
  },
  {
    id: 'description-of-service',
    title: '2. Description of Service',
    icon: Briefcase,
    paragraphs: [
      'ApexFlow provides cloud-based enterprise resource planning (ERP) software solutions tailored to specific industries.',
    ],
    subsections: [
      {
        title: 'Cloud AI Powered OS for Specific Industries',
        content: 'Our Services include industry-specific ERP platforms covering apparel & textile, hospitality, education, and additional verticals. Each platform provides purpose-built modules, data synchronization, API integrations, reporting, and support as described in your subscription plan.',
      },
      {
        title: 'Service Scope',
        content: 'The specific features and functionality available to you depend on your selected subscription plan and the ERP system(s) you subscribe to. We reserve the right to modify, suspend, or discontinue any part of the Services with reasonable notice.',
      },
    ],
  },
  {
    id: 'account-registration',
    title: '3. Account Registration',
    icon: UserPlus,
    paragraphs: [
      'To use certain features of the Services, you must register for an account.',
    ],
    subsections: [
      {
        title: 'Accurate Information',
        content: 'You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. Providing false or misleading information may result in immediate termination of your account.',
      },
      {
        title: 'Password Security',
        content: 'You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We will not be liable for any loss or damage arising from your failure to maintain the security of your account.',
      },
    ],
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use',
    icon: ShieldAlert,
    paragraphs: [
      'You agree not to use the Services in any way that could damage, disable, or impair the platform or interfere with any other party&apos;s use.',
    ],
    subsections: [
      {
        title: 'Prohibited Activities',
        content: 'You agree not to: violate any applicable laws or regulations; infringe the rights of any third party; transmit any malware, viruses, or harmful code; attempt to gain unauthorized access to our systems or networks; interfere with or disrupt the integrity or performance of the Services; use the Services to compete directly with ApexFlow; or use automated tools to scrape, crawl, or extract data without prior written consent.',
      },
      {
        title: 'Consequences of Violation',
        content: 'Violation of these acceptable use policies may result in warning, temporary suspension, or permanent termination of your account at our sole discretion. We may also pursue legal action if your violation causes harm to ApexFlow, our users, or third parties.',
      },
    ],
  },
  {
    id: 'payment-terms',
    title: '5. Payment Terms',
    icon: CreditCard,
    paragraphs: [
      'Subscription fees are billed in Pakistani Rupees (PKR) on a recurring basis as selected during signup.',
    ],
    subsections: [
      {
        title: 'PKR Billing & Plans',
        content: 'All subscription fees are billed in Pakistani Rupees (PKR). You may choose monthly or annual billing. Annual plans are billed upfront and may include a discount. All prices are exclusive of applicable taxes, which will be added to your invoice as required by law.',
      },
      {
        title: 'Refund Policy',
        content: 'All fees are non-refundable except as expressly set forth in these Terms or required by applicable law. If you cancel an annual subscription, no prorated refund will be issued for the remaining period. Monthly subscriptions remain active until the end of the current billing cycle.',
      },
      {
        title: 'Pricing Changes',
        content: 'We reserve the right to change our pricing with 30 days\' advance notice. Price increases will apply at the start of your next billing cycle following the notice period. You may cancel your subscription before the new pricing takes effect if you do not agree to the change.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    icon: Lightbulb,
    paragraphs: [
      'The Services and all content, features, and functionality thereof are owned by ApexFlow and protected by international intellectual property laws.',
    ],
    subsections: [
      {
        title: 'Ownership',
        content: 'All text, graphics, logos, icons, images, software, code, documentation, and the overall design and arrangement of the Services are the exclusive property of ApexFlow. This includes our industry-specific ERP modules, sync engine technology, and all proprietary algorithms.',
      },
      {
        title: 'No Transfer of Rights',
        content: 'Your subscription does not transfer any ownership rights, title, or interest in the Services or any intellectual property therein. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Services solely in accordance with these Terms.',
      },
    ],
  },
  {
    id: 'data-content',
    title: '7. Data & Content',
    icon: Database,
    paragraphs: [
      'You retain ownership of all data you submit to the Services. We process it only as necessary to deliver the Services.',
    ],
    subsections: [
      {
        title: 'User Data Ownership',
        content: 'All data, records, documents, and information you upload, input, or generate through the Services ("User Data") remains your property. ApexFlow does not claim any ownership rights over your User Data. You are responsible for the accuracy, legality, and appropriateness of your User Data.',
      },
      {
        title: 'Our License to Process',
        content: 'By submitting User Data to the Services, you grant ApexFlow a limited, non-exclusive license to process, store, and transmit your data solely for the purpose of providing the Services. This license terminates upon deletion of your data or termination of your account.',
      },
    ],
  },
  {
    id: 'limitation-of-liability',
    title: '8. Limitation of Liability',
    icon: AlertOctagon,
    paragraphs: [
      'To the maximum extent permitted by applicable law:',
    ],
    subsections: [
      {
        title: 'No Indirect or Punitive Damages',
        content: 'In no event shall ApexFlow, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Services.',
      },
      {
        title: 'Liability Cap',
        content: 'ApexFlow\'s total cumulative liability arising out of or related to these Terms or the Services shall not exceed the total amount paid by you to ApexFlow during the twelve (12) months preceding the event giving rise to the claim.',
      },
    ],
  },
  {
    id: 'termination',
    title: '9. Termination',
    icon: Scale,
    paragraphs: [
      'Either party may terminate the subscription under the following conditions:',
    ],
    subsections: [
      {
        title: 'Conditions for Termination',
        content: 'We may terminate or suspend your account immediately, without prior notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties. You may terminate your account at any time through your account settings or by contacting us.',
      },
      {
        title: 'Effects of Termination',
        content: 'Upon termination, your right to use the Services will immediately cease. We will retain your User Data for 30 days after termination to allow you to export it. After this period, your data will be permanently deleted from our active systems and purged from encrypted backups within 90 days.',
      },
    ],
  },
  {
    id: 'governing-law-contact',
    title: '10. Governing Law & Contact',
    icon: Gavel,
    paragraphs: [
      'These Terms shall be governed and construed in accordance with the laws of Pakistan.',
    ],
    subsections: [
      {
        title: 'Pakistan Law & Lahore Courts',
        content: 'These Terms shall be governed and construed in accordance with the laws of the Islamic Republic of Pakistan, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.',
      },
      {
        title: 'Contact Information',
        content: 'If you have any questions about these Terms, please contact us at legal@apexflow.cloud or write to us at: ApexFlow, Gulberg III, Lahore, Pakistan.',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TermsPage() {
  const { navigate } = useNavigate()
  // Pull admin-editable content overrides. Falls back to the hardcoded
  // SECTIONS values below when no override exists (or when the public
  // /api/content fetch fails). Keys live under page='Terms'.
  const { get: getContent } = useContent()
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(s.id)
        },
        { rootMargin: '-20% 0px -60% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileTocOpen(false)
  }, [])

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-1.5 mb-6">
              <FileText className="w-3.5 h-3.5 text-[var(--gg-violet)]" />
              <span className="text-xs text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">{getContent('Terms', 'terms_page_title', 'Terms of Service')}</h1>
            <p className="mt-4 text-sm text-muted-foreground">{getContent('Terms', 'terms_page_description', 'Last updated: March 2025')}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Mobile TOC Toggle ────────────────────────────────── */}
      <section className="border-t border-border lg:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full flex items-center justify-between gg-card bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground"
          >
            <span>Table of Contents</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileTocOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileTocOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 gg-card bg-card border border-border rounded-xl overflow-hidden"
            >
              <nav className="p-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      activeId === s.id
                        ? 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sticky Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">On This Page</p>
                <nav className="space-y-1">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeId === s.id
                          ? 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] font-medium border-l-2 border-[var(--gg-violet)] pl-[10px]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="space-y-16">
                {SECTIONS.map((section, i) => {
                  const Icon = section.icon
                  // ── Apply admin overrides per section ────────────────────
                  const sectionTitle = getContent(
                    'Terms',
                    `terms_section_${i}_title`,
                    section.title
                  )
                  const sectionParagraph0 = getContent(
                    'Terms',
                    `terms_section_${i}_paragraph_0`,
                    section.paragraphs[0] ?? ''
                  )
                  return (
                    <motion.div
                      key={section.id}
                      id={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.04 }}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-[var(--gg-violet)]/10 border border-border flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5 text-[var(--gg-violet)]" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{sectionTitle}</h2>
                      </div>

                      {section.paragraphs.length > 0 && (
                        <p key={0} className="text-muted-foreground leading-relaxed mb-5">{sectionParagraph0}</p>
                      )}
                      {section.paragraphs.slice(1).map((p, pi) => (
                        <p key={pi + 1} className="text-muted-foreground leading-relaxed mb-5">{p}</p>
                      ))}

                      <div className="space-y-5">
                        {section.subsections.map((sub, si) => {
                          const subTitle = getContent(
                            'Terms',
                            `terms_section_${i}_subsection_${si}_title`,
                            sub.title
                          )
                          const subContent = getContent(
                            'Terms',
                            `terms_section_${i}_subsection_${si}_content`,
                            sub.content
                          )
                          return (
                            <InteractiveCard key={sub.title} variant="subtle" glowColor="var(--gg-teal)">
                              <div className="bg-card rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-foreground mb-2">{subTitle}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{subContent}</p>
                              </div>
                            </InteractiveCard>
                          )
                        })}
                      </div>

                      {i < SECTIONS.length - 1 && (
                        <div className="mt-16 border-t border-border" />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* ── Contact CTA Card ──────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-20"
              >
                <InteractiveCard variant="strong" glowColor="var(--gg-teal)">
                  <div className="gg-card bg-card rounded-2xl p-8 sm:p-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gg-vermillion)]/10 to-[var(--gg-amber)]/10 border border-border flex items-center justify-center mx-auto mb-5">
                      <FileText className="w-7 h-7 text-[var(--gg-violet)]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Questions about these terms?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Our legal team is happy to clarify any part of these terms. We believe in transparency and open communication.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-foreground font-medium btn-glow rounded-xl px-6 h-11"
                        onClick={() => navigate('contact')}
                      >
                        Contact Legal Team <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <a
                        href="mailto:legal@apexflow.cloud"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gg-violet)] transition-colors"
                      >
                        <Mail className="w-4 h-4" /> legal@apexflow.cloud
                      </a>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> Gulberg III, Lahore, Pakistan
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
