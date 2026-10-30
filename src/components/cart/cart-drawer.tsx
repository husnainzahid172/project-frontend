'use client';

import React from 'react';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Package,
  MessageCircle,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotalGbp,
    subtotalEur,
    itemCount,
    setIsCheckoutOpen,
  } = useCart();
  const { currency, formatPrice } = useCurrency();

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 p-0 flex flex-col justify-between">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-zinc-900 bg-zinc-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <SheetTitle className="text-lg font-bold text-white font-sans">
                Peptide Order Cart
              </SheetTitle>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </SheetHeader>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-white text-base">Your cart is empty</h3>
              <p className="text-xs text-zinc-400 max-w-xs mt-1">
                Explore our high-purity research peptides (BPC-157, TB-500, GLP3-RT, GHK-Cu, NAD+) in single vials or 10-vial kits.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-zinc-800 text-zinc-200 hover:bg-zinc-900 text-xs"
                onClick={() => setIsCartOpen(false)}
              >
                Browse Peptide Catalogue
              </Button>
            </div>
          ) : (
            items.map(({ product, format, quantity }) => {
              const isKit = format === 'kit';
              const unitPriceGbp =
                isKit && product.kit_price_gbp ? product.kit_price_gbp : product.price_gbp;
              const unitPriceEur =
                isKit && product.kit_price_eur ? product.kit_price_eur : product.price_eur;

              return (
                <div
                  key={`${product.id}-${format}`}
                  className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                          {product.sku}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono px-1.5 py-0 ${
                            isKit
                              ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40'
                              : 'border-zinc-700 text-zinc-400 bg-zinc-900'
                          }`}
                        >
                          {isKit ? '10-Vial Kit Box' : 'Single Vial'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm text-zinc-100 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {product.unit_size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id, format)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1, format)}
                        className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-mono text-xs font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1, format)}
                        disabled={quantity >= Math.min(product.max_per_order, product.stock_quantity)}
                        className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white">
                        {formatPrice(unitPriceGbp * quantity, unitPriceEur * quantity)}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {formatPrice(unitPriceGbp, unitPriceEur)} each
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-900 bg-zinc-950 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal (Peptides):</span>
                <span className="font-mono text-zinc-200 font-semibold">
                  {formatPrice(subtotalGbp, subtotalEur)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tracked UK / EU Cold-Chain:</span>
                <span className="font-mono text-zinc-400">Calculated at checkout</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-2 text-[11px] text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Direct WhatsApp integration connects directly to +44 7448 399290.</span>
            </div>

            <Button
              onClick={handleProceedCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-2 text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Proceed & Place Order on WhatsApp</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
