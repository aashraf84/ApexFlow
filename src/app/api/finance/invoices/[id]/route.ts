import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.invoice.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
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
