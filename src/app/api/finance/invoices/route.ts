import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const invoices = await withRetry((tx) =>
      tx.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, company: true } },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: invoices })
  } catch (error) {
    console.error('[Invoices] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { number, clientId, amount, tax, total, status, dueDate, items, notes } = body

    if (!number || !clientId || amount === undefined) {
      return NextResponse.json({ error: 'Number, clientId, and amount are required' }, { status: 400 })
    }

    const invoice = await withRetry((tx) =>
      tx.invoice.create({
        data: {
          number,
          clientId,
          amount: parseFloat(String(amount)),
          tax: tax ? parseFloat(String(tax)) : 0,
          total: total ? parseFloat(String(total)) : parseFloat(String(amount)),
          status: status || 'draft',
          dueDate: dueDate ? new Date(dueDate) : new Date(),
          items: items || '[]',
          notes: notes || null,
        },
        include: { client: { select: { id: true, name: true, company: true } } },
      })
    )

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('[Invoices] POST error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
