'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { useNavigate } from '@/lib/use-navigate'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CheckCircle2, TrendingUp, DollarSign, Users,
  Shield, Rocket, Handshake, BarChart3, Globe, Phone,
  ChevronRight, Sparkles, Crown, Star, Target, Zap,
  PieChart, Building2, Wallet, Percent, Banknote,
  Award, Gem, CircleDollarSign, LineChart, UserCheck,
  Lock, Clock, MapPin, Mail, Check, X,
  AlertCircle, User, Building, Briefcase, Send,
  Scale, Eye, Ban, FileText, Landmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useRef, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useContent } from '@/hooks/use-content'

/* ═══════════════════════════════════════════════════════════════
   ANIMATION CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const GG_EASE = [0.25, 0.46, 0.45, 0.94] as const

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════════════ */
function useAnimatedCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let start = 0
          const step = end / (duration / 16)
          const timer = setInterval(() => {
            start += step
            if (start >= end) { setCount(end); clearInterval(timer) }
            else setCount(Math.floor(start))
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return { count, ref }
}

/* ═══════════════════════════════════════════════════════════════
   DATA — RESELLER COMMISSION TIERS (SALES-BASED)
   ═══════════════════════════════════════════════════════════════ */
const RESELLER_TIERS = [
  {
    name: 'Starter',
    salesTarget: 'PKR 5 Lac',
    commission: '10%',
    description: 'Cross PKR 5 Lac in cumulative sales and unlock your first commission tier. Every rupee you sell above the threshold earns you 10%.',
    benefits: ['10% commission on all sales above PKR 5 Lac', 'Dedicated partner dashboard', 'Marketing collateral & brochures', 'Monthly payout cycle', 'Email & chat support'],
    accentVar: '--gg-teal',
    icon: Star,
  },
  {
    name: 'Growth',
    salesTarget: 'PKR 10 Lac',
    commission: '20%',
    description: 'Hit PKR 10 Lac in sales and your commission doubles. More sales, more earnings — it\'s that simple.',
    benefits: ['20% commission on all sales above PKR 10 Lac', 'Priority lead distribution', 'Co-branded proposals & demo environments', 'Bi-weekly payout cycle', 'Dedicated account manager', 'Partner-only webinars & training'],
    accentVar: '--gg-amber',
    icon: Crown,
  },
  {
    name: 'Elite',
    salesTarget: 'Above PKR 10 Lac',
    commission: '30%',
    description: 'The top tier. Keep selling above PKR 10 Lac consistently and lock in 30% on every deal. No cap, no limits.',
    benefits: ['30% commission on all sales', 'Custom demo environments per client', 'Weekly payout cycle', 'Executive account manager', 'Co-marketing budget allocation', 'Early access to new ERP products', 'Invitation to annual partner summit'],
    accentVar: '--gg-vermillion',
    icon: Award,
  },
]

const RESELLER_TERMS = [
  { icon: Scale, text: 'Resellers sell ApexFlow products and earn commission — no ownership, IP, or decision-making rights are granted.' },
  { icon: Ban, text: 'Resellers may not modify, rebrand, or resell ApexFlow products under a different name.' },
  { icon: Eye, text: 'Commission is calculated on collected payments, not invoiced amounts. You earn when we earn.' },
  { icon: FileText, text: 'All client contracts are between ApexFlow and the client. Resellers facilitate introductions and closings.' },
  { icon: Shield, text: 'Territory and client conflicts are resolved by ApexFlow. Deal registration protects your pipeline for 90 days.' },
  { icon: AlertCircle, text: 'ApexFlow reserves the right to revoke partner status for misrepresentation or unethical practices.' },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — INVESTOR PROGRAM
   ═══════════════════════════════════════════════════════════════ */
const INVESTOR_PLAN = {
  name: 'Investment Partner',
  minInvestment: 'PKR 1,000,000',
  profitShare: '30%',
  roi: 'Projected 36–60% annually',
  description: 'Invest a minimum of PKR 1 Million in ApexFlow and earn 30% of net profit every month. Your capital fuels our expansion while you earn passively — no involvement, no interference, just returns.',
  features: [
    '30% share of net monthly profit', 'Monthly financial performance reports', 'Priority access to new ERP launches',
    'Annual investor meetup invitation', 'Dedicated investor relations contact', 'Legally binding profit-sharing agreement',
    'Escrow-protected investment', 'Audited financial statements',
  ],
  accentVar: '--gg-vermillion',
}

const INVESTOR_TERMS = [
  { icon: Scale, text: 'Investors receive 30% of net monthly profit — calculated after all operational expenses. No interference in business operations, hiring, or product decisions.' },
  { icon: Ban, text: 'Investors hold no equity, board seats, voting rights, or decision-making authority in ApexFlow.' },
  { icon: Lock, text: 'Investment is protected via escrow. Capital is locked for a minimum 12-month period.' },
  { icon: FileText, text: 'Profit calculations are transparent and shared via monthly financial reports. Audited annually.' },
  { icon: Eye, text: 'Investors may not use their position to influence pricing, partnerships, or client relationships.' },
  { icon: Shield, text: 'ApexFlow reserves the right to refund investment with accrued profits if terms are violated.' },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — WHY JOIN, STATS, PROCESS, FAQ
   ═══════════════════════════════════════════════════════════════ */
const WHY_JOIN = [
  { icon: TrendingUp, title: 'Recurring Revenue', description: 'Earn commissions on every subscription — not just the first sale. As long as your client stays, you keep earning. Month after month. Year after year.' },
  { icon: Globe, title: '21 Ready-Made Products', description: 'No need to build software. You get 21 fully developed, industry-specific ERP systems ready to sell from day one across every major sector.' },
  { icon: Shield, title: 'Zero Technical Burden', description: 'We handle hosting, updates, security, and 24/7 support. You focus on what you do best — building relationships and closing deals.' },
  { icon: Zap, title: 'Instant Market Entry', description: 'Skip years of product development. Walk into any meeting with a battle-tested ERP that speaks your client\'s industry language fluently.' },
  { icon: BarChart3, title: 'Transparent Dashboard', description: 'Track every lead, every deal, and every commission in real-time. Full visibility into your earnings pipeline — no black boxes, no surprises.' },
  { icon: Handshake, title: 'Dedicated Support', description: 'From demo environments to co-branded proposals — we arm you with everything you need to win. Your success is literally our success.' },
]

const STATS = [
  { value: 21, label: 'Industry ERPs', icon: Building2, suffix: '' },
  { value: 30, label: 'Max Commission %', icon: Percent, suffix: '%' },
  { value: 30, label: 'Investor Profit Share', icon: PieChart, suffix: '%' },
  { value: 24, label: 'Hour Go-Live', icon: Clock, suffix: 'hr' },
]

const PROCESS_STEPS = [
  { step: '01', title: 'Apply', description: 'Fill out the partner application form. Tell us about your market, experience, and ambitions.', icon: UserCheck },
  { step: '02', title: 'Get Onboarded', description: 'Receive your partner dashboard, demo credentials, marketing kit, and dedicated account manager.', icon: Rocket },
  { step: '03', title: 'Start Selling', description: 'Leverage our co-branded materials and product demos to close deals across 21 industry verticals.', icon: Target },
  { step: '04', title: 'Earn & Grow', description: 'Watch your recurring commissions grow as your client base expands. Scale to Elite and maximize earnings.', icon: CircleDollarSign },
]

const FAQ_ITEMS = [
  { q: 'How are commissions calculated?', a: 'Commissions are based on your total sales volume. Cross PKR 5 Lac and earn 10%. Hit PKR 10 Lac and earn 20%. Sell consistently above PKR 10 Lac and lock in 30%. Commission is calculated on collected payments, not invoiced amounts.' },
  { q: 'When do I get paid?', a: 'Starter partners receive monthly payouts. Growth partners receive bi-weekly payouts. Elite partners receive weekly payouts. All payments are processed within 5 business days of the payout period.' },
  { q: 'Do resellers get any ownership or rights?', a: 'No. Resellers sell and earn commission — that\'s it. You do not get ownership, IP rights, decision-making authority, or any stake in the business. You sell our products, we handle everything else, and you get paid.' },
  { q: 'How does the investor profit share work?', a: 'Investors receive 30% of ApexFlow\'s net monthly profit, calculated after all operational expenses. Profit calculations are transparent and shared via monthly financial reports. Payments are processed within 10 business days of month-end.' },
  { q: 'Can I be both a reseller and an investor?', a: 'Absolutely. Many of our partners choose to invest capital for passive income while also actively selling for commission. The two programs are independent — you earn from both streams simultaneously.' },
  { q: 'What rights do investors have?', a: 'Investors receive profit share only — no equity, no board seats, no voting rights, no involvement in operations, hiring, or product decisions. Your capital works passively while we run the business.' },
  { q: 'Is my investment protected?', a: 'Yes. All investor agreements include escrow-protected capital, audited financial statements, and a legally binding profit-sharing contract. Investment is locked for a minimum 12-month period.' },
  { q: 'Is there a minimum sales target?', a: 'There is no minimum to remain a partner. However, your commission tier is determined by your cumulative sales volume — reach PKR 5 Lac for 10%, PKR 10 Lac for 20%, and above for 30%.' },
]

/* ═══════════════════════════════════════════════════════════════
   APPLICATION FORM
   ═══════════════════════════════════════════════════════════════ */
function ApplicationForm() {
  const [formType, setFormType] = useState<'reseller' | 'investor'>('reseller')
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', company: '', city: '', experience: '', investmentAmount: '', message: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success(`Application submitted! We'll contact you within 24 hours.`, {
      description: formType === 'reseller' ? 'Reseller Partner Application' : 'Investment Partner Application',
    })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="gg-elevated overflow-hidden">
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, var(--gg-vermillion), var(--gg-amber), var(--gg-teal))' }} />
      <div className="p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 15%, transparent), color-mix(in srgb, var(--gg-amber) 10%, transparent))' }}>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Apply to <span className="text-gradient-golden">Become a Partner</span>
          </h3>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Fill out the form below and our team will reach out within 24 hours. No upfront fees, no commitments — just opportunity.
          </p>
        </div>

        {/* Type Switcher */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center p-1 rounded-xl" style={{ background: 'color-mix(in srgb, var(--card) 80%, transparent)', border: '1px solid var(--border)' }}>
            <button onClick={() => setFormType('reseller')} className="relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300" style={{
              background: formType === 'reseller' ? 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' : 'transparent',
              color: formType === 'reseller' ? 'white' : 'var(--muted-foreground)',
              boxShadow: formType === 'reseller' ? '0 4px 12px -4px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)' : 'none',
            }}>
              <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />Reseller Partner
            </button>
            <button onClick={() => setFormType('investor')} className="relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300" style={{
              background: formType === 'investor' ? 'linear-gradient(135deg, var(--gg-amber), var(--gg-vermillion))' : 'transparent',
              color: formType === 'investor' ? 'white' : 'var(--muted-foreground)',
              boxShadow: formType === 'investor' ? '0 4px 12px -4px color-mix(in srgb, var(--gg-amber) 30%, transparent)' : 'none',
            }}>
              <Landmark className="w-4 h-4 inline mr-1.5 -mt-0.5" />Investment Partner
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: GG_EASE }} onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground font-medium">Full Name *</Label>
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Your full name" required className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground font-medium">Email Address *</Label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@company.com" required className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground font-medium">Phone Number *</Label>
                  <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+92 3XX XXXXXXX" required className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground font-medium">City *</Label>
                  <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Lahore, Karachi, etc." required className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground font-medium">Company Name</Label>
                  <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={formData.company} onChange={(e) => updateField('company', e.target.value)} placeholder="Your company (optional)" className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                </div>
                {formType === 'reseller' ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-medium">Sales Experience *</Label>
                    <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={formData.experience} onChange={(e) => updateField('experience', e.target.value)} placeholder="e.g. 3 years in B2B software sales" required className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-medium">Investment Amount (PKR) *</Label>
                    <div className="relative"><Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="number" value={formData.investmentAmount} onChange={(e) => updateField('investmentAmount', e.target.value)} placeholder="Minimum PKR 1,000,000" required min={1000000} className="pl-10 h-11 bg-secondary/30 border-border/60 rounded-xl" /></div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground font-medium">{formType === 'reseller' ? 'Tell us about your market & sales approach' : 'Tell us about your investment goals'}</Label>
                <Textarea value={formData.message} onChange={(e) => updateField('message', e.target.value)} placeholder={formType === 'reseller' ? 'Which industries do you serve? What\'s your sales network like?' : 'What are your expectations? Any questions about the program?'} rows={4} className="bg-secondary/30 border-border/60 rounded-xl resize-none" />
              </div>
              {/* Terms acknowledgment */}
              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--gg-amber) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--gg-amber) 15%, transparent)' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gg-amber)' }} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formType === 'reseller'
                    ? 'By applying, you acknowledge that resellers earn commission only and receive no ownership, IP, or decision-making rights in ApexFlow. Commission tiers are based on sales volume.'
                    : 'By applying, you acknowledge that investors earn 30% of net monthly profit only and receive no equity, board seats, voting rights, or involvement in business operations. Minimum investment is PKR 1,000,000 with a 12-month lock-in period.'}
                </p>
              </div>
              <Button type="submit" className="w-full font-bold rounded-xl h-12 text-white btn-glow text-base" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>
                <Send className="w-4 h-4 mr-2" />Submit {formType === 'reseller' ? 'Reseller' : 'Investment'} Application
              </Button>
            </motion.form>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <motion.div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-green) 15%, transparent), color-mix(in srgb, var(--gg-teal) 10%, transparent))' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: 2 }}>
                <CheckCircle2 className="w-9 h-9" style={{ color: 'var(--gg-green)' }} />
              </motion.div>
              <h4 className="text-2xl font-extrabold text-foreground mb-3">Application Received!</h4>
              <p className="text-muted-foreground max-w-md mx-auto">Our team will review your application and reach out within 24 hours. Welcome to the ApexFlow partner network!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BECOME PARTNER PAGE
   ═══════════════════════════════════════════════════════════════ */
export function PartnerPage() {
  const { navigate } = useNavigate()
  // Pull admin-editable content overrides. Falls back to the hardcoded
  // JSX values below when no override exists (or when the public
  // /api/content fetch fails). Keys live under page='Partner'.
  const { get: getContent } = useContent()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<'reseller' | 'investor'>('reseller')
  const stat1 = useAnimatedCounter(21, 1500)
  const stat2 = useAnimatedCounter(30, 1800)
  const stat3 = useAnimatedCounter(30, 1800)
  const stat4 = useAnimatedCounter(24, 1200)

  return (
    <PageLayout>
      <div className="relative overflow-hidden">

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--gg-vermillion)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: 'var(--gg-amber)' }} />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: GG_EASE }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 10%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))', border: '1px solid color-mix(in srgb, var(--gg-vermillion) 15%, transparent)' }}>
              <Handshake className="w-4 h-4" style={{ color: 'var(--gg-vermillion)' }} />
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--gg-vermillion)' }}>{getContent('Partner', 'partner_page_title', 'Become Partner')}</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: GG_EASE }} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Sell More,{' '}<span className="text-gradient-golden">Earn More</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: GG_EASE }} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Earn up to <span className="font-bold text-foreground">30% commission</span> on every sale — the more you sell, the more you earn.
              Or invest <span className="font-bold text-foreground">PKR 1 Million+</span> and collect{' '}<span className="font-bold text-foreground">30% of net profits monthly</span>. No rights, no interference — just pure earnings.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease: GG_EASE }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="font-bold rounded-xl px-8 h-13 text-white btn-glow" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }} onClick={() => { const el = document.getElementById('apply-section'); el?.scrollIntoView({ behavior: 'smooth' }) }}>
                <Rocket className="w-5 h-5 mr-2" />Apply Now — It&apos;s Free
              </Button>
              <Button variant="outline" size="lg" className="font-semibold rounded-xl px-8 h-13 border-border/60" onClick={() => { const el = document.getElementById('plans-section'); el?.scrollIntoView({ behavior: 'smooth' }) }}>
                View Plans<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
            {/* Animated Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45, ease: GG_EASE }} className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[{ ...STATS[0], counter: stat1 }, { ...STATS[1], counter: stat2 }, { ...STATS[2], counter: stat3 }, { ...STATS[3], counter: stat4 }].map((stat, i) => {
                const StatIcon = stat.icon
                return (
                  <motion.div key={stat.label} ref={stat.counter.ref} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: GG_EASE }} className="gg-card p-5 text-center">
                    <StatIcon className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--gg-vermillion)' }} />
                    <div className="text-2xl font-extrabold text-foreground">{stat.counter.count}{stat.suffix}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ WHY JOIN ═══════════════ */}
        <section className="py-20 lg:py-24" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: GG_EASE }}>
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-vermillion)' }}>Why Partner With Us</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{getContent('Partner', 'partner_benefits_heading', 'Your Success Is')} <span className="text-gradient-primary">Our Business</span></h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">Whether you sell, invest, or both — we give you an entire ecosystem designed to make you money. No upfront costs, no technical burden, no limits.</p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_JOIN.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease: GG_EASE }} className="group gg-card p-6 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 12%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))' }}>
                      <ItemIcon className="w-5.5 h-5.5" style={{ color: 'var(--gg-vermillion)' }} />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ TWO SEPARATE SECTIONS ═══════════════ */}
        <section id="plans-section" className="py-20 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: GG_EASE }}>
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-vermillion)' }}>Two Ways to Partner</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Choose Your <span className="text-gradient-primary">Path</span></h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">Sell and earn commission, or invest and earn profit share. Two paths, one destination — financial freedom.</p>
              </motion.div>
            </div>
            {/* Section Switcher */}
            <div className="flex items-center justify-center mb-14">
              <div className="inline-flex items-center p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--card) 80%, transparent)', border: '1px solid var(--border)' }}>
                <button onClick={() => setActiveSection('reseller')} className="relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300" style={{ background: activeSection === 'reseller' ? 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' : 'transparent', color: activeSection === 'reseller' ? 'white' : 'var(--muted-foreground)', boxShadow: activeSection === 'reseller' ? '0 4px 16px -4px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)' : 'none' }}>
                  <Users className="w-4 h-4 inline mr-2 -mt-0.5" />Reseller Partner
                </button>
                <button onClick={() => setActiveSection('investor')} className="relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300" style={{ background: activeSection === 'investor' ? 'linear-gradient(135deg, var(--gg-amber), var(--gg-vermillion))' : 'transparent', color: activeSection === 'investor' ? 'white' : 'var(--muted-foreground)', boxShadow: activeSection === 'investor' ? '0 4px 16px -4px color-mix(in srgb, var(--gg-amber) 30%, transparent)' : 'none' }}>
                  <Landmark className="w-4 h-4 inline mr-2 -mt-0.5" />Investment Partner
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* RESELLER SECTION */}
              {activeSection === 'reseller' && (
                <motion.div key="reseller-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5, ease: GG_EASE }}>
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-extrabold text-foreground mb-3">The More You Sell, The More You <span className="text-gradient-primary">Earn</span></h3>
                    <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                      No ownership, no rights, no interference — just sell and earn. Cross <span className="font-bold text-foreground">PKR 5 Lac</span> → 10%. Hit <span className="font-bold text-foreground">PKR 10 Lac</span> → 20%. Go above → <span className="font-bold text-foreground">30%</span>.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {RESELLER_TIERS.map((tier, i) => {
                      const TierIcon = tier.icon
                      return (
                        <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.5, ease: GG_EASE }} className="relative group">
                          {i === 2 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"><span className="text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))', color: 'white' }}>HIGHEST EARNERS</span></div>}
                          <div className="gg-elevated p-7 h-full flex flex-col transition-all duration-300 hover:shadow-xl" style={{ borderTop: `3px solid var(${tier.accentVar})` }}>
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(${tier.accentVar}) 15%, transparent), color-mix(in srgb, var(${tier.accentVar}) 5%, transparent))` }}><TierIcon className="w-5 h-5" style={{ color: `var(${tier.accentVar})` }} /></div>
                              <div><h4 className="text-lg font-bold text-foreground">{tier.name}</h4><p className="text-xs text-muted-foreground">{tier.salesTarget} sales</p></div>
                            </div>
                            <div className="rounded-xl p-5 mb-5 text-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(${tier.accentVar}) 10%, transparent), color-mix(in srgb, var(${tier.accentVar}) 4%, transparent))`, border: `1px solid color-mix(in srgb, var(${tier.accentVar}) 15%, transparent))` }}>
                              <span className="text-4xl font-extrabold" style={{ color: `var(${tier.accentVar})` }}>{tier.commission}</span><span className="text-sm text-muted-foreground ml-1.5">commission</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{tier.description}</p>
                            <ul className="space-y-2.5 mb-6">{tier.benefits.map((b) => (<li key={b} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `var(${tier.accentVar})` }} /><span className="text-foreground/80">{b}</span></li>))}</ul>
                            <Button className="w-full font-semibold rounded-xl" style={{ background: i === 2 ? `linear-gradient(135deg, var(${tier.accentVar}), var(--gg-amber))` : 'transparent', color: i === 2 ? 'white' : `var(${tier.accentVar})`, border: i === 2 ? 'none' : `1px solid color-mix(in srgb, var(${tier.accentVar}) 25%, transparent)` }} onClick={() => { const el = document.getElementById('apply-section'); el?.scrollIntoView({ behavior: 'smooth' }) }}>
                              {i === 2 ? 'Become Elite Partner' : 'Get Started'}<ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  {/* Earnings Preview */}
                  <div className="gg-elevated overflow-hidden mb-12">
                    <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 5%, transparent), color-mix(in srgb, var(--gg-amber) 3%, transparent))' }}>
                      <h4 className="text-lg font-bold text-foreground mb-1">Earnings Preview</h4><p className="text-xs text-muted-foreground">See what you could earn at each tier</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--gg-separator)' }}>
                      {[{ tier: 'Starter', comm: '10%', example: 'PKR 5 Lac in sales', monthly: 'PKR 50,000', yearly: 'PKR 600,000', color: '--gg-teal' }, { tier: 'Growth', comm: '20%', example: 'PKR 10 Lac in sales', monthly: 'PKR 200,000', yearly: 'PKR 2,400,000', color: '--gg-amber' }, { tier: 'Elite', comm: '30%', example: 'PKR 15 Lac in sales', monthly: 'PKR 450,000', yearly: 'PKR 5,400,000', color: '--gg-vermillion' }].map((row, i) => (
                        <motion.div key={row.tier} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5, ease: GG_EASE }} className="p-6 text-center">
                          <div className="text-sm font-bold text-foreground mb-1">{row.tier}</div>
                          <div className="text-xs text-muted-foreground mb-3">{row.example}</div>
                          <div className="text-3xl font-extrabold mb-1" style={{ color: `var(${row.color})` }}>{row.monthly}</div>
                          <div className="text-xs text-muted-foreground">per month at {row.comm}</div>
                          <div className="mt-3 text-sm font-semibold text-foreground">{row.yearly}<span className="text-xs text-muted-foreground font-normal"> /year</span></div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  {/* Reseller Terms */}
                  <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'color-mix(in srgb, var(--card) 60%, transparent)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-amber) 15%, transparent), color-mix(in srgb, var(--gg-amber) 5%, transparent))' }}><Scale className="w-5 h-5" style={{ color: 'var(--gg-amber)' }} /></div>
                      <div><h4 className="text-lg font-bold text-foreground">Reseller Terms & Conditions</h4><p className="text-xs text-muted-foreground">You sell, you earn — no rights, no ownership</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {RESELLER_TERMS.map((term, i) => {
                        const TermIcon = term.icon
                        return (<motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: GG_EASE }} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'color-mix(in srgb, var(--background) 50%, transparent)' }}><TermIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gg-amber)' }} /><p className="text-sm text-muted-foreground leading-relaxed">{term.text}</p></motion.div>)
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* INVESTOR SECTION */}
              {activeSection === 'investor' && (
                <motion.div key="investor-section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, ease: GG_EASE }}>
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-extrabold text-foreground mb-3">Invest & Earn <span className="text-gradient-primary">30% of Net Profit Monthly</span></h3>
                    <p className="text-muted-foreground max-w-3xl mx-auto text-lg">Invest a minimum of <span className="font-bold text-foreground">PKR 1 Million</span> and earn 30% of ApexFlow&apos;s net profit every month. No rights, no interference, no involvement — your capital works while you sleep.</p>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: GG_EASE }} className="max-w-3xl mx-auto">
                    <div className="gg-elevated overflow-hidden transition-all duration-300 hover:shadow-xl" style={{ borderTop: '3px solid var(--gg-vermillion)' }}>
                      <div className="p-8 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 8%, transparent), color-mix(in srgb, var(--gg-amber) 5%, transparent))' }}>
                        <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 15%, transparent), color-mix(in srgb, var(--gg-amber) 10%, transparent))' }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}><Crown className="w-7 h-7" style={{ color: 'var(--gg-vermillion)' }} /></motion.div>
                        <h4 className="text-2xl font-extrabold text-foreground mb-2">{INVESTOR_PLAN.name}</h4>
                        <p className="text-sm text-muted-foreground">Minimum Investment: <span className="font-bold text-foreground">{INVESTOR_PLAN.minInvestment}</span></p>
                      </div>
                      <div className="p-8">
                        <div className="rounded-xl p-6 mb-6 text-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 10%, transparent), color-mix(in srgb, var(--gg-vermillion) 4%, transparent))', border: '1px solid color-mix(in srgb, var(--gg-vermillion) 15%, transparent)' }}>
                          <div className="text-5xl font-extrabold" style={{ color: 'var(--gg-vermillion)' }}>{INVESTOR_PLAN.profitShare}</div><span className="text-sm text-muted-foreground">net monthly profit</span>
                          <div className="mt-2 text-sm font-semibold" style={{ color: 'var(--gg-vermillion)' }}>{INVESTOR_PLAN.roi}</div>
                        </div>
                        <p className="text-muted-foreground mb-6 leading-relaxed">{INVESTOR_PLAN.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">{INVESTOR_PLAN.features.map((f) => (<div key={f} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gg-vermillion)' }} /><span className="text-foreground/80">{f}</span></div>))}</div>
                        {/* Key restrictions callout */}
                        <div className="rounded-xl p-5 mb-8" style={{ background: 'color-mix(in srgb, var(--gg-amber) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--gg-amber) 15%, transparent)' }}>
                          <div className="flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4" style={{ color: 'var(--gg-amber)' }} /><span className="text-sm font-bold text-foreground">Important: No Rights or Interference</span></div>
                          <div className="space-y-2">
                            {[['No equity or ownership stake'], ['No board seats or voting rights'], ['No involvement in business operations, hiring, or product decisions'], ['No influence on pricing, partnerships, or client relationships']].map(([text]) => (
                              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground"><X className="w-3.5 h-3.5 shrink-0 text-[var(--gg-amber)]" />{text}</div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full font-bold rounded-xl h-12 text-white btn-glow text-base" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }} onClick={() => { const el = document.getElementById('apply-section'); el?.scrollIntoView({ behavior: 'smooth' }) }}>
                          <Rocket className="w-5 h-5 mr-2" />Apply as Investment Partner
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                  {/* Investor trust signals */}
                  <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[{ icon: Lock, label: 'Escrow Protected' }, { icon: Shield, label: 'Legal Agreement' }, { icon: LineChart, label: 'Transparent Reports' }, { icon: Award, label: 'Audited Finances' }].map((item, i) => {
                      const ItemIcon = item.icon
                      return (<motion.div key={item.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: GG_EASE }} className="flex items-center gap-2.5 justify-center p-3 rounded-xl" style={{ background: 'color-mix(in srgb, var(--card) 60%, transparent)', border: '1px solid var(--border)' }}><ItemIcon className="w-4 h-4" style={{ color: 'var(--gg-teal)' }} /><span className="text-xs font-semibold text-foreground">{item.label}</span></motion.div>)
                    })}
                  </div>
                  {/* Investor Terms */}
                  <div className="mt-10 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto" style={{ background: 'color-mix(in srgb, var(--card) 60%, transparent)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 15%, transparent), color-mix(in srgb, var(--gg-vermillion) 5%, transparent))' }}><Scale className="w-5 h-5" style={{ color: 'var(--gg-vermillion)' }} /></div>
                      <div><h4 className="text-lg font-bold text-foreground">Investor Terms & Conditions</h4><p className="text-xs text-muted-foreground">Profit share only — no rights, no interference</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {INVESTOR_TERMS.map((term, i) => {
                        const TermIcon = term.icon
                        return (<motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: GG_EASE }} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'color-mix(in srgb, var(--background) 50%, transparent)' }}><TermIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gg-vermillion)' }} /><p className="text-sm text-muted-foreground leading-relaxed">{term.text}</p></motion.div>)
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="py-20 lg:py-24" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: GG_EASE }}>
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-teal)' }}>Getting Started</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Four Steps to <span className="text-gradient-cool">Your First Check</span></h2>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_STEPS.map((step, i) => {
                const StepIcon = step.icon
                return (
                  <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5, ease: GG_EASE }} className="relative text-center">
                    {i < 3 && <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-px" style={{ background: 'var(--gg-separator-strong)' }} />}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 12%, transparent), color-mix(in srgb, var(--gg-amber) 8%, transparent))', border: '1px solid color-mix(in srgb, var(--gg-vermillion) 15%, transparent)' }}>
                      <StepIcon className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}>{step.step}</span>
                    </div>
                    <h4 className="text-base font-bold text-foreground mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section className="py-20 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: GG_EASE }}>
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gg-violet)' }}>FAQ</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Questions? <span className="text-gradient-primary">We&apos;ve Got Answers</span></h2>
              </motion.div>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4, ease: GG_EASE }} className="gg-card overflow-hidden">
                  <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                    <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-300 ${expandedFaq === i ? 'rotate-90' : ''}`} style={{ color: 'var(--gg-vermillion)' }} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: GG_EASE }} className="overflow-hidden">
                        <div className="px-5 pb-5 pt-0"><div className="h-px mb-4" style={{ background: 'var(--gg-separator)' }} /><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ APPLICATION FORM ═══════════════ */}
        <section id="apply-section" className="py-20 lg:py-24" style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 1.5%, var(--background))' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ApplicationForm />
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"><div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 5%, transparent), color-mix(in srgb, var(--gg-amber) 3%, transparent), color-mix(in srgb, var(--gg-violet) 2%, transparent))' }} /></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4">The Best Time to Start Was Yesterday. The Second Best Is Now.</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">Every day you wait, another partner signs your future client. Don&apos;t watch from the sidelines — claim your territory today.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" className="font-bold rounded-xl px-8 h-12 text-white btn-glow" style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }} onClick={() => navigate('contact')}><Phone className="w-4 h-4 mr-2" />Call Us: +92 307 4903277</Button>
              <Button variant="outline" size="lg" className="font-semibold rounded-xl px-8 h-12 border-border/60" onClick={() => navigate('contact')}><Mail className="w-4 h-4 mr-2" />Email Us</Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
