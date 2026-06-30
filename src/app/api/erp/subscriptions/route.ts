import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List ClientSubscriptions
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (status) {
      conditions.push(`cs.status = $${paramIdx++}`);
      params.push(status);
    }
    if (clientId) {
      conditions.push(`cs."clientId" = $${paramIdx++}`);
      params.push(clientId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [subscriptions, totalResult] = await Promise.all([
      queryErp(
        config,
        `SELECT cs.*, sp.name as "planName", sp.code as "planCode", sp.priceMonthly, sp.priceYearly,
                oc."companyName" as "clientName"
         FROM "ClientSubscription" cs
         LEFT JOIN "SubscriptionPlan" sp ON cs."planId" = sp.id
         LEFT JOIN "OwnerClient" oc ON cs."clientId" = oc.id
         ${whereClause}
         ORDER BY cs."startDate" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, pageSize, offset]
      ),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "ClientSubscription" cs ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      subscriptions,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new ClientSubscription
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    if (!body.clientId || !body.planId) {
      return Response.json({ error: 'clientId and planId are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await executeErp(
      config,
      `INSERT INTO "ClientSubscription" (
        id, "clientId", "planId", "billingCycle", "startDate", "endDate",
        "trialStartDate", "trialEndDate", "currentPeriodStart", "currentPeriodEnd",
        "autoRenew", status, "cancelledAt", "cancelReason", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        body.clientId,
        body.planId,
        body.billingCycle || 'monthly',
        body.startDate || now,
        body.endDate || null,
        body.trialStartDate || null,
        body.trialEndDate || null,
        body.currentPeriodStart || now,
        body.currentPeriodEnd || null,
        body.autoRenew !== undefined ? body.autoRenew : true,
        body.status || 'active',
        body.cancelledAt || null,
        body.cancelReason || null,
        now,
        now,
      ]
    );

    const subscription = await queryErpOne(
      config,
      `SELECT cs.*, sp.name as "planName", sp.code as "planCode"
       FROM "ClientSubscription" cs
       LEFT JOIN "SubscriptionPlan" sp ON cs."planId" = sp.id
       WHERE cs.id = $1`,
      [id]
    );

    return Response.json({ subscription }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}