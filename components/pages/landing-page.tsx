'use client'

import { useNavigate } from '@/lib/use-navigate'
import { PageLayout } from '@/components/shared/page-layout'
import { useErpSystems, getErpIcon, getErpColor } from '@/lib/erp-data'
import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Globe, Shield, Layers, Code2, Monitor,
  Cpu, RefreshCw, Building2, Users,
  TrendingUp, Activity, Sparkles, Target, Rocket,
  BarChart3, Headphones, Lock, Smartphone, Check,
  Shirt, Hotel, GraduationCap, Pill, ShoppingCart,
  Factory, Truck, HardHat, HeartPulse, Palette,
  Wrench, Plane, UtensilsCrossed, TextCursorInput,
  Route as RouteIcon, Compass, Star, Clock, Database,
  ChevronLeft, ChevronRight, Play, Award, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InteractiveCard } from '@/components/shared/interactive-card'
import { useEffect, useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react'

/* ───────────────── Golden Gate Color Mapping ───────────────── */
const ggColorMap: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  cyan:   { bg: 'bg-[var(--gg-cyan)]/10',   text: 'text-[var(--gg-cyan)]',   border: 'border-[var(--gg-cyan)]/20',   accent: 'bg-[var(--gg-cyan)]' },
  amber:  { bg: 'bg-[var(--gg-amber)]/10',  text: 'text-[var(--gg-amber)]',  border: 'border-[var(--gg-amber)]/20',  accent: 'bg-[var(--gg-amber)]' },
  violet: { bg: 'bg-[var(--gg-violet)]/10', text: 'text-[var(--gg-violet)]', border: 'border-[var(--gg-violet)]/20', accent: 'bg-[var(--gg-violet)]' },
  emerald:{ bg: 'bg-[var(--gg-green)]/10',  text: 'text-[var(--gg-green)]',  border: 'border-[var(--gg-green)]/20',  accent: 'bg-[var(--gg-green)]' },
  green:  { bg: 'bg-[var(--gg-green)]/10',  text: 'text-[var(--gg-green)]',  border: 'border-[var(--gg-green)]/20',  accent: 'bg-[var(--gg-green)]' },
  orange: { bg: 'bg-[var(--gg-amber)]/10',  text: 'text-[var(--gg-amber)]',  border: 'border-[var(--gg-amber)]/20',  accent: 'bg-[var(--gg-amber)]' },
  teal:   { bg: 'bg-[var(--gg-teal)]/10',   text: 'text-[var(--gg-teal)]',   border: 'border-[var(--gg-teal)]/20',   accent: 'bg-[var(--gg-teal)]' },
  rose:   { bg: 'bg-[var(--gg-rose)]/10',   text: 'text-[var(--gg-rose)]',   border: 'border-[var(--gg-rose)]/20',   accent: 'bg-[var(--gg-rose)]' },
  blue:   { bg: 'bg-[var(--gg-teal)]/10',   text: 'text-[var(--gg-teal)]',   border: 'border-[var(--gg-teal)]/20',   accent: 'bg-[var(--gg-teal)]' },
  pink:   { bg: 'bg-[var(--gg-rose)]/10',   text: 'text-[var(--gg-rose)]',   border: 'border-[var(--gg-rose)]/20',   accent: 'bg-[var(--gg-rose)]' },
}

function getGgColor(colorName: string) {
  return ggColorMap[colorName] || ggColorMap['teal']
}

