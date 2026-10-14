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

function parseMapping(mappingJson: string | null | undefined): ClientSchemaMapping | null {
  if (!mappingJson) return null
  try {
    const m = JSON.parse(mappingJson)
    if (!m || typeof m.clientTable !== 'string' || !m.id || !m.name || !m.email) {
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
        SELECT column_name AS name, data_type AS dataType
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
    // Build the SELECT with mapped columns (identifiers quoted, not parameterized)
    const colId = quoteIdent(mapping.id)
    const colName = quoteIdent(mapping.name)
    const colEmail = quoteIdent(mapping.email)
    const colPhone = mapping.phone ? quoteIdent(mapping.phone) : 'NULL'
    const colCompany = mapping.company ? quoteIdent(mapping.company) : 'NULL'
    const colStatus = mapping.status ? quoteIdent(mapping.status) : "'active'"
    const table = quoteIdent(mapping.clientTable)

    // neon() tagged templates only parameterize values; for dynamic identifiers
    // we use the unsafe() escape hatch with our quoted names.
    const rows = (await withTimeout(
      sql.unsafe(
        `SELECT ${colId} AS id, ${colName} AS name, ${colEmail} AS email, ${colPhone} AS phone, ${colCompany} AS company, ${colStatus} AS status FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`
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
        // Upsert by externalId via SyncTenant linkage; fall back to email.
        let client = null
        const existingTenant = await withRetry((tx) =>
          tx.syncTenant.findFirst({
            where: { connectorId, externalId },
            include: { client: true },
          })
        )
        if (existingTenant?.client) {
          client = existingTenant.client
        } else if (email) {
          client = await withRetry((tx) =>
            tx.client.findUnique({ where: { email } })
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
                company: row.company || client.company,
                companyName: row.company || client.companyName,
                phone: row.phone || client.phone,
                status: (row.status as string) || client.status,
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
                companyName: row.company || name,
                contactPerson: name,
                name,
                email: email || `${externalId}@${connector.erpSlug}.erp`,
                phone: row.phone || null,
                status: (row.status as string) || 'active',
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
      sql.unsafe(insertSql, vals as string[]),
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
      sql.unsafe(
        `SELECT ${colId} AS id, ${colKey} AS serialKey, ${colLic} AS licenseKey, ${colClientRef} AS clientRef, ${colProduct} AS product, ${colStatus} AS status FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`
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

    for (const row of rows) {
      try {
        const serialKey = row.serialKey?.trim()
        if (!serialKey) { failed++; continue }
        // Resolve the ApexFlow clientId from the ERP clientRef via SyncTenant
        let clientId: string | null = null
        if (row.clientRef != null) {
          clientId = refToClient.get(String(row.clientRef)) || null
        }
        await withRetry((tx) =>
          tx.license.upsert({
            where: { serialKey },
            update: {
              licenseKey: row.licenseKey || undefined,
              clientId: clientId || undefined,
              erpSystemId: connector.erpSystemId || undefined,
              status: (row.status as string) || undefined,
              type: row.product || undefined,
            },
            create: {
              serialKey,
              licenseKey: row.licenseKey || serialKey,
              clientId: clientId || undefined,
              erpSystemId: connector.erpSystemId || undefined,
              status: (row.status as string) || 'active',
              type: row.product || 'standard',
            },
          })
        )
        synced++
      } catch (rowErr) {
        failed++
        if (!errMsg) errMsg = `Serial sync failed: ${rowErr instanceof Error ? rowErr.message : String(rowErr)}`
      }
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
      sql.unsafe(
        `SELECT ${colId} AS id, ${colSerial} AS serial, ${colName} AS name, ${colType} AS type, ${colStatus} AS status, ${colClientRef} AS clientRef FROM ${table} LIMIT ${MAX_CLIENTS_PER_SYNC}`
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

    for (const row of rows) {
      try {
        const serial = row.serial?.trim()
        if (!serial) { failed++; continue }
        let clientId: string | null = null
        if (row.clientRef != null) {
          clientId = refToClient.get(String(row.clientRef)) || null
        }
        await withRetry((tx) =>
          tx.erpDevice.upsert({
            where: { serialNumber: serial },
            update: {
              externalId: String(row.id),
              name: row.name || undefined,
              type: row.type || undefined,
              status: (row.status as string) || undefined,
              clientId: clientId || undefined,
              erpSystemId: connector.erpSystemId || undefined,
              lastSyncedAt: new Date(),
            },
            create: {
              serialNumber: serial,
              externalId: String(row.id),
              name: row.name || null,
              type: row.type || null,
              status: (row.status as string) || 'active',
              clientId: clientId || null,
              erpSystemId: connector.erpSystemId || null,
              lastSyncedAt: new Date(),
            },
          })
        )
        synced++
      } catch (rowErr) {
        failed++
        if (!errMsg) errMsg = `Device sync failed: ${rowErr instanceof Error ? rowErr.message : String(rowErr)}`
      }
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
  if (isApi) {
    if (mapping?.serialsEndpoint && mapping?.serialFieldKey) serials = await syncSerialsFromErpApi(connectorId)
    if (mapping?.devicesEndpoint && mapping?.deviceFieldSerial) devices = await syncDevicesFromErpApi(connectorId)
  } else {
    if (mapping?.serialTable && mapping?.serialKey) serials = await syncSerialsFromErp(connectorId)
    if (mapping?.deviceTable && mapping?.deviceSerial) devices = await syncDevicesFromErp(connectorId)
  }
  return { connectorId, erpName: connector?.erpName || 'Unknown', clients, serials, devices }
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
        else if (email) client = await withRetry((tx) => tx.client.findUnique({ where: { email } }))
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
