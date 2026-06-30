'use client'

import { PageLayout } from '@/components/shared/page-layout'
import { useNavigate } from '@/lib/use-navigate'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Code2,
  Activity,
  GitBranch,
  ArrowRight,
  ExternalLink,
  Play,
  Clock,
  MessageCircle,
  Github,
  Hash,
  Copy,
  Check,
  Zap,
  FileText,
  Terminal,
  Braces,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { useState, useRef } from 'react'

const QUICK_LINKS = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: 'Documentation',
    desc: 'Complete guides for every ERP module, integration, and workflow.',
    items: ['Getting Started', 'Module Guides', 'Integration Tutorials', 'Best Practices'],
    bgClass: 'bg-primary/10',
  },
  {
    icon: <Code2 className="w-8 h-8 text-[var(--gg-violet)]" />,
    title: 'API Reference',
    desc: 'RESTful API docs with examples, authentication, and rate limits.',
    items: ['Authentication', 'Endpoints', 'Webhooks', 'SDKs'],
    bgClass: 'bg-[var(--gg-violet)]/10',
  },
  {
    icon: <Activity className="w-8 h-8 text-[var(--gg-green)]" />,
    title: 'System Status',
    desc: 'Real-time status for all services and ERP endpoints.',
    items: ['Service Health', 'Incident History', 'Uptime Metrics'],
    bgClass: 'bg-[var(--gg-green)]/10',
  },
  {
    icon: <GitBranch className="w-8 h-8 text-[var(--gg-amber)]" />,
    title: 'Changelog',
    desc: 'Release notes, feature updates, and breaking changes.',
    items: ['Latest Releases', 'Roadmap', 'Breaking Changes'],
    bgClass: 'bg-[var(--gg-amber)]/10',
  },
]

const CODE_EXAMPLE = `// Initialize ApexFlow client
import { ApexFlow } from '@apexflow/sdk';

const client = new ApexFlow({
  apiKey: process.env.APEXFLOW_API_KEY,
  erpSystem: 'apparel-flow',
  version: '2025-01'
});

// Fetch inventory with filters
const inventory = await client.inventory.list({
  location: 'warehouse-01',
  status: 'in-stock',
  category: 'finished-goods',
  limit: 50
});

// Create a production order
const order = await client.production.create({
  style: 'SH-2025-001',
  quantity: 500,
  deadline: '2025-03-15',
  assignee: 'line-03'
});

console.log(\`Order \${order.id} created:\`, order.status);`

const VIDEO_TUTORIALS = [
  { title: 'Getting Started with ApexFlow', duration: '12:34', desc: 'Complete setup walkthrough from account creation to first workflow.' },
  { title: 'API Authentication & Security', duration: '8:21', desc: 'How to generate API keys, set up OAuth, and secure your integration.' },
  { title: 'Building Custom Workflows', duration: '15:47', desc: 'Create automated workflows that connect modules across your ERP.' },
  { title: 'Data Migration Guide', duration: '11:02', desc: 'Step-by-step migration from legacy systems to ApexFlow.' },
]

const UPDATES = [
  { tag: 'Feature', tagColor: 'cyan', title: 'ApparelFlow Production Scheduler v2', desc: 'AI-powered production scheduling with automatic resource allocation and conflict resolution.', date: 'Jan 15, 2025' },
  { tag: 'Improvement', tagColor: 'violet', title: 'Dashboard Performance Optimization', desc: '50% faster load times across all ERP dashboards with new caching layer.', date: 'Jan 10, 2025' },
  { tag: 'Fix', tagColor: 'amber', title: 'HotelFlow Reservation Sync Fix', desc: 'Resolved issue where channel manager bookings could create duplicate reservations.', date: 'Jan 8, 2025' },
  { tag: 'Feature', tagColor: 'cyan', title: 'EduFlow Parent Portal', desc: 'New self-service portal for parents to view grades, attendance, and fee status.', date: 'Jan 5, 2025' },
  { tag: 'Improvement', tagColor: 'violet', title: 'API Rate Limit Increase', desc: 'Professional plan API rate limits increased from 100 to 500 requests per minute.', date: 'Dec 28, 2024' },
  { tag: 'Fix', tagColor: 'amber', title: 'Invoice PDF Generation Fix', desc: 'Fixed formatting issues in generated PDF invoices for PKR currency.', date: 'Dec 22, 2024' },
]

