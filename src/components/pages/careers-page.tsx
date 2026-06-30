'use client'

import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { motion } from 'framer-motion'
import {
  Globe,
  GraduationCap,
  DollarSign,
  Heart,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  UserCheck,
  MessageSquare,
  Handshake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState, type FormEvent } from 'react'

const PERKS = [
  { icon: <Globe className="w-8 h-8 text-amber-100" />, title: 'Remote-First', desc: 'Work from anywhere in Pakistan or the world. We believe in output, not office hours.', bgClass: 'bg-primary/10', gradient: 'from-amber-500/20 to-orange-600/10', accent: 'text-amber-400' },
  { icon: <GraduationCap className="w-8 h-8 text-purple-100" />, title: 'Learning Budget', desc: 'Annual budget for courses, conferences, and books. We invest in your growth.', bgClass: 'bg-[var(--gg-violet)]/10', gradient: 'from-purple-500/20 to-fuchsia-600/10', accent: 'text-[var(--gg-violet)]' },
  { icon: <DollarSign className="w-8 h-8 text-emerald-100" />, title: 'Equity Options', desc: "Every team member has a stake in ApexFlow's success through our equity program.", bgClass: 'bg-[var(--gg-green)]/10', gradient: 'from-emerald-500/20 to-teal-600/10', accent: 'text-emerald-400' },
  { icon: <Heart className="w-8 h-8 text-rose-100" />, title: 'Health & Wellness', desc: 'Comprehensive health insurance, mental health support, and flexible leave policies.', bgClass: 'bg-[var(--gg-amber)]/10', gradient: 'from-rose-500/20 to-pink-600/10', accent: 'text-rose-400' },
]

type Department = 'All' | 'Engineering' | 'Design' | 'Sales' | 'Support' | 'Documentation'

interface Position {
  title: string
  dept: Department
  location: string
  type: string
}

const DEPT_COLORS: Record<string, string> = {
  Engineering: 'bg-primary/10 text-primary border-primary/20',
  Design: 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] border-[var(--gg-violet)]/20',
  Sales: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
  Support: 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20',
  Documentation: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

const DEPT_BORDER_COLORS: Record<string, string> = {
  Engineering: 'border-l-primary',
  Design: 'border-l-[var(--gg-violet)]',
  Sales: 'border-l-[var(--gg-amber)]',
  Support: 'border-l-[var(--gg-green)]',
  Documentation: 'border-l-pink-500',
}

const DEPT_HEADER_BG: Record<string, string> = {
  Engineering: 'from-primary/20 to-primary/5',
  Design: 'from-[var(--gg-violet)]/20 to-[var(--gg-violet)]/5',
  Sales: 'from-[var(--gg-amber)]/20 to-[var(--gg-amber)]/5',
  Support: 'from-[var(--gg-green)]/20 to-[var(--gg-green)]/5',
  Documentation: 'from-pink-500/20 to-pink-500/5',
}

