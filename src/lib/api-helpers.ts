import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import type { ErpSystemConfig } from '@/lib/erp-client';

/**
 * Get the authenticated admin session from a request's cookie.
 * Returns null if not authenticated or session expired.
 */
export async function getAdminSession(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return null;

  const session = await db.adminSession.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  return {
    session,
    user: session.user,
  };
}

/**
 * Require authentication — returns user or throws 401.
 */
export async function requireAuth(request: NextRequest) {
  const result = await getAdminSession(request);
  if (!result) {
    throw new ApiError(401, 'Unauthorized');
  }
  return result;
}

/**
 * Fetch ErpSystem from local DB and return ErpSystemConfig for erp-client.
 */
export async function getErpConfig(erpId: string): Promise<ErpSystemConfig> {
  const erp = await db.erpSystem.findUnique({ where: { id: erpId } });
  if (!erp) {
    throw new ApiError(404, `ERP system not found: ${erpId}`);
  }
  return {
    id: erp.id,
    name: erp.name,
    industry: erp.industry,
    dbHost: erp.dbHost,
    dbPort: erp.dbPort,
    dbName: erp.dbName,
    dbUser: erp.dbUser,
    dbPassword: erp.dbPassword,
    sslMode: erp.sslMode,
  };
}

/**
 * Parse pagination params from a URL search params.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults = { page: 1, pageSize: 20 }
) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '') || defaults.page);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || '') || defaults.pageSize)
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/**
 * Build a LIKE search clause for given fields.
 */
export function buildSearchClause(
  fields: string[],
  search: string,
  params: any[],
  paramIndex: number
): { clause: string; nextParamIndex: number } {
  const conditions = fields.map((field) => {
    const param = `$${paramIndex++}`;
    params.push(`%${search}%`);
    return `${field} ILIKE ${param}`;
  });
  return { clause: conditions.join(' OR '), nextParamIndex: paramIndex };
}

/**
 * Custom error class with HTTP status code.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper to build a JSON error response.
 */
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error('[API Error]', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}

/**
 * Parse user agent to extract browser and device info.
 */
export function parseUserAgent(ua: string | null) {
  if (!ua) return { browser: 'Unknown', device: 'Unknown' };
  let browser = 'Unknown';
  let device = 'Unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Mobile')) device = 'Mobile';
  else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'Tablet';
  else device = 'Desktop';

  return { browser, device };
}