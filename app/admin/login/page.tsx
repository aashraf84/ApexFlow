'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Loader2, ArrowRight, Wifi, WifiOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dbReady, setDbReady] = useState(false)
  const [dbWarming, setDbWarming] = useState(true)

  // Warm up database connection on page load (Neon cold start)
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 5

    const warmUp = async () => {
      attempts++
      try {
        const res = await fetch('/api/auth/ping')
        const data = await res.json()
        if (data.ok) {
          setDbReady(true)
          setDbWarming(false)
          return
        }
      } catch {
        // Ignore fetch errors
      }

      if (attempts < maxAttempts) {
        // Wait and retry
        await new Promise((r) => setTimeout(r, 2000 * attempts))
        warmUp()
      } else {
        // Give up warming but still allow login attempt
        setDbReady(true)
        setDbWarming(false)
      }
    }

    warmUp()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const doLogin = async (attempt: number): Promise<void> => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 60000) // 60s timeout for Neon cold starts

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
          signal: controller.signal,
        })

        clearTimeout(timeout)
        const data = await res.json()

        if (!res.ok) {
          // If it's a DB wake-up error, retry automatically (up to 5 times)
          if (res.status === 503 && attempt < 5) {
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)))
            return doLogin(attempt + 1)
          }
          setError(data.error || 'Login failed')
          return
        }

        // CRITICAL: Use full-page redirect instead of router.push().
        // router.push() is a soft navigation that fires the admin layout's
        // useEffect session-check IMMEDIATELY — before the browser has fully
        // processed the Set-Cookie header from this response.  This causes the
        // session check to run without the cookie, fail, and redirect back to
        // /admin/login, making login appear broken.
        // A full-page navigation guarantees the cookie jar is flushed first.
        window.location.href = '/admin/dashboard'
      } catch (err) {
        // Retry up to 5 times for network/timeout errors (Neon cold start)
        if (attempt < 5) {
          await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)))
          return doLogin(attempt + 1)
        }
        setError('Connection error. The database may be waking up — please wait a moment and try again.')
      }
    }

    await doLogin(0)
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* ── Golden Gate gradient line at top ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gg-vermillion), var(--gg-amber), transparent)',
        }}
      />

      {/* ── Decorative radial background orbs ── */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--gg-vermillion) 8%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--gg-amber) 6%, transparent) 0%, transparent 70%)',
          animationDelay: '1.5s',
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full animate-breathe"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--gg-teal) 4%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
              boxShadow: '0 4px 14px -3px color-mix(in srgb, var(--gg-vermillion) 35%, transparent)',
            }}
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">
            <span className="site-logo-first">Apex</span>
            <span className="text-gradient-primary">Flow</span>
          </span>
        </div>

        {/* ── Login Card ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card)',
            boxShadow: 'var(--gg-shadow-card)',
            border: '1px solid var(--gg-separator)',
          }}
        >
          {/* Inner top accent line */}
          <div
            className="h-[2px] mx-auto"
            style={{
              maxWidth: '60%',
              background: 'linear-gradient(90deg, transparent, var(--gg-vermillion), var(--gg-amber), transparent)',
            }}
          />

          <div className="px-7 pt-7 pb-3 text-center">
            <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to the admin panel
            </p>
          </div>

          {/* DB Status indicator */}
          {dbWarming && (
            <div className="mx-7 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
              style={{
                background: 'color-mix(in srgb, var(--gg-amber) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--gg-amber) 18%, transparent)',
                color: 'var(--gg-amber)',
              }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Warming up database connection…
            </div>
          )}

          <div className="px-7 pb-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div
                  className="rounded-lg px-3.5 py-2.5 text-sm flex items-start gap-2"
                  style={{
                    background: 'color-mix(in srgb, var(--gg-vermillion) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--gg-vermillion) 18%, transparent)',
                    color: 'var(--gg-vermillion)',
                  }}
                >
                  <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--gg-vermillion)' }} />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                  style={{
                    borderColor: 'var(--gg-separator)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--gg-vermillion) 50%, transparent)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--gg-vermillion) 10%, transparent)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gg-separator)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                  style={{
                    borderColor: 'var(--gg-separator)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--gg-vermillion) 50%, transparent)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--gg-vermillion) 10%, transparent)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gg-separator)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 relative font-medium text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                  boxShadow: '0 4px 14px -3px color-mix(in srgb, var(--gg-vermillion) 30%, transparent)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          {dbReady ? (
            <Wifi className="h-3 w-3" style={{ color: 'var(--gg-teal)' }} />
          ) : (
            <WifiOff className="h-3 w-3 text-muted-foreground" />
          )}
          ApexFlow Cloud Admin Panel
        </p>
      </div>
    </div>
  )
}
