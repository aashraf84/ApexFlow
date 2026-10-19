import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/support
// Query params: status, priority, search, clientId, assignee
// Returns: { tickets: SupportTicket[] (with client + _count.responses) }
// ──────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'support')
    if (!auth.ok) return auth.response

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const search = url.searchParams.get('search')?.trim()
    const clientId = url.searchParams.get('clientId')

    const where: {
      status?: string
      priority?: string
      clientId?: string
      OR?: Array<{ subject?: { contains: string; mode: 'insensitive' }; name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>
    } = {}
    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (clientId) where.clientId = clientId
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tickets = await withRetry((tx) =>
      tx.supportTicket.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
    )

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('[Support API] GET list error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────────────────
// POST /api/admin/support
// Body: { subject, description, priority, clientId?, assignee, name?, email?, category? }
// ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'support')
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { subject, description, priority, clientId, assignee, name, email, category } = body

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // Resolve client info if a clientId was provided; otherwise fall back to provided name/email.
    let resolvedName = name || ''
    let resolvedEmail = email || ''
    if (clientId) {
      const client = await withRetry((tx) =>
        tx.client.findUnique({
          where: { id: clientId },
          select: { id: true, name: true, email: true, company: true },
        })
      )
      if (!client) {
        return NextResponse.json({ error: 'Selected client not found' }, { status: 400 })
      }
      resolvedName = resolvedName || client.name
      resolvedEmail = resolvedEmail || client.email || ''
    }
    if (!resolvedName) {
      // Last-resort fallback so we never violate the NOT NULL constraint on `name`.
      resolvedName = auth.user.name || 'Unknown'
    }
    if (!resolvedEmail) {
      resolvedEmail = auth.user.email || 'unknown@apexflow.local'
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent']
    const finalPriority = validPriorities.includes(priority) ? priority : 'medium'
    const finalCategory = category && typeof category === 'string' ? category : 'general'

    const ticket = await withRetry((tx) =>
      tx.supportTicket.create({
        data: {
          subject: subject.trim(),
          message: description.trim(),
          priority: finalPriority,
          status: 'open',
          category: finalCategory,
          clientId: clientId || null,
          name: resolvedName,
          email: resolvedEmail,
        },
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

    // If an assignee was provided, record it as the first internal response so the
    // assignment is visible in the ticket's response thread.
    if (assignee && typeof assignee === 'string' && assignee.trim()) {
      await withRetry((tx) =>
        tx.ticketResponse.create({
          data: {
            ticketId: ticket.id,
            author: assignee.trim(),
            message: `Ticket assigned to ${assignee.trim()}.`,
          },
        })
      )
    }

    // Audit log entry
    try {
      await withRetry((tx) =>
        tx.adminAuditLog.create({
          data: {
            userId: auth.user.id,
            action: 'support.ticket.create',
            module: 'support',
            entity: 'SupportTicket',
            entityId: ticket.id,
            details: JSON.stringify({
              subject: ticket.subject,
              priority: ticket.priority,
              clientId: ticket.clientId,
              assignee: assignee || null,
            }),
            ipAddress: request.headers.get('x-forwarded-for') ?? null,
          },
        })
      )
    } catch (auditErr) {
      // Audit log failure should never block a successful ticket creation.
      console.warn('[Support API] audit log failed:', auditErr)
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('[Support API] POST create error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
