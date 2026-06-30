'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Monitor, Laptop, Smartphone, Tablet, ShieldCheck, ShieldBan, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Device {
  id: string
  deviceName: string
  deviceType: string | null
  os: string | null
  browser: string | null
  ipAddress: string | null
  macAddress: string | null
  location: string | null
  status: string
  lastActiveAt: string | null
  blockedAt: string | null
  blockedReason: string | null
  clientId: string | null
  erpSystemId: string | null
  clientName: string | null
}

const deviceTypeIcons: Record<string, React.ReactNode> = {
  desktop: <Monitor className="w-4 h-4 text-[var(--gg-teal)]" />,
  laptop: <Laptop className="w-4 h-4 text-[var(--gg-amber)]" />,
  mobile: <Smartphone className="w-4 h-4 text-[var(--gg-vermillion)]" />,
  tablet: <Tablet className="w-4 h-4 text-[var(--gg-green)]" />,
}

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function timeAgo(date: string | null): string {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function DevicesTab() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Block dialog state
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockTarget, setBlockTarget] = useState<Device | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/devices')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setDevices(data.devices ?? [])
    } catch {
      toast.error('Failed to load devices')
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const openBlockDialog = (device: Device) => {
    setBlockTarget(device)
    setBlockReason('')
    setBlockDialogOpen(true)
  }

  const closeBlockDialog = () => {
    setBlockDialogOpen(false)
    setBlockTarget(null)
    setBlockReason('')
  }

  const handleBlock = async () => {
    if (!blockTarget) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blockTarget.id,
          status: 'blocked',
          blockedReason: blockReason.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to block')
      toast.success(`"${blockTarget.deviceName}" blocked`)
      closeBlockDialog()
      await fetchDevices()
    } catch {
      toast.error('Failed to block device')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnblock = async (device: Device) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: device.id, status: 'active' }),
      })
      if (!res.ok) throw new Error('Failed to unblock')
      toast.success(`"${device.deviceName}" unblocked`)
      await fetchDevices()
    } catch {
      toast.error('Failed to unblock device')
    }
  }

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase()
    const matchesSearch =
      d.deviceName.toLowerCase().includes(q) ||
      (d.ipAddress ?? '').includes(q) ||
      (d.clientName ?? '').toLowerCase().includes(q) ||
      (d.location ?? '').toLowerCase().includes(q)
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56 rounded-xl bg-card" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl bg-card" />
          <Skeleton className="h-10 w-40 rounded-xl bg-card" />
        </div>
        <Skeleton className="h-96 rounded-2xl bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Device Management</h2>
        <p className="text-sm text-muted-foreground">{devices.length} registered device{devices.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, IP, client, or location..."
            className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border rounded-xl">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Monitor className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {devices.length === 0 ? 'No devices registered yet.' : 'No devices match your search.'}
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden">
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Device Name</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">OS</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">IP Address</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Client</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden xl:table-cell">Last Active</TableHead>
                  <TableHead className="text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((device) => (
                  <TableRow key={device.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {deviceTypeIcons[device.deviceType ?? 'desktop'] ?? deviceTypeIcons.desktop}
                        <span className="text-sm font-medium text-foreground">{device.deviceName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{device.deviceType ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{device.os ?? '—'}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground hidden md:table-cell">{device.ipAddress ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{device.clientName ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusBadge[device.status] ?? 'bg-secondary text-muted-foreground border-border'}>
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">{timeAgo(device.lastActiveAt)}</TableCell>
                    <TableCell>
                      {device.status === 'blocked' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          onClick={() => handleUnblock(device)}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Unblock
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => openBlockDialog(device)}
                        >
                          <ShieldBan className="w-3.5 h-3.5 mr-1" /> Block
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Block Dialog Overlay */}
      <AnimatePresence>
        {blockDialogOpen && blockTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={closeBlockDialog} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={closeBlockDialog}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <ShieldBan className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Block Device</h3>
                  <p className="text-xs text-muted-foreground">{blockTarget.deviceName}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Label className="text-muted-foreground text-sm">Reason for blocking (optional)</Label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Unauthorized access attempt..."
                  className="bg-secondary border-border focus:border-red-500/50 rounded-xl min-h-[80px] resize-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground rounded-xl"
                  onClick={closeBlockDialog}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 rounded-xl"
                  onClick={handleBlock}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-1.5" />
                  ) : (
                    <ShieldBan className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Block Device
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
