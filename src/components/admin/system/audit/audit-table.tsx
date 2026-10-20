'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface AuditTableProps {
  logs: any[]
}

const ACTION_VARIANT: Record<string, 'success' | 'info' | 'error' | 'neutral' | 'warning'> = {
  create: 'success', update: 'info', delete: 'error', login: 'neutral', export: 'warning',
}

export function AuditTable({ logs }: AuditTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Entity</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Entity ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <>
                <tr key={log.id} className="border-t border-border/40 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                  <td className="px-2 py-3">
                    {log.changes ? (expanded === log.id ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{log.user?.name || 'System'}</td>
                  <td className="px-4 py-3"><StatusBadge variant={ACTION_VARIANT[log.action] || 'neutral'} size="sm">{log.action}</StatusBadge></td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize">{log.entity}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">{log.entityId?.slice(0, 8) || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">{log.ip || '—'}</td>
                </tr>
                {expanded === log.id && log.changes && (
                  <tr key={`${log.id}-detail`} className="border-t border-border/40 bg-muted/20">
                    <td colSpan={7} className="px-6 py-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Changes:</p>
                      <pre className="text-xs bg-background rounded-md p-3 overflow-x-auto border border-border/40">
                        {typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
