/**
 * ERP Database Connector Utility
 *
 * Provides a unified interface for querying connected ERP databases.
 * Each ERP has its own Neon PostgreSQL database with different schemas.
 * This module maps ERP-specific schemas to ApexFlow's admin panel data model.
 *
 * Design: Each sub-query is wrapped in its own try/catch so that a single
 * failure (e.g. missing column) does NOT bring down the entire function.
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { db } from '@/lib/db'

// ─── ERP Database URL Mapping ────────────────────────────────────────────────
const ERP_DB_URLS: Record<string, string> = {
  apparelflow: process.env.APPARELFLOW_DATABASE_URL || '',
  hotelflow: process.env.HOTELFLOW_DATABASE_URL || '',
  eduflow: process.env.EDUFLOW_DATABASE_URL || '',
  martflow: process.env.MARTFLOW_DATABASE_URL || '',
  pharmaflow: process.env.PHARMAFLOW_DATABASE_URL || '',
  buildflow: process.env.BUILDFLOW_DATABASE_URL || '',
  travelflow: process.env.TRAVELFLOW_DATABASE_URL || '',
  tenantflow: process.env.TENANTFLOW_DATABASE_URL || '',
  factoryflow: process.env.FACTORYFLOW_DATABASE_URL || '',
  foodflow: process.env.FOODFLOW_DATABASE_URL || '',
  autoflow: process.env.AUTOFLOW_DATABASE_URL || '',
  healthflow: process.env.HEALTHFLOW_DATABASE_URL || '',
  textileflow: process.env.TEXTILEFLOW_DATABASE_URL || '',
  creativeflow: process.env.CREATIVEFLOW_DATABASE_URL || '',
  logisticflow: process.env.LOGISTICFLOW_DATABASE_URL || '',
  distriflow: process.env.DISTRIFLOW_DATABASE_URL || '',
  fleetflow: process.env.FLEETFLOW_DATABASE_URL || '',
  electroflow: process.env.ELECTROFLOW_DATABASE_URL || '',
  bookflow: process.env.BOOKFLOW_DATABASE_URL || '',
  fuelflow: process.env.FUELFLOW_DATABASE_URL || '',
}

// ─── Database URL Cache (from ErpSystem table) ──────────────────────────────
let dbUrlCache: Record<string, string> | null = null
let dbUrlCacheTs = 0
const DB_URL_CACHE_TTL = 30_000 // 30 seconds

async function loadErpDbUrls(): Promise<Record<string, string>> {
  const now = Date.now()
  if (dbUrlCache && now - dbUrlCacheTs < DB_URL_CACHE_TTL) return dbUrlCache

  try {
    const erps = await db.erpSystem.findMany({
      select: { slug: true, databaseUrl: true },
    })
    const urls: Record<string, string> = {}
    for (const erp of erps) {
      if (erp.databaseUrl) urls[erp.slug] = erp.databaseUrl
    }
    dbUrlCache = urls
    dbUrlCacheTs = now
    return urls
  } catch (err) {
    console.warn('[ERP-CONNECTOR] Failed to load DB URLs from database:', err)
    return dbUrlCache || {}
  }
}

/** Get the database URL for an ERP slug — checks database first, falls back to env var */
async function getErpDbUrl(slug: string): Promise<string> {
  const dbUrls = await loadErpDbUrls()
  return dbUrls[slug] || ERP_DB_URLS[slug] || ''
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ErpClient {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
  status: 'trial' | 'active' | 'inactive'
  industry: string | null
  erpSlug: string
  erpName: string
  licenseType: string | null
  databaseStatus: string | null
  maxUsers: number | null
  maxShops: number | null
  selectedModules: string | null
  createdAt: string
}

export interface ErpInvoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string | null
  erpSlug: string
  erpName: string
  amount: number
  tax: number
  totalAmount: number
  status: string
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

export interface ErpLicense {
  id: string
  serialKey: string
  clientName: string
  erpSlug: string
  erpName: string
  licenseType: string
  status: string
  deviceName: string | null
  deviceFingerprint: string | null
  activatedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface ErpDashboardStats {
  totalClients: number
  activeClients: number
  totalRevenue: number
  totalInvoices: number
  activeLicenses: number
  totalDevices: number
  clientCompanies: ErpClient[]
  invoices: ErpInvoice[]
  licenses: ErpLicense[]
  revenueByMonth: { month: string; revenue: number }[]
}

// ─── Connection Test ─────────────────────────────────────────────────────────
export async function testErpConnection(slug: string): Promise<{
  connected: boolean
  latency?: number
  error?: string
  clientCount?: number
  schemaWarning?: string
}> {
  const url = await getErpDbUrl(slug)
  if (!url) {
    return { connected: false, error: 'Database URL not configured — set it in Admin Panel > Settings > Integrations > ERP' }
  }

  try {
    const start = Date.now()
    const sql = neon(url, { fetchConnectionCache: true })
    const [result] = await withTimeout(sql`SELECT 1 as ok`, 5_000)
    const latency = Date.now() - start

    if (result?.ok === 1) {
      // Also get client count
      let clientCount = 0
      try {
        if (slug === 'apparelflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "ClientCompany"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'hotelflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "OwnerClient"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'eduflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Client"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'martflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "tenants"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'pharmaflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Client"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'buildflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "ERPTenant"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'travelflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "OwnerClient"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'tenantflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Client"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'factoryflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "OwnerClient"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'foodflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Tenant"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'autoflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Client"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'healthflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Client"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'textileflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "owner_clients"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'creativeflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "erp_clients"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'distriflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "OwnerClient"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'logisticflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Tenant"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'fleetflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Tenant"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'electroflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "Tenant"`
          clientCount = cnt?.c ?? 0
        } else if (slug === 'bookflow') {
          const [cnt] = await sql`SELECT COUNT(*)::int AS c FROM "OwnerClient"`
          clientCount = cnt?.c ?? 0
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn(`[ERP-CONNECTOR] ${slug} schema warning: ${msg}`)
        // Connection IS working — just the client count table is different
        // Return connected: true with a warning instead of connected: false
      }
      return clientCount > 0
        ? { connected: true, latency, clientCount }
        : { connected: true, latency, clientCount: 0, schemaWarning: `Schema mismatch: could not count clients — table may differ from expected schema` }
    }
    return { connected: false, error: 'Unexpected response' }
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    }
  }
}

// ─── Timeout helper ──────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Connection timeout after ${ms}ms`)), ms)
    ),
  ])
}

// ─── Get SQL for an ERP ──────────────────────────────────────────────────────
async function getErpSql(slug: string): Promise<NeonQueryFunction<false, false> | null> {
  const url = await getErpDbUrl(slug)
  if (!url) return null
  return neon(url, { fetchConnectionCache: true })
}

// ─── Connection cache (avoids re-testing recently-failed connections) ──────────
const connectionCache = new Map<string, { ok: boolean; ts: number }>()
const CACHE_TTL_MS = 60_000 // 1 minute for successful connections
const FAILED_CACHE_TTL_MS = 30_000 // 30 seconds for failed connections (retry sooner)

/** Quick connectivity check — returns true if the ERP database is reachable.
 *  Caches successful results for 1 minute, failed results for 30 seconds
 *  so we retry unreachable databases sooner. Uses a 5-second timeout to avoid
 *  long waits on unresponsive hosts. */
async function isErpReachable(slug: string): Promise<boolean> {
  const cached = connectionCache.get(slug)
  const ttl = cached?.ok ? CACHE_TTL_MS : FAILED_CACHE_TTL_MS
  if (cached && Date.now() - cached.ts < ttl) return cached.ok

  const url = await getErpDbUrl(slug)
  if (!url) {
    connectionCache.set(slug, { ok: false, ts: Date.now() })
    return false
  }

  try {
    const sql = neon(url, { fetchConnectionCache: true })
    const [result] = await withTimeout(sql`SELECT 1 as ok`, 5_000)
    const ok = result?.ok === 1
    connectionCache.set(slug, { ok, ts: Date.now() })
    return ok
  } catch {
    connectionCache.set(slug, { ok: false, ts: Date.now() })
    return false
  }
}

// ─── Get list of active ERP slugs ────────────────────────────────────────────
export async function getActiveErpSlugs(): Promise<string[]> {
  const dbUrls = await loadErpDbUrls()
  const allUrls = { ...ERP_DB_URLS, ...dbUrls }
  return Object.entries(allUrls)
    .filter(([, url]) => url && url.startsWith('postgresql://'))
    .map(([slug]) => slug)
}

/** Invalidate the URL cache — call this after admin updates an ERP database URL */
export function invalidateErpUrlCache(): void {
  dbUrlCache = null
  dbUrlCacheTs = 0
}

