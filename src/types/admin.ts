// ApexFlow Admin Panel — TypeScript Types & Interfaces

// ============================================
// AUTH
// ============================================

export interface AdminUserType {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminSession {
  id: string
  userId: string
  token: string
  ipAddress: string | null
  userAgent: string | null
  expiresAt: string
  createdAt: string
}

export interface AdminAuditLogType {
  id: string
  userId: string | null
  action: string
  module: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user?: AdminUserType | null
}

export interface AdminRoleType {
  id: string
  name: string
  description: string | null
  permissions: string
  createdAt: string
  updatedAt: string
}

// ============================================
// CLIENTS / CRM
// ============================================

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'churned'

export interface ClientType {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zipCode: string | null
  website: string | null
  industry: string | null
  status: ClientStatus
  notes: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
  contacts?: ClientContactType[]
  deals?: DealType[]
  _count?: {
    deals: number
    invoices: number
    payments: number
  }
}

export interface ClientContactType {
  id: string
  clientId: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientActivityType {
  id: string
  clientId: string
  type: string
  subject: string
  notes: string | null
  createdAt: string
}

// ============================================
// DEALS
// ============================================

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

export interface DealType {
  id: string
  title: string
  clientId: string | null
  value: number
  stage: DealStage
  probability: number
  source: string | null
  expectedCloseDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  client?: ClientType | null
  activities?: DealActivityType[]
}

export interface DealActivityType {
  id: string
  dealId: string
  type: string
  content: string
  createdAt: string
}

// ============================================
// FINANCE
// ============================================

export interface PackageType {
  id: string
  name: string
  description: string | null
  price: number
  billingCycle: string
  features: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { subscriptions: number }
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface SubscriptionType {
  id: string
  clientId: string
  packageId: string
  status: SubscriptionStatus
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
  client?: ClientType
  package?: PackageType
}

export interface InvoiceType {
  id: string
  number: string
  clientId: string
  amount: number
  tax: number
  total: number
  status: InvoiceStatus
  dueDate: string
  items: string
  notes: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  client?: ClientType
  payments?: PaymentType[]
}

export interface PaymentType {
  id: string
  invoiceId: string | null
  clientId: string
  amount: number
  method: string
  status: PaymentStatus
  transactionId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  client?: ClientType
  invoice?: InvoiceType
}

// ============================================
// COMMUNICATIONS
// ============================================

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportTicketType {
  id: string
  subject: string
  clientId: string | null
  name: string
  email: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  message: string
  createdAt: string
  updatedAt: string
  responses?: TicketResponseType[]
  client?: ClientType | null
}

export interface TicketResponseType {
  id: string
  ticketId: string
  author: string
  message: string
  createdAt: string
}

export interface EmailTemplateType {
  id: string
  name: string
  subject: string
  body: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface EmailLogType {
  id: string
  templateId: string | null
  to: string
  subject: string
  body: string
  status: string
  error: string | null
  createdAt: string
}

export interface SmtpConfigType {
  id: string
  host: string
  port: number
  user: string
  password: string
  fromName: string | null
  fromEmail: string
  isDefault: boolean
  isActive: boolean
}

export interface SmsConfigType {
  id: string
  provider: string
  apiKey: string
  apiSecret: string | null
  fromNumber: string
  isActive: boolean
}

export interface SmsLogType {
  id: string
  to: string
  message: string
  status: string
  error: string | null
  createdAt: string
}

// ============================================
// MARKETING
// ============================================

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
export type CampaignType = 'email' | 'sms' | 'social' | 'ads'

export interface CampaignType2 {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  subject: string | null
  content: string
  targetAudience: string | null
  scheduleAt: string | null
  sentAt: string | null
  stats: string
  createdAt: string
  updatedAt: string
}

export interface SocialAccountType {
  id: string
  platform: string
  accountName: string
  accountId: string
  token: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SocialPostType {
  id: string
  accountId: string | null
  platform: string
  content: string
  mediaUrl: string | null
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  stats: string
  createdAt: string
  updatedAt: string
}

// ============================================
// REPORTS
// ============================================

export interface ReportTemplateType {
  id: string
  name: string
  description: string | null
  type: string
  config: string
  createdAt: string
  updatedAt: string
}

export interface SavedReportType {
  id: string
  templateId: string | null
  name: string
  type: string
  dateRange: string | null
  data: string
  generatedAt: string
  createdAt: string
}

// ============================================
// SYSTEM SETTINGS
// ============================================

export interface SiteSettingType {
  id: string
  key: string
  value: string
  group: string
}

export interface NotificationRuleType {
  id: string
  name: string
  event: string
  channels: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardStats {
  totalClients: number
  activeDeals: number
  totalRevenue: number
  pendingInvoices: number
  openTickets: number
  activeSubscriptions: number
  revenueGrowth: number
  clientGrowth: number
  recentClients: ClientType[]
  recentDeals: DealType[]
  recentPayments: PaymentType[]
  revenueByMonth: { month: string; revenue: number }[]
  dealsByStage: { stage: string; count: number; value: number }[]
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// NAVIGATION
// ============================================

export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  department: string
}

export interface NavDepartment {
  id: string
  label: string
  icon: string
  items: NavItem[]
}
