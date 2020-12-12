import escapeRegexp from 'escape-string-regexp';
import { normalizationMap } from './constants';

/**
 * Convert non-standard currencies to more standard ones.
 * E.g. from GBX to GBP
 */
export function normalizeForex(
  currency: string,
  value: number
): { currency: string; value: number };
export function normalizeForex(currency: string): { currency: string };
export function normalizeForex(currency: string, value?: number) {
  if (currency in normalizationMap) {
    const normalization = normalizationMap[currency];
    return {
      currency: normalization.target,
      value: value && normalization.normalise(value),
    };
  }

  return { currency, value };
}

/**
 * Get the forex pair that can be used to exchange currency
 */
export function getForexPair(currency: string, baseCurrency: string) {
  return `${currency}${baseCurrency}.FOREX`;
}

/**
 * Convert forex values from foreign currency to base currency
 */
export function exchangeCurrency(
  value: number,
  currency: string,
  baseCurrency: string,
  getExchangeRate: (forexPair: string) => number | undefined
) {
  const {
    currency: normalizedCurrency,
    value: normalizedValue,
  } = normalizeForex(currency, value);

  if (normalizedCurrency === baseCurrency) {
    return normalizedValue;
  }

  const forexPair = getForexPair(normalizedCurrency, baseCurrency);
  const exchangeRate = getExchangeRate(forexPair) ?? 1;
  return normalizedValue * exchangeRate;
}

/**
 * Format a forex value into the local currency format, with a special case
 * for USD.
 */
export function formatCurrency(currency: string, value: number) {
  const {
    currency: normalizedCurrency,
    value: normalizedValue,
  } = normalizeForex(currency, value);

  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : undefined, {
    style: 'currency',
    currency: normalizedCurrency,
  }).format(normalizedValue);
}

/**
 * Parsing a formatted forex value based on local currency format.
 */
export function parseCurrency(currency: string, source: string) {
  // Format a large number to get all the potential parts
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
