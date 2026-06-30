'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type AdminUser } from '@/lib/store'
import { useNavigate } from '@/lib/use-navigate'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Shield, LockKeyhole, CheckCircle2, RotateCcw, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { SiteLogo } from '@/components/shared/site-logo'

function Logo() {
  return <SiteLogo variant="full" size={56} />
}

export function LoginPage() {
  const setAdminUser = useAppStore((s) => s.setAdminUser)
  const { navigate } = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetSecret, setResetSecret] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'down' | 'up'>('checking')

  // Poll the server until it's alive. The sandbox frequently reaps the dev
  // server, so we must confirm it's reachable BEFORE attempting login —
  // otherwise a dead server produces misleading "Invalid email or password"
  // errors (or endless connection errors).
  const waitForServer = async (maxAttempts = 30): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      setServerStatus(i === 0 ? 'checking' : 'down')
      try {
        const res = await fetch('/api/auth/ping', { cache: 'no-store' })
        if (res.ok) {
          setServerStatus('up')
          return true
        }
      } catch {
        // server not up yet
      }
      // Wait 1s, 2s, 3s... up to 5s between attempts
      await new Promise((r) => setTimeout(r, Math.min(1000 + i * 500, 5000)))
    }
    setServerStatus('down')
    return false
  }

  // Check server status on mount
  useEffect(() => {
    waitForServer(1).then(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // STEP 1: Make sure the server is actually alive before submitting.
    // This prevents the "Invalid email or password" error that appears
    // when the server is restarting and the fetch fails or hits a stale state.
    const serverUp = await waitForServer(30)
    if (!serverUp) {
      setError('Unable to reach the server. Please wait a few seconds and try again.')
      setLoading(false)
      return
    }

    // STEP 2: Submit the login. If we get a network error here (server died
    // between the ping and the login), wait for it to come back and retry.
    const doLogin = async (attempt: number): Promise<void> => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30000)

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password, rememberMe }),
          signal: controller.signal,
        })

        clearTimeout(timeout)
        const data = await res.json()

        if (!res.ok) {
          // 503 = DB is warming up (retryable)
          if (res.status === 503 && data.retryable && attempt < 5) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
            return doLogin(attempt + 1)
          }
          // 401 = genuinely invalid credentials. The server is up and the DB
          // answered, so this is a real "wrong email/password" — NOT a server
          // issue. Show the real error.
          // 500 = server error, retry a couple times
          if (res.status >= 500 && attempt < 3) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
            return doLogin(attempt + 1)
          }
          setError(data.error || 'Login failed')
          return
        }

        const user: AdminUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar || null,
        }

        setAdminUser(user)
        navigate('dashboard')
        toast.success('Welcome back, ' + user.name)
      } catch {
        // Network error — server died between our ping and the login call.
        // Wait for it to come back, then retry the actual login.
        if (attempt < 5) {
          await waitForServer(15)
          await new Promise((r) => setTimeout(r, 1000))
          return doLogin(attempt + 1)
        }
        setError('Connection error. The server is restarting — please wait a few seconds and try again.')
      }
    }

    await doLogin(0)
    setLoading(false)
  }

  const handleResetAdmin = async () => {
    setResetLoading(true)
    setResetResult(null)
    try {
      const res = await fetch('/api/auth/reset-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: resetSecret }),
      })
      const data = await res.json()

      if (res.ok) {
        // Do NOT echo the new password back to the screen and do NOT auto-fill
        // the login form. The admin must check the server logs (or a secure
        // channel) for the reset credentials and type them manually.
        setResetResult({ success: true, message: 'Admin credentials reset successfully. The new credentials have been logged on the server — retrieve them from a secure channel, then sign in.' })
        toast.success('Admin credentials reset successfully')
      } else {
        setResetResult({ success: false, message: data.error || 'Reset failed' })
      }
    } catch {
      setResetResult({ success: false, message: 'Connection error. Please try again.' })
    }
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--gg-shadow-card)]">
          <div className="text-center mb-8">
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">Admin Console</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10 rounded-xl h-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 rounded-xl h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowReset(!showReset)}
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Reset password
              </button>
            </div>

            {/* Reset Admin Panel */}
            <AnimatePresence>
              {showReset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium">Reset Admin Credentials</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will reset the admin account to default credentials. Enter the reset secret to proceed.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={resetSecret}
                      onChange={(e) => setResetSecret(e.target.value)}
                      placeholder="Reset secret key"
                      className="flex-1 rounded-xl h-9 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetAdmin}
                      disabled={resetLoading || !resetSecret}
                      className="rounded-xl"
                    >
                      {resetLoading ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        'Reset'
                      )}
                    </Button>
                  </div>
                  {resetResult && (
                    <div className={`text-xs rounded-lg px-3 py-2 ${
                      resetResult.success
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {resetResult.message}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Server Status Indicator */}
            {serverStatus !== 'up' && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                {serverStatus === 'checking' ? 'Checking server status…' : 'Server is starting up — login will retry automatically…'}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-xl h-11"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{serverStatus !== 'up' ? 'Connecting to server…' : 'Signing in…'}</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Secured Access Footer */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LockKeyhole className="w-3.5 h-3.5 text-[var(--gg-green)]" />
            <span>Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Protected</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gg-amber)]" />
            <span>Authenticated</span>
          </div>
        </div>


      </motion.div>
    </div>
  )
}
