import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { syncClientsFromErp } from '@/lib/erp-sync'

// POST /api/admin/integrations/[id]/sync — real inbound client sync (ERP → ApexFlow)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const result = await syncClientsFromErp(id)
    const status = result.error ? (result.synced > 0 ? 200 : 500) : 200
    return NextResponse.json(
      { success: !result.error || result.synced > 0, ...result },
      { status }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
