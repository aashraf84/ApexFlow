import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectorId: string }> }
) {
  try {
    const { connectorId } = await params

    // Validate connector exists
    const connector = await withRetry((db) =>
      db.syncConnector.findUnique({
        where: { id: connectorId },
        include: {
          erpSystem: { select: { id: true, name: true, slug: true } },
        },
      })
    )

    if (!connector) {
      return NextResponse.json(
        { success: false, message: 'Connector not found' },
        { status: 404 }
      )
    }

    // Parse the webhook payload
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      payload = null
    }

    // Log the webhook event
    const event = await withRetry((db) =>
      db.syncEvent.create({
        data: {
          connectorId: connector.id,
          eventType: 'webhook_received',
          status: 'pending',
          direction: 'inbound',
          payload: JSON.stringify(payload),
        },
      })
    )

    // Update connector sync stats
    await withRetry((db) =>
      db.syncConnector.update({
        where: { id: connectorId },
        data: {
          lastSyncAt: new Date(),
          recordsSynced: { increment: 1 },
        },
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Webhook received and logged',
      data: {
        eventId: event.id,
        connectorId: connector.id,
        connectorName: connector.name,
        erpSystem: connector.erpSystem,
        receivedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[WEBHOOKS] Failed:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
