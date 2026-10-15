import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/api-helpers'

// GET /api/admin/payment-accounts?type=bank_account
export async function GET(request: NextRequest) {
  console.log('[PaymentAccounts] GET request received')
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    console.log('[PaymentAccounts] Type filter:', type)

    const where = type ? { type } : {}
    const accounts = await db.paymentAccount.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    console.log('[PaymentAccounts] Found accounts:', accounts.length)
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('[PaymentAccounts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment accounts' }, { status: 500 })
  }
}

// POST /api/admin/payment-accounts
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const body = await request.json()

    if (!body.label?.trim()) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 })
    }

    const type = body.type || 'bank_account'
    const gateway = body.gateway || (type === 'bank_account' ? 'bank_transfer' : type === 'mobile_wallet' ? body.walletProvider || 'jazzcash' : type)

    // If setting as default, unset other defaults of same type
    if (body.isDefault) {
      await db.paymentAccount.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false },
      })
    }

    const data: Record<string, unknown> = {
      label: body.label.trim(),
      type,
      gateway,
      currency: body.currency || 'PKR',
      isActive: body.isActive !== false,
      isDefault: body.isDefault === true,
      sortOrder: body.sortOrder || 0,
    }

    if (type === 'bank_account') {
      if (!body.bankName?.trim()) return NextResponse.json({ error: 'Bank name is required' }, { status: 400 })
      if (!body.accountTitle?.trim()) return NextResponse.json({ error: 'Account title is required' }, { status: 400 })
      if (!body.accountNumber?.trim()) return NextResponse.json({ error: 'Account number is required' }, { status: 400 })

      data.bankName = body.bankName.trim()
      data.accountTitle = body.accountTitle.trim()
      data.accountNumber = body.accountNumber.trim()
      data.iban = body.iban?.trim() || null
      data.swiftCode = body.swiftCode?.trim() || null
      data.branchName = body.branchName?.trim() || null
      data.correspondentBank = body.correspondentBank?.trim() || null
      data.correspondentSwift = body.correspondentSwift?.trim() || null
      data.routingNumber = body.routingNumber?.trim() || null
      data.lastFourDigits = body.accountNumber.trim().slice(-4)
      data.notes = body.notes?.trim() || null
    }

    if (type === 'mobile_wallet') {
      if (!body.walletAccount?.trim()) return NextResponse.json({ error: 'Wallet account number is required' }, { status: 400 })

      data.walletProvider = body.walletProvider || 'jazzcash'
      data.walletAccount = body.walletAccount.trim()
      data.walletAccountName = body.walletAccountName?.trim() || null
      data.raastId = body.raastId?.trim() || null
      data.lastFourDigits = body.walletAccount.trim().slice(-4)
      data.notes = body.notes?.trim() || null
    }

    if (type === 'gateway') {
      if (gateway === 'stripe') {
        data.stripePublishableKey = body.stripePublishableKey?.trim() || null
        data.stripeSecretKey = body.stripeSecretKey?.trim() || null
        data.stripeWebhookSecret = body.stripeWebhookSecret?.trim() || null
        data.stripeAccountId = body.stripeAccountId?.trim() || null
      }
      if (gateway === 'paypal') {
        data.paypalClientId = body.paypalClientId?.trim() || null
        data.paypalClientSecret = body.paypalClientSecret?.trim() || null
        data.paypalMode = body.paypalMode || 'sandbox'
      }
      data.notes = body.notes?.trim() || null
    }

    const account = await db.paymentAccount.create({ data })

    // Create audit log
    try {
      await db.paymentAuditLog.create({
        data: {
          action: 'create',
          entity: type,
          entityId: account.id,
          changes: JSON.stringify({ label: body.label, type, gateway }),
          performedBy: 'admin',
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('[PaymentAccounts] POST error:', error)
    return NextResponse.json({ error: 'Failed to create payment account' }, { status: 500 })
  }
}

// PATCH /api/admin/payment-accounts?id=xxx
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const existing = await db.paymentAccount.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const body = await request.json()

    // If setting as default, unset other defaults of same type
    if (body.isDefault) {
      await db.paymentAccount.updateMany({
        where: { type: existing.type, isDefault: true },
        data: { isDefault: false },
      })
    }

    const data: Record<string, unknown> = {}

    // Common fields
    if (body.label !== undefined) data.label = body.label.trim()
    if (body.currency !== undefined) data.currency = body.currency
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.isDefault !== undefined) data.isDefault = body.isDefault
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null
    if (body.gateway !== undefined) data.gateway = body.gateway

    // Bank account fields
    if (existing.type === 'bank_account') {
      if (body.bankName !== undefined) data.bankName = body.bankName.trim()
      if (body.accountTitle !== undefined) data.accountTitle = body.accountTitle.trim()
      if (body.accountNumber !== undefined && !body.accountNumber.startsWith('****')) {
        data.accountNumber = body.accountNumber.trim()
        data.lastFourDigits = body.accountNumber.trim().slice(-4)
      }
      if (body.iban !== undefined && !body.iban.startsWith('****')) data.iban = body.iban?.trim() || null
      if (body.swiftCode !== undefined) data.swiftCode = body.swiftCode?.trim() || null
      if (body.branchName !== undefined) data.branchName = body.branchName?.trim() || null
      if (body.routingNumber !== undefined) data.routingNumber = body.routingNumber?.trim() || null
      if (body.correspondentBank !== undefined) data.correspondentBank = body.correspondentBank?.trim() || null
      if (body.correspondentSwift !== undefined) data.correspondentSwift = body.correspondentSwift?.trim() || null
    }

    // Wallet fields
    if (existing.type === 'mobile_wallet') {
      if (body.walletProvider !== undefined) data.walletProvider = body.walletProvider
      if (body.walletAccount !== undefined && !body.walletAccount.startsWith('****')) {
        data.walletAccount = body.walletAccount.trim()
        data.lastFourDigits = body.walletAccount.trim().slice(-4)
      }
      if (body.walletAccountName !== undefined) data.walletAccountName = body.walletAccountName?.trim() || null
      if (body.raastId !== undefined) data.raastId = body.raastId?.trim() || null
    }

    // Gateway fields
    if (existing.type === 'gateway') {
      if (body.stripePublishableKey !== undefined) data.stripePublishableKey = body.stripePublishableKey?.trim() || null
      if (body.stripeSecretKey !== undefined && !body.stripeSecretKey.startsWith('****')) {
        data.stripeSecretKey = body.stripeSecretKey?.trim() || null
      }
      if (body.stripeWebhookSecret !== undefined && !body.stripeWebhookSecret.startsWith('****')) {
        data.stripeWebhookSecret = body.stripeWebhookSecret?.trim() || null
      }
      if (body.stripeAccountId !== undefined) data.stripeAccountId = body.stripeAccountId?.trim() || null
      if (body.paypalClientId !== undefined) data.paypalClientId = body.paypalClientId?.trim() || null
      if (body.paypalClientSecret !== undefined && !body.paypalClientSecret.startsWith('****')) {
        data.paypalClientSecret = body.paypalClientSecret?.trim() || null
      }
      if (body.paypalMode !== undefined) data.paypalMode = body.paypalMode
    }

    if (Object.keys(data).length > 0) {
      await db.paymentAccount.update({
        where: { id },
        data,
      })
    }

    // Create audit log
    try {
      await db.paymentAuditLog.create({
        data: {
          action: 'update',
          entity: existing.type,
          entityId: existing.id,
          changes: JSON.stringify(Object.keys(data)),
          performedBy: 'admin',
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        },
      })
    } catch { /* non-critical */ }

    const updated = await db.paymentAccount.findUnique({ where: { id } })
    return NextResponse.json({ account: updated || existing })
  } catch (error) {
    console.error('[PaymentAccounts] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update payment account' }, { status: 500 })
  }
}

// DELETE /api/admin/payment-accounts?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'finance')
    if (!auth.ok) return auth.response
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const existing = await db.paymentAccount.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await db.paymentAccount.delete({ where: { id } })

    // Create audit log
    try {
      await db.paymentAuditLog.create({
        data: {
          action: 'delete',
          entity: existing.type,
          entityId: existing.id,
          changes: JSON.stringify({ label: existing.label }),
          performedBy: 'admin',
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PaymentAccounts] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete payment account' }, { status: 500 })
  }
}
