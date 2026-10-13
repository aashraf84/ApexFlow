import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

// Single catch-all API route handler for all admin CRUD operations
// This reduces the number of compiled route files to save memory

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const segments = path || []
  const resource = segments[0]
  const id = segments[1] || null
  const sub = segments[2] || null

  try {
    switch (resource) {
      case 'clients': {
        if (id && sub === 'contacts') {
          const contacts = await db.clientContact.findMany({ where: { clientId: id }, orderBy: { isPrimary: 'desc' } })
          return NextResponse.json({ data: contacts })
        }
        if (id && sub === 'activities') {
          const activities = await db.clientActivity.findMany({ where: { clientId: id }, orderBy: { createdAt: 'desc' } })
          return NextResponse.json({ data: activities })
        }
        if (id) {
          const client = await db.client.findUnique({ where: { id }, include: { contacts: true, deals: { include: { client: { select: { name: true, company: true } } } }, _count: { select: { deals: true, invoices: true, payments: true } } } })
          if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: client })
        }
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
        const where: Record<string, unknown> = {}
        if (status) where.status = status
        if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { company: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]
        const [clients, total] = await Promise.all([db.client.findMany({ where, include: { _count: { select: { deals: true, invoices: true, payments: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), db.client.count({ where })])
        return NextResponse.json({ data: clients, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
      }

      case 'deals': {
        if (id && sub === 'activities') {
          const activities = await db.dealActivity.findMany({ where: { dealId: id }, orderBy: { createdAt: 'desc' } })
          return NextResponse.json({ data: activities })
        }
        if (id) {
          const deal = await db.deal.findUnique({ where: { id }, include: { client: true, activities: { orderBy: { createdAt: 'desc' } } } })
          if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: deal })
        }
        const { searchParams } = new URL(request.url)
        const stage = searchParams.get('stage') || ''
        const search = searchParams.get('search') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
        const where: Record<string, unknown> = {}
        if (stage) where.stage = stage
        if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { client: { name: { contains: search, mode: 'insensitive' } } }]
        const [deals, total] = await Promise.all([db.deal.findMany({ where, include: { client: { select: { id: true, name: true, company: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), db.deal.count({ where })])
        return NextResponse.json({ data: deals, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
      }

      case 'payments': {
        if (id) {
          const payment = await db.payment.findUnique({ where: { id }, include: { client: true, invoice: true } })
          if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: payment })
        }
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
        const where: Record<string, unknown> = {}
        if (status) where.status = status
        const [payments, total] = await Promise.all([db.payment.findMany({ where, include: { client: { select: { id: true, name: true, company: true } }, invoice: { select: { id: true, number: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), db.payment.count({ where })])
        return NextResponse.json({ data: payments, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
      }

      case 'invoices': {
        if (id) {
          const invoice = await db.invoice.findUnique({ where: { id }, include: { client: true, payments: true } })
          if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: invoice })
        }
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
        const where: Record<string, unknown> = {}
        if (status) where.status = status
        const [invoices, total] = await Promise.all([db.invoice.findMany({ where, include: { client: { select: { id: true, name: true, company: true } }, payments: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), db.invoice.count({ where })])
        return NextResponse.json({ data: invoices, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
      }

      case 'subscriptions': {
        if (id) {
          const sub = await db.subscription.findUnique({ where: { id }, include: { client: true, package: true } })
          if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: sub })
        }
        const [subscriptions, total] = await Promise.all([db.subscription.findMany({ include: { client: { select: { id: true, name: true } }, package: true }, orderBy: { createdAt: 'desc' } }), db.subscription.count()])
        return NextResponse.json({ data: subscriptions, total, page: 1, pageSize: 100, totalPages: 1 })
      }

      case 'packages': {
        if (id) {
          const pkg = await db.package.findUnique({ where: { id }, include: { _count: { select: { subscriptions: true } } } })
          if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: pkg })
        }
        const packages = await db.package.findMany({ include: { _count: { select: { subscriptions: true } } }, orderBy: { price: 'asc' } })
        return NextResponse.json({ data: packages })
      }

      case 'tickets': {
        if (id && sub === 'responses') {
          const responses = await db.ticketResponse.findMany({ where: { ticketId: id }, orderBy: { createdAt: 'asc' } })
          return NextResponse.json({ data: responses })
        }
        if (id) {
          const ticket = await db.supportTicket.findUnique({ where: { id }, include: { responses: { orderBy: { createdAt: 'asc' } }, client: true } })
          if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: ticket })
        }
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
        const where: Record<string, unknown> = {}
        if (status) where.status = status
        const [tickets, total] = await Promise.all([db.supportTicket.findMany({ where, include: { client: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), db.supportTicket.count({ where })])
        return NextResponse.json({ data: tickets, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
      }

      case 'email-templates': {
        if (id) {
          const template = await db.emailTemplate.findUnique({ where: { id } })
          if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: template })
        }
        const templates = await db.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } })
        return NextResponse.json({ data: templates })
      }

      case 'email-logs': {
        const logs = await db.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
        return NextResponse.json({ data: logs })
      }

      case 'sms-config': {
        const config = await db.smsConfig.findFirst()
        return NextResponse.json({ data: config })
      }

      case 'sms-logs': {
        const logs = await db.smsLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
        return NextResponse.json({ data: logs })
      }

      case 'campaigns': {
        if (id) {
          const campaign = await db.campaign.findUnique({ where: { id } })
          if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: campaign })
        }
        const campaigns = await db.campaign.findMany({ orderBy: { createdAt: 'desc' } })
        return NextResponse.json({ data: campaigns })
      }

      case 'social-posts': {
        if (id) {
          const post = await db.socialPost.findUnique({ where: { id } })
          if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: post })
        }
        const posts = await db.socialPost.findMany({ orderBy: { createdAt: 'desc' } })
        return NextResponse.json({ data: posts })
      }

      case 'social-accounts': {
        if (id) {
          const account = await db.socialAccount.findUnique({ where: { id } })
          if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: account })
        }
        const accounts = await db.socialAccount.findMany({ orderBy: { createdAt: 'desc' } })
        return NextResponse.json({ data: accounts })
      }

      case 'dashboard': {
        const [totalClients, activeDeals, revenueResult, pendingInvoices, openTickets, activeSubs] = await Promise.all([
          db.client.count(),
          db.deal.count({ where: { stage: { notIn: ['closed_won', 'closed_lost'] } } }),
          db.payment.findMany({ where: { status: 'completed' }, select: { amount: true, createdAt: true } }),
          db.invoice.count({ where: { status: { in: ['draft', 'sent', 'overdue'] } } }),
          db.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
          db.subscription.count({ where: { status: 'active' } }),
        ])
        const totalRevenue = revenueResult.reduce((sum, p) => sum + p.amount, 0)
        const recentClients = await db.client.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
        const recentDeals = await db.deal.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: { select: { name: true, company: true } } } })
        const recentPayments = await db.payment.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: { select: { name: true, company: true } } } })
        const dealsByStage = await db.deal.groupBy({ by: ['stage'], _count: { id: true }, _sum: { value: true } })
        return NextResponse.json({ data: { totalClients, activeDeals, totalRevenue, pendingInvoices, openTickets, activeSubscriptions: activeSubs, revenueGrowth: 0, clientGrowth: 0, recentClients, recentDeals, recentPayments, revenueByMonth: [], dealsByStage: dealsByStage.map(d => ({ stage: d.stage, count: d._count.id, value: d._sum.value || 0 })) } })
      }

      case 'users': {
        const users = await db.adminUser.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
        return NextResponse.json({ data: users })
      }

      case 'roles': {
        const roles = await db.adminRole.findMany({ orderBy: { name: 'asc' } })
        return NextResponse.json({ data: roles })
      }

      case 'audit': {
        const logs = await db.adminAuditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 50 })
        return NextResponse.json({ data: logs })
      }

      case 'settings': {
        const settings = await db.siteSetting.findMany({ orderBy: { group: 'asc' } })
        return NextResponse.json({ data: settings })
      }

      case 'reports': {
        if (id) {
          const report = await db.savedReport.findUnique({ where: { id } })
          if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
          return NextResponse.json({ data: report })
        }
        const reports = await db.savedReport.findMany({ orderBy: { generatedAt: 'desc' } })
        return NextResponse.json({ data: reports })
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })
    }
  } catch (error) {
    console.error('API GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const segments = path || []
  const resource = segments[0]
  const id = segments[1] || null
  const sub = segments[2] || null

  try {
    const body = await request.json()

    switch (resource) {
      case 'clients': {
        if (id && sub === 'contacts') {
          const contact = await db.clientContact.create({ data: { clientId: id, name: body.name, email: body.email || null, phone: body.phone || null, role: body.role || null, isPrimary: body.isPrimary || false } })
          return NextResponse.json({ data: contact }, { status: 201 })
        }
        if (id && sub === 'activities') {
          const activity = await db.clientActivity.create({ data: { clientId: id, type: body.type || 'note', subject: body.subject || '', notes: body.notes || null } })
          return NextResponse.json({ data: activity }, { status: 201 })
        }
        const client = await db.client.create({ data: { name: body.name, email: body.email || null, phone: body.phone || null, company: body.company || null, address: body.address || null, city: body.city || null, state: body.state || null, country: body.country || null, zipCode: body.zipCode || null, website: body.website || null, industry: body.industry || null, status: body.status || 'active', notes: body.notes || null } })
        return NextResponse.json({ data: client }, { status: 201 })
      }

      case 'deals': {
        if (id && sub === 'activities') {
          const activity = await db.dealActivity.create({ data: { dealId: id, type: body.type || 'note', content: body.content || '' } })
          return NextResponse.json({ data: activity }, { status: 201 })
        }
        const deal = await db.deal.create({ data: { title: body.title, clientId: body.clientId || null, value: body.value || 0, stage: body.stage || 'lead', probability: body.probability || 0, source: body.source || null, expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null, notes: body.notes || null } })
        await db.dealActivity.create({ data: { dealId: deal.id, type: 'note', content: `Deal created in stage: ${deal.stage}` } })
        return NextResponse.json({ data: deal }, { status: 201 })
      }

      case 'payments': {
        const payment = await db.payment.create({ data: { clientId: body.clientId, amount: parseFloat(body.amount), invoiceId: body.invoiceId || null, method: body.method || 'bank_transfer', status: body.status || 'pending', transactionId: body.transactionId || null, notes: body.notes || null } })
        return NextResponse.json({ data: payment }, { status: 201 })
      }

      case 'invoices': {
        const lastInvoice = await db.invoice.findFirst({ orderBy: { createdAt: 'desc' }, select: { number: true } })
        const nextNum = lastInvoice ? parseInt(lastInvoice.number.replace('INV-', '')) + 1 : 1
        const number = `INV-${String(nextNum).padStart(4, '0')}`
        const amount = parseFloat(body.amount)
        const tax = body.tax ? parseFloat(body.tax) : 0
        const invoice = await db.invoice.create({ data: { number, clientId: body.clientId, amount, tax, total: amount + tax, status: body.status || 'draft', dueDate: new Date(body.dueDate), items: body.items ? JSON.stringify(body.items) : '[]', notes: body.notes || null } })
        return NextResponse.json({ data: invoice }, { status: 201 })
      }

      case 'subscriptions': {
        const subscription = await db.subscription.create({ data: { clientId: body.clientId, packageId: body.packageId, status: body.status || 'active', startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null } })
        return NextResponse.json({ data: subscription }, { status: 201 })
      }

      case 'packages': {
        const pkg = await db.package.create({ data: { name: body.name, description: body.description || null, price: parseFloat(body.price), billingCycle: body.billingCycle || 'monthly', features: body.features ? JSON.stringify(body.features) : '[]', isActive: body.isActive !== undefined ? body.isActive : true } })
        return NextResponse.json({ data: pkg }, { status: 201 })
      }

      case 'tickets': {
        if (id && sub === 'responses') {
          const response = await db.ticketResponse.create({ data: { ticketId: id, author: body.author || 'admin', message: body.message } })
          if (body.author === 'admin') {
            const ticket = await db.supportTicket.findUnique({ where: { id } })
            if (ticket?.status === 'open') {
              await db.supportTicket.update({ where: { id }, data: { status: 'in_progress' } })
            }
          }
          return NextResponse.json({ data: response }, { status: 201 })
        }
        const ticket = await db.supportTicket.create({ data: { subject: body.subject, name: body.name, email: body.email, clientId: body.clientId || null, category: body.category || 'general', priority: body.priority || 'medium', message: body.message, status: 'open' } })
        return NextResponse.json({ data: ticket }, { status: 201 })
      }

      case 'email-templates': {
        const template = await db.emailTemplate.create({ data: { name: body.name, subject: body.subject, body: body.body, category: body.category || 'general' } })
        return NextResponse.json({ data: template }, { status: 201 })
      }

      case 'sms-config': {
        const existing = await db.smsConfig.findFirst()
        const config = existing
          ? await db.smsConfig.update({ where: { id: existing.id }, data: { provider: body.provider, apiKey: body.apiKey, apiSecret: body.apiSecret || null, fromNumber: body.fromNumber, isActive: body.isActive !== undefined ? body.isActive : true } })
          : await db.smsConfig.create({ data: { provider: body.provider, apiKey: body.apiKey, apiSecret: body.apiSecret || null, fromNumber: body.fromNumber } })
        return NextResponse.json({ data: config }, { status: existing ? 200 : 201 })
      }

      case 'campaigns': {
        const campaign = await db.campaign.create({ data: { name: body.name, type: body.type || 'email', status: body.status || 'draft', subject: body.subject || null, content: body.content, targetAudience: body.targetAudience || null, scheduleAt: body.scheduleAt ? new Date(body.scheduleAt) : null, stats: '{}' } })
        return NextResponse.json({ data: campaign }, { status: 201 })
      }

      case 'social-posts': {
        const post = await db.socialPost.create({ data: { platform: body.platform, content: body.content, mediaUrl: body.mediaUrl || null, status: body.status || 'draft', scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null, stats: '{}' } })
        return NextResponse.json({ data: post }, { status: 201 })
      }

      case 'social-accounts': {
        const account = await db.socialAccount.create({ data: { platform: body.platform, accountName: body.accountName, accountId: body.accountId, token: body.token, isActive: true } })
        return NextResponse.json({ data: account }, { status: 201 })
      }

      case 'users': {
        const hashedPassword = await hash(body.password, 12)
        const user = await db.adminUser.create({ data: { name: body.name, email: body.email, password: hashedPassword, role: body.role || 'admin', isActive: true } })
        return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } }, { status: 201 })
      }

      case 'roles': {
        const role = await db.adminRole.create({ data: { name: body.name, description: body.description || null, permissions: typeof body.permissions === 'string' ? body.permissions : JSON.stringify(body.permissions || []) } })
        return NextResponse.json({ data: role }, { status: 201 })
      }

      case 'settings': {
        if (Array.isArray(body.settings)) {
          for (const s of body.settings) {
            await db.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value, group: s.group || 'general' } })
          }
          return NextResponse.json({ data: { updated: body.settings.length } })
        }
        return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
      }

      case 'reports': {
        const type = body.type
        const dateRange = body.dateRange || 'last_30_days'
        let reportData: Record<string, unknown> = {}
        const now = new Date()
        const daysMap: Record<string, number> = { last_7_days: 7, last_30_days: 30, last_3_months: 90, last_6_months: 180, last_year: 365 }
        const days = daysMap[dateRange] || 30
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        if (type === 'revenue') {
          const payments = await db.payment.findMany({ where: { status: 'completed', createdAt: { gte: startDate } }, include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
          reportData = { totalRevenue: payments.reduce((s, p) => s + p.amount, 0), payments: payments.map(p => ({ id: p.id, amount: p.amount, client: p.client?.name, date: p.createdAt })) }
        } else if (type === 'clients') {
          const clients = await db.client.findMany({ where: { createdAt: { gte: startDate } }, include: { _count: { select: { deals: true, invoices: true } } }, orderBy: { createdAt: 'desc' } })
          reportData = { totalClients: clients.length, clients: clients.map(c => ({ id: c.id, name: c.name, company: c.company, status: c.status, deals: c._count.deals, invoices: c._count.invoices })) }
        } else if (type === 'deals') {
          const deals = await db.deal.findMany({ where: { createdAt: { gte: startDate } }, include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
          reportData = { totalDeals: deals.length, totalValue: deals.reduce((s, d) => s + d.value, 0), deals: deals.map(d => ({ id: d.id, title: d.title, value: d.value, stage: d.stage, client: d.client?.name })) }
        } else if (type === 'payments') {
          const payments = await db.payment.findMany({ where: { createdAt: { gte: startDate } }, include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
          reportData = { totalPayments: payments.length, totalAmount: payments.reduce((s, p) => s + p.amount, 0), byStatus: { completed: payments.filter(p => p.status === 'completed').length, pending: payments.filter(p => p.status === 'pending').length, failed: payments.filter(p => p.status === 'failed').length } }
        }

        const report = await db.savedReport.create({ data: { name: body.name || `${type} report`, type, dateRange, data: JSON.stringify(reportData) } })
        return NextResponse.json({ data: report }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })
    }
  } catch (error) {
    console.error('API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const segments = path || []
  const resource = segments[0]
  const id = segments[1]

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    const body = await request.json()

    switch (resource) {
      case 'clients':
        return NextResponse.json({ data: await db.client.update({ where: { id }, data: body }) })
      case 'deals': {
        const oldDeal = await db.deal.findUnique({ where: { id } })
        const deal = await db.deal.update({ where: { id }, data: body })
        if (oldDeal && body.stage && body.stage !== oldDeal.stage) {
          await db.dealActivity.create({ data: { dealId: id, type: 'stage_change', content: `Stage changed from ${oldDeal.stage} to ${body.stage}` } })
        }
        return NextResponse.json({ data: deal })
      }
      case 'payments':
        return NextResponse.json({ data: await db.payment.update({ where: { id }, data: body }) })
      case 'invoices': {
        const updateData: Record<string, unknown> = { ...body }
        if (body.status === 'paid') updateData.paidAt = new Date()
        return NextResponse.json({ data: await db.invoice.update({ where: { id }, data: updateData }) })
      }
      case 'subscriptions':
        return NextResponse.json({ data: await db.subscription.update({ where: { id }, data: body }) })
      case 'packages': {
        const pkgData = { ...body }
        if (body.features) pkgData.features = JSON.stringify(body.features)
        return NextResponse.json({ data: await db.package.update({ where: { id }, data: pkgData }) })
      }
      case 'tickets':
        return NextResponse.json({ data: await db.supportTicket.update({ where: { id }, data: body }) })
      case 'email-templates':
        return NextResponse.json({ data: await db.emailTemplate.update({ where: { id }, data: body }) })
      case 'campaigns': {
        const stats = body.stats
          ? (typeof body.stats === 'string' ? body.stats : JSON.stringify(body.stats))
          : undefined
        const updated = await db.campaign.update({
          where: { id },
          data: { ...body, stats },
        })
        return NextResponse.json({ data: updated })
      }
      case 'social-posts':
        return NextResponse.json({ data: await db.socialPost.update({ where: { id }, data: body }) })
      case 'social-accounts':
        return NextResponse.json({ data: await db.socialAccount.update({ where: { id }, data: body }) })
      case 'users': {
        const updateData: Record<string, unknown> = { ...body }
        if (body.password) updateData.password = await hash(body.password, 12)
        if (body.password) delete updateData.password; delete updateData.password // remove from spread
        const userData: Record<string, unknown> = {}
        if (body.name) userData.name = body.name
        if (body.email) userData.email = body.email
        if (body.role) userData.role = body.role
        if (body.isActive !== undefined) userData.isActive = body.isActive
        if (body.password) userData.password = await hash(body.password, 12)
        return NextResponse.json({ data: await db.adminUser.update({ where: { id }, data: userData, select: { id: true, name: true, email: true, role: true, isActive: true } }) })
      }
      case 'roles': {
        const permissions = body.permissions
          ? (typeof body.permissions === 'string' ? body.permissions : JSON.stringify(body.permissions))
          : undefined
        const updated = await db.adminRole.update({
          where: { id },
          data: { ...body, permissions },
        })
        return NextResponse.json({ data: updated })
      }
      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })
    }
  } catch (error) {
    console.error('API PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const segments = path || []
  const resource = segments[0]
  const id = segments[1]

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    switch (resource) {
      case 'clients':
        await db.client.delete({ where: { id } })
        break
      case 'deals':
        await db.deal.delete({ where: { id } })
        break
      case 'payments':
        await db.payment.delete({ where: { id } })
        break
      case 'invoices':
        await db.invoice.delete({ where: { id } })
        break
      case 'subscriptions':
        await db.subscription.delete({ where: { id } })
        break
      case 'packages':
        await db.package.delete({ where: { id } })
        break
      case 'tickets':
        await db.supportTicket.delete({ where: { id } })
        break
      case 'email-templates':
        await db.emailTemplate.delete({ where: { id } })
        break
      case 'campaigns':
        await db.campaign.delete({ where: { id } })
        break
      case 'social-posts':
        await db.socialPost.delete({ where: { id } })
        break
      case 'social-accounts':
        await db.socialAccount.delete({ where: { id } })
        break
      case 'users':
        await db.adminUser.delete({ where: { id } })
        break
      case 'roles':
        await db.adminRole.delete({ where: { id } })
        break
      case 'reports':
        await db.savedReport.delete({ where: { id } })
        break
      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })
    }
    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('API DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
