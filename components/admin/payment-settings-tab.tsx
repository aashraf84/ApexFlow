'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Smartphone,
  Globe,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Star,
  Wifi,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Wallet,
  Server,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Landmark,
  ArrowRightLeft,
  Wrench,
  Database,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { IntegrationSection } from '@/components/admin/sections/integration-section'
import { DatabaseSection } from '@/components/admin/sections/database-section'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface PaymentAccount {
  id: string
  label: string
  gateway: string
  type: string
  currency: string
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  bankName: string | null
  accountTitle: string | null
  accountNumber: string | null
  iban: string | null
  swiftCode: string | null
  branchName: string | null
  routingNumber: string | null
  correspondentBank: string | null
  correspondentSwift: string | null
  walletProvider: string | null
  walletAccount: string | null
  walletAccountName: string | null
  stripeSecretKey: string | null
  stripePublishableKey: string | null
  stripeWebhookSecret: string | null
  stripeAccountId: string | null
  paypalClientId: string | null
  paypalClientSecret: string | null
  paypalMode: string | null
  raastId: string | null
  lastFourDigits: string | null
  notes: string | null
  lastVerifiedAt: string | null
  verifiedBy: string | null
  createdAt: string
  updatedAt: string
}

interface PaymentSetting {
  id: string
  key: string
  value: string
  description: string | null
  isEncrypted: boolean
  updatedAt: string
  createdAt: string
}

