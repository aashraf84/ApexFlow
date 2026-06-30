export interface IntegrationConnector {
  id: string
  name: string
  slug: string
  website: string | null
  connected: boolean
  latency: number | null
  clientCount: number | null
  category: string | null
  connectionError: string | null
  icon: string | null
  color: string | null
  type: string | null
}

export interface IntegrationSummary {
  total: number
  connected: number
  disconnected: number
}

export interface DatabaseStatus {
  connected: boolean
  latency: number
  database: {
    type: string
    size?: string
    tables: Record<string, number>
  }
  erpSystems: Array<{
    id: string
    name: string
    slug: string
    status: string
    moduleCount: number
    isActive: boolean
  }>
  timestamp: string
}

export interface PaymentAccount {
  id: string
  label: string
  gateway: string
  type: string
  currency: string
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  bankName: string | null
  accountTitle: string | null
  accountNumber: string | null
  iban: string | null
  swiftCode: string | null
  branchName: string | null
  routingNumber: string | null
  correspondentBank: string | null
  correspondentSwift: string | null
  walletProvider: string | null
  walletAccount: string | null
  walletAccountName: string | null
  stripeSecretKey: string | null
  stripePublishableKey: string | null
  stripeWebhookSecret: string | null
  stripeAccountId: string | null
  paypalClientId: string | null
  paypalClientSecret: string | null
  paypalMode: string | null
  raastId: string | null
  lastFourDigits: string | null
  notes: string | null
  lastVerifiedAt: string | null
  verifiedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentSetting {
  id: string
  key: string
  value: string
  description: string | null
  isEncrypted: boolean
  updatedAt: string
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  action: string
  entity: string
  entityId: string | null
  changes: string | null
  performedBy: string | null
  ip: string | null
  createdAt: string
}
