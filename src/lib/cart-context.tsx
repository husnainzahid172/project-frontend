'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { CartItem, ProductFormat } from '@/types/order';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, format?: ProductFormat) => void;
  removeItem: (productId: string, format?: ProductFormat) => void;
  updateQuantity: (productId: string, quantity: number, format?: ProductFormat) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalGbp: number;
  subtotalEur: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('az_labs_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('az_labs_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  const addItem = (product: Product, quantity = 1, format: ProductFormat = 'single') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.format === format
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(
          existing.quantity + quantity,
          product.max_per_order,
          product.stock_quantity
        );
        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.max_per_order, product.stock_quantity);
        return [
          ...prev,
          {
            product: {
              id: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              grade: product.grade,
              purity: product.purity,
              unit_size: product.unit_size,
              price_gbp: product.price_gbp,
              price_eur: product.price_eur,
              kit_price_gbp: product.kit_price_gbp,
              kit_price_eur: product.kit_price_eur,
              in_stock: product.in_stock,
              stock_quantity: product.stock_quantity,
              max_per_order: product.max_per_order,
              cap_color: product.cap_color,
              image_url: product.image_url,
              alt_text: product.alt_text,
              lawful_destinations: product.lawful_destinations,
            },
            format,
            quantity: initialQty,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, format: ProductFormat = 'single') => {
    setItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.format === format))
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    format: ProductFormat = 'single'
  ) => {
    if (quantity <= 0) {
      removeItem(productId, format);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.format === format) {
          const clamped = Math.min(
            quantity,
            item.product.max_per_order,
            item.product.stock_quantity
          );
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotalGbp = items.reduce((acc, item) => {
    const unitPrice =
      item.format === 'kit' && item.product.kit_price_gbp
        ? item.product.kit_price_gbp
        : item.product.price_gbp;
    return acc + unitPrice * item.quantity;
  }, 0);

  const subtotalEur = items.reduce((acc, item) => {
    const unitPrice =
      item.format === 'kit' && item.product.kit_price_eur
        ? item.product.kit_price_eur
        : item.product.price_eur;
    return acc + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotalGbp,
        subtotalEur,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
