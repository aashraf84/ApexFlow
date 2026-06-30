import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, parsePagination, buildSearchClause, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List OwnerClient records with pagination and search
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (search) {
      const { clause, nextParamIndex } = buildSearchClause(
        ['"companyName"', '"email"', '"phone"'],
        search,
        params,
        paramIdx
      );
      conditions.push(`(${clause})`);
      paramIdx = nextParamIndex;
    }

    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [clients, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "OwnerClient" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "OwnerClient" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      clients,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create a new OwnerClient
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();

    const id = crypto.randomUUID();

    // Generate company code
    const countResult = await queryErpOne<{ count: string }>(
      config,
      `SELECT COUNT(*) as count FROM "OwnerClient"`
    );
    const count = parseInt(countResult?.count || '0') + 1;
    const companyCode = `CLT-${String(count).padStart(3, '0')}`;

    await executeErp(
      config,
      `INSERT INTO "OwnerClient" (
        id, "companyCode", "companyName", "contactPerson", email, phone, mobile,
        website, address, city, state, country, "postalCode", "taxNTN", "taxSTN",
        industry, "subDomain", "logoUrl", status, "onboardingDate", notes, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      )`,
      [
        id,
        companyCode,
        body.companyName,
        body.contactPerson || null,
        body.email || null,
        body.phone || null,
        body.mobile || null,
        body.website || null,
        body.address || null,
        body.city || null,
        body.state || null,
        body.country || null,
        body.postalCode || null,
        body.taxNTN || null,
        body.taxSTN || null,
        body.industry || null,
        body.subDomain || null,
        body.logoUrl || null,
        body.status || 'prospect',
        body.onboardingDate || null,
        body.notes || null,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );

    // If status is active, create a Tenant record
    if (body.status === 'active') {
      const tenantId = crypto.randomUUID();
      await executeErp(
        config,
        `INSERT INTO "Tenant" (
          id, "companyCode", "companyName", "subDomain", "logoUrl", status, "ownerClientId", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          tenantId,
          companyCode,
          body.companyName,
          body.subDomain || null,
          body.logoUrl || null,
          'active',
          id,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }

    const client = await queryErpOne(config, `SELECT * FROM "OwnerClient" WHERE id = $1`, [id]);

    return Response.json({ client }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}