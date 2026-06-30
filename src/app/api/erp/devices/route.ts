import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List DeviceRegistrations joined with SerialKey
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (tenantId) {
      conditions.push(`dr."tenantId" = $${paramIdx++}`);
      params.push(tenantId);
    }
    if (status) {
      conditions.push(`dr.status = $${paramIdx++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [devices, totalResult] = await Promise.all([
      queryErp(
        config,
        `SELECT dr.*, sk.key as "serialKey", sk.plan as "serialPlan", sk."companyName" as "serialCompanyName",
                sk."contactEmail" as "serialContactEmail", sk."validUntil" as "serialValidUntil"
         FROM "DeviceRegistration" dr
         LEFT JOIN "SerialKey" sk ON dr."serialKeyId" = sk.id
         ${whereClause}
         ORDER BY dr."registeredAt" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, pageSize, offset]
      ),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "DeviceRegistration" dr ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      devices,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Register a new device
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    if (!body.tenantId || !body.serialKeyId) {
      return Response.json({ error: 'tenantId and serialKeyId are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    // Check serial key is valid and has capacity
    const serialKey = await queryErpOne(
      config,
      `SELECT * FROM "SerialKey" WHERE id = $1`,
      [body.serialKeyId]
    );

    if (!serialKey) {
      return Response.json({ error: 'Serial key not found' }, { status: 404 });
    }

    const activatedDevices = parseInt(serialKey.activatedDevices || '0');
    const maxDevices = parseInt(serialKey.maxDevices || '0');

    if (activatedDevices >= maxDevices) {
      return Response.json(
        { error: 'Serial key has reached maximum device limit' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await executeErp(
      config,
      `INSERT INTO "DeviceRegistration" (
        id, "tenantId", "deviceId", "serialKeyId", "deviceName", "browserInfo",
        "ipAddress", "registeredAt", "lastAccessAt", status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        body.tenantId,
        body.deviceId || crypto.randomUUID(),
        body.serialKeyId,
        body.deviceName || null,
        body.browserInfo || null,
        body.ipAddress || null,
        now,
        now,
        body.status || 'active',
        now,
        now,
      ]
    );

    // Increment activated device count
    await executeErp(
      config,
      `UPDATE "SerialKey" SET "activatedDevices" = "activatedDevices" + 1, "updatedAt" = $1 WHERE id = $2`,
      [now, body.serialKeyId]
    );

    const device = await queryErpOne(
      config,
      `SELECT * FROM "DeviceRegistration" WHERE id = $1`,
      [id]
    );

    return Response.json({ device }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}