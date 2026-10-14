import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { testConnection, testApiConnection } from '@/lib/erp-sync'

// POST /api/admin/integrations/test-connection
// Body: { connectionUrl, mode?, apiKey?, endpoint? }
//   - mode='api' (or connectionUrl looks like http(s)://): API-mode test via fetch
//   - else: DB-mode test via neon() SELECT 1
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
    const result = await testConnection(url)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
