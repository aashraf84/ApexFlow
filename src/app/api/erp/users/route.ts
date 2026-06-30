import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List Users
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const search = searchParams.get('search') || '';
    const tenantId = searchParams.get('tenantId');
    const role = searchParams.get('role');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (tenantId) {
      conditions.push(`"tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }

    if (role) {
      conditions.push(`"role" = $${paramIdx++}`);
      params.push(role);
    }

    if (search) {
      const { clause, nextParamIndex } = buildSearchClause(
        ['"fullName"', '"email"', '"username"'],
        search,
        params,
        paramIdx
      );
      conditions.push(`(${clause})`);
      paramIdx = nextParamIndex;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [users, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "User" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "User" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    // Mask passwords in response
    const safeUsers = users.map((u: any) => ({ ...u, password: undefined }));

    return Response.json({
      users: safeUsers,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new User
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    if (!body.username || !body.fullName || !body.tenantId) {
      return Response.json(
        { error: 'username, fullName, and tenantId are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const hashedPassword = body.password
      ? await bcrypt.hash(body.password, 10)
      : await bcrypt.hash('changeme', 10);

    await executeErp(
      config,
      `INSERT INTO "User" (
        id, "tenantId", username, password, "fullName", email, phone, role, avatar, "isActive", "lastLoginAt", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        body.tenantId,
        body.username,
        hashedPassword,
        body.fullName,
        body.email || null,
        body.phone || null,
        body.role || 'viewer',
        body.avatar || null,
        body.isActive !== undefined ? body.isActive : true,
        null,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );

    const user = await queryErpOne(config, `SELECT * FROM "User" WHERE id = $1`, [id]);
    const safeUser = user ? { ...user, password: undefined } : null;

    return Response.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}