/* ───────────────── Industry Data for Showcase ───────────────── */
const industryShowcase = [
  {
    name: 'Apparel & Textile', icon: Shirt, erp: 'ApparelFlow', color: 'cyan',
    desc: 'Track production orders, manage cutting/fabric inventory, and automate costing — from grey fabric to finished garment.',
    highlights: ['Production Orders', 'Fabric Inventory', 'Costing Engine', 'Shipment Tracking'],
    modules: [
      { name: 'Production Planning', desc: 'Cutting/stitching WIP tracking' },
      { name: 'Fabric Store', desc: 'Grey & finished fabric inventory' },
      { name: 'Costing Engine', desc: 'CM, fabric, trim costing' },
      { name: 'Shipment Tracker', desc: 'PO to delivery real-time' },
      { name: 'Payroll & HR', desc: 'Piece-rate & salary management' },
      { name: 'Quality Control', desc: 'Inspection at every stage' },
      { name: 'Buyer Portal', desc: 'Order status & approvals' },
      { name: 'Compliance', desc: 'BSCI, WRAP audit readiness' },
    ],
    workflow: ['Requisition → Cutting → Stitching → Washing → Packing → Shipment'],
  },
  {
    name: 'Hospitality', icon: Hotel, erp: 'HotelFlow', color: 'amber',
    desc: 'Front desk, housekeeping, F&B, and banquet management in one system. Built for hotels, guesthouses, and resorts.',
    highlights: ['Front Desk', 'Housekeeping', 'F&B Management', 'Revenue Analytics'],
    modules: [
      { name: 'Front Desk', desc: 'Check-in/out & room management' },
      { name: 'Housekeeping', desc: 'Room status & task scheduling' },
      { name: 'F&B POS', desc: 'Restaurant & room service billing' },
      { name: 'Banquet Mgmt', desc: 'Event booking & setup tracking' },
      { name: 'Revenue Mgmt', desc: 'Dynamic pricing & occupancy' },
      { name: 'Guest CRM', desc: 'Loyalty & preference tracking' },
      { name: 'Channel Mgr', desc: 'OTA sync & rate parity' },
      { name: 'Night Audit', desc: 'Auto daily closing & reports' },
    ],
    workflow: ['Reservation → Check-in → Service → Billing → Check-out → Feedback'],
  },
  {
    name: 'Education', icon: GraduationCap, erp: 'EduFlow', color: 'violet',
    desc: 'Student enrollment, fee collection, attendance, grading, and parent communication — all automated.',
    highlights: ['Enrollment', 'Fee Collection', 'Attendance', 'Grading System'],
    modules: [
      { name: 'Admissions', desc: 'Online forms & merit lists' },
      { name: 'Fee Mgmt', desc: 'Collection, scholarships & defaulters' },
      { name: 'Attendance', desc: 'Biometric & SMS alerts' },
      { name: 'Exams & Results', desc: 'GPA, transcripts & report cards' },
      { name: 'Timetable', desc: 'Auto scheduling & conflicts' },
      { name: 'LMS', desc: 'Assignments & online classes' },
      { name: 'Parent Portal', desc: 'Real-time student progress' },
      { name: 'HR & Payroll', desc: 'Staff management & salaries' },
    ],
    workflow: ['Admission → Enrollment → Attendance → Exams → Results → Certificate'],
  },
  {
    name: 'Pharmaceutical', icon: Pill, erp: 'PharmaFlow', color: 'emerald',
    desc: 'Batch tracking, expiry management, DRAP compliance, and distribution — built for Pakistan\'s pharma industry.',
    highlights: ['Batch Tracking', 'Expiry Alerts', 'DRAP Compliance', 'Distribution'],
    modules: [
      { name: 'Batch Tracking', desc: 'Lot-wise traceability end-to-end' },
      { name: 'Expiry Mgmt', desc: 'FEFO & auto expiry alerts' },
      { name: 'DRAP Compliance', desc: 'Regulatory docs & audit trails' },
      { name: 'Distribution', desc: 'Salesman routes & orders' },
      { name: 'QC Lab', desc: 'Stability & release testing' },
      { name: 'Production', desc: 'Formulation & BMR tracking' },
      { name: 'Purchase & Stores', desc: 'RM/PM inventory management' },
      { name: 'Financials', desc: 'GL, AP/AR & cost centers' },
    ],
    workflow: ['Procurement → Production → QC → Batch Release → Distribution → Returns'],
  },
  {
    name: 'Retail & POS', icon: ShoppingCart, erp: 'MartFlow', color: 'orange',
    desc: 'Multi-store POS, inventory sync, customer loyalty, and supplier management — from checkout to warehouse.',
    highlights: ['Multi-Store POS', 'Inventory Sync', 'Customer Loyalty', 'Supplier Portal'],
    modules: [
      { name: 'POS Terminal', desc: 'Fast checkout & barcode support' },
      { name: 'Inventory Sync', desc: 'Real-time multi-store stock' },
      { name: 'Loyalty Program', desc: 'Points, tiers & promotions' },
      { name: 'Supplier Portal', desc: 'Purchase orders & GRN' },
      { name: 'E-Commerce', desc: 'Online store integration' },
      { name: 'CRM', desc: 'Customer profiles & analytics' },
      { name: 'Promotions', desc: 'Discounts, bundles & coupons' },
      { name: 'Analytics', desc: 'Sales, margins & dashboards' },
    ],
    workflow: ['Purchase → Stock → POS Sale → Loyalty Points → Reorder → Analytics'],
  },
  {
    name: 'Construction', icon: HardHat, erp: 'BuildFlow', color: 'teal',
    desc: 'Project costing, contractor management, material procurement, and progress tracking for real estate developers.',
    highlights: ['Project Costing', 'Contractor Mgmt', 'Material Procurement', 'Progress Tracking'],
    modules: [
      { name: 'Project Costing', desc: 'BOQ & budget vs actual' },
      { name: 'Contractor Mgmt', desc: 'RA bills & retention tracking' },
      { name: 'Procurement', desc: 'Material requisition & PO' },
      { name: 'Site Progress', desc: 'Milestone & photo tracking' },
      { name: 'Cash Flow', desc: 'Payment schedules & forecasts' },
      { name: 'Inventory', desc: 'Site & central store control' },
      { name: 'HR & Equipment', desc: 'Labor & machinery allocation' },
      { name: 'Client Portal', desc: 'Booking & payment status' },
    ],
    workflow: ['Planning → Tender → Procurement → Construction → Inspection → Handover'],
  },
  {
    name: 'Manufacturing', icon: Factory, erp: 'FactoryFlow', color: 'orange',
    desc: 'BOM management, production scheduling, quality control, and work order tracking for factories of all sizes.',
    highlights: ['BOM Management', 'Production Scheduling', 'Quality Control', 'Work Orders'],
    modules: [
      { name: 'BOM & Recipes', desc: 'Multi-level bill of materials' },
      { name: 'Production Scheduling', desc: 'Machine & labor planning' },
      { name: 'Quality Control', desc: 'Incoming, in-process & final QC' },
      { name: 'Work Orders', desc: 'Job cards & operation tracking' },
      { name: 'Warehouse', desc: 'RM, WIP & FG management' },
      { name: 'Maintenance', desc: 'Preventive & breakdown logs' },
      { name: 'Costing', desc: 'Job costing & variance analysis' },
      { name: 'Procurement', desc: 'MRP & auto purchase suggestions' },
    ],
    workflow: ['Order → BOM → Scheduling → Production → QC → Delivery'],
  },
  {
    name: 'Food & Restaurant', icon: UtensilsCrossed, erp: 'FoodFlow', color: 'rose',
    desc: 'Recipe costing, kitchen orders, multi-branch management, and delivery integration for restaurants and chains.',
    highlights: ['Recipe Costing', 'Kitchen Display', 'Branch Sync', 'Delivery Hub'],
    modules: [
      { name: 'Recipe Costing', desc: 'Dish-wise cost & margin calc' },
      { name: 'Kitchen Display', desc: 'Order queue & prep timing' },
      { name: 'Branch Sync', desc: 'Multi-location inventory & menu' },
      { name: 'Delivery Hub', desc: 'Foodpanda, Uber Eats integration' },
      { name: 'POS', desc: 'Dine-in, takeaway & drive-thru' },
      { name: 'Purchasing', desc: 'Supplier orders & GRN tracking' },
      { name: 'Wastage Mgmt', desc: 'Spoilage tracking & reduction' },
      { name: 'Analytics', desc: 'Per-dish profitability reports' },
    ],
    workflow: ['Order → Kitchen → Prepare → Serve/Deliver → Bill → Analytics'],
  },
  {
    name: 'Healthcare', icon: HeartPulse, erp: 'HealthFlow', color: 'emerald',
    desc: 'Patient records, appointment scheduling, lab management, and billing — designed for clinics and hospitals.',
    highlights: ['Patient Records', 'Appointments', 'Lab Management', 'Billing'],
    modules: [
      { name: 'Patient EMR', desc: 'Digital medical records' },
      { name: 'Appointments', desc: 'Online booking & queue mgmt' },
      { name: 'Lab & Imaging', desc: 'Test orders & result tracking' },
      { name: 'Pharmacy', desc: 'Prescription & dispensing' },
      { name: 'Billing & Insurance', desc: 'Claims & co-pay processing' },
      { name: 'IPD Management', desc: 'Bed allocation & discharge' },
      { name: 'Doctor Portal', desc: 'Schedule & patient history' },
      { name: 'Inventory', desc: 'Medical supplies & equipment' },
    ],
    workflow: ['Registration → Consultation → Lab/Pharmacy → Billing → Follow-up'],
  },
  {
    name: 'Creative & Design', icon: Palette, erp: 'CreativeFlow', color: 'violet',
    desc: 'Project timelines, client billing, asset management, and collaboration tools for agencies and studios.',
    highlights: ['Project Timelines', 'Client Billing', 'Asset Management', 'Collaboration'],
    modules: [
      { name: 'Project Mgmt', desc: 'Kanban, Gantt & milestones' },
      { name: 'Time Tracking', desc: 'Billable hours & timesheets' },
      { name: 'Client Billing', desc: 'Retainers, milestones & invoicing' },
      { name: 'Asset Library', desc: 'Brand assets & file storage' },
      { name: 'Approvals', desc: 'Client review & feedback loop' },
      { name: 'Resource Planning', desc: 'Team capacity & allocation' },
      { name: 'CRM', desc: 'Leads, pipeline & client history' },
      { name: 'Reporting', desc: 'Profitability per project/client' },
    ],
    workflow: ['Brief → Design → Review → Approval → Delivery → Invoice'],
  },
  {
    name: 'Logistics', icon: Truck, erp: 'LogisticFlow', color: 'teal',
    desc: 'Shipment tracking, fleet management, route optimization, and warehouse operations in one platform.',
    highlights: ['Shipment Tracking', 'Fleet Management', 'Route Optimization', 'Warehouse Ops'],
    modules: [
      { name: 'Shipment Tracker', desc: 'Real-time consignment tracking' },
      { name: 'Fleet Mgmt', desc: 'Vehicle docs & mileage logs' },
      { name: 'Route Optimizer', desc: 'AI-powered delivery routes' },
      { name: 'Warehouse', desc: 'Inbound, outbound & putaway' },
      { name: 'COD Reconciliation', desc: 'Collection & deposit tracking' },
      { name: 'Client Portal', desc: 'Booking & tracking self-service' },
      { name: 'Vendor Mgmt', desc: '3PL & rider onboarding' },
      { name: 'Finance', desc: 'Revenue, costs & profitability' },
    ],
    workflow: ['Booking → Pickup → Transit → Hub → Last-Mile → POD'],
  },
  {
    name: 'Consumer Electronics', icon: Zap, erp: 'ElectroFlow', color: 'emerald',
    desc: 'Serial tracking, warranty management, installment plans, and service/repair workflows for electronics retailers.',
    highlights: ['Serial Tracking', 'Warranty Mgmt', 'Installment Plans', 'Service & Repair'],
    modules: [
      { name: 'Serial Tracking', desc: 'IMEI/serial from PO to sale' },
      { name: 'Warranty Mgr', desc: 'Claim processing & vendor RMA' },
      { name: 'Installments', desc: 'EMI plans & recovery tracking' },
      { name: 'Service Center', desc: 'Repair jobs & technician mgmt' },
      { name: 'Multi-Store POS', desc: 'Retail & wholesale billing' },
      { name: 'Purchase Mgmt', desc: 'Vendor orders & price lists' },
      { name: 'Customer CRM', desc: 'Purchase history & promotions' },
      { name: 'Stock Transfer', desc: 'Inter-branch inventory moves' },
    ],
    workflow: ['Purchase → Serial Register → Sale → Warranty → Service → Return'],
  },
  {
    name: 'Fleet & Transport', icon: Compass, erp: 'FleetFlow', color: 'cyan',
    desc: 'Vehicle tracking, fuel management, driver assignments, trip planning, and maintenance scheduling.',
    highlights: ['Vehicle Tracking', 'Fuel Management', 'Driver Assignment', 'Maintenance'],
    modules: [
      { name: 'GPS Tracking', desc: 'Live vehicle location & geofence' },
      { name: 'Fuel Mgmt', desc: 'Fill logs & consumption alerts' },
      { name: 'Driver Mgmt', desc: 'License, trips & performance' },
      { name: 'Maintenance', desc: 'Service schedules & expense logs' },
      { name: 'Trip Planner', desc: 'Route & stop management' },
      { name: 'Dispatch', desc: 'Job assignment & tracking' },
      { name: 'Compliance', desc: 'Vehicle fitness & insurance' },
      { name: 'Reporting', desc: 'Cost per km & utilization' },
    ],
    workflow: ['Assign Driver → Plan Route → Dispatch → Track → Fuel Log → Maintenance'],
  },
  {
    name: 'Travel & Tourism', icon: Plane, erp: 'TravelFlow', color: 'rose',
    desc: 'Hajj & Umrah packages, visa processing, itinerary management, and group booking automation.',
    highlights: ['Package Builder', 'Visa Processing', 'Itinerary Mgmt', 'Group Bookings'],
    modules: [
      { name: 'Package Builder', desc: 'Hajj, Umrah & tour packages' },
      { name: 'Visa Processing', desc: 'Document tracking & submission' },
      { name: 'Itinerary Mgr', desc: 'Day-wise travel planning' },
      { name: 'Group Bookings', desc: 'Batch reservations & payments' },
      { name: 'Hotel & Transport', desc: 'Vendor booking integration' },
      { name: 'CRM', desc: 'Customer profiles & follow-ups' },
      { name: 'Accounts', desc: 'Receivables, payables & margins' },
      { name: 'Agent Portal', desc: 'Sub-agent booking & commissions' },
    ],
    workflow: ['Inquiry → Package → Visa → Booking → Itinerary → Travel → Feedback'],
  },
  {
    name: 'Property Management', icon: Building2, erp: 'TenantFlow', color: 'teal',
    desc: 'Rent collection, lease management, maintenance requests, and tenant communication for property managers.',
    highlights: ['Rent Collection', 'Lease Management', 'Maintenance Requests', 'Tenant Portal'],
    modules: [
      { name: 'Rent Collection', desc: 'Auto invoices & payment tracking' },
      { name: 'Lease Mgmt', desc: 'Agreements, renewals & expiry' },
      { name: 'Maintenance', desc: 'Request tickets & vendor dispatch' },
      { name: 'Tenant Portal', desc: 'Online payments & requests' },
      { name: 'Vacancy Mgmt', desc: 'Listing & lead tracking' },
      { name: 'Utility Billing', desc: 'Electricity, gas & water split' },
      { name: 'Financials', desc: 'P&L per property & portfolio' },
      { name: 'Inspections', desc: 'Move-in/out condition reports' },
    ],
    workflow: ['Listing → Inquiry → Lease → Move-in → Rent → Maintenance → Renewal'],
  },
  {
    name: 'Distribution', icon: RouteIcon, erp: 'DistriFlow', color: 'amber',
    desc: 'Wholesale ordering, delivery routing, credit management, and multi-warehouse inventory for distributors.',
    highlights: ['Wholesale Orders', 'Delivery Routing', 'Credit Management', 'Multi-Warehouse'],
    modules: [
      { name: 'Order Mgmt', desc: 'Salesman & counter sales' },
      { name: 'Delivery Routing', desc: 'Optimized route planning' },
      { name: 'Credit Control', desc: 'Limits, aging & collections' },
      { name: 'Multi-Warehouse', desc: 'Stock across locations' },
      { name: 'Pricing Engine', desc: 'Customer & zone-wise pricing' },
      { name: 'Purchase & GRN', desc: 'Vendor orders & receiving' },
      { name: 'Sales Analytics', desc: 'Territory & brand performance' },
      { name: 'Financials', desc: 'GL, banking & reconciliation' },
    ],
    workflow: ['Order → Allocate → Pick → Route → Deliver → Invoice → Payment'],
  },
  {
    name: 'Textile', icon: TextCursorInput, erp: 'TextileFlow', color: 'rose',
    desc: 'Weaving, dyeing, and yarn tracking with production planning and quality inspection workflows.',
    highlights: ['Yarn Tracking', 'Weaving Plans', 'Dyeing Process', 'Quality Inspection'],
    modules: [
      { name: 'Yarn Store', desc: 'Lot tracking & consumption' },
      { name: 'Weaving Planner', desc: 'Loom allocation & production' },
      { name: 'Dyeing Process', desc: 'Recipe & shade management' },
      { name: 'Quality Inspection', desc: '4-point & shade checking' },
      { name: 'Finishing', desc: 'Process routing & tracking' },
      { name: 'Costing', desc: 'Per-yard cost analysis' },
      { name: 'Dispatch', desc: 'Packing & shipment management' },
      { name: 'Compliance', desc: 'Oeko-Tex & GOTS readiness' },
    ],
    workflow: ['Yarn → Warping → Weaving → Dyeing → Finishing → QC → Dispatch'],
  },
  {
    name: 'Automotive', icon: Wrench, erp: 'AutoFlow', color: 'cyan',
    desc: 'Workshop management, parts inventory, service history, and customer CRM for auto service centers.',
    highlights: ['Workshop Mgmt', 'Parts Inventory', 'Service History', 'Customer CRM'],
    modules: [
      { name: 'Job Cards', desc: 'Service booking & bay allocation' },
      { name: 'Parts Counter', desc: 'OEM & aftermarket inventory' },
      { name: 'Service History', desc: 'Vehicle maintenance timeline' },
      { name: 'Customer CRM', desc: 'Service reminders & follow-ups' },
      { name: 'Estimates', desc: 'Quotation & approval workflow' },
      { name: 'Invoicing', desc: 'Labor & parts billing' },
      { name: 'Procurement', desc: 'Vendor orders & stock alerts' },
      { name: 'Reporting', desc: 'Revenue, productivity & CSAT' },
    ],
    workflow: ['Booking → Diagnosis → Parts → Repair → QC → Delivery → Follow-up'],
  },
]

