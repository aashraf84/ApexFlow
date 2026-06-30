import { NextResponse } from 'next/server'
import { withRetry } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if super admin already exists
    const existing = await withRetry((tx) =>
      tx.adminUser.findUnique({
        where: { email: 'admin@apexflow.com' },
      })
    )

    if (existing) {
      return NextResponse.json({ message: 'Admin user already exists', email: 'admin@apexflow.com' })
    }

    // Create default super admin
    const hashedPassword = await bcrypt.hash('Admin@180H', 12)

    const user = await withRetry((tx) =>
      tx.adminUser.create({
        data: {
          name: 'Super Admin',
          email: 'admin@apexflow.com',
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

    return NextResponse.json({
      message: 'Admin user created successfully',
      email: 'admin@apexflow.com',
      userId: user.id,
    })
  } catch (error) {
    console.error('[Auth] Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
