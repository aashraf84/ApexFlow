'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { motion } from 'framer-motion'
import { RotateCcw, ChevronDown, Mail, MapPin, ArrowRight, CreditCard, Clock, ShieldCheck, AlertCircle, XCircle, CheckCircle2, CalendarDays, HelpCircle, Gavel } from 'lucide-react'
import { useNavigate } from '@/lib/use-navigate'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { useContent } from '@/hooks/use-content'

/* ------------------------------------------------------------------ */
/*  Section Data                                                       */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    icon: RotateCcw,
    paragraphs: [
      'At ApexFlow, we strive to deliver exceptional enterprise software solutions. We understand that circumstances may change, and we want to be transparent about our refund and cancellation policies. This Refund Policy outlines the conditions under which refunds may be issued for our subscription-based ERP services.',
      'By purchasing a subscription to any ApexFlow product, you acknowledge that you have read and understood this Refund Policy. This policy forms part of our Terms of Service and should be read in conjunction with them.',
    ],
    subsections: [],
  },
  {
    id: 'subscription-cancellations',
    title: '2. Subscription Cancellations',
    icon: XCircle,
    paragraphs: [
      'You may cancel your subscription at any time through your account settings or by contacting our support team.',
    ],
    subsections: [
      {
        title: 'Monthly Subscriptions',
        content: 'Monthly subscriptions can be cancelled at any time. Upon cancellation, your subscription will remain active until the end of the current billing period. No further charges will be applied. No partial refund will be issued for unused days within the current billing cycle.',
      },
      {
        title: 'Annual Subscriptions',
        content: 'Annual subscriptions can be cancelled at any time. However, annual plans are paid upfront and are non-refundable for the remainder of the subscription period. Upon cancellation, your subscription will remain active until the end of the annual billing cycle. You will not be charged for the next renewal period.',
      },
      {
        title: 'Cancellation Process',
        content: 'To cancel your subscription, navigate to Account Settings → Billing → Manage Subscription, or contact our support team at billing@apexflow.cloud. Cancellation requests are processed within 24 hours. You will receive a confirmation email once the cancellation is effective.',
      },
    ],
  },
  {
    id: 'refund-eligibility',
    title: '3. Refund Eligibility',
    icon: ShieldCheck,
    paragraphs: [
      'We offer refunds under specific circumstances to ensure fairness and protect both our customers and our business.',
    ],
    subsections: [
      {
        title: '14-Day Money-Back Guarantee (New Subscribers)',
        content: 'First-time subscribers to any ApexFlow ERP product are eligible for a full refund within 14 calendar days of the initial purchase date. This applies to both monthly and annual plans. The refund will be processed to the original payment method within 5-10 business days. This guarantee applies once per customer per product.',
      },
      {
        title: 'Service Outage Credits',
        content: 'If we fail to meet our 99.9% uptime SLA in any calendar month, affected customers are eligible for a service credit equal to 10x the duration of downtime applied to their next invoice. For example, 1 hour of downtime beyond the SLA results in a 10-hour credit. Credits must be requested within 30 days of the incident.',
      },
      {
        title: 'Duplicate Charges',
        content: 'If you are charged twice for the same subscription period due to a billing error, the duplicate charge will be refunded in full within 5 business days of reporting the issue. Contact billing@apexflow.cloud with your invoice details.',
      },
      {
        title: 'Non-Refundable Scenarios',
        content: 'Refunds are not available for: unused time on monthly subscriptions after the 14-day guarantee period; remaining time on annual subscriptions after the 14-day guarantee period; downgrades from a higher-tier plan to a lower-tier plan; add-on modules or features purchased separately; professional services, custom development, or consulting fees; subscriptions terminated for Terms of Service violations.',
      },
    ],
  },
  {
    id: 'refund-request-process',
    title: '4. Refund Request Process',
    icon: HelpCircle,
    paragraphs: [
      'To request a refund, follow the steps below. We aim to process all legitimate refund requests promptly and fairly.',
    ],
    subsections: [
      {
        title: 'How to Request',
        content: 'Submit a refund request by emailing billing@apexflow.cloud with the subject line "Refund Request — [Your Company Name]". Include your account ID, subscription details, reason for the refund, and the date of purchase. Our billing team will review your request within 2 business days.',
      },
      {
        title: 'Required Information',
        content: 'To process your refund efficiently, please provide: your registered email address, the ERP product name (e.g., ApparelFlow, HotelFlow), your subscription plan and billing cycle, the invoice number or transaction ID, and a brief description of the reason for the refund request.',
      },
      {
        title: 'Review Timeline',
        content: 'We will acknowledge your refund request within 2 business days and provide a decision within 5 business days. If additional information is required, we will contact you via email. Approved refunds are processed within 5-10 business days to the original payment method.',
      },
    ],
  },
  {
    id: 'refund-methods',
    title: '5. Refund Methods & Timeline',
    icon: CreditCard,
    paragraphs: [
      'Refunds are processed using the same payment method used for the original purchase.',
    ],
    subsections: [
      {
        title: 'Credit / Debit Card',
        content: 'Refunds to credit or debit cards are processed within 5-10 business days. The refund will appear on your statement as "APEXFLOW REFUND" or similar. Please note that your bank may take an additional 3-5 business days to reflect the refund in your account.',
      },
      {
        title: 'Bank Transfer',
        content: 'For payments made via bank transfer, refunds will be issued to the originating bank account. Processing time is typically 7-14 business days depending on the banking institution and country. Bank transfer fees, if any, are the responsibility of the customer.',
      },
      {
        title: 'Service Credits',
        content: 'In certain cases, we may offer service credits as an alternative to monetary refunds. Service credits are applied to your next invoice and have no cash value. You will be given the choice between a monetary refund and service credits when your refund is approved.',
      },
    ],
  },
  {
    id: 'partial-refunds',
    title: '6. Partial Refunds & Prorations',
    icon: CalendarDays,
    paragraphs: [
      'ApexFlow does not offer partial refunds for unused subscription periods beyond the 14-day money-back guarantee.',
    ],
    subsections: [
      {
        title: 'No Prorated Refunds',
        content: 'We do not offer prorated refunds for unused time within a billing cycle. If you cancel your subscription, you will retain access to the service until the end of the current billing period, but no refund will be issued for the remaining days or months.',
      },
      {
        title: 'Mid-Cycle Downgrades',
        content: 'If you downgrade from a higher-tier plan to a lower-tier plan mid-cycle, the price difference will not be refunded. The lower-tier pricing will take effect at the start of the next billing cycle. You will retain access to the higher-tier features until the end of the current billing period.',
      },
      {
        title: 'Plan Changes',
        content: 'Upgrades take effect immediately, and you will be charged the prorated difference for the remaining billing period. Downgrades take effect at the next billing cycle renewal date. No refunds are issued for plan changes within a billing cycle.',
      },
    ],
  },
  {
    id: 'promotional-discounts',
    title: '7. Promotional & Discounted Plans',
    icon: AlertCircle,
    paragraphs: [
      'Special pricing arrangements and promotional offers have specific refund conditions.',
    ],
    subsections: [
      {
        title: 'Promotional Pricing',
        content: 'Subscriptions purchased at promotional or discounted rates are subject to the same 14-day money-back guarantee as standard plans. After the guarantee period, promotional subscriptions are non-refundable. The promotional rate applies only to the initial billing period; subsequent renewals are charged at the standard rate unless otherwise stated.',
      },
      {
        title: 'Free Trial Conversions',
        content: 'When a free trial converts to a paid subscription, the 14-day money-back guarantee begins from the date of the first paid charge. If you cancel during the free trial period, no charges will be applied and no refund is necessary.',
      },
      {
        title: 'Bundle Packages',
        content: 'If you purchased a bundle of multiple ERP products at a discounted rate, refunds are calculated based on the individual product pricing minus the bundle discount. The 14-day guarantee applies from the date of the bundle purchase.',
      },
    ],
  },
  {
    id: 'dispute-resolution',
    title: '8. Dispute Resolution',
    icon: Gavel,
    paragraphs: [
      'If you disagree with a refund decision, you have the right to escalate the matter.',
    ],
    subsections: [
      {
        title: 'Internal Escalation',
        content: 'If your refund request is denied and you believe the decision is incorrect, you may escalate the matter by contacting our Senior Billing Manager at escalations@apexflow.cloud within 14 days of the denial. Please include your original request details and the reason you believe the decision should be reconsidered.',
      },
      {
        title: 'Chargebacks',
        content: 'We encourage you to contact us before initiating a chargeback with your bank or payment provider. Chargebacks initiated without first contacting our billing team may result in immediate account suspension. We will work with you and your bank to resolve any legitimate disputes promptly.',
      },
      {
        title: 'Legal Recourse',
        content: 'If a dispute cannot be resolved through our internal process, it shall be governed by the laws of the Islamic Republic of Pakistan and subject to the exclusive jurisdiction of the courts of Lahore, Pakistan, as outlined in our Terms of Service.',
      },
    ],
  },
  {
    id: 'policy-changes',
    title: '9. Policy Changes',
    icon: Clock,
    paragraphs: [
      'We reserve the right to update this Refund Policy from time to time.',
    ],
    subsections: [
      {
        title: 'Notification of Changes',
        content: 'Material changes to this Refund Policy will be communicated via email to the address associated with your account at least 30 days before they take effect. Changes will also be reflected on this page with an updated "Last updated" date. Your continued use of the Services after changes become effective constitutes acceptance of the revised policy.',
      },
      {
        title: 'Grandfathering',
        content: 'If a policy change reduces refund eligibility, existing subscribers will maintain their original refund terms for the remainder of their current billing cycle. New terms will apply upon the next renewal.',
      },
    ],
  },
  {
    id: 'contact-information',
    title: '10. Contact Information',
    icon: CheckCircle2,
    paragraphs: [
      'If you have any questions about this Refund Policy or need assistance with a refund request, please reach out to us.',
    ],
    subsections: [
      {
        title: 'Billing Support',
        content: 'For refund requests and billing inquiries, email billing@apexflow.cloud. Our billing team is available Monday through Friday, 9:00 AM to 6:00 PM PKT (Pakistan Standard Time). We aim to respond to all inquiries within 2 business days.',
      },
      {
        title: 'Escalations',
        content: 'For unresolved refund disputes, contact our escalation team at escalations@apexflow.cloud. Please include your account ID, previous correspondence, and a detailed explanation of why you believe the matter requires escalation.',
      },
      {
        title: 'Mailing Address',
        content: 'ApexFlow, Gulberg III, Lahore, Pakistan. For official correspondence, please include your account ID and mark the envelope as "Refund Inquiry — Confidential".',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RefundPage() {
  const { navigate } = useNavigate()
  // Pull admin-editable content overrides. Falls back to the hardcoded
  // SECTIONS values below when no override exists (or when the public
  // /api/content fetch fails). Keys live under page='Refund'.
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
              <RotateCcw className="w-3.5 h-3.5 text-[var(--gg-amber)]" />
              <span className="text-xs text-muted-foreground">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">{getContent('Refund', 'refund_page_title', 'Refund Policy')}</h1>
            <p className="mt-4 text-sm text-muted-foreground">{getContent('Refund', 'refund_page_description', 'Last updated: March 2025')}</p>
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
                        ? 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] font-medium'
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
                          ? 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] font-medium border-l-2 border-[var(--gg-amber)] pl-[10px]'
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
                    'Refund',
                    `refund_section_${i}_title`,
                    section.title
                  )
                  const sectionParagraph0 = getContent(
                    'Refund',
                    `refund_section_${i}_paragraph_0`,
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
                        <div className="w-9 h-9 rounded-lg bg-[var(--gg-amber)]/10 border border-border flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5 text-[var(--gg-amber)]" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{sectionTitle}</h2>
                      </div>

                      {section.paragraphs.length > 0 && (
                        <p key={0} className="text-muted-foreground leading-relaxed mb-5">{sectionParagraph0}</p>
                      )}
                      {section.paragraphs.slice(1).map((p, pi) => (
                        <p key={pi + 1} className="text-muted-foreground leading-relaxed mb-5">{p}</p>
                      ))}

                      {section.subsections.length > 0 && (
                        <div className="space-y-5">
                          {section.subsections.map((sub, si) => {
                            const subTitle = getContent(
                              'Refund',
                              `refund_section_${i}_subsection_${si}_title`,
                              sub.title
                            )
                            const subContent = getContent(
                              'Refund',
                              `refund_section_${i}_subsection_${si}_content`,
                              sub.content
                            )
                            return (
                              <div key={sub.title} className="gg-card bg-card border border-border rounded-xl p-5 shadow-[var(--gg-shadow-sm)]">
                                <h3 className="text-sm font-semibold text-foreground mb-2">{subTitle}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{subContent}</p>
                              </div>
                            )
                          })}
                        </div>
                      )}

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
                <div className="gg-card bg-card border border-border rounded-xl shadow-[var(--gg-shadow-sm)] p-8 sm:p-10 text-center">
                  <div className="w-14 h-14 rounded-xl bg-[var(--gg-amber)]/10 border border-border flex items-center justify-center mx-auto mb-5">
                    <RotateCcw className="w-7 h-7 text-[var(--gg-amber)]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Need help with a refund?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Our billing team is here to assist with any refund inquiries. We process all requests fairly and promptly.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      className="bg-[var(--gg-vermillion)] text-white hover:bg-[var(--gg-vermillion)] font-medium rounded-xl px-6 h-11 btn-glow"
                      onClick={() => navigate('contact')}
                    >
                      Contact Billing Team <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <a
                      href="mailto:billing@apexflow.cloud"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gg-amber)] transition-colors"
                    >
                      <Mail className="w-4 h-4" /> billing@apexflow.cloud
                    </a>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> Gulberg III, Lahore, Pakistan
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
