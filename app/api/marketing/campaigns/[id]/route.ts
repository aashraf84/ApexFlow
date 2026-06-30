import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const campaign = await withRetry((tx) =>
      tx.campaign.findUnique({ where: { id } })
    )

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('[Campaign] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.campaign.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const campaign = await withRetry((tx) =>
      tx.campaign.update({
        where: { id },
        data: {
          name: body.name,
          type: body.type,
          status: body.status,
          subject: body.subject ?? undefined,
          content: body.content,
          targetAudience: body.targetAudience ?? undefined,
          scheduleAt: body.scheduleAt ? new Date(body.scheduleAt) : body.scheduleAt === null ? null : undefined,
          sentAt: body.sentAt ? new Date(body.sentAt) : undefined,
          stats: body.stats,
        },
      })
    )

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('[Campaign] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.campaign.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.campaign.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Campaign] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
