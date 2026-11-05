-- =====================================================================
-- AZ Labs — Stage 1 migration (2026-11-01)
-- Eligibility gate, audit trail, idempotent order creation, tighter RLS.
--
-- Safe to run on the existing production database:
--   * No rows are deleted.
--   * Product content (descriptions, purity text etc.) is left in place; the new site
--     simply stops rendering unverified purity/batch fields.
--   * EVERY product is reset to eligibility_status = 'manual_review' with no lawful
--     destinations. This intentionally disables purchasing until documentation is matched.
--   * The three code-named incretin listings are marked not_eligible and out of stock.
-- Run in the Supabase SQL editor, or `supabase db push`.
-- =====================================================================

BEGIN;

-- 1. Products: eligibility + documentation columns --------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS eligibility_status TEXT NOT NULL DEFAULT 'manual_review',
  ADD COLUMN IF NOT EXISTS eligibility_doc_ref TEXT,
  ADD COLUMN IF NOT EXISTS eligibility_conditions TEXT,
  ADD COLUMN IF NOT EXISTS storage_notes TEXT,
  ADD COLUMN IF NOT EXISTS coa_url TEXT;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_eligibility_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_eligibility_status_check
  CHECK (eligibility_status IN ('manual_review', 'eligible', 'not_eligible'));

-- No destination is lawful by default.
ALTER TABLE public.products ALTER COLUMN lawful_destinations SET DEFAULT '{}'::text[];

-- Reset eligibility for every product with no documentation reference yet (all of them on the
-- first run). Re-running this file later will not undo documented approvals.
UPDATE public.products
   SET eligibility_status = 'manual_review',
       lawful_destinations = '{}'::text[],
       updated_at = now()
 WHERE eligibility_doc_ref IS NULL;

-- Retatrutide / tirzepatide / semaglutide listed under code names: never sell.
UPDATE public.products
   SET eligibility_status = 'not_eligible',
       in_stock = false,
       is_featured = false,
       updated_at = now()
 WHERE sku IN ('AZ-GLP3-10', 'AZ-GLP2-15', 'AZ-GLP1-05')
    OR slug ILIKE '%retatrutide%' OR slug ILIKE '%tirzepatide%' OR slug ILIKE '%semaglutide%';

-- An eligible product must carry a document reference and at least one destination.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_eligible_requires_docs;
ALTER TABLE public.products ADD CONSTRAINT products_eligible_requires_docs CHECK (
  eligibility_status <> 'eligible'
  OR (coalesce(btrim(eligibility_doc_ref), '') <> '' AND cardinality(lawful_destinations) > 0)
);

-- 2. Orders: idempotency + terms ------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key UUID,
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_key ON public.orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 3. Audit log --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT,
  entity TEXT NOT NULL CHECK (entity IN ('product', 'order')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read audit" ON public.audit_log;
CREATE POLICY "Admin read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()));
-- No insert/update/delete policies: only the service role (server) can write; entries are append-only in practice.

-- 4. RLS tightening ---------------------------------------------------
-- Public may read only listed products.
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT
  USING (eligibility_status <> 'not_eligible');

-- Admins (authenticated + in admin_profiles) can read everything.
DROP POLICY IF EXISTS "Admin read all products" ON public.products;
CREATE POLICY "Admin read all products" ON public.products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.user_id = auth.uid()));

-- admin_profiles: a user may read their own row only.
DROP POLICY IF EXISTS "Self read admin profile" ON public.admin_profiles;
CREATE POLICY "Self read admin profile" ON public.admin_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Orders / order_items: no anon policies at all. Inserts happen only through create_order() below.

-- 5. Atomic, idempotent order creation --------------------------------
CREATE OR REPLACE FUNCTION public.create_order(p_idempotency_key UUID, p_order JSONB, p_items JSONB)
RETURNS TABLE (id UUID, reference TEXT, is_duplicate BOOLEAN)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_existing public.orders%ROWTYPE;
  v_order_id UUID;
  v_reference TEXT;
BEGIN
  SELECT * INTO v_existing FROM public.orders o WHERE o.idempotency_key = p_idempotency_key;
  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.reference, true;
    RETURN;
  END IF;

  INSERT INTO public.orders (
    idempotency_key, reference, customer_name, customer_email, customer_phone, institution,
    address_line1, address_line2, city, postal_code, country_code, currency,
    subtotal, shipping_cost, vat_amount, total_amount, status, terms_accepted, compliance_confirmed, notes
  ) VALUES (
    p_idempotency_key,
    p_order->>'reference', p_order->>'customer_name', p_order->>'customer_email', p_order->>'customer_phone',
    NULLIF(p_order->>'institution', ''), p_order->>'address_line1', NULLIF(p_order->>'address_line2', ''),
    p_order->>'city', p_order->>'postal_code', p_order->>'country_code', p_order->>'currency',
    (p_order->>'subtotal')::numeric, (p_order->>'shipping_cost')::numeric,
    (p_order->>'vat_amount')::numeric, (p_order->>'total_amount')::numeric,
    'pending_contact', coalesce((p_order->>'terms_accepted')::boolean, false), false, NULLIF(p_order->>'notes', '')
  )
  RETURNING orders.id, orders.reference INTO v_order_id, v_reference;

  INSERT INTO public.order_items (order_id, product_id, product_name, sku, format, unit_price, quantity, total_price)
  SELECT v_order_id, (i->>'product_id')::uuid, i->>'product_name', i->>'sku', i->>'format',
         (i->>'unit_price')::numeric, (i->>'quantity')::int, (i->>'total_price')::numeric
    FROM jsonb_array_elements(p_items) AS i;

  RETURN QUERY SELECT v_order_id, v_reference, false;
EXCEPTION WHEN unique_violation THEN
  -- Concurrent duplicate submit with the same key: return the winner.
  RETURN QUERY SELECT o.id, o.reference, true FROM public.orders o WHERE o.idempotency_key = p_idempotency_key;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(UUID, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(UUID, JSONB, JSONB) TO service_role;

COMMIT;
