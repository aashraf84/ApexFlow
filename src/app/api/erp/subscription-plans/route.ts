import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErp } from '@/lib/erp-client';

// GET: List all SubscriptionPlans
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);

    const plans = await queryErp(
      config,
      `SELECT * FROM "SubscriptionPlan" ORDER BY "sortOrder" ASC`
    );

    return Response.json({ plans });
  } catch (error) {
    return errorResponse(error);
  }
}