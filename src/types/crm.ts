export type UserRole = 'admin' | 'sales' | 'store_field';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  active: boolean;
}

export type ProductCategory = 'panel' | 'inverter' | 'structure' | 'accessory' | 'cable';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  brand: string;
  spec: string;
  capacity?: string; // e.g. '545Wp', '5.0 kW', '3 kW Kit'
  imageUrl?: string; // High-resolution Unsplash photo URL
  uom: string; // 'Nos', 'kW', 'Meters', 'Sets'
  price: number; // Current approved selling price in ₹
  costPrice: number; // Cost / procurement price in ₹
  stock: number; // Real-time derived stock balance
  minStockAlert: number;
  active: boolean;
  warrantyYears: number;
  notes?: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  reason: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'RETURN';

export interface StockMovement {
  id: string;
  movementNumber: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: 'PO' | 'DISPATCH_ORDER' | 'STOCK_AUDIT' | 'SITE_RETURN' | 'INTERNAL';
  referenceId?: string;
  notes: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
}

export type LeadSource = 'call' | 'whatsapp' | 'website' | 'referral' | 'walk_in';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'survey_scheduled'
  | 'proposal_sent'
  | 'quote_generated'
  | 'negotiation'
  | 'won'
  | 'converted'
  | 'lost'
  | 'closed_lost';

export interface Lead {
  id: string;
  leadNumber: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  state: string;
  pinCode?: string;
  discom: string; // e.g. MSEDCL, Tata Power, Torrent, Adani
  consumerNumber?: string;
  sanctionLoadKw?: number;
  monthlyBill?: number;
  monthlyUnits?: number;
  connectionType: 'residential' | 'commercial' | 'industrial' | 'agricultural';
  phase: 'single' | 'three';
  roofType: 'rcc_flat' | 'tin_shed' | 'tile_roof' | 'elevated_required';
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string; // User ID
  assignedToName: string;
  estimatedKw?: number;
  notes?: string;
  customerId?: string; // set when converted
  orderId?: string; // set when converted
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  customerId?: string;
  contactMethod: 'call' | 'whatsapp' | 'site_visit' | 'email';
  interactionSummary: string;
  outcome: 'interested' | 'quoted' | 'bargaining' | 'callback_requested' | 'not_reachable' | 'rejected';
  nextAction: string;
  nextFollowUpDate: string; // ISO date string
  isDone: boolean;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerNumber: string; // CUST-2026-001
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  discom: string;
  consumerNumber: string;
  sanctionLoadKw: number;
  connectionType: 'residential' | 'commercial' | 'industrial';
  leadSourceId?: string;
  totalOrdersCount: number;
  totalProjectValue: number;
  createdAt: string;
}

export interface QuotationLineItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  spec: string;
  quantity: number;
  uom: string;
  unitPrice: number; // Snapshot of price at quotation creation
  lineTotal: number;
}

export type QuotationStatus = 'draft' | 'shared' | 'accepted' | 'rejected' | 'revised';

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. QT-2026-042
  revision: number; // 0 for original, 1 for R1, etc.
  leadId?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  siteAddress: string;
  city: string;
  discom: string;
  consumerNumber?: string;
  sanctionLoadKw: number;
  monthlyUnits: number;
  systemKw: number;
  phase: 'single' | 'three';
  roofType: string;

  // Selected major equipment snapshots
  panelModel: string;
  panelWattage: number;
  panelQty: number;
  inverterModel: string;
  inverterQty: number;
  structureType: string;

  lineItems: QuotationLineItem[];

  // Price calculations
  baseSystemCost: number; // Equipment + standard BOS
  structureElevatedCharge: number;
  netMeteringCharge: number; // Discom liaison, meter testing, CEIG
  installationCharge: number; // Civil + electrical labor
  discount: number;
  taxableAmount: number;
  gstRate: number; // 13.8% composite solar GST or 12%/18%
  gstAmount: number;
  totalGrossPrice: number; // Gross payable before subsidy

  // Subsidy calculations
  subsidyEligible: boolean;
  subsidyEligibilityStatus: 'verified' | 'unverified' | 'ineligible';
  subsidySchemeName: string; // "PM Surya Ghar: Muft Bijli Yojana"
  subsidyAmount: number; // Central DBT subsidy
  netPayableCustomer: number; // totalGrossPrice - subsidyAmount

  // Financial projections
  annualGenerationUnits: number;
  annualElectricitySavings: number;
  paybackYears: number;
  twentyFiveYearSavings: number;

  status: QuotationStatus;
  validityDays: number;
  paymentTerms: string;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'material_dispatched'
  | 'structure_erected'
  | 'panels_mounted'
  | 'wired_tested'
  | 'net_meter_applied'
  | 'commissioned'
  | 'cancelled';

export interface PaymentRecord {
  id: string;
  orderId: string;
  receiptNumber: string;
  amount: number;
  date: string;
  method: 'neft' | 'rtgs' | 'upi' | 'cheque' | 'cash';
  referenceNumber: string;
  stage: 'advance_booking' | 'material_dispatch' | 'structure_completion' | 'final_commissioning';
  status: 'verified' | 'pending';
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // ORD-2026-015
  quotationId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  systemKw: number;
  totalOrderValue: number; // Gross price
  subsidyExpected: number;
  netCustomerPayable: number;
  totalPaid: number;
  balanceDue: number;
  status: OrderStatus;
  payments: PaymentRecord[];
  assignedFieldEngineerId?: string;
  assignedFieldEngineerName?: string;
  expectedCommissioningDate?: string;
  commissionedAt?: string;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskType =
  | 'site_survey'
  | 'material_dispatch'
  | 'structure_installation'
  | 'panel_mounting'
  | 'wiring_inverter_setup'
  | 'net_meter_inspection'
  | 'plant_handover'
  | 'general_maintenance';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string; // User ID
  assignedToName: string;
  relatedOrderId?: string;
  orderNumber?: string;
  relatedLeadId?: string;
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  city: string;
  dueDate: string;
  completedAt?: string;
  siteNotes?: string;
  stage?: 'survey_done' | 'structure_installed' | 'panels_wired' | 'inverter_setup' | 'net_meter_applied' | 'commissioned';
  proofPhotos?: string[];
  checklist: TaskChecklistItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'product' | 'lead' | 'quotation' | 'order' | 'inventory' | 'payment' | 'task' | 'settings';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface SubsidyRule {
  minKw: number;
  maxKw: number;
  subsidyRate: number; // fixed amount in ₹ or rate
  description: string;
}
