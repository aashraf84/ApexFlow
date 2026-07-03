import pg from 'pg';

export interface ErpSystemConfig {
  id: string;
  name: string;
  industry: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  sslMode: string;
}

const pools = new Map<string, pg.Pool>();

function getConnectionString(config: ErpSystemConfig): string {
  return `postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?sslmode=${config.sslMode}`;
}

export function getErpPool(config: ErpSystemConfig): pg.Pool {
  if (!pools.has(config.id)) {
    const pool = new pg.Pool({
      connectionString: getConnectionString(config),
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pools.set(config.id, pool);
  }
  return pools.get(config.id)!;
}

export async function queryErp<T = any>(
  config: ErpSystemConfig,
  sql: string,
  params?: any[]
): Promise<T[]> {
  const pool = getErpPool(config);
  const retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    } catch (error: any) {
      if (i === retries - 1) throw error;
      if (
        error.message?.includes('connection') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('cold start') ||
        error.code === '08006' ||
        error.code === '08001'
      ) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  return [];
}

export async function queryErpOne<T = any>(
  config: ErpSystemConfig,
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await queryErp<T>(config, sql, params);
  return rows[0] || null;
}

export async function executeErp(
  config: ErpSystemConfig,
  sql: string,
  params?: any[]
): Promise<void> {
  const pool = getErpPool(config);
  await pool.query(sql, params);
}

export async function getErpDashboardMetrics(config: ErpSystemConfig, tenantId?: string) {
  const tenantFilter = tenantId ? `WHERE "tenantId" = '${tenantId}'` : '';

  const [dealers, retailers, products, orders, invoices, users, collections, warehouses] = await Promise.all([
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "Dealer" ${tenantFilter}`),
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "Retailer" ${tenantFilter}`),
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "Product" ${tenantFilter}`),
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "SalesOrder" ${tenantFilter}`),
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "Invoice" ${tenantFilter}`),
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "User" ${tenantFilter}`),
    queryErpOne<{ sum: string }>(config, `SELECT COALESCE(SUM(amount), 0) as sum FROM "Collection" ${tenantFilter}`),
    queryErpOne<{ count: string }>(config, `SELECT COUNT(*) as count FROM "Warehouse" ${tenantFilter}`),
  ]);

  return {
    dealers: parseInt(dealers?.count || '0'),
    retailers: parseInt(retailers?.count || '0'),
    products: parseInt(products?.count || '0'),
    orders: parseInt(orders?.count || '0'),
    invoices: parseInt(invoices?.count || '0'),
    users: parseInt(users?.count || '0'),
    totalCollections: parseFloat(collections?.sum || '0'),
    warehouses: parseInt(warehouses?.count || '0'),
  };
}

export function closeAllPools() {
  for (const [id, pool] of pools) {
    pool.end();
    pools.delete(id);
  }
}