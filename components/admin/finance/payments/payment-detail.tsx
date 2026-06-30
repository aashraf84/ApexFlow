'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { CreditCard, Landmark, Smartphone, ArrowRightLeft, ExternalLink, RotateCcw } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(v)
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success', pending: 'warning', failed: 'error', refunded: 'info',
}
const METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe', bank_transfer: 'Bank Transfer', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa', raast: 'Raast', paypal: 'PayPal',
}
const METHOD_ICONS: Record<string, React.ReactNode> = {
  stripe: <CreditCard className="w-4 h-4" />, bank_transfer: <Landmark className="w-4 h-4" />,
  jazzcash: <Smartphone className="w-4 h-4" />, easypaisa: <Smartphone className="w-4 h-4" />,
  raast: <ArrowRightLeft className="w-4 h-4" />,
}

export function PaymentDetail({ payment, open, onClose, onSaved }: {
  payment: any; open: boolean; onClose: () => void; onSaved: () => void
}) {
  const [refunding, setRefunding] = useState(false)

  if (!payment) return null

  const handleRefund = async () => {
    setRefunding(true)
    try {
      await fetch('/api/refunds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payment.id, status: 'requested', paymentId: payment.id, amount: payment.amount, reason: 'Manual refund from admin' }),
      })
      onSaved()
      onClose()
    } finally { setRefunding(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">Payment Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge variant={STATUS_VARIANT[payment.status] || 'neutral'} size="md">{payment.status}</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-xl font-bold">{formatPKR(payment.amount)}</span>
          </div>
          <Separator />
          <div className="space-y-3">
            <DetailRow label="Transaction ID" value={payment.id} mono />
            <DetailRow label="Order #" value={payment.order?.orderNumber || '-'} />
            <DetailRow label="Client" value={payment.client?.companyName || 'Unknown'} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Method</span>
              <div className="flex items-center gap-1.5">
                {METHOD_ICONS[payment.method]}
                <span className="text-sm font-medium">{METHOD_LABELS[payment.method] || payment.method}</span>
              </div>
            </div>
            <DetailRow label="Date" value={new Date(payment.createdAt).toLocaleString()} />
          </div>

          {(payment.cardBrand || payment.cardLast4) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Card Details</p>
                {payment.cardBrand && <DetailRow label="Brand" value={<Badge variant="secondary" className="capitalize">{payment.cardBrand}</Badge>} />}
                {payment.cardLast4 && <DetailRow label="Last 4" value={`•••• ${payment.cardLast4}`} mono />}
              </div>
            </>
          )}

          {payment.receiptUrl && (
            <>
              <Separator />
              <Button variant="outline" className="w-full gap-1.5" asChild>
                <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" /> View Receipt
                </a>
              </Button>
            </>
          )}

          {payment.status === 'completed' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-1.5 text-[var(--gg-rose)] border-[var(--gg-rose)]/30 hover:bg-[var(--gg-rose)]/10">
                  <RotateCcw className="w-4 h-4" /> Issue Refund
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                  <AlertDialogDescription>Refund {formatPKR(payment.amount)} to {payment.client?.companyName || 'Unknown'}? This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefund} disabled={refunding}>Confirm Refund</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
