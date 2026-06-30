import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { parseUserAgent } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.adminUser.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 86400 * 1000); // 24 hours

    const ua = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const { browser, device } = parseUserAgent(ua);

    await db.adminSession.create({
      data: {
        userId: user.id,
        token,
        ip,
        device,
        browser,
        userAgent: ua,
        expiresAt,
      },
    });

    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const isSecure = request.headers.get('x-forwarded-proto') === 'https';

    return Response.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      {
        headers: {
          'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${isSecure ? '; Secure' : ''}`,
        },
      }
    );
  } catch (error: any) {
    console.error('[Auth Login Error]', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}