import { NextResponse } from 'next/server'
import { db, withRetry } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Color names must match the colorMap keys in dashboard-layout.tsx & erp-detail-tab.tsx
// Icon names must match the iconComponentMap keys in dashboard-layout.tsx & erp-detail-tab.tsx
const ERP_SYSTEMS = [
  { name: 'ApparelFlow', slug: 'apparelflow', description: 'Complete ERP solution for the Apparel & Textile industry with production planning, inventory control, and supply chain management.', icon: 'shirt', color: 'teal', status: 'active', industry: 'Apparel & Textile', features: 'Production Planning,Inventory Management,Order Processing,Supply Chain Tracking,Quality Control,Financial Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 1, website: 'https://apparelflowerp.vercel.app/' },
  { name: 'HotelFlow', slug: 'hotelflow', description: 'Comprehensive hospitality management system covering reservations, front desk, housekeeping, and guest relations.', icon: 'hotel', color: 'amber', status: 'active', industry: 'Hospitality', features: 'Reservation Management,Front Desk Operations,Housekeeping Management,F&B Control,Guest CRM', pricing: 'Starting from PKR 20,000/mo', sortOrder: 2, website: 'https://hotelflowerp.vercel.app/' },
  { name: 'EduFlow', slug: 'eduflow', description: 'All-in-one education management platform for schools, colleges, and universities with academic and administrative tools.', icon: 'graduation', color: 'emerald', status: 'active', industry: 'Education', features: 'Student Management,Academic Planning,Fee Management,Examination System,Library Management,HR & Payroll', pricing: 'Starting from PKR 15,000/mo', sortOrder: 3, website: 'https://eduflowerp.vercel.app/' },
  { name: 'BuildFlow', slug: 'buildflow', description: 'AI-powered property management platform for residential and commercial properties. Manage tenants, leases, billing, maintenance, and compliance across your entire portfolio.', icon: 'hardhat', color: 'orange', status: 'active', industry: 'Property Management & Real Estate', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments,Maintenance Tickets,Compliance & Regulatory,Smart Devices,Inspection Management,Accounting & Finance,Vendor Management', pricing: 'Starting from PKR 20,000/mo', sortOrder: 4, website: 'https://buildflowerp.vercel.app/' },
  { name: 'PharmaFlow', slug: 'pharmaflow', description: 'Complete pharmaceutical management system with prescription tracking, inventory control, compliance management, and multi-branch support for pharmacies, clinics, and distributors.', icon: 'pill', color: 'red', status: 'active', industry: 'Pharmaceutical', features: 'Prescription Management,Inventory Control,Compliance & Regulatory,Multi-Branch,POS,CRM,Purchase Management,Accounting & Finance', pricing: 'Starting from PKR 15,000/mo', sortOrder: 5, website: 'https://pharmaflowerp.vercel.app/' },
  { name: 'TravelFlow', slug: 'travelflow', description: 'Complete Hajj & Umrah travel management platform with booking engine, pilgrim tracking, flight management, hotel allocation, visa processing, and multi-branch support for travel agencies and tour operators.', icon: 'plane', color: 'cyan', status: 'active', industry: 'Travel & Tourism', features: 'Booking Engine,Pilgrim Management,Flight Management,Hotel Allocation,Visa Processing,CRM,Tour Groups,International Travel,Supplier Management,Automation,Finance & Accounting,HR & Payroll', pricing: 'Starting from PKR 15,000/mo', sortOrder: 6, website: 'https://travelflowerp.vercel.app/' },
  { name: 'MartFlow', slug: 'martflow', description: 'Retail management system with POS, inventory, and multi-store support for supermarkets, wholesale, and retail chains.', icon: 'shopping', color: 'yellow', status: 'active', industry: 'Retail', features: 'POS,Inventory Management,Multi-store,CRM,Purchase Orders,Sales Orders,Warehouse Management,Supplier Management', pricing: 'Starting from PKR 20,000/mo', sortOrder: 7, website: 'https://martflowerp.vercel.app/' },
  { name: 'TenantFlow', slug: 'tenantflow', description: 'AI-powered property management platform for residential and commercial properties. Manage tenants, leases, billing, maintenance, compliance, smart devices, and inspections across your entire portfolio with multi-tenant database architecture.', icon: 'building', color: 'pink', status: 'active', industry: 'Property Management', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments,Maintenance Tickets,Compliance & Regulatory,Smart Devices,Inspection Management,Accounting & Finance,Vendor Management,Tenant Portal,Marketplace Listings', pricing: 'Starting from PKR 20,000/mo', sortOrder: 8, website: 'https://tenantflowerp.vercel.app/' },
  { name: 'FactoryFlow', slug: 'factoryflow', description: 'Complete manufacturing execution and planning system for factories with production management, quality control, maintenance tracking, and supply chain optimization.', icon: 'factory', color: 'lime', status: 'active', industry: 'Manufacturing', features: 'Production Planning,Quality Control,Maintenance Management,Supply Chain,Warehouse Management,Inventory Control,Cost Estimation,Equipment Tracking', pricing: 'Starting from PKR 25,000/mo', sortOrder: 9, website: 'https://factoryflowerp.vercel.app/' },
  { name: 'FoodFlow', slug: 'foodflow', description: 'Complete restaurant and food service management platform with POS, recipe management, inventory control, and multi-branch support for restaurants, cafes, and food chains.', icon: 'utensils', color: 'rose', status: 'active', industry: 'Food & Restaurant', features: 'POS System,Recipe Management,Inventory Control,Multi-Branch,Staff Scheduling,Table Reservation,CRM,Kitchen Display,Delivery Management,Accounting & Finance', pricing: 'Starting from PKR 15,000/mo', sortOrder: 10, website: 'https://foodflowerp.vercel.app/' },
  { name: 'AutoFlow', slug: 'autoflow', description: 'Complete automotive workshop and service management platform with inventory control, supplier management, purchase orders, HR & payroll, procurement, and financial reporting for auto repair shops, service centers, and workshops.', icon: 'wrench', color: 'sky', status: 'active', industry: 'Automotive & Workshop', features: 'Workshop Management,Inventory Control,Supplier Management,Purchase Orders,HR & Payroll,Procurement,Reporting & Analytics,Vehicle Tracking,Service Orders,Accounting & Finance', pricing: 'Starting from PKR 20,000/mo', sortOrder: 11, website: 'https://autoflowerp.vercel.app/' },
  { name: 'HealthFlow', slug: 'healthflow', description: 'Complete healthcare and hospital management system with patient management, appointment scheduling, electronic health records, billing, pharmacy integration, and lab management.', icon: 'heart', color: 'fuchsia', status: 'active', industry: 'Healthcare', features: 'Patient Management,Appointment Scheduling,Electronic Health Records,Billing & Insurance,Pharmacy Integration,Lab Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 12, website: 'https://healthflowerp.vercel.app/' },
  { name: 'TextileFlow', slug: 'textileflow', description: 'End-to-end textile manufacturing and trading management system with yarn management, fabric production, dyeing & finishing, order tracking, quality assurance, and export management.', icon: 'textcursor', color: 'violet', status: 'active', industry: 'Textile', features: 'Yarn Management,Fabric Production,Dyeing & Finishing,Order Tracking,Quality Assurance,Export Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 13, website: 'https://textileflowerp.vercel.app/' },
  { name: 'CreativeFlow', slug: 'creativeflow', description: 'Project management and operations platform for creative agencies with time tracking, client portal, invoicing, resource planning, and collaboration tools.', icon: 'palette', color: 'pink', status: 'active', industry: 'Creative & Design', features: 'Project Management,Time Tracking,Client Portal,Invoicing,Resource Planning,Collaboration', pricing: 'Starting from PKR 15,000/mo', sortOrder: 14, website: 'https://creativeflowerp.vercel.app/' },
  { name: 'LogisticFlow', slug: 'logisticflow', description: 'Complete logistics and supply chain management platform with shipment tracking, warehouse management, fleet management, route optimization, and multi-tenant support for logistics companies, freight forwarders, and supply chain operators.', icon: 'truck', color: 'green', status: 'active', industry: 'Logistics & Supply Chain', features: 'Fleet Management,Route Optimization,Warehouse Management,Shipment Tracking,Order Fulfillment,Cross-Docking', pricing: 'Starting from PKR 20,000/mo', sortOrder: 15, website: 'https://logisticflowerp.vercel.app/' },
  { name: 'DistriFlow', slug: 'distriflow', description: 'Distribution and wholesale management system with multi-warehouse support, sales order processing, purchase management, route planning, and returns management.', icon: 'route', color: 'amber', status: 'active', industry: 'Distribution & Wholesale', features: 'Distribution Planning,Warehouse Management,Sales Order Processing,Purchase Management,Route Planning,Returns Management,Van Sales,Trade Promotions', pricing: 'Starting from PKR 20,000/mo', sortOrder: 16, website: 'https://distriflowerp.vercel.app/' },
  { name: 'FleetFlow', slug: 'fleetflow', description: 'Complete fleet management and logistics tracking platform with vehicle monitoring, driver management, trip planning, fuel tracking, maintenance scheduling, and delivery optimization for transportation companies and logistics operators.', icon: 'truck', color: 'teal', status: 'active', industry: 'Fleet & Transportation', features: 'Vehicle Tracking,Driver Management,Trip Planning,Fuel Tracking,Maintenance Scheduling,Delivery Optimization', pricing: 'Starting from PKR 20,000/mo', sortOrder: 17, website: 'https://fleetflow.vercel.app/' },
  { name: 'ElectroFlow', slug: 'electroflow', description: 'Complete electronics and appliance business management platform with inventory control, installment plans, service tickets, warranty management, and multi-branch support for electronics retailers and service centers.', icon: 'zap', color: 'sky', status: 'active', industry: 'Electronics & Appliances', features: 'POS System,Inventory Control,Installment Plans,Service Tickets,Warranty Management,Multi-Branch,Customer CRM,Supplier Management,Accounting & Finance', pricing: 'Starting from PKR 15,000/mo', sortOrder: 18, website: 'https://electroflowerp.vercel.app/' },
  { name: 'BookFlow', slug: 'bookflow', description: 'Complete publishing and bookstore management system with inventory tracking, author management, print order processing, and multi-channel sales.', icon: 'book-open', color: 'violet', status: 'active', industry: 'Publishing & Books', features: 'Book Catalog,Author Management,Inventory Tracking,Print Order Processing,Online Sales,Wholesale Distribution,School Contracts,Stationery Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 19, website: 'https://github.com/apexflowerp/BookFlow' },
  { name: 'FuelFlow', slug: 'fuelflow', description: 'Comprehensive fuel station management platform with IoT-enabled dispenser control, ATG tank monitoring, forecourt automation, fuel delivery tracking, and multi-station support for petroleum retailers and CNG/EV operators.', icon: 'fuel', color: 'orange', status: 'active', industry: 'Fuel & Energy', features: 'Station Management,Dispenser Control,Tank Monitoring (ATG),Fuel Delivery Tracking,CNG Management,EV Charging,Forecourt Automation,Shift Management,Car Wash,Loyalty Programs', pricing: 'Starting from PKR 30,000/mo', sortOrder: 20, website: 'https://github.com/apexflowerp/FuelFlow' },
]

const ERP_MODULES: Record<string, Array<{ name: string; slug: string; description: string; category: string; price: number }>> = {
  bookflow: [],
  fuelflow: [],
  hotelflow: [
    { name: 'Reservation Management', slug: 'reservation-management', description: 'Online and offline booking engine with channel manager integration and overbooking prevention.', category: 'Front Office', price: 5000 },
    { name: 'Front Desk', slug: 'front-desk', description: 'Check-in/check-out, guest registration, room assignment, and status dashboard.', category: 'Front Office', price: 4000 },
    { name: 'Housekeeping', slug: 'housekeeping', description: 'Room cleaning schedules, task assignment, inspection workflows, and maintenance tracking.', category: 'Operations', price: 3000 },
    { name: 'F&B Management', slug: 'fb-management', description: 'Restaurant POS, room service, banquet management, and recipe costing.', category: 'F&B', price: 5000 },
    { name: 'Guest CRM', slug: 'guest-crm', description: 'Guest profiles, loyalty programs, communication history, and preferences tracking.', category: 'CRM', price: 3500 },
    { name: 'Revenue Management', slug: 'revenue-management', description: 'Dynamic pricing, occupancy optimization, ADR/RevPAR tracking, and demand forecasting.', category: 'Finance', price: 6000 },
    { name: 'Event Management', slug: 'event-management', description: 'Banquet bookings, conference scheduling, event planning, and vendor coordination.', category: 'Events', price: 4000 },
    { name: 'Channel Manager', slug: 'channel-manager', description: 'OTA integration, rate synchronization, inventory management across booking platforms.', category: 'Distribution', price: 4500 },
    { name: 'Procurement', slug: 'procurement', description: 'Purchase orders, supplier management, receiving, and inventory control.', category: 'Procurement', price: 3000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Staff scheduling, attendance, payroll processing, and leave management.', category: 'HR', price: 3500 },
  ],
  eduflow: [
    { name: 'Student Management', slug: 'student-management', description: 'Admissions, enrollment, academic records, and student lifecycle tracking.', category: 'Academic', price: 5000 },
    { name: 'Academic Planning', slug: 'academic-planning', description: 'Curriculum design, class scheduling, timetabling, and academic session management.', category: 'Academic', price: 4000 },
    { name: 'Fee Management', slug: 'fee-management', description: 'Fee structures, invoicing, payment tracking, scholarships, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'Examination System', slug: 'examination-system', description: 'Exam scheduling, result processing, grading, report cards, and transcript generation.', category: 'Academic', price: 3500 },
    { name: 'Library Management', slug: 'library-management', description: 'Book catalog, issue/return tracking, overdue fines, and digital resources.', category: 'Resources', price: 2500 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Staff management, attendance, payroll, leave tracking, and performance reviews.', category: 'HR', price: 3500 },
    { name: 'Transport Management', slug: 'transport-management', description: 'Route planning, vehicle tracking, student pickup/drop, and fee collection.', category: 'Operations', price: 2500 },
    { name: 'Hostel Management', slug: 'hostel-management', description: 'Room allocation, check-in/out, mess management, and visitor logs.', category: 'Operations', price: 2000 },
    { name: 'Parent Portal', slug: 'parent-portal', description: 'Attendance updates, grade viewing, fee payments, and communication with teachers.', category: 'Communication', price: 2000 },
    { name: 'Alumni Network', slug: 'alumni-network', description: 'Graduate directory, placement tracking, donations, and event management.', category: 'Community', price: 2000 },
  ],
  apparelflow: [
    { name: 'Production Planning', slug: 'production-planning', description: 'Plan and schedule production runs, manage BOMs, track work orders through cutting→stitching→finishing→QC pipeline.', category: 'Production', price: 5000 },
    { name: 'Inventory Management', slug: 'inventory-management', description: 'Real-time inventory tracking with barcode support, multi-warehouse management, and stock optimization.', category: 'Inventory', price: 3000 },
    { name: 'Sales Orders', slug: 'sales-orders', description: 'End-to-end order management from quote to delivery with invoicing and payment tracking.', category: 'Sales', price: 4000 },
    { name: 'Warehouse Management', slug: 'warehouse-management', description: 'Main warehouse, factory warehouse, GRN, dispatch, and stock returns management.', category: 'Warehouse', price: 4500 },
    { name: 'Retail & POS', slug: 'retail-pos', description: 'Multi-shop management with POS billing, daily/monthly closing, and shop stock transfers.', category: 'Retail', price: 5000 },
    { name: 'Wholesale', slug: 'wholesale', description: 'B2B wholesale orders, inventory, transfer vouchers, and wholesale returns.', category: 'Wholesale', price: 3500 },
    { name: 'Procurement', slug: 'procurement', description: 'Supplier management, purchase orders, and purchase returns.', category: 'Procurement', price: 3000 },
    { name: 'Raw Materials', slug: 'raw-materials', description: 'RM catalog, inward GRN, issues to production, and returns to suppliers.', category: 'Materials', price: 3500 },
    { name: 'Quality Control', slug: 'quality-control', description: 'Inspection workflows, defect tracking, QC results with pass/fail/grade.', category: 'Quality', price: 2500 },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Chart of accounts, double-entry journal, P&L reporting, and manual payments.', category: 'Finance', price: 4000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Employee management, attendance, shifts, payroll processing, and salary advances.', category: 'HR', price: 3500 },
    { name: 'Tech Pack', slug: 'tech-pack', description: 'Full garment tech packs with fabrics, trims, measurements, colorways, and construction details.', category: 'Design', price: 3000 },
    { name: 'CRM & Leads', slug: 'crm-leads', description: 'Lead pipeline management, customer profiles, and credit limit tracking.', category: 'CRM', price: 2500 },
    { name: 'Logistics', slug: 'logistics', description: 'Shipping partner management, shipment tracking, and factory transfers.', category: 'Logistics', price: 2000 },
    { name: 'Costing & BOM', slug: 'costing-bom', description: 'Bill of Materials and detailed cost sheets with fabric/trims/labor/overhead breakdowns.', category: 'Costing', price: 3000 },
  ],
  martflow: [
    { name: 'POS System', slug: 'pos-system', description: 'Multi-terminal POS with barcode scanning, receipt printing, cash/card handling, and shift management.', category: 'Sales', price: 5000 },
    { name: 'Inventory Management', slug: 'inventory-management', description: 'Real-time stock tracking across branches, auto-reorder points, and batch management.', category: 'Inventory', price: 4000 },
    { name: 'Multi-Branch Management', slug: 'multi-branch', description: 'Centralized control of multiple store locations with inter-branch transfers.', category: 'Operations', price: 4000 },
    { name: 'Purchase Orders', slug: 'purchase-orders', description: 'Supplier purchase orders, goods receiving, and purchase returns.', category: 'Procurement', price: 3000 },
    { name: 'Sales Orders', slug: 'sales-orders', description: 'Wholesale and retail order management with delivery tracking.', category: 'Sales', price: 3500 },
    { name: 'Warehouse Management', slug: 'warehouse-management', description: 'Multi-warehouse support with stock allocation, picking, and dispatch.', category: 'Warehouse', price: 4000 },
    { name: 'Supplier Management', slug: 'supplier-management', description: 'Supplier profiles, payment terms, order history, and performance tracking.', category: 'Procurement', price: 2500 },
    { name: 'Customer CRM', slug: 'customer-crm', description: 'Customer profiles, loyalty programs, purchase history, and targeted promotions.', category: 'CRM', price: 3000 },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Chart of accounts, invoicing, expense tracking, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Staff management, attendance, shifts, payroll, and performance tracking.', category: 'HR', price: 3500 },
  ],
  pharmaflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time business insights and KPI tracking.', category: 'Core', price: 0 },
    { name: 'Inventory Management', slug: 'inventory', description: 'Stock tracking, batch management, expiry alerts, and multi-warehouse support.', category: 'Core', price: 4000 },
    { name: 'Sales & POS', slug: 'sales-pos', description: 'Point of sale, invoicing, receipt management, and barcode scanning.', category: 'Core', price: 5000 },
    { name: 'Purchase Management', slug: 'purchases', description: 'Purchase orders, supplier management, goods receiving notes.', category: 'Core', price: 3500 },
    { name: 'Customer Management', slug: 'customers', description: 'CRM, loyalty programs, patient profiles, and contact tracking.', category: 'Core', price: 3000 },
    { name: 'Supplier Management', slug: 'suppliers', description: 'Vendor management, procurement, ratings, and payment terms.', category: 'Core', price: 2500 },
    { name: 'Prescription Management', slug: 'prescriptions', description: 'Digital prescriptions, drug interactions, doctor management, and refill tracking.', category: 'Core', price: 4000 },
    { name: 'Accounting & Finance', slug: 'accounting', description: 'Double-entry bookkeeping, journal entries, financial reports, and bank reconciliation.', category: 'Core', price: 4000 },
    { name: 'Employee & HR', slug: 'hr', description: 'Staff management, payroll, attendance, leaves, and performance reviews.', category: 'Core', price: 3500 },
    { name: 'Transfer Management', slug: 'transfers', description: 'Inter-branch stock transfers with tracking and approval workflows.', category: 'Core', price: 2500 },
    { name: 'Compliance & Regulatory', slug: 'compliance', description: 'Drug authority compliance, license tracking, audit trails, and regulatory reporting.', category: 'Premium', price: 5000 },
    { name: 'Warehouse Management', slug: 'warehouse', description: 'Zone/rack/bin management, pick-pack-ship, and cold chain monitoring.', category: 'Premium', price: 4000 },
    { name: 'Notifications & Alerts', slug: 'notifications', description: 'Stock alerts, expiry warnings, system notifications, and SMS/email integration.', category: 'Core', price: 2000 },
    { name: 'Reports & Insights', slug: 'reports', description: 'Business intelligence, custom reports, data export, and scheduled reporting.', category: 'Core', price: 2500 },
    { name: 'AI Predictions', slug: 'ai-predictions', description: 'Demand forecasting, anomaly detection, smart recommendations, and trend analysis.', category: 'Premium', price: 6000 },
    { name: 'Multi-Branch', slug: 'multi-branch', description: 'Multi-location management, centralized control, and branch performance comparison.', category: 'Premium', price: 4000 },
    { name: 'API Access', slug: 'api-access', description: 'REST API, webhooks, third-party integrations, and custom app development.', category: 'Add-on', price: 3000 },
    { name: 'White Label', slug: 'white-label', description: 'Custom branding, logo, domain mapping, and personalized user experience.', category: 'Add-on', price: 5000 },
    { name: 'Barcode & Labeling', slug: 'barcode-labeling', description: 'Barcode generation, product labeling, shelf tags, and QR code support.', category: 'Add-on', price: 2000 },
    { name: 'Loyalty Program', slug: 'loyalty-program', description: 'Points, tiers, rewards, referral tracking, and customer retention tools.', category: 'Add-on', price: 2500 },
  ],
  buildflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time property portfolio insights with occupancy rates, revenue tracking, and maintenance KPIs.', category: 'Core', price: 0 },
    { name: 'Property Management', slug: 'property-management', description: 'Manage residential and commercial properties, units, floors, and amenities with full lifecycle tracking.', category: 'Core', price: 5000 },
    { name: 'Tenant Management', slug: 'tenant-management', description: 'Tenant profiles, move-in/out tracking, screening, pet management, and communication history.', category: 'Core', price: 4000 },
    { name: 'Lease Management', slug: 'lease-management', description: 'Lease creation, renewals, escalations, and automated expiry alerts with digital signatures.', category: 'Core', price: 5000 },
    { name: 'Billing & Payments', slug: 'billing-payments', description: 'Rent invoicing, payment processing, late fee automation, and payment plan management.', category: 'Core', price: 4000 },
    { name: 'Maintenance Tickets', slug: 'maintenance', description: 'Work order management, vendor assignment, priority tracking, and completion workflows.', category: 'Core', price: 3500 },
    { name: 'Inspection Management', slug: 'inspections', description: 'Scheduled inspections, checklist templates, findings documentation, and compliance tracking.', category: 'Core', price: 3000 },
    { name: 'Accounting & Finance', slug: 'accounting', description: 'Chart of accounts, transactions, budgeting, and financial reporting for property operations.', category: 'Core', price: 4000 },
    { name: 'Vendor Management', slug: 'vendor-management', description: 'Vendor profiles, specialty tracking, job ratings, payment terms, and license verification.', category: 'Core', price: 2500 },
    { name: 'Compliance & Regulatory', slug: 'compliance', description: 'Regulatory compliance checks, insurance tracking, and audit trail management.', category: 'Premium', price: 5000 },
    { name: 'Smart Devices', slug: 'smart-devices', description: 'IoT integration for thermostats, smart locks, cameras, and sensors with battery monitoring.', category: 'Premium', price: 4000 },
    { name: 'Tenant Portal', slug: 'tenant-portal', description: 'Self-service portal for rent payments, maintenance requests, and lease document access.', category: 'Premium', price: 3000 },
    { name: 'Marketplace Listings', slug: 'marketplace', description: 'Property rental/sale listings with application management and scoring.', category: 'Premium', price: 3500 },
    { name: 'Key Management', slug: 'key-management', description: 'Physical and digital key tracking, holder assignments, and access audit logs.', category: 'Add-on', price: 2000 },
    { name: 'Parking Management', slug: 'parking', description: 'Parking spot allocation, EV charging, monthly fee tracking, and visitor parking.', category: 'Add-on', price: 2000 },
    { name: 'Amenity Booking', slug: 'amenity-booking', description: 'Reservation system for pools, gyms, party rooms, and shared spaces.', category: 'Add-on', price: 2000 },
    { name: 'Energy Monitoring', slug: 'energy-monitoring', description: 'Utility reading tracking, cost analysis, consumption trends, and peak demand monitoring.', category: 'Add-on', price: 2500 },
    { name: 'AI Predictions', slug: 'ai-predictions', description: 'Occupancy forecasting, rent optimization, maintenance prediction, and market intelligence.', category: 'Premium', price: 6000 },
  ],
  travelflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time business insights, booking analytics, and KPI tracking for travel operations.', category: 'Core', price: 0 },
    { name: 'Pilgrim Management', slug: 'pilgrim-management', description: 'Complete pilgrim profiles with passport, visa, health records, and document tracking.', category: 'Core', price: 4000 },
    { name: 'Booking Engine', slug: 'booking-engine', description: 'Unified booking system for Umrah, Hajj, and international travel packages with payment processing.', category: 'Core', price: 5000 },
    { name: 'Flight Management', slug: 'flight-management', description: 'Airline booking, PNR management, seat allocation, and GDS integration for flight operations.', category: 'Core', price: 4000 },
    { name: 'Hotel Management', slug: 'hotel-management', description: 'Makkah & Madinah hotel contracts, room allocation, check-in/out tracking, and rate management.', category: 'Core', price: 4000 },
    { name: 'Visa Processing', slug: 'visa-processing', description: 'Visa application tracking, document management, embassy submission, and status monitoring.', category: 'Core', price: 3500 },
    { name: 'Tour Groups', slug: 'tour-groups', description: 'Group creation, leader assignment, departure scheduling, and pilgrim assignment to groups.', category: 'Core', price: 3000 },
    { name: 'International Travel', slug: 'international-travel', description: 'Non-Umrah international tour packages with itinerary management, pricing, and seasonal planning.', category: 'Core', price: 3500 },
    { name: 'Transport Management', slug: 'transport-management', description: 'Ground transportation scheduling, vehicle tracking, and airport transfer coordination.', category: 'Core', price: 2500 },
    { name: 'CRM & Leads', slug: 'crm-leads', description: 'Lead pipeline with AI scoring, customer profiles, and conversion tracking.', category: 'CRM', price: 3000 },
    { name: 'Supplier Management', slug: 'supplier-management', description: 'Vendor profiles, contract management, service ratings, and payment terms tracking.', category: 'Procurement', price: 2500 },
    { name: 'Automation Engine', slug: 'automation', description: 'Workflow automation rules, trigger-based actions, and multi-step pilgrim journey automation.', category: 'Premium', price: 5000 },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Invoicing, expense tracking, multi-currency support, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Staff management, attendance tracking, payroll processing, and branch assignments.', category: 'HR', price: 3500 },
    { name: 'Branch Management', slug: 'branch-management', description: 'Multi-branch operations, location tracking, and centralized branch performance monitoring.', category: 'Operations', price: 2500 },
    { name: 'AI Assistant', slug: 'ai-assistant', description: 'Smart recommendations, demand forecasting, route optimization, and anomaly detection.', category: 'Premium', price: 6000 },
    { name: 'Reports & Insights', slug: 'reports', description: 'Business intelligence, custom reports, booking analytics, and revenue dashboards.', category: 'Core', price: 2500 },
    { name: 'Mail & Notifications', slug: 'mail-notifications', description: 'Email campaigns, SMS alerts, WhatsApp integration, and automated notifications.', category: 'Add-on', price: 2000 },
  ],
  tenantflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time property portfolio insights with occupancy rates, revenue tracking, and maintenance KPIs.', category: 'Core', price: 0 },
    { name: 'Property Management', slug: 'property-management', description: 'Manage residential and commercial properties, units, floors, and amenities with full lifecycle tracking.', category: 'Core', price: 5000 },
    { name: 'Tenant Management', slug: 'tenant-management', description: 'Tenant profiles, move-in/out tracking, screening, pet management, and communication history.', category: 'Core', price: 4000 },
    { name: 'Lease Management', slug: 'lease-management', description: 'Lease creation, renewals, escalations, and automated expiry alerts with digital signatures.', category: 'Core', price: 5000 },
    { name: 'Billing & Payments', slug: 'billing-payments', description: 'Rent invoicing, payment processing, late fee automation, and payment plan management.', category: 'Core', price: 4000 },
    { name: 'Maintenance Tickets', slug: 'maintenance', description: 'Work order management, vendor assignment, priority tracking, and completion workflows.', category: 'Core', price: 3500 },
    { name: 'Inspection Management', slug: 'inspections', description: 'Scheduled inspections, checklist templates, findings documentation, and compliance tracking.', category: 'Core', price: 3000 },
    { name: 'Accounting & Finance', slug: 'accounting', description: 'Chart of accounts, transactions, budgeting, and financial reporting for property operations.', category: 'Core', price: 4000 },
    { name: 'Vendor Management', slug: 'vendor-management', description: 'Vendor profiles, specialty tracking, job ratings, payment terms, and license verification.', category: 'Core', price: 2500 },
    { name: 'Compliance & Regulatory', slug: 'compliance', description: 'Regulatory compliance checks, insurance tracking, and audit trail management.', category: 'Premium', price: 5000 },
    { name: 'Smart Devices', slug: 'smart-devices', description: 'IoT integration for thermostats, smart locks, cameras, and sensors with battery monitoring.', category: 'Premium', price: 4000 },
    { name: 'Tenant Portal', slug: 'tenant-portal', description: 'Self-service portal for rent payments, maintenance requests, and lease document access.', category: 'Premium', price: 3000 },
    { name: 'Marketplace Listings', slug: 'marketplace', description: 'Property rental/sale listings with application management and tenant scoring.', category: 'Premium', price: 3500 },
    { name: 'Key Management', slug: 'key-management', description: 'Physical and digital key tracking, holder assignments, and access audit logs.', category: 'Add-on', price: 2000 },
    { name: 'Parking Management', slug: 'parking', description: 'Parking spot allocation, EV charging, monthly fee tracking, and visitor parking.', category: 'Add-on', price: 2000 },
    { name: 'Amenity Booking', slug: 'amenity-booking', description: 'Reservation system for pools, gyms, party rooms, and shared spaces.', category: 'Add-on', price: 2000 },
    { name: 'Energy Monitoring', slug: 'energy-monitoring', description: 'Utility reading tracking, cost analysis, consumption trends, and peak demand monitoring.', category: 'Add-on', price: 2500 },
    { name: 'AI Predictions', slug: 'ai-predictions', description: 'Occupancy forecasting, rent optimization, maintenance prediction, and market intelligence.', category: 'Premium', price: 6000 },
  ],
  foodflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time restaurant business insights with sales tracking, order analytics, and KPI monitoring.', category: 'Core', price: 0 },
    { name: 'POS System', slug: 'pos-system', description: 'Multi-terminal POS with table management, split billing, tipping, and shift handling.', category: 'Core', price: 5000 },
    { name: 'Recipe Management', slug: 'recipe-management', description: 'Digital recipe cards with ingredients, costing, yield tracking, and allergen management.', category: 'Core', price: 3500 },
    { name: 'Inventory Control', slug: 'inventory-control', description: 'Real-time stock tracking, expiry alerts, auto-reorder points, and waste logging.', category: 'Core', price: 4000 },
    { name: 'Multi-Branch', slug: 'multi-branch', description: 'Centralized management of multiple restaurant locations with inter-branch transfers.', category: 'Premium', price: 4000 },
    { name: 'Staff Scheduling', slug: 'staff-scheduling', description: 'Shift planning, attendance, overtime tracking, and payroll integration for restaurant teams.', category: 'Core', price: 3000 },
    { name: 'Table Reservation', slug: 'table-reservation', description: 'Online and phone reservations with floor plan management and waitlist handling.', category: 'Core', price: 2500 },
    { name: 'Customer CRM', slug: 'customer-crm', description: 'Guest profiles, loyalty programs, visit history, and personalized promotions.', category: 'CRM', price: 3000 },
    { name: 'Kitchen Display', slug: 'kitchen-display', description: 'Real-time KDS for order routing, prep timing, and kitchen workflow management.', category: 'Operations', price: 3500 },
    { name: 'Delivery Management', slug: 'delivery-management', description: 'Online order integration, driver tracking, delivery zones, and commission management.', category: 'Operations', price: 3000 },
    { name: 'Accounting & Finance', slug: 'accounting', description: 'Chart of accounts, daily sales reconciliation, expense tracking, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'Supplier Management', slug: 'supplier-management', description: 'Vendor profiles, purchase orders, delivery tracking, and payment terms management.', category: 'Procurement', price: 2500 },
    { name: 'Menu Engineering', slug: 'menu-engineering', description: 'Menu design, pricing optimization, popularity analysis, and profit margin tracking.', category: 'Premium', price: 3000 },
    { name: 'Reports & Insights', slug: 'reports', description: 'Sales reports, inventory analytics, staff performance, and custom business intelligence.', category: 'Core', price: 2500 },
  ],
  factoryflow: [
    { name: 'Production Planning', slug: 'production-planning', description: 'Plan and schedule production runs, manage work orders, and track manufacturing progress through stages.', category: 'Production', price: 6000 },
    { name: 'Quality Control', slug: 'quality-control', description: 'Inspection workflows, defect tracking, quality certificates, and compliance reporting.', category: 'Quality', price: 4000 },
    { name: 'Maintenance Management', slug: 'maintenance-management', description: 'Preventive and corrective maintenance scheduling, work orders, and equipment health tracking.', category: 'Maintenance', price: 4000 },
    { name: 'Inventory Management', slug: 'inventory-management', description: 'Real-time stock tracking, multi-warehouse management, batch control, and auto-reorder points.', category: 'Inventory', price: 4000 },
    { name: 'Warehouse Management', slug: 'warehouse-management', description: 'Zone/rack/bin management, pick-pack-ship workflows, and warehouse optimization.', category: 'Warehouse', price: 4500 },
    { name: 'Supply Chain Management', slug: 'supply-chain', description: 'Supplier management, procurement, purchase orders, and supply chain visibility.', category: 'Supply Chain', price: 5000 },
    { name: 'Cost Estimation', slug: 'cost-estimation', description: 'BOM costing, labor costing, overhead allocation, and profit margin analysis.', category: 'Finance', price: 3500 },
    { name: 'Equipment Tracking', slug: 'equipment-tracking', description: 'Asset registry, equipment lifecycle tracking, calibration schedules, and depreciation.', category: 'Operations', price: 3000 },
    { name: 'Shop Floor Control', slug: 'shop-floor-control', description: 'Real-time production monitoring, operator assignments, and work center management.', category: 'Production', price: 5000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Employee management, attendance, shifts, payroll processing, and safety training tracking.', category: 'HR', price: 3500 },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Chart of accounts, invoicing, expense tracking, cost centers, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'CRM & Sales', slug: 'crm-sales', description: 'Customer profiles, lead management, quotations, order tracking, and sales analytics.', category: 'CRM', price: 3000 },
    { name: 'Reports & Analytics', slug: 'reports-analytics', description: 'Production reports, KPI dashboards, OEE tracking, and custom business intelligence.', category: 'Analytics', price: 2500 },
    { name: 'API & Integration', slug: 'api-integration', description: 'REST API, webhooks, IoT device integration, and third-party system connectors.', category: 'Add-on', price: 3000 },
  ],
  autoflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time workshop insights with revenue tracking, service analytics, and KPI monitoring.', category: 'Core', price: 0 },
    { name: 'Workshop Management', slug: 'workshop-management', description: 'Manage service bays, technician assignments, job scheduling, and workshop capacity planning.', category: 'Core', price: 5000 },
    { name: 'Vehicle Tracking', slug: 'vehicle-tracking', description: 'Vehicle registration, service history, mileage tracking, and maintenance schedules.', category: 'Core', price: 4000 },
    { name: 'Service Orders', slug: 'service-orders', description: 'Create and manage service/repair orders with diagnostics, labor, and parts estimation.', category: 'Core', price: 5000 },
    { name: 'Inventory Control', slug: 'inventory-control', description: 'Spare parts inventory, stock tracking, barcode support, and auto-reorder points.', category: 'Core', price: 4000 },
    { name: 'Supplier Management', slug: 'supplier-management', description: 'Vendor profiles, parts catalogs, payment terms, and supplier performance tracking.', category: 'Procurement', price: 2500 },
    { name: 'Purchase Orders', slug: 'purchase-orders', description: 'Purchase order creation, goods receiving, return management, and invoice matching.', category: 'Procurement', price: 3000 },
    { name: 'Procurement', slug: 'procurement', description: 'Automated procurement workflows, RFQ management, and approval chains.', category: 'Procurement', price: 3500 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Technician management, attendance, shifts, payroll processing, and skill tracking.', category: 'HR', price: 3500 },
    { name: 'Accounting & Finance', slug: 'accounting', description: 'Chart of accounts, invoicing, expense tracking, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'Customer CRM', slug: 'customer-crm', description: 'Customer profiles, vehicle ownership history, service reminders, and loyalty programs.', category: 'CRM', price: 3000 },
    { name: 'Reports & Analytics', slug: 'reports', description: 'Service reports, revenue analytics, technician productivity, and custom dashboards.', category: 'Analytics', price: 2500 },
    { name: 'Job Card Management', slug: 'job-cards', description: 'Digital job cards with checklists, photo documentation, and customer approval workflows.', category: 'Operations', price: 3000 },
    { name: 'Parts Catalog', slug: 'parts-catalog', description: 'Searchable parts database with cross-references, compatibility lookup, and pricing tiers.', category: 'Inventory', price: 2000 },
  ],
  healthflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time hospital insights with patient flow, bed occupancy, and revenue KPIs.', category: 'Core', price: 0 },
    { name: 'Patient Management', slug: 'patient-management', description: 'Complete patient profiles, medical history, admissions, discharges, and transfers.', category: 'Core', price: 5000 },
    { name: 'Appointment Scheduling', slug: 'appointment-scheduling', description: 'Online and walk-in appointment booking with doctor availability and slot management.', category: 'Core', price: 4000 },
    { name: 'Electronic Health Records', slug: 'ehr', description: 'Digital health records, prescriptions, lab results, and imaging with audit trails.', category: 'Core', price: 6000 },
    { name: 'Billing & Insurance', slug: 'billing-insurance', description: 'Patient billing, insurance claims, co-pay management, and payment processing.', category: 'Core', price: 4000 },
    { name: 'Pharmacy Integration', slug: 'pharmacy', description: 'In-house pharmacy management, drug dispensing, stock tracking, and expiry alerts.', category: 'Core', price: 3500 },
    { name: 'Lab Management', slug: 'lab-management', description: 'Lab test ordering, result entry, sample tracking, and report generation.', category: 'Core', price: 4000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Doctor and staff management, shifts, payroll, leave tracking, and performance reviews.', category: 'HR', price: 3500 },
    { name: 'Inventory Management', slug: 'inventory', description: 'Medical supplies, equipment tracking, auto-reorder points, and vendor management.', category: 'Operations', price: 3000 },
    { name: 'Reports & Analytics', slug: 'reports', description: 'Clinical reports, financial analytics, patient demographics, and custom dashboards.', category: 'Analytics', price: 2500 },
  ],
  textileflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time production insights with order tracking, quality metrics, and inventory KPIs.', category: 'Core', price: 0 },
    { name: 'Yarn Management', slug: 'yarn-management', description: 'Yarn inventory, lot tracking, supplier management, and consumption planning.', category: 'Production', price: 4000 },
    { name: 'Fabric Production', slug: 'fabric-production', description: 'Weaving and knitting production planning, machine scheduling, and output tracking.', category: 'Production', price: 5000 },
    { name: 'Dyeing & Finishing', slug: 'dyeing-finishing', description: 'Dye batch management, color recipes, finishing processes, and quality inspection.', category: 'Production', price: 4500 },
    { name: 'Order Tracking', slug: 'order-tracking', description: 'End-to-end order lifecycle from inquiry to shipment with status tracking.', category: 'Sales', price: 4000 },
    { name: 'Quality Assurance', slug: 'quality-assurance', description: 'Inspection workflows, defect tracking, test reports, and compliance certificates.', category: 'Quality', price: 4000 },
    { name: 'Export Management', slug: 'export-management', description: 'Export documentation, shipping, customs compliance, and letter of credit tracking.', category: 'Operations', price: 3500 },
    { name: 'Inventory Management', slug: 'inventory', description: 'Raw materials, WIP, and finished goods tracking with multi-warehouse support.', category: 'Inventory', price: 4000 },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Chart of accounts, invoicing, cost tracking, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Employee management, attendance, shifts, payroll, and compliance tracking.', category: 'HR', price: 3500 },
  ],
  creativeflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Project pipeline, resource utilization, revenue tracking, and team performance KPIs.', category: 'Core', price: 0 },
    { name: 'Project Management', slug: 'project-management', description: 'Project planning, milestones, deliverables, and status tracking with Kanban and Gantt views.', category: 'Core', price: 5000 },
    { name: 'Time Tracking', slug: 'time-tracking', description: 'Timesheets, billable hours, project time allocation, and productivity analytics.', category: 'Core', price: 3000 },
    { name: 'Client Portal', slug: 'client-portal', description: 'Self-service portal for clients to view project progress, approve deliverables, and communicate.', category: 'Core', price: 4000 },
    { name: 'Invoicing', slug: 'invoicing', description: 'Project-based invoicing, recurring billing, payment tracking, and financial reporting.', category: 'Finance', price: 3500 },
    { name: 'Resource Planning', slug: 'resource-planning', description: 'Team allocation, skill matching, workload balancing, and capacity planning.', category: 'Operations', price: 4000 },
    { name: 'Collaboration', slug: 'collaboration', description: 'File sharing, version control, feedback loops, and real-time commenting on deliverables.', category: 'Core', price: 3000 },
    { name: 'CRM & Leads', slug: 'crm-leads', description: 'Lead pipeline, client profiles, opportunity tracking, and conversion analytics.', category: 'CRM', price: 3000 },
    { name: 'Reports & Analytics', slug: 'reports', description: 'Project profitability, team utilization, client analytics, and custom dashboards.', category: 'Analytics', price: 2500 },
  ],
  distriflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time distribution insights with sales analytics, inventory levels, and route KPIs.', category: 'Core', price: 0 },
    { name: 'Distribution Planning', slug: 'distribution-planning', description: 'Order fulfillment planning, allocation rules, and distribution scheduling.', category: 'Core', price: 5000 },
    { name: 'Warehouse Management', slug: 'warehouse-management', description: 'Multi-warehouse support, zone/bin management, pick-pack-ship, and stock optimization.', category: 'Core', price: 5000 },
    { name: 'Sales Order Processing', slug: 'sales-order-processing', description: 'Order capture, pricing, promotions, back-order management, and shipment planning.', category: 'Sales', price: 4000 },
    { name: 'Purchase Management', slug: 'purchase-management', description: 'Purchase orders, supplier management, goods receiving, and invoice matching.', category: 'Procurement', price: 3500 },
    { name: 'Route Planning', slug: 'route-planning', description: 'Delivery route optimization, vehicle scheduling, and driver assignment.', category: 'Operations', price: 4000 },
    { name: 'Returns Management', slug: 'returns-management', description: 'Return processing, credit notes, quality inspection, and restocking workflows.', category: 'Operations', price: 2500 },
    { name: 'Van Sales', slug: 'van-sales', description: 'Mobile sales for delivery vans with route-based selling and cash collection.', category: 'Sales', price: 3500 },
    { name: 'Trade Promotions', slug: 'trade-promotions', description: 'Promotion planning, execution tracking, ROI analysis, and scheme management.', category: 'Sales', price: 3000 },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Chart of accounts, invoicing, expense tracking, and financial reporting.', category: 'Finance', price: 4000 },
    { name: 'HR & Payroll', slug: 'hr-payroll', description: 'Staff management, attendance, shifts, payroll processing, and compliance tracking.', category: 'HR', price: 3500 },
  ],
  logisticflow: [
    { name: 'Dashboard & Analytics', slug: 'dashboard', description: 'Real-time logistics insights with shipment tracking, fleet status, and warehouse KPIs.', category: 'Core', price: 0 },
    { name: 'Fleet Management', slug: 'fleet-management', description: 'Vehicle registry, maintenance scheduling, fuel tracking, and driver management.', category: 'Core', price: 5000 },
    { name: 'Route Optimization', slug: 'route-optimization', description: 'AI-powered route planning, delivery sequencing, and real-time traffic integration.', category: 'Core', price: 5000 },
    { name: 'Warehouse Management', slug: 'warehouse-management', description: 'Multi-warehouse support, zone/bin management, pick-pack-ship, and cross-docking.', category: 'Core', price: 5000 },
    { name: 'Shipment Tracking', slug: 'shipment-tracking', description: 'End-to-end shipment visibility, GPS tracking, ETA prediction, and status updates.', category: 'Core', price: 4500 },
    { name: 'Order Fulfillment', slug: 'order-fulfillment', description: 'Order processing, pick allocation, packing, dispatch, and delivery confirmation.', category: 'Operations', price: 4000 },
    { name: 'Cross-Docking', slug: 'cross-docking', description: 'Streamlined transfer operations, dock scheduling, and quick turnaround management.', category: 'Operations', price: 3000 },
    { name: 'Inventory Control', slug: 'inventory-control', description: 'Real-time stock tracking, multi-warehouse inventory, batch management, and cycle counting.', category: 'Inventory', price: 4000 },
    { name: 'Customer Management', slug: 'customer-management', description: 'Customer profiles, contract management, SLA tracking, and communication history.', category: 'CRM', price: 3000 },
    { name: 'Serial Key Licensing', slug: 'serial-key-licensing', description: 'Software license management, serial key generation, activation tracking, and device binding.', category: 'Admin', price: 3000 },
    { name: 'Invoice Management', slug: 'invoice-management', description: 'Freight invoicing, billing, payment tracking, and financial reporting.', category: 'Finance', price: 3500 },
    { name: 'Reports & Analytics', slug: 'reports-analytics', description: 'Operational reports, fleet analytics, warehouse metrics, and custom dashboards.', category: 'Analytics', price: 2500 },
  ],
}

const PACKAGES = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for small businesses getting started with ERP management.',
    price: 15000,
    currency: 'PKR',
    plan: 'starter',
    features: 'Up to 5 users,1 location,1000 items,Email support,Basic reporting',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'Ideal for growing businesses that need more power and flexibility.',
    price: 35000,
    currency: 'PKR',
    plan: 'professional',
    features: 'Up to 25 users,5 locations,10000 items,Priority support,Advanced reporting,API access,Custom workflows',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations requiring unlimited scale and premium support.',
    price: 80000,
    currency: 'PKR',
    plan: 'enterprise',
    features: 'Unlimited users,50 locations,Unlimited items,24/7 dedicated support,Custom reporting,Full API access,Custom integrations,SLA guarantee,On-premise option',
    sortOrder: 3,
    isActive: true,
  },
]

export async function POST() {
  try {
    // Delete all data in correct order (respecting foreign keys)
    await withRetry((db) => db.syncEvent.deleteMany())
    await withRetry((db) => db.syncTenant.deleteMany())
    await withRetry((db) => db.syncConnector.deleteMany())
    await withRetry((db) => db.invoice.deleteMany())
    await withRetry((db) => db.payment.deleteMany())
    await withRetry((db) => db.order.deleteMany())
    await withRetry((db) => db.license.deleteMany())
    await withRetry((db) => db.subscription.deleteMany())
    await withRetry((db) => db.client.deleteMany())
    await withRetry((db) => db.package.deleteMany())
    await withRetry((db) => db.erpSystem.deleteMany())
    await withRetry((db) => db.paymentAccount.deleteMany())
    await withRetry((db) => db.paymentSettings.deleteMany())
    await withRetry((db) => db.paymentAuditLog.deleteMany())
    await withRetry((db) => db.siteSetting.deleteMany())
    await withRetry((db) => db.session.deleteMany())
    await withRetry((db) => db.auditLog.deleteMany())
    await withRetry((db) => db.user.deleteMany())
    await withRetry((db) => db.tenantSetting.deleteMany())
    await withRetry((db) => db.tenant.deleteMany())

    // Create default tenant first (User requires tenantId)
    const defaultTenant = await withRetry((db) =>
      db.tenant.create({
        data: {
          name: 'ApexFlow Cloud',
          slug: 'apexflow-cloud',
          domain: 'apexflow.cloud',
          subscription: 'enterprise',
          maxBranches: 100,
          maxUsers: 500,
        },
      })
    )

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@180H', 12)
    const admin = await withRetry((db) =>
      db.user.create({
        data: {
          tenantId: defaultTenant.id,
          email: 'admin@apexflow.cloud',
          name: 'System Administrator',
          password: hashedPassword,
          role: 'admin',
        },
      })
    )

    // Create ERP systems
    const erpSystems = await Promise.all(
      ERP_SYSTEMS.map((erp) =>
        withRetry((db) => db.erpSystem.create({ data: erp }))
      )
    )

    // Modules are stored in features field of ErpSystem (no separate ErpModule model)
    const moduleCount = 0

    // Create packages
    const packages = await Promise.all(
      PACKAGES.map((pkg) =>
        withRetry((db) => db.package.create({ data: pkg }))
      )
    )

    // Create SyncConnector records for active ERPs (connected via cross-DB)
    const activeErpSlugs = ['apparelflow', 'hotelflow', 'eduflow', 'martflow', 'pharmaflow', 'buildflow', 'travelflow', 'tenantflow', 'factoryflow', 'foodflow', 'autoflow', 'healthflow', 'textileflow', 'creativeflow', 'distriflow', 'logisticflow', 'bookflow', 'fuelflow']
    const connectorWebsites: Record<string, string> = {
      apparelflow: 'https://apparelflowerp.vercel.app',
      hotelflow: 'https://hotelflowerp.vercel.app',
      eduflow: 'https://eduflowerp.vercel.app',
      martflow: 'https://martflowerp.vercel.app',
      pharmaflow: 'https://pharmaflowerp.vercel.app',
      buildflow: 'https://buildflowerp.vercel.app',
      travelflow: 'https://travelflowerp.vercel.app',
      tenantflow: 'https://tenantflowerp.vercel.app',
      factoryflow: 'https://factoryflowerp.vercel.app',
      foodflow: 'https://foodflowerp.vercel.app',
      autoflow: 'https://autoflowerp.vercel.app',
      healthflow: 'https://healthflowerp.vercel.app',
      textileflow: 'https://textileflowerp.vercel.app',
      creativeflow: 'https://creativeflowerp.vercel.app',
      distriflow: 'https://distriflowerp.vercel.app',
      logisticflow: 'https://logisticflowerp.vercel.app',
      bookflow: 'https://bookflowerp.vercel.app',
      fuelflow: 'https://fuelflowerp.vercel.app',
    }
    let connectorCount = 0
    for (const erp of erpSystems) {
      if (activeErpSlugs.includes(erp.slug)) {
        await withRetry((db) =>
          db.syncConnector.create({
            data: {
              erpSystemId: erp.id,
              name: `${erp.name} Database Connector`,
              type: 'bidirectional',
              status: 'active',
              lastSyncAt: new Date(),
              recordsSynced: Math.floor(Math.random() * 500) + 100,
              config: JSON.stringify({
                provider: 'neon-postgresql',
                region: 'us-east-1',
                pooler: true,
                ssl: true,
              }),
            },
          })
        )
        connectorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: 1,
        erpSystems: erpSystems.length,
        modules: moduleCount,
        packages: packages.length,
        connectors: connectorCount,
        adminEmail: admin.email,
      },
    })
  } catch (error) {
    console.error('[SEED] Failed:', error)
    return NextResponse.json(
      { success: false, message: 'Seeding failed', error: String(error) },
      { status: 500 }
    )
  }
}
