import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErpOne, executeErp } from '@/lib/erp-client';

// GET: Single User
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const user = await queryErpOne(config, `SELECT * FROM "User" WHERE id = $1`, [id]);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user: { ...user, password: undefined } });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT: Update a User
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    const fields: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    const updatable = [
      'username', 'fullName', 'email', 'phone', 'role', 'avatar', 'isActive',
    ] as const;

    for (const field of updatable) {
      if (body[field] !== undefined) {
        fields.push(`"${field}" = $${paramIdx++}`);
        values.push(body[field]);
      }
    }

    // Handle password update separately (already hashed from client)
    if (body.password) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      fields.push(`"password" = $${paramIdx++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    fields.push(`"updatedAt" = $${paramIdx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    await executeErp(
      config,
      `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    const user = await queryErpOne(config, `SELECT * FROM "User" WHERE id = $1`, [id]);

    return Response.json({ user: user ? { ...user, password: undefined } : null });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE: Delete a User
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);

    await executeErp(config, `DELETE FROM "User" WHERE id = $1`, [id]);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}