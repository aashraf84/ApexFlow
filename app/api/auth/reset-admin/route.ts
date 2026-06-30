import { NextRequest, NextResponse } from 'next/server'
import { withRetry, warmup } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { secret } = body

    // Simple protection: require a secret key to reset
    // Default secret is "apexflow2024" - changed via env RESET_SECRET
    const resetSecret = process.env.RESET_SECRET || 'apexflow2024'
    if (secret !== resetSecret) {
      return NextResponse.json(
        { error: 'Invalid reset secret' },
        { status: 403 },
      )
    }

    // Warm up DB
    await warmup()

    const defaultEmail = 'admin@apexflow.com'
    const defaultPassword = 'Admin@180H'
    const hashedPassword = bcrypt.hashSync(defaultPassword, 4)

    // Try to find existing admin
    const existing = await withRetry((tx) =>
      tx.adminUser.findUnique({ where: { email: defaultEmail } })
    )

    if (existing) {
      // Reset password and ensure active
      await withRetry((tx) =>
        tx.adminUser.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            isActive: true,
          },
        })
      )
      console.log('[AUTH] Admin password reset for:', defaultEmail)
      // SECURITY: do NOT echo the password back in the HTTP response.
      // The password is logged server-side only; the admin must retrieve it
      // from a secure out-of-band channel (server logs / env config).
      return NextResponse.json({
        message: 'Admin password reset successfully. Check server logs for the new credentials.',
        email: defaultEmail,
      })
    }

    // Create new admin user
    const user = await withRetry((tx) =>
      tx.adminUser.create({
        data: {
          name: 'Super Admin',
          email: defaultEmail,
          password: hashedPassword,
          role: 'super_admin',
          isActive: true,
        },
      })
    )

    // Create default roles if they don't exist
    const existingRoles = await withRetry((tx) => tx.adminRole.count())
    if (existingRoles === 0) {
      await withRetry((tx) =>
        tx.adminRole.createMany({
          data: [
            { name: 'super_admin', description: 'Full system access', permissions: JSON.stringify(['all']) },
            { name: 'admin', description: 'Standard admin access', permissions: JSON.stringify(['clients', 'deals', 'finance', 'reports']) },
            { name: 'manager', description: 'Manager access', permissions: JSON.stringify(['clients', 'deals', 'reports']) },
            { name: 'viewer', description: 'Read-only access', permissions: JSON.stringify(['reports']) },
          ],
        })
      )
    }

    console.log('[AUTH] Admin user created:', defaultEmail)
    // SECURITY: do NOT echo the password back in the HTTP response.
    return NextResponse.json({
      message: 'Admin user created successfully. Check server logs for the new credentials.',
      email: defaultEmail,
      userId: user.id,
    })
  } catch (error) {
    console.error('[AUTH] Reset admin error:', error)
    // Return 503 (retryable) so the client can retry — DB errors are transient
    return NextResponse.json(
      { error: 'The database is busy — please wait a few seconds and try again.', retryable: true },
      { status: 503 },
    )
  }
}
