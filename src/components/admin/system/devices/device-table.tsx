'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface DeviceTableProps {
  devices: any[]
  onRefresh: () => void
}

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'neutral'> = { active: 'success', blocked: 'error', expired: 'neutral' }

export function DeviceTable({ devices, onRefresh }: DeviceTableProps) {
  const [blockDialog, setBlockDialog] = useState<any>(null)
  const [blockReason, setBlockReason] = useState('')

  const handleBlock = async () => {
    await fetch('/api/admin/devices', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blockDialog.id, status: 'blocked', reason: blockReason }),
    })
    setBlockDialog(null); setBlockReason(''); onRefresh()
  }

  const handleUnblock = async (id: string) => {
    await fetch('/api/admin/devices', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'active' }),
    })
    onRefresh()
  }

  return (
    <>
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Device</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">OS</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Browser</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Registered</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Last Active</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{device.name || 'Unknown Device'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{device.os || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{device.browser || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">{device.ip || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge variant={STATUS_VARIANT[device.status] || 'neutral'} size="sm">{device.status}</StatusBadge></td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(device.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {device.status === 'blocked' ? (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--gg-green)]" onClick={() => handleUnblock(device.id)}>Unblock</Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--gg-rose)]" onClick={() => setBlockDialog(device)}>Block</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!blockDialog} onOpenChange={() => { setBlockDialog(null); setBlockReason('') }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Block Device</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Block <strong>{blockDialog?.name || 'this device'}</strong>?</p>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input placeholder="Suspicious activity..." value={blockReason} onChange={e => setBlockReason(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setBlockDialog(null); setBlockReason('') }}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleBlock}>Block Device</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
