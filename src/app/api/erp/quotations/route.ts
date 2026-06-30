import { NextRequest } from 'next/server';
import pg from 'pg';
import { requireAuth, getErpConfig, parsePagination, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List Quotations
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const { page, pageSize, offset } = parsePagination(searchParams);

    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const params: any[] = [];
    let paramIdx = 1;
    const conditions: string[] = [];

    if (status) {
      conditions.push(`"status" = $${paramIdx++}`);
      params.push(status);
    }
    if (clientId) {
      conditions.push(`"clientId" = $${paramIdx++}`);
      params.push(clientId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [quotations, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "Quotation" ${whereClause} ORDER BY "quotationDate" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "Quotation" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      quotations,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create Quotation + QuotationItems
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();
    const { items, ...quotationData } = body;

    const id = crypto.randomUUID();

    // Generate quotation number
    const countResult = await queryErpOne<{ count: string }>(
      config,
      `SELECT COUNT(*) as count FROM "Quotation"`
    );
    const count = parseInt(countResult?.count || '0') + 1;
    const quotationNo = `QUO-${String(count).padStart(5, '0')}`;

    // Calculate totals
    let subtotal = quotationData.subtotal || 0;
    if (!quotationData.subtotal && items) {
      subtotal = items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unitPrice - (item.discountAmount || 0)),
        0
      );
    }

    const discountPct = quotationData.discountPct || 0;
    const discountAmount = quotationData.discountAmount || (subtotal * discountPct) / 100;
    const taxPct = quotationData.taxPct || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = quotationData.taxAmount || (afterDiscount * taxPct) / 100;
    const totalAmount = quotationData.totalAmount || (afterDiscount + taxAmount);

    const pgPool = new pg.Pool({
      connectionString: `postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?sslmode=${config.sslMode}`,
      ssl: { rejectUnauthorized: false },
    });

    const txClient = await pgPool.connect();
    try {
      await txClient.query('BEGIN');

      await txClient.query(
        `INSERT INTO "Quotation" (
          id, "quotationNo", "clientId", "clientName", "clientEmail", "quotationDate",
          "validUntil", subtotal, "discountPct", "discountAmount", "taxPct", "taxAmount",
          "totalAmount", currency, status, terms, notes, "internalNotes",
          "convertedToInvoice", "convertedInvoiceId", "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
        [
          id,
          quotationNo,
          quotationData.clientId || null,
          quotationData.clientName || null,
          quotationData.clientEmail || null,
          quotationData.quotationDate || new Date().toISOString(),
          quotationData.validUntil || null,
          subtotal,
          discountPct,
          discountAmount,
          taxPct,
          taxAmount,
          totalAmount,
          quotationData.currency || 'PKR',
          quotationData.status || 'draft',
          quotationData.terms || null,
          quotationData.notes || null,
          quotationData.internalNotes || null,
          false,
          null,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );

      if (items && Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemId = crypto.randomUUID();
          const itemTotal =
            item.quantity * item.unitPrice -
            (item.discountAmount || 0) +
            (item.taxAmount || 0);

          await txClient.query(
            `INSERT INTO "QuotationItem" (
              id, "quotationId", description, quantity, "unitPrice", "discountPct",
              "discountAmount", "taxPct", "taxAmount", "totalAmount", "sortOrder", "createdAt", "updatedAt"
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [
              itemId,
              id,
              item.description,
              item.quantity,
              item.unitPrice,
              item.discountPct || 0,
              item.discountAmount || 0,
              item.taxPct || 0,
              item.taxAmount || 0,
              item.totalAmount || itemTotal,
              i + 1,
              new Date().toISOString(),
              new Date().toISOString(),
            ]
          );
        }
      }

      await txClient.query('COMMIT');
    } catch (err) {
      await txClient.query('ROLLBACK');
      throw err;
    } finally {
      txClient.release();
      await pgPool.end();
    }

    const quotation = await queryErpOne(config, `SELECT * FROM "Quotation" WHERE id = $1`, [id]);
    const quotationItems = await queryErp(
      config,
      `SELECT * FROM "QuotationItem" WHERE "quotationId" = $1 ORDER BY "sortOrder"`,
      [id]
    );

    return Response.json({ quotation, items: quotationItems }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}