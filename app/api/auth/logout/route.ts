import { NextRequest, NextResponse } from 'next/server'
import { withRetry } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('admin_session')?.value

    if (sessionToken) {
      // Delete the session from database
      await withRetry((tx) =>
        tx.adminSession.deleteMany({ where: { token: sessionToken } })
      ).catch(() => {})
    }

    // Clear the cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Auth] Logout error:', error)
    // Still clear the cookie even if DB deletion fails
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  }
}
