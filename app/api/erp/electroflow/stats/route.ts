import { db, withRetry } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use Prisma client (already has connection pooling) instead of neon() serverless
    const [
      tenantCount, branchCount, employeeCount, userCount,
      saleCount, revenueAggregate, paidAggregate,
      customerCount, productCount, categoryCount,
      activeInstallments, overduePayments, financedAggregate,
      purchaseOrderCount, supplierCount,
      serviceTicketCount, openServiceTickets,
      deliveryCount, pendingDeliveries,
      expenseAggregate,
    ] = await Promise.all([
      db.tenant.count().catch(() => 0),
      db.branch.count({ where: { isActive: true } }).catch(() => 0),
      db.employee.count({ where: { isActive: true } }).catch(() => 0),
      db.user.count().catch(() => 0),
      db.sale.count().catch(() => 0),
      db.sale.aggregate({ _sum: { totalAmount: true } }).catch(() => ({ _sum: { totalAmount: 0 } })),
      db.sale.aggregate({ _sum: { paidAmount: true } }).catch(() => ({ _sum: { paidAmount: 0 } })),
      db.customer.count({ where: { isActive: true } }).catch(() => 0),
      db.product.count({ where: { isActive: true } }).catch(() => 0),
      db.category.count().catch(() => 0),
      db.installmentPlan.count({ where: { status: 'active' } }).catch(() => 0),
      db.installmentPayment.count({
        where: { status: 'pending', dueDate: { lt: new Date() } }
      }).catch(() => 0),
      db.installmentPlan.aggregate({ _sum: { financedAmount: true }, where: { status: 'active' } }).catch(() => ({ _sum: { financedAmount: 0 } })),
      db.purchaseOrder.count().catch(() => 0),
      db.supplier.count({ where: { isActive: true } }).catch(() => 0),
      db.serviceTicket.count().catch(() => 0),
      db.serviceTicket.count({ where: { status: { in: ['received', 'in_progress'] } } }).catch(() => 0),
      db.delivery.count().catch(() => 0),
      db.delivery.count({ where: { status: { in: ['pending', 'shipped'] } } }).catch(() => 0),
      db.expense.aggregate({ _sum: { amount: true }, where: { status: 'paid' } }).catch(() => ({ _sum: { amount: 0 } })),
    ])

    const totalRevenue = (revenueAggregate as any)?._sum?.totalAmount || 0
    const totalPaid = (paidAggregate as any)?._sum?.paidAmount || 0

    // Non-critical queries that can be fetched separately
    let salesByType: any[] = []
    let salesByMonth: any[] = []
    let recentSales: any[] = []
    let topProducts: any[] = []
    let totalStock = 0
    let lowStock = 0
    let branches: any[] = []

    try {
      // Use raw queries for aggregations that Prisma doesn't support well
      salesByType = await db.$queryRaw`
        SELECT "saleType" as type, COUNT(*)::int AS count, COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "Sale" GROUP BY "saleType" ORDER BY revenue DESC
      ` as any[]
    } catch {}

    try {
      salesByMonth = await db.$queryRaw`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, COUNT(*)::int AS count, COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "Sale" WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM') ORDER BY month ASC
      ` as any[]
    } catch {}

    try {
      recentSales = await db.sale.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      })
    } catch {}

    try {
      topProducts = await db.$queryRaw`
        SELECT p.name, p."salePrice", SUM(si.quantity)::int AS "totalSold", SUM(si."totalPrice")::float AS "totalRevenue"
        FROM "SaleItem" si JOIN "Product" p ON si."productId" = p.id
        GROUP BY p.name, p."salePrice" ORDER BY "totalSold" DESC LIMIT 5
      ` as any[]
    } catch {}

    try {
      const stockResult = await db.stockItem.aggregate({ _sum: { quantity: true } })
      totalStock = stockResult._sum.quantity || 0
    } catch {}

    try {
      const [ls] = await db.$queryRaw`
        SELECT COUNT(*)::int AS c FROM "Product" p
        WHERE p."isActive" = true AND p."reorderLevel" > 0
        AND NOT EXISTS (SELECT 1 FROM "StockItem" si WHERE si."productId" = p.id AND si.quantity > p."reorderLevel")
      ` as any[]
      lowStock = ls?.c || 0
    } catch {}

    try {
      branches = await db.$queryRaw`
        SELECT b.name, b.code, b.city, b."isActive",
          COUNT(DISTINCT s.id)::int AS "salesCount",
          COALESCE(SUM(s."totalAmount"), 0)::float AS revenue
        FROM "Branch" b LEFT JOIN "Sale" s ON s."branchId" = b.id
        WHERE b."isActive" = true
        GROUP BY b.id, b.name, b.code, b.city, b."isActive"
        ORDER BY revenue DESC
      ` as any[]
    } catch {}

    return NextResponse.json({
      connected: true,
      core: {
        tenants: tenantCount,
        branches: branchCount,
        employees: employeeCount,
        users: userCount,
      },
      sales: {
        totalOrders: saleCount,
        totalRevenue,
        totalPaid,
        outstanding: totalRevenue - totalPaid,
        salesByType: salesByType.map((s: any) => ({
          type: s.type,
          count: s.count,
          revenue: Number(s.revenue),
        })),
        salesByMonth: salesByMonth.map((s: any) => ({
          month: s.month,
          count: s.count,
          revenue: Number(s.revenue),
        })),
        recentSales: recentSales.map((s: any) => ({
          invoiceNumber: s.invoiceNumber,
          totalAmount: s.totalAmount,
          saleType: s.saleType,
          status: s.status,
          customerName: s.customer?.name || null,
          createdAt: s.createdAt,
        })),
      },
      customers: { total: customerCount },
      products: {
        total: productCount,
        categories: categoryCount,
        topProducts: topProducts.map((p: any) => ({
          name: p.name,
          salePrice: Number(p.salePrice),
          totalSold: Number(p.totalSold),
          totalRevenue: Number(p.totalRevenue),
        })),
        totalStock,
        lowStock,
      },
      installments: {
        active: activeInstallments,
        completed: 0,
        overduePayments,
        financedAmount: (financedAggregate as any)?._sum?.financedAmount || 0,
      },
      procurement: {
        purchaseOrders: purchaseOrderCount,
        suppliers: supplierCount,
      },
      service: {
        total: serviceTicketCount,
        open: openServiceTickets,
      },
      delivery: {
        total: deliveryCount,
        pending: pendingDeliveries,
      },
      expenses: { total: (expenseAggregate as any)?._sum?.amount || 0 },
      branches: branches.map((b: any) => ({
        name: b.name,
        code: b.code,
        city: b.city,
        isActive: b.isActive,
        salesCount: Number(b.salesCount),
        revenue: Number(b.revenue),
      })),
    })
  } catch (error) {
    console.error('[ELECTROFLOW-STATS] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ElectroFlow stats', connected: false },
      { status: 500 }
    )
  }
}
