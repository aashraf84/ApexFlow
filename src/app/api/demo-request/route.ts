import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, name, company } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      )
    }

    console.log('Demo request received:', {
      email,
      phone: phone || 'N/A',
      name: name || 'N/A',
      company: company || 'N/A',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Demo request received successfully. Our team will contact you within 24 hours.',
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
