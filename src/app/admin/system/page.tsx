'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Settings,
  Shield,
  FileText,
  User,
  Plus,
  Pencil,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Key,
  Mail,
  CreditCard,
  Palette,
  AlertCircle,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────
interface SiteSetting {
  id: string
  key: string
  value: string
  group: string
}

interface AuditLog {
  id: string
  userId: string | null
  action: string
  module: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: { id: string; name: string; email: string } | null
}

interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

// ─── Constants ─────────────────────────────────────────────────────────────
const SETTING_GROUPS = [
  { value: 'general', label: 'General', icon: Settings, color: { style: { color: 'var(--gg-vermillion)' } as React.CSSProperties } },
  { value: 'security', label: 'Security', icon: Shield, color: { className: 'text-red-400' } },
  { value: 'email', label: 'Email', icon: Mail, color: { className: 'text-blue-400' } },
  { value: 'payment', label: 'Payment', icon: CreditCard, color: { className: 'text-amber-400' } },
  { value: 'appearance', label: 'Appearance', icon: Palette, color: { className: 'text-violet-400' } },
]

const MODULE_OPTIONS = [
  'auth',
  'clients',
  'deals',
  'finance',
  'communications',
  'marketing',
  'reports',
  'system',
]

const GROUP_ICONS: Record<string, React.ElementType> = {
  general: Settings,
  security: Shield,
  email: Mail,
  payment: CreditCard,
  appearance: Palette,
}

