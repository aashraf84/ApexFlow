'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Search, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  title: string
  fetchUrl: string
  columns: Column<T>[]
  searchPlaceholder?: string
  filters?: Array<{
    key: string
    label: string
    options: Array<{ value: string; label: string }>
  }>
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
  title, fetchUrl, columns, searchPlaceholder, filters, onRowClick,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
      const res = await fetch(`${fetchUrl}?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchUrl, page, limit, search, activeFilters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleFilterChange = (key: string, value: string) => {
    setPage(1)
    setActiveFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{total} total records</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder || 'Search...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button size="sm" onClick={handleSearch} className="h-9">Search</Button>
            {filters?.map((filter) => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || ''}
                onValueChange={(v) => handleFilterChange(filter.key, v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            <Button size="sm" variant="outline" onClick={fetchData} className="h-9">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key} className={col.className}>
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => (
                    <TableRow
                      key={item.id || i}
                      className={onRowClick ? 'cursor-pointer hover:bg-accent/50' : ''}
                      onClick={() => onRowClick?.(item)}
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key} className={col.className}>
                          {col.render ? col.render(item) : item[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm" variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs px-2">{page} / {totalPages}</span>
            <Button
              size="sm" variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
    paid: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
    received: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
    pending: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
    draft: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20',
    open: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
    overdue: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
    cancelled: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
    shipped: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20',
    in_progress: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20',
    partial: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  }
  return (
    <Badge variant="secondary" className={`text-[10px] capitalize ${variants[status] || 'bg-gray-500/10 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}
