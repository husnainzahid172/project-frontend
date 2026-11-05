import type { Product } from '@/types/product';
import { checkPurchase } from '@/lib/eligibility';

export function AvailabilityBadge({ product }: { product: Product }) {
  const check = checkPurchase(product);
  const [dot, text, label] = check.allowed
    ? ['bg-emerald-600', 'text-emerald-400', 'Available']
    : check.reason === 'marketing_only'
      ? ['bg-zinc-400', 'text-zinc-300', 'Enquire']
      : check.reason === 'restricted'
        ? ['bg-zinc-400', 'text-zinc-300', 'Restricted']
      : check.reason === 'stock'
        ? ['bg-zinc-300', 'text-zinc-400', 'Out of stock']
        : ['bg-zinc-300', 'text-zinc-400', 'Unavailable'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden /> {label}
    </span>
  );
}
