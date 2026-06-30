'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { UsersTable } from './users-table'
import { UserForm } from './user-form'

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const json = await res.json()
      setUsers(json.users || [])
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage admin users, roles, and access"
        actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditingUser(null); setShowForm(true) }}><UserPlus className="w-4 h-4" /> Invite User</Button>} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Plus className="w-6 h-6" />} title="No users found" description="Invite your first admin user to get started" actionLabel="Invite User" onAction={() => setShowForm(true)} />
      ) : (
        <UsersTable users={users} onEdit={(u) => { setEditingUser(u); setShowForm(true) }} onRefresh={fetchUsers} />
      )}

      <UserForm open={showForm} onClose={() => { setShowForm(false); setEditingUser(null) }} user={editingUser} onSaved={fetchUsers} />
    </div>
  )
}
