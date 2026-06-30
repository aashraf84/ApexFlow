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
    const isActive = searchParams.get('isActive')
    const skip = (page - 1) * limit

    const where: any = { tenantId }
    if (isActive !== null && isActive !== undefined && isActive !== '') where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search } },
      ]
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          addresses: true,
          _count: { select: { sales: true, installmentPlans: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ])

    return NextResponse.json({ data: customers, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Customers API error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getDefaultTenantId()
    const body = await req.json()

    const customer = await db.customer.create({
      data: {
        tenantId,
        name: body.name,
        email: body.email || null,
        phone: body.phone,
        cnic: body.cnic || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        occupation: body.occupation || null,
        monthlyIncome: body.monthlyIncome || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        creditLimit: body.creditLimit || 0,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ data: customer }, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
