'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2 } from 'lucide-react'
import { EmptyState } from './empty-state'

export interface Column<T = any> {
  key: string
  label: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T = any> {
  queryKey: string
  queryFn: (params: { page: number; pageSize: number; search: string }) => Promise<{ data: T[]; total: number; page: number; pageSize: number }>
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onCreate?: () => void
  createLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  actions?: (row: T) => React.ReactNode
  refetchInterval?: number
  erpId?: string | null
}

export function DataTable<T extends Record<string, any>>({
  queryKey,
  queryFn,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 20,
  onEdit,
  onDelete,
  onCreate,
  createLabel = 'Add New',
  emptyTitle = 'No data found',
  emptyDescription,
  actions,
  refetchInterval = 30000,
  erpId,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: rawData, isLoading, isError, refetch } = useQuery({
    queryKey: [queryKey, erpId, page, pageSize, debouncedSearch],
    queryFn: () => queryFn({ page, pageSize, search: debouncedSearch }),
    enabled: !!erpId,
    refetchInterval,
  })

  // Normalize API response: handle both { data: [...] } and { clients: [...], users: [...] } etc.
  const data = rawData ? {
    data: Array.isArray(rawData.data) ? rawData.data : Object.values(rawData).find(v => Array.isArray(v)) || [],
    total: rawData.total ?? (Array.isArray(rawData.data) ? rawData.data.length : Object.values(rawData).find(v => Array.isArray(v))?.length ?? 0),
    page: rawData.page ?? page,
    pageSize: rawData.pageSize ?? pageSize,
  } : null

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const renderCellValue = useCallback((col: Column<T>, row: T) => {
    if (col.render) return col.render(row[col.key], row)
    const val = row[col.key]
    if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>
    if (typeof val === 'boolean') return <Badge variant={val ? 'default' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge>
    return String(val)
  }, [])

  return (
    <div className="space-y-4">
      {/* Search and Create Row */}
      {(searchable || onCreate) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {searchable && (
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {onCreate && (
            <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700">
              + {createLabel}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map(col => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {(onEdit || onDelete || actions) && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                    ))}
                    {(onEdit || onDelete || actions) && <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>}
                  </TableRow>
                ))}
              </>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8">
                  <p className="text-destructive text-sm mb-2">Failed to load data</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={onCreate ? { label: createLabel, onClick: onCreate } : undefined}
                  />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.data?.map((row, i) => (
              <TableRow key={row.id || i} className="cursor-pointer">
                {columns.map(col => (
                  <TableCell key={col.key}>{renderCellValue(col, row)}</TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions?.(row)}
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEdit(row) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(row) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.total > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, data.total)} of {data.total}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}