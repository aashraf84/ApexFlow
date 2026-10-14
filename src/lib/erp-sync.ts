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

// re-export db for convenience
export { db }
