'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PlatformCard } from './platform-card'
import { PostComposer } from './post-composer'
import { PostScheduler } from './post-scheduler'
import type { SocialAccount } from '@/types/admin'

export function SocialPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetch('/api/marketing/social').then(r => r.json()).then(d => setAccounts(d.accounts || [])).catch(() => {})
  }, [refreshKey])

  return (
    <div className="space-y-8">
      <PageHeader title="Social Media" description="Manage connected platforms and compose posts" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {accounts.map(a => <PlatformCard key={a.id} account={a} onToggle={() => setRefreshKey(k => k + 1)} />)}
      </div>
      <PostComposer accounts={accounts} onPosted={() => setRefreshKey(k => k + 1)} />
      <PostScheduler refreshKey={refreshKey} />
    </div>
  )
}