/* ───────────────── Featured ERPs for Deep-Dive Section ───────────────── */
const featuredErps = [
  {
    name: 'ApparelFlow',
    industry: 'Apparel & Textile',
    icon: Shirt,
    color: 'cyan',
    tagline: 'From Fabric to Fashion — One System',
    details: 'ApparelFlow handles the entire garment lifecycle: fabric requisition, cutting plans, stitching WIP, washing, packing, and shipment. Track every order from PO to delivery with real-time production dashboards. Built for Pakistan\'s largest export industry.',
    modules: [
      { name: 'Production Planning', desc: 'Cutting/stitching WIP tracking' },
      { name: 'Fabric Store', desc: 'Grey & finished fabric inventory' },
      { name: 'Costing Engine', desc: 'CM, fabric, trim costing' },
      { name: 'Shipment Tracker', desc: 'PO to delivery real-time' },
      { name: 'Payroll & HR', desc: 'Piece-rate & salary management' },
      { name: 'Quality Control', desc: 'Inspection at every stage' },
      { name: 'Buyer Portal', desc: 'Order status & approvals' },
      { name: 'Compliance', desc: 'BSCI, WRAP audit readiness' },
    ],
    metrics: [
      { label: 'Production Orders', value: '40% faster processing' },
      { label: 'Fabric Waste', value: '15% reduction' },
      { label: 'Shipment Accuracy', value: '99.2% on-time' },
    ],
  },
  {
    name: 'HotelFlow',
    industry: 'Hospitality',
    icon: Hotel,
    color: 'amber',
    tagline: 'Every Guest. Every Stay. Perfect.',
    details: 'HotelFlow unifies front desk operations, housekeeping scheduling, F&B management, banquet bookings, and guest CRM into one seamless platform. From check-in to checkout, every touchpoint is managed — with real-time room availability and revenue analytics.',
    modules: [
      { name: 'Front Desk', desc: 'Check-in/out & room management' },
      { name: 'Housekeeping', desc: 'Room status & task scheduling' },
      { name: 'F&B POS', desc: 'Restaurant & room service billing' },
      { name: 'Banquet Mgmt', desc: 'Event booking & setup tracking' },
      { name: 'Revenue Mgmt', desc: 'Dynamic pricing & occupancy' },
      { name: 'Guest CRM', desc: 'Loyalty & preference tracking' },
      { name: 'Channel Mgr', desc: 'OTA sync & rate parity' },
      { name: 'Night Audit', desc: 'Auto daily closing & reports' },
    ],
    metrics: [
      { label: 'Check-in Time', value: '60% faster' },
      { label: 'Occupancy Rate', value: '+12% improvement' },
      { label: 'Guest Satisfaction', value: '4.8/5 average' },
    ],
  },
  {
    name: 'ElectroFlow',
    industry: 'Consumer Electronics',
    icon: Zap,
    color: 'emerald',
    tagline: 'Serial to Sale — Tracked End-to-End',
    details: 'ElectroFlow manages the complete electronics retail chain: serial-number tracking, warranty registration, installment plan management, supplier purchases, and service/repair workflows. Every unit is tracked from warehouse to customer to after-sales support.',
    modules: [
      { name: 'Serial Tracking', desc: 'IMEI/serial from PO to sale' },
      { name: 'Warranty Mgr', desc: 'Claim processing & vendor RMA' },
      { name: 'Installments', desc: 'EMI plans & recovery tracking' },
      { name: 'Service Center', desc: 'Repair jobs & technician mgmt' },
      { name: 'Multi-Store POS', desc: 'Retail & wholesale billing' },
      { name: 'Purchase Mgmt', desc: 'Vendor orders & price lists' },
      { name: 'Customer CRM', desc: 'Purchase history & promotions' },
      { name: 'Stock Transfer', desc: 'Inter-branch inventory moves' },
    ],
    metrics: [
      { label: 'Serial Tracking', value: '100% accuracy' },
      { label: 'Installment Recovery', value: '92% on-time' },
      { label: 'Service Turnaround', value: '35% faster' },
    ],
  },
  {
    name: 'FoodFlow',
    industry: 'Food & Restaurant',
    icon: UtensilsCrossed,
    color: 'rose',
    tagline: 'Kitchen to Customer — Without the Chaos',
    details: 'FoodFlow replaces the chaos of running restaurants with structured operations: recipe-based costing, kitchen display systems, multi-branch inventory sync, delivery partner integration, and real-time profitability tracking per dish, per branch, per day.',
    modules: [
      { name: 'Recipe Costing', desc: 'Dish-wise cost & margin calc' },
      { name: 'Kitchen Display', desc: 'Order queue & prep timing' },
      { name: 'Branch Sync', desc: 'Multi-location inventory & menu' },
      { name: 'Delivery Hub', desc: 'Foodpanda, Uber Eats integration' },
      { name: 'POS', desc: 'Dine-in, takeaway & drive-thru' },
      { name: 'Purchasing', desc: 'Supplier orders & GRN tracking' },
      { name: 'Wastage Mgmt', desc: 'Spoilage tracking & reduction' },
      { name: 'Analytics', desc: 'Per-dish profitability reports' },
    ],
    metrics: [
      { label: 'Food Cost', value: '18% reduction' },
      { label: 'Order Accuracy', value: '98.5% correct' },
      { label: 'Branch Expansion', value: '3x faster setup' },
    ],
  },
]

