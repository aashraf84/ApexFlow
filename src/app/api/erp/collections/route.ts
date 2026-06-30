import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List Collections
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const tenantId = searchParams.get('tenantId');
    const dealerId = searchParams.get('dealerId');
    const paymentMethod = searchParams.get('paymentMethod');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (tenantId) {
      conditions.push(`"tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }
    if (dealerId) {
      conditions.push(`"dealerId" = $${paramIdx++}`);
      params.push(dealerId);
    }
    if (paymentMethod) {
      conditions.push(`"paymentMethod" = $${paramIdx++}`);
      params.push(paymentMethod);
    }
    if (status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (dateFrom) {
      conditions.push(`"collectionDate" >= $${paramIdx++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`"collectionDate" <= $${paramIdx++}`);
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [collections, totalResult] = await Promise.all([
      queryErp(
        config,
        `SELECT c.*, d.name as "dealerName"
         FROM "Collection" c
         LEFT JOIN "Dealer" d ON c."dealerId" = d.id
         ${whereClause}
         ORDER BY c."collectionDate" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, pageSize, offset]
      ),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "Collection" c ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      collections,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new Collection
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    if (!body.tenantId || !body.dealerId || !body.amount) {
      return Response.json({ error: 'tenantId, dealerId, and amount are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Generate receipt number
    const countResult = await queryErpOne<{ count: string }>(
      config,
      `SELECT COUNT(*) as count FROM "Collection" WHERE "tenantId" = $1`,
      [body.tenantId]
    );
    const count = parseInt(countResult?.count || '0') + 1;
    const receiptNo = body.receiptNo || `RCP-${String(count).padStart(5, '0')}`;

    await executeErp(
      config,
      `INSERT INTO "Collection" (
        id, "tenantId", "receiptNo", "dealerId", amount, "paymentMethod",
        "collectionDate", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        body.tenantId,
        receiptNo,
        body.dealerId,
        body.amount,
        body.paymentMethod || null,
        body.collectionDate || now,
        body.status || 'completed',
        now,
        now,
      ]
    );

    const collection = await queryErpOne(config, `SELECT * FROM "Collection" WHERE id = $1`, [id]);

    return Response.json({ collection }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}