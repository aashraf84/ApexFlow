'use client'

import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { motion } from 'framer-motion'
import {
  Building2,
  Zap,
  Shield,
  Lightbulb,
  ArrowRight,
  Globe,
  Target,
  Eye,
  MapPin,
  Clock,
  Rocket,
  Users,
  Code2,
  Layers,
  Handshake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InteractiveCard } from '@/components/shared/interactive-card'

const STATS = [
  { icon: <Building2 className="w-6 h-6 text-primary" />, value: '21', label: 'Industry ERPs', bgClass: 'bg-primary/10' },
  { icon: <Zap className="w-6 h-6 text-[var(--gg-violet)]" />, value: '3', label: 'Active Platforms', bgClass: 'bg-[var(--gg-violet)]/10' },
  { icon: <Layers className="w-6 h-6 text-[var(--gg-green)]" />, value: '50+', label: 'Modules', bgClass: 'bg-[var(--gg-green)]/10' },
  { icon: <Clock className="w-6 h-6 text-[var(--gg-amber)]" />, value: '24/7', label: 'Support', bgClass: 'bg-[var(--gg-amber)]/10' },
]

const VALUES = [
  {
    icon: <Building2 className="w-7 h-7 text-primary" />,
    title: 'Industry First',
    desc: "We don't build generic software and hope it fits. We study each industry deeply and build for its unique workflows, terminology, and challenges.",
    bgClass: 'bg-primary/10',
    accent: 'border-amber-500',
    accentColor: 'text-amber-500',
  },
  {
    icon: <Lightbulb className="w-7 h-7 text-[var(--gg-violet)]" />,
    title: 'Ecosystem Thinking',
    desc: 'Every module connects. Every data point flows. We design platforms where the whole is greater than the sum of its parts.',
    bgClass: 'bg-[var(--gg-violet)]/10',
    accent: 'border-[var(--gg-violet)]',
    accentColor: 'text-[var(--gg-violet)]',
  },
  {
    icon: <Shield className="w-7 h-7 text-[var(--gg-green)]" />,
    title: 'Reliability',
    desc: "99.9% uptime isn't a target — it's our baseline. Industries depend on us, and we take that responsibility seriously.",
    bgClass: 'bg-[var(--gg-green)]/10',
    accent: 'border-emerald-500',
    accentColor: 'text-emerald-500',
  },
  {
    icon: <Zap className="w-7 h-7 text-[var(--gg-amber)]" />,
    title: 'Innovation',
    desc: 'From real-time sync engines to AI-powered insights, we continuously push the boundaries of what enterprise software can do.',
    bgClass: 'bg-[var(--gg-amber)]/10',
    accent: 'border-orange-500',
    accentColor: 'text-orange-500',
  },
]

const TEAM = [
  {
    name: 'Ahmed Raza',
    role: 'CEO & Founder',
    bio: 'Former enterprise architect with 15+ years building industry-specific solutions across South Asia and the Middle East.',
    initials: 'AR',
  },
  {
    name: 'Sara Khan',
    role: 'CTO',
    bio: 'Full-stack engineer who led platform development at multiple SaaS companies. Architect of the ApexFlow Sync Engine.',
    initials: 'SK',
  },
  {
    name: 'Omar Siddiqui',
    role: 'Head of Product',
    bio: 'Product strategist with deep expertise in ERP systems for the apparel and hospitality industries.',
    initials: 'OS',
  },
  {
    name: 'Fatima Noor',
    role: 'Head of Engineering',
    bio: 'Infrastructure and DevOps specialist ensuring ApexFlow runs with enterprise-grade reliability and scale.',
    initials: 'FN',
  },
]

