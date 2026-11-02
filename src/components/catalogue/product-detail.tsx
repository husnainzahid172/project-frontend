'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductImage } from './product-image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { isOrderable } from '@/lib/eligibility';

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const orderable = isOrderable(product.eligibility_status);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/#catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <ProductImage src={product.image_url} alt={product.alt_text} category={product.category} capColor={product.cap_color} sku={product.sku} aspectRatio="square" />
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">{product.category}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{product.name}</h1>
            <p className="mt-4 leading-7 text-zinc-400">{product.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-zinc-800 p-3"><span className="text-zinc-500">SKU</span><div className="mt-1 font-mono text-emerald-400">{product.sku}</div></div>
              <div className="rounded-lg border border-zinc-800 p-3"><span className="text-zinc-500">Purity</span><div className="mt-1 text-white">{product.purity ?? 'Not listed'}</div></div>
            </div>
            <div className="mt-8 flex items-center justify-between border-y border-zinc-800 py-5">
              <span className="text-2xl font-semibold text-white">{formatPrice(product.price_gbp, product.price_eur)}</span>
              <Button disabled={!orderable || !product.in_stock} onClick={() => addItem(product)} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                <ShoppingCart className="h-4 w-4" /> {orderable ? 'Add to cart' : 'Not approved for sale'}
              </Button>
            </div>
            <div className="mt-8">
              <h2 className="font-semibold text-white">Technical specifications</h2>
              <dl className="mt-3 divide-y divide-zinc-800 border-y border-zinc-800">
                {Object.entries(product.specifications).map(([key, value]) => <div key={key} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-zinc-500">{key}</dt><dd className="text-right text-zinc-200">{value}</dd></div>)}
              </dl>
            </div>
            <p className="mt-6 text-xs leading-5 text-zinc-500">{product.safety_notes}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
