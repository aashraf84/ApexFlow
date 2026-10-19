import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { db, withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface UnifiedActivity {
  id: string
  type: 'audit' | 'sync' | 'client' | 'deal'
  category: 'Auth' | 'Sync' | 'Clients' | 'Deals' | 'System'
  actor: string
  action: string
  entity: string | null
  entityType: string | null
  entityId: string | null
  createdAt: string
  metadata?: Record<string, unknown>
}

const TAKE_PER_TABLE = 50

// ──────────────────────────────────────────────────────────────────
// GET /api/admin/activity?category=Auth|Sync|Clients|Deals|System&limit=100
// Returns a unified timeline merging AdminAuditLog + SyncLog + ClientActivity + DealActivity.
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

    const activities: UnifiedActivity[] = []

    // ── AdminAuditLog (Auth + System + everything audited) ──
    if (category === 'all' || category === 'Auth' || category === 'System') {
      try {
        const logs = await withRetry((tx) =>
          tx.adminAuditLog.findMany({
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
          const cat: 'Auth' | 'System' = isAuth ? 'Auth' : 'System'
          if (category !== 'all' && category !== cat) continue
          activities.push({
            id: log.id,
            type: 'audit',
            category: cat,
            actor: log.user?.name || log.user?.email || 'System',
            action: prettifyAction(log.action),
            entity: log.entity || log.module || null,
            entityType: log.entity || null,
            entityId: log.entityId || null,
            createdAt: log.createdAt.toISOString(),
            metadata: log.details
              ? (() => {
                  try {
                    return JSON.parse(log.details)
                  } catch {
                    return { raw: log.details }
                  }
                })()
              : undefined,
          })
        }
      } catch (err) {
        console.warn('[Activity API] audit logs fetch failed:', err)
      }
    }

    // ── SyncLog (Sync) ──
    if (category === 'all' || category === 'Sync') {
      try {
        const logs = await withRetry((tx) =>
          tx.syncLog.findMany({
            take: TAKE_PER_TABLE,
            orderBy: { startedAt: 'desc' },
          })
        )
        for (const log of logs) {
          const ok = log.status === 'success' || log.status === 'completed'
          const fail = log.status === 'failed' || log.status === 'error'
          const verb = fail ? 'failed sync for' : ok ? 'completed sync for' : 'started sync for'
          activities.push({
            id: log.id,
            type: 'sync',
            category: 'Sync',
            actor: 'System',
            action: `${verb} ${log.erpName} (${log.direction})`,
            entity: log.erpName || log.erpSlug,
            entityType: 'SyncLog',
            entityId: log.id,
            createdAt: (log.completedAt || log.startedAt).toISOString(),
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
        console.warn('[Activity API] sync logs fetch failed:', err)
      }
    }

    // ── ClientActivity (Clients) ──
    if (category === 'all' || category === 'Clients') {
      try {
        const logs = await withRetry((tx) =>
          tx.clientActivity.findMany({
            take: TAKE_PER_TABLE,
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { id: true, companyName: true, contactPerson: true } } },
          })
        )
        for (const log of logs) {
          activities.push({
            id: log.id,
            type: 'client',
            category: 'Clients',
            actor: 'CRM',
            action: `${prettifyAction(log.type)} — ${log.subject}`,
            entity: log.client?.companyName || log.client?.contactPerson || `Client #${log.clientId}`,
            entityType: 'ClientActivity',
            entityId: log.clientId,
            createdAt: log.createdAt.toISOString(),
            metadata: log.notes
              ? (() => {
                  try {
                    return JSON.parse(log.notes)
                  } catch {
                    return { notes: log.notes }
                  }
                })()
              : undefined,
          })
        }
      } catch (err) {
        console.warn('[Activity API] client activity fetch failed:', err)
      }
    }

    // ── DealActivity (Deals) ──
    if (category === 'all' || category === 'Deals') {
      try {
        const logs = await withRetry((tx) =>
          tx.dealActivity.findMany({
            take: TAKE_PER_TABLE,
            orderBy: { createdAt: 'desc' },
            include: { deal: { select: { id: true, title: true } } },
          })
        )
        for (const log of logs) {
          activities.push({
            id: log.id,
            type: 'deal',
            category: 'Deals',
            actor: 'CRM',
            action: `${prettifyAction(log.type)} on ${log.deal?.title || `Deal #${log.dealId}`}`,
            entity: log.deal?.title || null,
            entityType: 'DealActivity',
            entityId: log.dealId,
            createdAt: log.createdAt.toISOString(),
            metadata: { content: log.content },
          })
        }
      } catch (err) {
        console.warn('[Activity API] deal activity fetch failed:', err)
      }
    }

    // ── Sort + trim ──
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const trimmed = activities.slice(0, limit)

    return NextResponse.json({ activities: trimmed, total: activities.length })
  } catch (error) {
    console.error('[Activity API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 })
  }
}

/** Convert snake_case action strings (e.g. "support.ticket.create") into a readable label. */
function prettifyAction(action: string | null | undefined): string {
  if (!action) return 'Activity'
  // Replace dots/underscores, title-case the last segment.
  const last = action.split(/[._]/).filter(Boolean).pop() || action
  return last.charAt(0).toUpperCase() + last.slice(1)
}
