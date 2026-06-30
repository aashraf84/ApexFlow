import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/deals/[id]/activities — List activities for a deal
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const activities = await getDb().dealActivity.findMany({
      where: { dealId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: activities })
  } catch (error) {
    console.error('[DealActivities] List error:', error)
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}

// POST /api/deals/[id]/activities — Add an activity to a deal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if deal exists
    const deal = await getDb().deal.findUnique({ where: { id } })
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const activity = await getDb().dealActivity.create({
      data: {
        dealId: id,
        type: type || 'note',
        content: content.trim(),
      },
    })

    return NextResponse.json({ data: activity }, { status: 201 })
  } catch (error) {
    console.error('[DealActivities] Create error:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
