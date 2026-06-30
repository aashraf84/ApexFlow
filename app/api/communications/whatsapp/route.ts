import { NextResponse } from 'next/server'

// GET /api/communications/whatsapp — return conversations
export async function GET() {
  try {
    return NextResponse.json({
      conversations: [
        { id: '1', contactName: 'Ali Khan', contactPhone: '+92 300 1234567', lastMessage: 'Hi, need help with ERP setup', lastMessageAt: new Date().toISOString(), unreadCount: 2, status: 'open' },
        { id: '2', contactName: 'Sara Ahmed', contactPhone: '+92 301 9876543', lastMessage: 'Thanks for the quick response!', lastMessageAt: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, status: 'open' },
        { id: '3', contactName: 'Usman Malik', contactPhone: '+92 312 5551234', lastMessage: 'Can we schedule a demo?', lastMessageAt: new Date(Date.now() - 86400000).toISOString(), unreadCount: 1, status: 'pending' },
      ],
      config: {
        isActive: true,
        phoneNumber: '+92 300 0000000',
        businessName: 'ApexFlow',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch WhatsApp data' }, { status: 500 })
  }
}

// POST /api/communications/whatsapp — send a WhatsApp message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, body: messageBody } = body

    if (!messageBody) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    // In production: integrate with WhatsApp Business API
    console.log('[WhatsApp] Sending:', { conversationId, bodyLength: messageBody.length })

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent',
      platformMessageId: `wa_${Date.now()}`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 })
  }
}
