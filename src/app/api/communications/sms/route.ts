import { NextResponse } from 'next/server'

// GET /api/communications/sms — return SMS history
export async function GET() {
  try {
    return NextResponse.json({
      history: [
        { id: '1', to: '+92 300 1234567', body: 'Your order #1042 has been confirmed.', status: 'delivered', sentAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', to: '+92 301 9876543', body: 'Payment of PKR 15,000 received.', status: 'delivered', sentAt: new Date(Date.now() - 10800000).toISOString() },
        { id: '3', to: '+92 312 5551234', body: 'Your license expires in 3 days.', status: 'sent', sentAt: new Date(Date.now() - 18000000).toISOString() },
      ],
      provider: { name: 'Twilio', isActive: true },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch SMS history' }, { status: 500 })
  }
}

// POST /api/communications/sms — send an SMS
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, body: smsBody, templateId } = body

    if (!to || !smsBody) {
      return NextResponse.json({ error: 'To and body are required' }, { status: 400 })
    }

    if (smsBody.length > 160) {
      return NextResponse.json({ error: 'Message exceeds 160 character limit' }, { status: 400 })
    }

    // In production: integrate with SMS provider (Twilio, Vonage, etc.)
    console.log('[SMS] Sending:', { to, templateId, bodyLength: smsBody.length })

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      providerId: `sms_${Date.now()}`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
