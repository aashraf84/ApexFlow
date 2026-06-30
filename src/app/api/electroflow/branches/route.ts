import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

async function getDefaultTenantId() {
  const tenant = await db.tenant.findFirst({ where: { isActive: true } })
  return tenant?.id || ''
}

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId()
    const branches = await db.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: branches })
  } catch (error) {
    console.error('Branches API error:', error)
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}
