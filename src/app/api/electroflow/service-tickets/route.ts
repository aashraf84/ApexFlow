import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

async function getDefaultTenantId() {
  const tenant = await db.tenant.findFirst({ where: { isActive: true } })
  return tenant?.id || ''
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getDefaultTenantId()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: any = { tenantId }
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      db.serviceTicket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          product: { select: { id: true, name: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.serviceTicket.count({ where }),
    ])

    return NextResponse.json({ data: tickets, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Service tickets API error:', error)
    return NextResponse.json({ error: 'Failed to fetch service tickets' }, { status: 500 })
  }
}
