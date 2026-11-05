'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import type { CartItem, ProductFormat } from '@/types/order';
import { checkPurchase } from '@/lib/eligibility';

export interface ResolvedCartLine extends CartItem {
  product: Product;
  variationName?: string;
}

interface CartContextType {
  products: Product[];
  lines: ResolvedCartLine[];
  addItem: (productId: string, quantity?: number, format?: ProductFormat, variationId?: string) => boolean;
  updateQuantity: (productId: string, format: ProductFormat, quantity: number, variationId?: string) => void;
  removeItem: (productId: string, format: ProductFormat, variationId?: string) => void;
  clearCart: () => void;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const KEY = 'az_labs_cart_v2';

export function CartProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Load saved cart, dropping anything that no longer exists or is no longer purchasable.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const saved: CartItem[] = raw ? JSON.parse(raw) : [];
      setItems(
        saved.filter(
          (i) => i && typeof i.productId === 'string' && byId.has(i.productId) && checkPurchase(byId.get(i.productId)!).allowed
        )
      );
    } catch {}
    setLoaded(true);
  }, [byId]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, loaded]);

  const clamp = (p: Product, q: number) => Math.max(0, Math.min(q, p.max_per_order, p.stock_quantity));

  const addItem = useCallback(
    (productId: string, quantity = 1, format: ProductFormat = 'single', variationId?: string) => {
      const p = byId.get(productId);
      if (!p || !checkPurchase(p).allowed) return false;
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.productId === productId && i.format === format && (i.variationId ?? '') === (variationId ?? ''));
        if (idx === -1) return [...prev, { productId, format, quantity: clamp(p, quantity), variationId }];
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: clamp(p, next[idx].quantity + quantity) };
        return next;
      });
      setIsCartOpen(true);
      return true;
    },
    [byId]
  );

  const removeItem = useCallback((productId: string, format: ProductFormat, variationId?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.format === format && (i.variationId ?? '') === (variationId ?? ''))));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, format: ProductFormat, quantity: number, variationId?: string) => {
      const p = byId.get(productId);
      if (!p || quantity <= 0) return removeItem(productId, format, variationId);
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.format === format && (i.variationId ?? '') === (variationId ?? '')
            ? { ...i, quantity: clamp(p, quantity) }
            : i
        )
      );
    },
    [byId, removeItem]
  );

  const lines: ResolvedCartLine[] = items
    .filter((i) => byId.has(i.productId))
    .map((i) => {
      const p = byId.get(i.productId)!;
      const variation = i.variationId && p.variations ? p.variations.find((v) => v.id === i.variationId) : undefined;
      return {
        ...i,
        product: p,
        variationName: variation?.name,
      };
    });

  const value: CartContextType = {
    products,
    lines,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: () => setItems([]),
    itemCount: lines.reduce((a, l) => a + l.quantity, 0),
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
