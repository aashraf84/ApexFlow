import { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const result = await getAdminSession(request);
    if (!result) {
      return Response.json({ user: null });
    }
    return Response.json({ user: result.user });
  } catch (error) {
    return Response.json({ user: null });
  }
}