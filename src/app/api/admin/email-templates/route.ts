import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/email-templates — List email templates with optional search/trigger filter
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'communications')
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const trigger = searchParams.get('trigger') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
      ]
    }
    if (trigger && trigger !== 'all') {
      where.category = trigger
    }

    const templates = await withRetry((d) =>
      d.emailTemplate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      })
    )

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        body: t.body,
        trigger: t.category,
        category: t.category,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    })
  } catch (error) {
    console.error('[ADMIN-EMAIL-TEMPLATES] Failed to list:', error)
    return NextResponse.json({ templates: [], error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/admin/email-templates — Create a new email template
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'communications')
    if (!auth.ok) return auth.response

    const body = await request.json()
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }
    if (!body.subject || typeof body.subject !== 'string' || !body.subject.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }
    if (!body.body || typeof body.body !== 'string' || !body.body.trim()) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 })
    }

    const template = await withRetry((d) =>
      d.emailTemplate.create({
        data: {
          name: body.name.trim(),
          subject: body.subject.trim(),
          body: body.body,
          category: (body.trigger || body.category || 'general').trim(),
        },
      })
    )

    return NextResponse.json(
      {
        template: {
          id: template.id,
          name: template.name,
          subject: template.subject,
          body: template.body,
          trigger: template.category,
          category: template.category,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[ADMIN-EMAIL-TEMPLATES] Failed to create:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