const TIMELINE = [
  { date: '2023 Q1', title: 'Founded in Lahore', desc: 'ApexFlow was born with a vision to revolutionize industry-specific ERP systems.', icon: <Rocket className="w-5 h-5 text-primary" />, dotColor: 'bg-amber-500' },
  { date: '2023 Q3', title: 'ApexFlow Core Engine v1', desc: 'Shipped the foundational sync engine and module architecture that powers all ERPs.', icon: <Code2 className="w-5 h-5 text-[var(--gg-violet)]" />, dotColor: 'bg-[var(--gg-violet)]' },
  { date: '2024 Q1', title: 'ApparelFlow Launch', desc: 'First industry-specific ERP went live, serving the textile and garment sector.', icon: <Layers className="w-5 h-5 text-[var(--gg-green)]" />, dotColor: 'bg-emerald-500' },
  { date: '2024 Q3', title: 'HotelFlow & EduFlow Launch', desc: 'Expanded into hospitality and education with two new purpose-built platforms.', icon: <Building2 className="w-5 h-5 text-[var(--gg-amber)]" />, dotColor: 'bg-orange-500' },
  { date: '2024 Q4', title: '21 Industry Roadmap Announced', desc: 'Unveiled the ambitious plan to cover 21 industries with dedicated ERP systems.', icon: <Target className="w-5 h-5 text-primary" />, dotColor: 'bg-rose-500' },
  { date: '2025 Q1', title: 'Sync Engine 2.0 & API Platform', desc: 'Launched next-gen sync engine and public API platform for third-party integrations.', icon: <Zap className="w-5 h-5 text-[var(--gg-violet)]" />, dotColor: 'bg-[var(--gg-teal)]' },
]

