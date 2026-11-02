export type ProductEligibilityStatus =
  | 'pending_review'
  | 'approved_marketing'
  | 'approved_sale'
  | 'not_approved';

export const PRODUCT_ELIGIBILITY_STATUSES: ProductEligibilityStatus[] = [
  'pending_review',
  'approved_marketing',
  'approved_sale',
  'not_approved',
];

export function getEligibilityStatus(
  status?: ProductEligibilityStatus | null
): ProductEligibilityStatus {
  return status ?? 'pending_review';
}

export function isPubliclyVisible(status?: ProductEligibilityStatus | null): boolean {
  const resolved = getEligibilityStatus(status);
  return resolved === 'approved_marketing' || resolved === 'approved_sale';
}

export function isOrderable(status?: ProductEligibilityStatus | null): boolean {
  return getEligibilityStatus(status) === 'approved_sale';
}

export function eligibilityLabel(status?: ProductEligibilityStatus | null): string {
  return getEligibilityStatus(status).replaceAll('_', ' ');
}
