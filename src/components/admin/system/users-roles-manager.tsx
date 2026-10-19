'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Save,
  Mail,
  Clock,
  Power,
  Eye,
  EyeOff,
} from 'lucide-react'

// ============================================
// Types
// ============================================
interface AdminUser {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: string
  roleId: string | null
  roleName: string | null
  roleDescription?: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
  sessionsCount?: number
  auditLogsCount?: number
}

interface AdminRole {
  id: string
  name: string
  description: string | null
  permissions: string[]
  usersCount: number
  createdAt: string
  updatedAt: string
}

// ============================================
// Constants
// ============================================
const ALL_PERMISSIONS = [
  'all',
  'clients',
  'deals',
  'finance',
  'communications',
  'marketing',
  'erp',
  'reports',
  'integrations',
  'support',
  'system',
  'audit',
] as const

const PERMISSION_LABELS: Record<string, string> = {
  all: 'Super Admin (all)',
  clients: 'Clients',
  deals: 'Deals',
  finance: 'Finance',
  communications: 'Communications',
  marketing: 'Marketing',
  erp: 'ERP Systems',
  reports: 'Reports',
  integrations: 'Integrations',
  support: 'Support',
  system: 'System',
  audit: 'Audit Logs',
}

// ============================================
// Helpers
// ============================================
function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

function formatDate(d: string | null): string {
  if (!d) return 'Never'
  const date = new Date(d)
  if (isNaN(date.getTime())) return 'Never'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function relativeTime(d: string | null): string {
  if (!d) return 'Never'
  const date = new Date(d)
  if (isNaN(date.getTime())) return 'Never'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(d)
}

// ============================================
// Stat card (dark enterprise theme)
// ============================================
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  accent?: 'vermillion' | 'teal' | 'amber' | 'muted'
}) {
  const bg =
    accent === 'teal'
      ? 'color-mix(in srgb, var(--gg-teal) 14%, transparent)'
      : accent === 'amber'
      ? 'color-mix(in srgb, var(--gg-amber) 14%, transparent)'
      : accent === 'muted'
      ? 'color-mix(in srgb, #6b7280 14%, transparent)'
      : 'color-mix(in srgb, var(--gg-vermillion) 14%, transparent)'
  const fg =
    accent === 'teal'
      ? 'var(--gg-teal)'
      : accent === 'amber'
      ? 'var(--gg-amber)'
      : accent === 'muted'
      ? '#9ca3af'
      : 'var(--gg-vermillion)'

  return (
    <Card
      className="border-0"
      style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: bg }}
          >
            <div style={{ color: fg }}>{icon}</div>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Role badge
// ============================================
function RoleBadge({ roleName, role }: { roleName: string | null; role: string }) {
  const name = roleName || role
  const isSuper = role === 'super_admin' || name?.toLowerCase().includes('super')
  return (
    <Badge
      variant="outline"
      className="text-[11px] font-medium"
      style={
        isSuper
          ? {
              background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
              color: '#fff',
              borderColor: 'transparent',
            }
          : {
              background: 'color-mix(in srgb, var(--gg-teal) 12%, transparent)',
              color: 'var(--gg-teal)',
              borderColor: 'color-mix(in srgb, var(--gg-teal) 25%, transparent)',
            }
      }
    >
      <Shield className="w-3 h-3 mr-1" />
      {name || '—'}
    </Badge>
  )
}

// ============================================
// Status pill
// ============================================
function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={
        active
          ? {
              background: 'color-mix(in srgb, var(--gg-teal) 12%, transparent)',
              color: 'var(--gg-teal)',
            }
          : {
              background: 'color-mix(in srgb, var(--gg-rose) 12%, transparent)',
              color: 'var(--gg-rose)',
            }
      }
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? 'var(--gg-teal)' : 'var(--gg-rose)' }}
      />
      {active ? 'Active' : 'Disabled'}
    </span>
  )
}

// ============================================
// User form dialog
// ============================================
interface UserFormValues {
  name: string
  email: string
  roleId: string
  password: string
  isActive: boolean
}