/* ───────────────── Pipeline Stages Data ───────────────── */
const howItWorks = [
  {
    step: '01',
    title: 'Pick Your Industry',
    desc: 'Choose from 21 purpose-built ERP systems — each designed for a specific industry with the workflows, terminology, and reports you already know.',
    icon: <Target className="w-5 h-5" />,
  },
  {
    step: '02',
    title: 'Select Your Plan',
    desc: 'Starter for lean teams, Professional for growing businesses, Business for established operations, Enterprise for unlimited scale. Transparent pricing, no surprises.',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    step: '03',
    title: 'Secure Checkout',
    desc: 'Bank-grade encryption via Stripe. Pay with any major debit or credit card. Your license and invoice arrive instantly by email.',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    step: '04',
    title: 'Go Live in 24 Hours',
    desc: 'Your ERP is provisioned within a day. Onboarding materials, video tutorials, and dedicated support get your team productive immediately.',
    icon: <Rocket className="w-5 h-5" />,
  },
]

/* ═══════════════════════════════════════════════════════ */
/*  Animated Counter                                         */
/* ═══════════════════════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 1200
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const val = Math.round(eased * target * 10) / 10
      setDisplay(val)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [target])

  return <span>{display}{suffix}</span>
}

/* ───────────────── Spring transition presets ───────────────── */
const springSmooth = { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
const springSnappy = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }

/* ═══════════════════════════════════════════════════════════════
   Featured ERP Showcase — Cinematic Immersive Layout
   - Horizontal tab bar with animated indicator
   - Large hero-style content card with staggered animations
   - Metrics with animated counters
   - Module badges with staggered entrance
   - Completely different visual from Industry Showcase carousel
   ═══════════════════════════════════════════════════════════════ */

// Map color names to CSS var references
const colorVarMap: Record<string, string> = {
  cyan: 'var(--gg-cyan)',
  amber: 'var(--gg-amber)',
  violet: 'var(--gg-violet)',
  emerald: 'var(--gg-green)',
  green: 'var(--gg-green)',
  orange: 'var(--gg-amber)',
  teal: 'var(--gg-teal)',
  rose: 'var(--gg-rose)',
  blue: 'var(--gg-teal)',
  pink: 'var(--gg-rose)',
}

