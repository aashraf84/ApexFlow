export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'clients')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const client = await withRetry((db) =>
      db.client.findUnique({
        where: { id },
        include: {
          erpSystem: true,
          subscriptions: { include: { erpSystem: true } },
          licenses: { include: { erpSystem: true } },
          invoices: true,
          devices: true,
          activities: { take: 20, orderBy: { createdAt: 'desc' } },
        },
      })
    )

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: client,
    })
  } catch (error) {
    console.error('[CLIENTS] Failed to get:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'clients')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const body = await request.json()

    const client = await withRetry((db) =>
      db.client.update({
        where: { id },
        data: {
          companyName: body.companyName,
          contactPerson: body.contactPerson,
          email: body.email,
          phone: body.phone ?? undefined,
          address: body.address ?? undefined,
          city: body.city ?? undefined,
          state: body.state ?? undefined,
          country: body.country ?? undefined,
          postalCode: body.postalCode ?? undefined,
          website: body.website ?? undefined,
          taxId: body.taxId ?? undefined,
          status: body.status,
          industry: body.industry ?? undefined,
          businessType: body.businessType ?? undefined,
          companySize: body.companySize ?? undefined,
          notes: body.notes ?? undefined,
          erpSystemId: body.erpSystemId ?? undefined,
          afClientId: body.afClientId ?? undefined,
          hfClientId: body.hfClientId ?? undefined,
          efClientId: body.efClientId ?? undefined,
          databaseName: body.databaseName ?? undefined,
        },
        include: {
          erpSystem: true,
          subscriptions: true,
          licenses: true,
        },
      })
    )

    return NextResponse.json({
      success: true,
      data: client,
    })
  } catch (error) {
    console.error('[CLIENTS] Failed to update:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'clients')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    await withRetry((db) => db.client.delete({ where: { id } }))

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    })
  } catch (error) {
    console.error('[CLIENTS] Failed to delete:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
