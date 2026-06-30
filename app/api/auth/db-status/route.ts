import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { IS_NEON_POSTGRES } from '@/lib/db-env'

// Diagnostic endpoint — visit /api/auth/db-status to see live DB info
// TODO: Remove this endpoint after login is confirmed working
export async function GET() {
  const url = process.env.DATABASE_URL || '(not set)'
  const maskedUrl = url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1****$2')

  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    dbType: IS_NEON_POSTGRES ? 'postgresql (Neon)' : 'sqlite (local)',
    databaseUrl: maskedUrl,
    nodeEnv: process.env.NODE_ENV || '(not set)',
  }

  // Try actual DB connection
  try {
    const start = Date.now()
    await getDb().$queryRaw`SELECT 1 as ok`
    info.connectionStatus = 'OK'
    info.latencyMs = Date.now() - start

    // Try a real query
    const start2 = Date.now()
    const count = await getDb().adminUser.count()
    info.adminUserCount = count
    info.queryLatencyMs = Date.now() - start2
  } catch (error) {
    info.connectionStatus = 'FAILED'
    info.error = error instanceof Error ? error.message : String(error)
  }

  return NextResponse.json(info)
}