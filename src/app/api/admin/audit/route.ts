import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

// GET /api/admin/audit — List audit logs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || ''
    const entity = searchParams.get('entity') || ''
    const userId = searchParams.get('userId') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const where: any = {}
    if (action && action !== 'all') where.action = action
    if (entity && entity !== 'all') where.entity = entity
    if (userId && userId !== 'all') where.userId = userId
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to + 'T23:59:59')
    }

    const [logs, total] = await Promise.all([
      withRetry((d) =>
        d.adminAuditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        })
      ),
      withRetry((d) => d.adminAuditLog.count({ where })),
    ])

    return NextResponse.json({ logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (error) {
    console.error('[ADMIN-AUDIT] Failed to list:', error)
    return NextResponse.json({ logs: [], total: 0, error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
