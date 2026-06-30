'use client'

import { useSelectedErp } from '@/hooks/use-selected-erp'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/admin/page-header'
import { DataTable, Column } from '@/components/admin/data-table'
import { ShieldCheck } from 'lucide-react'

const columns: Column[] = [
  { key: 'timestamp', label: 'Time', render: (val) => val ? new Date(val).toLocaleString() : '—' },
  { key: 'user', label: 'User', render: (val, row) => val || row.userId || 'System' },
  { key: 'action', label: 'Action', render: (val) => <span className="font-medium">{val || '—'}</span> },
  { key: 'entity', label: 'Entity', render: (val) => val || '—' },
  { key: 'entityId', label: 'ID', render: (val) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{val || '—'}</code> },
  {
    key: 'status', label: 'Status',
    render: (val) => {
      const colors: Record<string, string> = { success: 'bg-emerald-100 text-emerald-700', error: 'bg-red-100 text-red-700', warning: 'bg-amber-100 text-amber-700' }
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || '—'}</span>
    },
  },
  { key: 'ip', label: 'IP', render: (val) => <code className="text-xs text-muted-foreground">{val || '—'}</code> },
]

export default function AuditLogPage() {
  const { selectedErpId } = useSelectedErp()

  const fetchData = ({ page, pageSize, search }: { page: number; pageSize: number; search: string }) =>
    fetch(`/api/erp/audit-log?erpId=${selectedErpId}&page=${page}&pageSize=${pageSize}&search=${search}`).then(r => r.json())

  return (
    <div>
      <PageHeader title="Audit Log" description="System activity and change history" icon={ShieldCheck} />
      <DataTable
        queryKey="audit-log"
        queryFn={fetchData}
        columns={columns}
        erpId={selectedErpId}
        searchPlaceholder="Search logs..."
        emptyTitle="No audit logs found"
        emptyDescription="Activity will appear here as changes are made"
        pageSize={50}
      />
    </div>
  )
}