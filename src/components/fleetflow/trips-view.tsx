'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Route, Search, Plus, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface Trip {
  id: string
  route: string
  vehicle: string
  driver: string
  status: 'completed' | 'in-transit' | 'delayed' | 'cancelled' | 'scheduled'
  distance: string
  duration: string
  revenue: string
  departureTime: string
  arrivalTime: string | null
  cargo: string
}

const mockTrips: Trip[] = [
  { id: 'TRP-1024', route: 'Karachi → Lahore', vehicle: 'LEA-4521', driver: 'Ahmed Khan', status: 'completed', distance: '1,245 km', duration: '18h 30m', revenue: 'PKR 185,000', departureTime: 'Mar 3, 06:00', arrivalTime: 'Mar 4, 00:30', cargo: 'Electronics' },
  { id: 'TRP-1025', route: 'Islamabad → Peshawar', vehicle: 'ISB-7834', driver: 'Bilal Raza', status: 'in-transit', distance: '188 km', duration: '3h 15m', revenue: 'PKR 32,500', departureTime: 'Mar 5, 08:00', arrivalTime: null, cargo: 'Textiles' },
  { id: 'TRP-1026', route: 'Lahore → Faisalabad', vehicle: 'LHR-1190', driver: 'Farhan Ali', status: 'completed', distance: '345 km', duration: '4h 50m', revenue: 'PKR 48,000', departureTime: 'Mar 4, 07:30', arrivalTime: 'Mar 4, 12:20', cargo: 'Agricultural Goods' },
  { id: 'TRP-1027', route: 'Karachi → Quetta', vehicle: 'QTA-3356', driver: 'Sajid Mehmood', status: 'in-transit', distance: '648 km', duration: '10h 20m', revenue: 'PKR 95,000', departureTime: 'Mar 5, 05:00', arrivalTime: null, cargo: 'Construction Material' },
  { id: 'TRP-1028', route: 'Multan → Sukkur', vehicle: 'MLT-8821', driver: 'Waqar Hassan', status: 'delayed', distance: '412 km', duration: '6h 45m', revenue: 'PKR 62,000', departureTime: 'Mar 5, 04:30', arrivalTime: null, cargo: 'FMCG' },
  { id: 'TRP-1029', route: 'Rawalpindi → Sialkot', vehicle: 'RWP-2244', driver: 'Naveed Anwar', status: 'completed', distance: '202 km', duration: '3h 30m', revenue: 'PKR 28,500', departureTime: 'Mar 4, 09:00', arrivalTime: 'Mar 4, 12:30', cargo: 'Sports Goods' },
  { id: 'TRP-1030', route: 'Lahore → Islamabad', vehicle: 'PWR-9901', driver: 'Imran Shahid', status: 'scheduled', distance: '375 km', duration: '5h 15m', revenue: 'PKR 55,000', departureTime: 'Mar 6, 06:00', arrivalTime: null, cargo: 'Pharmaceuticals' },
  { id: 'TRP-1031', route: 'Karachi → Hyderabad', vehicle: 'KHI-5567', driver: 'Unassigned', status: 'cancelled', distance: '164 km', duration: '2h 45m', revenue: 'PKR 0', departureTime: 'N/A', arrivalTime: null, cargo: 'General' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  'completed': { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  'in-transit': { label: 'In Transit', className: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20' },
  'delayed': { label: 'Delayed', className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
  'cancelled': { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
  'scheduled': { label: 'Scheduled', className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
}

export function TripsView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = mockTrips.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.route.toLowerCase().includes(search.toLowerCase()) ||
      t.driver.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
          <p className="text-sm text-muted-foreground">Track and manage fleet trips</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Trip
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-colors ${statusFilter === key ? 'ring-2 ring-cyan-500/30' : ''}`}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{mockTrips.filter(t => t.status === key).length}</p>
              <p className="text-xs text-muted-foreground mt-1">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trip ID, route, driver, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {statusFilter !== 'all' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="text-xs"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Trips Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Trip ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Route</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Driver</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Distance</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Cargo</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Departure</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trip) => (
                  <tr key={trip.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Route className="w-4 h-4 text-cyan-600" />
                        </div>
                        <span className="font-mono text-xs font-semibold">{trip.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{trip.route}</td>
                    <td className="py-3 px-4 font-mono text-xs">{trip.vehicle}</td>
                    <td className="py-3 px-4 text-sm">{trip.driver}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={statusConfig[trip.status].className + ' text-[10px] border-0'}
                      >
                        {statusConfig[trip.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-xs">{trip.distance}</td>
                    <td className="py-3 px-4 text-right text-xs">{trip.duration}</td>
                    <td className="py-3 px-4 text-right font-medium text-xs">{trip.revenue}</td>
                    <td className="py-3 px-4 text-xs">{trip.cargo}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{trip.departureTime}</td>
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
