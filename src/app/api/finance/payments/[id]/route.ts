export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const payment = await withRetry((tx) =>
      tx.payment.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, company: true } },
          invoice: { select: { id: true, number: true } },
        },
      })
    )

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('[Payment] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.payment.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = await withRetry((tx) =>
      tx.payment.update({
        where: { id },
        data: {
          amount: body.amount !== undefined ? parseFloat(String(body.amount)) : undefined,
          method: body.method,
          status: body.status,
          transactionId: body.transactionId ?? undefined,
          notes: body.notes ?? undefined,
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
          invoice: { select: { id: true, number: true } },
        },
      })
    )

    return NextResponse.json(payment)
  } catch (error) {
    console.error('[Payment] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

// DELETE /api/finance/payments/[id] — remove a payment record.
// Used by PaymentsTab's trash icon → was previously a 405 → "Failed to delete payment" toast.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.payment.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.payment.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Payment] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
