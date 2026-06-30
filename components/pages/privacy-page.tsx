'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { motion } from 'framer-motion'
import { Shield, ChevronDown, Mail, MapPin, ArrowRight, Database, Eye, Lock, Cookie, Users, Globe, Baby, Bell, UserCheck } from 'lucide-react'
import { useNavigate } from '@/lib/use-navigate'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { InteractiveCard } from '@/components/shared/interactive-card'

/* ------------------------------------------------------------------ */
/*  Section Data                                                       */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    icon: Database,
    paragraphs: [
      'We collect information you provide directly to us, information collected automatically when you use our Services, and information from third-party sources. This policy describes each category in detail.',
    ],
    subsections: [
      {
        title: 'Personal Data',
        content: 'When you create an account, make a purchase, or contact us, we collect your name, email address, company name, phone number, billing address, and payment information. If you invite team members, we collect their names and email addresses as well.',
      },
      {
        title: 'Technical Data',
        content: 'We automatically collect certain technical information when you use our Services, including your IP address, browser type and version, operating system, device identifiers, referring URLs, and information about how you interact with our platform — such as pages visited, features used, and time spent on each section.',
      },
      {
        title: 'Usage Data',
        content: 'We collect data about your use of the Services, including the ERP modules you access, API calls made, data sync activities, reports generated, and configuration changes. This helps us improve the platform and provide relevant support.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    icon: Eye,
    paragraphs: [
      'We use the information we collect for the following purposes:',
    ],
    subsections: [
      {
        title: 'Service Delivery',
        content: 'To provide, maintain, and improve our Services, process your transactions, and deliver the ERP functionality you subscribe to. This includes managing your account, processing payments, and providing customer support.',
      },
      {
        title: 'Communication',
        content: 'To send you technical notices, updates, security alerts, and administrative messages. We may also send product announcements and marketing communications, which you can opt out of at any time.',
      },
      {
        title: 'Analytics & Improvement',
        content: 'To monitor and analyze trends, usage patterns, and activities on our platform. This helps us understand how users interact with our Services and identify areas for improvement.',
      },
      {
        title: 'Security',
        content: 'To detect, investigate, and prevent security incidents, fraud, and other illegal activities. We use automated systems and manual reviews to protect our platform and users.',
      },
    ],
  },
  {
    id: 'information-sharing',
    title: '3. Information Sharing',
    icon: Users,
    paragraphs: [
      'We are committed to protecting your information. We do not sell, trade, or rent your personal information to third parties.',
    ],
    subsections: [
      {
        title: 'No Selling of Data',
        content: 'ApexFlow will never sell your personal data to advertisers, data brokers, or any other third party for monetary gain. Your data is used solely to deliver and improve the Services you subscribe to.',
      },
      {
        title: 'Service Providers',
        content: 'We may share your information with trusted service providers who perform services on our behalf, such as cloud hosting providers (Neon PostgreSQL), payment processors, email delivery services, and analytics platforms. These providers are contractually obligated to use your information only as directed by us.',
      },
      {
        title: 'Legal Requirements',
        content: 'We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, respond to a court order, subpoena, or other lawful governmental request, or comply with applicable laws and regulations.',
      },
    ],
  },
  {
    id: 'data-security',
    title: '4. Data Security',
    icon: Lock,
    paragraphs: [
      'We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.',
    ],
    subsections: [
      {
        title: 'Encryption',
        content: 'All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. Database-level encryption is applied to all stored information on our Neon PostgreSQL infrastructure.',
      },
      {
        title: 'Access Controls',
        content: 'We enforce role-based access controls (RBAC) internally, ensuring that only authorized personnel have access to your data. All access is logged and audited regularly.',
      },
      {
        title: 'Monitoring',
        content: 'Our security team monitors systems 24/7 with automated threat detection and alerting. Suspicious activities are investigated and addressed promptly, with incidents resolved under our <1 hour response SLA.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    icon: UserCheck,
    paragraphs: [
      'You have the following rights regarding your personal information:',
    ],
    subsections: [
      {
        title: 'Access & Update',
        content: 'You can access and update your personal information at any time through your account settings. You may also request a complete copy of the data we hold about you.',
      },
      {
        title: 'Delete',
        content: 'You have the right to request deletion of your personal information, subject to our legal obligations and legitimate business requirements to retain certain data.',
      },
      {
        title: 'Restrict & Object',
        content: 'You may request that we restrict the processing of your personal data or object to certain types of processing, such as direct marketing. To exercise any of these rights, contact us at privacy@apexflow.cloud.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    icon: Database,
    paragraphs: [
      'We retain your personal information for as long as your account is active or as needed to provide you Services. We may also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.',
    ],
    subsections: [
      {
        title: 'Active Accounts',
        content: 'Data associated with active accounts is retained for the duration of the account. When you delete your account, we initiate a deletion process for your personal data within 30 days, except where retention is required by law.',
      },
      {
        title: 'Backups',
        content: 'Encrypted backups may contain your data for up to 90 days after account deletion, after which they are permanently purged from all systems.',
      },
    ],
  },
  {
    id: 'cookies-tracking',
    title: '7. Cookies & Tracking',
    icon: Cookie,
    paragraphs: [
      'We use cookies and similar tracking technologies to track activity on our Services and hold certain information.',
    ],
    subsections: [
      {
        title: 'Types of Cookies',
        content: 'We use essential cookies for authentication and security, performance cookies to analyze how you use our Services, and functionality cookies to remember your preferences. We do not use advertising cookies.',
      },
      {
        title: 'Managing Cookies',
        content: 'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Services, particularly authenticated features.',
      },
    ],
  },
  {
    id: 'third-party-services',
    title: '8. Third-Party Services',
    icon: Globe,
    paragraphs: [
      'Our Services may contain links to third-party websites or services that are not owned or controlled by ApexFlow.',
    ],
    subsections: [
      {
        title: 'External Links',
        content: 'Our platform may include links to third-party websites or integrations with third-party services. We are not responsible for the content, privacy policies, or practices of any third-party websites or services.',
      },
      {
        title: 'No Control Over Third Parties',
        content: 'We strongly advise you to review the terms and privacy policies of any third-party services you access through or in connection with our Services. ApexFlow shall not be held liable for any damage or loss caused by or in connection with the use of any third-party content, goods, or services.',
      },
    ],
  },
  {
    id: 'childrens-privacy',
    title: "9. Children's Privacy",
    icon: Baby,
    paragraphs: [
      'Our Services are not intended for children under the age of 13.',
    ],
    subsections: [
      {
        title: 'Not for Under 13',
        content: 'We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete such information immediately. If you believe that a child under 13 has provided us with personal information, please contact us at privacy@apexflow.cloud.',
      },
    ],
  },
  {
    id: 'changes-contact',
    title: '10. Changes & Contact',
    icon: Bell,
    paragraphs: [
      'We may update our Privacy Policy from time to time.',
    ],
    subsections: [
      {
        title: 'Updates Notification',
        content: 'We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. For material changes, we will also send an email notification to the address associated with your account. Your continued use of the Services after changes become effective constitutes acceptance of the updated policy.',
      },
      {
        title: 'Contact Information',
        content: 'If you have any questions about this Privacy Policy, please contact us at privacy@apexflow.cloud or write to us at: ApexFlow, Gulberg III, Lahore, Pakistan.',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PrivacyPage() {
  const { navigate } = useNavigate()
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  /* Intersection Observer – highlight current TOC item */
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
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">Privacy Policy</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: March 2025</p>
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
                        ? 'bg-primary/10 text-primary font-medium'
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
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary pl-[10px]'
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
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-border flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                      </div>

                      {section.paragraphs.map((p, pi) => (
                        <p key={pi} className="text-muted-foreground leading-relaxed mb-5">{p}</p>
                      ))}

                      <div className="space-y-5">
                        {section.subsections.map((sub) => (
                          <InteractiveCard key={sub.title} variant="subtle" glowColor="var(--gg-teal)">
                            <div className="bg-card rounded-xl p-5">
                              <h3 className="text-sm font-semibold text-foreground mb-2">{sub.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{sub.content}</p>
                            </div>
                          </InteractiveCard>
                        ))}
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
                      <Shield className="w-7 h-7 text-[var(--gg-teal)]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Questions about our privacy practices?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      We&apos;re happy to address any concerns about how we handle your data. Our team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] text-foreground font-medium btn-glow rounded-xl px-6 h-11"
                        onClick={() => navigate('contact')}
                      >
                        Contact Our Team <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <a
                        href="mailto:privacy@apexflow.cloud"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gg-teal)] transition-colors"
                      >
                        <Mail className="w-4 h-4" /> privacy@apexflow.cloud
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
