'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Megaphone,
  Share2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Mail,
  MessageSquare,
  Globe,
  Target,
  Send,
  Eye,
  MousePointerClick,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Pause,
  FileEdit,
  XCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  MessageCircle,
  Share,
  Image as ImageIcon,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CampaignStats {
  sent: number
  opened: number
  clicked: number
  bounced: number
}

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  subject: string | null
  content: string
  targetAudience: string | null
  scheduleAt: string | null
  sentAt: string | null
  stats: string
  createdAt: string
  updatedAt: string
}

interface SocialPostStats {
  likes: number
  shares: number
  comments: number
}

interface SocialPost {
  id: string
  accountId: string | null
  platform: string
  content: string
  mediaUrl: string | null
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  stats: string
  createdAt: string
  updatedAt: string
}

// ─── Helper: Parse JSON stats ───────────────────────────────────────────────

function parseCampaignStats(statsStr: string): CampaignStats {
  try {
    return JSON.parse(statsStr) as CampaignStats
  } catch {
    return { sent: 0, opened: 0, clicked: 0, bounced: 0 }
  }
}

function parseSocialPostStats(statsStr: string): SocialPostStats {
  try {
    return JSON.parse(statsStr) as SocialPostStats
  } catch {
    return { likes: 0, shares: 0, comments: 0 }
  }
}

// ─── Helper: Format date ────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ─── Badge color maps ───────────────────────────────────────────────────────

interface BadgeColorDef {
  className: string
  style?: React.CSSProperties
}

