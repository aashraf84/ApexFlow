import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  const dbUrl = process.env.BOOKFLOW_DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'BookFlow database not configured' }, { status: 503 })
  }

  try {
    const sql = neon(dbUrl)
    
    const [clients, books, authors, sales, invoices, inventory, serialKeys, warehouses] = await Promise.allSettled([
      sql`SELECT COUNT(*) as count FROM "OwnerClient"`,
      sql`SELECT COUNT(*) as count FROM "Book"`,
      sql`SELECT COUNT(*) as count FROM "Author"`,
      sql`SELECT COUNT(*) as count FROM "Sale"`,
      sql`SELECT COUNT(*) as count FROM "OwnerInvoice"`,
      sql`SELECT COUNT(*) as count FROM "InventoryItem"`,
      sql`SELECT COUNT(*) as count FROM "SerialKey"`,
      sql`SELECT COUNT(*) as count FROM "Warehouse"`,
    ])

    const getCount = (result: PromiseSettledResult<any[]>) => 
      result.status === 'fulfilled' ? Number(result.value[0]?.count || 0) : 0

    let totalRevenue = 0
    try {
      const revenue = await sql`SELECT COALESCE(SUM(CAST("totalAmount" AS DECIMAL)), 0) as total FROM "OwnerInvoice" WHERE status = 'paid'`
      totalRevenue = Number(revenue[0]?.total || 0)
    } catch {
      // ignore
    }

    let recentSales: any[] = []
    try {
      recentSales = await sql`
        SELECT id, "orderNumber", total, status, "createdAt" 
        FROM "Sale" 
        ORDER BY "createdAt" DESC 
        LIMIT 5
      `
    } catch {
      // ignore
    }

    return NextResponse.json({
      slug: 'bookflow',
      name: 'BookFlow',
      connected: true,
      stats: {
        clients: getCount(clients),
        books: getCount(books),
        authors: getCount(authors),
        sales: getCount(sales),
        invoices: getCount(invoices),
        inventory: getCount(inventory),
        serialKeys: getCount(serialKeys),
        warehouses: getCount(warehouses),
        totalRevenue,
      },
      recentSales,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[BookFlow Stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch BookFlow stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
