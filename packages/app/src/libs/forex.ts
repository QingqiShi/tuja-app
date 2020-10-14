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
