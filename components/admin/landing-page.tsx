'use client'

import { useNavigate } from '@/lib/use-navigate'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Layers,
  Code2,
  Monitor,
  Search,
  Palette,
  Hammer,
  Rocket,
  Cpu,
  RefreshCw,
  Building2,
  Users,
  Shirt,
  Hotel,
  GraduationCap,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/shared/site-logo'

function Logo() {
  return <SiteLogo variant="full" size={48} />
}

function FloatingOrb({ className, color }: { className?: string; color: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} style={{ background: color }} />
  )
}

export function LandingPage() {
  const { navigate } = useNavigate()

  const navLinks = ['Ecosystem', 'Products', 'Solutions', 'Industries', 'Pricing', 'Resources', 'Contact']

  const ecosystemCards = [
    {
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      title: 'Ecosystem Architecture',
      desc: 'Interconnected modules that share data, workflows, and intelligence across every layer of your operation.',
    },
    {
      icon: <Code2 className="w-6 h-6 text-violet-400" />,
      title: 'Enterprise Engineering',
      desc: 'Built with industrial-grade code, rigorous testing, and zero-downtime deployment pipelines.',
    },
    {
      icon: <Monitor className="w-6 h-6 text-emerald-400" />,
      title: 'Operating System Approach',
      desc: 'Not just an app — a platform that manages your entire business like an OS manages a computer.',
    },
  ]

  const howItWorks = [
    { icon: <Search className="w-6 h-6 text-cyan-400" />, step: '01', title: 'Research', desc: 'Deep industry analysis to understand every workflow, pain point, and opportunity.' },
    { icon: <Palette className="w-6 h-6 text-violet-400" />, step: '02', title: 'Design', desc: 'Architect systems that map exactly to how your industry operates — not the other way around.' },
    { icon: <Hammer className="w-6 h-6 text-emerald-400" />, step: '03', title: 'Build', desc: 'Engineering with precision: modular, scalable, and built for the long haul.' },
    { icon: <Rocket className="w-6 h-6 text-amber-400" />, step: '04', title: 'Deploy', desc: 'Zero-downtime rollout with full migration support and 24/7 monitoring.' },
  ]

  const builtDifferent = [
    { icon: <Cpu className="w-8 h-8 text-cyan-400" />, title: 'ApexFlow Core', desc: 'The foundation engine that powers every module, integration, and workflow across the platform.' },
    { icon: <RefreshCw className="w-8 h-8 text-violet-400" />, title: 'Sync Engine', desc: 'Real-time bi-directional sync across all modules, third-party services, and data sources.' },
    { icon: <Building2 className="w-8 h-8 text-emerald-400" />, title: 'Industry OS', desc: 'Purpose-built operating layers for apparel, hospitality, and education verticals.' },
    { icon: <Users className="w-8 h-8 text-amber-400" />, title: 'Client Ecosystem', desc: 'A thriving network of businesses sharing insights, benchmarks, and best practices.' },
  ]

  const products = [
    {
      icon: <Shirt className="w-8 h-8 text-cyan-400" />,
      name: 'ApparelFlow',
      tagline: 'AI Powered OS for the Apparel Industry',
      desc: 'End-to-end management from raw material procurement to finished goods distribution.',
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      borderGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    },
    {
      icon: <Hotel className="w-8 h-8 text-violet-400" />,
      name: 'HotelFlow',
      tagline: 'AI Powered OS for Hospitality',
      desc: 'Complete hotel operations management including reservations, F&B, housekeeping, and revenue.',
      gradient: 'from-violet-500/20 to-violet-500/5',
      borderGlow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
      popular: true,
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-emerald-400" />,
      name: 'EduFlow',
      tagline: 'AI Powered OS for Education',
      desc: 'Comprehensive school and university management from admissions to alumni tracking.',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      borderGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Floating Orbs */}
      <FloatingOrb className="w-96 h-96 top-20 -left-48 animate-float" color="#06b6d4" />
      <FloatingOrb className="w-80 h-80 top-40 right-0 animate-float-delayed" color="#8b5cf6" />
      <FloatingOrb className="w-64 h-64 bottom-40 left-1/3 animate-float" color="#06b6d4" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button key={link} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => navigate('login')}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-medium rounded-lg px-5"
              onClick={() => navigate('login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="grid-bg relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">Now serving 3 industries</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight max-w-5xl mx-auto">
              We Build Enterprise Software{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                That Runs Entire Industries
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From apparel factories to hotel chains to university campuses — ApexFlow delivers ecosystem-grade ERP solutions built for the complexity of real-world operations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold rounded-xl px-8 h-12"
                onClick={() => navigate('login')}
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-accent rounded-xl px-8 h-12"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Not Just Software.{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">An Ecosystem.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Every module connects, every data point flows, and every decision is informed by the full picture.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {ecosystemCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 hover:border-cyan-500/30 transition-colors group"
                style={{ boxShadow: '0 0 0px rgba(6,182,212,0)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0px rgba(6,182,212,0)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Four stages. One mission: build software that actually runs your industry.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative bg-card/90 backdrop-blur border border-border rounded-2xl p-6 group"
                style={{ boxShadow: '0 0 0px rgba(6,182,212,0)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0px rgba(6,182,212,0)' }}
              >
                <span className="absolute top-4 right-4 text-5xl font-black text-muted-foreground/10">{item.step}</span>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built Different Section */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Built <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Different</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Not another SaaS tool. A platform engineered for the complexity of entire industries.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {builtDifferent.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 hover:border-border transition-colors group"
                style={{ boxShadow: '0 0 0px rgba(6,182,212,0)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0px rgba(6,182,212,0)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Active <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">ERPs</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Three industries. Three purpose-built platforms. One ecosystem.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative bg-card/90 backdrop-blur border border-border rounded-2xl p-6 ${product.borderGlow} hover:border-border transition-colors group overflow-hidden`}
              >
                {product.popular && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-b ${product.gradient} opacity-50 pointer-events-none`} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {product.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                  <p className="text-sm text-cyan-400 mb-3">{product.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.desc}</p>
                  <Button
                    variant="ghost"
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 p-0"
                    onClick={() => navigate('login')}
                  >
                    Learn More <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See What We&apos;ve Built</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Get hands-on with the platform that&apos;s redefining how industries run their operations.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold rounded-xl px-8 h-12"
              onClick={() => navigate('login')}
            >
              Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-1">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Enterprise software that runs entire industries.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">About</button></li>
                <li><button className="hover:text-foreground transition-colors">Become Partner</button></li>
                <li><button className="hover:text-foreground transition-colors">Blog</button></li>
                <li><button className="hover:text-foreground transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">ApparelFlow</button></li>
                <li><button className="hover:text-foreground transition-colors">HotelFlow</button></li>
                <li><button className="hover:text-foreground transition-colors">EduFlow</button></li>
                <li><button className="hover:text-foreground transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Documentation</button></li>
                <li><button className="hover:text-foreground transition-colors">API Reference</button></li>
                <li><button className="hover:text-foreground transition-colors">Status</button></li>
                <li><button className="hover:text-foreground transition-colors">Changelog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Privacy</button></li>
                <li><button className="hover:text-foreground transition-colors">Terms</button></li>
                <li><button className="hover:text-foreground transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2025 ApexFlow. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Built for industries that demand more.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
