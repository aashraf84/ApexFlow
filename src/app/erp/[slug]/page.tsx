'use client'

import { ErpDetailPage } from '@/components/pages/erp-detail-page'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ErpDetailRoute() {
  const params = useParams()
  const slug = params.slug as string

  return <ErpDetailPage slug={slug} />
}
