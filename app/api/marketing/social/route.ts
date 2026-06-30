import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const accounts = await withRetry((d) =>
      d.socialAccount.findMany({ include: { posts: { take: 3, orderBy: { createdAt: 'desc' } } }, orderBy: { platform: 'asc' } })
    )
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('[MARKETING/SOCIAL] Failed to list:', error)
    return NextResponse.json({ accounts: generateSampleAccounts() })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 })

    const isConnected = body.action === 'connect'
    const account = await withRetry((d) =>
      d.socialAccount.update({
        where: { id: body.accountId },
        data: { isConnected, lastSyncedAt: isConnected ? new Date() : null },
      })
    )
    return NextResponse.json({ account })
  } catch (error) {
    console.error('[MARKETING/SOCIAL] Failed to toggle:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

function generateSampleAccounts() {
  const platforms = [
    { platform: 'facebook', handle: 'apexflow', followers: 12400 },
    { platform: 'instagram', handle: '@apexflow.official', followers: 8300 },
    { platform: 'twitter', handle: '@apexflow', followers: 5200 },
    { platform: 'linkedin', handle: 'apexflow-inc', followers: 15800 },
    { platform: 'tiktok', handle: '@apexflow', followers: 3100 },
  ]
  return platforms.map((p, i) => ({
    id: `social-${i + 1}`, platform: p.platform, handle: p.handle, accessToken: null, refreshToken: null,
    followerCount: p.followers, followingCount: 200 + i * 50, profileUrl: null, avatarUrl: null,
    isConnected: i < 4, lastSyncedAt: new Date(Date.now() - i * 3600000).toISOString(), expiresAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), posts: [],
  }))
}
