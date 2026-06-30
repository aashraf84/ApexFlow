/* ══════════════════════════════════════════════════════════════
   ERP Detail Data — Rich content for each ERP detail page
   ══════════════════════════════════════════════════════════════ */

export interface ErpDetailData {
  slug: string
  name: string
  tagline: string
  heroDescription: string
  industry: string
  industrySlug: string
  icon: string
  color: string
  website: string
  pricing: string
  pkrMonthly: number

  /* Key metrics shown in the hero */
  stats: { label: string; value: string }[]

  /* Modules / capabilities */
  modules: {
    name: string
    description: string
    icon: string
  }[]

  /* Pain points this ERP solves */
  painPoints: {
    title: string
    before: string
    after: string
  }[]

  /* Workflow steps showing how it works */
  workflow: {
    step: string
    title: string
    description: string
  }[]

  /* Benefits / ROI */
  benefits: {
    title: string
    description: string
    metric: string
  }[]

  /* Testimonials */
  testimonials: {
    quote: string
    name: string
    title: string
    company: string
    avatar: string
  }[]

  /* FAQ */
  faqs: {
    question: string
    answer: string
  }[]

  /* Key differentiators */
  differentiators: string[]

  /* Detailed features per module - each module gets 5-8 specific feature items */
  moduleFeatures: {
    moduleName: string
    features: string[]
  }[]

  /* Chart data for performance visualization */
  chartData: {
    month: string
    efficiency: number
    revenue: number
    satisfaction: number
  }[]

  /* Integration ecosystem */
  integrations: {
    name: string
    category: string
    icon: string
  }[]

  /* Security & compliance features */
  securityFeatures: string[]

  /* Feature comparison: vs manual/spreadsheet */
  comparisonData: {
    feature: string
    manual: string
    withErp: string
  }[]
}

/* ────────────────────────────────────────────────────────── */

