import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

// DELETE /api/admin/saved-reports/[id] — delete a saved report
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    await withRetry((d) => d.savedReport.delete({ where: { id } }))
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[ADMIN-SAVED-REPORTS] DELETE failed:', error)
    return NextResponse.json({ error: 'Failed to delete saved report' }, { status: 500 })
  }
}
