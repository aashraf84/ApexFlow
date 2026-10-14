import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// ─── Helpers ────────────────────────────────────────────────────────

/** Mask a sensitive string, showing only the last 4 characters */
function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.length <= 4) return `****${value}`
  return `****${value.slice(-4)}`
}

/** Apply masking to a payment account record for safe API responses */
function maskAccount<T extends Record<string, unknown>>(account: T): T {
  return {
    ...account,
    stripeSecretKey: maskSecret(account.stripeSecretKey as string | null),
    paypalClientSecret: maskSecret(account.paypalClientSecret as string | null),
    accountNumber: maskSecret(account.accountNumber as string | null),
  }
}

/** Check if a value looks like a masked secret (****xxxx) */
function isMaskedValue(value: string | null | undefined): boolean {
  if (!value) return false
  return value.startsWith('****')
}

// ─── GET /api/admin/payment-accounts/[id] ───────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(_request, 'finance')
    if (!auth.ok) return auth.response
    const { id } = await params

    const account = await db.paymentAccount.findUnique({
      where: { id },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Payment account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ account: maskAccount(account) })
  } catch (error) {
    console.error('[PaymentAccounts] GET [id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment account' },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/admin/payment-accounts/[id] ─────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const { id } = await params
    const body = await request.json()

    // Verify the account exists
    const existing = await db.paymentAccount.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Payment account not found' },
        { status: 404 }
      )
    }

    // If setting isDefault to true, unset others with same currency
    const targetCurrency = body.currency ?? existing.currency
    if (body.isDefault === true) {
      await db.paymentAccount.updateMany({
        where: { currency: targetCurrency, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }

    // Build update data, skipping masked sensitive fields
    const updateData: Record<string, unknown> = {}

    const sensitiveFields = ['stripeSecretKey', 'paypalClientSecret', 'accountNumber'] as const

    for (const [key, value] of Object.entries(body)) {
      // Skip internal fields
      if (key === 'performedBy') continue

      // If a sensitive field is masked (e.g. "****abcd"), don't update it
      if (sensitiveFields.includes(key as (typeof sensitiveFields)[number])) {
        if (typeof value === 'string' && isMaskedValue(value)) {
          continue // Skip — user sent back the masked value
        }
      }

      updateData[key] = value
    }

    const updated = await db.paymentAccount.update({
      where: { id },
      data: updateData,
    })

    // Audit log
    await db.paymentAuditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'PaymentAccount',
        entityId: id,
        changes: JSON.stringify(updateData),
        performedBy: body.performedBy ?? null,
        ip: request.headers.get('x-forwarded-for') ?? null,
      },
    })

    return NextResponse.json({ account: maskAccount(updated) })
  } catch (error) {
    console.error('[PaymentAccounts] PATCH [id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment account' },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/admin/payment-accounts/[id] ────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const { id } = await params

    // Verify the account exists
    const existing = await db.paymentAccount.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Payment account not found' },
        { status: 404 }
      )
    }

    await db.paymentAccount.delete({ where: { id } })

    // Audit log
    await db.paymentAuditLog.create({
      data: {
        action: 'DELETE',
        entity: 'PaymentAccount',
        entityId: id,
        changes: JSON.stringify({ label: existing.label, gateway: existing.gateway, type: existing.type, currency: existing.currency }),
        performedBy: null,
        ip: request.headers.get('x-forwarded-for') ?? null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PaymentAccounts] DELETE [id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment account' },
      { status: 500 }
    )
  }
}
