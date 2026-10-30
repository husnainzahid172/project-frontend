'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '@/types/product';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';
import { ELIGIBLE_COUNTRIES } from '@/lib/products-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Globe2,
  Sparkles,
  Dna,
} from 'lucide-react';

interface ProductGridProps {
  initialProducts: Product[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [destinationFilter, setDestinationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchCas = product.cas_number?.toLowerCase().includes(q) || false;
          const matchGrade = product.grade.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchSeq = product.sequence?.toLowerCase().includes(q) || false;
          if (!matchName && !matchSku && !matchCas && !matchGrade && !matchDesc && !matchSeq) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && product.category !== selectedCategory) {
          return false;
        }

        // In-stock filter
        if (inStockOnly && !product.in_stock) {
          return false;
        }

        // Destination eligibility filter
        if (destinationFilter !== 'ALL' && !product.lawful_destinations.includes(destinationFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price_gbp - b.price_gbp;
        if (sortBy === 'price-desc') return b.price_gbp - a.price_gbp;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        // Featured default: featured first, then name
        if (a.is_featured === b.is_featured) return a.name.localeCompare(b.name);
        return a.is_featured ? -1 : 1;
      });
  }, [products, searchQuery, selectedCategory, inStockOnly, destinationFilter, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    inStockOnly ||
    destinationFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setInStockOnly(false);
    setDestinationFilter('ALL');
    setSortBy('featured');
  };

  return (
    <section id="catalogue" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Certified Research Peptides • In-Vitro Scientific Use
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Peptide Research Catalogue
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            Ultra-pure lyophilized peptide sequences, incretin receptor co-agonists, and tissue repair models. Available in single vials and 10-vial research kit boxes with verified batch Certificates of Analysis (COAs).
          </p>
        </div>

        {/* 10-Vial Kit Callout Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-emerald-900/40 text-xs font-mono self-start md:self-auto shadow-sm">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-zinc-300">10-Vial Kit Boxes:</span>
          <span className="text-emerald-400 font-bold">20% Bundle Savings</span>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search peptide (e.g. BPC-157, TB-500, GLP3-RT, GHK-Cu, CAS #)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Destination Territory Filter */}
          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full h-10 appearance-none bg-zinc-950/80 border border-zinc-800 rounded-md px-3 pl-8 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Eligible Territories (UK & EU)</option>
                {ELIGIBLE_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <Globe2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-10 appearance-none bg-zinc-950/80 border border-zinc-800 rounded-md px-3 pl-8 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="featured">Sort: Featured Peptides</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
                <option value="name-asc">Sort: Name (A-Z)</option>
              </select>
              <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {category}
            </button>
          ))}

          {/* In Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`whitespace-nowrap ml-auto px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
              inStockOnly
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                inStockOnly ? 'bg-emerald-400' : 'bg-zinc-600'
              }`}
            />
            In-Stock Ready
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setActiveModalProduct(p)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800 text-zinc-500">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">No matching peptides found</h3>
          <p className="mt-1 text-sm text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing category filters, or selecting all eligible territories.
          </p>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-6 border-zinc-800 hover:bg-zinc-900 text-zinc-300 gap-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      )}

      {/* Specifications / CoA Modal */}
      <ProductModal
        product={activeModalProduct}
        isOpen={!!activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </section>
  );
}
