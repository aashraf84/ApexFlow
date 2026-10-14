import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { testConnection } from '@/lib/erp-sync'

// POST /api/admin/integrations/test-connection
// Body: { connectionUrl } — wizard endpoint (no connector id needed yet)
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    if (!body.connectionUrl) {
      return NextResponse.json({ connected: false, error: 'connectionUrl is required' }, { status: 400 })
    }
    const result = await testConnection(body.connectionUrl)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