function UserFormDialog({
  open,
  onClose,
  onSaved,
  editing,
  roles,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editing: AdminUser | null
  roles: AdminRole[]
}) {
  const [values, setValues] = useState<UserFormValues>({
    name: '',
    email: '',
    roleId: '',
    password: '',
    isActive: true,
  })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValues({
        name: editing?.name || '',
        email: editing?.email || '',
        roleId: editing?.roleId || '',
        password: '',
        isActive: editing?.isActive ?? true,
      })
      setShowPass(false)
    }
  }, [open, editing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name.trim() || !values.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    if (!editing && (!values.password || values.password.length < 6)) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/users/${editing.id}` : '/api/admin/users'
      const method = editing ? 'PATCH' : 'POST'
      const payload: any = {
        name: values.name.trim(),
        email: values.email.trim(),
        roleId: values.roleId || null,
        isActive: values.isActive,
      }
      if (!editing) payload.password = values.password
      if (editing && values.password) payload.password = values.password

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to save user')
        return
      }
      toast.success(editing ? 'User updated' : 'User invited')
      onSaved()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit User' : 'Invite User'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update this admin user\'s profile and access.'
              : 'Invite a new admin to ApexFlow Cloud. They will sign in with email + password.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">Full Name</Label>
            <Input
              id="u-name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-email">Email</Label>
            <Input
              id="u-email"
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              placeholder="jane@apexflow.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-role">Role</Label>
            <Select
              value={values.roleId}
              onValueChange={(v) => setValues({ ...values, roleId: v })}
            >
              <SelectTrigger id="u-role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.length === 0 && (
                  <SelectItem value="_none" disabled>
                    No roles defined
                  </SelectItem>
                )}
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-pass">
              {editing ? 'New Password (leave blank to keep)' : 'Temporary Password'}
            </Label>
            <div className="relative">
              <Input
                id="u-pass"
                type={showPass ? 'text' : 'password'}
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                placeholder={editing ? '••••••••' : 'Min. 6 characters'}
                className="pr-10"
                {...(!editing ? { required: true } : {})}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--secondary)' }}>
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">Inactive users cannot sign in</p>
            </div>
            <Switch
              checked={values.isActive}
              onCheckedChange={(c) => setValues({ ...values, isActive: c })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Role form dialog
// ============================================
interface RoleFormValues {
  name: string
  description: string
  permissions: string[]
}

function RoleFormDialog({
  open,
  onClose,
  onSaved,
  editing,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editing: AdminRole | null
}) {
  const [values, setValues] = useState<RoleFormValues>({
    name: '',
    description: '',
    permissions: [],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValues({
        name: editing?.name || '',
        description: editing?.description || '',
        permissions: editing?.permissions || [],
      })
    }
  }, [open, editing])

  const togglePerm = (perm: string) => {
    setValues((prev) => {
      const has = prev.permissions.includes(perm)
      // Selecting 'all' clears others; selecting any other clears 'all'
      if (perm === 'all') {
        return { ...prev, permissions: has ? [] : ['all'] }
      }
      const withoutAll = prev.permissions.filter((p) => p !== 'all')
      return {
        ...prev,
        permissions: has
          ? withoutAll.filter((p) => p !== perm)
          : [...withoutAll, perm],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name.trim()) {
      toast.error('Role name is required')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/roles/${editing.id}` : '/api/admin/roles'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          description: values.description.trim(),
          permissions: values.permissions,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to save role')
        return
      }
      toast.success(editing ? 'Role updated' : 'Role created')
      onSaved()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Role' : 'New Role'}</DialogTitle>
          <DialogDescription>
            Define a role and pick the permissions it grants. Super Admin bypasses every check.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="r-name">Role Name</Label>
            <Input
              id="r-name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              placeholder="e.g. Sales Manager"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-desc">Description</Label>
            <Input
              id="r-desc"
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
              placeholder="Short summary of this role's scope"
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
              {ALL_PERMISSIONS.map((perm) => {
                const checked = values.permissions.includes(perm)
                const isAll = perm === 'all'
                return (
                  <label
                    key={perm}
                    className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePerm(perm)}
                      className="h-4 w-4 rounded border-border accent-[var(--gg-vermillion)]"
                    />
                    <span
                      className={isAll ? 'font-semibold' : ''}
                      style={isAll ? { color: 'var(--gg-vermillion)' } : undefined}
                    >
                      {PERMISSION_LABELS[perm]}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Save Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Role permissions drawer
// ============================================
function RolePermissionsDrawer({
  role,
  open,
  onClose,
  onSaved,
}: {
  role: AdminRole | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [perms, setPerms] = useState<string[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (role) {
      setPerms(role.permissions || [])
      setName(role.name)
      setDescription(role.description || '')
    }
  }, [role])

  const toggle = (perm: string) => {
    setPerms((prev) => {
      if (perm === 'all') return prev.includes('all') ? [] : ['all']
      const withoutAll = prev.filter((p) => p !== 'all')
      return withoutAll.includes(perm)
        ? withoutAll.filter((p) => p !== perm)
        : [...withoutAll, perm]
    })
  }

  const handleSave = async () => {
    if (!role) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), permissions: perms }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to save role')
        return
      }
      toast.success('Permissions updated')
      onSaved()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (!role) return null

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent
        className="!w-full !max-w-[460px] sm:!max-w-[460px]"
        style={{ background: 'var(--background)' }}
      >
        <DrawerHeader className="border-b" style={{ borderColor: 'var(--gg-separator)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <DrawerTitle className="text-lg">{role.name}</DrawerTitle>
              <DrawerDescription>
                {role.usersCount} user{role.usersCount === 1 ? '' : 's'} assigned
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Role Name</Label>
              <Input
                id="d-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-desc">Description</Label>
              <Input
                id="d-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                <span className="text-xs text-muted-foreground">{perms.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const active = perms.includes(perm)
                  const isAll = perm === 'all'
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => toggle(perm)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full transition-all border"
                      style={
                        active
                          ? isAll
                            ? {
                                background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                                color: '#fff',
                                borderColor: 'transparent',
                              }
                            : {
                                background: 'color-mix(in srgb, var(--gg-teal) 18%, transparent)',
                                color: 'var(--gg-teal)',
                                borderColor: 'color-mix(in srgb, var(--gg-teal) 35%, transparent)',
                              }
                          : {
                              background: 'var(--secondary)',
                              color: 'var(--muted-foreground)',
                              borderColor: 'var(--gg-separator)',
                            }
                      }
                    >
                      {active && <CheckCircle2 className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                      {PERMISSION_LABELS[perm]}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Super Admin grants full access. All other permissions scope the user to that module.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter
          className="border-t"
          style={{ borderColor: 'var(--gg-separator)' }}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ============================================
// Main component
// ============================================
export function UsersRolesManager() {
  const [tab, setTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null)
  const [drawerRole, setDrawerRole] = useState<AdminRole | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<AdminRole | null>(null)
  const [deletingRole, setDeletingRole] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' })
      const json = await res.json()
      setUsers(json.users || [])
    } catch {
      setUsers([])
    }
  }, [search, roleFilter])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/roles', { cache: 'no-store' })
      const json = await res.json()
      setRoles(json.roles || [])
    } catch {
      setRoles([])
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([fetchUsers(), fetchRoles()]).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [fetchUsers, fetchRoles])

  const refreshAll = useCallback(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  // Open role drawer with full role data (refresh first to get latest)
  const openRoleDrawer = async (role: AdminRole) => {
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.role) {
        setDrawerRole(json.role)
        setDrawerOpen(true)
      } else {
        setDrawerRole(role)
        setDrawerOpen(true)
      }
    } catch {
      setDrawerRole(role)
      setDrawerOpen(true)
    }
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to delete user')
        return
      }
      toast.success('User deleted')
      setUserToDelete(null)
      refreshAll()
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(false)
    }
  }

  const toggleUserActive = async (u: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to update user')
        return
      }
      toast.success(u.isActive ? 'User deactivated' : 'User activated')
      refreshAll()
    } catch {
      toast.error('Network error')
    }
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return
    setDeletingRole(true)
    try {
      const res = await fetch(`/api/admin/roles/${roleToDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to delete role')
        return
      }
      toast.success('Role deleted')
      setRoleToDelete(null)
      fetchRoles()
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingRole(false)
    }
  }

  // Stats
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.isActive).length
    const admins = users.filter(
      (u) => u.role === 'super_admin' || u.roleName?.toLowerCase().includes('super') || u.role === 'admin'
    ).length
    const customRoles = roles.filter(
      (r) => !['super_admin', 'admin', 'manager', 'viewer'].includes(r.name.toLowerCase())
    ).length
    return { total, active, admins, customRoles }
  }, [users, roles])

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Users &amp; Roles</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage admin accounts, role assignments, and granular permissions.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="Total Users"
          value={stats.total}
          accent="vermillion"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Active Users"
          value={stats.active}
          accent="teal"
        />
        <StatCard
          icon={<Shield className="w-5 h-5" />}
          label="Admins"
          value={stats.admins}
          accent="amber"
        />
        <StatCard
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Custom Roles"
          value={stats.customRoles}
          accent="muted"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'users' | 'roles')}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="users" className="gap-1.5">
            <UsersIcon className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Roles &amp; Permissions
          </TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setEditingUser(null)
                setShowUserForm(true)
              }}
              className="gap-1.5 sm:ml-auto"
              style={{
                background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                color: '#fff',
              }}
            >
              <UserPlus className="w-4 h-4" />
              Invite User
            </Button>
          </div>

          <Card
            className="border-0 overflow-hidden"
            style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}
          >
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)' }}
                  >
                    <UsersIcon className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground">
                      {search || roleFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'Invite your first admin to get started.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-0" style={{ borderBottom: '1px solid var(--gg-separator)' }}>
                        <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          User
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                          Role
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                          Last Login
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow
                          key={u.id}
                          className="border-0 transition-colors hover:bg-white/[0.02]"
                          style={{ borderBottom: '1px solid var(--gg-separator)' }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border" style={{ borderColor: 'var(--gg-separator-strong)' }}>
                                {u.avatar ? (
                                  <AvatarImage src={u.avatar} alt={u.name} />
                                ) : null}
                                <AvatarFallback
                                  className="text-xs font-semibold"
                                  style={{
                                    background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                                    color: '#fff',
                                  }}
                                >
                                  {initials(u.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <RoleBadge roleName={u.roleName} role={u.role} />
                          </TableCell>
                          <TableCell>
                            <StatusPill active={u.isActive} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {relativeTime(u.lastLogin)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => toggleUserActive(u)}
                                title={u.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <Power
                                  className="w-4 h-4"
                                  style={{ color: u.isActive ? 'var(--gg-teal)' : 'var(--muted-foreground)' }}
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingUser(u)
                                  setShowUserForm(true)
                                }}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-[var(--gg-rose)] hover:text-[var(--gg-rose)]"
                                onClick={() => setUserToDelete(u)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES TAB */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {roles.length} role{roles.length === 1 ? '' : 's'} configured
            </p>
            <Button
              onClick={() => {
                setEditingRole(null)
                setShowRoleForm(true)
              }}
              className="gap-1.5"
              style={{
                background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                color: '#fff',
              }}
            >
              <Plus className="w-4 h-4" />
              New Role
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <Card className="border-0" style={{ background: 'var(--secondary)', borderColor: 'var(--gg-separator)' }}>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 12%, transparent)' }}
                >
                  <ShieldCheck className="w-6 h-6" style={{ color: 'var(--gg-vermillion)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No roles yet</p>
                  <p className="text-xs text-muted-foreground">Create your first role to start assigning permissions.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {roles.map((r) => {
                const isSuper = r.permissions.includes('all')
                return (
                  <Card
                    key={r.id}
                    className="border-0 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg group"
                    style={{
                      background: 'var(--secondary)',
                      borderColor: 'var(--gg-separator)',
                    }}
                    onClick={() => openRoleDrawer(r)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl"
                            style={
                              isSuper
                                ? { background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }
                                : { background: 'color-mix(in srgb, var(--gg-teal) 14%, transparent)' }
                            }
                          >
                            <ShieldCheck
                              className="w-5 h-5"
                              style={isSuper ? { color: '#fff' } : { color: 'var(--gg-teal)' }}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-foreground">{r.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.usersCount} user{r.usersCount === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingRole(r)
                              setShowRoleForm(true)
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-[var(--gg-rose)] hover:text-[var(--gg-rose)]"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRoleToDelete(r)
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {r.description || 'No description provided.'}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {r.permissions.length} permission{r.permissions.length === 1 ? '' : 's'}
                        </span>
                        {isSuper && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                            style={{
                              background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))',
                              color: '#fff',
                              borderColor: 'transparent',
                            }}
                          >
                            <XCircle className="w-2.5 h-2.5 mr-1 rotate-45" style={{ display: 'none' }} />
                            SUPER
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User form */}
      <UserFormDialog
        open={showUserForm}
        onClose={() => {
          setShowUserForm(false)
          setEditingUser(null)
        }}
        onSaved={refreshAll}
        editing={editingUser}
        roles={roles}
      />

      {/* Role form */}
      <RoleFormDialog
        open={showRoleForm}
        onClose={() => {
          setShowRoleForm(false)
          setEditingRole(null)
        }}
        onSaved={fetchRoles}
        editing={editingRole}
      />

      {/* Role permissions drawer */}
      <RolePermissionsDrawer
        role={drawerRole}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setDrawerRole(null)
        }}
        onSaved={fetchRoles}
      />

      {/* Delete user confirm */}
      <AlertDialog open={!!userToDelete} onOpenChange={(v) => !v && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{' '}
              <span className="font-semibold text-foreground">{userToDelete?.name}</span> ({userToDelete?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleting}
              className="bg-[var(--gg-rose)] text-white hover:bg-[var(--gg-rose)]/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete role confirm */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(v) => !v && setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete the role{' '}
              <span className="font-semibold text-foreground">{roleToDelete?.name}</span>. Roles with assigned
              users cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRole}
              disabled={deletingRole}
              className="bg-[var(--gg-rose)] text-white hover:bg-[var(--gg-rose)]/90"
            >
              {deletingRole ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
