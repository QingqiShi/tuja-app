import { firestore, functions } from 'firebase/app';
import dayjs from 'dayjs';
import escapeRegexp from 'escape-string-regexp';
import TimeSeries from './timeSeries';

export interface StockInfo {
  Ticker: string;
  Code: string;
  Country: string;
  Currency: string;
  Exchange: string;
  Name: string;
  Quote: number;
  QuoteDate: Date;
  PrevClose: number;
  Change: number;
  ChangePercent: number;
  Type?: string;
}

export interface StocksData {
  [ticker: string]: {
    closeSeries?: TimeSeries;
    adjustedSeries?: TimeSeries;
    info?: StockInfo;
  };
}

type SupportedBaseCurrency = 'GBP' | 'USD';

export async function fetchStocksHistory(ticker: string, from: Date, to: Date) {
  const formattedFrom = dayjs(from).format('YYYY-MM-DD');
  const formattedTo = dayjs(to).format('YYYY-MM-DD');
  const stockHistory = functions().httpsCallable('stockHistory');

  const result = await stockHistory({
    ticker,
    from: formattedFrom,
    to: formattedTo,
  });

  const closeSeries = new TimeSeries();
  const adjustedSeries = new TimeSeries();

  closeSeries.handleData(
    result.data.map(({ date, close }: { date: string; close: number }) => [
      date,
      close,
    ])
  );
  adjustedSeries.handleData(
    result.data.map(
      ({ date, adjusted_close }: { date: string; adjusted_close: number }) => [
        date,
        adjusted_close,
      ]
    )
  );

  return { closeSeries, adjustedSeries };
}

export async function fetchStocksInfo(tickers: string[]) {
  const getStocksInfo = functions().httpsCallable('getStocksInfo');

  const result = await getStocksInfo({ tickers });
  return result.data.map((info: any) => ({
    ...info,
    QuoteDate: new Date(info.QuoteTimestamp * 1000),
  })) as StockInfo[];
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
  GBX: {
    normalise: (x: number) => x / 100,
    target: 'GBP',
  },
};

const currencyPairs: { [currency: string]: { [currency: string]: string } } = {
  GBP: {
    USD: 'GBPUSD.FOREX',
  },
  USD: {
    GBP: 'GBPUSD.FOREX',
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
          info.Currency in currencyNormalisation
            ? currencyNormalisation[info.Currency].target
            : info.Currency
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
  stocksData: { [currency: string]: { closeSeries?: TimeSeries } }
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
    return value / (stocksData['GBPUSD.FOREX']?.closeSeries?.get(date) ?? 1);
  }
  if (baseCurrency === 'USD' && normalisedCurrency === 'GBP') {
    return value * (stocksData['GBPUSD.FOREX']?.closeSeries?.get(date) ?? 1);
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

export function shouldFetchData(
  ticker: string,
  stocksData: StocksData,
  startDate?: Date | null
) {
  if (!startDate) return false;

  // Start date or the next trading date if it's on a weekend
  let startDateTradingDay = dayjs(startDate);
  if (startDateTradingDay.day() === 6) {
    // Saturday
    startDateTradingDay = startDateTradingDay.add(2, 'day');
  } else if (startDateTradingDay.day() === 0) {
    // Sunday
    startDateTradingDay = startDateTradingDay.add(1, 'day');
  }

  return (
    !(ticker in stocksData) ||
    !stocksData[ticker].info ||
    !stocksData[ticker].adjustedSeries ||
    !stocksData[ticker].closeSeries ||
    !stocksData[ticker].adjustedSeries?.data.length ||
    Math.abs(
      startDateTradingDay.diff(
        stocksData[ticker].adjustedSeries?.data[0][0] as Date,
        'day'
      )
    ) > 2
  );
}
