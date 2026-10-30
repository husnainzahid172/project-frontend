'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'GBP' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceGbp: number, priceEur: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('GBP');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('az_labs_currency') as Currency;
      if (saved === 'GBP' || saved === 'EUR') {
        setCurrencyState(saved);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('az_labs_currency', c);
    } catch {
      // ignore
    }
  };

  const currencySymbol = currency === 'EUR' ? '€' : '£';

  const formatPrice = (priceGbp: number, priceEur: number): string => {
    const val = currency === 'EUR' ? priceEur : priceGbp;
    return `${currencySymbol}${val.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, currencySymbol }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
