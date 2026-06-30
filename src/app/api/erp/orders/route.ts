import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List SalesOrders
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
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search') || '';

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
    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }
    if (paymentStatus) {
      conditions.push(`"paymentStatus" = $${paramIdx++}`);
      params.push(paymentStatus);
    }
    if (dateFrom) {
      conditions.push(`"orderDate" >= $${paramIdx++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`"orderDate" <= $${paramIdx++}`);
      params.push(dateTo);
    }
    if (search) {
      const { clause, nextParamIndex } = buildSearchClause(
        ['"orderNo"'],
        search,
        params,
        paramIdx
      );
      conditions.push(`(${clause})`);
      paramIdx = nextParamIndex;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [orders, totalResult] = await Promise.all([
      queryErp(
        config,
        `SELECT so.*, d.name as "dealerName"
         FROM "SalesOrder" so
         LEFT JOIN "Dealer" d ON so."dealerId" = d.id
         ${whereClause}
         ORDER BY so."orderDate" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, pageSize, offset]
      ),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "SalesOrder" so ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      orders,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new SalesOrder
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    if (!body.tenantId || !body.dealerId) {
      return Response.json({ error: 'tenantId and dealerId are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Generate order number
    const countResult = await queryErpOne<{ count: string }>(
      config,
      `SELECT COUNT(*) as count FROM "SalesOrder" WHERE "tenantId" = $1`,
      [body.tenantId]
    );
    const count = parseInt(countResult?.count || '0') + 1;
    const orderNo = body.orderNo || `SO-${String(count).padStart(5, '0')}`;

    await executeErp(
      config,
      `INSERT INTO "SalesOrder" (
        id, "tenantId", "orderNo", "dealerId", "orderDate", "deliveryDate",
        "totalAmount", "netAmount", "paymentStatus", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        body.tenantId,
        orderNo,
        body.dealerId,
        body.orderDate || now,
        body.deliveryDate || null,
        body.totalAmount || 0,
        body.netAmount || 0,
        body.paymentStatus || 'unpaid',
        body.status || 'pending',
        now,
        now,
      ]
    );

    const order = await queryErpOne(config, `SELECT * FROM "SalesOrder" WHERE id = $1`, [id]);

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}