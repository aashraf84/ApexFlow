'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/admin/shared/page-header'
import { ContentItem } from './content-item'
import type { ContentItem as ContentItemType } from '@/types/admin'

export function ContentPage() {
  const [items, setItems] = useState<ContentItemType[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/marketing/campaigns').then(r => r.json()).then(d => {
      const allContent: ContentItemType[] = (d.campaigns || []).flatMap((c: { contents?: ContentItemType[] }) => c.contents || [])
      setItems(allContent.length > 0 ? allContent : generateSampleContent())
    }).catch(() => setItems(generateSampleContent()))
  }, [])

  const filtered = items.filter(i => {
    if (typeFilter !== 'all' && i.type !== typeFilter) return false
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Content Library" description="Manage your content calendar and assets" actions={<Button size="sm"><Plus className="w-4 h-4 mr-1" />New Content</Button>} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search content..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="graphic">Graphic</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="idea">Idea</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(item => <ContentItem key={item.id} item={item} />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No content items found</p>}
    </div>
  )
}

function generateSampleContent(): ContentItemType[] {
  const types = ['blog', 'social', 'email', 'video', 'graphic']
  const statuses = ['idea', 'draft', 'review', 'approved', 'scheduled', 'published']
  return Array.from({ length: 9 }, (_, i) => ({
    id: `content-${i + 1}`, campaignId: null, title: `Content Piece ${i + 1}`, type: types[i % types.length],
    body: null, mediaUrl: null, platforms: JSON.stringify(['facebook', 'instagram']), status: statuses[i % statuses.length],
    authorId: null, scheduledAt: i % 3 === 0 ? new Date(Date.now() + i * 86400000).toISOString() : null, publishedAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), campaign: null,
  }))
}
