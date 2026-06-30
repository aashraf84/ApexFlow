'use client'

import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  TrendingUp,
  Send,
  Mail,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useState, type FormEvent, useRef, useEffect } from 'react'
import { InteractiveCard } from '@/components/shared/interactive-card'

type Tag = 'Strategy' | 'Case Study' | 'Release' | 'Engineering'

interface Post {
  tag: Tag
  tagColor: string
  title: string
  excerpt: string
  date: string
  readTime: string
}

const TAG_COLORS: Record<string, string> = {
  cyan: 'bg-primary/10 text-primary border-primary/20',
  emerald: 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20',
  violet: 'bg-[var(--gg-violet)]/10 text-[var(--gg-violet)] border-[var(--gg-violet)]/20',
  amber: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
}

const TAG_BORDER_COLORS: Record<string, string> = {
  cyan: 'from-[var(--gg-teal)] to-primary',
  emerald: 'from-[var(--gg-green)] to-[var(--gg-green)]',
  violet: 'from-[var(--gg-violet)] to-[var(--gg-violet)]',
  amber: 'from-[var(--gg-amber)] to-[var(--gg-amber)]',
}

const TAG_ACCENT: Record<string, string> = {
  cyan: 'text-primary',
  emerald: 'text-[var(--gg-green)]',
  violet: 'text-[var(--gg-violet)]',
  amber: 'text-[var(--gg-amber)]',
}

const TAG_CARD_BG: Record<string, string> = {
  cyan: 'from-primary/5 to-transparent',
  emerald: 'from-[var(--gg-green)]/5 to-transparent',
  violet: 'from-[var(--gg-violet)]/5 to-transparent',
  amber: 'from-[var(--gg-amber)]/5 to-transparent',
}

const TAG_LEFT_BAR: Record<string, string> = {
  cyan: 'bg-primary',
  emerald: 'bg-[var(--gg-green)]',
  violet: 'bg-[var(--gg-violet)]',
  amber: 'bg-[var(--gg-amber)]',
}

type FilterCategory = 'All' | Tag

const CATEGORIES: FilterCategory[] = ['All', 'Strategy', 'Case Study', 'Release', 'Engineering']

const POSTS: Post[] = [
  { tag: 'Strategy', tagColor: 'cyan', title: 'The Future of Industry-Specific ERP', excerpt: 'Why generic ERPs fail and how purpose-built platforms are reshaping enterprise software across every sector.', date: 'Jan 15, 2025', readTime: '5 min' },
  { tag: 'Case Study', tagColor: 'emerald', title: 'How ApparelFlow Reduced Waste by 40%', excerpt: 'A deep dive into how one apparel manufacturer used real-time production tracking to minimize waste and maximize efficiency.', date: 'Jan 8, 2025', readTime: '8 min' },
  { tag: 'Release', tagColor: 'violet', title: 'HotelFlow 2.0: What\'s New', excerpt: 'Revenue management, AI-powered pricing, and a completely redesigned guest experience module.', date: 'Dec 20, 2024', readTime: '4 min' },
  { tag: 'Engineering', tagColor: 'amber', title: 'Building for Scale: Our Architecture', excerpt: 'How we designed ApexFlow\'s infrastructure to handle millions of transactions across 21 industries.', date: 'Dec 12, 2024', readTime: '10 min' },
  { tag: 'Case Study', tagColor: 'emerald', title: 'EduFlow Case Study: Beaconhouse', excerpt: 'How Pakistan\'s largest school network manages 300,000+ students across 200+ campuses with EduFlow.', date: 'Nov 28, 2024', readTime: '7 min' },
  { tag: 'Engineering', tagColor: 'amber', title: 'The Sync Engine Explained', excerpt: 'Real-time bi-directional data synchronization across modules, ERPs, and third-party systems.', date: 'Nov 15, 2024', readTime: '6 min' },
]

/** Convert "5 min" → numeric minutes for progress bar */
function parseMinutes(readTime: string): number {
  const n = parseInt(readTime, 10)
  return isNaN(n) ? 5 : n
}

const MAX_READ = 12 // max minutes for progress bar scale

