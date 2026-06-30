import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const result = await getAdminSession(request);
    if (result) {
      await db.adminSession.delete({ where: { id: result.session.id } });
    }

    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        },
      }
    );
  } catch (error) {
    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        },
      }
    );
  }
}