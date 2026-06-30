import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const gateways = await withRetry((d) => d.paymentAccount.findMany({ orderBy: { sortOrder: 'asc' } }))
    return NextResponse.json({ gateways })
  } catch {
    return NextResponse.json({ gateways: MOCK_GATEWAYS })
  }
}

const MOCK_GATEWAYS = [
  { id: 'gw1', label: 'Stripe Pakistan', gateway: 'stripe', type: 'payment_gateway', currency: 'PKR', isActive: true, isDefault: true, sortOrder: 0, bankName: null, accountTitle: null, accountNumber: null, iban: null, swiftCode: null, branchName: null, routingNumber: null, correspondentBank: null, correspondentSwift: null, walletProvider: null, walletAccount: null, walletAccountName: null, stripeSecretKey: 'sk_live_***', stripePublishableKey: 'pk_live_***', stripeWebhookSecret: null, stripeAccountId: null, paypalClientId: null, paypalClientSecret: null, paypalMode: null, raastId: null, lastFourDigits: null, notes: null, lastVerifiedAt: '2025-01-10T08:00:00Z', verifiedBy: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2025-01-10T08:00:00Z' },
  { id: 'gw2', label: 'HBL Corporate Account', gateway: 'bank_transfer', type: 'bank_account', currency: 'PKR', isActive: true, isDefault: false, sortOrder: 1, bankName: 'Habib Bank Limited', accountTitle: 'ApexFlow Technologies', accountNumber: '****6789', iban: 'PK36HABB****6789', swiftCode: 'HABBPKKA', branchName: 'Main Branch Lahore', routingNumber: null, correspondentBank: null, correspondentSwift: null, walletProvider: null, walletAccount: null, walletAccountName: null, stripeSecretKey: null, stripePublishableKey: null, stripeWebhookSecret: null, stripeAccountId: null, paypalClientId: null, paypalClientSecret: null, paypalMode: null, raastId: null, lastFourDigits: '6789', notes: 'Primary corporate account', lastVerifiedAt: '2025-01-05T10:00:00Z', verifiedBy: null, createdAt: '2024-02-15T00:00:00Z', updatedAt: '2025-01-05T10:00:00Z' },
  { id: 'gw3', label: 'JazzCash Business', gateway: 'jazzcash', type: 'mobile_wallet', currency: 'PKR', isActive: true, isDefault: false, sortOrder: 2, bankName: null, accountTitle: null, accountNumber: null, iban: null, swiftCode: null, branchName: null, routingNumber: null, correspondentBank: null, correspondentSwift: null, walletProvider: 'jazzcash', walletAccount: '03001234567', walletAccountName: 'ApexFlow Tech', stripeSecretKey: null, stripePublishableKey: null, stripeWebhookSecret: null, stripeAccountId: null, paypalClientId: null, paypalClientSecret: null, paypalMode: null, raastId: null, lastFourDigits: null, notes: null, lastVerifiedAt: null, verifiedBy: null, createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'gw4', label: 'EasyPaisa Business', gateway: 'easypaisa', type: 'mobile_wallet', currency: 'PKR', isActive: false, isDefault: false, sortOrder: 3, bankName: null, accountTitle: null, accountNumber: null, iban: null, swiftCode: null, branchName: null, routingNumber: null, correspondentBank: null, correspondentSwift: null, walletProvider: 'easypaisa', walletAccount: '03009876543', walletAccountName: 'ApexFlow Tech', stripeSecretKey: null, stripePublishableKey: null, stripeWebhookSecret: null, stripeAccountId: null, paypalClientId: null, paypalClientSecret: null, paypalMode: null, raastId: null, lastFourDigits: null, notes: 'Deactivated - low usage', lastVerifiedAt: null, verifiedBy: null, createdAt: '2024-07-15T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z' },
  { id: 'gw5', label: 'Raast Direct', gateway: 'raast', type: 'instant_payment', currency: 'PKR', isActive: true, isDefault: false, sortOrder: 4, bankName: null, accountTitle: null, accountNumber: null, iban: 'PK36HABB001234567890', swiftCode: null, branchName: null, routingNumber: null, correspondentBank: null, correspondentSwift: null, walletProvider: null, walletAccount: null, walletAccountName: null, stripeSecretKey: null, stripePublishableKey: null, stripeWebhookSecret: null, stripeAccountId: null, paypalClientId: null, paypalClientSecret: null, paypalMode: null, raastId: 'RAST-APEX-001', lastFourDigits: null, notes: null, lastVerifiedAt: '2025-01-01T00:00:00Z', verifiedBy: null, createdAt: '2024-09-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'gw6', label: 'PayPal International', gateway: 'paypal', type: 'payment_gateway', currency: 'PKR', isActive: false, isDefault: false, sortOrder: 5, bankName: null, accountTitle: null, accountNumber: null, iban: null, swiftCode: null, branchName: null, routingNumber: null, correspondentBank: null, correspondentSwift: null, walletProvider: null, walletAccount: null, walletAccountName: null, stripeSecretKey: null, stripePublishableKey: null, stripeWebhookSecret: null, stripeAccountId: null, paypalClientId: 'AX***w5', paypalClientSecret: 'EL***kQ', paypalMode: 'sandbox', raastId: null, lastFourDigits: null, notes: 'Sandbox mode only', lastVerifiedAt: null, verifiedBy: null, createdAt: '2024-11-01T00:00:00Z', updatedAt: '2024-11-01T00:00:00Z' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gw = await withRetry((d) => d.paymentAccount.create({ data: { label: body.label, gateway: body.gateway || 'stripe', type: body.type || 'payment_gateway', isActive: body.isActive ?? true, isDefault: body.isDefault ?? false } }))
    return NextResponse.json({ gateway: gw }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add gateway' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const gw = await withRetry((d) => d.paymentAccount.update({ where: { id: body.id }, data: { isActive: body.isActive, isDefault: body.isDefault } }))
    return NextResponse.json({ gateway: gw })
  } catch {
    return NextResponse.json({ error: 'Failed to update gateway' }, { status: 500 })
  }
}
