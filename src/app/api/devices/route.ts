import { NextRequest, NextResponse } from 'next/server'

// Device model no longer exists in the schema — return empty responses gracefully

export async function GET() {
  return NextResponse.json({ devices: [] })
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Device management is no longer supported in this version' },
    { status: 410 }
  )
}

export async function PATCH(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Device management is no longer supported in this version' },
    { status: 410 }
  )
}
