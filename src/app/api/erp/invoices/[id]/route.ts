import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: Single OwnerInvoice with items
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

    const [invoice, items] = await Promise.all([
      queryErpOne(config, `SELECT * FROM "OwnerInvoice" WHERE id = $1`, [id]),
      queryErp(config, `SELECT * FROM "OwnerInvoiceItem" WHERE "invoiceId" = $1 ORDER BY "sortOrder"`, [id]),
    ]);

    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return Response.json({ invoice, items });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT: Update an OwnerInvoice
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
      'clientId', 'subscriptionId', 'invoiceDate', 'dueDate',
      'billingPeriodStart', 'billingPeriodEnd', 'subtotal', 'discountPct',
      'discountAmount', 'taxPct', 'taxAmount', 'totalAmount', 'paidAmount',
      'currency', 'status', 'paymentMethod', 'paymentRef', 'paidDate',
      'notes', 'terms',
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
      `UPDATE "OwnerInvoice" SET ${fields.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    const invoice = await queryErpOne(config, `SELECT * FROM "OwnerInvoice" WHERE id = $1`, [id]);

    return Response.json({ invoice });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE: Delete an OwnerInvoice and its items
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

    await executeErp(config, `DELETE FROM "OwnerInvoiceItem" WHERE "invoiceId" = $1`, [id]);
    await executeErp(config, `DELETE FROM "OwnerInvoice" WHERE id = $1`, [id]);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}