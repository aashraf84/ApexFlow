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
    const saleType = searchParams.get('saleType')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const where: any = { tenantId }
    if (status) where.status = status
    if (saleType) where.saleType = saleType
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [sales, total] = await Promise.all([
      db.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          branch: { select: { id: true, name: true } },
          items: { select: { id: true, productName: true, quantity: true, unitPrice: true, totalPrice: true } },
          payments: { select: { id: true, amount: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.sale.count({ where }),
    ])

    return NextResponse.json({ data: sales, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Sales API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getDefaultTenantId()
    const body = await req.json()

    const sale = await db.sale.create({
      data: {
        tenantId,
        branchId: body.branchId,
        customerId: body.customerId || null,
        employeeId: body.employeeId || null,
        invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
        saleType: body.saleType || 'retail',
        subtotal: body.subtotal || 0,
        discount: body.discount || 0,
        taxAmount: body.taxAmount || 0,
        totalAmount: body.totalAmount,
        paidAmount: body.paidAmount || 0,
        paymentMethod: body.paymentMethod || null,
        status: body.status || 'completed',
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            totalPrice: item.totalPrice,
            serialNumber: item.serialNumber || null,
            imeiNumber: item.imeiNumber || null,
            warrantyMonths: item.warrantyMonths || null,
          })),
        },
        payments: body.payments ? {
          create: body.payments.map((p: any) => ({
            amount: p.amount,
            method: p.method,
            reference: p.reference || null,
          })),
        } : undefined,
      },
      include: { items: true, payments: true },
    })

    return NextResponse.json({ data: sale }, { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}
