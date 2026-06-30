import { db } from '@/lib/db';
import { cookies } from 'next/headers';
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

export async function getAdminSession(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;

  const session = await db.adminSession.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function requireAuth(request: NextRequest) {
  const session = await getAdminSession(request);
  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }
  return session;
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