import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, errorResponse } from '@/lib/api-helpers';
import { queryErp } from '@/lib/erp-client';

// GET: List Warehouses
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const tenantId = searchParams.get('tenantId');
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (tenantId) {
      conditions.push(`"tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }
    if (region) {
      conditions.push(`region = $${paramIdx++}`);
      params.push(region);
    }
    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const warehouses = await queryErp(
      config,
      `SELECT * FROM "Warehouse" ${whereClause} ORDER BY name ASC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, pageSize, offset]
    );

    return Response.json({ warehouses });
  } catch (error) {
    return errorResponse(error);
  }
}