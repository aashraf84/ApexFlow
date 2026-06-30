import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.status === 'paid') {
      try {
        const invoice = await withRetry((db) =>
          db.invoice.update({
            where: { id },
            data: {
              status: 'paid',
              paidAt: new Date(),
            },
          })
        )
        return NextResponse.json({ invoice })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        throw error
      }
    }

    if (body.status === 'cancelled') {
      try {
        const invoice = await withRetry((db) =>
          db.invoice.update({
            where: { id },
            data: {
              status: 'cancelled',
            },
          })
        )
        return NextResponse.json({ invoice })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        throw error
      }
    }

    return NextResponse.json(
      { error: 'Invalid status update' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[INVOICES] Failed to update:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
