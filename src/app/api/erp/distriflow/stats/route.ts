import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  const dbUrl = process.env.DISTRIFLOW_DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DistriFlow database not configured' }, { status: 503 })
  }

  try {
    const sql = neon(dbUrl)
    
    // Get counts from key tables (using correct DistriFlow schema)
    // OwnerClient = platform clients (not Tenant which is the ERP tenant itself)
    // OwnerInvoice = platform invoices (not Invoice which has different columns)
    const [ownerClients, products, orders, ownerInvoices, retailers, dealers, warehouses, suppliers] = await Promise.allSettled([
      sql`SELECT COUNT(*) as count FROM "OwnerClient"`,
      sql`SELECT COUNT(*) as count FROM "Product"`,
      sql`SELECT COUNT(*) as count FROM "SalesOrder"`,
      sql`SELECT COUNT(*) as count FROM "OwnerInvoice"`,
      sql`SELECT COUNT(*) as count FROM "Retailer"`,
      sql`SELECT COUNT(*) as count FROM "Dealer"`,
      sql`SELECT COUNT(*) as count FROM "Warehouse"`,
      sql`SELECT COUNT(*) as count FROM "Supplier"`,
    ])

    const getCount = (result: PromiseSettledResult<any[]>) => 
      result.status === 'fulfilled' ? Number(result.value[0]?.count || 0) : 0

    // Get revenue from OwnerInvoice (NOT Invoice)
    let totalRevenue = 0
    try {
      const revenue = await sql`SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "OwnerInvoice" WHERE status = 'paid'`
      totalRevenue = Number(revenue[0]?.total || 0)
    } catch {
      try {
        const revenue = await sql`SELECT COALESCE(SUM(CAST("totalAmount" AS DECIMAL)), 0) as total FROM "OwnerInvoice"`
        totalRevenue = Number(revenue[0]?.total || 0)
      } catch {
        // ignore
      }
    }

    // Get recent orders
    let recentOrders: any[] = []
    try {
      recentOrders = await sql`
        SELECT id, "orderNumber", "totalAmount", "status", "createdAt" 
        FROM "SalesOrder" 
        ORDER BY "createdAt" DESC 
        LIMIT 5
      `
    } catch {
      // ignore
    }

    return NextResponse.json({
      slug: 'distriflow',
      name: 'DistriFlow',
      connected: true,
      stats: {
        clients: getCount(ownerClients),
        products: getCount(products),
        orders: getCount(orders),
        invoices: getCount(ownerInvoices),
        retailers: getCount(retailers),
        dealers: getCount(dealers),
        warehouses: getCount(warehouses),
        suppliers: getCount(suppliers),
        totalRevenue,
      },
      recentOrders,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DistriFlow Stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DistriFlow stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
