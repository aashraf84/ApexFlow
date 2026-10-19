import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/support/[id]
// Returns the ticket with all responses ordered oldest→newest.
// ──────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(request, 'support')
    if (!auth.ok) return auth.response
    const { id } = await params

    const ticket = await withRetry((tx) =>
      tx.supportTicket.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              name: true,
              company: true,
              email: true,
              phone: true,
            },
          },
          responses: { orderBy: { createdAt: 'asc' } },
        },
      })
    )

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('[Support API] GET [id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────────────────
// PATCH /api/admin/support/[id]
// Body: any subset of { subject, description, priority, status, clientId, category }
// Special: { action: 'respond', author, message } adds a TicketResponse.
// ──────────────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(request, 'support')
    if (!auth.ok) return auth.response
    const { id } = await params
    const body = await request.json()

    // ── Branch: add response ──
    if (body.action === 'respond') {
      const author = typeof body.author === 'string' ? body.author.trim() : ''
      const message = typeof body.message === 'string' ? body.message.trim() : ''
      if (!author) {
        return NextResponse.json({ error: 'Author is required' }, { status: 400 })
      }
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 })
      }

      const existing = await withRetry((tx) =>
        tx.supportTicket.findUnique({ where: { id }, select: { id: true, status: true } })
      )
      if (!existing) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }

      const response = await withRetry((tx) =>
        tx.ticketResponse.create({
          data: { ticketId: id, author, message },
        })
      )

      // Auto-update ticket status to in_progress if it was 'open' when a response arrived.
      let newStatus: string | null = null
      if (existing.status === 'open') {
        await withRetry((tx) =>
          tx.supportTicket.update({ where: { id }, data: { status: 'in_progress' } })
        )
        newStatus = 'in_progress'
      }

      try {
        await withRetry((tx) =>
          tx.adminAuditLog.create({
            data: {
              userId: auth.user.id,
              action: 'support.ticket.respond',
              module: 'support',
              entity: 'SupportTicket',
              entityId: id,
              details: JSON.stringify({ responseId: response.id, author }),
              ipAddress: request.headers.get('x-forwarded-for') ?? null,
            },
          })
        )
      } catch (auditErr) {
        console.warn('[Support API] audit log failed:', auditErr)
      }

      return NextResponse.json({ response, newStatus })
    }

    // ── Branch: update ticket fields ──
    const updateData: Record<string, unknown> = {}
    if (typeof body.subject === 'string' && body.subject.trim()) {
      updateData.subject = body.subject.trim()
    }
    if (typeof body.description === 'string') {
      updateData.message = body.description
    }
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (typeof body.priority === 'string' && validPriorities.includes(body.priority)) {
      updateData.priority = body.priority
    }
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed']
    if (typeof body.status === 'string' && validStatuses.includes(body.status)) {
      updateData.status = body.status
    }
    if (typeof body.category === 'string' && body.category.trim()) {
      updateData.category = body.category.trim()
    }
    if (body.clientId !== undefined) {
      updateData.clientId = body.clientId === '' || body.clientId === null ? null : body.clientId
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const existing = await withRetry((tx) =>
      tx.supportTicket.findUnique({ where: { id }, select: { id: true, subject: true } })
    )
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const ticket = await withRetry((tx) =>
      tx.supportTicket.update({
        where: { id },
        data: updateData,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              name: true,
              company: true,
              email: true,
            },
          },
          _count: { select: { responses: true } },
        },
      })
    )

    try {
      await withRetry((tx) =>
        tx.adminAuditLog.create({
          data: {
            userId: auth.user.id,
            action: 'support.ticket.update',
            module: 'support',
            entity: 'SupportTicket',
            entityId: id,
            details: JSON.stringify(updateData),
            ipAddress: request.headers.get('x-forwarded-for') ?? null,
          },
        })
      )
    } catch (auditErr) {
      console.warn('[Support API] audit log failed:', auditErr)
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('[Support API] PATCH [id] error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────────────────
// DELETE /api/admin/support/[id]
// Soft expectation: cascade-deletes TicketResponse rows (DB-level cascade).
// ──────────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(request, 'support')
    if (!auth.ok) return auth.response
    const { id } = await params

    const existing = await withRetry((tx) =>
      tx.supportTicket.findUnique({ where: { id }, select: { id: true, subject: true } })
    )
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    await withRetry((tx) => tx.supportTicket.delete({ where: { id } }))

    try {
      await withRetry((tx) =>
        tx.adminAuditLog.create({
          data: {
            userId: auth.user.id,
            action: 'support.ticket.delete',
            module: 'support',
            entity: 'SupportTicket',
            entityId: id,
            details: JSON.stringify({ subject: existing.subject }),
            ipAddress: request.headers.get('x-forwarded-for') ?? null,
          },
        })
      )
    } catch (auditErr) {
      console.warn('[Support API] audit log failed:', auditErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Support API] DELETE [id] error:', error)
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
  }
}
