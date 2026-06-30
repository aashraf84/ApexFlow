import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List Dealers
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const region = searchParams.get('region');
    const search = searchParams.get('search') || '';

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (tenantId) {
      conditions.push(`"tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }
    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }
    if (region) {
      conditions.push(`region = $${paramIdx++}`);
      params.push(region);
    }
    if (search) {
      const { clause, nextParamIndex } = buildSearchClause(
        ['name', 'code', '"contactPerson"', 'email', 'phone'],
        search,
        params,
        paramIdx
      );
      conditions.push(`(${clause})`);
      paramIdx = nextParamIndex;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [dealers, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "Dealer" ${whereClause} ORDER BY name ASC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "Dealer" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      dealers,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new Dealer
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    if (!body.name || !body.tenantId) {
      return Response.json({ error: 'name and tenantId are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Generate dealer code
    const countResult = await queryErpOne<{ count: string }>(
      config,
      `SELECT COUNT(*) as count FROM "Dealer" WHERE "tenantId" = $1`,
      [body.tenantId]
    );
    const count = parseInt(countResult?.count || '0') + 1;
    const code = body.code || `DLR-${String(count).padStart(3, '0')}`;

    await executeErp(
      config,
      `INSERT INTO "Dealer" (
        id, "tenantId", name, code, "contactPerson", phone, email, address, city,
        region, category, "creditLimit", "outstandingBalance", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        body.tenantId,
        body.name,
        code,
        body.contactPerson || null,
        body.phone || null,
        body.email || null,
        body.address || null,
        body.city || null,
        body.region || null,
        body.category || null,
        body.creditLimit || 0,
        body.outstandingBalance || 0,
        body.status || 'active',
        now,
        now,
      ]
    );

    const dealer = await queryErpOne(config, `SELECT * FROM "Dealer" WHERE id = $1`, [id]);

    return Response.json({ dealer }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}