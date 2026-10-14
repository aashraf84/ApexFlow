import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { testApiConnection } from '@/lib/erp-sync'

// POST /api/admin/integrations/test-api — wizard endpoint (DB vs API mode test)
// Body: { baseUrl, apiKey?, endpoint? } — wizard endpoint for API-mode connection test
// Fetches the endpoint, returns {connected, status, sampleFields}
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    if (!body.baseUrl) {
      return NextResponse.json({ connected: false, error: 'baseUrl is required' }, { status: 400 })
    }
    const result = await testApiConnection(body.baseUrl, body.apiKey, body.endpoint)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'API test failed' },
      { status: 500 }
    )
  }
}
