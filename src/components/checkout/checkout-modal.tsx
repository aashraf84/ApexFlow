'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FALLBACK_ERP_DATA, getErpIcon, getErpColor } from '@/lib/erp-data'
import type { ErpSystemData } from '@/lib/erp-data'
import { PRICING_PLANS, getMonthlyDisplayPrice, getPlanPrice } from '@/lib/pricing-config'
import type { PlanId, BillingCycle } from '@/lib/pricing-config'
import {
  SUPPORTED_CURRENCIES,
  PAYMENT_METHODS,
  getPaymentMethodsForCurrency,
  convertFromPKR,
  formatCurrency,
  type PaymentMethodId,
  type PaymentMethodConfig,
} from '@/lib/payment-gateways'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Search,
  Shield,
  CheckCircle2,
  Building2,
  Lock,
  ExternalLink,
  FileText,
  Clock,
  Mail,
  Smartphone,
  WalletCards,
  Wallet,
  Zap,
  Globe,
  QrCode,
  Copy,
  Package,
  Layers,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Card Validation Utilities                                          */
/* ------------------------------------------------------------------ */

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

function detectCardBrand(number: string): CardBrand {
  const cleaned = number.replace(/\s/g, '')
  if (/^4/.test(cleaned)) return 'visa'
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard'
  if (/^3[47]/.test(cleaned)) return 'amex'
  if (/^6(?:011|5)/.test(cleaned)) return 'discover'
  return 'unknown'
}

function luhnCheck(number: string): boolean {
  const cleaned = number.replace(/\s/g, '')
  if (!/^\d+$/.test(cleaned)) return false
  let sum = 0
  let isEven = false
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16)
  const parts: string[] = []
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4))
  }
  return parts.join(' ')
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 4)
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2)
  }
  return cleaned
}

function validateExpiry(value: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false
  const [monthStr, yearStr] = value.split('/')
  const month = parseInt(monthStr, 10)
  const year = parseInt('20' + yearStr, 10)
  if (month < 1 || month > 12) return false
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  return true
}

interface CardFormErrors {
  cardName?: string
  cardNumber?: string
  cardExpiry?: string
  cardCvv?: string
}

function validateCardForm(state: CheckoutState): CardFormErrors {
  const errors: CardFormErrors = {}
  if (!state.cardName.trim()) {
    errors.cardName = 'Cardholder name is required'
  }
  const cleanedNumber = state.cardNumber.replace(/\s/g, '')
  if (!cleanedNumber) {
    errors.cardNumber = 'Card number is required'
  } else if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
    errors.cardNumber = 'Card number must be 13-19 digits'
  } else if (!luhnCheck(cleanedNumber)) {
    errors.cardNumber = 'Invalid card number'
  }
  if (!state.cardExpiry) {
    errors.cardExpiry = 'Expiry date is required'
  } else if (!validateExpiry(state.cardExpiry)) {
    errors.cardExpiry = 'Invalid or expired date'
  }
  if (!state.cardCvv) {
    errors.cardCvv = 'CVV is required'
  } else if (!/^\d{3,4}$/.test(state.cardCvv)) {
    errors.cardCvv = 'CVV must be 3-4 digits'
  }
  return errors
}

const CARD_BRAND_DISPLAY: Record<CardBrand, { name: string; color: string }> = {
  visa: { name: 'Visa', color: '#1A1F71' },
  mastercard: { name: 'Mastercard', color: '#EB001B' },
  amex: { name: 'AMEX', color: '#006FCF' },
  discover: { name: 'Discover', color: '#FF6000' },
  unknown: { name: '', color: '#6B7280' },
}

/* ------------------------------------------------------------------ */
/*  Inline Card Form Component                                         */
/* ------------------------------------------------------------------ */

