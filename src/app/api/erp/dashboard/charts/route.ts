import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErp } from '@/lib/erp-client';

// GET: Chart data for an ERP dashboard
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) {
      return Response.json({ error: 'erpId is required' }, { status: 400 });
    }

    const config = await getErpConfig(erpId);

    const [monthlySales, topDealers, collectionTrends] = await Promise.all([
      queryErp<{ month: string; count: string; sum: string }>(
        config,
        `SELECT DATE_TRUNC('month', "orderDate") as month, COUNT(*) as count, SUM("netAmount") as sum 
         FROM "SalesOrder" 
         GROUP BY month ORDER BY month DESC LIMIT 12`
      ),
      queryErp<{ name: string; totalamount: string }>(
        config,
        `SELECT d.name, COALESCE(SUM(so."netAmount"), 0) as totalamount 
         FROM "Dealer" d 
         LEFT JOIN "SalesOrder" so ON so."dealerId" = d.id 
         GROUP BY d.name ORDER BY totalamount DESC LIMIT 10`
      ),
      queryErp<{ month: string; amount: string }>(
        config,
        `SELECT DATE_TRUNC('month', "collectionDate") as month, SUM(amount) as amount 
         FROM "Collection" 
         GROUP BY month ORDER BY month DESC LIMIT 12`
      ),
    ]);

    return Response.json({
      monthlySales: monthlySales.map((m) => ({
        month: m.month,
        count: parseInt(m.count || '0'),
        total: parseFloat(m.sum || '0'),
      })),
      topDealers: topDealers.map((d) => ({
        name: d.name,
        total: parseFloat(d.totalamount || '0'),
      })),
      collectionTrends: collectionTrends.map((c) => ({
        month: c.month,
        amount: parseFloat(c.amount || '0'),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}