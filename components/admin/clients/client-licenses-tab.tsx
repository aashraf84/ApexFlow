'use client'

import { KeyRound, Copy, Plus } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const LIC_STATUS: Record<string, 'success' | 'neutral' | 'warning'> = {
  active: 'success', expired: 'neutral', revoked: 'warning',
}

const LIC_TYPE: Record<string, string> = {
  trial: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  standard: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  professional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  enterprise: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

function maskKey(key: string) {
  if (key.length <= 8) return key
  return key.slice(0, 4) + '•••••••' + key.slice(-4)
}

export function ClientLicensesTab({ licenses }: { licenses: any[] }) {
  const copyKey = (key: string) => navigator.clipboard.writeText(key)

  if (licenses.length === 0) {
    return <EmptyState icon={<KeyRound className="w-6 h-6" />} title="No licenses" description="Generate a license for this client" actionLabel="Generate License" />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Generate License
        </Button>
      </div>
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Serial Key</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Max Users</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((l: any) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{maskKey(l.serialKey)}</code>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyKey(l.serialKey)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${LIC_TYPE[l.type] || ''}`}>{l.type}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={LIC_STATUS[l.status] || 'neutral'} size="sm">{l.status}</StatusBadge>
                </TableCell>
                <TableCell className="text-sm">{l.maxUsers}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(l.expiresAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
