import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErp, queryErpOne, executeErp } from '@/lib/erp-client';

// GET: Single Quotation with items
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

    const [quotation, items] = await Promise.all([
      queryErpOne(config, `SELECT * FROM "Quotation" WHERE id = $1`, [id]),
      queryErp(config, `SELECT * FROM "QuotationItem" WHERE "quotationId" = $1 ORDER BY "sortOrder"`, [id]),
    ]);

    if (!quotation) {
      return Response.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return Response.json({ quotation, items });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT: Update a Quotation
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
      'clientId', 'clientName', 'clientEmail', 'quotationDate', 'validUntil',
      'subtotal', 'discountPct', 'discountAmount', 'taxPct', 'taxAmount',
      'totalAmount', 'currency', 'status', 'terms', 'notes', 'internalNotes',
      'convertedToInvoice', 'convertedInvoiceId',
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
      `UPDATE "Quotation" SET ${fields.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    const quotation = await queryErpOne(config, `SELECT * FROM "Quotation" WHERE id = $1`, [id]);

    return Response.json({ quotation });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE: Delete a Quotation and its items
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

    await executeErp(config, `DELETE FROM "QuotationItem" WHERE "quotationId" = $1`, [id]);
    await executeErp(config, `DELETE FROM "Quotation" WHERE id = $1`, [id]);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}