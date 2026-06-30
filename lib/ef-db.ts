// ElectroFlow ERP — Dedicated Database Client
// Uses a fresh PrismaClient to avoid stale cached clients in the Next.js runtime

import { IS_NEON_POSTGRES } from './db-env'
import { PrismaClient } from '@prisma/client'

const globalForEF = globalThis as unknown as {
  efPrisma: PrismaClient | undefined
}

function createEFClient(): PrismaClient {
  const url = process.env.DATABASE_URL || ''
  const urlWithPoolLimit = url.includes('?')
    ? `${url}&connection_limit=5&pool_timeout=15`
    : `${url}?connection_limit=5&pool_timeout=15`
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    datasources: {
      db: { url: urlWithPoolLimit },
    },
  })
}

// Reuse client in dev to avoid connection pool exhaustion
export const efDb = globalForEF.efPrisma ?? createEFClient()

if (process.env.NODE_ENV !== 'production') {
  globalForEF.efPrisma = efDb
}

/** Execute a Prisma query with retry on connection errors */
export async function efWithRetry<T>(fn: (db: PrismaClient) => Promise<T>, maxRetries = 1): Promise<T> {
  try {
    return await fn(efDb)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    const isConnectionError =
      msg.includes('Closed') ||
      msg.includes('Connection') ||
      msg.includes('ECONNRESET') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('P1001') ||
      msg.includes('P1002') ||
      msg.includes('P1008')

    if (!isConnectionError || maxRetries <= 0) throw error

    console.warn('[EF-DB] Connection error, retrying...')
    await new Promise((r) => setTimeout(r, 1000))
    return fn(efDb)
  }
}
