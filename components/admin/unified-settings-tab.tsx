'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  User,
  Palette,
  Layout,
  FileText,
  Share2,
  Plug,
  CreditCard,
  Bell,
  Shield,
  Code,
  Save,
  Loader2,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  MessageCircle,
  Github,
  MessagesSquare,
  Send,
  Wifi,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon,
  Search,
  ChevronRight,
  ChevronDown,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useSiteSettings } from '@/lib/site-settings-store'
import { useAppStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const PaymentSettingsTab = dynamic(
  () => import('@/components/admin/payment-settings-tab').then((mod) => ({ default: mod.PaymentSettingsTab })),
  { ssr: false, loading: () => <div className="space-y-4 max-w-4xl"><Skeleton className="h-8 w-56 rounded-xl bg-card" /><Skeleton className="h-64 rounded-2xl bg-card" /><Skeleton className="h-48 rounded-2xl bg-card" /></div> }
)

// ─── Types ───────────────────────────────────────────────────────────────────
type SettingsGroup = Record<string, { value: string; description?: string }>
type AllSettings = Record<string, SettingsGroup>

type SectionId =
  | 'profile'
  | 'site-identity'
  | 'branding'
  | 'contact'
  | 'header-footer'
  | 'seo'
  | 'social'
  | 'features'
  | 'integrations'
  | 'payment'
  | 'notifications'
  | 'security'
  | 'advanced'
  | 'database'

type IntegrationTab = 'analytics' | 'email' | 'sms' | 'storage' | 'auth' | 'erp'

interface CategoryMeta {
  id: SectionId
  label: string
  icon: React.ElementType
  color: string
  description: string
}

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
  databaseUrl?: string | null
  hasDatabaseUrl?: boolean
}

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'disconnected'

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: CategoryMeta[] = [
  { id: 'profile', label: 'Profile', icon: User, color: 'cyan', description: 'Admin user profile editing' },
  { id: 'site-identity', label: 'Site Identity', icon: Globe, color: 'cyan', description: 'Site name, tagline, description' },
  { id: 'branding', label: 'Branding', icon: Palette, color: 'violet', description: 'Logo, colors, favicon' },
  { id: 'contact', label: 'Contact', icon: Mail, color: 'emerald', description: 'Email, phone, address, hours' },
  { id: 'header-footer', label: 'Header & Footer', icon: Layout, color: 'emerald', description: 'Navigation bar and footer settings' },
  { id: 'seo', label: 'SEO & Content', icon: FileText, color: 'amber', description: 'SEO meta, Open Graph, search engine' },
  { id: 'social', label: 'Social Media', icon: Share2, color: 'pink', description: 'All social platform URLs' },
  { id: 'features', label: 'Features', icon: ToggleRight, color: 'violet', description: 'Enable/disable site features' },
  { id: 'integrations', label: 'Integrations', icon: Plug, color: 'cyan', description: 'Analytics, email, SMS, storage, auth, ERP' },
  { id: 'payment', label: 'Payment', icon: CreditCard, color: 'emerald', description: 'Currency, Stripe, tax config' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'orange', description: 'Notification preferences' },
  { id: 'security', label: 'Security', icon: Shield, color: 'rose', description: 'Security and compliance' },
  { id: 'advanced', label: 'Advanced', icon: Code, color: 'slate', description: 'Developer and system settings' },
  { id: 'database', label: 'Database', icon: Database, color: 'cyan', description: 'Neon PostgreSQL configuration and connectivity' },
]

const COLOR_CLASSES: Record<string, { bg: string; text: string; icon: string; border: string; ring: string }> = {
  cyan: { bg: 'bg-[var(--gg-teal)]/10', text: 'text-[var(--gg-teal)]', icon: 'text-[var(--gg-teal)]', border: 'border-[var(--gg-teal)]/20', ring: 'ring-[var(--gg-teal)]/30' },
  violet: { bg: 'bg-[var(--gg-amber)]/10', text: 'text-[var(--gg-amber)]', icon: 'text-[var(--gg-amber)]', border: 'border-[var(--gg-amber)]/20', ring: 'ring-[var(--gg-amber)]/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400', border: 'border-emerald-500/20', ring: 'ring-emerald-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400', border: 'border-amber-500/20', ring: 'ring-amber-500/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', icon: 'text-pink-400', border: 'border-pink-500/20', ring: 'ring-pink-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: 'text-orange-400', border: 'border-orange-500/20', ring: 'ring-orange-500/30' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', icon: 'text-rose-400', border: 'border-rose-500/20', ring: 'ring-rose-500/30' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: 'text-slate-400', border: 'border-slate-500/20', ring: 'ring-slate-500/30' },
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  social_facebook_url: Facebook,
  social_twitter_url: Twitter,
  social_linkedin_url: Linkedin,
  social_instagram_url: Instagram,
  social_youtube_url: Youtube,
  social_tiktok_url: MessageCircle,
  social_whatsapp_number: MessageCircle,
  social_github_url: Github,
  social_discord_url: MessagesSquare,
  social_telegram_url: Send,
}

const SOCIAL_LABELS: Record<string, string> = {
  social_facebook_url: 'Facebook',
  social_twitter_url: 'Twitter / X',
  social_linkedin_url: 'LinkedIn',
  social_instagram_url: 'Instagram',
  social_youtube_url: 'YouTube',
  social_tiktok_url: 'TikTok',
  social_whatsapp_number: 'WhatsApp',
  social_github_url: 'GitHub',
  social_discord_url: 'Discord',
  social_telegram_url: 'Telegram',
}

