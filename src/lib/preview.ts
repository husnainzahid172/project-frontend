import 'server-only';
import type { Product } from '@/types/product';
import { INITIAL_PRODUCTS, SHIPPING_COUNTRIES } from '@/lib/products-data';
import { requireAdmin } from '@/lib/admin-auth';
import { adminFetchProducts } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Private preview of the full store, for the owner only.
 *  - 'admin': signed-in admin on any deployment (uses the real database and images).
 *  - 'local': `next dev` on your own machine with LOCAL_PREVIEW=true (no database needed).
 * Preview never changes product data, never saves orders and is never indexed or cached.
 */
export async function getPreviewAccess(): Promise<'admin' | 'local' | null> {
  if (process.env.NODE_ENV === 'development' && process.env.LOCAL_PREVIEW === 'true') return 'local';
  if (!isSupabaseConfigured()) return null;
  return (await requireAdmin()) ? 'admin' : null;
}

export const PREVIEW_TEST_PRICE = { gbp: 10, eur: 12 };

/** Every product is shown. Unrestricted products become orderable in preview; restricted stay locked. */
export async function getPreviewProducts(access: 'admin' | 'local'): Promise<Product[]> {
  const source =
    access === 'admin'
      ? await adminFetchProducts()
      : INITIAL_PRODUCTS.map((p) => ({ ...p, image_urls: p.image_paths.map((x) => `/api/preview-image/${x.split('/').pop()}`) }));

  return source.map((p) => {
    if (p.is_restricted) return p; // stays not orderable; shown with a "Restricted" badge
    const unpriced = !(p.price_gbp > 0 && p.price_eur > 0);
    return {
      ...p,
      eligibility_status: 'approved_sale',
      eligibility_doc_ref: 'PREVIEW',
      lawful_destinations: SHIPPING_COUNTRIES.map((c) => c.code),
      price_gbp: unpriced ? PREVIEW_TEST_PRICE.gbp : p.price_gbp,
      price_eur: unpriced ? PREVIEW_TEST_PRICE.eur : p.price_eur,
      in_stock: true,
      stock_quantity: p.stock_quantity > 0 ? p.stock_quantity : 99,
    };
  });
}
