import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || ''
    const type = req.nextUrl.searchParams.get('type') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (type) where.type = type

    const campaigns = await withRetry((tx) =>
      tx.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: campaigns })
  } catch (error) {
    console.error('[Campaigns] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, status, subject, content, targetAudience, scheduleAt } = body

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 })
    }

    const campaign = await withRetry((tx) =>
      tx.campaign.create({
        data: {
          name,
          type: type || 'email',
          status: status || 'draft',
          subject: subject || null,
          content,
          targetAudience: targetAudience || null,
          scheduleAt: scheduleAt ? new Date(scheduleAt) : null,
        },
      })
    )

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('[Campaigns] POST error:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
