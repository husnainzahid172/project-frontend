'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { ProductFilterState } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/lib/products-data';
import { checkPurchase } from '@/lib/eligibility';
import { useCart } from '@/lib/cart-context';
import { ProductCard } from './product-card';

const INITIAL: ProductFilterState = { searchQuery: '', category: 'All', availableOnly: false, sortBy: 'featured' };

export function ProductGrid() {
  const { products } = useCart();
  const [f, setF] = useState<ProductFilterState>(INITIAL);

  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    const ordered = [...PRODUCT_CATEGORIES.filter((c) => present.has(c)), ...[...present].filter((c) => !(PRODUCT_CATEGORIES as readonly string[]).includes(c))];
    return ['All', ...ordered];
  }, [products]);

  const visible = useMemo(() => {
    const q = f.searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (f.category !== 'All' && p.category !== f.category) return false;
      if (f.availableOnly && !checkPurchase(p).allowed) return false;
      if (!q) return true;
      return [p.name, p.sku, p.cas_number ?? '', p.category, p.description, p.unit_size].some((s) => s.toLowerCase().includes(q));
    });
    const price = (x: typeof list[number]) => (x.price_gbp > 0 ? x.price_gbp : Number.POSITIVE_INFINITY);
    return [...list].sort((a, b) => {
      if (a.is_restricted !== b.is_restricted) return a.is_restricted ? 1 : -1;
      switch (f.sortBy) {
        case 'price-asc': return price(a) - price(b);
        case 'price-desc': return price(b) === Infinity ? -1 : price(a) === Infinity ? 1 : price(b) - price(a);
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name);
      }
    });
  }, [products, f]);

  return (
    <section id="catalogue" className="scroll-mt-20 py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Products</h2>
          </div>
          {products.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
              <label htmlFor="catalogue-search" className="sr-only">Search products</label>
              <input id="catalogue-search" type="search" value={f.searchQuery} onChange={(e) => setF({ ...f, searchQuery: e.target.value })} placeholder="Search name or SKU" className="field rounded-full pl-10" />
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-zinc-50">No products yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-300">
              Products are published here once their documentation has been verified. For questions in the meantime, contact us.
            </p>
            <a href="#contact" className="btn-secondary mt-6">Contact us</a>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Categories">
                {categories.map((c) => (
                  <button key={c} role="tab" aria-selected={f.category === c} onClick={() => setF({ ...f, category: c })}
                    className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${f.category === c ? 'border-zinc-900 bg-white text-zinc-900' : 'border-white/10 text-zinc-300 hover:border-white/15 hover:text-zinc-50'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-5 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-zinc-300">
                  <input type="checkbox" checked={f.availableOnly} onChange={(e) => setF({ ...f, availableOnly: e.target.checked })} className="h-4 w-4 accent-emerald-500" />
                  Available to order
                </label>
                <label className="sr-only" htmlFor="sort">Sort</label>
                <select id="sort" value={f.sortBy} onChange={(e) => setF({ ...f, sortBy: e.target.value as ProductFilterState['sortBy'] })}
                  className="h-9 rounded-full border border-white/10 bg-card px-3 text-zinc-200 focus:border-emerald-500 focus:outline-none">
                  <option value="featured">Featured</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </div>
            </div>
            {visible.length ? (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="mt-16 flex flex-col items-center text-center">
                <p className="text-zinc-300">No products match your filters.</p>
                <button onClick={() => setF(INITIAL)} className="btn-secondary mt-4 h-9 px-4"><X className="h-4 w-4" /> Clear filters</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
