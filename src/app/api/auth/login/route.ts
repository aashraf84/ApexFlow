import { NextRequest, NextResponse } from 'next/server'
import { withRetry, getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email?.toLowerCase().trim()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    console.log(`[AUTH] Login attempt for: ${email}`)

    // Find admin user — try the given email first, then common domain aliases
    const emailAliases = [email]
    if (email.endsWith('@apexflow.cloud')) {
      emailAliases.push(email.replace('@apexflow.cloud', '@apexflow.com'))
    }
    if (email.endsWith('@apexflow.com')) {
      emailAliases.push(email.replace('@apexflow.com', '@apexflow.cloud'))
    }

    let user: {
      id: string
      email: string
      name: string
      password: string
      role: string
      avatar: string | null
      isActive: boolean
    } | null = null

    let lastDbError: string | null = null

    // Try each email alias until we find a user (withRetry handles Neon cold starts)
    for (const tryEmail of emailAliases) {
      try {
        user = await withRetry((tx) =>
          tx.adminUser.findUnique({
            where: { email: tryEmail },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              avatar: true,
              isActive: true,
            },
          }),
          5,
        )
        if (user) break
      } catch (dbError) {
        const msg = dbError instanceof Error ? dbError.message : String(dbError)
        console.error('[AUTH] DB query failed for', tryEmail, ':', msg)
        lastDbError = msg
      }
    }

    // If DB errors occurred and no user was found, report the real error
    if (!user && lastDbError) {
      console.error(`[AUTH] All DB queries failed for: ${email}`)
      return NextResponse.json(
        { error: `Database connection failed: ${lastDbError}`, retryable: true },
        { status: 503 },
      )
    }

    // DB query succeeded but user not found — genuinely wrong credentials
    if (!user) {
      console.log(`[AUTH] No admin user found for: ${email}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      )
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(`[AUTH] Account disabled for: ${email}`)
      return NextResponse.json(
        { error: 'Account is disabled. Contact your administrator.' },
        { status: 401 },
      )
    }

    // Verify password
    let isValid = false
    try {
      isValid = await bcrypt.compare(password, user.password)
    } catch {
      try {
        isValid = bcrypt.compareSync(password, user.password)
      } catch {
        // ignore
      }
    }

    if (!isValid) {
      console.log(`[AUTH] Invalid password for: ${email}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      )
    }

    // Create session token
    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Store session in database
    try {
      await withRetry((tx) =>
        tx.adminSession.create({
          data: {
            userId: user!.id,
            token,
            ip: req.headers.get('x-forwarded-for') || null,
            userAgent: req.headers.get('user-agent') || null,
            device: req.headers.get('user-agent') || null,
            expiresAt,
          },
        }),
      )
    } catch (sessionError) {
      const msg = sessionError instanceof Error ? sessionError.message : String(sessionError)
      console.error('[AUTH] Failed to create session:', msg)
      return NextResponse.json(
        { error: `Session creation failed: ${msg}`, retryable: true },
        { status: 503 },
      )
    }

    // Update last login (fire and forget)
    try {
      getDb().adminUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      }).catch(() => {})
    } catch {
      // ignore
    }

    console.log(`[AUTH] Login successful for: ${email}`)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    })

    // Determine if we're behind HTTPS
    const isHttps = req.headers.get('x-forwarded-proto') === 'https'
      || req.nextUrl.protocol === 'https:'

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[AUTH] Login error:', msg)
    return NextResponse.json(
      { error: `Server error: ${msg}`, retryable: true },
      { status: 503 },
    )
  }
}