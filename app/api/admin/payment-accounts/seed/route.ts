import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── POST /api/admin/payment-accounts/seed ──────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Check if payment accounts already exist
    const existingCount = await db.paymentAccount.count()

    if (existingCount > 0) {
      return NextResponse.json(
        { error: 'Payment accounts already exist. Seed is only for initial setup.' },
        { status: 409 }
      )
    }

    // ── Seed Default Payment Accounts ──────────────────────────────

    const accounts = await Promise.all([
      // 1. Bank Alfalah PKR
      db.paymentAccount.create({
        data: {
          label: 'Bank Alfalah PKR (needs configuration)',
          gateway: 'bank_transfer',
          type: 'bank_account',
          currency: 'PKR',
          isDefault: false,
          isActive: false,  // Not active until properly configured
          sortOrder: 1,
          bankName: '',
          accountTitle: '',
          accountNumber: '',
          iban: '',
          swiftCode: '',
          branchName: '',
          notes: 'Template account — update with real bank details and set active',
        },
      }),

      // 2. Bank Alfalah USD
      db.paymentAccount.create({
        data: {
          label: 'Bank Alfalah USD (needs configuration)',
          gateway: 'bank_transfer',
          type: 'bank_account',
          currency: 'USD',
          isDefault: false,
          isActive: false,
          sortOrder: 2,
          bankName: '',
          accountTitle: '',
          accountNumber: '',
          iban: '',
          swiftCode: '',
          branchName: '',
          notes: 'Template account — update with real bank details and set active',
        },
      }),

      // 3. JazzCash Wallet
      db.paymentAccount.create({
        data: {
          label: 'JazzCash Wallet (needs configuration)',
          gateway: 'jazzcash',
          type: 'mobile_wallet',
          currency: 'PKR',
          isDefault: false,
          isActive: false,
          sortOrder: 3,
          walletProvider: 'jazzcash',
          walletAccount: '',
          walletAccountName: '',
          notes: 'Template account — update with real wallet details and set active',
        },
      }),

      // 4. EasyPaisa Wallet
      db.paymentAccount.create({
        data: {
          label: 'EasyPaisa Wallet (needs configuration)',
          gateway: 'easypaisa',
          type: 'mobile_wallet',
          currency: 'PKR',
          isDefault: false,
          isActive: false,
          sortOrder: 4,
          walletProvider: 'easypaisa',
          walletAccount: '',
          walletAccountName: '',
          notes: 'Template account — update with real wallet details and set active',
        },
      }),

      // 5. Raast ID
      db.paymentAccount.create({
        data: {
          label: 'Raast ID (needs configuration)',
          gateway: 'raast',
          type: 'mobile_wallet',
          currency: 'PKR',
          isDefault: false,
          isActive: false,
          sortOrder: 5,
          walletProvider: 'raast',
          raastId: '',
          notes: 'Template account — update with real Raast ID and set active',
        },
      }),
    ])

    // ── Seed Default Payment Settings ──────────────────────────────

    const defaultSettings = [
      {
        key: 'sandbox_mode',
        value: 'true',
        description: 'Enable sandbox/test mode for all payment gateways',
        isEncrypted: false,
      },
      {
        key: 'default_currency',
        value: 'PKR',
        description: 'Default currency for new orders',
        isEncrypted: false,
      },
      {
        key: 'auto_verify_bank_transfer',
        value: 'false',
        description: 'Automatically verify bank transfer payments',
        isEncrypted: false,
      },
      {
        key: 'payment_receipt_email',
        value: 'true',
        description: 'Send payment receipt emails to customers',
        isEncrypted: false,
      },
    ]

    const settings = await Promise.all(
      defaultSettings.map((setting) =>
        db.paymentSettings.create({
          data: {
            key: setting.key,
            value: setting.value,
            description: setting.description,
            isEncrypted: setting.isEncrypted,
          },
        })
      )
    )

    // ── Audit Log ──────────────────────────────────────────────────

    await db.paymentAuditLog.create({
      data: {
        action: 'SEED',
        entity: 'PaymentAccount',
        changes: JSON.stringify({
          accountsCreated: accounts.length,
          settingsCreated: settings.length,
        }),
        performedBy: null,
        ip: request.headers.get('x-forwarded-for') ?? null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: `Seeded ${accounts.length} payment accounts and ${settings.length} payment settings`,
        accounts: accounts.map((a) => ({ id: a.id, label: a.label, currency: a.currency })),
        settings: settings.map((s) => ({ id: s.id, key: s.key })),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[PaymentAccounts] SEED error:', error)
    return NextResponse.json(
      { error: 'Failed to seed payment accounts and settings' },
      { status: 500 }
    )
  }
}
