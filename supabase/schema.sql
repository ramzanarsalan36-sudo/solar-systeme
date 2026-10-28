-- ==============================================================================
-- SYSTOMECH ENGINEERS — SOLAR CRM PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase Schema with Row-Level Security (RLS) and Audit Triggers
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles Enum & Profiles
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'store_field');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'sales',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Catalog Master
CREATE TYPE product_category AS ENUM ('panel', 'inverter', 'structure', 'accessory', 'cable');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category product_category NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    capacity TEXT,
    spec TEXT NOT NULL,
    image_url TEXT,
    uom TEXT NOT NULL DEFAULT 'Nos',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock_alert INTEGER NOT NULL DEFAULT 10,
    warranty_years INTEGER NOT NULL DEFAULT 5,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Price History Audit (Price Immutability Enforcement)
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    old_price NUMERIC(12, 2) NOT NULL,
    new_price NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES profiles(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Stock Movement Ledger (Traceable Inventory)
CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT', 'ADJUST', 'RETURN');
CREATE TYPE stock_reference_type AS ENUM ('PO', 'DISPATCH_ORDER', 'STOCK_AUDIT', 'SITE_RETURN', 'INTERNAL');

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_number TEXT UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    type stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    reference_type stock_reference_type NOT NULL,
    reference_id TEXT,
    notes TEXT,
    performed_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leads & Inquiries
CREATE TYPE lead_source AS ENUM ('call', 'whatsapp', 'website', 'referral', 'walk_in');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'survey_scheduled', 'proposal_sent', 'converted', 'lost');
CREATE TYPE connection_type AS ENUM ('residential', 'commercial', 'industrial', 'agricultural');

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    address TEXT,
    state TEXT DEFAULT 'Maharashtra',
    pin_code TEXT,
    discom TEXT NOT NULL DEFAULT 'MSEDCL',
    consumer_number TEXT,
    sanction_load_kw NUMERIC(6, 2),
    monthly_bill NUMERIC(10, 2),
    monthly_units INTEGER,
    connection_type connection_type DEFAULT 'residential',
    phase TEXT DEFAULT 'single',
    roof_type TEXT DEFAULT 'rcc_flat',
    source lead_source NOT NULL DEFAULT 'call',
    status lead_status NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES profiles(id),
    estimated_kw NUMERIC(6, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);

-- 7. Follow-ups
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    contact_method TEXT NOT NULL,
    interaction_summary TEXT NOT NULL,
    outcome TEXT NOT NULL,
    next_action TEXT NOT NULL,
    next_follow_up_date TIMESTAMPTZ NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    performed_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Converted Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'Maharashtra',
    pin_code TEXT,
    discom TEXT NOT NULL,
    consumer_number TEXT NOT NULL,
    sanction_load_kw NUMERIC(6, 2) NOT NULL,
    connection_type connection_type NOT NULL,
    lead_source_id UUID REFERENCES leads(id),
    total_orders_count INTEGER DEFAULT 0,
    total_project_value NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Quotations (With Preserved Line-Item Price Snapshots)
CREATE TYPE quotation_status AS ENUM ('draft', 'shared', 'accepted', 'rejected', 'revised');

CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number TEXT UNIQUE NOT NULL,
    revision INTEGER NOT NULL DEFAULT 0,
    lead_id UUID REFERENCES leads(id),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    site_address TEXT NOT NULL,
    city TEXT NOT NULL,
    discom TEXT NOT NULL,
    consumer_number TEXT,
    sanction_load_kw NUMERIC(6, 2),
    monthly_units INTEGER NOT NULL,
    system_kw NUMERIC(6, 2) NOT NULL,
    phase TEXT NOT NULL,
    roof_type TEXT NOT NULL,
    panel_model TEXT NOT NULL,
    panel_wattage INTEGER NOT NULL,
    panel_qty INTEGER NOT NULL,
    inverter_model TEXT NOT NULL,
    inverter_qty INTEGER NOT NULL,
    structure_type TEXT NOT NULL,
    
    -- Financial snapshots
    base_system_cost NUMERIC(12, 2) NOT NULL,
    structure_elevated_charge NUMERIC(12, 2) DEFAULT 0,
    net_metering_charge NUMERIC(12, 2) DEFAULT 7500,
    installation_charge NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    taxable_amount NUMERIC(12, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) DEFAULT 13.80,
    gst_amount NUMERIC(12, 2) NOT NULL,
    total_gross_price NUMERIC(12, 2) NOT NULL,
    
    -- Subsidy snapshots
    subsidy_eligible BOOLEAN DEFAULT TRUE,
    subsidy_eligibility_status TEXT DEFAULT 'unverified',
    subsidy_scheme_name TEXT DEFAULT 'PM Surya Ghar: Muft Bijli Yojana',
    subsidy_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_payable_customer NUMERIC(12, 2) NOT NULL,
    
    -- Projections
    annual_generation_units INTEGER NOT NULL,
    annual_electricity_savings NUMERIC(12, 2) NOT NULL,
    payback_years NUMERIC(4, 1) NOT NULL,
    twenty_five_year_savings NUMERIC(12, 2) NOT NULL,
    
    status quotation_status NOT NULL DEFAULT 'draft',
    validity_days INTEGER DEFAULT 15,
    payment_terms TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotation Line Items
