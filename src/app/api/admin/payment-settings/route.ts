import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

const defaultSettings = [
  { key: 'sandbox_mode', value: 'true', description: 'Enable sandbox/test mode for payments', isEncrypted: false },
  { key: 'default_currency', value: 'PKR', description: 'Default currency for payment accounts', isEncrypted: false },
  { key: 'auto_verify_bank_transfer', value: 'false', description: 'Automatically verify bank transfer payments', isEncrypted: false },
  { key: 'payment_receipt_email', value: 'true', description: 'Send payment receipt emails', isEncrypted: false },
]

// GET /api/admin/payment-settings
export async function GET() {
  try {
    let settings = await db.paymentSettings.findMany({ orderBy: { key: 'asc' } })

    // Seed default settings if empty
    if (settings.length === 0) {
      for (const setting of defaultSettings) {
        try {
          await db.paymentSettings.create({ data: setting })
        } catch { /* may already exist */ }
      }
      settings = await db.paymentSettings.findMany({ orderBy: { key: 'asc' } })
    }

    // Mask encrypted values
    const maskedSettings = settings.map((s) => ({
      ...s,
      value: s.isEncrypted ? '****' + String(s.value).slice(-4) : s.value,
    }))

    return NextResponse.json({ settings: maskedSettings })
  } catch (error) {
    console.error('[PaymentSettings] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 })
  }
}

// PATCH /api/admin/payment-settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const body = await request.json()
    const updated: string[] = []

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== 'string') continue

      const existing = await db.paymentSettings.findUnique({ where: { key } })

      if (existing) {
        await db.paymentSettings.update({
          where: { key },
          data: { value },
        })
      } else {
        await db.paymentSettings.create({
          data: { key, value, isEncrypted: false },
        })
      }
      updated.push(key)
    }

    // Create audit log
    if (updated.length > 0) {
      try {
        await db.paymentAuditLog.create({
          data: {
            action: 'update',
            entity: 'payment_settings',
            changes: JSON.stringify(updated),
            performedBy: 'admin',
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          },
        })
      } catch { /* non-critical */ }
    }

    // Return updated settings
    const settings = await db.paymentSettings.findMany({ orderBy: { key: 'asc' } })
    const maskedSettings = settings.map((s) => ({
      ...s,
      value: s.isEncrypted ? '****' + String(s.value).slice(-4) : s.value,
    }))

    return NextResponse.json({ settings: maskedSettings })
  } catch (error) {
    console.error('[PaymentSettings] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 })
  }
}
