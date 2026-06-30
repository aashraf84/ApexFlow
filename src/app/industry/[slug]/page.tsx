'use client'

import { IndustryDetailPage } from '@/components/pages/industry-detail-page'
import { useParams } from 'next/navigation'

export default function IndustryDetailRoute() {
  const params = useParams()
  const slug = params.slug as string

  return <IndustryDetailPage slug={slug} />
}
