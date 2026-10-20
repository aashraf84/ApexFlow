/**
 * ApexFlow ERP Sync Engine — data-driven, generic integration.
 *
 * Each linked ERP is represented by an IntegrationConnector row with:
 *   - connectionUrl: the ERP's Neon/Postgres connection string (DB mode)
 *   - schemaMapping: a JSON blob mapping ApexFlow's Client fields to the
 *     ERP's table + columns, e.g.:
 *     { clientTable: "ClientCompany", id: "id", name: "companyName",
 *       email: "email", phone: "phone", company: "companyName",
 *       status: "status" }
 *
 * This replaces the 40 hardcoded per-ERP SQL blobs with ONE generic engine
 * that consumes the mapping. New ERPs are linked by entering a DB URL +
 * picking the client table/columns — no code changes.
 */
import { neon } from '@neondatabase/serverless'
import { db, withRetry } from '@/lib/db'

const SYNC_TIMEOUT_MS = 20_000
const MAX_CLIENTS_PER_SYNC = 1000

export interface ClientSchemaMapping {
  clientTable: string
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status?: string
  // Optional serial/license mapping (syncs ERP serials → ApexFlow License)
  serialTable?: string
  serialId?: string
  serialKey?: string
  licenseKey?: string
  serialClientRef?: string // ERP column referencing the client id
  serialProduct?: string
  serialStatus?: string
  // Optional device mapping (syncs ERP hardware devices → ApexFlow ErpDevice)
  deviceTable?: string
  deviceId?: string
  deviceSerial?: string
  deviceName?: string
  deviceType?: string
  deviceStatus?: string
  deviceClientRef?: string
  // Optional subscription mapping (syncs ERP subscription fields → ApexFlow
  // Subscription). Many ERPs store subscription data ON the client table
  // (licenseType, licenseStatus, billingCycle, expiryDate, etc.) rather than
  // a separate table, so these columns live on the client table.
  subPlan?: string
  subStatus?: string
  subBillingCycle?: string
  subFee?: string
  subStartedAt?: string
  subEndDate?: string
  subMaxUsers?: string
  subMaxLocations?: string
  subClientRef?: string
  // API-mode (mode='api'): connectionUrl = base URL, apiKey = bearer token,
  // endpoints + response field paths replace table/column mappings.
  mode?: string
  clientsEndpoint?: string
  clientFieldId?: string
  clientFieldName?: string
  clientFieldEmail?: string
  clientFieldPhone?: string
  clientFieldCompany?: string
  clientFieldStatus?: string
  serialsEndpoint?: string
  serialFieldId?: string
  serialFieldKey?: string
  serialFieldLicenseKey?: string
  serialFieldClientRef?: string
  serialFieldProduct?: string
  serialFieldStatus?: string
  devicesEndpoint?: string
  deviceFieldId?: string
  deviceFieldSerial?: string
  deviceFieldName?: string
  deviceFieldType?: string
  deviceFieldStatus?: string
  deviceFieldClientRef?: string
  registerClientEndpoint?: string
}

export function parseMapping(mappingJson: string | null | undefined): ClientSchemaMapping | null {
  if (!mappingJson) return null
  try {
    const m = JSON.parse(mappingJson)
    // Only clientTable, id, and name are required. Email/phone/company/status are optional
    // (not all ERP client tables store email — the sync generates a placeholder when missing).
    if (!m || typeof m.clientTable !== 'string' || !m.id || !m.name) {
      return null
    }
    return m as ClientSchemaMapping
  } catch {
    return null
  }
}

/** Quote a SQL identifier (table/column name) safely against injection. */
function quoteIdent(name: string): string {
  return '"' + String(name).replace(/"/g, '""') + '"'
}

/** Race a promise against a timeout; resolve to fallback on failure/timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ])
}

// ============================================
// Connection test + schema discovery
// ============================================

export async function testConnection(
  connectionUrl: string
): Promise<{ connected: boolean; latency?: number; error?: string }> {
  if (!connectionUrl) return { connected: false, error: 'No connection URL' }
  try {
    const start = Date.now()
    const sql = neon(connectionUrl)
    await withTimeout(sql`SELECT 1 AS ok`, SYNC_TIMEOUT_MS)
    return { connected: true, latency: Date.now() - start }
  } catch (e) {
    return {
      connected: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

export async function discoverTables(
  connectionUrl: string
): Promise<{ tables: string[]; error?: string }> {
  try {
    const sql = neon(connectionUrl)
    const rows = (await withTimeout(
      sql`
        SELECT table_name AS name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY table_name
      `,
      SYNC_TIMEOUT_MS
    )) as Array<{ name: string }>
    return { tables: rows.map((r) => r.name).filter(Boolean) }
  } catch (e) {
    return { tables: [], error: e instanceof Error ? e.message : String(e) }
  }
}

export async function discoverColumns(
  connectionUrl: string,
  tableName: string
): Promise<{ columns: Array<{ name: string; dataType: string }>; error?: string }> {
  if (!tableName) return { columns: [] }
  try {
    const sql = neon(connectionUrl)
    const rows = (await withTimeout(
      sql`
        SELECT column_name AS "name", data_type AS "dataType"
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `,
      SYNC_TIMEOUT_MS
    )) as Array<{ name: string; dataType: string }>
    return { columns: rows.map((r) => ({ name: r.name, dataType: r.dataType })) }
  } catch (e) {
    return { columns: [], error: e instanceof Error ? e.message : String(e) }
  }
}

// ============================================
// API-mode helpers (fetch-based, for ERPs without DB access)
// ============================================

/** Extract the first array found in a JSON response (handles [..], {data:[..]}, {clients:[..]}). */
function extractJsonArray(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>
    // common wrappers
    for (const key of ['data', 'items', 'results', 'rows', 'clients', 'serials', 'devices', 'records']) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[]
    }
    // any array value
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) return v as unknown[]
    }
  }
  return []
}

/** Read a (possibly dotted) field path from an object: getJsonField({a:{b:1}}, 'a.b') → 1. */
function getJsonField(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return cur
}

