// ApexFlow Cloud — Checkout Cancel Handler
// GET /api/checkout/cancel?order_id=xxx
// Marks the order as cancelled and redirects to pricing page.
// Resilient to DB failures.

import { NextRequest, NextResponse } from 'next/server'

/** Lazy-load DB to avoid crash when DB is unavailable */
let _dbModule: any = null
let _dbLoadAttempted = false

async function getDb() {
  if (_dbModule) return _dbModule
  if (_dbLoadAttempted) return null
  _dbLoadAttempted = true
  try {
    const mod = await import('@/lib/db')
    _dbModule = mod
    return _dbModule
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const sessionId = searchParams.get('session_id')

    const dbModule = await getDb()

    if (dbModule) {
      // Try to find the order by ID or session ID
      let order = null

      try {
        if (orderId) {
          order = await dbModule.withRetry((tx: any) =>
            tx.order.findUnique({ where: { id: orderId } }),
          )
        } else if (sessionId) {
          order = await dbModule.withRetry((tx: any) =>
            tx.order.findFirst({ where: { stripeCheckoutSessionId: sessionId } }),
          )
        }

        if (order && order.status === 'pending') {
          await dbModule.withRetry((tx: any) =>
            tx.order.update({
              where: { id: order.id },
              data: {
                status: 'cancelled',
                paymentStatus: 'cancelled',
                notes: 'Customer cancelled checkout',
              },
            }),
          )
        }
      } catch (dbError) {
        console.warn('[Checkout Cancel] DB operation failed:', dbError instanceof Error ? dbError.message : dbError)
      }
    }

    return NextResponse.redirect(
      new URL('/pricing?checkout=cancelled', request.url),
    )
  } catch (error) {
    console.error('[Checkout Cancel] Error:', error)
    return NextResponse.redirect(
      new URL('/pricing?checkout=cancelled', request.url),
    )
  }
}
