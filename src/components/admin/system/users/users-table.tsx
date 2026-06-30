'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'

interface UsersTableProps {
  users: any[]
  onEdit: (user: any) => void
  onRefresh: () => void
}

const ROLE_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  super_admin: 'error', admin: 'info', manager: 'warning', viewer: 'neutral',
}

export function UsersTable({ users, onEdit, onRefresh }: UsersTableProps) {
  const handleDeactivate = async (user: any) => {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, isActive: !user.isActive }) })
    onRefresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    onRefresh()
  }

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Last Login</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Created</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8 border border-border"><AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback></Avatar>
                    <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                <td className="px-4 py-3"><StatusBadge variant={ROLE_VARIANT[user.role] || 'neutral'} size="sm">{user.role?.replace('_', ' ') || 'viewer'}</StatusBadge></td>
                <td className="px-4 py-3 hidden md:table-cell"><StatusBadge variant={user.isActive ? 'success' : 'error'} size="sm">{user.isActive ? 'Active' : 'Inactive'}</StatusBadge></td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onEdit(user)}>Edit</Button>
                    <Button size="sm" variant="ghost" className={`h-7 text-xs ${user.isActive ? 'text-[var(--gg-amber)]' : 'text-[var(--gg-green)]'}`} onClick={() => handleDeactivate(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--gg-rose)]" onClick={() => handleDelete(user.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
