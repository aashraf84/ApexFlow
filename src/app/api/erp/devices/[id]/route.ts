import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErpOne, executeErp } from '@/lib/erp-client';

// GET: Single DeviceRegistration
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
    const device = await queryErpOne(config, `SELECT * FROM "DeviceRegistration" WHERE id = $1`, [id]);

    if (!device) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    return Response.json({ device });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT: Update a DeviceRegistration
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

    const updatable = ['deviceName', 'browserInfo', 'ipAddress', 'status', 'lastAccessAt'] as const;

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
      `UPDATE "DeviceRegistration" SET ${fields.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    const device = await queryErpOne(config, `SELECT * FROM "DeviceRegistration" WHERE id = $1`, [id]);

    return Response.json({ device });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE: Delete a DeviceRegistration
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

    // Get the serial key ID before deleting
    const device = await queryErpOne<{ serialKeyId: string }>(
      config,
      `SELECT "serialKeyId" FROM "DeviceRegistration" WHERE id = $1`,
      [id]
    );

    await executeErp(config, `DELETE FROM "DeviceRegistration" WHERE id = $1`, [id]);

    // Decrement activated device count
    if (device?.serialKeyId) {
      await executeErp(
        config,
        `UPDATE "SerialKey" SET "activatedDevices" = GREATEST("activatedDevices" - 1, 0), "updatedAt" = $1 WHERE id = $2`,
        [new Date().toISOString(), device.serialKeyId]
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}