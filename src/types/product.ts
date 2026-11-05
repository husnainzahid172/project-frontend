/**
 * Regulatory status of a product. Source of truth: written documentation (see docs/ELIGIBILITY.md).
 *
 * - pending_review     : default. Admin-only. Not shown publicly, cannot be ordered.
 * - approved_marketing : documentation permits public listing/promotion. Shown publicly, cannot be ordered.
 * - approved_sale      : documentation permits sale to the listed destinations. Shown and orderable.
 * - not_approved       : sale and promotion ruled out. Admin-only.
 */
export type EligibilityStatus = 'pending_review' | 'approved_marketing' | 'approved_sale' | 'not_approved';

export const ELIGIBILITY_STATUSES: EligibilityStatus[] = ['pending_review', 'approved_marketing', 'approved_sale', 'not_approved'];

export const ELIGIBILITY_LABEL: Record<EligibilityStatus, string> = {
  pending_review: 'Pending review',
  approved_marketing: 'Approved for marketing',
  approved_sale: 'Approved for sale',
  not_approved: 'Not approved',
};

export interface ProductVariation {
  id: string;
  name: string;
  unit_size: string;
  sku: string;
  price_gbp: number;
  price_eur: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  /** Strength/size as printed on the pack, e.g. "10 mg · 15 mL". */
  unit_size: string;
  /** Variations if product has multiple sizes (e.g. 500mg vs 1000mg). */
  variations?: ProductVariation[];
  /** Subtitle note shown under the image, e.g. "(available in 500/1000 MG)". */
  subtitle_badge?: string | null;
  /** What is physically in the pack, e.g. "1 spray bottle (15 mL) in carton". */
  pack_contents?: string | null;
  /** Neutral, factual description. No therapeutic or medicinal claims. */
  description: string;
  specifications: Record<string, string>;
  cas_number?: string | null;
  sequence?: string | null;
  molecular_formula?: string | null;
  molecular_weight?: string | null;
  storage_notes?: string | null;

  /** 0 means "not priced yet". A product must have both prices > 0 to be approved for sale. */
  price_gbp: number;
  price_eur: number;
  kit_price_gbp?: number | null;
  kit_price_eur?: number | null;
  in_stock: boolean;
  stock_quantity: number;
  max_per_order: number;

  // ---- Regulatory status ----
  eligibility_status: EligibilityStatus;
  eligibility_doc_ref?: string | null;
  eligibility_conditions?: string | null;
  lawful_destinations: string[];
  /**
   * Hard lock for products that cannot be promoted or sold through this site
   * (unauthorised or prescription-only medicines). Set only via SQL, never via the admin UI.
   */
  is_restricted: boolean;
  restriction_reason?: string | null;

  // ---- Batch documentation (genuine documents only) ----
  coa_batch?: string | null;
  coa_date?: string | null;
  coa_url?: string | null;
  sds_url?: string | null;

  // ---- Images ----
  /** Paths in the private `product-images` storage bucket. First = primary. */
  image_paths: string[];
  /** Resolved at request time (signed URLs). Never stored. */
  image_urls?: string[];
  alt_text: string;
  cap_color?: string | null;

  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilterState {
  searchQuery: string;
  category: string;
  availableOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
}
