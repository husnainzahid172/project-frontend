import type { Product } from '@/types/product';

export type PurchaseCheck =
  | { allowed: true }
  | { allowed: false; reason: 'restricted' | 'not_listed' | 'marketing_only' | 'no_document' | 'destination' | 'price' | 'stock'; message: string };

type Fields = Pick<
  Product,
  'eligibility_status' | 'eligibility_doc_ref' | 'lawful_destinations' | 'in_stock' | 'stock_quantity' | 'is_restricted' | 'price_gbp' | 'price_eur'
>;

const hasDoc = (p: Pick<Product, 'eligibility_doc_ref'>) => Boolean(p.eligibility_doc_ref && p.eligibility_doc_ref.trim());

/** May the product appear on the public site at all? */
export function isPubliclyListed(p: Pick<Product, 'eligibility_status' | 'is_restricted' | 'eligibility_doc_ref'>): boolean {
  if (p.is_restricted) return false;
  return (p.eligibility_status === 'approved_marketing' || p.eligibility_status === 'approved_sale') && hasDoc(p);
}

/**
 * May the product be ordered (optionally to a given destination)?
 * Single source of truth for the UI, the order API and (mirrored) the database constraint.
 */
export function checkPurchase(p: Fields, destination?: string | null): PurchaseCheck {
  if (p.is_restricted) return { allowed: false, reason: 'restricted', message: 'This product is not available.' };
  if (!isPubliclyListed(p)) return { allowed: false, reason: 'not_listed', message: 'This product is not available.' };
  if (p.eligibility_status === 'approved_marketing') {
    return { allowed: false, reason: 'marketing_only', message: 'Not available to order online. Contact us for details.' };
  }
  if (!hasDoc(p)) return { allowed: false, reason: 'no_document', message: 'This product is not available.' };
  if (!p.lawful_destinations?.length) return { allowed: false, reason: 'destination', message: 'Not currently available in any destination.' };
  if (destination && !p.lawful_destinations.includes(destination.toUpperCase())) {
    return { allowed: false, reason: 'destination', message: 'Not available for delivery to the selected country.' };
  }
  if (!(p.price_gbp > 0) || !(p.price_eur > 0)) return { allowed: false, reason: 'price', message: 'Price not yet set.' };
  if (!p.in_stock || p.stock_quantity <= 0) return { allowed: false, reason: 'stock', message: 'Out of stock.' };
  return { allowed: true };
}

/** Validation for an admin status change. Returns an error message, or null if allowed. */
export function validateStatusChange(next: Fields): string | null {
  if (next.is_restricted && next.eligibility_status !== 'not_approved' && next.eligibility_status !== 'pending_review') {
    return 'This product is locked as a restricted medicine and cannot be approved for marketing or sale on this site.';
  }
  if ((next.eligibility_status === 'approved_marketing' || next.eligibility_status === 'approved_sale') && !hasDoc(next)) {
    return 'Add the documentation reference before approving.';
  }
  if (next.eligibility_status === 'approved_sale') {
    if (!next.lawful_destinations?.length) return 'Select at least one destination named in the documentation.';
    if (!(next.price_gbp > 0) || !(next.price_eur > 0)) return 'Set GBP and EUR prices before approving for sale.';
  }
  return null;
}
