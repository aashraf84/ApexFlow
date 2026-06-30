import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const posts = await withRetry((tx) =>
      tx.socialPost.findMany({
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: posts })
  } catch (error) {
    console.error('[Social Posts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accountId, platform, content, mediaUrl, status, scheduledAt } = body

    if (!platform || !content) {
      return NextResponse.json({ error: 'Platform and content are required' }, { status: 400 })
    }

    const post = await withRetry((tx) =>
      tx.socialPost.create({
        data: {
          accountId: accountId || null,
          platform,
          content,
          mediaUrl: mediaUrl || null,
          status: status || 'draft',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        },
      })
    )

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('[Social Posts] POST error:', error)
    return NextResponse.json({ error: 'Failed to create social post' }, { status: 500 })
  }
}
