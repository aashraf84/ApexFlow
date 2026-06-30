import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List Products
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const tenantId = searchParams.get('tenantId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (tenantId) {
      conditions.push(`"tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }
    if (category) {
      conditions.push(`category = $${paramIdx++}`);
      params.push(category);
    }
    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }
    if (search) {
      const { clause, nextParamIndex } = buildSearchClause(
        ['name', 'sku', 'category'],
        search,
        params,
        paramIdx
      );
      conditions.push(`(${clause})`);
      paramIdx = nextParamIndex;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [products, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "Product" ${whereClause} ORDER BY name ASC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "Product" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      products,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new Product
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

    await executeErp(
      config,
      `INSERT INTO "Product" (
        id, "tenantId", name, sku, "principalId", "brandId", category, unit,
        "costPrice", "salePrice", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        body.tenantId,
        body.name,
        body.sku || null,
        body.principalId || null,
        body.brandId || null,
        body.category || null,
        body.unit || null,
        body.costPrice || 0,
        body.salePrice || 0,
        body.status || 'active',
        now,
        now,
      ]
    );

    const product = await queryErpOne(config, `SELECT * FROM "Product" WHERE id = $1`, [id]);

    return Response.json({ product }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}