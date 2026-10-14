import { db, withRetry } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('[API Error]', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

/**
 * Resolve the admin session from the request cookie, with DB verification.
 * Returns null if: no cookie, no session row, session expired, or user inactive.
 * Includes the user's role + parsed permissions for RBAC checks.
 */
export async function getAdminSession(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return null;

  try {
    const session = await withRetry((tx) =>
      tx.adminSession.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              adminRole: { select: { id: true, name: true, permissions: true } },
            },
          },
        },
      })
    );
    if (!session) return null;
    if (session.expiresAt < new Date()) return null;
    if (!session.user.isActive) return null;
    return session;
  } catch {
    // DB error (e.g. Neon cold start exhausted retries) — treat as unauthed
    return null;
  }
}

/** Parse the permissions JSON string from the user's role into a string[]. */
export function getUserPermissions(
  session: NonNullable<Awaited<ReturnType<typeof getAdminSession>>>
): string[] {
  try {
    const raw = session.user.adminRole?.permissions;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

/** Require only that the request is from a logged-in admin (any role). */
export async function requireAuth(request: NextRequest) {
  const session = await getAdminSession(request);
  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }
  return session;
}

/**
 * Require that the logged-in admin has a specific permission.
 * super_admin (or any role with 'all') bypasses every check.
 * Returns { ok: true, session, user, permissions } on success, or
 * { ok: false, response } with a 401 (unauthed) / 403 (forbidden) response.
 *
 * Usage in a route handler:
 *   const auth = await requirePermission(request, 'system');
 *   if (!auth.ok) return auth.response;
 *   // ... auth.user, auth.permissions available
 */
export async function requirePermission(request: NextRequest, permission: string) {
  const session = await getAdminSession(request);
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  const perms = getUserPermissions(session);
  const isSuperAdmin =
    session.user.role === 'super_admin' || perms.includes('all');
  if (!isSuperAdmin && !perms.includes(permission)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `Forbidden: requires '${permission}' permission` },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, session, user: session.user, permissions: perms };
}

export function getErpConfig(erpId: string) {
  // erpId format: "erp_distriflow_001" or just the DB id
  return db.erpSystem.findUnique({ where: { id: erpId } });
}

export function parsePagination(request: NextRequest) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')));
  const search = url.searchParams.get('search') || '';
  return { page, pageSize, search };
}

export function buildSearchClause(search: string, columns: string[]): { clause: string; params: string[] } {
  if (!search) return { clause: '', params: [] };
  const conditions = columns.map(col => `"${col}" ILIKE ?`);
  const params = columns.map(() => `%${search}%`);
  return { clause: `AND (${conditions.join(' OR ')})`, params };
}
