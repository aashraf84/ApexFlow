import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const deal = await withRetry((tx) =>
      tx.deal.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, company: true } },
          activities: { orderBy: { createdAt: 'desc' } },
        },
      })
    )

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error('[Deal] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.deal.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // If stage changed, create a stage_change activity
    if (body.stage && body.stage !== existing.stage) {
      await withRetry((tx) =>
        tx.dealActivity.create({
          data: {
            dealId: id,
            type: 'stage_change',
            content: `Stage changed from "${existing.stage}" to "${body.stage}"`,
          },
        })
      )
    }

    const deal = await withRetry((tx) =>
      tx.deal.update({
        where: { id },
        data: {
          title: body.title,
          clientId: body.clientId ?? undefined,
          value: body.value ?? undefined,
          stage: body.stage,
          probability: body.probability ?? undefined,
          source: body.source ?? undefined,
          expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
          notes: body.notes ?? undefined,
        },
        include: { client: { select: { id: true, name: true, company: true } } },
      })
    )

    return NextResponse.json(deal)
  } catch (error) {
    console.error('[Deal] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.deal.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.deal.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Deal] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
