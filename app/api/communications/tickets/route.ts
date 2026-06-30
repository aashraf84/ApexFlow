import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || ''
    const priority = req.nextUrl.searchParams.get('priority') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    const tickets = await withRetry((tx) =>
      tx.supportTicket.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, company: true } },
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: tickets })
  } catch (error) {
    console.error('[Tickets] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, clientId, name, email, category, priority, status, message } = body

    if (!subject || !name || !email || !message) {
      return NextResponse.json({ error: 'Subject, name, email, and message are required' }, { status: 400 })
    }

    const ticket = await withRetry((tx) =>
      tx.supportTicket.create({
        data: {
          subject,
          clientId: clientId || null,
          name,
          email,
          category: category || 'general',
          priority: priority || 'medium',
          status: status || 'open',
          message,
        },
        include: {
          client: { select: { id: true, name: true, company: true } },
        },
      })
    )

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('[Tickets] POST error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
