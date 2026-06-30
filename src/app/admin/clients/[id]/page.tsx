'use client'

import { use } from 'react'
import { ClientDetailPage } from '@/components/admin/clients/client-detail-page'

export default function ClientDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ClientDetailPage clientId={id} />
}
