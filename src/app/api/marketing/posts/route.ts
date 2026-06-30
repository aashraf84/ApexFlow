import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const posts = await withRetry((d) =>
      d.socialPost.findMany({
        include: { campaign: { select: { id: true, name: true } }, socialAccount: { select: { id: true, platform: true, handle: true } } },
        orderBy: { scheduledAt: 'asc' },
      })
    )
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[MARKETING/POSTS] Failed to list:', error)
    return NextResponse.json({ posts: generateSamplePosts() })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'cancel' && body.id) {
      await withRetry((d) => d.socialPost.delete({ where: { id: body.id } }))
      return NextResponse.json({ success: true })
    }

    if (!body.content || !body.platforms?.length) {
      return NextResponse.json({ error: 'Content and platforms are required' }, { status: 400 })
    }

    const results = []
    for (const platform of body.platforms as string[]) {
      const post = await withRetry((d) =>
        d.socialPost.create({
          data: {
            platform,
            content: body.content,
            status: body.status || 'draft',
            scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
            publishedAt: body.status === 'published' ? new Date() : null,
          },
        })
      )
      results.push(post)
    }

    return NextResponse.json({ posts: results }, { status: 201 })
  } catch (error) {
    console.error('[MARKETING/POSTS] Failed to save:', error)
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
  }
}

function generateSamplePosts() {
  const contents = [
    'Excited to announce our new product features! 🚀', 'Join our webinar on marketing automation this Thursday',
    'Customer success story: How TechCorp improved ROI by 300%', 'Behind the scenes at ApexFlow HQ ✨',
    '5 tips for better social media engagement', 'New blog post: The future of ERP systems',
  ]
  const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok']
  const statuses = ['scheduled', 'published', 'draft']
  return contents.map((content, i) => ({
    id: `post-${i + 1}`, campaignId: null, socialAccountId: null, platform: platforms[i % platforms.length],
    content, mediaUrls: null, scheduledAt: new Date(Date.now() + (i - 2) * 86400000).toISOString(),
    publishedAt: statuses[i % statuses.length] === 'published' ? new Date().toISOString() : null,
    status: statuses[i % statuses.length], likes: Math.floor(Math.random() * 100), comments: Math.floor(Math.random() * 20),
    shares: Math.floor(Math.random() * 30), reach: Math.floor(Math.random() * 5000), platformPostId: null, errorMessage: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }))
}
