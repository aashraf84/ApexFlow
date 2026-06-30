// ApexFlow Cloud — Seed ERP Systems
// POST /api/seed-erps
// Seeds the 21 ERP systems into the ErpSystem table if they don't exist.
// Uses the same data as FALLBACK_ERP_DATA from erp-data.ts.

import { NextRequest, NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'

// 21 ERP systems data — matches FALLBACK_ERP_DATA in erp-data.ts
const ERP_SEED_DATA = [
  { name: 'ApparelFlow', slug: 'apparelflow', description: 'Complete ERP solution for the Apparel & Textile industry.', icon: 'shirt', color: 'teal', status: 'active', industry: 'Apparel & Textile', features: 'Production Planning,Inventory Management,Order Processing,Supply Chain Tracking,Quality Control,Financial Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 1, version: '1.0.0', website: 'https://apparelflowerp.vercel.app/', moduleCount: 0 },
  { name: 'HotelFlow', slug: 'hotelflow', description: 'Comprehensive hospitality management system.', icon: 'hotel', color: 'amber', status: 'active', industry: 'Hospitality', features: 'Reservation Management,Front Desk Operations,Housekeeping Management,F&B Control,Guest CRM', pricing: 'Starting from PKR 15,000/mo', sortOrder: 2, version: '1.0.0', website: 'https://hotelflowerp.vercel.app/', moduleCount: 0 },
  { name: 'EduFlow', slug: 'eduflow', description: 'All-in-one education management platform.', icon: 'graduation', color: 'emerald', status: 'active', industry: 'Education', features: 'Student Management,Academic Planning,Fee Management,Examination System,Library Management,HR & Payroll', pricing: 'Starting from PKR 15,000/mo', sortOrder: 3, version: '1.0.0', website: 'https://eduflowerp.vercel.app/', moduleCount: 0 },
  { name: 'BuildFlow', slug: 'buildflow', description: 'AI-powered property management platform.', icon: 'hardhat', color: 'orange', status: 'active', industry: 'Property Management & Real Estate', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments,Maintenance Tickets', pricing: 'Starting from PKR 15,000/mo', sortOrder: 4, version: '1.0.0', website: 'https://buildflowerp.vercel.app/', moduleCount: 0 },
  { name: 'PharmaFlow', slug: 'pharmaflow', description: 'Complete pharmaceutical management system.', icon: 'pill', color: 'red', status: 'active', industry: 'Pharmaceutical', features: 'Prescription Management,Inventory Control,Compliance & Regulatory,Multi-Branch,POS', pricing: 'Starting from PKR 15,000/mo', sortOrder: 5, version: '1.0.0', website: 'https://pharmaflowerp.vercel.app/', moduleCount: 0 },
  { name: 'TravelFlow', slug: 'travelflow', description: 'Complete Hajj & Umrah travel management platform.', icon: 'plane', color: 'cyan', status: 'active', industry: 'Travel & Tourism', features: 'Booking Engine,Pilgrim Management,Flight Management,Hotel Allocation,Visa Processing', pricing: 'Starting from PKR 15,000/mo', sortOrder: 6, version: '1.0.0', website: 'https://travelflowerp.vercel.app/', moduleCount: 0 },
  { name: 'MartFlow', slug: 'martflow', description: 'Retail management system with POS and multi-store support.', icon: 'shopping', color: 'yellow', status: 'active', industry: 'Retail', features: 'POS,Inventory Management,Multi-store,CRM,Purchase Orders', pricing: 'Starting from PKR 15,000/mo', sortOrder: 7, version: '1.0.0', website: 'https://martflowerp.vercel.app/', moduleCount: 0 },
  { name: 'TenantFlow', slug: 'tenantflow', description: 'AI-powered property management platform.', icon: 'building', color: 'pink', status: 'active', industry: 'Property Management', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments', pricing: 'Starting from PKR 15,000/mo', sortOrder: 8, version: '1.0.0', website: 'https://tenantflowerp.vercel.app/', moduleCount: 0 },
  { name: 'FactoryFlow', slug: 'factoryflow', description: 'Complete manufacturing execution and planning system.', icon: 'factory', color: 'lime', status: 'active', industry: 'Manufacturing', features: 'Production Planning,Quality Control,Maintenance Management,Supply Chain', pricing: 'Starting from PKR 15,000/mo', sortOrder: 9, version: '1.0.0', website: 'https://factoryflowerp.vercel.app/', moduleCount: 0 },
  { name: 'FoodFlow', slug: 'foodflow', description: 'Complete restaurant and food service management platform.', icon: 'utensils', color: 'rose', status: 'active', industry: 'Food & Restaurant', features: 'POS System,Recipe Management,Inventory Control,Multi-Branch', pricing: 'Starting from PKR 15,000/mo', sortOrder: 10, version: '1.0.0', website: 'https://foodflowerp.vercel.app/', moduleCount: 0 },
  { name: 'AutoFlow', slug: 'autoflow', description: 'Complete automotive workshop and service management platform.', icon: 'wrench', color: 'sky', status: 'active', industry: 'Automotive & Workshop', features: 'Workshop Management,Inventory Control,Supplier Management,Purchase Orders', pricing: 'Starting from PKR 15,000/mo', sortOrder: 11, version: '1.0.0', website: 'https://autoflowerp.vercel.app/', moduleCount: 0 },
  { name: 'HealthFlow', slug: 'healthflow', description: 'Complete healthcare and hospital management system.', icon: 'heart', color: 'fuchsia', status: 'active', industry: 'Healthcare', features: 'Patient Management,Appointment Scheduling,Electronic Health Records,Billing & Insurance,Pharmacy Integration,Lab Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 12, version: '1.0.0', website: 'https://healthflowerp.vercel.app/', moduleCount: 0 },
  { name: 'TextileFlow', slug: 'textileflow', description: 'End-to-end textile manufacturing and trading management system.', icon: 'textcursor', color: 'violet', status: 'active', industry: 'Textile', features: 'Yarn Management,Fabric Production,Dyeing & Finishing,Order Tracking,Quality Assurance,Export Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 13, version: '1.0.0', website: 'https://textileflowerp.vercel.app/', moduleCount: 0 },
  { name: 'CreativeFlow', slug: 'creativeflow', description: 'Project management and operations platform for creative agencies.', icon: 'palette', color: 'pink', status: 'active', industry: 'Creative & Design', features: 'Project Management,Time Tracking,Client Portal,Invoicing,Resource Planning,Collaboration', pricing: 'Starting from PKR 15,000/mo', sortOrder: 14, version: '1.0.0', website: 'https://creativeflowerp.vercel.app/', moduleCount: 0 },
  { name: 'LogisticFlow', slug: 'logisticflow', description: 'Complete logistics and supply chain management platform.', icon: 'truck', color: 'green', status: 'active', industry: 'Logistics & Supply Chain', features: 'Fleet Management,Route Optimization,Warehouse Management,Shipment Tracking,Order Fulfillment,Cross-Docking', pricing: 'Starting from PKR 15,000/mo', sortOrder: 15, version: '1.0.0', website: 'https://logisticflowerp.vercel.app/', moduleCount: 0 },
  { name: 'DistriFlow', slug: 'distriflow', description: 'Distribution and wholesale management system with multi-warehouse support.', icon: 'route', color: 'amber', status: 'active', industry: 'Distribution & Wholesale', features: 'Distribution Planning,Warehouse Management,Sales Order Processing,Purchase Management,Route Planning,Returns Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 16, version: '1.0.0', website: 'https://distriflowerp.vercel.app/', moduleCount: 0 },
  { name: 'FleetFlow', slug: 'fleetflow', description: 'Complete fleet and vehicle management platform for transportation companies.', icon: 'compass', color: 'cyan', status: 'active', industry: 'Fleet & Transportation', features: 'Fleet Tracking,Vehicle Management,Driver Management,Fuel Management,Maintenance Scheduling,Trip Planning', pricing: 'Starting from PKR 15,000/mo', sortOrder: 17, version: '1.0.0', website: 'https://fleetflowerp.vercel.app/', moduleCount: 0 },
  { name: 'ElectroFlow', slug: 'electroflow', description: 'Complete ERP for consumer electronics & home appliances — POS, installments, service & repair, warranty management, and multi-branch retail operations.', icon: 'zap', color: 'emerald', status: 'active', industry: 'Consumer Electronics & Appliances', features: 'Point of Sale,Installment Plans,Service & Repair,Warranty Management,Inventory Tracking,Customer CRM,Delivery Management,Multi-Branch Operations', pricing: 'Starting from PKR 15,000/mo', sortOrder: 18, version: '1.0.0', website: 'https://electroflowerp.vercel.app/', moduleCount: 0 },
  { name: 'BookFlow', slug: 'bookflow', description: 'Complete publishing and bookstore management system with inventory tracking, author management, print order processing, and multi-channel sales.', icon: 'book-open', color: 'violet', status: 'active', industry: 'Publishing & Books', features: 'Book Catalog,Author Management,Inventory Tracking,Print Order Processing,Online Sales,Wholesale Distribution,School Contracts,Stationery Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 19, version: '1.0.0', website: 'https://github.com/apexflowerp/BookFlow', moduleCount: 0 },
  { name: 'FuelFlow', slug: 'fuelflow', description: 'Comprehensive fuel station management platform with IoT-enabled dispenser control, ATG tank monitoring, forecourt automation, fuel delivery tracking, and multi-station support.', icon: 'fuel', color: 'orange', status: 'active', industry: 'Fuel & Energy', features: 'Station Management,Dispenser Control,Tank Monitoring (ATG),Fuel Delivery Tracking,CNG Management,EV Charging,Forecourt Automation,Shift Management,Car Wash,Loyalty Programs', pricing: 'Starting from PKR 30,000/mo', sortOrder: 20, version: '1.0.0', website: 'https://github.com/apexflowerp/FuelFlow', moduleCount: 0 },
  { name: 'SalonFlow', slug: 'salonflow', description: 'Complete salon and beauty business management platform with appointment scheduling, staff management, loyalty programs, membership plans, and multi-branch support.', icon: 'scissors', color: 'pink', status: 'active', industry: 'Salon & Beauty', features: 'Appointment Management,Staff Scheduling,Customer CRM,Loyalty Programs,Membership Plans,Service Catalog,Inventory Control,Multi-Branch,Commission Tracking,Billing & Invoicing', pricing: 'Starting from PKR 20,000/mo', sortOrder: 21, version: '1.0.0', website: 'https://github.com/apexflowerp/SalonFlow', moduleCount: 0 },
]

export async function POST(_request: NextRequest) {
  try {
    let created = 0
    let skipped = 0
    let updated = 0

    for (const erp of ERP_SEED_DATA) {
      const existing = await withRetry((tx) =>
        tx.erpSystem.findUnique({ where: { slug: erp.slug } }),
      )

      if (!existing) {
        await withRetry((tx) =>
          tx.erpSystem.create({
            data: {
              name: erp.name,
              slug: erp.slug,
              description: erp.description,
              icon: erp.icon,
              color: erp.color,
              status: erp.status,
              industry: erp.industry,
              features: erp.features,
              pricing: erp.pricing,
              sortOrder: erp.sortOrder,
              version: erp.version,
              website: erp.website,
              moduleCount: erp.moduleCount,
              isActive: true,
            },
          }),
        )
        created++
      } else {
        // Update if data differs
        const needsUpdate =
          existing.name !== erp.name ||
          existing.description !== erp.description ||
          existing.industry !== erp.industry ||
          existing.features !== erp.features ||
          existing.sortOrder !== erp.sortOrder

        if (needsUpdate) {
          await withRetry((tx) =>
            tx.erpSystem.update({
              where: { slug: erp.slug },
              data: {
                name: erp.name,
                description: erp.description,
                icon: erp.icon,
                color: erp.color,
                status: erp.status,
                industry: erp.industry,
                features: erp.features,
                pricing: erp.pricing,
                sortOrder: erp.sortOrder,
                version: erp.version,
                website: erp.website,
                moduleCount: erp.moduleCount,
                isActive: true,
              },
            }),
          )
          updated++
        } else {
          skipped++
        }
      }
    }

    const total = await withRetry((tx) => tx.erpSystem.count())

    return NextResponse.json({
      success: true,
      message: `ERP systems seeded successfully`,
      data: {
        created,
        updated,
        skipped,
        totalInDb: total,
        seedDataCount: ERP_SEED_DATA.length,
      },
    })
  } catch (error) {
    console.error('[Seed ERPs] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to seed ERP systems' },
      { status: 500 },
    )
  }
}
