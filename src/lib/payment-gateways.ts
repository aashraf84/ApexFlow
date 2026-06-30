// ApexFlow Cloud — International Payment Gateway Configuration
// Supports global + regional payment methods with multi-currency

/* ─── Currency Configuration ──────────────────────────────────────── */

export interface CurrencyConfig {
  code: string
  name: string
  symbol: string
  flag: string
  exchangeRateFromPKR: number // How many units of this currency = 1 PKR
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', exchangeRateFromPKR: 1 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', exchangeRateFromPKR: 0.0036 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', exchangeRateFromPKR: 0.0033 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', exchangeRateFromPKR: 0.0028 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', exchangeRateFromPKR: 0.013 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', exchangeRateFromPKR: 0.013 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', exchangeRateFromPKR: 0.30 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', exchangeRateFromPKR: 0.005 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', exchangeRateFromPKR: 0.0057 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', exchangeRateFromPKR: 0.016 },
}

/** Convert amount from PKR to target currency */
export function convertFromPKR(amountPKR: number, targetCurrency: string): number {
  const rate = SUPPORTED_CURRENCIES[targetCurrency]?.exchangeRateFromPKR ?? 1
  return Math.round(amountPKR * rate * 100) / 100
}

/** Convert amount from source currency to PKR */
export function convertToPKR(amount: number, sourceCurrency: string): number {
  const rate = SUPPORTED_CURRENCIES[sourceCurrency]?.exchangeRateFromPKR ?? 1
  if (rate === 0) return amount
  return Math.round((amount / rate) * 100) / 100
}

/** Format amount with currency symbol */
export function formatCurrency(amount: number, currency: string): string {
  const config = SUPPORTED_CURRENCIES[currency]
  if (!config) return `${currency} ${amount.toLocaleString()}`
  return `${config.symbol}${amount.toLocaleString()}`
}

/* ─── Payment Method Configuration ──────────────────────────────────── */

export type PaymentMethodId = 'card' | 'jazzcash' | 'easypaisa' | 'paypal' | 'bank_transfer' | 'raast' | 'apple_pay' | 'google_pay'

export interface PaymentMethodConfig {
  id: PaymentMethodId
  name: string
  description: string
  icon: string           // Lucide icon name
  brandColor: string     // Hex color
  type: 'redirect' | 'manual' | 'card' | 'wallet'
  processingTime: string
  fee: string
  enabled: boolean
  regions: string[]      // ISO country codes or 'global'
  currencies: string[]   // Supported currencies
  requiresRedirect: boolean
}

export const PAYMENT_METHODS: Record<PaymentMethodId, PaymentMethodConfig> = {
  card: {
    id: 'card',
    name: 'Debit / Credit Card',
    description: 'Visa, Mastercard, AMEX — processed securely via Stripe',
    icon: 'CreditCard',
    brandColor: '#635BFF', // Stripe blue
    type: 'card',
    processingTime: 'Instant',
    fee: 'No extra fee',
    enabled: true,
    regions: ['global'],
    currencies: ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CAD', 'AUD', 'MYR'],
    requiresRedirect: true,
  },
  apple_pay: {
    id: 'apple_pay',
    name: 'Apple Pay',
    description: 'Pay with Face ID or Touch ID on Apple devices',
    icon: 'Smartphone',
    brandColor: '#000000',
    type: 'wallet',
    processingTime: 'Instant',
    fee: 'No extra fee',
    enabled: true,
    regions: ['global'],
    currencies: ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD'],
    requiresRedirect: true,
  },
  google_pay: {
    id: 'google_pay',
    name: 'Google Pay',
    description: 'Fast, secure payments with your Google Account',
    icon: 'Wallet',
    brandColor: '#4285F4',
    type: 'wallet',
    processingTime: 'Instant',
    fee: 'No extra fee',
    enabled: true,
    regions: ['global'],
    currencies: ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CAD', 'AUD'],
    requiresRedirect: true,
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    description: 'Global digital wallet — pay with your PayPal balance or linked card',
    icon: 'WalletCards',
    brandColor: '#003087',
    type: 'redirect',
    processingTime: 'Instant',
    fee: '2.9% + fixed fee',
    enabled: true,
    regions: ['global'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MYR'],
    requiresRedirect: true,
  },
  jazzcash: {
    id: 'jazzcash',
    name: 'JazzCash',
    description: 'Pakistan\'s leading mobile wallet — pay from your JazzCash account',
    icon: 'Smartphone',
    brandColor: '#E4002B',
    type: 'wallet',
    processingTime: '5-10 minutes',
    fee: 'No extra fee',
    enabled: true,
    regions: ['PK'],
    currencies: ['PKR'],
    requiresRedirect: true,
  },
  easypaisa: {
    id: 'easypaisa',
    name: 'EasyPaisa',
    description: 'Pakistan\'s largest digital payment platform — pay from your EasyPaisa account',
    icon: 'Smartphone',
    brandColor: '#00B4A0',
    type: 'wallet',
    processingTime: '5-10 minutes',
    fee: 'No extra fee',
    enabled: true,
    regions: ['PK'],
    currencies: ['PKR'],
    requiresRedirect: true,
  },
  raast: {
    id: 'raast',
    name: 'Raast',
    description: 'Pakistan\'s instant payment system — send directly from any bank account',
    icon: 'Zap',
    brandColor: '#7C3AED',
    type: 'wallet',
    processingTime: 'Instant',
    fee: 'No extra fee',
    enabled: true,
    regions: ['PK'],
    currencies: ['PKR'],
    requiresRedirect: false,
  },
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Bank Transfer / Wire',
    description: 'SWIFT, IBFT, or local bank transfer — manually verify & activate',
    icon: 'Building2',
    brandColor: '#059669',
    type: 'manual',
    processingTime: '1-2 business days',
    fee: 'Bank charges may apply',
    enabled: true,
    regions: ['global'],
    currencies: ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CAD', 'AUD', 'MYR'],
    requiresRedirect: false,
  },
}

