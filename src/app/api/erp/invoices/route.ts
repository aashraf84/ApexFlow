import { NextRequest } from 'next/server';
import pg from 'pg';
import { requireAuth, getErpConfig, parsePagination, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: List OwnerInvoices
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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

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
    if (dateFrom) {
      conditions.push(`"invoiceDate" >= $${paramIdx++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`"invoiceDate" <= $${paramIdx++}`);
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [invoices, totalResult] = await Promise.all([
      queryErp(config, `SELECT * FROM "OwnerInvoice" ${whereClause} ORDER BY "invoiceDate" DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [
        ...params,
        pageSize,
        offset,
      ]),
      queryErpOne<{ count: string }>(
        config,
        `SELECT COUNT(*) as count FROM "OwnerInvoice" ${whereClause}`,
        params
      ),
    ]);

    const total = parseInt(totalResult?.count || '0');

    return Response.json({
      invoices,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create OwnerInvoice + OwnerInvoiceItems (transactional)
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const erpId = searchParams.get('erpId');
    if (!erpId) return Response.json({ error: 'erpId is required' }, { status: 400 });

    const config = await getErpConfig(erpId);
    const body = await request.json();
    const { items, ...invoiceData } = body;

    if (!invoiceData.clientId) {
      return Response.json({ error: 'clientId is required' }, { status: 400 });
    }

    const invoiceId = crypto.randomUUID();

    // Generate invoice number
    const countResult = await queryErpOne<{ count: string }>(
      config,
      `SELECT COUNT(*) as count FROM "OwnerInvoice"`
    );
    const count = parseInt(countResult?.count || '0') + 1;
    const invoiceNo = `INV-${String(count).padStart(5, '0')}`;

    // Calculate totals from items if not provided
    let subtotal = invoiceData.subtotal || 0;
    if (!invoiceData.subtotal && items) {
      subtotal = items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unitPrice - (item.discountAmount || 0)),
        0
      );
    }

    const discountPct = invoiceData.discountPct || 0;
    const discountAmount = invoiceData.discountAmount || (subtotal * discountPct) / 100;
    const taxPct = invoiceData.taxPct || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = invoiceData.taxAmount || (afterDiscount * taxPct) / 100;
    const totalAmount = invoiceData.totalAmount || (afterDiscount + taxAmount);

    // Get a client from the pool to run a transaction
    const pool = new pg.Pool({
      connectionString: `postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?sslmode=${config.sslMode}`,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO "OwnerInvoice" (
          id, "invoiceNo", "clientId", "subscriptionId", "invoiceDate", "dueDate",
          "billingPeriodStart", "billingPeriodEnd", subtotal, "discountPct", "discountAmount",
          "taxPct", "taxAmount", "totalAmount", "paidAmount", currency, status,
          "paymentMethod", "paymentRef", "paidDate", notes, terms, "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
        [
          invoiceId,
          invoiceNo,
          invoiceData.clientId,
          invoiceData.subscriptionId || null,
          invoiceData.invoiceDate || new Date().toISOString(),
          invoiceData.dueDate || null,
          invoiceData.billingPeriodStart || null,
          invoiceData.billingPeriodEnd || null,
          subtotal,
          discountPct,
          discountAmount,
          taxPct,
          taxAmount,
          totalAmount,
          invoiceData.paidAmount || 0,
          invoiceData.currency || 'PKR',
          invoiceData.status || 'draft',
          invoiceData.paymentMethod || null,
          invoiceData.paymentRef || null,
          invoiceData.paidDate || null,
          invoiceData.notes || null,
          invoiceData.terms || null,
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

          await client.query(
            `INSERT INTO "OwnerInvoiceItem" (
              id, "invoiceId", description, quantity, "unitPrice", "discountPct", "discountAmount",
              "taxPct", "taxAmount", "totalAmount", "sortOrder", "createdAt", "updatedAt"
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [
              itemId,
              invoiceId,
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

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
      await pool.end();
    }

    const invoice = await queryErpOne(
      config,
      `SELECT * FROM "OwnerInvoice" WHERE id = $1`,
      [invoiceId]
    );
    const invoiceItems = await queryErp(
      config,
      `SELECT * FROM "OwnerInvoiceItem" WHERE "invoiceId" = $1 ORDER BY "sortOrder"`,
      [invoiceId]
    );

    return Response.json({ invoice, items: invoiceItems }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}