import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import { getCached, setCached } from '@/lib/api-cache'
import { getActiveErpSlugs } from '@/lib/erp-connector'

const CACHE_TTL = 60_000 // 1 minute for ERP systems (rarely changes)

// Hardcoded ERP system data as last-resort fallback when main DB is completely unreachable
// Derived from the seed data — kept in sync with prisma/seed.ts
const FALLBACK_ERP_SYSTEMS = [
  { id: 'fallback-apparelflow', name: 'ApparelFlow', slug: 'apparelflow', description: 'Complete ERP solution for the Apparel & Textile industry.', icon: 'shirt', color: 'teal', status: 'active', industry: 'Apparel & Textile', features: 'Production Planning,Inventory Management,Order Processing,Supply Chain Tracking,Quality Control,Financial Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 1, version: '1.0.0', website: 'https://apparelflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-hotelflow', name: 'HotelFlow', slug: 'hotelflow', description: 'Comprehensive hospitality management system.', icon: 'hotel', color: 'amber', status: 'active', industry: 'Hospitality', features: 'Reservation Management,Front Desk Operations,Housekeeping Management,F&B Control,Guest CRM', pricing: 'Starting from PKR 20,000/mo', sortOrder: 2, version: '1.0.0', website: 'https://hotelflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-eduflow', name: 'EduFlow', slug: 'eduflow', description: 'All-in-one education management platform.', icon: 'graduation', color: 'emerald', status: 'active', industry: 'Education', features: 'Student Management,Academic Planning,Fee Management,Examination System,Library Management,HR & Payroll', pricing: 'Starting from PKR 15,000/mo', sortOrder: 3, version: '1.0.0', website: 'https://eduflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-buildflow', name: 'BuildFlow', slug: 'buildflow', description: 'AI-powered property management platform.', icon: 'hardhat', color: 'orange', status: 'active', industry: 'Property Management & Real Estate', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments,Maintenance Tickets', pricing: 'Starting from PKR 20,000/mo', sortOrder: 4, version: '1.0.0', website: 'https://buildflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-pharmaflow', name: 'PharmaFlow', slug: 'pharmaflow', description: 'Complete pharmaceutical management system.', icon: 'pill', color: 'red', status: 'active', industry: 'Pharmaceutical', features: 'Prescription Management,Inventory Control,Compliance & Regulatory,Multi-Branch,POS', pricing: 'Starting from PKR 15,000/mo', sortOrder: 5, version: '1.0.0', website: 'https://pharmaflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-travelflow', name: 'TravelFlow', slug: 'travelflow', description: 'Complete Hajj & Umrah travel management platform.', icon: 'plane', color: 'cyan', status: 'active', industry: 'Travel & Tourism', features: 'Booking Engine,Pilgrim Management,Flight Management,Hotel Allocation,Visa Processing', pricing: 'Starting from PKR 15,000/mo', sortOrder: 6, version: '1.0.0', website: 'https://travelflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-martflow', name: 'MartFlow', slug: 'martflow', description: 'Retail management system with POS and multi-store support.', icon: 'shopping', color: 'yellow', status: 'active', industry: 'Retail', features: 'POS,Inventory Management,Multi-store,CRM,Purchase Orders', pricing: 'Starting from PKR 20,000/mo', sortOrder: 7, version: '1.0.0', website: 'https://martflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-tenantflow', name: 'TenantFlow', slug: 'tenantflow', description: 'AI-powered property management platform.', icon: 'building', color: 'pink', status: 'active', industry: 'Property Management', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments', pricing: 'Starting from PKR 20,000/mo', sortOrder: 8, version: '1.0.0', website: 'https://tenantflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-factoryflow', name: 'FactoryFlow', slug: 'factoryflow', description: 'Complete manufacturing execution and planning system.', icon: 'factory', color: 'lime', status: 'active', industry: 'Manufacturing', features: 'Production Planning,Quality Control,Maintenance Management,Supply Chain', pricing: 'Starting from PKR 25,000/mo', sortOrder: 9, version: '1.0.0', website: 'https://factoryflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-foodflow', name: 'FoodFlow', slug: 'foodflow', description: 'Complete restaurant and food service management platform.', icon: 'utensils', color: 'rose', status: 'active', industry: 'Food & Restaurant', features: 'POS System,Recipe Management,Inventory Control,Multi-Branch', pricing: 'Starting from PKR 15,000/mo', sortOrder: 10, version: '1.0.0', website: 'https://foodflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-autoflow', name: 'AutoFlow', slug: 'autoflow', description: 'Complete automotive workshop and service management platform.', icon: 'wrench', color: 'sky', status: 'active', industry: 'Automotive & Workshop', features: 'Workshop Management,Inventory Control,Supplier Management,Purchase Orders', pricing: 'Starting from PKR 20,000/mo', sortOrder: 11, version: '1.0.0', website: 'https://autoflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-healthflow', name: 'HealthFlow', slug: 'healthflow', description: 'Complete healthcare and hospital management system.', icon: 'heart', color: 'fuchsia', status: 'active', industry: 'Healthcare', features: 'Patient Management,Appointment Scheduling,Electronic Health Records,Billing & Insurance,Pharmacy Integration,Lab Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 12, version: '1.0.0', website: 'https://healthflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-textileflow', name: 'TextileFlow', slug: 'textileflow', description: 'End-to-end textile manufacturing and trading management system.', icon: 'textcursor', color: 'violet', status: 'active', industry: 'Textile', features: 'Yarn Management,Fabric Production,Dyeing & Finishing,Order Tracking,Quality Assurance,Export Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 13, version: '1.0.0', website: 'https://textileflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-creativeflow', name: 'CreativeFlow', slug: 'creativeflow', description: 'Project management and operations platform for creative agencies.', icon: 'palette', color: 'pink', status: 'active', industry: 'Creative & Design', features: 'Project Management,Time Tracking,Client Portal,Invoicing,Resource Planning,Collaboration', pricing: 'Starting from PKR 15,000/mo', sortOrder: 14, version: '1.0.0', website: 'https://creativeflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-logisticflow', name: 'LogisticFlow', slug: 'logisticflow', description: 'Complete logistics and supply chain management platform.', icon: 'truck', color: 'green', status: 'active', industry: 'Logistics & Supply Chain', features: 'Fleet Management,Route Optimization,Warehouse Management,Shipment Tracking,Order Fulfillment,Cross-Docking', pricing: 'Starting from PKR 20,000/mo', sortOrder: 15, version: '1.0.0', website: 'https://logisticflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-distriflow', name: 'Distriflow', slug: 'distriflow', description: 'Distribution and wholesale management system with multi-warehouse support.', icon: 'route', color: 'amber', status: 'active', industry: 'Distribution & Wholesale', features: 'Distribution Planning,Warehouse Management,Sales Order Processing,Purchase Management,Route Planning,Returns Management', pricing: 'Starting from PKR 20,000/mo', sortOrder: 16, version: '1.0.0', website: 'https://distriflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-fleetflow', name: 'FleetFlow', slug: 'fleetflow', description: 'Complete fleet and vehicle management platform for transportation companies.', icon: 'compass', color: 'cyan', status: 'active', industry: 'Fleet & Transportation', features: 'Fleet Tracking,Vehicle Management,Driver Management,Fuel Management,Maintenance Scheduling,Trip Planning', pricing: 'Starting from PKR 15,000/mo', sortOrder: 17, version: '1.0.0', website: 'https://fleetflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-electroflow', name: 'ElectroFlow', slug: 'electroflow', description: 'Complete ERP for consumer electronics & home appliances — POS, installments, service & repair, warranty management, and multi-branch retail operations.', icon: 'zap', color: 'emerald', status: 'active', industry: 'Consumer Electronics & Appliances', features: 'Point of Sale,Installment Plans,Service & Repair,Warranty Management,Inventory Tracking,Customer CRM,Delivery Management,Multi-Branch Operations', pricing: 'Starting from PKR 15,000/mo', sortOrder: 18, version: '1.0.0', website: 'https://electroflowerp.vercel.app/', moduleCount: 0, modules: [] },
  { id: 'fallback-bookflow', name: 'BookFlow', slug: 'bookflow', description: 'Complete publishing and bookstore management system with inventory tracking, author management, print order processing, and multi-channel sales.', icon: 'book-open', color: 'violet', status: 'active', industry: 'Publishing & Books', features: 'Book Catalog,Author Management,Inventory Tracking,Print Order Processing,Online Sales,Wholesale Distribution,School Contracts,Stationery Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 19, version: '1.0.0', website: 'https://github.com/apexflowerp/BookFlow', moduleCount: 0, modules: [] },
  { id: 'fallback-fuelflow', name: 'FuelFlow', slug: 'fuelflow', description: 'Comprehensive fuel station management platform with IoT-enabled dispenser control, ATG tank monitoring, forecourt automation, fuel delivery tracking, and multi-station support.', icon: 'fuel', color: 'orange', status: 'active', industry: 'Fuel & Energy', features: 'Station Management,Dispenser Control,Tank Monitoring (ATG),Fuel Delivery Tracking,CNG Management,EV Charging,Forecourt Automation,Shift Management,Car Wash,Loyalty Programs', pricing: 'Starting from PKR 30,000/mo', sortOrder: 20, version: '1.0.0', website: 'https://github.com/apexflowerp/FuelFlow', moduleCount: 0, modules: [] },
  { id: 'fallback-salonflow', name: 'SalonFlow', slug: 'salonflow', description: 'Complete salon and beauty business management platform with appointment scheduling, staff management, loyalty programs, membership plans, and multi-branch support.', icon: 'scissors', color: 'pink', status: 'active', industry: 'Salon & Beauty', features: 'Appointment Management,Staff Scheduling,Customer CRM,Loyalty Programs,Membership Plans,Service Catalog,Inventory Control,Multi-Branch,Commission Tracking,Billing & Invoicing', pricing: 'Starting from PKR 20,000/mo', sortOrder: 21, version: '1.0.0', website: 'https://github.com/apexflowerp/SalonFlow', moduleCount: 0, modules: [] },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const cacheKey = `erp-systems-${status || 'all'}`

    // Check cache first
    const cached = getCached<Record<string, unknown>>(cacheKey, CACHE_TTL)
    if (cached) {
      return NextResponse.json(cached)
    }

    const where = status ? { status } : {}

    // Race the DB query against a 5-second timeout
    const erpSystems = await Promise.race([
      withRetry((db) =>
        db.erpSystem.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
        })
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB query timeout')), 5_000)
      ),
    ])

    // If DB returned fewer than 21 active ERPs, supplement with fallback data
    const allErpSystems = [...erpSystems]
    if (allErpSystems.length < 21) {
      const existingSlugs = new Set(allErpSystems.map((e: any) => e.slug))
      const missing = FALLBACK_ERP_SYSTEMS.filter((f) => !existingSlugs.has(f.slug))
      // Only add ERPs matching the requested status filter (or all if no filter)
      const statusFilter = status
      const toAdd = statusFilter
        ? missing.filter((m) => m.status === statusFilter)
        : missing
      allErpSystems.push(...toAdd as any[])
    }

    const result = {
      success: true,
      data: allErpSystems,
    }

    // Cache the result
    setCached(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[ERP-SYSTEMS] Main DB query failed:', error instanceof Error ? error.message : error)

    // Fallback strategy 1: Use getActiveErpSlugs() to filter the hardcoded fallback
    // This gives us only the ERPs that have database URLs configured
    try {
      const activeSlugs = await getActiveErpSlugs()
      const status = new URL(request.url).searchParams.get('status')

      let fallbackData = FALLBACK_ERP_SYSTEMS

      // Filter by status if requested
      if (status) {
        fallbackData = fallbackData.filter((erp) => erp.status === status)
      }

      // If we have active slugs from the erp-connector, only return those + any matching status
      if (activeSlugs.length > 0) {
        const slugSet = new Set(activeSlugs)
        fallbackData = fallbackData.filter((erp) => slugSet.has(erp.slug))
      }

      if (fallbackData.length > 0) {
        console.warn('[ERP-SYSTEMS] Returning fallback data from erp-connector + hardcoded list')
        return NextResponse.json({
          success: true,
          data: fallbackData,
          _fallback: true,
        })
      }
    } catch (fallbackErr) {
      console.error('[ERP-SYSTEMS] Fallback strategy 1 failed:', fallbackErr instanceof Error ? fallbackErr.message : fallbackErr)
    }

    // Fallback strategy 2: Return all hardcoded systems
    const status = new URL(request.url).searchParams.get('status')
    const allFallback = status
      ? FALLBACK_ERP_SYSTEMS.filter((erp) => erp.status === status)
      : FALLBACK_ERP_SYSTEMS

    if (allFallback.length > 0) {
      console.warn('[ERP-SYSTEMS] Returning all hardcoded fallback data')
      return NextResponse.json({
        success: true,
        data: allFallback,
        _fallback: true,
      })
    }

    // Last resort: return the original error response
    return NextResponse.json(
      { success: false, message: 'Failed to fetch ERP systems' },
      { status: 200 }
    )
  }
}
