-- =====================================================================
-- AZ Labs — Fix RLS policies + seed approved test products
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- Safe to re-run (all statements are idempotent via DROP/CREATE or ON CONFLICT DO NOTHING).
-- =====================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════
-- 1. PRODUCTS — ensure RLS is on and policies are correct
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop any old conflicting policies
DROP POLICY IF EXISTS "Public read products"           ON public.products;
DROP POLICY IF EXISTS "Admin write products"           ON public.products;
DROP POLICY IF EXISTS "Admin read all products"        ON public.products;

-- ① Anonymous + authenticated users can SELECT approved, documented, unrestricted products only.
CREATE POLICY "Public read products"
  ON public.products
  FOR SELECT
  USING (
    NOT is_restricted
    AND eligibility_status IN ('approved_marketing', 'approved_sale')
    AND coalesce(btrim(eligibility_doc_ref), '') <> ''
  );

-- ② Admins (authenticated users who have a row in admin_profiles) can SELECT everything.
CREATE POLICY "Admin read all products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()
    )
  );

-- ③ Only admins can INSERT / UPDATE / DELETE. is_restricted cannot be cleared (enforced by trigger).
DROP POLICY IF EXISTS "Admin mutate products" ON public.products;
CREATE POLICY "Admin mutate products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()
        AND a.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()
        AND a.role IN ('admin', 'super_admin')
    )
  );

-- ══════════════════════════════════════════════════════════════════════
-- 2. ORDERS / ORDER_ITEMS — keep anon blocked; service_role does inserts
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read orders"   ON public.orders;
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;

CREATE POLICY "Admin read orders" ON public.orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid() AND a.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid() AND a.role IN ('admin', 'super_admin')));

-- ══════════════════════════════════════════════════════════════════════
-- 3. ADMIN_PROFILES — users can read their own row
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Self read admin profile" ON public.admin_profiles;
CREATE POLICY "Self read admin profile"
  ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════
-- 4. AUDIT_LOG — admins can read; only service_role can write
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read audit" ON public.audit_log;
CREATE POLICY "Admin read audit"
  ON public.audit_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()));

-- ══════════════════════════════════════════════════════════════════════
-- 5. STORAGE — keep product-images bucket PRIVATE (signed URLs from server)
--    If you want truly public images (no signed URLs needed), change public = true below
--    and add a storage SELECT policy for anon.
-- ══════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  false,              -- private: served only via signed URLs from the server
  5242880,            -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Allow service_role (server) to read storage objects (required for signed URL generation).
-- No anon or authenticated policies: anon never reads directly; signed URLs are generated server-side.

