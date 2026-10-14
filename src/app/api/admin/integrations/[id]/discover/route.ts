import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { withRetry } from '@/lib/db'
import { discoverTables, discoverColumns } from '@/lib/erp-sync'

// POST /api/admin/integrations/[id]/discover — introspect the ERP's schema
// Body: { connectionUrl?: string, table?: string }
//   - no table: returns the list of tables
//   - table set: returns the columns of that table
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const connector = await withRetry((tx) =>
      tx.integrationConnector.findUnique({ where: { id } })
    )
    if (!connector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }
    const body = await request.json().catch(() => ({}))
    const url = body.connectionUrl || connector.connectionUrl
    if (!url) {
      return NextResponse.json({ error: 'No connection URL set' }, { status: 400 })
    }
    if (body.table) {
      const res = await discoverColumns(url, body.table)
      return NextResponse.json(res)
    }
    const res = await discoverTables(url)
    return NextResponse.json(res)
  } catch (error) {
    return NextResponse.json(
      { tables: [], columns: [], error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 }
    )
  }
}
