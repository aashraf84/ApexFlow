'use client'

import { use } from 'react'
import { ErpDetailPage } from '@/components/admin/erp/erp-detail-page'

export default function ErpDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ErpDetailPage slug={slug} />
}
