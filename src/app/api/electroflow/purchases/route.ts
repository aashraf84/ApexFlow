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

    const [orders, total] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, phone: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.purchaseOrder.count({ where }),
    ])

    return NextResponse.json({ data: orders, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Purchases API error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getDefaultTenantId()
    const body = await req.json()

    const order = await db.purchaseOrder.create({
      data: {
        tenantId,
        supplierId: body.supplierId,
        poNumber: body.poNumber || `PO-${Date.now()}`,
        status: body.status || 'draft',
        totalAmount: body.totalAmount || 0,
        notes: body.notes || null,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('Create purchase order error:', error)
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 })
  }
}
