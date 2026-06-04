import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  rate: number; // Rate relative to USD (mock)
};

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'BDT', symbol: '৳', rate: 110 },
];

interface CurrencyContextType {
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  formatPrice: (priceInEur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[1]); // EUR is at index 1

  const setCurrency = useCallback((code: string) => {
    const currency = currencies.find(c => c.code === code);
    if (currency) {
      setCurrentCurrency(currency);
    }
  }, []);

  const formatPrice = useCallback((priceInEur: number) => {
    const eurRate = currencies.find(c => c.code === 'EUR')?.rate || 0.92;
    let convertedPrice = priceInEur;
    if (currentCurrency.code !== 'EUR') {
      convertedPrice = (priceInEur / eurRate) * currentCurrency.rate;
    }
    return `${currentCurrency.symbol}${convertedPrice.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }, [currentCurrency]);

  const value = React.useMemo(() => ({ 
    currentCurrency, 
    setCurrency, 
    formatPrice 
  }), [currentCurrency, setCurrency, formatPrice]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
