export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'deals')
  if (!auth.ok) return auth.response
  try {
    const stage = req.nextUrl.searchParams.get('stage') || ''
    const search = req.nextUrl.searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (stage) where.stage = stage
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { company: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const deals = await withRetry((tx) =>
      tx.deal.findMany({
        where,
        include: { client: { select: { id: true, name: true, company: true } } },
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: deals })
  } catch (error) {
    console.error('[Deals] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'deals')
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const { title, clientId, value, stage, probability, source, expectedCloseDate, notes } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const deal = await withRetry((tx) =>
      tx.deal.create({
        data: {
          title,
          clientId: clientId || null,
          value: parseFloat(body.value) || 0,
          stage: stage || 'lead',
          probability: parseFloat(body.probability) || 0,
          source: source || null,
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
          notes: notes || null,
        },
        include: { client: { select: { id: true, name: true, company: true } } },
      })
    )

    return NextResponse.json({ data: deal }, { status: 201 })
  } catch (error) {
    console.error('[Deals] POST error:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
