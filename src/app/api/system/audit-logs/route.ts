import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10)
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10)
    const moduleFilter = req.nextUrl.searchParams.get('module') || ''

    const where: Record<string, unknown> = {}
    if (moduleFilter) where.module = moduleFilter

    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      withRetry((tx) =>
        tx.adminAuditLog.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        })
      ),
      withRetry((tx) => tx.adminAuditLog.count({ where })),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Audit Logs] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
