'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, Truck } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

const tripPerformance = [
  { month: 'Oct', completed: 98, delayed: 12, cancelled: 3 },
  { month: 'Nov', completed: 105, delayed: 10, cancelled: 2 },
  { month: 'Dec', completed: 112, delayed: 8, cancelled: 4 },
  { month: 'Jan', completed: 108, delayed: 11, cancelled: 2 },
  { month: 'Feb', completed: 115, delayed: 9, cancelled: 1 },
  { month: 'Mar', completed: 121, delayed: 7, cancelled: 3 },
]

const fleetUtilization = [
  { day: 'Mon', utilization: 85 },
  { day: 'Tue', utilization: 92 },
  { day: 'Wed', utilization: 88 },
  { day: 'Thu', utilization: 90 },
  { day: 'Fri', utilization: 78 },
  { day: 'Sat', utilization: 65 },
  { day: 'Sun', utilization: 42 },
]

const topDrivers = [
  { name: 'Sajid Mehmood', trips: 25, rating: 4.9, onTime: 98 },
  { name: 'Ahmed Khan', trips: 22, rating: 4.8, onTime: 95 },
  { name: 'Naveed Anwar', trips: 20, rating: 4.6, onTime: 92 },
  { name: 'Bilal Raza', trips: 19, rating: 4.5, onTime: 90 },
  { name: 'Farhan Ali', trips: 15, rating: 4.2, onTime: 87 },
]

function formatShort(amount: number) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M'
  if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K'
  return amount.toString()
}

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Fleet performance insights and reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Truck className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fleet Utilization</p>
              <p className="text-xl font-bold">77.1%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
              <p className="text-xl font-bold">92.4%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trips This Month</p>
              <p className="text-xl font-bold">131</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Drivers</p>
              <p className="text-xl font-bold">7</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trip Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Trip Performance (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tripPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="delayed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Delayed" />
                <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Utilization by Day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Weekly Fleet Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fleetUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={(v) => v + '%'} />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="utilization" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} name="Utilization" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Drivers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Top Performing Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">#</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Driver</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Trips (Month)</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Rating</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">On-Time %</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((driver, i) => (
                  <tr key={driver.name} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: i === 0 ? '#06b6d4' : i === 1 ? '#14b8a6' : i === 2 ? '#10b981' : '#6b7280' }}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium">{driver.name}</td>
                    <td className="py-2.5 px-3 text-center">{driver.trips}</td>
                    <td className="py-2.5 px-3 text-center">{driver.rating}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={`text-[10px] border-0 ${driver.onTime >= 95 ? 'bg-emerald-500/10 text-emerald-600' : driver.onTime >= 90 ? 'bg-cyan-500/10 text-cyan-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {driver.onTime}%
                      </Badge>
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
