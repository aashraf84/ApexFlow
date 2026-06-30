import { NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const packages = await withRetry((db) =>
      db.package.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
    )

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('[PACKAGES] Failed to list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
