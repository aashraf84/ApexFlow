// ApexFlow Cloud — Database Client
// Works with both PostgreSQL (Neon, production) and SQLite (local dev).
import { IS_NEON_POSTGRES } from '@/lib/db-env'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: ['error'],
  })
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient()
}

/** Always returns the current PrismaClient singleton. */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

/** Legacy export — kept for backward compat */
export const db = globalForPrisma.prisma

/** Patterns that indicate a transient, retryable error. */
const RETRY_PATTERNS = IS_NEON_POSTGRES
  ? ['connection', 'timeout', 'eof', 'neon', 'cold start', 'busy', 'locked']
  : ['locked', 'busy']

/**
 * Execute a DB function with retry for transient errors.
 * - SQLite: retries on file-level locks.
 * - PostgreSQL/Neon: retries on connection/timeout errors and cold starts.
 */
export async function withRetry<T>(
  fn: (client: PrismaClient) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(getDb())
    } catch (error: unknown) {
      lastError = error
      const msg = (error instanceof Error ? error.message : String(error)).toLowerCase()

      const isRetryable = RETRY_PATTERNS.some(p => msg.includes(p))

      if (attempt >= maxRetries || !isRetryable) {
        throw error
      }

      const delayMs = IS_NEON_POSTGRES
        ? 1000 * (attempt + 1)   // 1s, 2s, 3s for Neon cold starts
        : 200 * (attempt + 1)    // 200ms, 400ms, 600ms for SQLite locks

      console.warn(
        `[DB] ${IS_NEON_POSTGRES ? 'Neon' : 'SQLite'} transient error (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms…`,
        msg,
      )
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  throw lastError
}

/** Warm up the database connection. For Neon, may take a few seconds on cold start. */
export async function warmup(): Promise<boolean> {
  try {
    await getDb().$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[DB] Warmup failed:', error)
    return false
  }
}

export async function testConnection(): Promise<{
  connected: boolean
  latency?: number
  error?: string
}> {
  try {
    const start = Date.now()
    await getDb().$queryRaw`SELECT 1`
    return { connected: true, latency: Date.now() - start }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}