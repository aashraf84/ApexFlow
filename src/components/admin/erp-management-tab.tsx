'use client'

import { useState, useEffect, useCallback, createElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Eye, Zap, Settings2, AlertCircle, CheckCircle2,
  XCircle, Clock, Database, RefreshCw, X,
  Package, Users, DollarSign, KeyRound,
  Shirt, Hotel, GraduationCap, Plane, Pill, UtensilsCrossed, HardHat,
  Heart, Palette, ShoppingCart, Factory, Truck, TextCursorInput, Route,
  Leaf, Landmark, Wheat, Wrench, Compass,
} from 'lucide-react'
import { ERP_COLOR_MAP } from '@/lib/erp-data'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// ─── Icon Map (local copy for static rendering) ────────────────────────────
const LOCAL_ICON_MAP: Record<string, LucideIcon> = {
  shirt: Shirt,
  hotel: Hotel,
  graduation: GraduationCap,
  hardhat: HardHat,
  plane: Plane,
  building: Hotel,
  pill: Pill,
  utensils: UtensilsCrossed,
  palette: Palette,
  heart: Heart,
  shopping: ShoppingCart,
  factory: Factory,
  truck: Truck,
  textcursor: TextCursorInput,
  route: Route,
  leaf: Leaf,
  landmark: Landmark,
  wheat: Wheat,
  wrench: Wrench,
  compass: Compass,
  zap: Compass, // fallback mapping
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface ErpListItem {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string
  color: string
  status: string
  version: string
  website: string | null
  industry: string | null
  moduleCount: number
  databaseUrl?: string | null
  sortOrder: number
  isActive: boolean
  orderCount?: number
}

interface ConnectionTestResult {
  connected: boolean
  latency?: number
  clientCount?: number
  error?: string
  schemaWarning?: string
}

interface ErpDetail {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string
  color: string
  status: string
  version: string
  website: string | null
  industry: string | null
  features: string | null
  pricing: string | null
  moduleCount: number
  modules: { id: string; name: string; slug: string; description: string; category: string | null; price: number; isActive: boolean }[]
  clientCount: number
  revenue: number
  licenseCount: number
  recentClients: { id: string; companyName: string; status: string; licenseType: string | null }[]
}

type DbStatus = 'connected' | 'disconnected' | 'not_configured'

// ─── Icon / Color helpers ──────────────────────────────────────────────────
function getErpIcon(iconKey: string): LucideIcon {
  return LOCAL_ICON_MAP[iconKey] || Package
}

function getErpColors(colorKey: string) {
  return ERP_COLOR_MAP[colorKey] || ERP_COLOR_MAP.teal
}

function getDbStatus(erp: ErpListItem): DbStatus {
  if (!erp.databaseUrl) return 'not_configured'
  if (erp.status === 'active') return 'connected'
  return 'disconnected'
}

function getDbStatusDot(status: DbStatus) {
  switch (status) {
    case 'connected': return 'bg-emerald-400'
    case 'disconnected': return 'bg-red-400'
    case 'not_configured': return 'bg-muted-foreground/40'
  }
}

function getDbStatusLabel(status: DbStatus) {
  switch (status) {
    case 'connected': return 'Connected'
    case 'disconnected': return 'Disconnected'
    case 'not_configured': return 'Not Configured'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold">
          <CheckCircle2 className="w-3 h-3 mr-1" />Active
        </Badge>
      )
    case 'coming_soon':
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 px-2 py-0.5 text-[10px] font-semibold">
          <Clock className="w-3 h-3 mr-1" />Coming Soon
        </Badge>
      )
    case 'disconnected':
      return (
        <Badge className="bg-red-500/15 text-red-400 border-red-500/25 px-2 py-0.5 text-[10px] font-semibold">
          <XCircle className="w-3 h-3 mr-1" />Disconnected
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
          {status}
        </Badge>
      )
  }
}

// ─── Static icon renderer (avoids component-during-render lint) ────────────
function ErpIconRender({ iconKey, className }: { iconKey: string; className?: string }) {
  const Comp = getErpIcon(iconKey)
  return createElement(Comp, { className: className || 'w-8 h-8' })
}

