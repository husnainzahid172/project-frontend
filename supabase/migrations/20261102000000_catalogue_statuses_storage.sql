-- =====================================================================
-- AZ Labs: catalogue, four-status eligibility, restricted lock, private image storage (2026-11-02)
-- Run AFTER 20261101000000_stage1_eligibility_security.sql. Non-destructive: no rows deleted,
-- existing products keep their content. Safe to re-run.
-- =====================================================================

BEGIN;

-- 1. New columns -----------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS restriction_reason TEXT,
  ADD COLUMN IF NOT EXISTS image_paths TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pack_contents TEXT;

-- Legacy columns no longer required by the app.
ALTER TABLE public.products ALTER COLUMN grade DROP NOT NULL;

-- 2. Four statuses ---------------------------------------------------
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_eligibility_status_check;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_eligible_requires_docs;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_rules;

UPDATE public.products SET eligibility_status = 'pending_review' WHERE eligibility_status = 'manual_review';
UPDATE public.products SET eligibility_status = 'approved_sale'  WHERE eligibility_status = 'eligible';
UPDATE public.products SET eligibility_status = 'not_approved'   WHERE eligibility_status = 'not_eligible';

ALTER TABLE public.products ALTER COLUMN eligibility_status SET DEFAULT 'pending_review';
ALTER TABLE public.products ADD CONSTRAINT products_eligibility_status_check
  CHECK (eligibility_status IN ('pending_review', 'approved_marketing', 'approved_sale', 'not_approved'));

-- 3. Restricted medicines: locked out of marketing and sale ----------
UPDATE public.products
   SET is_restricted = true,
       eligibility_status = 'not_approved',
       in_stock = false,
       is_featured = false
 WHERE sku IN ('AZ-GLP3-10', 'AZ-GLP2-15', 'AZ-GLP1-05', 'AZ-RETA-10', 'AZ-TIRZ-10')
    OR slug ~* '(retatrutide|tirzepatide|semaglutide)'
    OR name ~* '(retatrutide|tirzepatide|semaglutide)';

-- 4. Status rules enforced by the database -----------------------------
ALTER TABLE public.products ADD CONSTRAINT products_status_rules CHECK (
  -- restricted products can never be approved
  (NOT is_restricted OR eligibility_status IN ('pending_review', 'not_approved'))
  -- any approval needs a documentation reference
  AND (eligibility_status NOT IN ('approved_marketing', 'approved_sale') OR coalesce(btrim(eligibility_doc_ref), '') <> '')
  -- sale additionally needs destinations and real prices
  AND (eligibility_status <> 'approved_sale' OR (cardinality(lawful_destinations) > 0 AND price_gbp > 0 AND price_eur > 0))
);

-- Restricted flag cannot be cleared by an UPDATE from the API; only by a deliberate SQL change
-- that first drops this trigger.
CREATE OR REPLACE FUNCTION public.keep_restricted_flag() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_restricted AND NOT NEW.is_restricted THEN
    RAISE EXCEPTION 'is_restricted cannot be cleared';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS products_keep_restricted ON public.products;
CREATE TRIGGER products_keep_restricted BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.keep_restricted_flag();

-- 5. Public visibility: only approved, documented, unrestricted products --
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT
  USING (
    NOT is_restricted
    AND eligibility_status IN ('approved_marketing', 'approved_sale')
    AND coalesce(btrim(eligibility_doc_ref), '') <> ''
  );

-- 6. Private image bucket (served only via short-lived signed URLs from the server) --
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false;
-- No storage.objects policies are created: only the service role (server) can read or write.

