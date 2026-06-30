import { NextRequest, NextResponse } from 'next/server'
import { withRetry } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const token = req.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Find the session
    const session = await withRetry((tx) =>
      tx.adminSession.findUnique({
        where: { token },
        include: { user: true },
      })
    )

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      )
    }

    if (!session.user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, session.user.password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await withRetry((tx) =>
      tx.adminUser.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      })
    )

    // Create audit log
    await withRetry((tx) =>
      tx.adminAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'password_change',
          module: 'auth',
          details: 'Admin changed their password',
          ipAddress: req.headers.get('x-forwarded-for') || null,
        },
      })
    ).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('[Auth] Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