// ─── Safe query helper ───────────────────────────────────────────────────────
async function safeQuery<T>(
  label: string,
  fn: () => Promise<T[]>,
  fallback: T[] = []
): Promise<T[]> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[ERP-CONNECTOR] ${label} query failed:`, error instanceof Error ? error.message : error)
    return fallback
  }
}

async function safeQuerySingle<T>(
  label: string,
  fn: () => Promise<T[]>,
  fallback: T
): Promise<T> {
  try {
    const result = await fn()
    return result[0] ?? fallback
  } catch (error) {
    console.error(`[ERP-CONNECTOR] ${label} query failed:`, error instanceof Error ? error.message : error)
    return fallback
  }
}

/** Safely extract a prefix from a potentially null/undefined id value */
function safeIdPrefix(val: any, len: number): string {
  if (val && typeof val === 'string') return val.slice(0, len)
  if (val != null) return String(val).slice(0, len)
  return 'UNKNOWN'
}

// ─── ApparelFlow Data Queries ────────────────────────────────────────────────
async function getApparelFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('apparelflow')
  if (!sql) return null

  try {
    // ── Client companies (resilient) ──
    const clients = await safeQuery('AF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "adminEmail", "licenseType", "licenseStatus",
          "serialKey", "isActive", "databaseStatus", "industry",
          "maxUsers", "maxShops", "selectedModules", "businessType",
          "createdAt"
        FROM "ClientCompany"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('AF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "ClientCompany" WHERE "isActive" = true`,
      { c: 0 }
    )

    // ── Revenue from paid invoices (resilient) ──
    const revenueResult = await safeQuerySingle('AF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "ClientInvoice" WHERE "paymentStatus" = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count (resilient) ──
    const invoiceCountResult = await safeQuerySingle('AF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "ClientInvoice"`,
      { c: 0 }
    )

    // ── Client invoices (resilient) ──
    const invoices = await safeQuery('AF-Invoices', () =>
      sql`
        SELECT
          ci.id, ci."invoiceNo", ci."serialKey", ci."licenseType",
          ci."licensePeriod", ci."subtotal", ci."taxAmount", ci."discountAmount",
          ci."totalAmount", ci."paidAmount", ci."paymentStatus",
          ci."startDate", ci."expiryDate", ci."createdAt",
          cc."companyName", cc."adminEmail"
        FROM "ClientInvoice" ci
        LEFT JOIN "ClientCompany" cc ON ci."clientCompanyId" = cc.id
        ORDER BY ci."createdAt" DESC
      `
    )

    // ── License activations (resilient) ──
    const licenseActivations = await safeQuery('AF-Licenses', () =>
      sql`
        SELECT
          la.id, la."serialKey", la."machineId", la."machineLabel",
          la."ipAddress", la."isActive", la."activatedAt", la."lastCheckedAt",
          cc."companyName", cc."licenseType"
        FROM "LicenseActivation" la
        LEFT JOIN "ClientCompany" cc ON la."clientCompanyId" = cc.id
        ORDER BY la."activatedAt" DESC
      `
    )

    // ── Revenue by month (last 6 months, resilient) ──
    const revenueByMonth = await safeQuery('AF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "ClientInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || c.adminEmail || '—',
      email: c.email || c.adminEmail || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || 'Pakistan',
      status: c.isActive ? 'active' : 'inactive',
      industry: c.industry || c.businessType || null,
      erpSlug: 'apparelflow',
      erpName: 'ApparelFlow',
      licenseType: c.licenseType || null,
      databaseStatus: c.databaseStatus || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxShops || null,
      selectedModules: c.selectedModules || null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNo || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.adminEmail || null,
      erpSlug: 'apparelflow',
      erpName: 'ApparelFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.paymentStatus || 'pending',
      dueDate: inv.expiryDate,
      paidAt: inv.paymentStatus === 'paid' ? inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map licenses
    const mappedLicenses: ErpLicense[] = licenseActivations.map((lic: any) => ({
      id: lic.id,
      serialKey: lic.serialKey || safeIdPrefix(lic.id, 12).toUpperCase(),
      clientName: lic.companyName || 'Unknown',
      erpSlug: 'apparelflow',
      erpName: 'ApparelFlow',
      licenseType: lic.licenseType || 'standard',
      status: lic.isActive ? 'active' : 'expired',
      deviceName: lic.machineLabel || lic.machineId || null,
      deviceFingerprint: lic.machineId || null,
      activatedAt: lic.activatedAt,
      expiresAt: null,
      createdAt: lic.activatedAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: licenseActivations.length,
      totalDevices: licenseActivations.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] ApparelFlow stats failed completely:', error)
    return null
  }
}

// ─── HotelFlow Data Queries ──────────────────────────────────────────────────
async function getHotelFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('hotelflow')
  if (!sql) return null

  try {
    // ── Owner clients (resilient) ──
    const clients = await safeQuery('HF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "serialKey", "plan", "status",
          "monthlyFee", "maxProperties", "maxRooms", "maxUsers",
          "createdAt"
        FROM "OwnerClient"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('HF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerClient" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices (resilient) ──
    const revenueResult = await safeQuerySingle('HF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count (resilient) ──
    const invoiceCountResult = await safeQuerySingle('HF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerInvoice"`,
      { c: 0 }
    )

    // ── Client invoices (resilient) ──
    const invoices = await safeQuery('HF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber",
          oi."subtotal", oi."discountAmount", oi."taxAmount",
          oi."totalAmount", oi."paidAmount", oi."status",
          oi."issueDate", oi."dueDate", oi."paidDate", oi."createdAt",
          oc."companyName", oc."email" AS "clientEmail"
        FROM "OwnerInvoice" oi
        LEFT JOIN "OwnerClient" oc ON oi."clientId" = oc.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Owner devices (resilient) ──
    const devices = await safeQuery('HF-Devices', () =>
      sql`
        SELECT
          od.id, od."deviceName", od."deviceType", od."ipAddress",
          od."isActive", od."registeredAt", od."lastActive",
          oc."companyName", oc."serialKey", oc."plan"
        FROM "OwnerDevice" od
        LEFT JOIN "OwnerClient" oc ON od."clientId" = oc.id
        ORDER BY od."registeredAt" DESC
      `
    )

    // ── Revenue by month (last 6 months, resilient) ──
    const revenueByMonth = await safeQuery('HF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "OwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Hospitality',
      erpSlug: 'hotelflow',
      erpName: 'HotelFlow',
      licenseType: c.plan || null,
      databaseStatus: c.status || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxProperties || null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'hotelflow',
      erpName: 'HotelFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map devices as licenses
    const mappedLicenses: ErpLicense[] = devices.map((dev: any) => ({
      id: dev.id,
      serialKey: dev.serialKey || safeIdPrefix(dev.id, 12).toUpperCase(),
      clientName: dev.companyName || 'Unknown',
      erpSlug: 'hotelflow',
      erpName: 'HotelFlow',
      licenseType: dev.plan || 'standard',
      status: dev.isActive ? 'active' : 'expired',
      deviceName: dev.deviceName || null,
      deviceFingerprint: dev.ipAddress || null,
      activatedAt: dev.registeredAt,
      expiresAt: null,
      createdAt: dev.registeredAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: devices.filter((d: any) => d.isActive).length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] HotelFlow stats failed completely:', error)
    return null
  }
}

// ─── EduFlow Data Queries ────────────────────────────────────────────────────
async function getEduFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('eduflow')
  if (!sql) return null

  try {
    // ── Client companies (schools/institutions) ──
    const clients = await safeQuery('EF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "status", "notes",
          "createdAt"
        FROM "Client"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('EF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Client" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('EF-Revenue', () =>
      sql`SELECT COALESCE(SUM("total"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('EF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('EF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber",
          i."subtotal", i."taxAmount", i."discount",
          i."total", i."status",
          i."issueDate", i."dueDate", i."paidDate", i."createdAt",
          c."companyName", c."email" AS "clientEmail"
        FROM "Invoice" i
        LEFT JOIN "Client" c ON i."clientId" = c.id
        ORDER BY i."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('EF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.plan, sk.status, sk."maxDevices", sk."maxStudents",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          c."companyName"
        FROM "SerialKey" sk
        LEFT JOIN "Client" c ON sk."clientId" = c.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('EF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("total"), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Education',
      erpSlug: 'eduflow',
      erpName: 'EduFlow',
      licenseType: null,
      databaseStatus: c.status || null,
      maxUsers: null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'eduflow',
      erpName: 'EduFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.total || 0,
      status: inv.status || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'eduflow',
      erpName: 'EduFlow',
      licenseType: sk.plan || 'standard',
      status: sk.status === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status === 'active').length,
      totalDevices: 0,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] EduFlow stats failed completely:', error)
    return null
  }
}

// ─── MartFlow Data Queries ────────────────────────────────────────────────────
async function getMartFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('martflow')
  if (!sql) return null

  try {
    // ── Tenants (client companies / retail stores) ──
    const clients = await safeQuery('MF-Clients', () =>
      sql`
        SELECT
          id, name, slug, status, plan, email, phone, city, country,
          "businessType", "maxBranches", "maxUsers", "maxProducts",
          "dbStatus", "totalPaid", "outstandingAmount",
          "contactPerson", "contactEmail",
          "createdAt"
        FROM tenants
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active tenants count ──
    const activeResult = await safeQuerySingle('MF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM tenants WHERE status = 'ACTIVE'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('MF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalPaid"), 0)::float AS r FROM tenants`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('MF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM invoices`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('MF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber", i."clientName", i."clientEmail",
          i.subtotal, i."taxAmount", i."discountAmount", i."totalAmount",
          i.status, i."issueDate", i."dueDate", i."paidAt", i."createdAt"
        FROM invoices i
        ORDER BY i."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('MF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.status, sk.type, sk."packageName",
          sk."maxActivations", sk."currentActivations",
          sk."activatedAt", sk."expiresAt", sk."createdAt"
        FROM serial_keys sk
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices ──
    const devices = await safeQuery('MF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d."ipAddress",
          d.status, d."registeredAt", d."lastActiveAt"
        FROM devices d
        ORDER BY d."registeredAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('MF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM invoices
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map tenants to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.name || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.contactEmail || c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'ACTIVE' ? 'active' : c.status === 'TRIAL' ? 'trial' : 'inactive',
      industry: c.businessType || 'Retail',
      erpSlug: 'martflow',
      erpName: 'MartFlow',
      licenseType: c.plan || null,
      databaseStatus: c.dbStatus || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxBranches || null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.clientName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'martflow',
      erpName: 'MartFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.paidAt || null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.packageName || 'Unknown',
      erpSlug: 'martflow',
      erpName: 'MartFlow',
      licenseType: sk.type?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status === 'ACTIVE').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] MartFlow stats failed completely:', error)
    return null
  }
}

// ─── PharmaFlow Data Queries ─────────────────────────────────────────────────
async function getPharmaFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('pharmaflow')
  if (!sql) return null

  try {
    // ── Client companies (pharmacies / clinics / businesses) ──
    const clients = await safeQuery('PF-Clients', () =>
      sql`
        SELECT
          id, "businessName", "contactPerson", "contactEmail", "contactPhone",
          city, country, status, "businessType",
          "maxBranches", "maxUsers", "maxDevices", "maxProducts",
          "verificationStatus", "createdAt"
        FROM "Client"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('PF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Client" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('PF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('PF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerInvoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('PF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber",
          oi.subtotal, oi."taxAmount", oi."discountAmount",
          oi."totalAmount", oi.status,
          oi."invoiceDate", oi."dueDate", oi."paidAt", oi."createdAt",
          c."businessName", c."contactEmail" AS "clientEmail"
        FROM "OwnerInvoice" oi
        LEFT JOIN "Client" c ON oi."clientId" = c.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('PF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk."keyType", sk.status,
          sk."maxActivations", sk."activationCount",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          c."businessName"
        FROM "SerialKey" sk
        LEFT JOIN "Client" c ON sk."clientId" = c.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Client devices ──
    const devices = await safeQuery('PF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d."ipAddress",
          d.status, d."firstSeenAt", d."lastSeenAt",
          c."businessName"
        FROM "ClientDevice" d
        LEFT JOIN "Client" c ON d."clientId" = c.id
        ORDER BY d."firstSeenAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('PF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "OwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.businessName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.contactEmail || '',
      phone: c.contactPhone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: c.businessType || 'Pharmaceutical',
      erpSlug: 'pharmaflow',
      erpName: 'PharmaFlow',
      licenseType: null,
      databaseStatus: c.verificationStatus || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxBranches || null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.businessName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'pharmaflow',
      erpName: 'PharmaFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.paidAt || null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.businessName || 'Unknown',
      erpSlug: 'pharmaflow',
      erpName: 'PharmaFlow',
      licenseType: sk.keyType?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] PharmaFlow stats failed completely:', error)
    return null
  }
}

// ─── BuildFlow Data Queries ──────────────────────────────────────────────────
async function getBuildFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('buildflow')
  if (!sql) return null

  try {
    // ── ERPTenant (client companies — construction firms / developers) ──
    const clients = await safeQuery('BF-Clients', () =>
      sql`
        SELECT
          id, "serialNumber", "companyName", "contactName", "contactEmail", "contactPhone",
          "city", "country", "planType", "status", "isActive",
          "maxUsers", "maxProjects", "currentUsers", "currentProjects",
          "databaseStatus", "adminEmail",
          "createdAt"
        FROM "ERPTenant"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('BF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "ERPTenant" WHERE "isActive" = true`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('BF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "ERPOwnerInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('BF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "ERPOwnerInvoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('BF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber", oi.status,
          oi.subtotal, oi."taxRate", oi."taxAmount", oi."totalAmount",
          oi."dueDate", oi."paidAt", oi."createdAt",
          t."companyName", t."contactEmail"
        FROM "ERPOwnerInvoice" oi
        LEFT JOIN "ERPTenant" t ON oi."tenantId" = t.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const licenseKeys = await safeQuery('BF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.status,
          sk."issuedAt", sk."expiresAt", sk."createdAt",
          t."companyName"
        FROM "ERPSerialKey" sk
        LEFT JOIN "ERPTenant" t ON sk."tenantId" = t.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices ──
    const devices = await safeQuery('BF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d.status,
          d."registeredAt", d."lastActiveAt",
          t."companyName"
        FROM "ERPDevice" d
        LEFT JOIN "ERPTenant" t ON d."tenantId" = t.id
        ORDER BY d."registeredAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('BF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "ERPOwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactName || '—',
      email: c.contactEmail || c.adminEmail || '',
      phone: c.contactPhone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.isActive ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Construction & Real Estate',
      erpSlug: 'buildflow',
      erpName: 'BuildFlow',
      licenseType: c.planType || null,
      databaseStatus: c.databaseStatus || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxProjects || null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.contactEmail || null,
      erpSlug: 'buildflow',
      erpName: 'BuildFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status === 'paid' ? inv.paidAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = licenseKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'buildflow',
      erpName: 'BuildFlow',
      licenseType: 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.issuedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: licenseKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] BuildFlow stats failed completely:', error)
    return null
  }
}

// ─── TravelFlow Data Queries ──────────────────────────────────────────────────
async function getTravelFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('travelflow')
  if (!sql) return null

  try {
    // ── Owner clients (travel agencies) ──
    const clients = await safeQuery('TF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactName", "email", "phone",
          "city", "country", "licenseType", "licenseStatus", "status",
          "maxPilgrims", "maxBranches", "maxStaff", "features",
          "salePrice", "currency", "paymentStatus",
          "licenseIssuedAt", "licenseExpiresAt",
          "createdAt"
        FROM "OwnerClient"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('TF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerClient" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('TF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Invoice" WHERE "paymentStatus" = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('TF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    // ── Client invoices with OwnerClient join ──
    const invoices = await safeQuery('TF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber",
          i."billTo", i."billToEmail",
          i.subtotal, i."taxAmount", i."totalAmount",
          i."paymentStatus", i."dueDate", i."paidDate", i."createdAt",
          oc."companyName"
        FROM "Invoice" i
        LEFT JOIN "OwnerClient" oc ON i."ownerId" = oc.id
        ORDER BY i."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('TF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk."keyType", sk.status,
          sk."maxDevices", sk."expiresAt", sk."createdAt",
          oc."companyName"
        FROM "SerialKey" sk
        LEFT JOIN "OwnerClient" oc ON sk."ownerId" = oc.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices with OwnerClient join ──
    const devices = await safeQuery('TF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d."ipAddress",
          d.status, d."isVerified", d."verifiedAt", d."lastAccessedAt", d."createdAt",
          oc."companyName"
        FROM "Device" d
        LEFT JOIN "OwnerClient" oc ON d."ownerId" = oc.id
        ORDER BY d."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('TF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // ── Operational counts ──
    const pilgrimCount = await safeQuerySingle('TF-Pilgrims', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Pilgrim"`,
      { c: 0 }
    )
    const bookingCount = await safeQuerySingle('TF-Bookings', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Booking"`,
      { c: 0 }
    )
    const packageCount = await safeQuerySingle('TF-Packages', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Package"`,
      { c: 0 }
    )
    const flightBookingCount = await safeQuerySingle('TF-FlightBookings', () =>
      sql`SELECT COUNT(*)::int AS c FROM "FlightBooking"`,
      { c: 0 }
    )
    const hotelCount = await safeQuerySingle('TF-Hotels', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Hotel"`,
      { c: 0 }
    )
    const groupCount = await safeQuerySingle('TF-Groups', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Group"`,
      { c: 0 }
    )
    const intlTravelCount = await safeQuerySingle('TF-IntlTravel', () =>
      sql`SELECT COUNT(*)::int AS c FROM "InternationalTravel"`,
      { c: 0 }
    )
    const supplierCount = await safeQuerySingle('TF-Suppliers', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Supplier"`,
      { c: 0 }
    )
    const transportCount = await safeQuerySingle('TF-Transport', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Transport"`,
      { c: 0 }
    )
    const visaCount = await safeQuerySingle('TF-Visa', () =>
      sql`SELECT COUNT(*)::int AS c FROM "VisaApplication"`,
      { c: 0 }
    )
    const crmLeadCount = await safeQuerySingle('TF-CRMLeads', () =>
      sql`SELECT COUNT(*)::int AS c FROM "CRMLead"`,
      { c: 0 }
    )
    const branchCount = await safeQuerySingle('TF-Branches', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Branch"`,
      { c: 0 }
    )
    const staffCount = await safeQuerySingle('TF-Staff', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Staff"`,
      { c: 0 }
    )
    const tenantCount = await safeQuerySingle('TF-Tenants', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Tenant"`,
      { c: 0 }
    )
    const subPlanCount = await safeQuerySingle('TF-SubPlans', () =>
      sql`SELECT COUNT(*)::int AS c FROM "SubscriptionPlan"`,
      { c: 0 }
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactName || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Travel & Tourism',
      erpSlug: 'travelflow',
      erpName: 'TravelFlow',
      licenseType: c.licenseType || null,
      databaseStatus: c.licenseStatus || null,
      maxUsers: c.maxStaff || null,
      maxShops: c.maxBranches || null,
      selectedModules: c.features || null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.billTo || inv.companyName || 'Unknown',
      clientEmail: inv.billToEmail || null,
      erpSlug: 'travelflow',
      erpName: 'TravelFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.paymentStatus || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.paymentStatus === 'paid' ? inv.paidDate : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'travelflow',
      erpName: 'TravelFlow',
      licenseType: sk.keyType || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.createdAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] TravelFlow stats failed completely:', error)
    return null
  }
}

// ─── TenantFlow Data Queries ─────────────────────────────────────────────────
async function getTenantFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('tenantflow')
  if (!sql) return null

  try {
    // ── Client companies (property management companies) ──
    const clients = await safeQuery('TNF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactName", "email", "phone",
          "address", "city", "state", "zipCode", "country",
          "status", "plan", "billingCycle", "monthlyFee", "setupFee",
          "maxProperties", "maxUsers", "maxDevices",
          "dbStatus", "features", "industry", "companySize",
          "createdAt"
        FROM "Client"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('TNF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Client" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('TNF-Revenue', () =>
      sql`SELECT COALESCE(SUM("total"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('TNF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('TNF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber",
          i.subtotal, i."taxRate", i."taxAmount", i."discount",
          i."total", i."paidAmount", i."status",
          i."issueDate", i."dueDate", i."paidDate", i."createdAt",
          c."companyName", c."email" AS "clientEmail"
        FROM "Invoice" i
        LEFT JOIN "Client" c ON i."clientId" = c.id
        ORDER BY i."createdAt" DESC
      `
    )

    // ── License keys ──
    const licenseKeys = await safeQuery('TNF-Licenses', () =>
      sql`
        SELECT
          lk.id, lk.key, lk.type, lk.plan, lk.status,
          lk."maxDevices", lk."maxUsers",
          lk."activatedAt", lk."expiresAt", lk."createdAt",
          c."companyName"
        FROM "LicenseKey" lk
        LEFT JOIN "Client" c ON lk."clientId" = c.id
        ORDER BY lk."createdAt" DESC
      `
    )

    // ── Devices ──
    const devices = await safeQuery('TNF-Devices', () =>
      sql`
        SELECT
          d.id, d."serialKey", d."deviceName", d."deviceType",
          d."ipAddress", d.status, d."activatedAt", d."lastSeenAt",
          d."createdAt"
        FROM "Device" d
        ORDER BY d."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('TNF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("total"), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactName || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: c.industry || 'Property Management',
      erpSlug: 'tenantflow',
      erpName: 'TenantFlow',
      licenseType: c.plan || null,
      databaseStatus: c.dbStatus || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxProperties || null,
      selectedModules: c.features || null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'tenantflow',
      erpName: 'TenantFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.total || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map license keys as licenses
    const mappedLicenses: ErpLicense[] = licenseKeys.map((lk: any) => ({
      id: lk.id,
      serialKey: lk.key || safeIdPrefix(lk.id, 12).toUpperCase(),
      clientName: lk.companyName || 'Unknown',
      erpSlug: 'tenantflow',
      erpName: 'TenantFlow',
      licenseType: lk.type?.toLowerCase() || lk.plan?.toLowerCase() || 'standard',
      status: lk.status?.toLowerCase() === 'active' ? 'active' : lk.status?.toLowerCase() === 'activated' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: lk.activatedAt,
      expiresAt: lk.expiresAt,
      createdAt: lk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: licenseKeys.filter((lk: any) => lk.status?.toLowerCase() === 'active' || lk.status?.toLowerCase() === 'activated').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] TenantFlow stats failed completely:', error)
    return null
  }
}

// ─── FactoryFlow Data Queries ─────────────────────────────────────────────────
async function getFactoryFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('factoryflow')
  if (!sql) return null

  try {
    // ── Owner clients (factories / manufacturing businesses) ──
    const clients = await safeQuery('FF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "status", "billingCycle", "serialKey",
          "maxDevices", "maxUsers", "activatedAt", "notes",
          "createdAt"
        FROM "OwnerClient"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('FF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerClient" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('FF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('FF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerInvoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('FF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber",
          oi.subtotal, oi."discountAmount", oi."taxAmount",
          oi."totalAmount", oi.status,
          oi."invoiceDate", oi."dueDate", oi."paidDate", oi."createdAt",
          oc."companyName", oc."email" AS "clientEmail"
        FROM "OwnerInvoice" oi
        LEFT JOIN "OwnerClient" oc ON oi."clientId" = oc.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('FF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.status, sk."maxDevices", sk."activatedDevices",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          oc."companyName"
        FROM "OwnerSerialKey" sk
        LEFT JOIN "OwnerClient" oc ON sk."clientId" = oc.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Owner devices ──
    const devices = await safeQuery('FF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceFingerprint", d."ipAddress",
          d.status, d."registeredAt", d."lastAccessedAt",
          oc."companyName", oc."serialKey"
        FROM "OwnerDevice" d
        LEFT JOIN "OwnerClient" oc ON d."clientId" = oc.id
        ORDER BY d."registeredAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('FF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "OwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Manufacturing',
      erpSlug: 'factoryflow',
      erpName: 'FactoryFlow',
      licenseType: c.billingCycle || null,
      databaseStatus: c.status || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxDevices || null,
      selectedModules: c.notes || null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'factoryflow',
      erpName: 'FactoryFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.paidDate || null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'factoryflow',
      erpName: 'FactoryFlow',
      licenseType: 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] FactoryFlow stats failed completely:', error)
    return null
  }
}

// ─── FoodFlow Data Queries ──────────────────────────────────────────────────
async function getFoodFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('foodflow')
  if (!sql) return null

  try {
    // ── Tenants (restaurants / food businesses) ──
    const clients = await safeQuery('FdF-Clients', () =>
      sql`
        SELECT
          id, "businessName", "ownerName", "ownerEmail", "ownerPhone",
          city, country, status, "isActive",
          "maxBranches", "maxUsers", "billingCycle",
          "createdAt"
        FROM "Tenant"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('FdF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Tenant" WHERE "isActive" = true`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('FdF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('FdF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('FdF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber",
          i.subtotal, i."discountAmount", i."taxAmount",
          i."totalAmount", i."paidAmount", i.status,
          i."issueDate", i."dueDate", i."paidAt", i."createdAt",
          t."businessName", t."ownerEmail"
        FROM "Invoice" i
        LEFT JOIN "Tenant" t ON i."tenantId" = t.id
        ORDER BY i."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('FdF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.status, sk."maxActivations", sk."currentActivations",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          t."businessName"
        FROM "SerialKey" sk
        LEFT JOIN "Tenant" t ON sk."tenantId" = t.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices ──
    const devices = await safeQuery('FdF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d."hardwareId", d."ipAddress",
          d.status, d."registeredAt", d."lastActiveAt",
          t."businessName"
        FROM "Device" d
        LEFT JOIN "Tenant" t ON d."tenantId" = t.id
        ORDER BY d."registeredAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('FdF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map tenants to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.businessName || 'Unknown',
      contactPerson: c.ownerName || '—',
      email: c.ownerEmail || '',
      phone: c.ownerPhone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.isActive ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Food & Restaurant',
      erpSlug: 'foodflow',
      erpName: 'FoodFlow',
      licenseType: c.billingCycle || null,
      databaseStatus: c.status || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxBranches || null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.businessName || 'Unknown',
      clientEmail: inv.ownerEmail || null,
      erpSlug: 'foodflow',
      erpName: 'FoodFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.paidAt || null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.businessName || 'Unknown',
      erpSlug: 'foodflow',
      erpName: 'FoodFlow',
      licenseType: 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] FoodFlow stats failed completely:', error)
    return null
  }
}

// ─── AutoFlow Data Queries ──────────────────────────────────────────────────
async function getAutoFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('autoflow')
  if (!sql) return null

  try {
    // ── Clients (workshop / auto service companies) ──
    // AutoFlow uses Client/Invoice/License/Device tables (same as ApexFlow schema)
    const clients = await safeQuery('AUTOF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "status", "industry", "businessType",
          "companySize", "notes",
          "createdAt"
        FROM "Client"
        ORDER BY "createdAt" DESC
      `
    )

    const activeResult = await safeQuerySingle('AUTOF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Client" WHERE status = 'active'`,
      { c: 0 }
    )

    const revenueResult = await safeQuerySingle('AUTOF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    const invoiceCountResult = await safeQuerySingle('AUTOF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    const invoices = await safeQuery('AUTOF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber", i.status,
          i.amount, i.tax, i."totalAmount",
          i."dueDate", i."paidAt", i."createdAt",
          c."companyName", c."email" AS "clientEmail"
        FROM "Invoice" i
        LEFT JOIN "Client" c ON i."clientId" = c.id
        ORDER BY i."createdAt" DESC
      `
    )

    const serialKeys = await safeQuery('AUTOF-Licenses', () =>
      sql`
        SELECT
          l.id, l."serialKey", l.status, l.type, l."maxUsers", l."maxDevices",
          l."activatedAt", l."expiresAt", l."createdAt",
          c."companyName"
        FROM "License" l
        LEFT JOIN "Client" c ON l."clientId" = c.id
        ORDER BY l."createdAt" DESC
      `
    )

    const devices = await safeQuery('AUTOF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d.status,
          d."lastActiveAt", d."createdAt",
          c."companyName"
        FROM "Device" d
        LEFT JOIN "Client" c ON d."clientId" = c.id
        ORDER BY d."createdAt" DESC
      `
    )

    const revenueByMonth = await safeQuery('AUTOF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Automotive & Workshop',
      erpSlug: 'autoflow',
      erpName: 'AutoFlow',
      licenseType: c.businessType || null,
      databaseStatus: c.status || null,
      maxUsers: c.companySize ? parseInt(c.companySize) : null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'autoflow',
      erpName: 'AutoFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status === 'paid' ? inv.paidAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.serialKey || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'autoflow',
      erpName: 'AutoFlow',
      licenseType: sk.type?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] AutoFlow stats failed completely:', error)
    return null
  }
}

// ─── HealthFlow Data Queries ──────────────────────────────────────────────────
async function getHealthFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('healthflow')
  if (!sql) return null

  try {
    // ── Clients (hospitals / clinics / healthcare providers) ──
    const clients = await safeQuery('HLF-Clients', () =>
      sql`
        SELECT
          id, "clientId", "companyName", "slug", "contactPerson", "email", "phone",
          "address", "city", "state", "country", "postalCode",
          "taxId", "registrationNo", "status", "notes", "tenantId",
          "createdAt"
        FROM "Client"
        ORDER BY "createdAt" DESC
      `
    )

    const activeResult = await safeQuerySingle('HLF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Client" WHERE status = 'active'`,
      { c: 0 }
    )

    const revenueResult = await safeQuerySingle('HLF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "ClientInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    const invoiceCountResult = await safeQuerySingle('HLF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "ClientInvoice"`,
      { c: 0 }
    )

    const invoices = await safeQuery('HLF-Invoices', () =>
      sql`
        SELECT
          ci.id, ci."invoiceNumber", ci.status, ci.type,
          ci.subtotal, ci."taxAmount", ci."discountAmount", ci."totalAmount", ci."amountPaid",
          ci."issueDate", ci."dueDate", ci."paidAt", ci."createdAt",
          c."companyName", c."email" AS "clientEmail"
        FROM "ClientInvoice" ci
        LEFT JOIN "Client" c ON ci."clientId" = c.id
        ORDER BY ci."createdAt" DESC
      `
    )

    const serialKeys = await safeQuery('HLF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk."serialKey", sk.plan, sk.status,
          sk."maxDevices", sk."activatedAt", sk."expiresAt", sk."createdAt",
          c."companyName"
        FROM "SerialKey" sk
        LEFT JOIN "Client" c ON sk."clientId" = c.id
        ORDER BY sk."createdAt" DESC
      `
    )

    const devices = await safeQuery('HLF-Devices', () =>
      sql`
        SELECT
          da.id, da."deviceName", da."browserInfo", da."ipAddress",
          da.status, da."activatedAt", da."lastSeenAt",
          sk."serialKey", sk.plan
        FROM "DeviceActivation" da
        LEFT JOIN "SerialKey" sk ON da."serialKeyId" = sk.id
        ORDER BY da."activatedAt" DESC
      `
    )

    const revenueByMonth = await safeQuery('HLF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "ClientInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Healthcare',
      erpSlug: 'healthflow',
      erpName: 'HealthFlow',
      licenseType: null,
      databaseStatus: c.status || null,
      maxUsers: null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'healthflow',
      erpName: 'HealthFlow',
      amount: inv.subtotal || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status === 'paid' ? inv.paidAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.serialKey || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'healthflow',
      erpName: 'HealthFlow',
      licenseType: sk.plan?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] HealthFlow stats failed completely:', error)
    return null
  }
}

// ─── TextileFlow Data Queries ──────────────────────────────────────────────────
async function getTextileFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('textileflow')
  if (!sql) return null

  try {
    // ── Owner clients (resilient) ──
    const clients = await safeQuery('TF-Clients', () =>
      sql`
        SELECT
          id, "company_name", "contact_person", "email", "phone",
          "city", "country", "industry", "status",
          "max_users", "max_factories", "db_name",
          "subscription_start", "subscription_end", "trial_ends_at",
          "created_at"
        FROM "owner_clients"
        ORDER BY "created_at" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('TF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "owner_clients" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices (resilient) ──
    const revenueResult = await safeQuerySingle('TF-Revenue', () =>
      sql`SELECT COALESCE(SUM("total_amount"), 0)::float AS r FROM "owner_invoices" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count (resilient) ──
    const invoiceCountResult = await safeQuerySingle('TF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "owner_invoices"`,
      { c: 0 }
    )

    // ── Client invoices (resilient) ──
    const invoices = await safeQuery('TF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoice_number",
          oi.subtotal, oi."discount_amount", oi."tax_amount",
          oi."total_amount", oi."paid_amount", oi.status,
          oi."invoice_date", oi."due_date", oi."paid_at", oi."created_at",
          oc."company_name", oc."email" AS "client_email"
        FROM "owner_invoices" oi
        LEFT JOIN "owner_clients" oc ON oi."client_id" = oc.id
        ORDER BY oi."created_at" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('TF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk."serial_key", sk."product_edition", sk.status,
          sk."max_activations", sk.activations,
          sk."activated_at", sk."expires_at", sk."created_at",
          oc."company_name"
        FROM "owner_serial_keys" sk
        LEFT JOIN "owner_clients" oc ON sk."client_id" = oc.id
        ORDER BY sk."created_at" DESC
      `
    )

    // ── Owner devices (resilient) ──
    const devices = await safeQuery('TF-Devices', () =>
      sql`
        SELECT
          od.id, od."device_name", od."device_type", od."ip_address",
          od."is_approved", od.status, od."created_at", od."last_active_at",
          oc."company_name"
        FROM "owner_devices" od
        LEFT JOIN "owner_clients" oc ON od."client_id" = oc.id
        ORDER BY od."created_at" DESC
      `
    )

    // ── Revenue by month (last 6 months, resilient) ──
    const revenueByMonth = await safeQuery('TF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("created_at", 'Mon') AS month,
          COALESCE(SUM("total_amount"), 0)::float AS revenue
        FROM "owner_invoices"
        WHERE "created_at" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("created_at", 'Mon'), DATE_TRUNC('month', "created_at")
        ORDER BY DATE_TRUNC('month', "created_at") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.company_name || 'Unknown',
      contactPerson: c.contact_person || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: c.industry || 'Textile',
      erpSlug: 'textileflow',
      erpName: 'TextileFlow',
      licenseType: null,
      databaseStatus: c.db_name || null,
      maxUsers: c.max_users || null,
      maxShops: c.max_factories || null,
      selectedModules: null,
      createdAt: c.created_at,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.company_name || 'Unknown',
      clientEmail: inv.client_email || null,
      erpSlug: 'textileflow',
      erpName: 'TextileFlow',
      amount: inv.subtotal || 0,
      tax: inv.tax_amount || 0,
      totalAmount: inv.total_amount || 0,
      status: inv.status || 'pending',
      dueDate: inv.due_date,
      paidAt: inv.status === 'paid' ? inv.paid_at || inv.created_at : null,
      createdAt: inv.created_at,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.serial_key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.company_name || 'Unknown',
      erpSlug: 'textileflow',
      erpName: 'TextileFlow',
      licenseType: sk.product_edition?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activated_at,
      expiresAt: sk.expires_at,
      createdAt: sk.created_at,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] TextileFlow stats failed completely:', error)
    return null
  }
}

// ─── CreativeFlow Data Queries ──────────────────────────────────────────────
async function getCreativeFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('creativeflow')
  if (!sql) return null

  try {
    // ── ERP clients (creative agencies / design studios) ──
    // NOTE: erp_clients.createdAt is TEXT, not timestamp
    const clients = await safeQuery('CF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "address", "city", "state", "country", "zipCode",
          "plan", "status", "serialKey",
          "databaseName", "maxUsers", "maxDevices",
          "subscriptionStartsAt", "subscriptionEndsAt",
          "createdAt"
        FROM "erp_clients"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('CF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "erp_clients" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid owner invoices ──
    // NOTE: owner_invoices.total is NUMERIC, createdAt is TEXT
    const revenueResult = await safeQuerySingle('CF-Revenue', () =>
      sql`SELECT COALESCE(SUM("total"), 0)::float AS r FROM "owner_invoices" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('CF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "owner_invoices"`,
      { c: 0 }
    )

    // ── Client invoices ──
    // NOTE: owner_invoices columns are mostly TEXT/NUMERIC; createdAt is TEXT
    const invoices = await safeQuery('CF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber", oi.status,
          oi.subtotal, oi."taxRate", oi."taxAmount", oi."discountRate", oi."discountAmount",
          oi."total", oi."receivableAmount", oi."paidAmount",
          oi."issueDate", oi."dueDate", oi."paidAt", oi."createdAt",
          ec."companyName", ec."email" AS "clientEmail"
        FROM "owner_invoices" oi
        LEFT JOIN "erp_clients" ec ON oi."clientId" = ec.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    // NOTE: serial_keys has "key" column (not "serialKey"), createdAt is TEXT
    const serialKeys = await safeQuery('CF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.status, sk."maxDevices",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          sk."clientName"
        FROM "serial_keys" sk
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices ──
    // NOTE: devices.createdAt is TEXT, fingerprint column (not deviceFingerprint)
    const devices = await safeQuery('CF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceType", d."ipAddress",
          d.fingerprint, d.status, d."lastActiveAt", d."createdAt",
          d."serialKeyId"
        FROM "devices" d
        ORDER BY d."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    // NOTE: owner_invoices.createdAt is TEXT so we must cast to timestamp
    const revenueByMonth = await safeQuery('CF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt"::timestamp, 'Mon') AS month,
          COALESCE(SUM("total"), 0)::float AS revenue
        FROM "owner_invoices"
        WHERE "createdAt"::timestamp >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt"::timestamp, 'Mon'), DATE_TRUNC('month', "createdAt"::timestamp)
        ORDER BY DATE_TRUNC('month', "createdAt"::timestamp) ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Creative & Design',
      erpSlug: 'creativeflow',
      erpName: 'CreativeFlow',
      licenseType: c.plan || null,
      databaseStatus: c.databaseName || null,
      maxUsers: c.maxUsers || null,
      maxShops: c.maxDevices || null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'creativeflow',
      erpName: 'CreativeFlow',
      amount: Number(inv.subtotal) || 0,
      tax: Number(inv.taxAmount) || 0,
      totalAmount: Number(inv.total) || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.paidAt || null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.clientName || 'Unknown',
      erpSlug: 'creativeflow',
      erpName: 'CreativeFlow',
      licenseType: 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] CreativeFlow stats failed completely:', error)
    return null
  }
}

// ─── DistriFlow Data Queries ──────────────────────────────────────────────────
async function getDistriFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('distriflow')
  if (!sql) return null

  try {
    // ── Owner clients (distribution / logistics businesses) ──
    // DistriFlow uses OwnerClient for platform clients, NOT Tenant (which is the ERP tenant itself)
    const clients = await safeQuery('DF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "serialKey", "plan", "status",
          "maxDevices", "maxUsers",
          "createdAt"
        FROM "OwnerClient"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('DF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerClient" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices (OwnerInvoice, NOT Invoice) ──
    const revenueResult = await safeQuerySingle('DF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('DF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerInvoice"`,
      { c: 0 }
    )

    // ── Client invoices (OwnerInvoice joined with OwnerClient) ──
    const invoices = await safeQuery('DF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber",
          oi."subtotal", oi."discountAmount", oi."taxAmount",
          oi."totalAmount", oi."paidAmount", oi.status,
          oi."issueDate", oi."dueDate", oi."paidDate", oi."createdAt",
          oc."companyName", oc."email" AS "clientEmail"
        FROM "OwnerInvoice" oi
        LEFT JOIN "OwnerClient" oc ON oi."clientId" = oc.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) joined with OwnerClient ──
    const serialKeys = await safeQuery('DF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk."keyType", sk.status,
          sk."maxDevices", sk."activatedDevices",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          oc."companyName"
        FROM "SerialKey" sk
        LEFT JOIN "OwnerClient" oc ON sk."ownerId" = oc.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Device registrations (DeviceRegistration, NOT Device) ──
    const devices = await safeQuery('DF-Devices', () =>
      sql`
        SELECT
          dr.id, dr."deviceName", dr."deviceType", dr."deviceFingerprint",
          dr."ipAddress", dr."isActive", dr."registeredAt", dr."lastActive", dr."createdAt",
          oc."companyName", oc."serialKey", oc."plan"
        FROM "DeviceRegistration" dr
        LEFT JOIN "OwnerClient" oc ON dr."clientId" = oc.id
        ORDER BY dr."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('DF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "OwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Distribution',
      erpSlug: 'distriflow',
      erpName: 'DistriFlow',
      licenseType: c.plan || null,
      databaseStatus: c.status || null,
      maxUsers: c.maxUsers || null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices — OwnerInvoice has subtotal/tax/total breakdown
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'distriflow',
      erpName: 'DistriFlow',
      amount: inv.subtotal || inv.totalAmount || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status?.toLowerCase() === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'distriflow',
      erpName: 'DistriFlow',
      licenseType: sk.keyType?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] DistriFlow stats failed completely:', error)
    return null
  }
}

// ─── BookFlow Data Queries ───────────────────────────────────────────────
async function getBookFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('bookflow')
  if (!sql) return null

  try {
    // ── Owner clients (publishing / bookstore businesses) ──
    const clients = await safeQuery('BF-Clients', () =>
      sql`
        SELECT
          id, "companyName", "contactPerson", "email", "phone",
          "city", "country", "status", "plan",
          "createdAt"
        FROM "OwnerClient"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('BF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerClient" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices (OwnerInvoice) ──
    const revenueResult = await safeQuerySingle('BF-Revenue', () =>
      sql`SELECT COALESCE(SUM(CAST("totalAmount" AS DECIMAL)), 0)::float AS r FROM "OwnerInvoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('BF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "OwnerInvoice"`,
      { c: 0 }
    )

    // ── Client invoices (OwnerInvoice joined with OwnerClient) ──
    const invoices = await safeQuery('BF-Invoices', () =>
      sql`
        SELECT
          oi.id, oi."invoiceNumber",
          oi."subtotal", oi."taxAmount",
          oi."totalAmount", oi."paidAmount", oi.status,
          oi."issueDate", oi."dueDate", oi."paidDate", oi."createdAt",
          oc."companyName", oc."email" AS "clientEmail"
        FROM "OwnerInvoice" oi
        LEFT JOIN "OwnerClient" oc ON oi."clientId" = oc.id
        ORDER BY oi."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) joined with OwnerClient ──
    const serialKeys = await safeQuery('BF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk."keyType", sk.status,
          sk."maxDevices", sk."activatedDevices",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          oc."companyName"
        FROM "SerialKey" sk
        LEFT JOIN "OwnerClient" oc ON sk."ownerId" = oc.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Device registrations ──
    const devices = await safeQuery('BF-Devices', () =>
      sql`
        SELECT
          dr.id, dr."deviceName", dr."deviceType", dr."deviceFingerprint",
          dr."ipAddress", dr."isActive", dr."registeredAt", dr."lastActive", dr."createdAt",
          oc."companyName", oc."plan"
        FROM "DeviceRegistration" dr
        LEFT JOIN "OwnerClient" oc ON dr."clientId" = oc.id
        ORDER BY dr."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('BF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM(CAST("totalAmount" AS DECIMAL)), 0)::float AS revenue
        FROM "OwnerInvoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map clients to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.companyName || 'Unknown',
      contactPerson: c.contactPerson || '—',
      email: c.email || '',
      phone: c.phone || null,
      city: c.city || null,
      country: c.country || null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Publishing & Books',
      erpSlug: 'bookflow',
      erpName: 'BookFlow',
      licenseType: c.plan || null,
      databaseStatus: c.status || null,
      maxUsers: null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.companyName || 'Unknown',
      clientEmail: inv.clientEmail || null,
      erpSlug: 'bookflow',
      erpName: 'BookFlow',
      amount: inv.subtotal || inv.totalAmount || 0,
      tax: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status?.toLowerCase() === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.companyName || 'Unknown',
      erpSlug: 'bookflow',
      erpName: 'BookFlow',
      licenseType: sk.keyType?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] BookFlow stats failed completely:', error)
    return null
  }
}

// ─── LogisticFlow Data Queries ───────────────────────────────────────────────
async function getLogisticFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('logisticflow')
  if (!sql) return null

  try {
    // ── Tenants (client companies — logistics firms) ──
    const clients = await safeQuery('LF-Clients', () =>
      sql`
        SELECT
          id, name, slug, domain, logo, plan, status,
          "aiTokensUsed", "aiTokensLimit",
          "dbName", "dbUrl", "dbDirectUrl", "dbStatus",
          "createdAt"
        FROM "Tenant"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('LF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Tenant" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('LF-Revenue', () =>
      sql`SELECT COALESCE(SUM(amount), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('LF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('LF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber", i."customerName",
          i.amount, i.status,
          i."dueDate", i."paidDate", i."createdAt",
          t.name AS "tenantName"
        FROM "Invoice" i
        LEFT JOIN "Tenant" t ON i."tenantId" = t.id
        ORDER BY i."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('LF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.plan, sk.status,
          sk."maxDevices", sk."usedDevices",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          t.name AS "tenantName"
        FROM "SerialKey" sk
        LEFT JOIN "Tenant" t ON sk."tenantId" = t.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices ──
    const devices = await safeQuery('LF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceFingerprint", d."deviceType",
          d.browser, d.os, d."lastActive", d."createdAt",
          sk.key AS "serialKey", sk.plan,
          t.name AS "tenantName"
        FROM "Device" d
        LEFT JOIN "SerialKey" sk ON d."serialKeyId" = sk.id
        LEFT JOIN "Tenant" t ON sk."tenantId" = t.id
        ORDER BY d."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('LF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM(amount), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map tenants to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.name || 'Unknown',
      contactPerson: c.slug || '—',
      email: c.domain || '',
      phone: null,
      city: null,
      country: null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Logistics',
      erpSlug: 'logisticflow',
      erpName: 'LogisticFlow',
      licenseType: c.plan || null,
      databaseStatus: c.dbStatus || null,
      maxUsers: null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices — Invoice has only `amount` (no subtotal/tax breakdown)
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.customerName || inv.tenantName || 'Unknown',
      clientEmail: null,
      erpSlug: 'logisticflow',
      erpName: 'LogisticFlow',
      amount: inv.amount || 0,
      tax: 0,
      totalAmount: inv.amount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status?.toLowerCase() === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.tenantName || 'Unknown',
      erpSlug: 'logisticflow',
      erpName: 'LogisticFlow',
      licenseType: sk.plan?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] LogisticFlow stats failed completely:', error)
    return null
  }
}

// ─── FleetFlow Stats ─────────────────────────────────────────────────────────
async function getFleetFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('fleetflow')
  if (!sql) return null

  try {
    // ── Tenants (client companies — fleet operators) ──
    const clients = await safeQuery('FF-Clients', () =>
      sql`
        SELECT
          id, name, slug, domain, logo, plan, status,
          "aiTokensUsed", "aiTokensLimit",
          "dbName", "dbUrl", "dbDirectUrl", "dbStatus",
          "createdAt"
        FROM "Tenant"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active clients count ──
    const activeResult = await safeQuerySingle('FF-ActiveClients', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Tenant" WHERE status = 'active'`,
      { c: 0 }
    )

    // ── Revenue from paid invoices ──
    const revenueResult = await safeQuerySingle('FF-Revenue', () =>
      sql`SELECT COALESCE(SUM(amount), 0)::float AS r FROM "Invoice" WHERE status = 'paid'`,
      { r: 0 }
    )

    // ── Total invoices count ──
    const invoiceCountResult = await safeQuerySingle('FF-InvoiceCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Invoice"`,
      { c: 0 }
    )

    // ── Client invoices ──
    const invoices = await safeQuery('FF-Invoices', () =>
      sql`
        SELECT
          i.id, i."invoiceNumber", i."customerName",
          i.amount, i.status,
          i."dueDate", i."paidDate", i."createdAt",
          t.name AS "tenantName"
        FROM "Invoice" i
        LEFT JOIN "Tenant" t ON i."tenantId" = t.id
        ORDER BY i."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('FF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.plan, sk.status,
          sk."maxDevices", sk."usedDevices",
          sk."activatedAt", sk."expiresAt", sk."createdAt",
          t.name AS "tenantName"
        FROM "SerialKey" sk
        LEFT JOIN "Tenant" t ON sk."tenantId" = t.id
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Devices ──
    const devices = await safeQuery('FF-Devices', () =>
      sql`
        SELECT
          d.id, d."deviceName", d."deviceFingerprint", d."deviceType",
          d.browser, d.os, d."lastActive", d."createdAt",
          sk.key AS "serialKey", sk.plan,
          t.name AS "tenantName"
        FROM "Device" d
        LEFT JOIN "SerialKey" sk ON d."serialKeyId" = sk.id
        LEFT JOIN "Tenant" t ON sk."tenantId" = t.id
        ORDER BY d."createdAt" DESC
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('FF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          COALESCE(SUM(amount), 0)::float AS revenue
        FROM "Invoice"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
        LIMIT 6
      `
    )

    // Map tenants to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.name || 'Unknown',
      contactPerson: c.slug || '—',
      email: c.domain || '',
      phone: null,
      city: null,
      country: null,
      status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'inactive',
      industry: 'Fleet & Transportation',
      erpSlug: 'fleetflow',
      erpName: 'FleetFlow',
      licenseType: c.plan || null,
      databaseStatus: c.dbStatus || null,
      maxUsers: null,
      maxShops: null,
      selectedModules: null,
      createdAt: c.createdAt,
    }))

    // Map invoices
    const mappedInvoices: ErpInvoice[] = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || `INV-${safeIdPrefix(inv.id, 8)}`,
      clientName: inv.customerName || inv.tenantName || 'Unknown',
      clientEmail: null,
      erpSlug: 'fleetflow',
      erpName: 'FleetFlow',
      amount: inv.amount || 0,
      tax: 0,
      totalAmount: inv.amount || 0,
      status: inv.status?.toLowerCase() || 'pending',
      dueDate: inv.dueDate,
      paidAt: inv.status?.toLowerCase() === 'paid' ? inv.paidDate || inv.createdAt : null,
      createdAt: inv.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: sk.tenantName || 'Unknown',
      erpSlug: 'fleetflow',
      erpName: 'FleetFlow',
      licenseType: sk.plan?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: invoiceCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: devices.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] FleetFlow stats failed completely:', error)
    return null
  }
}

// ─── FuelFlow Data Queries ────────────────────────────────────────────────────
async function getFuelFlowStats(): Promise<ErpDashboardStats | null> {
  const sql = await getErpSql('fuelflow')
  if (!sql) return null

  try {
    // ── Stations as clients (fuel station businesses) ──
    const clients = await safeQuery('FLF-Clients', () =>
      sql`
        SELECT
          id, name, code, city, region, country,
          "isActive", "stationType", "operatingHours",
          "createdAt"
        FROM "Station"
        ORDER BY "createdAt" DESC
      `
    )

    // ── Active stations count ──
    const activeResult = await safeQuerySingle('FLF-ActiveStations', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Station" WHERE "isActive" = true`,
      { c: 0 }
    )

    // ── Revenue from completed fueling transactions ──
    const revenueResult = await safeQuerySingle('FLF-Revenue', () =>
      sql`SELECT COALESCE(SUM("totalAmount"), 0)::float AS r FROM "Fueling" WHERE status = 'completed'`,
      { r: 0 }
    )

    // ── Total fueling transactions count (as invoices) ──
    const fuelingCountResult = await safeQuerySingle('FLF-FuelingCount', () =>
      sql`SELECT COUNT(*)::int AS c FROM "Fueling"`,
      { c: 0 }
    )

    // ── Fueling transactions (as invoices) joined with Station ──
    const fuelings = await safeQuery('FLF-Fuelings', () =>
      sql`
        SELECT
          f.id, f."fuelType", f.volume, f."pricePerUnit",
          f."totalAmount", f."paymentMethod", f.status,
          f."completedAt", f."createdAt",
          s.name AS "stationName", s.code AS "stationCode"
        FROM "Fueling" f
        LEFT JOIN "Station" s ON f."stationId" = s.id
        ORDER BY f."createdAt" DESC
      `
    )

    // ── Fuel deliveries (as invoices for fuel procurement) ──
    const deliveries = await safeQuery('FLF-Deliveries', () =>
      sql`
        SELECT
          fd.id, fd."productType", fd."expectedVolume", fd."actualVolume",
          fd."totalCost", fd.status, fd."deliveryDate", fd."createdAt",
          s.name AS "stationName"
        FROM "FuelDelivery" fd
        LEFT JOIN "Station" s ON fd."stationId" = s.id
        ORDER BY fd."createdAt" DESC
      `
    )

    // ── Serial keys (licenses) ──
    const serialKeys = await safeQuery('FLF-Licenses', () =>
      sql`
        SELECT
          sk.id, sk.key, sk.plan, sk.status,
          sk."maxStations", sk."maxDispensers", sk."maxUsers",
          sk."activatedAt", sk."expiresAt", sk."createdAt"
        FROM "SerialKey" sk
        ORDER BY sk."createdAt" DESC
      `
    )

    // ── Dispensers (as devices) ──
    const dispensers = await safeQuery('FLF-Dispensers', () =>
      sql`
        SELECT
          d.id, d.name, d.code, d."controllerType",
          d."communicationType", d."nozzleCount", d.status,
          d."isActive", d."createdAt",
          s.name AS "stationName"
        FROM "Dispenser" d
        LEFT JOIN "Station" s ON d."stationId" = s.id
        ORDER BY d."createdAt" DESC
      `
    )

    // ── Tanks overview ──
    const tanks = await safeQuery('FLF-Tanks', () =>
      sql`
        SELECT
          t.id, t.name, t.code, t.capacity, t."currentLevel",
          t."fuelType", t.status,
          s.name AS "stationName"
        FROM "Tank" t
        LEFT JOIN "Station" s ON t."stationId" = s.id
        ORDER BY t.name
      `
    )

    // ── Revenue by month (last 6 months) ──
    const revenueByMonth = await safeQuery('FLF-RevenueByMonth', () =>
      sql`
        SELECT
          TO_CHAR("completedAt", 'Mon') AS month,
          COALESCE(SUM("totalAmount"), 0)::float AS revenue
        FROM "Fueling"
        WHERE status = 'completed' AND "completedAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("completedAt", 'Mon'), DATE_TRUNC('month', "completedAt")
        ORDER BY DATE_TRUNC('month', "completedAt") ASC
        LIMIT 6
      `
    )

    // Map stations to ErpClient format
    const mappedClients: ErpClient[] = clients.map((c: any) => ({
      id: c.id,
      companyName: c.name || 'Unknown',
      contactPerson: c.code || '—',
      email: '',
      phone: null,
      city: c.city || null,
      country: c.country || null,
      status: c.isActive ? 'active' : 'inactive',
      industry: 'Fuel & Energy',
      erpSlug: 'fuelflow',
      erpName: 'FuelFlow',
      licenseType: c.stationType || null,
      databaseStatus: c.isActive ? 'active' : 'inactive',
      maxUsers: null,
      maxShops: null,
      selectedModules: c.operatingHours || null,
      createdAt: c.createdAt,
    }))

    // Map fueling transactions as invoices
    const mappedInvoices: ErpInvoice[] = fuelings.map((f: any) => ({
      id: f.id,
      invoiceNumber: `TXN-${safeIdPrefix(f.id, 8).toUpperCase()}`,
      clientName: f.stationName || 'Unknown',
      clientEmail: null,
      erpSlug: 'fuelflow',
      erpName: 'FuelFlow',
      amount: (f.volume || 0) * (f.pricePerUnit || 0),
      tax: 0,
      totalAmount: f.totalAmount || 0,
      status: f.status?.toLowerCase() === 'completed' ? 'paid' : 'pending',
      dueDate: null,
      paidAt: f.status?.toLowerCase() === 'completed' ? f.completedAt || f.createdAt : null,
      createdAt: f.createdAt,
    }))

    // Map serial keys as licenses
    const mappedLicenses: ErpLicense[] = serialKeys.map((sk: any) => ({
      id: sk.id,
      serialKey: sk.key || safeIdPrefix(sk.id, 12).toUpperCase(),
      clientName: `${sk.maxStations || 0} stations / ${sk.maxDispensers || 0} dispensers`,
      erpSlug: 'fuelflow',
      erpName: 'FuelFlow',
      licenseType: sk.plan?.toLowerCase() || 'standard',
      status: sk.status?.toLowerCase() === 'active' ? 'active' : 'expired',
      deviceName: null,
      deviceFingerprint: null,
      activatedAt: sk.activatedAt,
      expiresAt: sk.expiresAt,
      createdAt: sk.createdAt,
    }))

    return {
      totalClients: clients.length,
      activeClients: activeResult?.c ?? 0,
      totalRevenue: revenueResult?.r ?? 0,
      totalInvoices: fuelingCountResult?.c ?? 0,
      activeLicenses: serialKeys.filter((sk: any) => sk.status?.toLowerCase() === 'active').length,
      totalDevices: dispensers.length,
      clientCompanies: mappedClients,
      invoices: mappedInvoices,
      licenses: mappedLicenses,
      revenueByMonth: revenueByMonth.map((r: any) => ({
        month: r.month,
        revenue: r.revenue,
      })),
    }
  } catch (error) {
    console.error('[ERP-CONNECTOR] FuelFlow stats failed completely:', error)
    return null
  }
}

// ─── Aggregate Stats from All Connected ERPs ─────────────────────────────────
export async function getAggregatedStats(): Promise<{
  totalClients: number
  activeClients: number
  totalRevenue: number
  totalInvoices: number
  activeLicenses: number
  totalDevices: number
  clients: ErpClient[]
  invoices: ErpInvoice[]
  licenses: ErpLicense[]
  revenueByMonth: { month: string; revenue: number }[]
  erpBreakdown: { slug: string; name: string; clients: number; revenue: number; licenses: number }[]
}> {
  const activeSlugs = await getActiveErpSlugs()

  let totalClients = 0
  let activeClients = 0
  let totalRevenue = 0
  let totalInvoices = 0
  let activeLicenses = 0
  let totalDevices = 0
  const allClients: ErpClient[] = []
  const allInvoices: ErpInvoice[] = []
  const allLicenses: ErpLicense[] = []
  const revenueByMonthMap: Record<string, number> = {}
  const erpBreakdown: { slug: string; name: string; clients: number; revenue: number; licenses: number }[] = []

  for (const slug of activeSlugs) {
    let stats: ErpDashboardStats | null = null

    try {
      // Quick connectivity check before running full stats queries
      // This avoids creating multiple connections to unreachable databases
      const reachable = await isErpReachable(slug)
      if (!reachable) {
        console.warn(`[ERP-CONNECTOR] ${slug} not reachable, skipping stats`)
        continue
      }

      if (slug === 'apparelflow') {
        stats = await getApparelFlowStats()
      } else if (slug === 'hotelflow') {
        stats = await getHotelFlowStats()
      } else if (slug === 'eduflow') {
        stats = await getEduFlowStats()
      } else if (slug === 'martflow') {
        stats = await getMartFlowStats()
      } else if (slug === 'pharmaflow') {
        stats = await getPharmaFlowStats()
      } else if (slug === 'buildflow') {
        stats = await getBuildFlowStats()
      } else if (slug === 'travelflow') {
        stats = await getTravelFlowStats()
      } else if (slug === 'tenantflow') {
        stats = await getTenantFlowStats()
      } else if (slug === 'factoryflow') {
        stats = await getFactoryFlowStats()
      } else if (slug === 'foodflow') {
        stats = await getFoodFlowStats()
      } else if (slug === 'autoflow') {
        stats = await getAutoFlowStats()
      } else if (slug === 'healthflow') {
        stats = await getHealthFlowStats()
      } else if (slug === 'textileflow') {
        stats = await getTextileFlowStats()
      } else if (slug === 'creativeflow') {
        stats = await getCreativeFlowStats()
      } else if (slug === 'distriflow') {
        stats = await getDistriFlowStats()
      } else if (slug === 'logisticflow') {
        stats = await getLogisticFlowStats()
      } else if (slug === 'fleetflow') {
        stats = await getFleetFlowStats()
      } else if (slug === 'bookflow') {
        stats = await getBookFlowStats()
      } else if (slug === 'fuelflow') {
        stats = await getFuelFlowStats()
      }
    } catch (error) {
      console.error(`[ERP-CONNECTOR] ${slug} stats call failed unexpectedly:`, error instanceof Error ? error.message : error)
      stats = null
    }

    if (stats) {
      totalClients += stats.totalClients
      activeClients += stats.activeClients
      totalRevenue += stats.totalRevenue
      totalInvoices += stats.totalInvoices
      activeLicenses += stats.activeLicenses
      totalDevices += stats.totalDevices
      allClients.push(...stats.clientCompanies)
      allInvoices.push(...stats.invoices)
      allLicenses.push(...stats.licenses)

      for (const r of stats.revenueByMonth) {
        revenueByMonthMap[r.month] = (revenueByMonthMap[r.month] || 0) + r.revenue
      }

      const erpNameMap: Record<string, string> = {
        apparelflow: 'ApparelFlow',
        hotelflow: 'HotelFlow',
        eduflow: 'EduFlow',
        martflow: 'MartFlow',
        pharmaflow: 'PharmaFlow',
        buildflow: 'BuildFlow',
        travelflow: 'TravelFlow',
        tenantflow: 'TenantFlow',
        factoryflow: 'FactoryFlow',
        foodflow: 'FoodFlow',
        autoflow: 'AutoFlow',
        healthflow: 'HealthFlow',
        textileflow: 'TextileFlow',
        creativeflow: 'CreativeFlow',
        distriflow: 'DistriFlow',
        logisticflow: 'LogisticFlow',
        fleetflow: 'FleetFlow',
        electroflow: 'ElectroFlow',
        bookflow: 'BookFlow',
        fuelflow: 'FuelFlow',
      }
      erpBreakdown.push({
        slug,
        name: erpNameMap[slug] || slug,
        clients: stats.totalClients,
        revenue: stats.totalRevenue,
        licenses: stats.activeLicenses,
      })
    }
  }

  // Convert revenue map to sorted array
  const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({
    month,
    revenue,
  }))

  return {
    totalClients,
    activeClients,
    totalRevenue,
    totalInvoices,
    activeLicenses,
    totalDevices,
    clients: allClients,
    invoices: allInvoices,
    licenses: allLicenses,
    revenueByMonth,
    erpBreakdown,
  }
}
