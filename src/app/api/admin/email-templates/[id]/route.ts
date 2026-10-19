import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/admin/email-templates/[id] — Fetch a single template
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'communications')
    if (!auth.ok) return auth.response

    const { id } = await params
    const template = await withRetry((d) => d.emailTemplate.findUnique({ where: { id } }))
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('[ADMIN-EMAIL-TEMPLATES] Failed to fetch one:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

// PATCH /api/admin/email-templates/[id] — Update template fields
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'communications')
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()

    const data: any = {}
    if (body.name !== undefined) data.name = String(body.name).trim()
    if (body.subject !== undefined) data.subject = String(body.subject).trim()
    if (body.body !== undefined) data.body = String(body.body)
    if (body.trigger !== undefined || body.category !== undefined) {
      data.category = (body.trigger || body.category || 'general').trim()
    }

    const template = await withRetry((d) => d.emailTemplate.update({ where: { id }, data }))
    return NextResponse.json({
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
    })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    console.error('[ADMIN-EMAIL-TEMPLATES] Failed to update:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

// DELETE /api/admin/email-templates/[id] — Delete a template
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requirePermission(request, 'communications')
    if (!auth.ok) return auth.response

    const { id } = await params
    await withRetry((d) => d.emailTemplate.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    console.error('[ADMIN-EMAIL-TEMPLATES] Failed to delete:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
