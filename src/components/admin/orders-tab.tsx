'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  Search,
  Eye,
  CreditCard,
  Inbox,
  Building2,
  Mail,
  Phone,
  Calendar,
  Receipt,
  Hash,
  Shield,
  FileText,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErpIcon, getErpColor } from '@/lib/erp-data'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ErpSystemInfo {
  id: string
  name: string
  slug: string
  icon: string
  color: string
}

interface PaymentInfo {
  id: string
  amount: number
  method: string
  status: string
  cardBrand: string | null
  cardLast4: string | null
  createdAt: string
  stripePaymentId?: string | null
}

interface InvoiceInfo {
  id: string
  invoiceNumber: string
  status: string
}

interface Order {
  id: string
  orderNumber: string
  clientId: string | null
  erpSystemId: string
  plan: string
  billingCycle: string
  quantity: number
  unitPrice: number
  discountAmount: number
  totalAmount: number
  currency: string
  status: string
  paymentStatus: string
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  customerEmail: string
  customerName: string
  customerPhone: string | null
  companyName: string | null
  notes: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  erpSystem: ErpSystemInfo
  payments: PaymentInfo[]
  invoice: InvoiceInfo | null
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatPKR = (n: number) => `PKR ${n.toLocaleString('en-PK')}`

const formatDate = (iso: string | null) => {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (iso: string | null) => {
  if (!iso) return '--'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const orderStatusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  expired: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  refunded: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
}

const paymentStatusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  refunded: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
}

const planBadgeStyles: Record<string, string> = {
  starter: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  professional: 'bg-[var(--gg-teal)]/10 text-[var(--gg-teal)] border-[var(--gg-teal)]/20',
  business: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  enterprise: 'bg-[var(--gg-amber)]/10 text-[var(--gg-amber)] border-[var(--gg-amber)]/20',
}

/* ------------------------------------------------------------------ */
/*  ERP Icon Renderer                                                  */
/* ------------------------------------------------------------------ */

function ErpIconBadge({ icon, color, name }: { icon: string; color: string; name: string }) {
  const colorData = getErpColor(color)

  const renderIcon = () => {
    const IconComp = getErpIcon(icon)
    return <IconComp className={`w-3.5 h-3.5 ${colorData.text}`} />
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-md ${colorData.bg} flex items-center justify-center`}>
        {renderIcon()}
      </div>
      <span className="text-sm text-foreground">{name}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  /* ---------- Fetch orders ---------- */
  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterPaymentStatus !== 'all') params.set('paymentStatus', filterPaymentStatus)
      if (search) params.set('search', search)
      params.set('limit', '100')

      const res = await fetch(`/api/orders?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOrders(Array.isArray(data.data) ? data.data : [])
    } catch {
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filterStatus, filterPaymentStatus, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  /* ---------- Computed values ---------- */
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  /* ---------- View details ---------- */
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-44 rounded-xl bg-secondary" />
            <Skeleton className="h-4 w-56 rounded-xl bg-secondary mt-2" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl bg-secondary" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl bg-secondary" />
          <Skeleton className="h-10 w-40 rounded-xl bg-secondary" />
          <Skeleton className="h-10 w-40 rounded-xl bg-secondary" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  /* ---------- Main render ---------- */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Orders & Payments</h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? 's' : ''} &middot; {formatPKR(totalRevenue)} total revenue
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="bg-secondary border-border hover:bg-accent rounded-xl"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, customers, companies..."
            className="pl-9 bg-secondary border-border focus:border-[var(--gg-vermillion)]/50 rounded-xl text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44 bg-secondary border-border rounded-xl text-foreground">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
          <SelectTrigger className="w-full sm:w-48 bg-secondary border-border rounded-xl text-foreground">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center"
        >
          <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No orders found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search || filterStatus !== 'all' || filterPaymentStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Orders will appear here once customers make purchases.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden"
        >
          <div className="max-h-[560px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Order #</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">ERP</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Plan</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Payment</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden xl:table-cell">Date</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-border hover:bg-accent transition-colors"
                    >
                      {/* Order # */}
                      <TableCell>
                        <span className="text-sm font-medium font-mono text-foreground">
                          {order.orderNumber}
                        </span>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground font-medium truncate max-w-[160px]">
                            {order.customerName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {order.customerEmail}
                          </span>
                        </div>
                      </TableCell>

                      {/* ERP */}
                      <TableCell className="hidden md:table-cell">
                        <ErpIconBadge
                          icon={order.erpSystem.icon}
                          color={order.erpSystem.color}
                          name={order.erpSystem.name}
                        />
                      </TableCell>

                      {/* Plan */}
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="secondary"
                          className={`capitalize ${planBadgeStyles[order.plan] ?? 'bg-secondary text-foreground border-border'}`}
                        >
                          {order.plan}
                        </Badge>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {formatPKR(order.totalAmount)}
                        </span>
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className={`capitalize ${paymentStatusStyles[order.paymentStatus] ?? ''}`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>

                      {/* Order Status */}
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className={`capitalize ${orderStatusStyles[order.status] ?? ''}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
                        {formatDate(order.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  Order Information
                </h4>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Order Number</p>
                      <p className="text-sm font-mono font-medium text-foreground">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm text-foreground">{formatDateTime(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order Status</p>
                      <Badge
                        variant="secondary"
                        className={`capitalize mt-0.5 ${orderStatusStyles[selectedOrder.status] ?? ''}`}
                      >
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Status</p>
                      <Badge
                        variant="secondary"
                        className={`capitalize mt-0.5 ${paymentStatusStyles[selectedOrder.paymentStatus] ?? ''}`}
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  {selectedOrder.paidAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Paid At</p>
                      <p className="text-sm text-foreground">{formatDateTime(selectedOrder.paidAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Customer Info */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  Customer Information
                </h4>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm text-foreground">{selectedOrder.companyName || '--'}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground break-all">{selectedOrder.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm text-foreground">{selectedOrder.customerPhone || '--'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Product Info */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  Product Information
                </h4>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">ERP System</p>
                      <div className="mt-0.5">
                        <ErpIconBadge
                          icon={selectedOrder.erpSystem.icon}
                          color={selectedOrder.erpSystem.color}
                          name={selectedOrder.erpSystem.name}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <Badge
                        variant="secondary"
                        className={`capitalize mt-0.5 ${planBadgeStyles[selectedOrder.plan] ?? ''}`}
                      >
                        {selectedOrder.plan}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Billing Cycle</p>
                      <p className="text-sm text-foreground capitalize">{selectedOrder.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="text-sm text-foreground">{selectedOrder.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Payment Info */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  Payment Information
                </h4>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-semibold text-foreground">{formatPKR(selectedOrder.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Currency</p>
                      <p className="text-sm text-foreground">{selectedOrder.currency}</p>
                    </div>
                  </div>

                  {selectedOrder.payments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedOrder.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="bg-background/50 rounded-lg p-3 flex flex-wrap gap-x-6 gap-y-2"
                        >
                          <div>
                            <p className="text-xs text-muted-foreground">Method</p>
                            <p className="text-sm text-foreground capitalize">{payment.method}</p>
                          </div>
                          {payment.cardBrand && (
                            <div>
                              <p className="text-xs text-muted-foreground">Card</p>
                              <p className="text-sm text-foreground capitalize">
                                {payment.cardBrand} ****{payment.cardLast4}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">Payment Status</p>
                            <Badge
                              variant="secondary"
                              className={`capitalize mt-0.5 text-[11px] ${paymentStatusStyles[payment.status] ?? ''}`}
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          {payment.stripePaymentId && (
                            <div>
                              <p className="text-xs text-muted-foreground">Transaction ID</p>
                              <p className="text-xs font-mono text-muted-foreground">{payment.stripePaymentId}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Related Records */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Related Records
                </h4>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Subscription ID</p>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedOrder.stripeCheckoutSessionId || '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">License Key</p>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedOrder.stripePaymentIntentId || '--'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Invoice</p>
                        {selectedOrder.invoice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-foreground">{selectedOrder.invoice.invoiceNumber}</span>
                            <Badge
                              variant="secondary"
                              className={`capitalize text-[11px] ${paymentStatusStyles[selectedOrder.invoice.status] ?? ''}`}
                            >
                              {selectedOrder.invoice.status}
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not generated</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm text-foreground">{formatDateTime(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <>
                  <Separator className="bg-border" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-foreground bg-secondary/50 rounded-xl p-3">
                      {selectedOrder.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