function InlineCardForm({
  state,
  onUpdate,
}: {
  state: CheckoutState
  onUpdate: (updates: Partial<CheckoutState>) => void
}) {
  const brand = detectCardBrand(state.cardNumber)
  const brandDisplay = CARD_BRAND_DISPLAY[brand]
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errors = validateCardForm(state)

  const showError = (field: string, err?: string) => {
    if (!touched[field] || !err) return null
    return <p className="text-[11px] text-red-500 mt-1">{err}</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Card Details</span>
        {brand !== 'unknown' && (
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0 ml-auto"
            style={{ borderColor: brandDisplay.color, color: brandDisplay.color }}
          >
            {brandDisplay.name}
          </Badge>
        )}
      </div>

      {/* Cardholder Name */}
      <div className="space-y-1">
        <Label htmlFor="cardName" className="text-xs font-medium text-muted-foreground">
          Cardholder Name
        </Label>
        <Input
          id="cardName"
          placeholder="John Doe"
          value={state.cardName}
          onChange={(e) => onUpdate({ cardName: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, cardName: true }))}
          className={`h-9 text-sm ${touched.cardName && errors.cardName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {showError('cardName', errors.cardName)}
      </div>

      {/* Card Number */}
      <div className="space-y-1">
        <Label htmlFor="cardNumber" className="text-xs font-medium text-muted-foreground">
          Card Number
        </Label>
        <div className="relative">
          <Input
            id="cardNumber"
            placeholder="4242 4242 4242 4242"
            value={state.cardNumber}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value)
              onUpdate({ cardNumber: formatted })
            }}
            onBlur={() => setTouched((t) => ({ ...t, cardNumber: true }))}
            className={`h-9 text-sm pr-12 ${touched.cardNumber && errors.cardNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            inputMode="numeric"
            autoComplete="cc-number"
          />
          {brand !== 'unknown' && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold"
              style={{ color: brandDisplay.color }}
            >
              {brandDisplay.name}
            </span>
          )}
        </div>
        {showError('cardNumber', errors.cardNumber)}
      </div>

      {/* Expiry + CVV row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cardExpiry" className="text-xs font-medium text-muted-foreground">
            Expiry Date
          </Label>
          <Input
            id="cardExpiry"
            placeholder="MM/YY"
            value={state.cardExpiry}
            onChange={(e) => {
              const formatted = formatExpiry(e.target.value)
              onUpdate({ cardExpiry: formatted })
            }}
            onBlur={() => setTouched((t) => ({ ...t, cardExpiry: true }))}
            className={`h-9 text-sm ${touched.cardExpiry && errors.cardExpiry ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            inputMode="numeric"
            autoComplete="cc-exp"
            maxLength={5}
          />
          {showError('cardExpiry', errors.cardExpiry)}
        </div>
        <div className="space-y-1">
          <Label htmlFor="cardCvv" className="text-xs font-medium text-muted-foreground">
            CVV
          </Label>
          <Input
            id="cardCvv"
            placeholder="123"
            value={state.cardCvv}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4)
              onUpdate({ cardCvv: val })
            }}
            onBlur={() => setTouched((t) => ({ ...t, cardCvv: true }))}
            className={`h-9 text-sm ${touched.cardCvv && errors.cardCvv ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
          />
          {showError('cardCvv', errors.cardCvv)}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-selected plan ID from the pricing page CTA */
  preselectedPlan?: PlanId | null
}

type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 6

interface CheckoutState {
  selectedErp: ErpSystemData | null
  selectedModules: string[]
  selectedPlan: PlanId | null
  billingCycle: BillingCycle
  currency: string
  paymentMethod: PaymentMethodId | null
  customerName: string
  customerEmail: string
  customerPhone: string
  companyName: string
  cardName: string
  cardNumber: string
  cardExpiry: string
  cardCvv: string
}

interface FormErrors {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  companyName?: string
}

interface PaymentResult {
  orderNumber: string
  mode: string
  paymentMethod?: PaymentMethodId
  currency?: string
  totalAmount?: number
  transactionId?: string
  paymentReference?: string
  paymentMessage?: string
  qrCodeData?: string | null
  bankDetails?: Record<string, string> | null
  checkoutUrl?: string | null
}

/* ------------------------------------------------------------------ */
/*  Animation Config                                                   */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

const STEPS = [
  { number: 1, label: 'Select ERP' },
  { number: 2, label: 'Modules' },
  { number: 3, label: 'Plan & Currency' },
  { number: 4, label: 'Details' },
  { number: 5, label: 'Payment Method' },
  { number: 6, label: 'Pay' },
]

function StepIndicator({ currentStep }: { currentStep: CheckoutStep }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto px-1">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 ${
                step.number < currentStep
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                  : step.number === currentStep
                  ? 'bg-primary/10 text-primary border-2 border-primary/40 shadow-sm shadow-primary/10'
                  : 'bg-secondary/80 text-muted-foreground border border-border'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-[11px] font-medium hidden md:inline transition-colors duration-200 ${
                step.number <= currentStep
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-6 h-px mx-1.5 transition-colors duration-300 ${
                step.number < currentStep
                  ? 'bg-primary'
                  : step.number === currentStep
                  ? 'bg-gradient-to-r from-primary/40 to-border'
                  : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 1: Select ERP                                                 */
/* ------------------------------------------------------------------ */

function StepSelectErp({
  selectedErp,
  onSelect,
  searchQuery,
  onSearchChange,
}: {
  selectedErp: ErpSystemData | null
  onSelect: (erp: ErpSystemData) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}) {
  const filteredErps = useMemo(() => {
    if (!searchQuery.trim()) return FALLBACK_ERP_DATA
    const q = searchQuery.toLowerCase()
    return FALLBACK_ERP_DATA.filter(
      (erp) =>
        erp.name.toLowerCase().includes(q) ||
        erp.industry.toLowerCase().includes(q) ||
        erp.slug.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Select Your ERP Platform
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the industry-specific ERP that matches your business.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or industry..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* ERP Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
        {filteredErps.map((erp) => {
          const Icon = getErpIcon(erp.icon)
          const colors = getErpColor(erp.color)
          const isSelected = selectedErp?.slug === erp.slug

          return (
            <motion.button
              key={erp.slug}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(erp)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  color: colors.hex,
                  background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}08)`,
                }}
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {erp.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {erp.industry}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {filteredErps.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No ERPs match your search.
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2: Select Modules (NEW)                                       */
/* ------------------------------------------------------------------ */

function StepSelectModules({
  selectedErp,
  selectedModules,
  onToggleModule,
  onSelectAll,
  onDeselectAll,
  currency,
}: {
  selectedErp: ErpSystemData | null
  selectedModules: string[]
  onToggleModule: (moduleId: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  currency: string
}) {
  const modules = selectedErp?.modules ?? []
  const activeModules = modules.filter((m) => m.isActive)

  // Group modules by category — must be before any early return
  const grouped = useMemo(() => {
    const groups: Record<string, typeof modules> = {}
    for (const mod of activeModules) {
      const cat = mod.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(mod)
    }
    return groups
  }, [activeModules])

  if (!selectedErp) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Please select an ERP first.
      </div>
    )
  }

  const currencyConfig = SUPPORTED_CURRENCIES[currency]

  const getDisplayPrice = (pricePKR: number): string => {
    if (currency === 'PKR') return `${currencyConfig?.symbol || '₨'}${pricePKR.toLocaleString()}`
    const converted = convertFromPKR(pricePKR, currency)
    return `${currencyConfig?.symbol || currency}${Math.round(converted).toLocaleString()}`
  }

  // Calculate total add-on cost
  const moduleTotal = activeModules
    .filter((m) => selectedModules.includes(m.id))
    .reduce((sum, m) => sum + m.price, 0)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Select Modules for {selectedErp.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the modules to enable. All modules are included in your plan.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            {selectedModules.length} of {activeModules.length} selected
          </Badge>
          {moduleTotal > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
              +{getDisplayPrice(moduleTotal)}/mo
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onSelectAll}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onDeselectAll}
          >
            Deselect All
          </Button>
        </div>
      </div>

      {/* Module groups */}
      <div className="max-h-72 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
        {Object.entries(grouped).map(([category, mods]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({mods.filter((m) => selectedModules.includes(m.id)).length}/{mods.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mods.map((mod) => {
                const isSelected = selectedModules.includes(mod.id)
                return (
                  <motion.div
                    key={mod.id}
                    whileHover={{ scale: 1.005 }}
                    className={`relative flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/20'
                    }`}
                    onClick={() => onToggleModule(mod.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleModule(mod.id)}
                      className="mt-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {mod.name}
                        </p>
                        <span className="text-xs font-medium shrink-0">
                          {mod.price > 0 ? `+${getDisplayPrice(mod.price)}` : 'Included'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {activeModules.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No modules available for this ERP.
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 3: Select Plan + Currency                                     */
/* ------------------------------------------------------------------ */

function StepSelectPlan({
  selectedPlan,
  billingCycle,
  currency,
  onSelectPlan,
  onBillingCycleChange,
  onCurrencyChange,
}: {
  selectedPlan: PlanId | null
  billingCycle: BillingCycle
  currency: string
  onSelectPlan: (planId: PlanId) => void
  onBillingCycleChange: (cycle: BillingCycle) => void
  onCurrencyChange: (c: string) => void
}) {
  const plans = Object.values(PRICING_PLANS)
  const currencyConfig = SUPPORTED_CURRENCIES[currency]

  const getDisplayPrice = (planId: PlanId): number => {
    const pkrPrice = getMonthlyDisplayPrice(planId, billingCycle)
    if (currency === 'PKR') return pkrPrice
    return convertFromPKR(pkrPrice, currency)
  }

  const getTotalPrice = (planId: PlanId): number => {
    const pkrTotal = getPlanPrice(planId, billingCycle)
    if (currency === 'PKR') return pkrTotal
    return convertFromPKR(pkrTotal, currency)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Choose Your Plan
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select the tier that fits your business needs.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onBillingCycleChange('monthly')}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onBillingCycleChange('annual')}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            billingCycle === 'annual'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Annual
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-1.5 py-0">
            -20%
          </Badge>
        </button>
      </div>

      {/* Currency Selector */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
        <Label className="text-sm font-medium text-muted-foreground shrink-0">Currency:</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-full h-9 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span className="font-medium">{c.code}</span>
                  <span className="text-muted-foreground">· {c.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const displayPrice = getDisplayPrice(plan.id)
          const highlightFeatures = plan.features.slice(0, 3)

          return (
            <motion.button
              key={plan.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPlan(plan.id)}
              className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : plan.popular
                  ? 'border-primary/30 bg-primary/[0.02] hover:border-primary/50 hover:shadow-sm'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50 hover:shadow-sm'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-3 bg-primary text-primary-foreground text-[10px] px-2 py-0">
                  Popular
                </Badge>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              )}
              <h4 className="text-sm font-bold text-foreground">{plan.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {plan.description}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">{currencyConfig?.symbol || currency}</span>
                <span className="text-xl font-extrabold text-foreground">
                  {Math.round(displayPrice).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  /mo{billingCycle === 'annual' ? '*' : ''}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-[10px] text-emerald-500 mt-0.5">
                  Billed {currencyConfig?.symbol || ''}{Math.round(getTotalPrice(plan.id)).toLocaleString()}/yr
                </p>
              )}
              <ul className="mt-2 space-y-1">
                {highlightFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          )
        })}
      </div>
      {billingCycle === 'annual' && (
        <p className="text-[11px] text-muted-foreground text-center">
          *Monthly equivalent. Annual billing saves 20% compared to monthly.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 4: Enter Details                                              */
/* ------------------------------------------------------------------ */

function StepEnterDetails({
  state,
  onUpdate,
  errors,
  moduleTotalPKR,
}: {
  state: CheckoutState
  onUpdate: (updates: Partial<CheckoutState>) => void
  errors: FormErrors
  moduleTotalPKR: number
}) {
  const currencyConfig = SUPPORTED_CURRENCIES[state.currency]
  const plan = state.selectedPlan ? PRICING_PLANS[state.selectedPlan] : null
  const planMonthlyPrice = plan
    ? (state.billingCycle === 'annual' ? plan.annualMonthlyPricePKR : plan.monthlyPricePKR)
    : 0
  const displayPrice = plan
    ? state.currency === 'PKR'
      ? planMonthlyPrice
      : convertFromPKR(planMonthlyPrice, state.currency)
    : 0

  const moduleDisplayPrice = state.currency === 'PKR'
    ? moduleTotalPKR
    : convertFromPKR(moduleTotalPKR, state.currency)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Enter Your Details
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          We need a few details to set up your subscription.
        </p>
      </div>

      {/* Order Summary (compact) */}
      {state.selectedErp && state.selectedPlan && (
        <div className="bg-secondary/50 rounded-xl p-3 border border-border">
          <p className="text-xs font-semibold text-foreground mb-1.5">Order Summary</p>
          <div className="flex items-center gap-2">
            {(() => {
              const Icon = getErpIcon(state.selectedErp.icon)
              const colors = getErpColor(state.selectedErp.color)
              return (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    color: colors.hex,
                    background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}08)`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              )
            })()}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {state.selectedErp.name} + {plan?.name ?? 'Plan'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {currencyConfig?.symbol || state.currency}{Math.round(displayPrice).toLocaleString()}/mo
                {state.billingCycle === 'annual' ? ' (billed annually)' : ''}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{state.currency}</Badge>
          </div>
          {moduleTotalPKR > 0 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {state.selectedModules.length} module{state.selectedModules.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs font-medium text-emerald-500 ml-auto">
                +{currencyConfig?.symbol || state.currency}{Math.round(moduleDisplayPrice).toLocaleString()}/mo
              </span>
            </div>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="customerName" className="text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerName"
            placeholder="John Doe"
            value={state.customerName}
            onChange={(e) => onUpdate({ customerName: e.target.value })}
            className={errors.customerName ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.customerName && (
            <p className="text-xs text-red-500">{errors.customerName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customerEmail" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="john@company.com"
            value={state.customerEmail}
            onChange={(e) => onUpdate({ customerEmail: e.target.value })}
            className={errors.customerEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.customerEmail && (
            <p className="text-xs text-red-500">{errors.customerEmail}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customerPhone" className="text-sm font-medium">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="+92 300 1234567"
            value={state.customerPhone}
            onChange={(e) => onUpdate({ customerPhone: e.target.value })}
            className={errors.customerPhone ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.customerPhone && (
            <p className="text-xs text-red-500">{errors.customerPhone}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-sm font-medium">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Acme Corporation"
            value={state.companyName}
            onChange={(e) => onUpdate({ companyName: e.target.value })}
            className={errors.companyName ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.companyName && (
            <p className="text-xs text-red-500">{errors.companyName}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 5: Select Payment Method                                      */
/* ------------------------------------------------------------------ */

const METHOD_ICONS: Record<string, React.ElementType> = {
  CreditCard,
  Smartphone,
  WalletCards,
  Wallet,
  Building2,
  Zap,
}

function StepSelectPaymentMethod({
  selectedMethod,
  currency,
  onSelect,
}: {
  selectedMethod: PaymentMethodId | null
  currency: string
  onSelect: (method: PaymentMethodId) => void
}) {
  const availableMethods = useMemo(
    () => getPaymentMethodsForCurrency(currency),
    [currency]
  )

  // Group methods for layout
  const globalCardMethods = availableMethods.filter((m) =>
    ['card', 'apple_pay', 'google_pay'].includes(m.id)
  )
  const paypalMethod = availableMethods.filter((m) => m.id === 'paypal')
  const walletMethods = availableMethods.filter((m) =>
    ['jazzcash', 'easypaisa', 'raast'].includes(m.id)
  )
  const bankMethod = availableMethods.filter((m) => m.id === 'bank_transfer')

  const renderMethodCard = (method: PaymentMethodConfig) => {
    const IconComponent = METHOD_ICONS[method.icon] || CreditCard
    const isSelected = selectedMethod === method.id

    return (
      <motion.button
        key={method.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(method.id)}
        className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 w-full ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
            : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50 hover:shadow-sm'
        }`}
        style={{
          borderLeftWidth: '3px',
          borderLeftColor: isSelected ? method.brandColor : 'var(--border)',
        }}
      >
        {isSelected && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
        )}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `${method.brandColor}15`,
          }}
        >
          <IconComponent
            className="w-[18px] h-[18px]"
            style={{ color: method.brandColor }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{method.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {method.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {method.processingTime}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {method.fee}
            </span>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Select Payment Method
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how you want to pay. Available methods for {currency}.
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        {/* Global card methods */}
        {globalCardMethods.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Card & Digital Wallets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {globalCardMethods.map(renderMethodCard)}
            </div>
          </div>
        )}

        {/* PayPal */}
        {paypalMethod.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Digital Wallets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {paypalMethod.map(renderMethodCard)}
            </div>
          </div>
        )}

        {/* Pakistan-specific wallet methods */}
        {walletMethods.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Pakistan-Specific
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">PKR Only</Badge>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {walletMethods.map(renderMethodCard)}
            </div>
          </div>
        )}

        {/* Bank Transfer */}
        {bankMethod.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bank Transfer
            </p>
            <div className="grid grid-cols-1 gap-2">
              {bankMethod.map(renderMethodCard)}
            </div>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5">
        <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
        <span>
          All transactions are secured with bank-grade encryption. Your payment details never touch our servers.
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 6: Payment Processing                                         */
/* ------------------------------------------------------------------ */

function StepPaymentProcessing({
  state,
  isProcessing,
  paymentResult,
  errorMessage,
  onPay,
  onVerifyPayment,
  onClose,
  isVerifying,
  moduleTotalPKR,
  onUpdate,
  isCardFormValid,
}: {
  state: CheckoutState
  isProcessing: boolean
  paymentResult: PaymentResult | null
  errorMessage: string | null
  onPay: () => void
  onVerifyPayment: () => void
  onClose: () => void
  isVerifying: boolean
  moduleTotalPKR: number
  onUpdate: (updates: Partial<CheckoutState>) => void
  isCardFormValid: boolean
}) {
  const plan = state.selectedPlan ? PRICING_PLANS[state.selectedPlan] : null
  // Total: plan price (annual total or monthly) + modules (monthly × 12 × 0.8 if annual for 20% discount)
  const totalAmountPKR = plan
    ? (state.billingCycle === 'annual' ? plan.annualTotalPKR : plan.monthlyPricePKR) + moduleTotalPKR * (state.billingCycle === 'annual' ? 12 * 0.8 : 1)
    : moduleTotalPKR * (state.billingCycle === 'annual' ? 12 * 0.8 : 1)
  const displayAmount = state.currency === 'PKR'
    ? totalAmountPKR
    : convertFromPKR(totalAmountPKR, state.currency)
  const currencyConfig = SUPPORTED_CURRENCIES[state.currency]
  const method = state.paymentMethod ? PAYMENT_METHODS[state.paymentMethod] : null
  // Monthly equivalent for display (annual gets 20% discount on modules too)
  const monthlyDisplayAmount = plan
    ? (state.billingCycle === 'annual' ? plan.annualMonthlyPricePKR : plan.monthlyPricePKR) + (state.billingCycle === 'annual' ? Math.round(moduleTotalPKR * 0.8) : moduleTotalPKR)
    : (state.billingCycle === 'annual' ? Math.round(moduleTotalPKR * 0.8) : moduleTotalPKR)

  // ── Loading State ──
  if (isProcessing && !paymentResult && !errorMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center py-8"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Processing Your Payment...
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we securely process your transaction.
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3.5 border border-border space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">
              {currencyConfig?.symbol || state.currency}{Math.round(displayAmount).toLocaleString()}
            </span>
          </div>
          {method && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium text-foreground">{method.name}</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // ── Error State ──
  if (errorMessage && !paymentResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center py-4"
      >
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-2xl">!</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Payment Failed</h3>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        <Button
          onClick={onPay}
          className="w-full rounded-xl h-11 font-semibold"
        >
          Try Again
        </Button>
      </motion.div>
    )
  }

  // ── Success View ──
  if (paymentResult?.mode === 'success' || paymentResult?.mode === 'sandbox') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center py-4"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Payment Successful!
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your payment has been confirmed. Check your email for details.
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 border border-border text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-semibold text-foreground font-mono">{paymentResult.orderNumber}</span>
          </div>
          {state.selectedErp && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ERP</span>
              <span className="font-medium text-foreground">{state.selectedErp.name}</span>
            </div>
          )}
          {plan && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium text-foreground">{plan.name}</span>
            </div>
          )}
          {state.selectedModules.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Modules</span>
              <span className="font-medium text-foreground">{state.selectedModules.length} selected</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Billing</span>
            <span className="font-medium text-foreground capitalize">{state.billingCycle}</span>
          </div>
          {method && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium text-foreground">{method.name}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground">
              {currencyConfig?.symbol || state.currency}{Math.round(paymentResult.totalAmount ?? displayAmount).toLocaleString()}
              {state.billingCycle === 'annual' ? '/yr' : '/mo'}
            </span>
          </div>
          {state.billingCycle === 'annual' && (
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Monthly equivalent</span>
              <span>
                {currencyConfig?.symbol || state.currency}{Math.round(state.currency === 'PKR' ? monthlyDisplayAmount : convertFromPKR(monthlyDisplayAmount, state.currency)).toLocaleString()}/mo
              </span>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-left space-y-3">
          <p className="text-xs font-semibold text-foreground">What happens next?</p>
          <div className="space-y-2">
            {[
              { icon: <Mail className="w-3.5 h-3.5 text-primary" />, text: 'Confirmation email sent to ' + state.customerEmail },
              { icon: <FileText className="w-3.5 h-3.5 text-primary" />, text: 'Invoice and license key will be generated' },
              { icon: <Clock className="w-3.5 h-3.5 text-primary" />, text: 'Your ERP will be provisioned within 24 hours' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">{step.icon}</div>
                <span className="text-xs text-muted-foreground">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-xl px-8 w-full"
        >
          Close
        </Button>
      </motion.div>
    )
  }

  // ── Redirect Payment View (Card / Apple Pay / Google Pay) ──
  if (
    paymentResult &&
    (paymentResult.mode === 'stripe' || paymentResult.mode === 'sandbox') &&
    paymentResult.checkoutUrl &&
    (state.paymentMethod === 'card' || state.paymentMethod === 'apple_pay' || state.paymentMethod === 'google_pay')
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center py-6"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Redirecting to Secure Payment...
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ll be redirected to our secure payment partner to complete your transaction.
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3.5 border border-border space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">
              {currencyConfig?.symbol || state.currency}{Math.round(displayAmount).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium text-foreground">{method?.name || 'Card'}</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          If you&apos;re not redirected automatically,{' '}
          <button
            onClick={() => window.location.href = paymentResult.checkoutUrl!}
            className="text-primary underline"
          >
            click here
          </button>
        </p>
      </motion.div>
    )
  }

  // ── PayPal Redirect View ──
  if (
    paymentResult &&
    state.paymentMethod === 'paypal'
  ) {
    if (paymentResult.checkoutUrl) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center py-6"
        >
          <div className="w-14 h-14 rounded-full bg-[#003087]/10 border border-[#003087]/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 text-[#003087] animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Redirecting to PayPal...
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your payment on PayPal&apos;s secure website.
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            If you&apos;re not redirected,{' '}
            <button
              onClick={() => window.location.href = paymentResult.checkoutUrl!}
              className="text-primary underline"
            >
              click here
            </button>
          </p>
        </motion.div>
      )
    }

    // Sandbox PayPal — no redirect URL
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center py-4"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">PayPal Payment (Sandbox)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {paymentResult.paymentMessage || 'PayPal payment simulated in sandbox mode.'}
          </p>
        </div>
        <Button
          onClick={onVerifyPayment}
          disabled={isVerifying}
          className="w-full rounded-xl h-11 font-semibold"
        >
          {isVerifying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
          ) : (
            'I\'ve Completed Payment'
          )}
        </Button>
      </motion.div>
    )
  }

  // ── Wallet Payment View (JazzCash / EasyPaisa / Raast) ──
  if (
    paymentResult &&
    (state.paymentMethod === 'jazzcash' || state.paymentMethod === 'easypaisa' || state.paymentMethod === 'raast')
  ) {
    const walletName = method?.name || state.paymentMethod || ''
    const walletColor = method?.brandColor || '#000'
    const accountInfo = state.paymentMethod === 'jazzcash'
      ? '0300-1234567'
      : state.paymentMethod === 'easypaisa'
      ? '0345-9876543'
      : 'apexflow@raast'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 py-2"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">
            Pay with {walletName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Follow the instructions below to complete your payment.
          </p>
        </div>

        {/* Payment Instruction Card */}
        <div
          className="rounded-xl border-2 overflow-hidden"
          style={{ borderColor: `${walletColor}40` }}
        >
          <div
            className="px-4 py-3"
            style={{ background: `${walletColor}10` }}
          >
            <p className="text-sm font-semibold text-foreground">Payment Instructions</p>
          </div>
          <div className="p-4 space-y-3">
            {/* QR Code placeholder */}
            {paymentResult.qrCodeData && (
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center gap-2">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                  <p className="text-[9px] text-muted-foreground text-center">Scan to Pay</p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Amount to Send</p>
              <p className="text-2xl font-extrabold text-foreground">
                {currencyConfig?.symbol || state.currency}{Math.round(displayAmount).toLocaleString()}
              </p>
            </div>

            {/* Account & Reference */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-card rounded-lg p-2.5 border border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground">Send To</p>
                  <p className="text-sm font-semibold text-foreground">{accountInfo}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(accountInfo)}
                  className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              {paymentResult.paymentReference && (
                <div className="flex items-center justify-between bg-card rounded-lg p-2.5 border border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Reference Number</p>
                    <p className="text-sm font-mono font-semibold text-foreground">{paymentResult.paymentReference}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(paymentResult.paymentReference!)}
                    className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {paymentResult.paymentMessage && (
              <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2.5">
                {paymentResult.paymentMessage}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            className="w-full rounded-xl h-11 font-semibold"
            style={{ background: walletColor }}
            onClick={() => {
              const appUrls: Record<string, string> = {
                jazzcash: 'jazzcash://',
                easypaisa: 'easypaisa://',
                raast: 'raast://',
              }
              window.open(appUrls[state.paymentMethod!] || '#', '_blank')
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open {walletName} to Pay
          </Button>
          <Button
            variant="outline"
            onClick={onVerifyPayment}
            disabled={isVerifying}
            className="w-full rounded-xl h-11 font-semibold"
          >
            {isVerifying ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
            ) : (
              "I've Completed Payment"
            )}
          </Button>
        </div>
      </motion.div>
    )
  }

  // ── Bank Transfer View ──
  if (
    paymentResult &&
    state.paymentMethod === 'bank_transfer'
  ) {
    const bankInfo = paymentResult.bankDetails
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 py-2"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">Bank Transfer Details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Transfer the amount to the account below, then confirm your payment.
          </p>
        </div>

        {/* Amount */}
        <div className="bg-secondary/50 rounded-lg p-4 text-center border border-border">
          <p className="text-xs text-muted-foreground mb-1">Amount to Transfer</p>
          <p className="text-2xl font-extrabold text-foreground">
            {currencyConfig?.symbol || state.currency}{Math.round(displayAmount).toLocaleString()}
          </p>
        </div>

        {/* Bank details */}
        {bankInfo && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-foreground">Bank Details</span>
            </div>
            {Object.entries(bankInfo).map(([key, value]) => {
              const labels: Record<string, string> = {
                bankName: 'Bank Name',
                accountTitle: 'Account Title',
                accountNumber: 'Account Number',
                iban: 'IBAN',
                swiftCode: 'SWIFT Code',
                branch: 'Branch',
                correspondentBank: 'Correspondent Bank',
                correspondentSwift: 'Correspondent SWIFT',
              }
              if (!value) return null
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{labels[key] || key}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground font-mono">{value}</span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(value)}
                      className="p-1 rounded hover:bg-secondary/80 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {paymentResult.paymentReference && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Payment Reference</p>
              <p className="text-sm font-mono font-semibold text-foreground">{paymentResult.paymentReference}</p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(paymentResult.paymentReference!)}
              className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {paymentResult.paymentMessage && (
          <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2.5">
            {paymentResult.paymentMessage}
          </p>
        )}

        <Button
          variant="outline"
          onClick={onVerifyPayment}
          disabled={isVerifying}
          className="w-full rounded-xl h-11 font-semibold"
        >
          {isVerifying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
          ) : (
            "I've Completed the Transfer"
          )}
        </Button>
      </motion.div>
    )
  }

  // ── Default: Confirm & Pay (initial state of step 6) ──
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4 py-2"
    >
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Confirm & Pay</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review your order and confirm payment.
        </p>
      </div>

      {/* Order review */}
      <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
        {state.selectedErp && (
          <div className="flex items-center gap-2">
            {(() => {
              const Icon = getErpIcon(state.selectedErp.icon)
              const colors = getErpColor(state.selectedErp.color)
              return (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    color: colors.hex,
                    background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}08)`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              )
            })()}
            <div>
              <p className="text-sm font-semibold text-foreground">{state.selectedErp.name}</p>
              <p className="text-[11px] text-muted-foreground">{state.selectedErp.industry}</p>
            </div>
          </div>
        )}
        {plan && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium text-foreground">{plan.name} ({state.billingCycle})</span>
          </div>
        )}
        {state.selectedModules.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Modules</span>
            <span className="font-medium text-foreground">{state.selectedModules.length} enabled</span>
          </div>
        )}
        {method && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium text-foreground">{method.name}</span>
          </div>
        )}
        <div className="border-t border-border pt-2 flex justify-between text-sm">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-foreground text-lg">
            {currencyConfig?.symbol || state.currency}{Math.round(displayAmount).toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">
              /{state.billingCycle === 'annual' ? 'yr' : 'mo'}
            </span>
          </span>
        </div>
      </div>

      {/* Card Form — only for "card" payment method */}
      {state.paymentMethod === 'card' && (
        <InlineCardForm state={state} onUpdate={onUpdate} />
      )}

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>256-bit SSL encrypted · PCI DSS compliant</span>
      </div>

      <Button
        onClick={onPay}
        disabled={state.paymentMethod === 'card' && !isCardFormValid}
        className="w-full rounded-xl h-12 font-semibold text-base"
        size="lg"
      >
        <Lock className="w-4 h-4 mr-2" />
        Pay {currencyConfig?.symbol || state.currency}{Math.round(displayAmount).toLocaleString()}
      </Button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Checkout Modal Component                                      */
/* ------------------------------------------------------------------ */

export function CheckoutModal({ open, onOpenChange, preselectedPlan }: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>(1)
  const [direction, setDirection] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const [state, setState] = useState<CheckoutState>(() => ({
    selectedErp: null,
    selectedModules: [],
    selectedPlan: preselectedPlan ?? null,
    billingCycle: 'monthly',
    currency: 'PKR',
    paymentMethod: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    companyName: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  }))

  // Sync preselectedPlan with checkout state when it changes (e.g., user clicks a different plan)
  useEffect(() => {
    if (open && preselectedPlan) {
      const timer = setTimeout(() => {
        setState((s) => {
          // Only update if the plan actually changed
          if (s.selectedPlan !== preselectedPlan) {
            return { ...s, selectedPlan: preselectedPlan }
          }
          return s
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, preselectedPlan])

  // Calculate module total in PKR
  const moduleTotalPKR = useMemo(() => {
    if (!state.selectedErp) return 0
    return state.selectedErp.modules
      .filter((m) => state.selectedModules.includes(m.id))
      .reduce((sum, m) => sum + m.price, 0)
  }, [state.selectedErp, state.selectedModules])

  // Card form validation
  const isCardFormValid = useMemo(() => {
    if (state.paymentMethod !== 'card') return true
    const errors = validateCardForm(state)
    return Object.keys(errors).length === 0
  }, [state])

  const updateState = useCallback((updates: Partial<CheckoutState>) => {
    setState((s) => ({ ...s, ...updates }))
  }, [])

  const handleToggleModule = useCallback((moduleId: string) => {
    setState((s) => ({
      ...s,
      selectedModules: s.selectedModules.includes(moduleId)
        ? s.selectedModules.filter((id) => id !== moduleId)
        : [...s.selectedModules, moduleId],
    }))
  }, [])

  const handleSelectAllModules = useCallback(() => {
    if (!state.selectedErp) return
    const allActiveIds = state.selectedErp.modules
      .filter((m) => m.isActive)
      .map((m) => m.id)
    setState((s) => ({ ...s, selectedModules: allActiveIds }))
  }, [state.selectedErp])

  const handleDeselectAllModules = useCallback(() => {
    setState((s) => ({ ...s, selectedModules: [] }))
  }, [])

  const goToStep = useCallback((newStep: CheckoutStep) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
    // Reset payment state when navigating away from payment step
    if (newStep < 6) {
      setPaymentResult(null)
      setErrorMessage(null)
      setIsProcessing(false)
    }
  }, [step])

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return state.selectedErp !== null
      case 2:
        return true
      case 3:
        return state.selectedPlan !== null
      case 4:
        return !!(
          state.customerName.trim() &&
          state.customerEmail.trim() &&
          state.customerPhone.trim() &&
          state.companyName.trim()
        )
      case 5:
        return state.paymentMethod !== null
      default:
        return true
    }
  }, [step, state])

  const validateStep = useCallback((currentStep: CheckoutStep): boolean => {
    if (currentStep === 4) {
      const errors: FormErrors = {}
      if (!state.customerName.trim()) errors.customerName = 'Name is required'
      if (!state.customerEmail.trim()) errors.customerEmail = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customerEmail))
        errors.customerEmail = 'Invalid email address'
      if (!state.customerPhone.trim()) errors.customerPhone = 'Phone is required'
      if (!state.companyName.trim()) errors.companyName = 'Company name is required'
      setFormErrors(errors)
      return Object.keys(errors).length === 0
    }
    return true
  }, [state])

  const handleNext = useCallback(() => {
    if (!canProceed()) return
    if (!validateStep(step)) return
    if (step < 6) goToStep((step + 1) as CheckoutStep)
  }, [canProceed, validateStep, goToStep, step])

  const handleBack = useCallback(() => {
    if (step > 1) goToStep((step - 1) as CheckoutStep)
  }, [goToStep, step])

  // Build module prices array with actual PKR prices from ERP data
  const modulePrices = useMemo(() => {
    if (!state.selectedErp) return []
    return state.selectedErp.modules
      .filter((m) => state.selectedModules.includes(m.id))
      .map((m) => ({ id: m.id, price: m.price }))
  }, [state.selectedErp, state.selectedModules])

  const handlePay = useCallback(async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpSlug: state.selectedErp?.slug,
          plan: state.selectedPlan,
          billingCycle: state.billingCycle,
          customerEmail: state.customerEmail,
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          companyName: state.companyName,
          paymentMethod: state.paymentMethod,
          currency: state.currency,
          modules: state.selectedModules,
          modulePrices,
          cardName: state.paymentMethod === 'card' ? state.cardName : undefined,
          cardNumber: state.paymentMethod === 'card' ? state.cardNumber.replace(/\s/g, '') : undefined,
          cardExpiry: state.paymentMethod === 'card' ? state.cardExpiry : undefined,
          cardCvv: state.paymentMethod === 'card' ? state.cardCvv : undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || `Payment failed (HTTP ${res.status}). Please try again.`)
        setIsProcessing(false)
        return
      }

      // Safely destructure data.data with null fallback
      const result = data.data || {}
      setPaymentResult({
        orderNumber: result.orderNumber || `ORD-${Date.now()}`,
        mode: result.mode || 'sandbox',
        paymentMethod: result.paymentMethod,
        currency: result.currency,
        totalAmount: result.totalAmount,
        transactionId: result.transactionId,
        paymentReference: result.paymentReference,
        paymentMessage: result.paymentMessage,
        qrCodeData: result.qrCodeData,
        bankDetails: result.bankDetails,
        checkoutUrl: result.checkoutUrl,
      })
      setIsProcessing(false)

      // For Stripe redirect, auto-redirect
      if (result.mode === 'stripe' && result.checkoutUrl) {
        setTimeout(() => {
          window.location.href = result.checkoutUrl
        }, 2000)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please check your connection and try again.')
      setIsProcessing(false)
    }
  }, [state, modulePrices])

  const handleVerifyPayment = useCallback(async () => {
    setIsVerifying(true)
    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 2000))
    setPaymentResult((prev) =>
      prev ? { ...prev, mode: 'success' } : null
    )
    setIsVerifying(false)
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setStep(1)
      setState({
        selectedErp: null,
        selectedModules: [],
        selectedPlan: preselectedPlan || null,
        billingCycle: 'monthly',
        currency: 'PKR',
        paymentMethod: null,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        companyName: '',
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
      })
      setPaymentResult(null)
      setErrorMessage(null)
      setIsProcessing(false)
      setIsVerifying(false)
      setFormErrors({})
      setSearchQuery('')
    }, 300)
  }, [onOpenChange, preselectedPlan])

  // ── Order Summary Sidebar Data ──
  const plan = state.selectedPlan ? PRICING_PLANS[state.selectedPlan] : null
  // Use plan directly for safety — avoids state.selectedPlan! non-null assertion
  const planMonthlyPricePKR = plan
    ? (state.billingCycle === 'annual' ? plan.annualMonthlyPricePKR : plan.monthlyPricePKR)
    : 0
  // Total amount: plan price (annual total or monthly) + modules (monthly × 12 × 0.8 if annual for 20% discount)
  const totalAmountPKR = plan
    ? (state.billingCycle === 'annual' ? plan.annualTotalPKR : plan.monthlyPricePKR) + moduleTotalPKR * (state.billingCycle === 'annual' ? 12 * 0.8 : 1)
    : moduleTotalPKR * (state.billingCycle === 'annual' ? 12 * 0.8 : 1)
  const displayTotalAmount = state.currency === 'PKR'
    ? totalAmountPKR
    : convertFromPKR(totalAmountPKR, state.currency)
  const currencyConfig = SUPPORTED_CURRENCIES[state.currency]
  // Monthly display price: plan monthly display + module monthly (for sidebar; annual gets 20% discount on modules)
  const discountedModuleMonthlyPKR = state.billingCycle === 'annual' ? Math.round(moduleTotalPKR * 0.8) : moduleTotalPKR
  const displayMonthlyPrice = plan
    ? state.currency === 'PKR'
      ? planMonthlyPricePKR + discountedModuleMonthlyPKR
      : convertFromPKR(planMonthlyPricePKR + discountedModuleMonthlyPKR, state.currency)
    : state.currency === 'PKR'
      ? discountedModuleMonthlyPKR
      : convertFromPKR(discountedModuleMonthlyPKR, state.currency)
  const displayModuleTotal = state.currency === 'PKR'
    ? discountedModuleMonthlyPKR
    : convertFromPKR(discountedModuleMonthlyPKR, state.currency)
  const selectedMethod = state.paymentMethod ? PAYMENT_METHODS[state.paymentMethod] : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-5xl md:max-w-6xl lg:max-w-7xl max-h-[92vh] overflow-hidden p-0 border border-border/50 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* ── Left Column: Main Content (~60%) ── */}
          <div className="flex-1 md:w-[58%] flex flex-col overflow-hidden p-5 md:p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscribe to ApexFlow Cloud
              </DialogTitle>
              <DialogDescription>
                Complete the steps below to set up your ERP subscription.
              </DialogDescription>
            </DialogHeader>

            <StepIndicator currentStep={step} />

            <div className="relative overflow-hidden flex-1 min-h-[380px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="px-1"
                >
                  {step === 1 && (
                    <StepSelectErp
                      selectedErp={state.selectedErp}
                      onSelect={(erp) => {
                        const activeModuleIds = erp.modules
                          .filter((m) => m.isActive)
                          .map((m) => m.id)
                        updateState({ selectedErp: erp, selectedModules: activeModuleIds })
                      }}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  )}
                  {step === 2 && (
                    <StepSelectModules
                      selectedErp={state.selectedErp}
                      selectedModules={state.selectedModules}
                      onToggleModule={handleToggleModule}
                      onSelectAll={handleSelectAllModules}
                      onDeselectAll={handleDeselectAllModules}
                      currency={state.currency}
                    />
                  )}
                  {step === 3 && (
                    <StepSelectPlan
                      selectedPlan={state.selectedPlan}
                      billingCycle={state.billingCycle}
                      currency={state.currency}
                      onSelectPlan={(planId) => updateState({ selectedPlan: planId })}
                      onBillingCycleChange={(cycle) => updateState({ billingCycle: cycle })}
                      onCurrencyChange={(c) => updateState({ currency: c })}
                    />
                  )}
                  {step === 4 && (
                    <StepEnterDetails
                      state={state}
                      onUpdate={updateState}
                      errors={formErrors}
                      moduleTotalPKR={moduleTotalPKR}
                    />
                  )}
                  {step === 5 && (
                    <StepSelectPaymentMethod
                      selectedMethod={state.paymentMethod}
                      currency={state.currency}
                      onSelect={(method) => updateState({ paymentMethod: method })}
                    />
                  )}
                  {step === 6 && (
                    <StepPaymentProcessing
                      state={state}
                      isProcessing={isProcessing}
                      paymentResult={paymentResult}
                      errorMessage={errorMessage}
                      onPay={handlePay}
                      onVerifyPayment={handleVerifyPayment}
                      onClose={handleClose}
                      isVerifying={isVerifying}
                      moduleTotalPKR={moduleTotalPKR}
                      onUpdate={updateState}
                      isCardFormValid={isCardFormValid}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons (hidden on step 6 when processing or result shown) */}
            {!(step === 6 && (isProcessing || paymentResult)) && (
              <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="rounded-xl transition-all duration-200 hover:bg-secondary/80"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {step < 6 && (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Order Summary Sidebar (~40%) ── */}
          <div className="hidden md:flex md:w-[42%] flex-col bg-gradient-to-b from-secondary/60 via-secondary/30 to-background border-l border-border/60 overflow-y-auto">
            {/* Branding */}
            <div className="p-6 border-b border-border/60 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">ApexFlow</p>
                  <p className="text-[10px] text-muted-foreground">Enterprise ERP Platform</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex-1 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary/40" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</p>
              </div>

              {/* Selected ERP */}
              <div className="space-y-3">
                {state.selectedErp ? (
                  <div className="flex items-center gap-3 bg-card/80 rounded-xl p-3 border border-border/80 shadow-sm">
                    {(() => {
                      const Icon = getErpIcon(state.selectedErp.icon)
                      const colors = getErpColor(state.selectedErp.color)
                      return (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            color: colors.hex,
                            background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}08)`,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{state.selectedErp.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{state.selectedErp.industry}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-card/50 rounded-xl p-3 border border-dashed border-border/60">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Select an ERP in Step 1</p>
                  </div>
                )}

                {/* Plan */}
                {plan ? (
                  <div className="flex items-center justify-between bg-card/80 rounded-xl p-3 border border-border/80 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{plan.name} Plan</p>
                      <p className="text-[11px] text-muted-foreground">{currencyConfig?.symbol || state.currency}{Math.round(displayMonthlyPrice).toLocaleString()}/mo</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-card/50 rounded-xl p-3 border border-dashed border-border">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Choose a plan in Step 3</p>
                  </div>
                )}

                {/* Modules count */}
                {state.selectedErp && (
                  <div className="flex items-center justify-between bg-card/80 rounded-xl p-3 border border-border/80 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{state.selectedModules.length}</span>
                      {displayModuleTotal > 0 && (
                        <span className="text-[11px] text-emerald-500">+{currencyConfig?.symbol || state.currency}{Math.round(displayModuleTotal).toLocaleString()}/mo</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Billing & Currency */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-card/80 rounded-xl p-3 border border-border/80 shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Billing</p>
                    <p className="text-sm font-medium text-foreground capitalize mt-0.5">{state.billingCycle}</p>
                  </div>
                  <div className="bg-card/80 rounded-xl p-3 border border-border/80 shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Currency</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{state.currency}</p>
                  </div>
                </div>

                {/* Payment Method */}
                {selectedMethod ? (
                  <div className="flex items-center gap-3 bg-card/80 rounded-xl p-3 border border-border/80 shadow-sm">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `${selectedMethod.brandColor}15` }}
                    >
                      {(() => {
                        const IconComponent = METHOD_ICONS[selectedMethod.icon] || CreditCard
                        return <IconComponent className="w-3.5 h-3.5" style={{ color: selectedMethod.brandColor }} />
                      })()}
                    </div>
                    <p className="text-sm text-foreground">{selectedMethod.name}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-card/50 rounded-xl p-3 border border-dashed border-border/60">
                    <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Select payment in Step 5</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/[0.02] rounded-xl p-5 border border-primary/20 shadow-sm shadow-primary/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Total Amount</p>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-foreground tracking-tight">
                      {currencyConfig?.symbol || state.currency}{Math.round(displayTotalAmount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {state.billingCycle === 'annual' ? 'per year' : 'per month'}
                      {state.billingCycle === 'annual' && plan && (
                        <span className="text-emerald-500 ml-1.5 font-medium">(Save 20%)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="p-6 border-t border-border/60 bg-gradient-to-b from-card/50 to-card/30">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">256-bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CheckoutModal
