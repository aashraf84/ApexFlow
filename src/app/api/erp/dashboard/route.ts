import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, getErpDashboardMetrics } from '@/lib/erp-client';

// GET: Dashboard metrics for an ERP
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) {
      return Response.json({ error: 'erpId is required' }, { status: 400 });
    }

    const config = await getErpConfig(erpId);

    const [metrics, recentOrders, recentCollections, ownerClientCount, invoiceTotals] =
      await Promise.all([
        getErpDashboardMetrics(config),
        queryErp(config, `SELECT * FROM "SalesOrder" ORDER BY "orderDate" DESC LIMIT 5`),
        queryErp(config, `SELECT * FROM "Collection" ORDER BY "collectionDate" DESC LIMIT 5`),
        queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "OwnerClient"`),
        queryErpOne<{ sum: string; count: string; paid: string }>(
          config,
          `SELECT 
            COALESCE(SUM("totalAmount"), 0) as sum,
            COUNT(*) as count,
            COALESCE(SUM("paidAmount"), 0) as paid
           FROM "OwnerInvoice"`
        ),
      ]);

    // Try to get recent complaints if the table exists
    let recentComplaints: any[] = [];
    try {
      recentComplaints = await queryErp(
        config,
        `SELECT * FROM "Complaint" ORDER BY "createdAt" DESC LIMIT 5`
      );
    } catch {
      // Table might not exist — ignore
    }

    return Response.json({
      metrics: {
        ...metrics,
        ownerClients: parseInt(ownerClientCount?.count || '0'),
        invoiceTotal: parseFloat(invoiceTotals?.sum || '0'),
        invoiceCount: parseInt(invoiceTotals?.count || '0'),
        invoicePaid: parseFloat(invoiceTotals?.paid || '0'),
      },
      recentOrders,
      recentCollections,
      recentComplaints,
    });
  } catch (error) {
    return errorResponse(error);
  }
}