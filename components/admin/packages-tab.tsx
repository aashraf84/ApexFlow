'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Users, MapPin, Package, Zap, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Pkg {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  billingCycle: string
  features: string | null
  includedOSSlugs: string | null
  maxUsers: number | null
  maxLocations: number | null
  maxItems: number | null
  isPopular: boolean
  sortOrder: number
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatPKR = (n: number) => `PKR ${n.toLocaleString('en-PK')}`

const parseFeatures = (raw: string | null): string[] => {
  if (!raw) return []
  return raw
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
}

/* Map package slug to icon component — purely visual */
const pkgIcons: Record<string, React.ReactNode> = {
  starter: <Zap className="w-6 h-6 text-[var(--gg-teal)]" />,
  professional: <Users className="w-6 h-6 text-[var(--gg-amber)]" />,
  enterprise: <Package className="w-6 h-6 text-[var(--gg-green)]" />,
}

const defaultIcon = <Zap className="w-6 h-6 text-[var(--gg-teal)]" />

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PackagesTab() {
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPackages(Array.isArray(data.packages) ? data.packages : [])
    } catch {
      setPackages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40 rounded-xl bg-secondary mb-2" />
          <Skeleton className="h-5 w-64 rounded-lg bg-secondary" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[460px] rounded-2xl bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  /* ---------- Main render ---------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Package Plans</h2>
        <p className="text-sm text-muted-foreground">
          {packages.length > 0
            ? `${packages.length} plan${packages.length !== 1 ? 's' : ''} available`
            : 'Choose the right plan for your business'}
        </p>
      </div>

      {/* Empty State */}
      {packages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center"
        >
          <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No packages found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            No package plans have been configured yet. Contact your administrator to set up plans.
          </p>
        </motion.div>
      ) : (
        /* Package Cards */
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => {
            const features = parseFeatures(pkg.features)
            const icon = pkgIcons[pkg.slug] ?? defaultIcon

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-card/90 backdrop-blur border rounded-2xl p-6 transition-all duration-300 ${
                  pkg.isPopular
                    ? 'border-[var(--gg-vermillion)]/30 shadow-[0_0_24px_rgba(200,75,49,0.12)]'
                    : 'border-border hover:border-border hover:shadow-[0_0_20px_rgba(200,75,49,0.06)]'
                }`}
              >
                {/* Popular badge */}
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[var(--gg-vermillion)] text-white border-0 px-3 py-1 btn-glow">
                      <Star className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{pkg.billingCycle}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPKR(pkg.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{pkg.billingCycle === 'monthly' ? 'month' : pkg.billingCycle === 'yearly' ? 'year' : pkg.billingCycle}
                  </span>
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {pkg.description}
                  </p>
                )}

                {/* Limits */}
                <div className="flex gap-4 mb-6 text-xs text-muted-foreground">
                  {pkg.maxUsers != null && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[var(--gg-teal)]" />
                      <span>Up to {pkg.maxUsers} users</span>
                    </div>
                  )}
                  {pkg.maxLocations != null && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--gg-amber)]" />
                      <span>{pkg.maxLocations} location{pkg.maxLocations !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {pkg.maxItems != null && (
                    <div className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[var(--gg-green)]" />
                      <span>{pkg.maxItems} items</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <ul className="space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