const GROUP_COLORS: Record<string, { className?: string; style?: React.CSSProperties }> = {
  general: { style: { color: 'var(--gg-vermillion)' } },
  security: { className: 'text-red-400' },
  email: { className: 'text-blue-400' },
  payment: { className: 'text-amber-400' },
  appearance: { className: 'text-violet-400' },
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AdminSystemPage() {
  const [activeTab, setActiveTab] = useState('settings')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">System Administration</h2>
        <p className="text-muted-foreground mt-1">
          Manage settings, audit logs, and your admin profile.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="border"
          style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)' }}
        >
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            <Settings className="h-4 w-4 mr-1.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <FileText className="h-4 w-4 mr-1.5" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <User className="h-4 w-4 mr-1.5" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditLogsTab />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════════════
function SettingsTab() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null)
  const [formKey, setFormKey] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formGroup, setFormGroup] = useState('general')
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/system/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || [])
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleOpenCreate = () => {
    setEditingSetting(null)
    setFormKey('')
    setFormValue('')
    setFormGroup('general')
    setDialogOpen(true)
  }

  const handleOpenEdit = (setting: SiteSetting) => {
    setEditingSetting(setting)
    setFormKey(setting.key)
    setFormValue(setting.value)
    setFormGroup(setting.group)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formKey.trim()) {
      toast.error('Setting key is required')
      return
    }
    if (formValue === undefined || formValue === '') {
      toast.error('Setting value is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/system/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formKey.trim(),
          value: formValue,
          group: formGroup,
        }),
      })

      if (res.ok) {
        toast.success(editingSetting ? 'Setting updated' : 'Setting created')
        setDialogOpen(false)
        fetchSettings()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save setting')
      }
    } catch {
      toast.error('Failed to save setting')
    } finally {
      setSaving(false)
    }
  }

  // Group settings
  const grouped: Record<string, SiteSetting[]> = {}
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = []
    grouped[s.group].push(s)
  }

  // Filter
  const filteredGroups = filterGroup === 'all'
    ? Object.keys(grouped).sort()
    : [filterGroup]

  // Search filter
  const filteredSettings = (group: string) => {
    if (!searchQuery) return grouped[group] || []
    return (grouped[group] || []).filter(
      (s) =>
        s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--gg-vermillion)' }} />
        <span className="ml-3 text-muted-foreground">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-white/10 text-foreground placeholder:text-gray-500"
            style={{ background: 'var(--card)' }}
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-full sm:w-[180px] border-white/10 text-foreground" style={{ background: 'var(--card)' }}>
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {SETTING_GROUPS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleOpenCreate}
          className="hover:opacity-90 text-foreground"
          style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Setting
        </Button>
      </div>

      {/* Settings Groups */}
      {filteredGroups.map((group) => {
        const groupSettings = filteredSettings(group)
        if (groupSettings.length === 0 && searchQuery) return null
        const IconComp = GROUP_ICONS[group] || Settings
        const colorObj = GROUP_COLORS[group] || { className: 'text-muted-foreground' }

        return (
          <Card
            key={group}
            style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IconComp className={`h-5 w-5 ${colorObj.className || ''}`} style={colorObj.style} />
                <CardTitle className="text-foreground text-lg">
                  {SETTING_GROUPS.find((g) => g.value === group)?.label || formatLabel(group)}
                </CardTitle>
                <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
                  {groupSettings.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {groupSettings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Key</TableHead>
                      <TableHead className="text-muted-foreground">Value</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupSettings.map((s) => (
                      <TableRow key={s.id} style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-white/[0.02]">
                        <TableCell className="text-foreground font-mono text-sm">
                          {s.key}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-[300px] truncate">
                          {s.value}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(s)}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  No settings in this group
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Empty State */}
      {settings.length === 0 && (
        <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Settings className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No Settings Configured</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Add your first setting to get started.
            </p>
            <Button
              onClick={handleOpenCreate}
              className="hover:opacity-90 text-foreground"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Setting
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingSetting ? 'Edit Setting' : 'Add Setting'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingSetting
                ? 'Update the setting value or group.'
                : 'Create a new site setting.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Key</Label>
              <Input
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="e.g. site_name"
                disabled={!!editingSetting}
                className="bg-gray-800 border-white/10 text-foreground placeholder:text-gray-500 disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Value</Label>
              <Input
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="Setting value"
                className="bg-gray-800 border-white/10 text-foreground placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Group</Label>
              <Select value={formGroup} onValueChange={setFormGroup}>
                <SelectTrigger className="bg-gray-800 border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SETTING_GROUPS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="hover:opacity-90 text-foreground"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingSetting ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGS TAB
// ═══════════════════════════════════════════════════════════════════════════
function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [moduleFilter, setModuleFilter] = useState('')

  const fetchLogs = useCallback(async (p: number, mod: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (mod) params.set('module', mod)

      const res = await fetch(`/api/system/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      }
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs(page, moduleFilter)
  }, [page, moduleFilter, fetchLogs])

  const handleModuleChange = (val: string) => {
    setModuleFilter(val === 'all' ? '' : val)
    setPage(1)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select
          value={moduleFilter || 'all'}
          onValueChange={handleModuleChange}
        >
          <SelectTrigger className="w-full sm:w-[200px] border-white/10 text-foreground" style={{ background: 'var(--card)' }}>
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {MODULE_OPTIONS.map((m) => (
              <SelectItem key={m} value={m}>
                {formatLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">
          {total} log{total !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Logs Table */}
      <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-3 text-muted-foreground">Loading audit logs...</span>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Action</TableHead>
                    <TableHead className="text-muted-foreground">Module</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Details</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">IP Address</TableHead>
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} style={{ borderColor: 'var(--gg-separator)' }} className="hover:bg-white/[0.02]">
                      <TableCell className="text-foreground text-sm">
                        {log.user ? log.user.name : (
                          <span className="text-gray-500">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs border-white/10"
                          style={{ color: 'var(--gg-vermillion)' }}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-white/10 text-gray-300">
                          {formatLabel(log.module)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate hidden md:table-cell">
                        {log.details || '—'}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm font-mono hidden lg:table-cell">
                        {log.ipAddress || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No Audit Logs</p>
              <p className="text-gray-500 text-sm mt-1">
                Audit logs will appear here as admin actions are recorded.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════════════════
function ProfileTab() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            setUser(data.user)
          }
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [])

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Current password is required')
      return
    }
    if (!newPassword) {
      toast.error('New password is required')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch {
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        <span className="ml-3 text-muted-foreground">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Info */}
      <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
        <CardHeader>
          <CardTitle className="text-foreground">Admin Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
                  style={{
                    background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
                    color: 'var(--gg-vermillion)',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-foreground text-lg font-semibold">{user.name}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </div>
              <Separator style={{ background: 'var(--gg-separator)' }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge
                    className="mt-1 border-0"
                    style={{
                      background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)',
                      color: 'var(--gg-vermillion)',
                    }}
                  >
                    {formatLabel(user.role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className="mt-1 bg-green-500/20 text-green-400 border-0">
                    Active
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Could not load profile information.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card style={{ borderColor: 'var(--gg-separator)', background: 'var(--card)', boxShadow: 'var(--gg-shadow-card)' }}>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-400" />
            Change Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your admin account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="bg-gray-800 border-white/10 text-foreground placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="bg-gray-800 border-white/10 text-foreground placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="bg-gray-800 border-white/10 text-foreground placeholder:text-gray-500"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="bg-amber-600 hover:bg-amber-700 text-foreground"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-1.5" />
                Change Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatLabel(str: string): string {
  return str
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
