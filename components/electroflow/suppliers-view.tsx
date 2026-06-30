'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Search, Loader2, Building2, Phone, Mail, MapPin, Star } from 'lucide-react'
import { formatCurrency } from './data-table'

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  contactPerson: string | null
  paymentTerms: string | null
  rating: number
  isActive: boolean
  _count: { purchaseOrders: number }
}

export function SuppliersView() {
  const [data, setData] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    fetch(`/api/electroflow/suppliers?${params}`)
      .then(r => r.json())
      .then(d => setData(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-xs text-muted-foreground">{data.length} suppliers</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{supplier.name}</h3>
                    {supplier.contactPerson && (
                      <p className="text-[10px] text-muted-foreground">{supplier.contactPerson}</p>
                    )}
                  </div>
                </div>
                <Badge variant={supplier.isActive ? 'default' : 'secondary'} className="text-[10px]">
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-1.5 text-xs">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" /> {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" /> {supplier.email}
                  </div>
                )}
                {supplier.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {supplier.city}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium">{supplier.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {supplier._count.purchaseOrders} orders
                </span>
                {supplier.paymentTerms && (
                  <Badge variant="outline" className="text-[9px]">{supplier.paymentTerms}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
