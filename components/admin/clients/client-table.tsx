'use client'

import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface ClientRow {
  id: string; companyName: string; contactPerson: string
  email: string; phone: string | null; status: string
  industry: string | null; erpName: string | null
  erpSystemId: string | null; city: string | null
  country: string | null; createdAt: string
}

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'info' | 'warning'> = {
  active: 'success', inactive: 'neutral', trial: 'info', suspended: 'warning',
}

const ERP_COLORS: Record<string, string> = {
  ApparelFlow: 'bg-teal-500', HotelFlow: 'bg-amber-500', EduFlow: 'bg-emerald-500',
  BuildFlow: 'bg-orange-500', PharmaFlow: 'bg-red-500', TravelFlow: 'bg-cyan-500',
  MartFlow: 'bg-yellow-500', TenantFlow: 'bg-pink-500', FactoryFlow: 'bg-lime-500',
  FoodFlow: 'bg-rose-500', AutoFlow: 'bg-sky-500', HealthFlow: 'bg-fuchsia-500',
  TextileFlow: 'bg-violet-500', CreativeFlow: 'bg-pink-400', LogisticFlow: 'bg-green-500',
  DistriFlow: 'bg-amber-600', FleetFlow: 'bg-cyan-600', ElectroFlow: 'bg-emerald-400',
  BookFlow: 'bg-violet-500',
  FuelFlow: 'bg-orange-500',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ClientTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter()

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Contact Person</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>ERP System</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(c => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/admin/clients/${c.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{c.companyName}</p>
                      {c.industry && <p className="text-[11px] text-muted-foreground">{c.industry}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{c.contactPerson}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.email}</TableCell>
                <TableCell>
                  {c.erpName ? (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${ERP_COLORS[c.erpName] || 'bg-gray-400'}`} />
                      <span className="text-xs">{c.erpName}</span>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <StatusBadge variant={STATUS_MAP[c.status] || 'neutral'} size="sm">
                    {c.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {formatDate(c.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
