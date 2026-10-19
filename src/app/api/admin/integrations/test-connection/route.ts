export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { testConnection, testApiConnection, autoDetectSchema } from '@/lib/erp-sync'

// POST /api/admin/integrations/test-connection
// Body: { connectionUrl, mode?, apiKey?, endpoint?, autoDetect? }
//   - mode='api' (or connectionUrl looks like http(s)://): API-mode test via fetch
//   - else: DB-mode test via neon() SELECT 1
//   - autoDetect=true (DB-mode only): also introspects ALL tables + columns
//     in one query, scores them, returns the best client/serial/device tables
//     + auto-mapped field paths — so the wizard auto-fills everything.
// Wizard endpoint (no connector id needed yet)
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response
  try {
    const body = await request.json().catch(() => ({}))
    const url = body.connectionUrl
    if (!url) {
      return NextResponse.json({ connected: false, error: 'connectionUrl is required' }, { status: 400 })
    }
    // API mode if explicitly set, or if the URL is an http(s) URL (not a postgres URL)
    const isApi = body.mode === 'api' || /^https?:\/\//i.test(url)
    if (isApi) {
      const result = await testApiConnection(url, body.apiKey, body.endpoint)
      return NextResponse.json(result)
    }
    // DB mode: test + optionally auto-detect
    const result = await testConnection(url)
    if (!result.connected) {
      return NextResponse.json(result)
    }
    if (body.autoDetect) {
      const detect = await autoDetectSchema(url)
      return NextResponse.json({
        ...result,
        autoDetect: detect,
      })
    }
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
