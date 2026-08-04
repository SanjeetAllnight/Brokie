import { useProfileStore } from '../store/useProfileStore';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

export function useCurrency() {
  const currencyCode = useProfileStore((s) => s.currency);

  const format = (amount: number, options?: { showCode?: boolean, maximumFractionDigits?: number }): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: options?.showCode ? 'code' : 'symbol',
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(amount);
  };

  return { format, currencyCode };
}
