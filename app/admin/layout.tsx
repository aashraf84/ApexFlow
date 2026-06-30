'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { Loader2 } from 'lucide-react'

interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

interface SessionResponse {
  authenticated: boolean
  retryable?: boolean
  user?: SessionUser
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    let cancelled = false
    let retryCount = 0
    const maxRetries = 5

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'same-origin', // Explicitly include cookies
        })
        const data: SessionResponse = await res.json()

        if (cancelled) return

        // If DB is warming up (503 + retryable), retry after delay
        if (res.status === 503 && data.retryable && retryCount < maxRetries) {
          retryCount++
          const delay = 2000 * retryCount // 2s, 4s, 6s, 8s, 10s
          console.log(`[AdminLayout] Session check retryable, retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`)
          await new Promise((r) => setTimeout(r, delay))
          return checkSession()
        }

        if (data.authenticated && data.user) {
          setUser(data.user)

          // If on login page and already authenticated, redirect to dashboard
          if (isLoginPage) {
            router.replace('/admin/dashboard')
            return
          }
        } else {
          setUser(null)

          // If NOT on login page and not authenticated, redirect to login
          if (!isLoginPage) {
            router.replace('/admin/login')
            return
          }
        }
      } catch {
        if (cancelled) return

        // Network error — retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++
          const delay = 2000 * retryCount
          console.log(`[AdminLayout] Network error, retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`)
          await new Promise((r) => setTimeout(r, delay))
          return checkSession()
        }

        setUser(null)

        if (!isLoginPage) {
          router.replace('/admin/login')
          return
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [isLoginPage, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
              boxShadow: '0 4px 14px -3px color-mix(in srgb, var(--gg-vermillion) 35%, transparent)',
            }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Login page: render without shell
  if (isLoginPage) {
    return <>{children}</>
  }

  // Authenticated pages: render with admin shell
  if (user) {
    return <AdminShell user={user}>{children}</AdminShell>
  }

  // Fallback: should not reach here, but just render children
  return <>{children}</>
}