const SENSITIVE_KEYS = new Set([
  'email_smtp_pass', 'email_sendgrid_key', 'email_mailgun_key', 'email_ses_secret_key', 'email_ses_access_key',
  'sms_twilio_token', 'sms_vonage_secret', 'sms_vonage_key',
  'storage_s3_secret_key', 'storage_s3_access_key', 'storage_r2_secret_key', 'storage_r2_access_key',
  'auth_google_client_secret', 'auth_github_client_secret', 'auth_microsoft_client_secret',
  'notif_webhook_secret',
  'payment_stripe_secret_key', 'payment_stripe_webhook_secret', 'payment_paypal_secret',
])

const TOGGLE_KEYS = new Set([
  'header_show_search', 'header_show_theme_toggle', 'header_sticky', 'header_show_cta',
  'footer_show_newsletter',
  'analytics_enabled',
  'notif_email_enabled', 'notif_sms_enabled', 'notif_push_enabled', 'notif_webhook_enabled',
  'notif_order_created', 'notif_payment_received', 'notif_client_registered', 'notif_support_ticket', 'notif_system_alerts',
  'security_2fa_enabled', 'security_gdpr_compliant', 'security_cookie_consent', 'security_ssl_enforced',
  'auth_sso_enabled',
  'maintenance_mode', 'backup_enabled',
  'feature_user_registration', 'feature_demo_requests', 'feature_blog', 'feature_contact_form',
  'feature_pricing_page', 'feature_careers_page', 'feature_api_docs', 'feature_changelog',
  'feature_status_page', 'feature_live_chat', 'feature_dark_mode', 'feature_multi_language',
  'feature_analytics_dashboard', 'feature_referral_system',
  'payment_tax_enabled', 'payment_bank_transfer_enabled',
])

const TEXTAREA_KEYS = new Set([
  'custom_css', 'custom_header_scripts', 'custom_body_scripts',
  'seo_robots_txt', 'security_ip_whitelist', 'security_cors_origins',
  'payment_bank_details',
])

const SELECT_OPTIONS: Record<string, { label: string; value: string }[]> = {
  email_provider: [
    { label: 'SMTP', value: 'smtp' },
    { label: 'SendGrid', value: 'sendgrid' },
    { label: 'Mailgun', value: 'mailgun' },
    { label: 'Amazon SES', value: 'ses' },
  ],
  sms_provider: [
    { label: 'None', value: 'none' },
    { label: 'Twilio', value: 'twilio' },
    { label: 'Vonage', value: 'vonage' },
  ],
  storage_provider: [
    { label: 'Local', value: 'local' },
    { label: 'AWS S3', value: 's3' },
    { label: 'Google Cloud', value: 'gcs' },
    { label: 'Cloudflare R2', value: 'r2' },
  ],
  site_logo_placement: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
  ],
  site_primary_color: [
    { label: 'Cyan', value: 'cyan' },
    { label: 'Violet', value: 'violet' },
    { label: 'Emerald', value: 'emerald' },
    { label: 'Amber', value: 'amber' },
    { label: 'Rose', value: 'rose' },
    { label: 'Blue', value: 'blue' },
    { label: 'Teal', value: 'teal' },
  ],
  backup_frequency: [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ],
  log_level: [
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warn' },
    { label: 'Error', value: 'error' },
  ],
  payment_currency: [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
    { label: 'PKR (₨)', value: 'PKR' },
    { label: 'INR (₹)', value: 'INR' },
    { label: 'AED (د.إ)', value: 'AED' },
    { label: 'SAR (﷼)', value: 'SAR' },
    { label: 'CAD (C$)', value: 'CAD' },
    { label: 'AUD (A$)', value: 'AUD' },
    { label: 'JPY (¥)', value: 'JPY' },
  ],
}

