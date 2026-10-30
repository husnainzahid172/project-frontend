'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { ProductFormat } from '@/types/order';
import { ProductImage } from './product-image';
import { useCurrency } from '@/lib/currency-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Plus, Minus, Check, Package, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const [format, setFormat] = useState<ProductFormat>('single');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isKit = format === 'kit';
  const unitPriceGbp = isKit && product.kit_price_gbp ? product.kit_price_gbp : product.price_gbp;
  const unitPriceEur = isKit && product.kit_price_eur ? product.kit_price_eur : product.price_eur;

  const handleAdd = () => {
    addItem(product, quantity, format);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < Math.min(product.max_per_order, product.stock_quantity)) {
      setQuantity((q) => q + 1);
    }
  };

  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-850/80 bg-zinc-950 p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      {/* Top Meta Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 font-medium">
              {product.sku}
            </span>
            {product.purity && (
              <span className="font-mono text-[10px] text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {product.purity.split(' ')[0]}
              </span>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 font-mono ${
              product.in_stock
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                : 'border-zinc-700 text-zinc-400 bg-zinc-900'
            }`}
          >
            {product.in_stock ? 'In Stock' : 'Reserve'}
          </Badge>
        </div>

        {/* Product Photograph / Visual Slot */}
        <div
          className="cursor-pointer relative overflow-hidden rounded-lg"
          onClick={() => onQuickView(product)}
        >
          <ProductImage
            src={product.image_url}
            alt={product.alt_text}
            category={product.category}
            capColor={product.cap_color}
            sku={product.sku}
            aspectRatio="square"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <Button
              variant="secondary"
              size="sm"
              className="bg-zinc-900/95 hover:bg-emerald-600 hover:text-white text-zinc-200 border border-zinc-700 text-xs gap-1.5 shadow-xl font-mono"
            >
              <Eye className="h-3.5 w-3.5" />
              View HPLC & CoA
            </Button>
          </div>
        </div>

        {/* Product Information */}
        <div className="mt-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 flex items-center gap-1">
            <span>{product.category}</span>
          </div>
          <h3
            className="font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1 cursor-pointer text-base"
            onClick={() => onQuickView(product)}
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.grade} • {product.unit_size}
          </p>
        </div>

        {/* Format Selector: Single Vial vs 10-Vial Kit Box (like Vitralab Research) */}
        {product.kit_price_gbp && (
          <div className="mt-3 grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFormat('single')}
              className={`py-1.5 px-2 rounded text-center transition-all ${
                format === 'single'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Single Vial
            </button>
            <button
              type="button"
              onClick={() => setFormat('kit')}
              className={`py-1.5 px-2 rounded text-center transition-all relative ${
                format === 'kit'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              10-Vial Kit
              <span className="absolute -top-1.5 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Pricing & Interactive Add Controls */}
      <div className="mt-4 pt-3 border-t border-zinc-900/80 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">
              {formatPrice(unitPriceGbp, unitPriceEur)}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-mono">
              {isKit ? '/ 10-Vial Box' : '/ Vial'}
            </span>
          </div>
          {isKit ? (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60 font-semibold flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Save 20%
            </span>
          ) : (
            <span className="text-[11px] font-mono text-zinc-400">
              ex. VAT
            </span>
          )}
        </div>

        {/* Quantity Controls & Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/70 p-0.5">
            <button
              onClick={decrement}
              disabled={quantity <= 1}
              className="h-8 w-7 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center font-mono text-xs font-semibold text-zinc-200">
              {quantity}
            </span>
            <button
              onClick={increment}
              disabled={quantity >= Math.min(product.max_per_order, product.stock_quantity)}
              className="h-8 w-7 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <Button
            onClick={handleAdd}
            disabled={!product.in_stock}
            className={`flex-1 h-9 text-xs font-medium transition-all duration-300 gap-1.5 ${
              justAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                {isKit ? 'Add Kit' : 'Add Vial'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
