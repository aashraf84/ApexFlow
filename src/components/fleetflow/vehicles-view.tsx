'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Truck, Search, Plus, Filter
} from 'lucide-react'

interface Vehicle {
  id: string
  plate: string
  type: string
  status: 'active' | 'idle' | 'maintenance' | 'out-of-service'
  driver: string | null
  mileage: string
  nextService: string
  fuelType: string
  capacity: string
  year: number
}

const mockVehicles: Vehicle[] = [
  { id: 'V-001', plate: 'LEA-4521', type: 'Heavy Truck', status: 'active', driver: 'Ahmed Khan', mileage: '245,320 km', nextService: 'Mar 8, 2026', fuelType: 'Diesel', capacity: '20 Ton', year: 2021 },
  { id: 'V-002', plate: 'ISB-7834', type: 'Medium Truck', status: 'active', driver: 'Bilal Raza', mileage: '189,450 km', nextService: 'Mar 12, 2026', fuelType: 'Diesel', capacity: '12 Ton', year: 2022 },
  { id: 'V-003', plate: 'LHR-1190', type: 'Light Truck', status: 'idle', driver: null, mileage: '132,870 km', nextService: 'Mar 20, 2026', fuelType: 'Diesel', capacity: '5 Ton', year: 2020 },
  { id: 'V-004', plate: 'KHI-5567', type: 'Heavy Truck', status: 'maintenance', driver: null, mileage: '310,200 km', nextService: 'In Shop', fuelType: 'Diesel', capacity: '20 Ton', year: 2019 },
  { id: 'V-005', plate: 'QTA-3356', type: 'Medium Truck', status: 'active', driver: 'Sajid Mehmood', mileage: '178,900 km', nextService: 'Mar 25, 2026', fuelType: 'Diesel', capacity: '12 Ton', year: 2022 },
  { id: 'V-006', plate: 'MLT-8821', type: 'Heavy Truck', status: 'active', driver: 'Waqar Hassan', mileage: '267,100 km', nextService: 'Apr 2, 2026', fuelType: 'Diesel', capacity: '20 Ton', year: 2020 },
  { id: 'V-007', plate: 'RWP-2244', type: 'Pickup', status: 'active', driver: 'Naveed Anwar', mileage: '95,340 km', nextService: 'Apr 5, 2026', fuelType: 'Petrol', capacity: '2 Ton', year: 2023 },
  { id: 'V-008', plate: 'FSD-6678', type: 'Medium Truck', status: 'idle', driver: null, mileage: '156,780 km', nextService: 'Apr 10, 2026', fuelType: 'Diesel', capacity: '12 Ton', year: 2021 },
  { id: 'V-009', plate: 'PWR-9901', type: 'Heavy Truck', status: 'active', driver: 'Imran Shahid', mileage: '289,500 km', nextService: 'Mar 15, 2026', fuelType: 'Diesel', capacity: '20 Ton', year: 2019 },
  { id: 'V-010', plate: 'SWL-3345', type: 'Light Truck', status: 'out-of-service', driver: null, mileage: '412,600 km', nextService: 'N/A', fuelType: 'Diesel', capacity: '5 Ton', year: 2017 },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  'active': { label: 'Active', className: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20' },
  'idle': { label: 'Idle', className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
  'maintenance': { label: 'Maintenance', className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
  'out-of-service': { label: 'Out of Service', className: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20' },
}

export function VehiclesView() {
  const [search, setSearch] = useState('')

  const filtered = mockVehicles.filter((v) =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase()) ||
    (v.driver && v.driver.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet vehicles</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-600">{mockVehicles.filter(v => v.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{mockVehicles.filter(v => v.status === 'idle').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Idle</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{mockVehicles.filter(v => v.status === 'maintenance').length}</p>
            <p className="text-xs text-muted-foreground mt-1">In Maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{mockVehicles.filter(v => v.status === 'out-of-service').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Out of Service</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search plate, type, or driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Driver</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Mileage</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Next Service</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Fuel</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-semibold">{vehicle.plate}</p>
                          <p className="text-[10px] text-muted-foreground">{vehicle.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{vehicle.type}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={statusConfig[vehicle.status].className + ' text-[10px] border-0'}
                      >
                        {statusConfig[vehicle.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {vehicle.driver ? (
                        <span className="text-sm">{vehicle.driver}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">{vehicle.mileage}</td>
                    <td className="py-3 px-4 text-xs">{vehicle.nextService}</td>
                    <td className="py-3 px-4 text-xs">{vehicle.fuelType}</td>
                    <td className="py-3 px-4 text-right text-xs">{vehicle.capacity}</td>
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
