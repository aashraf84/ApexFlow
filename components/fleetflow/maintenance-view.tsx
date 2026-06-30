'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'

const maintenanceRecords = [
  { id: 'MT-001', vehicle: 'LEA-4521', type: 'Oil Change', status: 'pending', scheduledDate: 'Mar 8, 2026', vendor: 'Pak Suzuki Workshop', estimatedCost: 'PKR 15,000', priority: 'high' },
  { id: 'MT-002', vehicle: 'ISB-7834', type: 'Tire Replacement', status: 'scheduled', scheduledDate: 'Mar 12, 2026', vendor: 'General Tire dealer', estimatedCost: 'PKR 85,000', priority: 'medium' },
  { id: 'MT-003', vehicle: 'KHI-5567', type: 'Brake Inspection', status: 'in-progress', scheduledDate: 'Mar 5, 2026', vendor: 'Toyota Motors Karachi', estimatedCost: 'PKR 12,000', priority: 'high' },
  { id: 'MT-004', vehicle: 'LHR-1190', type: 'Engine Service', status: 'completed', scheduledDate: 'Mar 1, 2026', vendor: 'Hino Workshop Lahore', estimatedCost: 'PKR 45,000', priority: 'low' },
  { id: 'MT-005', vehicle: 'QTA-3356', type: 'AC Service', status: 'scheduled', scheduledDate: 'Mar 22, 2026', vendor: 'Cool Air Quetta', estimatedCost: 'PKR 8,000', priority: 'low' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  'pending': { label: 'Pending', className: 'bg-amber-500/10 text-amber-600' },
  'scheduled': { label: 'Scheduled', className: 'bg-blue-500/10 text-blue-600' },
  'in-progress': { label: 'In Progress', className: 'bg-cyan-500/10 text-cyan-600' },
  'completed': { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-600' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  'high': { label: 'Urgent', className: 'bg-red-500/10 text-red-600' },
  'medium': { label: 'Soon', className: 'bg-amber-500/10 text-amber-600' },
  'low': { label: 'Normal', className: 'bg-cyan-500/10 text-cyan-600' },
}

export function MaintenanceView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
        <p className="text-sm text-muted-foreground">Schedule and track vehicle maintenance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{maintenanceRecords.filter(r => r.status === 'pending').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-xl font-bold">{maintenanceRecords.filter(r => r.status === 'scheduled').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-xl font-bold">{maintenanceRecords.filter(r => r.status === 'in-progress').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xl font-bold">{maintenanceRecords.filter(r => r.status === 'completed').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Scheduled</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Vendor</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{record.id}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{record.vehicle}</td>
                    <td className="py-2.5 px-3">{record.type}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={statusConfig[record.status].className + ' text-[10px] border-0'}>
                        {statusConfig[record.status].label}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={priorityConfig[record.priority].className + ' text-[10px] border-0'}>
                        {priorityConfig[record.priority].label}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{record.scheduledDate}</td>
                    <td className="py-2.5 px-3 text-xs">{record.vendor}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-xs">{record.estimatedCost}</td>
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
