import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/saved-reports — list all saved reports
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    const reports = await withRetry((d) =>
      d.savedReport.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 500,
      })
    )

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        dateRange: r.dateRange,
        data: r.data,
        generatedAt: r.generatedAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[ADMIN-SAVED-REPORTS] GET failed:', error)
    return NextResponse.json({ error: 'Failed to list saved reports' }, { status: 500 })
  }
}

// POST /api/admin/saved-reports — save a report config
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const name = (body?.name || '').toString().trim()
    const type = (body?.type || '').toString().trim().toLowerCase()
    const dateRange = (body?.dateRange || 'last_30_days').toString()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const validTypes = ['sales', 'clients', 'subscriptions', 'support', 'integrations', 'financial']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type '${type}'. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const data = body?.data ? JSON.stringify(body.data) : '{}'

    const report = await withRetry((d) =>
      d.savedReport.create({
        data: {
          name,
          type,
          dateRange,
          data,
          generatedAt: new Date(),
        },
      })
    )

    return NextResponse.json({
      report: {
        id: report.id,
        name: report.name,
        type: report.type,
        dateRange: report.dateRange,
        data: report.data,
        generatedAt: report.generatedAt.toISOString(),
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[ADMIN-SAVED-REPORTS] POST failed:', error)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}
