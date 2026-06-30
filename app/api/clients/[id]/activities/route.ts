import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const client = await getDb().client.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const activities = await getDb().clientActivity.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: activities })
  } catch (error) {
    console.error('[Client Activities] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const client = await getDb().client.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const activity = await getDb().clientActivity.create({
      data: {
        clientId: id,
        type: body.type || 'note',
        subject: body.subject,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ data: activity, message: 'Activity added successfully' }, { status: 201 })
  } catch (error) {
    console.error('[Client Activities] POST error:', error)
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 })
  }
}
