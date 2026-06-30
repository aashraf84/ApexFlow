import { NextResponse } from 'next/server'

// GET /api/communications/notifications — return notifications
export async function GET() {
  try {
    return NextResponse.json({
      notifications: [
        { id: '1', type: 'payment', title: 'Payment Received', body: 'PKR 150,000 from TechCorp Pakistan', time: new Date(Date.now() - 300000).toISOString(), read: false },
        { id: '2', type: 'ticket', title: 'New Support Ticket', body: 'Ticket #783 created by Ali Khan', time: new Date(Date.now() - 1800000).toISOString(), read: false },
        { id: '3', type: 'subscription', title: 'Subscription Expiring', body: 'Alpha Industries expires in 5 days', time: new Date(Date.now() - 7200000).toISOString(), read: true },
      ],
      unreadCount: 2,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// PATCH /api/communications/notifications — mark as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      console.log('[Notifications] Marked all as read')
    } else if (id) {
      console.log('[Notifications] Marked as read:', id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
