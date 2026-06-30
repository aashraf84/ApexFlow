/* ══════════════════════════════════════════════════════════════
   Industry Detail Data — Rich content for each industry page
   ══════════════════════════════════════════════════════════════ */

export interface IndustryDetailData {
  slug: string
  name: string
  tagline: string
  heroDescription: string
  icon: string
  color: string
  colorHex: string
  erpName: string
  erpSlug: string
  erpStatus: 'active' | 'coming_soon'

  /* Market size and stats */
  marketStats: { label: string; value: string }[]

  /* Industry challenges */
  challenges: {
    title: string
    description: string
    impact: string
  }[]

  /* How our ERP solves industry problems */
  solutions: {
    title: string
    description: string
    icon: string
  }[]

  /* Industry workflow with ERP */
  workflow: {
    step: string
    title: string
    description: string
  }[]

  /* ROI metrics */
  roiMetrics: {
    title: string
    description: string
    metric: string
  }[]

  /* Key features for this industry */
  keyFeatures: string[]

  /* Case studies */
  caseStudies: {
    company: string
    result: string
    metric: string
  }[]

  /* FAQ */
  faqs: {
    question: string
    answer: string
  }[]
}

/* ────────────────────────────────────────────────────────── */

export const INDUSTRY_DETAILS: Record<string, IndustryDetailData> = {
  'apparel-textile': {
    slug: 'apparel-textile',
    name: 'Apparel & Textile',
    tagline: 'The Thread That Connects Everything',
    heroDescription: 'The apparel and textile industry is Pakistan\'s economic backbone, contributing 60% of exports. Yet most businesses still run on spreadsheets, WhatsApp groups, and manual processes. ApparelFlow transforms this — providing end-to-end visibility from raw material to finished garment, eliminating waste, and maximizing every rupee of margin.',
    icon: 'shirt',
    color: 'teal',
    colorHex: '#14b8a6',
    erpName: 'ApparelFlow',
    erpSlug: 'apparelflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'GDP Contribution', value: '8.5%' },
      { label: 'Export Share', value: '60%' },
      { label: 'Employment', value: '40%' },
      { label: 'Annual Growth', value: '5.2%' },
    ],

    challenges: [
      { title: 'Production Planning Gaps', description: 'Manual scheduling causes line imbalances, overtime costs, and missed shipment dates. Production managers spend hours on Excel instead of the shop floor.', impact: '15-20% capacity waste' },
      { title: 'Inventory Blindness', description: 'No real-time visibility into raw material, WIP, or finished goods stock. Overstocking ties up capital while stockouts halt production lines.', impact: 'PKR 5M+ tied up in excess inventory' },
      { title: 'Quality Escapes', description: 'Defects caught at final inspection instead of inline — leading to rework, delays, and rejected shipments that damage buyer relationships.', impact: '3-8% rejection rate' },
      { title: 'Supply Chain Opacity', description: 'No visibility into supplier performance, fabric in-transit status, or delivery reliability. Procurement is reactive instead of proactive.', impact: '20% late deliveries' },
    ],

    solutions: [
      { title: 'Smart Production Planning', description: 'AI-driven scheduling optimizes line allocation, balances capacity, and identifies bottlenecks before they cause delays. Gantt charts update in real-time.', icon: 'cpu' },
      { title: 'Unified Inventory', description: 'Real-time tracking of raw materials, WIP, and finished goods across all warehouses. Auto-reorder triggers prevent stockouts without overstocking.', icon: 'package' },
      { title: 'Inline Quality Control', description: 'Quality checkpoints at every production stage with defect tracking, AQL sampling, and real-time dashboards. Catch issues when they\'re cheap to fix.', icon: 'shield' },
      { title: 'Supply Chain Visibility', description: 'End-to-end supply chain tracking from yarn procurement to garment shipment. Supplier scorecards and predictive delivery analytics.', icon: 'truck' },
    ],

    workflow: [
      { step: '01', title: 'Order Intake', description: 'Buyer places order. System auto-checks fabric availability, production capacity, and delivery feasibility.' },
      { step: '02', title: 'Smart Scheduling', description: 'AI allocates production lines, labor, and materials. Critical path highlighted with milestone alerts.' },
      { step: '03', title: 'Shop Floor Execution', description: 'Real-time tracking of every operation. Quality checkpoints at cutting, sewing, and finishing.' },
      { step: '04', title: 'Ship & Satisfy', description: 'Auto-generated shipping docs and invoices. Buyer portal updated in real-time. Feedback captured for continuous improvement.' },
    ],

    roiMetrics: [
      { title: 'Production Efficiency', description: 'Optimized scheduling and real-time tracking increase line efficiency by 40%.', metric: '40%' },
      { title: 'Waste Reduction', description: 'Better fabric utilization and reduced rework cut material waste by 25%.', metric: '25%' },
      { title: 'On-Time Delivery', description: 'Proactive scheduling and real-time monitoring push on-time delivery above 95%.', metric: '95%+' },
      { title: 'Inventory Optimization', description: 'Just-in-time procurement and real-time stock visibility free up working capital.', metric: '30%' },
    ],

    keyFeatures: [
      'AI-driven production scheduling with capacity optimization',
      'Real-time inventory tracking with barcode/RFID support',
      'Inline quality control with AQL sampling',
      'Buyer self-service portal for order tracking',
      'Fabric & yarn batch traceability',
      'Multi-factory management from one dashboard',
      'Automated shipping documentation',
      'Cost center tracking and profitability analysis',
    ],

    caseStudies: [
      // Case studies are dynamically fetched from real ApparelFlow clients
    ],

    faqs: [
      { question: 'How does ApparelFlow handle multi-factory operations?', answer: 'ApparelFlow provides a centralized dashboard for all your factories with factory-level autonomy. Transfer materials between locations, compare performance, and generate consolidated reports — all in real-time.' },
      { question: 'Can it handle both woven and knit garments?', answer: 'Yes. ApparelFlow supports all garment types including woven, knit, denim, and sweaters. Production workflows adapt to the specific manufacturing process for each type.' },
      { question: 'What about fabric consumption tracking?', answer: 'ApparelFlow tracks fabric consumption at every stage — cutting, sewing, and finishing — with variance analysis against theoretical consumption. This alone typically saves 5-8% on fabric costs.' },
      { question: 'How long until we see ROI?', answer: 'Most clients see positive ROI within 3-4 months. The quick wins are typically inventory optimization (freeing working capital) and production efficiency (increasing throughput without additional costs).' },
    ],
  },

  hospitality: {
    slug: 'hospitality',
    name: 'Hospitality',
    tagline: 'Where Every Stay Becomes a Story',
    heroDescription: 'The hospitality industry lives and dies by guest experience. Yet most hotels operate with disconnected systems — separate tools for reservations, housekeeping, F&B, and billing. HotelFlow unifies everything into one intelligent platform that maximizes revenue, delights guests, and runs your operation like clockwork.',
    icon: 'hotel',
    color: 'amber',
    colorHex: '#f59e0b',
    erpName: 'HotelFlow',
    erpSlug: 'hotelflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Market Size (PK)', value: '$3.5B' },
      { label: 'Hotel Growth', value: '12%/yr' },
      { label: 'Digital Bookings', value: '78%' },
      { label: 'Revenue Leakage', value: '15-20%' },
    ],

    challenges: [
      { title: 'Channel Conflicts', description: 'Managing rates and availability across Booking.com, Agoda, and direct channels manually leads to overbookings and rate disparities.', impact: '5-8% overbooking rate' },
      { title: 'Revenue Left on Table', description: 'Static pricing during peak seasons and events means missed revenue opportunities. Most hotels leave 15-20% revenue on the table.', impact: '15-20% revenue leakage' },
      { title: 'Housekeeping Delays', description: 'No real-time visibility into room readiness. Guests wait for rooms while housekeeping operates on walkie-talkies and paper lists.', impact: '30 min average delay' },
      { title: 'Guest Experience Gaps', description: 'No system to remember guest preferences. Every stay feels like the first time, missing opportunities for personalization and loyalty.', impact: 'Low repeat bookings' },
    ],

    solutions: [
      { title: 'Unified Channel Manager', description: 'Real-time sync across 50+ OTAs with rate parity management and overbooking protection. One update propagates everywhere instantly.', icon: 'globe' },
      { title: 'Dynamic Revenue Engine', description: 'AI-powered pricing adjusts rates based on demand patterns, local events, competitor rates, and historical data to maximize RevPAR.', icon: 'trending-up' },
      { title: 'Smart Housekeeping', description: 'Real-time room status dashboard with auto-assignment of tasks as guests check out. Priority-based scheduling ensures VIP rooms are ready first.', icon: 'sparkles' },
      { title: 'Guest Memory System', description: '360° guest profiles that remember every preference — room type, pillow firmness, dietary needs, and special occasions.', icon: 'heart' },
    ],

    workflow: [
      { step: '01', title: 'Book Anywhere', description: 'Guest books through any channel. Reservation syncs instantly across all platforms with rate parity.' },
      { step: '02', title: 'Pre-Arrival Prep', description: 'Guest completes registration online. Preferences noted. Room pre-assigned based on profile and availability.' },
      { step: '03', title: 'Express Check-in', description: 'Walk in, verify ID, get digital key — under 2 minutes. All departments notified of arrival.' },
      { step: '04', title: 'Delight & Retain', description: 'Personalized service throughout stay. Auto check-out. Follow-up communication drives repeat bookings.' },
    ],

    roiMetrics: [
      { title: 'RevPAR Increase', description: 'Dynamic pricing and channel optimization increase Revenue Per Available Room by 18%.', metric: '18%' },
      { title: 'Faster Check-in', description: 'Express check-in reduces front desk wait from 8 minutes to under 2 minutes.', metric: '5x' },
      { title: 'Zero Overbooking', description: 'Real-time channel sync eliminates overbooking incidents entirely.', metric: '100%' },
      { title: 'Guest Satisfaction', description: 'Personalized experiences and seamless operations push satisfaction scores to 4.8/5.', metric: '4.8/5' },
    ],

    keyFeatures: [
      'Real-time channel manager with 50+ OTA integrations',
      'Dynamic pricing engine with demand forecasting',
      'Express check-in/out with digital key support',
      '360° guest CRM with preference memory',
      'Automated housekeeping scheduling and tracking',
      'F&B management with POS and recipe costing',
      'Event and banquet management',
      'Automated night audit with reconciliation',
    ],

    caseStudies: [
      { company: 'Serena Hotels', result: 'Revenue per available room up 28% with dynamic pricing across all properties', metric: '28%' },
      { company: 'Pearl Continental — Hashoo Group', result: 'Housekeeping response time cut from 45 min to 12 min across 8 hotels', metric: '73%' },
      { company: 'Shangri-La Boutique', result: 'Guest satisfaction scores climbed from 4.1 to 4.8 with personalized service tracking', metric: '4.8/5' },
    ],

    faqs: [
      { question: 'Does HotelFlow work for small boutique hotels?', answer: 'Yes. HotelFlow scales from 10-room boutique hotels to 500+ room chains. Smaller properties get simplified workflows while larger operations get the full enterprise feature set.' },
      { question: 'How quickly can we go live?', answer: 'Most hotels are fully operational within 2-3 weeks. This includes data migration, staff training, and OTA connections. Our team handles the entire transition.' },
      { question: 'What about our existing PMS?', answer: 'HotelFlow replaces your existing PMS with a more comprehensive system. We handle complete data migration from any PMS including Opera, Cloudbeds, or Hotelogix.' },
      { question: 'Does it work offline?', answer: 'Yes. Critical functions like check-in/out and POS work offline and sync when connectivity is restored. No operations stop due to internet issues.' },
    ],
  },

  education: {
    slug: 'education',
    name: 'Education',
    tagline: 'Empowering Institutions. Elevating Education.',
    heroDescription: 'Educational institutions face unique operational challenges — managing thousands of students, hundreds of faculty, complex fee structures, and regulatory compliance. EduFlow was built from the ground up to handle the specific needs of schools, colleges, and universities, turning administrative burden into operational excellence.',
    icon: 'graduation',
    color: 'emerald',
    colorHex: '#10b981',
    erpName: 'EduFlow',
    erpSlug: 'eduflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Students (PK)', value: '70M+' },
      { label: 'Institutions', value: '300K+' },
      { label: 'Education Spend', value: '$12B' },
      { label: 'Digital Adoption', value: '23%' },
    ],

    challenges: [
      { title: 'Admission Overload', description: 'Thousands of applications processed manually during admission season. Documents lost, deadlines missed, and parents frustrated by slow responses.', impact: '3-4 week processing time' },
      { title: 'Fee Collection Gaps', description: 'Manual fee tracking leads to 15-20% late payments, reconciliation errors, and cash flow problems that affect operations.', impact: '15-20% late payments' },
      { title: 'Exam Management Complexity', description: 'Paper-based exam systems are slow, error-prone, and unable to provide timely analytics on student performance.', impact: 'Weeks for results' },
      { title: 'Parent Communication', description: 'No structured communication channels — parents rely on phone calls and WhatsApp groups that are unreliable and overwhelming.', impact: 'Low parent engagement' },
    ],

    solutions: [
      { title: 'Digital Admissions', description: 'Online application portal with automated document verification, merit list generation, and real-time status tracking for applicants and parents.', icon: 'file-text' },
      { title: 'Automated Fee Collection', description: 'Payment gateway integration with auto-billing, reminder notifications, and real-time collection dashboards. Chase less, collect more.', icon: 'credit-card' },
      { title: 'Smart Examinations', description: 'Online and offline exam management with question banks, auto-grading, instant results, and performance analytics for early intervention.', icon: 'clipboard-check' },
      { title: 'Parent Portal', description: 'Dedicated portal where parents see attendance, grades, fee status, and school announcements in real-time. No more phone tag.', icon: 'smartphone' },
    ],

    workflow: [
      { step: '01', title: 'Apply Online', description: 'Student submits application with documents. System verifies eligibility and generates application ID.' },
      { step: '02', title: 'Merit & Enroll', description: 'Merit list auto-generated. Admitted students enrolled with course assignment and timetable generation.' },
      { step: '03', title: 'Track & Engage', description: 'Attendance, grades, and activities tracked digitally. Parents and students see progress in real-time.' },
      { step: '04', title: 'Graduate & Connect', description: 'Automated transcripts and certificates. Alumni network maintains lifelong institutional connection.' },
    ],

    roiMetrics: [
      { title: 'Admin Time Saved', description: 'Automation of routine administrative tasks frees up 60% of staff time for education quality.', metric: '60%' },
      { title: 'Fee Collection Rate', description: 'Payment gateway integration and automated reminders push collection rates to 98%.', metric: '98%' },
      { title: 'Admission Speed', description: 'Digital processing reduces admission cycle from weeks to days — 10x faster.', metric: '10x' },
      { title: 'Parent Satisfaction', description: 'Real-time visibility and structured communication dramatically improve parent engagement.', metric: '4.7/5' },
    ],

    keyFeatures: [
      'Online admission portal with automated verification',
      'Fee management with payment gateway integration',
      'Digital examination system with auto-grading',
      'Parent and student portals with real-time access',
      'Academic planning and timetable generation',
      'Library management with digital resources',
      'HR and payroll for staff management',
      'Institutional analytics and compliance reporting',
    ],

    caseStudies: [
      { company: 'LUMS', result: 'Single source of truth for 15,000 students and 800 faculty', metric: '15K+' },
      { company: 'Aga Khan University', result: 'Fee collection rate improved from 82% to 98% across all programs', metric: '98%' },
      { company: 'NUST', result: 'Student services requests resolved 70% faster with automated workflows', metric: '70%' },
    ],

    faqs: [
      { question: 'Is EduFlow suitable for both schools and universities?', answer: 'Yes. EduFlow adapts to any educational institution — from K-12 schools to large universities. The configuration adjusts to your structure, whether that\'s departments and faculties or grades and sections.' },
      { question: 'How does the online exam system work?', answer: 'EduFlow supports both online and offline exams. For online exams, it includes a question bank, random paper generation, timer enforcement, and auto-grading for objective questions. Subjective questions can be graded by faculty with rubrics.' },
      { question: 'Can parents pay fees online?', answer: 'Yes. EduFlow integrates with JazzCash, EasyPaisa, and bank transfers. Parents receive automated fee notices and can pay directly through the parent portal.' },
      { question: 'What about data security and student privacy?', answer: 'EduFlow is built with AES-256 encryption, role-based access control, and full audit trails. Student data is protected with the same standards used in banking systems.' },
    ],
  },

  'automotive-workshop': {
    slug: 'automotive-workshop',
    name: 'Automotive & Workshop',
    tagline: 'Rev Up Your Workshop Operations',
    heroDescription: 'Automotive workshops operate in a high-pressure environment where every minute counts. Yet most workshops still rely on paper job cards, mental inventory tracking, and phone-based customer communication. AutoFlow digitizes and optimizes every aspect of workshop management, from job cards to billing, ensuring nothing falls through the cracks.',
    icon: 'wrench',
    color: 'sky',
    colorHex: '#0ea5e9',
    erpName: 'AutoFlow',
    erpSlug: 'autoflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Registered Workshops (PK)', value: '250K+' },
      { label: 'Market Growth', value: '15%/yr' },
      { label: 'Parts Market', value: '$5B' },
      { label: 'Digital Adoption', value: '<10%' },
    ],

    challenges: [
      { title: 'Lost Job Cards', description: 'Paper job cards get misplaced, leading to missed tasks, incomplete service, and billing disputes that cost customer trust.', impact: '12% revenue leakage' },
      { title: 'Parts Stockouts', description: 'Critical parts unavailable when needed causes delays, customer frustration, and loss of business to competitors who have the part in stock.', impact: '3-5 days wait time' },
      { title: 'Customer Attrition', description: 'No system for service reminders or follow-up means customers forget your workshop when it\'s time for their next service.', impact: '60% don\'t return' },
      { title: 'Billing Errors', description: 'Manual calculation of labor hours, parts markup, and service charges leads to undercharging or disputes that damage relationships.', impact: 'PKR 50K+ monthly loss' },
    ],

    solutions: [
      { title: 'Digital Job Cards', description: 'Create, assign, and track job cards digitally. Every task captured, every charge recorded — no revenue leaks, no missed steps.', icon: 'clipboard' },
      { title: 'Smart Inventory', description: 'Parts inventory with auto-reorder triggers, supplier portal integration, and real-time stock levels. Never run out of critical parts again.', icon: 'package' },
      { title: 'Service Reminders', description: 'Automated SMS and WhatsApp reminders based on mileage and service intervals bring customers back before they think of competitors.', icon: 'bell' },
      { title: 'Auto-Billing', description: 'Labor, parts, and markup auto-calculated from job card data. Professional invoices generated instantly. Capture every rupee.', icon: 'receipt' },
    ],

    workflow: [
      { step: '01', title: 'Check-in Vehicle', description: 'Vehicle checked in with digital job card. Customer gets real-time status tracking link.' },
      { step: '02', title: 'Assign & Source', description: 'Technician assigned. Parts checked in inventory — auto-PO generated if unavailable.' },
      { step: '03', title: 'Service & Update', description: 'Work progresses with real-time status updates. Customer notified at each milestone.' },
      { step: '04', title: 'Invoice & Retain', description: 'Auto-invoice generated. Next service reminder scheduled. Customer loyalty earned.' },
    ],

    roiMetrics: [
      { title: 'Service Speed', description: 'Streamlined workflows reduce vehicle turnaround time by 45%.', metric: '45%' },
      { title: 'Revenue Capture', description: 'Automated billing eliminates the PKR 50K+ monthly loss from manual errors.', metric: '99.5%' },
      { title: 'Customer Return', description: 'Service reminders and transparent communication bring 85% of customers back.', metric: '85%' },
      { title: 'Parts Optimization', description: 'Smart inventory reduces stockouts and overstocking, freeing working capital.', metric: '30%' },
    ],

    keyFeatures: [
      'Digital job cards with real-time tracking',
      'Parts inventory with auto-reorder triggers',
      'Supplier portal for direct ordering',
      'Automated SMS/WhatsApp service reminders',
      'Vehicle service history and maintenance tracking',
      'Auto-calculated billing with labor, parts, and markup',
      'Multi-bay scheduling and technician assignment',
      'Revenue and productivity analytics',
    ],

    caseStudies: [
      { company: 'Atlas Honda', result: 'Warranty claim processing time cut by 60% across 150+ dealerships', metric: '60%' },
      { company: 'Dewan Motors', result: 'Service revenue grew 40% with proactive maintenance reminders', metric: '40%' },
      { company: 'Pak Suzuki Motor', result: 'Parts inventory carrying costs reduced by PKR 8M annually', metric: 'PKR 8M' },
    ],

    faqs: [
      { question: 'Can AutoFlow handle both cars and bikes?', answer: 'Yes. AutoFlow supports all vehicle types — cars, bikes, trucks, and heavy machinery. Vehicle profiles are customizable for each type with specific service checklists and maintenance schedules.' },
      { question: 'Does it work for multi-location workshops?', answer: 'Absolutely. AutoFlow supports multi-location operations with centralized inventory visibility, inter-branch parts transfers, and consolidated reporting.' },
      { question: 'How do service reminders work?', answer: 'AutoFlow sends automated SMS and WhatsApp reminders based on vehicle mileage, time since last service, or manufacturer maintenance schedules. You can customize reminder timing and channels.' },
      { question: 'Can I integrate with parts suppliers?', answer: 'Yes. AutoFlow includes a supplier portal where you can check availability, compare prices, and place orders directly. This eliminates phone calls and WhatsApp ordering.' },
    ],
  },

  pharmaceutical: {
    slug: 'pharmaceutical',
    name: 'Pharmaceutical',
    tagline: 'Compliance Without Compromise',
    heroDescription: 'The pharmaceutical industry operates under the strictest regulatory scrutiny. Every batch, every transaction, every controlled substance must be tracked with absolute precision. PharmaFlow was built for this reality — ensuring compliance, preventing expiry losses, and streamlining operations across all your pharmacy branches.',
    icon: 'pill',
    color: 'red',
    colorHex: '#ef4444',
    erpName: 'PharmaFlow',
    erpSlug: 'pharmaflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Market Size (PK)', value: '$4.2B' },
      { label: 'Annual Growth', value: '12%' },
      { label: 'Pharmacies', value: '95K+' },
      { label: 'Expiry Losses', value: '3-8%' },
    ],

    challenges: [
      { title: 'Expiry Losses', description: 'Manual expiry tracking leads to thousands of rupees in expired stock that must be written off — a direct hit to profitability.', impact: '3-8% of inventory' },
      { title: 'Regulatory Compliance', description: 'DRAP requirements for controlled substances, batch tracking, and audit trails create massive administrative overhead with paper systems.', impact: 'Days of report prep' },
      { title: 'Multi-Branch Disconnect', description: 'Each pharmacy branch operates independently with no real-time visibility into stock levels, sales, or patient data.', impact: 'No consolidated view' },
      { title: 'Dispensing Errors', description: 'Manual prescription processing risks drug interactions, wrong dosages, and controlled substance mismanagement — endangering patient safety.', impact: '1-2% error rate' },
    ],

    solutions: [
      { title: 'FEFO Enforcement', description: 'First-Expiry-First-Out automatically enforced at every point of sale. Expiry alerts and auto-removal ensure zero expired stock reaches patients.', icon: 'clock' },
      { title: 'Compliance Automation', description: 'Every transaction automatically logged for DRAP compliance. Generate audit-ready reports on demand — no more weeks of preparation.', icon: 'shield' },
      { title: 'Multi-Branch Sync', description: 'Real-time synchronization across all branches with inter-branch stock transfers, consolidated reporting, and centralized control.', icon: 'building' },
      { title: 'Drug Safety System', description: 'Automated drug interaction checking and dosage verification at the point of dispensing. Patient safety is never left to chance.', icon: 'heart-pulse' },
    ],

    workflow: [
      { step: '01', title: 'Receive Rx', description: 'Prescription scanned or entered. System checks drug interactions and dosage automatically.' },
      { step: '02', title: 'Dispense (FEFO)', description: 'Medication dispensed from batch-tracked inventory with FEFO enforcement. Expiry verified.' },
      { step: '03', title: 'Bill & Process', description: 'Insurance claims processed. Digital receipt issued. Transaction logged for compliance.' },
      { step: '04', title: 'Report & Comply', description: 'Every transaction in audit trail. Regulatory reports generated on demand. Always inspection-ready.' },
    ],

    roiMetrics: [
      { title: 'Expiry Reduction', description: 'FEFO enforcement and proactive alerts reduce expiry losses by 90%.', metric: '90%' },
      { title: 'Compliance Score', description: 'Automated logging and reporting ensure 100% regulatory compliance.', metric: '100%' },
      { title: 'Dispensing Accuracy', description: 'Automated checks eliminate human error, achieving 99.9% accuracy.', metric: '99.9%' },
      { title: 'Branch Visibility', description: 'Real-time sync provides instant visibility across all locations.', metric: 'Real-time' },
    ],

    keyFeatures: [
      'FEFO enforcement with batch and expiry tracking',
      'DRAP compliance with automated audit trails',
      'Drug interaction alerts and dosage verification',
      'Multi-branch real-time sync and transfers',
      'Insurance claim processing in POS',
      'Controlled substance double-verification',
      'Patient medication history tracking',
      'Supplier portal with purchase order management',
    ],

    caseStudies: [
      { company: 'Martin Dow', result: 'Expiry losses reduced by PKR 5M in first year with FEFO enforcement', metric: 'PKR 5M' },
      { company: 'Getz Pharma', result: 'DRAP audit preparation time cut from 3 weeks to 2 days', metric: '90%' },
      { company: 'Searle Pakistan', result: 'Batch traceability achieved across entire distribution network in real-time', metric: '100%' },
    ],

    faqs: [
      { question: 'Is PharmaFlow DRAP compliant?', answer: 'Yes. PharmaFlow is built specifically to meet DRAP requirements including controlled substance tracking, batch traceability, and automated regulatory reporting.' },
      { question: 'How does FEFO enforcement work?', description: 'At every point of sale, the system automatically selects the batch with the nearest expiry date. Pharmacists cannot override this without documented justification and manager approval.', answer: 'PharmaFlow enforces FEFO at every point of sale by automatically selecting the batch with the nearest expiry date. Override requires documented justification and manager approval.' },
      { question: 'Can it handle insurance billing?', answer: 'Yes. PharmaFlow integrates with major health insurance providers for automatic claim submission, co-pay calculation, and payment reconciliation.' },
      { question: 'What about controlled substances?', answer: 'PharmaFlow includes dedicated controlled substance management with special tracking, double-verification dispensing, regulatory reporting, and audit trails that exceed DRAP requirements.' },
    ],
  },

  retail: {
    slug: 'retail',
    name: 'Retail',
    tagline: 'Retail Reimagined. From Shelf to Screen.',
    heroDescription: 'Retail is evolving faster than ever — omnichannel, loyalty programs, dynamic pricing, and real-time inventory are no longer nice-to-haves. MartFlow brings all these capabilities to your retail operation, whether you run one store or a hundred, with a POS that\'s fast enough for the busiest rush and smart enough to grow your business.',
    icon: 'shopping',
    color: 'yellow',
    colorHex: '#eab308',
    erpName: 'MartFlow',
    erpSlug: 'martflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Retail Market (PK)', value: '$152B' },
      { label: 'Annual Growth', value: '10%' },
      { label: 'Organized Retail', value: '15%' },
      { label: 'E-commerce Share', value: '8%' },
    ],

    challenges: [
      { title: 'Inventory Mismatches', description: 'System stock never matches physical count. Shrinkage, miscounts, and manual errors create a perpetual gap between what you think you have and what\'s actually on the shelf.', impact: '5-8% variance' },
      { title: 'Slow Checkout', description: 'During peak hours, long queues drive customers away. Older POS systems can\'t keep up with the volume, costing you sales and satisfaction.', impact: '15% abandoned carts' },
      { title: 'No Customer Data', description: 'You know what sold but not who bought it. Without purchase history and preferences, you can\'t build loyalty or run targeted promotions.', impact: 'Low repeat rate' },
      { title: 'Multi-Store Disconnection', description: 'Each store operates as an island. No visibility into stock levels, transfers, or comparative performance across locations.', impact: 'No cross-store visibility' },
    ],

    solutions: [
      { title: 'Real-time Inventory', description: 'Barcode-based inventory that updates with every transaction. Auto-reorder triggers, variance alerts, and cycle counting keep stock accurate.', icon: 'package' },
      { title: 'Lightning POS', description: 'Fast, reliable POS with barcode scanning, mixed payments, and offline mode. Process 3x more transactions per hour during rush.', icon: 'monitor' },
      { title: 'Customer CRM', description: 'Purchase history, loyalty programs, and customer segmentation. Run targeted promotions that actually bring people back.', icon: 'heart' },
      { title: 'Multi-Store Command', description: 'One dashboard for all stores. Real-time sales, inventory, and staff performance. Inter-store transfers with approval workflows.', icon: 'building' },
    ],

    workflow: [
      { step: '01', title: 'Scan & Sell', description: 'Barcode scan at POS. Inventory and customer profile updated instantly.' },
      { step: '02', title: 'Auto-Replenish', description: 'Low stock triggers purchase order. Vendor delivers before shelf goes empty.' },
      { step: '03', title: 'Engage & Reward', description: 'Loyalty points earned. Personalized offers sent. Customer keeps coming back.' },
      { step: '04', title: 'Analyze & Grow', description: 'Dashboards reveal what sells, when, and to whom. Make data-driven decisions.' },
    ],

    roiMetrics: [
      { title: 'Sales Growth', description: 'Faster checkout and smart promotions drive average 28% sales growth.', metric: '28%' },
      { title: 'Stock Accuracy', description: 'Real-time tracking and automated counting maintain 99.8% accuracy.', metric: '99.8%' },
      { title: 'Checkout Speed', description: 'Barcode scanning and optimized POS process 3x more transactions per hour.', metric: '3x' },
      { title: 'Customer Retention', description: 'Loyalty programs and personalized engagement increase return visits by 45%.', metric: '45%' },
    ],

    keyFeatures: [
      'Lightning-fast POS with barcode scanning',
      'Real-time multi-store inventory with transfers',
      'Loyalty program and customer CRM',
      'Dynamic pricing and promotional campaigns',
      'E-commerce integration (Shopify, WooCommerce)',
      'Auto-reorder with vendor portal',
      'Business analytics and demand forecasting',
      'Offline mode for uninterrupted operations',
    ],

    caseStudies: [
      { company: 'Carrefour Pakistan', result: '3x more customers processed during Ramadan rush', metric: '3x' },
      { company: 'Imtiaz Super Market', result: 'Zero stockouts in 6 months with auto-reorder', metric: '0 stockouts' },
      { company: 'Chase Up', result: 'Repeat purchase rate jumped 40% with targeted loyalty program', metric: '40%' },
    ],

    faqs: [
      { question: 'Does MartFlow support barcode scanning?', answer: 'Yes. MartFlow works with all major barcode scanners — handheld, integrated, and mobile. The POS is optimized for high-speed barcode scanning during checkout.' },
      { question: 'Can I run promotions and discounts?', answer: 'Absolutely. Create percentage discounts, BOGO deals, bundle offers, and time-limited flash sales. Track ROI for every promotional campaign.' },
      { question: 'How does multi-store inventory work?', answer: 'All stores sync inventory in real-time. Transfer stock between locations, set per-store reorder points, and view consolidated stock levels from one dashboard.' },
      { question: 'Does it connect with e-commerce?', answer: 'Yes. MartFlow integrates with Shopify, WooCommerce, and custom e-commerce platforms for unified inventory, pricing, and order management across online and offline channels.' },
    ],
  },

  'property-management': {
    slug: 'property-management',
    name: 'Property Management',
    tagline: 'Properties Managed. Profits Maximized.',
    heroDescription: 'Property management is a complex balancing act of tenant satisfaction, rent collection, maintenance, and vacancy management. BuildFlow and TenantFlow are purpose-built to handle every aspect of property management — from digital lease signing to AI-powered pricing suggestions — ensuring your properties are occupied, maintained, and profitable.',
    icon: 'building',
    color: 'orange',
    colorHex: '#f97316',
    erpName: 'BuildFlow',
    erpSlug: 'buildflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Real Estate (PK)', value: '$30B+' },
      { label: 'Annual Growth', value: '11%' },
      { label: 'Rental Market', value: '$8B' },
      { label: 'Vacancy Rate', value: '12-18%' },
    ],

    challenges: [
      { title: 'Rent Collection Delays', description: 'Manual tracking and cash-based collection leads to late payments, disputes, and cash flow problems that affect property maintenance and ROI.', impact: '20% late payments' },
      { title: 'Vacancy Losses', description: 'No system to predict vacancies or market units proactively means weeks or months of lost rental income between tenants.', impact: '2-3 months vacancy' },
      { title: 'Maintenance Backlog', description: 'Tenant complaints disappear into WhatsApp groups. No tracking, no accountability, no SLA — just frustrated tenants who don\'t renew.', impact: 'Low renewal rate' },
      { title: 'Lease Management Chaos', description: 'Paper-based leases in filing cabinets. Missed renewals, forgotten escalations, and no visibility into lease terms across your portfolio.', impact: 'Revenue left on table' },
    ],

    solutions: [
      { title: 'Automated Billing', description: 'Rent auto-billed through payment gateways. Tenants pay online, receive digital receipts, and late fees are calculated automatically.', icon: 'credit-card' },
      { title: 'AI Vacancy Management', description: 'Predict upcoming vacancies 90 days in advance. Automated marketing triggers and optimal pricing suggestions minimize downtime.', icon: 'cpu' },
      { title: 'Ticket-Based Maintenance', description: 'Structured maintenance system with priority routing, SLA tracking, and photo documentation. Tenants submit requests through the portal.', icon: 'wrench' },
      { title: 'Digital Lease Hub', description: 'Create, sign, and manage leases digitally. Auto-renewal alerts, escalation calculations, and e-signature integration.', icon: 'file-text' },
    ],

    workflow: [
      { step: '01', title: 'List & Market', description: 'Vacant units auto-listed. AI suggests optimal pricing. Marketing reaches qualified tenants.' },
      { step: '02', title: 'Screen & Sign', description: 'Tenant background verification. Digital lease signed with e-signatures. Move-in scheduled.' },
      { step: '03', title: 'Bill & Maintain', description: 'Rent auto-billed. Maintenance tickets handled with SLA. Tenant satisfied.' },
      { step: '04', title: 'Renew & Retain', description: 'Renewal alerts 90 days early. Escalation auto-calculated. Tenant retained.' },
    ],

    roiMetrics: [
      { title: 'Collection Rate', description: 'Automated billing and digital payments push on-time collection to 97%.', metric: '97%' },
      { title: 'Vacancy Reduction', description: 'AI predictions and proactive marketing reduce vacancy periods by 35%.', metric: '35%' },
      { title: 'Maintenance Speed', description: 'SLA-tracked tickets resolve issues 60% faster than ad-hoc approaches.', metric: '60%' },
      { title: 'Lease Renewal', description: 'Proactive management and satisfied tenants increase renewal rates by 40%.', metric: '40%' },
    ],

    keyFeatures: [
      'Automated rent collection with payment gateways',
      'AI-powered vacancy prediction and pricing',
      'Digital lease management with e-signatures',
      'SLA-tracked maintenance ticket system',
      'Tenant self-service portal',
      'Multi-property portfolio management',
      'Contractor and vendor management',
      'Financial reporting and investor dashboards',
    ],

    caseStudies: [
      { company: 'Bahria Town', result: 'On-time rent collection improved from 80% to 97% across 5,000+ units', metric: '97%' },
      { company: 'Emaar Pakistan', result: 'Tenant inquiries resolved via self-service portal, reducing office visits by 80%', metric: '80%' },
      { company: 'Graana', result: 'Property listing-to-deal time cut by 50% with CRM automation', metric: '50%' },
    ],

    faqs: [
      { question: 'Does BuildFlow handle both residential and commercial?', answer: 'Yes. BuildFlow supports both residential and commercial property management with different lease structures, billing models, and maintenance workflows for each type.' },
      { question: 'How does the AI pricing work?', answer: 'The AI analyzes market rates, property features, historical data, and demand patterns to suggest optimal rental prices. You can accept, modify, or override suggestions.' },
      { question: 'Can tenants pay rent online?', answer: 'Yes. BuildFlow integrates with JazzCash, EasyPaisa, and bank transfers. Tenants pay through their portal and receive digital receipts instantly.' },
      { question: 'What about construction project tracking?', answer: 'BuildFlow includes construction project tracking with milestones, resource allocation, contractor management, and progress reporting for development projects.' },
    ],
  },

  'travel-tourism': {
    slug: 'travel-tourism',
    name: 'Travel & Tourism',
    tagline: 'Sacred Journeys. Seamless Operations.',
    heroDescription: 'Managing Hajj and Umrah operations is one of the most complex logistics challenges in the travel industry. Coordinating flights, hotels, visas, transport, and religious site visits for hundreds of pilgrims simultaneously requires precision and reliability. TravelFlow was built specifically for this — ensuring every pilgrim\'s journey is flawless.',
    icon: 'plane',
    color: 'cyan',
    colorHex: '#06b6d4',
    erpName: 'TravelFlow',
    erpSlug: 'travelflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Hajj/Umrah Market', value: '$12B' },
      { label: 'Pakistani Pilgrims', value: '700K+/yr' },
      { label: 'Travel Agencies', value: '3,500+' },
      { label: 'Growth Rate', value: '8%/yr' },
    ],

    challenges: [
      { title: 'Booking Complexity', description: 'Assembling Hajj/Umrah packages from multiple vendors — flights, hotels, transport — is manually intensive and error-prone.', impact: 'Hours per booking' },
      { title: 'Visa Processing', description: 'Paper-based visa processing leads to missing documents, rejected applications, and stressed pilgrims who worry about their spiritual journey.', impact: '22% rejection rate' },
      { title: 'Group Coordination', description: 'Managing hundreds of pilgrims across flights, hotels, and transport in a foreign country requires military-grade coordination.', impact: 'Chaos during peak' },
      { title: 'Financial Confusion', description: 'Payments from multiple sources in multiple currencies with no centralized tracking makes financial management a nightmare.', impact: 'Unreconciled accounts' },
    ],

    solutions: [
      { title: 'Package Builder', description: 'Customize and assemble Hajj/Umrah packages from a pre-configured inventory of flights, hotels, and transport. Book in minutes, not hours.', icon: 'package' },
      { title: 'Digital Visa Processing', description: 'Document checklists auto-generated per pilgrim. Track visa status in real-time. Reduce rejection rate from 22% to under 5%.', icon: 'file-text' },
      { title: 'Group Command Center', description: 'Real-time dashboard showing location, status, and schedule of every pilgrim across all services. Group leaders get dedicated mobile tools.', icon: 'users' },
      { title: 'Unified Financials', description: 'Multi-currency accounting with payment tracking, vendor payments, and automated reconciliation. Know your numbers in real-time.', icon: 'landmark' },
    ],

    workflow: [
      { step: '01', title: 'Book Package', description: 'Select or customize Hajj/Umrah package. Assign pilgrim to group and itinerary.' },
      { step: '02', title: 'Process Visa', description: 'Document checklist auto-generated. Track visa status and submission in real-time.' },
      { step: '03', title: 'Travel & Serve', description: 'Flight, hotel, and transport all coordinated. Pilgrim receives real-time updates via app.' },
      { step: '04', title: 'Return & Follow-up', description: 'Feedback collected. Pilgrim profile maintained for future journey planning.' },
    ],

    roiMetrics: [
      { title: 'Booking Speed', description: 'Package builder reduces booking time from hours to minutes — 8x faster.', metric: '8x' },
      { title: 'Visa Success', description: 'Digital processing with document management pushes approval rates to 96%.', metric: '96%' },
      { title: 'Pilgrim Satisfaction', description: 'Seamless coordination earns consistently high satisfaction scores.', metric: '4.9/5' },
      { title: 'Group Capacity', description: 'Manage 500+ pilgrims with the ease that manual systems handle 50.', metric: '500+' },
    ],

    keyFeatures: [
      'Customizable Hajj/Umrah package builder',
      'Digital visa processing with Saudi e-Visa integration',
      'Group management for 500+ pilgrims',
      'Makkah & Madinah hotel allocation management',
      'Flight booking and seat allocation',
      'Ziyarat planning with guided tour logistics',
      'Ground transportation scheduling',
      'Multi-currency financial management',
    ],

    caseStudies: [
      { company: 'Al-Murtaza Tours', result: 'Hajj groups of 500+ pilgrims managed as smoothly as groups of 5', metric: '500+' },
      { company: 'Dawn Travels', result: 'Visa processing success rate improved from 78% to 96%', metric: '96%' },
      { company: 'Al-Rashid Travels', result: 'Umrah package sales grew 55% with automated itinerary management', metric: '55%' },
    ],

    faqs: [
      { question: 'Is TravelFlow only for Hajj & Umrah?', answer: 'TravelFlow is purpose-built for Hajj & Umrah operations but also supports general travel management. The core modules are optimized for pilgrimage logistics.' },
      { question: 'How does the visa integration work?', answer: 'TravelFlow integrates with Saudi e-Visa systems for automated application tracking. Document checklists are generated per pilgrim, and status updates are pushed in real-time.' },
      { question: 'Can pilgrims track their own journey?', answer: 'Yes. Pilgrims receive a mobile-friendly portal with their itinerary, real-time status updates, and important notifications throughout their journey.' },
      { question: 'What about group leader tools?', answer: 'Group leaders get a dedicated mobile dashboard showing the real-time location, status, and schedule of all pilgrims in their group, with emergency communication tools.' },
    ],
  },

  manufacturing: {
    slug: 'manufacturing',
    name: 'Manufacturing',
    tagline: 'From Raw Material to Market — Perfected',
    heroDescription: 'Manufacturing is the engine of economic growth, but running a factory efficiently requires balancing production schedules, quality standards, maintenance windows, and supply chain logistics. FactoryFlow brings precision to every aspect of manufacturing operations, turning your factory into a well-oiled machine that delivers quality products on time, every time.',
    icon: 'factory',
    color: 'lime',
    colorHex: '#84cc16',
    erpName: 'FactoryFlow',
    erpSlug: 'factoryflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'GDP Share (PK)', value: '12.5%' },
      { label: 'Growth Rate', value: '9%/yr' },
      { label: 'Factories', value: '50K+' },
      { label: 'Digital Adoption', value: '<15%' },
    ],

    challenges: [
      { title: 'Unplanned Downtime', description: 'Machine breakdowns halt production lines, miss delivery dates, and cost lakhs per hour. Without predictive maintenance, it\'s always a surprise.', impact: 'PKR 5L+/hr' },
      { title: 'Quality Failures', description: 'Defects detected after production lead to scrap, rework, and warranty claims. The cost of poor quality compounds through the supply chain.', impact: '3-5% rejection rate' },
      { title: 'Planning Complexity', description: 'Manual production planning can\'t handle the complexity of multi-product, multi-line schedules with varying BOMs and lead times.', impact: 'Capacity waste 20%+' },
      { title: 'Supply Chain Opacity', description: 'No visibility into incoming materials, supplier reliability, or delivery timelines. Procurement is reactive and costly.', impact: 'Frequent stockouts' },
    ],

    solutions: [
      { title: 'Predictive Maintenance', description: 'IoT sensor data and AI analytics predict failures before they happen. Schedule maintenance during planned downtime, not during production runs.', icon: 'cpu' },
      { title: 'Real-time Quality Control', description: 'Statistical Process Control monitors quality in real-time. Inspection workflows at every stage catch issues when they\'re cheap to fix.', icon: 'shield' },
      { title: 'MRP-Driven Planning', description: 'Material Requirements Planning with capacity optimization generates feasible production schedules that account for all constraints.', icon: 'calendar' },
      { title: 'Supply Chain Hub', description: 'Supplier portal with performance analytics, real-time shipment tracking, and automated procurement based on production needs.', icon: 'truck' },
    ],

    workflow: [
      { step: '01', title: 'Plan with MRP', description: 'Demand drives MRP. Production schedule and purchase orders auto-generated based on BOM and capacity.' },
      { step: '02', title: 'Source & Receive', description: 'POs sent to suppliers. Materials received and quality-inspected before release to production.' },
      { step: '03', title: 'Execute & Monitor', description: 'Real-time shop floor data capture. Quality SPC at every stage. Machine health monitored continuously.' },
      { step: '04', title: 'Ship & Improve', description: 'Finished goods inspected and shipped. OEE and quality analytics drive continuous improvement.' },
    ],

    roiMetrics: [
      { title: 'OEE Improvement', description: 'Optimized scheduling and reduced downtime boost Overall Equipment Effectiveness by 25%.', metric: '25%' },
      { title: 'Downtime Reduction', description: 'Predictive maintenance reduces unplanned downtime by 40%.', metric: '40%' },
      { title: 'Quality Rate', description: 'Real-time SPC and inspection workflows maintain 99.4% quality rates.', metric: '99.4%' },
      { title: 'Throughput Increase', description: 'Streamlined operations and capacity optimization increase production throughput by 35%.', metric: '35%' },
    ],

    keyFeatures: [
      'Full MRP with BOM management and capacity planning',
      'Statistical Process Control for quality management',
      'Predictive maintenance with IoT integration',
      'OEE dashboards with real-time shop floor data',
      'Supplier portal with performance analytics',
      'Shop floor data capture and monitoring',
      'Support for discrete, process, and mixed-mode manufacturing',
      'Engineering change management for BOM version control',
    ],

    caseStudies: [
      { company: 'Lucky Cement', result: 'OEE improved from 65% to 82% in 6 months', metric: '82%' },
      { company: 'Packages Ltd', result: 'Quality rate went from 95% to 99.4%', metric: '99.4%' },
      { company: 'Engro Corp', result: 'PKR 10M annually saved from avoided machine breakdowns', metric: 'PKR 10M' },
    ],

    faqs: [
      { question: 'What manufacturing types does FactoryFlow support?', answer: 'FactoryFlow supports discrete, process, and mixed-mode manufacturing. Whether you produce cement, electronics, food, or pharmaceuticals, the platform adapts to your manufacturing model.' },
      { question: 'How does predictive maintenance work?', answer: 'Our maintenance module analyzes machine runtime, historical failure data, and sensor inputs to predict when maintenance is needed — scheduling it during planned downtime before breakdowns occur.' },
      { question: 'Does it include BOM management?', answer: 'Yes. FactoryFlow includes comprehensive Bill of Materials management with version control, cost roll-up, engineering change management, and multi-level BOM support.' },
      { question: 'Can it integrate with our existing machines?', answer: 'Yes. FactoryFlow integrates with PLCs, SCADA systems, and IoT sensors for real-time machine monitoring and automated data collection from the shop floor.' },
    ],
  },

  'food-restaurant': {
    slug: 'food-restaurant',
    name: 'Food & Restaurant',
    tagline: 'Every Dish Perfect. Every Dollar Counted.',
    heroDescription: 'Restaurant management is a high-stakes balancing act of food quality, speed, cost control, and customer satisfaction. FoodFlow brings clarity to this complexity — from recipe costing that reveals your true margins to a POS fast enough for the dinner rush, every tool is designed for the unique demands of food service.',
    icon: 'utensils',
    color: 'rose',
    colorHex: '#f43f5e',
    erpName: 'FoodFlow',
    erpSlug: 'foodflow',
    erpStatus: 'active',

    marketStats: [
      { label: 'Food Service (PK)', value: '$18B' },
      { label: 'Annual Growth', value: '15%' },
      { label: 'Restaurants', value: '200K+' },
      { label: 'Food Cost Avg', value: '30-35%' },
    ],

    challenges: [
      { title: 'Food Cost Mystery', description: 'Most restaurateurs don\'t know the true cost of each dish. Ingredient price fluctuations and portion inconsistencies mean margins vary wildly — and usually in the wrong direction.', impact: '30-35% food cost' },
      { title: 'Order Errors', description: 'Handwritten tickets lead to wrong dishes, missed modifications, and angry customers. In fast-paced service, every error costs time and money.', impact: '5-8% error rate' },
      { title: 'Inventory Guesswork', description: 'Ordering ingredients based on gut feeling leads to waste from overstocking or stockouts that halt service during peak hours.', impact: '10% food waste' },
      { title: 'Multi-Branch Inconsistency', description: 'Each outlet runs differently — different recipes, different portions, different service. Inconsistent customer experience damages brand reputation.', impact: 'Brand inconsistency' },
    ],

    solutions: [
      { title: 'Recipe Costing Engine', description: 'Digital recipe cards with real-time ingredient pricing show exact dish margins. Know your profitability down to the gram.', icon: 'calculator' },
      { title: 'Digital Kitchen Display', description: 'Orders transmitted instantly from POS to kitchen display. No tickets to lose, no modifications to misread. Zero order errors.', icon: 'monitor' },
      { title: 'Auto-Depletion Inventory', description: 'Inventory auto-adjusts based on sales data. Real-time stock levels, wastage logging, and auto-reorder when supplies run low.', icon: 'package' },
      { title: 'Centralized Operations', description: 'Menu, recipes, and pricing synced across all branches instantly. Consistent food, consistent service, consistent brand.', icon: 'building' },
    ],

    workflow: [
      { step: '01', title: 'Order (Any Channel)', description: 'Order taken at POS, tablet, or online. Sent instantly to kitchen display system.' },
      { step: '02', title: 'Prepare & Serve', description: 'Kitchen sees order on KDS. Prep time tracked. Server notified when ready to serve.' },
      { step: '03', title: 'Bill & Collect', description: 'Split bills, mixed payments, and digital receipts. Inventory auto-depleted.' },
      { step: '04', title: 'Analyze & Optimize', description: 'Daily P&L auto-calculated. Food cost analysis reveals margin killers and heroes.' },
    ],

    roiMetrics: [
      { title: 'Food Cost Savings', description: 'Recipe costing and waste tracking reduce food costs by 15%.', metric: '15%' },
      { title: 'Order Speed', description: 'Digital ordering and KDS speed up service by 50%.', metric: '50%' },
      { title: 'Table Turnover', description: 'Faster service means 25% more table turnover per service period.', metric: '25%' },
      { title: 'Customer Returns', description: 'Loyalty programs and consistent quality bring 60% of customers back.', metric: '60%' },
    ],

    keyFeatures: [
      'Recipe costing with real-time ingredient pricing',
      'Kitchen Display System integrated with POS',
      'Auto-depletion inventory based on sales',
      'Multi-branch management with menu sync',
      'Delivery management with driver tracking',
      'Customer loyalty and rewards program',
      'Daily P&L and food cost analysis',
      'Support for QSR, fine dining, and cloud kitchens',
    ],

    caseStudies: [
      { company: 'Kolachi Restaurant', result: 'PKR 200K monthly loss identified from just 3 dishes', metric: 'PKR 200K' },
      { company: 'Gourmet Bakers', result: '5 branches managed by one operations head', metric: '5' },
      { company: 'Arcadian Cafe', result: 'Zero wrong dishes in 3 months with KDS', metric: '0 errors' },
    ],

    faqs: [
      { question: 'Does FoodFlow work for quick-service restaurants?', answer: 'Yes. FoodFlow is designed for all restaurant types — QSR, fine dining, cafes, bakeries, and cloud kitchens. The POS and workflows adapt to your service style.' },
      { question: 'How does recipe costing work?', answer: 'Enter recipes with exact ingredient quantities. FoodFlow auto-calculates cost based on current ingredient prices and shows real-time dish margins. Alerts trigger when margins drop below threshold.' },
      { question: 'Can it handle delivery orders?', answer: 'Yes. FoodFlow includes delivery management with online ordering, driver tracking, delivery zones, and integration with food delivery platforms like Foodpanda and Cheetay.' },
      { question: 'What about multi-branch consistency?', answer: 'FoodFlow syncs menus, recipes, and pricing across all branches instantly. Centralized reporting shows performance by location, category, and item.' },
    ],
  },
}

