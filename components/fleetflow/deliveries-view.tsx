'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Truck, Clock, CheckCircle2 } from 'lucide-react'

const deliveries = [
  { id: 'DLV-001', tripId: 'TRP-1024', customer: 'ElectroMart Lahore', origin: 'Karachi', destination: 'Lahore', status: 'delivered', items: 24, weight: '2.4 Ton', eta: 'Mar 4, 00:30' },
  { id: 'DLV-002', tripId: 'TRP-1025', customer: 'Peshawar Textiles', origin: 'Islamabad', destination: 'Peshawar', status: 'in-transit', items: 12, weight: '1.1 Ton', eta: 'Mar 5, 11:15' },
  { id: 'DLV-003', tripId: 'TRP-1026', customer: 'Faisalabad Agri Co', origin: 'Lahore', destination: 'Faisalabad', status: 'delivered', items: 8, weight: '3.2 Ton', eta: 'Mar 4, 12:20' },
  { id: 'DLV-004', tripId: 'TRP-1027', customer: 'Quetta Builders', origin: 'Karachi', destination: 'Quetta', status: 'in-transit', items: 36, weight: '8.5 Ton', eta: 'Mar 5, 15:20' },
  { id: 'DLV-005', tripId: 'TRP-1028', customer: 'Sukkur General Store', origin: 'Multan', destination: 'Sukkur', status: 'delayed', items: 15, weight: '1.8 Ton', eta: 'Delayed' },
  { id: 'DLV-006', tripId: 'TRP-1029', customer: 'Sialkot Sports Ltd', origin: 'Rawalpindi', destination: 'Sialkot', status: 'delivered', items: 6, weight: '0.9 Ton', eta: 'Mar 4, 12:30' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  'delivered': { label: 'Delivered', className: 'bg-emerald-500/10 text-emerald-600' },
  'in-transit': { label: 'In Transit', className: 'bg-cyan-500/10 text-cyan-600' },
  'delayed': { label: 'Delayed', className: 'bg-amber-500/10 text-amber-600' },
  'pending': { label: 'Pending', className: 'bg-gray-500/10 text-gray-600' },
}

export function DeliveriesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-sm text-muted-foreground">Track shipment deliveries and logistics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-xl font-bold">{deliveries.filter(d => d.status === 'delivered').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-xs text-muted-foreground">In Transit</p>
              <p className="text-xl font-bold">{deliveries.filter(d => d.status === 'in-transit').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Delayed</p>
              <p className="text-xl font-bold">{deliveries.filter(d => d.status === 'delayed').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Items</p>
              <p className="text-xl font-bold">{deliveries.reduce((sum, d) => sum + d.items, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Delivery Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Route</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Items</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Weight</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ETA</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((del) => (
                  <tr key={del.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{del.id}</td>
                    <td className="py-2.5 px-3">{del.customer}</td>
                    <td className="py-2.5 px-3 text-xs">{del.origin} → {del.destination}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={statusConfig[del.status].className + ' text-[10px] border-0'}>
                        {statusConfig[del.status].label}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center">{del.items}</td>
                    <td className="py-2.5 px-3 text-right text-xs">{del.weight}</td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{del.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
