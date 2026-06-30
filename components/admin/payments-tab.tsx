'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  CreditCard,
  Clock,
  RotateCcw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Receipt,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Payment {
  id: string
  orderId: string
  stripePaymentIntent: string | null
  amount: number
  currency: string
  status: string
  method: string | null
  last4: string | null
  brand: string | null
  receiptUrl: string | null
  refundedAmount: number
  refundReason: string | null
  refundedAt: string | null
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  email: string
  companyName: string | null
  contactName: string | null
  phone: string | null
  plan: string
  erpSlug: string | null
  billingCycle: string
  amount: number
  currency: string
  status: string
  stripeSessionId: string | null
  stripePaymentIntent: string | null
  stripeCustomerId: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  payments: Payment[]
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    paid: { bg: 'bg-[var(--gg-green)]/10', text: 'text-[var(--gg-green)]', icon: <CheckCircle2 className="w-3 h-3" /> },
    succeeded: { bg: 'bg-[var(--gg-green)]/10', text: 'text-[var(--gg-green)]', icon: <CheckCircle2 className="w-3 h-3" /> },
    pending: { bg: 'bg-[var(--gg-amber)]/10', text: 'text-[var(--gg-amber)]', icon: <Clock className="w-3 h-3" /> },
    failed: { bg: 'bg-[var(--gg-rose)]/10', text: 'text-[var(--gg-rose)]', icon: <XCircle className="w-3 h-3" /> },
    cancelled: { bg: 'bg-secondary', text: 'text-muted-foreground', icon: <XCircle className="w-3 h-3" /> },
    refunded: { bg: 'bg-[var(--gg-violet)]/10', text: 'text-[var(--gg-violet)]', icon: <RotateCcw className="w-3 h-3" /> },
  }

  const c = config[status] || config.pending

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Plan Badge                                                         */
/* ------------------------------------------------------------------ */

function PlanBadge({ plan }: { plan: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    starter: { bg: 'bg-primary/10', text: 'text-primary' },
    professional: { bg: 'bg-[var(--gg-violet)]/10', text: 'text-[var(--gg-violet)]' },
    business: { bg: 'bg-[var(--gg-green)]/10', text: 'text-[var(--gg-green)]' },
    enterprise: { bg: 'bg-[var(--gg-amber)]/10', text: 'text-[var(--gg-amber)]' },
  }
  const c = config[plan] || config.starter
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${c.bg} ${c.text}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Currency formatter                                                 */
/* ------------------------------------------------------------------ */

function formatCurrency(amount: number, currency: string): string {
  const curr = currency === 'pkr' ? 'PKR' : currency.toUpperCase()
  return `${curr} ${amount.toLocaleString()}`
}

/* ------------------------------------------------------------------ */
/*  Date formatter                                                     */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ------------------------------------------------------------------ */
/*  ERP name formatter                                                 */
/* ------------------------------------------------------------------ */

function formatErpName(slug: string | null): string {
  if (!slug) return '—'
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/flow$/, 'Flow')
}

/* ------------------------------------------------------------------ */
/*  Main PaymentsTab Component                                         */
/* ------------------------------------------------------------------ */

