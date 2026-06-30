import { NextRequest, NextResponse } from 'next/server'
import { getDb, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const templates = await withRetry((tx) =>
      tx.emailTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      })
    )

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('[Email Templates] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, subject, body: templateBody, category } = body

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: 'Name, subject, and body are required' }, { status: 400 })
    }

    const template = await withRetry((tx) =>
      tx.emailTemplate.create({
        data: {
          name,
          subject,
          body: templateBody,
          category: category || 'general',
        },
      })
    )

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('[Email Templates] POST error:', error)
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 })
  }
}