/** Get all enabled payment methods */
export function getEnabledPaymentMethods(): PaymentMethodConfig[] {
  return Object.values(PAYMENT_METHODS).filter(m => m.enabled)
}

/** Get payment methods available for a given currency */
export function getPaymentMethodsForCurrency(currency: string): PaymentMethodConfig[] {
  return getEnabledPaymentMethods().filter(m => m.currencies.includes(currency))
}

/** Get payment method by ID */
export function getPaymentMethod(id: string): PaymentMethodConfig | undefined {
  return PAYMENT_METHODS[id as PaymentMethodId]
}

/** Validate payment method ID */
export function isValidPaymentMethod(id: string): id is PaymentMethodId {
  return id in PAYMENT_METHODS
}

/* ─── Bank Account Details (for Wire Transfer) ──────────────────────── */
// NOTE: These are PLACEHOLDER values. Real bank details should be configured
// via the Admin Panel > Payment Settings. The checkout API fetches from the
// PaymentAccount database table first, and only falls back to these if DB is empty.

export const BANK_DETAILS: Record<string, {
  bankName: string
  accountTitle: string
  accountNumber: string
  iban: string
  swiftCode: string
  branch: string
  correspondentBank?: string
  correspondentSwift?: string
}> = {
  PKR: {
    bankName: 'Not Configured',
    accountTitle: 'Configure in Admin Panel',
    accountNumber: '—',
    iban: '—',
    swiftCode: '—',
    branch: '—',
  },
  USD: {
    bankName: 'Not Configured',
    accountTitle: 'Configure in Admin Panel',
    accountNumber: '—',
    iban: '—',
    swiftCode: '—',
    branch: '—',
  },
  GBP: {
    bankName: 'Not Configured',
    accountTitle: 'Configure in Admin Panel',
    accountNumber: '—',
    iban: '—',
    swiftCode: '—',
    branch: '—',
  },
  EUR: {
    bankName: 'Not Configured',
    accountTitle: 'Configure in Admin Panel',
    accountNumber: '—',
    iban: '—',
    swiftCode: '—',
    branch: '—',
  },
  AED: {
    bankName: 'Not Configured',
    accountTitle: 'Configure in Admin Panel',
    accountNumber: '—',
    iban: '—',
    swiftCode: '—',
    branch: '—',
  },
  SAR: {
    bankName: 'Not Configured',
    accountTitle: 'Configure in Admin Panel',
    accountNumber: '—',
    iban: '—',
    swiftCode: '—',
    branch: '—',
  },
}

/** Get bank details for a currency, fallback to PKR */
export function getBankDetails(currency: string): typeof BANK_DETAILS.PKR {
  return (BANK_DETAILS as Record<string, typeof BANK_DETAILS.PKR>)[currency] ?? BANK_DETAILS.PKR
}

/** Generate a unique payment reference for bank transfers */
export function generatePaymentReference(): string {
  const prefix = 'APX'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/* ─── Sandbox Simulation ──────────────────────────────────────────────── */

/** Simulate a payment gateway response for sandbox mode */
export function simulatePaymentResponse(methodId: PaymentMethodId, amount: number, currency: string) {
  const txnId = `TXN_${methodId.toUpperCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const simulations: Record<PaymentMethodId, { redirectUrl: string | null; message: string; qrCodeData: string | null }> = {
    card: {
      redirectUrl: null,
      message: 'Card payment processed successfully via Stripe.',
      qrCodeData: null,
    },
    apple_pay: {
      redirectUrl: null,
      message: 'Apple Pay payment completed.',
      qrCodeData: null,
    },
    google_pay: {
      redirectUrl: null,
      message: 'Google Pay payment completed.',
      qrCodeData: null,
    },
    paypal: {
      redirectUrl: null,
      message: 'PayPal payment completed. Check your PayPal dashboard for details.',
      qrCodeData: null,
    },
    jazzcash: {
      redirectUrl: null,
      message: `Send ${formatCurrency(amount, currency)} to JazzCash. Configure wallet details in Admin Panel. Reference: ${txnId}`,
      qrCodeData: null,  // QR disabled until wallet is configured
    },
    easypaisa: {
      redirectUrl: null,
      message: `Send ${formatCurrency(amount, currency)} to EasyPaisa. Configure wallet details in Admin Panel. Reference: ${txnId}`,
      qrCodeData: null,
    },
    raast: {
      redirectUrl: null,
      message: `Send ${formatCurrency(amount, currency)} via Raast. Configure Raast ID in Admin Panel. Reference: ${txnId}`,
      qrCodeData: null,
    },
    bank_transfer: {
      redirectUrl: null,
      message: `Transfer ${formatCurrency(amount, currency)} to the bank account details shown. Use reference: ${txnId}`,
      qrCodeData: null,
    },
  }

  const sim = simulations[methodId]

  return {
    transactionId: txnId,
    status: 'success' as const,
    ...sim,
  }
}
