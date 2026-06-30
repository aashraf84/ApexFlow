import { NextRequest } from 'next/server';
import { requireAuth, getErpConfig, errorResponse } from '@/lib/api-helpers';
import { queryErpOne } from '@/lib/erp-client';

// GET: Test connection to an ERP's remote Neon database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const config = await getErpConfig(id);
    const start = Date.now();

    const result = await queryErpOne<{ version: string }>(
      config,
      'SELECT version() as version'
    );

    const latency = Date.now() - start;

    return Response.json({
      success: !!result,
      latency,
      version: result?.version || null,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Connection failed',
      },
      { status: 502 }
    );
  }
}