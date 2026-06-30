'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Wifi, Save, CheckCircle2, XCircle, Loader2, Plug, Database, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Profile {
  id: string
  name: string
  email: string
  role: string
}

interface ErpSystem {
  id: string
  name: string
  slug: string
  status: string
  industry: string
  moduleCount: number
}

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'disconnected'

export function SettingsTab() {
  const { adminUser, setAdminUser } = useAppStore()
  const adminUserRef = useRef(adminUser)
  adminUserRef.current = adminUser

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const [erpSystems, setErpSystems] = useState<ErpSystem[]>([])
  const [erpLoading, setErpLoading] = useState(true)
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({})
  const [connectionDetails, setConnectionDetails] = useState<Record<string, { latency?: number; clientCount?: number; error?: string }>>({})

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const p = data.profile
      if (p) {
        setProfile(p)
        setEditName(p.name ?? '')
        setEditEmail(p.email ?? '')
        setAdminUser({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          avatar: null,
        })
      }
    } catch {
      toast.error('Failed to load profile')
      const fallback = adminUserRef.current
      if (fallback) {
        setProfile({
          id: fallback.id,
          name: fallback.name,
          email: fallback.email,
          role: fallback.role,
        })
        setEditName(fallback.name)
        setEditEmail(fallback.email)
      }
    } finally {
      setLoading(false)
    }
  }, [setAdminUser])

  const fetchErpSystems = useCallback(async () => {
    try {
      const res = await fetch('/api/erp')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const systems: ErpSystem[] = (data.erpSystems || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        status: e.status,
        industry: e.industry,
        moduleCount: e.moduleCount ?? 0,
      }))
      setErpSystems(systems)
      // Initialize connection statuses
      const statuses: Record<string, ConnectionStatus> = {}
      const details: Record<string, { latency?: number; clientCount?: number; error?: string }> = {}
      for (const erp of systems) {
        statuses[erp.slug] = erp.status === 'active' ? 'idle' : 'idle'
        details[erp.slug] = {}
      }
      setConnectionStatuses(statuses)
      setConnectionDetails(details)

      // Auto-test active ERP connections on load
      for (const erp of systems) {
        if (erp.status === 'active') {
          testConnection(erp.slug)
        }
      }
    } catch {
      console.error('[Settings] Failed to fetch ERP systems')
    } finally {
      setErpLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchErpSystems()
  }, [fetchProfile, fetchErpSystems])

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save')
      }
      const data = await res.json()
      const updated = data.profile
      if (updated) {
        setProfile(updated)
        setAdminUser({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          avatar: null,
        })
      }
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async (slug: string) => {
    setConnectionStatuses((prev) => ({ ...prev, [slug]: 'testing' }))
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erpSlug: slug }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()

      if (data.connected) {
        setConnectionStatuses((prev) => ({ ...prev, [slug]: 'connected' }))
        setConnectionDetails((prev) => ({
          ...prev,
          [slug]: { latency: data.latency, clientCount: data.clientCount },
        }))
        const erpNameMap: Record<string, string> = {
          apparelflow: 'ApparelFlow',
          hotelflow: 'HotelFlow',
          eduflow: 'EduFlow',
          martflow: 'MartFlow',
        }
        toast.success(`${erpNameMap[slug] || slug} connected (${data.latency}ms)`)
      } else {
        setConnectionStatuses((prev) => ({ ...prev, [slug]: 'disconnected' }))
        setConnectionDetails((prev) => ({
          ...prev,
          [slug]: { error: data.error },
        }))
        toast.error(`Connection failed: ${data.error || 'Unknown error'}`)
      }
    } catch {
      setConnectionStatuses((prev) => ({ ...prev, [slug]: 'disconnected' }))
      setConnectionDetails((prev) => ({
        ...prev,
        [slug]: { error: 'Network error' },
      }))
      toast.error('Connection test failed')
    }
  }

  const getInitial = () => {
    if (profile?.name) return profile.name.charAt(0).toUpperCase()
    if (adminUser?.name) return adminUser.name.charAt(0).toUpperCase()
    return 'A'
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48 rounded-xl bg-card" />
        <Skeleton className="h-64 rounded-2xl bg-card" />
        <Skeleton className="h-48 rounded-2xl bg-card" />
        <Skeleton className="h-40 rounded-2xl bg-card" />
      </div>
    )
  }

  const activeErps = erpSystems.filter((e) => e.status === 'active')
  const comingSoonErps = erpSystems.filter((e) => e.status === 'coming_soon')

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and system preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--gg-teal)]/10 flex items-center justify-center">
            <User className="w-5 h-5 text-[var(--gg-teal)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Profile</h3>
            <p className="text-xs text-muted-foreground">Your account information</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-secondary border border-border">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gg-vermillion)] to-[var(--gg-amber)] flex items-center justify-center text-white font-bold text-lg shrink-0">
            {getInitial()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile?.name ?? adminUser?.name ?? 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email ?? adminUser?.email ?? ''}</p>
            <Badge variant="secondary" className="mt-1 bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20 text-[10px]">
              {profile?.role ?? adminUser?.role ?? 'admin'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Full Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Email</Label>
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                type="email"
                className="bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Role</Label>
            <Input
              value={profile?.role ?? adminUser?.role ?? 'admin'}
              disabled
              className="bg-secondary border-border rounded-xl text-muted-foreground"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl px-6 btn-glow"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Profile
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
            <p className="text-xs text-muted-foreground">Access and authentication</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary border border-border">
            <p className="text-sm font-medium text-foreground mb-1">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Two-factor authentication adds an extra layer of security to your account. When enabled, you&apos;ll be required to enter both your password and an authentication code from your mobile device.
            </p>
          </div>
          <Separator className="bg-muted" />
          <div className="p-4 rounded-xl bg-secondary border border-border">
            <p className="text-sm font-medium text-foreground mb-1">Session Management</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your active sessions are managed securely. Sessions expire after 30 minutes of inactivity. You can review and terminate active sessions from the security dashboard.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ERP Systems Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
        className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">ERP Systems</h3>
            <p className="text-xs text-muted-foreground">
              {activeErps.length} active, {comingSoonErps.length} coming soon
            </p>
          </div>
        </div>

        {erpLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl bg-card" />
            ))}
          </div>
        ) : erpSystems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Plug className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No ERP systems registered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {erpSystems.map((erp) => {
              const status = connectionStatuses[erp.slug]
              const details = connectionDetails[erp.slug]
              const isActive = erp.status === 'active'
              return (
                <div
                  key={erp.slug}
                  className={`py-4 px-4 rounded-xl bg-secondary border ${
                    isActive
                      ? status === 'connected'
                        ? 'border-emerald-500/20'
                        : 'border-[var(--gg-teal)]/20'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isActive ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'}`}>
                          {erp.name}
                        </p>
                        {isActive ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            Coming Soon
                          </Badge>
                        )}
                        {erp.moduleCount > 0 && (
                          <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                            {erp.moduleCount} modules
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{erp.industry}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {status === 'connected' && (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            <Zap className="w-3 h-3 mr-1" />
                            {details?.latency}ms
                          </Badge>
                          {details?.clientCount !== undefined && details.clientCount > 0 && (
                            <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[10px]">
                              {details.clientCount} clients
                            </Badge>
                          )}
                        </div>
                      )}
                      {status === 'disconnected' && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                          <XCircle className="w-3 h-3 mr-1" />
                          {details?.error || 'Failed'}
                        </Badge>
                      )}
                      {isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => testConnection(erp.slug)}
                          disabled={status === 'testing'}
                        >
                          {status === 'testing' ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <Wifi className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Test
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
