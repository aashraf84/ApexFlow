'use client'

import { useRouter, usePathname } from 'next/navigation'

/**
 * Route mapping: ViewMode → URL path
 */
const ROUTE_MAP: Record<string, string> = {
  landing: '/',
  home: '/',
  products: '/products',
  'erp-detail': '/erp',
  solutions: '/solutions',
  industries: '/industries',
  'industry-detail': '/industry',
  pricing: '/pricing',
  resources: '/resources',
  contact: '/contact',
  about: '/about',
  careers: '/careers',
  'become-partner': '/become-partner',
  blog: '/blog',
  'legal-privacy': '/legal/privacy',
  'legal-terms': '/legal/terms',
  'legal-security': '/legal/security',
  'legal-refund': '/legal/refund',
  login: '/login',
  signin: '/login',
  dashboard: '/dashboard',
  electroflow: '/electroflow',
  fleetflow: '/fleetflow',
}

/**
 * Navigation hook that replaces Zustand-based viewMode navigation
 * with proper Next.js App Router navigation.
 * 
 * Usage:
 *   const { navigate, isActive } = useNavigate()
 *   navigate('products')           → /products
 *   navigate('erp-detail', slug)   → /erp/apparelflow
 *   navigate('industry-detail', slug) → /industry/apparel
 */
export function useNavigate() {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = (view: string, slug?: string) => {
    if (view === 'erp-detail' && slug) {
      router.push(`/erp/${slug}`)
    } else if (view === 'industry-detail' && slug) {
      router.push(`/industry/${slug}`)
    } else {
      const path = ROUTE_MAP[view] || '/'
      router.push(path)
    }
  }

  const isActive = (view: string): boolean => {
    const path = ROUTE_MAP[view] || '/'
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return { navigate, isActive, pathname }
}

/**
 * Get the URL path for a given view mode (for use in Link href)
 */
export function getViewPath(view: string, slug?: string): string {
  if (view === 'erp-detail' && slug) return `/erp/${slug}`
  if (view === 'industry-detail' && slug) return `/industry/${slug}`
  return ROUTE_MAP[view] || '/'
}
