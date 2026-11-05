'use client';

import Link from 'next/link';
import type { Product } from '@/types/product';
import { ProductImage } from './product-image';
import { AvailabilityBadge } from './availability-badge';
import { useCurrency } from '@/lib/currency-context';
import { useStore } from '@/lib/store-context';

export function ProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const { base } = useStore();
  const priced = product.price_gbp > 0 && product.price_eur > 0;
  return (
    <Link
      href={`${base}/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
    >
      <ProductImage src={product.image_urls?.[0]} alt={product.alt_text} className="transition-transform duration-500 group-hover:scale-[1.015]" />
      {product.subtitle_badge && (
        <div className="border-y border-emerald-500/20 bg-emerald-950/40 px-3 py-1.5 text-center text-xs font-medium text-emerald-300">
          {product.subtitle_badge}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 border-t border-white/[0.06] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">{product.category}</span>
          <AvailabilityBadge product={product} />
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-zinc-50">{product.name}</h3>
        <p className="text-sm text-zinc-400">{product.unit_size}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="font-display text-base font-semibold text-zinc-50">{priced ? format(product.price_gbp, product.price_eur) : 'Price on request'}</p>
          <span className="text-sm text-zinc-400 group-hover:text-zinc-50">View →</span>
        </div>
      </div>
    </Link>
  );
}