function FeaturedErpShowcase() {
  const { navigate } = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const current = featuredErps[activeIdx]
  const CurrentIcon = current.icon
  const currentColorVar = colorVarMap[current.color] || 'var(--gg-teal)'

  // Update tab indicator position
  useLayoutEffect(() => {
    const activeTab = tabRefs.current[activeIdx]
    if (activeTab && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = activeTab.getBoundingClientRect()
      setTabIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeIdx])

  return (
    <section className="py-20 sm:py-28 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="gg-pill inline-flex items-center gap-2 bg-[var(--gg-amber)]/10 border border-[var(--gg-amber)]/20 px-4 py-1.5 mb-5">
            <Star className="w-3.5 h-3.5 text-[var(--gg-amber)]" />
            <span className="text-xs text-[var(--gg-amber)] font-medium tracking-wide">Featured Platforms</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground">
            Built for <span className="text-gradient-golden">Your Industry</span>, Not Everyone Else&apos;s
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Explore four of our industry-specific platforms — each one engineered from the ground up for the sector it serves.
          </p>
        </motion.div>

        {/* ─── Tab Bar ─── */}
        <div ref={containerRef} className="relative mb-6 sm:mb-8">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto hide-scrollbar pb-1 justify-center">
            {featuredErps.map((erp, i) => {
              const Icon = erp.icon
              const isActive = i === activeIdx
              const itemColorVar = colorVarMap[erp.color] || 'var(--gg-teal)'
              return (
                <button
                  key={erp.name}
                  ref={(el) => { tabRefs.current[i] = el }}
                  onClick={() => setActiveIdx(i)}
                  className={`relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon
                    className="w-4.5 h-4.5 transition-colors duration-300"
                    style={{ color: isActive ? itemColorVar : undefined }}
                  />
                  <span>{erp.name}</span>
                </button>
              )
            })}
          </div>
          {/* Animated indicator line */}
          <motion.div
            className="absolute bottom-0 h-[3px] rounded-full"
            style={{ backgroundColor: currentColorVar }}
            animate={{ left: tabIndicator.left, width: tabIndicator.width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* ─── Content Card ─── */}
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-700"
              style={{
                background: `
                  radial-gradient(ellipse at 10% 20%, color-mix(in srgb, ${currentColorVar} 6%, transparent) 0%, transparent 50%),
                  radial-gradient(ellipse at 90% 80%, color-mix(in srgb, var(--gg-amber) 3%, transparent) 0%, transparent 50%)
                `,
              }}
            />
            {/* Top gradient accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${currentColorVar}, transparent)`,
              }}
            />

            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* ─── Left Column: Main Content ─── */}
                <div className="lg:col-span-7">
                  {/* Icon + Title */}
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)` }}
                    >
                      <CurrentIcon
                        className="w-8 h-8 sm:w-10 sm:h-10"
                        style={{ color: currentColorVar }}
                      />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="text-2xl sm:text-3xl font-bold text-foreground"
                      >
                        {current.name}
                      </motion.h3>
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-sm font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${currentColorVar}, color-mix(in srgb, ${currentColorVar} 70%, var(--gg-amber)))`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {current.industry}
                      </motion.span>
                    </div>
                  </div>

                  {/* Tagline */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="text-xl sm:text-2xl font-bold text-foreground mb-4"
                  >
                    &ldquo;{current.tagline}&rdquo;
                  </motion.p>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base"
                  >
                    {current.details}
                  </motion.p>

                  {/* Module badges */}
                  {current.modules && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      className="mb-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] uppercase tracking-wider text-foreground/50 font-semibold">Modules</div>
                        <div
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)`,
                            color: currentColorVar,
                          }}
                        >
                          {current.modules.length} included
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {current.modules.map((mod, mi) => {
                          const modName = typeof mod === 'string' ? mod : mod.name
                          const modDesc = typeof mod === 'string' ? '' : mod.desc
                          return (
                            <motion.div
                              key={modName}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.4 + mi * 0.05 }}
                              className="rounded-xl p-3 border bg-background/30 hover:bg-background/70 transition-all duration-200 cursor-default group relative overflow-hidden"
                              style={{
                                borderColor: `color-mix(in srgb, ${currentColorVar} 15%, transparent)`,
                              }}
                            >
                              {/* Module number badge */}
                              <span
                                className="absolute top-1 right-1.5 text-[9px] font-bold opacity-20"
                                style={{ color: currentColorVar }}
                              >
                                {String(mi + 1).padStart(2, '0')}
                              </span>
                              <div className="flex items-start gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)` }}
                                >
                                  <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: currentColorVar }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-foreground leading-tight">{modName}</div>
                                  {modDesc && (
                                    <div className="text-[10px] text-foreground/60 leading-snug mt-0.5 line-clamp-2">{modDesc}</div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <Button
                      className="btn-glow bg-[var(--gg-vermillion)] text-white font-semibold rounded-xl px-6 h-11 transition-all duration-200 group hover:bg-[var(--gg-vermillion-light)]"
                      onClick={() => navigate('erp-detail', current.name.toLowerCase())}
                    >
                      Explore {current.name}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[var(--gg-vermillion)]/30 text-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/5 rounded-xl px-6 h-11"
                      onClick={() => navigate('pricing')}
                    >
                      View Pricing
                    </Button>
                  </motion.div>
                </div>

                {/* ─── Right Column: Metrics + Visual ─── */}
                <div className="lg:col-span-5">
                  {/* Metrics Cards */}
                  <div className="space-y-3 mb-6">
                    {current.metrics.map((metric, mi) => (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + mi * 0.1 }}
                        className="relative rounded-xl p-4 border border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden group"
                      >
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                          style={{ backgroundColor: currentColorVar }}
                        />
                        <div className="flex items-center justify-between pl-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-0.5">{metric.label}</div>
                            <div
                              className="text-lg sm:text-xl font-bold"
                              style={{
                                background: `linear-gradient(135deg, ${currentColorVar}, var(--gg-amber))`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                              }}
                            >
                              {metric.value}
                            </div>
                          </div>
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                            style={{ backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)` }}
                          >
                            <TrendingUp className="w-5 h-5" style={{ color: currentColorVar }} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Stats Footer */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { icon: <Clock className="w-4 h-4" />, label: 'Go Live', value: '24h' },
                      { icon: <Shield className="w-4 h-4" />, label: 'Uptime', value: '99.9%' },
                      { icon: <Headphones className="w-4 h-4" />, label: 'Support', value: '24/7' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex justify-center mb-1.5 text-muted-foreground">{stat.icon}</div>
                        <div className="text-sm font-bold text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Industry Showcase — Interactive Animated Section
   - Mobile: Full-screen spotlight with auto-rotating industries,
     typewriter text animation, and swipe/tap navigation
   - Desktop: Split layout with spotlight + thumbnail grid
   ═══════════════════════════════════════════════════════════════ */
const AUTO_PLAY_INTERVAL = 4000

function IndustryShowcaseSection() {
  const { navigate } = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  const current = industryShowcase[activeIndex]
  const CurrentIcon = current.icon

  // Auto-play timer
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setDirection(1)
        setActiveIndex((prev) => (prev + 1) % industryShowcase.length)
      }, AUTO_PLAY_INTERVAL)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlaying])

  const goTo = useCallback((index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 8s of inactivity
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000)
    return () => clearTimeout(timeout)
  }, [activeIndex])

  const goNext = useCallback(() => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % industryShowcase.length)
    setIsAutoPlaying(false)
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000)
    return () => clearTimeout(timeout)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + industryShowcase.length) % industryShowcase.length)
    setIsAutoPlaying(false)
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000)
    return () => clearTimeout(timeout)
  }, [])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  // Animation variants for the spotlight content
  const contentVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
    }),
  }

  const currentColorVar = colorVarMap[current.color] || 'var(--gg-teal)'

  return (
    <section className="py-20 sm:py-28 bg-secondary/30 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="gg-pill inline-flex items-center gap-2 bg-[var(--gg-vermillion)]/10 border border-[var(--gg-vermillion)]/15 px-4 py-1.5 mb-5">
            <div className="w-2 h-2 rounded-full bg-[var(--gg-vermillion)] animate-pulse" />
            <span className="text-xs text-[var(--gg-vermillion)] font-medium tracking-wide">21 Industries Served</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground">
            An ERP for <span className="text-gradient-primary">Every Industry</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            Each platform is purpose-built — not adapted — for its industry. The terminology, workflows, and KPIs are yours from day one.
          </p>
        </motion.div>

        {/* ═══════ Main Showcase Area ═══════ */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* ─── Spotlight (left / main on mobile) ─── */}
          <div className="flex-1 min-w-0 flex">
            <div
              className="relative gg-glass rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[400px] sm:min-h-[500px]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none transition-colors duration-700"
                style={{
                  background: `radial-gradient(ellipse at 30% 20%, color-mix(in srgb, ${currentColorVar} 8%, transparent) 0%, transparent 60%)`,
                }}
              />

              {/* Top accent bar */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-b-full opacity-50 transition-colors duration-700"
                style={{ backgroundColor: currentColorVar }}
              />

              <div className="relative p-6 sm:p-8 lg:p-10 flex-1 flex flex-col overflow-hidden">
                {/* Prev / Next arrows */}
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200 z-10"
                  aria-label="Previous industry"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200 z-10"
                  aria-label="Next industry"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Animated content */}
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex-1 flex flex-col overflow-y-auto custom-scrollbar min-h-0 pr-1"
                >
                  {/* Icon + Industry Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)` }}
                    >
                      <CurrentIcon
                        className="w-6 h-6 sm:w-7 sm:h-7"
                        style={{ color: currentColorVar }}
                      />
                    </motion.div>
                    <div className="min-w-0">
                      <motion.h3
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="text-lg sm:text-xl font-bold text-foreground truncate"
                      >
                        {current.name}
                      </motion.h3>
                      <motion.span
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-xs sm:text-sm font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${currentColorVar}, color-mix(in srgb, ${currentColorVar} 70%, var(--gg-amber)))`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {current.erp}
                      </motion.span>
                    </div>
                  </div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="text-sm text-muted-foreground leading-relaxed mb-4"
                  >
                    {current.desc}
                  </motion.p>

                  {/* Key Highlights — interactive pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex flex-wrap gap-1.5 mb-4"
                  >
                    {current.highlights.map((h, hi) => (
                      <motion.span
                        key={h}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.35 + hi * 0.06 }}
                        className="gg-pill text-[11px] font-medium px-2.5 py-1 border cursor-default"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${currentColorVar} 8%, transparent)`,
                          color: currentColorVar,
                          borderColor: `color-mix(in srgb, ${currentColorVar} 18%, transparent)`,
                        }}
                      >
                        {h}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* Modules Grid — detailed features */}
                  {current.modules && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      className="mb-4"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-foreground/50 font-semibold">Modules</div>
                        <div
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)`,
                            color: currentColorVar,
                          }}
                        >
                          {current.modules.length} included
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                        {current.modules.map((mod, mi) => (
                          <motion.div
                            key={mod.name}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: 0.38 + mi * 0.04 }}
                            className="group relative rounded-lg p-2.5 border bg-background/30 hover:bg-background/60 transition-all duration-200 cursor-default"
                            style={{
                              borderColor: `color-mix(in srgb, ${currentColorVar} 15%, transparent)`,
                            }}
                          >
                            <div className="flex items-start gap-1.5">
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                                style={{ backgroundColor: `color-mix(in srgb, ${currentColorVar} 10%, transparent)` }}
                              >
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: currentColorVar }} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-semibold text-foreground leading-tight">
                                  {mod.name}
                                </div>
                                <div className="text-[10px] text-foreground/60 leading-snug line-clamp-2">
                                  {mod.desc}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Workflow — animated pipeline */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                    className="mb-auto"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-foreground/50 font-semibold mb-2">Workflow</div>
                    <div className="flex flex-wrap items-center gap-1">
                      {current.workflow[0].split(' → ').map((step, si, arr) => (
                        <motion.span
                          key={step}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.5 + si * 0.05 }}
                          className="inline-flex items-center gap-1"
                        >
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${currentColorVar} ${si === 0 ? '12%' : '5%'}, transparent)`,
                              color: si === 0 ? currentColorVar : 'var(--muted-foreground)',
                            }}
                          >
                            {step}
                          </span>
                          {si < arr.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-foreground/25 shrink-0" />
                          )}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Bottom bar: CTA + Navigation dots — stays fixed at bottom */}
                <div className="shrink-0 mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      className="btn-glow bg-[var(--gg-vermillion)] text-white font-semibold rounded-xl px-5 h-9 text-sm transition-all duration-200 group hover:bg-[var(--gg-vermillion-light)]"
                      onClick={() => navigate('erp-detail', current.erp.toLowerCase())}
                    >
                      Explore {current.erp}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {industryShowcase.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i)}
                          className="relative h-2 rounded-full transition-all duration-300"
                          style={{
                            width: i === activeIndex ? '20px' : '7px',
                            backgroundColor: i === activeIndex ? currentColorVar : 'color-mix(in srgb, var(--foreground) 15%, transparent)',
                          }}
                          aria-label={`Go to ${industryShowcase[i].name}`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground font-mono tabular-nums">
                        {String(activeIndex + 1).padStart(2, '0')}/{String(industryShowcase.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Thumbnail grid (desktop only) ─── */}
          <div className="hidden lg:flex w-[340px] shrink-0">
            <div className="grid grid-cols-2 gap-2.5 flex-1 content-start overflow-y-auto custom-scrollbar pr-1">
              {industryShowcase.map((industry, i) => {
                const Icon = industry.icon
                const itemColorVar = colorVarMap[industry.color] || 'var(--gg-teal)'
                const isActive = i === activeIndex
                return (
                  <motion.button
                    key={industry.name}
                    onClick={() => goTo(i)}
                    className={`relative text-left rounded-xl p-3 transition-all duration-300 border ${
                      isActive
                        ? 'bg-card border-[var(--gg-vermillion)]/20 shadow-md'
                        : 'bg-card/50 border-border/40 hover:bg-card hover:border-border/60'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <div
                        className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full"
                        style={{ backgroundColor: itemColorVar }}
                      />
                    )}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                        style={{ backgroundColor: `color-mix(in srgb, ${itemColorVar} ${isActive ? '15%' : '8%'}, transparent)` }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: isActive ? itemColorVar : 'var(--muted-foreground)' }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {industry.name}
                        </div>
                        <div
                          className="text-[10px] font-medium truncate"
                          style={{ color: isActive ? itemColorVar : 'var(--muted-foreground)' }}
                        >
                          {industry.erp}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <div className="mt-8 sm:mt-10 text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-[var(--gg-vermillion)]/30 text-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/5 rounded-xl px-8 h-12 transition-all duration-200 group"
            onClick={() => navigate('products')}
          >
            View All 21 Products
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════ */
export function LandingPage() {
  const { navigate } = useNavigate()
  const { activeErps, industryVerticals, loading: erpsLoading } = useErpSystems('active')

  const heroStats = useMemo(() => [
    { icon: <Layers className="w-5 h-5 text-[var(--gg-vermillion)]" />, value: activeErps.length, suffix: '', label: 'Industry ERPs' },
    { icon: <Globe className="w-5 h-5 text-[var(--gg-teal)]" />, value: industryVerticals, suffix: '', label: 'Industry Verticals' },
    { icon: <Shield className="w-5 h-5 text-[var(--gg-amber)]" />, value: 99.9, suffix: '%', label: 'Uptime SLA' },
  ], [activeErps.length, industryVerticals])

  return (
    <PageLayout>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        {/* Warm ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-[var(--gg-vermillion)]/[0.03] to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--gg-vermillion)]/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--gg-amber)]/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--gg-teal)]/[0.02] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Bento Grid Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
            {/* LEFT COLUMN — Main headline + subtitle (spans 7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springSmooth}
              className="lg:col-span-7 gg-glass rounded-2xl p-8 sm:p-10 lg:p-12 flex flex-col justify-between"
            >
              <div>
                {/* Status pill */}
                <div className="gg-pill inline-flex items-center gap-2 bg-[var(--gg-green)]/10 border border-[var(--gg-green)]/20 px-4 py-1.5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[var(--gg-green)] animate-pulse" />
                  <span className="text-xs text-[var(--gg-green)] font-medium tracking-wide">
                    Now serving {erpsLoading ? 'multiple' : activeErps.length} industries across Pakistan
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-black leading-[1.08] tracking-tight text-foreground">
                  Software That Speaks{' '}
                  <span className="text-gradient-golden">
                    Your Industry&apos;s
                  </span>
                  <br />
                  Language.
                </h1>

                {/* Subtitle */}
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  <span className="text-gradient-primary font-semibold">21 purpose-built ERPs</span>{' '}
                  — each designed from the ground up for a specific industry.{' '}
                  <span className="text-foreground font-semibold">No customization needed. No workarounds. No compromises.</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <Button
                  size="lg"
                  className="btn-glow bg-[var(--gg-vermillion)] text-white font-semibold rounded-xl px-8 h-12 transition-all duration-200 group hover:bg-[var(--gg-vermillion-light)]"
                  onClick={() => navigate('pricing')}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[var(--gg-vermillion)]/30 text-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/5 rounded-xl px-8 h-12 transition-all duration-200"
                  onClick={() => navigate('products')}
                >
                  Explore Products
                </Button>
              </div>
            </motion.div>

            {/* RIGHT COLUMN — Stacked stat cards (spans 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-5">
              {heroStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.12, ...springSmooth }}
                  className="flex-1"
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-amber)">
                    <div className="gg-glass rounded-2xl p-6 sm:p-7 h-full flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-[var(--gg-vermillion)]/10 flex items-center justify-center shrink-0">
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-bold text-gradient-golden">
                          <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}

              {/* Small accent card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="gg-glass rounded-2xl p-5 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 8%, var(--card)), color-mix(in srgb, var(--gg-amber) 4%, var(--card)))' }}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--gg-vermillion)]/15 flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-[var(--gg-vermillion)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Go Live in 24 Hours</div>
                  <div className="text-xs text-muted-foreground">From purchase to production — same day</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ INDUSTRY SHOWCASE ═══════════════════════ */}
      <IndustryShowcaseSection />

      {/* ═══════════════════════ THE PROBLEM ═══════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <div className="gg-pill inline-flex items-center gap-2 bg-[var(--gg-rose)]/10 border border-[var(--gg-rose)]/20 px-4 py-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-[var(--gg-rose)]" />
                <span className="text-xs text-[var(--gg-rose)] font-medium tracking-wide">The Problem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                The Problem with <span className="text-gradient-warm">Generic ERP</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Most ERP implementations fail — not because of the technology, but because the technology was never built for your industry.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: 'You customize everything',
                  desc: 'Generic ERPs give you a blank canvas. You spend months — sometimes years — customizing fields, building workflows, and training teams on software that doesn\'t speak your language.',
                  icon: <Wrench className="w-6 h-6" />,
                  stat: '18+ months',
                  statLabel: 'avg. implementation',
                },
                {
                  title: 'You pay for what you don\'t need',
                  desc: 'Manufacturing modules in a hotel system. HR workflows meant for offices, not construction sites. You\'re subsidizing features your industry will never use.',
                  icon: <BarChart3 className="w-6 h-6" />,
                  stat: '40% wasted',
                  statLabel: 'on unused modules',
                },
                {
                  title: 'You maintain fragile integrations',
                  desc: 'When your ERP doesn\'t handle your industry natively, you bolt on third-party tools. Each integration is a failure point. Each update is a risk. Each workaround costs time and money.',
                  icon: <Code2 className="w-6 h-6" />,
                  stat: '5–12 tools',
                  statLabel: 'bolted on average',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <InteractiveCard variant="subtle" glowColor="var(--gg-rose)" className="h-full">
                    <div className="gg-card rounded-2xl p-6 h-full relative overflow-hidden"
                      style={{ borderTop: '3px solid var(--gg-rose)' }}
                    >
                      {/* Background watermark number */}
                      <span className="absolute top-2 right-3 text-7xl font-black text-[var(--gg-rose)]/[0.04] leading-none">{i + 1}</span>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[var(--gg-rose)]/10 flex items-center justify-center mb-5 text-[var(--gg-rose)]">
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{item.desc}</p>
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[var(--gg-rose)]">{item.stat}</span>
                            <span className="text-xs text-muted-foreground">{item.statLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-12 text-center"
            >
              <div className="gg-glass rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto"
                style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-amber) 6%, var(--card)), var(--card))' }}
              >
                <p className="text-lg sm:text-xl text-foreground leading-relaxed">
                  We asked a different question:{' '}
                  <span className="text-gradient-golden font-semibold">What if the software spoke your industry&apos;s language from day one?</span>
                </p>
              </div>
            </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURED ERP DEEP-DIVE ═══════════════════════ */}
      <FeaturedErpShowcase />

      {/* ═══════════════════════ OUR APPROACH ═══════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-0">
            {/* Vertical colored sidebar accent */}
            <div className="hidden lg:block w-1.5 rounded-full bg-gradient-to-b from-[var(--gg-vermillion)] via-[var(--gg-teal)] to-[var(--gg-amber)]/30 shrink-0" />
            <div className="lg:hidden h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--gg-vermillion)] via-[var(--gg-teal)] to-[var(--gg-amber)]/30 mb-8" />

            <div className="flex-1 lg:pl-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="gg-pill inline-flex items-center gap-2 bg-[var(--gg-teal)]/10 border border-[var(--gg-teal)]/20 px-4 py-1.5 mb-6">
                    <div className="w-2 h-2 rounded-full bg-[var(--gg-teal)]" />
                    <span className="text-xs text-[var(--gg-teal)] font-medium tracking-wide">Our Approach</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6">
                    Industry-Native. <span className="text-gradient-cool">Not Industry-Adapted.</span>
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      We don&apos;t take a generic platform and bolt on industry modules. We start with the industry itself — its workflows, its compliance requirements, its KPIs, its language.
                    </p>
                    <p>
                      Every ERP in our portfolio was built <span className="text-foreground font-semibold">by people who understand that industry</span>. ApparelFlow was built with garment manufacturers. HotelFlow was built with hotel operators. FoodFlow was built with restaurant owners.
                    </p>
                    <p>
                      The result? Software that feels like it was built <span className="text-foreground font-semibold">specifically for you</span> — because it was. You don&apos;t customize. You don&apos;t adapt. You just start using it.
                    </p>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  {[
                    { icon: <Target className="w-5 h-5 text-[var(--gg-vermillion)]" />, title: 'Born for Your Sector', desc: 'Each ERP starts from industry requirements — not a generic template. The terminology, workflows, and reports are yours from day one.' },
                    { icon: <RefreshCw className="w-5 h-5 text-[var(--gg-teal)]" />, title: 'Real-Time Cross-Module Sync', desc: 'A sale in MartFlow instantly updates inventory in FactoryFlow and logistics in LogisticFlow. Every system stays in sync automatically.' },
                    { icon: <Code2 className="w-5 h-5 text-[var(--gg-amber)]" />, title: 'API-First Architecture', desc: 'Every feature is an API endpoint. Integrate with anything, extend everything, and build custom workflows on top of a solid foundation.' },
                    { icon: <Shield className="w-5 h-5 text-[var(--gg-green)]" />, title: 'Enterprise-Grade Security', desc: 'AES-256 encryption, SOC 2 compliance, role-based access, and complete audit trails. Your data is always protected.' },
                    { icon: <Smartphone className="w-5 h-5 text-[var(--gg-violet)]" />, title: 'Mobile-First Design', desc: 'Native iOS and Android apps with offline sync. Your team manages operations from the warehouse floor, the hotel lobby, or the factory.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, ...springSnappy }}
                    >
                      <InteractiveCard variant="subtle" glowColor="var(--gg-teal)" className="h-full">
                        <div className="gg-card rounded-xl p-4 flex items-start gap-4 group">
                          <div className="w-10 h-10 rounded-lg bg-[var(--gg-vermillion)]/8 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </InteractiveCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-secondary/30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              From Selection to <span className="text-gradient-primary">Production</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Four steps between you and an ERP that actually works for your industry.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-vermillion)" className="h-full">
                  <div className="gg-card rounded-2xl p-6 h-full relative overflow-hidden">
                    {/* Step number watermark */}
                    <span className="absolute top-3 right-4 text-6xl font-black text-[var(--gg-vermillion)]/[0.05] leading-none">{item.step}</span>
                    <div className="relative z-10">
                      {/* Vermillion accent circle */}
                      <div className="w-12 h-12 rounded-xl bg-[var(--gg-vermillion)]/10 flex items-center justify-center mb-4 text-[var(--gg-vermillion)]">
                        {item.icon}
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ WHAT SETS US APART ═══════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              What Sets Us <span className="text-gradient-primary">Apart</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Three principles that drive every decision we make — from architecture to pricing.
            </p>
          </motion.div>

          <div className="space-y-5">
            {[
              {
                icon: <Target className="w-7 h-7 text-[var(--gg-green)]" />,
                title: 'Industry-Native by Default',
                desc: 'We don\'t build generic software and hope it fits. Each of our 21 ERPs is born from deep domain expertise — speaking the language, following the workflows, and measuring the KPIs that matter to your sector. ApparelFlow talks about BOMs and cutting plans. HotelFlow talks about occupancy and RevPAR. FoodFlow talks about recipe costing and kitchen display.',
                highlight: 'Zero customization needed on day one',
                accentColor: 'var(--gg-green)',
                accentBg: 'bg-[var(--gg-green)]/[0.06]',
              },
              {
                icon: <Sparkles className="w-7 h-7 text-[var(--gg-amber)]" />,
                title: 'Intelligence, Not Just Data',
                desc: 'Our ERPs don\'t just collect data — they transform raw inputs into actionable intelligence. Anomaly detection flags suspicious inventory movements. Predictive analytics forecast demand before you ask. Automated workflows eliminate repetitive tasks so your team focuses on decisions, not data entry.',
                highlight: 'AI-powered insights from day one',
                accentColor: 'var(--gg-amber)',
                accentBg: 'bg-[var(--gg-amber)]/[0.06]',
              },
              {
                icon: <Rocket className="w-7 h-7 text-[var(--gg-rose)]" />,
                title: 'Scale Without Rebuilding',
                desc: 'Start with one ERP on the Starter plan. Expand to three ERPs across different business units. Upgrade tiers as you grow. The architecture scales horizontally and vertically without ever requiring a migration. Your data stays connected, your workflows stay intact, and your team stays productive.',
                highlight: 'From 5 users to unlimited — same platform',
                accentColor: 'var(--gg-rose)',
                accentBg: 'bg-[var(--gg-rose)]/[0.06]',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-vermillion)" className="h-full">
                  <div className={`gg-elevated rounded-2xl p-6 sm:p-8 h-full flex flex-col sm:flex-row items-start gap-6 ${item.accentBg}`}
                    style={{ borderLeft: `4px solid ${item.accentColor}` }}
                  >
                    <div className="w-16 h-16 rounded-xl bg-[var(--gg-vermillion)]/8 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                      <div className="gg-pill inline-flex items-center gap-1.5 bg-[var(--gg-vermillion)]/5 border border-[var(--gg-vermillion)]/10 px-3 py-1.5">
                        <Check className="w-3.5 h-3.5 text-[var(--gg-vermillion)]" />
                        <span className="text-xs font-medium text-[var(--gg-vermillion)]">{item.highlight}</span>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ENTERPRISE TRUST SIGNALS ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-secondary/30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Enterprise-Grade <span className="text-gradient-primary">Trust</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Security, reliability, and compliance built into every layer.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Lock className="w-6 h-6 text-[var(--gg-vermillion)]" />, title: 'Bank-Grade Encryption', desc: 'AES-256 encryption at rest and TLS 1.3 in transit. Your data is always protected.' },
              { icon: <Shield className="w-6 h-6 text-[var(--gg-teal)]" />, title: 'PCI DSS Compliant', desc: 'Payments processed through Stripe with full PCI compliance and 3D Secure authentication.' },
              { icon: <Headphones className="w-6 h-6 text-[var(--gg-amber)]" />, title: '24/7 Support', desc: 'Dedicated support teams with guaranteed response times. Business and Enterprise get account managers.' },
              { icon: <Smartphone className="w-6 h-6 text-[var(--gg-violet)]" />, title: 'Mobile-First', desc: 'Native apps for iOS and Android with offline sync. Manage your business from anywhere.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...springSnappy }}
              >
                <InteractiveCard variant="subtle" glowColor="var(--gg-teal)" className="h-full">
                  <div className="gg-card rounded-xl p-5 h-full group">
                    <div className="w-11 h-11 rounded-lg bg-[var(--gg-vermillion)]/8 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS BANNER ═══════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="gg-glass rounded-3xl p-8 sm:p-12"
              style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gg-vermillion) 6%, var(--card)), color-mix(in srgb, var(--gg-amber) 3%, var(--card)))' }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {[
                  { value: activeErps.length, suffix: '', label: 'Industry ERPs' },
                  { value: 99.9, suffix: '%', label: 'Uptime SLA' },
                  { value: 24, suffix: 'h', label: 'Provisioning Time' },
                  { value: 4, suffix: '+', label: 'Pricing Tiers' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-gradient-golden">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-secondary/30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="gg-pill inline-flex items-center gap-2 bg-[var(--gg-vermillion)]/10 border border-[var(--gg-vermillion)]/15 px-4 py-1.5 mb-6">
              <Rocket className="w-3.5 h-3.5 text-[var(--gg-vermillion)]" />
              <span className="text-xs text-[var(--gg-vermillion)] font-medium tracking-wide">Ready to Start?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Find the ERP That <span className="text-gradient-golden">Speaks Your Language</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              21 industries. 21 purpose-built platforms. Each one ready to run your business from day one. No customization. No workarounds. No compromises.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="btn-glow bg-[var(--gg-vermillion)] text-white font-semibold rounded-xl px-8 h-12 transition-all duration-200 group hover:bg-[var(--gg-vermillion-light)]"
                onClick={() => navigate('pricing')}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[var(--gg-vermillion)]/30 text-[var(--gg-vermillion)] hover:bg-[var(--gg-vermillion)]/5 rounded-xl px-8 h-12 transition-all duration-200"
                onClick={() => navigate('products')}
              >
                Browse All Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary rounded-xl px-8 h-12 transition-all duration-200"
                onClick={() => navigate('contact')}
              >
                Talk to Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  )
}
