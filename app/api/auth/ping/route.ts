import { NextResponse } from 'next/server'
import { warmup } from '@/lib/db'

// Lightweight endpoint to warm up the database connection
// Called when the login page loads to avoid cold-start timeouts on login
export async function GET() {
  const ok = await warmup()
  return NextResponse.json({ ok })
}
