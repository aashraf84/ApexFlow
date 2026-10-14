import { NextRequest, NextResponse } from 'next/server'
import { syncDueConnectors } from '@/lib/erp-sync'

/**
 * GET /api/admin/sync-cron — Vercel Cron entrypoint for auto-sync.
 *
 * Finds IntegrationConnectors with autoSync=true whose lastSyncAt + syncInterval
 * is in the past (or never synced), and syncs up to 2 of them per run (bounded
 * to stay within the Vercel function timeout). Over successive 5-min cron
 * ticks, all due connectors get synced.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically
 * when the CRON_SECRET env var is set on Vercel. We verify it here so the
 * endpoint can't be triggered by anyone else. (This route is also exempted
 * from the cookie-based middleware in src/middleware.ts.)
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization') || ''
    const provided = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.nextUrl.searchParams.get('secret') || ''
    if (provided !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  try {
    const result = await syncDueConnectors(2)
    return NextResponse.json({
      success: true,
      processed: result.processed,
      skipped: result.skipped,
      results: result.results.map((r) => ({
        erpName: r.erpName,
        clients: r.clients.synced,
        serials: r.serials.synced,
        clientErrors: r.clients.failed,
        serialErrors: r.serials.failed,
      })),
    })
  } catch (error) {
    console.error('[SYNC-CRON] failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Cron sync failed' },
      { status: 500 }
    )
  }
}
