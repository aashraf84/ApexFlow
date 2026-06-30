'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Globe2, Image, Monitor, FileText, Code, Save, Loader2,
  Upload, RotateCcw, ChevronDown, ChevronRight, Eye,
  Sun, Moon, Palette, Type, Layout, Link2, Mail, Phone,
  MapPin, Hash, ToggleLeft, ToggleRight, Sparkles, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useSiteSettings } from '@/lib/site-settings-store'

// ─── Types ───────────────────────────────────────────────────────────────────
type SettingsGroup = Record<string, { value: string; description?: string }>
type AllSettings = Record<string, SettingsGroup>

type CategoryId = 'logo' | 'header' | 'footer' | 'content' | 'general'

interface CategoryMeta {
  id: CategoryId
  label: string
  icon: React.ElementType
  color: string
  description: string
}

const CATEGORIES: CategoryMeta[] = [
  { id: 'logo', label: 'Logo & Branding', icon: Image, color: 'cyan', description: 'Logo images, size, and placement' },
  { id: 'header', label: 'Header', icon: Monitor, color: 'violet', description: 'Navigation bar and header settings' },
  { id: 'footer', label: 'Footer', icon: FileText, color: 'emerald', description: 'Footer content and links' },
  { id: 'content', label: 'Content', icon: Type, color: 'amber', description: 'Site name, tagline, and metadata' },
  { id: 'general', label: 'General', icon: Code, color: 'rose', description: 'CSS, scripts, and advanced settings' },
]

