// ApexFlow Cloud — Order Detail API
// GET /api/orders/[id] — Get single order with full details
// PUT /api/orders/[id] — Update order status (for admin)

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const order = await withRetry((tx) =>
      tx.order.findUnique({
        where: { id },
        include: {
          erpSystem: true,
          client: true,
          payments: true,
          invoice: true,
        },
      }),
    )

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('[Order Detail] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, notes } = body

    // Verify order exists
    const existing = await withRetry((tx) =>
      tx.order.findUnique({ where: { id } }),
    )

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 },
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (status !== undefined) {
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'failed', 'expired', 'refunded']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: `Invalid status. Valid: ${validStatuses.join(', ')}` },
          { status: 400 },
        )
      }
      updateData.status = status
    }
    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'cancelled', 'refunded']
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { success: false, message: `Invalid payment status. Valid: ${validPaymentStatuses.join(', ')}` },
          { status: 400 },
        )
      }
      updateData.paymentStatus = paymentStatus
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 },
      )
    }

    const updated = await withRetry((tx) =>
      tx.order.update({
        where: { id },
        data: updateData,
        include: {
          erpSystem: { select: { id: true, name: true, slug: true } },
          client: { select: { id: true, companyName: true, email: true } },
          payments: true,
          invoice: true,
        },
      }),
    )

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('[Order Update] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 },
    )
  }
}
