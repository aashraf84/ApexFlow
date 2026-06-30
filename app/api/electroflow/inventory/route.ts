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
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.stockItem.findMany({
        where: { tenantId },
        include: {
          product: { select: { id: true, name: true, sku: true, salePrice: true, image: true } },
          warehouse: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.stockItem.count({ where: { tenantId } }),
    ])

    return NextResponse.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
