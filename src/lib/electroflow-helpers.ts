import { efDb, efWithRetry } from '@/lib/ef-db'

export { efDb as db, efWithRetry as withRetry } from '@/lib/ef-db'

/**
 * Get the default tenant ID (first tenant in the database).
 * Used as a fallback when no tenant is specified in requests.
 */
export async function getDefaultTenantId(): Promise<string> {
  const tenant = await efWithRetry((client) =>
    client.tenant.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })
  )
  if (!tenant) {
    throw new Error('No tenant found in database')
  }
  return tenant.id
}

/** Parse pagination query params with sensible defaults */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

/** Build a standard paginated response */
export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
