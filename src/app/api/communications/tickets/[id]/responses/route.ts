import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const responses = await withRetry((tx) =>
      tx.ticketResponse.findMany({
        where: { ticketId: id },
        orderBy: { createdAt: 'asc' },
      })
    )

    return NextResponse.json(responses)
  } catch (error) {
    console.error('[Ticket Responses] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { author, message } = body

    if (!author || !message) {
      return NextResponse.json({ error: 'Author and message are required' }, { status: 400 })
    }

    const response = await withRetry((tx) =>
      tx.ticketResponse.create({
        data: {
          ticketId: id,
          author,
          message,
        },
      })
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('[Ticket Responses] POST error:', error)
    return NextResponse.json({ error: 'Failed to create response' }, { status: 500 })
  }
}
