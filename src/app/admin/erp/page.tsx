'use client'

import { useRouter } from 'next/navigation'
import { ErpCatalog } from '@/components/admin/panel/erp-catalog'

export default function ErpPage() {
  const router = useRouter()
  return (
    <ErpCatalog
      onSelectErp={(slug) => router.push(`/admin/erp/${slug}`)}
    />
  )
}