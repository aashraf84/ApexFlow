'use client'

import { useState } from 'react'
import {
  PieChart, TrendingUp, DollarSign, Users, Monitor, CreditCard, Megaphone, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ReportCard } from './report-card'
import { CustomBuilder } from './custom-builder'
import { ReportViewer } from './report-viewer'
import { ExportDialog } from './export-dialog'

const CATEGORIES = [
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'erp', label: 'ERP Usage', icon: Monitor },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'custom', label: 'Custom', icon: PieChart },
]

const SAMPLE_REPORTS = [
  { id: '1', name: 'Monthly Revenue', type: 'financial', description: 'Revenue breakdown by month including MRR and one-time payments', schedule: 'monthly', lastRunAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', name: 'Client Activity', type: 'crm', description: 'Client engagement metrics and activity trends', schedule: 'weekly', lastRunAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', name: 'ERP Usage Stats', type: 'operational', description: 'Module usage and subscription utilization across ERP systems', schedule: null, lastRunAt: null },
  { id: '4', name: 'Payment Collection', type: 'financial', description: 'Payment collection rates and outstanding balances', schedule: 'daily', lastRunAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '5', name: 'Campaign ROI', type: 'marketing', description: 'Marketing campaign performance and return on investment', schedule: null, lastRunAt: null },
  { id: '6', name: 'Sales Pipeline', type: 'sales', description: 'Deal pipeline conversion rates and values', schedule: 'weekly', lastRunAt: new Date(Date.now() - 259200000).toISOString() },
]

export function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState('revenue')
  const [showBuilder, setShowBuilder] = useState(false)
  const [viewingReport, setViewingReport] = useState<any>(null)
  const [exportReport, setExportReport] = useState<any>(null)

  const handleRun = (id: string) => {
    const r = SAMPLE_REPORTS.find(r => r.id === id)
    if (r) setViewingReport({ ...r, data: [{ label: 'Jan', value: 45000 }, { label: 'Feb', value: 52000 }, { label: 'Mar', value: 49000 }] })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Generate, schedule, and export reports across your platform"
        actions={<Button size="sm" className="gap-1.5" onClick={() => setShowBuilder(true)}><Plus className="w-4 h-4" /> Create Report</Button>} />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Button key={cat.id} variant={activeCategory === cat.id ? 'default' : 'outline'} size="sm" className="gap-1.5"
            onClick={() => setActiveCategory(cat.id)}>
            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_REPORTS.map(report => (
          <ReportCard key={report.id} report={report}
            onRun={handleRun} onEdit={() => setShowBuilder(true)}
            onDuplicate={(id) => console.log('Duplicate', id)}
            onDelete={(id) => console.log('Delete', id)} />
        ))}
      </div>

      {showBuilder && <CustomBuilder open={showBuilder} onClose={() => setShowBuilder(false)} onPreview={setViewingReport} />}
      {viewingReport && <ReportViewer report={viewingReport} open={!!viewingReport} onClose={() => setViewingReport(null)} onExport={() => setExportReport(viewingReport)} />}
      {exportReport && <ExportDialog open={!!exportReport} onClose={() => setExportReport(null)} report={exportReport} />}
    </div>
  )
}
