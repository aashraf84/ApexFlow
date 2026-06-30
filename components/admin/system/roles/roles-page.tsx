'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin/shared/page-header'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { RoleEditor } from './role-editor'
import { RoleForm } from './role-form'

export function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/roles')
      const json = await res.json()
      setRoles(json.roles || [])
    } catch { setRoles([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const handleEditRole = (role: any) => { setEditingRole(role) }

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" description="Manage user roles and permission matrix"
        actions={<Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Create Role</Button>} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <Card key={role.id} className="border-border/60 hover:border-border cursor-pointer transition-colors" onClick={() => handleEditRole(role)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{role.name}</h3>
                      {role.isDefault && <StatusBadge variant="info" size="sm">Default</StatusBadge>}
                    </div>
                    {role.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{role.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{role._count?.users ?? 0} user(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RoleForm open={showForm} onClose={() => setShowForm(false)} onSaved={fetchRoles} roles={roles} />
      {editingRole && <RoleEditor role={editingRole} open={!!editingRole} onClose={() => setEditingRole(null)} onSaved={fetchRoles} />}
    </div>
  )
}
