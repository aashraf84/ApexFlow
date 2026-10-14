import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { discoverTables, discoverColumns } from '@/lib/erp-sync'

// POST /api/admin/integrations/discover-schema
// Body: { connectionUrl, table? } — wizard endpoint
//   - no table: returns { tables: [...] }
//   - table set: returns { columns: [...] }
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    if (!body.connectionUrl) {
      return NextResponse.json({ error: 'connectionUrl is required' }, { status: 400 })
    }
    if (body.table) {
      const res = await discoverColumns(body.connectionUrl, body.table)
      return NextResponse.json(res)
    }
    const res = await discoverTables(body.connectionUrl)
    return NextResponse.json(res)
  } catch (error) {
    return NextResponse.json(
      { tables: [], columns: [], error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 }
    )
  }
}