// ─── Icon options for Add/Edit dialog ──────────────────────────────────────
const ICON_OPTIONS = [
  { value: 'shirt', label: 'Shirt (Apparel)' },
  { value: 'hotel', label: 'Hotel (Hospitality)' },
  { value: 'graduation', label: 'Graduation (Education)' },
  { value: 'hardhat', label: 'HardHat (Construction)' },
  { value: 'plane', label: 'Plane (Travel)' },
  { value: 'building', label: 'Building (Property)' },
  { value: 'pill', label: 'Pill (Pharmaceutical)' },
  { value: 'utensils', label: 'Utensils (Food)' },
  { value: 'palette', label: 'Palette (Creative)' },
  { value: 'heart', label: 'Heart (Healthcare)' },
  { value: 'shopping', label: 'Shopping (Retail)' },
  { value: 'factory', label: 'Factory (Manufacturing)' },
  { value: 'truck', label: 'Truck (Logistics)' },
  { value: 'textcursor', label: 'TextCursor (Textile)' },
  { value: 'route', label: 'Route (Distribution)' },
  { value: 'leaf', label: 'Leaf (Agriculture)' },
  { value: 'landmark', label: 'Landmark (Banking)' },
  { value: 'wheat', label: 'Wheat (Farming)' },
  { value: 'wrench', label: 'Wrench (Automotive)' },
  { value: 'compass', label: 'Compass (Fleet)' },
  { value: 'zap', label: 'Zap (Electronics)' },
]

const COLOR_OPTIONS = [
  { value: 'teal', label: 'Teal' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'amber', label: 'Amber' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'lime', label: 'Lime' },
  { value: 'pink', label: 'Pink' },
  { value: 'rose', label: 'Rose' },
  { value: 'fuchsia', label: 'Fuchsia' },
  { value: 'sky', label: 'Sky' },
  { value: 'violet', label: 'Violet' },
  { value: 'green', label: 'Green' },
]

// ─── Auto-slug helper ──────────────────────────────────────────────────────
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '')
    .replace(/-+/g, '')
    .trim()
}