export function BlogPage() {
  const { navigate } = useNavigate()
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All')
  const tabsRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const featuredPost = POSTS[0]
  const gridPosts = POSTS.slice(1)

  const filteredGridPosts = activeCategory === 'All'
    ? gridPosts
    : gridPosts.filter((p) => p.tag === activeCategory)

  const filteredFeatured = activeCategory === 'All' || featuredPost.tag === activeCategory
    ? featuredPost
    : null

  // Animated tab indicator
  useEffect(() => {
    if (!tabsRef.current) return
    const tabs = tabsRef.current.querySelectorAll('[data-tab]')
    tabs.forEach((tab) => {
      if ((tab as HTMLElement).dataset.tab === activeCategory) {
        const rect = tab.getBoundingClientRect()
        const parentRect = tabsRef.current!.getBoundingClientRect()
        setIndicatorStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        })
      }
    })
  }, [activeCategory])

  function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault()
    toast.success('Subscribed! You\'ll receive our latest insights in your inbox.')
  }

  // Rotating article suggestions for CTA
  const suggestions = POSTS.slice(0, 3)
  const [currentSuggestion, setCurrentSuggestion] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [suggestions.length])

  return (
    <PageLayout>
      {/* ── HERO: Magazine-style dark hero with featured post ── */}
      <section className="relative pt-24 pb-0 sm:pt-28 overflow-hidden">
        {/* Dark background */}
        <div className="absolute inset-0 bg-secondary/80 dark:bg-[#0a0a1a]" />

        {filteredFeatured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-b-3xl sm:rounded-b-[2rem] min-h-[420px] sm:min-h-[520px] flex items-end cursor-pointer group">
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/40 to-transparent dark:from-[#0a0a1a] dark:via-[#0a0a1a]/60 dark:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/60 via-transparent to-transparent dark:from-[#0a0a1a]/80 dark:via-transparent dark:to-transparent" />
                {/* Decorative accent */}
                <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
                  <div className="inline-flex items-center gap-2 bg-muted/50 dark:bg-white/5 backdrop-blur-sm border border-border dark:border-white/10 rounded-full px-4 py-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground dark:text-white/60">Insights & Updates</span>
                  </div>
                </div>

                {/* Content overlay at bottom */}
                <div className="relative p-8 sm:p-12 lg:p-16 pb-12 sm:pb-16 w-full">
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`text-xs px-3 py-1 rounded-full border ${TAG_COLORS[featuredPost.tagColor]}`}>
                      {featuredPost.tag}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-white/40 font-mono tracking-widest uppercase">Featured</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground dark:text-white leading-[1.1] mb-4 max-w-3xl group-hover:text-primary transition-colors duration-300">
                    {featuredPost.title}
                  </h1>
                  <p className="text-muted-foreground dark:text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-5 text-sm text-muted-foreground dark:text-white/40">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{featuredPost.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{featuredPost.readTime} read</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Curved bottom edge */}
        <div className="relative h-16 sm:h-24 bg-secondary/80 dark:bg-[#0a0a1a]">
          <div className="absolute inset-x-0 bottom-0 h-full bg-background rounded-t-[2rem] sm:rounded-t-[3rem]" />
        </div>
      </section>

      {/* ── CATEGORY FILTER: Underline tabs with animated indicator ── */}
      <section className="pt-4 pb-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Underline tabs */}
          <div ref={tabsRef} className="relative flex gap-1 border-b border-border mb-10 overflow-x-auto scrollbar-hide">
            {/* Animated indicator */}
            <motion.div
              className="absolute bottom-0 h-[2px] bg-primary rounded-full"
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {CATEGORIES.map((cat) => {
              const count = cat === 'All'
                ? POSTS.length
                : POSTS.filter((p) => p.tag === cat).length
              return (
                <button
                  key={cat}
                  data-tab={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    activeCategory === cat
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat
                      ? 'bg-primary/15 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* ── BLOG GRID: Masonry-style with varying card sizes ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {filteredGridPosts.map((post, i) => {
              const isLarge = i < 2 // first 2 posts get larger cards
              const minutes = parseMinutes(post.readTime)
              const progress = Math.min((minutes / MAX_READ) * 100, 100)

              return (
                <motion.div
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={isLarge ? 'sm:col-span-1 lg:col-span-2' : ''}
                >
                  <InteractiveCard variant="subtle" glowColor={post.tagColor === 'cyan' ? 'var(--gg-teal)' : post.tagColor === 'emerald' ? 'var(--gg-green)' : post.tagColor === 'violet' ? 'var(--gg-violet)' : 'var(--gg-amber)'}>
                    <div className={`gg-card bg-card overflow-hidden group cursor-pointer relative rounded-2xl ${isLarge ? 'min-h-[280px]' : 'min-h-[240px]'}`}>
                      {/* Left accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${TAG_LEFT_BAR[post.tagColor]} opacity-60 group-hover:opacity-100 transition-opacity`} />
                      {/* Tag-specific gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${TAG_CARD_BG[post.tagColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                      <div className="relative p-6 pl-7">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border ${TAG_COLORS[post.tagColor]}`}>{post.tag}</span>
                          {isLarge && (
                            <span className={`text-xs font-semibold ${TAG_ACCENT[post.tagColor]}`}>{post.readTime} read</span>
                          )}
                        </div>
                        <h3 className={`font-bold text-foreground mb-2 group-hover:${TAG_ACCENT[post.tagColor]} transition-colors leading-snug ${isLarge ? 'text-xl' : 'text-lg'}`}>
                          {post.title}
                        </h3>
                        <p className={`text-sm text-muted-foreground leading-relaxed mb-4 ${isLarge ? '' : 'line-clamp-3'}`}>{post.excerpt}</p>

                        {/* Reading time as progress bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${TAG_LEFT_BAR[post.tagColor]} opacity-70`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />{post.readTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                        </div>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>

          {filteredGridPosts.length === 0 && !filteredFeatured && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No posts found in this category. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER: Full-width gradient banner ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="relative overflow-hidden rounded-3xl">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--gg-violet)]/20 via-[var(--gg-violet)]/10 to-primary/15" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gg-violet)]/5 to-transparent" />
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--gg-violet)]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative px-8 py-12 sm:px-16 sm:py-16 flex flex-col lg:flex-row lg:items-center lg:gap-12">
                {/* Left: Copy + envelope icon */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-[var(--gg-violet)]/15 border border-[var(--gg-violet)]/20 flex items-center justify-center mx-auto lg:mx-0 mb-5"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Mail className="w-7 h-7 text-[var(--gg-violet)]" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay in the Loop</h2>
                  <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">Get the latest insights, product updates, and industry news delivered to your inbox.</p>
                </div>

                {/* Right: Integrated email form */}
                <div className="flex-1 mt-8 lg:mt-0 max-w-lg mx-auto lg:mx-0 w-full">
                  <form onSubmit={handleNewsletterSubmit} className="relative">
                    <div className="flex items-center bg-background/60 backdrop-blur-sm border border-border rounded-2xl p-1.5 shadow-lg focus-within:border-[var(--gg-violet)]/40 transition-colors">
                      <div className="flex items-center gap-2 pl-4 flex-1">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          required
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11 px-0 placeholder:text-foreground/45"
                        />
                      </div>
                      <Button type="submit" className="bg-[var(--gg-violet)] hover:bg-[var(--gg-violet)]/80 text-white font-medium rounded-xl px-6 h-10 shrink-0 shadow-lg">
                        Subscribe <Send className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </div>
                  </form>
                  <p className="text-xs text-foreground/50 mt-3 text-center lg:text-left">No spam. Unsubscribe anytime.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA: Magazine-style with rotating suggestions ── */}
      <section className="py-20 border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="relative overflow-hidden rounded-3xl bg-card dark:bg-[#0a0a1a]">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[var(--gg-violet)]/5" />

              <div className="relative px-8 py-14 sm:px-16 sm:py-20 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-6 opacity-60" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground dark:text-white">Ready to see ApexFlow in action?</h2>
                <p className="text-muted-foreground dark:text-white/50 max-w-lg mx-auto mb-8 text-lg">Explore our products and discover how purpose-built ERPs transform industries.</p>

                {/* Rotating suggestion */}
                <div className="mb-10 h-20 flex items-center justify-center">
                  <motion.div
                    key={currentSuggestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-foreground/45 dark:text-white/30"
                  >
                    <span className="text-muted-foreground dark:text-white/50">You might also like: </span>
                    <span className={`font-medium ${TAG_ACCENT[suggestions[currentSuggestion].tagColor]}`}>
                      {suggestions[currentSuggestion].title}
                    </span>
                  </motion.div>
                </div>

                <Button size="lg" className="bg-[var(--gg-vermillion)] text-white hover:bg-[var(--gg-vermillion)] font-semibold rounded-xl px-8 h-12 btn-glow" onClick={() => navigate('products')}>
                  Explore Products <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