/** Build the Authorization header for an API-mode connector. */
function apiAuthHeaders(apiKey?: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) h['Authorization'] = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`
  return h
}

/** Join a base URL + an endpoint path safely. */
function joinUrl(base: string, endpoint: string): string {
  if (!endpoint) return base
  if (/^https?:\/\//.test(endpoint)) return endpoint
  return (base.replace(/\/$/, '')) + (endpoint.startsWith('/') ? endpoint : '/' + endpoint)
}

/** Test an API-mode connection by fetching an endpoint (defaults to the clients endpoint). */
export async function testApiConnection(
  baseUrl: string,
  apiKey?: string | null,
  endpoint?: string
): Promise<{ connected: boolean; status?: number; sampleFields?: string[]; error?: string }> {
  if (!baseUrl) return { connected: false, error: 'No base URL' }
  const ep = endpoint || '/api/clients'
  const url = joinUrl(baseUrl, ep)
  try {
    const res = await withTimeout(fetch(url, { headers: apiAuthHeaders(apiKey) }), SYNC_TIMEOUT_MS)
    if (!res.ok) return { connected: false, status: res.status, error: `HTTP ${res.status}` }
    const json = await res.json().catch(() => null)
    const arr = extractJsonArray(json)
    const sampleFields = arr.length > 0 && typeof arr[0] === 'object'
      ? Object.keys(arr[0] as Record<string, unknown>).slice(0, 30)
      : []
    return { connected: true, status: res.status, sampleFields }
  } catch (e) {
    return { connected: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ============================================
// Auto-detection: introspect ALL tables + columns in one query, score
// them for client/serial/device match, return the best picks + field mappings
// ============================================

export interface AutoDetectResult {
  tables: Array<{ name: string; columns: Array<{ name: string; dataType: string }> }>
  clientTable?: { name: string; columns: Array<{ name: string; dataType: string }> }
  serialTable?: { name: string; columns: Array<{ name: string; dataType: string }> }
  deviceTable?: { name: string; columns: Array<{ name: string; dataType: string }> }
  clientMapping?: ClientSchemaMapping
  serialMapping?: Partial<ClientSchemaMapping>
  deviceMapping?: Partial<ClientSchemaMapping>
  clientScore?: number
  serialScore?: number
  deviceScore?: number
  totalTables?: number
  error?: string
}

const CLIENT_NAME_PATTERNS = [
  'client', 'customer', 'owner', 'tenant', 'company', 'account', 'contact',
  'user', 'users', 'people', 'person', 'profile', 'profiles', 'member',
  'subscriber', 'subscription', 'lead', 'prospect', 'account', 'erp_client',
  'owner_client', 'business', 'party',
]
const SERIAL_NAME_PATTERNS = [
  'serial', 'license', 'activation', 'key', 'subscription', 'product_key',
  'entitlement', 'subscription_key', 'activation_key', 'license_key',
]
const DEVICE_NAME_PATTERNS = [
  'device', 'imei', 'hardware', 'equipment', 'asset', 'terminal', 'pos',
  'register', 'station', 'unit', 'gadget', 'machine', 'appliance',
]

function scoreTable(tableName: string, columns: Array<{ name: string; dataType: string }>, patterns: string[]): number {
  const nameLower = tableName.toLowerCase()
  let score = 0
  for (const p of patterns) { if (nameLower.includes(p)) score += 10 }
  const colNames = columns.map((c) => c.name.toLowerCase())
  // Bonus for having id-like, name-like, email-like columns (client tables)
  if (patterns === CLIENT_NAME_PATTERNS) {
    if (colNames.some((c) => c === 'id' || c.endsWith('id') || c === 'uuid' || c === 'cuid')) score += 3
    if (colNames.some((c) => c.includes('name') || c.includes('company') || c.includes('contact') || c.includes('owner'))) score += 3
    if (colNames.some((c) => c.includes('email'))) score += 5
    if (colNames.some((c) => c.includes('phone') || c.includes('mobile'))) score += 2
  }
  if (patterns === SERIAL_NAME_PATTERNS) {
    if (colNames.some((c) => c.includes('serial') || c.includes('key') || c.includes('imei'))) score += 5
    if (colNames.some((c) => c.includes('client') || c.includes('customer') || c.includes('owner'))) score += 3
  }
  if (patterns === DEVICE_NAME_PATTERNS) {
    if (colNames.some((c) => c.includes('serial') || c.includes('imei') || c.includes('mac'))) score += 5
    if (colNames.some((c) => c.includes('client') || c.includes('customer') || c.includes('owner'))) score += 3
  }
  return score
}

function autoMapColumns(tableName: string, columns: Array<{ name: string; dataType: string }>): ClientSchemaMapping {
  const cols = columns.map((c) => c.name)
  const find = (candidates: string[]) => cols.find((c) => candidates.some((can) => c.toLowerCase() === can || c.toLowerCase().includes(can))) || ''
  // Fallback: any column ending in '_id' or named 'id'/'uuid' (common PK naming)
  const findId = () => {
    const direct = find(['id', 'uuid', 'cuid', 'objectid', 'guid', 'pk', 'row_id'])
    if (direct) return direct
    return cols.find((c) => c.toLowerCase() === 'id' || c.toLowerCase().endsWith('_id') || c.toLowerCase().endsWith('id')) || ''
  }
  // Fallback for name: any column containing 'name'/'title'/'label' or a varchar text column
  const findName = () => {
    const direct = find(['contactperson', 'name', 'clientname', 'companyname', 'ownername', 'fullname', 'title', 'display_name', 'first_name', 'username', 'login', 'person', 'user'])
    if (direct) return direct
    return cols.find((c) => c.toLowerCase().includes('name') || c.toLowerCase().includes('title') || c.toLowerCase().includes('label')) || ''
  }
  // Fallback for email: any column containing 'mail'
  const findEmail = () => {
    const direct = find(['email', 'emailaddress', 'email_address', 'e_mail', 'mail', 'user_email', 'contact_email', 'email_id', 'mail_address'])
    if (direct) return direct
    return cols.find((c) => c.toLowerCase().includes('mail')) || ''
  }
  return {
    clientTable: tableName,
    id: findId(),
    name: findName(),
    email: findEmail(),
    phone: find(['phone', 'mobile', 'phonenumber', 'contactnumber', 'cell', 'tel', 'telephone', 'phone_number', 'mobile_number']),
    company: find(['company', 'companyname', 'organization', 'businessname', 'firm', 'company_name', 'org', 'business']),
    status: find(['status', 'isactive', 'state', 'active', 'is_active', 'enabled', 'verified', 'state_id']),
    // Subscription fields (auto-detect from the client table — many ERPs store
    // license/subscription data ON the client row, not in a separate table)
    subPlan: find(['licensetype', 'plan', 'subscriptionplan', 'package', 'tier', 'plan_id']),
    subStatus: find(['licensestatus', 'subscriptionstatus', 'substatus', 'isactive', 'is_purchased', 'ispurchased']),
    subBillingCycle: find(['billingcycle', 'billing_cycle', 'subscriptionperiod', 'billing_period', 'cycle']),
    subFee: find(['customlicenseamount', 'monthlyfee', 'monthly_fee', 'posprice', 'price', 'amount', 'fee', 'licenseamount']),
    subStartedAt: find(['issueddate', 'startdate', 'start_date', 'activatedat', 'createdat', 'purchasedate']),
    subEndDate: find(['expirydate', 'enddate', 'end_date', 'expiresat', 'expirationdate', 'validuntil']),
    subMaxUsers: find(['maxusers', 'max_users', 'userlimit', 'seats']),
    subMaxLocations: find(['maxshops', 'maxshops', 'maxlocations', 'max_locations', 'maxstores', 'max_shops']),
    subClientRef: findId(),
  }
}

function autoMapSerial(tableName: string, columns: Array<{ name: string; dataType: string }>): Partial<ClientSchemaMapping> {
  const cols = columns.map((c) => c.name)
  const find = (candidates: string[]) => cols.find((c) => candidates.some((can) => c.toLowerCase() === can || c.toLowerCase().includes(can))) || ''
  return {
    serialTable: tableName,
    serialId: find(['id', 'uuid', 'cuid']),
    serialKey: find(['serial', 'serialkey', 'serialnumber', 'imei', 'licensekey', 'key', 'activationkey']),
    licenseKey: find(['license', 'licensekey', 'activationkey', 'license_code']),
    serialClientRef: find(['clientid', 'customerid', 'ownerid', 'tenantid', 'userid', 'client_id', 'customer_id', 'clientcompanyid', 'clientcompany', 'companyid', 'company_id', 'clientref', 'customerref', 'clientrefid']),
    serialProduct: find(['product', 'productname', 'sku', 'item', 'plan']),
    serialStatus: find(['status', 'isactive', 'activated', 'state', 'is_active']),
  }
}

function autoMapDevice(tableName: string, columns: Array<{ name: string; dataType: string }>): Partial<ClientSchemaMapping> {
  const cols = columns.map((c) => c.name)
  const find = (candidates: string[]) => cols.find((c) => candidates.some((can) => c.toLowerCase() === can || c.toLowerCase().includes(can))) || ''
  return {
    deviceTable: tableName,
    deviceId: find(['id', 'uuid', 'cuid']),
    deviceSerial: find(['serial', 'serialnumber', 'imei', 'deviceid', 'mac', 'device_serial', 'machineid', 'machine_id', 'machinecode', 'code']),
    deviceName: find(['name', 'devicename', 'model', 'product', 'label', 'machinelabel', 'machine_label', 'devicelabel']),
    deviceType: find(['type', 'devicetype', 'category', 'model', 'machinetype', 'device_type']),
    deviceStatus: find(['status', 'isactive', 'state', 'is_active', 'active']),
    deviceClientRef: find(['clientid', 'customerid', 'ownerid', 'tenantid', 'userid', 'client_id', 'customer_id', 'clientcompanyid', 'clientcompany', 'companyid', 'company_id', 'organizationid', 'organization_id']),
  }
}

export async function autoDetectSchema(connectionUrl: string): Promise<AutoDetectResult> {
  if (!connectionUrl) return { tables: [], error: 'No connection URL' }
  try {
    const sql = neon(connectionUrl)
    // ONE query: all tables + all columns
    const rows = (await withTimeout(
      sql`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY table_name, ordinal_position
      `,
      SYNC_TIMEOUT_MS
    )) as Array<{ table_name: string; column_name: string; data_type: string }>

    // Group by table
    const tableMap: Record<string, Array<{ name: string; dataType: string }>> = {}
    for (const row of rows) {
      if (!tableMap[row.table_name]) tableMap[row.table_name] = []
      tableMap[row.table_name].push({ name: row.column_name, dataType: row.data_type })
    }

    const allTables = Object.entries(tableMap).map(([name, columns]) => ({ name, columns }))

    // Score + pick the best client/serial/device tables
    const findBest = (patterns: string[], kind: 'client' | 'serial' | 'device'): { name: string; columns: Array<{ name: string; dataType: string }>; score: number } | null => {
      let best: { name: string; columns: Array<{ name: string; dataType: string }>; score: number } | null = null
      for (const [name, columns] of Object.entries(tableMap)) {
        const score = scoreTable(name, columns, patterns)
        if (score > 0 && (!best || score > best.score)) {
          best = { name, columns, score }
        }
      }
      // Fallback heuristic: if no table matched by name pattern, pick the table
      // that has the strongest "looks like a client/serial/device table" column signature.
      if (!best) {
        let fallback: { name: string; columns: Array<{ name: string; dataType: string }>; score: number } | null = null
        for (const [name, columns] of Object.entries(tableMap)) {
          const colNames = columns.map((c) => c.name.toLowerCase())
          let fscore = 0
          if (kind === 'client') {
            if (colNames.some((c) => c.includes('mail'))) fscore += 6
            if (colNames.some((c) => c.includes('name') || c.includes('company') || c.includes('contact'))) fscore += 4
            if (colNames.some((c) => c.includes('phone') || c.includes('mobile'))) fscore += 3
            if (colNames.some((c) => c === 'id' || c.endsWith('_id') || c === 'uuid')) fscore += 2
            // Skip obvious system/migration tables
            if (/(migration|schema|_prisma|relation|column|table)/i.test(name)) fscore = 0
          } else if (kind === 'serial') {
            if (colNames.some((c) => c.includes('serial') || c.includes('imei') || c.includes('key'))) fscore += 6
            if (colNames.some((c) => c.includes('client') || c.includes('customer') || c.includes('owner'))) fscore += 3
          } else if (kind === 'device') {
            if (colNames.some((c) => c.includes('serial') || c.includes('imei') || c.includes('mac'))) fscore += 6
            if (colNames.some((c) => c.includes('client') || c.includes('customer') || c.includes('owner'))) fscore += 3
          }
          if (fscore >= 6 && (!fallback || fscore > fallback.score)) {
            fallback = { name, columns, score: fscore }
          }
        }
        if (fallback) best = fallback
      }
      return best
    }

    const clientTable = findBest(CLIENT_NAME_PATTERNS, 'client')
    const serialTable = findBest(SERIAL_NAME_PATTERNS, 'serial')
    let deviceTable = findBest(DEVICE_NAME_PATTERNS, 'device')

    // Fallback: if no device table was found by name, but the serial/license table
    // has device-like columns (machineId, machineLabel, imei, mac), treat it as
    // the device table too — each license activation = a device record.
    if (!deviceTable && serialTable) {
      const serialColNames = serialTable.columns.map((c) => c.name.toLowerCase())
      const hasDeviceCols = serialColNames.some((c) =>
        c.includes('machineid') || c.includes('machine_id') ||
        c.includes('machinelabel') || c.includes('machine_label') ||
        c.includes('imei') || c.includes('macaddress') || c.includes('mac_address') ||
        c.includes('ipaddress') || c.includes('ip_address')
      )
      if (hasDeviceCols) {
        deviceTable = { name: serialTable.name, columns: serialTable.columns, score: 1 }
      }
    }
    // Second fallback: scan ALL tables for device-like columns
    if (!deviceTable) {
      for (const [name, columns] of Object.entries(tableMap)) {
        const colNames = columns.map((c) => c.name.toLowerCase())
        if (colNames.some((c) => c.includes('machineid') || c.includes('machinelabel') || c.includes('imei') || c.includes('macaddress'))) {
          if (!/(migration|schema|_prisma)/i.test(name)) {
            deviceTable = { name, columns, score: 1 }
            break
          }
        }
      }
    }

    const clientMapping = clientTable ? autoMapColumns(clientTable.name, clientTable.columns) : undefined
    const serialMapping = serialTable ? autoMapSerial(serialTable.name, serialTable.columns) : undefined
    const deviceMapping = deviceTable ? autoMapDevice(deviceTable.name, deviceTable.columns) : undefined
    return {
      tables: allTables,
      totalTables: allTables.length,
      clientTable: clientTable || undefined,
      serialTable: (serialMapping && serialMapping.serialKey) ? serialTable || undefined : undefined,
      deviceTable: (deviceMapping && deviceMapping.deviceSerial) ? deviceTable || undefined : undefined,
      clientMapping,
      serialMapping: (serialMapping && serialMapping.serialKey) ? serialMapping : undefined,
      deviceMapping: (deviceMapping && deviceMapping.deviceSerial) ? deviceMapping : undefined,
      clientScore: clientTable?.score,
      serialScore: serialTable?.score,
      deviceScore: deviceTable?.score,
    }
  } catch (e) {
    return { tables: [], error: e instanceof Error ? e.message : String(e) }
  }
}

// ============================================
// Inbound sync: ERP → ApexFlow (clients)
// ============================================

export interface SyncResult {
  synced: number
  failed: number
  total: number
  error?: string
}

export async function syncClientsFromErp(
  connectorId: string
): Promise<SyncResult> {
  const connector = await withRetry((tx) =>
    tx.integrationConnector.findUnique({ where: { id: connectorId } })
  )
  if (!connector) return { synced: 0, failed: 0, total: 0, error: 'Connector not found' }
  if (!connector.connectionUrl) {
    return { synced: 0, failed: 0, total: 0, error: 'No connection URL on connector' }
  }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping) {
    return { synced: 0, failed: 0, total: 0, error: 'No schema mapping configured — map the client table + columns first' }
  }

  const startedAt = new Date()
  let synced = 0
  let failed = 0
  let total = 0
  let errMsg: string | undefined

  try {
    const sql = neon(connector.connectionUrl)
    // Build the SELECT with mapped columns (identifiers quoted, not parameterized).
    // Optional fields (email/phone/company/status) fall back to NULL AS <field> when
    // unmapped so the SELECT is still valid SQL even if the ERP has no email column.
    const colId = quoteIdent(mapping.id)
    const colName = quoteIdent(mapping.name)
    const colEmail = mapping.email ? quoteIdent(mapping.email) : 'NULL'
    const colPhone = mapping.phone ? quoteIdent(mapping.phone) : 'NULL'
    const colCompany = mapping.company ? quoteIdent(mapping.company) : 'NULL'
    const colStatus = mapping.status ? quoteIdent(mapping.status) : "'active'"
    const table = quoteIdent(mapping.clientTable)

    // neon() tagged templates only parameterize values; for dynamic identifiers
    // (quoted table/column names) we use sql.query() with an empty params array.
    const rows = (await withTimeout(
      sql.query(
        `SELECT ${colId} AS "id", ${colName} AS "name", ${colEmail} AS "email", ${colPhone} AS "phone", ${colCompany} AS "company", ${colStatus} AS "status" FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`,
        []
      ),
      SYNC_TIMEOUT_MS
    )) as Array<{
      id: string | number
      name: string | null
      email: string | null
      phone?: string | null
      company?: string | null
      status?: string | null
    }>

    total = rows.length

    for (const row of rows) {
      try {
        const email = row.email?.trim() || null
        const name = row.name?.trim() || 'Unknown'
        const externalId = String(row.id)
        // Coerce ERP values to strings (columns may be Date, int, boolean, etc.)
        const companyStr = row.company == null ? undefined : String(row.company)
        const phoneStr = row.phone == null ? undefined : String(row.phone)
        const statusStr = row.status == null ? undefined : String(row.status)
        // The placeholder email used when the ERP has no email for this client.
        // This is deterministic per externalId+erpSlug, so we can search by it
        // to find existing clients even when the real email is empty (prevents
        // duplicates on re-sync).
        const placeholderEmail = `${externalId}@${connector.erpSlug}.erp`
        const searchEmail = email || placeholderEmail
        // Upsert by externalId via SyncTenant linkage; fall back to email
        // (or the deterministic placeholder email if the ERP email is empty).
        let client = null
        const existingTenant = await withRetry((tx) =>
          tx.syncTenant.findFirst({
            where: { connectorId, externalId },
            include: { client: true },
          })
        )
        if (existingTenant?.client) {
          client = existingTenant.client
        } else {
          // email is not @unique on the Client model, so use findFirst.
          // Search by the real email if present, otherwise by the placeholder
          // (so re-syncs find the client created in a previous run, not a dup).
          client = await withRetry((tx) =>
            tx.client.findFirst({ where: { email: searchEmail } })
          )
        }
        if (client) {
          // Update existing client with latest ERP data
          client = await withRetry((tx) =>
            tx.client.update({
              where: { id: client!.id },
              data: {
                contactPerson: name,
                name,
                company: companyStr || client.company,
                companyName: companyStr || client.companyName,
                phone: phoneStr || client.phone,
                status: statusStr || client.status,
                erpSlug: connector.erpSlug,
                erpSystemId: connector.erpSystemId || undefined,
              },
            })
          )
        } else {
          // Create new client
          client = await withRetry((tx) =>
            tx.client.create({
              data: {
                companyName: companyStr || name,
                contactPerson: name,
                name,
                email: email || `${externalId}@${connector.erpSlug}.erp`,
                phone: phoneStr || null,
                status: statusStr || 'active',
                erpSlug: connector.erpSlug,
                erpSystemId: connector.erpSystemId || undefined,
              },
            })
          )
        }
        // Ensure the SyncTenant linkage exists
        if (!existingTenant) {
          await withRetry((tx) =>
            tx.syncTenant.create({
              data: {
                connectorId,
                clientId: client.id,
                externalId,
                status: 'active',
                lastSyncedAt: new Date(),
              },
            }).catch(() => {})
          )
        } else if (!existingTenant.clientId) {
          await withRetry((tx) =>
            tx.syncTenant.update({
              where: { id: existingTenant.id },
              data: { clientId: client.id, lastSyncedAt: new Date() },
            }).catch(() => {})
          )
        }
        synced++
      } catch (rowErr) {
        failed++
        if (!errMsg) errMsg = `Row sync failed: ${rowErr instanceof Error ? rowErr.message : String(rowErr)}`
      }
    }

    // Update the connector status + counts
    await withRetry((tx) =>
      tx.integrationConnector.update({
        where: { id: connectorId },
        data: {
          status: failed === 0 ? 'connected' : 'partial',
          clientCount: synced,
          lastSyncAt: new Date(),
          lastError: errMsg || null,
        },
      })
    )

    // Log the sync
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: failed === 0 ? 'success' : 'partial',
          syncType: 'manual',
          recordsSynced: synced,
          recordsFailed: failed,
          durationMs: Date.now() - startedAt.getTime(),
          errorMessage: errMsg,
        },
      })
    )

    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    // Mark the connector as errored
    await withRetry((tx) =>
      tx.integrationConnector.update({
        where: { id: connectorId },
        data: { status: 'error', lastError: msg, lastSyncAt: new Date() },
      })
    ).catch(() => {})
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: 'failed',
          syncType: 'manual',
          recordsSynced: 0,
          recordsFailed: 0,
          durationMs: Date.now() - startedAt.getTime(),
          errorMessage: msg,
        },
      })
    ).catch(() => {})
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

// ============================================
// Outbound: ApexFlow → ERP (register a client)
// ============================================

export interface RegisterResult {
  success: boolean
  externalId?: string
  error?: string
}

export async function registerClientInErp(
  connectorId: string,
  clientData: { name: string; email: string; phone?: string; company?: string; status?: string }
): Promise<RegisterResult> {
  const connector = await withRetry((tx) =>
    tx.integrationConnector.findUnique({ where: { id: connectorId } })
  )
  if (!connector) return { success: false, error: 'Connector not found' }
  if (!connector.connectionUrl) {
    return { success: false, error: 'No connection URL on connector' }
  }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping) {
    return { success: false, error: 'No schema mapping configured' }
  }
  // API-mode: delegate to the fetch-based register path
  if (mapping.mode === 'api') {
    return registerClientInErpApi(connectorId, clientData)
  }

  const startedAt = new Date()
  try {
    const sql = neon(connector.connectionUrl)
    // Build an INSERT with the mapped columns
    const cols: string[] = []
    const vals: (string | null)[] = []
    if (mapping.name) { cols.push(quoteIdent(mapping.name)); vals.push(clientData.name || 'Unknown') }
    if (mapping.email) { cols.push(quoteIdent(mapping.email)); vals.push(clientData.email) }
    if (mapping.phone && clientData.phone) { cols.push(quoteIdent(mapping.phone)); vals.push(clientData.phone) }
    if (mapping.company && clientData.company) { cols.push(quoteIdent(mapping.company)); vals.push(clientData.company) }
    if (mapping.status && clientData.status) { cols.push(quoteIdent(mapping.status)); vals.push(clientData.status) }
    const table = quoteIdent(mapping.clientTable)
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ')
    const colList = cols.join(', ')

    const insertSql = `INSERT INTO ${table} (${colList}) VALUES (${placeholders}) RETURNING ${quoteIdent(mapping.id)} AS id`
    const result = (await withTimeout(
      sql.query(insertSql, vals as string[]),
      SYNC_TIMEOUT_MS
    )) as Array<{ id: string | number }>
    const externalId = result[0]?.id ? String(result[0].id) : undefined

    // Log the outbound registration
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'outbound',
          status: 'success',
          syncType: 'manual',
          recordsSynced: 1,
          recordsFailed: 0,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ clientEmail: clientData.email, externalId }),
        },
      })
    ).catch(() => {})

    return { success: true, externalId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'outbound',
          status: 'failed',
          syncType: 'manual',
          recordsSynced: 0,
          recordsFailed: 1,
          durationMs: Date.now() - startedAt.getTime(),
          errorMessage: msg,
        },
      })
    ).catch(() => {})
    return { success: false, error: msg }
  }
}

// ============================================
// Inbound sync: ERP → ApexFlow (serials/licenses)
// ============================================

export async function syncSerialsFromErp(connectorId: string): Promise<SyncResult> {
  const connector = await withRetry((tx) =>
    tx.integrationConnector.findUnique({ where: { id: connectorId } })
  )
  if (!connector) return { synced: 0, failed: 0, total: 0, error: 'Connector not found' }
  if (!connector.connectionUrl) {
    return { synced: 0, failed: 0, total: 0, error: 'No connection URL on connector' }
  }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.serialTable || !mapping.serialKey) {
    return { synced: 0, failed: 0, total: 0, error: 'No serial table/key mapping configured' }
  }

  const startedAt = new Date()
  let synced = 0
  let failed = 0
  let total = 0
  let errMsg: string | undefined

  try {
    const sql = neon(connector.connectionUrl)
    const colId = quoteIdent(mapping.serialId || mapping.id)
    const colKey = quoteIdent(mapping.serialKey)
    const colLic = mapping.licenseKey ? quoteIdent(mapping.licenseKey) : 'NULL'
    const colClientRef = mapping.serialClientRef ? quoteIdent(mapping.serialClientRef) : 'NULL'
    const colProduct = mapping.serialProduct ? quoteIdent(mapping.serialProduct) : 'NULL'
    const colStatus = mapping.serialStatus ? quoteIdent(mapping.serialStatus) : "'active'"
    const table = quoteIdent(mapping.serialTable)

    const rows = (await withTimeout(
      sql.query(
        `SELECT ${colId} AS "id", ${colKey} AS "serialKey", ${colLic} AS "licenseKey", ${colClientRef} AS "clientRef", ${colProduct} AS "product", ${colStatus} AS "status" FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`,
        []
      ),
      SYNC_TIMEOUT_MS
    )) as Array<{
      id: string | number
      serialKey: string | null
      licenseKey?: string | null
      clientRef?: string | number | null
      product?: string | null
      status?: string | null
    }>

    total = rows.length

    // Build a lookup of SyncTenant externalId → ApexFlow clientId (for linking serials to clients)
    const tenants = await withRetry((tx) =>
      tx.syncTenant.findMany({ where: { connectorId }, select: { externalId: true, clientId: true } })
    )
    const refToClient = new Map(tenants.filter((t) => t.clientId && t.externalId).map((t) => [String(t.externalId), t.clientId!]))

    let emptyKeyCount = 0
    const errorBreakdown = new Map<string, number>()
    for (const row of rows) {
      try {
        // Prefer serialKey, fall back to licenseKey if serialKey column is empty
        // (not all ERP serial tables have a dedicated serialKey column — some store
        // the key in licenseKey/activationKey instead)
        let serialKey = row.serialKey?.trim()
        if (!serialKey && row.licenseKey) {
          serialKey = row.licenseKey.trim()
        }
        if (!serialKey) {
          failed++
          emptyKeyCount++
          errorBreakdown.set('empty serialKey + licenseKey', (errorBreakdown.get('empty serialKey + licenseKey') || 0) + 1)
          continue
        }
        // Resolve the ApexFlow clientId from the ERP clientRef via SyncTenant
        let clientId: string | null = null
        if (row.clientRef != null) {
          clientId = refToClient.get(String(row.clientRef)) || null
        }
        // Coerce all values to strings/strings|null — ERP columns may be Date, int, etc.
        const statusStr = row.status == null ? undefined : String(row.status)
        const productStr = row.product == null ? undefined : String(row.product)
        const licenseKeyStr = row.licenseKey == null ? undefined : String(row.licenseKey)
        try {
          await withRetry((tx) =>
            tx.license.upsert({
              where: { serialKey },
              update: {
                licenseKey: licenseKeyStr || undefined,
                clientId: clientId || undefined,
                erpSystemId: connector.erpSystemId || undefined,
                status: statusStr || undefined,
                type: productStr || undefined,
              },
              create: {
                serialKey,
                licenseKey: licenseKeyStr || serialKey,
                clientId: clientId || undefined,
                erpSystemId: connector.erpSystemId || undefined,
                status: statusStr || 'active',
                type: productStr || 'standard',
              },
            })
          )
        } catch (upsertErr) {
          // If the upsert failed due to a unique constraint on licenseKey
          // (another row already claimed that licenseKey), retry without
          // setting licenseKey so the serial still syncs.
          const msg = upsertErr instanceof Error ? upsertErr.message : String(upsertErr)
          if (/unique|constraint|already exists/i.test(msg)) {
            await withRetry((tx) =>
              tx.license.upsert({
                where: { serialKey },
                update: {
                  clientId: clientId || undefined,
                  erpSystemId: connector.erpSystemId || undefined,
                  status: (row.status as string) || undefined,
                  type: row.product || undefined,
                },
                create: {
                  serialKey,
                  licenseKey: serialKey, // use serialKey as licenseKey fallback
                  clientId: clientId || undefined,
                  erpSystemId: connector.erpSystemId || undefined,
                  status: (row.status as string) || 'active',
                  type: row.product || 'standard',
                },
              })
            )
          } else {
            throw upsertErr
          }
        }
        synced++
      } catch (rowErr) {
        failed++
        const e = rowErr instanceof Error ? rowErr.message : String(rowErr)
        // Bucket similar errors together (strip IDs/numbers for grouping)
        const bucket = e.replace(/[a-zA-Z0-9]{15,}/g, 'X').slice(0, 120)
        errorBreakdown.set(bucket, (errorBreakdown.get(bucket) || 0) + 1)
      }
    }
    // Build a comprehensive error message covering ALL distinct failure reasons
    if (errorBreakdown.size > 0) {
      const breakdown = Array.from(errorBreakdown.entries())
        .map(([reason, count]) => `${count}× ${reason}`)
        .join('; ')
      errMsg = `Serial sync: ${failed}/${total} failed. ${emptyKeyCount > 0 ? `${emptyKeyCount} empty key(s). ` : ''}Reasons: ${breakdown}`
    }

    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: failed === 0 ? 'success' : 'partial',
          syncType: 'manual',
          recordsSynced: synced,
          recordsFailed: failed,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ entity: 'serials' }),
          errorMessage: errMsg,
        },
      })
    )
    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: 'failed',
          syncType: 'manual',
          recordsSynced: 0,
          recordsFailed: 0,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ entity: 'serials' }),
          errorMessage: msg,
        },
      })
    ).catch(() => {})
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

// ============================================
// Unified connector sync (clients + serials) + auto-sync scheduler
// ============================================

export interface ConnectorSyncResult {
  connectorId: string
  erpName: string
  clients: SyncResult
  serials: SyncResult
  devices: SyncResult
  subscriptions: SyncResult
}

// ============================================
// Inbound sync: ERP → ApexFlow (subscriptions)
// Many ERPs store subscription/license data ON the client table (licenseType,
// licenseStatus, billingCycle, expiryDate, etc.) rather than a separate table.
// This sync reads those columns and creates Subscription records linked to the
// synced clients.
// ============================================

export async function syncSubscriptionsFromErp(connectorId: string): Promise<SyncResult> {
  const connector = await withRetry((tx) =>
    tx.integrationConnector.findUnique({ where: { id: connectorId } })
  )
  if (!connector) return { synced: 0, failed: 0, total: 0, error: 'Connector not found' }
  if (!connector.connectionUrl) {
    return { synced: 0, failed: 0, total: 0, error: 'No connection URL on connector' }
  }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.clientTable) {
    return { synced: 0, failed: 0, total: 0, error: 'No client table mapping configured' }
  }
  // Only sync subscriptions if at least one sub field is mapped
  const hasSubFields = mapping.subPlan || mapping.subStatus || mapping.subFee ||
    mapping.subStartedAt || mapping.subEndDate || mapping.subMaxUsers
  if (!hasSubFields) {
    return { synced: 0, failed: 0, total: 0, error: 'No subscription fields mapped (subPlan/subStatus/subFee/etc.) — skipping' }
  }

  const startedAt = new Date()
  let synced = 0
  let failed = 0
  let total = 0
  let errMsg: string | undefined

  try {
    const sql = neon(connector.connectionUrl)
    // Build SELECT with the mapped sub columns — all optional, fall back to NULL
    const colSubPlan = mapping.subPlan ? quoteIdent(mapping.subPlan) : 'NULL'
    const colSubStatus = mapping.subStatus ? quoteIdent(mapping.subStatus) : 'NULL'
    const colSubCycle = mapping.subBillingCycle ? quoteIdent(mapping.subBillingCycle) : 'NULL'
    const colSubFee = mapping.subFee ? quoteIdent(mapping.subFee) : 'NULL'
    const colSubStart = mapping.subStartedAt ? quoteIdent(mapping.subStartedAt) : 'NULL'
    const colSubEnd = mapping.subEndDate ? quoteIdent(mapping.subEndDate) : 'NULL'
    const colSubMaxUsers = mapping.subMaxUsers ? quoteIdent(mapping.subMaxUsers) : 'NULL'
    const colSubMaxLoc = mapping.subMaxLocations ? quoteIdent(mapping.subMaxLocations) : 'NULL'
    const colId = quoteIdent(mapping.id)
    const table = quoteIdent(mapping.clientTable)

    const rows = (await withTimeout(
      sql.query(
        `SELECT ${colId} AS "id", ${colSubPlan} AS "subPlan", ${colSubStatus} AS "subStatus", ${colSubCycle} AS "subBillingCycle", ${colSubFee} AS "subFee", ${colSubStart} AS "subStartedAt", ${colSubEnd} AS "subEndDate", ${colSubMaxUsers} AS "subMaxUsers", ${colSubMaxLoc} AS "subMaxLocations" FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`,
        []
      ),
      SYNC_TIMEOUT_MS
    )) as Array<{
      id: string | number
      subPlan: string | null
      subStatus: string | null
      subBillingCycle: string | null
      subFee: string | number | null
      subStartedAt: string | Date | null
      subEndDate: string | Date | null
      subMaxUsers: string | number | null
      subMaxLocations: string | number | null
    }>

    total = rows.length

    // Build SyncTenant lookup: externalId → ApexFlow clientId
    const tenants = await withRetry((tx) =>
      tx.syncTenant.findMany({ where: { connectorId }, select: { externalId: true, clientId: true } })
    )
    const refToClient = new Map(tenants.filter((t) => t.clientId && t.externalId).map((t) => [String(t.externalId), t.clientId!]))

    const errorBreakdown = new Map<string, number>()
    for (const row of rows) {
      try {
        const externalId = String(row.id)
        const clientId = refToClient.get(externalId) || null
        if (!clientId) {
          failed++
          errorBreakdown.set('no synced client for externalId', (errorBreakdown.get('no synced client for externalId') || 0) + 1)
          continue
        }
        // Coerce all values — ERP columns may be Date, int, boolean, etc.
        const planStr = row.subPlan == null ? 'starter' : String(row.subPlan).toLowerCase().trim() || 'starter'
        const statusRaw = row.subStatus == null ? 'active' : String(row.subStatus).toLowerCase().trim()
        // Normalize common status values
        const statusStr = /true|active|1/.test(statusRaw) ? 'active'
          : /false|inactive|0/.test(statusRaw) ? 'canceled'
          : /trial/.test(statusRaw) ? 'trial'
          : /expired/.test(statusRaw) ? 'expired'
          : /past|due|overdue/.test(statusRaw) ? 'past_due'
          : 'active'
        const billingCycleStr = row.subBillingCycle == null ? 'monthly' : String(row.subBillingCycle).toLowerCase().trim() || 'monthly'
        // Normalize billing cycle: "1-year" → "annual", "monthly" → "monthly"
        const billingCycle = /year|annual|1-year/.test(billingCycleStr) ? 'annual' : 'monthly'
        const feeNum = row.subFee == null ? 0 : parseFloat(String(row.subFee)) || 0
        const maxUsersNum = row.subMaxUsers == null ? 5 : parseInt(String(row.subMaxUsers), 10) || 5
        const maxLocNum = row.subMaxLocations == null ? null : parseInt(String(row.subMaxLocations), 10) || null
        // Parse dates — ERP may return ISO strings or Date objects
        const parseDate = (v: any) => {
          if (!v) return null
          const d = new Date(v)
          return isNaN(d.getTime()) ? null : d
        }
        const startDate = parseDate(row.subStartedAt) || new Date()
        const endDate = parseDate(row.subEndDate)

        // Upsert subscription by clientId + erpSystemId
        // (one subscription per client per ERP)
        const existing = await withRetry((tx) =>
          tx.subscription.findFirst({
            where: { clientId, erpSystemId: connector.erpSystemId || null },
          })
        )
        if (existing) {
          await withRetry((tx) =>
            tx.subscription.update({
              where: { id: existing.id },
              data: {
                plan: planStr,
                status: statusStr,
                billingCycle,
                monthlyFee: feeNum,
                startDate,
                endDate,
                maxUsers: maxUsersNum,
                maxLocations: maxLocNum || undefined,
              },
            })
          )
        } else {
          await withRetry((tx) =>
            tx.subscription.create({
              data: {
                clientId,
                erpSystemId: connector.erpSystemId || undefined,
                plan: planStr,
                status: statusStr,
                billingCycle,
                monthlyFee: feeNum,
                startDate,
                endDate,
                maxUsers: maxUsersNum,
                maxLocations: maxLocNum || undefined,
              },
            })
          )
        }
        synced++
      } catch (rowErr) {
        failed++
        const e = rowErr instanceof Error ? rowErr.message : String(rowErr)
        const bucket = e.replace(/[a-zA-Z0-9]{15,}/g, 'X').slice(0, 120)
        errorBreakdown.set(bucket, (errorBreakdown.get(bucket) || 0) + 1)
      }
    }
    if (errorBreakdown.size > 0) {
      const breakdown = Array.from(errorBreakdown.entries()).map(([reason, count]) => `${count}× ${reason}`).join('; ')
      errMsg = `Subscription sync: ${failed}/${total} failed. Reasons: ${breakdown}`
    }

    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: failed === 0 ? 'success' : 'partial',
          syncType: 'manual',
          recordsSynced: synced,
          recordsFailed: failed,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ entity: 'subscriptions' }),
          errorMessage: errMsg,
        },
      })
    )
    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: 'failed',
          syncType: 'manual',
          recordsSynced: 0,
          recordsFailed: 0,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ entity: 'subscriptions' }),
          errorMessage: msg,
        },
      })
    ).catch(() => {})
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

// ============================================
// Inbound sync: ERP → ApexFlow (devices)
// ============================================

export async function syncDevicesFromErp(connectorId: string): Promise<SyncResult> {
  const connector = await withRetry((tx) =>
    tx.integrationConnector.findUnique({ where: { id: connectorId } })
  )
  if (!connector) return { synced: 0, failed: 0, total: 0, error: 'Connector not found' }
  if (!connector.connectionUrl) {
    return { synced: 0, failed: 0, total: 0, error: 'No connection URL on connector' }
  }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.deviceTable || !mapping.deviceSerial) {
    return { synced: 0, failed: 0, total: 0, error: 'No device table/serial mapping configured' }
  }

  const startedAt = new Date()
  let synced = 0
  let failed = 0
  let total = 0
  let errMsg: string | undefined

  try {
    const sql = neon(connector.connectionUrl)
    const colId = quoteIdent(mapping.deviceId || 'id')
    const colSerial = quoteIdent(mapping.deviceSerial)
    const colName = mapping.deviceName ? quoteIdent(mapping.deviceName) : 'NULL'
    const colType = mapping.deviceType ? quoteIdent(mapping.deviceType) : 'NULL'
    const colStatus = mapping.deviceStatus ? quoteIdent(mapping.deviceStatus) : "'active'"
    const colClientRef = mapping.deviceClientRef ? quoteIdent(mapping.deviceClientRef) : 'NULL'
    const table = quoteIdent(mapping.deviceTable)

    const rows = (await withTimeout(
      sql.query(
        `SELECT ${colId} AS "id", ${colSerial} AS "serial", ${colName} AS "name", ${colType} AS "type", ${colStatus} AS "status", ${colClientRef} AS "clientRef" FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`,
        []
      ),
      SYNC_TIMEOUT_MS
    )) as Array<{
      id: string | number
      serial: string | null
      name?: string | null
      type?: string | null
      status?: string | null
      clientRef?: string | number | null
    }>

    total = rows.length

    // SyncTenant lookup: externalId (client) → ApexFlow clientId
    const tenants = await withRetry((tx) =>
      tx.syncTenant.findMany({ where: { connectorId }, select: { externalId: true, clientId: true } })
    )
    const refToClient = new Map(tenants.filter((t) => t.clientId && t.externalId).map((t) => [String(t.externalId), t.clientId!]))

    let emptySerialCount = 0
    const devErrorBreakdown = new Map<string, number>()
    for (const row of rows) {
      try {
        const serial = row.serial?.trim()
        if (!serial) {
          failed++
          emptySerialCount++
          devErrorBreakdown.set('empty deviceSerial', (devErrorBreakdown.get('empty deviceSerial') || 0) + 1)
          continue
        }
        let clientId: string | null = null
        if (row.clientRef != null) {
          clientId = refToClient.get(String(row.clientRef)) || null
        }
        // Coerce ERP values to strings (columns may be Date, int, boolean, etc.)
        const nameStr = row.name == null ? null : String(row.name)
        const typeStr = row.type == null ? null : String(row.type)
        const statusStr = row.status == null ? 'active' : String(row.status)
        await withRetry((tx) =>
          tx.erpDevice.upsert({
            where: { serialNumber: serial },
            update: {
              externalId: String(row.id),
              name: nameStr || undefined,
              type: typeStr || undefined,
              status: statusStr || undefined,
              clientId: clientId || undefined,
              erpSystemId: connector.erpSystemId || undefined,
              lastSyncedAt: new Date(),
            },
            create: {
              serialNumber: serial,
              externalId: String(row.id),
              name: nameStr,
              type: typeStr,
              status: statusStr || 'active',
              clientId: clientId || null,
              erpSystemId: connector.erpSystemId || null,
              lastSyncedAt: new Date(),
            },
          })
        )
        synced++
      } catch (rowErr) {
        failed++
        const e = rowErr instanceof Error ? rowErr.message : String(rowErr)
        const bucket = e.replace(/[a-zA-Z0-9]{15,}/g, 'X').slice(0, 120)
        devErrorBreakdown.set(bucket, (devErrorBreakdown.get(bucket) || 0) + 1)
      }
    }
    if (devErrorBreakdown.size > 0) {
      const breakdown = Array.from(devErrorBreakdown.entries())
        .map(([reason, count]) => `${count}× ${reason}`)
        .join('; ')
      errMsg = `Device sync: ${failed}/${total} failed. ${emptySerialCount > 0 ? `${emptySerialCount} empty serial(s). ` : ''}Reasons: ${breakdown}`
    }

    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: failed === 0 ? 'success' : 'partial',
          syncType: 'manual',
          recordsSynced: synced,
          recordsFailed: failed,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ entity: 'devices' }),
          errorMessage: errMsg,
        },
      })
    )
    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await withRetry((tx) =>
      tx.syncLog.create({
        data: {
          erpSystemId: connector.erpSystemId || undefined,
          erpSlug: connector.erpSlug,
          erpName: connector.erpName,
          direction: 'inbound',
          status: 'failed',
          syncType: 'manual',
          recordsSynced: 0,
          recordsFailed: 0,
          durationMs: Date.now() - startedAt.getTime(),
          metadata: JSON.stringify({ entity: 'devices' }),
          errorMessage: msg,
        },
      })
    ).catch(() => {})
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

/** Sync clients + serials (if mapped) for a connector. Used by the cron + manual Sync. */
export async function syncConnector(connectorId: string): Promise<ConnectorSyncResult> {
  const connector = await withRetry((tx) =>
    tx.integrationConnector.findUnique({ where: { id: connectorId }, select: { id: true, erpName: true, schemaMapping: true } })
  )
  const mapping = parseMapping(connector?.schemaMapping)
  const isApi = mapping?.mode === 'api'
  const clients = isApi ? await syncClientsFromErpApi(connectorId) : await syncClientsFromErp(connectorId)
  let serials: SyncResult = { synced: 0, failed: 0, total: 0 }
  let devices: SyncResult = { synced: 0, failed: 0, total: 0 }
  let subscriptions: SyncResult = { synced: 0, failed: 0, total: 0 }
  if (isApi) {
    if (mapping?.serialsEndpoint && mapping?.serialFieldKey) serials = await syncSerialsFromErpApi(connectorId)
    if (mapping?.devicesEndpoint && mapping?.deviceFieldSerial) devices = await syncDevicesFromErpApi(connectorId)
  } else {
    if (mapping?.serialTable && mapping?.serialKey) serials = await syncSerialsFromErp(connectorId)
    if (mapping?.deviceTable && mapping?.deviceSerial) devices = await syncDevicesFromErp(connectorId)
    // Sync subscriptions (reads from the client table — many ERPs store
    // subscription data ON the client row, not in a separate table)
    if (mapping?.subPlan || mapping?.subStatus || mapping?.subFee) {
      subscriptions = await syncSubscriptionsFromErp(connectorId)
    }
  }
  return { connectorId, erpName: connector?.erpName || 'Unknown', clients, serials, devices, subscriptions }
}

/**
 * syncDueConnectors — finds autoSync connectors whose lastSyncAt + syncInterval
 * is in the past (or never synced), syncs up to `limit` of them. Used by the
 * Vercel Cron route so each cron run processes a bounded batch (stays within
 * the function timeout) and cycles through all due connectors over time.
 */
export async function syncDueConnectors(limit = 2): Promise<{
  processed: number
  results: ConnectorSyncResult[]
  skipped: number
}> {
  const now = new Date()
  // Find autoSync connectors that are due: never synced OR lastSyncAt + syncInterval < now
  const all = await withRetry((tx) =>
    tx.integrationConnector.findMany({
      where: { autoSync: true, connectionUrl: { not: null } },
      select: { id: true, lastSyncAt: true, syncInterval: true },
    })
  )
  const due = all.filter((c) => {
    if (!c.lastSyncAt) return true
    const dueAt = new Date(c.lastSyncAt.getTime() + c.syncInterval * 1000)
    return dueAt < now
  })
  const toProcess = due.slice(0, limit)
  const results: ConnectorSyncResult[] = []
  for (const c of toProcess) {
    try {
      const res = await syncConnector(c.id)
      results.push(res)
    } catch (e) {
      // continue — the individual sync logs the error
    }
  }
  return { processed: toProcess.length, results, skipped: due.length - toProcess.length }
}

// ============================================
// API-mode sync (fetch-based, mode='api')
// ============================================

async function syncClientsFromErpApi(connectorId: string): Promise<SyncResult> {
  const connector = await withRetry((tx) => tx.integrationConnector.findUnique({ where: { id: connectorId } }))
  if (!connector || !connector.connectionUrl || !connector.apiKey && !connector.connectionUrl) {
    return { synced: 0, failed: 0, total: 0, error: 'No base URL on connector' }
  }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.clientsEndpoint || !mapping.clientFieldId || !mapping.clientFieldName || !mapping.clientFieldEmail) {
    return { synced: 0, failed: 0, total: 0, error: 'No clients endpoint/field mapping configured' }
  }
  const startedAt = new Date()
  let synced = 0, failed = 0, total = 0, errMsg: string | undefined
  try {
    const res = await withTimeout(fetch(joinUrl(connector.connectionUrl, mapping.clientsEndpoint), { headers: apiAuthHeaders(connector.apiKey) }), SYNC_TIMEOUT_MS)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const rows = extractJsonArray(json)
    total = rows.length
    for (const row of rows) {
      try {
        const externalId = String(getJsonField(row, mapping.clientFieldId) ?? '')
        const email = String(getJsonField(row, mapping.clientFieldEmail) ?? '').trim() || null
        const name = String(getJsonField(row, mapping.clientFieldName) ?? 'Unknown')
        const phone = mapping.clientFieldPhone ? String(getJsonField(row, mapping.clientFieldPhone) ?? '') || null : null
        const company = mapping.clientFieldCompany ? String(getJsonField(row, mapping.clientFieldCompany) ?? '') || null : null
        const status = mapping.clientFieldStatus ? String(getJsonField(row, mapping.clientFieldStatus) ?? '') || 'active' : 'active'
        // Upsert by externalId via SyncTenant, fallback to email
        let client = null
        const existingTenant = await withRetry((tx) => tx.syncTenant.findFirst({ where: { connectorId, externalId }, include: { client: true } }))
        if (existingTenant?.client) client = existingTenant.client
        // email is not @unique on Client → use findFirst (findUnique would throw)
        else if (email) client = await withRetry((tx) => tx.client.findFirst({ where: { email } }))
        if (client) {
          client = await withRetry((tx) => tx.client.update({ where: { id: client!.id }, data: { contactPerson: name, name, company: company || client.company, companyName: company || client.companyName, phone: phone || client.phone, status, erpSlug: connector.erpSlug, erpSystemId: connector.erpSystemId || undefined } }))
        } else {
          client = await withRetry((tx) => tx.client.create({ data: { companyName: company || name, contactPerson: name, name, email: email || `${externalId}@${connector.erpSlug}.erp`, phone, status, erpSlug: connector.erpSlug, erpSystemId: connector.erpSystemId || undefined } }))
        }
        if (!existingTenant) { await withRetry((tx) => tx.syncTenant.create({ data: { connectorId, clientId: client.id, externalId, status: 'active', lastSyncedAt: new Date() } }).catch(() => {})) }
        synced++
      } catch (e) { failed++; if (!errMsg) errMsg = `Row sync failed: ${e instanceof Error ? e.message : String(e)}` }
    }
    await withRetry((tx) => tx.integrationConnector.update({ where: { id: connectorId }, data: { status: failed === 0 ? 'connected' : 'partial', clientCount: synced, lastSyncAt: new Date(), lastError: errMsg || null } }))
    await logSync(connector, 'inbound', 'clients', synced, failed, startedAt, errMsg)
    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await withRetry((tx) => tx.integrationConnector.update({ where: { id: connectorId }, data: { status: 'error', lastError: msg, lastSyncAt: new Date() } })).catch(() => {})
    await logSync(connector, 'inbound', 'clients', 0, 0, startedAt, msg)
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

async function syncSerialsFromErpApi(connectorId: string): Promise<SyncResult> {
  const connector = await withRetry((tx) => tx.integrationConnector.findUnique({ where: { id: connectorId } }))
  if (!connector || !connector.connectionUrl) return { synced: 0, failed: 0, total: 0, error: 'No base URL' }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.serialsEndpoint || !mapping.serialFieldKey) return { synced: 0, failed: 0, total: 0, error: 'No serials endpoint/key mapping' }
  const startedAt = new Date()
  let synced = 0, failed = 0, total = 0, errMsg: string | undefined
  try {
    const res = await withTimeout(fetch(joinUrl(connector.connectionUrl, mapping.serialsEndpoint), { headers: apiAuthHeaders(connector.apiKey) }), SYNC_TIMEOUT_MS)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = extractJsonArray(await res.json())
    total = rows.length
    const tenants = await withRetry((tx) => tx.syncTenant.findMany({ where: { connectorId }, select: { externalId: true, clientId: true } }))
    const refToClient = new Map(tenants.filter((t) => t.clientId && t.externalId).map((t) => [String(t.externalId), t.clientId!]))
    for (const row of rows) {
      try {
        const serialKey = String(getJsonField(row, mapping.serialFieldKey) ?? '').trim()
        if (!serialKey) { failed++; continue }
        const clientId = mapping.serialFieldClientRef ? refToClient.get(String(getJsonField(row, mapping.serialFieldClientRef) ?? '')) || null : null
        await withRetry((tx) => tx.license.upsert({
          where: { serialKey },
          update: { licenseKey: mapping.serialFieldLicenseKey ? String(getJsonField(row, mapping.serialFieldLicenseKey) ?? '') || undefined : undefined, clientId: clientId || undefined, erpSystemId: connector.erpSystemId || undefined, status: mapping.serialFieldStatus ? String(getJsonField(row, mapping.serialFieldStatus) ?? '') || undefined : undefined, type: mapping.serialFieldProduct ? String(getJsonField(row, mapping.serialFieldProduct) ?? '') || undefined : undefined },
          create: { serialKey, licenseKey: (mapping.serialFieldLicenseKey ? String(getJsonField(row, mapping.serialFieldLicenseKey) ?? '') : '') || serialKey, clientId: clientId || undefined, erpSystemId: connector.erpSystemId || undefined, status: mapping.serialFieldStatus ? String(getJsonField(row, mapping.serialFieldStatus) ?? '') || 'active' : 'active', type: mapping.serialFieldProduct ? String(getJsonField(row, mapping.serialFieldProduct) ?? '') || 'standard' : 'standard' },
        }))
        synced++
      } catch (e) { failed++; if (!errMsg) errMsg = `Serial sync failed: ${e instanceof Error ? e.message : String(e)}` }
    }
    await logSync(connector, 'inbound', 'serials', synced, failed, startedAt, errMsg)
    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await logSync(connector, 'inbound', 'serials', 0, 0, startedAt, msg)
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

async function syncDevicesFromErpApi(connectorId: string): Promise<SyncResult> {
  const connector = await withRetry((tx) => tx.integrationConnector.findUnique({ where: { id: connectorId } }))
  if (!connector || !connector.connectionUrl) return { synced: 0, failed: 0, total: 0, error: 'No base URL' }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.devicesEndpoint || !mapping.deviceFieldSerial) return { synced: 0, failed: 0, total: 0, error: 'No devices endpoint/serial mapping' }
  const startedAt = new Date()
  let synced = 0, failed = 0, total = 0, errMsg: string | undefined
  try {
    const res = await withTimeout(fetch(joinUrl(connector.connectionUrl, mapping.devicesEndpoint), { headers: apiAuthHeaders(connector.apiKey) }), SYNC_TIMEOUT_MS)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = extractJsonArray(await res.json())
    total = rows.length
    const tenants = await withRetry((tx) => tx.syncTenant.findMany({ where: { connectorId }, select: { externalId: true, clientId: true } }))
    const refToClient = new Map(tenants.filter((t) => t.clientId && t.externalId).map((t) => [String(t.externalId), t.clientId!]))
    for (const row of rows) {
      try {
        const serial = String(getJsonField(row, mapping.deviceFieldSerial) ?? '').trim()
        if (!serial) { failed++; continue }
        const clientId = mapping.deviceFieldClientRef ? refToClient.get(String(getJsonField(row, mapping.deviceFieldClientRef) ?? '')) || null : null
        const externalId = mapping.deviceFieldId ? String(getJsonField(row, mapping.deviceFieldId) ?? '') : serial
        await withRetry((tx) => tx.erpDevice.upsert({
          where: { serialNumber: serial },
          update: { externalId, name: mapping.deviceFieldName ? String(getJsonField(row, mapping.deviceFieldName) ?? '') || undefined : undefined, type: mapping.deviceFieldType ? String(getJsonField(row, mapping.deviceFieldType) ?? '') || undefined : undefined, status: mapping.deviceFieldStatus ? String(getJsonField(row, mapping.deviceFieldStatus) ?? '') || undefined : undefined, clientId: clientId || undefined, erpSystemId: connector.erpSystemId || undefined, lastSyncedAt: new Date() },
          create: { serialNumber: serial, externalId, name: mapping.deviceFieldName ? String(getJsonField(row, mapping.deviceFieldName) ?? '') || null : null, type: mapping.deviceFieldType ? String(getJsonField(row, mapping.deviceFieldType) ?? '') || null : null, status: mapping.deviceFieldStatus ? String(getJsonField(row, mapping.deviceFieldStatus) ?? '') || 'active' : 'active', clientId: clientId || null, erpSystemId: connector.erpSystemId || null, lastSyncedAt: new Date() },
        }))
        synced++
      } catch (e) { failed++; if (!errMsg) errMsg = `Device sync failed: ${e instanceof Error ? e.message : String(e)}` }
    }
    await logSync(connector, 'inbound', 'devices', synced, failed, startedAt, errMsg)
    return { synced, failed, total, error: errMsg }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await logSync(connector, 'inbound', 'devices', 0, 0, startedAt, msg)
    return { synced: 0, failed: 0, total: 0, error: msg }
  }
}

async function registerClientInErpApi(connectorId: string, data: { name: string; email: string; phone?: string; company?: string; status?: string }): Promise<RegisterResult> {
  const connector = await withRetry((tx) => tx.integrationConnector.findUnique({ where: { id: connectorId } }))
  if (!connector || !connector.connectionUrl) return { success: false, error: 'No base URL' }
  const mapping = parseMapping(connector.schemaMapping)
  if (!mapping || !mapping.registerClientEndpoint) return { success: false, error: 'No register-client endpoint configured' }
  const startedAt = new Date()
  try {
    const res = await withTimeout(fetch(joinUrl(connector.connectionUrl, mapping.registerClientEndpoint!), { method: 'POST', headers: apiAuthHeaders(connector.apiKey), body: JSON.stringify(data) }), SYNC_TIMEOUT_MS)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json().catch(() => ({}))
    const externalId = String(getJsonField(json, mapping.clientFieldId || 'id') ?? '') || undefined
    await withRetry((tx) => tx.syncLog.create({ data: { erpSystemId: connector.erpSystemId || undefined, erpSlug: connector.erpSlug, erpName: connector.erpName, direction: 'outbound', status: 'success', syncType: 'manual', recordsSynced: 1, recordsFailed: 0, durationMs: Date.now() - startedAt.getTime(), metadata: JSON.stringify({ clientEmail: data.email, externalId }) } })).catch(() => {})
    return { success: true, externalId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await withRetry((tx) => tx.syncLog.create({ data: { erpSystemId: connector.erpSystemId || undefined, erpSlug: connector.erpSlug, erpName: connector.erpName, direction: 'outbound', status: 'failed', syncType: 'manual', recordsSynced: 0, recordsFailed: 1, durationMs: Date.now() - startedAt.getTime(), errorMessage: msg } })).catch(() => {})
    return { success: false, error: msg }
  }
}

/** Shared SyncLog writer for API-mode syncs. */
async function logSync(connector: { erpSystemId?: string | null; erpSlug: string; erpName: string }, direction: string, entity: string, synced: number, failed: number, startedAt: Date, errMsg?: string) {
  await withRetry((tx) => tx.syncLog.create({ data: { erpSystemId: connector.erpSystemId || undefined, erpSlug: connector.erpSlug, erpName: connector.erpName, direction, status: failed === 0 ? 'success' : 'partial', syncType: 'manual', recordsSynced: synced, recordsFailed: failed, durationMs: Date.now() - startedAt.getTime(), metadata: JSON.stringify({ entity, mode: 'api' }), errorMessage: errMsg } })).catch(() => {})
}

// re-export db for convenience
export { db }