const CAMPAIGN_STATUS_COLORS: Record<string, BadgeColorDef> = {
  draft: { className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  active: { className: '', style: { background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 30%, transparent)' } },
  paused: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  completed: { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

const CAMPAIGN_TYPE_COLORS: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sms: 'bg-green-500/20 text-green-400 border-green-500/30',
  social: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ads: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

const SOCIAL_PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  twitter: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  linkedin: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
}

const SOCIAL_STATUS_COLORS: Record<string, BadgeColorDef> = {
  draft: { className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  scheduled: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  published: { className: '', style: { background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)', color: 'var(--gg-vermillion)', borderColor: 'color-mix(in srgb, var(--gg-vermillion) 30%, transparent)' } },
  failed: { className: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

// ─── Helper: Merge badge color ──────────────────────────────────────────────

function getBadgeProps(colorDef: BadgeColorDef | string | undefined, fallback: string): { className: string; style?: React.CSSProperties } {
  if (!colorDef) return { className: fallback }
  if (typeof colorDef === 'string') return { className: colorDef }
  return { className: colorDef.className || fallback, style: colorDef.style }
}

// ─── Icon helpers ───────────────────────────────────────────────────────────

function CampaignTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'email': return <Mail className="h-4 w-4" />
    case 'sms': return <MessageSquare className="h-4 w-4" />
    case 'social': return <Share2 className="h-4 w-4" />
    case 'ads': return <Target className="h-4 w-4" />
    default: return <Megaphone className="h-4 w-4" />
  }
}

function CampaignStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'draft': return <FileEdit className="h-3.5 w-3.5" />
    case 'active': return <CheckCircle2 className="h-3.5 w-3.5" />
    case 'paused': return <Pause className="h-3.5 w-3.5" />
    case 'completed': return <CheckCircle2 className="h-3.5 w-3.5" />
    default: return null
  }
}

function SocialPlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'facebook': return <Facebook className="h-4 w-4" />
    case 'twitter': return <Twitter className="h-4 w-4" />
    case 'instagram': return <Instagram className="h-4 w-4" />
    case 'linkedin': return <Linkedin className="h-4 w-4" />
    default: return <Globe className="h-4 w-4" />
  }
}

function SocialStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'draft': return <FileEdit className="h-3.5 w-3.5" />
    case 'scheduled': return <Clock className="h-3.5 w-3.5" />
    case 'published': return <CheckCircle2 className="h-3.5 w-3.5" />
    case 'failed': return <XCircle className="h-3.5 w-3.5" />
    default: return null
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminMarketingPage() {
  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all')
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('all')
  const [campaignSearch, setCampaignSearch] = useState('')

  // Social posts state
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [socialPostsLoading, setSocialPostsLoading] = useState(true)
  const [socialSearch, setSocialSearch] = useState('')

  // Campaign dialog state
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    subject: '',
    content: '',
    targetAudience: 'all',
    scheduleAt: '',
  })
  const [campaignSaving, setCampaignSaving] = useState(false)

  // Social post dialog state
  const [socialDialogOpen, setSocialDialogOpen] = useState(false)
  const [editingSocialPost, setEditingSocialPost] = useState<SocialPost | null>(null)
  const [socialForm, setSocialForm] = useState({
    platform: 'facebook',
    content: '',
    mediaUrl: '',
    status: 'draft',
    scheduledAt: '',
  })
  const [socialSaving, setSocialSaving] = useState(false)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'campaign' | 'social'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ─── Fetch campaigns ────────────────────────────────────────────────────

  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true)
    try {
      const params = new URLSearchParams()
      if (campaignStatusFilter && campaignStatusFilter !== 'all') params.set('status', campaignStatusFilter)
      if (campaignTypeFilter && campaignTypeFilter !== 'all') params.set('type', campaignTypeFilter)
      const res = await fetch(`/api/marketing/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data.data || data)
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
      toast.error('Failed to load campaigns')
    } finally {
      setCampaignsLoading(false)
    }
  }, [campaignStatusFilter, campaignTypeFilter])

  // ─── Fetch social posts ─────────────────────────────────────────────────

  const fetchSocialPosts = useCallback(async () => {
    setSocialPostsLoading(true)
    try {
      const res = await fetch('/api/marketing/social-posts')
      if (!res.ok) throw new Error('Failed to fetch social posts')
      const data = await res.json()
      setSocialPosts(data.data || data)
    } catch (err) {
      console.error('Failed to fetch social posts:', err)
      toast.error('Failed to load social posts')
    } finally {
      setSocialPostsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  useEffect(() => {
    fetchSocialPosts()
  }, [fetchSocialPosts])

  // ─── Campaign CRUD ─────────────────────────────────────────────────────

  const openCreateCampaign = useCallback(() => {
    setEditingCampaign(null)
    setCampaignForm({
      name: '',
      type: 'email',
      status: 'draft',
      subject: '',
      content: '',
      targetAudience: 'all',
      scheduleAt: '',
    })
    setCampaignDialogOpen(true)
  }, [])

  const openEditCampaign = useCallback((campaign: Campaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      subject: campaign.subject || '',
      content: campaign.content,
      targetAudience: campaign.targetAudience || 'all',
      scheduleAt: campaign.scheduleAt ? new Date(campaign.scheduleAt).toISOString().slice(0, 16) : '',
    })
    setCampaignDialogOpen(true)
  }, [])

  const handleSaveCampaign = useCallback(async () => {
    if (!campaignForm.name.trim() || !campaignForm.content.trim()) {
      toast.error('Name and content are required')
      return
    }

    setCampaignSaving(true)
    try {
      const payload = {
        name: campaignForm.name.trim(),
        type: campaignForm.type,
        status: campaignForm.status,
        subject: campaignForm.subject || null,
        content: campaignForm.content.trim(),
        targetAudience: campaignForm.targetAudience,
        scheduleAt: campaignForm.scheduleAt || null,
      }

      if (editingCampaign) {
        const res = await fetch(`/api/marketing/campaigns/${editingCampaign.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update campaign')
        toast.success('Campaign updated successfully')
      } else {
        const res = await fetch('/api/marketing/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create campaign')
        toast.success('Campaign created successfully')
      }

      setCampaignDialogOpen(false)
      fetchCampaigns()
    } catch (err) {
      console.error('Save campaign error:', err)
      toast.error(editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign')
    } finally {
      setCampaignSaving(false)
    }
  }, [campaignForm, editingCampaign, fetchCampaigns])

  // ─── Social Post CRUD ──────────────────────────────────────────────────

  const openCreateSocialPost = useCallback(() => {
    setEditingSocialPost(null)
    setSocialForm({
      platform: 'facebook',
      content: '',
      mediaUrl: '',
      status: 'draft',
      scheduledAt: '',
    })
    setSocialDialogOpen(true)
  }, [])

  const openEditSocialPost = useCallback((post: SocialPost) => {
    setEditingSocialPost(post)
    setSocialForm({
      platform: post.platform,
      content: post.content,
      mediaUrl: post.mediaUrl || '',
      status: post.status,
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
    })
    setSocialDialogOpen(true)
  }, [])

  const handleSaveSocialPost = useCallback(async () => {
    if (!socialForm.content.trim()) {
      toast.error('Content is required')
      return
    }

    setSocialSaving(true)
    try {
      const payload = {
        platform: socialForm.platform,
        content: socialForm.content.trim(),
        mediaUrl: socialForm.mediaUrl || null,
        status: socialForm.status,
        scheduledAt: socialForm.scheduledAt || null,
        publishedAt: socialForm.status === 'published' && !editingSocialPost?.publishedAt
          ? new Date().toISOString()
          : undefined,
      }

      if (editingSocialPost) {
        const res = await fetch(`/api/marketing/social-posts/${editingSocialPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update social post')
        toast.success('Social post updated successfully')
      } else {
        const res = await fetch('/api/marketing/social-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create social post')
        toast.success('Social post created successfully')
      }

      setSocialDialogOpen(false)
      fetchSocialPosts()
    } catch (err) {
      console.error('Save social post error:', err)
      toast.error(editingSocialPost ? 'Failed to update social post' : 'Failed to create social post')
    } finally {
      setSocialSaving(false)
    }
  }, [socialForm, editingSocialPost, fetchSocialPosts])

  // ─── Delete handler ────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      const endpoint = deleteTarget.type === 'campaign'
        ? `/api/marketing/campaigns/${deleteTarget.id}`
        : `/api/marketing/social-posts/${deleteTarget.id}`

      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      toast.success(
        deleteTarget.type === 'campaign' ? 'Campaign deleted' : 'Social post deleted'
      )

      if (deleteTarget.type === 'campaign') {
        fetchCampaigns()
      } else {
        fetchSocialPosts()
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, fetchCampaigns, fetchSocialPosts])

  // ─── Filtered campaigns (client-side search) ───────────────────────────

  const filteredCampaigns = campaigns.filter((c) => {
    if (!campaignSearch) return true
    const q = campaignSearch.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.subject || '').toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      (c.targetAudience || '').toLowerCase().includes(q)
    )
  })

  const filteredSocialPosts = socialPosts.filter((p) => {
    if (!socialSearch) return true
    const q = socialSearch.toLowerCase()
    return (
      p.content.toLowerCase().includes(q) ||
      p.platform.toLowerCase().includes(q)
    )
  })

  // ─── Stats summary ────────────────────────────────────────────────────

  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  }

  const socialStats = {
    total: socialPosts.length,
    published: socialPosts.filter((p) => p.status === 'published').length,
    scheduled: socialPosts.filter((p) => p.status === 'scheduled').length,
    draft: socialPosts.filter((p) => p.status === 'draft').length,
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'color-mix(in srgb, var(--gg-vermillion) 20%, transparent)' }}
          >
            <Megaphone className="h-5 w-5" style={{ color: 'var(--gg-vermillion)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Marketing Hub</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Manage campaigns and social media posts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="bg-gray-800/50 border" style={{ borderColor: 'var(--gg-separator)' }}>
          <TabsTrigger
            value="campaigns"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="data-[state=active]:bg-[color-mix(in_srgb,var(--gg-vermillion)_20%,transparent)] data-[state=active]:text-[var(--gg-vermillion)]"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Social Posts
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════
            CAMPAIGNS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: campaignStats.total, icon: Megaphone, color: 'text-muted-foreground' },
              { label: 'Active', value: campaignStats.active, icon: CheckCircle2, color: 'text-[var(--gg-vermillion)]' },
              { label: 'Draft', value: campaignStats.draft, icon: FileEdit, color: 'text-gray-500' },
              { label: 'Completed', value: campaignStats.completed, icon: CheckCircle2, color: 'text-blue-400' },
            ].map((stat) => (
              <Card
                key={stat.label}
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1 w-full">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search campaigns..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="pl-9 bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
                />
              </div>
              <Select value={campaignStatusFilter} onValueChange={setCampaignStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-gray-800/50 border-white/10 text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={campaignTypeFilter} onValueChange={setCampaignTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-gray-800/50 border-white/10 text-foreground">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="ads">Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={openCreateCampaign}
              className="text-foreground hover:opacity-90 shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </div>

          {/* Campaign cards */}
          {campaignsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="h-5 bg-gray-700/50 rounded w-3/4" />
                    <div className="h-4 bg-gray-700/50 rounded w-1/2" />
                    <div className="h-4 bg-gray-700/50 rounded w-2/3" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-700/50 rounded w-16" />
                      <div className="h-6 bg-gray-700/50 rounded w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Megaphone className="h-12 w-12 text-gray-600 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No campaigns found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {campaignSearch || campaignStatusFilter !== 'all' || campaignTypeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first campaign to get started'}
                </p>
                {!campaignSearch && campaignStatusFilter === 'all' && campaignTypeFilter === 'all' && (
                  <Button
                    onClick={openCreateCampaign}
                    className="mt-4 text-foreground hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((campaign) => {
                const stats = parseCampaignStats(campaign.stats)
                return (
                  <Card
                    key={campaign.id}
                    className="hover:border-[color-mix(in_srgb,var(--gg-vermillion)_30%,transparent)] transition-colors cursor-pointer group"
                    style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
                    onClick={() => openEditCampaign(campaign)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-foreground text-base truncate group-hover:text-[var(--gg-vermillion)] transition-colors">
                            {campaign.name}
                          </CardTitle>
                          {campaign.subject && (
                            <p className="text-gray-500 text-xs mt-1 truncate">{campaign.subject}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-foreground hover:bg-gray-800"
                            onClick={() => openEditCampaign(campaign)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeleteTarget({ type: 'campaign', id: campaign.id, name: campaign.name })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={`${CAMPAIGN_TYPE_COLORS[campaign.type] || 'bg-gray-500/20 text-gray-400'} text-xs`}
                        >
                          <CampaignTypeIcon type={campaign.type} />
                          <span className="ml-1 capitalize">{campaign.type}</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${getBadgeProps(CAMPAIGN_STATUS_COLORS[campaign.status], 'bg-gray-500/20 text-gray-400').className} text-xs`}
                          style={getBadgeProps(CAMPAIGN_STATUS_COLORS[campaign.status], 'bg-gray-500/20 text-gray-400').style}
                        >
                          <CampaignStatusIcon status={campaign.status} />
                          <span className="ml-1 capitalize">{campaign.status}</span>
                        </Badge>
                      </div>

                      {/* Target audience */}
                      {campaign.targetAudience && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Target className="h-3.5 w-3.5" />
                          <span className="capitalize">{campaign.targetAudience}</span>
                        </div>
                      )}

                      {/* Schedule */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {campaign.status === 'completed' || campaign.sentAt
                            ? `Sent: ${formatDate(campaign.sentAt)}`
                            : campaign.scheduleAt
                              ? `Scheduled: ${formatDateTime(campaign.scheduleAt)}`
                              : 'No schedule'}
                        </span>
                      </div>

                      {/* Stats row */}
                      {(stats.sent > 0 || stats.opened > 0 || stats.clicked > 0 || stats.bounced > 0) && (
                        <div className="grid grid-cols-4 gap-2 pt-2" style={{ borderTopColor: 'var(--gg-separator)', borderTopWidth: 1 }}>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-blue-400">
                              <Send className="h-3 w-3" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{stats.sent}</p>
                            <p className="text-[10px] text-gray-500">Sent</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--gg-vermillion)' }}>
                              <Eye className="h-3 w-3" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{stats.opened}</p>
                            <p className="text-[10px] text-gray-500">Opened</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-amber-400">
                              <MousePointerClick className="h-3 w-3" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{stats.clicked}</p>
                            <p className="text-[10px] text-gray-500">Clicked</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-red-400">
                              <AlertCircle className="h-3 w-3" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{stats.bounced}</p>
                            <p className="text-[10px] text-gray-500">Bounced</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
            SOCIAL POSTS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="social" className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: socialStats.total, icon: Share2, color: 'text-muted-foreground' },
              { label: 'Published', value: socialStats.published, icon: CheckCircle2, color: 'text-[var(--gg-vermillion)]' },
              { label: 'Scheduled', value: socialStats.scheduled, icon: Clock, color: 'text-amber-400' },
              { label: 'Draft', value: socialStats.draft, icon: FileEdit, color: 'text-gray-500' },
            ].map((stat) => (
              <Card
                key={stat.label}
                style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and add */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search social posts..."
                value={socialSearch}
                onChange={(e) => setSocialSearch(e.target.value)}
                className="pl-9 bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={openCreateSocialPost}
              className="text-foreground hover:opacity-90 shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Post
            </Button>
          </div>

          {/* Social post cards */}
          {socialPostsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse"
                  style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="h-5 bg-gray-700/50 rounded w-1/2" />
                    <div className="h-16 bg-gray-700/50 rounded" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-700/50 rounded w-20" />
                      <div className="h-6 bg-gray-700/50 rounded w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSocialPosts.length === 0 ? (
            <Card style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Share2 className="h-12 w-12 text-gray-600 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No social posts found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {socialSearch
                    ? 'Try adjusting your search'
                    : 'Create your first social post to get started'}
                </p>
                {!socialSearch && (
                  <Button
                    onClick={openCreateSocialPost}
                    className="mt-4 text-foreground hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="max-h-[calc(100vh-380px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSocialPosts.map((post) => {
                  const stats = parseSocialPostStats(post.stats)
                  return (
                    <Card
                      key={post.id}
                      className="hover:border-[color-mix(in_srgb,var(--gg-vermillion)_30%,transparent)] transition-colors group"
                      style={{ background: 'var(--card)', borderColor: 'var(--gg-separator)', boxShadow: 'var(--gg-shadow-card)' }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${SOCIAL_PLATFORM_COLORS[post.platform]?.replace('border-', 'bg-').split(' ')[0] || 'bg-gray-500/20'}`}>
                              <SocialPlatformIcon platform={post.platform} />
                            </div>
                            <div>
                              <p className="text-foreground text-sm font-medium capitalize">{post.platform}</p>
                              <p className="text-gray-500 text-[11px]">
                                {post.status === 'published'
                                  ? `Published ${formatDate(post.publishedAt)}`
                                  : post.scheduledAt
                                    ? `Scheduled ${formatDateTime(post.scheduledAt)}`
                                    : 'Not scheduled'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-foreground hover:bg-gray-800"
                              onClick={() => openEditSocialPost(post)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => setDeleteTarget({ type: 'social', id: post.id, name: `${post.platform} post` })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={`${SOCIAL_PLATFORM_COLORS[post.platform] || 'bg-gray-500/20 text-gray-400'} text-xs`}
                          >
                            <SocialPlatformIcon platform={post.platform} />
                            <span className="ml-1 capitalize">{post.platform}</span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${getBadgeProps(SOCIAL_STATUS_COLORS[post.status], 'bg-gray-500/20 text-gray-400').className} text-xs`}
                            style={getBadgeProps(SOCIAL_STATUS_COLORS[post.status], 'bg-gray-500/20 text-gray-400').style}
                          >
                            <SocialStatusIcon status={post.status} />
                            <span className="ml-1 capitalize">{post.status}</span>
                          </Badge>
                        </div>

                        {/* Content preview */}
                        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>

                        {/* Media indicator */}
                        {post.mediaUrl && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>Media attached</span>
                          </div>
                        )}

                        {/* Stats */}
                        {(stats.likes > 0 || stats.shares > 0 || stats.comments > 0) && (
                          <div className="flex items-center gap-4 pt-2" style={{ borderTopColor: 'var(--gg-separator)', borderTopWidth: 1 }}>
                            <div className="flex items-center gap-1.5 text-xs text-pink-400">
                              <Heart className="h-3 w-3" />
                              <span>{stats.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-sky-400">
                              <Share className="h-3 w-3" />
                              <span>{stats.shares}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gg-vermillion)' }}>
                              <MessageCircle className="h-3 w-3" />
                              <span>{stats.comments}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════════
          CAMPAIGN DIALOG
      ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-foreground sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-gray-300">Name *</Label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="Campaign name"
                className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
              />
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select value={campaignForm.type} onValueChange={(v) => setCampaignForm({ ...campaignForm, type: v })}>
                  <SelectTrigger className="bg-gray-800/50 border-white/10 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    <SelectItem value="email">
                      <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-blue-400" /> Email</span>
                    </SelectItem>
                    <SelectItem value="sms">
                      <span className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-green-400" /> SMS</span>
                    </SelectItem>
                    <SelectItem value="social">
                      <span className="flex items-center gap-2"><Share2 className="h-3.5 w-3.5 text-purple-400" /> Social</span>
                    </SelectItem>
                    <SelectItem value="ads">
                      <span className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-orange-400" /> Ads</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select value={campaignForm.status} onValueChange={(v) => setCampaignForm({ ...campaignForm, status: v })}>
                  <SelectTrigger className="bg-gray-800/50 border-white/10 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject (for email) */}
            {campaignForm.type === 'email' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Subject</Label>
                <Input
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  placeholder="Email subject line"
                  className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-gray-300">Content *</Label>
              <Textarea
                value={campaignForm.content}
                onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                placeholder="Campaign content..."
                rows={5}
                className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500 resize-none"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label className="text-gray-300">Target Audience</Label>
              <Select value={campaignForm.targetAudience} onValueChange={(v) => setCampaignForm({ ...campaignForm, targetAudience: v })}>
                <SelectTrigger className="bg-gray-800/50 border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="prospects">Prospects</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label className="text-gray-300">Schedule At</Label>
              <Input
                type="datetime-local"
                value={campaignForm.scheduleAt}
                onChange={(e) => setCampaignForm({ ...campaignForm, scheduleAt: e.target.value })}
                className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCampaignDialogOpen(false)}
              className="border-white/10 text-gray-300 hover:bg-gray-800 hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCampaign}
              disabled={campaignSaving}
              className="text-foreground hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {campaignSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCampaign ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
          SOCIAL POST DIALOG
      ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-foreground sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingSocialPost ? 'Edit Social Post' : 'Create Social Post'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Platform */}
            <div className="space-y-2">
              <Label className="text-gray-300">Platform *</Label>
              <Select value={socialForm.platform} onValueChange={(v) => setSocialForm({ ...socialForm, platform: v })}>
                <SelectTrigger className="bg-gray-800/50 border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="facebook">
                    <span className="flex items-center gap-2"><Facebook className="h-3.5 w-3.5 text-blue-400" /> Facebook</span>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <span className="flex items-center gap-2"><Twitter className="h-3.5 w-3.5 text-sky-400" /> Twitter</span>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <span className="flex items-center gap-2"><Instagram className="h-3.5 w-3.5 text-pink-400" /> Instagram</span>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <span className="flex items-center gap-2"><Linkedin className="h-3.5 w-3.5 text-indigo-400" /> LinkedIn</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-gray-300">Content *</Label>
              <Textarea
                value={socialForm.content}
                onChange={(e) => setSocialForm({ ...socialForm, content: e.target.value })}
                placeholder="What's on your mind?"
                rows={5}
                className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500 resize-none"
              />
            </div>

            {/* Media URL */}
            <div className="space-y-2">
              <Label className="text-gray-300">Media URL</Label>
              <Input
                value={socialForm.mediaUrl}
                onChange={(e) => setSocialForm({ ...socialForm, mediaUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select value={socialForm.status} onValueChange={(v) => setSocialForm({ ...socialForm, status: v })}>
                <SelectTrigger className="bg-gray-800/50 border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/10">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label className="text-gray-300">Scheduled At</Label>
              <Input
                type="datetime-local"
                value={socialForm.scheduledAt}
                onChange={(e) => setSocialForm({ ...socialForm, scheduledAt: e.target.value })}
                className="bg-gray-800/50 border-white/10 text-foreground placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSocialDialogOpen(false)}
              className="border-white/10 text-gray-300 hover:bg-gray-800 hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSocialPost}
              disabled={socialSaving}
              className="text-foreground hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--gg-vermillion), var(--gg-amber))' }}
            >
              {socialSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSocialPost ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION DIALOG
      ═══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="bg-gray-900 border-white/10 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete {deleteTarget?.type === 'campaign' ? 'Campaign' : 'Social Post'}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-gray-300 hover:bg-gray-800 hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-foreground"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
