import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ticket = await withRetry((tx) =>
      tx.supportTicket.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, company: true, email: true } },
          responses: { orderBy: { createdAt: 'asc' } },
        },
      })
    )

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('[Ticket] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.supportTicket.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const ticket = await withRetry((tx) =>
      tx.supportTicket.update({
        where: { id },
        data: {
          subject: body.subject,
          category: body.category,
          priority: body.priority,
          status: body.status,
          message: body.message,
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
        },
      })
    )

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('[Ticket] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.supportTicket.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.supportTicket.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Ticket] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
  }
}
