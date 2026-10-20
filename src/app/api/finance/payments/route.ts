export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const payments = await withRetry((tx) =>
      tx.payment.findMany({
        include: {
          client: { select: { id: true, name: true, company: true } },
          invoice: { select: { id: true, number: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('[Payments] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'finance')
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const { invoiceId, clientId, amount, method, status, transactionId, notes } = body

    if (!clientId || amount === undefined) {
      return NextResponse.json({ error: 'ClientId and amount are required' }, { status: 400 })
    }

    const payment = await withRetry((tx) =>
      tx.payment.create({
        data: {
          invoiceId: invoiceId || null,
          clientId,
          amount: parseFloat(String(amount)),
          method: method || 'bank_transfer',
          status: status || 'pending',
          transactionId: transactionId || null,
          notes: notes || null,
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
          invoice: { select: { id: true, number: true } },
        },
      })
    )

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('[Payments] POST error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