const TAG_COLORS: Record<string, string> = {
  cyan: 'bg-primary/10 text-primary border-primary/20',
  violet: 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] border-[var(--gg-violet)]/20',
  amber: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
}

const TAG_DOT_COLORS: Record<string, string> = {
  cyan: 'bg-primary',
  violet: 'bg-[var(--gg-violet)]',
  amber: 'bg-[var(--gg-amber)]',
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  'Documentation': <BookOpen className="w-4 h-4" />,
  'API Reference': <Code2 className="w-4 h-4" />,
  'System Status': <Activity className="w-4 h-4" />,
  'Changelog': <GitBranch className="w-4 h-4" />,
}

const TAB_ACCENT: Record<string, string> = {
  'Documentation': 'border-primary text-primary',
  'API Reference': 'border-[var(--gg-violet)] text-[var(--gg-violet)]',
  'System Status': 'border-[var(--gg-green)] text-[var(--gg-green)]',
  'Changelog': 'border-[var(--gg-amber)] text-[var(--gg-amber)]',
}

const TAB_BG: Record<string, string> = {
  'Documentation': 'bg-primary/5',
  'API Reference': 'bg-[var(--gg-violet)]/5',
  'System Status': 'bg-[var(--gg-green)]/5',
  'Changelog': 'bg-[var(--gg-amber)]/5',
}

const TAB_ITEM_COLOR: Record<string, string> = {
  'Documentation': 'text-primary',
  'API Reference': 'text-[var(--gg-violet)]',
  'System Status': 'text-[var(--gg-green)]',
  'Changelog': 'text-[var(--gg-amber)]',
}