-- ══════════════════════════════════════════════════════════════════════
-- 6. SEED — 3 approved test products (visible to customers immediately)
--    These use a placeholder doc_ref so they pass the isPubliclyListed() gate.
--    Replace with real documentation references before go-live.
-- ══════════════════════════════════════════════════════════════════════
INSERT INTO public.products (
  slug, name, sku, category, unit_size, pack_contents, description, specifications,
  cas_number, molecular_formula, molecular_weight, storage_notes,
  price_gbp, price_eur,
  in_stock, stock_quantity, max_per_order,
  eligibility_status, eligibility_doc_ref, lawful_destinations,
  is_restricted, image_paths, alt_text, cap_color, is_featured
)
VALUES
  -- ① Selank Nasal Spray — approved for marketing (listed, not orderable)
  (
    'selank-nasal-spray-10mg',
    'Selank Nasal Spray',
    'AZ-SEL-10',
    'Nasal Sprays',
    '10 mg · 15 mL',
    '1 × 15 mL nasal spray bottle, in carton',
    'Selank, a synthetic heptapeptide, supplied as a 10 mg nasal spray in a 15 mL bottle.',
    '{"Format": "Nasal spray", "Volume": "15 mL", "Labelled content": "10 mg"}'::jsonb,
    NULL,
    NULL,
    NULL,
    'Store at 2–8 °C. See batch documentation for full conditions.',
    65.00, 75.00,
    true, 50, 10,
    'approved_marketing',
    'TEST-DOC-SEL-001',    -- Replace with real solicitor/regulatory ref before go-live
    '{GB,IE,DE,FR,NL}'::text[],
    false,
    '{}'::text[],
    'AZ Labs Selank Nasal Spray 10 mg',
    '#5b3f9e',
    true
  ),

  -- ② SimplyNAD+ 500 mg — approved for sale (listed AND orderable to GB)
  (
    'simplynad-nasal-spray-500mg',
    'SimplyNAD+ Nasal Spray 500 mg',
    'AZ-SNAD-500',
    'Nasal Sprays',
    '500 mg · 15 mL',
    '1 × 15 mL nasal spray bottle, in carton',
    'Nicotinamide adenine dinucleotide (NAD+) nasal spray, 500 mg in a 15 mL bottle.',
    '{"Format": "Nasal spray", "Volume": "15 mL", "Labelled content": "500 mg NAD+"}'::jsonb,
    '53-84-9',
    'C21H27N7O14P2',
    '663.4 g/mol',
    'Store at 2–8 °C. See batch documentation for full conditions.',
    75.00, 87.00,
    true, 100, 10,
    'approved_sale',
    'TEST-DOC-SNAD-001',   -- Replace with real ref
    '{GB}'::text[],
    false,
    '{}'::text[],
    'AZ Labs SimplyNAD+ Nasal Spray 500 mg',
    '#1f6f6a',
    true
  ),

  -- ③ NAD+ Vial 500 mg — approved for sale (listed AND orderable to GB)
  (
    'nad-plus-500mg',
    'NAD+',
    'AZ-NAD-500',
    'Vials',
    '500 mg',
    '1 × glass vial',
    'Nicotinamide adenine dinucleotide (NAD+), 500 mg, in a sealed glass vial.',
    '{"Format": "Vial", "Labelled content": "500 mg"}'::jsonb,
    '53-84-9',
    'C21H27N7O14P2',
    '663.4 g/mol',
    'Store at 2–8 °C. See batch documentation for full conditions.',
    55.00, 63.00,
    true, 80, 5,
    'approved_sale',
    'TEST-DOC-NAD-001',    -- Replace with real ref
    '{GB,IE}'::text[],
    false,
    '{}'::text[],
    'AZ Labs NAD+ 500 mg vial',
    '#c8b27c',
    true
  )
ON CONFLICT (sku) DO UPDATE
  SET
    eligibility_status  = EXCLUDED.eligibility_status,
    eligibility_doc_ref = EXCLUDED.eligibility_doc_ref,
    lawful_destinations = EXCLUDED.lawful_destinations,
    price_gbp           = EXCLUDED.price_gbp,
    price_eur           = EXCLUDED.price_eur,
    in_stock            = EXCLUDED.in_stock,
    stock_quantity      = EXCLUDED.stock_quantity,
    updated_at          = now();

COMMIT;

-- ══════════════════════════════════════════════════════════════════════
-- 7. VERIFY (run after the above)
-- ══════════════════════════════════════════════════════════════════════
-- Run each SELECT as the ANON role to confirm RLS works:
--
-- a) Should return 0 rows (anon cannot read restricted/pending products):
--    SELECT id, name, eligibility_status FROM public.products
--    WHERE eligibility_status = 'pending_review';
--
-- b) Should return the 3 seeded products:
--    SELECT id, name, eligibility_status, eligibility_doc_ref
--    FROM public.products
--    WHERE eligibility_status IN ('approved_marketing', 'approved_sale');
--
-- c) Should return 0 rows (anon cannot insert):
--    INSERT INTO public.products (slug,name,sku,category,unit_size,description,price_gbp,price_eur,in_stock,stock_quantity,max_per_order,eligibility_status,lawful_destinations,is_restricted,image_paths,alt_text)
--    VALUES ('hack','Hack','HACK','X','X','X',0,0,false,0,1,'pending_review','{}',false,'{}','X');
--    -- Should fail with: "new row violates row-level security policy for table \"products\""
-- ══════════════════════════════════════════════════════════════════════
