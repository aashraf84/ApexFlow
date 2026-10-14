'use client'

import { useState, useEffect } from 'react'
import {
  Shirt, Hotel, GraduationCap, Building2, Plane,
  Pill, UtensilsCrossed, Palette, HeartPulse, ShoppingCart,
  Factory, Truck, TextCursorInput, Route, Leaf, Landmark,
  HardHat, Wheat, Wrench, Compass, Zap, BookOpen, Fuel, Scissors,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ────────────────────────────────────────────────────────── */
/*  Icon Map: DB icon string → Lucide React component        */
/* ────────────────────────────────────────────────────────── */

export const ERP_ICON_MAP: Record<string, LucideIcon> = {
  shirt: Shirt,
  hotel: Hotel,
  graduation: GraduationCap,
  hardhat: HardHat,
  plane: Plane,
  building: Building2,
  pill: Pill,
  utensils: UtensilsCrossed,
  palette: Palette,
  heart: HeartPulse,
  shopping: ShoppingCart,
  factory: Factory,
  truck: Truck,
  textcursor: TextCursorInput,
  route: Route,
  leaf: Leaf,
  landmark: Landmark,
  wheat: Wheat,
  wrench: Wrench,
  compass: Compass,
  zap: Zap,
  'book-open': BookOpen,
  fuel: Fuel,
  scissors: Scissors,
}

/* ────────────────────────────────────────────────────────── */
/*  Color Map: DB color string → hex + Tailwind classes      */
/* ────────────────────────────────────────────────────────── */

export const ERP_COLOR_MAP: Record<string, {
  hex: string
  text: string
  bg: string
  border: string
  gradient: string
  glow: string
  hoverBorder: string
}> = {
  teal:    { hex: '#14b8a6', text: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    gradient: 'from-teal-500/20 to-teal-500/5',    glow: 'rgba(20,184,166,0.15)',  hoverBorder: 'rgba(20,184,166,0.4)' },
  cyan:    { hex: '#06b6d4', text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    gradient: 'from-cyan-500/20 to-cyan-500/5',    glow: 'rgba(6,182,212,0.15)',   hoverBorder: 'rgba(6,182,212,0.4)' },
  amber:   { hex: '#f59e0b', text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   gradient: 'from-amber-500/20 to-amber-500/5',   glow: 'rgba(245,158,11,0.15)',  hoverBorder: 'rgba(245,158,11,0.4)' },
  emerald: { hex: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500/20 to-emerald-500/5', glow: 'rgba(16,185,129,0.15)', hoverBorder: 'rgba(16,185,129,0.4)' },
  orange:  { hex: '#f97316', text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  gradient: 'from-orange-500/20 to-orange-500/5',  glow: 'rgba(249,115,22,0.15)', hoverBorder: 'rgba(249,115,22,0.4)' },
  red:     { hex: '#ef4444', text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     gradient: 'from-red-500/20 to-red-500/5',        glow: 'rgba(239,68,68,0.15)',   hoverBorder: 'rgba(239,68,68,0.4)' },
  yellow:  { hex: '#eab308', text: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  gradient: 'from-yellow-500/20 to-yellow-500/5',  glow: 'rgba(234,179,8,0.15)',   hoverBorder: 'rgba(234,179,8,0.4)' },
  lime:    { hex: '#84cc16', text: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20',    gradient: 'from-lime-500/20 to-lime-500/5',      glow: 'rgba(132,204,22,0.15)',  hoverBorder: 'rgba(132,204,22,0.4)' },
  pink:    { hex: '#ec4899', text: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    gradient: 'from-pink-500/20 to-pink-500/5',      glow: 'rgba(236,72,153,0.15)',  hoverBorder: 'rgba(236,72,153,0.4)' },
  rose:    { hex: '#e11d48', text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    gradient: 'from-rose-500/20 to-rose-500/5',      glow: 'rgba(225,29,72,0.15)',   hoverBorder: 'rgba(225,29,72,0.4)' },
  fuchsia: { hex: '#d946ef', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', gradient: 'from-fuchsia-500/20 to-fuchsia-500/5', glow: 'rgba(217,70,239,0.15)', hoverBorder: 'rgba(217,70,239,0.4)' },
  sky:     { hex: '#0ea5e9', text: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     gradient: 'from-sky-500/20 to-sky-500/5',        glow: 'rgba(14,165,233,0.15)',  hoverBorder: 'rgba(14,165,233,0.4)' },
  violet:  { hex: '#8b5cf6', text: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  gradient: 'from-violet-500/20 to-violet-500/5',  glow: 'rgba(139,92,246,0.15)',  hoverBorder: 'rgba(139,92,246,0.4)' },
  green:   { hex: '#22c55e', text: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20',   gradient: 'from-green-500/20 to-green-500/5',    glow: 'rgba(34,197,94,0.15)',   hoverBorder: 'rgba(34,197,94,0.4)' },
}

/* ────────────────────────────────────────────────────────── */
/*  Website Map: ERP slug → external URL                     */
/* ────────────────────────────────────────────────────────── */

export const ERP_WEBSITE_MAP: Record<string, string> = {
  apparelflow: 'https://apparelflowerp.vercel.app/',
  hotelflow:   'https://hotelflowerp.vercel.app/',
  eduflow:     'https://eduflowerp.vercel.app/',
  martflow:    'https://martflowerp.vercel.app/',
  pharmaflow:  'https://pharmaflowerp.vercel.app/',
  buildflow:   'https://buildflowerp.vercel.app/',
  travelflow:  'https://travelflowerp.vercel.app/',
  tenantflow:  'https://tenantflowerp.vercel.app/',
  factoryflow: 'https://factoryflowerp.vercel.app/',
  foodflow:    'https://foodflowerp.vercel.app/',
  autoflow:    'https://autoflowerp.vercel.app/',
  healthflow:  'https://healthflowerp.vercel.app/',
  textileflow: 'https://textileflowerp.vercel.app/',
  creativeflow: 'https://creativeflowerp.vercel.app/',
  logisticflow: 'https://logisticflowerp.vercel.app/',
  distriflow:  'https://distriflowerp.vercel.app/',
  fleetflow:   'https://fleetflowerp.vercel.app/',
  electroflow: 'https://electroflowerp.vercel.app/',
  bookflow:    'https://bookflowerp.vercel.app/',
  fuelflow:    'https://fuelflowerp.vercel.app/',
  salonflow:   'https://salonflowerp.vercel.app/',
}

/* ────────────────────────────────────────────────────────── */
/*  Types                                                    */
/* ────────────────────────────────────────────────────────── */

export interface ErpSystemData {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  status: string
  version: string
  website: string | null
  industry: string
  features: string
  pricing: string | null
  sortOrder: number
  moduleCount: number
  modules: { id: string; name: string; slug: string; description: string; category: string | null; price: number; isActive: boolean }[]
}

/* ────────────────────────────────────────────────────────── */
/*  Hardcoded Fallback: 21 active ERPs (all integrated)             */
/* ────────────────────────────────────────────────────────── */

export const FALLBACK_ERP_DATA: ErpSystemData[] = [
  {
    id: 'fallback-apparelflow', name: 'ApparelFlow', slug: 'apparelflow', description: 'Complete ERP solution for the Apparel & Textile industry.', icon: 'shirt', color: 'teal', status: 'active', industry: 'Apparel & Textile', features: 'Production Planning,Inventory Management,Order Processing,Supply Chain Tracking,Quality Control,Financial Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 1, version: '1.0.0', website: 'https://apparelflowerp.vercel.app/', moduleCount: 8,
    modules: [
      { id: 'mod-apparelflow-production', name: 'Production Planning', slug: 'production-planning', description: 'Plan and schedule production runs, track BOM, and manage work orders.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-apparelflow-inventory', name: 'Inventory Management', slug: 'inventory-management', description: 'Track raw materials, WIP, and finished goods across warehouses.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-apparelflow-order', name: 'Order Processing', slug: 'order-processing', description: 'Manage sales orders from inquiry to shipment with full traceability.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-apparelflow-supplychain', name: 'Supply Chain Tracking', slug: 'supply-chain-tracking', description: 'End-to-end visibility from procurement to delivery.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-apparelflow-quality', name: 'Quality Control', slug: 'quality-control', description: 'Inspect, grade, and track quality at every production stage.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-apparelflow-finance', name: 'Financial Management', slug: 'financial-management', description: 'GL, AP/AR, costing, and financial reporting.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-apparelflow-costing', name: 'Costing & BOM', slug: 'costing-bom', description: 'Fabric costing, trim costing, and bill of materials management.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-apparelflow-merchandising', name: 'Merchandising', slug: 'merchandising', description: 'Manage styles, samples, and buyer communication.', category: 'Sales', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-hotelflow', name: 'HotelFlow', slug: 'hotelflow', description: 'Comprehensive hospitality management system.', icon: 'hotel', color: 'amber', status: 'active', industry: 'Hospitality', features: 'Reservation Management,Front Desk Operations,Housekeeping Management,F&B Control,Guest CRM', pricing: 'Starting from PKR 15,000/mo', sortOrder: 2, version: '1.0.0', website: 'https://hotelflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-hotelflow-reservation', name: 'Reservation System', slug: 'reservation-system', description: 'Online and walk-in booking management with channel integration.', category: 'Front Office', price: 0, isActive: true },
      { id: 'mod-hotelflow-frontdesk', name: 'Front Desk', slug: 'front-desk', description: 'Check-in/out, room assignment, and guest folio management.', category: 'Front Office', price: 0, isActive: true },
      { id: 'mod-hotelflow-housekeeping', name: 'Housekeeping', slug: 'housekeeping', description: 'Room status tracking, cleaning schedules, and staff assignment.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-hotelflow-fb', name: 'F&B Management', slug: 'fb-management', description: 'Restaurant POS, recipe costing, and banquet management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-hotelflow-revenue', name: 'Revenue Management', slug: 'revenue-management', description: 'Dynamic pricing, occupancy analytics, and yield optimization.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-hotelflow-guestcrm', name: 'Guest CRM', slug: 'guest-crm', description: 'Guest profiles, loyalty programs, and communication tracking.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-hotelflow-channel', name: 'Channel Manager', slug: 'channel-manager', description: 'Sync availability and rates across Booking.com, Expedia, and more.', category: 'Sales', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-eduflow', name: 'EduFlow', slug: 'eduflow', description: 'All-in-one education management platform.', icon: 'graduation', color: 'emerald', status: 'active', industry: 'Education', features: 'Student Management,Academic Planning,Fee Management,Examination System,Library Management,HR & Payroll', pricing: 'Starting from PKR 15,000/mo', sortOrder: 3, version: '1.0.0', website: 'https://eduflowerp.vercel.app/', moduleCount: 8,
    modules: [
      { id: 'mod-eduflow-student', name: 'Student Information', slug: 'student-information', description: 'Complete student profiles, enrollment, and academic history.', category: 'Academics', price: 0, isActive: true },
      { id: 'mod-eduflow-admissions', name: 'Admissions', slug: 'admissions', description: 'Online applications, merit lists, and enrollment workflows.', category: 'Academics', price: 0, isActive: true },
      { id: 'mod-eduflow-fee', name: 'Fee Management', slug: 'fee-management', description: 'Fee structure, invoicing, payment tracking, and scholarships.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-eduflow-attendance', name: 'Attendance', slug: 'attendance', description: 'Biometric and manual attendance with parent notifications.', category: 'Academics', price: 0, isActive: true },
      { id: 'mod-eduflow-examination', name: 'Examination', slug: 'examination', description: 'Exam scheduling, result compilation, and transcript generation.', category: 'Academics', price: 0, isActive: true },
      { id: 'mod-eduflow-timetable', name: 'Timetable', slug: 'timetable', description: 'Automated class and teacher scheduling with conflict resolution.', category: 'Academics', price: 0, isActive: true },
      { id: 'mod-eduflow-library', name: 'Library', slug: 'library', description: 'Cataloging, circulation, digital resources, and overdue tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-eduflow-hr', name: 'HR & Payroll', slug: 'hr-payroll', description: 'Staff management, salary processing, and leave tracking.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-buildflow', name: 'BuildFlow', slug: 'buildflow', description: 'AI-powered property management platform.', icon: 'hardhat', color: 'orange', status: 'active', industry: 'Property Management & Real Estate', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments,Maintenance Tickets', pricing: 'Starting from PKR 15,000/mo', sortOrder: 4, version: '1.0.0', website: 'https://buildflowerp.vercel.app/', moduleCount: 6,
    modules: [
      { id: 'mod-buildflow-property', name: 'Property Management', slug: 'property-management', description: 'Manage buildings, units, and property portfolios.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-buildflow-tenant', name: 'Tenant Management', slug: 'tenant-management', description: 'Tenant onboarding, verification, and communication.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-buildflow-lease', name: 'Lease Management', slug: 'lease-management', description: 'Digital lease creation, renewal, and termination workflows.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-buildflow-billing', name: 'Billing & Payments', slug: 'billing-payments', description: 'Automated rent invoicing, late fees, and payment collection.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-buildflow-maintenance', name: 'Maintenance Tickets', slug: 'maintenance-tickets', description: 'Submit, track, and resolve maintenance requests.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-buildflow-analytics', name: 'Analytics & Reports', slug: 'analytics-reports', description: 'Occupancy rates, revenue trends, and property insights.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-pharmaflow', name: 'PharmaFlow', slug: 'pharmaflow', description: 'Complete pharmaceutical management system.', icon: 'pill', color: 'red', status: 'active', industry: 'Pharmaceutical', features: 'Prescription Management,Inventory Control,Compliance & Regulatory,Multi-Branch,POS', pricing: 'Starting from PKR 15,000/mo', sortOrder: 5, version: '1.0.0', website: 'https://pharmaflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-pharmaflow-prescription', name: 'Prescription Management', slug: 'prescription-management', description: 'E-prescriptions, drug interactions, and dosage tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-pharmaflow-inventory', name: 'Inventory Control', slug: 'inventory-control', description: 'Batch tracking, expiry management, and stock alerts.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-pharmaflow-compliance', name: 'Compliance & Regulatory', slug: 'compliance-regulatory', description: 'DRAP compliance, audit trails, and controlled substance logs.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-pharmaflow-multibranch', name: 'Multi-Branch', slug: 'multi-branch', description: 'Centralized management of multiple pharmacy locations.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-pharmaflow-pos', name: 'POS System', slug: 'pos-system', description: 'Retail counter sales with insurance claim processing.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-pharmaflow-supplier', name: 'Supplier Management', slug: 'supplier-management', description: 'Purchase orders, vendor contracts, and delivery tracking.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-pharmaflow-reports', name: 'Analytics & Reports', slug: 'analytics-reports', description: 'Sales analytics, profit margins, and regulatory reports.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-travelflow', name: 'TravelFlow', slug: 'travelflow', description: 'Complete Hajj & Umrah travel management platform.', icon: 'plane', color: 'cyan', status: 'active', industry: 'Travel & Tourism', features: 'Booking Engine,Pilgrim Management,Flight Management,Hotel Allocation,Visa Processing', pricing: 'Starting from PKR 15,000/mo', sortOrder: 6, version: '1.0.0', website: 'https://travelflowerp.vercel.app/', moduleCount: 6,
    modules: [
      { id: 'mod-travelflow-booking', name: 'Booking Engine', slug: 'booking-engine', description: 'Manage Hajj, Umrah, and custom tour packages.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-travelflow-pilgrim', name: 'Pilgrim Management', slug: 'pilgrim-management', description: 'Track pilgrim profiles, groups, and special requirements.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-travelflow-flight', name: 'Flight Management', slug: 'flight-management', description: 'Flight booking, PNR tracking, and schedule changes.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-travelflow-hotel', name: 'Hotel Allocation', slug: 'hotel-allocation', description: 'Hotel bookings, room assignments, and partner hotel management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-travelflow-visa', name: 'Visa Processing', slug: 'visa-processing', description: 'Document collection, submission tracking, and status updates.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-travelflow-finance', name: 'Finance & Billing', slug: 'finance-billing', description: 'Installment plans, payment tracking, and invoicing.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-martflow', name: 'MartFlow', slug: 'martflow', description: 'Retail management system with POS and multi-store support.', icon: 'shopping', color: 'yellow', status: 'active', industry: 'Retail', features: 'POS,Inventory Management,Multi-store,CRM,Purchase Orders', pricing: 'Starting from PKR 15,000/mo', sortOrder: 7, version: '1.0.0', website: 'https://martflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-martflow-pos', name: 'POS System', slug: 'pos-system', description: 'Fast checkout, barcode scanning, and receipt printing.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-martflow-inventory', name: 'Inventory Management', slug: 'inventory-management', description: 'Stock levels, reorder points, and supplier management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-martflow-multistore', name: 'Multi-Store', slug: 'multi-store', description: 'Manage multiple retail locations from one dashboard.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-martflow-crm', name: 'Customer CRM', slug: 'customer-crm', description: 'Loyalty programs, purchase history, and targeted promotions.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-martflow-purchase', name: 'Purchase Orders', slug: 'purchase-orders', description: 'Create, approve, and track purchase orders to suppliers.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-martflow-promotions', name: 'Promotions & Discounts', slug: 'promotions-discounts', description: 'Schedule sales, bundle deals, and coupon management.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-martflow-analytics', name: 'Retail Analytics', slug: 'retail-analytics', description: 'Sales trends, margin analysis, and category performance.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-tenantflow', name: 'TenantFlow', slug: 'tenantflow', description: 'AI-powered property management platform.', icon: 'building', color: 'pink', status: 'active', industry: 'Property Management', features: 'Property Management,Tenant Management,Lease Management,Billing & Payments', pricing: 'Starting from PKR 15,000/mo', sortOrder: 8, version: '1.0.0', website: 'https://tenantflowerp.vercel.app/', moduleCount: 5,
    modules: [
      { id: 'mod-tenantflow-property', name: 'Property Management', slug: 'property-management', description: 'Manage units, buildings, and property portfolios.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-tenantflow-tenant', name: 'Tenant Management', slug: 'tenant-management', description: 'Tenant screening, onboarding, and communication portal.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-tenantflow-lease', name: 'Lease Management', slug: 'lease-management', description: 'Digital lease agreements, renewals, and e-signatures.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-tenantflow-billing', name: 'Billing & Payments', slug: 'billing-payments', description: 'Rent collection, utility billing, and payment reminders.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-tenantflow-maintenance', name: 'Maintenance & Requests', slug: 'maintenance-requests', description: 'Service request portal, vendor management, and tracking.', category: 'Operations', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-factoryflow', name: 'FactoryFlow', slug: 'factoryflow', description: 'Complete manufacturing execution and planning system.', icon: 'factory', color: 'lime', status: 'active', industry: 'Manufacturing', features: 'Production Planning,Quality Control,Maintenance Management,Supply Chain', pricing: 'Starting from PKR 15,000/mo', sortOrder: 9, version: '1.0.0', website: 'https://factoryflowerp.vercel.app/', moduleCount: 6,
    modules: [
      { id: 'mod-factoryflow-production', name: 'Production Planning', slug: 'production-planning', description: 'Work orders, production schedules, and capacity planning.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-factoryflow-quality', name: 'Quality Control', slug: 'quality-control', description: 'Inspection checklists, defect tracking, and compliance.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-factoryflow-maintenance', name: 'Maintenance Management', slug: 'maintenance-management', description: 'Preventive and corrective maintenance with asset tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-factoryflow-supplychain', name: 'Supply Chain', slug: 'supply-chain', description: 'Procurement, vendor management, and material planning.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-factoryflow-inventory', name: 'Warehouse & Inventory', slug: 'warehouse-inventory', description: 'Raw materials, WIP, and finished goods management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-factoryflow-finance', name: 'Cost Accounting', slug: 'cost-accounting', description: 'Job costing, overhead allocation, and profitability analysis.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-foodflow', name: 'FoodFlow', slug: 'foodflow', description: 'Complete restaurant and food service management platform.', icon: 'utensils', color: 'rose', status: 'active', industry: 'Food & Restaurant', features: 'POS System,Recipe Management,Inventory Control,Multi-Branch', pricing: 'Starting from PKR 15,000/mo', sortOrder: 10, version: '1.0.0', website: 'https://foodflowerp.vercel.app/', moduleCount: 6,
    modules: [
      { id: 'mod-foodflow-pos', name: 'POS System', slug: 'pos-system', description: 'Table management, order taking, and split billing.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-foodflow-recipe', name: 'Recipe Management', slug: 'recipe-management', description: 'Standardized recipes, costing, and portion control.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-foodflow-inventory', name: 'Inventory Control', slug: 'inventory-control', description: 'Ingredient tracking, wastage logs, and stock alerts.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-foodflow-multibranch', name: 'Multi-Branch', slug: 'multi-branch', description: 'Centralized menu, pricing, and reporting across locations.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-foodflow-delivery', name: 'Delivery Integration', slug: 'delivery-integration', description: 'Online ordering, delivery zones, and rider management.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-foodflow-analytics', name: 'Business Analytics', slug: 'business-analytics', description: 'Sales reports, food cost analysis, and peak hour insights.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-autoflow', name: 'AutoFlow', slug: 'autoflow', description: 'Complete automotive workshop and service management platform.', icon: 'wrench', color: 'sky', status: 'active', industry: 'Automotive & Workshop', features: 'Workshop Management,Inventory Control,Supplier Management,Purchase Orders', pricing: 'Starting from PKR 15,000/mo', sortOrder: 11, version: '1.0.0', website: 'https://autoflowerp.vercel.app/', moduleCount: 6,
    modules: [
      { id: 'mod-autoflow-workshop', name: 'Workshop Management', slug: 'workshop-management', description: 'Job cards, bay allocation, and technician scheduling.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-autoflow-inventory', name: 'Inventory Control', slug: 'inventory-control', description: 'Parts catalog, stock levels, and reorder management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-autoflow-supplier', name: 'Supplier Management', slug: 'supplier-management', description: 'Vendor profiles, pricing agreements, and order tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-autoflow-purchase', name: 'Purchase Orders', slug: 'purchase-orders', description: 'Create and approve purchase orders with budget controls.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-autoflow-service', name: 'Service History', slug: 'service-history', description: 'Vehicle service records, warranty tracking, and reminders.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-autoflow-billing', name: 'Billing & Invoicing', slug: 'billing-invoicing', description: 'Service invoices, labor charges, and parts billing.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-healthflow', name: 'HealthFlow', slug: 'healthflow', description: 'Complete healthcare and hospital management system.', icon: 'heart', color: 'fuchsia', status: 'active', industry: 'Healthcare', features: 'Patient Management,Appointment Scheduling,Electronic Health Records,Billing & Insurance,Pharmacy Integration,Lab Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 12, version: '1.0.0', website: 'https://healthflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-healthflow-patient', name: 'Patient Management', slug: 'patient-management', description: 'Patient registration, demographics, and medical history.', category: 'Clinical', price: 0, isActive: true },
      { id: 'mod-healthflow-appointment', name: 'Appointment Scheduling', slug: 'appointment-scheduling', description: 'Online booking, doctor calendars, and walk-in management.', category: 'Clinical', price: 0, isActive: true },
      { id: 'mod-healthflow-ehr', name: 'Electronic Health Records', slug: 'electronic-health-records', description: 'Digital charts, notes, and clinical documentation.', category: 'Clinical', price: 0, isActive: true },
      { id: 'mod-healthflow-billing', name: 'Billing & Insurance', slug: 'billing-insurance', description: 'Claim processing, co-pay tracking, and insurance verification.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-healthflow-pharmacy', name: 'Pharmacy Integration', slug: 'pharmacy-integration', description: 'E-prescriptions, dispensing, and drug inventory.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-healthflow-lab', name: 'Lab Management', slug: 'lab-management', description: 'Test ordering, result entry, and report generation.', category: 'Clinical', price: 0, isActive: true },
      { id: 'mod-healthflow-analytics', name: 'Hospital Analytics', slug: 'hospital-analytics', description: 'Bed occupancy, revenue cycle, and operational KPIs.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-textileflow', name: 'TextileFlow', slug: 'textileflow', description: 'End-to-end textile manufacturing and trading management system.', icon: 'textcursor', color: 'violet', status: 'active', industry: 'Textile', features: 'Yarn Management,Fabric Production,Dyeing & Finishing,Order Tracking,Quality Assurance,Export Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 13, version: '1.0.0', website: 'https://textileflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-textileflow-yarn', name: 'Yarn Management', slug: 'yarn-management', description: 'Track yarn procurement, consumption, and wastage.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-textileflow-fabric', name: 'Fabric Production', slug: 'fabric-production', description: 'Weaving, knitting schedules, and production tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-textileflow-dyeing', name: 'Dyeing & Finishing', slug: 'dyeing-finishing', description: 'Recipe management, batch tracking, and shade matching.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-textileflow-order', name: 'Order Tracking', slug: 'order-tracking', description: 'Sales orders, production linkage, and delivery schedules.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-textileflow-quality', name: 'Quality Assurance', slug: 'quality-assurance', description: 'Inspection at each stage with grading and reports.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-textileflow-export', name: 'Export Management', slug: 'export-management', description: 'Shipment docs, customs compliance, and letter of credit.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-textileflow-finance', name: 'Financial Management', slug: 'financial-management', description: 'Costing, invoicing, and multi-currency accounting.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-creativeflow', name: 'CreativeFlow', slug: 'creativeflow', description: 'Project management and operations platform for creative agencies.', icon: 'palette', color: 'pink', status: 'active', industry: 'Creative & Design', features: 'Project Management,Time Tracking,Client Portal,Invoicing,Resource Planning,Collaboration', pricing: 'Starting from PKR 15,000/mo', sortOrder: 14, version: '1.0.0', website: 'https://creativeflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-creativeflow-project', name: 'Project Management', slug: 'project-management', description: 'Kanban boards, milestones, and task assignments.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-creativeflow-timetracking', name: 'Time Tracking', slug: 'time-tracking', description: 'Billable hours, timesheets, and productivity insights.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-creativeflow-clientportal', name: 'Client Portal', slug: 'client-portal', description: 'Share deliverables, collect feedback, and approvals.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-creativeflow-invoicing', name: 'Invoicing', slug: 'invoicing', description: 'Create, send, and track invoices with payment reminders.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-creativeflow-resource', name: 'Resource Planning', slug: 'resource-planning', description: 'Team capacity, skill mapping, and workload balancing.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-creativeflow-collab', name: 'Collaboration', slug: 'collaboration', description: 'File sharing, comments, version control, and chat.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-creativeflow-analytics', name: 'Agency Analytics', slug: 'agency-analytics', description: 'Revenue per client, utilization rates, and profitability.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-logisticflow', name: 'LogisticFlow', slug: 'logisticflow', description: 'Complete logistics and supply chain management platform.', icon: 'truck', color: 'green', status: 'active', industry: 'Logistics & Supply Chain', features: 'Fleet Management,Route Optimization,Warehouse Management,Shipment Tracking,Order Fulfillment,Cross-Docking', pricing: 'Starting from PKR 15,000/mo', sortOrder: 15, version: '1.0.0', website: 'https://logisticflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-logisticflow-fleet', name: 'Fleet Management', slug: 'fleet-management', description: 'Vehicle tracking, dispatch, and driver assignment.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-logisticflow-route', name: 'Route Optimization', slug: 'route-optimization', description: 'AI-powered route planning and delivery scheduling.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-logisticflow-warehouse', name: 'Warehouse Management', slug: 'warehouse-management', description: 'Pick/pack, slot allocation, and inventory accuracy.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-logisticflow-shipment', name: 'Shipment Tracking', slug: 'shipment-tracking', description: 'Real-time tracking, ETA updates, and proof of delivery.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-logisticflow-fulfillment', name: 'Order Fulfillment', slug: 'order-fulfillment', description: 'End-to-end order processing from receipt to delivery.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-logisticflow-crossdock', name: 'Cross-Docking', slug: 'cross-docking', description: 'Inbound-outbound coordination and transfer management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-logisticflow-billing', name: 'Billing & Settlement', slug: 'billing-settlement', description: 'Freight billing, partner settlements, and margin tracking.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-distriflow', name: 'Distriflow', slug: 'distriflow', description: 'Distribution and wholesale management system with multi-warehouse support.', icon: 'route', color: 'amber', status: 'active', industry: 'Distribution & Wholesale', features: 'Distribution Planning,Warehouse Management,Sales Order Processing,Purchase Management,Route Planning,Returns Management', pricing: 'Starting from PKR 15,000/mo', sortOrder: 16, version: '1.0.0', website: 'https://distriflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-distriflow-planning', name: 'Distribution Planning', slug: 'distribution-planning', description: 'Territory allocation, target setting, and pipeline management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-distriflow-warehouse', name: 'Warehouse Management', slug: 'warehouse-management', description: 'Multi-warehouse inventory, transfers, and stock takes.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-distriflow-sales', name: 'Sales Order Processing', slug: 'sales-order-processing', description: 'Order entry, credit checks, and dispatch management.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-distriflow-purchase', name: 'Purchase Management', slug: 'purchase-management', description: 'Requisitions, POs, and goods receipt processing.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-distriflow-route', name: 'Route Planning', slug: 'route-planning', description: 'Delivery route optimization and van sales tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-distriflow-returns', name: 'Returns Management', slug: 'returns-management', description: 'Return processing, credit notes, and defect tracking.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-distriflow-finance', name: 'Financial Accounting', slug: 'financial-accounting', description: 'GL, AP/AR, and distributor commission management.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-fleetflow', name: 'FleetFlow', slug: 'fleetflow', description: 'Complete fleet and vehicle management platform for transportation companies.', icon: 'compass', color: 'cyan', status: 'active', industry: 'Fleet & Transportation', features: 'Fleet Tracking,Vehicle Management,Driver Management,Fuel Management,Maintenance Scheduling,Trip Planning', pricing: 'Starting from PKR 15,000/mo', sortOrder: 17, version: '1.0.0', website: 'https://fleetflowerp.vercel.app/', moduleCount: 7,
    modules: [
      { id: 'mod-fleetflow-tracking', name: 'Fleet Tracking', slug: 'fleet-tracking', description: 'GPS-based real-time vehicle tracking and geofencing.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fleetflow-vehicle', name: 'Vehicle Management', slug: 'vehicle-management', description: 'Vehicle profiles, registration, insurance, and documentation.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fleetflow-driver', name: 'Driver Management', slug: 'driver-management', description: 'Driver profiles, license tracking, and performance scoring.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fleetflow-fuel', name: 'Fuel Management', slug: 'fuel-management', description: 'Fuel card integration, consumption tracking, and alerts.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-fleetflow-maintenance', name: 'Maintenance Scheduling', slug: 'maintenance-scheduling', description: 'Preventive maintenance plans and service reminders.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fleetflow-trip', name: 'Trip Planning', slug: 'trip-planning', description: 'Route planning, load optimization, and trip sheets.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fleetflow-analytics', name: 'Fleet Analytics', slug: 'fleet-analytics', description: 'Utilization reports, cost per km, and TCO analysis.', category: 'Finance', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-electroflow', name: 'ElectroFlow', slug: 'electroflow', description: 'Complete ERP for consumer electronics & home appliances — POS, installments, service & repair, warranty management, and multi-branch retail operations.', icon: 'zap', color: 'emerald', status: 'active', industry: 'Consumer Electronics & Appliances', features: 'Point of Sale,Installment Plans,Service & Repair,Warranty Management,Inventory Tracking,Customer CRM,Delivery Management,Multi-Branch Operations', pricing: 'Starting from PKR 15,000/mo', sortOrder: 18, version: '1.0.0', website: 'https://electroflowerp.vercel.app/', moduleCount: 8,
    modules: [
      { id: 'mod-electroflow-pos', name: 'Point of Sale', slug: 'point-of-sale', description: 'Fast checkout, barcode scanning, and receipt printing for retail counters.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-electroflow-installments', name: 'Installment Plans', slug: 'installment-plans', description: 'EMI scheduling, down payments, and automated reminders.', category: 'Finance', price: 0, isActive: true },
      { id: 'mod-electroflow-service', name: 'Service & Repair', slug: 'service-repair', description: 'Service tickets, technician assignment, and repair tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-electroflow-warranty', name: 'Warranty Management', slug: 'warranty-management', description: 'Warranty registration, claims processing, and vendor RMA.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-electroflow-inventory', name: 'Inventory Tracking', slug: 'inventory-tracking', description: 'Serial number tracking, stock transfers, and reorder alerts.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-electroflow-crm', name: 'Customer CRM', slug: 'customer-crm', description: 'Customer profiles, purchase history, and follow-up reminders.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-electroflow-delivery', name: 'Delivery Management', slug: 'delivery-management', description: 'Delivery scheduling, rider tracking, and proof of delivery.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-electroflow-multibranch', name: 'Multi-Branch Operations', slug: 'multi-branch-operations', description: 'Centralized management of multiple store locations.', category: 'Operations', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-bookflow', name: 'BookFlow', slug: 'bookflow', description: 'Complete publishing and bookstore management system with inventory tracking, author management, print order processing, and multi-channel sales.', icon: 'book-open', color: 'violet', status: 'active', industry: 'Publishing & Books', features: 'Book Catalog,Author Management,Inventory Tracking,Print Order Processing,Online Sales,Wholesale Distribution,School Contracts,Stationery Management', pricing: 'Starting from PKR 25,000/mo', sortOrder: 19, version: '1.0.0', website: 'https://bookflowerp.vercel.app/', moduleCount: 8,
    modules: [
      { id: 'mod-bookflow-catalog', name: 'Book Catalog', slug: 'book-catalog', description: 'ISBN-based book cataloging with metadata, categories, and pricing.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-bookflow-author', name: 'Author Management', slug: 'author-management', description: 'Author profiles, royalty tracking, and contract management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-bookflow-inventory', name: 'Inventory Tracking', slug: 'inventory-tracking', description: 'Real-time stock tracking across warehouses and retail locations.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-bookflow-print', name: 'Print Order Processing', slug: 'print-order-processing', description: 'Manage print runs, vendor coordination, and delivery schedules.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-bookflow-online', name: 'Online Sales', slug: 'online-sales', description: 'E-commerce integration and multi-channel sales management.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-bookflow-wholesale', name: 'Wholesale Distribution', slug: 'wholesale-distribution', description: 'B2B order management, bulk pricing, and distributor portals.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-bookflow-school', name: 'School Contracts', slug: 'school-contracts', description: 'Academic book supply contracts and institutional ordering.', category: 'Sales', price: 0, isActive: true },
      { id: 'mod-bookflow-stationery', name: 'Stationery Management', slug: 'stationery-management', description: 'Stationery product catalog, inventory, and sales tracking.', category: 'Operations', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-fuelflow', name: 'FuelFlow', slug: 'fuelflow', description: 'Comprehensive fuel station management platform with IoT-enabled dispenser control, ATG tank monitoring, forecourt automation, fuel delivery tracking, and multi-station support for petroleum retailers and CNG/EV operators.', icon: 'fuel', color: 'orange', status: 'active', industry: 'Fuel & Energy', features: 'Station Management,Dispenser Control,Tank Monitoring (ATG),Fuel Delivery Tracking,CNG Management,EV Charging,Forecourt Automation,Shift Management,Car Wash,Loyalty Programs', pricing: 'Starting from PKR 30,000/mo', sortOrder: 20, version: '1.0.0', website: 'https://fuelflowerp.vercel.app/', moduleCount: 10,
    modules: [
      { id: 'mod-fuelflow-station', name: 'Station Management', slug: 'station-management', description: 'Multi-station operations with real-time monitoring and analytics.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-dispenser', name: 'Dispenser Control', slug: 'dispenser-control', description: 'IoT-enabled dispenser management with real-time flow monitoring.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-atg', name: 'Tank Monitoring (ATG)', slug: 'tank-monitoring-atg', description: 'Automatic tank gauging with level, temperature, and density tracking.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-delivery', name: 'Fuel Delivery Tracking', slug: 'fuel-delivery-tracking', description: 'End-to-end fuel delivery management with variance detection.', category: 'Supply Chain', price: 0, isActive: true },
      { id: 'mod-fuelflow-cng', name: 'CNG Management', slug: 'cng-management', description: 'CNG compressor, dispenser, and storage monitoring.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-ev', name: 'EV Charging', slug: 'ev-charging', description: 'Electric vehicle charging station management and billing.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-forecourt', name: 'Forecourt Automation', slug: 'forecourt-automation', description: 'Automated forecourt controller integration and price board management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-shift', name: 'Shift Management', slug: 'shift-management', description: 'Shift planning, handover, and cash reconciliation.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-carwash', name: 'Car Wash', slug: 'car-wash', description: 'Car wash session tracking and revenue management.', category: 'Operations', price: 0, isActive: true },
      { id: 'mod-fuelflow-loyalty', name: 'Loyalty Programs', slug: 'loyalty-programs', description: 'Customer loyalty points, fuel cards, and fleet account management.', category: 'Sales', price: 0, isActive: true },
    ],
  },
  {
    id: 'fallback-salonflow', name: 'SalonFlow', slug: 'salonflow', description: 'Complete salon and beauty business management platform with appointment scheduling, staff management, loyalty programs, membership plans, and multi-branch support.', icon: 'scissors', color: 'pink', status: 'active', industry: 'Salon & Beauty', features: 'Appointment Management,Staff Scheduling,Customer CRM,Loyalty Programs,Membership Plans,Service Catalog,Inventory Control,Multi-Branch,Commission Tracking,Billing & Invoicing', pricing: 'Starting from PKR 20,000/mo', sortOrder: 21, version: '1.0.0', website: 'https://salonflowerp.vercel.app/', moduleCount: 10,
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
  },
]

/* ────────────────────────────────────────────────────────── */
/*  React Hook: Fetch ERP systems from API                   */
/* ────────────────────────────────────────────────────────── */

export function useErpSystems(status?: string) {
  const [erps, setErps] = useState<ErpSystemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchErps = async () => {
      try {
        setLoading(true)
        const url = status ? `/api/erp-systems?status=${status}` : '/api/erp-systems'
        const res = await fetch(url)
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setErps(json.data)
        } else {
          // API returned empty or failed — use fallback
          const fallback = status
            ? FALLBACK_ERP_DATA.filter((e) => e.status === status)
            : FALLBACK_ERP_DATA
          setErps(fallback)
          if (!json.success) {
            setError(json.message || 'Failed to fetch ERP systems')
          }
        }
      } catch (err) {
        // Network error — use hardcoded fallback so activeErps.length is never 0
        const fallback = status
          ? FALLBACK_ERP_DATA.filter((e) => e.status === status)
          : FALLBACK_ERP_DATA
        setErps(fallback)
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchErps()
  }, [status])

  const activeErps = erps.filter((e) => e.status === 'active')
  const comingSoonErps = erps.filter((e) => e.status === 'coming_soon')

  // Dynamic industry verticals count based on unique industries from active ERPs
  const industryVerticals = new Set(activeErps.map((e) => e.industry)).size

  return { erps, activeErps, comingSoonErps, industryVerticals, loading, error }
}

/* ────────────────────────────────────────────────────────── */
/*  Helper: Get icon component from DB icon string           */
/* ────────────────────────────────────────────────────────── */

export function getErpIcon(iconName: string): LucideIcon {
  return ERP_ICON_MAP[iconName] || Zap
}

/* ────────────────────────────────────────────────────────── */
/*  Helper: Get color data from DB color string              */
/* ────────────────────────────────────────────────────────── */

export function getErpColor(colorName: string) {
  return ERP_COLOR_MAP[colorName] || ERP_COLOR_MAP['teal']
}

/* ────────────────────────────────────────────────────────── */
/*  Helper: Get website URL from slug                        */
/* ────────────────────────────────────────────────────────── */

export function getErpWebsite(slug: string): string {
  return ERP_WEBSITE_MAP[slug] || '#'
}

/* ────────────────────────────────────────────────────────── */
/*  Helper: Parse features string to array                   */
/* ────────────────────────────────────────────────────────── */

export function parseFeatures(featuresStr: string): string[] {
  return featuresStr ? featuresStr.split(',').map((f) => f.trim()).filter(Boolean) : []
}