function CodeBlock() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_EXAMPLE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block-dark rounded-xl overflow-hidden shadow-lg border border-[#30363d]" style={{ background: '#0d1117' }}>
      {/* Code Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d]" style={{ background: '#161b22' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Terminal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 font-mono">apexflow-example.ts</span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed text-gray-200">
          <code>
            <span className="syn-comment">{'// Initialize ApexFlow client\n'}</span>
            <span className="syn-keyword">import</span>
            <span className="syn-fg">{' { ApexFlow } '}</span>
            <span className="syn-keyword">from</span>
            <span className="syn-string">{' @apexflow/sdk '}</span>
            <span className="syn-fg">;</span>
            {'\n\n'}
            <span className="syn-keyword">const</span>
            <span className="syn-variable">{' client '}</span>
            <span className="syn-keyword">= new</span>
            <span className="syn-constant">{' ApexFlow'}</span>
            <span className="syn-fg">{'({\n'}</span>
            <span className="syn-fg">{'  apiKey: '}</span>
            <span className="syn-string">process.env.APEXFLOW_API_KEY</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  erpSystem: '}</span>
            <span className="syn-string">{`'apparel-flow'`}</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  version: '}</span>
            <span className="syn-string">{`'2025-01'`}</span>
            {'\n'}
            <span className="syn-fg">{'});'}</span>
            {'\n\n'}
            <span className="syn-comment">{'// Fetch inventory with filters\n'}</span>
            <span className="syn-keyword">const</span>
            <span className="syn-variable">{' inventory '}</span>
            <span className="syn-keyword">= await</span>
            <span className="syn-fg">{' client.inventory.'}</span>
            <span className="sin-fn">list</span>
            <span className="syn-fg">{'({\n'}</span>
            <span className="syn-fg">{'  location: '}</span>
            <span className="syn-string">{`'warehouse-01'`}</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  status: '}</span>
            <span className="syn-string">{`'in-stock'`}</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  category: '}</span>
            <span className="syn-string">{`'finished-goods'`}</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  limit: '}</span>
            <span className="syn-constant">50</span>
            {'\n'}
            <span className="syn-fg">{'});'}</span>
            {'\n\n'}
            <span className="syn-comment">{'// Create a production order\n'}</span>
            <span className="syn-keyword">const</span>
            <span className="syn-variable">{' order '}</span>
            <span className="syn-keyword">= await</span>
            <span className="syn-fg">{' client.production.'}</span>
            <span className="sin-fn">create</span>
            <span className="syn-fg">{'({\n'}</span>
            <span className="syn-fg">{'  style: '}</span>
            <span className="syn-string">{`'SH-2025-001'`}</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  quantity: '}</span>
            <span className="syn-constant">500</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  deadline: '}</span>
            <span className="syn-string">{`'2025-03-15'`}</span>
            <span className="syn-fg">,</span>
            {'\n'}
            <span className="syn-fg">{'  assignee: '}</span>
            <span className="syn-string">{`'line-03'`}</span>
            {'\n'}
            <span className="syn-fg">{'});'}</span>
          </code>
        </pre>
      </div>
    </div>
  )
}

const DEV_FEATURES = [
  { icon: <Zap className="w-5 h-5 text-primary" />, title: 'Fast Integration', desc: 'Up and running with 5 lines of code. SDKs for Node.js, Python, and more.', num: '01' },
  { icon: <Braces className="w-5 h-5 text-[var(--gg-violet)]" />, title: 'Type-Safe SDK', desc: 'Full TypeScript support with auto-generated types from your schema.', num: '02' },
  { icon: <FileText className="w-5 h-5 text-[var(--gg-green)]" />, title: 'Comprehensive Docs', desc: 'Every endpoint documented with examples, parameters, and response shapes.', num: '03' },
  { icon: <Shield className="w-5 h-5 text-[var(--gg-amber)]" />, title: 'Enterprise Security', desc: 'OAuth 2.0, API key rotation, and IP whitelisting out of the box.', num: '04' },
]

export function ResourcesPage() {
  const { navigate } = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340
      carouselRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <PageLayout>
      {/* ═══════════════════════════════════════════════════════════
          HERO — Developer Terminal Theme
          Dark split layout with terminal + headline
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Dark background with grid overlay */}
        <div className="absolute inset-0 bg-secondary/80 dark:bg-[#0d1117]" />
        <div className="absolute inset-0 grid-lines opacity-30" />
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Terminal Display */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-[#30363d]" style={{ background: '#161b22' }}>
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d]" style={{ background: '#0d1117' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-2">terminal — apexflow</span>
                </div>
                {/* Terminal Content */}
                <div className="p-5 font-mono text-sm leading-loose">
                  <div className="text-gray-400">
                    <span className="text-green-400">$</span> apexflow init --project my-erp
                  </div>
                  <div className="mt-2 text-[var(--gg-teal)]">
                    <span className="text-gray-500">▸</span> Initializing project...
                  </div>
                  <div className="text-[var(--gg-teal)]">
                    <span className="text-gray-500">▸</span> Installing <span className="text-amber-400">@apexflow/sdk@latest</span>
                  </div>
                  <div className="text-[var(--gg-teal)]">
                    <span className="text-gray-500">▸</span> Configuring environment...
                  </div>
                  <div className="mt-2 text-green-400">
                    ✓ Project initialized successfully
                  </div>
                  <div className="mt-2">
                    <span className="text-green-400">$</span>{' '}
                    <span className="text-gray-200">apexflow dev</span>
                    <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-blink-cursor align-middle" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Headline */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
                <Terminal className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Developer Hub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-foreground dark:text-white">
                Resources &{' '}
                <span className="text-green-400">Docs</span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground dark:text-gray-400 max-w-xl leading-relaxed">
                Everything you need to build, integrate, and scale with ApexFlow. From quickstart to production.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('pricing')}
                  className="inline-flex items-center gap-2 bg-green-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-green-300 transition-colors shadow-lg shadow-green-400/20"
                >
                  <Terminal className="w-4 h-4" />
                  Quick Start
                </button>
                <button
                  className="inline-flex items-center gap-2 border border-border dark:border-gray-600 text-foreground dark:text-gray-200 font-semibold px-6 py-3 rounded-lg hover:border-foreground/30 dark:hover:border-gray-400 hover:bg-secondary dark:hover:bg-white/5 transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  API Reference
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          QUICK LINKS — Horizontal Tab Bar
          Tabs switch content below, colored bottom border on active
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex border-b border-border overflow-x-auto hide-scrollbar"
          >
            {QUICK_LINKS.map((link, i) => (
              <button
                key={link.title}
                onClick={() => setActiveTab(i)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2
                  ${activeTab === i
                    ? `${TAB_ACCENT[link.title]}`
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                  }
                `}
              >
                {TAB_ICONS[link.title]}
                {link.title}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-8 rounded-xl border border-border p-8 ${TAB_BG[QUICK_LINKS[activeTab].title]}`}
          >
            <div className="grid sm:grid-cols-2 gap-8 items-start">
              <div>
                <div className={`w-12 h-12 rounded-xl ${QUICK_LINKS[activeTab].bgClass} flex items-center justify-center mb-4`}>
                  {QUICK_LINKS[activeTab].icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{QUICK_LINKS[activeTab].title}</h3>
                <p className="text-muted-foreground leading-relaxed">{QUICK_LINKS[activeTab].desc}</p>
              </div>
              <div className="space-y-3">
                {QUICK_LINKS[activeTab].items.map((item) => (
                  <InteractiveCard key={item} variant="subtle" glowColor="var(--gg-green)">
                    <div className="flex items-center justify-between bg-card rounded-lg p-3.5 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`w-4 h-4 ${TAB_ITEM_COLOR[QUICK_LINKS[activeTab].title]} transition-transform group-hover:translate-x-0.5`} />
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </InteractiveCard>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DEVELOPER HUB — Enhanced code block + numbered features
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Code Preview — takes 3 cols */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <CodeBlock />
            </motion.div>

            {/* Numbered Features — takes 2 cols */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-5"
            >
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-[var(--gg-violet)]/10 border border-[var(--gg-violet)]/20 rounded-full px-3 py-1 mb-4">
                  <Code2 className="w-3.5 h-3.5 text-[var(--gg-violet)]" />
                  <span className="text-xs text-[var(--gg-violet)] font-medium">Developer Hub</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Build on the{' '}
                  <span className="text-primary">ApexFlow Platform</span>
                </h2>
              </div>

              {DEV_FEATURES.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-violet)">
                    <div className="flex items-start gap-4 bg-card rounded-xl p-4">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-2xl font-extrabold text-primary/20 font-mono leading-none">{item.num}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.icon}
                          <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VIDEO TUTORIALS — Horizontal Scroll Carousel
          Featured video with pulse play button
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Video{' '}
                <span className="text-[var(--gg-amber)]">Tutorials</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg">
                Watch step-by-step guides to master every feature.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 scroll-smooth"
          >
            {VIDEO_TUTORIALS.map((video, i) => (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 w-[320px] sm:w-[360px]"
              >
                <InteractiveCard variant="default" glowColor="var(--gg-amber)">
                  <div className="gg-card bg-card rounded-2xl overflow-hidden group cursor-pointer">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-[var(--gg-amber)]/10 to-[var(--gg-violet)]/10 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-secondary/40 dark:bg-[#0a0a1a]/40" />
                      {i === 0 ? (
                        /* Featured: Pulse play button */
                        <div className="relative z-10">
                          <div className="absolute inset-0 rounded-full bg-[var(--gg-green)]/20 animate-pulse-play" />
                          <div className="w-16 h-16 rounded-full bg-[var(--gg-green)]/90 flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative z-10 shadow-lg shadow-[var(--gg-green)]/30">
                            <Play className="w-7 h-7 text-white ml-1" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-foreground/[0.08] dark:bg-white/[0.1] backdrop-blur border border-foreground/[0.12] dark:border-white/[0.15] flex items-center justify-center group-hover:scale-110 group-hover:bg-foreground/[0.12] dark:group-hover:bg-white/[0.15] transition-all duration-300 relative z-10">
                          <Play className="w-5 h-5 text-foreground ml-0.5" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-foreground text-xs px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-[var(--gg-green)]/90 text-white text-xs font-semibold px-2 py-0.5 rounded-md z-10">
                          Featured
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-[var(--gg-amber)] transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{video.desc}</p>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LATEST UPDATES — Timeline View
          Vertical line with colored dots
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-start justify-between mb-12"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Latest{' '}
                <span className="text-primary">Updates</span>
              </h2>
              <p className="mt-2 text-muted-foreground">
                Recent changelog entries and feature announcements.
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-primary/10 hidden sm:flex"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-6">
              {UPDATES.map((update, i) => (
                <motion.div
                  key={update.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="relative pl-8"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-2 w-[15px] h-[15px] rounded-full border-[3px] border-background ${TAG_DOT_COLORS[update.tagColor]} z-10`} />

                  <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
                    <div className="bg-card rounded-xl p-4 group">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border shrink-0 font-medium ${TAG_COLORS[update.tagColor]}`}
                          >
                            {update.tag}
                          </span>
                          <h3 className="font-medium text-foreground text-sm group-hover:text-[var(--gg-teal)] transition-colors">
                            {update.title}
                          </h3>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{update.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-[72px]">{update.desc}</p>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              View All Updates <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMMUNITY — Horizontal layout with GitHub prominent
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Join the{' '}
              <span className="text-primary">Community</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Connect with thousands of developers building on the ApexFlow platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* GitHub — Prominent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sm:col-span-1 sm:row-span-2"
            >
              <InteractiveCard variant="default" glowColor="var(--gg-teal)" className="h-full">
                <div className="gg-card bg-card rounded-2xl p-8 group cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Github className="w-8 h-8 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">GitHub Discussions</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      Ask questions, share ideas, and contribute to open-source ApexFlow tools. Star us, fork repos, and ship features.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-sm text-foreground font-semibold hover:text-primary transition-colors inline-flex items-center gap-1.5 bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-lg">
                      <Github className="w-3.5 h-3.5" />
                      Explore Repository
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">2.4k</div>
                      <div className="text-xs text-muted-foreground">Stars</div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">580+</div>
                      <div className="text-xs text-muted-foreground">Contributors</div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">120+</div>
                      <div className="text-xs text-muted-foreground">Repos</div>
                    </div>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

            {/* Discord */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <InteractiveCard variant="subtle" glowColor="var(--gg-violet)">
                <div className="gg-card bg-card rounded-2xl p-6 group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gg-violet)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-[var(--gg-violet)]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Discord Community</h3>
                      <p className="text-xs text-muted-foreground">Real-time chat</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Real-time chat with developers, engineers, and the core ApexFlow team.
                  </p>
                  <button className="text-sm text-[var(--gg-violet)] hover:text-[var(--gg-violet)]/80 transition-colors inline-flex items-center gap-1 font-medium">
                    Join Server <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </InteractiveCard>
            </motion.div>

            {/* Stack Overflow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                <div className="gg-card bg-card rounded-2xl p-6 group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gg-amber)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Hash className="w-5 h-5 text-[var(--gg-amber)]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Stack Overflow</h3>
                      <p className="text-xs text-muted-foreground">Q&A support</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Find answers tagged [apexflow] or post your own technical questions.
                  </p>
                  <button className="text-sm text-[var(--gg-amber)] hover:text-[var(--gg-amber)]/80 transition-colors inline-flex items-center gap-1 font-medium">
                    Browse Questions <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </InteractiveCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Terminal-Style Prompt
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#30363d]" style={{ background: '#0d1117' }}>
              {/* Terminal Header */}
              <div className="flex items-center gap-1.5 px-5 py-3 border-b border-[#30363d]" style={{ background: '#161b22' }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400 font-mono ml-3">apexflow — ready</span>
              </div>
              {/* Terminal Body */}
              <div className="p-6 sm:p-8">
                <div className="font-mono text-sm sm:text-base leading-loose">
                  <div className="text-gray-400">
                    <span className="text-green-400">$</span> echo &quot;Ready to build?&quot;
                  </div>
                  <div className="text-gray-200 text-lg sm:text-xl font-bold mt-1">
                    Ready to build?
                  </div>
                  <div className="mt-4">
                    <span className="text-green-400">$</span>{' '}
                    <span className="text-amber-400">apexflow</span>{' '}
                    <span className="text-[var(--gg-teal)]">start</span>
                    <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-blink-cursor align-middle" />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('pricing')}
                    className="inline-flex items-center gap-2 bg-green-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-green-300 transition-colors shadow-lg shadow-green-400/20 font-mono text-sm"
                  >
                    <Terminal className="w-4 h-4" />
                    $ apexflow start
                  </button>
                  <button
                    onClick={() => navigate('pricing')}
                    className="inline-flex items-center gap-2 border border-border dark:border-gray-600 text-foreground dark:text-gray-200 font-semibold px-6 py-3 rounded-lg hover:border-foreground/30 dark:hover:border-gray-400 hover:bg-secondary dark:hover:bg-white/5 transition-colors text-sm"
                  >
                    View Documentation
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
