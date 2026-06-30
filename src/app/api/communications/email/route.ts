import { NextResponse } from 'next/server'

// GET /api/communications/email — return email templates + stats
export async function GET() {
  try {
    return NextResponse.json({
      stats: {
        emailsSent: 47,
        whatsappMessages: 128,
        smsSent: 34,
        openTickets: 15,
      },
      templates: [
        { id: '1', name: 'Welcome Email', subject: 'Welcome to ApexFlow, {{name}}!', category: 'onboarding', active: true },
        { id: '2', name: 'Invoice Notification', subject: 'Invoice #{{invoice_number}} from ApexFlow', category: 'billing', active: true },
        { id: '3', name: 'License Expiry', subject: 'Your license expires on {{expiry_date}}', category: 'billing', active: true },
      ],
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch email data' }, { status: 500 })
  }
}

// POST /api/communications/email — send an email
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, body: emailBody, templateId } = body

    if (!to || !subject) {
      return NextResponse.json({ error: 'To and subject are required' }, { status: 400 })
    }

    // In production: integrate with SMTP provider
    console.log('[Email] Sending:', { to, subject, templateId, bodyLength: emailBody?.length || 0 })

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: `msg_${Date.now()}`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
