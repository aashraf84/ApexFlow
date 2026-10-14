import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// GET /api/admin/settings — Get all settings
export async function GET() {
  try {
    const settings = await withRetry((d) =>
      d.siteSetting.findMany({ orderBy: { category: 'asc' } })
    )

    // Transform into key-value object
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    return NextResponse.json({ settings: result })
  } catch (error) {
    console.error('[ADMIN-SETTINGS] Failed to fetch:', error)
    return NextResponse.json({ settings: {}, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/admin/settings — Update settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'system')
    if (!auth.ok) return auth.response
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 })
    }

    // Upsert each setting
    const updates = Object.entries(body).map(([key, value]) =>
      withRetry((d) =>
        d.siteSetting.upsert({
          where: { key },
          update: { value: String(value), category: 'general' },
          create: { key, value: String(value), category: 'general' },
        })
      )
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN-SETTINGS] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
