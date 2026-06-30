'use client'

import { PageHeader } from '@/components/admin/shared/page-header'
import { CampaignPerformance } from './campaign-performance'
import { AudienceInsights } from './audience-insights'

export function MarketingAnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Marketing Analytics" description="Track campaign performance and audience insights" />
      <CampaignPerformance />
      <AudienceInsights />
    </div>
  )
}
