import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api-helpers'
import { registerClientInErp } from '@/lib/erp-sync'

// POST /api/admin/integrations/[id]/register-client — push a new client to the ERP
// Body: { name, email, phone?, company?, status? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, 'integrations')
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: 'name + email are required' },
        { status: 400 }
      )
    }
    const result = await registerClientInErp(id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      status: body.status,
    })
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
