import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await withRetry((tx) =>
      tx.socialPost.findUnique({ where: { id } })
    )

    if (!post) {
      return NextResponse.json({ error: 'Social post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('[Social Post] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch social post' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.socialPost.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Social post not found' }, { status: 404 })
    }

    const post = await withRetry((tx) =>
      tx.socialPost.update({
        where: { id },
        data: {
          accountId: body.accountId ?? undefined,
          platform: body.platform,
          content: body.content,
          mediaUrl: body.mediaUrl ?? undefined,
          status: body.status,
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : body.scheduledAt === null ? null : undefined,
          publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
          stats: body.stats,
        },
      })
    )

    return NextResponse.json(post)
  } catch (error) {
    console.error('[Social Post] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update social post' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.socialPost.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Social post not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.socialPost.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Social Post] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete social post' }, { status: 500 })
  }
}
