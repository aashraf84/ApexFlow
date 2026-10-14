import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

/**
 * GET /api/admin/webhooks
 *
 * Returns all WebhookConfig entries.
 */
export async function GET() {
  try {
    const webhooks = await withRetry((d) =>
      d.webhookConfig.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true },
          },
        },
      }),
    )

    return NextResponse.json({
      success: true,
      data: webhooks,
    })
  } catch (error) {
    console.error('[ADMIN-WEBHOOKS] Failed to list webhooks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhooks', data: [] },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/webhooks
 *
 * Creates a new WebhookConfig.
 * Body: { erpSlug, name, url, secret?, events?, erpSystemId? }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'integrations')
    if (!auth.ok) return auth.response
    const body = await request.json()
    const { erpSlug, name, url, secret, events, erpSystemId } = body

    if (!erpSlug || !name || !url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: erpSlug, name, url' },
        { status: 400 },
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 },
      )
    }

    // Ensure erpSystemId exists if provided
    if (erpSystemId) {
      const erpExists = await withRetry((d) =>
        d.erpSystem.findUnique({ where: { id: erpSystemId } }),
      )
      if (!erpExists) {
        return NextResponse.json(
          { success: false, error: `ErpSystem with id "${erpSystemId}" not found` },
          { status: 404 },
        )
      }
    }

    const webhook = await withRetry((d) =>
      d.webhookConfig.create({
        data: {
          erpSlug,
          name,
          url,
          secret: secret || null,
          events: events ? JSON.stringify(events) : '[]',
          erpSystemId: erpSystemId || null,
          isActive: true,
        },
        include: {
          erpSystem: {
            select: { id: true, name: true, industry: true },
          },
        },
      }),
    )

    return NextResponse.json({ success: true, data: webhook }, { status: 201 })
  } catch (error) {
    console.error('[ADMIN-WEBHOOKS] Failed to create webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create webhook' },
      { status: 500 },
    )
  }
}