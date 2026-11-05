-- =====================================================================
-- AZ Labs: Database Schema & Row Level Security Policies
-- Tagline: "Research. Refined." | Domain: azlabs.pro
-- UK WhatsApp Desk: +44 7448 399290
-- PostgreSQL / Supabase
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    cas_number TEXT,
    category TEXT NOT NULL,
    sequence TEXT,
    molecular_formula TEXT,
    molecular_weight TEXT,
    grade TEXT NOT NULL,
    purity TEXT,
    unit_size TEXT NOT NULL,
    price_gbp NUMERIC(10, 2) NOT NULL CHECK (price_gbp >= 0),
    price_eur NUMERIC(10, 2) NOT NULL CHECK (price_eur >= 0),
    kit_price_gbp NUMERIC(10, 2) CHECK (kit_price_gbp >= 0),
    kit_price_eur NUMERIC(10, 2) CHECK (kit_price_eur >= 0),
    in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_quantity INTEGER NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
    max_per_order INTEGER NOT NULL DEFAULT 20 CHECK (max_per_order > 0),
    cap_color TEXT DEFAULT '#10b981',
    lawful_destinations TEXT[] NOT NULL DEFAULT '{}'::text[],
    description TEXT NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb,
    safety_notes TEXT,
    coa_batch TEXT,
    coa_date TEXT,
    sds_url TEXT,
    image_url TEXT,
    alt_text TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    institution TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost NUMERIC(10, 2) NOT NULL CHECK (shipping_cost >= 0),
    vat_amount NUMERIC(10, 2) NOT NULL CHECK (vat_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending_contact' CHECK (
        status IN ('pending_contact', 'confirmed', 'processing', 'dispatched', 'completed', 'cancelled')
    ),
    compliance_confirmed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    whatsapp_opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    format TEXT DEFAULT 'single',
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 5. Admin Profiles Table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'auditor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"
    ON public.products
    FOR SELECT
    USING (true);

CREATE POLICY "Admin write products"
    ON public.products
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin read orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin update orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
        )
    );

-- 7. Seed data
-- The previous seed contained unverified purity/batch figures and code-named prescription-only
-- products. It has been removed. Insert products through the admin dashboard or a reviewed seed.
-- After running this file on a fresh project, also run supabase/migrations/*.sql in order.
