'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types/product';
import type { ProductFormat } from '@/types/order';
import { checkPurchase } from '@/lib/eligibility';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { useStore } from '@/lib/store-context';
import { whatsappLink } from '@/lib/site-config';
import { ProductImage } from './product-image';
import { AvailabilityBadge } from './availability-badge';

/** Renders C21H27N7O14P2 with subscript counts. */
function Formula({ value }: { value: string }) {
  const parts = value.split(/(\d+)/);
  return <>{parts.map((part, i) => (/^\d+$/.test(part) && /[A-Za-z)]$/.test(parts[i - 1] ?? '') ? <sub key={i}>{part}</sub> : <span key={i}>{part}</span>))}</>;
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { format } = useCurrency();
  const { base } = useStore();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [pack, setPack] = useState<ProductFormat>('single');
  const [selectedVariationId, setSelectedVariationId] = useState<string | undefined>(
    product.variations?.[0]?.id
  );

  const selectedVariation = product.variations?.find((v) => v.id === selectedVariationId);
  const activeSku = selectedVariation?.sku ?? product.sku;
  const activeUnitSize = selectedVariation?.unit_size ?? product.unit_size;
  const rawGbp = selectedVariation ? selectedVariation.price_gbp : product.price_gbp;
  const rawEur = selectedVariation ? selectedVariation.price_eur : product.price_eur;
  const hasKit = product.kit_price_gbp != null && product.kit_price_eur != null && product.kit_price_gbp > 0;
  const isPriced = rawGbp > 0 && rawEur > 0;
  const price = isPriced
    ? pack === 'kit' && hasKit
      ? format(product.kit_price_gbp!, product.kit_price_eur!)
      : format(rawGbp, rawEur)
    : 'Contact for prices';

  const check = checkPurchase(product);
  const images = product.image_urls ?? [];

  const rows: [string, string | null | undefined][] = [
    ['SKU', activeSku],
    ['Strength / size', activeUnitSize],
    ['Pack contents', product.pack_contents],
    ...Object.entries(product.specifications ?? {}),
    ['CAS number', product.cas_number],
    ['Molecular formula', product.molecular_formula],
    ['Molecular weight', product.molecular_weight],
    ['Sequence', product.sequence],
  ];

  return (
    <div className="container-page py-10 sm:py-14">
      <Link href={`${base || ''}/#catalogue`} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50">
        <ArrowLeft className="h-4 w-4" /> Catalogue
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <ProductImage src={images[active]} alt={product.alt_text} className="rounded-2xl border border-white/10" sizes="(min-width:1024px) 50vw, 100vw" priority />
          {product.subtitle_badge && (
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/40 px-4 py-2 text-center text-sm font-medium text-emerald-300">
              {product.subtitle_badge}
            </div>
          )}
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-pressed={active === i}
                  className={`w-20 overflow-hidden rounded-lg border ${active === i ? 'border-white' : 'border-white/10 hover:border-white/30'}`}>
                  <ProductImage src={src} alt="" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">{product.category}</span>
              <AvailabilityBadge product={product} />
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{product.name}</h1>
            <p className="mt-1 text-zinc-400">{activeUnitSize}</p>
            <p className="mt-5 leading-relaxed text-zinc-200">{product.description}</p>
          </div>

          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-white/10 p-5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Available Options</label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariationId(v.id)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      selectedVariationId === v.id
                        ? 'border-emerald-500 bg-emerald-500/15 font-medium text-emerald-300'
                        : 'border-white/15 bg-white/5 text-zinc-300 hover:border-white/30'
                    }`}
                  >
                    {v.name} {v.price_gbp > 0 ? `(£${v.price_gbp})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 p-5">
            {!isPriced ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-2xl font-semibold text-zinc-50">Contact for prices</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {selectedVariation ? `${selectedVariation.name} option selected.` : ''} Enquire via WhatsApp for real-time pricing and batch availability.
                  </p>
                </div>
                <a
                  href={whatsappLink(`Hello AZ Labs, I would like to enquire about pricing for ${product.name}${selectedVariation ? ` (${selectedVariation.name})` : ''} [${activeSku}]. Please share current availability and pricing.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent inline-flex items-center gap-2 py-3 px-6"
                >
                  <MessageCircle className="h-5 w-5" /> Contact on WhatsApp for Prices
                </a>
              </div>
            ) : check.allowed ? (
              <div className="space-y-4">
                {hasKit && (
                  <div role="radiogroup" aria-label="Pack size" className="flex gap-2">
                    {(['single', 'kit'] as const).map((p) => (
                      <button key={p} role="radio" aria-checked={pack === p} onClick={() => setPack(p)}
                        className={`rounded-full border px-4 py-1.5 text-sm ${pack === p ? 'border-zinc-900 bg-white text-zinc-900' : 'border-white/10 text-zinc-300'}`}>
                        {p === 'single' ? 'Single' : '10-pack'}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="font-display text-2xl font-semibold text-zinc-50">{price}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-white/15">
                      <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-zinc-400 hover:text-zinc-50"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{qty}</span>
                      <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(product.max_per_order, q + 1))} className="p-2.5 text-zinc-400 hover:text-zinc-50"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button className="btn-accent" onClick={() => addItem(product.id, qty, pack, selectedVariationId)}>Add to cart</button>
                    <a
                      href={whatsappLink(`Hello AZ Labs, I would like to order: ${product.name}${selectedVariation ? ` (${selectedVariation.name})` : ''}${pack === 'kit' ? ' (10-pack)' : ''} [${activeSku}] × ${qty} for ${price}. Please confirm availability and delivery.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary inline-flex items-center gap-1.5"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp Order
                    </a>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Delivers to: {product.lawful_destinations.join(', ')}. Shipping calculated at checkout.</p>
              </div>
            ) : check.reason === 'marketing_only' ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-2xl font-semibold text-zinc-50">{price}</p>
                  <p className="text-sm text-zinc-300">{check.message}</p>
                </div>
                <a className="btn-secondary" target="_blank" rel="noopener noreferrer"
                  href={whatsappLink(`Hello AZ Labs, I have a question about ${product.name} (${activeSku}).`)}>
                  <MessageCircle className="h-4 w-4" /> Ask a question
                </a>
              </div>
            ) : (
              <div className="text-sm text-zinc-300">
                <p>{check.message}</p>
                {product.is_restricted && product.restriction_reason && <p className="mt-2 text-xs text-zinc-400">{product.restriction_reason}</p>}
              </div>
            )}
          </div>

          <dl className="divide-y divide-white/[0.06] rounded-2xl border border-white/10 text-sm">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
                <dt className="text-zinc-400">{k}</dt>
                <dd className={`break-words text-zinc-50 ${['Sequence', 'CAS number', 'SKU'].includes(k) ? 'font-mono text-[12.5px]' : ''}`}>
                  {k === 'Molecular formula' ? <Formula value={v as string} /> : v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
