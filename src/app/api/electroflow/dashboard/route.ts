import { db, withRetry } from '@/lib/db'
import { NextResponse } from 'next/server'

async function getDefaultTenantId() {
  const tenant = await db.tenant.findFirst({ where: { isActive: true } })
  return tenant?.id || ''
}

export async function GET() {
  try {
    const tenantId = await getDefaultTenantId()
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    const [
      totalRevenue,
      customerCount,
      productCount,
      pendingOrders,
      activeInstallments,
      recentSales,
      salesByMonth,
      topProducts,
      branchCount,
      employeeCount,
      overdueInstallments,
      pendingDeliveries,
      openTickets,
    ] = await Promise.all([
      // Total revenue
      db.sale.aggregate({ _sum: { totalAmount: true }, where: { tenantId } }),
      // Customer count
      db.customer.count({ where: { tenantId, isActive: true } }),
      // Product count
      db.product.count({ where: { tenantId, isActive: true } }),
      // Pending purchase orders
      db.purchaseOrder.count({ where: { tenantId, status: { in: ['draft', 'sent'] } } }),
      // Active installment plans
      db.installmentPlan.count({ where: { tenantId, status: 'active' } }),
      // Recent sales
      db.sale.findMany({
        where: { tenantId },
        include: { customer: { select: { name: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Sales by month (last 6 months)
      db.$queryRaw<Array<{ month: string; total: number }>>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, SUM("totalAmount") as total
        FROM "Sale" WHERE "tenantId" = ${tenantId}
        AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `,
      // Top selling products
      db.saleItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
        where: { sale: { tenantId } },
      }),
      // Branch count
      db.branch.count({ where: { tenantId, isActive: true } }),
      // Employee count
      db.employee.count({ where: { tenantId, isActive: true } }),
      // Overdue installments
      db.installmentPayment.count({
        where: {
          plan: { tenantId },
          status: 'overdue',
        },
      }),
      // Pending deliveries
      db.delivery.count({ where: { tenantId, status: { in: ['pending', 'shipped'] } } }),
      // Open service tickets
      db.serviceTicket.count({ where: { tenantId, status: { in: ['received', 'in_progress'] } } }),
    ])

    // Monthly expense
    const monthlyExpense = await db.expense.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    })

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      customerCount,
      productCount,
      pendingOrders,
      activeInstallments,
      branchCount,
      employeeCount,
      overdueInstallments,
      pendingDeliveries,
      openTickets,
      monthlyExpense: monthlyExpense._sum.amount || 0,
      recentSales: recentSales.map(s => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        customerName: s.customer?.name || 'Walk-in',
        totalAmount: s.totalAmount,
        status: s.status,
        saleType: s.saleType,
        createdAt: s.createdAt,
        itemCount: s.items.length,
      })),
      salesByMonth: salesByMonth.map(m => ({
        month: m.month,
        total: Number(m.total),
      })),
      topProducts: topProducts.map(p => ({
        productId: p.productId,
        productName: p.productName,
        totalQty: p._sum.quantity || 0,
        totalRevenue: p._sum.totalPrice || 0,
      })),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
