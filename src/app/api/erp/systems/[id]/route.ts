import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, errorResponse } from '@/lib/api-helpers';

// DELETE: Remove an ERP system
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const existing = await db.erpSystem.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'ERP system not found' }, { status: 404 });
    }

    await db.erpSystem.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}