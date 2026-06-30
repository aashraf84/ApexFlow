import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErpOne, executeErp } from '@/lib/erp-client';

// GET: Single OwnerClient
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
    const client = await queryErpOne(config, `SELECT * FROM "OwnerClient" WHERE id = $1`, [id]);

    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    return Response.json({ client });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT: Update an OwnerClient
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
      'companyName', 'contactPerson', 'email', 'phone', 'mobile', 'website',
      'address', 'city', 'state', 'country', 'postalCode', 'taxNTN', 'taxSTN',
      'industry', 'subDomain', 'logoUrl', 'status', 'onboardingDate', 'notes',
    ] as const;

    for (const field of updatable) {
      if (body[field] !== undefined) {
        fields.push(`"${field}" = $${paramIdx++}`);
        values.push(body[field]);
      }
    }

    if (fields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    fields.push(`"updatedAt" = $${paramIdx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    await executeErp(
      config,
      `UPDATE "OwnerClient" SET ${fields.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    const client = await queryErpOne(config, `SELECT * FROM "OwnerClient" WHERE id = $1`, [id]);

    return Response.json({ client });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE: Delete an OwnerClient
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

    await executeErp(config, `DELETE FROM "OwnerClient" WHERE id = $1`, [id]);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}