-- Catalogue eligibility is deliberately separate from inventory.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS eligibility_status TEXT NOT NULL DEFAULT 'pending_review';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_eligibility_status_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_eligibility_status_check CHECK (
    eligibility_status IN ('pending_review', 'approved_marketing', 'approved_sale', 'not_approved')
  );

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read approved products"
  ON public.products
  FOR SELECT
  USING (eligibility_status IN ('approved_marketing', 'approved_sale'));

CREATE INDEX IF NOT EXISTS idx_products_eligibility_status
  ON public.products(eligibility_status);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read own profile" ON public.admin_profiles;
CREATE POLICY "Admins read own profile"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
