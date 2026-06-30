'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users, Search, Plus, Star
} from 'lucide-react'

interface Driver {
  id: string
  name: string
  license: string
  status: 'on-trip' | 'available' | 'off-duty' | 'suspended'
  rating: number
  tripsThisMonth: number
  phone: string
  totalTrips: number
  joinDate: string
}

const mockDrivers: Driver[] = [
  { id: 'D-001', name: 'Ahmed Khan', license: 'LHR-2019-4521', status: 'on-trip', rating: 4.8, tripsThisMonth: 22, phone: '0300-1234567', totalTrips: 487, joinDate: 'Mar 2019' },
  { id: 'D-002', name: 'Bilal Raza', license: 'ISB-2020-7834', status: 'on-trip', rating: 4.5, tripsThisMonth: 19, phone: '0321-2345678', totalTrips: 356, joinDate: 'Jun 2020' },
  { id: 'D-003', name: 'Farhan Ali', license: 'KHI-2021-1190', status: 'available', rating: 4.2, tripsThisMonth: 15, phone: '0333-3456789', totalTrips: 201, joinDate: 'Jan 2021' },
  { id: 'D-004', name: 'Sajid Mehmood', license: 'QTA-2018-3356', status: 'on-trip', rating: 4.9, tripsThisMonth: 25, phone: '0345-4567890', totalTrips: 612, joinDate: 'Aug 2018' },
  { id: 'D-005', name: 'Waqar Hassan', license: 'MLT-2022-8821', status: 'available', rating: 4.0, tripsThisMonth: 12, phone: '0300-5678901', totalTrips: 134, joinDate: 'Apr 2022' },
  { id: 'D-006', name: 'Naveed Anwar', license: 'RWP-2020-2244', status: 'on-trip', rating: 4.6, tripsThisMonth: 20, phone: '0321-6789012', totalTrips: 389, joinDate: 'Sep 2020' },
  { id: 'D-007', name: 'Imran Shahid', license: 'PWR-2019-9901', status: 'off-duty', rating: 4.3, tripsThisMonth: 8, phone: '0333-7890123', totalTrips: 445, joinDate: 'Feb 2019' },
  { id: 'D-008', name: 'Kamran Yousuf', license: 'SWL-2023-3345', status: 'suspended', rating: 3.1, tripsThisMonth: 0, phone: '0345-8901234', totalTrips: 67, joinDate: 'Nov 2023' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  'on-trip': { label: 'On Trip', className: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20' },
  'available': { label: 'Available', className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  'off-duty': { label: 'Off Duty', className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
  'suspended': { label: 'Suspended', className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

export function DriversView() {
  const [search, setSearch] = useState('')

  const filtered = mockDrivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.license.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet drivers</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-600">{mockDrivers.filter(d => d.status === 'on-trip').length}</p>
            <p className="text-xs text-muted-foreground mt-1">On Trip</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{mockDrivers.filter(d => d.status === 'available').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{mockDrivers.filter(d => d.status === 'off-duty').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Off Duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{mockDrivers.filter(d => d.status === 'suspended').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search name, license, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Driver</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">License</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Rating</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Trips (Month)</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Total Trips</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Since</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((driver) => (
                  <tr key={driver.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{driver.name}</p>
                          <p className="text-[10px] text-muted-foreground">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{driver.license}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={statusConfig[driver.status].className + ' text-[10px] border-0'}
                      >
                        {statusConfig[driver.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StarRating rating={driver.rating} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-semibold">{driver.tripsThisMonth}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs">{driver.totalTrips}</td>
                    <td className="py-3 px-4 font-mono text-xs">{driver.phone}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{driver.joinDate}</td>
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
