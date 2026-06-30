'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NAV_PATH_MAP, NAV_CONFIG } from '@/lib/admin/nav-config'
import type { NavItem, NavDepartment } from '@/types/admin'

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Build segments from pathname
  const segments = pathname.split('/').filter(Boolean) // e.g. ['admin', 'dashboard']
  const adminIndex = segments.indexOf('admin')
  const adminSegments = adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments

  const crumbs: { label: string; href?: string }[] = [
    { label: 'Admin', href: '/admin' },
  ]

  let currentPath = '/admin'
  for (let i = 0; i < adminSegments.length; i++) {
    const seg = adminSegments[i]
    currentPath += `/${seg}`

    // Try to find matching nav item
    const adminPrefixedPath = `/${seg}` // nav paths are like /dashboard, /clients
    let navItem: NavItem | undefined

    if (i === 0) {
      navItem = NAV_PATH_MAP[adminPrefixedPath]
    } else {
      // For nested paths like /admin/users, try building the full sub-path
      const subPath = '/' + adminSegments.slice(0, i + 1).join('/')
      navItem = NAV_PATH_MAP[subPath] || NAV_PATH_MAP[adminPrefixedPath]
    }

    // Also check department labels
    const deptMatch: NavDepartment | undefined = NAV_CONFIG.find(
      (d) => d.id === seg
    )

    const label = navItem?.label || deptMatch?.label || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
    const isLast = i === adminSegments.length - 1

    crumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <span key={crumb.label + i} className="contents">
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
