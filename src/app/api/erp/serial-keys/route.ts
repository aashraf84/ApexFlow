import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List SerialKeys
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const status = searchParams.get('status');
    const tenantId = searchParams.get('tenantId');
    const clientId = searchParams.get('clientId');
    const search = searchParams.get('search') || '';

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }
    if (tenantId) {
      conditions.push(`"tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }
    if (clientId) {
      conditions.push(`"clientId" = $${paramIdx++}`);
      params.push(clientId);
    }
    if (search) {
      const { clause, nextParamIndex } = buildSearchClause(
        ['key', '"companyName"', '"contactEmail"'],
        search,
        params,
        paramIdx
      );
      conditions.push(`(${clause})`);
      paramIdx = nextParamIndex;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [keys, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "SerialKey" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "SerialKey" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      serialKeys: keys,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new SerialKey
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    const id = crypto.randomUUID();
    const key = body.key || `SK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    await executeErp(
      config,
      `INSERT INTO "SerialKey" (
        id, "tenantId", key, plan, "maxDevices", "activatedDevices",
        "companyName", "contactEmail", "contactPhone", "clientId", "subscriptionId",
        "validFrom", "validUntil", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        body.tenantId || null,
        key,
        body.plan || null,
        body.maxDevices || 1,
        0,
        body.companyName || null,
        body.contactEmail || null,
        body.contactPhone || null,
        body.clientId || null,
        body.subscriptionId || null,
        body.validFrom || now,
        body.validUntil || null,
        body.status || 'active',
        now,
        now,
      ]
    );

    const serialKey = await queryErpOne(config, `SELECT * FROM "SerialKey" WHERE id = $1`, [id]);

    return Response.json({ serialKey }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}