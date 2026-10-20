import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────
type ActivityCategory = 'Auth' | 'Sync' | 'Clients' | 'Deals' | 'System'

interface UnifiedActivity {
  /** Composite key — type|id — used by the client to dedupe during auto-refresh. */
  key: string
  id: string
  type: 'audit' | 'sync' | 'client' | 'deal'
  category: ActivityCategory
  actor: string
  actorEmail?: string | null
  action: string
  entity: string | null
  entityType: string | null
  entityId: string | null
  /** Deep-link to the relevant admin module (null when no sensible target). */
  href: string | null
  createdAt: string
  metadata?: Record<string, unknown>
}

const TAKE_PER_TABLE = 50

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

/** Convert snake_case/dotted action strings (e.g. "support.ticket.create") into a readable label. */
function prettifyAction(action: string | null | undefined): string {
  if (!action) return 'Activity'
  const last = action.split(/[._]/).filter(Boolean).pop() || action
  return last.charAt(0).toUpperCase() + last.slice(1)
}

/** Build a deep-link to the relevant admin module for an activity entry. */
function buildHref(
  category: ActivityCategory,
  entityType: string | null,
  entityId: string | null
): string | null {
  if (!entityId) {
    // Fall back to module root pages when we only know the category.
    switch (category) {
      case 'Auth':
      case 'System':
        return '/admin/audit'
      case 'Sync':
        return '/admin/sync-logs'
      case 'Clients':
        return '/admin/clients'
      case 'Deals':
        return '/admin/deals'
    }
  }
  switch (category) {
    case 'Auth':
    case 'System':
      return '/admin/audit'
    case 'Sync':
      return '/admin/sync-logs'
    case 'Clients':
      return entityType === 'ClientActivity' && entityId
        ? `/admin/clients?id=${encodeURIComponent(entityId)}`
        : '/admin/clients'
    case 'Deals':
      return entityId ? `/admin/deals` : '/admin/deals'
  }
}

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/activity
//   ?category=all|Auth|Sync|Clients|Deals|System
//   &limit=100
//   &before=<ISO timestamp>   ← cursor for "Load more" (appends older entries)
// ──────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'reports')
    if (!auth.ok) return auth.response

    const url = new URL(request.url)
    const category = url.searchParams.get('category') || 'all'
    const limit = Math.min(
      500,
      Math.max(1, parseInt(url.searchParams.get('limit') || '100'))
    )
    const before = url.searchParams.get('before')
    const cursor = before ? new Date(before) : new Date()
    if (Number.isNaN(cursor.getTime())) {
      return NextResponse.json(
        { error: 'Invalid `before` timestamp' },
        { status: 400 }
      )
    }

    const activities: UnifiedActivity[] = []
    const errors: string[] = []

    // ── AdminAuditLog (Auth + System) ──
    if (category === 'all' || category === 'Auth' || category === 'System') {
      try {
        const logs = await withRetry((tx) =>
          tx.adminAuditLog.findMany({
            where: { createdAt: { lt: cursor } },
            take: TAKE_PER_TABLE,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { name: true, email: true } },
            },
          })
        )
        for (const log of logs) {
          const isAuth =
            log.action?.toLowerCase().includes('login') ||
            log.action?.toLowerCase().includes('logout') ||
            log.action?.toLowerCase().includes('session') ||
            log.module === 'auth'
          const cat: ActivityCategory = isAuth ? 'Auth' : 'System'
          if (category !== 'all' && category !== cat) continue
          activities.push({
            key: `audit-${log.id}`,
            id: log.id,
            type: 'audit',
            category: cat,
            actor: log.user?.name || log.user?.email || 'System',
            actorEmail: log.user?.email || null,
            action: prettifyAction(log.action),
            entity: log.entity || log.module || null,
            entityType: log.entity || log.module || null,
            entityId: log.entityId || null,
            href: buildHref(cat, log.entity || log.module || null, log.entityId || null),
            createdAt: log.createdAt.toISOString(),
            metadata: log.details
              ? safeParse(log.details, { raw: log.details })
              : undefined,
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('[Activity API] audit logs fetch failed:', msg)
        errors.push(`audit: ${msg}`)
      }
    }

    // ── SyncLog (Sync) ──
    if (category === 'all' || category === 'Sync') {
      try {
        const logs = await withRetry((tx) =>
          tx.syncLog.findMany({
            where: { startedAt: { lt: cursor } },
            take: TAKE_PER_TABLE,
            orderBy: { startedAt: 'desc' },
          })
        )
        for (const log of logs) {
          const ok = log.status === 'success' || log.status === 'completed'
          const fail = log.status === 'failed' || log.status === 'error'
          const verb = fail
            ? 'failed sync for'
            : ok
              ? 'completed sync for'
              : 'started sync for'
          const stamp = (log.completedAt || log.startedAt).toISOString()
          activities.push({
            key: `sync-${log.id}`,
            id: log.id,
            type: 'sync',
            category: 'Sync',
            actor: 'System',
            actorEmail: null,
            action: `${verb} ${log.erpName} (${log.direction})`,
            entity: log.erpName || log.erpSlug,
            entityType: 'SyncLog',
            entityId: log.id,
            href: buildHref('Sync', 'SyncLog', log.id),
            createdAt: stamp,
            metadata: {
              status: log.status,
              recordsSynced: log.recordsSynced,
              recordsFailed: log.recordsFailed,
              durationMs: log.durationMs,
              error: log.errorMessage || undefined,
            },
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('[Activity API] sync logs fetch failed:', msg)
        errors.push(`sync: ${msg}`)
      }
    }

    // ── ClientActivity (Clients) ──
    if (category === 'all' || category === 'Clients') {
      try {
        const logs = await withRetry((tx) =>
          tx.clientActivity.findMany({
            where: { createdAt: { lt: cursor } },
            take: TAKE_PER_TABLE,
            orderBy: { createdAt: 'desc' },
            include: {
              client: {
                select: { id: true, companyName: true, contactPerson: true },
              },
            },
          })
        )
        for (const log of logs) {
          activities.push({
            key: `client-${log.id}`,
            id: log.id,
            type: 'client',
            category: 'Clients',
            actor: 'CRM',
            actorEmail: null,
            action: `${prettifyAction(log.type)} — ${log.subject}`,
            entity:
              log.client?.companyName ||
              log.client?.contactPerson ||
              `Client #${log.clientId}`,
            entityType: 'ClientActivity',
            entityId: log.clientId,
            href: buildHref('Clients', 'ClientActivity', log.clientId),
            createdAt: log.createdAt.toISOString(),
            metadata: log.notes
              ? safeParse(log.notes, { notes: log.notes })
              : undefined,
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('[Activity API] client activity fetch failed:', msg)
        errors.push(`client: ${msg}`)
      }
    }

    // ── DealActivity (Deals) ──
    if (category === 'all' || category === 'Deals') {
      try {
        const logs = await withRetry((tx) =>
          tx.dealActivity.findMany({
            where: { createdAt: { lt: cursor } },
            take: TAKE_PER_TABLE,
            orderBy: { createdAt: 'desc' },
            include: {
              deal: { select: { id: true, title: true } },
            },
          })
        )
        for (const log of logs) {
          activities.push({
            key: `deal-${log.id}`,
            id: log.id,
            type: 'deal',
            category: 'Deals',
            actor: 'CRM',
            actorEmail: null,
            action: `${prettifyAction(log.type)} on ${log.deal?.title || `Deal #${log.dealId}`}`,
            entity: log.deal?.title || null,
            entityType: 'DealActivity',
            entityId: log.dealId,
            href: buildHref('Deals', 'DealActivity', log.dealId),
            createdAt: log.createdAt.toISOString(),
            metadata: { content: log.content },
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('[Activity API] deal activity fetch failed:', msg)
        errors.push(`deal: ${msg}`)
      }
    }

    // ── Sort + trim ──
    activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const trimmed = activities.slice(0, limit)
    const oldest =
      trimmed.length > 0
        ? trimmed[trimmed.length - 1].createdAt
        : null
    const hasMore = activities.length > limit || trimmed.length === limit

    return NextResponse.json({
      activities: trimmed,
      total: activities.length,
      hasMore,
      cursor: oldest,
      errors: errors.length ? errors : undefined,
    })
  } catch (error) {
    console.error('[Activity API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    )
  }
}

/** Try JSON.parse, fall back to the provided fallback on failure. */
function safeParse(raw: string, fallback: Record<string, unknown>): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}
