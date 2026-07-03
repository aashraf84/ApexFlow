import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

/**
 * GET /api/admin/webhooks/[id]
 *
 * Returns a single WebhookConfig by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const webhook = await withRetry((d) =>
      d.webhookConfig.findUnique({
        where: { id },
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true },
          },
        },
      }),
    )

    if (!webhook) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: webhook })
  } catch (error) {
    console.error('[ADMIN-WEBHOOKS] Failed to fetch webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhook' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/admin/webhooks/[id]
 *
 * Updates a webhook. Accepts partial updates for: name, url, secret, events, isActive.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verify the webhook exists
    const existing = await withRetry((d) =>
      d.webhookConfig.findUnique({ where: { id } }),
    )
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 },
      )
    }

    // Build the update data
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.url !== undefined) {
      // Validate URL format
      try {
        new URL(body.url)
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 },
        )
      }
      data.url = body.url
    }
    if (body.secret !== undefined) data.secret = body.secret || null
    if (body.events !== undefined) data.events = JSON.stringify(body.events)
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    const updated = await withRetry((d) =>
      d.webhookConfig.update({
        where: { id },
        data,
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true },
          },
        },
      }),
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[ADMIN-WEBHOOKS] Failed to update webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update webhook' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/webhooks/[id]
 *
 * Deletes a webhook by ID.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Verify it exists before deleting
    const existing = await withRetry((d) =>
      d.webhookConfig.findUnique({ where: { id } }),
    )
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 },
      )
    }

    await withRetry((d) => d.webhookConfig.delete({ where: { id } }))

    return NextResponse.json({ success: true, message: 'Webhook deleted' })
  } catch (error) {
    console.error('[ADMIN-WEBHOOKS] Failed to delete webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete webhook' },
      { status: 500 },
    )
  }
}