export function AboutPage() {
  const { navigate } = useNavigate()

  return (
    <PageLayout>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO — Split layout with warm gradient & dot pattern          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.07] via-orange-500/[0.05] to-amber-600/[0.03]" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(217,119,6,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Large "About" text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tighter">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  About
                </span>
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <span className="text-2xl sm:text-3xl font-bold text-foreground">ApexFlow</span>
              </div>
              <p className="mt-4 text-sm text-amber-600/70 font-medium tracking-wide uppercase">Industry-Specific ERP Ecosystem</p>
            </motion.div>

            {/* Right: Story paragraph */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-left"
            >
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                We build enterprise software that runs entire industries — not adapts to them, but is built for them from the ground up. Each platform is purpose-engineered for the unique workflows, regulations, and challenges of its sector.
              </p>
              <div className="mt-6 flex items-center gap-2 text-amber-600/80">
                <div className="w-8 h-px bg-amber-500/40" />
                <span className="text-xs font-medium tracking-wider uppercase">Est. 2023 · Lahore</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  OUR STORY — Left-aligned narrative with quote mark & drop cap */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative pl-8 sm:pl-12"
          >
            {/* Vertical emerald accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600/30" />
            {/* Decorative quote mark */}
            <div className="absolute -left-2 sm:left-0 -top-6 text-7xl sm:text-8xl font-serif text-emerald-500/15 leading-none select-none">&ldquo;</div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">Our Story</h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed text-base sm:text-lg">
              <p>
                <span className="text-4xl sm:text-5xl font-bold text-emerald-500/80 float-left mr-2 mt-1 leading-none">A</span>
                pexFlow was born from a simple observation: generic ERP systems fail industries. They force businesses to adapt their workflows to the software, not the other way around. We saw apparel factories struggling with retail-oriented tools, hotels making do with spreadsheets, and schools drowning in paper-based processes.
              </p>
              <p>
                So we built something different — an ecosystem of industry-specific operating systems, each engineered from the ground up for the unique workflows, regulations, and challenges of its sector. What started as a small team in Lahore has grown into 21 active ERP platforms serving 21 industries, with a roadmap that touches every major sector of the economy.
              </p>
              <p>
                Today, ApexFlow is the operating layer behind apparel production lines, hotel front desks, and school administration offices. We don&apos;t just build software — we build the infrastructure that industries run on.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  MISSION & VISION — Larger cards with dramatic gradients       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Mission & Vision</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission — Cyan-tinted */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <InteractiveCard variant="subtle" glowColor="var(--gg-vermillion)">
                <div className="rounded-2xl p-8 sm:p-10 group relative overflow-hidden bg-gradient-to-br from-[var(--gg-vermillion)]/[0.06] via-card to-[var(--gg-vermillion)]/[0.02]">
                  {/* Decorative dot pattern */}
                  <div
                    className="absolute top-4 right-4 w-32 h-32 opacity-[0.07]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, var(--gg-vermillion) 1.5px, transparent 1.5px)',
                      backgroundSize: '12px 12px',
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)]" />
                  <div className="relative">
                    <motion.div
                      className="w-16 h-16 rounded-xl bg-[var(--gg-vermillion)]/10 border border-[var(--gg-vermillion)]/20 flex items-center justify-center mb-6"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Target className="w-8 h-8 text-[var(--gg-vermillion)]" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Our Mission</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Transform how industries operate through purpose-built technology. Every business deserves software that speaks its language, understands its workflows, and amplifies its potential — not software that forces it to compromise.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

            {/* Vision — Violet-tinted */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                <div className="rounded-2xl p-8 sm:p-10 group relative overflow-hidden bg-gradient-to-br from-[var(--gg-amber)]/[0.06] via-card to-[var(--gg-amber)]/[0.02]">
                  {/* Decorative line pattern */}
                  <div
                    className="absolute top-4 right-4 w-32 h-32 opacity-[0.07]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, var(--gg-amber) 0px, var(--gg-amber) 1px, transparent 1px, transparent 8px)',
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--gg-amber)] to-[var(--gg-vermillion)]" />
                  <div className="relative">
                    <motion.div
                      className="w-16 h-16 rounded-xl bg-[var(--gg-amber)]/10 border border-[var(--gg-amber)]/20 flex items-center justify-center mb-6"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    >
                      <Eye className="w-8 h-8 text-[var(--gg-amber)]" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Our Vision</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Become the operating system for every industry worldwide. We envision a future where no business has to settle for generic software — where every sector has technology built specifically for the way it works.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  STATS — Horizontal banner with vertical dividers              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            <InteractiveCard variant="subtle" glowColor="#d97706">
              <div className="relative bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-amber-500/[0.08] rounded-2xl">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                  {STATS.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex flex-col items-center justify-center py-10 px-6"
                    >
                      <div className="text-4xl sm:text-5xl font-black text-foreground mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                      {/* Gradient vertical divider — not on last in row */}
                      {i < STATS.length - 1 && (
                        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-amber-500/25 to-transparent" />
                      )}
                      {i % 2 === 0 && i < STATS.length - 1 && (
                        <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-amber-500/25 to-transparent" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  OUR VALUES — Vertical list with colored left borders          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Our Values</h2>
            <p className="mt-3 text-muted-foreground">The principles that guide everything we build.</p>
          </motion.div>
          <div className="space-y-0">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative border-l-4 ${val.accent} ${
                  i % 2 === 0 ? 'bg-secondary/30' : 'bg-transparent'
                } rounded-r-xl`}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-green)">
                  <div className="p-6 sm:p-8 flex items-start gap-5 sm:gap-8 rounded-r-xl">
                    <span className={`text-3xl sm:text-4xl font-black ${val.accentColor} opacity-50 tabular-nums leading-none shrink-0`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">{val.icon}</div>
                        <h3 className="text-lg font-semibold">{val.title}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TIMELINE — Gradient line, color-coded dots, pulse on latest   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Our Journey</h2>
            <p className="mt-3 text-muted-foreground">From a bold idea to an industry-defining platform.</p>
          </motion.div>
          <div className="relative">
            {/* Gradient vertical line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--gg-amber)] via-[var(--gg-green)] via-[var(--gg-violet)] to-[var(--gg-teal)] opacity-40" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => {
                const isLatest = i === TIMELINE.length - 1
                return (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex items-start gap-6 sm:gap-8"
                  >
                    {/* Color-coded dot with pulse on latest */}
                    <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${item.dotColor}`} />
                      {isLatest && (
                        <motion.div
                          className={`absolute inset-0 rounded-full ${item.dotColor} opacity-30`}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <InteractiveCard variant="subtle" glowColor="var(--gg-violet)" className="flex-1">
                      <div className="bg-card rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{item.date}</span>
                          {isLatest && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gg-teal)] bg-[var(--gg-teal)]/10 px-2 py-0.5 rounded-full border border-[var(--gg-teal)]/20">Latest</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LEADERSHIP TEAM — Featured CEO layout                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Leadership Team</h2>
            <p className="mt-3 text-muted-foreground">The people behind the platform.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => {
              const isCEO = member.role === 'CEO & Founder'
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={isCEO ? 'sm:col-span-2 lg:col-span-2' : ''}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                    <div className={`bg-card rounded-2xl group relative overflow-hidden ${isCEO ? 'p-10 sm:p-12' : 'p-8 text-center'}`}>
                      {/* CEO gets a warm gradient accent */}
                      {isCEO && (
                        <>
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
                          <div
                            className="absolute bottom-4 right-4 w-24 h-24 opacity-[0.05]"
                            style={{
                              backgroundImage: 'radial-gradient(circle, #d97706 1.5px, transparent 1.5px)',
                              backgroundSize: '10px 10px',
                            }}
                          />
                        </>
                      )}
                      <div className={`relative ${isCEO ? 'flex items-center gap-8' : ''}`}>
                        <div className={`${isCEO ? 'w-24 h-24' : 'w-20 h-20'} rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-border flex items-center justify-center ${isCEO ? '' : 'mx-auto mb-5'} group-hover:scale-110 transition-transform group-hover:border-amber-500/30`}>
                          <span className={`${isCEO ? 'text-2xl' : 'text-xl'} font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent`}>{member.initials}</span>
                        </div>
                        <div className={isCEO ? 'text-left' : ''}>
                          <h3 className={`font-semibold text-foreground ${isCEO ? 'text-2xl' : 'text-lg'}`}>{member.name}</h3>
                          <p className={`text-sm font-medium mb-3 ${isCEO ? 'text-amber-500' : 'text-amber-500/80'}`}>{member.role}</p>
                          <p className={`text-muted-foreground leading-relaxed ${isCEO ? 'text-base' : 'text-sm'}`}>{member.bio}</p>
                        </div>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  GLOBAL PRESENCE — Preserved with warm accent updates           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Global Presence</h2>
            <p className="mt-3 text-muted-foreground">Rooted in Lahore, built for the world.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InteractiveCard variant="subtle" glowColor="var(--gg-teal)">
              <div className="gg-card bg-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
                {/* Decorative world map hint */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #d97706 1px, transparent 1px), radial-gradient(circle at 35% 55%, #d97706 1px, transparent 1px), radial-gradient(circle at 70% 60%, var(--gg-violet) 1px, transparent 1px), radial-gradient(circle at 45% 30%, var(--gg-violet) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-border flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-mono text-amber-600">Lahore HQ</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Lahore, Pakistan</h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Our headquarters in the heart of Pakistan&apos;s tech hub drives innovation across the region, with a growing remote team spanning multiple time zones.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />South Asia</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Middle East</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--gg-violet)]" />Global Remote</span>
                  </div>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CTA — Warm gradient banner matching hero                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.07] via-orange-500/[0.05] to-amber-600/[0.03] pointer-events-none" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(217,119,6,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Join Our{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Mission</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">Help us build the future of industry-specific enterprise software.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-[var(--gg-vermillion)] to-[var(--gg-amber)] text-white hover:from-[var(--gg-vermillion)] hover:to-[var(--gg-amber)] font-semibold rounded-xl px-8 h-12 btn-glow shadow-[var(--gg-shadow-glow)]" onClick={() => navigate('contact')}>
                Get in Touch <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-amber-500/30 text-foreground hover:bg-amber-500/10 rounded-xl px-8 h-12" onClick={() => navigate('become-partner')}>
                Become Partner <Handshake className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
