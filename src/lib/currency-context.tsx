'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Currency } from '@/types/order';
import { formatMoney } from '@/lib/pricing';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (gbp: number, eur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const KEY = 'az_labs_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('GBP');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'GBP' || saved === 'EUR') setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem(KEY, c); } catch {}
  };

  const format = (gbp: number, eur: number) => formatMoney(currency === 'EUR' ? eur : gbp, currency);

  return <CurrencyContext.Provider value={{ currency, setCurrency, format }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
