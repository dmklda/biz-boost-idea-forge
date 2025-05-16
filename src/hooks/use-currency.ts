import { useState, useEffect } from 'react';

type CurrencyConfig = {
  symbol: string;
  code: string;
  position: 'before' | 'after';
};

const currencyConfigs: Record<string, CurrencyConfig> = {
  USD: { symbol: '$', code: 'USD', position: 'before' },
  EUR: { symbol: '€', code: 'EUR', position: 'after' },
  BRL: { symbol: '$', code: 'USD', position: 'before' },
  AOA: { symbol: 'Kz', code: 'AOA', position: 'before' },
  JPY: { symbol: '¥', code: 'JPY', position: 'before' }
};

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyConfig>(currencyConfigs.USD);

  useEffect(() => {
    const detectCurrency = () => {
      const userLocale = navigator.language;
      const currencyMap: Record<string, keyof typeof currencyConfigs> = {
        'en': 'USD',
        'pt-BR': 'USD',
        'pt-AO': 'USD',
        'pt-PT': 'USD',
        'ja': 'JPY',
        'en-US': 'USD',
        'en-GB': 'EUR',
        'es': 'EUR',
      };
      
      const detectedCurrency = currencyMap[userLocale] || 'USD';
      setCurrency(currencyConfigs[detectedCurrency]);
    };

    detectCurrency();
  }, []);

  const formatPrice = (amount: number): string => {
    const formatted = new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    return formatted;
  };

  return { currency, formatPrice };
}
