import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { syncConnector } from '@/lib/erp-sync'

// POST /api/admin/integrations/[id]/sync — real inbound sync (ERP → ApexFlow)
// Syncs clients + serials + devices (if mapped) for the connector.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const result = await syncConnector(id)
    const clientsOk = !result.clients.error || result.clients.synced > 0
    const serialsOk = !result.serials.error || result.serials.synced > 0
    const devicesOk = !result.devices.error || result.devices.synced > 0
    const subsOk = !result.subscriptions?.error || result.subscriptions?.synced > 0
    const ok = clientsOk && serialsOk && devicesOk && subsOk
    return NextResponse.json(
      {
        success: ok,
        erpName: result.erpName,
        clients: { synced: result.clients.synced, failed: result.clients.failed, total: result.clients.total, error: result.clients.error },
        serials: { synced: result.serials.synced, failed: result.serials.failed, total: result.serials.total, error: result.serials.error },
        devices: { synced: result.devices.synced, failed: result.devices.failed, total: result.devices.total, error: result.devices.error },
        subscriptions: { synced: result.subscriptions?.synced || 0, failed: result.subscriptions?.failed || 0, total: result.subscriptions?.total || 0, error: result.subscriptions?.error },
      },
      { status: ok ? 200 : 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