export const ERP_DETAILS: Record<string, ErpDetailData> = {
  apparelflow: {
    slug: 'apparelflow',
    name: 'ApparelFlow',
    tagline: 'From Loom to Shelf — One Seamless Flow',
    heroDescription: 'ApparelFlow is the complete ERP built for the apparel and textile industry. Manage production planning, inventory, order processing, supply chain tracking, quality control, and financial operations — all from one powerful platform that understands how your business weaves together.',
    industry: 'Apparel & Textile',
    industrySlug: 'apparel-textile',
    icon: 'shirt',
    color: 'teal',
    website: 'https://apparelflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Production Efficiency', value: '40%' },
      { label: 'Inventory Accuracy', value: '99.2%' },
      { label: 'Order Fulfillment', value: '3x Faster' },
      { label: 'Waste Reduction', value: '25%' },
    ],

    modules: [
      { name: 'CRM & Sales', description: 'Manage leads, customers, logistics shipments, and shipping partner integrations with comprehensive sales reporting.', icon: 'shopping' },
      { name: 'Production Planning', description: 'Plan production orders, BOM, production logs, cost sheets, and tech packs with real-time shop floor tracking.', icon: 'factory' },
      { name: 'Procurement', description: 'Handle purchase orders, supplier management, purchase returns, and units & measurements with procurement reporting.', icon: 'truck' },
      { name: 'Warehouse Management', description: 'Multi-warehouse operations including main warehouse, factory warehouse, raw materials, and stock audit with GRN and dispatch.', icon: 'package' },
      { name: 'Retail & POS', description: 'Shop POS billing, shop inventory, planning, expenses, payments, returns, and transfers alongside wholesale order management.', icon: 'shopping' },
      { name: 'Finance & Accounting', description: 'Chart of accounts, journal entries, client invoices and payments, advances, transfer vouchers, and finance reporting.', icon: 'landmark' },
      { name: 'HR & Payroll', description: 'Employee management, attendance, shifts, payroll processing, and department-wise HR reporting.', icon: 'users' },
      { name: 'Costing & FBR', description: 'Cost sheet management, FBR integration for tax compliance, and discount management across all channels.', icon: 'receipt' },
      { name: 'AI Hub', description: 'AI-powered insights for demand forecasting, production optimization, and intelligent business recommendations.', icon: 'cpu' },
      { name: 'Raw Materials', description: 'Track raw material inward, issues, returns, stock levels, and reports with batch-level traceability.', icon: 'scissors' },
    ],

    painPoints: [
      { title: 'Production Delays', before: 'Manual scheduling leads to missed deadlines and overtime costs.', after: 'Automated production planning with real-time capacity visibility — deliver on time, every time.' },
      { title: 'Inventory Chaos', before: 'Disconnected stock counts across warehouses cause overstocking and stockouts.', after: 'Unified inventory with real-time tracking, auto-reorder triggers, and batch traceability.' },
      { title: 'Quality Failures', before: 'Defects caught too late result in costly rework and rejected shipments.', after: 'Inline quality checkpoints catch issues early, reducing rework by 60%.' },
      { title: 'Order Blindness', before: 'No visibility into order status — buyers call constantly for updates.', after: 'Real-time order tracking with buyer portal — everyone sees status instantly.' },
    ],

    workflow: [
      { step: '01', title: 'Receive Order', description: 'Buyer places order via portal or manual entry. System auto-validates inventory and capacity.' },
      { step: '02', title: 'Plan Production', description: 'AI-driven scheduling allocates lines, materials, and labor. Critical path highlighted automatically.' },
      { step: '03', title: 'Execute & Track', description: 'Shop floor data capture tracks every operation. Quality checkpoints ensure zero defects escape.' },
      { step: '04', title: 'Ship & Invoice', description: 'Auto-generate packing lists, invoices, and shipping docs. Buyer notified in real-time.' },
    ],

    benefits: [
      { title: 'Faster Time-to-Market', description: 'Reduce lead times from order to shipment by 35% with streamlined production workflows.', metric: '35%' },
      { title: 'Zero Stock Outs', description: 'AI-powered demand forecasting ensures you always have the right materials at the right time.', metric: '99.2%' },
      { title: 'Higher Margins', description: 'Reduce waste, rework, and excess inventory — directly improving your bottom line.', metric: '25%' },
      { title: 'Buyer Satisfaction', description: 'Self-service portal and real-time tracking build trust and reduce communication overhead.', metric: '4.9/5' },
    ],

    testimonials: [
      { quote: 'Managing 45 stores across Pakistan with manual inventory was unsustainable. ApparelFlow gave us real-time stock visibility and cut our overstock by 40%. Our seasonal planning is finally data-driven.', name: 'Shamyl Sultan', title: 'Chief Operating Officer', company: 'Khaadi', avatar: 'SS' },
      { quote: 'We were losing track of orders between our design studio and production units. ApparelFlow connected everything — from sketch to shelf. Our order fulfillment rate jumped from 78% to 96%.', name: 'Sana Hashwani', title: 'Co-Founder', company: 'Sana Safinaz', avatar: 'SH' },
      { quote: 'With 700+ retail outlets and export operations, we needed something that understands apparel, not just generic retail. The fabric tracking and BOM modules alone saved us PKR 25 million in wastage last year.', name: 'Ziad Bashir', title: 'Director', company: 'Gul Ahmed', avatar: 'ZB' },
    ],

    faqs: [
      { question: 'How long does it take to implement ApparelFlow?', answer: 'Typical implementation takes 4-8 weeks depending on your operation size. Our team handles data migration, configuration, and training. You\'ll see value from day one of go-live.' },
      { question: 'Can ApparelFlow handle multi-factory operations?', answer: 'Absolutely. ApparelFlow is designed for multi-location operations. Track production, inventory, and orders across all your factories from a single dashboard with consolidated reporting.' },
      { question: 'Does it integrate with our existing accounting software?', answer: 'Yes. ApparelFlow integrates with QuickBooks, Xero, Tally, and SAP. Our API also allows custom integrations with any system your business uses.' },
      { question: 'What about fabric and yarn tracking?', answer: 'ApparelFlow includes dedicated fabric and yarn tracking modules with batch-level traceability, consumption analytics, and wastage monitoring — essential for textile operations.' },
    ],

    differentiators: [
      'Purpose-built for apparel — not a generic ERP with textile add-ons',
      'Inline quality control with AQL sampling built in',
      'Buyer self-service portal included in every plan',
      'Fabric & yarn tracking with batch traceability',
      'AI-driven production scheduling and demand forecasting',
    ],

    moduleFeatures: [
      { moduleName: 'CRM & Sales', features: ['Lead & opportunity tracking', 'Customer database with order history', 'Logistics & shipment management', 'Shipping partner integration', 'Sales reports & pipeline analytics', 'Quotation & order conversion'] },
      { moduleName: 'Production Planning', features: ['Production order creation & tracking', 'Bill of materials (BOM) management', 'Production log & milestone tracking', 'Cost sheet generation per style', 'Tech pack management & approval', 'Capacity planning & line balancing'] },
      { moduleName: 'Procurement', features: ['Purchase order automation', 'Supplier management & scoring', 'Purchase return processing', 'Units & measurements configuration', 'Procurement reports & spend analysis', 'Lead time tracking & optimization'] },
      { moduleName: 'Warehouse Management', features: ['GRN (Goods Receipt Note) processing', 'Dispatch & shipment management', 'Multi-warehouse stock tracking', 'Returns processing workflow', 'Warehouse reports & analytics', 'Stock audit & cycle counting'] },
      { moduleName: 'Retail & POS', features: ['POS billing with barcode scanning', 'Shop inventory management', 'Shop planning & scheduling', 'Shop expenses & payments tracking', 'Shop returns & transfer management', 'Wholesale order & inventory management'] },
      { moduleName: 'Finance & Accounting', features: ['Chart of accounts management', 'Journal entries & posting', 'Client invoice & payment tracking', 'Manual payments & advances', 'Transfer voucher management', 'Finance reports & P&L statements'] },
      { moduleName: 'HR & Payroll', features: ['Employee profile management', 'Attendance & shift tracking', 'Payroll processing & disbursement', 'Department management', 'HR & payroll reports', 'Leave & overtime management'] },
      { moduleName: 'Costing & FBR', features: ['Cost sheet creation & comparison', 'FBR integration for tax filing', 'Discount management across channels', 'Cost variance analysis', 'Markup & margin calculation', 'Regulatory compliance reporting'] },
      { moduleName: 'AI Hub', features: ['Demand forecasting AI', 'Production optimization suggestions', 'Intelligent business insights', 'Anomaly detection & alerts', 'Predictive maintenance triggers', 'Smart inventory recommendations'] },
      { moduleName: 'Raw Materials', features: ['RM inward & receipt tracking', 'RM issue & allocation management', 'RM returns processing', 'RM stock level monitoring', 'RM reports & consumption analysis', 'Batch-level traceability'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 62, revenue: 4500, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 67, revenue: 5200, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 72, revenue: 5800, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 78, revenue: 6400, satisfaction: 4.3 },
      { month: 'May', efficiency: 84, revenue: 7100, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 89, revenue: 7800, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'Shopify', category: 'E-commerce', icon: 'shopping' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'FedEx', category: 'Shipping', icon: 'truck' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control with granular permissions',
      'Complete audit trail for all transactions',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'SOC 2 Type II compliant infrastructure',
    ],

    comparisonData: [
      { feature: 'Production Scheduling', manual: 'Whiteboards & spreadsheets, manually updated daily', withErp: 'AI-driven auto-scheduling with real-time capacity visibility' },
      { feature: 'Inventory Tracking', manual: 'End-of-day manual counts, delayed stock updates', withErp: 'Real-time barcode/RFID scanning, instant stock visibility' },
      { feature: 'Quality Inspection', manual: 'Paper checklists, defects found after shipment', withErp: 'Digital inline inspection, defects caught at source' },
      { feature: 'Order Status', manual: 'Phone calls & emails to check order progress', withErp: 'Self-service buyer portal with live tracking' },
      { feature: 'Financial Reporting', manual: 'Weeks of manual consolidation in spreadsheets', withErp: 'Real-time P&L, cash flow, and profitability dashboards' },
      { feature: 'Compliance Management', manual: 'Manual certificate tracking, missed renewals', withErp: 'Automated compliance alerts and certificate management' },
    ],
  },

  hotelflow: {
    slug: 'hotelflow',
    name: 'HotelFlow',
    tagline: 'Every Guest. Every Room. One Flow.',
    heroDescription: 'HotelFlow is the comprehensive hospitality management system that runs your entire hotel operation. From reservations and front desk to housekeeping, F&B, revenue management, and guest CRM — everything flows through one intelligent platform.',
    industry: 'Hospitality',
    industrySlug: 'hospitality',
    icon: 'hotel',
    color: 'amber',
    website: 'https://hotelflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Occupancy Boost', value: '22%' },
      { label: 'RevPAR Increase', value: '18%' },
      { label: 'Check-in Speed', value: '5x Faster' },
      { label: 'Guest Satisfaction', value: '4.8/5' },
    ],

    modules: [
      { name: 'PMS', description: 'Complete Property Management System for hotel operations, room management, and property-wide coordination.', icon: 'building' },
      { name: 'Reservations', description: 'Centralized booking engine with channel manager, rate parity, and overbooking protection across all channels.', icon: 'calendar' },
      { name: 'Front Desk', description: 'Express check-in/out, room assignment optimization, guest request tracking, and lobby management.', icon: 'monitor' },
      { name: 'Housekeeping', description: 'Automated room scheduling, task assignment, and real-time status tracking for housekeeping teams.', icon: 'sparkles' },
      { name: 'Finance', description: 'Revenue management, dynamic pricing, financial reporting, and multi-property accounting consolidation.', icon: 'landmark' },
      { name: 'CRM', description: '360° guest profiles with preference tracking, loyalty management, and personalized communication.', icon: 'users' },
      { name: 'Inventory & Procurement', description: 'F&B and supplies inventory management with automated procurement and vendor coordination.', icon: 'package' },
      { name: 'HR Management', description: 'Staff scheduling, payroll processing, training management, and labor cost optimization.', icon: 'briefcase' },
      { name: 'Events & Banquets', description: 'End-to-end event management from booking to execution with banquet planning and resource allocation.', icon: 'users' },
      { name: 'Spa & Wellness', description: 'Spa appointment scheduling, treatment management, therapist allocation, and wellness package billing.', icon: 'heart' },
      { name: 'POS System', description: 'Restaurant and outlet POS with menu management, table billing, and automatic folio posting.', icon: 'shopping' },
      { name: 'Reports & Revenue', description: 'Comprehensive reporting dashboards with RevPAR, ADR, occupancy analytics, and revenue forecasting.', icon: 'bar-chart' },
      { name: 'Booking Engine', description: 'Direct online booking engine for the hotel website with real-time availability and payment processing.', icon: 'globe' },
      { name: 'Channel Manager', description: 'Real-time inventory sync across 50+ OTAs including Booking.com, Agoda, and Expedia with rate management.', icon: 'globe' },
    ],

    painPoints: [
      { title: 'Overbooking Nightmares', before: 'Manual booking across channels leads to double-bookings and guest complaints.', after: 'Real-time channel manager with automatic sync — overbooking becomes impossible.' },
      { title: 'Slow Check-in', before: 'Guests wait in long lines while staff fumbles with paperwork and system lookups.', after: 'Express check-in in under 2 minutes with pre-arrival registration and digital keys.' },
      { title: 'Revenue Leakage', before: 'Static pricing leaves money on the table during peak demand periods.', after: 'Dynamic pricing engine adjusts rates in real-time based on demand, competition, and events.' },
      { title: 'Housekeeping Chaos', before: 'No visibility into room status — guests check into uncleaned rooms.', after: 'Real-time room status with auto-assignment of housekeeping tasks as guests check out.' },
    ],

    workflow: [
      { step: '01', title: 'Book & Confirm', description: 'Guest books through any channel. Reservation auto-syncs across all platforms instantly.' },
      { step: '02', title: 'Pre-Arrival', description: 'Guest completes registration online. Room assigned based on preferences and availability.' },
      { step: '03', title: 'Check-in & Serve', description: 'Express check-in with digital key. Housekeeping, F&B, and concierge all notified of arrival.' },
      { step: '04', title: 'Check-out & Follow-up', description: 'Express check-out with auto-folio. Guest profile updated for personalized future stays.' },
    ],

    benefits: [
      { title: 'Higher Revenue', description: 'Dynamic pricing and channel management increase RevPAR by an average of 18%.', metric: '18%' },
      { title: 'Faster Operations', description: 'Express check-in/out reduces front desk wait times by 80%.', metric: '80%' },
      { title: 'Guest Loyalty', description: 'Personalized experiences and preference tracking drive repeat bookings.', metric: '4.8/5' },
      { title: 'Zero Overbooking', description: 'Real-time sync across all channels eliminates double-bookings entirely.', metric: '100%' },
    ],

    testimonials: [
      { quote: 'Managing properties from Islamabad to Skardu, we needed a system that handles diverse guest profiles. HotelFlow\'s channel manager alone increased our direct bookings by 35%, saving us PKR 18 million in OTA commissions last year.', name: 'Aziz Boolani', title: 'CEO', company: 'Serena Hotels', avatar: 'AB' },
      { quote: 'With 7 Pearl Continental hotels and convention centers, consistency is everything. HotelFlow standardized our operations — same SOPs, same reporting, same guest experience across every property.', name: 'Haji Hashim', title: 'Director Operations', company: 'Pearl Continental — Hashoo Group', avatar: 'HH' },
      { quote: 'Our RevPAR improved 28% in the first year. The dynamic pricing engine adjusts rates based on demand, local events, and competitor analysis. We were leaving serious money on the table before.', name: 'Nadeem Iqbal', title: 'Revenue Manager', company: 'Shangri-La Boutique', avatar: 'NI' },
    ],

    faqs: [
      { question: 'Can HotelFlow manage multiple properties?', answer: 'Yes. HotelFlow is built for multi-property operations with centralized management and property-level autonomy. View consolidated reports or drill down to individual properties.' },
      { question: 'Does it connect to OTAs like Booking.com and Agoda?', answer: 'Absolutely. HotelFlow\'s channel manager integrates with 50+ OTAs including Booking.com, Agoda, Expedia, and TripAdvisor — all synced in real-time.' },
      { question: 'How does the dynamic pricing work?', answer: 'Our revenue management engine analyzes historical data, local events, competitor rates, and demand patterns to automatically suggest optimal rates. You can auto-apply or review before approval.' },
      { question: 'What about POS for restaurants?', answer: 'HotelFlow includes a full F&B module with POS for restaurants, bars, and room service. Charges automatically post to guest folios for seamless billing.' },
    ],

    differentiators: [
      'Purpose-built for hotels — not a generic system with hospitality patches',
      'Real-time channel manager with 50+ OTA integrations',
      'Dynamic revenue management engine included',
      'Guest CRM with 360° preference tracking',
      'Automated night audit with full reconciliation',
    ],

    moduleFeatures: [
      { moduleName: 'PMS', features: ['Property-wide operations dashboard', 'Room inventory management', 'Rate plan configuration', 'Property configuration & setup', 'Multi-property coordination', 'System administration & settings'] },
      { moduleName: 'Reservations', features: ['Centralized booking engine', 'Channel manager with 50+ OTAs', 'Rate parity management', 'Overbooking protection', 'Group booking handling', 'Cancellation & modification rules'] },
      { moduleName: 'Front Desk', features: ['Express check-in/out', 'Room assignment optimization', 'Guest request tracking', 'Room upgrade management', 'Walk-in handling', 'Digital key integration'] },
      { moduleName: 'Housekeeping', features: ['Automated room scheduling', 'Task assignment & tracking', 'Real-time room status', 'Deep cleaning schedules', 'Lost & found management', 'Housekeeping mobile app'] },
      { moduleName: 'Finance', features: ['Multi-property accounting', 'Dynamic pricing engine', 'Revenue posting & reconciliation', 'Tax compliance & reporting', 'Accounts payable & receivable', 'Cash flow forecasting'] },
      { moduleName: 'CRM', features: ['360° guest profiles', 'Preference tracking & history', 'Loyalty program management', 'Personalized communication', 'VIP guest management', 'Guest feedback analysis'] },
      { moduleName: 'Inventory & Procurement', features: ['F&B inventory management', 'Supplies procurement automation', 'Vendor coordination portal', 'Auto-reorder triggers', 'Consumption tracking & analysis', 'Cost control & budgeting'] },
      { moduleName: 'HR Management', features: ['Staff scheduling & shifts', 'Payroll processing & disbursement', 'Training & certification tracking', 'Labor cost optimization', 'Performance evaluation', 'Leave & attendance management'] },
      { moduleName: 'Events & Banquets', features: ['Event booking management', 'Banquet planning tools', 'Resource allocation', 'Catering menu management', 'Event BEO generation', 'Post-event billing'] },
      { moduleName: 'Spa & Wellness', features: ['Spa appointment scheduling', 'Treatment catalog management', 'Therapist allocation & scheduling', 'Wellness package billing', 'Guest folio integration', 'Spa revenue reporting'] },
      { moduleName: 'POS System', features: ['Restaurant & outlet POS', 'Menu management & pricing', 'Table billing & split checks', 'Auto folio posting to rooms', 'Inventory auto-depletion', 'End-of-day reconciliation'] },
      { moduleName: 'Reports & Revenue', features: ['RevPAR & ADR dashboards', 'Occupancy analytics', 'Revenue forecasting', 'Competitor rate analysis', 'Department-wise P&L', 'Custom report builder'] },
      { moduleName: 'Booking Engine', features: ['Direct online booking widget', 'Real-time availability display', 'Secure payment processing', 'Promotional rate management', 'Booking confirmation automation', 'Mobile-responsive design'] },
      { moduleName: 'Channel Manager', features: ['Real-time inventory sync', '50+ OTA integrations', 'Rate & availability management', 'Booking notification alerts', 'Channel performance analytics', 'Commission tracking & reporting'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 64, revenue: 3800, satisfaction: 3.7 },
      { month: 'Feb', efficiency: 69, revenue: 4200, satisfaction: 3.9 },
      { month: 'Mar', efficiency: 74, revenue: 4700, satisfaction: 4.1 },
      { month: 'Apr', efficiency: 79, revenue: 5300, satisfaction: 4.4 },
      { month: 'May', efficiency: 85, revenue: 5900, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 91, revenue: 6500, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'Booking.com', category: 'E-commerce', icon: 'globe' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Twilio', category: 'Communication', icon: 'phone' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Agoda', category: 'E-commerce', icon: 'globe' },
    ],

    securityFeatures: [
      'PCI-DSS compliant payment processing',
      'AES-256 data encryption at rest and in transit',
      'Role-based access control per department',
      'Complete audit trail for all transactions',
      'Automated daily backups with disaster recovery',
      'Two-factor authentication (2FA)',
      'GDPR compliance for international guests',
    ],

    comparisonData: [
      { feature: 'Reservation Management', manual: 'Excel sheets per channel, manual double-booking checks', withErp: 'Centralized booking with auto-sync across all OTAs' },
      { feature: 'Guest Check-in', manual: 'Paper forms, manual ID verification, 10+ minutes', withErp: 'Pre-arrival registration, express check-in under 2 minutes' },
      { feature: 'Revenue Optimization', manual: 'Static seasonal rates, manual competitor monitoring', withErp: 'Dynamic pricing engine with real-time demand analysis' },
      { feature: 'Housekeeping', manual: 'Radio calls and paper checklists, room status unknown', withErp: 'Real-time room status with auto-task assignment' },
      { feature: 'Night Audit', manual: 'Hours of manual reconciliation, frequent errors', withErp: 'Automated reconciliation with instant discrepancy alerts' },
      { feature: 'Guest Profiles', manual: 'Scattered notes, no preference history, repeat guests unrecognized', withErp: '360° guest profiles with preference memory and personalization' },
    ],
  },

  eduflow: {
    slug: 'eduflow',
    name: 'EduFlow',
    tagline: 'Where Learning Meets Intelligent Operations',
    heroDescription: 'EduFlow is the all-in-one education management platform built for schools, colleges, and universities. Manage admissions, academics, examinations, fees, library, HR, and alumni — all connected in one seamless system that empowers educators and administrators alike.',
    industry: 'Education',
    industrySlug: 'education',
    icon: 'graduation',
    color: 'emerald',
    website: 'https://eduflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Admission Processing', value: '10x Faster' },
      { label: 'Fee Collection Rate', value: '98%' },
      { label: 'Administrative Time Saved', value: '60%' },
      { label: 'Student Satisfaction', value: '4.7/5' },
    ],

    modules: [
      { name: 'Students Management', description: 'Complete student lifecycle from admission to alumni with academic records, attendance, and progress tracking.', icon: 'users' },
      { name: 'Teachers', description: 'Faculty management with profiles, qualifications, workload tracking, and performance evaluation.', icon: 'users' },
      { name: 'Attendance', description: 'Biometric and digital attendance tracking for students and staff with real-time parent notifications.', icon: 'clipboard' },
      { name: 'Exams & Grades', description: 'Online and offline exam management with grading, transcript generation, and result analytics.', icon: 'file-text' },
      { name: 'Fees & Finance', description: 'Automated fee billing, collection tracking, scholarship management, and payment gateway integration.', icon: 'credit-card' },
      { name: 'LMS / eLearning', description: 'Integrated learning management with course content, assignments, quizzes, and progress tracking.', icon: 'monitor' },
      { name: 'Admissions', description: 'Online admission processing, merit list generation, document verification, and enrollment workflows.', icon: 'book-open' },
      { name: 'Library', description: 'Catalog management, issue/return tracking, digital resources, and overdue notification system.', icon: 'library' },
      { name: 'Labs', description: 'Science and computer lab scheduling, equipment management, and lab session tracking.', icon: 'cpu' },
      { name: 'Scholarships', description: 'Scholarship program management, eligibility criteria, application processing, and disbursement tracking.', icon: 'bar-chart' },
      { name: 'Placements', description: 'Campus placement coordination, company management, interview scheduling, and placement analytics.', icon: 'briefcase' },
      { name: 'Transport', description: 'Bus route management, driver allocation, GPS tracking, and transport fee management.', icon: 'bus' },
      { name: 'Hostel', description: 'Hostel room allocation, mess management, warden coordination, and hostel fee tracking.', icon: 'building' },
      { name: 'HR & Payroll', description: 'Staff management, payroll processing, leave tracking, and performance evaluation.', icon: 'briefcase' },
      { name: 'Alumni Network', description: 'Alumni database, event management, donation tracking, and career networking platform.', icon: 'credit-card' },
    ],

    painPoints: [
      { title: 'Admission Chaos', before: 'Manual application processing creates long queues, lost documents, and frustrated parents.', after: 'Online admissions with automated verification, document management, and merit list generation.' },
      { title: 'Fee Collection Gaps', before: 'Late payments and manual tracking create cash flow problems and reconciliation headaches.', after: 'Automated billing with payment gateways, reminders, and real-time collection dashboards.' },
      { title: 'Exam Management', before: 'Paper-based exam processes are slow, error-prone, and impossible to scale.', after: 'Digital exam management with auto-grading, instant results, and analytics-driven insights.' },
      { title: 'Parent Communication', before: 'Phone calls and WhatsApp groups are the only way to update parents — chaotic and unreliable.', after: 'Structured parent portal with real-time access to grades, attendance, and announcements.' },
    ],

    workflow: [
      { step: '01', title: 'Apply Online', description: 'Students submit applications through the portal. Documents verified automatically against criteria.' },
      { step: '02', title: 'Enroll & Schedule', description: 'Admitted students auto-enrolled in courses. Timetable generated based on program and section.' },
      { step: '03', title: 'Learn & Track', description: 'Attendance, assignments, and grades tracked digitally. Parents see progress in real-time.' },
      { step: '04', title: 'Graduate & Connect', description: 'Transcripts generated automatically. Alumni portal keeps graduates connected for life.' },
    ],

    benefits: [
      { title: 'Faster Admissions', description: 'Process 10x more applications with automated verification and merit list generation.', metric: '10x' },
      { title: 'Higher Fee Collection', description: 'Payment gateways and automated reminders push collection rates to 98%.', metric: '98%' },
      { title: 'Less Admin Burden', description: 'Automate routine tasks so educators can focus on teaching, not paperwork.', metric: '60%' },
      { title: 'Happy Parents', description: 'Real-time visibility into student progress builds trust and engagement.', metric: '4.7/5' },
    ],

    testimonials: [
      { quote: 'EduFlow gave us a single source of truth for 15,000 students, 800 faculty, and 200+ courses. The academic planning module is revolutionary — we can now simulate timetable scenarios before committing.', name: 'Dr. Arshad Ahmad', title: 'Pro Vice Chancellor', company: 'LUMS', avatar: 'AA' },
      { quote: 'Our fee collection rate went from 82% to 98% after implementing EduFlow. The automated reminders and JazzCash integration made all the difference — students pay on time and we stopped chasing receivables.', name: 'Dr. Sulaiman Ladhani', title: 'Director Finance', company: 'Aga Khan University', avatar: 'SL' },
      { quote: 'Running 8 campuses with 12,000 students, we needed centralized control. EduFlow handles everything from admissions to alumni — and the parent portal eliminated 90% of our inquiry calls.', name: 'Lt. Gen. (R) Naweed Zaman', title: 'Rector', company: 'NUST', avatar: 'NZ' },
    ],

    faqs: [
      { question: 'Is EduFlow suitable for both schools and universities?', answer: 'Yes. EduFlow is designed to scale from K-12 schools to large universities. Configuration adapts to your institution type, with features like multi-department management for universities and simplified interfaces for schools.' },
      { question: 'Can students and parents access the system?', answer: 'Absolutely. Students get a dashboard for courses, assignments, and grades. Parents get a dedicated portal for attendance, fee status, and progress tracking — all in real-time.' },
      { question: 'Does EduFlow support online examinations?', answer: 'Yes. EduFlow supports both online and offline examinations with features like question banks, auto-grading, proctoring integration, and instant result publication.' },
      { question: 'What about data migration from our existing system?', answer: 'Our team handles complete data migration from any existing system. We map your data structures, clean and validate records, and ensure zero data loss during transition.' },
    ],

    differentiators: [
      'Built for education — understands academic calendars, grading systems, and institutional hierarchies',
      'Parent portal included in every plan at no extra cost',
      'Online + offline examination management with auto-grading',
      'Automated fee collection with payment gateway integration',
      'Alumni management to maintain lifelong institutional connections',
    ],

    moduleFeatures: [
      { moduleName: 'Students Management', features: ['Admission workflow automation', 'Academic record tracking', 'Progress & promotion tracking', 'Disciplinary records management', 'Student portal access', 'Alumni database integration'] },
      { moduleName: 'Teachers', features: ['Faculty profile management', 'Qualification & certification tracking', 'Workload & class allocation', 'Performance evaluation workflows', 'Professional development tracking', 'Subject & section assignment'] },
      { moduleName: 'Attendance', features: ['Biometric integration', 'Real-time attendance dashboards', 'Automated parent notifications', 'Late arrival & early departure tracking', 'Attendance trend analysis', 'SMS/WhatsApp absence alerts'] },
      { moduleName: 'Exams & Grades', features: ['Question bank management', 'Online exam with proctoring', 'Auto-grading & result publication', 'Transcript generation', 'GPA/CGPA calculation', 'Exam seating arrangements'] },
      { moduleName: 'Fees & Finance', features: ['Automated fee billing cycles', 'Payment gateway integration', 'Scholarship & financial aid management', 'Late fee auto-calculation', 'Fee concession workflows', 'Real-time collection dashboards'] },
      { moduleName: 'LMS / eLearning', features: ['Course content management', 'Assignment & quiz creation', 'Video lecture integration', 'Student progress tracking', 'Discussion forums', 'Grading & feedback system'] },
      { moduleName: 'Admissions', features: ['Online application portal', 'Document verification automation', 'Merit list generation', 'Interview scheduling', 'Enrollment confirmation workflow', 'Waiting list management'] },
      { moduleName: 'Library', features: ['Catalog management system', 'Barcode-based issue/return', 'Digital resource repository', 'Overdue notification engine', 'Reservation & hold system', 'Fines & payment tracking'] },
      { moduleName: 'Labs', features: ['Lab session scheduling', 'Equipment inventory management', 'Lab allocation & booking', 'Safety compliance tracking', 'Practical exam coordination', 'Equipment maintenance logs'] },
      { moduleName: 'Scholarships', features: ['Scholarship program configuration', 'Eligibility criteria engine', 'Application review workflow', 'Disbursement tracking & reporting', 'Merit & need-based categorization', 'Renewal & compliance monitoring'] },
      { moduleName: 'Placements', features: ['Company registration & profiling', 'Campus recruitment scheduling', 'Interview & test coordination', 'Offer letter management', 'Placement analytics & reporting', 'Student preparation tracking'] },
      { moduleName: 'Transport', features: ['Bus route planning & optimization', 'Driver & vehicle management', 'GPS tracking integration', 'Transport fee management', 'Pickup & drop scheduling', 'Emergency contact system'] },
      { moduleName: 'Hostel', features: ['Room allocation & management', 'Mess menu & billing', 'Warden dashboard & coordination', 'Visitor management system', 'Hostel fee tracking', 'Maintenance request portal'] },
      { moduleName: 'HR & Payroll', features: ['Staff lifecycle management', 'Payroll auto-processing', 'Leave management system', 'Performance evaluation workflow', 'Tax deduction automation', 'Appointment letter generation'] },
      { moduleName: 'Alumni Network', features: ['Alumni database & directory', 'Event & reunion management', 'Donation & contribution tracking', 'Career networking platform', 'Mentorship program coordination', 'Newsletter & communication tools'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 60, revenue: 2200, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 65, revenue: 2600, satisfaction: 3.7 },
      { month: 'Mar', efficiency: 70, revenue: 3100, satisfaction: 3.9 },
      { month: 'Apr', efficiency: 76, revenue: 3500, satisfaction: 4.2 },
      { month: 'May', efficiency: 82, revenue: 3900, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 88, revenue: 4400, satisfaction: 4.7 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'EasyPaisa', category: 'Payment', icon: 'credit-card' },
      { name: 'Google Classroom', category: 'E-commerce', icon: 'globe' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access with student data privacy controls',
      'FERPA-compliant student record management',
      'Complete audit trail for all data changes',
      'Automated daily backups with disaster recovery',
      'Two-factor authentication (2FA) for admin access',
      'GDPR compliance for international student data',
    ],

    comparisonData: [
      { feature: 'Admission Processing', manual: 'Paper forms, long queues, manual merit lists', withErp: 'Online applications, auto-verification, instant merit lists' },
      { feature: 'Fee Collection', manual: 'Cash handling, manual ledgers, delayed reconciliation', withErp: 'Digital payment gateways, auto-receipts, real-time tracking' },
      { feature: 'Exam Results', manual: 'Manual grading, weeks for result publication', withErp: 'Auto-grading, instant results, analytics dashboards' },
      { feature: 'Parent Communication', manual: 'Phone calls and WhatsApp groups', withErp: 'Structured parent portal with real-time access' },
      { feature: 'Attendance Tracking', manual: 'Paper registers, no real-time visibility', withErp: 'Biometric integration, instant parent notification' },
      { feature: 'Library Management', manual: 'Card catalogs, manual issue/return logs', withErp: 'Barcode scanning, auto-overdue alerts, digital catalog' },
    ],
  },

  autoflow: {
    slug: 'autoflow',
    name: 'AutoFlow',
    tagline: 'Your Workshop. One Smart System.',
    heroDescription: 'AutoFlow is the complete automotive workshop and service management platform. Manage job orders, inventory, supplier relationships, purchase orders, and customer communications — all from one intuitive system built for the unique demands of automotive service businesses.',
    industry: 'Automotive & Workshop',
    industrySlug: 'automotive-workshop',
    icon: 'wrench',
    color: 'sky',
    website: 'https://autoflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Service Turnaround', value: '45% Faster' },
      { label: 'Parts Accuracy', value: '99.5%' },
      { label: 'Customer Retention', value: '85%' },
      { label: 'Revenue Growth', value: '30%' },
    ],

    modules: [
      { name: 'Workshop', description: 'Job card creation, technician assignment, bay scheduling, and real-time service tracking for automotive workshops.', icon: 'wrench' },
      { name: 'Vehicles', description: 'Complete vehicle service history, warranty tracking, maintenance schedule management, and health scoring.', icon: 'car' },
      { name: 'Appointments', description: 'Online and phone booking with time slot management, service advisor assignment, and automated reminders.', icon: 'calendar' },
      { name: 'Inventory', description: 'Parts and accessories inventory with auto-reorder, supplier management, and stock alerts.', icon: 'package' },
      { name: 'CRM', description: 'Customer profiles with vehicle history, service reminders, loyalty tracking, and automated notifications.', icon: 'users' },
      { name: 'Finance', description: 'Service billing, parts markup, labor charges, professional invoicing, and financial reporting.', icon: 'landmark' },
      { name: 'Purchase Orders', description: 'Automated PO generation, approval workflows, and delivery tracking for parts procurement.', icon: 'shopping' },
      { name: 'Estimates', description: 'Service estimate creation with parts and labor breakdown, customer approval workflows, and conversion to jobs.', icon: 'file-text' },
      { name: 'Warranty', description: 'Warranty claim management, coverage verification, part warranty tracking, and OEM claim submission.', icon: 'shield' },
      { name: 'Fleet', description: 'Fleet vehicle management with maintenance scheduling, service history, and fleet-level reporting.', icon: 'truck' },
      { name: 'Service Bays', description: 'Bay scheduling, capacity management, equipment tracking, and real-time bay availability.', icon: 'map' },
      { name: 'Technicians', description: 'Technician skill management, productivity tracking, certification monitoring, and performance analytics.', icon: 'users' },
    ],

    painPoints: [
      { title: 'Lost Job Cards', before: 'Paper-based job cards get lost, leading to missed tasks and billing errors.', after: 'Digital job cards with real-time tracking — every task accounted for, every charge captured.' },
      { title: 'Parts Stockouts', before: 'Critical parts unavailable when needed, causing delays and customer frustration.', after: 'Auto-reorder triggers and safety stock alerts ensure parts are always available.' },
      { title: 'Customer Follow-up', before: 'No system for service reminders — customers forget to come back.', after: 'Automated service reminders via SMS/WhatsApp boost return rates by 40%.' },
      { title: 'Billing Gaps', before: 'Manual billing misses labor hours and parts charges — revenue leaks everywhere.', after: 'Auto-calculated billing with labor, parts, and markup — capture every rupee.' },
    ],

    workflow: [
      { step: '01', title: 'Create Job Card', description: 'Customer arrives, vehicle checked in. Digital job card created with all service requirements.' },
      { step: '02', title: 'Assign & Source', description: 'Technician assigned, parts checked. Auto-generate PO for unavailable parts.' },
      { step: '03', title: 'Service & Track', description: 'Work progresses with real-time status updates. Customer notified at each stage.' },
      { step: '04', title: 'Invoice & Follow-up', description: 'Auto-generated invoice. Service reminder scheduled for next maintenance.' },
    ],

    benefits: [
      { title: 'Faster Service', description: 'Streamlined workflow reduces vehicle turnaround time by 45%.', metric: '45%' },
      { title: 'Zero Revenue Leakage', description: 'Automated billing captures every charge — parts, labor, and markup.', metric: '99.5%' },
      { title: 'Customer Loyalty', description: 'Service reminders and transparent communication keep customers coming back.', metric: '85%' },
      { title: 'Parts Optimization', description: 'Smart inventory management reduces stockouts and overstocking simultaneously.', metric: '30%' },
    ],

    testimonials: [
      { quote: 'We service over 500 Honda bikes and cars monthly across 3 workshops. AutoFlow brought our average turnaround time from 48 hours down to 18. Customers actually compliment our efficiency now.', name: 'Saquib Shirazi', title: 'CEO', company: 'Atlas Honda', avatar: 'SS' },
      { quote: 'Managing BMW warranty claims was a compliance nightmare. AutoFlow tracks every part, every labor hour, and generates claim documentation automatically. Our rejection rate dropped from 12% to under 1%.', name: 'Farhan Aslam', title: 'After-Sales Director', company: 'Dewan Motors', avatar: 'FA' },
      { quote: 'Across 45 authorized service centers, we needed standardized workflows. AutoFlow gave us that — plus the service reminders brought back 3,000+ lapsed customers within the first quarter.', name: 'Kazuhiko Yamada', title: 'Managing Director', company: 'Pak Suzuki Motor', avatar: 'KY' },
    ],

    faqs: [
      { question: 'Can AutoFlow handle multiple workshop locations?', answer: 'Yes. AutoFlow supports multi-location operations with centralized management and location-specific inventory, staff, and reporting.' },
      { question: 'Does it work for both car and bike workshops?', answer: 'Absolutely. AutoFlow handles all vehicle types — cars, bikes, trucks, and heavy machinery. Vehicle profiles are fully customizable.' },
      { question: 'Can customers track their vehicle status?', answer: 'Yes. Customers receive real-time SMS/WhatsApp updates at each service stage. They can also check status through the customer portal.' },
      { question: 'What about integration with parts suppliers?', answer: 'AutoFlow includes a supplier portal for direct ordering, price comparison, and delivery tracking. We integrate with major parts distributors.' },
    ],

    differentiators: [
      'Built for automotive workshops — not retail or generic service',
      'Vehicle-specific service history and maintenance tracking',
      'Automated SMS/WhatsApp service reminders',
      'Parts inventory with supplier portal integration',
      'Auto-calculated billing with labor, parts, and markup',
    ],

    moduleFeatures: [
      { moduleName: 'Workshop', features: ['Digital job card creation', 'Technician skill-based assignment', 'Bay scheduling & allocation', 'Real-time service progress tracking', 'Service level monitoring', 'Priority queue management'] },
      { moduleName: 'Vehicles', features: ['Complete service history log', 'Warranty claim management', 'Maintenance schedule alerts', 'Odometer tracking', 'Recall notification system', 'Vehicle health score'] },
      { moduleName: 'Appointments', features: ['Online booking portal', 'Time slot management', 'Service advisor assignment', 'SMS/WhatsApp reminders', 'Walk-in handling', 'Appointment confirmation automation'] },
      { moduleName: 'Inventory', features: ['Parts catalog with OEM numbers', 'Auto-reorder point management', 'Multi-vendor price comparison', 'Safety stock alerts', 'Parts interchangeability tracking', 'Barcode scanning for parts'] },
      { moduleName: 'CRM', features: ['Vehicle ownership history', 'Automated service reminders', 'Loyalty points & rewards', 'SMS/WhatsApp notifications', 'Customer feedback collection', 'Service package management'] },
      { moduleName: 'Finance', features: ['Labor time-based billing', 'Parts markup auto-calculation', 'Service package pricing', 'Tax compliance & GST', 'Professional invoice templates', 'Payment receipt generation'] },
      { moduleName: 'Purchase Orders', features: ['Auto-PO from job card parts', 'Multi-level approval workflows', 'Delivery tracking integration', 'GRN & quality inspection', 'Partial delivery handling', 'PO-to-invoice matching'] },
      { moduleName: 'Estimates', features: ['Parts & labor breakdown', 'Customer approval workflow', 'Estimate-to-job conversion', 'Historical estimate comparison', 'Margin calculation per service', 'Digital estimate sharing'] },
      { moduleName: 'Warranty', features: ['Warranty coverage verification', 'Claim submission & tracking', 'Part warranty period management', 'OEM claim integration', 'Warranty expiration alerts', 'Warranty analytics & reporting'] },
      { moduleName: 'Fleet', features: ['Fleet vehicle registry', 'Fleet maintenance scheduling', 'Consolidated service history', 'Fleet-level cost reporting', 'Contract & agreement tracking', 'Fleet utilization analytics'] },
      { moduleName: 'Service Bays', features: ['Bay scheduling & calendar', 'Real-time bay availability', 'Equipment & tool tracking', 'Bay capacity management', 'Service type allocation', 'Bay utilization reporting'] },
      { moduleName: 'Technicians', features: ['Skill & certification management', 'Productivity tracking & KPIs', 'Task assignment optimization', 'Training & development logs', 'Performance analytics dashboards', 'Overtime & shift management'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 61, revenue: 2800, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 66, revenue: 3200, satisfaction: 3.7 },
      { month: 'Mar', efficiency: 71, revenue: 3700, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 77, revenue: 4200, satisfaction: 4.2 },
      { month: 'May', efficiency: 83, revenue: 4800, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 90, revenue: 5500, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Twilio', category: 'Communication', icon: 'phone' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control for workshop staff',
      'Complete audit trail for all transactions',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
    ],

    comparisonData: [
      { feature: 'Job Card Management', manual: 'Paper job cards, lost tasks, missed charges', withErp: 'Digital job cards with real-time tracking and auto-billing' },
      { feature: 'Parts Inventory', manual: 'Manual stock counts, frequent stockouts', withErp: 'Auto-reorder triggers with safety stock alerts' },
      { feature: 'Customer Follow-up', manual: 'No reminder system, customers never return', withErp: 'Automated SMS/WhatsApp reminders boost returns 40%' },
      { feature: 'Billing Accuracy', manual: 'Missed labor hours and parts, revenue leakage', withErp: 'Auto-calculated billing captures every charge' },
      { feature: 'Vehicle History', manual: 'Folders and files, no searchable history', withErp: 'Complete digital service history per vehicle' },
      { feature: 'Supplier Orders', manual: 'Phone calls, no price comparison, overpaying', withErp: 'Automated PO with multi-vendor price comparison' },
    ],
  },

  pharmaflow: {
    slug: 'pharmaflow',
    name: 'PharmaFlow',
    tagline: 'Precision. Compliance. Control.',
    heroDescription: 'PharmaFlow is the complete pharmaceutical management system built for the unique demands of the pharma industry. Manage prescriptions, inventory, compliance, multi-branch operations, and POS — all while maintaining strict regulatory adherence and batch traceability.',
    industry: 'Pharmaceutical',
    industrySlug: 'pharmaceutical',
    icon: 'pill',
    color: 'red',
    website: 'https://pharmaflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Expiry Loss Reduction', value: '90%' },
      { label: 'Compliance Score', value: '100%' },
      { label: 'Dispensing Accuracy', value: '99.9%' },
      { label: 'Multi-Branch Sync', value: 'Real-time' },
    ],

    modules: [
      { name: 'Medicines', description: 'Complete medicine catalog with batch tracking, drug interaction alerts, dosage verification, and formulary management.', icon: 'package' },
      { name: 'Inventory', description: 'Batch and expiry tracking, FEFO enforcement, controlled substance management, and auto-reorder.', icon: 'package' },
      { name: 'POS', description: 'Pharmacy-specific POS with prescription linkage, insurance processing, and digital receipts.', icon: 'shopping' },
      { name: 'Prescriptions', description: 'Digital prescription processing with drug interaction alerts, dosage verification, and patient history.', icon: 'file-text' },
      { name: 'Warehouse', description: 'Multi-warehouse pharmaceutical storage with temperature monitoring, batch tracking, and distribution management.', icon: 'package' },
      { name: 'Purchases & Suppliers', description: 'Vendor management, purchase orders, price comparison, and delivery scheduling for pharmaceutical procurement.', icon: 'truck' },
      { name: 'Customers', description: 'Patient profiles with medication history, allergies, and treatment tracking for personalized service.', icon: 'users' },
      { name: 'HR', description: 'Staff management, pharmacist scheduling, payroll processing, and regulatory compliance tracking.', icon: 'briefcase' },
      { name: 'Accounting', description: 'Revenue analytics, margin tracking, insurance reconciliation, and tax compliance reporting.', icon: 'landmark' },
      { name: 'Insurance', description: 'Insurance claim processing, co-pay calculation, eligibility verification, and reimbursement tracking.', icon: 'shield' },
      { name: 'Compliance', description: 'DRAP compliance, regulatory reporting, controlled substance logs, and audit trail management.', icon: 'shield' },
      { name: 'Reports & AI', description: 'Business intelligence dashboards with AI-powered demand forecasting and sales analytics.', icon: 'bar-chart' },
    ],

    painPoints: [
      { title: 'Expiry Management', before: 'Manual tracking leads to expired stock, regulatory violations, and financial losses.', after: 'Automated FEFO enforcement and expiry alerts reduce expiry losses by 90%.' },
      { title: 'Compliance Burden', before: 'Regulatory reporting takes days of manual compilation and is always behind schedule.', after: 'Automated compliance reports generated on demand — always audit-ready.' },
      { title: 'Multi-Branch Disconnect', before: 'Each branch operates independently with no visibility into stock or performance.', after: 'Real-time multi-branch sync with centralized control and inter-branch transfers.' },
      { title: 'Prescription Errors', before: 'Manual dispensing leads to drug interaction risks and dosage errors.', after: 'Digital prescriptions with auto-interaction checking ensure patient safety.' },
    ],

    workflow: [
      { step: '01', title: 'Receive Prescription', description: 'Digital prescription scanned or entered. System verifies drug interactions and dosage automatically.' },
      { step: '02', title: 'Dispense & Track', description: 'Medication dispensed from batch-tracked inventory. FEFO enforced automatically.' },
      { step: '03', title: 'Bill & Process', description: 'POS handles insurance claims, co-pays, and digital receipts in seconds.' },
      { step: '04', title: 'Report & Comply', description: 'Every transaction logged for compliance. Regulatory reports generated on demand.' },
    ],

    benefits: [
      { title: 'Zero Expiry Losses', description: 'Automated FEFO and expiry alerts ensure medications are sold before they expire.', metric: '90%' },
      { title: 'Full Compliance', description: 'Every transaction logged, every report ready — always prepared for inspections.', metric: '100%' },
      { title: 'Patient Safety', description: 'Drug interaction alerts and dosage verification eliminate dispensing errors.', metric: '99.9%' },
      { title: 'Branch Visibility', description: 'Real-time sync across all branches with consolidated reporting and transfers.', metric: 'Real-time' },
    ],

    testimonials: [
      { quote: 'PharmaFlow eliminated our expiry losses completely. The FEFO enforcement and batch tracking saved us PKR 5 million in the first year across our manufacturing and distribution operations.', name: 'Dr. Hasan Qazi', title: 'Chief Operating Officer', company: 'Martin Dow', avatar: 'HQ' },
      { quote: 'DRAP inspections used to terrify us. Now we generate compliance reports in seconds. Our last inspection took 30 minutes instead of 3 days — the inspector was genuinely impressed.', name: 'Khalid Mahmood', title: 'Director Quality Assurance', company: 'Getz Pharma', avatar: 'KM' },
      { quote: 'Managing 12 distribution branches was a nightmare before PharmaFlow. Now I see real-time inventory and sales across all locations from my phone. The inter-branch transfer module alone saves us PKR 3 million monthly.', name: 'Syed Nadeem Ahmed', title: 'Executive Director', company: 'Searle Pakistan', avatar: 'NA' },
    ],

    faqs: [
      { question: 'Is PharmaFlow DRAP compliant?', answer: 'Yes. PharmaFlow is built to meet all DRAP regulatory requirements including controlled substance tracking, batch traceability, and automated compliance reporting.' },
      { question: 'Can it handle controlled substances?', answer: 'Absolutely. PharmaFlow includes dedicated controlled substance management with special tracking, double-verification dispensing, and regulatory reporting.' },
      { question: 'Does it support insurance billing?', answer: 'Yes. PharmaFlow integrates with major insurance providers for automatic claim processing, co-pay calculation, and reconciliation.' },
      { question: 'How does the multi-branch sync work?', answer: 'All branches sync inventory, sales, and patient data in real-time. Inter-branch stock transfers are automated with approval workflows.' },
    ],

    differentiators: [
      'Built for pharma — FEFO, batch tracking, and DRAP compliance built in',
      'Drug interaction alerts and dosage verification',
      'Multi-branch real-time sync with inter-branch transfers',
      'Controlled substance management with double verification',
      'Insurance claim processing integrated into POS',
    ],

    moduleFeatures: [
      { moduleName: 'Medicines', features: ['Medicine catalog & formulary', 'Drug interaction alert system', 'Dosage verification engine', 'Generic & brand management', 'Controlled substance categorization', 'Medicine pricing & markup'] },
      { moduleName: 'Inventory', features: ['Batch & expiry date tracking', 'FEFO enforcement automation', 'Controlled substance tracking', 'Auto-reorder with safety stock', 'Near-expiry alert system', 'Temperature-sensitive storage alerts'] },
      { moduleName: 'POS', features: ['Prescription-linked billing', 'Insurance claim processing', 'Co-pay auto-calculation', 'Digital receipt generation', 'Return & exchange handling', 'End-of-day reconciliation'] },
      { moduleName: 'Prescriptions', features: ['Digital prescription processing', 'E-prescription intake', 'Prescription refill management', 'Patient medication history', 'Doctor verification system', 'Prescription audit trail'] },
      { moduleName: 'Warehouse', features: ['Multi-warehouse stock visibility', 'Temperature zone management', 'Batch tracking & traceability', 'Inter-warehouse transfers', 'Warehouse capacity optimization', 'Stock movement audit log'] },
      { moduleName: 'Purchases & Suppliers', features: ['Vendor portal & rating', 'Purchase order automation', 'Price comparison tools', 'Delivery scheduling & tracking', 'Contract & terms management', 'Supplier compliance verification'] },
      { moduleName: 'Customers', features: ['Comprehensive patient profiles', 'Medication history tracking', 'Allergy & interaction flags', 'Chronic disease monitoring', 'Patient communication log', 'Loyalty & repeat purchase tracking'] },
      { moduleName: 'HR', features: ['Pharmacist scheduling & shifts', 'Payroll auto-processing', 'License & certification tracking', 'Leave management system', 'Regulatory compliance training', 'Performance evaluation workflow'] },
      { moduleName: 'Accounting', features: ['Revenue analytics dashboards', 'Margin tracking per product', 'Insurance reconciliation', 'Tax compliance reporting', 'Branch-wise P&L statements', 'Cash flow forecasting'] },
      { moduleName: 'Insurance', features: ['Real-time eligibility checks', 'Automated claim submission', 'Co-pay & deductible calculation', 'Reimbursement tracking', 'Denial management workflow', 'Insurance provider database'] },
      { moduleName: 'Compliance', features: ['DRAP compliance management', 'Automated regulatory reporting', 'Controlled substance logs', 'Inspection readiness dashboard', 'License & permit tracking', 'Adverse event reporting'] },
      { moduleName: 'Reports & AI', features: ['Sales analytics dashboards', 'AI demand forecasting', 'Inventory optimization insights', 'Seasonal trend prediction', 'Profitability analysis', 'Regulatory compliance reporting'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 65, revenue: 3500, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 70, revenue: 3900, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 75, revenue: 4400, satisfaction: 4.1 },
      { month: 'Apr', efficiency: 80, revenue: 4900, satisfaction: 4.3 },
      { month: 'May', efficiency: 86, revenue: 5500, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 92, revenue: 6100, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Seegate', category: 'E-commerce', icon: 'globe' },
    ],

    securityFeatures: [
      'DRAP-compliant data management and reporting',
      'AES-256 data encryption at rest and in transit',
      'Role-based access with controlled substance restrictions',
      'Complete audit trail for all dispensing transactions',
      'Automated daily backups with point-in-time recovery',
      'Two-factor authentication (2FA) for pharmacists',
      'SSL/TLS encryption for all connections',
      'HIPAA-aligned patient data protection',
    ],

    comparisonData: [
      { feature: 'Expiry Management', manual: 'Manual date checking, expired stock discovered late', withErp: 'Automated FEFO enforcement, near-expiry alerts 90 days ahead' },
      { feature: 'Compliance Reporting', manual: 'Days of manual compilation for DRAP inspections', withErp: 'One-click regulatory reports, always audit-ready' },
      { feature: 'Prescription Safety', manual: 'Manual interaction checks, human error risk', withErp: 'Automated drug interaction alerts and dosage verification' },
      { feature: 'Multi-Branch Visibility', manual: 'Separate systems per branch, no consolidated view', withErp: 'Real-time sync across all branches with central dashboard' },
      { feature: 'Insurance Processing', manual: 'Manual claim forms, frequent rejections', withErp: 'Automated claim submission with real-time eligibility checks' },
    ],
  },

  martflow: {
    slug: 'martflow',
    name: 'MartFlow',
    tagline: 'Retail Intelligence. Every Shelf. Every Sale.',
    heroDescription: 'MartFlow is the retail management system with POS and multi-store support built for modern retail operations. Manage point-of-sale, inventory, CRM, purchase orders, and multi-store operations from one platform that keeps your shelves stocked and your customers happy.',
    industry: 'Retail',
    industrySlug: 'retail',
    icon: 'shopping',
    color: 'yellow',
    website: 'https://martflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Sales Growth', value: '28%' },
      { label: 'Stock Accuracy', value: '99.8%' },
      { label: 'Checkout Speed', value: '3x Faster' },
      { label: 'Customer Retention', value: '45%' },
    ],

    modules: [
      { name: 'POS Billing', description: 'Lightning-fast point-of-sale with barcode scanning, mixed payments, and real-time inventory sync.', icon: 'shopping' },
      { name: 'Inventory', description: 'Multi-store inventory with auto-reorder, stock transfers, and wastage tracking across all locations.', icon: 'package' },
      { name: 'Procurement', description: 'Automated PO generation, vendor management, delivery tracking, and cost comparison analytics.', icon: 'truck' },
      { name: 'Warehouse', description: 'Warehouse operations with inbound/outbound tracking, picking, packing, and storage optimization.', icon: 'package' },
      { name: 'Fresh Departments', description: 'Perishable goods management with temperature tracking, quality grading, and fresh produce handling.', icon: 'utensils' },
      { name: 'Recipe & Production', description: 'In-house production management for delis, bakeries, and prepared foods with recipe costing.', icon: 'utensils' },
      { name: 'Shelf Life Management', description: 'Automated expiry tracking, FEFO enforcement, markdown scheduling, and waste prevention alerts.', icon: 'list' },
      { name: 'Waste Tracking', description: 'Comprehensive waste logging, categorization, root cause analysis, and waste reduction analytics.', icon: 'package' },
      { name: 'CRM & Loyalty', description: 'Loyalty programs, purchase history, targeted promotions, and customer segmentation.', icon: 'users' },
      { name: 'Finance & Payroll', description: 'Revenue dashboards, expense tracking, payroll processing, and financial compliance reporting.', icon: 'landmark' },
      { name: 'E-commerce & Delivery', description: 'Connect online store with physical retail for unified inventory, order management, and delivery.', icon: 'globe' },
      { name: 'Reports Center', description: 'Sales dashboards, category performance, margin analysis, demand forecasting, and business intelligence.', icon: 'bar-chart' },
    ],

    painPoints: [
      { title: 'Inventory Mismatches', before: 'Physical counts never match system records — shrinkage and stockouts are constant.', after: 'Real-time inventory sync across all channels with automated variance alerts.' },
      { title: 'Slow Checkout', before: 'Long queues during peak hours frustrate customers and reduce basket size.', after: 'Lightning-fast POS with barcode scanning processes 3x more transactions per hour.' },
      { title: 'No Customer Insights', before: 'You know what sold, but not who bought it or why they came back.', after: 'Full CRM with purchase history, segmentation, and loyalty program management.' },
      { title: 'Multi-Store Disconnect', before: 'Each store is an island — no visibility into stock levels or performance.', after: 'Centralized dashboard shows real-time sales and inventory across all locations.' },
    ],

    workflow: [
      { step: '01', title: 'Scan & Sell', description: 'Barcode scan at POS instantly updates inventory and customer purchase history.' },
      { step: '02', title: 'Auto-Replenish', description: 'Low stock triggers auto-PO. Vendor delivers before shelves empty.' },
      { step: '03', title: 'Engage & Retain', description: 'Loyalty points, personalized offers, and targeted promotions keep customers coming back.' },
      { step: '04', title: 'Analyze & Optimize', description: 'Real-time analytics reveal what sells, what doesn\'t, and where to invest next.' },
    ],

    benefits: [
      { title: 'More Sales', description: 'Faster checkout and smart promotions drive 28% sales growth on average.', metric: '28%' },
      { title: 'Perfect Stock', description: 'Automated reorder and real-time tracking maintain 99.8% stock accuracy.', metric: '99.8%' },
      { title: 'Loyal Customers', description: 'Loyalty programs and personalized engagement increase retention by 45%.', metric: '45%' },
      { title: 'Full Visibility', description: 'One dashboard for all stores — sales, inventory, and staff performance.', metric: '360°' },
    ],

    testimonials: [
      { quote: 'MartFlow\'s POS is incredibly fast. During Ramadan rush, we processed 3x more customers than last year with zero system slowdowns. The fresh produce module alone reduced our wastage by PKR 4 million quarterly.', name: 'Bilal Ahmed', title: 'Operations Director', company: 'Carrefour Pakistan', avatar: 'BA' },
      { quote: 'The auto-reorder feature alone justifies the entire investment. We haven\'t had a single stockout in 6 months across 14 stores — and our shrinkage dropped from 3.2% to 0.8%.', name: 'Farah Khan', title: 'Category Manager', company: 'Imtiaz Super Market', avatar: 'FK' },
      { quote: 'Our loyalty program went from paper cards to a digital system. Customer retention jumped 45% in the first quarter, and average basket size increased by PKR 850. That\'s real, measurable growth.', name: 'Salman Raza', title: 'Chief Commercial Officer', company: 'Chase Up', avatar: 'SR' },
    ],

    faqs: [
      { question: 'Does MartFlow support barcode scanning?', answer: 'Yes. MartFlow works with all major barcode scanners and supports custom barcode formats. The POS is optimized for high-speed scanning during checkout.' },
      { question: 'Can I manage promotions and discounts?', answer: 'Absolutely. Create percentage discounts, buy-one-get-one, bundle deals, and time-limited promotions. Track ROI for every campaign.' },
      { question: 'How does multi-store inventory work?', answer: 'Inventory syncs across all stores in real-time. Transfer stock between locations, set reorder points per store, and view consolidated stock levels from one dashboard.' },
      { question: 'Does it connect with my online store?', answer: 'Yes. MartFlow integrates with Shopify, WooCommerce, and custom e-commerce platforms for unified inventory and order management.' },
    ],

    differentiators: [
      'Lightning-fast POS designed for high-volume retail',
      'Real-time multi-store inventory with inter-store transfers',
      'Built-in loyalty program and customer CRM',
      'Dynamic pricing and promotional campaign management',
      'E-commerce integration for omnichannel retail',
    ],

    moduleFeatures: [
      { moduleName: 'POS Billing', features: ['High-speed barcode scanning', 'Mixed payment methods', 'Real-time inventory sync', 'Layaway & on-account sales', 'Cash drawer management', 'End-of-shift reconciliation'] },
      { moduleName: 'Inventory', features: ['Multi-store stock visibility', 'Auto-reorder with min/max levels', 'Inter-store stock transfers', 'Wastage & shrinkage tracking', 'Batch & lot tracking', 'Seasonal inventory planning'] },
      { moduleName: 'Procurement', features: ['Auto-PO from reorder points', 'Vendor management portal', 'Delivery tracking integration', 'GRN & quality inspection', 'PO approval workflows', 'Cost comparison analytics'] },
      { moduleName: 'Warehouse', features: ['Inbound/outbound tracking', 'Barcode scanning integration', 'Pick, pack & ship workflows', 'Storage zone optimization', 'Cross-dock management', 'Inventory accuracy audits'] },
      { moduleName: 'Fresh Departments', features: ['Perishable goods management', 'Temperature monitoring alerts', 'Quality grading system', 'Fresh produce receiving', 'Daily freshness reporting', 'Supplier quality scoring'] },
      { moduleName: 'Recipe & Production', features: ['Recipe costing & management', 'Production planning for deli/bakery', 'Ingredient auto-depletion', 'Batch production tracking', 'Yield & wastage analysis', 'Menu engineering analytics'] },
      { moduleName: 'Shelf Life Management', features: ['Automated expiry tracking', 'FEFO enforcement', 'Markdown scheduling engine', 'Near-expiry alert system', 'Shelf life extension protocols', 'Donation & disposal workflows'] },
      { moduleName: 'Waste Tracking', features: ['Waste logging by category', 'Root cause analysis tools', 'Waste reduction targets & KPIs', 'Spoilage vs. damage classification', 'Waste trend reporting', 'Cost of waste calculation'] },
      { moduleName: 'CRM & Loyalty', features: ['Loyalty points program', 'Purchase history tracking', 'Customer segmentation tools', 'Targeted promotions engine', 'Birthday & anniversary rewards', 'Customer lifetime value analysis'] },
      { moduleName: 'Finance & Payroll', features: ['Revenue dashboards', 'Expense categorization & tracking', 'Payroll auto-processing', 'Tax compliance & reporting', 'P&L per store & department', 'Cash flow forecasting'] },
      { moduleName: 'E-commerce & Delivery', features: ['Shopify & WooCommerce sync', 'Unified inventory management', 'Online order fulfillment', 'Click-and-collect support', 'Delivery zone management', 'Marketplace integration'] },
      { moduleName: 'Reports Center', features: ['Sales dashboards by category', 'Margin analysis per SKU', 'Demand forecasting AI', 'Foot traffic analytics', 'Staff performance metrics', 'Seasonal trend analysis'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 63, revenue: 5200, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 68, revenue: 5800, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 73, revenue: 6400, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 79, revenue: 7200, satisfaction: 4.3 },
      { month: 'May', efficiency: 85, revenue: 8000, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 91, revenue: 8800, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'Shopify', category: 'E-commerce', icon: 'shopping' },
      { name: 'WooCommerce', category: 'E-commerce', icon: 'globe' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Amazon', category: 'E-commerce', icon: 'shopping' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
    ],

    securityFeatures: [
      'PCI-DSS Level 1 compliant payment processing',
      'AES-256 data encryption at rest and in transit',
      'Role-based access with cashier & manager levels',
      'Complete audit trail for all POS transactions',
      'Automated daily backups with disaster recovery',
      'Two-factor authentication (2FA)',
      'Fraud detection and prevention algorithms',
    ],

    comparisonData: [
      { feature: 'Checkout Speed', manual: 'Manual entry, long queues, lost sales', withErp: 'Barcode scanning, 3x faster checkout, happy customers' },
      { feature: 'Inventory Accuracy', manual: 'End-of-day counts, constant mismatches', withErp: 'Real-time sync across all channels, 99.8% accuracy' },
      { feature: 'Customer Insights', manual: 'Know what sold, not who bought it', withErp: 'Full CRM with purchase history and segmentation' },
      { feature: 'Multi-Store Management', manual: 'Each store is an island, no visibility', withErp: 'One dashboard for all stores with real-time data' },
      { feature: 'Promotions', manual: 'Manual price tags, no ROI tracking', withErp: 'Dynamic promotions with real-time ROI tracking' },
      { feature: 'Replenishment', manual: 'Guesswork ordering, stockouts common', withErp: 'Auto-reorder triggered by stock levels' },
    ],
  },

  buildflow: {
    slug: 'buildflow',
    name: 'BuildFlow',
    tagline: 'Build Smarter. Manage Better.',
    heroDescription: 'BuildFlow is the AI-powered property management and construction platform. Manage properties, tenants, leases, billing, and maintenance — all from one system designed for the complexities of real estate and construction operations.',
    industry: 'Property Management & Real Estate',
    industrySlug: 'property-management',
    icon: 'hardhat',
    color: 'orange',
    website: 'https://buildflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Collection Rate', value: '97%' },
      { label: 'Vacancy Reduction', value: '35%' },
      { label: 'Maintenance Speed', value: '60% Faster' },
      { label: 'Lease Renewals', value: '40% Higher' },
    ],

    modules: [
      { name: 'Projects', description: 'End-to-end project management with milestone tracking, resource allocation, and progress reporting.', icon: 'briefcase' },
      { name: 'Construction Hub', description: 'Construction site management with contractor coordination, progress tracking, and safety compliance.', icon: 'wrench' },
      { name: 'Housing Schemes', description: 'Housing development management with plot allocation, construction progress, and buyer coordination.', icon: 'building' },
      { name: 'Rental Hub', description: 'Rental property management with tenant onboarding, lease tracking, and rent collection automation.', icon: 'building' },
      { name: 'Inventory Hub', description: 'Construction material inventory with site-level tracking, procurement, and consumption monitoring.', icon: 'package' },
      { name: 'Equipment Hub', description: 'Construction equipment management with scheduling, maintenance tracking, and utilization analytics.', icon: 'truck' },
      { name: 'Finance Hub', description: 'Revenue dashboards, expense tracking, ROI calculations, investor reporting, and cash flow management.', icon: 'landmark' },
      { name: 'BOQ Management', description: 'Bill of Quantities creation, cost estimation, vendor comparison, and budget variance tracking.', icon: 'file-text' },
      { name: 'Labor & Wages', description: 'Workforce management with attendance tracking, daily wage calculation, and payroll processing.', icon: 'users' },
      { name: 'Site Expenses', description: 'On-site expense tracking, petty cash management, receipt capture, and expense categorization.', icon: 'receipt' },
    ],

    painPoints: [
      { title: 'Rent Collection Delays', before: 'Manual tracking and cash collection leads to late payments and disputes.', after: 'Automated billing with payment gateways ensures 97% on-time collection.' },
      { title: 'Maintenance Black Hole', before: 'Tenant complaints disappear into WhatsApp groups with no tracking or accountability.', after: 'Ticket system with priority routing, SLA tracking, and tenant satisfaction scoring.' },
      { title: 'Lease Management Chaos', before: 'Paper leases in filing cabinets — renewals missed, escalations forgotten.', after: 'Digital leases with auto-renewal alerts and escalation calculations.' },
      { title: 'Vacancy Losses', before: 'No system to track vacancies or market units effectively — revenue leaks.', after: 'Occupancy dashboards with automated marketing triggers reduce vacancy by 35%.' },
    ],

    workflow: [
      { step: '01', title: 'Onboard Tenant', description: 'Digital application, verification, and lease signing — all paperless and automated.' },
      { step: '02', title: 'Move-in & Bill', description: 'Rent schedule auto-created. Tenant portal activated for payments and requests.' },
      { step: '03', title: 'Maintain & Satisfy', description: 'Maintenance tickets routed automatically. SLA tracking ensures timely resolution.' },
      { step: '04', title: 'Renew & Retain', description: 'Renewal alerts 90 days early. Escalation auto-calculated. Tenant retained, not lost.' },
    ],

    benefits: [
      { title: 'Higher Collection', description: 'Automated billing and payment gateways push on-time collection to 97%.', metric: '97%' },
      { title: 'Lower Vacancy', description: 'Occupancy dashboards and marketing triggers reduce vacancy periods by 35%.', metric: '35%' },
      { title: 'Faster Maintenance', description: 'Ticket system with SLA tracking resolves issues 60% faster.', metric: '60%' },
      { title: 'Better Retention', description: 'Proactive communication and satisfaction tracking increase lease renewals.', metric: '40%' },
    ],

    testimonials: [
      { quote: 'BuildFlow turned our property management from reactive to proactive. We went from chasing rent to 97% on-time collection automatically across 50,000+ residential units.', name: 'Ahmed Ali Raza Malik', title: 'Director Operations', company: 'Bahria Town', avatar: 'AM' },
      { quote: 'The tenant portal eliminated 80% of our office calls. Tenants pay rent, submit requests, and access leases online. Our customer satisfaction score went from 3.2 to 4.6 out of 5.', name: 'Mohamed Alabbar', title: 'Regional Director', company: 'Emaar Pakistan', avatar: 'MA' },
      { quote: 'Before BuildFlow, we had no systematic way to track maintenance across our portfolio. Now response time is under 4 hours and our property ratings on the portal jumped by a full star.', name: 'Shafiq Akbar', title: 'CEO', company: 'Graana', avatar: 'SA' },
    ],

    faqs: [
      { question: 'Can BuildFlow manage residential and commercial properties?', answer: 'Yes. BuildFlow handles both residential and commercial properties with different lease structures, billing models, and maintenance workflows for each type.' },
      { question: 'Does it support multi-property portfolios?', answer: 'Absolutely. BuildFlow is designed for portfolio management with consolidated reporting, cross-property analytics, and centralized tenant management.' },
      { question: 'How does the tenant portal work?', answer: 'Tenants get a self-service portal to pay rent online, submit maintenance requests, view lease documents, and communicate with management — 24/7 from any device.' },
      { question: 'Can I track construction projects too?', answer: 'Yes. BuildFlow includes construction tracking with project milestones, resource allocation, contractor management, and progress reporting for development projects.' },
    ],

    differentiators: [
      'Combined property management and construction tracking in one platform',
      'Tenant self-service portal for payments, requests, and leases',
      'Automated rent collection with payment gateway integration',
      'SLA-backed maintenance ticket system',
      'Digital lease management with auto-escalation and renewal',
    ],

    moduleFeatures: [
      { moduleName: 'Projects', features: ['Project creation & milestone tracking', 'Resource allocation & scheduling', 'Gantt chart visualization', 'Progress reporting dashboards', 'Risk assessment & mitigation', 'Stakeholder communication portal'] },
      { moduleName: 'Construction Hub', features: ['Site management dashboard', 'Contractor coordination & scheduling', 'Progress photo documentation', 'Safety compliance tracking', 'Permit & inspection management', 'Quality assurance workflows'] },
      { moduleName: 'Housing Schemes', features: ['Plot inventory & allocation', 'Construction phase tracking', 'Buyer coordination portal', 'Payment schedule management', 'Handover workflow automation', 'Scheme performance analytics'] },
      { moduleName: 'Rental Hub', features: ['Tenant onboarding workflow', 'Lease management & e-signatures', 'Automated rent collection', 'Maintenance request portal', 'Occupancy analytics', 'Renewal & escalation management'] },
      { moduleName: 'Inventory Hub', features: ['Construction material tracking', 'Site-level inventory visibility', 'Procurement automation', 'Consumption monitoring & alerts', 'Supplier management portal', 'Material wastage analysis'] },
      { moduleName: 'Equipment Hub', features: ['Equipment registry & tracking', 'Scheduling & allocation', 'Preventive maintenance planning', 'Utilization analytics', 'Rental equipment management', 'Depreciation & valuation tracking'] },
      { moduleName: 'Finance Hub', features: ['Revenue dashboards', 'Expense categorization', 'ROI calculations per project', 'Investor reporting templates', 'Cash flow projections', 'Tax preparation reports'] },
      { moduleName: 'BOQ Management', features: ['Bill of Quantities creation', 'Cost estimation engine', 'Vendor comparison tools', 'Budget vs actual tracking', 'Variation order management', 'Quantity takeoff automation'] },
      { moduleName: 'Labor & Wages', features: ['Workforce attendance tracking', 'Daily wage calculation', 'Overtime management', 'Payroll processing', 'Labor cost allocation per project', 'Compliance with labor regulations'] },
      { moduleName: 'Site Expenses', features: ['On-site expense logging', 'Petty cash management', 'Receipt photo capture', 'Expense categorization & approval', 'Budget variance alerts', 'Monthly expense reconciliation'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 63, revenue: 4100, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 68, revenue: 4500, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 74, revenue: 5000, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 80, revenue: 5600, satisfaction: 4.3 },
      { month: 'May', efficiency: 86, revenue: 6200, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 92, revenue: 6800, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access with tenant isolation',
      'Complete audit trail for financial transactions',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'GDPR compliance for tenant data protection',
    ],

    comparisonData: [
      { feature: 'Rent Collection', manual: 'Cash collection, manual tracking, frequent delays', withErp: 'Automated billing with payment gateway, 97% on-time' },
      { feature: 'Lease Management', manual: 'Paper leases in cabinets, missed renewals', withErp: 'Digital leases with auto-renewal alerts and e-signatures' },
      { feature: 'Maintenance Tracking', manual: 'WhatsApp complaints, no accountability', withErp: 'Ticket system with SLA tracking and priority routing' },
      { feature: 'Vacancy Management', manual: 'No system, units sit empty for months', withErp: 'Occupancy dashboards with automated marketing triggers' },
      { feature: 'Financial Reporting', manual: 'Spreadsheets, delayed investor reports', withErp: 'Real-time revenue dashboards and auto-generated investor reports' },
      { feature: 'Construction Tracking', manual: 'Site visits and phone calls for updates', withErp: 'Digital milestone tracking with photo documentation' },
    ],
  },

  travelflow: {
    slug: 'travelflow',
    name: 'TravelFlow',
    tagline: 'Pilgrim Journeys. Perfected.',
    heroDescription: 'TravelFlow is the complete Hajj & Umrah travel management platform. Manage bookings, pilgrim groups, flights, hotel allocations, visa processing, and ground transportation — all from one system that ensures every pilgrim\'s journey is seamless and spiritually fulfilling.',
    industry: 'Travel & Tourism',
    industrySlug: 'travel-tourism',
    icon: 'plane',
    color: 'cyan',
    website: 'https://travelflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Booking Speed', value: '8x Faster' },
      { label: 'Visa Success Rate', value: '96%' },
      { label: 'Pilgrim Satisfaction', value: '4.9/5' },
      { label: 'Group Management', value: '500+ Pilgrims' },
    ],

    modules: [
      { name: 'Unified Booking', description: 'Complete booking engine with custom itinerary builder and unified management for all travel packages.', icon: 'shopping' },
      { name: 'Package Builder', description: 'Dynamic package creation with flights, hotels, transport, and services with real-time pricing.', icon: 'package' },
      { name: 'Pilgrim Management', description: 'Pilgrim profiles, document management, health records, and group assignment for Hajj & Umrah.', icon: 'users' },
      { name: 'Flight Booking', description: 'Flight booking, seat allocation, and real-time schedule tracking for group travel.', icon: 'globe' },
      { name: 'Hotels & Rooms', description: 'Makkah and Madinah hotel booking with room allocation and proximity categorization.', icon: 'building' },
      { name: 'Visa Processing', description: 'Visa application tracking, document checklist, and submission management for pilgrims.', icon: 'file-text' },
      { name: 'Transport & Logistics', description: 'Ground transportation scheduling, bus allocation, and route planning for pilgrim groups.', icon: 'truck' },
      { name: 'Group Management', description: 'Centralized group coordination with leader assignment, communication, and real-time tracking.', icon: 'users' },
      { name: 'CRM & Leads', description: 'Lead tracking, customer database, follow-up management, and conversion analytics.', icon: 'users' },
      { name: 'Finance & Accounting', description: 'Package pricing, payment tracking, vendor payments, and multi-currency accounting.', icon: 'landmark' },
      { name: 'Reports & Invoices', description: 'Financial reporting, invoice generation, profitability analysis, and compliance documentation.', icon: 'bar-chart' },
    ],

    painPoints: [
      { title: 'Booking Complexity', before: 'Manual package booking with spreadsheets leads to errors and missed allocations.', after: 'Complete booking engine with automated package assembly and group management.' },
      { title: 'Visa Delays', before: 'Paper-based visa processing causes delays and rejected applications.', after: 'Digital visa tracking with document checklists and submission management — 96% success rate.' },
      { title: 'Group Chaos', before: 'Managing hundreds of pilgrims across flights, hotels, and transport is overwhelming.', after: 'Centralized group management with real-time tracking across all services.' },
      { title: 'Financial Confusion', before: 'Payments from multiple sources, in multiple currencies, with no clear tracking.', after: 'Unified financial management with payment tracking and multi-currency support.' },
    ],

    workflow: [
      { step: '01', title: 'Book Package', description: 'Select or customize Hajj/Umrah package. Assign pilgrim to group and itinerary.' },
      { step: '02', title: 'Process Visa', description: 'Document checklist auto-generated. Track visa status and submission in real-time.' },
      { step: '03', title: 'Travel & Serve', description: 'Flight, hotel, and transport all coordinated. Pilgrim receives real-time updates.' },
      { step: '04', title: 'Return & Follow-up', description: 'Feedback collected. Pilgrim profile maintained for future journey planning.' },
    ],

    benefits: [
      { title: 'Faster Bookings', description: 'Complete booking engine reduces package assembly from days to minutes.', metric: '8x' },
      { title: 'Visa Success', description: 'Document management and tracking push visa approval rates to 96%.', metric: '96%' },
      { title: 'Pilgrim Delight', description: 'Seamless coordination and real-time updates earn consistently high satisfaction.', metric: '4.9/5' },
      { title: 'Group Control', description: 'Manage 500+ pilgrims across all services from a single dashboard.', metric: '500+' },
    ],

    testimonials: [
      { quote: 'TravelFlow made managing 500 Hajj pilgrims feel like handling 5. The group management and real-time tracking are game-changers — we haven\'t lost a single pilgrim in two seasons.', name: 'Hafiz Raza Hussain', title: 'Chief Executive', company: 'Al-Murtaza Tours', avatar: 'RH' },
      { quote: 'Our visa success rate jumped from 78% to 96% with the document management system. No more missing documents or rejected applications — and our Saudi counterparts appreciate the organized submissions.', name: 'Zubair Madani', title: 'Operations Head', company: 'Dawn Travels', avatar: 'ZM' },
      { quote: 'Pilgrims call us the best-organized Hajj operator in Karachi. That reputation is built on TravelFlow — the Makkah-Madinah logistics coordination alone is worth every rupee.', name: 'Sheikh Rashid Ahmed', title: 'Director', company: 'Al-Rashid Travels', avatar: 'RA' },
    ],

    faqs: [
      { question: 'Is TravelFlow specifically for Hajj & Umrah?', answer: 'TravelFlow is purpose-built for Hajj & Umrah operations but also supports general travel and tourism management. The core modules are optimized for pilgrimage operations.' },
      { question: 'Can it handle large pilgrim groups?', answer: 'Yes. TravelFlow is designed to handle groups of 500+ pilgrims with automated flight, hotel, and transport coordination. Group leaders get dedicated dashboards.' },
      { question: 'Does it integrate with Saudi visa systems?', answer: 'TravelFlow integrates with Saudi e-Visa systems for Hajj and Umrah visas, with automated status tracking and document management.' },
      { question: 'What about ground transportation in Saudi Arabia?', answer: 'The transport module manages bus allocation, route planning, and scheduling for all ground transportation needs in Makkah, Madinah, and between holy sites.' },
    ],

    differentiators: [
      'Purpose-built for Hajj & Umrah — not a generic travel system',
      'Integrated visa processing with Saudi e-Visa systems',
      'Group management for 500+ pilgrims with real-time tracking',
      'Makkah & Madinah hotel allocation management',
      'Ziyarat planning with guided tour logistics',
    ],

    moduleFeatures: [
      { moduleName: 'Unified Booking', features: ['Hajj & Umrah package booking', 'Custom itinerary creation', 'Group booking management', 'Dynamic pricing per season', 'Waitlist management', 'Booking confirmation automation'] },
      { moduleName: 'Package Builder', features: ['Dynamic package assembly', 'Flight + hotel + transport bundling', 'Real-time pricing engine', 'Seasonal package templates', 'Custom add-on services', 'Package margin calculator'] },
      { moduleName: 'Pilgrim Management', features: ['Pilgrim profile database', 'Document management system', 'Health record tracking', 'Group assignment automation', 'Emergency contact management', 'Special needs handling'] },
      { moduleName: 'Flight Booking', features: ['Group flight booking tools', 'Seat allocation management', 'Schedule change alerts', 'Multi-airline coordination', 'Flight check-in assistance', 'Baggage tracking integration'] },
      { moduleName: 'Hotels & Rooms', features: ['Makkah hotel management', 'Madinah hotel management', 'Room allocation per group', 'Proximity categorization', 'Hotel rating integration', 'Room upgrade management'] },
      { moduleName: 'Visa Processing', features: ['Document checklist generator', 'Application status tracking', 'Saudi e-Visa integration', 'Submission deadline alerts', 'Rejection analysis tools', 'Bulk visa processing'] },
      { moduleName: 'Transport & Logistics', features: ['Bus fleet allocation', 'Route planning for holy sites', 'Driver assignment system', 'Pickup schedule management', 'Real-time GPS tracking', 'Transport cost optimization'] },
      { moduleName: 'Group Management', features: ['Group creation & assignment', 'Group leader dashboard', 'Real-time group tracking', 'Communication broadcasting', 'Emergency coordination', 'Group size optimization'] },
      { moduleName: 'CRM & Leads', features: ['Lead capture & tracking', 'Customer database management', 'Follow-up automation', 'Conversion analytics', 'Repeat pilgrim management', 'Referral tracking system'] },
      { moduleName: 'Finance & Accounting', features: ['Multi-currency accounting', 'Package pricing management', 'Vendor payment tracking', 'Payment gateway integration', 'Revenue per pilgrim analysis', 'Seasonal financial forecasting'] },
      { moduleName: 'Reports & Invoices', features: ['Invoice generation & tracking', 'Profitability analysis per package', 'Financial compliance reporting', 'Vendor reconciliation', 'Seasonal comparison reports', 'Custom report builder'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 60, revenue: 3200, satisfaction: 3.7 },
      { month: 'Feb', efficiency: 65, revenue: 3600, satisfaction: 3.9 },
      { month: 'Mar', efficiency: 71, revenue: 4100, satisfaction: 4.1 },
      { month: 'Apr', efficiency: 77, revenue: 4700, satisfaction: 4.4 },
      { month: 'May', efficiency: 84, revenue: 5400, satisfaction: 4.7 },
      { month: 'Jun', efficiency: 91, revenue: 6200, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'PayPal', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Twilio', category: 'Communication', icon: 'phone' },
      { name: 'Google Maps', category: 'Analytics', icon: 'map' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control for agency staff',
      'Complete audit trail for booking & financial transactions',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'GDPR compliance for international pilgrim data',
    ],

    comparisonData: [
      { feature: 'Package Booking', manual: 'Spreadsheets, manual assembly, days of work', withErp: 'Custom package builder with instant pricing and confirmation' },
      { feature: 'Visa Processing', manual: 'Paper applications, lost documents, 78% success', withErp: 'Digital tracking with checklists, 96% approval rate' },
      { feature: 'Group Management', manual: 'WhatsApp groups, no central tracking', withErp: 'Centralized group management with real-time coordination' },
      { feature: 'Hotel Allocation', manual: 'Phone calls to Saudi hotels, overbooking common', withErp: 'Automated room allocation with proximity optimization' },
      { feature: 'Transport Coordination', manual: 'Chaos at pickup points, lost pilgrims', withErp: 'GPS-tracked buses with scheduled routes and real-time updates' },
    ],
  },

  factoryflow: {
    slug: 'factoryflow',
    name: 'FactoryFlow',
    tagline: 'Manufacturing Excellence. Engineered.',
    heroDescription: 'FactoryFlow is the complete manufacturing execution and planning system. Manage production planning, quality control, maintenance, supply chain, and shop floor operations — all from one platform that turns your factory into a precision machine.',
    industry: 'Manufacturing',
    industrySlug: 'manufacturing',
    icon: 'factory',
    color: 'lime',
    website: 'https://factoryflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'OEE Improvement', value: '25%' },
      { label: 'Downtime Reduction', value: '40%' },
      { label: 'Quality Rate', value: '99.4%' },
      { label: 'Throughput', value: '35% Higher' },
    ],

    modules: [
      { name: 'Production', description: 'Master production scheduling, MRP, capacity planning, and production order management for factory operations.', icon: 'factory' },
      { name: 'Bill of Materials', description: 'BOM with version control, cost roll-up, and engineering change management for accurate production planning.', icon: 'list' },
      { name: 'Inventory', description: 'Raw material and finished goods inventory with location tracking, cycle counting, and auto-reorder.', icon: 'package' },
      { name: 'Stock Audit', description: 'Systematic stock verification with variance tracking, adjustment workflows, and audit reporting.', icon: 'clipboard' },
      { name: 'Procurement', description: 'Vendor management, purchase orders, price comparison, and delivery tracking for material sourcing.', icon: 'shopping' },
      { name: 'Quality Control', description: 'Statistical process control, inspection workflows, non-conformance tracking, and CAPA.', icon: 'shield' },
      { name: 'Maintenance', description: 'Preventive and predictive maintenance scheduling, work orders, and asset tracking.', icon: 'wrench' },
      { name: 'Warehouse', description: 'Multi-warehouse operations with inbound/outbound tracking, storage optimization, and dispatch management.', icon: 'package' },
      { name: 'Sales & Orders', description: 'Sales order management, customer tracking, delivery scheduling, and order-to-cash workflow.', icon: 'trending-up' },
      { name: 'Finance', description: 'Complete accounting, cost center tracking, profitability analysis, and financial compliance reporting.', icon: 'landmark' },
      { name: 'HR & Workforce', description: 'Employee management, shift scheduling, payroll processing, and workforce productivity tracking.', icon: 'users' },
      { name: 'IoT & Smart Factory', description: 'IoT sensor integration for real-time machine monitoring, environmental tracking, and automated data collection.', icon: 'cpu' },
      { name: 'AI Copilot', description: 'AI-powered production optimization, predictive maintenance, and intelligent decision support.', icon: 'sparkles' },
    ],

    painPoints: [
      { title: 'Unplanned Downtime', before: 'Machines break unexpectedly, halting production and missing delivery dates.', after: 'Predictive maintenance scheduling reduces unplanned downtime by 40%.' },
      { title: 'Quality Failures', before: 'Defects detected after production, leading to scrap and rework costs.', after: 'Real-time SPC and inline inspection catch issues before they become defects.' },
      { title: 'Planning Gaps', before: 'Manual production planning can\'t handle complexity of multi-product schedules.', after: 'MRP-driven planning with capacity optimization ensures feasible schedules every time.' },
      { title: 'Supply Chain Opacity', before: 'No visibility into supplier performance or incoming material status.', after: 'Supplier portal with performance scoring and real-time shipment tracking.' },
    ],

    workflow: [
      { step: '01', title: 'Plan Production', description: 'MRP generates production plan based on demand, BOM, and capacity. Optimized schedule created.' },
      { step: '02', title: 'Source & Prep', description: 'Purchase orders auto-generated. Materials received and quality inspected before release.' },
      { step: '03', title: 'Execute & Monitor', description: 'Shop floor data captured in real-time. Quality checkpoints at every stage.' },
      { step: '04', title: 'Deliver & Analyze', description: 'Finished goods inspected and shipped. OEE and quality analytics update automatically.' },
    ],

    benefits: [
      { title: 'Higher OEE', description: 'Optimized scheduling and reduced downtime improve Overall Equipment Effectiveness.', metric: '25%' },
      { title: 'Less Downtime', description: 'Predictive maintenance catches issues before they cause production stops.', metric: '40%' },
      { title: 'Better Quality', description: 'Real-time SPC and inspection workflows maintain 99.4% quality rates.', metric: '99.4%' },
      { title: 'More Output', description: 'Streamlined operations and capacity optimization increase throughput significantly.', metric: '35%' },
    ],

    testimonials: [
      { quote: 'FactoryFlow increased our OEE from 65% to 82% in 6 months. The production planning module alone is worth the investment — our kiln utilization is the best it\'s been in 15 years.', name: 'Engineer Waqas Ali', title: 'Plant Manager', company: 'Lucky Cement', avatar: 'WA' },
      { quote: 'Our quality rate went from 95% to 99.4% with the SPC and inspection workflows. Customer complaints dropped to near zero, and we secured three new export contracts based on our quality metrics alone.', name: 'Sadia Noor', title: 'Quality Director', company: 'Packages Ltd', avatar: 'SN' },
      { quote: 'The predictive maintenance feature saves us approximately PKR 10 million annually in avoided breakdowns. Our fertilizer plant runs 340+ days a year now — up from 310.', name: 'Asif Mehmood', title: 'Maintenance Head', company: 'Engro Corp', avatar: 'AM' },
    ],

    faqs: [
      { question: 'What types of manufacturing does FactoryFlow support?', answer: 'FactoryFlow supports discrete, process, and mixed-mode manufacturing. Whether you produce cement, electronics, food, or pharmaceuticals, the platform adapts to your manufacturing model.' },
      { question: 'Does it include MRP capabilities?', answer: 'Yes. FactoryFlow includes full MRP (Material Requirements Planning) with BOM explosion, lead time calculation, and purchase order suggestions based on production schedules.' },
      { question: 'How does the predictive maintenance work?', answer: 'Our maintenance module analyzes machine runtime, historical failure data, and sensor inputs to predict when maintenance is needed before a breakdown occurs, reducing unplanned downtime by 40%.' },
      { question: 'Can it integrate with IoT sensors?', answer: 'Yes. FactoryFlow integrates with IoT sensors for real-time machine monitoring, environmental tracking, and automated data collection from the shop floor.' },
    ],

    differentiators: [
      'Full MRP with BOM management and capacity planning',
      'Statistical Process Control for real-time quality management',
      'Predictive maintenance with IoT sensor integration',
      'OEE dashboards with real-time shop floor data',
      'Support for discrete, process, and mixed-mode manufacturing',
    ],

    moduleFeatures: [
      { moduleName: 'Production', features: ['Master production scheduling', 'MRP with BOM explosion', 'Capacity planning & leveling', 'Order prioritization engine', 'What-if scenario analysis', 'Constraint-based scheduling'] },
      { moduleName: 'Bill of Materials', features: ['Multi-level BOM creation', 'Version control & revision tracking', 'Cost roll-up calculations', 'Engineering change management', 'Phantom BOM support', 'Alternative item management'] },
      { moduleName: 'Inventory', features: ['Raw material tracking', 'Finished goods management', 'Location-based storage', 'Cycle counting program', 'ABC classification', 'Reorder point automation'] },
      { moduleName: 'Stock Audit', features: ['Systematic stock verification', 'Variance tracking & analysis', 'Adjustment workflow management', 'Audit trail documentation', 'Scheduled audit planning', 'Compliance reporting'] },
      { moduleName: 'Procurement', features: ['Vendor performance scoring', 'Purchase order automation', 'Multi-vendor price comparison', 'Delivery tracking integration', 'Contract management', 'Lead time optimization'] },
      { moduleName: 'Quality Control', features: ['Statistical process control charts', 'Incoming inspection workflows', 'In-process inspection checklists', 'Non-conformance reporting', 'CAPA management system', 'Final QC release process'] },
      { moduleName: 'Maintenance', features: ['Preventive maintenance scheduling', 'Predictive maintenance alerts', 'Work order management', 'Spare parts inventory', 'Asset lifecycle tracking', 'Maintenance cost analysis'] },
      { moduleName: 'Warehouse', features: ['Inbound/outbound tracking', 'Storage zone optimization', 'Barcode scanning integration', 'Dispatch management', 'Cross-dock operations', 'Inventory accuracy audits'] },
      { moduleName: 'Sales & Orders', features: ['Sales order management', 'Customer database & tracking', 'Delivery scheduling', 'Order-to-cash workflow', 'Pricing & discount management', 'Sales analytics dashboards'] },
      { moduleName: 'Finance', features: ['Multi-currency accounting', 'Cost center allocation', 'Profitability by product line', 'Accounts payable & receivable', 'Bank reconciliation', 'Tax compliance & reporting'] },
      { moduleName: 'HR & Workforce', features: ['Employee profile management', 'Shift scheduling & rotation', 'Payroll processing', 'Attendance & time tracking', 'Workforce productivity KPIs', 'Training & certification management'] },
      { moduleName: 'IoT & Smart Factory', features: ['Real-time machine monitoring', 'Environmental sensor tracking', 'Automated data collection', 'OEE real-time dashboards', 'Downtime reason coding', 'Energy consumption tracking'] },
      { moduleName: 'AI Copilot', features: ['Production optimization suggestions', 'Predictive maintenance triggers', 'Demand forecasting AI', 'Anomaly detection & alerts', 'Intelligent scheduling recommendations', 'Quality prediction analytics'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 64, revenue: 6800, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 69, revenue: 7400, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 74, revenue: 8100, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 79, revenue: 8800, satisfaction: 4.2 },
      { month: 'May', efficiency: 85, revenue: 9600, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 90, revenue: 10400, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'SAP', category: 'Accounting', icon: 'landmark' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Twilio', category: 'Communication', icon: 'phone' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control for shop floor & management',
      'Complete audit trail for production & quality records',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'ISO 27001 aligned information security management',
    ],

    comparisonData: [
      { feature: 'Production Planning', manual: 'Whiteboards, manual scheduling, constant changes', withErp: 'MRP-driven planning with capacity optimization' },
      { feature: 'Quality Management', manual: 'Paper checklists, defects found after production', withErp: 'Real-time SPC with inline inspection workflows' },
      { feature: 'Maintenance', manual: 'Reactive — fix after breakdown, unplanned downtime', withErp: 'Predictive maintenance before breakdowns occur' },
      { feature: 'Supply Chain', manual: 'Phone & email ordering, no supplier visibility', withErp: 'Supplier portal with performance scoring & tracking' },
      { feature: 'Shop Floor', manual: 'End-of-shift reports, no real-time data', withErp: 'Real-time machine monitoring and production data capture' },
      { feature: 'OEE Tracking', manual: 'Rough estimates, no real data', withErp: 'Real-time OEE dashboards with automated calculations' },
    ],
  },

  foodflow: {
    slug: 'foodflow',
    name: 'FoodFlow',
    tagline: 'Every Dish. Every Dollar. One System.',
    heroDescription: 'FoodFlow is the complete restaurant and food service management platform. Manage POS, recipes, inventory, multi-branch operations, and delivery — all from one system that keeps your kitchen running and your profits growing.',
    industry: 'Food & Restaurant',
    industrySlug: 'food-restaurant',
    icon: 'utensils',
    color: 'rose',
    website: 'https://foodflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Order Speed', value: '50% Faster' },
      { label: 'Food Cost Control', value: '15% Saved' },
      { label: 'Table Turnover', value: '25% Higher' },
      { label: 'Customer Returns', value: '60%' },
    ],

    modules: [
      { name: 'POS', description: 'Fast restaurant POS with table management, split bills, and kitchen display integration.', icon: 'shopping' },
      { name: 'Kitchen', description: 'Kitchen Display System with order routing, prep time tracking, and station management.', icon: 'utensils' },
      { name: 'Orders & Delivery', description: 'Online ordering, delivery management, driver tracking, and delivery zone configuration.', icon: 'truck' },
      { name: 'Tables & Reservations', description: 'Table management, reservation booking, waitlist management, and floor plan configuration.', icon: 'calendar' },
      { name: 'Menu & Recipes', description: 'Digital recipe cards with costing, portion control, allergen tracking, and menu engineering.', icon: 'book-open' },
      { name: 'Inventory & Suppliers', description: 'Ingredient-level tracking with auto-depletion, supplier management, and wastage logging.', icon: 'package' },
      { name: 'Waste Management', description: 'Comprehensive waste tracking, categorization, root cause analysis, and waste reduction analytics.', icon: 'package' },
      { name: 'Promotions & Loyalty', description: 'Points-based loyalty, birthday rewards, targeted promotions, and customer engagement campaigns.', icon: 'tag' },
      { name: 'Staff & Payroll', description: 'Staff scheduling, time tracking, payroll processing, tip management, and labor cost optimization.', icon: 'briefcase' },
      { name: 'Finance', description: 'Daily P&L, food cost analysis, labor cost tracking, break-even dashboards, and financial reporting.', icon: 'landmark' },
      { name: 'Reports', description: 'Sales analytics, branch performance comparison, menu engineering, and operational dashboards.', icon: 'bar-chart' },
    ],

    painPoints: [
      { title: 'Food Cost Mystery', before: 'No idea how much each dish actually costs — profits vanish in the kitchen.', after: 'Recipe costing with real-time ingredient pricing shows exact dish margins.' },
      { title: 'Order Chaos', before: 'Handwritten tickets get lost, modified, or misread — wrong dishes go out.', after: 'Digital KDS eliminates ticket errors. Every order tracked from seat to plate.' },
      { title: 'Inventory Guesswork', before: 'Ordering ingredients based on gut feeling leads to waste or stockouts.', after: 'Auto-depletion based on sales gives accurate stock levels. Auto-reorder when low.' },
      { title: 'Multi-Branch Headache', before: 'Each outlet runs differently — inconsistent food, service, and numbers.', after: 'Centralized menu, recipes, and reporting ensure consistency across all locations.' },
    ],

    workflow: [
      { step: '01', title: 'Take Order', description: 'Order taken at POS, tablet, or online. Sent instantly to KDS in the kitchen.' },
      { step: '02', title: 'Prepare & Serve', description: 'Kitchen sees order on KDS. Prep time tracked. Server notified when ready.' },
      { step: '03', title: 'Bill & Pay', description: 'Split bills, multiple payment methods, and digital receipts in seconds.' },
      { step: '04', title: 'Analyze & Optimize', description: 'Daily P&L auto-calculated. Food cost analysis reveals margin killers.' },
    ],

    benefits: [
      { title: 'Controlled Costs', description: 'Recipe costing and waste tracking reduce food costs by 15%.', metric: '15%' },
      { title: 'Faster Service', description: 'Digital ordering and KDS speed up service by 50%.', metric: '50%' },
      { title: 'More Tables', description: 'Faster turnaround means 25% more table turnover per service.', metric: '25%' },
      { title: 'Happy Diners', description: 'Loyalty programs and consistent experiences bring customers back.', metric: '60%' },
    ],

    testimonials: [
      { quote: 'FoodFlow showed us we were losing PKR 200,000 monthly on just 3 dishes. Recipe costing changed our menu strategy completely — we restructured 40% of our menu within a month.', name: 'Chef Asad', title: 'Owner', company: 'Kolachi Restaurant', avatar: 'CA' },
      { quote: 'Managing 5 branches used to require 5 managers. With FoodFlow, one operations head handles everything from a single dashboard. Our consistency scores improved 60% across all locations.', name: 'Rida Ahmed', title: 'Operations Director', company: 'Gourmet Bakers', avatar: 'RA' },
      { quote: 'The KDS eliminated our ticket errors completely. Not a single wrong dish in 3 months. That used to happen 8-10 times daily — our Google reviews jumped from 3.8 to 4.6 stars.', name: 'Noman Siddiqui', title: 'General Manager', company: 'Arcadian Cafe', avatar: 'NS' },
    ],

    faqs: [
      { question: 'Does FoodFlow work for quick-service restaurants?', answer: 'Yes. FoodFlow is designed for all restaurant types — QSR, fine dining, cafes, bakeries, and cloud kitchens. The POS adapts to your service style.' },
      { question: 'Can it handle delivery orders?', answer: 'Absolutely. FoodFlow includes delivery management with online ordering, driver tracking, delivery zones, and integration with food delivery platforms.' },
      { question: 'How does recipe costing work?', answer: 'Enter your recipes with exact ingredient quantities. FoodFlow auto-calculates cost based on current ingredient prices and shows real-time dish margins.' },
      { question: 'What about multi-branch consistency?', answer: 'FoodFlow syncs menus, recipes, and pricing across all branches instantly. Consolidated reporting shows performance by location, category, and item.' },
    ],

    differentiators: [
      'Recipe costing with real-time ingredient pricing',
      'Kitchen Display System integrated with POS',
      'Auto-depletion inventory based on actual sales',
      'Multi-branch management with menu and recipe sync',
      'Delivery management with driver tracking',
    ],

    moduleFeatures: [
      { moduleName: 'POS', features: ['Fast order entry with modifiers', 'Table management & seating', 'Split bill & multiple payments', 'Kitchen display integration', 'Cash drawer management', 'Offline mode capability'] },
      { moduleName: 'Kitchen', features: ['Order routing to stations', 'Prep time tracking', 'Priority queue management', 'Item modification alerts', 'Completion notification', 'Bump bar integration'] },
      { moduleName: 'Orders & Delivery', features: ['Online ordering system', 'Driver assignment & tracking', 'Delivery zone configuration', 'Estimated delivery time calculation', 'Delivery fee management', 'Proof of delivery capture'] },
      { moduleName: 'Tables & Reservations', features: ['Floor plan management', 'Online reservation booking', 'Waitlist management', 'Table status tracking', 'Guest count & timing', 'Walk-in optimization'] },
      { moduleName: 'Menu & Recipes', features: ['Digital recipe cards', 'Real-time costing per dish', 'Portion control tracking', 'Allergen & nutritional info', 'Recipe version control', 'Menu engineering analysis'] },
      { moduleName: 'Inventory & Suppliers', features: ['Ingredient-level tracking', 'Auto-depletion from sales', 'Wastage logging & analysis', 'Supplier price tracking', 'Reorder point alerts', 'Stock variance reporting'] },
      { moduleName: 'Waste Management', features: ['Waste logging by category', 'Spoilage tracking & analysis', 'Waste reduction targets', 'Cost of waste calculation', 'Waste trend reporting', 'Corrective action tracking'] },
      { moduleName: 'Promotions & Loyalty', features: ['Points-based rewards program', 'Birthday & anniversary rewards', 'Tiered membership levels', 'Personalized promotions', 'Visit frequency tracking', 'Redemption management'] },
      { moduleName: 'Staff & Payroll', features: ['Staff scheduling & shifts', 'Time tracking & attendance', 'Tip management & distribution', 'Payroll processing', 'Labor cost optimization', 'Performance evaluation'] },
      { moduleName: 'Finance', features: ['Daily P&L auto-calculation', 'Food cost percentage tracking', 'Labor cost analysis', 'Break-even dashboards', 'Revenue per seat metrics', 'Month-over-month comparisons'] },
      { moduleName: 'Reports', features: ['Sales analytics dashboards', 'Branch performance comparison', 'Menu engineering reports', 'Operational KPI tracking', 'Customer analytics', 'Custom report builder'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 61, revenue: 3100, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 66, revenue: 3500, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 72, revenue: 4000, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 78, revenue: 4600, satisfaction: 4.2 },
      { month: 'May', efficiency: 84, revenue: 5200, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 90, revenue: 5900, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Foodpanda', category: 'E-commerce', icon: 'shopping' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access for kitchen, counter & management',
      'Complete audit trail for all transactions',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA) for admin',
      'PCI-DSS compliant payment processing',
    ],

    comparisonData: [
      { feature: 'Order Accuracy', manual: 'Handwritten tickets, wrong dishes, customer complaints', withErp: 'Digital KDS eliminates ticket errors completely' },
      { feature: 'Food Costing', manual: 'No idea of actual dish costs, margins unknown', withErp: 'Recipe costing shows exact margins per dish' },
      { feature: 'Inventory', manual: 'Gut-feel ordering, waste or stockouts', withErp: 'Auto-depletion from sales, accurate stock levels' },
      { feature: 'Multi-Branch', manual: 'Each outlet runs differently, inconsistent results', withErp: 'Centralized menus, recipes, and reporting' },
      { feature: 'Delivery', manual: 'Phone orders, no tracking, missed deliveries', withErp: 'Online ordering with driver tracking and ETAs' },
      { feature: 'Daily P&L', manual: 'End-of-month accounting, no daily visibility', withErp: 'Auto-calculated daily P&L and food cost tracking' },
    ],
  },

  tenantflow: {
    slug: 'tenantflow',
    name: 'TenantFlow',
    tagline: 'Properties. Tenants. Profits. Flowing.',
    heroDescription: 'TenantFlow is the AI-powered property management platform built for landlords and property managers. Manage properties, tenants, leases, billing, and maintenance — all from one intelligent system that maximizes occupancy and minimizes headaches.',
    industry: 'Property Management',
    industrySlug: 'property-management',
    icon: 'building',
    color: 'pink',
    website: 'https://tenantflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Rent Collection', value: '96%' },
      { label: 'Occupancy Rate', value: '95%' },
      { label: 'Response Time', value: '4 Hours' },
      { label: 'Lease Renewal', value: '80%' },
    ],

    modules: [
      { name: 'Properties', description: 'Complete property database with unit details, pricing, availability tracking, and document management.', icon: 'building' },
      { name: 'Tenants', description: 'Tenant profiles, background verification, communication history, and satisfaction tracking.', icon: 'users' },
      { name: 'Leases', description: 'Digital lease creation, e-signatures, renewal alerts, and escalation management.', icon: 'file-text' },
      { name: 'Screening', description: 'Tenant background checks, credit verification, reference validation, and risk scoring.', icon: 'shield' },
      { name: 'Billing & Payments', description: 'Automated rent billing, payment gateway, late fees, and financial reporting.', icon: 'credit-card' },
      { name: 'Accounting', description: 'Complete property accounting with expense tracking, tax management, and financial statements.', icon: 'landmark' },
      { name: 'Maintenance', description: 'Tenant request portal with priority routing, vendor management, and photo documentation.', icon: 'wrench' },
      { name: 'Inspections', description: 'Move-in/move-out inspections, periodic property inspections, and condition documentation.', icon: 'clipboard' },
      { name: 'Vendors', description: 'Vendor management, contractor coordination, service agreements, and performance tracking.', icon: 'truck' },
      { name: 'Communications', description: 'Centralized tenant communication via email, SMS, and in-app messaging with templates.', icon: 'message-circle' },
      { name: 'Smart Home', description: 'IoT device management, smart lock integration, energy monitoring, and automated controls.', icon: 'cpu' },
      { name: 'Amenities', description: 'Amenity booking, facility management, usage tracking, and maintenance scheduling.', icon: 'heart' },
      { name: 'Parking', description: 'Parking space allocation, tenant assignment, visitor parking, and violation tracking.', icon: 'car' },
    ],

    painPoints: [
      { title: 'Rent Collection', before: 'Manual tracking and cash collection leads to delays and disputes.', after: 'Automated billing with digital payments ensures 96% on-time collection.' },
      { title: 'Vacancy Losses', before: 'No system to market vacant units or predict upcoming vacancies.', after: 'AI vacancy prediction and automated marketing reduce vacancy periods.' },
      { title: 'Lease Oversight', before: 'Missed renewals, forgotten escalations, and paper-based lease chaos.', after: 'Automated renewal alerts and digital lease management with e-signatures.' },
      { title: 'Maintenance Tracking', before: 'Tenant complaints lost in WhatsApp groups with no accountability.', after: 'Structured ticket system with SLA tracking and photo documentation.' },
    ],

    workflow: [
      { step: '01', title: 'List & Market', description: 'Vacant units listed automatically. AI suggests optimal pricing based on market data.' },
      { step: '02', title: 'Screen & Sign', description: 'Tenant background verification. Digital lease signed online with e-signatures.' },
      { step: '03', title: 'Bill & Collect', description: 'Rent auto-billed. Tenants pay online. Late fees calculated automatically.' },
      { step: '04', title: 'Maintain & Renew', description: 'Maintenance tickets handled promptly. Renewal alerts 90 days before expiry.' },
    ],

    benefits: [
      { title: 'Reliable Collection', description: 'Automated billing and payment gateways ensure consistent rent collection.', metric: '96%' },
      { title: 'Higher Occupancy', description: 'AI-driven pricing and marketing keep your properties occupied.', metric: '95%' },
      { title: 'Fast Response', description: 'SLA-tracked maintenance ensures tenant satisfaction.', metric: '4h' },
      { title: 'Strong Renewals', description: 'Proactive management and communication drive lease renewals.', metric: '80%' },
    ],

    testimonials: [
      { quote: 'TenantFlow\'s AI suggested a 12% rent increase that I was hesitant about. Every tenant renewed. That\'s PKR 3.6 million more annually on our Lahore portfolio alone.', name: 'Zeeshan Ali Khan', title: 'CEO', company: 'Zameen.com', avatar: 'ZK' },
      { quote: 'We manage 2,000+ units across Islamabad. TenantFlow turned chaos into order — one dashboard for everything, and our vacancy rate dropped from 15% to 4% in six months.', name: 'Shafiq Akbar', title: 'CEO', company: 'Graana', avatar: 'SA' },
      { quote: 'Maintenance tickets went from lost WhatsApp messages to a tracked system with 4-hour average response time. Property owners we manage saw their tenant retention jump from 70% to 92%.', name: 'Tahir Javed', title: 'Managing Director', company: 'PropSure', avatar: 'TJ' },
    ],

    faqs: [
      { question: 'How does the AI pricing work?', answer: 'Our AI analyzes market rates, property features, historical data, and demand patterns to suggest optimal rental prices. You can accept, modify, or override suggestions.' },
      { question: 'Can tenants pay rent online?', answer: 'Yes. TenantFlow integrates with JazzCash, EasyPaisa, and bank transfers. Tenants pay through their portal and receive digital receipts instantly.' },
      { question: 'What about background verification?', answer: 'TenantFlow integrates with verification services for CNIC checks, employment verification, and reference checks — all automated during the application process.' },
      { question: 'Does it handle commercial properties too?', answer: 'Absolutely. TenantFlow supports both residential and commercial properties with different lease structures, billing models, and maintenance workflows.' },
    ],

    differentiators: [
      'AI-powered vacancy prediction and optimal pricing suggestions',
      'Digital lease management with e-signatures',
      'Automated rent collection with Pakistani payment gateways',
      'SLA-tracked maintenance ticket system',
      'Tenant risk scoring with background verification',
    ],

    moduleFeatures: [
      { moduleName: 'Properties', features: ['Property database with unit details', 'Availability & pricing tracking', 'Property type classification', 'Document management', 'Amenity & feature mapping', 'Valuation history tracking'] },
      { moduleName: 'Tenants', features: ['Tenant profile database', 'Background verification integration', 'Communication history log', 'Satisfaction scoring', 'Risk assessment scoring', 'Lease compliance tracking'] },
      { moduleName: 'Leases', features: ['Digital lease creation & templates', 'E-signature integration', 'Auto-renewal alerts', 'Escalation clause management', 'Lease comparison tools', 'Termination & eviction workflows'] },
      { moduleName: 'Screening', features: ['Background check automation', 'Credit score verification', 'Reference validation system', 'Employment verification', 'Criminal history checks', 'Risk scoring & recommendations'] },
      { moduleName: 'Billing & Payments', features: ['Automated rent billing', 'JazzCash & EasyPaisa integration', 'Late fee auto-calculation', 'Partial payment handling', 'Security deposit tracking', 'Digital receipt generation'] },
      { moduleName: 'Accounting', features: ['Property-level accounting', 'Expense categorization & tracking', 'Tax management & reporting', 'Financial statements generation', 'Bank reconciliation', 'Cash flow forecasting'] },
      { moduleName: 'Maintenance', features: ['Tenant request submission', 'Priority-based routing', 'Vendor assignment system', 'SLA tracking & alerts', 'Photo documentation', 'Cost tracking & approval'] },
      { moduleName: 'Inspections', features: ['Move-in/move-out checklists', 'Periodic inspection scheduling', 'Condition documentation with photos', 'Digital signature capture', 'Issue tracking & follow-up', 'Compliance verification'] },
      { moduleName: 'Vendors', features: ['Vendor database & profiling', 'Service agreement management', 'Contractor coordination', 'Performance scoring & reviews', 'Payment tracking', 'Insurance & license verification'] },
      { moduleName: 'Communications', features: ['Email & SMS broadcasting', 'In-app messaging system', 'Template library for notices', 'Automated reminder scheduling', 'Communication history log', 'Emergency notification system'] },
      { moduleName: 'Smart Home', features: ['IoT device management dashboard', 'Smart lock integration', 'Energy monitoring & optimization', 'Temperature & humidity tracking', 'Automated lighting controls', 'Maintenance alert integration'] },
      { moduleName: 'Amenities', features: ['Amenity booking system', 'Facility management & scheduling', 'Usage tracking & analytics', 'Maintenance scheduling', 'Reservation conflict prevention', 'Capacity management'] },
      { moduleName: 'Parking', features: ['Parking space allocation', 'Tenant spot assignment', 'Visitor parking management', 'Violation tracking & alerts', 'Parking permit management', 'Revenue tracking for paid spots'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 62, revenue: 3400, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 67, revenue: 3800, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 73, revenue: 4300, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 79, revenue: 4900, satisfaction: 4.3 },
      { month: 'May', efficiency: 85, revenue: 5500, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 91, revenue: 6100, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'EasyPaisa', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access with tenant data isolation',
      'Complete audit trail for financial transactions',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'GDPR compliance for tenant personal data',
    ],

    comparisonData: [
      { feature: 'Rent Collection', manual: 'Cash collection, manual tracking, 70% on-time', withErp: 'Automated billing with digital payments, 96% on-time' },
      { feature: 'Vacancy Prediction', manual: 'No system, surprised by vacancies', withErp: 'AI predicts vacancies 90 days in advance' },
      { feature: 'Lease Management', manual: 'Paper leases, missed renewals, forgotten escalations', withErp: 'Digital leases with auto-renewal alerts and escalation' },
      { feature: 'Maintenance Tracking', manual: 'WhatsApp messages, no accountability or tracking', withErp: 'Structured ticket system with SLA tracking' },
      { feature: 'Pricing Optimization', manual: 'Static pricing, below-market rates', withErp: 'AI-driven pricing suggestions based on market data' },
    ],
  },

  healthflow: {
    slug: 'healthflow',
    name: 'HealthFlow',
    tagline: 'Healing Hands. Smart Systems. Better Care.',
    heroDescription: 'HealthFlow is the comprehensive healthcare and hospital management platform built for clinics, hospitals, and healthcare networks. Manage patient records, appointments, billing, pharmacy, lab operations, and compliance — all from one intelligent system that puts patient care first.',
    industry: 'Healthcare & Hospital',
    industrySlug: 'healthcare-hospital',
    icon: 'heart',
    color: 'fuchsia',
    website: 'https://healthflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Patient Wait Time', value: '60% Less' },
      { label: 'Billing Accuracy', value: '99.7%' },
      { label: 'Bed Occupancy', value: '94%' },
      { label: 'Patient Satisfaction', value: '4.9/5' },
    ],

    modules: [
      { name: 'Patients', description: 'Complete patient lifecycle from registration to discharge with medical records, history, and visit tracking.', icon: 'users' },
      { name: 'Doctors', description: 'Doctor profiles with scheduling, specializations, clinical notes, and e-prescription capabilities.', icon: 'heart' },
      { name: 'Appointments', description: 'Smart scheduling with doctor availability, walk-in management, and automated SMS/WhatsApp reminders.', icon: 'calendar' },
      { name: 'EMR / EHR', description: 'Electronic Medical Records with patient history, lab results, imaging, and clinical documentation.', icon: 'file-text' },
      { name: 'Inpatient', description: 'Real-time bed availability, ward allocation, admission/discharge, and inpatient care tracking.', icon: 'building' },
      { name: 'Emergency', description: 'Emergency department management with triage, rapid registration, and real-time bed tracking.', icon: 'heart' },
      { name: 'Surgery', description: 'Surgical scheduling, OT management, pre-op assessment, and post-operative care tracking.', icon: 'scissors' },
      { name: 'Pharmacy', description: 'Integrated pharmacy with prescription tracking, dispensing, batch and expiry management, and drug interaction alerts.', icon: 'package' },
      { name: 'Laboratory', description: 'Lab order management, result tracking, digital reports, and integration with diagnostic equipment.', icon: 'cpu' },
      { name: 'Radiology', description: 'Radiology order management, imaging workflow, PACS integration, and report generation.', icon: 'monitor' },
      { name: 'Blood Bank', description: 'Blood inventory management, donor tracking, cross-matching, and transfusion records.', icon: 'heart' },
      { name: 'Billing & Insurance', description: 'Automated billing with insurance claim processing, co-pay calculation, and payment gateway integration.', icon: 'receipt' },
      { name: 'Telemedicine', description: 'Virtual consultation platform with video calls, e-prescriptions, and remote patient monitoring.', icon: 'globe' },
      { name: 'AI Intelligence', description: 'AI-powered diagnostic assistance, clinical decision support, and predictive health analytics.', icon: 'sparkles' },
    ],

    painPoints: [
      { title: 'Long Patient Waits', before: 'Patients wait hours without updates while staff manually manages queues and schedules.', after: 'Smart scheduling and real-time queue management cut patient wait times by 60%.' },
      { title: 'Billing Errors', before: 'Manual billing leads to incorrect charges, insurance rejections, and revenue leakage.', after: 'Automated billing with insurance validation ensures 99.7% accuracy and faster reimbursements.' },
      { title: 'Pharmacy Stockouts', before: 'Critical medicines unavailable when needed, causing treatment delays and patient distress.', after: 'Auto-reorder triggers and expiry alerts ensure essential medicines are always in stock.' },
      { title: 'Disconnected Records', before: 'Patient records scattered across paper files, departments, and systems with no unified view.', after: 'Centralized electronic health records accessible to all departments in real-time.' },
    ],

    workflow: [
      { step: '01', title: 'Register & Schedule', description: 'Patient registers online or at reception. Appointment auto-scheduled based on doctor availability.' },
      { step: '02', title: 'Consult & Prescribe', description: 'Doctor accesses complete patient history. E-prescription sent directly to pharmacy.' },
      { step: '03', title: 'Test & Treat', description: 'Lab orders placed digitally. Results auto-attached to patient record. Pharmacy dispenses medication.' },
      { step: '04', title: 'Bill & Follow-up', description: 'Automated billing with insurance processing. Follow-up reminders sent to patient automatically.' },
    ],

    benefits: [
      { title: 'Faster Care', description: 'Smart scheduling and digital workflows reduce patient wait times by 60%.', metric: '60%' },
      { title: 'Accurate Billing', description: 'Automated billing with insurance validation eliminates errors and speeds up reimbursement.', metric: '99.7%' },
      { title: 'Better Occupancy', description: 'Real-time bed management and discharge planning maximize hospital capacity utilization.', metric: '94%' },
      { title: 'Patient Trust', description: 'Seamless experience from appointment to follow-up builds lasting patient relationships.', metric: '4.9/5' },
    ],

    testimonials: [
      { quote: 'HealthFlow transformed our 195-bed hospital. Patient wait times dropped from 2 hours to 45 minutes, and our billing errors virtually disappeared — critical when you\'re treating patients at no cost.', name: 'Dr. Faisal Sultan', title: 'Chief Executive Officer', company: 'Shaukat Khanum Hospital', avatar: 'FS' },
      { quote: 'The integrated pharmacy module saved us PKR 8 million in expired medicines last year. The auto-reorder feature is a game-changer for a hospital dispensing 15,000+ prescriptions monthly.', name: 'Pharmacist Zain Omar', title: 'Chief Pharmacist', company: 'Aga Khan University Hospital', avatar: 'ZO' },
      { quote: 'Our insurance claim rejection rate went from 15% to under 1%. HealthFlow\'s billing module pays for itself within the first month — and the Zakat integration handles our charitable cases seamlessly.', name: 'Hassan Bukhari', title: 'Finance Director', company: 'Indus Hospital Network', avatar: 'HB' },
    ],

    faqs: [
      { question: 'Is HealthFlow compliant with healthcare regulations?', answer: 'Yes. HealthFlow meets all Pakistan Healthcare Commission standards including patient data privacy, clinical audit trails, and mandatory reporting requirements.' },
      { question: 'Can it integrate with existing lab and diagnostic equipment?', answer: 'Absolutely. HealthFlow integrates with major lab equipment through HL7 and custom APIs. Results flow directly into patient records automatically.' },
      { question: 'Does it support multiple hospital locations?', answer: 'Yes. HealthFlow is built for hospital networks with centralized patient records and location-specific operations, scheduling, and reporting.' },
      { question: 'How does the insurance billing work?', answer: 'HealthFlow integrates with major insurance providers for real-time eligibility checks, automated claim submission, and co-pay calculation at the point of service.' },
    ],

    differentiators: [
      'Purpose-built for healthcare — not a generic ERP with medical patches',
      'Integrated pharmacy with drug interaction alerts and expiry management',
      'Smart scheduling with automated patient reminders via SMS/WhatsApp',
      'Insurance claim processing with real-time eligibility verification',
      'Centralized electronic health records accessible across all departments',
    ],

    moduleFeatures: [
      { moduleName: 'Patients', features: ['Patient registration & profiles', 'Visit history tracking', 'Insurance verification', 'Appointment linkage', 'Consent form management', 'Patient communication log'] },
      { moduleName: 'Doctors', features: ['Doctor profile & specialization', 'Schedule & availability management', 'Clinical notes & observations', 'E-prescription writing', 'Referral management', 'CME tracking & reminders'] },
      { moduleName: 'Appointments', features: ['Smart doctor availability matching', 'Walk-in management', 'SMS/WhatsApp reminders', 'Telehealth scheduling', 'Recurring appointment setup', 'No-show tracking & follow-up'] },
      { moduleName: 'EMR / EHR', features: ['Electronic health records', 'Patient history timeline', 'Lab result integration', 'Imaging & document attachment', 'Clinical documentation', 'Data sharing across departments'] },
      { moduleName: 'Inpatient', features: ['Real-time bed availability', 'Ward allocation optimization', 'Admission & discharge workflow', 'Transfer tracking system', 'Inpatient care plans', 'Bed turnover analytics'] },
      { moduleName: 'Emergency', features: ['Triage assessment system', 'Rapid patient registration', 'Real-time bed & resource tracking', 'Emergency protocol workflows', 'Critical value notification', 'Emergency reporting & analytics'] },
      { moduleName: 'Surgery', features: ['Surgical scheduling engine', 'OT allocation & management', 'Pre-op assessment checklists', 'Post-operative care tracking', 'Surgical team coordination', 'Surgery analytics & reporting'] },
      { moduleName: 'Pharmacy', features: ['Prescription processing', 'Drug interaction alerts', 'Batch & expiry tracking', 'Auto-reorder triggers', 'Controlled substance logs', 'Dispensing verification'] },
      { moduleName: 'Laboratory', features: ['Lab order management', 'Result tracking & alerts', 'Digital report generation', 'Equipment integration (HL7)', 'Critical value notification', 'Lab turnaround monitoring'] },
      { moduleName: 'Radiology', features: ['Radiology order management', 'Imaging workflow tracking', 'PACS integration', 'Report generation & distribution', 'Radiologist scheduling', 'Modality utilization analytics'] },
      { moduleName: 'Blood Bank', features: ['Blood inventory management', 'Donor registration & tracking', 'Cross-matching workflow', 'Transfusion record keeping', 'Expiry & shortage alerts', 'Compliance & reporting'] },
      { moduleName: 'Billing & Insurance', features: ['Automated charge capture', 'Insurance claim submission', 'Co-pay calculation at desk', 'Payment gateway integration', 'Denial management workflow', 'Revenue cycle analytics'] },
      { moduleName: 'Telemedicine', features: ['Video consultation platform', 'E-prescription for virtual visits', 'Remote patient monitoring', 'Secure messaging system', 'Appointment integration', 'Telehealth analytics & reporting'] },
      { moduleName: 'AI Intelligence', features: ['Diagnostic assistance AI', 'Clinical decision support', 'Predictive health analytics', 'Readmission risk scoring', 'Treatment outcome prediction', 'Population health insights'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 61, revenue: 5500, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 66, revenue: 6000, satisfaction: 3.9 },
      { month: 'Mar', efficiency: 72, revenue: 6600, satisfaction: 4.1 },
      { month: 'Apr', efficiency: 78, revenue: 7300, satisfaction: 4.3 },
      { month: 'May', efficiency: 84, revenue: 8000, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 90, revenue: 8800, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Twilio', category: 'Communication', icon: 'phone' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'HL7 FHIR', category: 'Analytics', icon: 'activity' },
    ],

    securityFeatures: [
      'HIPAA-compliant patient data protection',
      'AES-256 data encryption at rest and in transit',
      'Role-based access with clinical data restrictions',
      'Complete audit trail for all patient record access',
      'Automated daily backups with point-in-time recovery',
      'Two-factor authentication (2FA) for all staff',
      'SSL/TLS encryption for all connections',
      'Pakistan Healthcare Commission standards compliance',
    ],

    comparisonData: [
      { feature: 'Patient Records', manual: 'Paper files across departments, no unified view', withErp: 'Centralized EHR accessible to all departments in real-time' },
      { feature: 'Appointment Wait', manual: '2+ hour waits, manual queue management', withErp: 'Smart scheduling reduces wait times by 60%' },
      { feature: 'Billing Accuracy', manual: 'Manual charge capture, 15% error rate', withErp: 'Automated billing with 99.7% accuracy' },
      { feature: 'Pharmacy', manual: 'Manual expiry tracking, stockouts common', withErp: 'Auto-reorder and expiry alerts, always stocked' },
      { feature: 'Lab Results', manual: 'Paper reports, delays in delivery', withErp: 'Digital results auto-attached to patient records' },
      { feature: 'Insurance Claims', manual: 'Manual forms, 15% rejection rate', withErp: 'Automated claims with under 1% rejection' },
    ],
  },

  textileflow: {
    slug: 'textileflow',
    name: 'TextileFlow',
    tagline: 'From Fiber to Fabric. Every Thread Tracked.',
    heroDescription: 'TextileFlow is the complete textile manufacturing management platform built for spinning, weaving, dyeing, and finishing operations. Manage production, quality, inventory, energy, and compliance — all from one system that understands every stage of textile manufacturing.',
    industry: 'Textile Manufacturing',
    industrySlug: 'textile-manufacturing',
    icon: 'textcursor',
    color: 'violet',
    website: 'https://textileflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Production Yield', value: '35% Higher' },
      { label: 'Defect Rate', value: '0.3%' },
      { label: 'Energy Savings', value: '20%' },
      { label: 'On-Time Delivery', value: '98%' },
    ],

    modules: [
      { name: 'Spinning', description: 'Track spinning operations from bale to yarn with production planning, machine allocation, and quality monitoring.', icon: 'factory' },
      { name: 'Weaving', description: 'Manage loom scheduling, fabric production tracking, downtime analysis, and weave pattern management.', icon: 'scissors' },
      { name: 'Dyeing & Processing', description: 'Recipe management, shade matching, batch tracking, and finishing process control with quality checkpoints.', icon: 'tag' },
      { name: 'Production Planning', description: 'AI-driven production scheduling with capacity planning, bottleneck detection, and order prioritization.', icon: 'calendar' },
      { name: 'Fabric Inventory', description: 'Fabric-level inventory tracking from greige to finished with batch traceability and auto-reorder.', icon: 'package' },
      { name: 'Warehouse', description: 'Multi-warehouse operations with inbound/outbound tracking, storage optimization, and dispatch management.', icon: 'package' },
      { name: 'Procurement', description: 'Vendor management, purchase orders, price comparison, and delivery tracking for raw material sourcing.', icon: 'shopping' },
      { name: 'Quality Control', description: 'Multi-stage quality inspection with 4-point system, shade matching, and statistical process control.', icon: 'shield' },
      { name: 'Sales & Orders', description: 'Sales order management, buyer coordination, shipment tracking, and order-to-cash workflow.', icon: 'trending-up' },
      { name: 'Finance & Costing', description: 'Complete accounting, cost tracking per process, profitability analysis, and financial compliance.', icon: 'landmark' },
      { name: 'HR & Workforce', description: 'Employee management, shift scheduling, payroll processing, and workforce productivity tracking.', icon: 'users' },
      { name: 'Maintenance', description: 'Preventive and predictive maintenance scheduling, work orders, and asset lifecycle tracking.', icon: 'wrench' },
    ],

    painPoints: [
      { title: 'Production Blindness', before: 'No real-time visibility into machine utilization, downtime, or production progress across departments.', after: 'Real-time production dashboards with machine-level tracking and automated downtime alerts.' },
      { title: 'Quality Inconsistency', before: 'Shade variations and defect rates fluctuate without any data-driven root cause analysis.', after: 'Statistical process control with shade matching reduces defect rates to 0.3%.' },
      { title: 'Energy Waste', before: 'No visibility into energy consumption per process — massive waste goes undetected.', after: 'Machine-level energy monitoring identifies waste and drives 20% energy savings.' },
      { title: 'Compliance Pressure', before: 'Environmental and certification compliance managed manually with frequent audit failures.', after: 'Automated compliance tracking and ESG reporting ensure audit readiness at all times.' },
    ],

    workflow: [
      { step: '01', title: 'Plan Production', description: 'AI scheduling allocates machines and resources based on order priority and capacity analysis.' },
      { step: '02', title: 'Manufacture & Monitor', description: 'Real-time production tracking from spinning through dyeing. Quality checkpoints at every stage.' },
      { step: '03', title: 'Inspect & Approve', description: 'Multi-stage quality inspection with 4-point system. Shade matching and defect classification automated.' },
      { step: '04', title: 'Store & Ship', description: 'Finished goods auto-binned in warehouse. Packing lists and shipping docs generated on demand.' },
    ],

    benefits: [
      { title: 'Higher Yields', description: 'AI-driven production planning and real-time monitoring increase output by 35%.', metric: '35%' },
      { title: 'Fewer Defects', description: 'Statistical process control and shade matching reduce quality issues to near-zero.', metric: '0.3%' },
      { title: 'Lower Energy Costs', description: 'Machine-level energy monitoring identifies waste and drives significant savings.', metric: '20%' },
      { title: 'On-Time Delivery', description: 'Smart scheduling and bottleneck detection ensure 98% on-time shipment performance.', metric: '98%' },
    ],

    testimonials: [
      { quote: 'TextileFlow gave us complete visibility across our spinning, weaving, and dyeing units. Our production yield increased 35% in just 6 months — and we finally know exactly where every meter of fabric is.', name: 'Kamran Sheikh', title: 'Director Operations', company: 'Nishat Mills', avatar: 'KS' },
      { quote: 'The energy monitoring module alone saved us PKR 12 million annually. We had no idea how much energy was being wasted on idle machines — TextileFlow showed us the numbers and we acted immediately.', name: 'Navid Fazil', title: 'Chief Operating Officer', company: 'Interloop Limited', avatar: 'NF' },
      { quote: 'Our OEKO-TEX audit preparation went from 3 weeks of scrambling to a 2-hour report generation. Compliance is no longer a headache — and we\'ve expanded our export market by 20% because of it.', name: 'Ziad Bashir', title: 'Director', company: 'Gul Ahmed', avatar: 'ZB' },
    ],

    faqs: [
      { question: 'Does TextileFlow support all textile manufacturing stages?', answer: 'Yes. TextileFlow covers spinning, weaving, knitting, dyeing, and finishing with dedicated modules for each stage. Track production from bale to finished fabric.' },
      { question: 'Can it handle dyeing recipe management?', answer: 'Absolutely. TextileFlow includes comprehensive dyeing recipe management with shade matching, batch tracking, and historical recipe comparison for consistent results.' },
      { question: 'How does the energy monitoring work?', answer: 'TextileFlow integrates with energy meters to track consumption per machine and department in real-time. Dashboards show efficiency metrics, peak usage, and cost allocation automatically.' },
      { question: 'Is it suitable for composite textile units?', answer: 'Yes. TextileFlow is designed for composite units that span multiple manufacturing stages. Unified dashboards provide end-to-end visibility from raw material to finished goods.' },
    ],

    differentiators: [
      'Purpose-built for textile manufacturing — spinning, weaving, dyeing, and finishing',
      'Machine-level energy monitoring with cost allocation',
      'Dyeing recipe management with shade matching technology',
      'Statistical process control with 4-point inspection system',
      'ESG and OEKO-TEX compliance management built in',
    ],

    moduleFeatures: [
      { moduleName: 'Spinning', features: ['Bale-to-yarn production tracking', 'Machine allocation & scheduling', 'Spindle productivity monitoring', 'Yarn count & quality tracking', 'Waste percentage analysis', 'Auto-doffing coordination'] },
      { moduleName: 'Weaving', features: ['Loom scheduling & allocation', 'Fabric production tracking', 'Downtime analysis per loom', 'Weave pattern management', 'Pick & insertion rate monitoring', 'Beam & warp tracking'] },
      { moduleName: 'Dyeing & Processing', features: ['Recipe management system', 'Shade matching & approval', 'Batch tracking per dye lot', 'Finishing process control', 'Chemical consumption tracking', 'Color fastness testing records'] },
      { moduleName: 'Production Planning', features: ['AI-driven scheduling', 'Capacity planning per stage', 'Bottleneck detection', 'Order prioritization engine', 'Lead time calculation', 'Multi-stage coordination'] },
      { moduleName: 'Fabric Inventory', features: ['Greige fabric inventory', 'Finished fabric tracking', 'Batch & lot traceability', 'Auto-reorder triggers', 'Fabric grade classification', 'Consumption variance analysis'] },
      { moduleName: 'Warehouse', features: ['Inbound/outbound tracking', 'Storage zone optimization', 'Barcode scanning integration', 'Dispatch management', 'Cross-dock operations', 'Inventory accuracy audits'] },
      { moduleName: 'Procurement', features: ['Vendor performance scoring', 'Purchase order automation', 'Multi-vendor price comparison', 'Delivery tracking integration', 'Contract management', 'Raw material sourcing optimization'] },
      { moduleName: 'Quality Control', features: ['4-point inspection system', 'Shade matching automation', 'Statistical process control', 'Defect classification engine', 'Quality certificate generation', 'Vendor quality scoring'] },
      { moduleName: 'Sales & Orders', features: ['Sales order management', 'Buyer coordination portal', 'Shipment tracking & documentation', 'Order-to-cash workflow', 'Pricing & discount management', 'Sales analytics dashboards'] },
      { moduleName: 'Finance & Costing', features: ['Process-level cost tracking', 'Multi-currency accounting', 'Cost center allocation', 'Profitability by product line', 'Accounts payable & receivable', 'Tax compliance & reporting'] },
      { moduleName: 'HR & Workforce', features: ['Employee profile management', 'Shift scheduling & rotation', 'Payroll processing', 'Attendance & time tracking', 'Workforce productivity KPIs', 'Training & certification management'] },
      { moduleName: 'Maintenance', features: ['Preventive maintenance scheduling', 'Predictive maintenance alerts', 'Work order management', 'Spare parts inventory', 'Asset lifecycle tracking', 'Maintenance cost analysis'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 60, revenue: 7200, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 65, revenue: 7800, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 71, revenue: 8500, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 77, revenue: 9300, satisfaction: 4.2 },
      { month: 'May', efficiency: 83, revenue: 10100, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 89, revenue: 11000, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'SAP', category: 'Accounting', icon: 'landmark' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'IoT Gateway', category: 'Analytics', icon: 'activity' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control for production & management',
      'Complete audit trail for quality & compliance records',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'OEKO-TEX & environmental compliance data protection',
    ],

    comparisonData: [
      { feature: 'Production Visibility', manual: 'No real-time view, end-of-day reports only', withErp: 'Real-time dashboards with machine-level tracking' },
      { feature: 'Quality Control', manual: 'Manual inspection, shade variations common', withErp: '4-point system with shade matching, 0.3% defect rate' },
      { feature: 'Energy Management', manual: 'No per-machine tracking, massive waste', withErp: 'Machine-level monitoring drives 20% energy savings' },
      { feature: 'Compliance', manual: 'Manual tracking, frequent audit failures', withErp: 'Automated compliance tracking, always audit-ready' },
      { feature: 'Production Planning', manual: 'Manual scheduling, missed deadlines', withErp: 'AI-driven scheduling with bottleneck detection' },
      { feature: 'Traceability', manual: 'Paper records, no batch tracking', withErp: 'Full batch traceability from bale to finished fabric' },
    ],
  },

  creativeflow: {
    slug: 'creativeflow',
    name: 'CreativeFlow',
    tagline: 'Ideas to Impact. Projects to Profit.',
    heroDescription: 'CreativeFlow is the project management and operations platform built for creative agencies, studios, and design firms. Manage projects, clients, resources, time tracking, billing, and creative assets — all from one system that understands how creative businesses actually work.',
    industry: 'Creative Agency',
    industrySlug: 'creative-agency',
    icon: 'palette',
    color: 'pink',
    website: 'https://creativeflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Project Delivery', value: 'On-Time 95%' },
      { label: 'Resource Utilization', value: '88%' },
      { label: 'Client Retention', value: '92%' },
      { label: 'Revenue Per Employee', value: '40% Higher' },
    ],

    modules: [
      { name: 'Projects', description: 'Kanban and Gantt views with milestone tracking, task dependencies, and automated status updates.', icon: 'briefcase' },
      { name: 'AI Command', description: 'AI-powered content generation, design suggestions, and intelligent workflow automation.', icon: 'sparkles' },
      { name: 'Social Media', description: 'Social media scheduling, content calendar, engagement analytics, and multi-platform publishing.', icon: 'globe' },
      { name: 'CRM & Sales', description: 'Client relationship management with pipeline tracking, proposals, and conversion analytics.', icon: 'users' },
      { name: 'Analytics', description: 'Campaign performance dashboards, ROI tracking, audience insights, and reporting automation.', icon: 'bar-chart' },
      { name: 'Assets (DAM)', description: 'Centralized digital asset management with version control, approval workflows, and brand organization.', icon: 'package' },
      { name: 'Automation', description: 'Workflow automation for repetitive tasks, approval chains, notifications, and integrations.', icon: 'list' },
      { name: 'Finance', description: 'Project-based and hourly billing with automated invoicing, payment tracking, and financial reporting.', icon: 'landmark' },
      { name: 'Team', description: 'Team workload management, skill-based assignment, availability calendars, and capacity forecasting.', icon: 'users' },
      { name: 'Content', description: 'Content creation workflow, editorial calendar, copy management, and review/approval process.', icon: 'file-text' },
      { name: 'Client Portal', description: 'Self-service portal for clients to review work, approve deliverables, and communicate with the team.', icon: 'globe' },
      { name: 'Communication', description: 'Internal messaging, client communication, feedback threads, and notification management.', icon: 'message-circle' },
    ],

    painPoints: [
      { title: 'Scope Creep', before: 'Projects expand beyond original scope without proper tracking or additional billing.', after: 'Change request management with scope tracking ensures every extra hour is captured and billed.' },
      { title: 'Resource Chaos', before: 'No visibility into who is working on what — overworked designers and idle developers.', after: 'Real-time workload dashboards balance team capacity and skill-based task assignment.' },
      { title: 'Client Communication', before: 'Feedback scattered across email, WhatsApp, and Slack — nothing is tracked or actionable.', after: 'Centralized client portal with structured feedback, approvals, and version-controlled deliverables.' },
      { title: 'Unbilled Hours', before: 'Creative teams spend hours on revisions and calls that never make it to invoices.', after: 'Automatic time tracking captures every billable minute and links it to project invoices.' },
    ],

    workflow: [
      { step: '01', title: 'Propose & Win', description: 'Create professional proposals with scope, timeline, and budget. Client approves digitally.' },
      { step: '02', title: 'Plan & Assign', description: 'Break project into tasks. Assign based on skills and availability. Milestones set automatically.' },
      { step: '03', title: 'Create & Review', description: 'Team delivers work. Time auto-tracked. Client reviews and approves through the portal.' },
      { step: '04', title: 'Bill & Analyze', description: 'Invoice auto-generated from tracked time and milestones. Profitability analyzed per project.' },
    ],

    benefits: [
      { title: 'On-Time Delivery', description: 'Structured workflows and milestone tracking ensure 95% of projects deliver on schedule.', metric: '95%' },
      { title: 'Higher Utilization', description: 'Smart resource planning maximizes billable hours across your creative team.', metric: '88%' },
      { title: 'Client Loyalty', description: 'Transparent portals and professional communication drive repeat business.', metric: '92%' },
      { title: 'More Revenue', description: 'Capture every billable hour and control scope creep to boost revenue per employee.', metric: '40%' },
    ],

    testimonials: [
      { quote: 'CreativeFlow ended our scope creep nightmare. Every change request is now tracked, approved, and billed. Revenue per project jumped 40% — and our clients respect the process more because of it.', name: 'Zara Hussain', title: 'Managing Director', company: 'Ogilvy Pakistan', avatar: 'ZH' },
      { quote: 'We went from WhatsApp chaos to a proper client portal. Our clients love the transparency, and we love the structured feedback — it\'s transformed how Symmetry delivers work.', name: 'Danish Ali', title: 'Creative Director', company: 'Symmetry Group', avatar: 'DA' },
      { quote: 'Time tracking used to be a monthly guessing game. Now it\'s automatic and accurate. We recovered PKR 2 million in unbilled hours last quarter — hours we would have simply written off before.', name: 'Maha Rizvi', title: 'Operations Head', company: 'BBDO Pakistan', avatar: 'MR' },
    ],

    faqs: [
      { question: 'Can CreativeFlow handle both fixed-price and hourly projects?', answer: 'Yes. CreativeFlow supports fixed-price, hourly, retainer, and hybrid billing models. Each project can have its own billing structure with automated invoice generation.' },
      { question: 'Does it integrate with design tools like Figma and Adobe?', answer: 'Absolutely. CreativeFlow integrates with Figma, Adobe Creative Cloud, Slack, and other creative tools. Assets are automatically synced to the DAM module.' },
      { question: 'How does the client portal work?', answer: 'Clients get a branded portal to view project progress, review deliverables, provide structured feedback, and approve work. All communications are tracked and timestamped.' },
      { question: 'Can I track profitability per project?', answer: 'Yes. CreativeFlow calculates real-time profitability for every project by comparing tracked hours and costs against revenue. Dashboards highlight underperforming projects instantly.' },
    ],

    differentiators: [
      'Built for creative agencies — understands billable hours, scope creep, and client approvals',
      'Centralized DAM with version control and approval workflows',
      'Automatic time tracking that links directly to project billing',
      'Client self-service portal with structured feedback and approvals',
      'Real-time project profitability analysis per client and per project',
    ],

    moduleFeatures: [
      { moduleName: 'Projects', features: ['Kanban & Gantt views', 'Milestone tracking & alerts', 'Task dependency management', 'Automated status updates', 'Sprint planning tools', 'Project templates library'] },
      { moduleName: 'AI Command', features: ['AI content generation', 'Design suggestion engine', 'Intelligent workflow automation', 'Smart task prioritization', 'Creative brief analysis', 'Brand voice consistency checks'] },
      { moduleName: 'Social Media', features: ['Multi-platform scheduling', 'Content calendar management', 'Engagement analytics', 'Hashtag & trend analysis', 'Auto-publishing workflows', 'Social listening integration'] },
      { moduleName: 'CRM & Sales', features: ['Client relationship tracking', 'Sales pipeline management', 'Proposal & quotation builder', 'Conversion analytics', 'Repeat business tracking', 'Client onboarding workflow'] },
      { moduleName: 'Analytics', features: ['Campaign performance dashboards', 'ROI tracking per channel', 'Audience insights & segmentation', 'Reporting automation', 'Competitive benchmarking', 'Custom KPI dashboards'] },
      { moduleName: 'Assets (DAM)', features: ['Centralized DAM system', 'Version control & history', 'Approval workflows', 'File format preview', 'Brand asset organization', 'Rights management tracking'] },
      { moduleName: 'Automation', features: ['Workflow builder & triggers', 'Approval chain automation', 'Notification rules engine', 'Integration connectors', 'Recurring task automation', 'Status-based actions'] },
      { moduleName: 'Finance', features: ['Project-based invoicing', 'Hourly billing automation', 'Recurring invoice setup', 'Payment tracking & reminders', 'Overdue notification engine', 'Multi-currency support'] },
      { moduleName: 'Team', features: ['Team workload visualization', 'Skill-based assignment', 'Availability calendar', 'Capacity forecasting', 'Freelancer management', 'Utilization optimization'] },
      { moduleName: 'Content', features: ['Content creation workflow', 'Editorial calendar management', 'Copy management & versioning', 'Review & approval process', 'SEO optimization tools', 'Content performance tracking'] },
      { moduleName: 'Client Portal', features: ['Branded client interface', 'Deliverable review & approval', 'Structured feedback system', 'Version-controlled sharing', 'Communication history', 'Approval workflow engine'] },
      { moduleName: 'Communication', features: ['Internal team messaging', 'Client communication tools', 'Feedback thread management', 'Notification preferences', 'Email integration', 'Meeting scheduling'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 62, revenue: 2600, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 67, revenue: 3000, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 73, revenue: 3500, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 79, revenue: 4100, satisfaction: 4.3 },
      { month: 'May', efficiency: 85, revenue: 4700, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 91, revenue: 5400, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'Figma', category: 'E-commerce', icon: 'image' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'Google Drive', category: 'Cloud', icon: 'cloud' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'Adobe CC', category: 'E-commerce', icon: 'palette' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access with client data isolation',
      'Complete audit trail for project & financial changes',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'NDA & IP protection compliance features',
    ],

    comparisonData: [
      { feature: 'Project Tracking', manual: 'Email threads and spreadsheets, status unknown', withErp: 'Kanban & Gantt with milestone tracking and auto-updates' },
      { feature: 'Client Approvals', manual: 'Email attachments, lost feedback, version confusion', withErp: 'Structured portal with version-controlled approvals' },
      { feature: 'Time Tracking', manual: 'Monthly guessing, unbilled hours, lost revenue', withErp: 'Automatic time capture, every billable minute tracked' },
      { feature: 'Scope Management', manual: 'Scope creep accepted, no extra billing', withErp: 'Change request tracking with scope & billing linkage' },
      { feature: 'Profitability', manual: 'Know project cost months later, too late to adjust', withErp: 'Real-time profitability per project, instant course correction' },
      { feature: 'Resource Planning', manual: 'Overloaded designers, idle developers, no visibility', withErp: 'Workload dashboards with skill-based assignment' },
    ],
  },

  logisticflow: {
    slug: 'logisticflow',
    name: 'LogisticFlow',
    tagline: 'Every Mile. Every Shipment. One Flow.',
    heroDescription: 'LogisticFlow is the logistics and supply chain management platform built for freight forwarders, courier services, and logistics companies. Manage shipments, fleet, warehouses, routes, and compliance — all from one system that keeps goods moving and customers informed.',
    industry: 'Logistics & Supply Chain',
    industrySlug: 'logistics-supply-chain',
    icon: 'truck',
    color: 'green',
    website: 'https://logisticflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Delivery Speed', value: '30% Faster' },
      { label: 'Fleet Utilization', value: '92%' },
      { label: 'Shipment Tracking', value: 'Real-time' },
      { label: 'Cost Reduction', value: '25%' },
    ],

    modules: [
      { name: 'Shipments', description: 'End-to-end shipment lifecycle from booking to delivery with automated documentation and tracking.', icon: 'package' },
      { name: 'Fleet', description: 'Vehicle tracking, maintenance scheduling, fuel monitoring, driver management, and route optimization.', icon: 'truck' },
      { name: 'Warehouse', description: 'Multi-warehouse operations with inbound/outbound tracking, picking, packing, and storage optimization.', icon: 'package' },
      { name: 'Drivers', description: 'Driver management, performance tracking, license monitoring, assignment optimization, and payroll.', icon: 'users' },
      { name: 'Orders', description: 'Order capture from multiple channels with validation, fulfillment tracking, and customer notification.', icon: 'shopping' },
      { name: 'Fuel', description: 'Fuel consumption tracking, cost analysis, mileage monitoring, and fuel efficiency optimization.', icon: 'truck' },
      { name: 'Maintenance', description: 'Preventive and predictive maintenance scheduling, work orders, and fleet asset tracking.', icon: 'wrench' },
      { name: 'Compliance', description: 'Customs documentation, regulatory compliance, e-way bills, and multi-modal shipping document management.', icon: 'shield' },
      { name: 'AI Engine', description: 'AI-powered route optimization, demand forecasting, and intelligent logistics decision support.', icon: 'sparkles' },
      { name: 'Finance', description: 'Freight billing, vendor settlement, multi-party invoicing, and margin tracking per shipment.', icon: 'landmark' },
      { name: 'CRM', description: 'Customer portal with real-time shipment tracking, PODs, delivery estimates, and communication management.', icon: 'users' },
      { name: 'HR', description: 'Staff management, shift scheduling, payroll processing, and regulatory compliance tracking.', icon: 'briefcase' },
    ],

    painPoints: [
      { title: 'Shipment Blindness', before: 'No real-time visibility into shipment location or status — customers call constantly for updates.', after: 'GPS-powered real-time tracking with automated customer notifications at every milestone.' },
      { title: 'Fleet Mismanagement', before: 'Vehicles underutilized, maintenance missed, fuel costs untracked, and routes unplanned.', after: 'Fleet management with route optimization and maintenance scheduling achieves 92% utilization.' },
      { title: 'Warehouse Bottlenecks', before: 'Manual warehouse operations cause delays in picking, packing, and dispatching shipments.', after: 'Streamlined WMS with barcode scanning and optimized workflows eliminates warehouse bottlenecks.' },
      { title: 'Documentation Chaos', before: 'Paper-based customs and shipping documents cause delays, errors, and compliance violations.', after: 'Automated documentation generation with regulatory compliance ensures zero delays at checkpoints.' },
    ],

    workflow: [
      { step: '01', title: 'Book & Plan', description: 'Shipment booked. Route optimized automatically. Vehicle and driver assigned based on availability.' },
      { step: '02', title: 'Pick & Pack', description: 'Warehouse picks and packs shipment. Barcode scanning ensures accuracy. Loading confirmed digitally.' },
      { step: '03', title: 'Track & Deliver', description: 'Real-time GPS tracking. Customer notified at each milestone. Proof of delivery captured digitally.' },
      { step: '04', title: 'Bill & Settle', description: 'Freight invoice auto-generated. Vendor settlements processed. Margin analysis per shipment available.' },
    ],

    benefits: [
      { title: 'Faster Deliveries', description: 'AI route optimization and streamlined warehouse operations reduce delivery times by 30%.', metric: '30%' },
      { title: 'Maximum Fleet Utilization', description: 'Smart dispatching and route planning keep your vehicles productive and profitable.', metric: '92%' },
      { title: 'Full Visibility', description: 'Real-time tracking across the entire supply chain with automated customer notifications.', metric: 'Real-time' },
      { title: 'Lower Costs', description: 'Optimized routes, better fleet management, and reduced documentation errors cut costs by 25%.', metric: '25%' },
    ],

    testimonials: [
      { quote: 'LogisticFlow cut our average delivery time from 48 hours to 33 hours. The route optimization alone saves us PKR 8 million annually in fuel costs across 1,200+ service centers.', name: 'Amir Shahzad', title: 'Operations Director', company: 'TCS Logistics', avatar: 'AS' },
      { quote: 'Our fleet utilization went from 65% to 92%. We\'re doing more with fewer vehicles, and our maintenance costs dropped 40%. The GPS integration sealed the deal for us.', name: 'Naveed Iqbal', title: 'Fleet Manager', company: 'BlueEX', avatar: 'NI' },
      { quote: 'Customers used to call 50 times a day for shipment updates. The tracking portal eliminated 90% of those calls. Our team finally focuses on operations instead of answering phones.', name: 'Samina Akhtar', title: 'Customer Service Head', company: 'Leopards Courier', avatar: 'SA' },
    ],

    faqs: [
      { question: 'Can LogisticFlow handle multi-modal shipping?', answer: 'Yes. LogisticFlow supports road, rail, air, and sea freight with unified tracking, documentation, and billing across all modes of transport.' },
      { question: 'Does it integrate with GPS tracking devices?', answer: 'Absolutely. LogisticFlow integrates with all major GPS tracking providers. Real-time vehicle locations appear on the control tower dashboard automatically.' },
      { question: 'How does the route optimization work?', answer: 'Our AI engine considers delivery windows, traffic patterns, vehicle capacity, fuel costs, and driver hours to calculate optimal routes. Routes update dynamically based on real-time conditions.' },
      { question: 'Can customers track their own shipments?', answer: 'Yes. Customers get a branded tracking portal with real-time status updates, estimated delivery times, and digital proof of delivery — no phone calls needed.' },
    ],

    differentiators: [
      'Purpose-built for logistics — understands freight, fleet, and multi-modal operations',
      'AI-powered route optimization with real-time dynamic updates',
      'Logistics control tower with exception-based alerts and monitoring',
      'Integrated warehouse management with barcode and RFID support',
      'Automated customs and regulatory documentation generation',
    ],

    moduleFeatures: [
      { moduleName: 'Shipments', features: ['End-to-end shipment lifecycle', 'Automated BOL & AWB generation', 'Multi-modal shipment support', 'Status tracking at every milestone', 'Exception alert system', 'Shipment cost estimation'] },
      { moduleName: 'Fleet', features: ['GPS vehicle tracking', 'Preventive maintenance scheduling', 'Fuel consumption monitoring', 'Vehicle document management', 'Insurance & registration tracking', 'Fleet utilization analytics'] },
      { moduleName: 'Warehouse', features: ['Inbound/outbound tracking', 'Barcode scanning integration', 'Pick, pack & ship workflows', 'Storage zone optimization', 'Cross-dock management', 'Inventory accuracy audits'] },
      { moduleName: 'Drivers', features: ['Driver profile & license management', 'Performance scoring & KPIs', 'Assignment optimization', 'Driving hours compliance', 'Payroll & settlement integration', 'Training & certification tracking'] },
      { moduleName: 'Orders', features: ['Multi-channel order capture', 'Automated order validation', 'Fulfillment tracking dashboard', 'Customer notification automation', 'Backorder management', 'Order-to-delivery workflow'] },
      { moduleName: 'Fuel', features: ['Fuel consumption tracking per vehicle', 'Cost analysis & budgeting', 'Mileage monitoring & optimization', 'Fuel card integration', 'Fuel efficiency reporting', 'Anomaly detection & alerts'] },
      { moduleName: 'Maintenance', features: ['Preventive maintenance scheduling', 'Predictive maintenance alerts', 'Work order management', 'Spare parts inventory', 'Asset lifecycle tracking', 'Maintenance cost analysis'] },
      { moduleName: 'Compliance', features: ['Customs documentation generation', 'E-way bill management', 'Regulatory compliance tracking', 'Multi-modal shipping docs', 'Dangerous goods handling', 'International trade compliance'] },
      { moduleName: 'AI Engine', features: ['AI-powered route optimization', 'Demand forecasting', 'Capacity planning intelligence', 'Anomaly detection & alerts', 'Predictive maintenance triggers', 'Cost optimization recommendations'] },
      { moduleName: 'Finance', features: ['Freight bill automation', 'Multi-party invoicing', 'Vendor settlement management', 'Margin tracking per shipment', 'Rate card management', 'Reconciliation dashboards'] },
      { moduleName: 'CRM', features: ['Customer tracking portal', 'Real-time shipment visibility', 'Digital POD access', 'Invoice & payment center', 'Complaint management system', 'Shipment history archive'] },
      { moduleName: 'HR', features: ['Staff profile management', 'Shift scheduling & rotation', 'Payroll processing', 'Attendance & time tracking', 'Regulatory compliance training', 'Performance evaluation workflow'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 62, revenue: 4800, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 67, revenue: 5300, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 73, revenue: 5900, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 79, revenue: 6600, satisfaction: 4.2 },
      { month: 'May', efficiency: 85, revenue: 7400, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 91, revenue: 8200, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Xero', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'Google Maps', category: 'Analytics', icon: 'map' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Twilio', category: 'Communication', icon: 'phone' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control for operations & finance',
      'Complete audit trail for shipment & financial records',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'Customs & trade compliance data protection',
    ],

    comparisonData: [
      { feature: 'Shipment Tracking', manual: 'Phone calls to check status, no real-time data', withErp: 'GPS-powered real-time tracking with auto-notifications' },
      { feature: 'Fleet Management', manual: 'Vehicles underutilized, maintenance missed', withErp: 'Smart fleet management achieves 92% utilization' },
      { feature: 'Route Planning', manual: 'Driver experience, no optimization, high fuel costs', withErp: 'AI route optimization reduces fuel costs 25%' },
      { feature: 'Warehouse Ops', manual: 'Manual picking, frequent errors, slow dispatch', withErp: 'Barcode scanning with optimized pick-pack-ship' },
      { feature: 'Documentation', manual: 'Paper customs docs, delays at borders', withErp: 'Automated documentation, zero border delays' },
      { feature: 'Customer Service', manual: '50+ calls daily asking for shipment status', withErp: 'Self-service portal eliminates 90% of tracking calls' },
    ],
  },

  distriflow: {
    slug: 'distriflow',
    name: 'DistriFlow',
    tagline: 'Distribute Smarter. Deliver Faster. Grow Bigger.',
    heroDescription: 'DistriFlow is the distribution and wholesale management platform built for distributors, wholesalers, and CPG companies. Manage sales orders, inventory, distribution routes, trade promotions, and financial operations — all from one system that keeps goods flowing from warehouse to retail shelf.',
    industry: 'Distribution & Wholesale',
    industrySlug: 'distribution-wholesale',
    icon: 'route',
    color: 'amber',
    website: 'https://distriflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Order Fulfillment', value: '99.5%' },
      { label: 'Sales Force Productivity', value: '50% Higher' },
      { label: 'Stock Accuracy', value: '99.6%' },
      { label: 'Distribution Cost', value: '22% Lower' },
    ],

    modules: [
      { name: 'Distribution', description: 'Distribution network management with route planning, delivery scheduling, and proof of delivery capture.', icon: 'truck' },
      { name: 'Wholesale Sales', description: 'Wholesale order management with pricing tiers, bulk discounts, and customer-specific catalogs.', icon: 'shopping' },
      { name: 'Inventory', description: 'Multi-warehouse inventory with real-time stock visibility, batch tracking, and automated replenishment.', icon: 'package' },
      { name: 'Warehouse WMS', description: 'Warehouse management system with inbound/outbound, picking, packing, and storage optimization.', icon: 'package' },
      { name: 'Stock Audit', description: 'Systematic stock verification with variance tracking, adjustment workflows, and audit reporting.', icon: 'clipboard' },
      { name: 'Procurement', description: 'Vendor management, purchase orders, price comparison, and delivery tracking for product sourcing.', icon: 'truck' },
      { name: 'Logistics', description: 'Logistics coordination with vehicle loading optimization, route management, and delivery tracking.', icon: 'truck' },
      { name: 'Finance', description: 'Complete accounting with distributor margins, credit control, party ledgers, and financial reporting.', icon: 'landmark' },
      { name: 'CRM', description: 'Customer relationship management with retail outreach, loyalty programs, and sales analytics.', icon: 'users' },
      { name: 'Field Sales', description: 'Mobile sales app with route planning, order capture, store audits, and GPS-tracked visits.', icon: 'users' },
      { name: 'HR & Payroll', description: 'Staff management, payroll processing, leave tracking, and performance evaluation.', icon: 'briefcase' },
      { name: 'AI Copilot', description: 'AI-powered demand forecasting, route optimization, and intelligent distribution recommendations.', icon: 'sparkles' },
    ],

    painPoints: [
      { title: 'Order Processing Delays', before: 'Manual order entry from phone calls and WhatsApp messages creates delays and errors.', after: 'Digital order capture from field app and portal processes orders 50% faster with zero errors.' },
      { title: 'Stock Imbalance', before: 'Some warehouses overstocked while others run dry — no visibility across the network.', after: 'Real-time multi-warehouse visibility with auto-replenishment keeps stock balanced everywhere.' },
      { title: 'Trade Spend Waste', before: 'Promotions and schemes run without tracking ROI — millions spent with no accountability.', after: 'Trade promotion management with ROI tracking ensures every rupee of trade spend delivers results.' },
      { title: 'Field Sales Blindness', before: 'No visibility into sales rep activity, route coverage, or store-level performance.', after: 'GPS-tracked field sales with real-time dashboards and automated coverage reporting.' },
    ],

    workflow: [
      { step: '01', title: 'Capture Orders', description: 'Sales rep visits stores, captures orders on mobile app. Portal orders also flow in automatically.' },
      { step: '02', title: 'Fulfill & Load', description: 'Orders validated against inventory. Pick lists generated. Vehicle loading optimized by route.' },
      { step: '03', title: 'Deliver & Collect', description: 'Driver delivers along optimized route. Proof of delivery captured. Payment collected or recorded.' },
      { step: '04', title: 'Settle & Analyze', description: 'Invoices auto-generated. Party ledgers updated. Sales analytics and coverage reports available instantly.' },
    ],

    benefits: [
      { title: 'Perfect Fulfillment', description: 'Digital order capture and automated validation ensure 99.5% order accuracy.', metric: '99.5%' },
      { title: 'Productive Sales Force', description: 'Mobile app and route optimization make every sales rep 50% more effective.', metric: '50%' },
      { title: 'Accurate Inventory', description: 'Real-time stock visibility and auto-replenishment maintain 99.6% accuracy across warehouses.', metric: '99.6%' },
      { title: 'Lower Distribution Costs', description: 'Route optimization and loading efficiency reduce distribution costs by 22%.', metric: '22%' },
    ],

    testimonials: [
      { quote: 'DistriFlow transformed our distribution network across 15 cities. Our sales force closes 50% more orders daily with the mobile app — even in areas with no connectivity, the offline mode is a lifesaver.', name: 'Waqar Hassan', title: 'Distribution Head', company: 'Engro Foods', avatar: 'WH' },
      { quote: 'We were spending PKR 30 million annually on trade promotions with zero visibility into ROI. DistriFlow showed us exactly what works and what doesn\'t — we cut promotional spend by 35% while increasing volume.', name: 'Rabia Sultan', title: 'Trade Marketing Manager', company: 'Nestlé Pakistan', avatar: 'RS' },
      { quote: 'Our distribution cost per case dropped 22% after implementing route optimization. That\'s PKR 15 million straight to the bottom line annually — and our retailers are happier with more consistent delivery schedules.', name: 'Ehsan Malik', title: 'Supply Chain Director', company: 'Unilever Pakistan', avatar: 'EM' },
    ],

    faqs: [
      { question: 'Can DistriFlow handle multi-city distribution networks?', answer: 'Yes. DistriFlow is built for large distribution networks with multi-warehouse, multi-city operations. Centralized dashboards provide visibility across your entire network.' },
      { question: 'Does the field sales app work offline?', answer: 'Absolutely. The sales force app works fully offline in areas with poor connectivity. Orders sync automatically when the device reconnects to the internet.' },
      { question: 'How does trade promotion management work?', answer: 'Plan promotions, define schemes and discounts, allocate budgets, and track ROI in real-time. Every trade rupee is accounted for with automatic settlement against sales data.' },
      { question: 'Can it integrate with principal companies\' systems?', answer: 'Yes. DistriFlow integrates with SAP, Oracle, and other principal ERP systems for purchase orders, price lists, and scheme synchronization through APIs and EDI.' },
    ],

    differentiators: [
      'Purpose-built for distribution and wholesale — not retail or generic inventory',
      'Field sales automation app with offline capability and GPS tracking',
      'Trade promotion management with real-time ROI tracking',
      'Route optimization with vehicle loading and delivery sequencing',
      'Multi-warehouse inventory with auto-replenishment across the network',
    ],

    moduleFeatures: [
      { moduleName: 'Distribution', features: ['Route planning & optimization', 'Delivery scheduling engine', 'Vehicle loading optimization', 'Proof of delivery capture', 'Delivery sequence planning', 'Return logistics handling'] },
      { moduleName: 'Wholesale Sales', features: ['Wholesale order management', 'Pricing tier configuration', 'Bulk discount management', 'Customer-specific catalogs', 'Credit limit management', 'Wholesale analytics dashboards'] },
      { moduleName: 'Inventory', features: ['Multi-warehouse real-time visibility', 'Batch & expiry tracking', 'Auto-replenishment triggers', 'Warehouse zone optimization', 'Cycle counting program', 'Inter-warehouse transfers'] },
      { moduleName: 'Warehouse WMS', features: ['Inbound/outbound tracking', 'Barcode scanning integration', 'Pick, pack & ship workflows', 'Storage zone optimization', 'Cross-dock management', 'Inventory accuracy audits'] },
      { moduleName: 'Stock Audit', features: ['Systematic stock verification', 'Variance tracking & analysis', 'Adjustment workflow management', 'Audit trail documentation', 'Scheduled audit planning', 'Compliance reporting'] },
      { moduleName: 'Procurement', features: ['Purchase order management', 'Goods receipt processing', 'Price list management', 'Supplier performance analytics', 'Contract & terms tracking', 'Rebate management'] },
      { moduleName: 'Logistics', features: ['Vehicle loading optimization', 'Route management & scheduling', 'Delivery tracking & monitoring', 'Driver assignment system', 'Logistics cost analysis', 'Last-mile delivery coordination'] },
      { moduleName: 'Finance', features: ['Distributor margin tracking', 'Credit control & limits', 'Party ledger management', 'Multi-currency accounting', 'Tax compliance & reporting', 'Cash flow forecasting'] },
      { moduleName: 'CRM', features: ['Customer relationship tracking', 'Loyalty program management', 'Sales analytics dashboards', 'Retailer outreach tools', 'Customer segmentation', 'Repeat order analytics'] },
      { moduleName: 'Field Sales', features: ['Offline-capable mobile app', 'Route-based store visits', 'In-store order capture', 'GPS-tracked activity', 'Store audit checklists', 'Real-time performance dashboards'] },
      { moduleName: 'HR & Payroll', features: ['Staff lifecycle management', 'Payroll auto-processing', 'Leave management system', 'Performance evaluation workflow', 'Tax deduction automation', 'Appointment letter generation'] },
      { moduleName: 'AI Copilot', features: ['AI demand forecasting', 'Route optimization intelligence', 'Inventory optimization suggestions', 'Anomaly detection & alerts', 'Sales prediction analytics', 'Distribution network optimization'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 61, revenue: 5800, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 66, revenue: 6400, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 72, revenue: 7100, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 78, revenue: 7900, satisfaction: 4.2 },
      { month: 'May', efficiency: 84, revenue: 8800, satisfaction: 4.5 },
      { month: 'Jun', efficiency: 90, revenue: 9800, satisfaction: 4.8 },
    ],

    integrations: [
      { name: 'SAP', category: 'Accounting', icon: 'landmark' },
      { name: 'Oracle', category: 'Accounting', icon: 'landmark' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Google Maps', category: 'Analytics', icon: 'map' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'AWS', category: 'Cloud', icon: 'cloud' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access with field sales & warehouse separation',
      'Complete audit trail for orders & financial transactions',
      'Automated daily backups with disaster recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'PCI-DSS compliant payment processing',
    ],

    comparisonData: [
      { feature: 'Order Capture', manual: 'Phone calls & WhatsApp, manual entry, errors common', withErp: 'Mobile app & portal orders, 50% faster with zero errors' },
      { feature: 'Inventory Visibility', manual: 'Warehouse-by-warehouse spreadsheets, imbalanced stock', withErp: 'Real-time multi-warehouse view with auto-replenishment' },
      { feature: 'Trade Promotions', manual: 'Millions spent with zero ROI tracking', withErp: 'Real-time promotion ROI tracking for every campaign' },
      { feature: 'Field Sales', manual: 'No visibility into rep activity or coverage', withErp: 'GPS-tracked visits with real-time performance dashboards' },
      { feature: 'Route Planning', manual: 'Driver experience, wasted miles, high costs', withErp: 'Optimized routes with vehicle loading, 22% cost reduction' },
      { feature: 'Financial Control', manual: 'Manual ledgers, credit risk unknown', withErp: 'Automated credit control with party ledger management' },
    ],
  },

  electroflow: {
    slug: 'electroflow',
    name: 'ElectroFlow',
    tagline: 'Powering Electronics Retail — From Sale to Service',
    heroDescription: 'ElectroFlow is the complete ERP built for consumer electronics and home appliance retailers. Manage point-of-sale operations, installment plans, service & repair, warranty tracking, inventory across multiple branches, customer CRM, and delivery logistics — all from one powerful platform designed for how electronics retail actually works.',
    industry: 'Consumer Electronics & Appliances',
    industrySlug: 'consumer-electronics',
    icon: 'zap',
    color: 'emerald',
    website: 'https://electroflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Sales Processing', value: '5x Faster' },
      { label: 'Installment Recovery', value: '96%' },
      { label: 'Service Resolution', value: '3x Faster' },
      { label: 'Inventory Accuracy', value: '99.5%' },
    ],

    modules: [
      { name: 'POS & Sales', description: 'Multi-branch point-of-sale with barcode scanning, invoice generation, and support for cash, card, and installment sales.', icon: 'shopping' },
      { name: 'Installment Management', description: 'Flexible installment plans with down payments, EMIs, auto-reminders, overdue tracking, and payment gateway integration.', icon: 'credit-card' },
      { name: 'Service & Repair', description: 'Service ticket management, technician assignment, repair tracking, spare parts usage, and warranty validation.', icon: 'wrench' },
      { name: 'Warranty Management', description: 'Automated warranty tracking, claim processing, vendor warranty coordination, and customer warranty portal.', icon: 'shield' },
      { name: 'Inventory Management', description: 'Multi-branch stock tracking, barcode/serial number management, stock transfers, and auto-reorder triggers.', icon: 'package' },
      { name: 'Customer CRM', description: '360° customer profiles with purchase history, installment status, service records, and communication preferences.', icon: 'users' },
      { name: 'Delivery Management', description: 'Delivery scheduling, route optimization, delivery tracking, proof of delivery, and customer notifications.', icon: 'truck' },
      { name: 'Purchase & Procurement', description: 'Purchase order management, supplier coordination, GRN processing, and procurement analytics.', icon: 'truck' },
      { name: 'Expense Tracking', description: 'Branch-wise expense management, category tracking, approval workflows, and expense analytics.', icon: 'receipt' },
      { name: 'Employee Management', description: 'Staff profiles, attendance tracking, sales commission calculation, and performance dashboards.', icon: 'users' },
      { name: 'Supplier Management', description: 'Supplier database, purchase history, payment tracking, and supplier performance scoring.', icon: 'building' },
      { name: 'Branch Operations', description: 'Multi-branch dashboard, branch-wise sales analytics, stock visibility, and inter-branch transfers.', icon: 'building' },
    ],

    painPoints: [
      { title: 'Installment Tracking Chaos', before: 'Manual ledgers and WhatsApp reminders for installment collections. Overdue payments pile up with no visibility.', after: 'Automated installment tracking with SMS/WhatsApp reminders, overdue alerts, and real-time collection dashboards.' },
      { title: 'Service Ticket Black Hole', before: 'Customer appliances come in for repair and disappear into a black hole. No status updates, angry follow-up calls.', after: 'Real-time service ticket tracking with technician assignment, progress updates, and customer notification at every stage.' },
      { title: 'Multi-Branch Inventory Gaps', before: 'Stock levels are unknown across branches. Customers are sold items that are out of stock, causing embarrassment and refunds.', after: 'Unified inventory view across all branches with real-time stock levels, auto-reorder triggers, and inter-branch transfers.' },
      { title: 'Warranty Claim Nightmares', before: 'Paper warranty cards get lost. Customers argue about coverage. Vendor claims are delayed or forgotten.', after: 'Digital warranty tracking with automatic coverage validation, one-click claim processing, and vendor portal integration.' },
    ],

    workflow: [
      { step: '01', title: 'Sell & Finance', description: 'Customer purchases product at POS. Cash, card, or installment plan — system handles all payment types seamlessly.' },
      { step: '02', title: 'Deliver & Track', description: 'Delivery scheduled automatically. Customer receives real-time tracking. Proof of delivery captured digitally.' },
      { step: '03', title: 'Service & Support', description: 'Service tickets created with warranty auto-validation. Technician assigned. Customer updated at every stage.' },
      { step: '04', title: 'Collect & Grow', description: 'Installment reminders sent automatically. Overdue payments flagged. Customer relationship deepens with every interaction.' },
    ],

    benefits: [
      { title: 'Faster Sales', description: 'Process sales 5x faster with integrated POS, barcode scanning, and instant installment plan generation.', metric: '5x' },
      { title: 'Higher Recovery', description: 'Automated reminders and payment gateway integration push installment recovery rates to 96%.', metric: '96%' },
      { title: 'Quick Service', description: 'Service tickets resolved 3x faster with technician tracking, spare parts management, and warranty validation.', metric: '3x' },
      { title: 'Zero Stock Outs', description: 'Real-time inventory across all branches with auto-reorder triggers ensures you never sell what you don\'t have.', metric: '99.5%' },
    ],

    testimonials: [
      { quote: 'ElectroFlow transformed our 12-branch electronics retail operation. Installment collection went from a monthly headache to an automated process. Our recovery rate jumped from 78% to 96%.', name: 'Hashim Raza', title: 'Managing Director', company: 'Hashim Electronics', avatar: 'HR' },
      { quote: 'Service tracking was our biggest pain point. Customers would call 10 times asking about repair status. Now they get automatic SMS updates, and our resolution time dropped by 70%.', name: 'Fatima Rizvi', title: 'Operations Director', company: 'ElectroMart', avatar: 'FR' },
      { quote: 'The multi-branch inventory alone paid for the platform. We eliminated stockouts and reduced excess inventory by 30% in the first quarter — that\'s PKR 12 million freed up in working capital.', name: 'Kamran Sheikh', title: 'Supply Chain Manager', company: 'Rebel Tech', avatar: 'KS' },
    ],

    faqs: [
      { question: 'Can ElectroFlow handle multi-branch operations?', answer: 'Absolutely. ElectroFlow is built for multi-branch electronics retail with consolidated dashboards, inter-branch stock transfers, and branch-wise analytics. Each branch operates independently while management gets a unified view.' },
      { question: 'How does the installment management work?', answer: 'ElectroFlow supports flexible installment plans with custom down payments, EMI schedules, and payment terms. Automated reminders via SMS and WhatsApp, payment gateway integration for online collections, and real-time overdue tracking ensure you never lose track of receivables.' },
      { question: 'Does it handle warranty claims?', answer: 'Yes. ElectroFlow includes complete warranty management with digital warranty cards, automatic coverage validation, customer warranty portal, vendor claim processing, and extended warranty sales — purpose-built for electronics retail.' },
      { question: 'What about serial number tracking?', answer: 'ElectroFlow supports full serial number and IMEI tracking from purchase to sale to service. Every unit is traceable through its entire lifecycle, essential for warranty validation and anti-theft compliance.' },
    ],

    differentiators: [
      'Purpose-built for electronics retail — not a generic POS with appliance add-ons',
      'Integrated installment management with payment gateway and auto-reminders',
      'Service & repair tracking with warranty auto-validation',
      'Serial number and IMEI tracking through the entire product lifecycle',
      'Multi-branch operations with real-time inventory visibility and transfers',
    ],

    moduleFeatures: [
      { moduleName: 'POS & Sales', features: ['Multi-branch POS with barcode scanning', 'Cash, card, and installment sale support', 'Auto invoice generation', 'Serial number capture at sale', 'Sales commission calculation', 'Returns and exchange processing'] },
      { moduleName: 'Installment Management', features: ['Flexible EMI plan creation', 'Down payment tracking', 'Auto payment reminders via SMS/WhatsApp', 'Payment gateway integration', 'Overdue payment alerts and tracking', 'Settlement and closure management'] },
      { moduleName: 'Service & Repair', features: ['Service ticket creation and tracking', 'Technician assignment and scheduling', 'Repair progress updates', 'Spare parts usage tracking', 'Warranty auto-validation', 'Customer notification at every stage'] },
      { moduleName: 'Warranty Management', features: ['Digital warranty card issuance', 'Automatic coverage validation', 'Warranty claim processing', 'Vendor warranty coordination', 'Extended warranty sales', 'Customer warranty portal'] },
      { moduleName: 'Inventory Management', features: ['Multi-branch stock tracking', 'Serial number / IMEI management', 'Barcode-based operations', 'Inter-branch stock transfers', 'Auto-reorder triggers', 'Stock audit and cycle counting'] },
      { moduleName: 'Customer CRM', features: ['360° customer profiles', 'Purchase history tracking', 'Installment status visibility', 'Service record history', 'Communication preferences', 'Customer segmentation and analytics'] },
      { moduleName: 'Delivery Management', features: ['Delivery scheduling and assignment', 'Route optimization', 'Real-time delivery tracking', 'Proof of delivery capture', 'Customer delivery notifications', 'Delivery performance analytics'] },
      { moduleName: 'Purchase & Procurement', features: ['Purchase order automation', 'Supplier management and scoring', 'GRN processing', 'Procurement spend analytics', 'Lead time tracking', 'Purchase return processing'] },
      { moduleName: 'Expense Tracking', features: ['Branch-wise expense management', 'Category-based tracking', 'Approval workflows', 'Receipt attachment and storage', 'Expense analytics and budgets', 'Recurring expense management'] },
      { moduleName: 'Employee Management', features: ['Staff profile management', 'Attendance and shift tracking', 'Sales commission calculation', 'Performance dashboards', 'Leave management', 'Branch-wise staff allocation'] },
      { moduleName: 'Supplier Management', features: ['Supplier database and profiles', 'Purchase history tracking', 'Payment and outstanding management', 'Supplier performance scoring', 'Vendor portal access', 'Return and credit management'] },
      { moduleName: 'Branch Operations', features: ['Multi-branch consolidated dashboard', 'Branch-wise sales analytics', 'Inter-branch stock transfers', 'Branch performance comparison', 'Expense tracking per branch', 'Staff allocation and scheduling'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 60, revenue: 5200, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 66, revenue: 5800, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 72, revenue: 6500, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 79, revenue: 7200, satisfaction: 4.3 },
      { month: 'May', efficiency: 85, revenue: 8100, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 92, revenue: 9000, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'EasyPaisa', category: 'Payment', icon: 'credit-card' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'FedEx', category: 'Shipping', icon: 'truck' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control with branch-level permissions',
      'Complete audit trail for all transactions',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'Serial number and IMEI anti-theft compliance',
    ],

    comparisonData: [
      { feature: 'Installment Collection', manual: 'Manual ledgers, WhatsApp reminders, 78% recovery rate', withErp: 'Automated reminders with payment gateway, 96% recovery rate' },
      { feature: 'Service Tracking', manual: 'Paper tickets, no status updates, angry customer calls', withErp: 'Real-time tracking with customer notifications at every stage' },
      { feature: 'Inventory Management', manual: 'End-of-day counts, branch-wise spreadsheets, frequent stock-outs', withErp: 'Real-time multi-branch visibility with auto-reorder triggers' },
      { feature: 'Warranty Claims', manual: 'Lost paper cards, manual vendor coordination, delayed resolutions', withErp: 'Digital warranty with auto-validation and vendor portal integration' },
      { feature: 'POS Operations', manual: 'Standalone billing software, manual installment entry, no serial tracking', withErp: 'Integrated POS with serial capture, installment, and CRM' },
      { feature: 'Branch Management', manual: 'Separate systems per branch, consolidated reports take days', withErp: 'Unified dashboard with real-time branch comparison and analytics' },
    ],
  },

  fleetflow: {
    slug: 'fleetflow',
    name: 'FleetFlow',
    tagline: 'Every Vehicle. Every Route. One Flow.',
    heroDescription: 'FleetFlow is the complete fleet and transportation management platform built for logistics companies, delivery fleets, and transportation businesses. Manage GPS tracking, driver management, fuel monitoring, trip planning, maintenance scheduling, and delivery optimization — all from one powerful platform that keeps your fleet moving.',
    industry: 'Fleet & Transportation',
    industrySlug: 'fleet-transportation',
    icon: 'compass',
    color: 'cyan',
    website: 'https://fleetflowerp.vercel.app/',
    pricing: 'Starting from PKR 15,000/mo',
    pkrMonthly: 15000,

    stats: [
      { label: 'Fleet Utilization', value: '35%' },
      { label: 'Fuel Savings', value: '22%' },
      { label: 'On-Time Delivery', value: '98%' },
      { label: 'Maintenance Cost', value: '40% Lower' },
    ],

    modules: [
      { name: 'Fleet Tracking', description: 'Real-time GPS tracking with live vehicle location, speed monitoring, route playback, and geofence alerts for your entire fleet.', icon: 'compass' },
      { name: 'Vehicle Management', description: 'Complete vehicle lifecycle management including registration, insurance, documentation, and depreciation tracking.', icon: 'truck' },
      { name: 'Driver Management', description: 'Driver profiles, license tracking, performance scoring, attendance, and assignment management with behavior analytics.', icon: 'users' },
      { name: 'Fuel Management', description: 'Fuel consumption tracking, station-wise fill logging, mileage analytics, and fuel card integration with fraud detection.', icon: 'receipt' },
      { name: 'Trip Planning', description: 'Route optimization, trip scheduling, load planning, and stop management with estimated arrival times and cost calculation.', icon: 'map' },
      { name: 'Maintenance', description: 'Preventive maintenance scheduling, work order management, parts inventory, and service history tracking with cost analytics.', icon: 'wrench' },
      { name: 'Delivery Management', description: 'Delivery scheduling, proof of delivery, customer notifications, and real-time delivery tracking with route optimization.', icon: 'package' },
      { name: 'Finance & Billing', description: 'Trip-based billing, customer invoicing, vendor payments, expense tracking, and financial reporting with profitability analysis.', icon: 'landmark' },
      { name: 'HR & Payroll', description: 'Driver and staff payroll, trip-based incentives, overtime calculation, leave management, and compliance reporting.', icon: 'briefcase' },
      { name: 'Reports & Analytics', description: 'Fleet performance dashboards, utilization reports, cost analysis, and predictive maintenance insights with AI-powered recommendations.', icon: 'bar-chart' },
    ],

    painPoints: [
      { title: 'Blind Fleet Visibility', before: 'No idea where vehicles are — constant phone calls to drivers for location updates.', after: 'Real-time GPS tracking with live map view, geofence alerts, and route playback for every vehicle.' },
      { title: 'Fuel Theft & Waste', before: 'No accountability for fuel consumption — rampant theft and inefficient routes drain profits.', after: 'Station-wise fuel logging with mileage analytics and AI-powered fraud detection catch anomalies instantly.' },
      { title: 'Maintenance Surprises', before: 'Breakdowns happen without warning, causing delays and expensive emergency repairs.', after: 'Preventive maintenance scheduling based on mileage and time — never get caught off guard again.' },
      { title: 'Driver Mismanagement', before: 'No visibility into driver behavior, license expiry, or performance — compliance risks everywhere.', after: 'Driver scoring, license tracking, and behavior analytics keep your fleet compliant and efficient.' },
    ],

    workflow: [
      { step: '01', title: 'Plan & Assign', description: 'Create trip with optimized route. Assign vehicle and driver based on availability, capacity, and compliance.' },
      { step: '02', title: 'Track & Monitor', description: 'Real-time GPS tracking with geofence alerts. Monitor speed, stops, and route adherence live.' },
      { step: '03', title: 'Deliver & Verify', description: 'Driver captures proof of delivery. Customer auto-notified. Trip status updated in real-time.' },
      { step: '04', title: 'Bill & Analyze', description: 'Auto-generate trip invoice. Analyze fuel, maintenance, and profitability per vehicle and route.' },
    ],

    benefits: [
      { title: 'Higher Fleet Utilization', description: 'Optimize vehicle allocation and reduce idle time with intelligent trip planning and assignment.', metric: '35%' },
      { title: 'Fuel Cost Reduction', description: 'Route optimization and fuel monitoring cut fuel costs by an average of 22%.', metric: '22%' },
      { title: 'On-Time Delivery', description: 'Real-time tracking and route optimization ensure 98% on-time delivery performance.', metric: '98%' },
      { title: 'Lower Maintenance Costs', description: 'Preventive scheduling and early detection reduce maintenance costs by 40%.', metric: '40%' },
    ],

    testimonials: [
      { quote: 'FleetFlow gave us complete visibility over our 2,000+ vehicle fleet. Fuel savings alone paid for the platform within the first quarter — we detected PKR 15 million in fuel anomalies in year one.', name: 'Brig. (R) Arif Mahmood', title: 'Director Logistics', company: 'National Logistics Cell (NLC)', avatar: 'AM' },
      { quote: 'The maintenance scheduling module eliminated unexpected breakdowns. Our vehicle downtime dropped by 60% in just 3 months — and we\'re now running 95% of our trucks on schedule.', name: 'Farhan Ahmed', title: 'Operations Manager', company: 'TransPak Express', avatar: 'FA' },
      { quote: 'Driver behavior scoring transformed our safety culture. Speeding incidents dropped 75% and insurance premiums came down significantly. FleetFlow doesn\'t just track — it changes behavior.', name: 'Ayesha Malik', title: 'Safety Director', company: 'SkyLogistics', avatar: 'AM' },
    ],

    faqs: [
      { question: 'Does FleetFlow support real-time GPS tracking?', answer: 'Yes. FleetFlow integrates with all major GPS hardware providers. You get live vehicle tracking, route playback, geofence alerts, and speed monitoring from a single dashboard.' },
      { question: 'Can it handle multiple vehicle types?', answer: 'Absolutely. FleetFlow supports trucks, vans, cars, bikes, and any vehicle type. Each type has custom maintenance schedules, fuel benchmarks, and compliance requirements.' },
      { question: 'How does fuel management work?', answer: 'Drivers log fills at stations with odometer readings. The system calculates mileage, detects anomalies (fuel theft, inefficient routes), and provides station-wise and vehicle-wise consumption reports.' },
      { question: 'What about driver compliance and licenses?', answer: 'FleetFlow tracks license expiry, training certifications, and medical fitness dates with automatic alerts. You\'ll never have an expired license or non-compliant driver on the road.' },
    ],

    differentiators: [
      'Purpose-built for fleet operations — not a generic ERP with logistics patches',
      'Real-time GPS tracking with geofence and route playback',
      'AI-powered route optimization and fuel fraud detection',
      'Preventive maintenance scheduling based on actual usage',
      'Driver behavior scoring and compliance management',
    ],

    moduleFeatures: [
      { moduleName: 'Fleet Tracking', features: ['Live GPS map with vehicle positions', 'Speed monitoring and alerts', 'Geofence creation and alerts', 'Route playback and history', 'Vehicle status dashboard', 'Idle time detection and reporting'] },
      { moduleName: 'Vehicle Management', features: ['Vehicle registration and documentation', 'Insurance tracking and renewal alerts', 'Depreciation calculation', 'Vehicle assignment and availability', 'Vehicle type configuration', 'Document expiry notifications'] },
      { moduleName: 'Driver Management', features: ['Driver profiles and history', 'License and certification tracking', 'Performance scoring and ranking', 'Attendance and trip logging', 'Behavior analytics and alerts', 'Incentive calculation and tracking'] },
      { moduleName: 'Fuel Management', features: ['Station-wise fuel logging', 'Mileage calculation per vehicle', 'Fuel card integration', 'Anomaly and fraud detection', 'Consumption trend analysis', 'Cost reporting per vehicle and route'] },
      { moduleName: 'Trip Planning', features: ['Route optimization engine', 'Trip scheduling and dispatch', 'Load planning and capacity', 'Stop management and sequencing', 'ETA calculation and updates', 'Cost estimation per trip'] },
      { moduleName: 'Maintenance', features: ['Preventive maintenance scheduling', 'Work order creation and tracking', 'Parts inventory management', 'Service provider management', 'Cost tracking and analysis', 'Service history per vehicle'] },
      { moduleName: 'Delivery Management', features: ['Delivery scheduling and routing', 'Proof of delivery capture', 'Customer notification system', 'Real-time delivery tracking', 'Return and exception handling', 'Delivery performance analytics'] },
      { moduleName: 'Finance & Billing', features: ['Trip-based customer invoicing', 'Vendor payment management', 'Expense tracking and categorization', 'Profitability analysis per route', 'Accounts receivable and payable', 'Financial reporting dashboard'] },
      { moduleName: 'HR & Payroll', features: ['Driver and staff payroll', 'Trip-based incentive calculation', 'Overtime and bonus management', 'Leave and attendance tracking', 'Compliance and training records', 'Payroll reports and disbursement'] },
      { moduleName: 'Reports & Analytics', features: ['Fleet utilization dashboards', 'Cost per km analysis', 'Maintenance cost trends', 'Fuel efficiency reports', 'Driver performance rankings', 'AI-powered predictive insights'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 58, revenue: 3200, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 64, revenue: 3800, satisfaction: 3.7 },
      { month: 'Mar', efficiency: 71, revenue: 4400, satisfaction: 4.0 },
      { month: 'Apr', efficiency: 78, revenue: 5100, satisfaction: 4.3 },
      { month: 'May', efficiency: 85, revenue: 5800, satisfaction: 4.6 },
      { month: 'Jun', efficiency: 92, revenue: 6500, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'Google Maps', category: 'Navigation', icon: 'map' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'FedEx', category: 'Shipping', icon: 'truck' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control with fleet-level permissions',
      'Complete audit trail for all transactions and location data',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all GPS data connections',
      'Two-factor authentication (2FA)',
      'SOC 2 Type II compliant infrastructure',
    ],

    comparisonData: [
      { feature: 'Vehicle Tracking', manual: 'Phone calls to drivers, estimated locations', withErp: 'Real-time GPS with live map and route playback' },
      { feature: 'Fuel Management', manual: 'Paper receipts, no mileage correlation', withErp: 'Digital fuel logging with fraud detection and mileage analytics' },
      { feature: 'Maintenance', manual: 'Breakdown-driven repairs, missed service dates', withErp: 'Preventive scheduling based on mileage and time triggers' },
      { feature: 'Driver Management', manual: 'Spreadsheets, expired licenses discovered during audits', withErp: 'Automated compliance tracking with expiry alerts' },
      { feature: 'Route Planning', manual: 'Driver knowledge, no optimization', withErp: 'AI-optimized routes with time and fuel savings calculation' },
      { feature: 'Billing', manual: 'Manual trip sheets and invoice creation', withErp: 'Auto-generated invoices from trip data with profitability analysis' },
    ],
  },

  bookflow: {
    slug: 'bookflow',
    name: 'BookFlow',
    tagline: 'Every Title. Every Order. One Flow.',
    heroDescription: 'BookFlow is the complete publishing and bookstore management platform built for publishers, distributors, bookstores, and stationery shops. Manage book catalogs, author relationships, inventory tracking, print order processing, online sales, wholesale distribution, school contracts, and stationery management — all from one powerful platform that keeps your publishing business flowing.',
    industry: 'Publishing & Books',
    industrySlug: 'publishing-books',
    icon: 'book-open',
    color: 'violet',
    website: 'https://bookflowerp.vercel.app/',
    pricing: 'Starting from PKR 25,000/mo',
    pkrMonthly: 25000,

    stats: [
      { label: 'Inventory Accuracy', value: '99%' },
      { label: 'Order Fulfillment', value: '97%' },
      { label: 'Print Cost Savings', value: '25%' },
      { label: 'Sales Growth', value: '35%' },
    ],

    modules: [
      { name: 'Book Catalog', description: 'ISBN-based book cataloging with metadata, categories, pricing, and cover management for your entire publication list.', icon: 'book-open' },
      { name: 'Author Management', description: 'Author profiles, royalty calculations, contract tracking, and communication management for all your authors.', icon: 'users' },
      { name: 'Inventory Tracking', description: 'Real-time stock tracking across warehouses, retail locations, and distribution points with automated reorder alerts.', icon: 'package' },
      { name: 'Print Order Processing', description: 'Manage print runs, vendor coordination, proof approvals, and delivery schedules from manuscript to warehouse.', icon: 'printer' },
      { name: 'Online Sales', description: 'E-commerce integration, marketplace management, and multi-channel online sales tracking with order fulfillment.', icon: 'shopping-cart' },
      { name: 'Wholesale Distribution', description: 'B2B order management, bulk pricing tiers, distributor portals, and wholesale shipment tracking.', icon: 'truck' },
      { name: 'School Contracts', description: 'Academic book supply contracts, institutional ordering, tender management, and seasonal planning.', icon: 'graduation-cap' },
      { name: 'Stationery Management', description: 'Stationery product catalog, inventory tracking, and sales management alongside book operations.', icon: 'pen-tool' },
      { name: 'Financial Accounting', description: 'Revenue tracking, royalty payments, vendor settlements, and comprehensive financial reporting.', icon: 'landmark' },
      { name: 'Reports & Analytics', description: 'Sales trends, inventory turnover, author performance, and market analytics with AI-powered insights.', icon: 'bar-chart' },
    ],

    painPoints: [
      { title: 'Inventory Blind Spots', before: 'No idea which titles are selling, which are sitting in warehouses, or when to reorder — constant stock-outs and overstocks.', after: 'Real-time inventory visibility across all locations with automated reorder triggers and demand forecasting.' },
      { title: 'Author Royalty Chaos', before: 'Manual spreadsheets for royalty calculations, delayed payments, and author complaints about transparency.', after: 'Automated royalty calculations with transparent author portals and on-time payment processing.' },
      { title: 'Print Order Mismanagement', before: 'Print runs scheduled on guesswork, vendor coordination through WhatsApp, and constant delays.', after: 'Data-driven print planning with vendor management, proof workflows, and delivery tracking.' },
      { title: 'Multi-Channel Sales Fragmentation', before: 'Online sales, wholesale, and retail all tracked separately — no unified view of revenue or inventory.', after: 'Unified sales dashboard with real-time inventory sync across all channels and automatic stock allocation.' },
    ],

    workflow: [
      { step: '01', title: 'Catalog & Author', description: 'Add books to catalog with ISBN, metadata, and pricing. Link authors with royalty contracts and communication preferences.' },
      { step: '02', title: 'Print & Procure', description: 'Plan print runs based on demand forecasts. Coordinate with vendors, approve proofs, and track deliveries.' },
      { step: '03', title: 'Stock & Distribute', description: 'Receive inventory, allocate across channels, and manage wholesale shipments and school contracts.' },
      { step: '04', title: 'Sell & Settle', description: 'Process sales across all channels, calculate royalties, settle vendor payments, and analyze performance.' },
    ],

    benefits: [
      { title: 'Inventory Accuracy', description: 'Real-time tracking with automated alerts ensures 99% inventory accuracy across all locations.', metric: '99%' },
      { title: 'Print Cost Reduction', description: 'Data-driven print planning and vendor optimization reduce printing costs by an average of 25%.', metric: '25%' },
      { title: 'Sales Growth', description: 'Multi-channel sales management and market analytics drive 35% average sales growth.', metric: '35%' },
      { title: 'Author Satisfaction', description: 'Transparent royalty portals and on-time payments increase author retention and satisfaction.', metric: '95%' },
    ],

    testimonials: [
      { quote: 'BookFlow transformed our publishing house. We went from guessing print quantities to data-driven decisions. Our overstock dropped 60% in the first quarter — for academic publishers, that\'s millions saved in warehousing.', name: 'Arshad Saeed Husain', title: 'Managing Director', company: 'Oxford University Press Pakistan', avatar: 'AH' },
      { quote: 'The author royalty module alone saved us 20 hours per month. Authors love the transparency portal — complaints about payments dropped to zero, and our author retention rate is now 95%.', name: 'Sara Mahmood', title: 'Operations Manager', company: 'Ferozsons', avatar: 'SM' },
      { quote: 'Managing school contracts across Punjab used to be a nightmare of spreadsheets and emails. Now it\'s all in one system with automated reminders and seasonal planning — our school renewal rate hit 88%.', name: 'Tariq Hussain', title: 'Sales Director', company: 'Paramount Books', avatar: 'TH' },
    ],

    faqs: [
      { question: 'Can BookFlow handle multiple imprints or publishing brands?', answer: 'Yes. BookFlow supports multiple imprints under one account, each with its own catalog, branding, and royalty structures while sharing inventory and distribution resources.' },
      { question: 'How does the royalty calculation work?', answer: 'BookFlow supports multiple royalty models: flat rate, percentage of net revenue, escalating tiers, and hybrid models. Calculations are automated based on actual sales data and visible to authors through their portal.' },
      { question: 'Does it integrate with online marketplaces?', answer: 'Absolutely. BookFlow integrates with Amazon, Daraz, and other major marketplaces. Orders, inventory, and pricing sync automatically across all channels.' },
      { question: 'Can it manage school and institutional book contracts?', answer: 'Yes. BookFlow has a dedicated school contracts module with tender management, seasonal planning, bulk ordering workflows, and institutional pricing.' },
    ],

    differentiators: [
      'Purpose-built for publishing — not a generic retail ERP with book patches',
      'Integrated author royalty management with transparent author portals',
      'Print order planning with vendor coordination and proof workflows',
      'Multi-channel inventory sync across retail, wholesale, and online',
      'School contract management with tender and seasonal planning',
    ],

    moduleFeatures: [
      { moduleName: 'Book Catalog', features: ['ISBN-based cataloging with auto-metadata', 'Category and genre management', 'Cover image and media management', 'Pricing tiers and discount rules', 'Edition and format tracking', 'Bulk import/export support'] },
      { moduleName: 'Author Management', features: ['Author profiles and bibliography', 'Royalty contract management', 'Automated royalty calculations', 'Author communication portal', 'Payment history and statements', 'Multi-book royalty aggregation'] },
      { moduleName: 'Inventory Tracking', features: ['Real-time stock levels by location', 'Automated reorder point alerts', 'Multi-warehouse management', 'Stock transfer between locations', 'Inventory valuation reports', 'Cycle counting and audit tools'] },
      { moduleName: 'Print Order Processing', features: ['Print run planning and scheduling', 'Vendor management and quotes', 'Proof approval workflows', 'Delivery tracking and GRN', 'Cost tracking per print run', 'Quality control checklists'] },
      { moduleName: 'Online Sales', features: ['Marketplace integration (Amazon, Daraz)', 'Own e-commerce store management', 'Order fulfillment workflows', 'Pricing sync across channels', 'Customer review tracking', 'Sales analytics by channel'] },
      { moduleName: 'Wholesale Distribution', features: ['B2B order management', 'Bulk pricing tier configuration', 'Distributor portal access', 'Shipment tracking and delivery', 'Credit limit management', 'Returns and credit notes'] },
      { moduleName: 'School Contracts', features: ['Tender management and bidding', 'Contract creation and tracking', 'Seasonal demand planning', 'Institutional pricing rules', 'Delivery scheduling', 'Renewal and follow-up alerts'] },
      { moduleName: 'Stationery Management', features: ['Stationery product catalog', 'Inventory tracking and alerts', 'Sales and pricing management', 'Supplier coordination', 'Stock allocation rules', 'Combined book/stationery invoicing'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 55, revenue: 4200, satisfaction: 3.5 },
      { month: 'Feb', efficiency: 62, revenue: 4800, satisfaction: 3.8 },
      { month: 'Mar', efficiency: 70, revenue: 5600, satisfaction: 4.1 },
      { month: 'Apr', efficiency: 78, revenue: 6400, satisfaction: 4.4 },
      { month: 'May', efficiency: 86, revenue: 7300, satisfaction: 4.7 },
      { month: 'Jun', efficiency: 93, revenue: 8200, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'Amazon', category: 'Marketplace', icon: 'shopping-cart' },
      { name: 'Daraz', category: 'Marketplace', icon: 'shopping-cart' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
      { name: 'Google Analytics', category: 'Analytics', icon: 'bar-chart' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'Slack', category: 'Communication', icon: 'hash' },
      { name: 'Mailchimp', category: 'Marketing', icon: 'mail' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control with catalog-level permissions',
      'Complete audit trail for all transactions',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all connections',
      'Two-factor authentication (2FA)',
      'DRAP and ISBN compliance tracking',
    ],

    comparisonData: [
      { feature: 'Inventory Management', manual: 'Spreadheets, manual counts, constant stock-outs and overstocks', withErp: 'Real-time tracking with automated reorder triggers across all locations' },
      { feature: 'Royalty Calculations', manual: 'Manual spreadsheets, delayed payments, author complaints', withErp: 'Automated calculations with transparent author portal and on-time payments' },
      { feature: 'Print Planning', manual: 'Guesswork quantities, WhatsApp coordination, frequent delays', withErp: 'Data-driven planning with vendor management and proof workflows' },
      { feature: 'Multi-Channel Sales', manual: 'Separate systems per channel, no unified inventory view', withErp: 'Unified dashboard with real-time inventory sync across all channels' },
      { feature: 'School Contracts', manual: 'Spreadsheets and emails, missed renewals, no seasonal planning', withErp: 'Dedicated module with tender management and automated reminders' },
      { feature: 'Financial Reporting', manual: 'Month-end manual consolidation, delayed insights', withErp: 'Real-time financial dashboards with automated reporting' },
    ],
  },

  fuelflow: {
    slug: 'fuelflow',
    name: 'FuelFlow',
    tagline: 'Every Drop. Every Station. One Flow.',
    heroDescription: 'FuelFlow is the complete fuel station management platform built for petroleum retailers, CNG operators, and EV charging networks. Manage multi-station operations, IoT-enabled dispenser control, ATG tank monitoring, forecourt automation, fuel delivery tracking, shift management, and loyalty programs — all from one powerful platform that keeps your fuel business flowing.',
    industry: 'Fuel & Energy',
    industrySlug: 'fuel-energy',
    icon: 'fuel',
    color: 'orange',
    website: 'https://fuelflowerp.vercel.app/',
    pricing: 'Starting from PKR 30,000/mo',
    pkrMonthly: 30000,

    stats: [
      { label: 'Station Uptime', value: '99.5%' },
      { label: 'Fuel Loss Reduction', value: '40%' },
      { label: 'Delivery Accuracy', value: '98%' },
      { label: 'Revenue Growth', value: '30%' },
    ],

    modules: [
      { name: 'Station Management', description: 'Multi-station operations with real-time monitoring, shift tracking, and performance analytics across all locations.', icon: 'building' },
      { name: 'Dispenser Control', description: 'IoT-enabled dispenser management with real-time flow monitoring, nozzle tracking, and automated pricing updates.', icon: 'gauge' },
      { name: 'Tank Monitoring (ATG)', description: 'Automatic tank gauging with level, temperature, and density tracking. Real-time alerts for low levels and leaks.', icon: 'thermometer' },
      { name: 'Fuel Delivery Tracking', description: 'End-to-end fuel delivery management with variance detection, GRN processing, and supplier coordination.', icon: 'truck' },
      { name: 'CNG Management', description: 'CNG compressor, dispenser, and storage monitoring with pressure tracking and safety compliance.', icon: 'wind' },
      { name: 'EV Charging', description: 'Electric vehicle charging station management, billing, session tracking, and grid integration.', icon: 'zap' },
      { name: 'Forecourt Automation', description: 'Automated forecourt controller integration, price board management, and pump authorization control.', icon: 'cpu' },
      { name: 'Shift Management', description: 'Shift planning, handover, cash reconciliation, and attendance tracking with automated shift reports.', icon: 'clock' },
      { name: 'Car Wash', description: 'Car wash session tracking, revenue management, and scheduling with package-based pricing.', icon: 'droplets' },
      { name: 'Loyalty Programs', description: 'Customer loyalty points, fuel cards, fleet account management, and promotional campaigns.', icon: 'heart' },
    ],

    painPoints: [
      { title: 'Fuel Theft & Loss', before: 'No real-time monitoring of fuel levels — siphoning, dispenser calibration errors, and delivery shortages drain profits silently.', after: 'IoT-enabled tank monitoring with ATG integration detects variances instantly, reducing fuel loss by up to 40%.' },
      { title: 'Manual Station Operations', before: 'Paper-based shift handovers, manual dipstick measurements, and spreadsheet-based reconciliation — error-prone and slow.', after: 'Automated shift management with digital reconciliation, real-time tank gauging, and instant variance alerts.' },
      { title: 'Delivery Discrepancies', before: 'Fuel deliveries verified with manual dipsticks — ordered vs. received variances go undetected, costing thousands monthly.', after: 'Automated delivery tracking with variance detection and GRN processing ensures 98% delivery accuracy.' },
      { title: 'Multi-Station Chaos', before: 'Each station runs independently with no centralized visibility — inconsistent pricing, uncoordinated operations, and blind spots.', after: 'Unified multi-station dashboard with real-time monitoring, centralized pricing, and performance benchmarking.' },
    ],

    workflow: [
      { step: '01', title: 'Monitor & Control', description: 'ATG sensors track tank levels in real-time. Dispenser flow is monitored and pricing is automated across all stations.' },
      { step: '02', title: 'Track Deliveries', description: 'Fuel deliveries are scheduled, tracked, and verified automatically with variance detection and supplier coordination.' },
      { step: '03', title: 'Manage Shifts', description: 'Shifts are planned with digital handovers, cash reconciliation, and automated reports replacing paper processes.' },
      { step: '04', title: 'Analyze & Optimize', description: 'Comprehensive analytics on fuel consumption, revenue, station performance, and delivery patterns drive optimization.' },
    ],

    benefits: [
      { title: 'Fuel Loss Reduction', description: 'IoT-enabled tank monitoring and variance detection reduce fuel losses by an average of 40%.', metric: '40%' },
      { title: 'Delivery Accuracy', description: 'Automated delivery tracking with variance detection achieves 98% delivery accuracy.', metric: '98%' },
      { title: 'Revenue Growth', description: 'Centralized pricing, loyalty programs, and reduced losses drive 30% average revenue growth.', metric: '30%' },
      { title: 'Station Uptime', description: 'Proactive monitoring and automated alerts maintain 99.5% station uptime.', metric: '99.5%' },
    ],

    testimonials: [
      { quote: 'FuelFlow cut our fuel losses from 3% to under 0.5% in the first quarter. The ATG integration and variance alerts paid for the entire system within two months across 3,500+ retail outlets.', name: 'Syed Muhammad Taha', title: 'Director Retail Operations', company: 'Pakistan State Oil (PSO)', avatar: 'MT' },
      { quote: 'Managing 6 stations used to mean 6 different sets of spreadsheets. Now I see everything from one dashboard — shifts, deliveries, tank levels, and revenue — in real-time. Our per-station profitability improved 18%.', name: 'Farhan Raza', title: 'Area Manager', company: 'Shell Pakistan', avatar: 'FR' },
      { quote: 'The delivery tracking alone saved us PKR 2 million last year. Every liter is accounted for from the depot to the tank — and the CNG module handles our alternate fuel stations seamlessly.', name: 'Nadia Ashraf', title: 'Finance Manager', company: 'Total Parco', avatar: 'NA' },
    ],

    faqs: [
      { question: 'Can FuelFlow manage both fuel and CNG stations?', answer: 'Absolutely. FuelFlow supports fuel stations, CNG stations, EV charging points, and hybrid stations — all from a single platform. Each station type has specialized modules for its unique requirements.' },
      { question: 'How does the ATG tank monitoring work?', answer: 'FuelFlow integrates with major ATG probes (Veeder-Root, OPW, Franklin) via IoT gateways. Tank levels, temperatures, and densities are read in real-time, with alerts for low levels, water detection, and potential leaks.' },
      { question: 'Does it support multi-station operations?', answer: 'Yes. FuelFlow is designed for multi-station networks from the ground up. Centralized pricing, shift management, delivery coordination, and performance benchmarking across all your locations.' },
      { question: 'How does the delivery variance detection work?', answer: 'When a delivery is scheduled, FuelFlow tracks the expected volume. Upon delivery, the ATG reading is compared against the delivery note. Any variance beyond a configurable threshold triggers an immediate alert with detailed analysis.' },
    ],

    differentiators: [
      'Purpose-built for fuel stations — not a generic retail ERP with fuel patches',
      'IoT-native ATG and dispenser integration out of the box',
      'Automated delivery variance detection with real-time alerts',
      'Multi-station unified dashboard with centralized pricing control',
      'CNG and EV charging support alongside traditional fuel operations',
    ],

    moduleFeatures: [
      { moduleName: 'Station Management', features: ['Multi-station operations dashboard', 'Real-time station performance monitoring', 'Centralized pricing and configuration', 'Station-level P&L reporting', 'Geographic station mapping', 'Station type classification (fuel/CNG/EV/hybrid)'] },
      { moduleName: 'Dispenser Control', features: ['IoT-enabled dispenser monitoring', 'Real-time flow rate tracking', 'Automated price board updates', 'Nozzle-level transaction logging', 'Calibration tracking and alerts', 'Pump authorization and lockdown'] },
      { moduleName: 'Tank Monitoring (ATG)', features: ['Automatic tank gauging integration', 'Real-time level, temperature, density', 'Low-level and leak detection alerts', 'Water detection warnings', 'Tank capacity utilization reports', 'Historical level trend analysis'] },
      { moduleName: 'Fuel Delivery Tracking', features: ['Delivery scheduling and coordination', 'Automated GRN processing', 'Variance detection and alerts', 'Supplier management portal', 'Delivery cost tracking', 'Historical delivery analytics'] },
      { moduleName: 'CNG Management', features: ['Compressor monitoring and scheduling', 'CNG dispenser tracking', 'Storage pressure monitoring', 'Safety compliance reporting', 'CNG sales analytics', 'Maintenance scheduling'] },
      { moduleName: 'EV Charging', features: ['Charging session management', 'Billing and tariff configuration', 'Grid integration monitoring', 'Station utilization analytics', 'Remote start/stop control', 'Payment gateway integration'] },
      { moduleName: 'Forecourt Automation', features: ['Forecourt controller integration', 'Automated price board management', 'Pump authorization from POS', 'Lane and bay management', 'Safety interlock systems', 'Remote diagnostics'] },
      { moduleName: 'Shift Management', features: ['Digital shift planning and handover', 'Cash and card reconciliation', 'Attendance tracking integration', 'Automated shift reports', 'Variance alerts per shift', 'Multi-station shift comparison'] },
    ],

    chartData: [
      { month: 'Jan', efficiency: 58, revenue: 4500, satisfaction: 3.6 },
      { month: 'Feb', efficiency: 65, revenue: 5200, satisfaction: 3.9 },
      { month: 'Mar', efficiency: 73, revenue: 6100, satisfaction: 4.2 },
      { month: 'Apr', efficiency: 81, revenue: 7000, satisfaction: 4.5 },
      { month: 'May', efficiency: 88, revenue: 7800, satisfaction: 4.7 },
      { month: 'Jun', efficiency: 95, revenue: 8600, satisfaction: 4.9 },
    ],

    integrations: [
      { name: 'Veeder-Root ATG', category: 'Tank Monitoring', icon: 'thermometer' },
      { name: 'OPW', category: 'Tank Monitoring', icon: 'gauge' },
      { name: 'Gilbarco', category: 'Dispenser', icon: 'cpu' },
      { name: 'Wayne', category: 'Dispenser', icon: 'cpu' },
      { name: 'JazzCash', category: 'Payment', icon: 'credit-card' },
      { name: 'EasyPaisa', category: 'Payment', icon: 'credit-card' },
      { name: 'Stripe', category: 'Payment', icon: 'credit-card' },
      { name: 'QuickBooks', category: 'Accounting', icon: 'landmark' },
      { name: 'WhatsApp Business', category: 'Communication', icon: 'message-circle' },
    ],

    securityFeatures: [
      'AES-256 data encryption at rest and in transit',
      'Role-based access control with station-level permissions',
      'Complete audit trail for all fuel transactions',
      'Automated daily backups with point-in-time recovery',
      'SSL/TLS encryption for all IoT device connections',
      'Two-factor authentication (2FA)',
      'OGRA compliance and reporting',
    ],

    comparisonData: [
      { feature: 'Tank Monitoring', manual: 'Manual dipstick measurements twice daily, no leak detection, delayed response to variances', withErp: 'Real-time ATG integration with automated level tracking, leak detection, and instant variance alerts' },
      { feature: 'Delivery Verification', manual: 'Manual dipstick before/after delivery, paper-based reconciliation, frequent discrepancies', withErp: 'Automated delivery tracking with ATG-based verification and real-time variance detection' },
      { feature: 'Shift Management', manual: 'Paper-based handovers, manual cash counting, delayed reconciliation, frequent errors', withErp: 'Digital shift handover with automated reconciliation and instant variance alerts' },
      { feature: 'Multi-Station Control', manual: 'Phone calls and WhatsApp for coordination, no centralized visibility', withErp: 'Unified dashboard with real-time monitoring and centralized pricing across all stations' },
      { feature: 'Dispenser Management', manual: 'Manual price updates per pump, no flow monitoring, calibration drift undetected', withErp: 'IoT-enabled monitoring with automated pricing and calibration tracking' },
      { feature: 'Financial Reporting', manual: 'Month-end manual consolidation, delayed insights, no station-level P&L', withErp: 'Real-time financial dashboards with station-level P&L and automated reporting' },
    ],
  },
  salonflow: {
    slug: 'salonflow',
    name: 'SalonFlow',
    tagline: 'The Operating System for Salons & Beauty',
    heroDescription: 'SalonFlow is the complete salon and beauty business management platform built for salons, spas, and beauty clinics. Manage appointments, staff scheduling, customer CRM, loyalty programs, membership plans, service catalogs, inventory, multi-branch operations, commission tracking, and billing — all from one beautiful platform that keeps your beauty business thriving.',
    heroStats: [
      { label: 'No-Shows Reduced', value: '65%' },
      { label: 'Staff Utilization', value: '92%' },
      { label: 'Client Retention', value: '78%' },
    ],
    website: 'https://github.com/apexflowerp/SalonFlow',
    modules: [
      { id: 'mod-salonflow-appointment', name: 'Appointment Management', slug: 'appointment-management', description: 'Online booking, walk-in management, recurring appointments, and waitlist handling.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-salonflow-staff', name: 'Staff Scheduling', slug: 'staff-scheduling', description: 'Shift planning, attendance tracking, commission management, and payroll integration.', category: 'HR', price: 0, isActive: true },
      { id: 'mod-salonflow-crm', name: 'Customer CRM', slug: 'customer-crm', description: 'Customer profiles, preferences tracking, visit history, and feedback management.', category: 'CRM', price: 0, isActive: true },
      { id: 'mod-salonflow-loyalty', name: 'Loyalty Programs', slug: 'loyalty-programs', description: 'Points-based loyalty, tier management, and reward redemption.', category: 'CRM', price: 0, isActive: true },
      { id: 'mod-salonflow-membership', name: 'Membership Plans', slug: 'membership-plans', description: 'Recurring memberships, auto-renewal, package deals, and VIP tiers.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-salonflow-service', name: 'Service Catalog', slug: 'service-catalog', description: 'Service management with categories, pricing, duration, and add-ons.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-salonflow-inventory', name: 'Inventory Control', slug: 'inventory-control', description: 'Product catalog, stock tracking, purchase orders, and supplier management.', category: 'Inventory', price: 0, isActive: true },
      { id: 'mod-salonflow-branch', name: 'Multi-Branch', slug: 'multi-branch', description: 'Multi-location management, branch-specific settings, and consolidated reporting.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-salonflow-commission', name: 'Commission Tracking', slug: 'commission-tracking', description: 'Staff commission rules, calculation, and payout management.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-salonflow-billing', name: 'Billing & Invoicing', slug: 'billing-invoicing', description: 'Invoice generation, payment processing, tax management, and financial reporting.', category: 'Finance', price: 0, isActive: true },
    ],
    testimonials: [
      { quote: 'SalonFlow eliminated our no-show problem completely. Online booking with automated reminders reduced no-shows by 65% in the first month — and our staff commission disputes dropped to zero.', name: 'Masarrat Misbah', title: 'Founder & CEO', company: 'Depilex', avatar: 'MM' },
      { quote: 'Managing three branches used to mean three separate systems. Now everything is unified — appointments, staff, inventory, and finances. Our per-stylist revenue increased 30% because we\'re finally tracking it properly.', name: 'Nabila Maqsood', title: 'Creative Director', company: "Nabila's", avatar: 'NM' },
      { quote: 'Our loyal customers were our biggest asset, but we had no way to measure it. SalonFlow\'s loyalty program and CRM showed us that repeat clients spend 2.5x more — we\'ve now doubled down on retention.', name: 'Saba Ansari', title: 'Managing Director', company: 'Sabs Salon', avatar: 'SA' },
    ],
    faq: [
      { question: 'Can clients book appointments online?', answer: 'Yes. SalonFlow provides a branded online booking portal that your clients can access 24/7. They can choose services, select stylists, and book available time slots — with automated SMS and email confirmations and reminders.' },
      { question: 'How does commission tracking work?', answer: 'SalonFlow supports multiple commission models: percentage of service revenue, flat-rate per service, tiered commissions based on monthly targets, and product sales commissions. Commissions are calculated automatically and integrated with payroll.' },
      { question: 'Does it support multi-branch operations?', answer: 'Absolutely. SalonFlow is designed for multi-location salon businesses from the ground up. Centralized appointment management, staff scheduling across branches, consolidated inventory, and unified financial reporting.' },
      { question: 'Can I manage memberships and packages?', answer: 'Yes. SalonFlow handles recurring memberships with auto-renewal, service packages with multiple sessions, VIP tier programs, and prepaid wallet systems — all with automated billing and expiration tracking.' },
    ],
    differentiators: [
      'Purpose-built for salons and beauty — not a generic booking app with salon patches',
      'Multi-branch unified dashboard with centralized appointment and staff management',
      'Automated commission tracking with flexible rules per stylist',
      'Loyalty and membership programs that drive repeat visits and predictable revenue',
      'Complete inventory management for retail products alongside service operations',
    ],
    beforeAfter: [
      { feature: 'Appointment Booking', manual: 'Phone calls, WhatsApp messages, paper diaries — missed bookings and double-booking common', withErp: 'Online self-service portal with automated reminders, no double-booking, 65% fewer no-shows' },
      { feature: 'Staff Commission', manual: 'Manual calculation at month-end, disputes, delayed payouts', withErp: 'Automated real-time commission tracking with instant visibility for staff' },
      { feature: 'Client Retention', manual: 'No tracking, no follow-ups, clients disappear after visits', withErp: 'Automated loyalty points, membership programs, and targeted re-engagement campaigns' },
    ],
  },
}

/* ──────────────────────────────────────────────────────────
   Helper: Get ERP detail data by slug
   ────────────────────────────────────────────────────────── */

export function getErpDetail(slug: string): ErpDetailData | undefined {
  return ERP_DETAILS[slug]
}

/* ──────────────────────────────────────────────────────────
   Helper: Get all ERP detail slugs
   ────────────────────────────────────────────────────────── */

export function getErpDetailSlugs(): string[] {
  return Object.keys(ERP_DETAILS)
}