export function PaymentsTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null,
  })
  const [refundReason, setRefundReason] = useState('')
  const [refundLoading, setRefundLoading] = useState(false)

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Handle refund
  const handleRefund = async () => {
    if (!refundDialog.order?.stripePaymentIntent) {
      toast.error('No payment intent found for this order')
      return
    }

    setRefundLoading(true)
    try {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: refundDialog.order.stripePaymentIntent,
          reason: refundReason,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Refund processed successfully')
        setRefundDialog({ open: false, order: null })
        setRefundReason('')
        fetchOrders()
      } else {
        toast.error(data.error || 'Refund failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setRefundLoading(false)
    }
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.companyName && order.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.contactName && order.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Summary stats
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0)
  const activeSubscriptions = orders.filter((o) => o.status === 'paid').length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalRefunds = orders
    .filter((o) => o.status === 'refunded')
    .reduce((sum, o) => {
      const refundedAmount = o.payments.reduce((s, p) => s + p.refundedAmount, 0)
      return sum + refundedAmount
    }, 0)

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue, 'pkr'),
      icon: <DollarSign className="w-5 h-5" />,
      accent: 'text-[var(--gg-green)]',
      bg: 'bg-[var(--gg-green)]/10',
      trend: <TrendingUp className="w-3.5 h-3.5 text-[var(--gg-green)]" />,
    },
    {
      label: 'Active Subscriptions',
      value: activeSubscriptions.toString(),
      icon: <Users className="w-5 h-5" />,
      accent: 'text-primary',
      bg: 'bg-primary/10',
      trend: <ArrowUpRight className="w-3.5 h-3.5 text-primary" />,
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: <Clock className="w-5 h-5" />,
      accent: 'text-[var(--gg-amber)]',
      bg: 'bg-[var(--gg-amber)]/10',
      trend: null,
    },
    {
      label: 'Total Refunds',
      value: formatCurrency(totalRefunds, 'pkr'),
      icon: <RotateCcw className="w-5 h-5" />,
      accent: 'text-[var(--gg-violet)]',
      bg: 'bg-[var(--gg-violet)]/10',
      trend: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="bg-card border border-border rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg} ${card.accent}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-xl sm:text-2xl font-bold text-foreground">{card.value}</span>
              {card.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, company, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] text-sm bg-card border-border">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="h-9 border-border"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr_0.5fr] min-w-[800px] border-b border-border bg-secondary/50 px-4 py-3">
          <span className="text-xs font-semibold text-muted-foreground">Order / Company</span>
          <span className="text-xs font-semibold text-muted-foreground">Email</span>
          <span className="text-xs font-semibold text-muted-foreground">Plan / ERP</span>
          <span className="text-xs font-semibold text-muted-foreground">Amount</span>
          <span className="text-xs font-semibold text-muted-foreground">Status</span>
          <span className="text-xs font-semibold text-muted-foreground">Date</span>
          <span className="text-xs font-semibold text-muted-foreground text-right">Actions</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading orders...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Receipt className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            </p>
          </div>
        )}

        {/* Order Rows */}
        {!loading &&
          filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id
            return (
              <div key={order.id} className="min-w-[800px]">
                {/* Row */}
                <div
                  className="grid grid-cols-[1fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr_0.5fr] px-4 py-3 border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer items-center"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {order.companyName || order.contactName || '—'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{order.id.slice(0, 12)}...</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{order.email}</p>
                  <div className="flex flex-col gap-1">
                    <PlanBadge plan={order.plan} />
                    <span className="text-[11px] text-muted-foreground">{formatErpName(order.erpSlug)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(order.amount, order.currency)}</p>
                  <StatusBadge status={order.status} />
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <div className="flex items-center justify-end gap-1">
                    {order.status === 'paid' && order.stripePaymentIntent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-[var(--gg-rose)]"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRefundDialog({ open: true, order })
                        }}
                        title="Refund"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="bg-secondary/10 border-b border-border px-4 py-4"
                  >
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Contact Name</p>
                        <p className="text-sm text-foreground">{order.contactName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Phone</p>
                        <p className="text-sm text-foreground">{order.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Billing Cycle</p>
                        <p className="text-sm text-foreground capitalize">{order.billingCycle}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Stripe Session ID</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{order.stripeSessionId || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Stripe Payment Intent</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{order.stripePaymentIntent || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Stripe Customer ID</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{order.stripeCustomerId || '—'}</p>
                      </div>
                      {order.paidAt && (
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Paid At</p>
                          <p className="text-sm text-foreground">{formatDate(order.paidAt)}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Records */}
                    {order.payments.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3" /> Payment Records
                        </p>
                        <div className="space-y-2">
                          {order.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="bg-card border border-border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <StatusBadge status={payment.status} />
                                <span className="text-sm font-medium text-foreground">
                                  {formatCurrency(payment.amount, payment.currency)}
                                </span>
                                {payment.method && (
                                  <span className="text-xs text-muted-foreground capitalize">{payment.method}</span>
                                )}
                                {payment.brand && (
                                  <span className="text-xs text-muted-foreground uppercase">{payment.brand}</span>
                                )}
                                {payment.last4 && (
                                  <span className="text-xs text-muted-foreground">****{payment.last4}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{formatDate(payment.createdAt)}</span>
                                {payment.receiptUrl && (
                                  <a
                                    href={payment.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Receipt
                                  </a>
                                )}
                                {payment.refundedAmount > 0 && (
                                  <span className="text-[var(--gg-violet)]">
                                    Refunded: {formatCurrency(payment.refundedAmount, payment.currency)}
                                  </span>
                                )}
                                {payment.refundReason && (
                                  <span className="text-[var(--gg-violet)]">({payment.refundReason})</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.payments.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No payment records yet. Payment will appear here once the checkout is completed.
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )
          })}
      </div>

      {/* Results count */}
      {!loading && filteredOrders.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}

      {/* Refund Dialog */}
      <Dialog
        open={refundDialog.open}
        onOpenChange={(open) => {
          setRefundDialog({ open, order: open ? refundDialog.order : null })
          if (!open) setRefundReason('')
        }}
      >
        <DialogContent className="sm:max-w-[420px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <RotateCcw className="w-5 h-5 text-[var(--gg-violet)]" />
              Process Refund
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will initiate a refund through Stripe for the selected order.
            </DialogDescription>
          </DialogHeader>

          {refundDialog.order && (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {refundDialog.order.companyName || refundDialog.order.contactName || refundDialog.order.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {refundDialog.order.plan.charAt(0).toUpperCase() + refundDialog.order.plan.slice(1)} Plan · {formatErpName(refundDialog.order.erpSlug)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(refundDialog.order.amount, refundDialog.order.currency)}
                  </p>
                </div>
              </div>

              {/* Refund reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Reason for refund (optional)</label>
                <Input
                  placeholder="e.g. Customer request, service issue..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="h-9 text-sm bg-background border-border"
                />
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 bg-[var(--gg-amber)]/5 border border-[var(--gg-amber)]/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-[var(--gg-amber)] shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This action will refund the full amount through Stripe and update the order status. This cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRefundDialog({ open: false, order: null })
                    setRefundReason('')
                  }}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={refundLoading}
                  className="flex-1 bg-[var(--gg-violet)] text-white hover:bg-[var(--gg-violet)]/90"
                >
                  {refundLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Confirm Refund
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