// ─── ErpFormDialog (shared for Add & Edit) ─────────────────────────────────
function ErpFormDialog({
  open,
  onClose,
  onSave,
  editData,
  saving,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  editData?: ErpListItem | ErpDetail | null
  saving: boolean
}) {
  // Use the editData or defaults to initialize state — no useEffect needed
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('building')
  const [color, setColor] = useState('cyan')
  const [industry, setIndustry] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [website, setWebsite] = useState('')
  const [databaseUrl, setDatabaseUrl] = useState('')
  const [status, setStatus] = useState('active')
  const [moduleCount, setModuleCount] = useState('0')
  const [slugManual, setSlugManual] = useState(false)

  // Track previous editData to reset form when dialog opens or data changes
  const [prevEditDataId, setPrevEditDataId] = useState<string | null>(null)
  const currentEditId = editData?.id || null

  if (currentEditId !== prevEditDataId) {
    setPrevEditDataId(currentEditId)
    if (editData) {
      setName(editData.name || '')
      setSlug(editData.slug || '')
      setDescription(editData.description || '')
      setIcon(editData.icon || 'building')
      setColor(editData.color || 'cyan')
      setIndustry(editData.industry || '')
      setVersion(editData.version || '1.0.0')
      setWebsite(editData.website || '')
      setDatabaseUrl(editData.databaseUrl || '')
      setStatus(editData.status || 'active')
      setModuleCount(String(editData.moduleCount || 0))
      setSlugManual(true)
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setIcon('building')
      setColor('cyan')
      setIndustry('')
      setVersion('1.0.0')
      setWebsite('')
      setDatabaseUrl('')
      setStatus('active')
      setModuleCount('0')
      setSlugManual(false)
    }
  }

  // Auto-generate slug from name using event handler instead of effect
  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugManual && !editData) {
      setSlug(nameToSlug(value))
    }
  }

  const handleSave = () => {
    onSave({
      ...(editData ? { id: editData.id } : {}),
      name,
      slug,
      description: description || null,
      icon,
      color,
      industry: industry || null,
      version,
      website: website || null,
      databaseUrl: databaseUrl || null,
      status,
      moduleCount: parseInt(moduleCount) || 0,
    })
  }

  const colorInfo = getErpColors(color)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editData ? 'Edit ERP System' : 'Add New ERP System'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editData ? 'Update the ERP system configuration.' : 'Configure a new ERP system to add to the platform.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <div className={`w-10 h-10 rounded-lg ${colorInfo.bg} ${colorInfo.border} border flex items-center justify-center`}>
              <ErpIconRender iconKey={icon} className={`w-5 h-5 ${colorInfo.text}`} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{name || 'ERP Name'}</p>
              <p className="text-xs text-muted-foreground">{slug || 'slug'}</p>
            </div>
            {getStatusBadge(status)}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Name *</Label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. ApparelFlow"
              className="bg-secondary/50 border-border text-foreground"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="e.g. apparelflow"
              className="bg-secondary/50 border-border text-foreground"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the ERP system"
              className="bg-secondary/50 border-border text-foreground min-h-[60px]"
            />
          </div>

          {/* Icon & Color row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <ErpIconRender iconKey={opt.value} className="w-4 h-4" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {COLOR_OPTIONS.map((opt) => {
                    const c = getErpColors(opt.value)
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Industry & Version */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Industry</Label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Apparel & Textile"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Version</Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Website URL</Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.vercel.app"
              className="bg-secondary/50 border-border text-foreground"
            />
          </div>

          {/* Database URL */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Database URL (Neon PostgreSQL)
            </Label>
            <Input
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
              placeholder="postgresql://user:pass@host/database?sslmode=require"
              type="password"
              className="bg-secondary/50 border-border text-foreground"
            />
          </div>

          {/* Status & Module Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Module Count</Label>
              <Input
                value={moduleCount}
                onChange={(e) => setModuleCount(e.target.value)}
                placeholder="0"
                type="number"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !slug || saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
            ) : null}
            {editData ? 'Save Changes' : 'Create ERP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── ERP Detail Slide-over Panel ───────────────────────────────────────────
function ErpDetailPanel({
  erp,
  onClose,
  onEdit,
  onTestConnection,
  connectionResult,
  testingConnection,
}: {
  erp: ErpDetail
  onClose: () => void
  onEdit: (erp: ErpDetail) => void
  onTestConnection: (slug: string) => void
  connectionResult: ConnectionTestResult | null
  testingConnection: boolean
}) {
  const colors = getErpColors(erp.color)

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l border-border z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={`relative bg-card/90 backdrop-blur border-b border-border p-5 overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50 pointer-events-none`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary -ml-2"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-foreground text-xs h-8"
                onClick={() => onTestConnection(erp.slug)}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                )}
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-foreground text-xs h-8"
                onClick={() => onEdit(erp)}
              >
                <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
              <ErpIconRender iconKey={erp.icon} className={`w-7 h-7 ${colors.text}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{erp.name}</h2>
                {getStatusBadge(erp.status)}
              </div>
              <p className="text-sm text-muted-foreground truncate">{erp.industry || 'No industry set'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Connection Test Result */}
        {connectionResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border ${
              connectionResult.connected
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {connectionResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm font-medium text-foreground">
                {connectionResult.connected ? 'Connected' : 'Connection Failed'}
              </span>
              {connectionResult.latency !== undefined && (
                <Badge variant="outline" className="border-border text-xs text-muted-foreground ml-auto">
                  {connectionResult.latency}ms
                </Badge>
              )}
            </div>
            {connectionResult.error && (
              <p className="text-xs text-red-400 mt-1">{connectionResult.error}</p>
            )}
            {connectionResult.clientCount !== undefined && connectionResult.clientCount > 0 && (
              <p className="text-xs text-emerald-400 mt-1">{connectionResult.clientCount} clients found</p>
            )}
            {connectionResult.schemaWarning && (
              <p className="text-xs text-amber-400 mt-1">{connectionResult.schemaWarning}</p>
            )}
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Clients</span>
            </div>
            <p className="text-xl font-bold text-foreground">{erp.clientCount}</p>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-xl font-bold text-foreground">PKR {erp.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Licenses</span>
            </div>
            <p className="text-xl font-bold text-foreground">{erp.licenseCount}</p>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Package className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-muted-foreground">Modules</span>
            </div>
            <p className="text-xl font-bold text-foreground">{erp.moduleCount}</p>
          </div>
        </div>

        {/* Description */}
        {erp.description && (
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{erp.description}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4 space-y-2.5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Details</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground">v{erp.version}</span>
          </div>
          {erp.website && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Website</span>
              <a
                href={erp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate max-w-[200px]"
              >
                {erp.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Slug</span>
            <span className="text-foreground font-mono text-xs">{erp.slug}</span>
          </div>
          {erp.pricing && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pricing</span>
              <span className="text-foreground">{erp.pricing}</span>
            </div>
          )}
        </div>

        {/* Modules */}
        {erp.modules && erp.modules.length > 0 && (
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Modules ({erp.modules.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {erp.modules.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{mod.name}</p>
                    {mod.category && (
                      <p className="text-xs text-muted-foreground">{mod.category}</p>
                    )}
                  </div>
                  {mod.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5">Active</Badge>
                  ) : (
                    <Badge className="bg-muted/50 text-muted-foreground border-border text-[9px] px-1.5">Inactive</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Clients */}
        {erp.recentClients && erp.recentClients.length > 0 && (
          <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Clients</h3>
            <div className="space-y-2">
              {erp.recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm text-foreground">{client.companyName}</p>
                    {client.licenseType && (
                      <p className="text-xs text-muted-foreground">{client.licenseType}</p>
                    )}
                  </div>
                  <Badge className={
                    client.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5'
                      : 'bg-muted/50 text-muted-foreground border-border text-[9px] px-1.5'
                  }>
                    {client.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Health */}
        <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Connection Health</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${getDbStatusDot(getDbStatus(erp as unknown as ErpListItem))}`} />
            <span className="text-sm text-muted-foreground">{getDbStatusLabel(getDbStatus(erp as unknown as ErpListItem))}</span>
          </div>
          {connectionResult?.latency !== undefined && connectionResult.connected && (
            <p className="text-xs text-muted-foreground mt-1.5">Latency: {connectionResult.latency}ms</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── ERP Card Component ────────────────────────────────────────────────────
function ErpCard({
  erp,
  connectionResult,
  isTesting,
  onViewDetails,
  onTestConnection,
  onConfigure,
}: {
  erp: ErpListItem
  connectionResult: ConnectionTestResult | undefined
  isTesting: boolean
  onViewDetails: () => void
  onTestConnection: () => void
  onConfigure: () => void
}) {
  const colors = getErpColors(erp.color)
  const dbStatus = getDbStatus(erp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5 flex flex-col hover:border-primary/30 transition-colors group"
    >
      {/* Top: Icon + Name + Status */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
          <ErpIconRender iconKey={erp.icon} className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">{erp.name}</h3>
            {getStatusBadge(erp.status)}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{erp.industry || 'No industry'}</p>
        </div>
      </div>

      {/* DB connection indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${getDbStatusDot(dbStatus)}`} />
        <span className="text-xs text-muted-foreground">{getDbStatusLabel(dbStatus)}</span>
        {connectionResult && (
          <span className={`text-xs ml-auto ${connectionResult.connected ? 'text-emerald-400' : 'text-red-400'}`}>
            {connectionResult.connected ? `${connectionResult.latency}ms` : 'Error'}
          </span>
        )}
        {isTesting && (
          <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <p className="text-lg font-bold text-foreground leading-none">{erp.moduleCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Modules</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <p className="text-lg font-bold text-foreground leading-none">{erp.orderCount ?? 0}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Orders</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <p className="text-lg font-bold text-foreground leading-none">{dbStatus === 'connected' ? '●' : '—'}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">DB</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-xs h-8"
          onClick={onViewDetails}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-xs h-8"
          onClick={onTestConnection}
          disabled={isTesting}
        >
          {isTesting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-xs h-8"
          onClick={onConfigure}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export function ErpManagementTab() {
  const [erps, setErps] = useState<ErpListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Add/Edit dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState<ErpListItem | ErpDetail | null>(null)
  const [saving, setSaving] = useState(false)

  // Detail panel
  const [detailErp, setDetailErp] = useState<ErpDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Connection test
  const [testingSlug, setTestingSlug] = useState<string | null>(null)
  const [connectionResults, setConnectionResults] = useState<Record<string, ConnectionTestResult>>({})
  const [panelConnectionResult, setPanelConnectionResult] = useState<ConnectionTestResult | null>(null)

  // Fetch all ERPs
  const fetchErps = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/erp')
      if (!res.ok) throw new Error('Failed to fetch ERP list')
      const data = await res.json()
      setErps(data.erpSystems || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ERP systems')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchErps()
  }, [fetchErps])

  // Test connection for an ERP
  const testConnection = useCallback(async (slug: string) => {
    setTestingSlug(slug)
    try {
      const res = await fetch(`/api/erp/${slug}/test-connection`)
      const data = await res.json()
      const result: ConnectionTestResult = {
        connected: data.connected,
        latency: data.latency,
        clientCount: data.clientCount,
        error: data.error,
        schemaWarning: data.schemaWarning,
      }
      setConnectionResults((prev) => ({ ...prev, [slug]: result }))
      // If the detail panel is open for this slug, update panel result too
      if (detailErp?.slug === slug) {
        setPanelConnectionResult(result)
      }
      return result
    } catch (err) {
      const result: ConnectionTestResult = {
        connected: false,
        error: err instanceof Error ? err.message : 'Connection test failed',
      }
      setConnectionResults((prev) => ({ ...prev, [slug]: result }))
      if (detailErp?.slug === slug) {
        setPanelConnectionResult(result)
      }
      return result
    } finally {
      setTestingSlug(null)
    }
  }, [detailErp])

  // Open detail panel
  const openDetail = useCallback(async (slug: string) => {
    setDetailLoading(true)
    setPanelConnectionResult(null)
    try {
      const res = await fetch(`/api/erp/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch ERP details')
      const data: ErpDetail = await res.json()
      setDetailErp(data)
      // If we already have a connection test result, use it
      if (connectionResults[slug]) {
        setPanelConnectionResult(connectionResults[slug])
      }
    } catch (err) {
      console.error('Failed to load ERP detail:', err)
    } finally {
      setDetailLoading(false)
    }
  }, [connectionResults])

  // Save new ERP
  const handleAddSave = useCallback(async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create ERP')
      }
      setAddDialogOpen(false)
      await fetchErps()
    } catch (err) {
      console.error('Failed to create ERP:', err)
    } finally {
      setSaving(false)
    }
  }, [fetchErps])

  // Save edited ERP
  const handleEditSave = useCallback(async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/erp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update ERP')
      }
      setEditDialogOpen(false)
      setEditData(null)
      await fetchErps()
      // If detail panel is open, refresh it
      if (detailErp) {
        openDetail(detailErp.slug)
      }
    } catch (err) {
      console.error('Failed to update ERP:', err)
    } finally {
      setSaving(false)
    }
  }, [fetchErps, detailErp, openDetail])

  // Edit from detail panel
  const handleEditFromPanel = useCallback((erp: ErpDetail) => {
    setEditData(erp)
    setEditDialogOpen(true)
  }, [])

  // Filter ERPs by search
  const filteredErps = erps.filter((erp) => {
    const q = search.toLowerCase()
    return (
      erp.name.toLowerCase().includes(q) ||
      erp.slug.toLowerCase().includes(q) ||
      (erp.industry || '').toLowerCase().includes(q) ||
      erp.status.toLowerCase().includes(q)
    )
  })

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-xl bg-card" />
          <Skeleton className="h-9 w-32 rounded-lg bg-card" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl bg-card" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load ERP Systems</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button
          variant="outline"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          onClick={fetchErps}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">ERP Systems</h2>
          <p className="text-sm text-muted-foreground">{erps.length} systems configured</p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add ERP
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, industry, or status..."
          className="pl-9 bg-card/90 backdrop-blur border-border rounded-xl h-10"
        />
      </div>

      {/* ERP Grid */}
      {filteredErps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No ERP systems match your search.' : 'No ERP systems found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredErps.map((erp) => (
              <ErpCard
                key={erp.id}
                erp={erp}
                connectionResult={connectionResults[erp.slug]}
                isTesting={testingSlug === erp.slug}
                onViewDetails={() => openDetail(erp.slug)}
                onTestConnection={() => testConnection(erp.slug)}
                onConfigure={() => { setEditData(erp); setEditDialogOpen(true) }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <ErpFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddSave}
        saving={saving}
      />

      {/* Edit Dialog */}
      <ErpFormDialog
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditData(null) }}
        onSave={handleEditSave}
        editData={editData}
        saving={saving}
      />

      {/* Detail Panel */}
      <AnimatePresence>
        {detailErp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-40"
              onClick={() => setDetailErp(null)}
            />
            <ErpDetailPanel
              erp={detailErp}
              onClose={() => setDetailErp(null)}
              onEdit={handleEditFromPanel}
              onTestConnection={testConnection}
              connectionResult={panelConnectionResult}
              testingConnection={testingSlug === detailErp.slug}
            />
          </>
        )}
      </AnimatePresence>

      {/* Detail Loading Overlay */}
      {detailLoading && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l border-border z-50 flex items-center justify-center">
          <div className="space-y-4 w-full px-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading ERP details...</span>
            </div>
            <Skeleton className="h-32 rounded-2xl bg-card" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-xl bg-card" />
              <Skeleton className="h-20 rounded-xl bg-card" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
