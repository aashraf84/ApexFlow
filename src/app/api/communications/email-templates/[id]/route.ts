export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'communications')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const template = await withRetry((tx) =>
      tx.emailTemplate.findUnique({ where: { id } })
    )

    if (!template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('[Email Template] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch email template' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'communications')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await withRetry((tx) => tx.emailTemplate.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    const template = await withRetry((tx) =>
      tx.emailTemplate.update({
        where: { id },
        data: {
          name: body.name,
          subject: body.subject,
          body: body.body,
          category: body.category,
        },
      })
    )

    return NextResponse.json(template)
  } catch (error) {
    console.error('[Email Template] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(req, 'communications')
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const existing = await withRetry((tx) => tx.emailTemplate.findUnique({ where: { id } }))
    if (!existing) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.emailTemplate.delete({ where: { id } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Email Template] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 })
  }
}
