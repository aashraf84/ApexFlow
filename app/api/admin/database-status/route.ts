import { NextResponse } from 'next/server'
import { db, testConnection } from '@/lib/db'

function isNeonPostgres(): boolean {
  const url = process.env.DATABASE_URL || ''
  return url.includes('neon') || url.startsWith('postgresql://') || url.startsWith('postgres://')
}
import { testErpConnection, getActiveErpSlugs } from '@/lib/erp-connector'

export async function GET() {
  try {
    // Test main database connection
    const mainDbResult = await testConnection()

    // Get all key counts in parallel for better performance (gracefully handle errors)
    let clientCount = 0, orderCount = 0, paymentCount = 0, licenseCount = 0,
        invoiceCount = 0, paymentAccountCount = 0, paymentSettingsCount = 0,
        auditLogCount = 0, packageCount = 0, subscriptionCount = 0, erpCount = 0

    if (mainDbResult.connected) {
      try {
        [clientCount, orderCount, paymentCount, licenseCount, invoiceCount,
         paymentAccountCount, paymentSettingsCount, auditLogCount, packageCount,
         subscriptionCount, erpCount] = await Promise.all([
          db.client.count().catch(() => 0),
          db.order.count().catch(() => 0),
          db.payment.count().catch(() => 0),
          db.license.count().catch(() => 0),
          db.invoice.count().catch(() => 0),
          db.paymentAccount.count().catch(() => 0),
          db.paymentSettings.count().catch(() => 0),
          db.paymentAuditLog.count().catch(() => 0),
          db.package.count().catch(() => 0),
          db.subscription.count().catch(() => 0),
          db.erpSystem.count().catch(() => 0),
        ])
      } catch { /* ignore */ }
    }

    // Get ERP systems with databaseUrl info
    const erpSystems = mainDbResult.connected
      ? await db.erpSystem.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            moduleCount: true,
            isActive: true,
            databaseUrl: true,
          },
          orderBy: { name: 'asc' },
        }).catch(() => [])
      : []

    // Test live connectivity to ERP databases (with 5s timeout per ERP)
    let erpDbConnections: Array<{
      slug: string
      name: string
      connected: boolean
      latency: number | null
      clientCount: number
      error: string | null
    }> = []

    try {
      const activeSlugs = await getActiveErpSlugs()
      const connectionPromises = activeSlugs.map(async (slug) => {
        try {
          const result = await Promise.race([
            testErpConnection(slug),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 5_000)
            ),
          ])
          const erpName = erpSystems.find(e => e.slug === slug)?.name || slug
          return {
            slug,
            name: erpName,
            connected: result.connected,
            latency: result.latency ?? null,
            clientCount: result.clientCount ?? 0,
            error: result.error ?? null,
          }
        } catch {
          const erpName = erpSystems.find(e => e.slug === slug)?.name || slug
          return {
            slug,
            name: erpName,
            connected: false,
            latency: null,
            clientCount: 0,
            error: 'Connection test timed out',
          }
        }
      })
      erpDbConnections = await Promise.all(connectionPromises)
    } catch (err) {
      console.warn('[DatabaseStatus] ERP connection tests failed:', err)
    }

    // Count configured vs connected ERP databases
    const configuredErpDbs = erpSystems.filter(e => e.databaseUrl).length
    const connectedErpDbs = erpDbConnections.filter(e => e.connected).length

    // Detect database type
    const dbType = isNeonPostgres() ? 'Neon PostgreSQL' : 'SQLite'
    const dbUrl = process.env.DATABASE_URL || ''

    // For Neon PostgreSQL, get database info via SQL query
    let dbInfo: Record<string, unknown> = {}
    if (isNeonPostgres() && mainDbResult.connected) {
      try {
        const versionResult = await db.$queryRaw`SELECT version() as v` as any[]
        const dbSizeResult = await db.$queryRaw`
          SELECT pg_database_size(current_database()) as size
        ` as any[]
        dbInfo = {
          version: versionResult[0]?.v || 'Unknown',
          size: formatBytes(Number(dbSizeResult[0]?.size || 0)),
          host: dbUrl.match(/@([^/]+)/)?.[1] || 'Unknown',
          database: dbUrl.match(/\/([^?]+)/)?.[1] || 'Unknown',
          ssl: dbUrl.includes('sslmode=require'),
        }
      } catch {
        dbInfo = { error: 'Could not fetch database info' }
      }
    } else {
      // SQLite size
      try {
        const fs = await import('fs')
        const path = await import('path')
        const possiblePaths = [
          path.join(process.cwd(), 'db', 'custom.db'),
          path.join(process.cwd(), 'db', 'dev.db'),
          path.join(process.cwd(), 'prisma', 'dev.db'),
        ]
        for (const dbPath of possiblePaths) {
          if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath)
            dbInfo = { size: formatBytes(stats.size), path: dbPath }
            break
          }
        }
      } catch {
        // Ignore - size not available
      }
    }

    // Mask ERP database URLs for security
    const maskedErpSystems = erpSystems.map(({ databaseUrl, ...rest }) => ({
      ...rest,
      hasDatabaseUrl: !!databaseUrl,
      databaseUrlMasked: databaseUrl
        ? databaseUrl.substring(0, 25) + '***' + databaseUrl.substring(databaseUrl.length - 10)
        : null,
    }))

    return NextResponse.json({
      connected: mainDbResult.connected,
      latency: mainDbResult.latency,
      database: {
        type: dbType,
        ...dbInfo,
        tables: {
          erpSystems: erpCount,
          clients: clientCount,
          orders: orderCount,
          payments: paymentCount,
          licenses: licenseCount,
          invoices: invoiceCount,
          paymentAccounts: paymentAccountCount,
          paymentSettings: paymentSettingsCount,
          auditLogs: auditLogCount,
          packages: packageCount,
          subscriptions: subscriptionCount,
        },
      },
      erpSystems: maskedErpSystems,
      erpDbConnections,
      erpDbSummary: {
        total: erpSystems.length,
        configured: configuredErpDbs,
        connected: connectedErpDbs,
        disconnected: configuredErpDbs - connectedErpDbs,
        notConfigured: erpSystems.length - configuredErpDbs,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DatabaseStatus] Error:', error)
    return NextResponse.json({
      connected: false,
      latency: -1,
      database: { type: isNeonPostgres() ? 'Neon PostgreSQL' : 'SQLite', tables: {} },
      erpSystems: [],
      erpDbConnections: [],
      erpDbSummary: { total: 0, configured: 0, connected: 0, disconnected: 0, notConfigured: 0 },
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
