'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fuel, TrendingUp, TrendingDown } from 'lucide-react'

const fuelLogs = [
  { id: 'FL-001', vehicle: 'LEA-4521', driver: 'Ahmed Khan', date: 'Mar 5, 2026', liters: 120, cost: 'PKR 21,600', station: 'PSO Motorway Lahore', type: 'Diesel' },
  { id: 'FL-002', vehicle: 'ISB-7834', driver: 'Bilal Raza', date: 'Mar 5, 2026', liters: 85, cost: 'PKR 15,300', station: 'Shell GT Road Rawalpindi', type: 'Diesel' },
  { id: 'FL-003', vehicle: 'QTA-3356', driver: 'Sajid Mehmood', date: 'Mar 4, 2026', liters: 150, cost: 'PKR 27,000', station: 'PSO RCD Highway Quetta', type: 'Diesel' },
  { id: 'FL-004', vehicle: 'RWP-2244', driver: 'Naveed Anwar', date: 'Mar 4, 2026', liters: 45, cost: 'PKR 10,800', station: 'Attock petrol Sialkot', type: 'Petrol' },
  { id: 'FL-005', vehicle: 'MLT-8821', driver: 'Waqar Hassan', date: 'Mar 3, 2026', liters: 110, cost: 'PKR 19,800', station: 'Shell N-5 Multan', type: 'Diesel' },
]

export function FuelView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fuel Management</h1>
        <p className="text-sm text-muted-foreground">Track fuel consumption and costs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Fuel className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-xl font-bold">PKR 2.8M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Cost/Km</p>
              <p className="text-xl font-bold">PKR 22.4</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Liters</p>
              <p className="text-xl font-bold">14,520 L</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Fuel Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Driver</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Liters</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Cost</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Station</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{log.id}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{log.vehicle}</td>
                    <td className="py-2.5 px-3">{log.driver}</td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{log.date}</td>
                    <td className="py-2.5 px-3 text-right">{log.liters} L</td>
                    <td className="py-2.5 px-3 text-right font-medium">{log.cost}</td>
                    <td className="py-2.5 px-3 text-xs">{log.station}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px]">{log.type}</Badge>
                    </td>
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
