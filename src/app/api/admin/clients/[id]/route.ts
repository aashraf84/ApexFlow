import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/clients/[id]
// Returns a single client with all related data:
//   erpSystem, contacts, deals, licenses, subscriptions, invoices,
//   recent activities timeline.
// ──────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(request, 'clients')
    if (!auth.ok) return auth.response

    const { id } = await params

    const client = await withRetry((tx) =>
      tx.client.findUnique({
        where: { id },
        include: {
          erpSystem: {
            select: { id: true, name: true, slug: true, color: true, website: true },
          },
          contacts: {
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
          },
          deals: {
            orderBy: { createdAt: 'desc' },
          },
          licenses: {
            include: {
              erpSystem: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          subscriptions: {
            include: {
              erpSystem: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          activities: {
            take: 30,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              deals: true,
              licenses: true,
              subscriptions: true,
              invoices: true,
              activities: true,
              orders: true,
              payments: true,
            },
          },
        },
      })
    )

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('[Admin Clients Detail API] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}
