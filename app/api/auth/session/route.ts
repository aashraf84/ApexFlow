import { NextRequest, NextResponse } from 'next/server'
import { withRetry } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    // Find session with user (with retry for Neon cold start)
    let session
    try {
      session = await withRetry((tx) =>
        tx.adminSession.findUnique({
          where: { token },
          include: { user: true },
        }),
        5 // More retries for session checks
      )
    } catch (dbError) {
      // DB connection failed despite retries — don't log the user out
      // Return 503 so the client knows to retry instead of redirecting to login
      console.warn('[Auth] Session check DB error (returning retryable):', dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json(
        { authenticated: false, retryable: true },
        { status: 503 }
      )
    }

    if (!session) {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
      response.cookies.delete('admin_session')
      return response
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await withRetry((tx) =>
        tx.adminSession.delete({ where: { id: session.id } })
      ).catch(() => {})

      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
      response.cookies.delete('admin_session')
      return response
    }

    // Check if user is still active
    if (!session.user.isActive) {
      await withRetry((tx) =>
        tx.adminSession.delete({ where: { id: session.id } })
      ).catch(() => {})

      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
      response.cookies.delete('admin_session')
      return response
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          avatar: session.user.avatar,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Auth] Session error:', error)
    // Don't log user out on unexpected errors
    return NextResponse.json(
      { authenticated: false, retryable: true },
      { status: 503 }
    )
  }
}
