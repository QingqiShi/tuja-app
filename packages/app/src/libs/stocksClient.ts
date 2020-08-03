import { firestore } from 'firebase/app';
import escapeRegexp from 'escape-string-regexp';
import TimeSeries from './timeSeries';

export interface StockInfo {
  name: string;
  currency: string;
  quote: number;
  timestamp: number;
  yield?: number;
  open?: number;
  prevClose?: number;
  volumn?: number;
  expenseRatio?: number;
}

export interface StocksData {
  [ticker: string]: { series?: TimeSeries; info?: StockInfo };
}

type SupportedBaseCurrency = 'GBP' | 'USD';

export async function fetchStocksHistory(ticker: string, from: Date, to: Date) {
  const result = new TimeSeries();
  const fromYear = from.getFullYear();
  const toYear = to.getFullYear();

  let temp: { [date: string]: number } = {};
  for (let year = fromYear; year <= toYear; year++) {
    const doc = await firestore()
      .doc(`/stocks/${ticker}/history/${year}`)
      .get();
    if (doc.exists) {
      temp = { ...temp, ...(doc.data() as any) };
    }
  }

  result.handleDbData(temp, from, to);
  return result;
}

export async function fetchStockInfo(ticker: string) {
  const doc = await firestore().doc(`/stocks/${ticker}`).get();
  if (doc.exists) {
    return doc.data() as StockInfo;
  }
  return null;
}

export async function fetchStocksList() {
  const doc = await firestore().collection(`/aggregation`).doc('stocks').get();
  const stocksList = doc.data()?.tickers as string[] | undefined;
  return (
    stocksList?.filter(
      (ticker) => !ticker.startsWith('^') && !ticker.endsWith('=X')
    ) ?? []
  );
}

const currencyNormalisation: {
  [currency: string]: { normalise: (x: number) => number; target: string };
} = {
  GBp: {
    normalise: (x: number) => x / 100,
    target: 'GBP',
  },
};

const currencyPairs: { [currency: string]: { [currency: string]: string } } = {
  GBP: {
    USD: 'GBPUSD=X',
  },
  USD: {
    GBP: 'GBPUSD=X',
  },
};

export function getRequiredCurrencies(
  baseCurrency: SupportedBaseCurrency,
  stockInfos: StockInfo[]
) {
  return Array.from(
    new Set(
      stockInfos
        .map((info) =>
          info.currency in currencyNormalisation
            ? currencyNormalisation[info.currency].target
            : info.currency
        )
        .filter((currency) => currency !== baseCurrency)
        .map((currency) => currencyPairs[baseCurrency][currency])
        .filter((currency) => !!currency)
    )
  );
}

export function exchangeCurrency(
  value: number,
  stockCurrency: string,
  baseCurrency: string,
  date: Date,
  stocksData: { [currency: string]: { series?: TimeSeries } }
) {
  const normalisedValue =
    stockCurrency in currencyNormalisation
      ? currencyNormalisation[stockCurrency].normalise(value)
      : value;
  const normalisedCurrency =
    stockCurrency in currencyNormalisation
      ? currencyNormalisation[stockCurrency].target
      : stockCurrency;

  if (normalisedCurrency === baseCurrency) {
    return normalisedValue;
  }

  if (baseCurrency === 'GBP' && normalisedCurrency === 'USD') {
    return value / (stocksData['GBPUSD=X']?.series?.get(date) ?? 1);
  }
  if (baseCurrency === 'USD' && normalisedCurrency === 'GBP') {
    return value * (stocksData['GBPUSD=X']?.series?.get(date) ?? 1);
  }
  return value;
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
