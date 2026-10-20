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

    const invoice = await withRetry((tx) =>
      tx.invoice.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, company: true, email: true } },
          payments: { orderBy: { createdAt: 'desc' } },
        },
      })
    )

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('[Invoice] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
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

    const existing = await withRetry((tx) => tx.invoice.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // markAsPaid: short-circuit to flip status → 'paid' and stamp paidAt.
    // The InvoicesTab "Mark as Paid" button sends `{ markAsPaid: true }` only,
    // which would otherwise be a no-op because every other body field is undefined.
    if (body.markAsPaid) {
      // Idempotent — if already paid, just return the current invoice.
      if (existing.status === 'paid') {
        const paid = await withRetry((tx) =>
          tx.invoice.findUnique({
            where: { id },
            include: { client: { select: { id: true, name: true, company: true } } },
          })
        )
        return NextResponse.json(paid)
      }
      const updated = await withRetry((tx) =>
        tx.invoice.update({
          where: { id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
          include: { client: { select: { id: true, name: true, company: true } } },
        })
      )
      return NextResponse.json(updated)
    }

    const invoice = await withRetry((tx) =>
      tx.invoice.update({
        where: { id },
        data: {
          number: body.number,
          amount: body.amount !== undefined ? parseFloat(String(body.amount)) : undefined,
          tax: body.tax !== undefined ? parseFloat(String(body.tax)) : undefined,
          total: body.total !== undefined ? parseFloat(String(body.total)) : undefined,
          status: body.status,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          items: body.items,
          notes: body.notes ?? undefined,
          paidAt: body.status === 'paid' && existing.status !== 'paid' ? new Date() : body.paidAt ? new Date(body.paidAt) : undefined,
        },
        include: { client: { select: { id: true, name: true, company: true } } },
      })
    )

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('[Invoice] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.invoice.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.invoice.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Invoice] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