-- 7. Catalogue seed (the eight products in the AZ Labs catalogue) ------
-- Prices 0 = not set; stock 0. Every product pending review; retatrutide/tirzepatide restricted.
INSERT INTO public.products (slug, name, sku, category, unit_size, pack_contents, description, specifications, cas_number, sequence, molecular_formula, molecular_weight, storage_notes, price_gbp, price_eur, in_stock, stock_quantity, max_per_order, eligibility_status, lawful_destinations, is_restricted, restriction_reason, image_paths, alt_text, cap_color, is_featured) VALUES
  ('selank-nasal-spray-10mg', 'Selank Nasal Spray', 'AZ-SEL-10', 'Nasal Sprays', '10 mg · 15 mL', '1 × 15 mL nasal spray bottle, in carton', 'Selank, a synthetic heptapeptide, supplied as a 10 mg nasal spray in a 15 mL bottle.', '{"Format": "Nasal spray", "Volume": "15 mL", "Labelled content": "10 mg"}'::jsonb, NULL, 'Thr-Lys-Pro-Arg-Pro-Gly-Pro', NULL, NULL, 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'pending_review', '{}'::text[], false, NULL, ARRAY['catalogue/selank-10mg-1.jpg','catalogue/selank-10mg-2.jpg']::text[], 'AZ Labs Selank Nasal Spray 10 mg bottle and carton', '#5b3f9e', true),
  ('semax-nasal-spray-50mg', 'Semax Nasal Spray', 'AZ-SMX-50', 'Nasal Sprays', '50 mg · 15 mL', '1 × 15 mL nasal spray bottle, in carton', 'Semax, a synthetic heptapeptide, supplied as a 50 mg nasal spray in a 15 mL bottle.', '{"Format": "Nasal spray", "Volume": "15 mL", "Labelled content": "50 mg"}'::jsonb, NULL, 'Met-Glu-His-Phe-Pro-Gly-Pro', NULL, NULL, 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'pending_review', '{}'::text[], false, NULL, ARRAY['catalogue/semax-50mg-1.jpg','catalogue/semax-50mg-2.jpg']::text[], 'AZ Labs Semax Nasal Spray 50 mg bottle and carton', '#2f6b3a', true),
  ('simplynad-nasal-spray-500mg', 'SimplyNAD+ Nasal Spray 500 mg', 'AZ-SNAD-500', 'Nasal Sprays', '500 mg · 15 mL', '1 × 15 mL nasal spray bottle, in carton', 'Nicotinamide adenine dinucleotide (NAD+) nasal spray, 500 mg in a 15 mL bottle.', '{"Format": "Nasal spray", "Volume": "15 mL", "Labelled content": "500 mg NAD+"}'::jsonb, '53-84-9', NULL, 'C21H27N7O14P2', '663.4 g/mol', 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'pending_review', '{}'::text[], false, NULL, ARRAY['catalogue/simplynad-500mg-1.jpg','catalogue/simplynad-500mg-2.jpg']::text[], 'AZ Labs SimplyNAD+ Nasal Spray 500 mg bottle and carton', '#1f6f6a', true),
  ('simplynad-nasal-spray-1000mg', 'SimplyNAD+ Nasal Spray 1000 mg', 'AZ-SNAD-1000', 'Nasal Sprays', '1000 mg · 15 mL', '1 × 15 mL nasal spray bottle, in carton', 'Nicotinamide adenine dinucleotide (NAD+) nasal spray, 1000 mg in a 15 mL bottle.', '{"Format": "Nasal spray", "Volume": "15 mL", "Labelled content": "1000 mg NAD+"}'::jsonb, '53-84-9', NULL, 'C21H27N7O14P2', '663.4 g/mol', 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'pending_review', '{}'::text[], false, NULL, ARRAY['catalogue/simplynad-1000mg-1.jpg','catalogue/simplynad-1000mg-2.jpg']::text[], 'AZ Labs SimplyNAD+ Nasal Spray 1000 mg bottle and carton', '#1f6f6a', false),
  ('nad-plus-500mg', 'NAD+', 'AZ-NAD-500', 'Vials', '500 mg', '1 × glass vial', 'Nicotinamide adenine dinucleotide (NAD+), 500 mg, in a sealed glass vial.', '{"Format": "Vial", "Labelled content": "500 mg"}'::jsonb, '53-84-9', NULL, 'C21H27N7O14P2', '663.4 g/mol', 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'pending_review', '{}'::text[], false, NULL, ARRAY['catalogue/nad-500mg-1.jpg']::text[], 'AZ Labs NAD+ 500 mg vial', '#c8b27c', true),
  ('the-glow-pen', 'The GLOW Pen', 'AZ-GLOW', 'Pens', 'Labelled: GHK-Cu 50 mg / BPC-157 5 mg / TB-500 5 mg', '1 × reusable pen, in carton', 'Reusable pen presentation labelled as containing GHK-Cu, BPC-157 and TB-500.', '{"Format": "Reusable pen", "Labelled contents": "GHK-Cu 50 mg, BPC-157 5 mg, TB-500 5 mg"}'::jsonb, NULL, NULL, NULL, NULL, 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'pending_review', '{}'::text[], false, NULL, ARRAY['catalogue/glow-pen-1.jpg']::text[], 'AZ Labs GLOW Pen and carton', '#1f3fae', false),
  ('retatrutide-10mg', 'Retatrutide', 'AZ-RETA-10', 'Pens', '10 mg', 'Pre-filled pen', 'Restricted. Not approved for marketing or sale on this site.', '{}'::jsonb, NULL, NULL, NULL, NULL, 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'not_approved', '{}'::text[], true, 'Investigational medicine not authorised in the UK or elsewhere; the MHRA states it may only be supplied within clinical trials.', ARRAY['catalogue/retatrutide-10mg-1.jpg','catalogue/retatrutide-10mg-2.jpg']::text[], 'Retatrutide pen (restricted)', '#7cbf3c', false),
  ('tirzepatide-10mg', 'Tirzepatide', 'AZ-TIRZ-10', 'Pens', '10 mg', 'Pre-filled pen', 'Restricted. Not approved for marketing or sale on this site.', '{}'::jsonb, NULL, NULL, NULL, NULL, 'Storage conditions are stated on the pack and batch documentation.', 0, 0, false, 0, 10, 'not_approved', '{}'::text[], true, 'Prescription-only medicine in the UK. Supply requires a registered pharmacy and a prescriber, which this site does not provide.', ARRAY['catalogue/tirzepatide-10mg-1.jpg','catalogue/tirzepatide-10mg-2.jpg']::text[], 'Tirzepatide pen (restricted)', '#7cbf3c', false)
ON CONFLICT (sku) DO NOTHING;

COMMIT;
