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
    lawful_destinations TEXT[] NOT NULL DEFAULT ARRAY['GB', 'DE', 'FR', 'NL', 'IE', 'BE', 'IT', 'ES', 'AT', 'CH'],
    eligibility_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
        eligibility_status IN ('pending_review', 'approved_marketing', 'approved_sale', 'not_approved')
    ),
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

CREATE POLICY "Admins read own profile"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"
    ON public.products
    FOR SELECT
    USING (eligibility_status IN ('approved_marketing', 'approved_sale'));

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

-- 7. Seed Initial Research Peptides
INSERT INTO public.products (
    slug, name, sku, cas_number, category, sequence, molecular_formula, molecular_weight,
    grade, purity, unit_size, price_gbp, price_eur, kit_price_gbp, kit_price_eur,
    in_stock, stock_quantity, max_per_order, cap_color, lawful_destinations, description,
    specifications, safety_notes, coa_batch, coa_date, image_url, alt_text, is_featured
) VALUES
(
    'bpc-157-10mg',
    'BPC-157 Research Peptide (10mg)',
    'AZ-BPC-10',
    '137525-51-0',
    'Tissue Repair & Cell Models',
    'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    'C62H98N16O22',
    '1419.53 g/mol',
    'Lyophilized Solid (>99% HPLC)',
    '99.4% (HPLC & ESI-MS)',
    '10 mg Lyophilized Powder (Sealed Vial)',
    45.00,
    52.00,
    360.00,
    415.00,
    true,
    180,
    20,
    '#10b981',
    ARRAY['GB', 'DE', 'FR', 'NL', 'IE', 'BE', 'IT', 'ES', 'AT', 'CH'],
    'High-purity synthetic pentadecapeptide derived from gastric protection sequence models. Lyophilized in a vacuum-sealed borosilicate glass vial for in-vitro cellular migration and tissue integrity assays.',
    '{"HPLC Purity": "99.42%", "ESI-MS": "1419.60 Da", "Moisture": "2.1%", "Appearance": "White lyophilized powder"}'::jsonb,
    'Strictly for laboratory in-vitro testing and scientific research. Not for human, clinical, or veterinary use.',
    'AZ-2026-BPC-L91',
    'October 2026',
    '/products/bpc-157.png',
    'AZ Labs BPC-157 10mg lyophilized peptide vial with emerald flip-off seal',
    true
),
(
    'tb-500-10mg',
    'TB-500 Thymosin Beta-4 Fragment (10mg)',
    'AZ-TB-10',
    '77591-33-4',
    'Tissue Repair & Cell Models',
    'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
    'C212H350N56O78S',
    '4963.50 g/mol',
    'Lyophilized Solid (>99% HPLC)',
    '99.2% (HPLC & MS)',
    '10 mg Lyophilized Powder (Sealed Vial)',
    48.00,
    56.00,
    385.00,
    445.00,
    true,
    140,
    20,
    '#06b6d4',
    ARRAY['GB', 'DE', 'FR', 'NL', 'IE', 'BE', 'IT', 'ES', 'AT', 'CH'],
    'Synthetic peptide sequence corresponding to the active actin-binding domain of endogenous Thymosin Beta-4. Formulated for actin filament cellular dynamic investigations.',
    '{"HPLC Purity": "99.21%", "Mass Spec": "4963.4 Da", "Endotoxin": "< 0.05 EU/mg"}'::jsonb,
    'For in-vitro laboratory research and analytical protocols only. Store sealed at -20 °C.',
    'AZ-2026-TB5-K44',
    'October 2026',
    '/products/tb-500.png',
    'AZ Labs TB-500 10mg lyophilized peptide vial with cyan flip-off seal',
    true
),
(
    'glp3-rt-retatrutide-10mg',
    'GLP3-RT Triple Receptor Research Peptide (10mg)',
    'AZ-GLP3-10',
    '2381089-83-2',
    'Metabolic & Incretin Research',
    'GIP/GLP-1/Glucagon Multi-Receptor Target Sequence',
    'C221H342N48O68',
    '4731.33 g/mol',
    'HPLC Ultra-Pure Grade (>99.5%)',
    '99.6% (HPLC & LC-MS/MS)',
    '10 mg Lyophilized Powder',
    115.00,
    135.00,
    920.00,
    1075.00,
    true,
    60,
    10,
    '#eab308',
    ARRAY['GB', 'DE', 'FR', 'NL', 'IE', 'BE', 'IT', 'ES', 'AT', 'CH'],
    'Advanced triple-agonist research peptide (targeting GLP-1, GIP, and glucagon receptor complexes) synthesized for in-vitro receptor binding assays, enzyme kinetics, and metabolic cell line evaluations.',
    '{"HPLC Purity": "99.64%", "Mass Spec": "4731.3 Da", "Moisture": "1.8%"}'::jsonb,
    'Laboratory research compound only. Not for in vivo administration or therapeutic evaluation. Store at -20 °C.',
    'AZ-2026-RT3-V08',
    'October 2026',
    '/products/retatrutide.png',
    'AZ Labs GLP3-RT triple agonist peptide 10mg vial with gold cap',
    true
),
(
    'ghk-cu-copper-peptide-50mg',
    'GHK-Cu Copper Tripeptide-1 Complex (50mg)',
    'AZ-GHK-50',
    '49557-75-7',
    'Dermal & Receptor Research',
    'Gly-His-Lys:Cu2+ (Copper Complexed Tripeptide)',
    'C14H24CuN6O4',
    '403.93 g/mol',
    'High-Purity Chelate Solid',
    '99.3% (HPLC & UV-Vis)',
    '50 mg Deep Blue Lyophilized Powder',
    52.00,
    60.00,
    415.00,
    480.00,
    true,
    130,
    20,
    '#2563eb',
    ARRAY['GB', 'DE', 'FR', 'NL', 'IE', 'BE', 'IT', 'ES', 'AT', 'CH'],
    'Naturally occurring tripeptide complexed with copper ions, giving a distinctive deep cobalt blue coloration. Extensively studied in dermal fibroblast gene expression.',
    '{"HPLC Purity": "99.30%", "Copper Content": "8.0% w/w", "Appearance": "Vivid blue powder"}'::jsonb,
    'Non-hazardous laboratory reagent. Wear goggles and gloves. Intended solely for in-vitro cell and tissue culture experiments.',
    'AZ-2026-GHK-C77',
    'October 2026',
    '/products/ghk-cu.png',
    'AZ Labs GHK-Cu 50mg copper tripeptide vial with royal blue cap',
    true
)
ON CONFLICT (slug) DO NOTHING;
