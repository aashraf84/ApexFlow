'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ErpDetailView } from '@/components/admin/panel/erp-detail-view'

export default function ErpDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  return (
    <ErpDetailView
      slug={slug}
      onBack={() => router.push('/admin/erp')}
    />
  )
}