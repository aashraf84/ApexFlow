'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Truck, Users, Route, Fuel, TrendingUp, TrendingDown,
  Clock, AlertTriangle, CheckCircle2, Wrench
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

// Mock data
const vehicleStatusData = [
  { name: 'Active', value: 28, color: '#06b6d4' },
  { name: 'Idle', value: 8, color: '#f59e0b' },
  { name: 'Maintenance', value: 5, color: '#ef4444' },
  { name: 'Out of Service', value: 2, color: '#6b7280' },
]

const recentTrips = [
  { id: 'TRP-1024', route: 'Karachi → Lahore', vehicle: 'LEA-4521', driver: 'Ahmed Khan', status: 'completed', distance: '1,245 km', duration: '18h 30m' },
  { id: 'TRP-1025', route: 'Islamabad → Peshawar', vehicle: 'ISB-7834', driver: 'Bilal Raza', status: 'in-transit', distance: '188 km', duration: '3h 15m' },
  { id: 'TRP-1026', route: 'Lahore → Faisalabad', vehicle: 'LHR-1190', driver: 'Farhan Ali', status: 'completed', distance: '345 km', duration: '4h 50m' },
  { id: 'TRP-1027', route: 'Karachi → Quetta', vehicle: 'QTA-3356', driver: 'Sajid Mehmood', status: 'in-transit', distance: '648 km', duration: '10h 20m' },
  { id: 'TRP-1028', route: 'Multan → Sukkur', vehicle: 'MLT-8821', driver: 'Waqar Hassan', status: 'delayed', distance: '412 km', duration: '6h 45m' },
  { id: 'TRP-1029', route: 'Rawalpindi → Sialkot', vehicle: 'RWP-2244', driver: 'Naveed Anwar', status: 'completed', distance: '202 km', duration: '3h 30m' },
]

const maintenanceAlerts = [
  { vehicle: 'LEA-4521', type: 'Oil Change', due: 'Mar 8, 2026', urgency: 'high' },
  { vehicle: 'ISB-7834', type: 'Tire Replacement', due: 'Mar 12, 2026', urgency: 'medium' },
  { vehicle: 'KHI-5567', type: 'Brake Inspection', due: 'Mar 15, 2026', urgency: 'high' },
  { vehicle: 'LHR-1190', type: 'Engine Service', due: 'Mar 20, 2026', urgency: 'low' },
  { vehicle: 'QTA-3356', type: 'AC Service', due: 'Mar 22, 2026', urgency: 'low' },
]

const kpiCards = [
  { label: 'Total Vehicles', value: '43', icon: Truck, color: 'cyan', trend: '+4.7%', trendUp: true },
  { label: 'Active Trips', value: '18', icon: Route, color: 'teal', trend: '+2.1%', trendUp: true },
  { label: 'On-Time Rate', value: '92.4%', icon: Clock, color: 'emerald', trend: '+1.8%', trendUp: true },
  { label: 'Fuel Cost (Month)', value: 'PKR 2.8M', icon: Fuel, color: 'amber', trend: '-3.2%', trendUp: false },
]

const colorMap: Record<string, string> = {
  cyan: 'bg-cyan-500/10 text-cyan-600',
  teal: 'bg-teal-500/10 text-teal-600',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  amber: 'bg-amber-500/10 text-amber-600',
  rose: 'bg-rose-500/10 text-rose-600',
  blue: 'bg-blue-500/10 text-blue-600',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  'completed': { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  'in-transit': { label: 'In Transit', className: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20' },
  'delayed': { label: 'Delayed', className: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
}

const urgencyConfig: Record<string, { label: string; className: string }> = {
  'high': { label: 'Urgent', className: 'bg-red-500/10 text-red-600' },
  'medium': { label: 'Soon', className: 'bg-amber-500/10 text-amber-600' },
  'low': { label: 'Scheduled', className: 'bg-cyan-500/10 text-cyan-600' },
}

export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back to FleetFlow Management System</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
                <div className={colorMap[kpi.color] + ' p-2 rounded-lg'}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                {kpi.trendUp ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-emerald-500" />
                )}
                <span className="text-emerald-600">{kpi.trend}</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Maintenance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vehicle Status Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {vehicleStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-xs font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Upcoming Maintenance</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{maintenanceAlerts.length} pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceAlerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={urgencyConfig[alert.urgency].className + ' p-2 rounded-lg'}>
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{alert.vehicle}</p>
                      <Badge variant="outline" className={urgencyConfig[alert.urgency].className + ' text-[10px] border-0'}>
                        {urgencyConfig[alert.urgency].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{alert.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Trips</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Last 6</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Trip ID</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Route</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Driver</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Distance</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Duration</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{trip.id}</td>
                    <td className="py-2.5 px-3">{trip.route}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{trip.vehicle}</td>
                    <td className="py-2.5 px-3">{trip.driver}</td>
                    <td className="py-2.5 px-3 text-right">{trip.distance}</td>
                    <td className="py-2.5 px-3 text-right">{trip.duration}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant="outline"
                        className={statusConfig[trip.status]?.className + ' text-[10px] border-0 capitalize'}
                      >
                        {statusConfig[trip.status]?.label || trip.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-cyan-400">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium">Trips Completed Today</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-400">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium">Delayed Trips</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-400">
          <CardContent className="p-4 flex items-center gap-3">
            <Fuel className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-sm font-medium">Avg. Fuel Efficiency</p>
              <p className="text-2xl font-bold">8.2 km/L</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
