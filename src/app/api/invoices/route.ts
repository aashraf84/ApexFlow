import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { getAggregatedStats } from '@/lib/erp-connector'

export async function GET() {
  try {
    // Get local invoices
    const localInvoices = await withRetry((db) =>
      db.invoice.findMany({
        include: {
          client: { select: { companyName: true } },
          erpSystem: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    // Get live invoices from connected ERPs
    const erpStats = await getAggregatedStats()

    // Combine both sources
    const allInvoices = [
      ...localInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client?.companyName || 'Unknown',
        clientEmail: null as string | null,
        erpName: inv.erpSystem?.name || null,
        erpSlug: null as string | null,
        amount: inv.amount || 0,
        tax: inv.tax || 0,
        discount: inv.discount || 0,
        totalAmount: inv.totalAmount || 0,
        currency: inv.currency || 'PKR',
        status: inv.status,
        type: inv.type || 'subscription',
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        notes: inv.notes,
        source: 'local' as const,
        createdAt: inv.createdAt,
      })),
      ...erpStats.invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        clientEmail: inv.clientEmail,
        erpName: inv.erpName,
        erpSlug: inv.erpSlug,
        amount: inv.amount,
        tax: inv.tax,
        discount: 0,
        totalAmount: inv.totalAmount,
        currency: 'PKR',
        status: inv.status,
        type: 'subscription' as const,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        notes: null as string | null,
        source: 'erp' as const,
        createdAt: inv.createdAt,
      })),
    ]

    return NextResponse.json({ invoices: allInvoices })
  } catch (error) {
    console.error('[INVOICES] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.clientId || !body.erpSystemId || body.amount == null || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, erpSystemId, amount, dueDate' },
        { status: 400 }
      )
    }

    const amount = Number(body.amount)
    const tax = Number(body.tax ?? 0)
    const discount = Number(body.discount ?? 0)
    const totalAmount = amount + tax - discount

    // Generate invoice number
    const countResult = await withRetry((db) => db.invoice.count())
    const next = countResult + 1
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`

    const invoice = await withRetry((db) =>
      db.invoice.create({
        data: {
          invoiceNumber,
          clientId: body.clientId,
          subscriptionId: body.subscriptionId ?? null,
          erpSystemId: body.erpSystemId,
          type: body.type ?? 'subscription',
          status: body.status ?? 'draft',
          amount,
          tax,
          discount,
          totalAmount,
          currency: body.currency ?? 'PKR',
          dueDate: new Date(body.dueDate),
          paidAt: body.paidAt ? new Date(body.paidAt) : null,
          notes: body.notes ?? null,
          items: body.items ?? null,
        },
      })
    )

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error: unknown) {
    console.error('[INVOICES] Failed to create:', error)
    const msg = error instanceof Error && error.message.includes('unique') ? 'Invoice number already exists' : 'Failed to create invoice'
    const status = error instanceof Error && error.message.includes('unique') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