// ─── Helper: Format label from key ──────────────────────────────────────────
function formatLabel(key: string): string {
  return key
    .replace(/^(site_|header_|footer_|seo_|social_|analytics_|email_|sms_|storage_|auth_|notif_|security_|contact_|feature_|payment_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Toggle switch button */
function ToggleSwitch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isOn = value === 'true'
  return (
    <button
      type="button"
      onClick={() => onChange(isOn ? 'false' : 'true')}
      className={`shrink-0 transition-all duration-200 ${isOn ? 'text-primary' : 'text-muted-foreground'}`}
    >
      {isOn ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
    </button>
  )
}

/** Password input with eye toggle */
function SensitiveInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-secondary border-border focus:border-primary/50 rounded-xl pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

/** Logo upload field with preview, URL input, and drag-and-drop */
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
      const res = await fetch('/api/admin/site-settings', { method: 'POST', body: formData })
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
      <div className="flex items-center gap-4">
        <div className="w-24 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="max-w-full max-h-[50px] object-contain p-1" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-2">
            <Input
              value={currentUrl}
              onChange={(e) => onUrlChange(settingKey, e.target.value)}
              placeholder="Enter URL or upload file"
              className="bg-secondary border-border focus:border-primary/50 rounded-xl text-xs"
            />
          </div>
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
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
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

/** Generic setting field */
function SettingField({
  label,
  description,
  value,
  onChange,
  settingKey,
  onReset,
}: {
  label: string
  description?: string
  value: string
  onChange: (val: string) => void
  settingKey: string
  onReset: (key: string) => void
}) {
  const isToggle = TOGGLE_KEYS.has(settingKey)
  const isTextarea = TEXTAREA_KEYS.has(settingKey)
  const isSensitive = SENSITIVE_KEYS.has(settingKey)
  const selectOpts = SELECT_OPTIONS[settingKey]
  const isNumber = settingKey.includes('_height') || settingKey.includes('_port') || settingKey.includes('_timeout') || settingKey.includes('_limit') || settingKey.includes('_attempts') || settingKey.includes('_retention') || settingKey.includes('_per_min') || settingKey.includes('rate_limit')

  if (isToggle) {
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
        <ToggleSwitch value={value} onChange={onChange} />
      </div>
    )
  }

  if (isTextarea) {
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
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-secondary border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-y"
        />
      </div>
    )
  }

  if (selectOpts) {
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
        <div className="flex flex-wrap gap-2">
          {selectOpts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                value === opt.value
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (isSensitive) {
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
        <SensitiveInput value={value} onChange={onChange} placeholder={description} />
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
        type={isNumber ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={description || label}
        className="bg-secondary border-border focus:border-primary/50 rounded-xl"
      />
    </div>
  )
}

// ─── Section Renderers ───────────────────────────────────────────────────────

/** Profile section */
function ProfileSection({
  profile,
  editName,
  editEmail,
  setEditName,
  setEditEmail,
  saving,
  onSave,
}: {
  profile: Profile | null
  editName: string
  editEmail: string
  setEditName: (v: string) => void
  setEditEmail: (v: string) => void
  saving: boolean
  onSave: () => void
}) {
  const { adminUser } = useAppStore()
  const getInitial = () => {
    if (profile?.name) return profile.name.charAt(0).toUpperCase()
    if (adminUser?.name) return adminUser.name.charAt(0).toUpperCase()
    return 'A'
  }

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Your account information</p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gg-vermillion)] to-[var(--gg-amber)] flex items-center justify-center text-white font-bold text-xl shrink-0">
            {getInitial()}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground truncate">{profile?.name ?? adminUser?.name ?? 'Admin'}</p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email ?? adminUser?.email ?? ''}</p>
            <Badge variant="secondary" className="mt-1 bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20 text-[10px]">
              {profile?.role ?? adminUser?.role ?? 'admin'}
            </Badge>
          </div>
        </div>

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
            onClick={onSave}
            disabled={saving}
            className="bg-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/90 text-white rounded-xl px-6 btn-glow"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

/** Site Identity section — name, tagline, description */
function SiteIdentitySection({
  brandingSettings,
  seoSettings,
  onSettingChange,
  onReset,
}: {
  brandingSettings: SettingsGroup
  seoSettings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const identityKeys = [
    { key: 'site_name', source: brandingSettings },
    { key: 'site_tagline', source: brandingSettings },
    { key: 'site_description', source: seoSettings },
  ]

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Site Identity</h2>
        <p className="text-sm text-muted-foreground mt-1">Core site name, tagline, and description used across the platform</p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[var(--gg-teal)]" /> Basic Information
        </h3>
        {identityKeys.map(({ key, source }) => {
          const data = source[key]
          if (!data) return null
          return (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          )
        })}
      </div>

      {/* Live Preview Card */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[var(--gg-teal)]" /> Identity Preview
        </h3>
        <div className="p-4 rounded-xl bg-secondary border border-border space-y-2">
          <p className="text-lg font-bold text-foreground">
            {brandingSettings.site_name?.value || 'ApexFlow'}
          </p>
          <p className="text-sm text-primary/80 font-medium">
            {brandingSettings.site_tagline?.value || 'One Engine. Every Industry. Unstoppable Scale.'}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {seoSettings.site_description?.value || 'AI Powered Operating Systems that run entire industries.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/** Contact Information section */
function ContactSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const emailKeys = Object.entries(settings).filter(([key]) => key.includes('email'))
  const phoneKeys = Object.entries(settings).filter(([key]) => key.includes('phone'))
  const otherKeys = Object.entries(settings).filter(([key]) => !key.includes('email') && !key.includes('phone'))

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
        <p className="text-sm text-muted-foreground mt-1">Email addresses, phone numbers, and business location</p>
      </div>

      {/* Email Addresses */}
      {emailKeys.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" /> Email Addresses
          </h3>
          {emailKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* Phone Numbers */}
      {phoneKeys.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" /> Phone Numbers
          </h3>
          {phoneKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* Location & Hours */}
      {otherKeys.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> Location & Hours
          </h3>
          {otherKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* Quick Contact Card */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" /> Contact Card Preview
        </h3>
        <div className="p-4 rounded-xl bg-secondary border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">General</p>
              <p className="text-sm text-foreground">{settings.contact_email?.value || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</p>
              <p className="text-sm text-foreground">{settings.contact_phone?.value || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Address</p>
              <p className="text-sm text-foreground">{settings.contact_address?.value || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hours</p>
              <p className="text-sm text-foreground">{settings.contact_business_hours?.value || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** Feature Toggles section */
function FeaturesSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const publicFeatures = Object.entries(settings).filter(([key]) =>
    ['feature_blog', 'feature_pricing_page', 'feature_careers_page', 'feature_contact_form', 'feature_changelog', 'feature_api_docs', 'feature_status_page'].includes(key)
  )
  const userFeatures = Object.entries(settings).filter(([key]) =>
    ['feature_user_registration', 'feature_demo_requests', 'feature_dark_mode', 'feature_multi_language', 'feature_live_chat', 'feature_referral_system'].includes(key)
  )
  const adminFeatures = Object.entries(settings).filter(([key]) =>
    ['feature_analytics_dashboard'].includes(key)
  )

  const enabledCount = Object.values(settings).filter((d) => d.value === 'true').length
  const totalCount = Object.keys(settings).length

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feature Toggles</h2>
          <p className="text-sm text-muted-foreground mt-1">Enable or disable site features and pages</p>
        </div>
        <Badge variant="secondary" className="bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20 text-xs px-3 py-1">
          {enabledCount}/{totalCount} enabled
        </Badge>
      </div>

      {/* Public Pages */}
      {publicFeatures.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--gg-amber)]" /> Public Pages & Sections
          </h3>
          {publicFeatures.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* User Features */}
      {userFeatures.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--gg-amber)]" /> User Features
          </h3>
          {userFeatures.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* Admin Features */}
      {adminFeatures.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--gg-amber)]" /> Admin Features
          </h3>
          {adminFeatures.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

/** Payment Configuration section — replaces the old dynamic PaymentSettingsTab */
function PaymentConfigSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const generalKeys = Object.entries(settings).filter(([key]) =>
    ['payment_currency', 'payment_currency_symbol'].includes(key)
  )
  const stripeKeys = Object.entries(settings).filter(([key]) => key.includes('stripe'))
  const paypalKeys = Object.entries(settings).filter(([key]) => key.includes('paypal'))
  const taxKeys = Object.entries(settings).filter(([key]) => key.includes('tax'))
  const bankKeys = Object.entries(settings).filter(([key]) => key.includes('bank'))

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Payment Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">Currency, payment gateways, tax, and billing settings</p>
      </div>

      {/* Currency */}
      {generalKeys.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Currency & Display
          </h3>
          {generalKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* Stripe */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" /> Stripe Integration
        </h3>
        {stripeKeys.length > 0 ? (
          stripeKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">Stripe settings will appear after saving defaults</p>
        )}
      </div>

      {/* PayPal */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" /> PayPal Integration
        </h3>
        {paypalKeys.length > 0 ? (
          paypalKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">PayPal settings will appear after saving defaults</p>
        )}
      </div>

      {/* Tax */}
      {taxKeys.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Tax Configuration
          </h3>
          {taxKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}

      {/* Bank Transfer */}
      {bankKeys.length > 0 && (
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Bank Transfer
          </h3>
          {bankKeys.map(([key, data]) => (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

/** Branding section */
function BrandingSection({
  settings,
  onSettingChange,
  onLogoUploaded,
  onLogoUrlChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onLogoUploaded: (url: string, key: string) => void
  onLogoUrlChange: (key: string, url: string) => void
  onReset: (key: string) => void
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Branding</h2>
        <p className="text-sm text-muted-foreground mt-1">Logo, colors, and site identity</p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[var(--gg-amber)]" /> Logo Images
        </h3>
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
          onLogoUrlChange={onLogoUrlChange}
        />
        <LogoUploadField
          label="Light Mode Icon"
          description="Icon-only logo for light backgrounds"
          currentUrl={settings.site_logo_icon_url?.value || ''}
          settingKey="site_logo_icon_url"
          onUploaded={onLogoUploaded}
          onReset={onReset}
          onLogoUrlChange={onLogoUrlChange}
        />
        <LogoUploadField
          label="Dark Mode Icon"
          description="Icon-only logo for dark backgrounds"
          currentUrl={settings.site_logo_icon_dark_url?.value || ''}
          settingKey="site_logo_icon_dark_url"
          onUploaded={onLogoUploaded}
          onReset={onReset}
          onLogoUrlChange={onLogoUrlChange}
        />

        <Separator className="my-4 bg-border" />

        {/* Logo Preview */}
        <div className="p-4 rounded-xl bg-secondary border border-border">
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
            <span className="flex-1 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <Sun className="w-3 h-3" /> Light Mode
            </span>
            <span className="flex-1 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <Moon className="w-3 h-3" /> Dark Mode
            </span>
          </div>
        </div>

        <Separator className="my-4 bg-border" />

        {/* Other branding fields */}
        {[
          'site_logo_height', 'site_logo_placement', 'site_name', 'site_tagline',
          'site_primary_color', 'site_favicon_url',
        ].map((key) => {
          const data = settings[key]
          if (!data) return null
          return (
            <SettingField
              key={key}
              label={formatLabel(key)}
              description={data.description}
              value={data.value}
              onChange={(val) => onSettingChange(key, val)}
              settingKey={key}
              onReset={onReset}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

/** Header & Footer section */
function HeaderFooterSection({
  headerSettings,
  footerSettings,
  onSettingChange,
  onReset,
}: {
  headerSettings: SettingsGroup
  footerSettings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Header & Footer</h2>
        <p className="text-sm text-muted-foreground mt-1">Navigation bar and footer settings</p>
      </div>

      {/* Header */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Layout className="w-4 h-4 text-emerald-400" /> Header Settings
        </h3>
        {Object.entries(headerSettings).map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Layout className="w-4 h-4 text-emerald-400" /> Footer Settings
        </h3>
        {Object.entries(footerSettings).map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>
    </motion.div>
  )
}

/** SEO & Content section */
function SeoSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">SEO & Content</h2>
        <p className="text-sm text-muted-foreground mt-1">SEO meta, Open Graph, and search engine settings</p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        {Object.entries(settings).map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>
    </motion.div>
  )
}

/** Social Media section */
function SocialSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Social Media</h2>
        <p className="text-sm text-muted-foreground mt-1">All social platform URLs and connections</p>
      </div>

      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-3">
        {Object.entries(settings).map(([key, data]) => {
          const IconComp = SOCIAL_ICONS[key] || Globe
          const customLabel = SOCIAL_LABELS[key] || formatLabel(key)
          return (
            <div key={key} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                <IconComp className="w-4 h-4 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium text-foreground">{customLabel}</Label>
                {data.description && <p className="text-[10px] text-muted-foreground">{data.description}</p>}
              </div>
              <div className="flex-1 max-w-sm">
                <Input
                  value={data.value}
                  onChange={(e) => onSettingChange(key, e.target.value)}
                  placeholder={`https://...`}
                  className="bg-background border-border focus:border-primary/50 rounded-xl text-xs h-9"
                />
              </div>
              <button
                onClick={() => onReset(key)}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition-colors shrink-0"
                title="Reset to default"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/** Integrations section with tabs */
function IntegrationsSection({
  allSettings,
  onSettingChange,
  onReset,
  erpSystems,
  erpLoading,
  connectionStatuses,
  connectionDetails,
  onTestConnection,
}: {
  allSettings: AllSettings
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
  erpSystems: ErpSystem[]
  erpLoading: boolean
  connectionStatuses: Record<string, ConnectionStatus>
  connectionDetails: Record<string, { latency?: number; clientCount?: number; error?: string }>
  onTestConnection: (slug: string) => void
}) {
  const [activeTab, setActiveTab] = useState<IntegrationTab>('erp')
  const [expandedErp, setExpandedErp] = useState<string | null>(null)
  const [erpDbUrls, setErpDbUrls] = useState<Record<string, string>>({})
  const [savingUrls, setSavingUrls] = useState<Record<string, boolean>>({})

  // Load ERP database URLs on mount
  useEffect(() => {
    const loadErpDbUrls = async () => {
      try {
        const res = await fetch('/api/admin/erp-database-urls')
        if (res.ok) {
          const data = await res.json()
          const urls: Record<string, string> = {}
          for (const erp of data.erps || []) {
            if (erp.slug && erp.hasUrl) {
              urls[erp.slug] = erp.databaseUrl || ''
            }
          }
          setErpDbUrls(urls)
        }
      } catch { /* ignore */ }
    }
    loadErpDbUrls()
  }, [])

  const saveErpDbUrl = async (slug: string) => {
    const url = erpDbUrls[slug]
    setSavingUrls(prev => ({ ...prev, [slug]: true }))
    try {
      const res = await fetch('/api/admin/erp-database-urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, databaseUrl: url || null }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.success) {
        toast.success(`${slug} database URL saved`)
        onTestConnection(slug)
      } else {
        toast.error(data.error || 'Failed to save database URL')
      }
    } catch {
      toast.error('Failed to save database URL')
    } finally {
      setSavingUrls(prev => ({ ...prev, [slug]: false }))
    }
  }

  const tabs: { id: IntegrationTab; label: string; icon: React.ElementType }[] = [
    { id: 'analytics', label: 'Analytics', icon: Search },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: Phone },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'auth', label: 'Authentication', icon: Shield },
    { id: 'erp', label: 'ERP Connections', icon: Plug },
  ]

  const categoryMap: Record<string, string> = {
    analytics: 'analytics',
    email: 'email',
    sms: 'sms',
    storage: 'storage',
    auth: 'auth',
  }

  const renderSettingsForCategory = (category: string) => {
    const settings = allSettings[category] || {}
    const entries = Object.entries(settings)
    if (entries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Plug className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No settings found for this category</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        {entries.map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>
    )
  }

  const renderErpConnections = () => {
    if (erpLoading) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl bg-card" />
          ))}
        </div>
      )
    }
    if (erpSystems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Plug className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No ERP systems registered yet</p>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        {erpSystems.map((erp) => {
          const status = connectionStatuses[erp.slug]
          const details = connectionDetails[erp.slug]
          const isActive = erp.status === 'active'
          const isExpanded = expandedErp === erp.slug
          const hasUrl = erp.hasDatabaseUrl || !!erpDbUrls[erp.slug]
          return (
            <div
              key={erp.slug}
              className={`rounded-xl bg-secondary border overflow-hidden transition-all ${
                isActive
                  ? status === 'connected'
                    ? 'border-emerald-500/20'
                    : hasUrl
                      ? 'border-[var(--gg-teal)]/20'
                      : 'border-amber-500/20'
                  : 'border-border'
              }`}
            >
              {/* ERP Header Row */}
              <div
                className="py-3 px-4 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => setExpandedErp(isExpanded ? null : erp.slug)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${isActive ? 'text-[var(--gg-teal)]' : 'text-muted-foreground'}`}>
                        {erp.name}
                      </p>
                      {isActive ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Coming Soon</Badge>
                      )}
                      {hasUrl ? (
                        <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[10px]">
                          <Database className="w-3 h-3 mr-1" />
                          DB Configured
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                          No Database
                        </Badge>
                      )}
                      {erp.moduleCount > 0 && (
                        <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                          {erp.moduleCount} modules
                        </Badge>
                      )}
                      {status === 'connected' && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                          <Zap className="w-3 h-3 mr-1" />
                          {details?.latency}ms
                        </Badge>
                      )}
                      {status === 'disconnected' && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                          <XCircle className="w-3 h-3 mr-1" />
                          {details?.error || 'Failed'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{erp.industry}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {status === 'connected' && details?.clientCount !== undefined && details.clientCount > 0 && (
                      <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-[10px]">
                        {details.clientCount} clients
                      </Badge>
                    )}
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); onTestConnection(erp.slug) }}
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
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expandable Database URL Config */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3 bg-card/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-[var(--gg-teal)]" />
                    <p className="text-xs font-semibold text-foreground">Neon PostgreSQL Connection</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
                      value={erpDbUrls[erp.slug] || ''}
                      onChange={(e) => setErpDbUrls(prev => ({ ...prev, [erp.slug]: e.target.value }))}
                      className="text-xs h-9 bg-background/50 border-border/50 font-mono"
                    />
                    <Button
                      size="sm"
                      className="text-xs h-9 shrink-0 bg-[var(--gg-teal)] hover:bg-[var(--gg-teal)]/90 text-white"
                      onClick={() => saveErpDbUrl(erp.slug)}
                      disabled={savingUrls[erp.slug] || !erpDbUrls[erp.slug]}
                    >
                      {savingUrls[erp.slug] ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Save
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Enter the Neon PostgreSQL connection string for this ERP&apos;s database. 
                    The URL must start with <code className="text-[var(--gg-teal)]">postgresql://</code>
                  </p>
                  {status === 'connected' && details?.latency && (
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Latency: <span className="text-emerald-400">{details.latency}ms</span></span>
                      {details.clientCount !== undefined && <span>Clients: <span className="text-[var(--gg-teal)]">{details.clientCount}</span></span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">Analytics, email, SMS, storage, authentication, and ERP connections</p>
      </div>

      {/* Integration Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-card/60 border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
        >
          {activeTab === 'erp' ? renderErpConnections() : renderSettingsForCategory(categoryMap[activeTab] || activeTab)}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

/** Notifications section */
function NotificationsSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const toggleKeys = Object.entries(settings).filter(([key]) => TOGGLE_KEYS.has(key))
  const configKeys = Object.entries(settings).filter(([key]) => !TOGGLE_KEYS.has(key))

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">Notification channels and event preferences</p>
      </div>

      {/* Channels */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" /> Notification Channels
        </h3>
        {toggleKeys.filter(([k]) => k.startsWith('notif_') && (k.endsWith('_enabled'))).map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>

      {/* Webhook Config */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-400" /> Webhook Configuration
        </h3>
        {configKeys.map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>

      {/* Event Triggers */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" /> Event Triggers
        </h3>
        {toggleKeys.filter(([k]) => !k.endsWith('_enabled')).map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>
    </motion.div>
  )
}

/** Security section */
function SecuritySection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const toggleEntries = Object.entries(settings).filter(([key]) => TOGGLE_KEYS.has(key))
  const configEntries = Object.entries(settings).filter(([key]) => !TOGGLE_KEYS.has(key))

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">Security and compliance settings</p>
      </div>

      {/* Security Toggles */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" /> Access & Compliance
        </h3>
        {toggleEntries.map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>

      {/* Security Configuration */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Code className="w-4 h-4 text-rose-400" /> Configuration
        </h3>
        {configEntries.map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>
    </motion.div>
  )
}

/** Advanced section */
function AdvancedSection({
  settings,
  onSettingChange,
  onReset,
}: {
  settings: SettingsGroup
  onSettingChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  const toggleEntries = Object.entries(settings).filter(([key]) => TOGGLE_KEYS.has(key))
  const configEntries = Object.entries(settings).filter(([key]) => !TOGGLE_KEYS.has(key))

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Advanced</h2>
        <p className="text-sm text-muted-foreground mt-1">Developer and system settings</p>
      </div>

      {/* System Toggles */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-400" /> System Controls
        </h3>
        {toggleEntries.map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>

      {/* Configuration */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-400" /> Configuration
        </h3>
        {configEntries.map(([key, data]) => (
          <SettingField
            key={key}
            label={formatLabel(key)}
            description={data.description}
            value={data.value}
            onChange={(val) => onSettingChange(key, val)}
            settingKey={key}
            onReset={onReset}
          />
        ))}
      </div>
    </motion.div>
  )
}

/** Database section — Neon PostgreSQL configuration and connectivity */
function DatabaseSection() {
  const [dbStatus, setDbStatus] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ connected: boolean; latency?: number; type: string; error?: string } | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/admin/database-status')
        if (res.ok) {
          const data = await res.json()
          setDbStatus(data)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchStatus()
  }, [])

  const testMainDb = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/admin/database-status')
      if (res.ok) {
        const data = await res.json()
        setDbStatus(data)
        setTestResult({
          connected: data.connected,
          latency: data.latency,
          type: data.database?.type || 'Unknown',
          error: data.error,
        })
        if (data.connected) {
          toast.success(`Database connected (${data.latency}ms)`)
        } else {
          toast.error(`Database error: ${data.error || 'Connection failed'}`)
        }
      }
    } catch {
      setTestResult({ connected: false, type: 'Unknown', error: 'Network error' })
      toast.error('Failed to test database connection')
    } finally {
      setTesting(false)
    }
  }

  const dbType = (dbStatus?.database as Record<string, unknown>)?.type as string || 'Unknown'
  const isConnected = dbStatus?.connected as boolean
  const latency = dbStatus?.latency as number
  const tables = (dbStatus?.database as Record<string, unknown>)?.tables as Record<string, number> || {}
  const erpSummary = dbStatus?.erpDbSummary as Record<string, number> || {}
  const erpConnections = (dbStatus?.erpDbConnections as Array<Record<string, unknown>>) || []

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Database</h2>
        <p className="text-sm text-muted-foreground mt-1">Neon PostgreSQL configuration and connectivity</p>
      </div>

      {/* Main Database Status */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--gg-teal)]" /> Main Database
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-[var(--gg-teal)] hover:text-[var(--gg-amber)]"
            onClick={testMainDb}
            disabled={testing}
          >
            {testing ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Wifi className="w-3.5 h-3.5 mr-1.5" />
            )}
            Test Connection
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 bg-secondary" />
            <Skeleton className="h-4 w-32 bg-secondary" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs'
                : 'bg-red-500/10 text-red-400 border-red-500/20 text-xs'
              }>
                {isConnected ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
                )}
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                {dbType}
              </Badge>
              {isConnected && latency !== undefined && (
                <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20 text-xs">
                  <Zap className="w-3 h-3 mr-1" /> {latency}ms
                </Badge>
              )}
            </div>

            {/* Table Counts */}
            {Object.keys(tables).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                {Object.entries(tables).map(([table, count]) => (
                  <div key={table} className="bg-secondary/50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-muted-foreground capitalize">{table.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm font-semibold text-foreground">{count as number}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Config Note */}
            <div className="mt-3 p-3 bg-[var(--gg-teal)]/5 border border-[var(--gg-teal)]/20 rounded-xl">
              <p className="text-xs text-muted-foreground">
                <strong className="text-[var(--gg-teal)]">Neon PostgreSQL:</strong> Set your <code className="text-[var(--gg-teal)]">DATABASE_URL</code> and <code className="text-[var(--gg-teal)]">DIRECT_URL</code> in the <code className="text-[var(--gg-teal)]">.env</code> file.
                Format: <code className="text-[var(--gg-teal)] font-mono text-[10px]">postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require</code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ERP Database Connections */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plug className="w-4 h-4 text-[var(--gg-teal)]" /> ERP Database Connections
        </h3>

        {erpSummary.total > 0 ? (
          <div className="space-y-3">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-secondary/50 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">Total</p>
                <p className="text-sm font-semibold text-foreground">{erpSummary.total}</p>
              </div>
              <div className="bg-emerald-500/5 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-emerald-400">Connected</p>
                <p className="text-sm font-semibold text-emerald-400">{erpSummary.connected}</p>
              </div>
              <div className="bg-red-500/5 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-red-400">Failed</p>
                <p className="text-sm font-semibold text-red-400">{erpSummary.disconnected}</p>
              </div>
              <div className="bg-amber-500/5 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-amber-400">Not Configured</p>
                <p className="text-sm font-semibold text-amber-400">{erpSummary.notConfigured}</p>
              </div>
            </div>

            {/* Connection List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {erpConnections.map((conn) => (
                <div key={conn.slug as string} className="flex items-center justify-between px-3 py-2 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(conn.connected as boolean) ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="text-xs font-medium text-foreground">{conn.name as string}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.latency != null && (
                      <span className="text-[10px] text-muted-foreground">{conn.latency as number}ms</span>
                    )}
                    {conn.clientCount != null && (conn.clientCount as number) > 0 && (
                      <Badge variant="secondary" className="bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] text-[10px] px-1.5">
                        {conn.clientCount as number} clients
                      </Badge>
                    )}
                    {conn.error && (
                      <span className="text-[10px] text-red-400 max-w-32 truncate">{conn.error as string}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground">
              Configure ERP database URLs in <strong>Settings → Integrations → ERP Connections</strong>. Click any ERP to expand and set its Neon PostgreSQL connection string.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            No ERP database connections configured. Go to <strong>Integrations → ERP Connections</strong> to set them up.
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function UnifiedSettingsTab() {
  const { adminUser, setAdminUser } = useAppStore()
  const adminUserRef = useRef(adminUser)
  adminUserRef.current = adminUser

  // Active section
  const [activeSection, setActiveSection] = useState<SectionId>('profile')

  // Settings data
  const [allSettings, setAllSettings] = useState<AllSettings>({})
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const pendingChanges = useRef<Record<string, string>>({})

  // Profile edit fields
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  // ERP connections
  const [erpSystems, setErpSystems] = useState<ErpSystem[]>([])
  const [erpLoading, setErpLoading] = useState(true)
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({})
  const [connectionDetails, setConnectionDetails] = useState<Record<string, { latency?: number; clientCount?: number; error?: string }>>({})

  const { refresh: refreshStore } = useSiteSettings()

  // ─── Fetch all data on mount ─────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site-settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAllSettings(data.settings || {})
    } catch {
      toast.error('Failed to load site settings')
    }
  }, [])

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
      const fallback = adminUserRef.current
      if (fallback) {
        setProfile({ id: fallback.id, name: fallback.name, email: fallback.email, role: fallback.role })
        setEditName(fallback.name)
        setEditEmail(fallback.email)
      }
    } finally {
      setLoading(false)
    }
  }, [setAdminUser])

  const fetchErpSystems = useCallback(async () => {
    try {
      const [erpRes, dbUrlRes] = await Promise.all([
        fetch('/api/erp'),
        fetch('/api/admin/erp-database-urls'),
      ])
      if (!erpRes.ok) throw new Error('Failed to fetch')
      const data = await erpRes.json()
      const dbUrlData = dbUrlRes.ok ? await dbUrlRes.json() : { erps: [] }
      const dbUrlMap = new Map<string, { databaseUrl: string | null; hasUrl: boolean }>()
      for (const erp of dbUrlData.erps || []) {
        dbUrlMap.set(erp.slug, { databaseUrl: erp.databaseUrl, hasUrl: erp.hasUrl })
      }
      const systems: ErpSystem[] = (data.erpSystems || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        name: e.name as string,
        slug: e.slug as string,
        status: e.status as string,
        industry: e.industry as string,
        moduleCount: (e.moduleCount as number) ?? 0,
        databaseUrl: dbUrlMap.get(e.slug as string)?.databaseUrl || null,
        hasDatabaseUrl: dbUrlMap.get(e.slug as string)?.hasUrl || false,
      }))
      setErpSystems(systems)
      const statuses: Record<string, ConnectionStatus> = {}
      const details: Record<string, { latency?: number; clientCount?: number; error?: string }> = {}
      for (const erp of systems) {
        statuses[erp.slug] = 'idle'
        details[erp.slug] = {}
      }
      setConnectionStatuses(statuses)
      setConnectionDetails(details)
    } catch {
      console.error('[UnifiedSettings] Failed to fetch ERP systems')
    } finally {
      setErpLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchSettings(), fetchProfile(), fetchErpSystems()])
  }, [fetchSettings, fetchProfile, fetchErpSystems])

  // ─── Setting change handlers ─────────────────────────────────────────────

  const handleSettingChange = (key: string, value: string) => {
    pendingChanges.current[key] = value
    setHasChanges(true)
    setAllSettings((prev) => {
      const updated = { ...prev }
      for (const [catKey, catSettings] of Object.entries(updated)) {
        if (key in catSettings) {
          updated[catKey] = { ...catSettings, [key]: { ...catSettings[key], value } }
        }
      }
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
      const res = await fetch(`/api/admin/site-settings?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Reset failed')
      toast.success('Setting reset to default')
      await fetchSettings()
      await refreshStore()
    } catch {
      toast.error('Failed to reset setting')
    }
  }

  // ─── Save profile ────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
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
        setAdminUser({ id: updated.id, name: updated.name, email: updated.email, role: updated.role, avatar: null })
      }
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ─── Save site settings (batch) ─────────────────────────────────────────

  const handleSaveSettings = async () => {
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

  // ─── Discard changes ────────────────────────────────────────────────────

  const handleDiscard = () => {
    pendingChanges.current = {}
    setHasChanges(false)
    fetchSettings()
  }

  // ─── Test ERP connection ────────────────────────────────────────────────

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
        toast.success(`${slug} connected (${data.latency}ms)`)
      } else {
        setConnectionStatuses((prev) => ({ ...prev, [slug]: 'disconnected' }))
        setConnectionDetails((prev) => ({ ...prev, [slug]: { error: data.error } }))
        toast.error(`Connection failed: ${data.error || 'Unknown error'}`)
      }
    } catch {
      setConnectionStatuses((prev) => ({ ...prev, [slug]: 'disconnected' }))
      setConnectionDetails((prev) => ({ ...prev, [slug]: { error: 'Network error' } }))
      toast.error('Connection test failed')
    }
  }

  // ─── Get setting count for a section ────────────────────────────────────

  const getSettingCount = (sectionId: SectionId): number => {
    switch (sectionId) {
      case 'profile': return profile ? 3 : 0
      case 'site-identity': return 3
      case 'branding': return Object.keys(allSettings.branding || {}).length
      case 'contact': return Object.keys(allSettings.contact || {}).length
      case 'header-footer': return Object.keys(allSettings.header || {}).length + Object.keys(allSettings.footer || {}).length
      case 'seo': return Object.keys(allSettings.seo || {}).length
      case 'social': return Object.keys(allSettings.social || {}).length
      case 'features': return Object.keys(allSettings.features || {}).length
      case 'integrations': {
        const cats = ['analytics', 'email', 'sms', 'storage', 'auth']
        return cats.reduce((sum, cat) => sum + Object.keys(allSettings[cat] || {}).length, 0) + erpSystems.length
      }
      case 'payment': return Object.keys(allSettings.payment || {}).length
      case 'notifications': return Object.keys(allSettings.notifications || {}).length
      case 'security': return Object.keys(allSettings.security || {}).length
      case 'advanced': return Object.keys(allSettings.advanced || {}).length
      case 'database': return 1 // Always shows database status
      default: return 0
    }
  }

  // ─── Render main content ────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection
            profile={profile}
            editName={editName}
            editEmail={editEmail}
            setEditName={setEditName}
            setEditEmail={setEditEmail}
            saving={saving}
            onSave={handleSaveProfile}
          />
        )
      case 'site-identity':
        return (
          <SiteIdentitySection
            brandingSettings={allSettings.branding || {}}
            seoSettings={allSettings.seo || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'branding':
        return (
          <BrandingSection
            settings={allSettings.branding || {}}
            onSettingChange={handleSettingChange}
            onLogoUploaded={handleLogoUploaded}
            onLogoUrlChange={handleLogoUrlChange}
            onReset={handleReset}
          />
        )
      case 'contact':
        return (
          <ContactSection
            settings={allSettings.contact || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'header-footer':
        return (
          <HeaderFooterSection
            headerSettings={allSettings.header || {}}
            footerSettings={allSettings.footer || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'seo':
        return (
          <SeoSection
            settings={allSettings.seo || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'social':
        return (
          <SocialSection
            settings={allSettings.social || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'features':
        return (
          <FeaturesSection
            settings={allSettings.features || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'integrations':
        return (
          <IntegrationsSection
            allSettings={allSettings}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
            erpSystems={erpSystems}
            erpLoading={erpLoading}
            connectionStatuses={connectionStatuses}
            connectionDetails={connectionDetails}
            onTestConnection={testConnection}
          />
        )
      case 'payment':
        return <PaymentSettingsTab />
      case 'notifications':
        return (
          <NotificationsSection
            settings={allSettings.notifications || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'security':
        return (
          <SecuritySection
            settings={allSettings.security || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'advanced':
        return (
          <AdvancedSection
            settings={allSettings.advanced || {}}
            onSettingChange={handleSettingChange}
            onReset={handleReset}
          />
        )
      case 'database':
        return <DatabaseSection />
      default:
        return null
    }
  }

  // ─── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-[220px] border-r border-border p-4 space-y-2 shrink-0">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl bg-card" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-56 rounded-xl bg-card" />
          <Skeleton className="h-64 rounded-2xl bg-card" />
          <Skeleton className="h-48 rounded-2xl bg-card" />
        </div>
      </div>
    )
  }

  // ─── Main render ────────────────────────────────────────────────────────

  return (
    <div className="flex h-full min-h-0">
      {/* ─── Left Sidebar ─── */}
      <div className="w-[220px] border-r border-border bg-card/40 backdrop-blur shrink-0 flex flex-col">
        <div className="p-4 pb-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-primary" />
            Settings
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const colors = COLOR_CLASSES[cat.color] || COLOR_CLASSES.cyan
            const Icon = cat.icon
            const isActive = activeSection === cat.id
            const count = getSettingCount(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => setActiveSection(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? `bg-primary/10 ${colors.border} border`
                    : 'border border-transparent hover:bg-secondary/60'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? colors.bg : 'bg-secondary/80'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? colors.icon : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {cat.label}
                  </p>
                </div>
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className={`text-[9px] px-1.5 py-0 h-4 min-w-[18px] flex items-center justify-center ${
                      isActive
                        ? `${colors.bg} ${colors.text} ${colors.border} border`
                        : 'bg-secondary text-muted-foreground border-border border'
                    }`}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Sticky Save Bar ─── */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 right-0 left-[220px] z-20 p-4"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between p-4 bg-card/95 backdrop-blur border border-border rounded-2xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-foreground">
                  {Object.keys(pendingChanges.current).length} unsaved change{Object.keys(pendingChanges.current).length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscard}
                  className="text-xs"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSaveSettings}
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
