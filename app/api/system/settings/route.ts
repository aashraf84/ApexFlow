import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const settings = await withRetry((tx) =>
      tx.siteSetting.findMany({
        orderBy: [{ group: 'asc' }, { key: 'asc' }],
      })
    )

    // Group by group name
    const grouped: Record<string, typeof settings> = {}
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = []
      grouped[s.group].push(s)
    }

    return NextResponse.json({ settings, grouped })
  } catch (error) {
    console.error('[Settings] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, value, group } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const setting = await withRetry((tx) =>
      tx.siteSetting.upsert({
        where: { key },
        update: { value: String(value), group: group || undefined },
        create: {
          key,
          value: String(value),
          group: group || 'general',
        },
      })
    )

    return NextResponse.json(setting, { status: 201 })
  } catch (error) {
    console.error('[Settings] POST error:', error)
    return NextResponse.json({ error: 'Failed to create/update setting' }, { status: 500 })
  }
}
