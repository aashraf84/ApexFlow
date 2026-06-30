import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { withRetry } from '@/lib/db'

// ============================================
// Password Utilities
// ============================================

const SALT_ROUNDS = 12

/** Hash a plaintext password with bcryptjs */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/** Verify a plaintext password against a bcrypt hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================
// Session Utilities
// ============================================

const SESSION_DURATION_HOURS = 168 // 7 days — matches login route

/** Generate a random session token */
export function generateSessionToken(): string {
  return randomUUID()
}

/** Create a new admin session in the database */
export async function createSession(params: {
  userId: string
  token: string
  ipAddress?: string
  userAgent?: string
}): Promise<{ id: string; token: string; expiresAt: Date }> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS)

  const session = await withRetry((tx) =>
    tx.adminSession.create({
      data: {
        userId: params.userId,
        token: params.token,
        ip: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        device: params.userAgent ?? null,
        expiresAt,
      },
    })
  )

  return {
    id: session.id,
    token: session.token,
    expiresAt: session.expiresAt,
  }
}

/** Verify a session token and return the associated user (if valid and not expired) */
export async function verifySession(token: string): Promise<{
  valid: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  }
}> {
  const session = await withRetry((tx) =>
    tx.adminSession.findUnique({
      where: { token },
      include: { user: true },
    })
  )

  if (!session) {
    return { valid: false }
  }

  // Check expiry
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await withRetry((tx) =>
      tx.adminSession.delete({ where: { id: session.id } }).catch(() => {})
    )
    return { valid: false }
  }

  // Check if user is active
  if (!session.user.isActive) {
    return { valid: false }
  }

  // Update lastLogin on the admin user
  await withRetry((tx) =>
    tx.adminUser.update({
      where: { id: session.user.id },
      data: { lastLogin: new Date() },
    })
  )

  return {
    valid: true,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      isActive: session.user.isActive,
    },
  }
}

/** Delete a session (logout) */
export async function deleteSession(token: string): Promise<void> {
  await withRetry((tx) =>
    tx.adminSession.deleteMany({ where: { token } })
  )
}

/** Clean up expired sessions for a given user */
export async function cleanupExpiredSessions(userId: string): Promise<number> {
  const result = await withRetry((tx) =>
    tx.adminSession.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    })
  )
  return result.count
}
