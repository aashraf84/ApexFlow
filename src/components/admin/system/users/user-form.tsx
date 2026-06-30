'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserFormProps {
  open: boolean
  onClose: () => void
  user: any | null
  onSaved: () => void
}

const ROLES = ['super_admin', 'admin', 'manager', 'viewer']

export function UserForm({ open, onClose, user, onSaved }: UserFormProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || 'viewer')
  const [sendInvite, setSendInvite] = useState(true)
  const [saving, setSaving] = useState(false)

  const isEditing = !!user

  const handleSubmit = async () => {
    setSaving(true)
    try {
      if (isEditing) {
        await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, name, email, role }) })
      } else {
        await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role, sendInvite }) })
      }
      onSaved()
      onClose()
    } catch { /* error handled */ }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit User' : 'Invite User'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="user@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {!isEditing && (
            <div className="flex items-center justify-between">
              <Label htmlFor="invite">Send Invite Email</Label>
              <Switch id="invite" checked={sendInvite} onCheckedChange={setSendInvite} />
            </div>
          )}
          {isEditing && (
            <div className="flex items-center justify-between">
              <Label>Account Status</Label>
              <div className="flex items-center gap-2">
                <StatusBadge variant={user?.isActive ? 'success' : 'error'} size="sm">{user?.isActive ? 'Active' : 'Inactive'}</StatusBadge>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Update User' : 'Send Invite'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatusBadge({ variant, children, size }: { variant: string; size: string; children: React.ReactNode }) {
  const styles = variant === 'success'
    ? 'bg-[var(--gg-green)]/10 text-[var(--gg-green)] border-[var(--gg-green)]/20'
    : 'bg-[var(--gg-rose)]/10 text-[var(--gg-rose)] border-[var(--gg-rose)]/20'
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${styles}`}><span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-[var(--gg-green)]' : 'bg-[var(--gg-rose)]'}`} />{children}</span>
}