/* ──────────────────────────────────────────────────────────
   Helper: Get industry detail data by slug
   ────────────────────────────────────────────────────────── */

export function getIndustryDetail(slug: string): IndustryDetailData | undefined {
  return INDUSTRY_DETAILS[slug]
}

/* ──────────────────────────────────────────────────────────
   Helper: Get all industry detail slugs
   ────────────────────────────────────────────────────────── */

export function getIndustryDetailSlugs(): string[] {
  return Object.keys(INDUSTRY_DETAILS)
}

/* ──────────────────────────────────────────────────────────
   Helper: Map ERP slug to industry slug
   ────────────────────────────────────────────────────────── */

export function erpSlugToIndustrySlug(erpSlug: string): string | undefined {
  const mapping: Record<string, string> = {
    apparelflow: 'apparel-textile',
    hotelflow: 'hospitality',
    eduflow: 'education',
    autoflow: 'automotive-workshop',
    pharmaflow: 'pharmaceutical',
    martflow: 'retail',
    buildflow: 'property-management',
    tenantflow: 'property-management',
    travelflow: 'travel-tourism',
    factoryflow: 'manufacturing',
    foodflow: 'food-restaurant',
  }
  return mapping[erpSlug]
}

/* ──────────────────────────────────────────────────────────
   Helper: Map industry slug to ERP slug
   ────────────────────────────────────────────────────────── */

export function industrySlugToErpSlug(industrySlug: string): string | undefined {
  const mapping: Record<string, string> = {
    'apparel-textile': 'apparelflow',
    'hospitality': 'hotelflow',
    'education': 'eduflow',
    'automotive-workshop': 'autoflow',
    'pharmaceutical': 'pharmaflow',
    'retail': 'martflow',
    'property-management': 'buildflow',
    'travel-tourism': 'travelflow',
    'manufacturing': 'factoryflow',
    'food-restaurant': 'foodflow',
  }
  return mapping[industrySlug]
}
