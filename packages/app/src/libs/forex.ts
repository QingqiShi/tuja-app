import escapeRegexp from 'escape-string-regexp';
import type { StocksData } from './stocksClient';

// A map for special currency cases
const currencyNormalisation: {
  [currency: string]: { normalise: (x: number) => number; target: string };
} = {
  GBX: {
    normalise: (x: number) => x / 100,
    target: 'GBP',
  },
};

/**
 * Get the forex pair that can be used to exchange currency
 */
export function getForexPair(currency: string, baseCurrency: string) {
  const normalisedCurrency =
    currency in currencyNormalisation
      ? currencyNormalisation[currency].target
      : currency;

  if (normalisedCurrency === baseCurrency) {
    return null;
  }

  return `${normalisedCurrency}${baseCurrency}.FOREX`;
}

/**
 * Convert currencies to base currency
 */
export function exchangeCurrency(
  value: number,
  currency: string,
  baseCurrency: string,
  date: Date,
  stocksData: StocksData
) {
  const normalisedValue =
    currency in currencyNormalisation
      ? currencyNormalisation[currency].normalise(value)
      : value;
  const forexPair = getForexPair(currency, baseCurrency);

  if (!forexPair) {
    return normalisedValue;
  }

  return normalisedValue * (stocksData[forexPair]?.closeSeries?.get(date) ?? 1);
}

export function formatCurrency(currency: string, value: number) {
  const normalisedValue =
    currency in currencyNormalisation
      ? currencyNormalisation[currency].normalise(value)
      : value;
  const normalisedCurrency =
    currency in currencyNormalisation
      ? currencyNormalisation[currency].target
      : currency;
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : undefined, {
    style: 'currency',
    currency: normalisedCurrency,
  }).format(normalisedValue);
}

export function parseCurrency(currency: string, source: string) {
  const parts = new Intl.NumberFormat(
    currency === 'USD' ? 'en-US' : undefined,
    { style: 'currency', currency }
  ).formatToParts(100000000);
  const groupChar = parts.find((part) => part.type === 'group')?.value ?? '';
  const currencyChar =
    parts.find((part) => part.type === 'currency')?.value ?? '';

  const raw = source
    .replace(new RegExp(escapeRegexp(groupChar), 'g'), '')
    .replace(new RegExp(escapeRegexp(currencyChar), 'g'), '')
    .trim();

  return parseFloat(raw);
}
