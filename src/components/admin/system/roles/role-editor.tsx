'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PERMISSION_GROUPS } from '@/types/admin'
import type { Permission } from '@/types/admin'

interface RoleEditorProps {
  role: any
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const RESOURCES = ['clients', 'orders', 'invoices', 'erp', 'subscriptions', 'licenses', 'payments', 'reports', 'settings', 'users']
const ACTIONS = ['view', 'create', 'edit', 'delete', 'export']

export function RoleEditor({ role, open, onClose, onSaved }: RoleEditorProps) {
  const parsed = typeof role.permissions === 'string' ? JSON.parse(role.permissions || '[]') : role.permissions || []
  const [permissions, setPermissions] = useState<string[]>(parsed)
  const [name, setName] = useState(role.name || '')
  const [description, setDescription] = useState(role.description || '')
  const [saving, setSaving] = useState(false)

  const togglePermission = (perm: string) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm])
  }

  const toggleAll = (resource: string, checked: boolean) => {
    setPermissions(prev => {
      const without = prev.filter(p => !p.startsWith(`${resource}.`))
      return checked ? [...without, ...ACTIONS.map(a => `${resource}.${a}` as Permission)] : without
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/roles', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: role.id, name, description, permissions }),
      })
      onSaved()
      onClose()
    } catch { /* handled */ }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Role: {role.name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Role Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <div className="border border-border/60 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Resource</th>
                  {ACTIONS.map(action => <th key={action} className="text-center px-3 py-2 font-medium text-muted-foreground capitalize">{action}</th>)}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map(resource => (
                  <tr key={resource} className="border-t border-border/40">
                    <td className="px-3 py-2 font-medium capitalize">{resource}</td>
                    {ACTIONS.map(action => {
                      const perm = `${resource}.${action}` as Permission
                      return (
                        <td key={action} className="px-3 py-2 text-center">
                          <Checkbox checked={permissions.includes(perm)} onCheckedChange={() => togglePermission(perm)} />
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-center hidden">
                      <Checkbox checked={ACTIONS.every(a => permissions.includes(`${resource}.${a}` as Permission))} onCheckedChange={(c) => toggleAll(resource, !!c)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Permissions'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