const POSITIONS: Position[] = [
  { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Enterprise Sales Lead', dept: 'Sales', location: 'Lahore', type: 'Full-time' },
  { title: 'DevOps Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Manager', dept: 'Support', location: 'Remote', type: 'Full-time' },
  { title: 'Technical Writer', dept: 'Documentation', location: 'Remote', type: 'Full-time' },
  { title: 'Backend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'QA Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
]

const DEPARTMENTS: Department[] = ['All', 'Engineering', 'Design', 'Sales', 'Support', 'Documentation']

const HIRING_STEPS = [
  { icon: <FileText className="w-6 h-6 text-amber-400" />, title: 'Apply', desc: 'Submit your application with resume and cover letter.', bgClass: 'bg-primary/10', accentColor: 'bg-amber-500', ringColor: 'ring-amber-500/30' },
  { icon: <UserCheck className="w-6 h-6 text-[var(--gg-violet)]" />, title: 'Screen', desc: 'A quick call to learn about your background and goals.', bgClass: 'bg-[var(--gg-violet)]/10', accentColor: 'bg-[var(--gg-violet)]', ringColor: 'ring-purple-500/30' },
  { icon: <MessageSquare className="w-6 h-6 text-emerald-400" />, title: 'Interview', desc: 'Deep-dive technical and culture-fit conversations.', bgClass: 'bg-[var(--gg-green)]/10', accentColor: 'bg-emerald-500', ringColor: 'ring-emerald-500/30' },
  { icon: <Handshake className="w-6 h-6 text-rose-400" />, title: 'Offer', desc: 'Welcome to the team! We move fast on great fits.', bgClass: 'bg-[var(--gg-amber)]/10', accentColor: 'bg-rose-500', ringColor: 'ring-rose-500/30' },
]

function ApplyDialog({ position }: { position: Position }) {
  const [open, setOpen] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    toast.success("Application submitted! We'll be in touch soon.")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-5 shrink-0 shadow-lg shadow-amber-600/20">
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Apply for <span className="text-amber-500">{position.title}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">Full Name</Label>
            <Input id="name" placeholder="Your full name" required className="bg-secondary/50 border-border focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required className="bg-secondary/50 border-border focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm text-muted-foreground">Resume Link</Label>
            <Input id="resume" type="url" placeholder="https://drive.google.com/..." required className="bg-secondary/50 border-border focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover" className="text-sm text-muted-foreground">Cover Letter</Label>
            <Textarea id="cover" placeholder="Tell us why you'd be a great fit..." rows={4} className="bg-secondary/50 border-border focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl resize-none" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl h-11 shadow-lg shadow-amber-600/20">
              Submit Application <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CareersPage() {
  const { navigate } = useNavigate()
  const [activeDept, setActiveDept] = useState<Department>('All')

  const filteredPositions = activeDept === 'All'
    ? POSITIONS
    : POSITIONS.filter((p) => p.dept === activeDept)

  // Group positions by department for kanban layout
  const groupedByDept = DEPARTMENTS.filter((d) => d !== 'All').map((dept) => ({
    dept,
    positions: filteredPositions.filter((p) => p.dept === dept),
  })).filter((g) => g.positions.length > 0)

  return (
    <PageLayout>
      {/* ── HERO: Warm gradient, left-aligned, pulse count ── */}
      <section className="relative pt-24 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-background" />
        {/* "Join us" pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='35' font-family='system-ui' font-size='12' font-weight='700' fill='%23f59e0b'%3EJOIN US%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }} />
        {/* Decorative warm circles */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-[5%] w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300">We&apos;re hiring</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:gap-12">
              <div className="flex-1">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                  We&apos;re{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Hiring</span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl">Help us build the future of industry-specific enterprise software. Remote-first, impact-driven.</p>
              </div>

              {/* Large position count with pulse */}
              <div className="mt-8 lg:mt-0 flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-2xl animate-ping opacity-30" />
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-b from-amber-300 to-orange-500 bg-clip-text text-transparent">{POSITIONS.length}</span>
                    <span className="text-xs text-amber-400/80 font-medium mt-1">Open Roles</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm text-muted-foreground">Across</div>
                  <div className="text-2xl font-bold text-foreground">{DEPARTMENTS.length - 1} Departments</div>
                  <div className="text-sm text-muted-foreground mt-1">Remote & On-site</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PERKS: Bento grid on desktop, horizontal scroll on mobile ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Why <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">ApexFlow</span></h2>
            <p className="mt-3 text-muted-foreground">More than a job — a place to grow and make an impact.</p>
          </motion.div>

          {/* Horizontal scroll on mobile, 2x2 bento on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory lg:overflow-visible lg:grid lg:grid-cols-2 lg:pb-0 scrollbar-hide">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-start shrink-0 w-[80vw] sm:w-auto lg:w-auto"
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                  <div className={`bg-gradient-to-br ${perk.gradient} rounded-2xl p-7 relative overflow-hidden group min-h-[200px] lg:min-h-[220px]`}>
                    {/* Decorative circle */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/[0.03] rounded-full" />
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-5"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    >
                      {perk.icon}
                    </motion.div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN POSITIONS: Kanban-style grouped by department ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Open Positions</h2>
            <p className="mt-2 text-muted-foreground">Find your next role at ApexFlow.</p>
          </motion.div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {DEPARTMENTS.map((dept) => {
              const count = dept === 'All' ? POSITIONS.length : POSITIONS.filter((p) => p.dept === dept).length
              return (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all font-medium flex items-center gap-2 ${
                    activeDept === dept
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {dept}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeDept === dept ? 'bg-amber-500/20 text-amber-300' : 'bg-secondary text-muted-foreground'
                  }`}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Kanban columns by department */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedByDept.map(({ dept, positions }, deptIdx) => (
              <motion.div
                key={dept}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: deptIdx * 0.1 }}
              >
                {/* Department header */}
                <div className={`bg-gradient-to-r ${DEPT_HEADER_BG[dept] || 'from-secondary to-secondary/50'} rounded-t-xl px-4 py-3 border-b border-border`}>
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      dept === 'Engineering' ? 'bg-primary' :
                      dept === 'Design' ? 'bg-[var(--gg-violet)]' :
                      dept === 'Sales' ? 'bg-[var(--gg-amber)]' :
                      dept === 'Support' ? 'bg-[var(--gg-green)]' :
                      'bg-pink-500'
                    }`} />
                    {dept}
                    <span className="text-muted-foreground font-normal ml-auto">{positions.length}</span>
                  </h3>
                </div>
                {/* Position cards */}
                <div className="space-y-3 mt-3">
                  {positions.map((pos, i) => (
                    <motion.div
                      key={pos.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                        <div className={`gg-card bg-card rounded-xl p-4 border-l-4 ${DEPT_BORDER_COLORS[pos.dept] || 'border-l-muted'} group`}>
                          <h4 className="font-semibold text-sm text-foreground group-hover:text-amber-400 transition-colors">{pos.title}</h4>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{pos.location}</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{pos.type}</span>
                          </div>
                          <div className="mt-3">
                            <ApplyDialog position={pos} />
                          </div>
                        </div>
                      </InteractiveCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPositions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No positions found in this department. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HIRING PROCESS: Horizontal timeline with numbered circles ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold">Hiring <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Process</span></h2>
            <p className="mt-3 text-muted-foreground">From application to offer — here&apos;s how it works.</p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-[2px] bg-border" />
            <div className="hidden lg:block absolute top-10 left-[8%] h-[2px] bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500 opacity-40" style={{ width: '84%' }} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {HIRING_STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Numbered circle */}
                  <div className="relative z-10 mb-5">
                    <motion.div
                      className={`w-20 h-20 rounded-full ${step.accentColor} flex items-center justify-center relative ring-4 ${step.ringColor}`}
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                    >
                      <span className="text-2xl font-extrabold text-white">{i + 1}</span>
                    </motion.div>
                    {/* Active step pulse ring */}
                    <motion.div
                      className={`absolute inset-0 w-20 h-20 rounded-full ${step.accentColor} opacity-20`}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                    />
                  </div>

                  {/* Arrow between steps (desktop) */}
                  {i < HIRING_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 z-20">
                      <ArrowRight className="w-5 h-5 text-foreground/40" />
                    </div>
                  )}

                  <h3 className="font-bold text-foreground mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">{step.desc}</p>

                  {/* Mobile arrow */}
                  {i < HIRING_STEPS.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-4">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA: Warm gradient banner ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="relative overflow-hidden rounded-3xl">
              {/* Warm gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/15 to-amber-700/10" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />

              <div className="relative px-8 py-14 sm:px-16 sm:py-20 text-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mx-auto mb-6"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CheckCircle2 className="w-8 h-8 text-amber-400" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Don&apos;t see your role?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.</p>
                <Button size="lg" className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)] text-white font-semibold rounded-xl px-8 h-12 btn-glow" onClick={() => navigate('contact')}>
                  Send Resume <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