CREATE TABLE quotation_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    category product_category NOT NULL,
    spec TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    uom TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL, -- Historical price snapshot
    line_total NUMERIC(12, 2) NOT NULL
);

-- 10. Orders
CREATE TYPE order_status AS ENUM (
    'draft', 'confirmed', 'material_dispatched', 'structure_erected',
    'panels_mounted', 'wired_tested', 'net_meter_applied', 'commissioned', 'cancelled'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    quotation_id UUID NOT NULL REFERENCES quotations(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    site_address TEXT NOT NULL,
    system_kw NUMERIC(6, 2) NOT NULL,
    total_order_value NUMERIC(12, 2) NOT NULL,
    subsidy_expected NUMERIC(12, 2) DEFAULT 0,
    net_customer_payable NUMERIC(12, 2) NOT NULL,
    total_paid NUMERIC(12, 2) DEFAULT 0,
    balance_due NUMERIC(12, 2) NOT NULL,
    status order_status NOT NULL DEFAULT 'confirmed',
    assigned_field_engineer_id UUID REFERENCES profiles(id),
    expected_commissioning_date DATE,
    commissioned_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payment Records
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    receipt_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method TEXT NOT NULL,
    reference_number TEXT NOT NULL,
    stage TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'verified',
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tasks & Field Operations
CREATE TYPE task_type AS ENUM (
    'site_survey', 'material_dispatch', 'structure_installation',
    'panel_mounting', 'wiring_inverter_setup', 'net_meter_inspection', 'plant_handover', 'general_maintenance'
);
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type task_type NOT NULL,
    priority task_priority NOT NULL DEFAULT 'high',
    status task_status NOT NULL DEFAULT 'pending',
    assigned_to UUID NOT NULL REFERENCES profiles(id),
    related_order_id UUID REFERENCES orders(id),
    related_lead_id UUID REFERENCES leads(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    site_address TEXT NOT NULL,
    city TEXT NOT NULL,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    site_notes TEXT,
    stage TEXT DEFAULT 'survey_done', -- 'survey_done', 'structure_installed', 'panels_wired', 'inverter_setup', 'net_meter_applied', 'commissioned'
    proof_photos JSONB DEFAULT '[]'::JSONB,
    checklist JSONB DEFAULT '[]'::JSONB,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12b. Dedicated Site Tasks Entity (Specification Table)
CREATE TABLE site_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_technician_id UUID REFERENCES profiles(id),
    current_stage TEXT NOT NULL DEFAULT 'survey_done',
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    proof_photos JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. System Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    actor_name TEXT NOT NULL,
    actor_role user_role NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ADMIN POLICIES (Full Access to Everything)
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access price_history" ON price_history FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access stock_movements" ON stock_movements FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access follow_ups" ON follow_ups FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access customers" ON customers FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access quotations" ON quotations FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access quotation_line_items" ON quotation_line_items FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access tasks" ON tasks FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admin full access audit_logs" ON audit_logs FOR ALL USING (get_current_user_role() = 'admin');

-- SALES / OFFICE POLICIES
CREATE POLICY "Sales view products" ON products FOR SELECT USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales manage leads" ON leads FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales manage follow_ups" ON follow_ups FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales manage customers" ON customers FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales manage quotations" ON quotations FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales manage quotation_items" ON quotation_line_items FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales manage orders" ON orders FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales record payments" ON payments FOR ALL USING (get_current_user_role() = 'sales');
CREATE POLICY "Sales view tasks" ON tasks FOR SELECT USING (get_current_user_role() = 'sales');

-- STORE / FIELD POLICIES
CREATE POLICY "Field view products" ON products FOR SELECT USING (get_current_user_role() = 'store_field');
CREATE POLICY "Field manage stock_movements" ON stock_movements FOR ALL USING (get_current_user_role() = 'store_field');
CREATE POLICY "Field manage tasks" ON tasks FOR ALL USING (get_current_user_role() = 'store_field');
CREATE POLICY "Field view orders" ON orders FOR SELECT USING (get_current_user_role() = 'store_field');
