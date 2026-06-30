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
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')
    const skip = (page - 1) * limit

    const where: any = { tenantId }
    if (isActive !== null && isActive !== undefined && isActive !== '') where.isActive = isActive === 'true'
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search } },
        { brand: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { stockItems: true, saleItems: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ data: products, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getDefaultTenantId()
    const body = await req.json()

    const product = await db.product.create({
      data: {
        tenantId,
        categoryId: body.categoryId || null,
        name: body.name,
        sku: body.sku || null,
        barcode: body.barcode || null,
        brand: body.brand || null,
        model: body.model || null,
        description: body.description || null,
        costPrice: body.costPrice || 0,
        salePrice: body.salePrice || 0,
        minPrice: body.minPrice || null,
        unit: body.unit || 'piece',
        hasSerial: body.hasSerial || false,
        hasIMEI: body.hasIMEI || false,
        hasWarranty: body.hasWarranty || false,
        warrantyMonths: body.warrantyMonths || null,
        reorderLevel: body.reorderLevel || 5,
        image: body.image || null,
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