const COLOR_CLASSES: Record<string, { bg: string; text: string; icon: string }> = {
  cyan: { bg: 'bg-[var(--gg-teal)]/10', text: 'text-[var(--gg-teal)]', icon: 'text-[var(--gg-teal)]' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', icon: 'text-violet-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', icon: 'text-rose-400' },
}

// ─── Setting Field Component ─────────────────────────────────────────────────
function SettingField({
  label,
  description,
  value,
  onChange,
  type = 'text',
  placeholder,
  settingKey,
  onReset,
}: {
  label: string
  description?: string
  value: string
  onChange: (val: string) => void
  type?: 'text' | 'number' | 'url' | 'textarea' | 'toggle' | 'color' | 'select'
  placeholder?: string
  settingKey: string
  onReset: (key: string) => void
}) {
  if (type === 'toggle') {
    const isOn = value === 'true'
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {description && (
              <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded" title={description}>
                <Info className="w-3 h-3 inline" />
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button
          onClick={() => onChange(isOn ? 'false' : 'true')}
          className={`shrink-0 transition-all duration-200 ${isOn ? 'text-primary' : 'text-muted-foreground'}`}
        >
          {isOn ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
        </button>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-2 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground">{label}</Label>
              {description && (
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded" title={description}>
                  <Info className="w-3 h-3 inline" />
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button
            onClick={() => onReset(settingKey)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-y"
        />
      </div>
    )
  }

  if (type === 'color') {
    return (
      <div className="space-y-2 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground">{label}</Label>
              {description && (
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded" title={description}>
                  <Info className="w-3 h-3 inline" />
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button
            onClick={() => onReset(settingKey)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || '#000000'}
            className="bg-secondary border-border focus:border-primary/50 rounded-xl flex-1"
          />
        </div>
      </div>
    )
  }

  if (type === 'select') {
    return (
      <div className="space-y-2 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground">{label}</Label>
              {description && (
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded" title={description}>
                  <Info className="w-3 h-3 inline" />
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button
            onClick={() => onReset(settingKey)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-secondary border-border focus:border-primary/50 rounded-xl"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-foreground">{label}</Label>
            {description && (
              <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded" title={description}>
                <Info className="w-3 h-3 inline" />
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button
          onClick={() => onReset(settingKey)}
          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          title="Reset to default"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <Input
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-secondary border-border focus:border-primary/50 rounded-xl"
      />
    </div>
  )
}

// ─── Logo Upload Field ───────────────────────────────────────────────────────
function LogoUploadField({
  label,
  description,
  currentUrl,
  settingKey,
  onUploaded,
  onReset,
  onUrlChange,
}: {
  label: string
  description: string
  currentUrl: string
  settingKey: string
  onUploaded: (url: string, key: string) => void
  onReset: (key: string) => void
  onUrlChange: (key: string, url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.')
      return
    }
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PNG, JPG, SVG, WebP, GIF')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('key', settingKey)

      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      onUploaded(data.url, data.key)
      toast.success(`${label} uploaded successfully`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  return (
    <div className="space-y-3 py-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => onReset(settingKey)}
          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          title="Reset to default"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="max-w-full max-h-full object-contain p-1" />
          ) : (
            <Image className="w-6 h-6 text-muted-foreground/30" alt="" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* URL input */}
          <div className="flex gap-2 mb-2">
            <Input
              value={currentUrl}
              onChange={(e) => onUrlChange(settingKey, e.target.value)}
              placeholder="Enter URL or upload file"
              className="bg-secondary border-border focus:border-primary/50 rounded-xl text-xs"
            />
          </div>
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer transition-all text-xs ${
              dragOver
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {uploading ? 'Uploading...' : 'Drop file or click to upload'}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Category Section Component ──────────────────────────────────────────────
function CategorySection({
  category,
  settings,
  onSettingChange,
  onLogoUploaded,
  onLogoUrlChange,
  onReset,
  isExpanded,
  onToggle,
}: {
  category: CategoryMeta
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onLogoUploaded: (url: string, key: string) => void
  onLogoUrlChange: (key: string, url: string) => void
  onReset: (key: string) => void
  isExpanded: boolean
  onToggle: () => void
}) {
  const colors = COLOR_CLASSES[category.color] || COLOR_CLASSES.cyan
  const Icon = category.icon
  const settingEntries = Object.entries(settings)

  if (settingEntries.length === 0) return null

  // Determine field type based on key name
  const getFieldType = (key: string, desc?: string): 'text' | 'number' | 'url' | 'textarea' | 'toggle' | 'color' | 'select' => {
    if (key.includes('_url') || key.includes('_link')) return 'url'
    if (key.includes('_height') || key.includes('_size')) return 'number'
    if (key.includes('show_') || key.includes('_enabled') || key.includes('maintenance_mode')) return 'toggle'
    if (key.includes('_color') || key.includes('bg_')) return 'color'
    if (key === 'custom_css' || key === 'custom_header_scripts') return 'textarea'
    if (key === 'site_logo_placement' || key === 'site_primary_color') return 'select'
    return 'text'
  }

  // Get select options for specific fields
  const getSelectOptions = (key: string): string[] | undefined => {
    if (key === 'site_logo_placement') return ['left', 'center']
    if (key === 'site_primary_color') return ['cyan', 'violet', 'emerald', 'amber', 'rose', 'blue', 'teal']
    return undefined
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden"
    >
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            {settingEntries.length} settings
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Category Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <Separator className="mb-4 bg-border" />
              {category.id === 'logo' ? (
                // Logo category has special upload fields
                <div className="space-y-2">
                  <LogoUploadField
                    label="Light Mode Logo"
                    description="Full logo for light backgrounds"
                    currentUrl={settings.site_logo_url?.value || ''}
                    settingKey="site_logo_url"
                    onUploaded={onLogoUploaded}
                    onReset={onReset}
                    onUrlChange={onLogoUrlChange}
                  />
                  <LogoUploadField
                    label="Dark Mode Logo"
                    description="Full logo for dark backgrounds"
                    currentUrl={settings.site_logo_dark_url?.value || ''}
                    settingKey="site_logo_dark_url"
                    onUploaded={onLogoUploaded}
                    onReset={onReset}
                    onUrlChange={onLogoUrlChange}
                  />
                  <LogoUploadField
                    label="Light Mode Icon"
                    description="Icon-only logo for light backgrounds"
                    currentUrl={settings.site_logo_icon_url?.value || ''}
                    settingKey="site_logo_icon_url"
                    onUploaded={onLogoUploaded}
                    onReset={onReset}
                    onUrlChange={onLogoUrlChange}
                  />
                  <LogoUploadField
                    label="Dark Mode Icon"
                    description="Icon-only logo for dark backgrounds"
                    currentUrl={settings.site_logo_icon_dark_url?.value || ''}
                    settingKey="site_logo_icon_dark_url"
                    onUploaded={onLogoUploaded}
                    onReset={onReset}
                    onUrlChange={onLogoUrlChange}
                  />
                  <SettingField
                    label="Logo Height"
                    description="Logo height in pixels (16-80)"
                    value={settings.site_logo_height?.value || '36'}
                    onChange={(val) => onSettingChange('site_logo_height', val)}
                    type="number"
                    placeholder="36"
                    settingKey="site_logo_height"
                    onReset={onReset}
                  />
                  <SettingField
                    label="Logo Placement"
                    description="Logo position in the header"
                    value={settings.site_logo_placement?.value || 'left'}
                    onChange={(val) => onSettingChange('site_logo_placement', val)}
                    type="select"
                    placeholder="left"
                    settingKey="site_logo_placement"
                    onReset={onReset}
                  />

                  {/* Logo Preview */}
                  <div className="mt-4 p-4 rounded-xl bg-secondary border border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3 h-3" /> Logo Preview
                    </p>
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 rounded-lg bg-white flex items-center justify-center min-h-[60px]">
                        <img
                          src={settings.site_logo_url?.value || '/logo-full.png'}
                          alt="Light logo"
                          className="max-h-[50px] object-contain"
                          style={{ height: `${parseInt(settings.site_logo_height?.value || '36')}px` }}
                        />
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-zinc-900 flex items-center justify-center min-h-[60px]">
                        <img
                          src={settings.site_logo_dark_url?.value || '/logo-full-dark.png'}
                          alt="Dark logo"
                          className="max-h-[50px] object-contain"
                          style={{ height: `${parseInt(settings.site_logo_height?.value || '36')}px` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <span className="flex-1 text-center text-[10px] text-muted-foreground">Light Mode</span>
                      <span className="flex-1 text-center text-[10px] text-muted-foreground">Dark Mode</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Other categories use standard fields
                <div className="space-y-2">
                  {settingEntries.map(([key, data]) => (
                    <SettingField
                      key={key}
                      label={formatLabel(key)}
                      description={data.description}
                      value={data.value}
                      onChange={(val) => onSettingChange(key, val)}
                      type={getFieldType(key, data.description)}
                      placeholder={data.value}
                      settingKey={key}
                      onReset={onReset}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Label formatter ─────────────────────────────────────────────────────────
function formatLabel(key: string): string {
  return key
    .replace(/^(site_|header_|footer_|general_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SiteSettingsTab() {
  const [allSettings, setAllSettings] = useState<AllSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryId>>(new Set(['logo']))
  const [hasChanges, setHasChanges] = useState(false)
  const pendingChanges = useRef<Record<string, string>>({})
  const { refresh: refreshStore } = useSiteSettings()

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site-settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAllSettings(data.settings || {})
    } catch {
      toast.error('Failed to load site settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSettingChange = (key: string, value: string) => {
    pendingChanges.current[key] = value
    setHasChanges(true)

    // Update local state optimistically
    setAllSettings((prev) => {
      const updated = { ...prev }
      for (const [catKey, catSettings] of Object.entries(updated)) {
        if (key in catSettings) {
          updated[catKey] = {
            ...catSettings,
            [key]: { ...catSettings[key], value },
          }
        }
      }
      // If key not found in any category, add to 'custom'
      if (!Object.values(updated).some((cat) => key in cat)) {
        if (!updated['custom']) updated['custom'] = {}
        updated['custom'][key] = { value, description: '' }
      }
      return updated
    })
  }

  const handleLogoUploaded = (url: string, key: string) => {
    handleSettingChange(key, url)
  }

  const handleLogoUrlChange = (key: string, url: string) => {
    handleSettingChange(key, url)
  }

  const handleReset = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/site-settings?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Reset failed')
      toast.success('Setting reset to default')
      await fetchSettings()
      await refreshStore()
    } catch {
      toast.error('Failed to reset setting')
    }
  }

  const handleSave = async () => {
    const changes = pendingChanges.current
    if (Object.keys(changes).length === 0) return

    setSaving(true)
    try {
      const updates = Object.entries(changes).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Save failed')
      }

      toast.success(`Saved ${updates.length} setting${updates.length > 1 ? 's' : ''}`)
      pendingChanges.current = {}
      setHasChanges(false)
      await refreshStore()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (id: CategoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(CATEGORIES.map((c) => c.id)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-56 rounded-xl bg-card" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg bg-card" />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl bg-card" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-primary" />
            Site Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Complete control over your site&apos;s appearance and content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="text-xs text-muted-foreground"
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="text-xs text-muted-foreground"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const colors = COLOR_CLASSES[cat.color]
          const count = Object.keys(allSettings[cat.id] || {}).length
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => {
                toggleCategory(cat.id)
              }}
              className={`p-3 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors text-left group ${
                expandedCategories.has(cat.id) ? 'ring-1 ring-primary/30' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-md ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{count} setting{count !== 1 ? 's' : ''}</span>
            </button>
          )
        })}
      </div>

      {/* Category Sections */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            settings={allSettings[cat.id] || {}}
            onSettingChange={handleSettingChange}
            onLogoUploaded={handleLogoUploaded}
            onLogoUrlChange={handleLogoUrlChange}
            onReset={handleReset}
            isExpanded={expandedCategories.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
          />
        ))}
      </div>

      {/* Save Button (floating) */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 z-10"
          >
            <div className="flex items-center justify-between p-4 bg-card/95 backdrop-blur border border-border rounded-2xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-foreground">Unsaved changes</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    pendingChanges.current = {}
                    setHasChanges(false)
                    fetchSettings()
                  }}
                  className="text-xs"
                >
                  Discard
                </Button>
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
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