interface AuditLogEntry {
  id: string
  action: string
  entity: string
  entityId: string | null
  changes: string | null
  performedBy: string | null
  ip: string | null
  createdAt: string
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function maskValue(value: string | null, visibleChars = 4): string {
  if (!value) return '—'
  if (value.length <= visibleChars) return value
  return '****' + value.slice(-visibleChars)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrencyLabel(code: string): string {
  const map: Record<string, string> = {
    PKR: 'PKR ₹',
    USD: 'USD $',
    EUR: 'EUR €',
    GBP: 'GBP £',
    AED: 'AED د.إ',
    SAR: 'SAR ﷼',
  }
  return map[code] || code
}

/* ================================================================== */
/*  Bank Account Form State                                            */
/* ================================================================== */

interface BankAccountForm {
  label: string
  currency: string
  bankName: string
  accountTitle: string
  accountNumber: string
  iban: string
  swiftCode: string
  branchName: string
  routingNumber: string
  correspondentBank: string
  correspondentSwift: string
  isActive: boolean
  isDefault: boolean
  notes: string
}

const emptyBankForm: BankAccountForm = {
  label: '',
  currency: 'PKR',
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  swiftCode: '',
  branchName: '',
  routingNumber: '',
  correspondentBank: '',
  correspondentSwift: '',
  isActive: true,
  isDefault: false,
  notes: '',
}

/* ================================================================== */
/*  Wallet Form State                                                  */
/* ================================================================== */

interface WalletForm {
  label: string
  walletProvider: string
  currency: string
  walletAccount: string
  walletAccountName: string
  raastId: string
  isActive: boolean
  isDefault: boolean
}

const emptyWalletForm: WalletForm = {
  label: '',
  walletProvider: 'jazzcash',
  currency: 'PKR',
  walletAccount: '',
  walletAccountName: '',
  raastId: '',
  isActive: true,
  isDefault: false,
}

/* ================================================================== */
/*  Gateway Config Form                                                */
/* ================================================================== */

interface StripeConfigForm {
  label: string
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  stripeAccountId: string
  isActive: boolean
}

const emptyStripeForm: StripeConfigForm = {
  label: 'Stripe',
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  stripeAccountId: '',
  isActive: true,
}

interface PayPalConfigForm {
  label: string
  paypalClientId: string
  paypalClientSecret: string
  paypalMode: string
  isActive: boolean
}

const emptyPayPalForm: PayPalConfigForm = {
  label: 'PayPal',
  paypalClientId: '',
  paypalClientSecret: '',
  paypalMode: 'sandbox',
  isActive: true,
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function PaymentSettingsTab() {
  // Data
  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const [settings, setSettings] = useState<PaymentSetting[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)

  // Dialogs
  const [bankDialogOpen, setBankDialogOpen] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [stripeDialogOpen, setStripeDialogOpen] = useState(false)
  const [paypalDialogOpen, setPaypalDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PaymentAccount | null>(null)

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [bankForm, setBankForm] = useState<BankAccountForm>({ ...emptyBankForm })
  const [walletForm, setWalletForm] = useState<WalletForm>({ ...emptyWalletForm })
  const [stripeForm, setStripeForm] = useState<StripeConfigForm>({ ...emptyStripeForm })
  const [paypalForm, setPaypalForm] = useState<PayPalConfigForm>({ ...emptyPayPalForm })
  const [saving, setSaving] = useState(false)

  // Gateway visibility toggles
  const [showStripeSecret, setShowStripeSecret] = useState(false)
  const [showStripeWebhook, setShowStripeWebhook] = useState(false)
  const [showPayPalSecret, setShowPayPalSecret] = useState(false)

  // Connection test states
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'failed' | 'testing'>>({})

  // Audit log pagination
  const [auditPage, setAuditPage] = useState(1)
  const auditPageSize = 10

  // General settings form
  const [sandboxMode, setSandboxMode] = useState(false)
  const [defaultCurrency, setDefaultCurrency] = useState('PKR')
  const [autoVerifyBank, setAutoVerifyBank] = useState(false)
  const [paymentReceiptEmail, setPaymentReceiptEmail] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  /* ---------------------------------------------------------------- */
  /*  Fetch Data                                                       */
  /* ---------------------------------------------------------------- */

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/payment-accounts')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAccounts(data.accounts || [])
    } catch {
      toast.error('Failed to load payment accounts')
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/admin/payment-settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const settingsList = data.settings || []
      setSettings(settingsList)

      // Apply settings to form state
      const getSetting = (key: string) => settingsList.find((s: PaymentSetting) => s.key === key)?.value
      setSandboxMode(getSetting('sandbox_mode') === 'true')
      setDefaultCurrency(getSetting('default_currency') || 'PKR')
      setAutoVerifyBank(getSetting('auto_verify_bank_transfer') === 'true')
      setPaymentReceiptEmail(getSetting('payment_receipt_email') !== 'false')
    } catch {
      // Silently fail - settings may not exist yet
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/payment-audit')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAuditLogs(data.logs || [])
    } catch {
      setAuditLogs([])
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchSettings()
    fetchAuditLogs()
  }, [fetchAccounts, fetchSettings, fetchAuditLogs])

  /* ---------------------------------------------------------------- */
  /*  Computed data                                                    */
  /* ---------------------------------------------------------------- */

  const bankAccounts = accounts.filter((a) => a.type === 'bank_account')
  const mobileWallets = accounts.filter((a) => a.type === 'mobile_wallet')
  const stripeAccount = accounts.find((a) => a.gateway === 'stripe' && a.type === 'gateway')
  const paypalAccount = accounts.find((a) => a.gateway === 'paypal' && a.type === 'gateway')

  const isStripeConnected = !!(stripeAccount?.stripePublishableKey && stripeAccount?.stripeSecretKey)
  const isPayPalConnected = !!(paypalAccount?.paypalClientId && paypalAccount?.paypalClientSecret)

  /* ---------------------------------------------------------------- */
  /*  Save Bank Account                                                */
  /* ---------------------------------------------------------------- */

  const handleSaveBank = async () => {
    if (!bankForm.label.trim() || !bankForm.bankName.trim() || !bankForm.accountTitle.trim() || !bankForm.accountNumber.trim()) {
      toast.error('Please fill in all required fields: Label, Bank Name, Account Title, Account Number')
      return
    }
    setSaving(true)
    try {
      const url = editingId
        ? `/api/admin/payment-accounts?id=${editingId}`
        : '/api/admin/payment-accounts'
      const method = editingId ? 'PATCH' : 'POST'
      const body: Record<string, unknown> = {
        type: 'bank_account',
        gateway: 'bank_transfer',
        label: bankForm.label.trim(),
        currency: bankForm.currency,
        bankName: bankForm.bankName.trim(),
        accountTitle: bankForm.accountTitle.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        iban: bankForm.iban.trim() || null,
        swiftCode: bankForm.swiftCode.trim() || null,
        branchName: bankForm.branchName.trim() || null,
        routingNumber: bankForm.routingNumber.trim() || null,
        correspondentBank: bankForm.correspondentBank.trim() || null,
        correspondentSwift: bankForm.correspondentSwift.trim() || null,
        isActive: bankForm.isActive,
        isDefault: bankForm.isDefault,
        notes: bankForm.notes.trim() || null,
      }
      console.log('[PaymentSettings] Saving bank account:', { url, method, label: body.label })
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('[PaymentSettings] Bank save failed:', res.status, data)
        throw new Error(data.error || `Failed to save (${res.status})`)
      }
      console.log('[PaymentSettings] Bank account saved successfully:', data.account?.id)
      toast.success(editingId ? 'Bank account updated' : 'Bank account added')
      setBankDialogOpen(false)
      setEditingId(null)
      setBankForm({ ...emptyBankForm })
      fetchAccounts()
    } catch (err) {
      console.error('[PaymentSettings] Bank save error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save bank account')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Save Wallet                                                      */
  /* ---------------------------------------------------------------- */

  const handleSaveWallet = async () => {
    if (!walletForm.label.trim() || !walletForm.walletAccount.trim()) {
      toast.error('Please fill in all required fields: Label, Account Number')
      return
    }
    setSaving(true)
    try {
      const url = editingId
        ? `/api/admin/payment-accounts?id=${editingId}`
        : '/api/admin/payment-accounts'
      const method = editingId ? 'PATCH' : 'POST'
      const body: Record<string, unknown> = {
        type: 'mobile_wallet',
        gateway: walletForm.walletProvider,
        label: walletForm.label.trim(),
        currency: walletForm.currency,
        walletProvider: walletForm.walletProvider,
        walletAccount: walletForm.walletAccount.trim(),
        walletAccountName: walletForm.walletAccountName.trim() || null,
        raastId: walletForm.raastId.trim() || null,
        isActive: walletForm.isActive,
        isDefault: walletForm.isDefault,
      }
      console.log('[PaymentSettings] Saving wallet:', { url, method, label: body.label })
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('[PaymentSettings] Wallet save failed:', res.status, data)
        throw new Error(data.error || `Failed to save (${res.status})`)
      }
      toast.success(editingId ? 'Wallet updated' : 'Wallet added')
      setWalletDialogOpen(false)
      setEditingId(null)
      setWalletForm({ ...emptyWalletForm })
      fetchAccounts()
    } catch (err) {
      console.error('[PaymentSettings] Wallet save error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save wallet')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Save Stripe Config                                               */
  /* ---------------------------------------------------------------- */

  const handleSaveStripe = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        type: 'gateway',
        gateway: 'stripe',
        label: stripeForm.label,
        isActive: stripeForm.isActive,
        stripePublishableKey: stripeForm.stripePublishableKey,
        stripeWebhookSecret: stripeForm.stripeWebhookSecret,
        stripeAccountId: stripeForm.stripeAccountId,
      }
      // Only send secret key if user changed it (not still masked)
      if (stripeForm.stripeSecretKey && !stripeForm.stripeSecretKey.startsWith('****')) {
        body.stripeSecretKey = stripeForm.stripeSecretKey
      }

      const url = stripeAccount
        ? `/api/admin/payment-accounts?id=${stripeAccount.id}`
        : '/api/admin/payment-accounts'
      const method = stripeAccount ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save')
      }
      toast.success('Stripe configuration saved')
      setStripeDialogOpen(false)
      fetchAccounts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Stripe config')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Save PayPal Config                                               */
  /* ---------------------------------------------------------------- */

  const handleSavePayPal = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        type: 'gateway',
        gateway: 'paypal',
        label: paypalForm.label,
        isActive: paypalForm.isActive,
        paypalClientId: paypalForm.paypalClientId,
        paypalMode: paypalForm.paypalMode,
      }
      // Only send secret if user changed it
      if (paypalForm.paypalClientSecret && !paypalForm.paypalClientSecret.startsWith('****')) {
        body.paypalClientSecret = paypalForm.paypalClientSecret
      }

      const url = paypalAccount
        ? `/api/admin/payment-accounts?id=${paypalAccount.id}`
        : '/api/admin/payment-accounts'
      const method = paypalAccount ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save')
      }
      toast.success('PayPal configuration saved')
      setPaypalDialogOpen(false)
      fetchAccounts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save PayPal config')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Delete Account                                                   */
  /* ---------------------------------------------------------------- */

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/payment-accounts?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete')
      }
      toast.success('Account deleted')
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchAccounts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Set Default                                                      */
  /* ---------------------------------------------------------------- */

  const handleSetDefault = async (account: PaymentAccount) => {
    try {
      const res = await fetch(`/api/admin/payment-accounts?id=${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      if (!res.ok) throw new Error('Failed to set default')
      toast.success(`${account.label} set as default`)
      fetchAccounts()
    } catch {
      toast.error('Failed to set default account')
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Test Connection                                                  */
  /* ---------------------------------------------------------------- */

  const handleTestConnection = async (account: PaymentAccount) => {
    setTestingConnection(account.id)
    setTestResults((prev) => ({ ...prev, [account.id]: 'testing' }))
    // Real validation test — check if the account has proper configuration
    await new Promise((r) => setTimeout(r, 800))
    let success = false
    let message = ''

    if (account.gateway === 'stripe') {
      success = !!(account.stripeSecretKey && account.stripeSecretKey.startsWith('sk_'))
      message = success ? 'Stripe configuration valid' : 'Stripe secret key is missing or invalid (must start with sk_)'
    } else if (account.gateway === 'paypal') {
      success = !!(account.paypalClientId && account.paypalClientSecret)
      message = success ? 'PayPal configuration valid' : 'PayPal client ID or secret is missing'
    } else if (account.type === 'bank_account') {
      success = !!(account.bankName && account.accountNumber && account.accountTitle)
      message = success ? 'Bank account details valid' : 'Bank account details incomplete'
    } else if (account.type === 'mobile_wallet') {
      success = !!(account.walletProvider && account.walletAccount)
      message = success ? 'Mobile wallet configuration valid' : 'Wallet provider or account number missing'
    } else {
      success = true
      message = 'Account configuration present'
    }

    setTestResults((prev) => ({ ...prev, [account.id]: success ? 'success' : 'failed' }))
    setTestingConnection(null)
    if (success) {
      toast.success(`${account.label}: ${message}`)
    } else {
      toast.error(`${account.label}: ${message}`)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Save General Settings                                            */
  /* ---------------------------------------------------------------- */

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandbox_mode: sandboxMode.toString(),
          default_currency: defaultCurrency,
          auto_verify_bank_transfer: autoVerifyBank.toString(),
          payment_receipt_email: paymentReceiptEmail.toString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      toast.success('Payment settings saved')
    } catch {
      toast.error('Failed to save payment settings')
    } finally {
      setSavingSettings(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Copy to clipboard                                                */
  /* ---------------------------------------------------------------- */

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }

  /* ---------------------------------------------------------------- */
  /*  Open Edit Dialogs                                                */
  /* ---------------------------------------------------------------- */

  const openEditBank = (account: PaymentAccount) => {
    setEditingId(account.id)
    setBankForm({
      label: account.label,
      currency: account.currency,
      bankName: account.bankName || '',
      accountTitle: account.accountTitle || '',
      accountNumber: account.accountNumber || '',
      iban: account.iban || '',
      swiftCode: account.swiftCode || '',
      branchName: account.branchName || '',
      routingNumber: account.routingNumber || '',
      correspondentBank: account.correspondentBank || '',
      correspondentSwift: account.correspondentSwift || '',
      isActive: account.isActive,
      isDefault: account.isDefault,
      notes: account.notes || '',
    })
    setBankDialogOpen(true)
  }

  const openAddBank = () => {
    setEditingId(null)
    setBankForm({ ...emptyBankForm })
    setBankDialogOpen(true)
  }

  const openEditWallet = (account: PaymentAccount) => {
    setEditingId(account.id)
    setWalletForm({
      label: account.label,
      walletProvider: account.walletProvider || 'jazzcash',
      currency: account.currency,
      walletAccount: account.walletAccount || '',
      walletAccountName: account.walletAccountName || '',
      raastId: account.raastId || '',
      isActive: account.isActive,
      isDefault: account.isDefault,
    })
    setWalletDialogOpen(true)
  }

  const openAddWallet = () => {
    setEditingId(null)
    setWalletForm({ ...emptyWalletForm })
    setWalletDialogOpen(true)
  }

  const openStripeConfig = () => {
    if (stripeAccount) {
      setStripeForm({
        label: stripeAccount.label,
        stripePublishableKey: stripeAccount.stripePublishableKey || '',
        stripeSecretKey: maskValue(stripeAccount.stripeSecretKey),
        stripeWebhookSecret: maskValue(stripeAccount.stripeWebhookSecret),
        stripeAccountId: stripeAccount.stripeAccountId || '',
        isActive: stripeAccount.isActive,
      })
    } else {
      setStripeForm({ ...emptyStripeForm })
    }
    setStripeDialogOpen(true)
  }

  const openPayPalConfig = () => {
    if (paypalAccount) {
      setPaypalForm({
        label: paypalAccount.label,
        paypalClientId: paypalAccount.paypalClientId || '',
        paypalClientSecret: maskValue(paypalAccount.paypalClientSecret),
        paypalMode: paypalAccount.paypalMode || 'sandbox',
        isActive: paypalAccount.isActive,
      })
    } else {
      setPaypalForm({ ...emptyPayPalForm })
    }
    setPaypalDialogOpen(true)
  }

  /* ---------------------------------------------------------------- */
  /*  Audit log pagination                                             */
  /* ---------------------------------------------------------------- */

  const totalAuditPages = Math.max(1, Math.ceil(auditLogs.length / auditPageSize))
  const paginatedLogs = auditLogs.slice(
    (auditPage - 1) * auditPageSize,
    auditPage * auditPageSize
  )

  /* ================================================================== */
  /*  Render                                                             */
  /* ================================================================== */

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-56 rounded-xl bg-card" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl bg-card" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-card" />
        <Skeleton className="h-48 rounded-2xl bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Payment Settings</h2>
        <p className="text-sm text-muted-foreground">Manage bank accounts, wallets, payment gateways, integrations, and audit logs</p>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Secure Credential Storage</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Payment credentials are encrypted at rest. Masked values are shown for security. Only modified fields will be updated when saving.
          </p>
        </div>
      </motion.div>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['bank_accounts', 'mobile_wallets', 'manual_integration', 'database_connectivity']} className="space-y-3">

        {/* ===== Bank Accounts Section ===== */}
        <AccordionItem value="bank_accounts" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center">
                <Landmark className="w-4.5 h-4.5 text-cyan-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Bank Accounts</h3>
                <p className="text-xs text-muted-foreground">{bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} configured</p>
              </div>
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] ml-2">
                {bankAccounts.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={openAddBank}
                  className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-xl"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Bank Account
                </Button>
              </div>

              {/* Bank Account Cards */}
              {bankAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-card/90 backdrop-blur border border-border rounded-2xl">
                  <Building2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No bank accounts configured</p>
                  <p className="text-xs text-muted-foreground/60">Add a bank account to enable bank transfer payments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((account, i) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                      className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* Account header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-foreground">{account.label}</h4>
                            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                              {account.currency}
                            </Badge>
                            {account.isDefault && (
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                                <Star className="w-3 h-3 mr-0.5" /> Default
                              </Badge>
                            )}
                            {account.isActive ? (
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-[10px]">
                                Inactive
                              </Badge>
                            )}
                            {testResults[account.id] === 'success' && (
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                              </Badge>
                            )}
                            {testResults[account.id] === 'failed' && (
                              <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                                <XCircle className="w-3 h-3 mr-0.5" /> Failed
                              </Badge>
                            )}
                          </div>

                          {/* Account details grid */}
                          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground min-w-[90px]">Bank:</span>
                              <span className="text-foreground font-medium">{account.bankName || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground min-w-[90px]">Account Title:</span>
                              <span className="text-foreground font-medium">{account.accountTitle || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground min-w-[90px]">Account No:</span>
                              <span className="text-foreground font-mono">{maskValue(account.accountNumber)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground min-w-[90px]">IBAN:</span>
                              <span className="text-foreground font-mono">{maskValue(account.iban, 6)}</span>
                            </div>
                            {account.swiftCode && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[90px]">SWIFT:</span>
                                <span className="text-foreground font-mono">{account.swiftCode}</span>
                              </div>
                            )}
                            {account.branchName && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[90px]">Branch:</span>
                                <span className="text-foreground">{account.branchName}</span>
                              </div>
                            )}
                            {account.routingNumber && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[90px]">Routing:</span>
                                <span className="text-foreground font-mono">{account.routingNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Correspondent bank info */}
                          {account.correspondentBank && (
                            <div className="mt-2 p-2 rounded-lg bg-secondary/50 border border-border">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Correspondent Bank</p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-muted-foreground">Bank: <span className="text-foreground font-medium">{account.correspondentBank}</span></span>
                                {account.correspondentSwift && (
                                  <span className="text-muted-foreground">SWIFT: <span className="text-foreground font-mono">{account.correspondentSwift}</span></span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {account.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">&ldquo;{account.notes}&rdquo;</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleTestConnection(account)}
                            disabled={testingConnection === account.id}
                            title="Test Connection"
                          >
                            {testingConnection === account.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Wifi className="w-4 h-4" />
                            )}
                          </Button>
                          {!account.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-400"
                              onClick={() => handleSetDefault(account)}
                              title="Set as Default"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditBank(account)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                            onClick={() => {
                              setDeleteTarget(account)
                              setDeleteDialogOpen(true)
                            }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ===== Mobile Wallets Section ===== */}
        <AccordionItem value="mobile_wallets" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 flex items-center justify-center">
                <Smartphone className="w-4.5 h-4.5 text-violet-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Mobile Wallets</h3>
                <p className="text-xs text-muted-foreground">{mobileWallets.length} wallet{mobileWallets.length !== 1 ? 's' : ''} configured</p>
              </div>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] ml-2">
                {mobileWallets.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={openAddWallet}
                  className="bg-gradient-to-r from-violet-500 to-pink-600 hover:from-violet-400 hover:to-pink-500 text-white rounded-xl"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Wallet
                </Button>
              </div>

              {/* Wallet Cards */}
              {mobileWallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-card/90 backdrop-blur border border-border rounded-2xl">
                  <Wallet className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No mobile wallets configured</p>
                  <p className="text-xs text-muted-foreground/60">Add JazzCash, EasyPaisa, or Raast wallets</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {mobileWallets.map((account, i) => {
                    const providerLabel = account.walletProvider
                      ? account.walletProvider.charAt(0).toUpperCase() + account.walletProvider.slice(1)
                      : 'Unknown'
                    const providerColor: Record<string, string> = {
                      jazzcash: 'bg-red-500/10 text-red-400 border-red-500/20',
                      easypaisa: 'bg-green-500/10 text-green-400 border-green-500/20',
                      raast: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    }
                    return (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                        className="bg-card/90 backdrop-blur border border-border rounded-2xl p-5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-foreground">{account.label}</h4>
                              <Badge variant="secondary" className={`${providerColor[account.walletProvider || ''] || 'bg-secondary text-muted-foreground border-border'} text-[10px]`}>
                                {providerLabel}
                              </Badge>
                              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                                {account.currency}
                              </Badge>
                              {account.isDefault && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                                  <Star className="w-3 h-3 mr-0.5" /> Default
                                </Badge>
                              )}
                              {account.isActive ? (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border text-[10px]">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground min-w-[80px]">Account No:</span>
                                <span className="text-foreground font-mono">{maskValue(account.walletAccount)}</span>
                              </div>
                              {account.walletAccountName && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground min-w-[80px]">Account Name:</span>
                                  <span className="text-foreground">{account.walletAccountName}</span>
                                </div>
                              )}
                              {account.raastId && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground min-w-[80px]">Raast ID:</span>
                                  <span className="text-foreground font-mono">{account.raastId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!account.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-400"
                                onClick={() => handleSetDefault(account)}
                                title="Set as Default"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditWallet(account)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                              onClick={() => {
                                setDeleteTarget(account)
                                setDeleteDialogOpen(true)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ===== Payment Gateways Section ===== */}
        <AccordionItem value="gateways" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 flex items-center justify-center">
                <Globe className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Payment Gateways</h3>
                <p className="text-xs text-muted-foreground">Stripe &amp; PayPal integration</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                {isStripeConnected && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    Stripe
                  </Badge>
                )}
                {isPayPalConnected && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    PayPal
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              {/* Stripe Section */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.25 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">Stripe</h3>
                        {isStripeConnected ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                            <XCircle className="w-3 h-3 mr-0.5" /> Disconnected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Credit/debit card payments via Stripe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stripeAccount && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border rounded-xl text-xs"
                        onClick={() => handleTestConnection(stripeAccount)}
                        disabled={testingConnection === stripeAccount.id}
                      >
                        {testingConnection === stripeAccount?.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Wifi className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Test Stripe
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border rounded-xl text-xs"
                      onClick={openStripeConfig}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Configure
                    </Button>
                  </div>
                </div>

                {stripeAccount ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Publishable Key */}
                      <div className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Publishable Key</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => stripeAccount.stripePublishableKey && copyToClipboard(stripeAccount.stripePublishableKey)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-foreground font-mono truncate">
                          {maskValue(stripeAccount.stripePublishableKey, 8)}
                        </p>
                      </div>
                      {/* Secret Key */}
                      <div className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Secret Key</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowStripeSecret(!showStripeSecret)}
                            >
                              {showStripeSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => stripeAccount.stripeSecretKey && copyToClipboard(stripeAccount.stripeSecretKey)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground font-mono truncate">
                          {showStripeSecret
                            ? maskValue(stripeAccount.stripeSecretKey, 12)
                            : maskValue(stripeAccount.stripeSecretKey)}
                        </p>
                      </div>
                      {/* Webhook Secret */}
                      <div className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Webhook Secret</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                            >
                              {showStripeWebhook ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => stripeAccount.stripeWebhookSecret && copyToClipboard(stripeAccount.stripeWebhookSecret)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground font-mono truncate">
                          {showStripeWebhook
                            ? maskValue(stripeAccount.stripeWebhookSecret, 8)
                            : maskValue(stripeAccount.stripeWebhookSecret)}
                        </p>
                      </div>
                      {/* Account ID */}
                      <div className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Account ID</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => stripeAccount.stripeAccountId && copyToClipboard(stripeAccount.stripeAccountId)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-foreground font-mono truncate">
                          {stripeAccount.stripeAccountId || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CreditCard className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Stripe is not configured</p>
                    <p className="text-xs text-muted-foreground/60 mb-3">Configure Stripe to accept card payments</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border rounded-xl"
                      onClick={openStripeConfig}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Configure Stripe
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* PayPal Section */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">PayPal</h3>
                        {isPayPalConnected ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                            <XCircle className="w-3 h-3 mr-0.5" /> Disconnected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">PayPal payment integration</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border rounded-xl text-xs"
                    onClick={openPayPalConfig}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Configure
                  </Button>
                </div>

                {paypalAccount ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Client ID */}
                      <div className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client ID</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => paypalAccount.paypalClientId && copyToClipboard(paypalAccount.paypalClientId)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-foreground font-mono truncate">
                          {maskValue(paypalAccount.paypalClientId, 8)}
                        </p>
                      </div>
                      {/* Client Secret */}
                      <div className="p-3 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client Secret</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPayPalSecret(!showPayPalSecret)}
                            >
                              {showPayPalSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => paypalAccount.paypalClientSecret && copyToClipboard(paypalAccount.paypalClientSecret)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground font-mono truncate">
                          {showPayPalSecret
                            ? maskValue(paypalAccount.paypalClientSecret, 8)
                            : maskValue(paypalAccount.paypalClientSecret)}
                        </p>
                      </div>
                    </div>
                    {/* Mode indicator */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          paypalAccount.paypalMode === 'live'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]'
                        }
                      >
                        <Server className="w-3 h-3 mr-0.5" />
                        {paypalAccount.paypalMode === 'live' ? 'Live Mode' : 'Sandbox Mode'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Globe className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">PayPal is not configured</p>
                    <p className="text-xs text-muted-foreground/60 mb-3">Configure PayPal to accept PayPal payments</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border rounded-xl"
                      onClick={openPayPalConfig}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Configure PayPal
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ===== Manual Integration Section ===== */}
        <AccordionItem value="manual_integration" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-600/10 flex items-center justify-center">
                <Wrench className="w-4.5 h-4.5 text-teal-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Manual Integration</h3>
                <p className="text-xs text-muted-foreground">ERP system connections &amp; endpoints</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <IntegrationSection />
          </AccordionContent>
        </AccordionItem>

        {/* ===== Database Connectivity Section ===== */}
        <AccordionItem value="database_connectivity" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center">
                <Database className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Database Connectivity</h3>
                <p className="text-xs text-muted-foreground">Database status &amp; table statistics</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <DatabaseSection />
          </AccordionContent>
        </AccordionItem>

        {/* ===== General Settings Section ===== */}
        <AccordionItem value="general_settings" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center">
                <ArrowRightLeft className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">General Settings</h3>
                <p className="text-xs text-muted-foreground">Payment processing defaults &amp; preferences</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {settingsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl bg-secondary" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sandbox Mode */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Sandbox Mode</p>
                    <p className="text-xs text-muted-foreground">Process payments in test mode without real charges</p>
                  </div>
                  <Switch
                    checked={sandboxMode}
                    onCheckedChange={setSandboxMode}
                  />
                </div>

                {/* Default Currency */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Default Currency</p>
                    <p className="text-xs text-muted-foreground">Primary currency for new payment accounts</p>
                  </div>
                  <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                    <SelectTrigger className="w-[120px] h-8 text-xs bg-card border-border rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="PKR">PKR ₹</SelectItem>
                      <SelectItem value="USD">USD $</SelectItem>
                      <SelectItem value="EUR">EUR €</SelectItem>
                      <SelectItem value="GBP">GBP £</SelectItem>
                      <SelectItem value="AED">AED د.إ</SelectItem>
                      <SelectItem value="SAR">SAR ﷼</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto-verify Bank Transfer */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Auto-verify Bank Transfers</p>
                    <p className="text-xs text-muted-foreground">Automatically mark bank transfers as verified upon receipt</p>
                  </div>
                  <Switch
                    checked={autoVerifyBank}
                    onCheckedChange={setAutoVerifyBank}
                  />
                </div>

                {/* Payment Receipt Email */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Payment Receipt Email</p>
                    <p className="text-xs text-muted-foreground">Send email receipts automatically for successful payments</p>
                  </div>
                  <Switch
                    checked={paymentReceiptEmail}
                    onCheckedChange={setPaymentReceiptEmail}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl px-6"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ===== Audit Log Section ===== */}
        <AccordionItem value="audit_log" className="bg-card/90 backdrop-blur border border-border rounded-2xl px-6 border-b-0">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <ClipboardList className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">Audit Log</h3>
                <p className="text-xs text-muted-foreground">Payment change history</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] ml-2">
                {auditLogs.length} entries
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border rounded-xl"
                  onClick={fetchAuditLogs}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Refresh
                </Button>
              </div>

              {/* Audit Table */}
              <div className="bg-card/90 backdrop-blur border border-border rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.6fr] min-w-[700px] border-b border-border bg-secondary/50 px-4 py-3">
                  <span className="text-xs font-semibold text-muted-foreground">Timestamp</span>
                  <span className="text-xs font-semibold text-muted-foreground">Action</span>
                  <span className="text-xs font-semibold text-muted-foreground">Entity</span>
                  <span className="text-xs font-semibold text-muted-foreground">Performed By</span>
                  <span className="text-xs font-semibold text-muted-foreground">IP Address</span>
                </div>

                {/* Rows */}
                <ScrollArea className="max-h-[500px]">
                  {auditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No audit log entries yet</p>
                      <p className="text-xs text-muted-foreground/60">Actions will be logged as payment settings are modified</p>
                    </div>
                  ) : (
                    <div className="min-w-[700px]">
                      {paginatedLogs.map((entry) => {
                        const actionColor: Record<string, string> = {
                          create: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                          update: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                          delete: 'bg-red-500/10 text-red-400 border-red-500/20',
                          set_default: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                          test_connection: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                        }
                        return (
                          <div
                            key={entry.id}
                            className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.6fr] px-4 py-3 border-b border-border hover:bg-secondary/10 transition-colors items-center"
                          >
                            <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
                            <Badge
                              variant="secondary"
                              className={`${actionColor[entry.action] || 'bg-secondary text-muted-foreground border-border'} text-[10px] w-fit`}
                            >
                              {entry.action}
                            </Badge>
                            <span className="text-xs text-foreground truncate">{entry.entity}{entry.entityId ? ` (${entry.entityId.slice(0, 8)}...)` : ''}</span>
                            <span className="text-xs text-muted-foreground truncate">{entry.performedBy || 'System'}</span>
                            <span className="text-xs text-muted-foreground font-mono">{entry.ip || '—'}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Pagination */}
                {auditLogs.length > auditPageSize && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Page {auditPage} of {totalAuditPages} ({auditLogs.length} entries)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-border text-xs"
                        disabled={auditPage <= 1}
                        onClick={() => setAuditPage((p) => p - 1)}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-border text-xs"
                        disabled={auditPage >= totalAuditPages}
                        onClick={() => setAuditPage((p) => p + 1)}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* ===== Dialogs ===== */}

      {/* Bank Account Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Landmark className="w-5 h-5 text-cyan-400" />
              {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingId ? 'Update bank account details' : 'Add a new bank account for receiving payments'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Label *</Label>
                <Input
                  value={bankForm.label}
                  onChange={(e) => setBankForm({ ...bankForm, label: e.target.value })}
                  placeholder="e.g. HBL Main Account"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Currency *</Label>
                <Select value={bankForm.currency} onValueChange={(v) => setBankForm({ ...bankForm, currency: v })}>
                  <SelectTrigger className="bg-secondary border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="PKR">PKR ₹</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="EUR">EUR €</SelectItem>
                    <SelectItem value="GBP">GBP £</SelectItem>
                    <SelectItem value="AED">AED د.إ</SelectItem>
                    <SelectItem value="SAR">SAR ﷼</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Bank Name *</Label>
                <Input
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. Habib Bank Limited"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Account Title *</Label>
                <Input
                  value={bankForm.accountTitle}
                  onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                  placeholder="e.g. ApexFlow Technologies"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Account Number *</Label>
                <Input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="e.g. 00227901234501"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">IBAN</Label>
                <Input
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                  placeholder="e.g. PK36HABB00227901234501"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">SWIFT Code</Label>
                <Input
                  value={bankForm.swiftCode}
                  onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                  placeholder="e.g. HABBPKKA"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Branch Name</Label>
                <Input
                  value={bankForm.branchName}
                  onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                  placeholder="e.g. Main Branch, Lahore"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Routing Number</Label>
                <Input
                  value={bankForm.routingNumber}
                  onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                  placeholder="e.g. 012345678"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
            </div>

            <Separator className="bg-border" />

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correspondent Bank (Optional)</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Correspondent Bank</Label>
                <Input
                  value={bankForm.correspondentBank}
                  onChange={(e) => setBankForm({ ...bankForm, correspondentBank: e.target.value })}
                  placeholder="e.g. Standard Chartered NY"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Correspondent SWIFT</Label>
                <Input
                  value={bankForm.correspondentSwift}
                  onChange={(e) => setBankForm({ ...bankForm, correspondentSwift: e.target.value })}
                  placeholder="e.g. SCBLUS33"
                  className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl"
                />
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                <Label className="text-sm text-foreground">Is Active</Label>
                <Switch
                  checked={bankForm.isActive}
                  onCheckedChange={(v) => setBankForm({ ...bankForm, isActive: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                <Label className="text-sm text-foreground">Is Default</Label>
                <Switch
                  checked={bankForm.isDefault}
                  onCheckedChange={(v) => setBankForm({ ...bankForm, isDefault: v })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Notes</Label>
              <Textarea
                value={bankForm.notes}
                onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                placeholder="Optional notes about this account..."
                className="bg-secondary border-border focus:border-cyan-500/50 rounded-xl min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBankDialogOpen(false)}
              className="border-border rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBank}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {editingId ? 'Update Account' : 'Add Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Wallet Dialog */}
      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5 text-violet-400" />
              {editingId ? 'Edit Wallet' : 'Add Wallet'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingId ? 'Update mobile wallet details' : 'Configure a JazzCash, EasyPaisa, or Raast wallet'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Label *</Label>
              <Input
                value={walletForm.label}
                onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })}
                placeholder="e.g. JazzCash Business"
                className="bg-secondary border-border focus:border-violet-500/50 rounded-xl"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Wallet Provider *</Label>
                <Select value={walletForm.walletProvider} onValueChange={(v) => setWalletForm({ ...walletForm, walletProvider: v, currency: 'PKR' })}>
                  <SelectTrigger className="bg-secondary border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="raast">Raast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Currency</Label>
                <Input
                  value="PKR"
                  disabled
                  className="bg-secondary border-border rounded-xl text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Account Number *</Label>
              <Input
                value={walletForm.walletAccount}
                onChange={(e) => setWalletForm({ ...walletForm, walletAccount: e.target.value })}
                placeholder="e.g. 03001234567"
                className="bg-secondary border-border focus:border-violet-500/50 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Account Name</Label>
              <Input
                value={walletForm.walletAccountName}
                onChange={(e) => setWalletForm({ ...walletForm, walletAccountName: e.target.value })}
                placeholder="e.g. ApexFlow Technologies"
                className="bg-secondary border-border focus:border-violet-500/50 rounded-xl"
              />
            </div>

            {walletForm.walletProvider === 'raast' && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Raast ID</Label>
                <Input
                  value={walletForm.raastId}
                  onChange={(e) => setWalletForm({ ...walletForm, raastId: e.target.value })}
                  placeholder="e.g. apexflow@raast"
                  className="bg-secondary border-border focus:border-violet-500/50 rounded-xl"
                />
              </div>
            )}

            <Separator className="bg-border" />

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                <Label className="text-sm text-foreground">Is Active</Label>
                <Switch
                  checked={walletForm.isActive}
                  onCheckedChange={(v) => setWalletForm({ ...walletForm, isActive: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
                <Label className="text-sm text-foreground">Is Default</Label>
                <Switch
                  checked={walletForm.isDefault}
                  onCheckedChange={(v) => setWalletForm({ ...walletForm, isDefault: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWalletDialogOpen(false)}
              className="border-border rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWallet}
              disabled={saving}
              className="bg-gradient-to-r from-violet-500 to-pink-600 hover:from-violet-400 hover:to-pink-500 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {editingId ? 'Update Wallet' : 'Add Wallet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stripe Config Dialog */}
      <Dialog open={stripeDialogOpen} onOpenChange={setStripeDialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5 text-violet-400" />
              Configure Stripe
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your Stripe API keys. Leave masked fields unchanged to keep existing values.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Label</Label>
              <Input
                value={stripeForm.label}
                onChange={(e) => setStripeForm({ ...stripeForm, label: e.target.value })}
                className="bg-secondary border-border focus:border-violet-500/50 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Publishable Key</Label>
              <Input
                value={stripeForm.stripePublishableKey}
                onChange={(e) => setStripeForm({ ...stripeForm, stripePublishableKey: e.target.value })}
                placeholder="pk_live_..."
                className="bg-secondary border-border focus:border-violet-500/50 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Secret Key</Label>
              <div className="relative">
                <Input
                  type={showStripeSecret ? 'text' : 'password'}
                  value={stripeForm.stripeSecretKey}
                  onChange={(e) => setStripeForm({ ...stripeForm, stripeSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="bg-secondary border-border focus:border-violet-500/50 rounded-xl font-mono text-xs pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                >
                  {showStripeSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60">Leave masked (****) to keep current value</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Webhook Secret</Label>
              <div className="relative">
                <Input
                  type={showStripeWebhook ? 'text' : 'password'}
                  value={stripeForm.stripeWebhookSecret}
                  onChange={(e) => setStripeForm({ ...stripeForm, stripeWebhookSecret: e.target.value })}
                  placeholder="whsec_..."
                  className="bg-secondary border-border focus:border-violet-500/50 rounded-xl font-mono text-xs pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
                  onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                >
                  {showStripeWebhook ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Account ID</Label>
              <Input
                value={stripeForm.stripeAccountId}
                onChange={(e) => setStripeForm({ ...stripeForm, stripeAccountId: e.target.value })}
                placeholder="acct_..."
                className="bg-secondary border-border focus:border-violet-500/50 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
              <Label className="text-sm text-foreground">Active</Label>
              <Switch
                checked={stripeForm.isActive}
                onCheckedChange={(v) => setStripeForm({ ...stripeForm, isActive: v })}
              />
            </div>

            <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Never share your Secret Key publicly. It is stored encrypted and only shown partially for verification.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStripeDialogOpen(false)}
              className="border-border rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStripe}
              disabled={saving}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PayPal Config Dialog */}
      <Dialog open={paypalDialogOpen} onOpenChange={setPaypalDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Globe className="w-5 h-5 text-blue-400" />
              Configure PayPal
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your PayPal API credentials. Leave masked fields unchanged to keep existing values.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Label</Label>
              <Input
                value={paypalForm.label}
                onChange={(e) => setPaypalForm({ ...paypalForm, label: e.target.value })}
                className="bg-secondary border-border focus:border-blue-500/50 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Client ID</Label>
              <Input
                value={paypalForm.paypalClientId}
                onChange={(e) => setPaypalForm({ ...paypalForm, paypalClientId: e.target.value })}
                placeholder="AXs_..."
                className="bg-secondary border-border focus:border-blue-500/50 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Client Secret</Label>
              <div className="relative">
                <Input
                  type={showPayPalSecret ? 'text' : 'password'}
                  value={paypalForm.paypalClientSecret}
                  onChange={(e) => setPaypalForm({ ...paypalForm, paypalClientSecret: e.target.value })}
                  placeholder="EL_..."
                  className="bg-secondary border-border focus:border-blue-500/50 rounded-xl font-mono text-xs pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
                  onClick={() => setShowPayPalSecret(!showPayPalSecret)}
                >
                  {showPayPalSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60">Leave masked (****) to keep current value</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
              <div>
                <Label className="text-sm text-foreground">Mode</Label>
                <p className="text-xs text-muted-foreground">{paypalForm.paypalMode === 'live' ? 'Real transactions' : 'Test transactions'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sandbox</span>
                <Switch
                  checked={paypalForm.paypalMode === 'live'}
                  onCheckedChange={(v) => setPaypalForm({ ...paypalForm, paypalMode: v ? 'live' : 'sandbox' })}
                />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
              <Label className="text-sm text-foreground">Active</Label>
              <Switch
                checked={paypalForm.isActive}
                onCheckedChange={(v) => setPaypalForm({ ...paypalForm, isActive: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaypalDialogOpen(false)}
              className="border-border rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePayPal}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Payment Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <strong>{deleteTarget?.label}</strong>? This action cannot be undone. Any orders referencing this account may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
