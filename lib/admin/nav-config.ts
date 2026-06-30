// ApexFlow Admin Panel — Navigation Configuration
import type { NavDepartment, NavItem } from '@/types/admin'

/**
 * Full sidebar navigation structure for the ApexFlow enterprise admin panel.
 * Each department group contains related nav items with icon references,
 * paths, and department grouping for collapsible sidebar sections.
 */

export const NAV_CONFIG: NavDepartment[] = [
  // ─── Overview ──────────────────────────────────────────────
  {
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/dashboard',
        department: 'overview',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'BarChart3',
        path: '/analytics',
        department: 'overview',
      },
      {
        id: 'activity-feed',
        label: 'Activity Feed',
        icon: 'Activity',
        path: '/activity',
        department: 'overview',
      },
    ],
  },

  // ─── CRM & Sales ──────────────────────────────────────────
  {
    id: 'crm',
    label: 'CRM & Sales',
    icon: 'Users',
    items: [
      {
        id: 'clients',
        label: 'Clients',
        icon: 'Building2',
        path: '/clients',
        department: 'crm',
      },
      {
        id: 'client-contacts',
        label: 'Contacts',
        icon: 'Contact',
        path: '/contacts',
        department: 'crm',
      },
      {
        id: 'deals',
        label: 'Deals Pipeline',
        icon: 'Handshake',
        path: '/deals',
        department: 'crm',
      },
      {
        id: 'communications',
        label: 'Communications',
        icon: 'MessageSquare',
        path: '/communications',
        department: 'crm',
      },
    ],
  },

  // ─── ERP Management ───────────────────────────────────────
  {
    id: 'erp',
    label: 'ERP Management',
    icon: 'Database',
    items: [
      {
        id: 'erp-systems',
        label: 'ERP Systems',
        icon: 'Server',
        path: '/erp-systems',
        department: 'erp',
      },
      {
        id: 'erp-modules',
        label: 'Modules',
        icon: 'Puzzle',
        path: '/erp-modules',
        department: 'erp',
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: 'CreditCard',
        path: '/subscriptions',
        department: 'erp',
      },
      {
        id: 'licenses',
        label: 'Licenses',
        icon: 'Key',
        path: '/licenses',
        department: 'erp',
      },
    ],
  },

  // ─── Billing & Finance ────────────────────────────────────
  {
    id: 'billing',
    label: 'Billing & Finance',
    icon: 'Receipt',
    items: [
      {
        id: 'finance-overview',
        label: 'Finance Overview',
        icon: 'LayoutDashboard',
        path: '/finance',
        department: 'billing',
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: 'Wallet',
        path: '/finance/payments',
        department: 'billing',
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: 'FileText',
        path: '/finance/invoices',
        department: 'billing',
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: 'CreditCard',
        path: '/finance/subscriptions',
        department: 'billing',
      },
      {
        id: 'refunds',
        label: 'Refunds',
        icon: 'RotateCcw',
        path: '/finance/refunds',
        department: 'billing',
      },
      {
        id: 'gateways',
        label: 'Payment Gateways',
        icon: 'Landmark',
        path: '/finance/gateways',
        department: 'billing',
      },
    ],
  },

  // ─── Marketing ────────────────────────────────────────────
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Megaphone',
    items: [
      {
        id: 'marketing-hub',
        label: 'Marketing Hub',
        icon: 'LayoutDashboard',
        path: '/marketing',
        department: 'marketing',
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: 'Target',
        path: '/marketing/campaigns',
        department: 'marketing',
      },
      {
        id: 'social',
        label: 'Social Media',
        icon: 'Share2',
        path: '/marketing/social',
        department: 'marketing',
      },
      {
        id: 'content',
        label: 'Content Library',
        icon: 'FileEdit',
        path: '/marketing/content',
        department: 'marketing',
      },
      {
        id: 'marketing-analytics',
        label: 'Analytics',
        icon: 'BarChart3',
        path: '/marketing/analytics',
        department: 'marketing',
      },
    ],
  },

  // ─── Communications ───────────────────────────────────────
  {
    id: 'communications-hub',
    label: 'Communications',
    icon: 'Mail',
    items: [
      {
        id: 'communications-overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        path: '/communications',
        department: 'communications-hub',
      },
      {
        id: 'email',
        label: 'Email',
        icon: 'Mail',
        path: '/communications/email',
        department: 'communications-hub',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: 'MessageCircle',
        path: '/communications/whatsapp',
        department: 'communications-hub',
      },
      {
        id: 'sms',
        label: 'SMS',
        icon: 'Smartphone',
        path: '/communications/sms',
        department: 'communications-hub',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'Bell',
        path: '/communications/notifications',
        department: 'communications-hub',
      },
      {
        id: 'support-tickets',
        label: 'Support Tickets',
        icon: 'Ticket',
        path: '/communications/tickets',
        department: 'communications-hub',
      },
    ],
  },

  // ─── Reports ──────────────────────────────────────────────
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: 'PieChart',
    items: [
      {
        id: 'reports',
        label: 'Report Library',
        icon: 'PieChart',
        path: '/reports',
        department: 'reports',
      },
      {
        id: 'financial-reports',
        label: 'Financial Reports',
        icon: 'TrendingUp',
        path: '/reports?type=financial',
        department: 'reports',
      },
      {
        id: 'sales-reports',
        label: 'Sales Reports',
        icon: 'BarChart3',
        path: '/reports?type=sales',
        department: 'reports',
      },
    ],
  },

  // ─── Integrations ─────────────────────────────────────────
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'Plug',
    items: [
      {
        id: 'sync-connectors',
        label: 'Sync Connectors',
        icon: 'RefreshCw',
        path: '/sync-connectors',
        department: 'integrations',
      },
      {
        id: 'sync-events',
        label: 'Sync Events',
        icon: 'Zap',
        path: '/sync-events',
        department: 'integrations',
      },
    ],
  },

  // ─── System Admin ──────────────────────────────────────────
  {
    id: 'admin',
    label: 'System Admin',
    icon: 'Shield',
    items: [
      {
        id: 'system-overview',
        label: 'System Overview',
        icon: 'Activity',
        path: '/system',
        department: 'admin',
      },
      {
        id: 'users',
        label: 'Users',
        icon: 'Users',
        path: '/system/users',
        department: 'admin',
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        icon: 'Shield',
        path: '/system/roles',
        department: 'admin',
      },
      {
        id: 'audit-log',
        label: 'Audit Log',
        icon: 'ScrollText',
        path: '/system/audit',
        department: 'admin',
      },
      {
        id: 'devices',
        label: 'Devices',
        icon: 'Monitor',
        path: '/system/devices',
        department: 'admin',
      },
      {
        id: 'system-settings',
        label: 'Settings',
        icon: 'Settings',
        path: '/system/settings',
        department: 'admin',
      },
    ],
  },
]

/**
 * Flat list of all nav items for quick lookups
 */
export const ALL_NAV_ITEMS: NavItem[] = NAV_CONFIG.flatMap((dept) => dept.items)

/**
 * Lookup map: nav item id → nav item
 */
export const NAV_ITEM_MAP: Record<string, NavItem> = Object.fromEntries(
  ALL_NAV_ITEMS.map((item) => [item.id, item])
)

/**
 * Lookup map: path → nav item
 */
export const NAV_PATH_MAP: Record<string, NavItem> = Object.fromEntries(
  ALL_NAV_ITEMS.map((item) => [item.path, item])
)

/**
 * Department IDs list
 */
export const DEPARTMENT_IDS: string[] = NAV_CONFIG.map((dept) => dept.id)
