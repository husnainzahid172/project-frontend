'use client';

import { MessageCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { unitPrice, formatMoney } from '@/lib/pricing';
import { buildCartQuickOrderWhatsappUrl } from '@/lib/whatsapp';

export function CartDrawer() {
  const { lines, updateQuantity, removeItem, isCartOpen, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const { currency } = useCurrency();

  const subtotal = lines.reduce((a, l) => a + (unitPrice(l.product, l.format, currency, l.variationId) ?? 0) * l.quantity, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col border-white/10 bg-card p-0 sm:max-w-md">
        <SheetHeader className="border-b border-white/10 px-6 py-5 text-left">
          <SheetTitle className="font-display text-lg text-zinc-50">Cart</SheetTitle>
          <SheetDescription className="text-sm text-zinc-400">
            {lines.length ? 'Send your cart directly to our team on WhatsApp or checkout with delivery details.' : 'Your cart is empty.'}
          </SheetDescription>
        </SheetHeader>

        <ul className="flex-1 divide-y divide-white/[0.06] overflow-y-auto px-6">
          {lines.map((l) => {
            const price = unitPrice(l.product, l.format, currency, l.variationId) ?? 0;
            return (
              <li key={`${l.productId}-${l.format}-${l.variationId ?? ''}`} className="flex gap-4 py-5">
                <span className="mt-1 h-10 w-1 shrink-0 rounded-full" style={{ background: l.product.cap_color ?? '#10b981' }} aria-hidden />
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-50">
                      {l.product.name}
                      {l.variationName && <span className="text-emerald-400"> ({l.variationName})</span>}
                      {l.format === 'kit' && <span className="text-zinc-400"> · 10-pack</span>}
                    </p>
                    <p className="text-sm tabular-nums text-zinc-100">{formatMoney(price * l.quantity, currency)}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{l.variationName ? l.variationName : l.product.unit_size}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-white/15">
                      <button aria-label="Decrease" onClick={() => updateQuantity(l.productId, l.format, l.quantity - 1, l.variationId)} className="p-1.5 text-zinc-300 hover:text-zinc-50"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-7 text-center text-sm tabular-nums">{l.quantity}</span>
                      <button aria-label="Increase" onClick={() => updateQuantity(l.productId, l.format, l.quantity + 1, l.variationId)} disabled={l.quantity >= l.product.max_per_order} className="p-1.5 text-zinc-300 hover:text-zinc-50 disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => removeItem(l.productId, l.format, l.variationId)} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {lines.length > 0 && (
          <div className="space-y-3 border-t border-white/10 px-6 py-5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Subtotal</span>
              <span className="font-medium tabular-nums text-zinc-50">{formatMoney(subtotal, currency)}</span>
            </div>

            <a
              href={buildCartQuickOrderWhatsappUrl(lines, currency)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent flex w-full items-center justify-center gap-2 py-3"
            >
              <MessageCircle className="h-4 w-4" /> Quick Order on WhatsApp
            </a>

            <button
              className="btn-secondary w-full"
              onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
            >
              Add Delivery Details &amp; Quote
            </button>
            <p className="text-center text-[11px] text-zinc-400">
              Orders are confirmed directly on WhatsApp with our UK desk.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
